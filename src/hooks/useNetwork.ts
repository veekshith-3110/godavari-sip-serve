import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface NetworkState {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: string | null;
}

export const useNetwork = () => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isOnline: navigator.onLine,
    isSlowConnection: false,
    connectionType: null,
  });
  const { toast } = useToast();

  useEffect(() => {
    const updateNetworkInfo = () => {
      const connection = (navigator as any).connection || 
                         (navigator as any).mozConnection || 
                         (navigator as any).webkitConnection;

      const isSlowConnection = connection?.effectiveType === '2g' || 
                               connection?.effectiveType === 'slow-2g' ||
                               connection?.downlink < 1;

      setNetworkState({
        isOnline: navigator.onLine,
        isSlowConnection: isSlowConnection || false,
        connectionType: connection?.effectiveType || null,
      });
    };

    const handleOnline = () => {
      setNetworkState(prev => ({ ...prev, isOnline: true }));
      toast({
        title: 'Back Online',
        description: 'Orders will now sync automatically',
      });
    };

    const handleOffline = () => {
      setNetworkState(prev => ({ ...prev, isOnline: false }));
      toast({
        title: 'Offline Mode',
        description: 'Orders will be saved locally and synced when online',
        variant: 'destructive',
      });
    };

    // Initial check
    updateNetworkInfo();

    // Listen for changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, [toast]);

  return networkState;
};

// Fetch with timeout and retry logic
export const fetchWithTimeout = async <T>(
  fetchFn: () => Promise<T>,
  options: {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    onRetry?: (attempt: number) => void;
  } = {}
): Promise<T> => {
  const { timeout = 15000, retries = 3, retryDelay = 1000, onRetry } = options;

  const executeWithTimeout = async (): Promise<T> => {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Request timeout. Please check your connection and try again.'));
      }, timeout);

      fetchFn()
        .then(result => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  };

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await executeWithTimeout();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < retries) {
        onRetry?.(attempt);
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }
  }

  throw lastError;
};
