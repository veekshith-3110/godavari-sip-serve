import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings, ShoppingCart, X, Loader2, LogOut, WifiOff } from 'lucide-react';
import { useMenu, MenuItem } from '@/context/MenuContext';
import { useOrders, CartItem } from '@/hooks/useOrders';
import { useExpenses } from '@/hooks/useExpenses';
import { useAuth } from '@/hooks/useAuth';
import { usePrinter } from '@/hooks/usePrinter';
import ProductCard from '@/components/ProductCard';
import CategoryTabs from '@/components/CategoryTabs';
import Cart from '@/components/Cart';
import PrintReceipt from '@/components/PrintReceipt';
import ExpenseModal from '@/components/ExpenseModal';
import { useToast } from '@/hooks/use-toast';

type Category = 'hot' | 'snacks' | 'cold' | 'smoke';

const Index = () => {
  const { menuItems, loading: menuLoading, isOffline } = useMenu();
  const { nextTokenNumber, createOrder } = useOrders();
  const { addExpense } = useExpenses();
  const { signOut } = useAuth();
  const { printReceipt, isConnected, isNative, restoreConnection } = usePrinter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Restore printer connection on mount
  useEffect(() => {
    restoreConnection();
  }, [restoreConnection]);

  const filteredItems = activeCategory === 'all' 
    ? menuItems.filter(item => item.available)
    : menuItems.filter(item => item.category === activeCategory && item.available);

  const handleAddToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handlePrint = async () => {
    if (cart.length === 0 || isPrinting) return;
    
    setIsPrinting(true);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    // Save order to database
    const order = await createOrder(cart, total);
    
    if (order) {
      // Use the printer hook - prints silently if connected via Bluetooth (native app)
      // Falls back to browser print dialog if not connected or on web
      await printReceipt(
        cart.map(item => ({ name: item.name, price: item.price, quantity: item.quantity })),
        total,
        order.tokenNumber,
        'GODAVARI CAFE'
      );

      toast({
        title: `Token #${order.tokenNumber} Printed`,
        description: `₹${total} - ${cart.length} items`,
      });

      setCart([]);
      setIsCartOpen(false);
    }
    
    setIsPrinting(false);
  };

  const handleExpenseSubmit = async (description: string, amount: number) => {
    await addExpense(description, amount);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (menuLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="bg-primary text-primary-foreground px-4 py-3 md:px-6 md:py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <h1 className="text-base md:text-lg font-bold tracking-wide">GODAVARI CAFE</h1>
          {isOffline && (
            <span className="flex items-center gap-1 text-xs bg-yellow-500/20 text-yellow-200 px-2 py-0.5 rounded-full">
              <WifiOff className="w-3 h-3" />
              Offline
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          {/* Mobile Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="lg:hidden relative p-2.5 rounded-full hover:bg-white/10 transition-all"
          >
            <ShoppingCart className="w-5 h-5" strokeWidth={2} />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-white text-primary text-xs font-bold rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
          <Link
            to="/admin"
            className="p-2.5 rounded-full hover:bg-white/10 transition-all"
          >
            <Settings className="w-5 h-5" strokeWidth={2} />
          </Link>
          <button
            onClick={signOut}
            className="p-2.5 rounded-full hover:bg-white/10 transition-all"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-52px)] md:h-[calc(100vh-60px)]">
        {/* Left Side - Product Grid */}
        <div className="flex-1 p-3 md:p-4 lg:p-5 overflow-hidden flex flex-col">
          {/* Category Tabs */}
          <div className="mb-3 md:mb-4">
            <CategoryTabs
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto pb-24 lg:pb-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3">
              {filteredItems.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  onAdd={handleAddToCart}
                />
              ))}
            </div>
            {filteredItems.length === 0 && (
              <div className="flex items-center justify-center h-40">
                <p className="text-muted-foreground text-sm">No items available</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Cart (Desktop/Tablet landscape) */}
        <div className="hidden lg:flex w-[300px] xl:w-[340px] p-4 pl-0">
          <Cart
            items={cart}
            onRemove={handleRemoveFromCart}
            onClear={handleClearCart}
            onPrint={handlePrint}
            onExpense={() => setIsExpenseModalOpen(true)}
          />
        </div>
      </div>

      {/* Mobile/Tablet Floating Cart Button */}
      {itemCount > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="lg:hidden fixed bottom-4 left-3 right-3 md:left-4 md:right-4 bg-primary text-primary-foreground py-4 px-5 rounded-2xl shadow-xl flex items-center justify-between z-30"
        >
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5" />
            <span className="font-semibold">{itemCount} items</span>
          </div>
          <span className="text-lg font-bold">₹{total}</span>
        </button>
      )}

      {/* Mobile Cart Overlay */}
      {isCartOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* Mobile Cart Slide-up Panel */}
      <div className={`lg:hidden fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out ${
        isCartOpen ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="bg-card rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col">
          {/* Handle bar */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">Current Order</h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full bg-secondary text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Cart Content */}
          <div className="flex-1 overflow-hidden">
            <Cart
              items={cart}
              onRemove={handleRemoveFromCart}
              onClear={handleClearCart}
              onPrint={handlePrint}
              onExpense={() => {
                setIsCartOpen(false);
                setIsExpenseModalOpen(true);
              }}
              isMobile
            />
          </div>
        </div>
      </div>

      {/* Hidden Print Receipt */}
      <PrintReceipt
        ref={printRef}
        items={cart}
        tokenNumber={nextTokenNumber}
        total={total}
      />

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSubmit={handleExpenseSubmit}
      />
    </div>
  );
};

export default Index;
