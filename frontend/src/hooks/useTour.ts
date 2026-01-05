import { useState, useCallback } from 'react';

export interface TourStep {
  target: string; // CSS selector for the element to highlight
  title: string;
  description: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export const tourSteps: TourStep[] = [
  {
    target: '[data-tour="categories"]',
    title: 'Filter by Category',
    description: 'Select categories to focus on specific topics like tech, science, or world news.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="sentiment"]',
    title: 'Filter by Sentiment',
    description: 'Use the sentiment meter to show only good news, neutral stories, or filter out negativity.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="sort"]',
    title: 'Sort Stories',
    description: 'Sort by newest first or by importance to see the most significant stories at the top.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="article"]',
    title: 'Read Articles',
    description: 'Click "Read more" to open an article. If you\'re logged in, this marks it as read and hides it from your feed.',
    placement: 'right',
  },
  {
    target: '[data-tour="register"]',
    title: 'Create an Account',
    description: 'Register to add your own sources, save your preferences, and track what you\'ve read.',
    placement: 'bottom',
  },
];

export function useTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const start = useCallback(() => {
    setCurrentStep(0);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setCurrentStep(0);
  }, []);

  const next = useCallback(() => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      close();
    }
  }, [currentStep, close]);

  const previous = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  return {
    isOpen,
    currentStep,
    totalSteps: tourSteps.length,
    currentStepData: tourSteps[currentStep],
    start,
    close,
    next,
    previous,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === tourSteps.length - 1,
  };
}
