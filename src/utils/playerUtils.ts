// src/utils/playerUtils.ts
// Shared domain logic and math utilities for vinyl audio player and synchronized lyrics

import type { LyricLine, Track } from '../types/index.ts';

export type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error';
export type TrackMetadata = Track;

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
  if (typeof targetTime !== 'number' || isNaN(targetTime) || targetTime <= 0) {
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
  audioSrc: './assets/beslan.mp3',
  videoSrc: './assets/beslan.mp4',
  posterSrc: './assets/beslan_poster.jpg',
  coverSrc: './assets/beslan_avatar.jpg',
  isPreview: false,
  badgeText: 'Главный релиз 2026',
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
  audioSrc: './assets/beslan.mp3',
  coverSrc: './assets/beslan_avatar.jpg',
  isPreview: true,
  badgeText: 'Превью-фрагмент',
  lyrics: [
    { id: 1, time: 0, text: '[Вступление с черкесскими мелизмами и шичепшином]' },
    { id: 2, time: 6, text: 'Слышишь голос древних гор...' },
    { id: 3, time: 14, text: 'Где свободный ветер вьётся на просторе...' },
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
  audioSrc: './assets/beslan.mp3',
  coverSrc: './assets/beslan_avatar.jpg',
  isPreview: true,
  badgeText: 'Превью-фрагмент',
  lyrics: [
    { id: 1, time: 0, text: '[Акустическая гитара и шум прибоя]' },
    { id: 2, time: 5, text: 'Тенджыз уэ узигъусэм...' },
    { id: 3, time: 12, text: 'Морская пена ласкает берег золотой...' },
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
