import React, { useEffect, useRef } from 'react';
import { X, ExternalLink, Play, Pause, Volume2, VolumeX, Instagram, Sparkles } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc?: string;
  posterSrc?: string;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  videoSrc = './assets/beslan.mp4',
  posterSrc = './assets/beslan_poster.jpg',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Pause video on close
  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0B0E]/90 backdrop-blur-xl animate-in fade-in duration-200"
    >
      <div className="relative glass-panel-gold rounded-3xl p-4 sm:p-6 max-w-sm sm:max-w-md w-full border border-[#F2A900]/40 shadow-2xl flex flex-col items-center">
        {/* Header bar */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-[#F5E6CC]/10 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48] animate-pulse" />
            <h3 id="video-modal-title" className="font-display font-bold text-sm sm:text-base text-[#F5E6CC]">
              Официальный видеорилс
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#1A1A22] border border-[#F5E6CC]/10 text-[#8E8E9F] hover:text-[#F5E6CC] hover:bg-[#1A1A22]/80 transition-colors"
            aria-label="Закрыть модальное окно видео"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vertical Video Element (9:16 aspect ratio) */}
        <div className="relative w-full aspect-[9/16] max-h-[65vh] rounded-2xl overflow-hidden bg-black shadow-2xl border border-[#F2A900]/20 flex items-center justify-center">
          <video
            ref={videoRef}
            src={videoSrc}
            poster={posterSrc}
            controls
            autoPlay
            playsInline
            loop
            className="w-full h-full object-contain"
          >
            Ваш браузер не поддерживает встроенное видео.
          </video>
        </div>

        {/* Footer info & Instagram link */}
        <div className="w-full pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#8E8E9F]">
            <Sparkles className="w-3.5 h-3.5 text-[#F2A900]" />
            <span>Трек «Останься музыка» (2026)</span>
          </div>

          <a
            href="https://www.instagram.com/reel/DcQU8MDAMpV/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#1A1A22] to-[#121217] border border-[#FF7700]/30 hover:border-[#FF7700] text-[#F5E6CC] font-semibold transition-all group"
          >
            <Instagram className="w-4 h-4 text-[#FF7700] group-hover:scale-110 transition-transform" />
            <span>Открыть в Instagram</span>
            <ExternalLink className="w-3 h-3 text-[#8E8E9F]" />
          </a>
        </div>
      </div>
    </div>
  );
};
