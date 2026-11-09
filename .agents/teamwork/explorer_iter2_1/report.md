# Technical Remediation Strategy: Domain Utilities Extraction & Test Decoupling

**Instance:** `teamwork_explorer` (Iteration 2)  
**Milestone:** Remediation for Reviewer 1 Findings (Test Decoupling & Integrity Violation)  
**Date:** 2026-11-09T12:15:00Z  
**Target Files:**
- `src/utils/bookingCalculations.ts` *(new)*
- `src/utils/playerUtils.ts` *(new)*
- `src/components/BookingCalculator.tsx`
- `src/components/BookingForm.tsx`
- `src/components/VinylPlayer.tsx`
- `src/components/MiniPlayerBar.tsx`
- `src/components/LyricsDrawer.tsx`
- `src/hooks/useAudioPlayer.ts`
- `src/App.tsx`
- `tests/booking.test.ts`
- `tests/player.test.ts`
- `tests/adversarial_stress.test.ts`

---

## 1. Executive Summary & Root Cause Analysis

### 1.1. Problem Statement
Reviewer 1 flagged a **Critical Integrity Finding**:
`tests/booking.test.ts` (lines 42–196) and `tests/player.test.ts` (lines 95–246) duplicated their own internal copies of calculation algorithms, validation regexes, time formatters, and audio state machines instead of importing production code from `src/`. Consequently, any logic break, regression, or mutation in `src/components/BookingCalculator.tsx`, `src/components/BookingForm.tsx`, or `src/hooks/useAudioPlayer.ts` would go completely undetected by the test harness. Furthermore, `tests/adversarial_stress.test.ts` imported domain functions from the test files themselves (`import { ... } from './booking.test.ts'`).

### 1.2. Root Cause
1. **Lack of Pure Domain Modules**: Business logic was embedded directly inside React UI components (`useMemo` in `BookingCalculator.tsx`, internal state handlers in `BookingForm.tsx`, and inline functions in `VinylPlayer.tsx`).
2. **Node Native Test Runner Constraints**: The zero-dependency runner (`node --experimental-strip-types --test`) can strip types from standard TypeScript (`.ts`) files, but cannot parse JSX/TSX syntax (`.tsx`) without a transpiler. When the initial test suite was constructed, rather than extracting pure `.ts` utilities, the author duplicated the logic directly inside `tests/*.test.ts`.

### 1.3. Remediation Target
Create a **Single Source of Truth** for domain logic in pure TypeScript files under `src/utils/`:
- `src/utils/bookingCalculations.ts`
- `src/utils/playerUtils.ts`

Both the production UI components (`src/components/`, `src/hooks/`) and the automated test runners (`tests/`) will import from these exact utility modules.

---

## 2. Specification for `src/utils/bookingCalculations.ts`

### 2.1. Responsibilities
- Centralize all commercial booking fee constants (`BASE_FEES`, `LOGISTICS_FEES`, `ADDON_PRICES`, `FORMAT_NAMES`).
- Provide pure mathematical calculation functions: guest scale tier multiplier (`getGuestMultiplier`), total booking fee, and 50% deposit calculation (`calculateBookingCost`).
- Provide pure booking form validation logic (`validateBookingForm`) with robust support for Russian phone numbers, Telegram handles, future date checks, and boundary sanitization.
- Provide canonical Telegram deep link URL construction (`generateTelegramDeepLink`).

### 2.2. Types & Data Contracts
```typescript
import { BookingFormat, RegionZone, BookingAddons } from '../types';

export type EventFormat = BookingFormat;
export type LogisticsRegion = RegionZone | 'regions_near' | 'regions_far';

export interface BookingCalculatorOptions {
  format: BookingFormat;
  region: LogisticsRegion;
  guestCount: number;
  addons?: BookingAddons;
}

export interface BookingCalculationResult {
  format: BookingFormat;
  region: RegionZone;
  guestCount: number;
  // Dual-aliased properties for seamless compatibility with UI & tests
  baseFee: number;
  baseCost: number;
  logisticsFee: number;
  logisticsCost: number;
  guestMultiplier: number;
  addonsTotal: number;
  addonsCost: number;
  totalCost: number;
  depositRequired: number;
  prepayment50: number;
}

export interface BookingValidationPayload {
  organizerName?: string;
  name?: string;
  contact?: string;
  phoneOrTg?: string;
  eventDate: string;
  city: string;
  format: BookingFormat;
  guestCount?: number | string;
  comments?: string;
  comment?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}
```

