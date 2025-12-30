import { useEffect, useRef } from 'react';
import { promptService } from '../services/promptService';


export const useViewTracking = (promptId, isEnabled = true, onViewTracked = null) => {
  const hasTracked = useRef(false);
  const startTime = useRef(null);
  const maxScroll = useRef(0);
  const hasInteracted = useRef(false);
  const isVisible = useRef(true);

  useEffect(() => {
    if (!promptId || !isEnabled || hasTracked.current) return;

    startTime.current = Date.now();
    maxScroll.current = 0;
    hasInteracted.current = false;

    // Detect user interactions
    const handleInteraction = () => {
      hasInteracted.current = true;
    };

    // Detect page visibility changes
    const handleVisibilityChange = () => {
      isVisible.current = !document.hidden;
    };

    const handleScroll = () => {
      if (!isVisible.current) return;
      
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      maxScroll.current = Math.max(maxScroll.current, scrollPercent);
      handleInteraction();
    };

    const handleBeforeUnload = () => {
      trackViewIfEligible();
    };

    const trackViewIfEligible = async () => {
      if (hasTracked.current) return;

      const timeSpent = Date.now() - startTime.current;
      const minTimeSpent = 5000;
      const minScrollPercent = 20;

      const isValidView = 
        timeSpent >= minTimeSpent && 
        maxScroll.current >= minScrollPercent &&
        hasInteracted.current &&
        isVisible.current;

      if (isValidView) {
        hasTracked.current = true;
        try {
          await promptService.registerView(promptId);
          console.log('View tracked successfully');
          if (onViewTracked) {
            onViewTracked();
          }
        } catch (error) {
          console.error('Error tracking view:', error);
        }
      }
    };

    const timer = setTimeout(trackViewIfEligible, 8000);

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      trackViewIfEligible();
    };
  }, [promptId, isEnabled, onViewTracked]);

  return hasTracked.current;
};