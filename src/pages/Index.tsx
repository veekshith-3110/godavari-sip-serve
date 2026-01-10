import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { menuItems, MenuItem, CartItem, Category } from '@/data/mockData';
import { useSound } from '@/hooks/useSound';
import ProductCard from '@/components/ProductCard';
import CategoryTabs from '@/components/CategoryTabs';
import Cart from '@/components/Cart';
import PrintReceipt from '@/components/PrintReceipt';
import ExpenseModal from '@/components/ExpenseModal';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [tokenNumber, setTokenNumber] = useState(45);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const { playBeep, playSuccess } = useSound();
  const { toast } = useToast();

  const filteredItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  const handleAddToCart = (item: MenuItem) => {
    playBeep();
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

  const handlePrint = () => {
    if (cart.length === 0) return;
    
    playSuccess();
    
    // Trigger print
    const printContent = printRef.current;
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Token #${tokenNumber}</title>
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
                <div class="token-number">#${tokenNumber}</div>
              </div>
              <div class="divider">--------------------------------</div>
              <div class="items">
                ${cart.map(item => `<div class="item"><span>${item.name}</span><span>x${item.quantity}</span></div>`).join('')}
              </div>
              <div class="divider">--------------------------------</div>
              <div class="total">Total: ₹${cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}</div>
              <div class="footer">Thank You! Visit Again.</div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
    }

    toast({
      title: `Token #${tokenNumber} Printed`,
      description: `₹${cart.reduce((sum, item) => sum + item.price * item.quantity, 0)} - ${cart.length} items`,
    });

    setTokenNumber(prev => prev + 1);
    setCart([]);
  };

  const handleExpenseSubmit = (description: string, amount: number) => {
    toast({
      title: 'Expense Recorded',
      description: `${description}: ₹${amount}`,
    });
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between shadow-lg">
        <h1 className="text-2xl font-extrabold tracking-tight">GODAVARI CAFE</h1>
        <Link
          to="/admin"
          className="p-2 rounded-lg hover:bg-primary-foreground/10 transition-colors"
        >
          <Settings className="w-6 h-6" />
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-60px)]">
        {/* Left Side - Product Grid (75%) */}
        <div className="w-3/4 p-4 overflow-hidden flex flex-col">
          {/* Category Tabs */}
          <div className="mb-4">
            <CategoryTabs
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredItems.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  onAdd={handleAddToCart}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Cart (25%) */}
        <div className="w-1/4 min-w-[280px] p-4 pl-0">
          <Cart
            items={cart}
            onRemove={handleRemoveFromCart}
            onClear={handleClearCart}
            onPrint={handlePrint}
            onExpense={() => setIsExpenseModalOpen(true)}
          />
        </div>
      </div>

      {/* Hidden Print Receipt */}
      <PrintReceipt
        ref={printRef}
        items={cart}
        tokenNumber={tokenNumber}
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
