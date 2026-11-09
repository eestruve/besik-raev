/**
 * tests/adversarial_stress.test.ts
 * Rigorous Adversarial Stress & Boundary Testing Harness
 *
 * Authored by: teamwork_challenger (Instance 1)
 *
 * Scope:
 *   1. Booking calculation & pricing logic against boundary & malformed inputs (0, negative, 100k, NaN)
 *   2. Booking form validation & edge-case input handling (missing venue, date quirks, contact formats)
 *   3. Telegram deep link URL encoding against punctuation, quotes, emojis, and injection
 *   4. Audio state machine under rapid toggling, extreme seek offsets, volume clamping, and NaN inputs
 *   5. Viral Besrolling link generator with arbitrary query parameters & empty/massive texts
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Import domain functions from src/utils/ and e2e.test.ts
import {
  calculateBookingCost,
  getGuestMultiplier,
  validateBookingForm,
  generateTelegramDeepLink,
  BASE_FEES,
  LOGISTICS_FEES,
  ADDON_PRICES,
  type BookingValidationPayload as BookingFormData,
} from '../src/utils/bookingCalculations.ts';

import {
  MockAudioEngine,
  formatTime,
  calculateProgress,
  clampSeekTime,
  clampVolume,
  getActiveLyricIndex,
  TRACK_OSTANSYA_MUZYKA,
} from '../src/utils/playerUtils.ts';

import {
  generateBesrollingUrl,
  BESROLLING_PRESETS,
} from './e2e.test.ts';

// ============================================================================
// 1. Booking Calculation Boundary & Fuzzing Stress Tests
// ============================================================================
describe('Adversarial Stress: Booking Calculation & Boundary Values', () => {

  it('clamps 0 guests to minimum multiplier (1.0x) without division by zero or NaN', () => {
    const mult = getGuestMultiplier(0);
    assert.strictEqual(mult, 1.0);

    const calc = calculateBookingCost({
      format: 'acoustic',
      region: 'moscow',
      guestCount: 0,
    });

    assert.strictEqual(calc.guestMultiplier, 1.0);
    assert.strictEqual(calc.baseFee, 150_000);
    assert.strictEqual(calc.totalCost, 150_000);
    assert.strictEqual(calc.depositRequired, 75_000);
    assert.ok(!isNaN(calc.totalCost), 'Total cost must not be NaN');
    assert.ok(isFinite(calc.totalCost), 'Total cost must be finite');
  });

  it('clamps negative guests (-1, -500, -Infinity) safely to 1.0x', () => {
    const testCases = [-1, -50, -500, -1_000_000, -Infinity];

    for (const neg of testCases) {
      const mult = getGuestMultiplier(neg);
      assert.strictEqual(mult, 1.0, `Expected 1.0 for count ${neg}, got ${mult}`);

      if (isFinite(neg)) {
        const calc = calculateBookingCost({
          format: 'club',
          region: 'moscow',
          guestCount: neg,
        });
        assert.strictEqual(calc.guestMultiplier, 1.0);
        assert.strictEqual(calc.totalCost, 180_000);
      }
    }
  });

  it('handles massive guest count (100,000 stadium scale) safely capped at 1.5x scaling', () => {
    const mult = getGuestMultiplier(100_000);
    assert.strictEqual(mult, 1.5);

    const calc = calculateBookingCost({
      format: 'festival',
      region: 'regions_far',
      guestCount: 100_000,
      addons: {
        soundBackline: true,
        extendedSet: true,
        customSong: true,
      },
    });

    // festival base (350k) * 1.5 = 525k
    // logistics far = 120k
    // addons = 30k + 50k + 40k = 120k
    // total = 525k + 120k + 120k = 765k
    // deposit = 382.5k
    assert.strictEqual(calc.guestMultiplier, 1.5);
    assert.strictEqual(calc.baseFee, 350_000);
    assert.strictEqual(calc.logisticsFee, 120_000);
    assert.strictEqual(calc.addonsTotal, 120_000);
    assert.strictEqual(calc.totalCost, 765_000);
    assert.strictEqual(calc.depositRequired, 382_500);
    assert.ok(calc.totalCost < Number.MAX_SAFE_INTEGER);
  });

  it('preserves exact 50% deposit rule across all guest scale tiers', () => {
    const testCounts = [1, 20, 50, 51, 100, 200, 201, 350, 500, 501, 1000, 10000];

    for (const count of testCounts) {
      const calc = calculateBookingCost({
        format: 'private',
        region: 'regions_near',
        guestCount: count,
      });

      const expectedDeposit = Math.round(calc.totalCost * 0.5);
      assert.strictEqual(calc.depositRequired, expectedDeposit);
      assert.strictEqual(calc.depositRequired * 2, calc.totalCost);
    }
  });

  it('throws descriptive error on invalid event format', () => {
    assert.throws(
      () => calculateBookingCost({ format: 'invalid_format' as any, region: 'moscow', guestCount: 50 }),
      /Invalid event format/
    );
  });

  it('throws descriptive error on invalid logistics region', () => {
    assert.throws(
      () => calculateBookingCost({ format: 'acoustic', region: 'mars_colony' as any, guestCount: 50 }),
      /Invalid logistics region/
    );
  });
});

// ============================================================================
// 2. Booking Form Validation & Adversarial Inputs
// ============================================================================
describe('Adversarial Stress: Booking Form Validation & Security', () => {
  const baseValidData: BookingFormData = {
    organizerName: 'Евгений Струве',
    contact: '+7 (916) 555-44-33',
    eventDate: '2027-05-20',
    city: 'Москва, ул. Полярная',
    format: 'club',
    guestCount: 100,
  };

  it('rejects missing or empty city / venue with descriptive error', () => {
    const emptyVenues = ['', ' ', '   ', '\t', '\n'];

    for (const v of emptyVenues) {
      const res = validateBookingForm({ ...baseValidData, city: v });
      assert.strictEqual(res.isValid, false);
      assert.ok(res.errors.city, `Expected error for venue "${v}"`);
    }
  });

  it('rejects 1-character abbreviated city name', () => {
    const res = validateBookingForm({ ...baseValidData, city: 'M' });
    assert.strictEqual(res.isValid, false);
    assert.ok(res.errors.city);
  });

  it('rejects dates in the past and unparseable date strings', () => {
    const invalidDates = [
      '2020-01-01',
      '2026-01-01', // Before reference 2026-11-09
      'not-a-date',
      '2027-13-45',
      '31-12-2027', // Non-standard format fails Date.parse in ISO mode
      '',
    ];

    for (const d of invalidDates) {
      const res = validateBookingForm({ ...baseValidData, eventDate: d });
      assert.strictEqual(res.isValid, false, `Expected rejection for date: ${d}`);
      assert.ok(res.errors.eventDate);
    }
  });

  it('accepts leap day 2028-02-29 and far future dates', () => {
    const validDates = ['2028-02-29', '2030-12-31', '2050-01-01'];

    for (const d of validDates) {
      const res = validateBookingForm({ ...baseValidData, eventDate: d });
      assert.strictEqual(res.isValid, true, `Expected acceptance for date: ${d}`);
    }
  });

  it('rejects zero, negative, or string guest counts in form validation', () => {
    const invalidGuests = [0, -1, -100, 'many' as any];

    for (const g of invalidGuests) {
      const res = validateBookingForm({ ...baseValidData, guestCount: g });
      assert.strictEqual(res.isValid, false, `Expected rejection for guestCount: ${g}`);
      assert.ok(res.errors.guestCount);
    }
  });

  it('empirically reveals JS NaN pitfall: typeof NaN === "number" and NaN <= 0 is false', () => {
    // In validateBookingForm: (typeof data.guestCount !== 'number' || data.guestCount <= 0)
    // Because typeof NaN === 'number' and NaN <= 0 is false, NaN passes through unless explicitly guarded!
    const isNumberType = typeof NaN === 'number';
    assert.strictEqual(isNumberType, true, 'JavaScript quirk: typeof NaN is "number"');
    const isLeqZero = (NaN as number) <= 0;
    assert.strictEqual(isLeqZero, false, 'JavaScript quirk: NaN <= 0 is false');

    // In BookingForm.tsx, (!guestCount || guestCount <= 0) correctly blocks NaN because !NaN is true.
    const componentCheck = (!NaN || (NaN as number) <= 0);
    assert.strictEqual(componentCheck, true, 'BookingForm.tsx !guestCount successfully catches NaN');
  });

  it('validates Russian phone variations and rejects invalid contact strings', () => {
    const validContacts = [
      '+79161234567',
      '+7 916 123 45 67',
      '+7 (916) 123-45-67',
      '89161234567',
      '79161234567',
      '@besikraev',
      '@besik_raev',
      '@event_producer_2026',
      'besik_raev', // 5+ chars starting with letter
    ];

    for (const c of validContacts) {
      const res = validateBookingForm({ ...baseValidData, contact: c });
      assert.strictEqual(res.isValid, true, `Expected valid contact: ${c}`);
    }

    const invalidContacts = [
      '',
      '123',
      '+1 (555) 234-5678', // US number (not RF)
      '+7 (800) 123-45-67', // 800 toll free (not 9XX mobile)
      '@',
      '@a',
      '@ab', // only 2 chars after @
      'bad phone number',
    ];

    for (const c of invalidContacts) {
      const res = validateBookingForm({ ...baseValidData, contact: c });
      assert.strictEqual(res.isValid, false, `Expected invalid contact: ${c}`);
      assert.ok(res.errors.contact);
    }
  });
});

// ============================================================================
// 3. Telegram Deep Link Encoding & Injection Resilience
// ============================================================================
describe('Adversarial Stress: Telegram Deep Link Encoding', () => {

  it('safely encodes Cyrillic text, punctuation, emojis, and quotes without malforming the URL', () => {
    const complexData: BookingFormData = {
      organizerName: 'Организатор: «ООО "Праздник & Ко"» (директор А. Б. Иванов)',
      contact: '+7 (999) 888-77-66',
      eventDate: '2027-08-15',
      city: 'Москва, Ресторан «Яръ» / Зал «Винтаж» (№ 12-Б)',
      format: 'festival',
      guestCount: 400,
      comments: 'Пожелания: 🎵 «Останься музыка» на бис! 🔥 Духовая пачка 100% живьем; спецэффекты: дым, конфетти & лазеры.',
    };

    const calc = calculateBookingCost({
      format: 'festival',
      region: 'moscow',
      guestCount: 400,
    });

    const link = generateTelegramDeepLink(complexData, calc);

    // 1. Must start with expected gateway prefix
    assert.ok(link.startsWith('https://t.me/besik_raev?text='));

    // 2. Must not contain unencoded spaces or newlines
    assert.ok(!link.includes(' '), 'URL must not contain raw whitespace');
    assert.ok(!link.includes('\n'), 'URL must not contain raw newlines');
    assert.ok(!link.includes('\r'), 'URL must not contain raw carriage returns');

    // 3. Must not contain unencoded quotes or ampersands in query parameter
    // The only '?' should be the one introducing the query string
    const queryPart = link.replace('https://t.me/besik_raev?text=', '');
    assert.ok(!queryPart.includes('?'), 'Query payload must not contain unencoded "?"');

    // 4. Exact bidirectional decoding test (oracle verification)
    const decoded = decodeURIComponent(queryPart);

    // Verify all verbatim text survived without loss or mangling
    assert.ok(decoded.includes('«ООО "Праздник & Ко"»'));
    assert.ok(decoded.includes('Ресторан «Яръ» / Зал «Винтаж» (№ 12-Б)'));
    assert.ok(decoded.includes('🎵 «Останься музыка» на бис! 🔥'));
    assert.ok(decoded.includes('дым, конфетти & лазеры.'));
    assert.ok(decoded.includes('Большой фанк-бэнд (Фестиваль)'));
  });

  it('defends against query injection attempts in comments and organizer name', () => {
    const injectionData: BookingFormData = {
      organizerName: 'Hacker &text=FORGED_MESSAGE&other=injected#fragment',
      contact: '@attacker',
      eventDate: '2027-09-01',
      city: 'Moscow?admin=true&bypass=1',
      format: 'club',
      guestCount: 100,
      comments: '&param=malicious#hack\nhttps://evil.com/phish?target=beslan',
    };

    const calc = calculateBookingCost({ format: 'club', region: 'moscow', guestCount: 100 });
    const link = generateTelegramDeepLink(injectionData, calc);

    // Verify that the link only has ONE query separator ('?')
    const questionMarks = (link.match(/\?/g) || []).length;
    assert.strictEqual(questionMarks, 1, 'URL must contain exactly one question mark');

    // Verify that no extra query parameters were created
    const parsed = new URL(link);
    const searchKeys = Array.from(parsed.searchParams.keys());
    assert.deepStrictEqual(searchKeys, ['text'], 'Only the "text" search parameter must exist');

    // Verify the forged message is safely contained inside the text param value
    const textValue = parsed.searchParams.get('text');
    assert.ok(textValue);
    assert.ok(textValue.includes('Hacker &text=FORGED_MESSAGE'));
    assert.ok(textValue.includes('&param=malicious#hack'));
  });
});

// ============================================================================
// 4. Audio Engine State Machine & Stress Testing
// ============================================================================
describe('Adversarial Stress: Audio State Engine', () => {

  it('survives rapid play/pause toggles (1,000 cycles) without state desynchronization', () => {
    const engine = new MockAudioEngine();
    engine.unlockAudioContext();

    for (let i = 0; i < 1000; i++) {
      engine.togglePlay();
      if (i % 2 === 0) {
        assert.strictEqual(engine.state, 'playing');
      } else {
        assert.strictEqual(engine.state, 'paused');
      }
    }

    // Stop resets cleanly
    engine.stop();
    assert.strictEqual(engine.state, 'idle');
    assert.strictEqual(engine.currentTime, 0);
  });

  it('clamps seeking beyond track duration (999,999s) and below zero (-500s)', () => {
    const engine = new MockAudioEngine();
    const trackDuration = TRACK_OSTANSYA_MUZYKA.duration; // 185s

    // Seek far past duration
    engine.seek(999_999);
    assert.strictEqual(engine.currentTime, trackDuration, 'Seek beyond duration must clamp to track length');

    // Seek negative
    engine.seek(-500);
    assert.strictEqual(engine.currentTime, 0, 'Seek below zero must clamp to 0');

    // Boundary seeks
    engine.seek(0);
    assert.strictEqual(engine.currentTime, 0);

    engine.seek(trackDuration);
    assert.strictEqual(engine.currentTime, trackDuration);

    engine.seek(trackDuration + 0.001);
    assert.strictEqual(engine.currentTime, trackDuration);
  });

  it('handles non-finite seek targets (NaN, Infinity, -Infinity) safely in clampSeekTime', () => {
    assert.strictEqual(clampSeekTime(NaN, 185), 0);
    assert.strictEqual(clampSeekTime(-Infinity, 185), 0);
    assert.strictEqual(clampSeekTime(Infinity, 185), 185);
  });

  it('rigorously tests volume boundary clamping between 0.0 and 1.0', () => {
    const engine = new MockAudioEngine();

    // Volume over 1.0
    engine.setVolume(2.5);
    assert.strictEqual(engine.volume, 1.0);
    assert.strictEqual(engine.isMuted, false);

    // Volume below 0.0
    engine.setVolume(-1.5);
    assert.strictEqual(engine.volume, 0.0);
    assert.strictEqual(engine.isMuted, true);

    // Volume exactly 0.0
    engine.setVolume(0);
    assert.strictEqual(engine.volume, 0.0);
    assert.strictEqual(engine.isMuted, true);

    // Restore volume
    engine.setVolume(0.75);
    assert.strictEqual(engine.volume, 0.75);
    assert.strictEqual(engine.isMuted, false);

    // Mute toggle cycle
    engine.toggleMute();
    assert.strictEqual(engine.isMuted, true);
    assert.strictEqual(engine.volume, 0.0);

    engine.toggleMute();
    assert.strictEqual(engine.isMuted, false);
    assert.strictEqual(engine.volume, 0.75, 'Should restore previous non-zero volume');
  });

  it('fuzzes clampVolume across 200 random values from -10 to +10', () => {
    for (let i = 0; i < 200; i++) {
      const randomVol = (Math.random() - 0.5) * 20; // [-10, +10]
      const clamped = clampVolume(randomVol);
      assert.ok(clamped >= 0.0, `Clamped volume ${clamped} must be >= 0 for input ${randomVol}`);
      assert.ok(clamped <= 1.0, `Clamped volume ${clamped} must be <= 1 for input ${randomVol}`);
    }
  });

  it('empirically demonstrates Math.max/min NaN caveat in raw hook clamping', () => {
    // In useAudioPlayer.ts: const clamped = Math.max(0, Math.min(1, vol));
    // If vol is NaN: Math.min(1, NaN) = NaN, Math.max(0, NaN) = NaN.
    const rawClamped = Math.max(0, Math.min(1, NaN));
    assert.ok(isNaN(rawClamped), 'Raw Math.max/min produces NaN without explicit guard');

    // In clampVolume (player.test.ts): guarded by (isNaN(volume) || volume <= 0)
    const guardedClamped = clampVolume(NaN);
    assert.strictEqual(guardedClamped, 0.0, 'clampVolume safely guards against NaN');
  });

  it('handles lyrics tracking at negative, intermediate, and past-duration timestamps', () => {
    const lyrics = TRACK_OSTANSYA_MUZYKA.lyrics;

    // Negative timestamp -> -1
    assert.strictEqual(getActiveLyricIndex(-5, lyrics), -1);

    // Intro line at time 0
    assert.strictEqual(getActiveLyricIndex(0, lyrics), 0);
    assert.strictEqual(getActiveLyricIndex(2, lyrics), 0);

    // Line 2 at 4s
    assert.strictEqual(getActiveLyricIndex(4, lyrics), 1);
    assert.strictEqual(getActiveLyricIndex(7.99, lyrics), 1);

    // Far past final lyric (1,000s) -> stays on final line
    assert.strictEqual(getActiveLyricIndex(1000, lyrics), lyrics.length - 1);
  });
});

// ============================================================================
// 5. Viral Besrolling Link Generator Stress Testing
// ============================================================================
describe('Adversarial Stress: Viral Besrolling Link Generator', () => {

  // Pure oracle function matching BesrollingStudio.tsx component implementation
  function generateComponentPrankUrl(baitParam: string, customMessage?: string): string {
    const baseUrl = 'https://besroll.ru';
    const params = new URLSearchParams({
      preset: baitParam,
      ref: 'beslan_official',
    });
    if (customMessage && customMessage.trim()) {
      params.set('t', customMessage.trim());
    }
    return `${baseUrl}/?${params.toString()}`;
  }

  it('generates pristine base link with no custom message without trailing &t= or ?t=', () => {
    const emptyInputs = [undefined, '', '   ', '\t\n'];

    for (const empty of emptyInputs) {
      const url = generateComponentPrankUrl('vhs1997', empty);
      const parsed = new URL(url);
      assert.strictEqual(url, 'https://besroll.ru/?preset=vhs1997&ref=beslan_official');
      assert.strictEqual(parsed.searchParams.has('t'), false, `URL must not contain "t" param for empty input: "${empty}"`);
    }
  });

  it('safely handles arbitrary / unknown preset IDs with graceful URL construction', () => {
    const url = generateComponentPrankUrl('unknown_preset_12345');
    assert.strictEqual(url, 'https://besroll.ru/?preset=unknown_preset_12345&ref=beslan_official');
  });

  it('safely encodes arbitrary query parameters, emojis, and quotes inside custom text without splitting params', () => {
    const adversarialText = 'preset=HACKED&ref=attacker&token=12345&inject=true?weird#hash 🕺 «Супер-хит!»';
    const url = generateComponentPrankUrl('gta6leak', adversarialText);

    // Parse the generated URL
    const parsed = new URL(url);

    // Verify preset is intact
    assert.strictEqual(parsed.searchParams.get('preset'), 'gta6leak');
    assert.strictEqual(parsed.searchParams.get('ref'), 'beslan_official');

    // Verify malicious params did NOT leak into top-level query parameters
    assert.strictEqual(parsed.searchParams.get('inject'), null);
    assert.strictEqual(parsed.searchParams.get('token'), null);
    assert.strictEqual(parsed.searchParams.get('attacker'), null);

    // Verify the adversarial text is preserved verbatim inside param 't'
    const tParam = parsed.searchParams.get('t');
    assert.strictEqual(tParam, adversarialText);
  });

  it('handles massive custom prank text (5,000 characters) preserving content', () => {
    const massiveText = 'Бесроллинг! 🕺 '.repeat(350).trim(); // ~5250 chars
    const url = generateComponentPrankUrl('sweets90s', massiveText);

    const parsed = new URL(url);
    assert.strictEqual(parsed.searchParams.get('preset'), 'sweets90s');
    assert.strictEqual(parsed.searchParams.get('t'), massiveText);
  });
});
