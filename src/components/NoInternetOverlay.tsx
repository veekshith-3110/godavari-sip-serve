import { WifiOff, RefreshCw, Wifi } from 'lucide-react';
import { useState, useEffect } from 'react';

const NoInternetOverlay = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      // Show "Reconnecting..." briefly before resuming
      setIsReconnecting(true);
      
      // Wait a moment then refresh and hide overlay
      setTimeout(() => {
        setIsOnline(true);
        setIsReconnecting(false);
        // Reload the page data by triggering a re-render
        window.dispatchEvent(new CustomEvent('app-reconnected'));
      }, 1500);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsReconnecting(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      await fetch('https://www.google.com/generate_204', {
        mode: 'no-cors',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Show reconnecting state
      setIsReconnecting(true);
      setIsRetrying(false);
      
      setTimeout(() => {
        setIsOnline(true);
        setIsReconnecting(false);
        window.dispatchEvent(new CustomEvent('app-reconnected'));
      }, 1500);
    } catch {
      setIsOnline(false);
      setIsRetrying(false);
    }
  };

  // If online and not reconnecting, don't show overlay
  if (isOnline && !isReconnecting) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center text-center max-w-sm">
        {/* Icon */}
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
          isReconnecting ? 'bg-success/20' : 'bg-muted'
        }`}>
          {isReconnecting ? (
            <Wifi className="w-12 h-12 text-success animate-pulse" />
          ) : (
            <WifiOff className="w-12 h-12 text-muted-foreground" />
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {isReconnecting ? 'Reconnecting...' : 'No Internet Connection'}
        </h1>

        {/* Description */}
        <p className="text-muted-foreground mb-8">
          {isReconnecting 
            ? 'Please wait while we restore your session'
            : 'Please check your internet connection and try again'
          }
        </p>

        {/* Retry Button - only show when not reconnecting */}
        {!isReconnecting && (
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Checking...' : 'Try Again'}
          </button>
        )}

        {/* Loading spinner when reconnecting */}
        {isReconnecting && (
          <div className="flex items-center gap-2 text-success">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="font-medium">Resuming...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoInternetOverlay;
