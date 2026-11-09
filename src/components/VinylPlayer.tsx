import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Repeat, FileText, Video, Sparkles, Disc3 } from 'lucide-react';
import { AudioPlayerHook } from '../types';
import { formatTime } from '../utils/playerUtils';
import { WaveformCanvas } from './WaveformCanvas';
import { LyricsDrawer } from './LyricsDrawer';

interface VinylPlayerProps {
  player: AudioPlayerHook;
  onOpenVideo?: () => void;
  className?: string;
}

export const VinylPlayer: React.FC<VinylPlayerProps> = ({
  player,
  onOpenVideo,
  className = '',
}) => {
  const [showLyrics, setShowLyrics] = useState(false);

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    player.seek(val);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    player.setVolume(val);
  };

  return (
    <div className={`relative glass-panel-gold rounded-3xl p-6 sm:p-8 border border-[#F2A900]/30 shadow-2xl overflow-hidden ${className}`}>
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#F2A900]/10 blur-[90px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-[#FF7700]/10 blur-[90px] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left: 3D Vinyl Record with Realistic Tonearm */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-64 sm:w-76 aspect-square group">
            {/* Vinyl Disc Body */}
            <div
              className={`w-full h-full rounded-full vinyl-grooves p-4 shadow-2xl border-4 border-[#1A1A22] relative flex items-center justify-center transition-all duration-700 ${
                player.isPlaying ? 'animate-vinyl-spin' : 'paused'
              }`}
              style={{
                boxShadow: player.isPlaying
                  ? '0 0 50px rgba(242, 169, 0, 0.35), inset 0 0 45px rgba(0,0,0,0.9)'
                  : '0 20px 45px rgba(0,0,0,0.85), inset 0 0 35px rgba(0,0,0,0.9)',
              }}
            >
              {/* Concentric groove light reflections */}
              <div className="absolute inset-2 rounded-full border border-white/5 pointer-events-none" />
              <div className="absolute inset-6 rounded-full border border-white/5 pointer-events-none" />
              <div className="absolute inset-10 rounded-full border border-white/5 pointer-events-none" />
              <div className="absolute inset-14 rounded-full border border-white/5 pointer-events-none" />

              {/* Center Record Label (Яблоко) */}
              <div className="w-24 sm:w-28 h-24 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-[#F2A900] via-[#FF7700] to-[#F2A900] shadow-2xl flex items-center justify-center relative overflow-hidden">
                <img
                  src={player.currentTrack.coverSrc || './assets/beslan_avatar.jpg'}
                  alt={player.currentTrack.title}
                  className="w-full h-full object-cover rounded-full"
                />
                {/* Spindle hole */}
                <div className="absolute w-4 h-4 rounded-full bg-[#0B0B0E] border-2 border-[#FAF4EB] shadow-inner" />
              </div>
            </div>

            {/* Tonearm Assembly */}
            <div
              className="absolute -top-3 -right-2 w-28 h-52 pointer-events-none transition-transform duration-700 origin-top-right z-20"
              style={{
                transform: player.isPlaying ? 'rotate(22deg)' : 'rotate(0deg)',
              }}
            >
              {/* Tonearm Base / Gimbal */}
              <div className="absolute top-0 right-0 w-9 h-9 rounded-full bg-[#1A1A22] border-2 border-[#F2A900]/70 shadow-xl flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#F2A900] to-[#FF7700] shadow-sm" />
              </div>

              {/* Curved Metallic Arm */}
              <div className="absolute top-5 right-3.5 w-1.5 h-44 bg-gradient-to-b from-[#FAF4EB] via-[#8E8E9F] to-[#F2A900] rounded-full shadow-lg" />

              {/* Counterweight */}
              <div className="absolute -top-1.5 right-6 w-3 h-5 rounded bg-[#2A2A38] border border-[#F2A900]/30 shadow" />

              {/* Headshell & Cartridge (Stylus / Игла) */}
              <div className="absolute bottom-1 right-2 w-6 h-8 rounded bg-[#121217] border border-[#F2A900] shadow-xl flex flex-col items-center justify-between p-1">
                <div className="w-2 h-1 bg-[#FF7700] rounded-sm" />
                <div className="w-1.5 h-2 bg-[#F2A900] rounded-full animate-pulse" />
              </div>
            </div>
          </div>

          {/* Vinyl Status Badge */}
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#8E8E9F]">
            <Disc3 className={`w-4 h-4 ${player.isPlaying ? 'text-[#F2A900] animate-spin' : 'text-[#8E8E9F]'}`} />
            <span>33 1/3 RPM • Винтажный стерео-мастеринг</span>
          </div>
        </div>

        {/* Right: Audio Waveform, Metadata & Comprehensive Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header row: Live badge & quick actions */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                {player.isPlaying && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF7700] opacity-75" />
                )}
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#F2A900]" />
              </span>
              <span className="text-xs uppercase tracking-widest text-[#F2A900] font-bold">
                {player.isPlaying ? 'Сейчас звучит' : 'Готов к воспроизведению'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowLyrics(true)}
                className="px-3 py-1.5 rounded-xl bg-[#1A1A22] hover:bg-[#1A1A22]/80 border border-[#F5E6CC]/15 text-xs text-[#F5E6CC] hover:text-[#F2A900] font-semibold transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-[#F2A900]" />
                <span>Текст песни</span>
              </button>

              {onOpenVideo && (
                <button
                  type="button"
                  onClick={onOpenVideo}
                  className="px-3 py-1.5 rounded-xl bg-[#1A1A22] hover:bg-[#1A1A22]/80 border border-[#F5E6CC]/15 text-xs text-[#F5E6CC] hover:text-[#FF7700] font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Video className="w-3.5 h-3.5 text-[#FF7700]" />
                  <span>Видеоклип</span>
                </button>
              )}
            </div>
          </div>

          {/* Track Info */}
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-gradient-gold tracking-tight">
                {player.currentTrack.title}
              </h2>
              {player.currentTrack.isPreview && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#FF7700]/15 border border-[#FF7700]/30 text-xs text-[#FF7700] font-semibold">
                  {player.currentTrack.badgeText || 'Демо-превью'}
                </span>
              )}
            </div>
            <p className="text-sm text-[#F5E6CC]/80 mt-1 font-medium">
              {player.currentTrack.artist} • {player.currentTrack.genre} ({player.currentTrack.year})
            </p>
          </div>

          {/* Live Reactive Waveform Canvas */}
          <div className="bg-[#0B0B0E]/60 p-3 rounded-2xl border border-[#F5E6CC]/10 shadow-inner">
            <WaveformCanvas
              isPlaying={player.isPlaying}
              frequencyData={player.frequencyData}
              analyserNode={player.analyserNode}
              barCount={48}
            />
          </div>

          {/* Scrubber & Time Bar */}
          <div className="space-y-2">
            <div className="relative flex items-center">
              <input
                type="range"
                min="0"
                max={player.duration || 185}
                step="0.1"
                value={player.currentTime}
                onChange={handleSeekChange}
                aria-label="Перемотка трека"
                className="w-full h-2 bg-[#1A1A22] rounded-lg appearance-none cursor-pointer accent-[#F2A900] focus:outline-none focus:ring-2 focus:ring-[#F2A900]"
                style={{
                  background: `linear-gradient(to right, #F2A900 0%, #FF7700 ${player.progress}%, #1A1A22 ${player.progress}%, #1A1A22 100%)`,
                }}
              />
            </div>

            <div className="flex justify-between text-xs font-mono text-[#8E8E9F]">
              <span>{formatTime(player.currentTime)}</span>
              <span>{formatTime(player.duration)}</span>
            </div>
          </div>

          {/* Primary Controls Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              {/* Big Play/Pause Button */}
              <button
                type="button"
                onClick={player.togglePlay}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#F2A900] to-[#FF7700] text-[#0B0B0E] font-extrabold text-sm uppercase tracking-wider flex items-center gap-2.5 shadow-xl shadow-[#F2A900]/25 hover:scale-105 active:scale-95 transition-all duration-200"
                aria-label={player.isPlaying ? 'Пауза' : 'Воспроизведение'}
              >
                {player.isPlaying ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" />
                    <span>Пауза</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                    <span>Слушать трек</span>
                  </>
                )}
              </button>

              {/* Loop Toggle */}
              <button
                type="button"
                onClick={player.toggleLoop}
                className={`p-3 rounded-2xl border transition-colors ${
                  player.isLooping
                    ? 'bg-[#F2A900]/20 border-[#F2A900] text-[#F2A900]'
                    : 'bg-[#1A1A22] border-[#F5E6CC]/15 text-[#8E8E9F] hover:text-[#F5E6CC]'
                }`}
                title={player.isLooping ? 'Повтор включен' : 'Повтор выключен'}
                aria-label="Повтор"
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>

            {/* Volume Control Bar */}
            <div className="flex items-center gap-2.5 bg-[#1A1A22]/80 px-3.5 py-2 rounded-2xl border border-[#F5E6CC]/10">
              <button
                type="button"
                onClick={player.toggleMute}
                className="text-[#8E8E9F] hover:text-[#F2A900] transition-colors focus:outline-none"
                aria-label={player.isMuted ? 'Включить звук' : 'Выключить звук'}
              >
                {player.isMuted || player.volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-[#FF7700]" />
                ) : (
                  <Volume2 className="w-4 h-4 text-[#F2A900]" />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={player.isMuted ? 0 : player.volume}
                onChange={handleVolumeChange}
                aria-label="Громкость"
                className="w-20 sm:w-24 h-1.5 bg-[#0B0B0E] rounded-lg appearance-none cursor-pointer accent-[#F2A900]"
              />
              <span className="text-[11px] font-mono text-[#8E8E9F] w-7 text-right">
                {Math.round((player.isMuted ? 0 : player.volume) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lyrics Drawer Modal */}
      <LyricsDrawer
        isOpen={showLyrics}
        onClose={() => setShowLyrics(false)}
        lyrics={player.currentTrack.lyrics || []}
        currentTime={player.currentTime}
        onSeek={player.seek}
        trackTitle={player.currentTrack.title}
        artistName={player.currentTrack.artist}
      />
    </div>
  );
};
