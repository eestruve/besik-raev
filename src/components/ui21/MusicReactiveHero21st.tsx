import React, { useRef, useEffect, useState } from 'react';
import { AudioPlayerHook } from '../../types';
import {
  Play,
  Pause,
  Video,
  Disc3,
  Sliders,
  Sparkles,
  Calendar,
  Volume2,
  VolumeX,
  FileText,
} from 'lucide-react';
import { formatTime } from '../../utils/playerUtils';

/**
 * 21st.dev Component Adaptation:
 * Based on "Music Reactive Hero Section" [id: 2560] by lovesickfromthe6ix
 * + "Spotlight" [id: 989] by manuarora700
 */

interface MusicReactiveHero21stProps {
  player: AudioPlayerHook;
  onOpenVideo: () => void;
  onOpenLyrics: () => void;
  onScrollToScratch: () => void;
}

class FilmGrainGenerator {
  width: number;
  height: number;
  grainCanvas: HTMLCanvasElement;
  grainCtx: CanvasRenderingContext2D | null;
  grainData: ImageData | null = null;
  frame = 0;

  constructor(width: number, height: number) {
    this.width = Math.max(1, Math.floor(width / 2));
    this.height = Math.max(1, Math.floor(height / 2));
    this.grainCanvas = document.createElement('canvas');
    this.grainCanvas.width = this.width;
    this.grainCanvas.height = this.height;
    this.grainCtx = this.grainCanvas.getContext('2d');
    this.generateGrainPattern();
  }

  generateGrainPattern() {
    if (!this.grainCtx) return;
    const imageData = this.grainCtx.createImageData(this.width, this.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const value = Math.random() * 255;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = 255;
    }
    this.grainData = imageData;
    this.grainCtx.putImageData(imageData, 0, 0);
  }

  update() {
    this.frame++;
    if (this.frame % 3 === 0 && this.grainData && this.grainCtx) {
      const data = this.grainData.data;
      const time = this.frame * 0.015;
      for (let i = 0; i < data.length; i += 16) {
        const grain = Math.random();
        const x = (i / 4) % this.width;
        const y = Math.floor(i / 4 / this.width);
        const pattern = Math.sin(x * 0.02 + time) * Math.cos(y * 0.02 - time);
        const value = (grain * 0.8 + pattern * 0.2) * 255;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
      }
      this.grainCtx.putImageData(this.grainData, 0, 0);
    }
  }

  apply(
    ctx: CanvasRenderingContext2D,
    fullWidth: number,
    fullHeight: number,
    intensity = 0.05,
    hue = 32
  ) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = intensity * 0.45;
    ctx.drawImage(this.grainCanvas, 0, 0, fullWidth, fullHeight);

    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = intensity * 0.25;
    ctx.fillStyle = `hsla(${hue}, 70%, 50%, 1)`;
    ctx.fillRect(0, 0, fullWidth, fullHeight);
    ctx.restore();
  }

  resize(width: number, height: number) {
    this.width = Math.max(1, Math.floor(width / 2));
    this.height = Math.max(1, Math.floor(height / 2));
    this.grainCanvas.width = this.width;
    this.grainCanvas.height = this.height;
    this.generateGrainPattern();
  }
}

