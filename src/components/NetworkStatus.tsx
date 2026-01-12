import { WifiOff, CloudOff, Loader2, RefreshCw } from 'lucide-react';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { useNetwork } from '@/hooks/useNetwork';

const NetworkStatus = () => {
  const { isOnline, isSlowConnection } = useNetwork();
  const { pendingCount, isSyncing, syncQueue } = useOfflineQueue();

  if (isOnline && pendingCount === 0 && !isSlowConnection) {
    return null;
  }

  return (
    <div className="fixed top-14 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-lg mx-auto px-3">
        {/* Offline Banner */}
        {!isOnline && (
          <div className="bg-yellow-500 text-yellow-950 px-4 py-2 rounded-b-xl flex items-center justify-center gap-2 text-sm font-medium shadow-lg pointer-events-auto">
            <WifiOff className="w-4 h-4" />
            <span>Offline Mode</span>
            {pendingCount > 0 && (
              <span className="bg-yellow-600/30 px-2 py-0.5 rounded-full text-xs">
                {pendingCount} order{pendingCount > 1 ? 's' : ''} pending
              </span>
            )}
          </div>
        )}

        {/* Slow Connection Banner */}
        {isOnline && isSlowConnection && (
          <div className="bg-orange-500 text-orange-950 px-4 py-2 rounded-b-xl flex items-center justify-center gap-2 text-sm font-medium shadow-lg pointer-events-auto">
            <CloudOff className="w-4 h-4" />
            <span>Slow Connection</span>
          </div>
        )}

        {/* Syncing Banner */}
        {isOnline && isSyncing && (
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-b-xl flex items-center justify-center gap-2 text-sm font-medium shadow-lg pointer-events-auto">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Syncing orders...</span>
          </div>
        )}

        {/* Pending Orders Banner (when online but not syncing) */}
        {isOnline && !isSyncing && pendingCount > 0 && (
          <div className="bg-blue-500 text-white px-4 py-2 rounded-b-xl flex items-center justify-center gap-2 text-sm font-medium shadow-lg pointer-events-auto">
            <span>{pendingCount} order{pendingCount > 1 ? 's' : ''} pending</span>
            <button 
              onClick={() => syncQueue()}
              className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Sync Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkStatus;
