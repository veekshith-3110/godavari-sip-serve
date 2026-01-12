import { Coffee, ShoppingBag, FileText, Receipt, Package } from 'lucide-react';

interface EmptyStateProps {
  type: 'orders' | 'cart' | 'menu' | 'expenses' | 'items';
  title?: string;
  description?: string;
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
};

const EmptyState = ({ type, title, description }: EmptyStateProps) => {
  const config = emptyStateConfig[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">
        {title || config.title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        {description || config.description}
      </p>
    </div>
  );
};

export default EmptyState;
