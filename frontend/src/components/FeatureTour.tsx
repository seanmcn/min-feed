import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type TourStep } from '@/hooks/useTour';

interface FeatureTourProps {
  isOpen: boolean;
  currentStep: number;
  totalSteps: number;
  stepData: TourStep;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

interface ElementRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function FeatureTour({
  isOpen,
  currentStep,
  totalSteps,
  stepData,
  onNext,
  onPrevious,
  onClose,
  isFirstStep,
  isLastStep,
}: FeatureTourProps) {
  const [targetRect, setTargetRect] = useState<ElementRect | null>(null);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});

  const updatePosition = useCallback(() => {
    const element = document.querySelector(stepData.target);
    if (!element) {
      setTargetRect(null);
      return;
    }

    const rect = element.getBoundingClientRect();
    const padding = 8;

    setTargetRect({
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    });

    // Calculate popover position
    const popoverWidth = 320;
    const popoverHeight = 180;
    const margin = 16;

    let top = 0;
    let left = 0;

    const placement = stepData.placement || 'bottom';

    switch (placement) {
      case 'bottom':
        top = rect.bottom + margin;
        left = rect.left + rect.width / 2 - popoverWidth / 2;
        break;
      case 'top':
        top = rect.top - popoverHeight - margin;
        left = rect.left + rect.width / 2 - popoverWidth / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - popoverHeight / 2;
        left = rect.left - popoverWidth - margin;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - popoverHeight / 2;
        left = rect.right + margin;
        break;
    }

    // Keep popover within viewport
    left = Math.max(margin, Math.min(left, window.innerWidth - popoverWidth - margin));
    top = Math.max(margin, Math.min(top, window.innerHeight - popoverHeight - margin));

    setPopoverStyle({
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${popoverWidth}px`,
    });
  }, [stepData]);

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    // Scroll element into view
    const element = document.querySelector(stepData.target);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Update position after scroll
      setTimeout(updatePosition, 300);
    }

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, stepData, updatePosition]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        onNext();
      } else if (e.key === 'ArrowLeft') {
        onPrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNext, onPrevious]);

  if (!isOpen) return null;

  const overlayContent = (
    <div className="fixed inset-0 z-[100]">
      {/* Dark overlay with cutout */}
      <div
        className="absolute inset-0 bg-black/70 transition-all duration-300"
        onClick={onClose}
        style={
          targetRect
            ? {
                clipPath: `polygon(
                  0% 0%,
                  0% 100%,
                  ${targetRect.left}px 100%,
                  ${targetRect.left}px ${targetRect.top}px,
                  ${targetRect.left + targetRect.width}px ${targetRect.top}px,
                  ${targetRect.left + targetRect.width}px ${targetRect.top + targetRect.height}px,
                  ${targetRect.left}px ${targetRect.top + targetRect.height}px,
                  ${targetRect.left}px 100%,
                  100% 100%,
                  100% 0%
                )`,
              }
            : {}
        }
      />

      {/* Highlight border around target */}
      {targetRect && (
        <div
          className="absolute border-2 border-primary rounded-lg pointer-events-none transition-all duration-300"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
            boxShadow: '0 0 0 4px hsl(195 100% 50% / 0.2)',
          }}
        />
      )}

      {/* Popover */}
      <div
        className="bg-background border border-border rounded-lg shadow-xl p-4 transition-all duration-300"
        style={popoverStyle}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step indicator */}
        <div className="text-xs text-muted-foreground mb-2">
          Step {currentStep + 1} of {totalSteps}
        </div>

        {/* Content */}
        <h3 className="font-display font-semibold text-foreground mb-2">
          {stepData.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {stepData.description}
        </p>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrevious}
            disabled={isFirstStep}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={onNext}
            className="gap-1"
          >
            {isLastStep ? 'Done' : 'Next'}
            {!isLastStep && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(overlayContent, document.body);
}
