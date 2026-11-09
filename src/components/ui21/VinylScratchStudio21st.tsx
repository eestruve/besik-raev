import React, { useState, useRef } from 'react';
import { AudioPlayerHook } from '../../types';
import { Play, Pause, RotateCcw, Sparkles, Hand } from 'lucide-react';
import { formatTime } from '../../utils/playerUtils';

/**
 * 21st.dev Component Adaptation:
 * Based on "Vinyl Record Preloader / Halftone Scratch Deck" [id: 38996] by kedhareswer
 */

interface VinylScratchStudio21stProps {
  player: AudioPlayerHook;
}

const VINYL_STAGES = [
  { id: '01', threshold: 0, title: 'STAGE 01 // ВСТУПЛЕНИЕ & ГРУВ', subtitle: 'Тёплый аналоговый бас и фанковая гитара' },
  { id: '02', threshold: 25, title: 'STAGE 02 // КУПЛЕТ БЕСЛАНА', subtitle: 'Бархатный тенор и исповедальная лирика' },
  { id: '03', threshold: 55, title: 'STAGE 03 // ПРИПЕВ «ОСТАНЬСЯ МУЗЫКА»', subtitle: 'Медная духовая секция и катарсис' },
  { id: '04', threshold: 80, title: 'STAGE 04 // КУЛЬМИНАЦИЯ & КОДА', subtitle: 'Живая импровизация в духе «16 Тонн»' },
];

