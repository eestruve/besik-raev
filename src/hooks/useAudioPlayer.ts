import { useState, useEffect, useRef, useCallback } from 'react';
import { Track, AudioPlayerHook } from '../types';
import {
  clampSeekTime,
  clampVolume,
  calculateProgress,
  TRACK_OSTANSYA_MUZYKA,
} from '../utils/playerUtils';

export const DEFAULT_TRACK: Track = TRACK_OSTANSYA_MUZYKA;

export const useAudioPlayer = (initialTrack: Track = DEFAULT_TRACK): AudioPlayerHook => {
  const [currentTrack, setCurrentTrack] = useState<Track>(initialTrack);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(initialTrack.duration || 185);
  const [progress, setProgress] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [frequencyData, setFrequencyData] = useState<Uint8Array>(new Uint8Array(48));

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const previousVolumeRef = useRef<number>(1);

  // Initialize Audio element and event listeners
  useEffect(() => {
    const audio = new Audio();
    audio.src = currentTrack.audioSrc;
    audio.preload = 'metadata';
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      const cur = audio.currentTime || 0;
      setCurrentTime(cur);
      const dur = audio.duration || duration || 1;
      setProgress(calculateProgress(cur, dur));
    };

    const handleEnded = () => {
      if (!audio.loop) {
        setIsPlaying(false);
        setCurrentTime(0);
        setProgress(0);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.pause();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentTrack.audioSrc]);

  // Connect Web Audio API Analyser
  const setupWebAudio = useCallback(() => {
    if (!audioRef.current) return;

    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.85;

        try {
          const source = ctx.createMediaElementSource(audioRef.current);
          source.connect(analyser);
          analyser.connect(ctx.destination);
          sourceNodeRef.current = source;
        } catch {
          // If already connected or CORS blocked, handle gracefully
        }

        audioContextRef.current = ctx;
        analyserRef.current = analyser;
      }
    }

    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(() => {});
    }
  }, []);

  const unlockAudio = useCallback(() => {
    setupWebAudio();
  }, [setupWebAudio]);

  // Loop for Frequency Data Visualizer
  useEffect(() => {
    const updateSpectrum = () => {
      if (analyserRef.current && isPlaying) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
        setFrequencyData(dataArray.slice(0, 48));
      } else if (!isPlaying) {
        setFrequencyData(new Uint8Array(48));
      }

      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(updateSpectrum);
      }
    };

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateSpectrum);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setFrequencyData(new Uint8Array(48));
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const play = useCallback(() => {
    if (!audioRef.current) return;
    unlockAudio();
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Playback intercepted by browser autoplay policy:', err);
      });
    }
  }, [unlockAudio]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  const seek = useCallback((time: number) => {
    if (!audioRef.current) return;
    const dur = audioRef.current.duration || duration || 185;
    const clamped = clampSeekTime(time, dur);
    audioRef.current.currentTime = clamped;
    setCurrentTime(clamped);
    setProgress(calculateProgress(clamped, dur));
  }, [duration]);

  const setVolume = useCallback((vol: number) => {
    if (!audioRef.current) return;
    const clamped = clampVolume(vol);
    audioRef.current.volume = clamped;
    setVolumeState(clamped);
    if (clamped === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
      previousVolumeRef.current = clamped;
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    if (isMuted) {
      const restoreVol = previousVolumeRef.current > 0 ? previousVolumeRef.current : 0.8;
      audioRef.current.volume = restoreVol;
      setVolumeState(restoreVol);
      setIsMuted(false);
    } else {
      previousVolumeRef.current = volume > 0 ? volume : 0.8;
      audioRef.current.volume = 0;
      setVolumeState(0);
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const toggleLoop = useCallback(() => {
    if (!audioRef.current) return;
    const newLoop = !isLooping;
    audioRef.current.loop = newLoop;
    setIsLooping(newLoop);
  }, [isLooping]);

  const loadTrack = useCallback((track: Track) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = track.audioSrc;
      audioRef.current.currentTime = 0;
      audioRef.current.load();
    }
    setCurrentTrack(track);
    setCurrentTime(0);
    setProgress(0);
    setDuration(track.duration || 185);
    setIsPlaying(false);
  }, []);

  return {
    isPlaying,
    currentTime,
    duration,
    progress,
    volume,
    isMuted,
    isLooping,
    frequencyData,
    currentTrack,
    analyserNode: analyserRef.current,
    togglePlay,
    pause,
    play,
    seek,
    setVolume,
    toggleMute,
    toggleLoop,
    loadTrack,
    unlockAudio,
  };
};
