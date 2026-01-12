import { useState, useCallback, useRef } from 'react';

// Prevent double-clicks on buttons
export const useButtonLock = (lockDurationMs: number = 2000) => {
  const [isLocked, setIsLocked] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const lock = useCallback(() => {
    setIsLocked(true);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsLocked(false);
    }, lockDurationMs);
  }, [lockDurationMs]);

  const unlock = useCallback(() => {
    setIsLocked(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const executeWithLock = useCallback(async <T>(fn: () => Promise<T>): Promise<T | null> => {
    if (isLocked) return null;
    
    lock();
    try {
      return await fn();
    } finally {
      unlock();
    }
  }, [isLocked, lock, unlock]);

  return { isLocked, lock, unlock, executeWithLock };
};

// Create a debounced click handler
export const useDebouncedClick = (callback: () => void, delay: number = 300) => {
  const lastClick = useRef<number>(0);

  return useCallback(() => {
    const now = Date.now();
    if (now - lastClick.current > delay) {
      lastClick.current = now;
      callback();
    }
  }, [callback, delay]);
};