export const VinylScratchStudio21st: React.FC<VinylScratchStudio21stProps> = ({ player }) => {
  const discRef = useRef<HTMLDivElement | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchAngle, setScratchAngle] = useState(0);
  const [rpmMode, setRpmMode] = useState<'33' | '45'>('33');

  const needleAngle = player.isPlaying || isScratching ? 18 + (player.progress / 100) * 18 : 4;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsScratching(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateScratchFromPointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScratching) return;
    updateScratchFromPointer(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScratching) return;
    setIsScratching(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const updateScratchFromPointer = (clientX: number, clientY: number) => {
    if (!discRef.current) return;
    const rect = discRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rad = Math.atan2(clientY - cy, clientX - cx);
    const deg = ((rad * 180) / Math.PI + 360) % 360;
    setScratchAngle(deg);

    const targetTime = (deg / 360) * (player.duration || 185);
    player.seek(targetTime);
  };

  return (
    <section
      id="scratch-deck"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="rounded-3xl p-5 sm:p-10 bg-gradient-to-br from-[#141311] via-[#0B0B0E] to-[#191510] border border-[#F2A900]/35 shadow-2xl relative overflow-hidden">
        {/* Halftone dot matrix overlay (21st.dev #38996 aesthetic) */}
        <div
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage: 'radial-gradient(#F2A900 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Interactive Scratch Turntable */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1A22] border border-[#F2A900]/40 text-[10px] sm:text-[11px] font-mono text-[#F2A900] mb-5 text-center">
              <Hand className="w-3.5 h-3.5 flex-shrink-0" />
              <span>21st.dev #38996 • Крути винил пальцем или мышкой (Скретч)</span>
            </div>

            <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
              {/* Halftone Starburst behind record */}
              <div
                className={`absolute inset-0 rounded-full bg-gradient-to-tr from-[#F2A900]/25 via-[#FF7700]/15 to-transparent blur-2xl transition-transform duration-300 ${
                  player.isPlaying ? 'scale-110' : 'scale-95 opacity-50'
                }`}
              />

              {/* Interactive Vinyl Record */}
              <div
                ref={discRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                style={{
                  transform: isScratching ? `rotate(${scratchAngle}deg)` : undefined,
                  animationDuration: rpmMode === '45' ? '1.33s' : '1.8s',
                }}
                className={`relative w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-[#09090B] border-4 border-[#262420] shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex items-center justify-center cursor-grab active:cursor-grabbing touch-none ${
                  !isScratching && player.isPlaying ? 'animate-spin' : ''
                }`}
              >
                {/* Halftone Grooves */}
                <div className="absolute inset-3 rounded-full border border-[#F5E6CC]/15" />
                <div className="absolute inset-6 rounded-full border border-[#F2A900]/20" />
                <div className="absolute inset-10 rounded-full border border-[#F5E6CC]/10" />
                <div className="absolute inset-14 rounded-full border border-[#F2A900]/20" />
                <div className="absolute inset-18 rounded-full border border-[#F5E6CC]/15" />

                {/* Conic light reflection */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-full opacity-35"
                  style={{
                    background:
                      'conic-gradient(from 0deg, transparent 0deg, rgba(242,169,0,0.35) 45deg, transparent 90deg, transparent 180deg, rgba(255,119,0,0.3) 225deg, transparent 270deg)',
                  }}
                />

                {/* Halftone Printed Record Label */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#F2A900] to-[#FF7700] p-1 shadow-inner flex flex-col items-center justify-center text-center">
                  <img
                    src={player.currentTrack.coverSrc}
                    alt={player.currentTrack.title}
                    className="absolute inset-0 w-full h-full rounded-full object-cover opacity-35 mix-blend-multiply"
                  />
                  <span className="relative z-10 font-mono text-[7px] sm:text-[8px] uppercase tracking-widest text-[#0B0B0E] font-black">
                    BESIK RAEV
                  </span>
                  <span className="relative z-10 font-display text-[9px] sm:text-[10px] font-black uppercase text-[#0B0B0E] px-1 leading-tight mt-0.5">
                    {rpmMode} RPM
                  </span>
                  <div className="relative z-10 w-3 h-3 rounded-full bg-[#0B0B0E] my-0.5 border border-[#F5E6CC]/40" />
                  <span className="relative z-10 font-mono text-[7px] text-[#0B0B0E] font-bold">
                    SIDE A
                  </span>
                </div>
              </div>

              {/* Tonearm walking inward with track progress */}
              <div
                style={{
                  transform: `rotate(${needleAngle}deg)`,
                  transformOrigin: 'top right',
                }}
                className="pointer-events-none absolute top-2 right-1 sm:right-2 w-20 sm:w-24 h-40 sm:h-48 transition-transform duration-300 z-20"
              >
                <div className="absolute top-0 right-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#24242E] border-2 border-[#F2A900] shadow-lg" />
                <div className="absolute top-4 right-4 w-1.5 h-32 sm:h-40 bg-gradient-to-b from-[#D4D4D8] to-[#F2A900] rounded-full origin-top -rotate-12 shadow-md" />
              </div>
            </div>

            {/* Deck Controls */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
              <button
                type="button"
                onClick={player.togglePlay}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F2A900] to-[#FF7700] text-[#0B0B0E] font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg"
              >
                {player.isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{player.isPlaying ? 'Стоп дека' : 'Крутить пластинку'}</span>
              </button>

              <button
                type="button"
                onClick={() => setRpmMode(rpmMode === '33' ? '45' : '33')}
                className="px-3.5 py-2.5 rounded-xl bg-[#1A1A22] border border-[#F2A900]/30 text-xs font-mono font-bold text-[#F2A900] hover:bg-[#F2A900]/15"
              >
                {rpmMode}⅓ RPM
              </button>

              <button
                type="button"
                onClick={() => player.seek(0)}
                className="p-2.5 rounded-xl bg-[#1A1A22] border border-[#F5E6CC]/15 text-[#F5E6CC] hover:border-[#F2A900]"
                title="В начало пластинки"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Stage Progression Menu (from 21st.dev #38996) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="space-y-2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#F2A900]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ИНТЕРАКТИВНАЯ ДЕКА • HALFTONE SLEEVE EDITION</span>
              </div>
              <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-[#F5E6CC]">
                Аналоговый винил-скретч и структура композиции
              </h2>
              <p className="text-xs sm:text-sm text-[#8E8E9F] leading-relaxed">
                Игла звукоснимателя сдвигается к яблоку пластинки синхронно с развитием трека
                «{player.currentTrack.title}». Кликай по любой стадии ниже или вращай пластинку
                вручную.
              </p>
            </div>

            {/* Stage Cards (responsive indentation on lg only, zero overflow on mobile) */}
            <div className="space-y-2.5">
              {VINYL_STAGES.map((stage, idx) => {
                const nextThreshold = VINYL_STAGES[idx + 1]?.threshold ?? 101;
                const isStageActive =
                  player.progress >= stage.threshold && player.progress < nextThreshold;
                const isPassed = player.progress >= nextThreshold;

                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => {
                      const targetSec = (stage.threshold / 100) * (player.duration || 185);
                      player.seek(targetSec);
                      if (!player.isPlaying) player.play();
                    }}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 ${
                      isStageActive
                        ? 'bg-gradient-to-r from-[#F2A900]/20 to-[#FF7700]/10 border-[#F2A900] shadow-lg shadow-[#F2A900]/10'
                        : isPassed
                        ? 'bg-[#15151C]/90 border-[#F2A900]/30 opacity-90'
                        : 'bg-[#121218]/70 border-[#F5E6CC]/10 hover:border-[#F2A900]/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl font-mono text-xs font-black flex-shrink-0 flex items-center justify-center ${
                          isStageActive
                            ? 'bg-[#F2A900] text-[#0B0B0E]'
                            : 'bg-[#1A1A22] text-[#F2A900] border border-[#F2A900]/30'
                        }`}
                      >
                        {stage.id}
                      </span>
                      <div className="min-w-0">
                        <div className="font-display font-bold text-xs sm:text-sm text-[#F5E6CC] truncate">
                          {stage.title}
                        </div>
                        <div className="text-[11px] sm:text-xs text-[#8E8E9F] truncate">
                          {stage.subtitle}
                        </div>
                      </div>
                    </div>

                    <span className="font-mono text-xs text-[#F2A900] font-bold flex-shrink-0">
                      {formatTime((stage.threshold / 100) * (player.duration || 185))}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
