import { Coffee, ShoppingBag, FileText, Receipt, Package, AlertCircle, WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

type EmptyStateType = 'orders' | 'cart' | 'menu' | 'expenses' | 'items' | 'no-data' | 'error' | 'offline';

interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const emptyStateConfig = {
  orders: {
    icon: Receipt,
    title: 'Ready for the first order!',
    description: 'No orders placed yet today. Start taking orders to see them here.',
  },
  cart: {
    icon: ShoppingBag,
    title: 'Cart is empty',
    description: 'Tap products to add them to the order',
  },
  menu: {
    icon: Coffee,
    title: 'No menu items',
    description: 'Add your first menu item to get started',
  },
  expenses: {
    icon: FileText,
    title: 'No expenses today',
    description: 'Record expenses as they occur',
  },
  items: {
    icon: Package,
    title: 'No items available',
    description: 'Check back later or try a different category',
  },
  'no-data': {
    icon: Package,
    title: 'No Data Available',
    description: 'There\'s nothing to show here yet',
  },
  error: {
    icon: AlertCircle,
    title: 'Something Went Wrong',
    description: 'Please try again or contact support if the problem persists',
  },
  offline: {
    icon: WifiOff,
    title: 'No Internet Connection',
    description: 'Please check your network connection and try again',
  },
};

const EmptyState = ({ type, title, description, action, className }: EmptyStateProps) => {
  const config = emptyStateConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">
        {title || config.title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        {description || config.description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          <RefreshCw className="w-4 h-4" />
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