### 2.3. Constants & Lookup Tables
```typescript
export const BASE_FEES: Record<BookingFormat, number> = {
  acoustic: 150_000,
  club: 180_000,
  private: 250_000,
  festival: 350_000,
};

export const LOGISTICS_FEES: Record<LogisticsRegion, number> = {
  moscow: 0,
  near_regions: 45_000,
  regions_near: 45_000,  // Backward-compatible alias
  far_regions: 120_000,
  regions_far: 120_000,  // Backward-compatible alias
};

export const ADDON_PRICES = {
  soundBackline: 30_000,
  extendedSet: 50_000,
  customSong: 40_000,
} as const;

export const FORMAT_NAMES: Record<BookingFormat, string> = {
  acoustic: 'Акустика & Лаунж',
  club: 'Клубный драйв (Club Show)',
  private: 'Частное событие / VIP',
  festival: 'Большой фанк-бэнд (Фестиваль)',
};
```

### 2.4. Pure Functions Implementation
```typescript
/**
 * Calculates guest scaling tier:
 *  - 1..50 guests: 1.0x
 *  - 51..200 guests: 1.1x
 *  - 201..500 guests: 1.25x
 *  - >500 guests: 1.5x
 * Clamps negative, zero, and NaN counts safely to 1.0x.
 */
export function getGuestMultiplier(count: number): number {
  if (typeof count !== 'number' || isNaN(count) || !isFinite(count) || count <= 50) {
    return 1.0;
  }
  if (count <= 200) return 1.1;
  if (count <= 500) return 1.25;
  return 1.5;
}

/**
 * Calculates total commercial performance quote and mandatory 50% deposit.
 */
export function calculateBookingCost(options: BookingCalculatorOptions): BookingCalculationResult {
  const baseFee = BASE_FEES[options.format];
  if (baseFee === undefined) {
    throw new Error(`Invalid event format: ${options.format}`);
  }

  const logisticsFee = LOGISTICS_FEES[options.region];
  if (logisticsFee === undefined) {
    throw new Error(`Invalid logistics region: ${options.region}`);
  }

  const canonicalRegion: RegionZone =
    options.region === 'regions_near' ? 'near_regions' :
    options.region === 'regions_far' ? 'far_regions' :
    (options.region as RegionZone);

  const guestMultiplier = getGuestMultiplier(options.guestCount);

  let addonsTotal = 0;
  if (options.addons?.soundBackline) addonsTotal += ADDON_PRICES.soundBackline;
  if (options.addons?.extendedSet) addonsTotal += ADDON_PRICES.extendedSet;
  if (options.addons?.customSong) addonsTotal += ADDON_PRICES.customSong;

  const scaledFee = Math.round(baseFee * guestMultiplier);
  const totalCost = scaledFee + logisticsFee + addonsTotal;
  const depositRequired = Math.round(totalCost * 0.5);

  return {
    format: options.format,
    region: canonicalRegion,
    guestCount: options.guestCount,
    baseFee,
    baseCost: baseFee,
    logisticsFee,
    logisticsCost: logisticsFee,
    guestMultiplier,
    addonsTotal,
    addonsCost: addonsTotal,
    totalCost,
    depositRequired,
    prepayment50: depositRequired,
  };
}

/**
 * Pure validation engine for booking inquiries.
 */
export function validateBookingForm(
  data: BookingValidationPayload,
  currentDate: Date = new Date('2026-11-09')
): ValidationResult {
  const errors: Record<string, string> = {};

  const organizer = (data.organizerName ?? data.name ?? '').trim();
  if (!organizer || organizer.length < 2) {
    errors.organizerName = 'Имя организатора должно содержать минимум 2 символа';
    errors.name = errors.organizerName;
  }

  const rawContact = (data.contact ?? data.phoneOrTg ?? '').trim();
  const phoneClean = rawContact.replace(/[\s\-()]/g, '');
  const isRussianPhone = /^(\+7|8|7)?9\d{9}$/.test(phoneClean);
  const isTelegramHandle = /^@[a-zA-Z0-9_]{3,32}$|^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(rawContact);

  if (!rawContact || (!isRussianPhone && !isTelegramHandle)) {
    errors.contact = 'Укажите корректный номер телефона РФ (+7 9XX XXX-XX-XX) или ник Telegram (@username)';
    errors.phoneOrTg = errors.contact;
  }

  if (!data.eventDate || isNaN(Date.parse(data.eventDate))) {
    errors.eventDate = 'Укажите корректную дату мероприятия в формате ГГГГ-ММ-ДД';
  } else {
    const bookingDate = new Date(data.eventDate);
    const compareDate = new Date(currentDate);
    compareDate.setHours(0, 0, 0, 0);
    if (bookingDate.getTime() < compareDate.getTime()) {
      errors.eventDate = 'Дата мероприятия не может быть в прошлом';
    }
  }

  const city = (data.city || '').trim();
  if (!city || city.length < 2) {
    errors.city = 'Укажите город или площадку проведения';
  }

  if (!BASE_FEES[data.format]) {
    errors.format = 'Выберите один из доступных форматов выступления';
  }

  const rawGuests = data.guestCount;
  const numGuests = typeof rawGuests === 'string' ? parseInt(rawGuests, 10) : rawGuests;
  if (typeof numGuests !== 'number' || isNaN(numGuests) || numGuests <= 0) {
    errors.guestCount = 'Количество гостей должно быть положительным числом';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Builds universal HTTPS Telegram deep link payload.
 */
export function generateTelegramDeepLink(
  data: BookingValidationPayload,
  calc?: BookingCalculationResult | { totalCost: number; prepayment50: number }
): string {
  const organizer = (data.organizerName ?? data.name ?? '').trim();
  const contactStr = (data.contact ?? data.phoneOrTg ?? '').trim();
  const formatName = FORMAT_NAMES[data.format] || data.format;
  const commentsStr = (data.comments ?? data.comment ?? '').trim();

  let costEstimate = 'по согласованию';
  if (calc) {
    const total = calc.totalCost;
    const deposit = 'depositRequired' in calc ? calc.depositRequired : calc.prepayment50;
    costEstimate = `${total.toLocaleString('ru-RU')} ₽ (Предоплата 50%: ${deposit.toLocaleString('ru-RU')} ₽)`;
  }

  const lines = [
    '🎵 Запрос на букинг Беслана (Besik Raev)',
    `• Организатор: ${organizer}`,
    `• Контакт: ${contactStr}`,
    `• Формат: ${formatName}`,
    `• Дата: ${data.eventDate}`,
    `• Город/Локация: ${(data.city || '').trim()}`,
    `• Гостей: ${data.guestCount ?? 80}`,
    `• Расчётная стоимость: ${costEstimate}`,
  ];

  if (commentsStr) {
    lines.push(`• Комментарий: ${commentsStr}`);
  }

  const encoded = encodeURIComponent(lines.join('\n'));
  return `https://t.me/besik_raev?text=${encoded}`;
}
```

---

## 3. Specification for `src/utils/playerUtils.ts`

### 3.1. Responsibilities
- Format seconds into `MM:SS` (or `HH:MM:SS` for >1 hour), safely handling `NaN`, negative numbers, and `Infinity` (`formatTime`).
- Calculate scrubber progress percentage `0..100%` (`calculateProgress`).
- Safe boundary clamping for target seek times `[0, duration]` (`clampSeekTime`).
- Safe volume clamping `[0.0, 1.0]` (`clampVolume`).
- Synchronized lyric index finder based on current audio playback timestamp (`getActiveLyricIndex`).
- Pure headless audio engine state machine (`MockAudioEngine`) for unit testing without browser DOM dependencies.
- Standard discography track fixtures (`TRACK_OSTANSYA_MUZYKA`, `TRACK_MAQ`, `TRACK_TENDZHYZ`, `DISCOGRAPHY_TRACKS`).

### 3.2. Types & Implementation
```typescript
import { LyricLine, Track } from '../types';

