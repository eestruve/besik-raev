import React, { useState } from 'react';
import { Track } from '../../types';
import { Play, Pause, Sparkles, Disc3 } from 'lucide-react';

/**
 * 21st.dev Component Adaptation:
 * Based on "Great UI Vinyl Album Card" [id: 23320] by saurabh-2607
 * Interactive music album sleeve with a spinning multi-groove vinyl record
 * that emerges from the cover sleeve upon hover or active playback.
 */

export interface VinylAlbumCard21stProps {
  track: Track;
  isCurrent: boolean;
  isPlaying: boolean;
  onSelectTrack?: (track: Track) => void;
}

export const VinylAlbumCard21st: React.FC<VinylAlbumCard21stProps> = ({
  track,
  isCurrent,
  isPlaying,
  onSelectTrack,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = isHovered || (isCurrent && isPlaying);

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-3xl p-5 sm:p-6 transition-all duration-500 select-none overflow-hidden border ${
        isCurrent
          ? 'bg-gradient-to-b from-[#1A1A22] to-[#0E0E14] border-[#F2A900] shadow-[0_0_40px_rgba(242,169,0,0.18)]'
          : 'bg-[#121218]/90 border-[#F5E6CC]/10 hover:border-[#F2A900]/60'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Meta Badge */}
      <div className="flex items-center justify-between gap-2 mb-3 relative z-30">
        <span className="px-2.5 py-1 rounded-full bg-[#0B0B0E]/80 border border-[#F2A900]/30 text-[10px] font-mono uppercase tracking-widest text-[#F2A900] font-bold">
          {track.year} • {track.isPreview ? 'Single Preview' : 'Lead Vinyl LP'}
        </span>
        {isCurrent && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF7700]/20 border border-[#FF7700]/40 text-[10px] font-bold text-[#FF7700]">
            <Disc3 className={`w-3 h-3 ${isPlaying ? 'animate-spin' : ''}`} />
            {isPlaying ? 'Играет' : 'В плеере'}
          </span>
        )}
      </div>

      {/* 21st.dev Great UI Vinyl Sleeve + Sliding Record Container */}
      <div
        onClick={() => onSelectTrack && onSelectTrack(track)}
        className="relative z-10 flex h-44 sm:h-52 w-full items-center justify-start pl-1 sm:pl-3 my-2 cursor-pointer"
      >
        {/* Emerging Multi-Groove Vinyl Disc */}
        <div
          style={{
            transform: isExpanded
              ? 'translateX(72px) rotate(180deg)'
              : 'translateX(26px) rotate(0deg)',
            transition: 'transform 650ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          className="absolute flex h-36 w-36 sm:h-44 sm:w-44 items-center justify-center overflow-hidden rounded-full border border-neutral-800 bg-[#0d0d10] shadow-2xl"
        >
          {/* Continuous spin layer when playing */}
          <div
            className={`relative w-full h-full flex items-center justify-center ${
              isCurrent && isPlaying ? 'animate-[spin_3s_linear_infinite]' : ''
            }`}
          >
            {/* Concentric Grooves from 21st.dev #23320 */}
            <div className="absolute inset-1 rounded-full border border-white/15" />
            <div className="absolute inset-2 rounded-full border border-white/10" />
            <div className="absolute inset-4 rounded-full border border-white/15" />
            <div className="absolute inset-6 rounded-full border border-white/10" />
            <div className="absolute inset-8 rounded-full border border-white/15" />
            <div className="absolute inset-10 rounded-full border border-white/10" />
            <div className="absolute inset-12 rounded-full border border-white/15" />

            {/* Iridescent Analog Light Sheen */}
            <div className="pointer-events-none absolute inset-0 rotate-45 bg-gradient-to-tr from-[#F2A900]/30 via-[#FF7700]/20 to-cyan-400/20 mix-blend-overlay" />
            <div className="pointer-events-none absolute inset-0 -rotate-45 bg-gradient-to-br from-amber-300/25 via-transparent to-pink-500/20 mix-blend-overlay" />

            {/* Center Vinyl Label with Cover Art */}
            <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center overflow-hidden rounded-full bg-[#F2A900] shadow-inner">
              <img
                src={track.coverSrc}
                alt={track.title}
                className="absolute inset-0 h-full w-full scale-105 object-cover"
              />
              <div className="z-10 h-2.5 w-2.5 rounded-full bg-[#0B0B0E] ring-2 ring-[#F2A900]/60" />
            </div>
          </div>
        </div>

        {/* Album Cover Sleeve */}
        <div
          style={{
            transform: isExpanded
              ? 'translateX(-6px) rotate(-3deg) scale(0.98)'
              : 'translateX(0px) rotate(0deg) scale(1)',
            transition: 'transform 500ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          className="relative z-20 h-36 w-36 sm:h-44 sm:w-44 overflow-hidden rounded-2xl border border-[#F5E6CC]/20 shadow-[0_18px_35px_rgba(0,0,0,0.85)] bg-[#0B0B0E]"
        >
          <img
            src={track.coverSrc}
            alt={track.title}
            className="absolute inset-0 h-full w-full scale-105 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0E]/90 via-transparent to-transparent" />
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#F2A900] bg-[#0B0B0E]/85 px-2 py-0.5 rounded-md border border-[#F2A900]/30 truncate">
              {track.badgeText || 'Besik Raev'}
            </span>
          </div>
        </div>
      </div>

      {/* Track Details & Play Trigger */}
      <div className="z-20 mt-3 space-y-3">
        <div>
          <h3 className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-[#F5E6CC] group-hover:text-[#F2A900] transition-colors">
            {track.title}
          </h3>
          <p className="text-xs font-medium text-[#8E8E9F] mt-0.5">
            {track.artist} &bull; {track.genre}
          </p>
          {track.isPreview && (
            <p className="text-[11px] text-[#F2A900]/80 italic flex items-center gap-1 mt-1">
              <Sparkles className="w-3 h-3 flex-shrink-0" />
              <span>Демо-фрагмент • Полный трек на стримингах</span>
            </p>
          )}
        </div>

        {onSelectTrack && (
          <button
            type="button"
            onClick={() => onSelectTrack(track)}
            className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              isCurrent
                ? 'bg-gradient-to-r from-[#F2A900] to-[#FF7700] text-[#0B0B0E] shadow-lg shadow-[#F2A900]/25'
                : 'bg-[#1A1A22] text-[#F5E6CC] border border-[#F5E6CC]/15 hover:bg-[#F2A900] hover:text-[#0B0B0E]'
            }`}
          >
            {isCurrent && isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Пауза (Пластинка крутится)</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>
                  {isCurrent
                    ? 'Продолжить воспроизведение'
                    : track.isPreview
                    ? 'Выдвинуть винил & Демо'
                    : 'Выдвинуть винил & Слушать'}
                </span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
