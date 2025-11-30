import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const loaderVariants = cva("inline-flex items-center justify-center", {
  variants: {
    variant: {
      spinner: "relative",
      blocks: "gap-1",
      bar: "w-full max-w-[200px]",
      pulse: "gap-2",
      glitch: "relative",
    },
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    },
  },
  defaultVariants: {
    variant: "spinner",
    size: "md",
  },
});

interface LoaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
  VariantProps<typeof loaderVariants> {
  asChild?: boolean;
}

const Loader = React.forwardRef<HTMLDivElement, LoaderProps>(
  (
    {
      className,
      variant = "spinner",
      size,
      ...props
    },
    ref,
  ) => {
    // Pixel Spinner - rotating pixel blocks
    if (variant === "spinner") {
      return (
        <div
          className={cn(loaderVariants({ variant, size }), className)}
          ref={ref}
          role="status"
          aria-label="Loading..."
          {...props}
        >
          <div className="relative w-12 h-12">
            {/* Outer rotating pixels */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-primary border-2 border-black dark:border-foreground"
                style={{
                  top: `${50 + 40 * Math.sin((i * Math.PI) / 4)}%`,
                  left: `${50 + 40 * Math.cos((i * Math.PI) / 4)}%`,
                  transform: 'translate(-50%, -50%)',
                  animation: 'pixel-spin 1.2s linear infinite',
                  animationDelay: `${i * 0.15}s`,
                  opacity: 1 - i * 0.1,
                }}
              />
            ))}
            {/* Center pixel */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-cyan border-2 border-black dark:border-foreground animate-pulse" />
          </div>
          <style jsx>{`
            @keyframes pixel-spin {
              0%, 100% { transform: translate(-50%, -50%) scale(1); }
              50% { transform: translate(-50%, -50%) scale(0.6); }
            }
          `}</style>
        </div>
      );
    }

    // Bouncing Blocks - neo-brutal bouncing squares
    if (variant === "blocks") {
      return (
        <div
          className={cn(loaderVariants({ variant, size }), "gap-1", className)}
          ref={ref}
          role="status"
          aria-label="Loading..."
          {...props}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-4 h-4 border-3 border-black dark:border-foreground shadow-[3px_3px_0_0_rgba(0,0,0,1)] dark:shadow-[3px_3px_0_0_rgba(245,245,245,1)]"
              style={{
                backgroundColor: i === 0 ? 'var(--primary)' : i === 1 ? 'var(--cyan)' : 'var(--magenta)',
                animation: 'pixel-bounce 0.6s ease-in-out infinite',
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
          <style jsx>{`
            @keyframes pixel-bounce {
              0%, 100% { transform: translateY(0) scaleY(1); }
              50% { transform: translateY(-12px) scaleY(1.1); }
            }
          `}</style>
        </div>
      );
    }

    // Loading Bar - retro progress bar
    if (variant === "bar") {
      return (
        <div
          className={cn(loaderVariants({ variant, size }), className)}
          ref={ref}
          role="status"
          aria-label="Loading..."
          {...props}
        >
          <div className="w-full h-6 bg-muted border-3 border-black dark:border-foreground shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(245,245,245,1)] overflow-hidden relative">
            {/* Animated fill */}
            <div
              className="absolute inset-0 bg-linear-to-r from-primary via-cyan to-magenta"
              style={{
                animation: 'loading-bar 1.5s ease-in-out infinite',
              }}
            />
            {/* Pixel overlay pattern */}
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)`,
            }} />
          </div>
          <style jsx>{`
            @keyframes loading-bar {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
          `}</style>
        </div>
      );
    }

    // Pulse - pulsing pixel squares
    if (variant === "pulse") {
      return (
        <div
          className={cn(loaderVariants({ variant, size }), "gap-2", className)}
          ref={ref}
          role="status"
          aria-label="Loading..."
          {...props}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-3 h-3 border-2 border-black dark:border-foreground"
              style={{
                backgroundColor: ['var(--primary)', 'var(--cyan)', 'var(--magenta)', 'var(--lime)'][i],
                animation: 'pixel-pulse 1s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
          <style jsx>{`
            @keyframes pixel-pulse {
              0%, 100% { 
                transform: scale(1);
                opacity: 1;
              }
              50% { 
                transform: scale(1.3);
                opacity: 0.7;
              }
            }
          `}</style>
        </div>
      );
    }

    // Glitch - glitchy pixel effect
    if (variant === "glitch") {
      return (
        <div
          className={cn(loaderVariants({ variant, size }), className)}
          ref={ref}
          role="status"
          aria-label="Loading..."
          {...props}
        >
          <div className="relative">
            {/* Main text */}
            <div className="font-head text-2xl font-bold uppercase tracking-wider border-3 border-black dark:border-foreground bg-primary px-4 py-2 shadow-[5px_5px_0_0_rgba(0,0,0,1)] dark:shadow-[5px_5px_0_0_rgba(245,245,245,1)]">
              LOADING
            </div>
            {/* Glitch layers */}
            <div
              className="absolute inset-0 font-head text-2xl font-bold uppercase tracking-wider px-4 py-2 text-cyan mix-blend-multiply dark:mix-blend-screen"
              style={{
                animation: 'glitch-1 0.3s infinite',
              }}
            >
              LOADING
            </div>
            <div
              className="absolute inset-0 font-head text-2xl font-bold uppercase tracking-wider px-4 py-2 text-magenta mix-blend-multiply dark:mix-blend-screen"
              style={{
                animation: 'glitch-2 0.3s infinite',
              }}
            >
              LOADING
            </div>
          </div>
          <style jsx>{`
            @keyframes glitch-1 {
              0%, 100% { transform: translate(0); }
              33% { transform: translate(-2px, 2px); }
              66% { transform: translate(2px, -2px); }
            }
            @keyframes glitch-2 {
              0%, 100% { transform: translate(0); }
              33% { transform: translate(2px, -2px); }
              66% { transform: translate(-2px, 2px); }
            }
          `}</style>
        </div>
      );
    }

    // Default fallback
    return (
      <div
        className={cn(loaderVariants({ variant, size }), className)}
        ref={ref}
        role="status"
        aria-label="Loading..."
        {...props}
      >
        <div className="w-8 h-8 border-3 border-black dark:border-foreground bg-primary animate-spin" />
      </div>
    );
  },
);

Loader.displayName = "Loader";
export { Loader };
