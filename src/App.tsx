import React, { useState, useRef } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { VinylPlayer } from './components/VinylPlayer';
import { MiniPlayerBar } from './components/MiniPlayerBar';
import { StreamingLinks } from './components/StreamingLinks';
import { ConcertsSection } from './components/ConcertsSection';
import { BookingCalculator } from './components/BookingCalculator';
import { BookingForm } from './components/BookingForm';
import { TechRiderModal } from './components/TechRiderModal';
import { BesrollingStudio } from './components/BesrollingStudio';
import { VideoModal } from './components/VideoModal';
import { LyricsDrawer } from './components/LyricsDrawer';
import { MusicReactiveHero21st } from './components/ui21/MusicReactiveHero21st';
import { VinylScratchStudio21st } from './components/ui21/VinylScratchStudio21st';
import { BentoShowcase21st } from './components/ui21/BentoShowcase21st';
import { useAudioPlayer, DEFAULT_TRACK } from './hooks/useAudioPlayer';
import { BookingCalculation, Track } from './types';
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  Flame,
} from 'lucide-react';

export const App: React.FC = () => {
  const player = useAudioPlayer(DEFAULT_TRACK);

  const [uiEdition, setUiEdition] = useState<'21st' | 'classic'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const path = window.location.pathname.toLowerCase();
      if (
        params.get('v') === '1' ||
        window.location.port === '4174' ||
        path.endsWith('/v1') ||
        path.endsWith('/v1/') ||
        path.includes('/v1/index.html')
      ) {
        return 'classic';
      }
    }
    return '21st';
  });
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showBesrollModal, setShowBesrollModal] = useState(false);
  const [showTechRiderModal, setShowTechRiderModal] = useState(false);
  const [showLyricsModal, setShowLyricsModal] = useState(false);
  const [currentCalculation, setCurrentCalculation] = useState<BookingCalculation | undefined>(undefined);

  const bookingFormRef = useRef<HTMLDivElement | null>(null);
  const playerSectionRef = useRef<HTMLDivElement | null>(null);
  const scratchDeckRef = useRef<HTMLDivElement | null>(null);

  const handleSelectFormatAndQuote = (calc: BookingCalculation) => {
    setCurrentCalculation(calc);
    if (bookingFormRef.current) {
      bookingFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleScrollToPlayer = () => {
    if (playerSectionRef.current) {
      playerSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleScrollToScratch = () => {
    if (scratchDeckRef.current) {
      scratchDeckRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOpenVideo = () => {
    if (player.isPlaying) {
      player.pause();
    }
    setShowVideoModal(true);
  };

  const handleSelectTrack = (track: Track) => {
    if (player.currentTrack.id === track.id) {
      player.togglePlay();
    } else {
      player.loadTrack(track);
      setTimeout(() => {
        player.togglePlay();
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0E] text-[#F5E6CC] flex flex-col font-sans selection:bg-[#F2A900] selection:text-[#0B0B0E] relative overflow-hidden">
      {/* Background radial lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#F2A900]/5 blur-[140px]" />
        <div className="absolute top-[40%] right-[-15%] w-[45vw] h-[45vw] rounded-full bg-[#FF7700]/5 blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[45vw] h-[45vw] rounded-full bg-[#F2A900]/5 blur-[140px]" />
      </div>

      {/* Header with 21st.dev V2 / Classic V1 Switcher */}
      <Header
        isPlaying={player.isPlaying}
        isMuted={player.isMuted}
        onToggleSound={player.toggleMute}
        uiEdition={uiEdition}
        onChangeEdition={setUiEdition}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 pt-24 sm:pt-28 space-y-20 sm:space-y-28">
        {uiEdition === '21st' ? (
          <>
            {/* 21st.dev Hero (#2560 Music Reactive Hero + #989 Spotlight) */}
            <section
              id="hero"
              ref={playerSectionRef}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2"
            >
              <MusicReactiveHero21st
                player={player}
                onOpenVideo={handleOpenVideo}
                onOpenLyrics={() => setShowLyricsModal(true)}
                onScrollToScratch={handleScrollToScratch}
              />
            </section>

            {/* 21st.dev Interactive Halftone Scratch Turntable (#38996) */}
            <div ref={scratchDeckRef} id="player">
              <VinylScratchStudio21st player={player} />
            </div>

            {/* 21st.dev Feature Bento Grid (#43172 & #622) */}
            <BentoShowcase21st
              onOpenVideo={handleOpenVideo}
              onOpenRider={() => setShowTechRiderModal(true)}
            />
          </>
        ) : (
          /* Classic V1 Hero & Vinyl Player Section */
          <section
            id="hero"
            ref={playerSectionRef}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8"
          >
            <div className="text-center max-w-4xl mx-auto space-y-6 mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A1A22] border border-[#F2A900]/30 text-xs sm:text-sm text-[#F2A900] font-semibold shadow-lg shadow-[#F2A900]/10">
                <Sparkles className="w-4 h-4 text-[#F2A900]" />
                <span>Официальный релиз 2026 • 100% Живой аналоговый фанк</span>
              </div>

              <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.08] text-gradient-gold">
                Останься, музыка
              </h1>

              <p className="text-base sm:text-lg text-[#F5E6CC]/80 max-w-2xl mx-auto leading-relaxed">
                Лирико-драматический тенор Беслана (Besik Raev) в союзе с фанковой ритм-секцией,
                винтажным нео-соулом и живыми духовыми. Теплота аналогового винила 70-х и кавказское
                достоинство.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-[#8E8E9F] pt-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>Без фонограмм и автотюна</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>Резидент клуба «16 Тонн»</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>Прямой букинг в Telegram</span>
                </div>
              </div>
            </div>

            <div id="player" className="max-w-5xl mx-auto">
              <VinylPlayer
                player={player}
                onOpenVideo={handleOpenVideo}
              />
            </div>
          </section>
        )}

        {/* Streaming & Discography Showcase (with 21st.dev #23320 VinylAlbumCard in V2) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StreamingLinks
            currentTrackId={player.currentTrack.id}
            isPlaying={player.isPlaying}
            onSelectTrack={handleSelectTrack}
            uiEdition={uiEdition}
          />
        </div>

        {/* Live Concerts Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ConcertsSection />
        </div>

        {/* Commercial Booking Hub */}
        <section id="booking" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1A22] border border-[#F2A900]/30 text-xs text-[#F2A900] font-semibold">
              <Calendar className="w-3.5 h-3.5" />
              <span>Организаторам мероприятий</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#F5E6CC]">
              Коммерческий букинг & Форматы выступлений
            </h2>
            <p className="text-sm text-[#8E8E9F] leading-relaxed">
              Рассчитайте смету под ключ для любого типа события: от камерного лаунжа до масштабного
              фестивального фанк-бэнда с духовой секцией.
            </p>
          </div>

          <BookingCalculator
            onSelectFormatAndQuote={handleSelectFormatAndQuote}
            onOpenTechRider={() => setShowTechRiderModal(true)}
          />

          <div ref={bookingFormRef} className="pt-4">
            <BookingForm initialCalculation={currentCalculation} />
          </div>
        </section>

        {/* Viral Easter Egg Section (Бесроллинг 2.0) */}
        <section id="besroll" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-panel-gold rounded-3xl p-6 sm:p-10 border border-[#F2A900]/40 relative overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF7700]/15 border border-[#FF7700]/30 text-xs text-[#FF7700] font-bold">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Вирусный спецпроект • Besrolling 2.0</span>
                </div>

                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-gradient-gold">
                  Забесролль друга! Студия розыгрышей
                </h3>

                <p className="text-sm text-[#8E8E9F] max-w-2xl leading-relaxed">
                  Подари друзьям порцию искреннего фанка. Выбери ностальгическую приманку (VHS 1997,
                  слив GTA 6, Sega или секретный трек) и отправь ссылку-ловушку в Telegram или WhatsApp.
                </p>
              </div>

              <div className="lg:col-span-4 flex justify-center lg:justify-end">
                <button
                  type="button"
                  onClick={() => setShowBesrollModal(true)}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#F2A900] to-[#FF7700] text-[#0B0B0E] font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl shadow-[#F2A900]/25 hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  <img
                    src="./assets/kolobok_crazy.gif"
                    alt="Besroll"
                    className="w-5 h-5 object-contain"
                  />
                  <span>Открыть студию пранков</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Sticky Mobile Mini Player */}
      <MiniPlayerBar
        player={player}
        onScrollToPlayer={handleScrollToPlayer}
      />

      {/* Footer */}
      <Footer onOpenBesroll={() => setShowBesrollModal(true)} />

      {/* Video Modal (Official Vertical Video) */}
      <VideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        videoSrc="./assets/beslan.mp4"
        posterSrc="./assets/beslan_poster.jpg"
      />

      {/* Lyrics Drawer Modal */}
      <LyricsDrawer
        isOpen={showLyricsModal}
        onClose={() => setShowLyricsModal(false)}
        lyrics={player.currentTrack.lyrics}
        currentTime={player.currentTime}
        onSeek={(time) => {
          player.seek(time);
          if (!player.isPlaying) player.play();
        }}
        trackTitle={player.currentTrack.title}
        artistName={player.currentTrack.artist}
      />

      {/* Tech Rider Modal */}
      <TechRiderModal
        isOpen={showTechRiderModal}
        onClose={() => setShowTechRiderModal(false)}
      />

      {/* Besrolling Studio Modal */}
      <BesrollingStudio
        isOpen={showBesrollModal}
        onClose={() => setShowBesrollModal(false)}
      />
    </div>
  );
};
