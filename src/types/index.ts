// src/types/index.ts
// Single source of truth for TypeScript interface contracts in Besik Raev platform

export interface LyricLine {
  id: number;
  time: number; // in seconds
  text: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  year: number | string;
  genre: string;
  duration: number; // in seconds
  audioSrc: string;
  videoSrc?: string;
  posterSrc?: string;
  coverSrc: string;
  lyrics: LyricLine[];
  streamingLinks: {
    yandex?: string;
    apple?: string;
    spotify?: string;
    vk?: string;
    youtube?: string;
    zvuk?: string;
  };
  isPreview?: boolean;
  badgeText?: string;
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number; // 0 to 100
  volume: number; // 0 to 1
  isMuted: boolean;
  isLooping: boolean;
  frequencyData: Uint8Array;
  currentTrack: Track;
}

export interface AudioPlayerHook {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number; // 0 to 100
  volume: number; // 0 to 1
  isMuted: boolean;
  isLooping: boolean;
  frequencyData: Uint8Array;
  currentTrack: Track;
  analyserNode: AnalyserNode | null;
  togglePlay: () => void;
  pause: () => void;
  play: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleLoop: () => void;
  loadTrack: (track: Track) => void;
  unlockAudio: () => void;
}

export type BookingFormat = 'acoustic' | 'club' | 'private' | 'festival';
export type RegionZone = 'moscow' | 'near_regions' | 'far_regions';

export interface FormatOption {
  id: BookingFormat;
  name: string;
  subtitle: string;
  duration: string;
  lineup: string;
  basePrice: number;
  description: string;
  features: string[];
  badge?: string;
}

export interface RegionOption {
  id: RegionZone;
  name: string;
  logisticsCost: number;
  description: string;
}

export interface BookingAddons {
  soundBackline?: boolean;
  extendedSet?: boolean;
  customSong?: boolean;
}

export interface BookingCalculation {
  format: BookingFormat;
  region: RegionZone;
  guestCount: number;
  baseCost: number;
  logisticsCost: number;
  guestMultiplier: number;
  addonsCost: number;
  totalCost: number;
  prepayment50: number;
}

export interface BookingFormData {
  name: string;
  phoneOrTg: string;
  eventDate: string;
  city: string;
  format: BookingFormat;
  guestCount?: number | string;
  comment?: string;
}

export interface ConcertEvent {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  address: string;
  ticketUrl: string;
  isSoldOut?: boolean;
}

export interface TechRiderSection {
  title: string;
  iconName: string;
  items: string[];
}

export interface BesrollingPreset {
  id: string;
  title: string;
  desc: string;
  baitParam: string;
  badge: string;
  kolobokIcon: string;
}
