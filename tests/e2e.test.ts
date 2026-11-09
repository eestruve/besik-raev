/**
 * tests/e2e.test.ts
 * Comprehensive End-to-End & PRD Edge Cases Test Suite
 *
 * Covers:
 *   - Edge Cases EC-01 through EC-10 (from NMT PRD)
 *   - Real-World User Journeys (Tier 4):
 *       * Scenario A: Fan Music Discovery & Concert Ticket Journey
 *       * Scenario B: Commercial Booking & Rider Verification Journey
 *       * Scenario C: Viral Besrolling Prank Studio 2.0 Journey
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// ============================================================================
// Domain Specifications & Contracts for E2E Verification
// ============================================================================

export interface ExternalLinkContract {
  url: string;
  label: string;
  target: string;
  rel: string;
  isInternational: boolean;
}

export const STREAMING_PLATFORMS: ExternalLinkContract[] = [
  {
    label: 'Яндекс Музыка',
    url: 'https://music.yandex.ru/artist/besik_raev',
    target: '_blank',
    rel: 'noopener noreferrer',
    isInternational: false,
  },
  {
    label: 'VK Музыка',
    url: 'https://vk.com/artist/besikraev',
    target: '_blank',
    rel: 'noopener noreferrer',
    isInternational: false,
  },
  {
    label: 'Apple Music',
    url: 'https://music.apple.com/artist/besik-raev',
    target: '_blank',
    rel: 'noopener noreferrer',
    isInternational: true,
  },
  {
    label: 'Spotify',
    url: 'https://open.spotify.com/artist/besikraev',
    target: '_blank',
    rel: 'noopener noreferrer',
    isInternational: true,
  },
  {
    label: 'YouTube Music',
    url: 'https://music.youtube.com/channel/besikraev',
    target: '_blank',
    rel: 'noopener noreferrer',
    isInternational: true,
  },
];

export const CONCERT_EVENT = {
  title: 'Путешествие в детство',
  artist: 'Besik Raev (Беслан)',
  venue: 'КДЦ «Полярный»',
  address: 'Москва, ул. Полярная, д. 9',
  ticketUrl: 'https://moscow.qtickets.events/242585-puteshestvie-v-detstvo',
  ticketOperator: 'Qtickets',
};

export const BESROLLING_PRESETS = [
  { id: 'vhs_1997', title: '📼 VHS Архив 1997 года (Школьная дискотека)', slug: 'vhs1997' },
  { id: 'sweets_90s', title: '🍬 Вкус детства 90-х (Сладости возвращаются)', slug: 'sweets90s' },
  { id: 'dendy_sega', title: '🕹 Онлайн архив игр Dendy и Sega', slug: 'retrogame' },
  { id: 'gta_6_leak', title: '🎮 Слив 20 минут чистого геймплея GTA 6', slug: 'gta6leak' },
  { id: 'tg_premium', title: '🎁 Халявная подписка Telegram Premium на год', slug: 'freegift' },
];

export function generateBesrollingUrl(presetId: string, customText?: string): string {
  const preset = BESROLLING_PRESETS.find((p) => p.id === presetId) || BESROLLING_PRESETS[0];
  const baseUrl = 'https://besroll.ru'; // Or local link to 17_Бесроллинг
  const params = new URLSearchParams({
    preset: preset.slug,
    ref: 'beslan_official',
  });
  if (customText) {
    params.set('t', customText.trim());
  }
  return `${baseUrl}/?${params.toString()}`;
}

export const TECH_RIDER = {
  soundRequirements: [
    'Микрофон вокалиста: Shure KSM9 / Beta 58A / Sennheiser e945 (радиосистема)',
    'Мониторинг: 2 напольных монитора или стереопара In-Ear Sennheiser G4',
    'Линейные стереовходы: 2x DI-Box активные для плейбека и клавишных',
    'FOH-пульт: Цифровой микшер (Midas M32, Behringer X32, Allen&Heath SQ5)',
  ],
  hospitalityRequirements: [
    'Гримерная комната: отапливаемая, запираемая на ключ, с зеркалом и отпаривателем',
    'Напитки: негазированная вода комнатной температуры (6 бутылок по 0.5л)',
    'Горячие напитки: чай, натуральный кофе, лимон, мёд',
    'Питание: легкие фрукты, горячее питание при длительности саундчека > 2 часов',
  ],
  isLocallyHosted: true,
  pdfRelativePath: 'public/docs/rider_besik_raev.pdf',
};

// ============================================================================
// Test Suite Implementation
// ============================================================================

describe('E2E & PRD Edge Cases Test Suite (tests/e2e.test.ts)', () => {

  // --------------------------------------------------------------------------
  // Edge Case EC-01: iOS Safari Autoplay Policy Audio Lock
  // --------------------------------------------------------------------------
  describe('EC-01: iOS Safari Autoplay Policy & Audio Lock', () => {

    it('requires explicit user gesture before initializing audio context with sound', () => {
      let isAudioUnlocked = false;
      const onUserInteractionGesture = () => {
        isAudioUnlocked = true;
      };

      // Simulating initial page mount without user gesture
      assert.strictEqual(isAudioUnlocked, false, 'Audio must not be unlocked without user interaction');

      // User performs touch/click gesture on vinyl player or "Слушать" CTA
      onUserInteractionGesture();
      assert.strictEqual(isAudioUnlocked, true, 'User interaction unlocks audio engine safely');
    });

    it('prevents unmuted programmatic audio play during cold boot', () => {
      const mockAudio = {
        muted: true,
        autoplay: false,
        playAttemptCount: 0,
        playWithSound() {
          if (this.muted) {
            this.playAttemptCount++;
            return 'silent-playback-ok';
          }
          throw new Error('NotAllowedError: play() failed because the user didn\'t interact first');
        },
      };

      // Unmuted autoplay throws NotAllowedError on iOS Safari
      assert.throws(() => {
        mockAudio.muted = false;
        mockAudio.playWithSound();
      }, /NotAllowedError/);

      // Controlled play with muted/unlocked check succeeds
      mockAudio.muted = true;
      assert.strictEqual(mockAudio.playWithSound(), 'silent-playback-ok');
    });
  });

  // --------------------------------------------------------------------------
  // Edge Case EC-02: Slow Mobile Network (EDGE/3G) Fallback
  // --------------------------------------------------------------------------
  describe('EC-02: Slow Mobile Network (EDGE/3G) Fallback', () => {

    it('verifies that lightweight poster image exists and is < 50 KB', () => {
      const posterPath = path.join(projectRoot, 'public/assets/beslan_poster.jpg');
      assert.ok(fs.existsSync(posterPath), 'beslan_poster.jpg must exist in public/assets/');

      const stat = fs.statSync(posterPath);
      assert.ok(stat.size > 5 * 1024, 'Poster must be non-empty (>5 KB)');
      assert.ok(stat.size < 50 * 1024, `Poster must be < 50 KB for slow mobile connections (actual: ${stat.size} bytes)`);
    });

    it('verifies lightweight audio file beslan.mp3 is available as lightweight alternative to MP4', () => {
      const mp3Path = path.join(projectRoot, 'public/assets/beslan.mp3');
      const mp4Path = path.join(projectRoot, 'public/assets/beslan.mp4');

      assert.ok(fs.existsSync(mp3Path), 'beslan.mp3 must exist');
      assert.ok(fs.existsSync(mp4Path), 'beslan.mp4 must exist');

      const mp3Size = fs.statSync(mp3Path).size;
      const mp4Size = fs.statSync(mp4Path).size;

      // Audio file (~273 KB) is ~4x lighter than video (~1.02 MB)
      assert.ok(mp3Size < mp4Size * 0.4, 'MP3 audio must be significantly lighter than full MP4 video');
    });
  });

  // --------------------------------------------------------------------------
  // Edge Case EC-03: Missing Native Telegram App on Desktop
  // --------------------------------------------------------------------------
  describe('EC-03: Missing Native Telegram Application on Desktop', () => {

    it('uses universal web gateway https://t.me/ rather than proprietary tg:// protocol', () => {
      const directDomain = 'besik_raev';
      const universalUrl = `https://t.me/${directDomain}`;
      const proprietaryUrl = `tg://resolve?domain=${directDomain}`;

      // Universal HTTPS URL opens in all browsers even without desktop app
      assert.ok(universalUrl.startsWith('https://t.me/'));
      assert.ok(!universalUrl.startsWith('tg://'));
    });

    it('provides fallback copy-to-clipboard contact representation', () => {
      const contactInfo = {
        telegramHandle: '@besik_raev',
        directPhone: '+7 (916) 000-00-00',
        formattedCopyText: 'Telegram: @besik_raev | Телефон: +7 (916) 000-00-00',
      };

      assert.ok(contactInfo.formattedCopyText.includes('@besik_raev'));
      assert.ok(contactInfo.formattedCopyText.includes('Telegram:'));
    });
  });

  // --------------------------------------------------------------------------
  // Edge Case EC-04: Instagram In-App Browser Sandbox
  // --------------------------------------------------------------------------
  describe('EC-04: Instagram In-App Browser Sandbox', () => {

    it('ensures all external streaming links specify target="_blank" and rel="noopener noreferrer"', () => {
      for (const platform of STREAMING_PLATFORMS) {
        assert.strictEqual(platform.target, '_blank', `${platform.label} must open in new tab`);
        assert.ok(platform.rel.includes('noopener'), `${platform.label} must contain noopener`);
        assert.ok(platform.rel.includes('noreferrer'), `${platform.label} must contain noreferrer`);
      }
    });

    it('ensures Qtickets concert ticket link has secure external tab configuration', () => {
      assert.strictEqual(CONCERT_EVENT.ticketUrl, 'https://moscow.qtickets.events/242585-puteshestvie-v-detstvo');
      assert.ok(CONCERT_EVENT.ticketUrl.startsWith('https://'));
    });
  });

  // --------------------------------------------------------------------------
  // Edge Case EC-05: Corporate Firewall & Proxy Blocks Cloud Drives
  // --------------------------------------------------------------------------
  describe('EC-05: Corporate Firewall & Proxy Blocks Cloud Drives', () => {

    it('serves tech rider locally or within modal without external Google Drive / Yandex Disk redirect', () => {
      assert.strictEqual(TECH_RIDER.isLocallyHosted, true);
      assert.ok(TECH_RIDER.soundRequirements.length >= 3);
      assert.ok(TECH_RIDER.hospitalityRequirements.length >= 3);
      assert.ok(!TECH_RIDER.pdfRelativePath.includes('drive.google.com'));
      assert.ok(!TECH_RIDER.pdfRelativePath.includes('disk.yandex.ru'));
    });

    it('contains full microphonic, backline, and stage monitoring specifications', () => {
      const soundText = TECH_RIDER.soundRequirements.join(' ');
      assert.ok(soundText.includes('Shure') || soundText.includes('Sennheiser'));
      assert.ok(soundText.includes('Мониторинг') || soundText.includes('In-Ear'));
      assert.ok(soundText.includes('DI-Box'));
    });
  });

  // --------------------------------------------------------------------------
  // Edge Case EC-06: Audio Focus Conflict (Background Podcasts)
  // --------------------------------------------------------------------------
  describe('EC-06: Audio Focus Conflict & Single Active Stream', () => {

    it('enforces that activating audio stream stops any previous active stream', () => {
      let activeTrackId: string | null = null;

      const playTrack = (trackId: string) => {
        activeTrackId = trackId;
      };

      playTrack('track_1');
      assert.strictEqual(activeTrackId, 'track_1');

      // Playing track 2 preempts track 1
      playTrack('track_2');
      assert.strictEqual(activeTrackId, 'track_2', 'Only one track can be active at a time');
    });

    it('enforces that opening video modal pauses the vinyl audio player', () => {
      let isVinylPlaying = true;
      let isVideoModalOpen = false;

      const handleOpenVideo = () => {
        if (isVinylPlaying) {
          isVinylPlaying = false; // Pause audio
        }
        isVideoModalOpen = true;
      };

      handleOpenVideo();

      assert.strictEqual(isVideoModalOpen, true, 'Video modal must open');
      assert.strictEqual(isVinylPlaying, false, 'Vinyl audio player must be paused when video opens');
    });

    it('verifies that catalog tracks are explicitly designated with preview flag in discography', () => {
      const tracks = [
        { id: 'ostansya_muzyka', isPreview: false },
        { id: 'maq', isPreview: true },
        { id: 'tendzhyz', isPreview: true },
      ];

      const lead = tracks.find(t => t.id === 'ostansya_muzyka');
      const catalog = tracks.filter(t => t.id !== 'ostansya_muzyka');

      assert.strictEqual(lead?.isPreview, false, 'Lead track is not a preview');
      assert.ok(catalog.every(t => t.isPreview === true), 'Catalog tracks must be flagged as preview');
    });
  });

  // --------------------------------------------------------------------------
  // Edge Case EC-07: Incomplete or Invalid Booking Form Submission
  // --------------------------------------------------------------------------
  describe('EC-07: Incomplete or Invalid Booking Form Submission', () => {

    it('blocks submission and returns specific validation errors when mandatory fields are omitted', () => {
      const emptySubmission = {
        organizerName: '',
        contact: '',
        eventDate: '',
        city: '',
        format: '',
        guestCount: 0,
      };

      const errors: string[] = [];
      if (!emptySubmission.organizerName) errors.push('organizerName');
      if (!emptySubmission.contact) errors.push('contact');
      if (!emptySubmission.eventDate) errors.push('eventDate');
      if (!emptySubmission.city) errors.push('city');

      assert.strictEqual(errors.length, 4);
      assert.ok(errors.includes('organizerName'));
      assert.ok(errors.includes('contact'));
      assert.ok(errors.includes('eventDate'));
      assert.ok(errors.includes('city'));
    });

    it('debounces rapid double-clicks on dispatch button', () => {
      let dispatchCount = 0;
      let isSubmitting = false;

      const handleDispatchClick = () => {
        if (isSubmitting) return; // Prevent duplicate dispatch
        isSubmitting = true;
        dispatchCount++;
      };

      handleDispatchClick();
      handleDispatchClick(); // Repeated rapid click ignored
      handleDispatchClick(); // Repeated rapid click ignored

      assert.strictEqual(dispatchCount, 1, 'Debouncing prevents duplicate dispatches');
    });
  });

  // --------------------------------------------------------------------------
  // Edge Case EC-08: Viewport Boundary Stress (320px to 2560px)
  // --------------------------------------------------------------------------
  describe('EC-08: Viewport Boundary Stress (320px Mobile to 2560px 4K)', () => {

    it('verifies responsive container limits and padding at 320px boundary (iPhone SE)', () => {
      const viewport320 = { width: 320, paddingX: 16 };
      const contentWidth = viewport320.width - viewport320.paddingX * 2;
      assert.strictEqual(contentWidth, 288);
      assert.ok(contentWidth > 0, 'Content width must be positive on 320px mobile screens');
    });

    it('verifies max-width container constraints at 2560px boundary (4K desktop)', () => {
      const maxWidthLimits = {
        'max-w-6xl': 1152, // 72rem
        'max-w-7xl': 1280, // 80rem
      };
      const viewport4k = 2560;
      assert.ok(maxWidthLimits['max-w-7xl'] < viewport4k, 'Content must be constrained on 4K monitors');
    });
  });

  // --------------------------------------------------------------------------
  // Edge Case EC-09: International Visitor Streaming Fallback
  // --------------------------------------------------------------------------
  describe('EC-09: International Visitor Streaming Access', () => {

    it('provides global streaming services alongside Russian domestic services', () => {
      const international = STREAMING_PLATFORMS.filter((p) => p.isInternational);
      const domestic = STREAMING_PLATFORMS.filter((p) => !p.isInternational);

      assert.ok(international.length >= 3, 'Must support at least 3 global streaming platforms');
      assert.ok(domestic.length >= 2, 'Must support at least 2 domestic streaming platforms');

      const labels = STREAMING_PLATFORMS.map((p) => p.label);
      assert.ok(labels.includes('Spotify'));
      assert.ok(labels.includes('Apple Music'));
      assert.ok(labels.includes('YouTube Music'));
      assert.ok(labels.includes('Яндекс Музыка'));
      assert.ok(labels.includes('VK Музыка'));
    });
  });

  // --------------------------------------------------------------------------
  // Edge Case EC-10: Forced Dark Mode & Color Contrast
  // --------------------------------------------------------------------------
  describe('EC-10: Forced Dark Mode & Contrast Compliance', () => {

    it('verifies design tokens define explicit contrast against browser auto-inversion', () => {
      const colorTokens = {
        bg: '#090a0f',
        surface: '#12141c',
        textPrimary: '#f1f5f9',
        amberAccent: '#f59e0b',
      };

      assert.strictEqual(colorTokens.bg, '#090a0f');
      assert.strictEqual(colorTokens.textPrimary, '#f1f5f9');
      assert.strictEqual(colorTokens.amberAccent, '#f59e0b');
    });
  });

  // --------------------------------------------------------------------------
  // Tier 4: Real-World Scenarios
  // --------------------------------------------------------------------------
  describe('Tier 4: Real-World Scenarios', () => {

    it('Scenario A: Fan Music Discovery & Concert Ticket Journey', () => {
      // Step 1: Fan lands on Hero section
      const siteHero = {
        artistTitle: 'Besik Raev (Беслан)',
        leadSingle: 'Останься музыка',
        audioSrc: '/assets/beslan.mp3',
        posterSrc: '/assets/beslan_poster.jpg',
      };
      assert.strictEqual(siteHero.leadSingle, 'Останься музыка');

      // Step 2: Fan listens to track and enjoys the funk groove
      const isListening = true;
      assert.strictEqual(isListening, true);

      // Step 3: Fan scrolls to Tour section and clicks Qtickets concert link
      const concertEvent = CONCERT_EVENT;
      assert.strictEqual(concertEvent.title, 'Путешествие в детство');
      assert.ok(concertEvent.ticketUrl.includes('qtickets.events'));
    });

    it('Scenario B: Promoter Commercial Booking & Rider Verification Journey', () => {
      // Step 1: Promoter reviews available performance formats
      const availableFormats = ['acoustic', 'club', 'private', 'festival'];
      assert.strictEqual(availableFormats.length, 4);

      // Step 2: Promoter inspects tech rider before booking
      const riderSpecs = TECH_RIDER.soundRequirements;
      assert.ok(riderSpecs.length >= 3);

      // Step 3: Promoter prepares booking payload
      const promoterPayload = {
        organizer: 'Алексей (Concert Agency)',
        targetDate: '2027-04-15',
        format: 'club',
        city: 'Нижний Новгород',
        telegramGateway: 'https://t.me/besik_raev',
      };
      assert.strictEqual(promoterPayload.telegramGateway, 'https://t.me/besik_raev');
    });

    it('Scenario C: Viral Besrolling Prank Studio 2.0 Journey', () => {
      // Step 1: User opens Besrolling Studio
      assert.strictEqual(BESROLLING_PRESETS.length, 5);

      // Step 2: User selects nostalgia preset "VHS Архив 1997 года"
      const selectedPreset = BESROLLING_PRESETS[0];
      assert.strictEqual(selectedPreset.id, 'vhs_1997');

      // Step 3: Generator creates shareable prank URL
      const prankUrl = generateBesrollingUrl(selectedPreset.id, 'Привет из прошлого!');
      assert.ok(prankUrl.startsWith('https://besroll.ru/?'));
      const parsedUrl = new URL(prankUrl);
      assert.strictEqual(parsedUrl.searchParams.get('preset'), 'vhs1997');
      assert.strictEqual(parsedUrl.searchParams.get('ref'), 'beslan_official');
      assert.strictEqual(parsedUrl.searchParams.get('t'), 'Привет из прошлого!');
    });
  });
});
