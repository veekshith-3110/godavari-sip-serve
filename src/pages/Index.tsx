import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Settings, ShoppingCart, X, Loader2 } from 'lucide-react';
import { useMenu, MenuItem } from '@/context/MenuContext';
import { useOrders, CartItem } from '@/hooks/useOrders';
import { useExpenses } from '@/hooks/useExpenses';
import ProductCard from '@/components/ProductCard';
import CategoryTabs from '@/components/CategoryTabs';
import Cart from '@/components/Cart';
import PrintReceipt from '@/components/PrintReceipt';
import ExpenseModal from '@/components/ExpenseModal';
import { useToast } from '@/hooks/use-toast';

type Category = 'hot' | 'snacks' | 'cold' | 'smoke';

const Index = () => {
  const { menuItems, loading: menuLoading } = useMenu();
  const { nextTokenNumber, createOrder } = useOrders();
  const { addExpense } = useExpenses();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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
      // Trigger print
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Token #${order.tokenNumber}</title>
              <style>
                @page { size: 58mm auto; margin: 0; }
                body { 
                  font-family: 'Courier New', monospace; 
                  font-size: 12px; 
                  padding: 8px;
                  margin: 0;
                }
                .header { text-align: center; }
                .title { font-size: 16px; font-weight: bold; }
                .date { font-size: 10px; margin-top: 4px; }
                .divider { text-align: center; margin: 8px 0; }
                .token { text-align: center; margin: 16px 0; }
                .token-label { font-size: 10px; }
                .token-number { font-size: 32px; font-weight: 800; }
                .items { margin: 8px 0; }
                .item { display: flex; justify-content: space-between; }
                .total { text-align: center; font-weight: bold; font-size: 14px; }
                .footer { text-align: center; margin-top: 16px; font-size: 10px; }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="title">GODAVARI CAFE</div>
                <div class="date">${new Date().toLocaleDateString('en-IN')} | ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              <div class="divider">--------------------------------</div>
              <div class="token">
                <div class="token-label">TOKEN</div>
                <div class="token-number">#${order.tokenNumber}</div>
              </div>
              <div class="divider">--------------------------------</div>
              <div class="items">
                ${cart.map(item => `<div class="item"><span>${item.name}</span><span>x${item.quantity}</span></div>`).join('')}
              </div>
              <div class="divider">--------------------------------</div>
              <div class="total">Total: ₹${total}</div>
              <div class="footer">Thank You! Visit Again.</div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }

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
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="bg-primary text-primary-foreground px-5 py-4 flex items-center justify-between shadow-md sticky top-0 z-40">
        <h1 className="text-lg md:text-xl font-bold tracking-wide uppercase">GODAVARI CAFE</h1>
        <div className="flex items-center gap-3">
          {/* Mobile Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="lg:hidden relative p-2.5 rounded-xl hover:bg-white/10 transition-all duration-200"
          >
            <ShoppingCart className="w-5 h-5" strokeWidth={2} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-primary text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                {itemCount}
              </span>
            )}
          </button>
          <Link
            to="/admin"
            className="p-2.5 rounded-xl hover:bg-white/10 transition-all duration-200"
          >
            <Settings className="w-5 h-5" strokeWidth={2} />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-60px)]">
        {/* Left Side - Product Grid */}
        <div className="flex-1 lg:w-3/4 p-3 md:p-4 overflow-hidden flex flex-col">
          {/* Category Tabs */}
          <div className="mb-3 md:mb-4">
            <CategoryTabs
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3">
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
                <p className="text-muted-foreground">No items available in this category</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Cart (Desktop only) */}
        <div className="hidden lg:block w-[320px] p-4 pl-0">
          <Cart
            items={cart}
            onRemove={handleRemoveFromCart}
            onClear={handleClearCart}
            onPrint={handlePrint}
            onExpense={() => setIsExpenseModalOpen(true)}
          />
        </div>
      </div>

      {/* Mobile Floating Cart Button */}
      {itemCount > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="lg:hidden fixed bottom-4 left-4 right-4 bg-primary text-primary-foreground py-4 px-6 rounded-2xl shadow-2xl flex items-center justify-between z-30"
        >
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6" />
            <span className="font-bold">{itemCount} items</span>
          </div>
          <span className="text-xl font-extrabold">₹{total}</span>
        </button>
      )}

      {/* Mobile Cart Overlay */}
      {isCartOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* Mobile Cart Slide-up Panel */}
      <div className={`lg:hidden fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ${
        isCartOpen ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="bg-card rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col">
          {/* Handle bar */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Current Order</h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-lg bg-muted text-muted-foreground"
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
