import { useEffect, useCallback, useRef } from 'react';

interface UseBackHandlerOptions {
  enabled: boolean;
  onBack: () => boolean; // Return true to prevent default back behavior
}

export const useBackHandler = ({ enabled, onBack }: UseBackHandlerOptions) => {
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  useEffect(() => {
    if (!enabled) return;

    // Push a fake history state to intercept back button
    const initialState = window.history.state;
    window.history.pushState({ backHandlerActive: true }, '');

    const handlePopState = (event: PopStateEvent) => {
      const shouldPrevent = onBackRef.current();
      
      if (shouldPrevent) {
        // Re-push state to stay on current page
        window.history.pushState({ backHandlerActive: true }, '');
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      
      // Try to clean up the fake history state we pushed
      if (window.history.state?.backHandlerActive) {
        window.history.back();
      }
    };
  }, [enabled]);
};

// Hook to show confirmation when user tries to leave with unsaved changes
export const useUnsavedChangesWarning = (hasUnsavedChanges: boolean) => {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);
};
