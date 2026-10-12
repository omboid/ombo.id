import React, { useState } from 'react';

interface WatermarkedImageProps {
  src: string;
  alt: string;
  className?: string;
  watermarkText?: string;
  eventTitle?: string;
  bibNumber?: string;
  priority?: boolean;
}

export const WatermarkedImage: React.FC<WatermarkedImageProps> = ({
  src,
  alt,
  className = '',
  watermarkText = 'OMBO.ID PREVIEW',
  eventTitle = 'Jambi Run 10K',
  bibNumber,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative overflow-hidden select-none bg-neutral-900 group ${className}`}>
      {/* Fallback loader */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-neutral-800 animate-pulse flex items-center justify-center text-xs text-neutral-500 font-mono">
          Memuat foto...
        </div>
      )}

      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        draggable={false}
        className={`w-full h-full object-cover transition-all duration-500 ${
          loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
        }`}
      />

      {/* Anti-steal Canvas Watermark Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3"
        style={{
          background: `
            repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 70px,
              rgba(255, 255, 255, 0.04) 70px,
              rgba(255, 255, 255, 0.04) 140px
            )
          `
        }}
      >
        {/* Repeating diagonal watermark text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-30">
          <div className="transform -rotate-25 text-white/40 font-mono font-extrabold text-lg sm:text-2xl tracking-widest whitespace-nowrap select-none drop-shadow-md text-center">
            {watermarkText} · {watermarkText}
            <br />
            {eventTitle.toUpperCase()} · TIDAK UNTUK DIUNDUH
            <br />
            {watermarkText} · {watermarkText}
          </div>
        </div>

        {/* Top bar info stamp */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-[10px] tracking-wider uppercase font-mono font-bold px-2 py-0.5 bg-black/60 backdrop-blur-md text-orange-400 rounded border border-orange-500/30">
            PROTECTED PREVIEW
          </span>
          {bibNumber && (
            <span className="text-xs font-mono font-bold px-2 py-0.5 bg-neutral-950/80 backdrop-blur-md text-white rounded border border-white/20">
              BIB #{bibNumber}
            </span>
          )}
        </div>

        {/* Bottom bar branding */}
        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-neutral-300 drop-shadow-md">
          <span className="bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-neutral-400">
            © ombo.id
          </span>
          <span className="text-[10px] text-neutral-400 bg-black/60 px-2 py-0.5 rounded">
            Resolusi HD Tersedia
          </span>
        </div>
      </div>
    </div>
  );
};
