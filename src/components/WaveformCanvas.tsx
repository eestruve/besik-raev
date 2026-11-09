import React, { useRef, useEffect } from 'react';

interface WaveformCanvasProps {
  isPlaying: boolean;
  frequencyData: Uint8Array;
  analyserNode: AnalyserNode | null;
  barCount?: number;
  className?: string;
}

export const WaveformCanvas: React.FC<WaveformCanvasProps> = ({
  isPlaying,
  frequencyData,
  analyserNode,
  barCount = 48,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localData = new Uint8Array(barCount);

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      if (analyserNode && isPlaying) {
        const binCount = analyserNode.frequencyBinCount;
        const rawBuffer = new Uint8Array(binCount);
        analyserNode.getByteFrequencyData(rawBuffer);

        // Subsample into barCount
        const step = Math.floor(binCount / barCount);
        for (let i = 0; i < barCount; i++) {
          let sum = 0;
          for (let j = 0; j < step; j++) {
            sum += rawBuffer[i * step + j] || 0;
          }
          const target = sum / step;
          // Smooth interpolation
          localData[i] = localData[i] * 0.7 + target * 0.3;
        }
      } else if (!isPlaying) {
        // Subtle ambient idle breathing wave
        const time = Date.now() * 0.003;
        for (let i = 0; i < barCount; i++) {
          const wave = Math.sin(time + i * 0.2) * 8 + Math.cos(time * 0.5 + i * 0.1) * 4;
          const idleValue = Math.max(4, 12 + wave);
          localData[i] = localData[i] * 0.85 + idleValue * 0.15;
        }
      }

      const totalBars = barCount;
      const spacing = 3;
      const barWidth = Math.max(2, (width - spacing * (totalBars - 1)) / totalBars);

      // Create rich gradient
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, '#FF7700');
      gradient.addColorStop(0.6, '#F2A900');
      gradient.addColorStop(1, '#FAF4EB');

      for (let i = 0; i < totalBars; i++) {
        const val = localData[i] || 0;
        const normalized = val / 255;
        const barHeight = Math.max(3, normalized * (height - 6));
        const x = i * (barWidth + spacing);
        const y = height - barHeight;

        // Draw rounded bar
        ctx.fillStyle = gradient;
        ctx.beginPath();
        const radius = Math.min(barWidth / 2, 2);
        ctx.roundRect(x, y, barWidth, barHeight, [radius, radius, 0, 0]);
        ctx.fill();

        // Top cap glow
        if (isPlaying && normalized > 0.35) {
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(x + barWidth / 2, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, analyserNode, barCount, frequencyData]);

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-16 sm:h-20 block"
        style={{ width: '100%' }}
      />
      {/* Bottom subtle baseline glow */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#F2A900]/40 to-transparent pointer-events-none" />
    </div>
  );
};