export type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error';

/**
 * Formats numeric seconds into MM:SS or HH:MM:SS string.
 * Gracefully defaults to '00:00' on invalid/negative inputs.
 */
export function formatTime(seconds: number): string {
  if (typeof seconds !== 'number' || isNaN(seconds) || !isFinite(seconds) || seconds <= 0) {
    return '00:00';
  }

  const totalSecs = Math.floor(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

/**
 * Calculates scrubber progress percentage (0..100%).
 */
export function calculateProgress(currentTime: number, duration: number): number {
  if (
    typeof currentTime !== 'number' ||
    typeof duration !== 'number' ||
    isNaN(currentTime) ||
    isNaN(duration) ||
    !isFinite(currentTime) ||
    !isFinite(duration) ||
    duration <= 0
  ) {
    return 0;
  }
  const rawProgress = (currentTime / duration) * 100;
  return Math.min(100, Math.max(0, parseFloat(rawProgress.toFixed(2))));
}

/**
 * Clamps seek target safely within [0, duration].
 */
export function clampSeekTime(targetTime: number, duration: number): number {
  if (typeof targetTime !== 'number' || isNaN(targetTime) || !isFinite(targetTime) || targetTime <= 0) {
    return 0;
  }
  if (typeof duration !== 'number' || isNaN(duration) || !isFinite(duration) || duration <= 0) {
    return 0;
  }
  return Math.min(duration, targetTime);
}

/**
 * Clamps volume safely within [0.0, 1.0].
 */
export function clampVolume(volume: number): number {
  if (typeof volume !== 'number' || isNaN(volume) || !isFinite(volume) || volume <= 0) {
    return 0.0;
  }
  if (volume >= 1.0) return 1.0;
  return parseFloat(volume.toFixed(2));
}

/**
 * Finds active lyric index for current playback timestamp.
 * Returns -1 if playback is before the first timestamp.
 */
export function getActiveLyricIndex(currentTime: number, lyrics: LyricLine[]): number {
  if (
    !lyrics ||
    lyrics.length === 0 ||
    typeof currentTime !== 'number' ||
    isNaN(currentTime) ||
    currentTime < lyrics[0].time
  ) {
    return -1;
  }

  let activeIndex = 0;
  for (let i = 0; i < lyrics.length; i++) {
    if (currentTime >= lyrics[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }
  return activeIndex;
}

// ----------------------------------------------------------------------------
// Canonical Track Fixtures
// ----------------------------------------------------------------------------
export const TRACK_OSTANSYA_MUZYKA: Track = {
  id: 'ostansya_muzyka',
  title: 'Останься музыка',
  artist: 'Besik Raev (Беслан)',
  year: 2026,
  genre: 'Funk / Nu-Disco / Neo-Soul',
  duration: 185,
  audioSrc: '/assets/beslan.mp3',
  videoSrc: '/assets/beslan.mp4',
  posterSrc: '/assets/beslan_poster.jpg',
  coverSrc: '/assets/beslan_avatar.jpg',
  lyrics: [
    { id: 1, time: 0, text: '[Вступление: фанк-бас, гитарный грув и духовая пачка]' },
    { id: 2, time: 4, text: 'Останься, музыка, в переулках ночных...' },
    { id: 3, time: 8, text: 'Где свет фонарей словно звёзды для двоих...' },
    { id: 4, time: 12, text: 'Танцует город в ритме наших сердец...' },
    { id: 5, time: 16, text: 'И этой сказке не настанет конец...' },
    { id: 6, time: 20, text: 'Останься, музыка, звучи во мне...' },
    { id: 7, time: 24, text: 'Словно эхо мечты в золотой тишине...' },
    { id: 8, time: 30, text: '[Соло саксофона и модуляция ритм-секции]' },
  ],
  streamingLinks: {
    yandex: 'https://music.yandex.ru/artist/besik_raev',
    apple: 'https://music.apple.com/artist/besik-raev',
    spotify: 'https://open.spotify.com/artist/besikraev',
    vk: 'https://vk.com/artist/besikraev',
    youtube: 'https://music.youtube.com/channel/besikraev',
    zvuk: 'https://zvuk.com/artist/besikraev',
  },
};

export const TRACK_MAQ: Track = {
  id: 'maq',
  title: 'Макъ',
  artist: 'Besik Raev (Беслан)',
  year: 2025,
  genre: 'Ethno-Pop / Circassian Groove',
  duration: 210,
  audioSrc: '/assets/beslan.mp3',
  coverSrc: '/assets/beslan_avatar.jpg',
  lyrics: [
    { id: 1, time: 0, text: '[Вступление с черкесскими мелизмами и шичепшином]' },
    { id: 2, time: 6, text: 'Слышишь голос древних гор...' },
  ],
  streamingLinks: {
    yandex: 'https://music.yandex.ru/artist/besik_raev',
    apple: 'https://music.apple.com/artist/besik-raev',
    spotify: 'https://open.spotify.com/artist/besikraev',
    vk: 'https://vk.com/artist/besikraev',
  },
};

export const TRACK_TENDZHYZ: Track = {
  id: 'tendzhyz',
  title: 'Тенджыз',
  artist: 'Besik Raev (Беслан)',
  year: 2024,
  genre: 'Acoustic Soul / Ballad',
  duration: 195,
  audioSrc: '/assets/beslan.mp3',
  coverSrc: '/assets/beslan_avatar.jpg',
  lyrics: [
    { id: 1, time: 0, text: '[Акустическая гитара и шум прибоя]' },
    { id: 2, time: 5, text: 'Тенджыз уэ узигъусэм...' },
  ],
  streamingLinks: {
    yandex: 'https://music.yandex.ru/artist/besik_raev',
    apple: 'https://music.apple.com/artist/besik-raev',
    spotify: 'https://open.spotify.com/artist/besikraev',
    vk: 'https://vk.com/artist/besikraev',
  },
};

export const DISCOGRAPHY_TRACKS: Track[] = [
  TRACK_OSTANSYA_MUZYKA,
  TRACK_MAQ,
  TRACK_TENDZHYZ,
];

// ----------------------------------------------------------------------------
// Headless Audio Engine State Machine (For Unit Tests)
// ----------------------------------------------------------------------------
export class MockAudioEngine {
  public state: PlaybackState = 'idle';
  public currentTrack: Track = TRACK_OSTANSYA_MUZYKA;
  public currentTime = 0;
  public volume = 1.0;
  public previousVolume = 1.0;
  public isMuted = false;
  public isAudioContextUnlocked = false;

  public unlockAudioContext(): void {
    this.isAudioContextUnlocked = true;
  }

  public play(): void {
    if (!this.isAudioContextUnlocked) {
      this.state = 'paused';
      return;
    }
    this.state = 'playing';
  }

  public pause(): void {
    this.state = 'paused';
  }

  public togglePlay(): void {
    if (this.state === 'playing') {
      this.pause();
    } else {
      this.play();
    }
  }

  public stop(): void {
    this.state = 'idle';
    this.currentTime = 0;
  }

  public seek(targetSeconds: number): void {
    this.currentTime = clampSeekTime(targetSeconds, this.currentTrack.duration);
  }

  public setVolume(newVolume: number): void {
    this.volume = clampVolume(newVolume);
    if (this.volume > 0) {
      this.isMuted = false;
      this.previousVolume = this.volume;
    } else {
      this.isMuted = true;
    }
  }

  public toggleMute(): void {
    if (this.isMuted) {
      this.isMuted = false;
      this.volume = this.previousVolume > 0 ? this.previousVolume : 0.5;
    } else {
      this.previousVolume = this.volume > 0 ? this.volume : 0.5;
      this.isMuted = true;
      this.volume = 0;
    }
  }

  public loadTrack(newTrack: Track): void {
    this.currentTrack = newTrack;
    this.currentTime = 0;
    this.state = 'idle';
  }

  public getVisualizerBars(barCount = 48): number[] {
    if (this.state !== 'playing') {
      return new Array(barCount).fill(0);
    }
    return Array.from({ length: barCount }, (_, i) => {
      const normalized = i / barCount;
      const energy = Math.sin(normalized * Math.PI) * 0.8 + 0.2;
      return Math.round(energy * 255);
    });
  }
}
```

---

## 4. Component Refactoring & Wiring Plan

### 4.1. `src/components/BookingCalculator.tsx`
- **Current Lines 110–147**: 37 lines of duplicated price calculation inside `useMemo`.
- **Refactoring**:
  ```tsx
  import { calculateBookingCost } from '../utils/bookingCalculations';

  // Inside component:
  const calculation = useMemo<BookingCalculation>(() => {
    return calculateBookingCost({
      format: selectedFormat,
      region: selectedRegion,
      guestCount,
      addons,
    });
  }, [selectedFormat, selectedRegion, guestCount, addons]);
  ```
- **Benefit**: Removes calculation duplication; guarantees calculation rules match unit tests 100%.

### 4.2. `src/components/BookingForm.tsx`
- **Current Lines 37–72 (`validate`) & Lines 74–103 (`buildTelegramLink`)**: 67 lines of localized validation regex and text encoding.
- **Refactoring**:
  ```tsx
  import { validateBookingForm, generateTelegramDeepLink } from '../utils/bookingCalculations';

  // Inside validate():
  const validate = (): boolean => {
    const { isValid, errors: validationErrors } = validateBookingForm({
      name,
      contact,
      eventDate,
      city,
      format,
      guestCount,
      comment,
    });
    setErrors(validationErrors);
    return isValid;
  };

  // Inside handleSubmit():
  const link = generateTelegramDeepLink(
    { name, contact, eventDate, city, format, guestCount, comment },
    initialCalculation
  );
  ```
- **Benefit**: Form validation and link generation are verified directly by the unit tests.

### 4.3. `src/components/VinylPlayer.tsx`
- **Current Lines 20–26**: Local `formatSeconds` function.
- **Refactoring**:
  ```tsx
  import { formatTime } from '../utils/playerUtils';

  // Remove local formatSeconds and call formatTime(player.currentTime) & formatTime(player.duration)
  ```

### 4.4. `src/components/MiniPlayerBar.tsx`
- **Current Lines 33–39**: Local `formatSeconds` function.
- **Refactoring**:
  ```tsx
  import { formatTime } from '../utils/playerUtils';
  // Replace local formatSeconds with formatTime
  ```

### 4.5. `src/components/LyricsDrawer.tsx`
- **Current Lines 28–35**: Manual loop searching for active lyric index.
- **Current Lines 124–131**: Manual MM:SS string interpolation.
- **Refactoring**:
  ```tsx
  import { getActiveLyricIndex, formatTime } from '../utils/playerUtils';

  const activeIndex = getActiveLyricIndex(currentTime, lyrics);
  // and in render: formatTime(line.time)
  ```

### 4.6. `src/hooks/useAudioPlayer.ts`
- **Current Lines 4, 71–72, 193–197, 202**: Ad-hoc Math.max/min clamping and track fixture definition.
- **Refactoring**:
  ```tsx
  import {
    clampSeekTime,
    clampVolume,
    calculateProgress,
    TRACK_OSTANSYA_MUZYKA,
  } from '../utils/playerUtils';

  export const DEFAULT_TRACK = TRACK_OSTANSYA_MUZYKA;

  // In handleTimeUpdate:
  const prog = calculateProgress(cur, dur);
  setProgress(prog);

  // In seek:
  const clamped = clampSeekTime(time, dur);

  // In setVolume:
  const clamped = clampVolume(vol);
  ```

### 4.7. `src/components/StreamingLinks.tsx`
- **Current Lines 11–84**: Inline discography track definitions.
- **Refactoring**:
  ```tsx
  import { DISCOGRAPHY_TRACKS } from '../utils/playerUtils';
  export { DISCOGRAPHY_TRACKS };
  ```

### 4.8. `src/App.tsx` (Resolving Finding 3 / Audio Focus Conflict)
- **Current Lines 124–126**:
  ```tsx
  <VinylPlayer
    player={player}
    onOpenVideo={() => setShowVideoModal(true)}
  />
  ```
- **Refactoring**:
  ```tsx
  <VinylPlayer
    player={player}
    onOpenVideo={() => {
      if (player.isPlaying) {
        player.togglePlay();
      }
      setShowVideoModal(true);
    }}
  />
  ```
- **Benefit**: Resolves PRD Edge Case EC-06 (audio overlap between Vinyl player and vertical video modal).

---

## 5. Test Suite Decoupling & Alignment Plan

### 5.1. `tests/booking.test.ts`
- **Remove**: Lines 18–196 (all local types, fee dictionaries, `getGuestMultiplier`, `calculateBookingCost`, `validateBookingForm`, `generateTelegramDeepLink`).
- **Import**:
  ```typescript
  import {
    calculateBookingCost,
    getGuestMultiplier,
    validateBookingForm,
    generateTelegramDeepLink,
    BASE_FEES,
    LOGISTICS_FEES,
    ADDON_PRICES,
    type BookingCalculatorOptions,
    type BookingCalculationResult,
    type EventFormat,
    type LogisticsRegion,
  } from '../src/utils/bookingCalculations';
  import type { BookingFormData } from '../src/types';
  ```
- **Preserve**: All 24 test cases across Tier 1, 2, 3, and 4. They now test `src/utils/bookingCalculations.ts` directly.

### 5.2. `tests/player.test.ts`
- **Remove**: Lines 18–246 (all local types, `TRACK_OSTANSYA_MUZYKA`, `TRACK_MAQ`, `TRACK_TENDZHYZ`, `formatTime`, `calculateProgress`, `clampSeekTime`, `clampVolume`, `getActiveLyricIndex`, `MockAudioEngine`).
- **Import**:
  ```typescript
  import {
    formatTime,
    calculateProgress,
    clampSeekTime,
    clampVolume,
    getActiveLyricIndex,
    MockAudioEngine,
    TRACK_OSTANSYA_MUZYKA,
    TRACK_MAQ,
    TRACK_TENDZHYZ,
    type PlaybackState,
  } from '../src/utils/playerUtils';
  import type { LyricLine, Track as TrackMetadata } from '../src/types';
  ```
- **Preserve**: All 24 test cases across Tier 1, 2, 3, and 4. They now test `src/utils/playerUtils.ts` directly.

### 5.3. `tests/adversarial_stress.test.ts`
- **Remove**: Lines 18–44 (imports from `./booking.test.ts` and `./player.test.ts`).
- **Import**:
  ```typescript
  import {
    calculateBookingCost,
    getGuestMultiplier,
    validateBookingForm,
    generateTelegramDeepLink,
    BASE_FEES,
    LOGISTICS_FEES,
    ADDON_PRICES,
  } from '../src/utils/bookingCalculations';

  import {
    MockAudioEngine,
    formatTime,
    calculateProgress,
    clampSeekTime,
    clampVolume,
    getActiveLyricIndex,
    TRACK_OSTANSYA_MUZYKA,
  } from '../src/utils/playerUtils';
  ```
- **Preserve**: All 25 adversarial stress test cases. They now test production utilities.

### 5.4. Test Runner & `npm test` Alignment (Resolving Finding 2)
In `package.json`:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "node --experimental-strip-types --test tests/booking.test.ts tests/player.test.ts tests/e2e.test.ts tests/adversarial_stress.test.ts",
    "test:vitest": "vitest run"
  }
}
```
*Rationale*: Aligning `"test"` in `package.json` to the zero-dependency Node test runner guarantees that `npm test` runs immediately, cleanly, without Vitest collection failures, and passes with exit code 0.

---

## 6. Verification Protocol

The implementer must execute these 4 commands to verify remediation:

1. **Compilation Check**:
   ```powershell
   npm run build
   ```
   *Expected*: Exit code 0, 0 TypeScript errors, bundle generated in `dist/`.

2. **Automated Unit & E2E Test Suite**:
   ```powershell
   npm test
   ```
   *Expected*: Exit code 0, 89 passed tests across 4 suites (`booking.test.ts`, `player.test.ts`, `e2e.test.ts`, `adversarial_stress.test.ts`), 0 failures.

3. **Verify No Code Duplication in Tests**:
   Search `tests/` for `export function calculateBookingCost` or `export function formatTime`.
   *Expected*: Zero occurrences. All test files must import from `../src/utils/`.

4. **Verify Audio Focus Fix (EC-06)**:
   Inspect `src/App.tsx` on line 125. Verify `player.isPlaying` causes `player.togglePlay()` before opening `showVideoModal`.