export const MusicReactiveHero21st: React.FC<MusicReactiveHero21stProps> = ({
  player,
  onOpenVideo,
  onOpenLyrics,
  onScrollToScratch,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [bassBoost, setBassBoost] = useState<number>(1.35);
  const [grainAmount, setGrainAmount] = useState<number>(0.06);
  const [colorPreset, setColorPreset] = useState<'gold' | 'neon' | 'crimson'>('gold');
  const [showControls, setShowControls] = useState<boolean>(false);
  const [liveTelemetry, setLiveTelemetry] = useState({ bass: 42, mid: 31, treble: 24 });

  const freqRef = useRef<Uint8Array>(player.frequencyData);
  freqRef.current = player.frequencyData;

  const isPlayingRef = useRef<boolean>(player.isPlaying);
  isPlayingRef.current = player.isPlaying;

  const settingsRef = useRef({ bassBoost, grainAmount, colorPreset });
  settingsRef.current = { bassBoost, grainAmount, colorPreset };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 680;
    canvas.width = width;
    canvas.height = height;

    const filmGrain = new FilmGrainGenerator(width, height);

    const waves = [
      { amplitude: 38, frequency: 0.0032, speed: 0.024, offset: 0, opacity: 0.88 },
      { amplitude: 30, frequency: 0.0045, speed: 0.018, offset: Math.PI * 0.5, opacity: 0.68 },
      { amplitude: 24, frequency: 0.0055, speed: 0.028, offset: Math.PI, opacity: 0.5 },
      { amplitude: 45, frequency: 0.0022, speed: 0.012, offset: Math.PI * 1.5, opacity: 0.6 },
    ];

    const bassHistory = new Array(16).fill(0);
    let time = 0;

    const handleResize = () => {
      if (!container || !canvas) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || 680;
      canvas.width = width;
      canvas.height = height;
      filmGrain.resize(width, height);
    };

    window.addEventListener('resize', handleResize);

    const render = () => {
      animId = requestAnimationFrame(render);
      time++;

      const { bassBoost: bBoost, grainAmount: gAmt, colorPreset: preset } = settingsRef.current;
      const freq = freqRef.current;
      const active = isPlayingRef.current;

      // Clear with motion-blur trail
      ctx.fillStyle = 'rgba(11, 11, 14, 0.90)';
      ctx.fillRect(0, 0, width, height);

      let bassAmp = 0;
      let midAmp = 0;
      let trebleAmp = 0;

      const hasSignal = active && freq && freq.some((v) => v > 0);

      if (hasSignal) {
        let bSum = 0;
        for (let i = 0; i < 12; i++) bSum += freq[i] || 0;
        bassAmp = bSum / (12 * 255);

        let mSum = 0;
        for (let i = 12; i < 30; i++) mSum += freq[i] || 0;
        midAmp = mSum / (18 * 255);

        let tSum = 0;
        for (let i = 30; i < freq.length; i++) tSum += freq[i] || 0;
        trebleAmp = tSum / (Math.max(1, freq.length - 30) * 255);
      } else if (active) {
        // Synthesized rhythmic funk groove when Web Audio CORS/context is warming up
        const beat = Math.pow(Math.max(0, Math.sin(time * 0.085)), 3);
        bassAmp = 0.45 + beat * 0.45;
        midAmp = 0.35 + Math.sin(time * 0.05) * 0.25;
        trebleAmp = 0.25 + Math.abs(Math.cos(time * 0.11)) * 0.35;
      } else {
        // Ambient idle breathing wave
        bassAmp = 0.22 + Math.sin(time * 0.015) * 0.1;
        midAmp = 0.18 + Math.cos(time * 0.02) * 0.08;
        trebleAmp = 0.12 + Math.sin(time * 0.025) * 0.06;
      }

      bassHistory.shift();
      bassHistory.push(bassAmp);
      const avgBass = (bassHistory.reduce((a, b) => a + b, 0) / bassHistory.length) * bBoost;
      const midIntensity = midAmp * 1.15;
      const trebleIntensity = trebleAmp * 1.15;

      if (time % 12 === 0) {
        setLiveTelemetry({
          bass: Math.min(99, Math.round(avgBass * 65)),
          mid: Math.min(99, Math.round(midIntensity * 75)),
          treble: Math.min(99, Math.round(trebleIntensity * 80)),
        });
      }

      const baseHue = preset === 'gold' ? 34 : preset === 'neon' ? 285 : 8;
      const baseSat = preset === 'gold' ? 92 : preset === 'neon' ? 88 : 90;
      const centerY = height * 0.56;

      // Draw multi-layered 21st.dev audio-reactive waves
      waves.forEach((wave, idx) => {
        wave.offset += wave.speed * (1 + avgBass * 0.85);
        const freqInfluence = idx < 2 ? avgBass : midIntensity;
        const dynamicAmp = wave.amplitude * (1 + freqInfluence * 4.2);

        const waveHue = (baseHue + idx * 12 + avgBass * 18) % 360;
        const waveLight = 48 + idx * 5 + trebleIntensity * 12;
        const alpha = Math.min(0.95, wave.opacity * (0.45 + avgBass * 0.55));

        const grad = ctx.createLinearGradient(
          0,
          centerY - dynamicAmp,
          0,
          centerY + dynamicAmp * 1.5
        );
        grad.addColorStop(0, `hsla(${waveHue}, ${baseSat}%, ${waveLight}%, 0)`);
        grad.addColorStop(0.45, `hsla(${waveHue}, ${baseSat}%, ${waveLight + 12}%, ${alpha})`);
        grad.addColorStop(1, `hsla(${waveHue}, ${baseSat}%, 12%, 0)`);

        ctx.beginPath();
        for (let x = -40; x <= width + 40; x += 4) {
          const y1 = Math.sin(x * wave.frequency + wave.offset) * dynamicAmp;
          const y2 =
            Math.sin(x * wave.frequency * 2.1 + wave.offset * 1.4) *
            (dynamicAmp * 0.32 * midIntensity);
          const y3 =
            Math.cos(x * wave.frequency * 0.55 - wave.offset * 0.7) * (dynamicAmp * 0.45);
          const y = centerY + y1 + y2 + y3;
          if (x === -40) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        // Glow stroke along the crest of wave 0 and 1
        if (idx < 2) {
          ctx.save();
          ctx.strokeStyle = `hsla(${waveHue}, 95%, 72%, ${alpha * 0.9})`;
          ctx.lineWidth = idx === 0 ? 2.4 : 1.4;
          ctx.shadowColor = `hsla(${waveHue}, 95%, 60%, 0.8)`;
          ctx.shadowBlur = 18;
          ctx.stroke();
          ctx.restore();
        }

        ctx.lineTo(width + 40, height);
        ctx.lineTo(-40, height);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // Post-processing 1: Film Grain (21st.dev signature)
      filmGrain.update();
      filmGrain.apply(ctx, width, height, gAmt + avgBass * 0.04, baseHue);

      // Post-processing 2: Subtle Scanlines
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.14)';
      ctx.lineWidth = 1;
      for (let y = 0; y < height; y += 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Post-processing 3: Vignette with warm film burn
      const vignette = ctx.createRadialGradient(
        width / 2,
        height / 2,
        width * 0.18,
        width / 2,
        height / 2,
        width * 0.85
      );
      vignette.addColorStop(0, 'rgba(11, 11, 14, 0)');
      vignette.addColorStop(0.65, 'rgba(11, 11, 14, 0.35)');
      vignette.addColorStop(1, 'rgba(11, 11, 14, 0.88)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      // Post-processing 4: Film dust sparks on bass hits
      if (Math.random() < 0.08 + avgBass * 0.15) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = Math.random() * 2.2 + 0.5;
        ctx.fillStyle = `hsla(${baseHue}, 90%, 78%, ${Math.random() * 0.45})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    player.seek(ratio * (player.duration || 185));
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[680px] lg:min-h-[740px] rounded-3xl overflow-hidden border border-[#F2A900]/30 shadow-2xl bg-[#0B0B0E] flex flex-col justify-between select-none"
    >
      {/* 21st.dev Spotlight SVG Beam (id: 989 by manuarora700) */}
      <svg
        className="pointer-events-none absolute -top-40 left-0 md:left-24 z-10 h-[140%] w-[120%] opacity-45"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 3787 2842"
        fill="none"
      >
        <g filter="url(#spotlight-filter)">
          <ellipse
            cx="1924.71"
            cy="273.501"
            rx="1924.71"
            ry="273.501"
            transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
            fill="#F2A900"
            fillOpacity="0.24"
          />
        </g>
        <defs>
          <filter
            id="spotlight-filter"
            x="0.860352"
            y="0.838989"
            width="3785.16"
            height="2840.26"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="151" result="effect1_foregroundBlur" />
          </filter>
        </defs>
      </svg>

      {/* 21st.dev Audio Reactive Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Top HUD Bar (21st.dev Corner Telemetry & Shader Controls) */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 p-5 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B0B0E]/80 backdrop-blur-md border border-[#F2A900]/40 text-[11px] font-mono uppercase tracking-widest text-[#F2A900]">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            21st.dev • Music Reactive Hero #2560
          </span>
          <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1A22]/80 border border-[#F5E6CC]/15 text-[11px] font-mono text-[#F5E6CC]/80">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            60 FPS • FILM GRAIN SHADER
          </span>
        </div>

        {/* Audio Telemetry & Shader Settings Trigger */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-[#0B0B0E]/80 backdrop-blur-md border border-[#F5E6CC]/10 text-[11px] font-mono text-[#8E8E9F]">
            <span>
              BASS: <strong className="text-[#F2A900]">{liveTelemetry.bass}%</strong>
            </span>
            <span>
              MID: <strong className="text-[#FF7700]">{liveTelemetry.mid}%</strong>
            </span>
            <span>
              HIGH: <strong className="text-[#F5E6CC]">{liveTelemetry.treble}%</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowControls(!showControls)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1A1A22]/90 hover:bg-[#F2A900] text-[#F5E6CC] hover:text-[#0B0B0E] border border-[#F2A900]/30 text-xs font-bold transition-all"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>FX Пульт</span>
          </button>
        </div>
      </div>

      {/* Expandable 21st.dev Post-Processing FX Drawer */}
      {showControls && (
        <div className="relative z-30 mx-5 sm:mx-8 p-4 rounded-2xl bg-[#0B0B0E]/90 backdrop-blur-xl border border-[#F2A900]/40 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="flex justify-between text-[#8E8E9F] font-mono">
              <span>BASS INTENSITY</span>
              <span className="text-[#F2A900]">{bassBoost.toFixed(2)}x</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={bassBoost}
              onChange={(e) => setBassBoost(parseFloat(e.target.value))}
              className="w-full accent-[#F2A900]"
            />
          </div>
          <div className="space-y-1">
            <label className="flex justify-between text-[#8E8E9F] font-mono">
              <span>FILM GRAIN & DUST</span>
              <span className="text-[#F2A900]">{Math.round(grainAmount * 1000)}%</span>
            </label>
            <input
              type="range"
              min="0.01"
              max="0.16"
              step="0.01"
              value={grainAmount}
              onChange={(e) => setGrainAmount(parseFloat(e.target.value))}
              className="w-full accent-[#F2A900]"
            />
          </div>
          <div className="space-y-1">
            <span className="block text-[#8E8E9F] font-mono">ПАЛИТРА ВОЛНЫ</span>
            <div className="flex gap-2 pt-0.5">
              {(
                [
                  { id: 'gold', label: 'Warm Gold' },
                  { id: 'neon', label: 'Neo-Soul Violet' },
                  { id: 'crimson', label: 'Vinyl Fire' },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setColorPreset(p.id)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    colorPreset === p.id
                      ? 'bg-[#F2A900] text-[#0B0B0E]'
                      : 'bg-[#1A1A22] text-[#F5E6CC]/70 hover:text-[#F5E6CC]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Center Editorial Content (21st.dev Hero Typography + Giant Reactive Play Trigger) */}
      <div className="relative z-20 px-4 sm:px-12 py-6 sm:py-8 flex flex-col items-center text-center max-w-4xl mx-auto space-y-5 sm:space-y-6">
        <p className="font-mono text-[11px] sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.35em] text-[#F2A900]">
          Почувствуй живой аналоговый грув между нотами
        </p>

        <h1 className="font-display font-black text-4xl sm:text-7xl lg:text-8xl tracking-tighter uppercase leading-[0.98] text-[#F5E6CC] drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)]">
          <span className="block">ОСТАНЬСЯ,</span>
          <span className="block text-gradient-gold">МУЗЫКА</span>
        </h1>

        <p className="text-xs sm:text-base text-[#F5E6CC]/85 max-w-xl mx-auto leading-relaxed font-medium">
          Аудио-реактивная сцена <strong>Besik Raev (Беслан)</strong>. Лирико-драматический тенор,
          фанковая ритм-секция и винтажная киноплёнка, оживающая от каждого удара бас-бочки.
        </p>

        {/* Center Interactive Controls */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={player.togglePlay}
            className={`group relative px-6 sm:px-9 py-4 rounded-full font-display font-black text-xs sm:text-sm uppercase tracking-[0.15em] sm:tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300 ${
              player.isPlaying
                ? 'bg-[#FF7700] text-[#0B0B0E] shadow-[0_0_50px_rgba(255,119,0,0.65)] scale-[1.02]'
                : 'bg-gradient-to-r from-[#F2A900] to-[#FF7700] text-[#0B0B0E] shadow-[0_0_35px_rgba(242,169,0,0.4)] hover:scale-105'
            }`}
          >
            {player.isPlaying ? (
              <>
                <Pause className="w-5 h-5 fill-current flex-shrink-0" />
                <span>ПАУЗА • ЖИВОЙ ЭФИР</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current ml-0.5 flex-shrink-0" />
                <span>ЗАПУСТИТЬ ЗВУК И СЦЕНУ</span>
              </>
            )}
          </button>

          <div className="grid grid-cols-2 sm:flex items-center justify-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onOpenVideo}
              className="px-4 sm:px-6 py-3.5 sm:py-4 rounded-full bg-[#0B0B0E]/80 backdrop-blur-md border border-[#F5E6CC]/25 hover:border-[#F2A900] text-[#F5E6CC] font-bold text-[11px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <Video className="w-4 h-4 text-[#F2A900] flex-shrink-0" />
              <span>Клип 9:16</span>
            </button>

            <button
              type="button"
              onClick={onScrollToScratch}
              className="px-4 sm:px-5 py-3.5 sm:py-4 rounded-full bg-[#1A1A22]/85 backdrop-blur-md border border-[#F2A900]/30 hover:border-[#F2A900] text-[#F2A900] font-bold text-[11px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <Disc3 className="w-4 h-4 animate-spin flex-shrink-0" />
              <span>Скретч 33 RPM</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenLyrics}
            className="px-5 py-3.5 sm:py-4 rounded-full bg-[#1A1A22]/85 backdrop-blur-md border border-[#F5E6CC]/15 hover:border-[#F2A900] text-[#F5E6CC] font-bold text-[11px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
          >
            <FileText className="w-4 h-4 text-[#F2A900] flex-shrink-0" />
            <span>Караоке-текст</span>
          </button>
        </div>
      </div>

      {/* Bottom Bar: Artist Identity + Scrubber Progress (from 21st.dev #2560) */}
      <div className="relative z-20 p-5 sm:p-8 bg-gradient-to-t from-[#0B0B0E] via-[#0B0B0E]/80 to-transparent space-y-4">
        {/* Interactive Audio Scrubber */}
        <div className="max-w-4xl mx-auto space-y-1.5">
          <div className="flex justify-between text-[11px] font-mono text-[#F5E6CC]/75">
            <span>
              СЕЙЧАС ИГРАЕТ: <strong className="text-[#F2A900]">{player.currentTrack.title}</strong> ({player.currentTrack.genre})
            </span>
            <span>
              {formatTime(player.currentTime)} / {formatTime(player.duration)}
            </span>
          </div>
          <div
            onClick={handleProgressBarClick}
            className="w-full h-2 rounded-full bg-[#F5E6CC]/15 cursor-pointer overflow-hidden relative group"
          >
            <div
              className="h-full bg-gradient-to-r from-[#F2A900] via-[#FF7700] to-[#FAF4EB] transition-all duration-150"
              style={{ width: `${player.progress}%` }}
            />
          </div>
        </div>

        {/* Artist Bar & Quick Booking Link */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#F5E6CC]/10">
          <div className="flex items-center gap-3">
            <img
              src="./assets/beslan_avatar.jpg"
              alt="Besik Raev"
              className="w-10 h-10 rounded-full object-cover border border-[#F2A900]"
            />
            <div>
              <div className="font-display font-bold text-sm text-[#F5E6CC]">
                BESIK RAEV (Беслан)
              </div>
              <a
                href="https://www.instagram.com/besikraev/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-[#F2A900] hover:underline"
              >
                @besikraev • Официальный артист
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={player.toggleMute}
              className="p-2.5 rounded-xl bg-[#1A1A22] border border-[#F5E6CC]/15 text-[#F5E6CC] hover:border-[#F2A900]"
              aria-label="Mute toggle"
            >
              {player.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#F2A900]" />}
            </button>
            <a
              href="#booking"
              className="px-4 py-2.5 rounded-xl bg-[#1A1A22] hover:bg-[#F2A900] text-[#F5E6CC] hover:text-[#0B0B0E] border border-[#F2A900]/40 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Рассчитать гонорар выступления</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
