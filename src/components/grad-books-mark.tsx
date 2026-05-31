/**
 * Animated graduation cap (gown) + stack of books mark.
 * Pure SVG + CSS animations — no external deps.
 */
export function GradBooksMark({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative mx-auto flex items-center justify-center ${className}`}
      aria-hidden
    >
      {/* glow halo */}
      <div className="absolute inset-0 -z-10 animate-float-slow rounded-full bg-primary-glow/30 blur-3xl" />

      <svg
        viewBox="0 0 220 200"
        className="h-32 w-32 sm:h-40 sm:w-40 drop-shadow-[0_10px_30px_rgba(80,40,180,0.35)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="capGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.38 0.17 268)" />
            <stop offset="100%" stopColor="oklch(0.62 0.22 295)" />
          </linearGradient>
          <linearGradient id="book1" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="oklch(0.6 0.22 25)" />
            <stop offset="100%" stopColor="oklch(0.7 0.18 35)" />
          </linearGradient>
          <linearGradient id="book2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="oklch(0.55 0.18 275)" />
            <stop offset="100%" stopColor="oklch(0.7 0.18 285)" />
          </linearGradient>
          <linearGradient id="book3" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="oklch(0.62 0.16 155)" />
            <stop offset="100%" stopColor="oklch(0.72 0.18 165)" />
          </linearGradient>
        </defs>

        {/* Books stack */}
        <g className="origin-center animate-book-bob">
          <rect x="40" y="150" width="140" height="18" rx="3" fill="url(#book1)" />
          <rect x="48" y="153" width="6" height="12" fill="white" opacity="0.35" />
          <rect x="50" y="132" width="120" height="18" rx="3" fill="url(#book2)" />
          <rect x="58" y="135" width="6" height="12" fill="white" opacity="0.35" />
          <rect x="60" y="114" width="100" height="18" rx="3" fill="url(#book3)" />
          <rect x="68" y="117" width="6" height="12" fill="white" opacity="0.35" />
        </g>

        {/* Graduation cap */}
        <g className="origin-[110px_80px] animate-cap-tilt">
          {/* Mortarboard */}
          <polygon
            points="110,30 200,65 110,100 20,65"
            fill="url(#capGrad)"
          />
          <polygon
            points="110,30 200,65 110,100 20,65"
            fill="white"
            opacity="0.08"
          />
          {/* Base / band */}
          <path
            d="M65 78 L65 95 Q65 108 110 108 Q155 108 155 95 L155 78 L110 96 Z"
            fill="url(#capGrad)"
          />
          {/* Button on top */}
          <circle cx="110" cy="65" r="4" fill="oklch(0.78 0.2 290)" />
          {/* Tassel */}
          <g className="origin-[110px_65px] animate-tassel">
            <line x1="110" y1="65" x2="165" y2="65" stroke="oklch(0.78 0.2 290)" strokeWidth="2" />
            <line x1="165" y1="65" x2="165" y2="92" stroke="oklch(0.78 0.2 290)" strokeWidth="2" />
            <circle cx="165" cy="96" r="5" fill="oklch(0.78 0.2 290)" />
            <rect x="162" y="94" width="6" height="10" rx="1" fill="oklch(0.62 0.22 285)" />
          </g>
        </g>

        {/* Floating sparkles */}
        <circle cx="35" cy="40" r="2.5" fill="oklch(0.78 0.2 290)" className="animate-spark-a" />
        <circle cx="190" cy="35" r="2" fill="oklch(0.7 0.18 285)" className="animate-spark-b" />
        <circle cx="200" cy="120" r="2.5" fill="oklch(0.78 0.2 290)" className="animate-spark-a" />
        <circle cx="22" cy="115" r="2" fill="oklch(0.7 0.18 285)" className="animate-spark-b" />
      </svg>
    </div>
  );
}
