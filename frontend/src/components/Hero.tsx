import { Waves, CirclePlay } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroProps {
  onStartTour?: () => void;
}

export function Hero({ onStartTour }: HeroProps) {
  return (
    <section className="relative py-12 overflow-hidden">
      {/* Background glow effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'var(--gradient-hero)' }}
      />

      {/* Waveform decoration */}
      <div className="absolute inset-x-0 bottom-0 h-px glow-line" />

      <div className="container mx-auto px-4 text-center relative">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Waves className="w-4 h-4 text-primary" />
          <span className="font-display text-sm text-primary">Filter the noise, find the signal</span>
        </div>

        <h2 className="font-display text-3xl md:text-4xl font-bold mb-3 tracking-tight">
          <span className="text-gradient">Control</span> your news feed
        </h2>

        <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-6">
          Aggregate content from your favorite sources.
          Sign up to customize what you see, add your own feeds, and personalize your experience.
        </p>

        {onStartTour && (
          <button
            onClick={onStartTour}
            className="inline-flex items-stretch rounded-lg overflow-hidden backdrop-blur-md bg-white/10 border border-primary/40 shadow-glow-primary animate-pulse-slow transition-all hover:bg-white/15 hover:scale-[1.02]"
          >
            <span className="px-5 py-3 bg-background/80 text-foreground font-medium">
              Take a tour
            </span>
            <span className="w-px bg-white/20" />
            <span className="px-4 py-3 bg-primary text-primary-foreground flex items-center">
              <CirclePlay className="w-6 h-6" />
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
