import heroBg from "@/assets/hero-bg.png";

/**
 * Animated, parallax-style hero background.
 * - Slow Ken Burns zoom on the mountain image.
 * - Floating gradient orbs + drifting dot grid for depth.
 * - Sits behind content; pointer-events-none.
 */
export function AnimatedBackground({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
    >
      {/* Image layer */}
      <div
        className="absolute inset-0 animate-bg-pan bg-cover bg-center opacity-60 dark:opacity-30"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      {/* Soft wash so text stays readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/30 to-background/90" />

      {/* Floating orbs */}
      <div className="absolute -top-24 left-[10%] h-80 w-80 animate-float-slow rounded-full bg-primary/25 blur-3xl" />
      <div className="absolute top-1/3 right-[8%] h-96 w-96 animate-float-slower rounded-full bg-primary-glow/25 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 animate-float-slow rounded-full bg-accent/30 blur-3xl" />

      {/* Subtle dot grid drifting */}
      <div className="absolute inset-0 animate-grid-drift opacity-[0.08] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:22px_22px] text-foreground" />
    </div>
  );
}
