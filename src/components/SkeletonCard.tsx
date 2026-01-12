import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonCardProps {
  type?: 'product' | 'cart-item' | 'menu-item';
}

const SkeletonCard = ({ type = 'product' }: SkeletonCardProps) => {
  if (type === 'product') {
    return (
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Skeleton className="aspect-square w-full" />
        <div className="p-2 md:p-3 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
        </div>
      </div>
    );
  }

  if (type === 'cart-item') {
    return (
      <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl animate-pulse">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    );
  }

  if (type === 'menu-item') {
    return (
      <div className="bg-card rounded-xl overflow-hidden border border-border">
        <Skeleton className="h-24 lg:h-32 w-full" />
        <div className="p-3 lg:p-4 space-y-2">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-1/4" />
            </div>
            <div className="flex gap-1">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-10 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SkeletonCard;
