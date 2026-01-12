import { WifiOff, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

interface NoInternetOverlayProps {
  onRetry?: () => void;
}

const NoInternetOverlay = ({ onRetry }: NoInternetOverlayProps) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    
    // Check if we're actually online
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      await fetch('https://www.google.com/generate_204', {
        mode: 'no-cors',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      setIsOnline(true);
      onRetry?.();
    } catch {
      setIsOnline(false);
    } finally {
      setIsRetrying(false);
    }
  };

  // If online, don't show overlay
  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center text-center max-w-sm">
        {/* Icon */}
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
          <WifiOff className="w-12 h-12 text-muted-foreground" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground mb-2">
          No Internet Connection
        </h1>

        {/* Description */}
        <p className="text-muted-foreground mb-8">
          Please check your internet connection and try again
        </p>

        {/* Retry Button */}
        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Checking...' : 'Try Again'}
        </button>
      </div>
    </div>
  );
};

export default NoInternetOverlay;
