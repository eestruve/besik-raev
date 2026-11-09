import React, { useState, useEffect, useRef } from 'react';
import { LyricLine } from '../types';
import { getActiveLyricIndex, formatTime } from '../utils/playerUtils';
import { Copy, Check, X, Music, Sparkles } from 'lucide-react';

interface LyricsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lyrics: LyricLine[];
  currentTime: number;
  onSeek: (time: number) => void;
  trackTitle?: string;
  artistName?: string;
}

export const LyricsDrawer: React.FC<LyricsDrawerProps> = ({
  isOpen,
  onClose,
  lyrics,
  currentTime,
  onSeek,
  trackTitle = 'Останься музыка',
  artistName = 'Besik Raev (Беслан)',
}) => {
  const [copied, setCopied] = useState(false);
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  // Find active lyric index using shared player utility
  const activeIndex = getActiveLyricIndex(currentTime, lyrics);

  // Auto scroll to active lyric inside drawer
  useEffect(() => {
    if (isOpen && activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex, isOpen]);

  const copyFullLyrics = () => {
    const text = lyrics.map((l) => l.text).join('\n');
    navigator.clipboard.writeText(`${artistName} — ${trackTitle}\n\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0B0E]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel-gold rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col border border-[#F2A900]/40 shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-6 border-b border-[#F5E6CC]/10 flex items-center justify-between bg-[#121217]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F2A900] to-[#FF7700] p-0.5 flex items-center justify-center">
              <div className="w-full h-full rounded-[10px] bg-[#0B0B0E] flex items-center justify-center">
                <Music className="w-5 h-5 text-[#F2A900]" />
              </div>
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-[#F5E6CC]">{trackTitle}</h3>
              <p className="text-xs text-[#8E8E9F]">{artistName} • Синхронный текст</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyFullLyrics}
              className="p-2 rounded-xl bg-[#1A1A22] border border-[#F5E6CC]/10 text-xs font-semibold text-[#F5E6CC] hover:text-[#F2A900] hover:border-[#F2A900]/40 transition-colors flex items-center gap-1.5"
              title="Копировать текст песни"
            >
              {copied ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Скопировано!' : 'Копировать'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-[#1A1A22] border border-[#F5E6CC]/10 text-[#8E8E9F] hover:text-[#F5E6CC] hover:bg-[#1A1A22]/80 transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lyrics Scrollable Area */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 scrollbar-thin scrollbar-thumb-[#F2A900]/20">
          <div className="text-center pb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A1A22] border border-[#F2A900]/20 text-[11px] text-[#F2A900] font-medium">
              <Sparkles className="w-3 h-3" />
              Кликните на строчку для мгновенного перехода
            </span>
          </div>

          {lyrics.map((line, idx) => {
            const isActive = idx === activeIndex;
            const isInstrumental = line.text.startsWith('[');

            return (
              <div
                key={line.id}
                ref={isActive ? activeLineRef : null}
                onClick={() => onSeek(line.time)}
                className={`group cursor-pointer p-3.5 rounded-2xl transition-all duration-300 flex items-start gap-4 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#F2A900]/15 via-[#FF7700]/10 to-transparent border-l-4 border-[#F2A900] shadow-lg'
                    : 'hover:bg-[#1A1A22]/60 opacity-70 hover:opacity-100'
                }`}
              >
                <span
                  className={`text-xs font-mono tracking-wider pt-0.5 ${
                    isActive ? 'text-[#F2A900] font-bold' : 'text-[#8E8E9F]'
                  }`}
                >
                  {formatTime(line.time)}
                </span>

                <p
                  className={`text-sm sm:text-base leading-relaxed ${
                    isActive
                      ? 'text-[#FAF4EB] font-bold scale-[1.01] tracking-wide'
                      : isInstrumental
                      ? 'text-[#8E8E9F] italic font-normal'
                      : 'text-[#F5E6CC]'
                  }`}
                >
                  {line.text}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#F5E6CC]/10 bg-[#121217]/60 flex items-center justify-between text-xs text-[#8E8E9F]">
          <span>Авторы: Николай Патрашов, Александра Лебакина, Беслан Тлихураев</span>
          <span className="text-[#F2A900] font-medium">Сингл 2026</span>
        </div>
      </div>
    </div>
  );
};
