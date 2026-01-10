import { CartItem } from '@/data/mockData';
import { Trash2, Printer, Banknote } from 'lucide-react';

interface CartProps {
  items: CartItem[];
  onRemove: (itemId: string) => void;
  onClear: () => void;
  onPrint: () => void;
  onExpense: () => void;
  isMobile?: boolean;
}

const Cart = ({ items, onRemove, onClear, onPrint, onExpense, isMobile = false }: CartProps) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (isMobile) {
    return (
      <div className="flex flex-col h-full max-h-[70vh]">
        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p className="text-lg">No items yet</p>
              <p className="text-sm">Tap products to add</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    ₹{item.price} × {item.quantity}
                  </p>
                </div>
                <span className="font-bold text-foreground text-lg">₹{item.price * item.quantity}</span>
                <button
                  onClick={() => onRemove(item.id)}
                  className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Checkout Section */}
        <div className="p-4 border-t border-border bg-muted/30 space-y-3">
          {/* Quick Expense Button */}
          <button onClick={onExpense} className="btn-expense flex items-center justify-center gap-2">
            <Banknote className="w-5 h-5" />
            Cash Out
          </button>

          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-foreground">Total</span>
            <span className="text-3xl font-extrabold text-primary">₹{total}</span>
          </div>

          {/* Print Button */}
          <button
            onClick={onPrint}
            disabled={items.length === 0}
            className="btn-print flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="w-7 h-7" />
            PRINT TOKEN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl shadow-lg border border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-bold text-foreground">Current Order</h2>
        {itemCount > 0 && (
          <p className="text-sm text-muted-foreground">{itemCount} items</p>
        )}
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p className="text-lg">No items yet</p>
            <p className="text-sm">Tap products to add</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  ₹{item.price} × {item.quantity}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-foreground">₹{item.price * item.quantity}</span>
                <button
                  onClick={() => onRemove(item.id)}
                  className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Expense Button */}
      <div className="px-4 pb-2">
        <button onClick={onExpense} className="btn-expense flex items-center justify-center gap-2">
          <Banknote className="w-5 h-5" />
          Cash Out
        </button>
      </div>

      {/* Checkout Section */}
      <div className="p-4 border-t border-border bg-muted/30">
        {/* Total */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold text-foreground">Total</span>
          <span className="text-4xl font-extrabold text-primary">₹{total}</span>
        </div>

        {/* Print Button */}
        <button
          onClick={onPrint}
          disabled={items.length === 0}
          className="btn-print flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Printer className="w-8 h-8" />
          PRINT TOKEN
        </button>
      </div>
    </div>
  );
};

export default Cart;