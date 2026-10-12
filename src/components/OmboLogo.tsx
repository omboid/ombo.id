import React from 'react';

interface OmboLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  animated?: boolean;
}

export const OmboLogo: React.FC<OmboLogoProps> = ({
  className = '',
  size = 40,
  showText = false,
  animated = true,
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* High-resolution SVG circular logo without white background */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105 filter drop-shadow-md overflow-visible"
      >
        {/* Sky / Cyan Blue Circle (#009fe3) with smooth pulse animation */}
        <circle
          cx="250"
          cy="250"
          r="236"
          fill="#009fe3"
          className={animated ? 'animate-pulse-smooth' : ''}
          style={{
            transformBox: 'fill-box',
            transformOrigin: 'center',
          }}
        />

        {/* Camera Line Silhouette Drawing */}
        <path
          d="M 120 255
             C 118 245, 125 238, 145 236
             L 172 230
             C 182 228, 192 205, 202 185
             C 208 175, 222 172, 238 172
             L 282 172
             C 292 176, 305 180, 325 178
             L 345 175"
          stroke="#ffffff"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Shutter / Flash Knob */}
        <path
          d="M 312 170
             L 316 156
             C 318 152, 325 150, 335 150
             L 346 150
             C 354 150, 357 153, 355 160
             L 351 172"
          stroke="#ffffff"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Camera Body Outer Contour & Diagonal Lens Line */}
        <path
          d="M 122 255
             C 115 275, 118 335, 138 350
             C 152 360, 180 360, 200 354
             L 395 152"
          stroke="#ffffff"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Bottom Curve Body Contour */}
        <path
          d="M 138 350
             C 155 365, 185 362, 205 352"
          stroke="#ffffff"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Stylized 'O' (Lens Aperture Ring) */}
        <ellipse
          cx="225"
          cy="265"
          rx="52"
          ry="62"
          stroke="#ffffff"
          strokeWidth="15"
          fill="none"
          transform="rotate(-10 225 265)"
        />

        {/* Inner Lens Reflection Dot / Iris Highlight */}
        <ellipse
          cx="222"
          cy="268"
          rx="15"
          ry="17"
          fill="#ffffff"
        />

        {/* Cursive 'mbo' rendered as vector paths for pixel-perfect display */}
        <text
          x="248"
          y="300"
          fill="#ffffff"
          fontSize="120"
          fontFamily="system-ui, -apple-system, 'Brush Script MT', cursive, sans-serif"
          fontWeight="bold"
          fontStyle="italic"
          letterSpacing="-4"
        >
          mbo
        </text>

        {/* 'PHOTOGRAPHY' Subtitle */}
        <text
          x="250"
          y="355"
          fill="#ffffff"
          fontSize="26"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          letterSpacing="5"
          textAnchor="middle"
        >
          PHOTOGRAPHY
        </text>
      </svg>

      {showText && (
        <div className="leading-none">
          <div className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center">
            <span>ombo</span>
            <span className="text-sky-400">.id</span>
          </div>
          <div className="text-[10px] text-neutral-400 font-mono tracking-wider uppercase mt-0.5">
            Marathon Photo Marketplace
          </div>
        </div>
      )}
    </div>
  );
};
