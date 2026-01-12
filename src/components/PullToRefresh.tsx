import { RefreshCw } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  threshold?: number;
}

const PullToRefreshIndicator = ({ 
  pullDistance, 
  isRefreshing,
  threshold = 80 
}: PullToRefreshIndicatorProps) => {
  if (pullDistance <= 0 && !isRefreshing) return null;

  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = pullDistance * 3;
  const opacity = Math.min(progress * 1.5, 1);
  const scale = 0.5 + progress * 0.5;

  return (
    <div 
      className="absolute left-1/2 -translate-x-1/2 z-10 flex items-center justify-center transition-all duration-200"
      style={{ 
        top: Math.max(pullDistance - 40, 8),
        opacity: isRefreshing ? 1 : opacity,
        transform: `translateX(-50%) scale(${isRefreshing ? 1 : scale})`,
      }}
    >
      <div className={`p-3 rounded-full bg-primary shadow-lg ${isRefreshing ? 'animate-spin' : ''}`}>
        <RefreshCw 
          className="w-5 h-5 text-primary-foreground"
          style={{ 
            transform: isRefreshing ? undefined : `rotate(${rotation}deg)`,
          }}
        />
      </div>
    </div>
  );
};

export default PullToRefreshIndicator;
