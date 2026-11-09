/**
 * tests/player.test.ts
 * Comprehensive Test Suite for Beslan 3D Vinyl Player & Audio Engine
 *
 * Covers:
 *   - Tier 1: Feature Coverage (Audio state machine, Time formatting, Volume/Mute, Scrubber, Lyrics sync)
 *   - Tier 2: Boundary & Corner Cases (Zero/NaN duration, seeking out of bounds, AudioContext suspended fallback)
 *   - Tier 3: Cross-Feature Combinations (Seeking immediately updates lyrics, volume mute-restore cycle)
 *   - Tier 4: Real-World Scenarios (Fan listening journey: playback, seeking, lyrics tracking, track switching)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ============================================================================
// Core Audio & Player Domain Models & Functions
// Directly imported from production domain utility (Single Source of Truth)
// ============================================================================

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
  type TrackMetadata,
} from '../src/utils/playerUtils.ts';
import type { LyricLine } from '../src/types/index.ts';

export {
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
  type TrackMetadata,
  type LyricLine,
};

// ============================================================================
// Test Suite Implementation
// ============================================================================

describe('3D Vinyl Player & Audio Engine (tests/player.test.ts)', () => {

  // --------------------------------------------------------------------------
  // Tier 1: Feature Coverage (Audio State & Player Controls)
  // --------------------------------------------------------------------------
  describe('Tier 1: Feature Coverage — State Machine & Playback Controls', () => {

    it('initializes in idle state with volume 1.0 and currentTime 0', () => {
      const engine = new MockAudioEngine();
      assert.strictEqual(engine.state, 'idle');
      assert.strictEqual(engine.volume, 1.0);
      assert.strictEqual(engine.currentTime, 0);
      assert.strictEqual(engine.isMuted, false);
      assert.strictEqual(engine.currentTrack.id, 'ostansya_muzyka');
    });

    it('transitions to playing state on play after audio context unlock', () => {
      const engine = new MockAudioEngine();
      engine.unlockAudioContext();
      engine.play();
      assert.strictEqual(engine.state, 'playing');
    });

    it('toggles cleanly between playing and paused states', () => {
      const engine = new MockAudioEngine();
      engine.unlockAudioContext();

      engine.togglePlay();
      assert.strictEqual(engine.state, 'playing');

      engine.togglePlay();
      assert.strictEqual(engine.state, 'paused');

      engine.togglePlay();
      assert.strictEqual(engine.state, 'playing');
    });

    it('stop resets playback time to 0 and state to idle', () => {
      const engine = new MockAudioEngine();
      engine.unlockAudioContext();
      engine.play();
      engine.seek(45);

      assert.strictEqual(engine.currentTime, 45);
      engine.stop();
      assert.strictEqual(engine.state, 'idle');
      assert.strictEqual(engine.currentTime, 0);
    });

    it('handles volume muting and unmuting with exact level restoration', () => {
      const engine = new MockAudioEngine();
      engine.setVolume(0.75);
      assert.strictEqual(engine.volume, 0.75);

      // Mute
      engine.toggleMute();
      assert.strictEqual(engine.isMuted, true);
      assert.strictEqual(engine.volume, 0.0);

      // Unmute restores previous 0.75 level
      engine.toggleMute();
      assert.strictEqual(engine.isMuted, false);
      assert.strictEqual(engine.volume, 0.75);
    });
  });

  // --------------------------------------------------------------------------
  // Tier 1: Feature Coverage — Time Formatting & Scrubber Math
  // --------------------------------------------------------------------------
  describe('Tier 1: Feature Coverage — Time Formatting & Scrubber Math', () => {

    it('formats seconds into MM:SS correctly across zero, seconds, and minutes', () => {
      assert.strictEqual(formatTime(0), '00:00');
      assert.strictEqual(formatTime(5), '00:05');
      assert.strictEqual(formatTime(59), '00:59');
      assert.strictEqual(formatTime(60), '01:00');
      assert.strictEqual(formatTime(75), '01:15');
      assert.strictEqual(formatTime(185), '03:05'); // Full duration of "Останься музыка"
    });

    it('formats hour-long durations into HH:MM:SS format', () => {
      assert.strictEqual(formatTime(3600), '01:00:00');
      assert.strictEqual(formatTime(3665), '01:01:05');
    });

    it('calculates progress percentage accurately (0 to 100%)', () => {
      assert.strictEqual(calculateProgress(0, 185), 0);
      assert.strictEqual(calculateProgress(92.5, 185), 50);
      assert.strictEqual(calculateProgress(185, 185), 100);
    });

    it('clamps seek time to minimum 0 and maximum duration', () => {
      const duration = 185;
      assert.strictEqual(clampSeekTime(-10, duration), 0);
      assert.strictEqual(clampSeekTime(50, duration), 50);
      assert.strictEqual(clampSeekTime(250, duration), 185);
    });
  });

  // --------------------------------------------------------------------------
  // Tier 1: Feature Coverage — Synchronized Lyrics Engine
  // --------------------------------------------------------------------------
  describe('Tier 1: Feature Coverage — Synchronized Lyrics Engine', () => {

    it('returns -1 for timestamps before the first lyric entry', () => {
      const index = getActiveLyricIndex(-5, TRACK_OSTANSYA_MUZYKA.lyrics);
      assert.strictEqual(index, -1);
    });

    it('identifies exact first line at 0 seconds (Intro groove)', () => {
      const index = getActiveLyricIndex(0, TRACK_OSTANSYA_MUZYKA.lyrics);
      assert.strictEqual(index, 0);
      assert.ok(TRACK_OSTANSYA_MUZYKA.lyrics[index].text.includes('Вступление'));
    });

    it('tracks active verse accurately as playback progresses', () => {
      // At 4 seconds: "Останься, музыка, в переулках ночных..."
      assert.strictEqual(getActiveLyricIndex(4, TRACK_OSTANSYA_MUZYKA.lyrics), 1);
      assert.strictEqual(getActiveLyricIndex(6.5, TRACK_OSTANSYA_MUZYKA.lyrics), 1);

      // At 8 seconds: "Где свет фонарей..."
      assert.strictEqual(getActiveLyricIndex(8, TRACK_OSTANSYA_MUZYKA.lyrics), 2);
      assert.strictEqual(getActiveLyricIndex(11.9, TRACK_OSTANSYA_MUZYKA.lyrics), 2);

      // At 24 seconds: "Словно эхо мечты..."
      assert.strictEqual(getActiveLyricIndex(24, TRACK_OSTANSYA_MUZYKA.lyrics), 6);
    });

    it('keeps last lyric active when playback progresses past final timestamp', () => {
      const lastIndex = TRACK_OSTANSYA_MUZYKA.lyrics.length - 1;
      assert.strictEqual(getActiveLyricIndex(100, TRACK_OSTANSYA_MUZYKA.lyrics), lastIndex);
      assert.strictEqual(getActiveLyricIndex(185, TRACK_OSTANSYA_MUZYKA.lyrics), lastIndex);
    });
  });

  // --------------------------------------------------------------------------
  // Tier 2: Boundary & Corner Cases
  // --------------------------------------------------------------------------
  describe('Tier 2: Boundary & Corner Cases', () => {

    it('handles NaN, Infinity, and negative values in formatTime without throwing', () => {
      assert.strictEqual(formatTime(NaN), '00:00');
      assert.strictEqual(formatTime(Infinity), '00:00');
      assert.strictEqual(formatTime(-100), '00:00');
    });

    it('handles zero or NaN duration in calculateProgress safely', () => {
      assert.strictEqual(calculateProgress(50, 0), 0);
      assert.strictEqual(calculateProgress(50, NaN), 0);
      assert.strictEqual(calculateProgress(NaN, 185), 0);
    });

    it('clamps volume inputs out of boundary range [0.0, 1.0]', () => {
      assert.strictEqual(clampVolume(-0.5), 0.0);
      assert.strictEqual(clampVolume(1.5), 1.0);
      assert.strictEqual(clampVolume(0.428), 0.43);
      assert.strictEqual(clampVolume(NaN), 0.0);
    });

    it('enforces iOS Safari autoplay policy lock before user interaction gesture', () => {
      const engine = new MockAudioEngine();
      // User has NOT interacted yet (isAudioContextUnlocked = false)
      engine.play();
      // Playback must not start in 'playing' state to prevent browser audio abort error
      assert.strictEqual(engine.state, 'paused');

      // Once user gesture occurs:
      engine.unlockAudioContext();
      engine.play();
      assert.strictEqual(engine.state, 'playing');
    });

    it('returns zero frequency bars when player is paused or idle', () => {
      const engine = new MockAudioEngine();
      const barsIdle = engine.getVisualizerBars(48);
      assert.strictEqual(barsIdle.length, 48);
      assert.ok(barsIdle.every((val) => val === 0));

      engine.unlockAudioContext();
      engine.play();
      const barsPlaying = engine.getVisualizerBars(48);
      assert.strictEqual(barsPlaying.length, 48);
      assert.ok(barsPlaying.some((val) => val > 0));
    });
  });

  // --------------------------------------------------------------------------
  // Tier 3: Cross-Feature Combinations
  // --------------------------------------------------------------------------
  describe('Tier 3: Cross-Feature Combinations', () => {

    it('synchronizes lyrics position immediately when scrubber seek is performed', () => {
      const engine = new MockAudioEngine();
      engine.unlockAudioContext();
      engine.play();

      // Seek to 17 seconds -> line 4: "И этой сказке не настанет конец..."
      engine.seek(17);
      const activeIdx = getActiveLyricIndex(engine.currentTime, engine.currentTrack.lyrics);
      assert.strictEqual(activeIdx, 4);
      assert.ok(engine.currentTrack.lyrics[activeIdx].text.includes('этой сказке'));

      // Seek back to intro
      engine.seek(2);
      const introIdx = getActiveLyricIndex(engine.currentTime, engine.currentTrack.lyrics);
      assert.strictEqual(introIdx, 0);
    });

    it('switches track, resets playback time, and loads respective track metadata and lyrics', () => {
      const engine = new MockAudioEngine();
      engine.unlockAudioContext();
      engine.play();
      engine.seek(50);

      // Switch to ethnic track "Макъ"
      engine.loadTrack(TRACK_MAQ);
      assert.strictEqual(engine.currentTrack.id, 'maq');
      assert.strictEqual(engine.currentTime, 0);
      assert.strictEqual(engine.state, 'idle');

      // Verify new lyrics are loaded
      assert.strictEqual(getActiveLyricIndex(0, engine.currentTrack.lyrics), 0);
      assert.ok(engine.currentTrack.lyrics[0].text.includes('черкесскими'));
    });
  });

  // --------------------------------------------------------------------------
  // Tier 4: Real-World Scenarios
  // --------------------------------------------------------------------------
  describe('Tier 4: Real-World Scenarios — Fan Listening Journey', () => {

    it('executes complete fan listening and interactive player journey', () => {
      const engine = new MockAudioEngine();

      // Step 1: User lands on page (state: idle, track: "Останься музыка")
      assert.strictEqual(engine.state, 'idle');
      assert.strictEqual(engine.currentTrack.title, 'Останься музыка');

      // Step 2: User clicks "Поставить иглу / Play" on 3D Vinyl
      engine.unlockAudioContext();
      engine.play();
      assert.strictEqual(engine.state, 'playing');

      // Step 3: Music plays for 15 seconds (first verse begins)
      engine.seek(15);
      assert.strictEqual(formatTime(engine.currentTime), '00:15');
      assert.strictEqual(calculateProgress(engine.currentTime, engine.currentTrack.duration), 8.11);

      // Verify active lyric is synchronized
      const lyricIdx = getActiveLyricIndex(engine.currentTime, engine.currentTrack.lyrics);
      assert.strictEqual(lyricIdx, 3); // "Танцует город в ритме наших сердец..."

      // Step 4: Visualizer bars are reactive and non-zero
      const visualizer = engine.getVisualizerBars(48);
      assert.ok(visualizer.some((bar) => bar > 100));

      // Step 5: User adjusts volume to 80%
      engine.setVolume(0.8);
      assert.strictEqual(engine.volume, 0.8);

      // Step 6: User switches to track "Тенджыз" (acoustic ballad)
      engine.loadTrack(TRACK_TENDZHYZ);
      engine.play();
      assert.strictEqual(engine.currentTrack.title, 'Тенджыз');
      assert.strictEqual(engine.currentTime, 0);
      assert.strictEqual(engine.state, 'playing');
    });
  });
});
