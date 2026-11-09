import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Disc3, ChevronUp } from 'lucide-react';
import { AudioPlayerHook } from '../types';
import { formatTime } from '../utils/playerUtils';

interface MiniPlayerBarProps {
  player: AudioPlayerHook;
  onScrollToPlayer?: () => void;
}

export const MiniPlayerBar: React.FC<MiniPlayerBarProps> = ({
  player,
  onScrollToPlayer,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled down past ~350px
      if (window.scrollY > 350) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Мини-плеер"
      className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-40 animate-in slide-in-from-bottom duration-300"
    >
      <div className="glass-panel-gold rounded-2xl p-3 border border-[#F2A900]/30 shadow-2xl backdrop-blur-xl bg-[#0B0B0E]/90 flex flex-col gap-2">
        {/* Top Info & Controls */}
        <div className="flex items-center justify-between gap-3">
          {/* Track thumbnail & Title */}
          <div
            onClick={onScrollToPlayer}
            className="flex items-center gap-2.5 cursor-pointer group flex-1 min-w-0"
            title="Перейти к виниловому проигрывателю"
          >
            <div className="relative w-10 h-10 rounded-full flex-shrink-0 bg-[#121217] p-0.5 border border-[#F2A900]/40 shadow overflow-hidden flex items-center justify-center">
              <img
                src={player.currentTrack.coverSrc || './assets/beslan_avatar.jpg'}
                alt="Avatar"
                className={`w-full h-full object-cover rounded-full ${
                  player.isPlaying ? 'animate-vinyl-spin' : ''
                }`}
              />
              <div className="absolute w-2 h-2 rounded-full bg-[#0B0B0E] border border-[#FAF4EB]" />
            </div>

            <div className="flex flex-col min-w-0">
              <span className="font-display font-bold text-xs text-[#F5E6CC] truncate group-hover:text-[#F2A900] transition-colors">
                {player.currentTrack.title}
              </span>
              <span className="text-[10px] text-[#8E8E9F] truncate">
                {player.currentTrack.artist}
              </span>
            </div>
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={player.toggleMute}
              className="p-1.5 rounded-xl text-[#8E8E9F] hover:text-[#F2A900] transition-colors"
              aria-label={player.isMuted ? 'Включить звук' : 'Выключить звук'}
            >
              {player.isMuted || player.volume === 0 ? (
                <VolumeX className="w-4 h-4 text-[#FF7700]" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#F2A900]" />
              )}
            </button>

            <button
              type="button"
              onClick={player.togglePlay}
              className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#F2A900] to-[#FF7700] text-[#0B0B0E] flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all"
              aria-label={player.isPlaying ? 'Пауза' : 'Воспроизведение'}
            >
              {player.isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {onScrollToPlayer && (
              <button
                type="button"
                onClick={onScrollToPlayer}
                className="p-1.5 rounded-xl text-[#8E8E9F] hover:text-[#F5E6CC] transition-colors"
                title="Наверх к винилу"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Progress bar line */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-[#1A1A22] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#F2A900] to-[#FF7700] transition-all duration-100"
              style={{ width: `${player.progress}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-[#8E8E9F] w-12 text-right">
            {formatTime(player.currentTime)}
          </span>
        </div>
      </div>
    </aside>
  );
};
