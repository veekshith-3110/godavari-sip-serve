import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BarChart3, UtensilsCrossed, Receipt, ArrowLeft, Menu, X, Printer, Coffee } from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: BarChart3, label: 'Sales Reports', path: '/admin/sales' },
  { icon: UtensilsCrossed, label: 'Menu Manager', path: '/admin/menu' },
  { icon: Receipt, label: 'Expense Log', path: '/admin/expenses' },
  { icon: Printer, label: 'Printer Settings', path: '/admin/printer' },
];

const AdminSidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Header - with safe area padding */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary to-primary/90 p-4 flex items-center justify-between pt-[max(1rem,var(--safe-area-top))] shadow-lg shadow-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
            <Coffee className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-primary-foreground">Godavari Cafe</h1>
            <p className="text-[10px] text-white/70 font-medium -mt-0.5">Admin Panel</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all backdrop-blur-sm text-primary-foreground"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar w-64 flex flex-col fixed lg:relative h-full z-50 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Header - Hidden on mobile (shown in top bar) */}
        <div className="p-6 border-b border-sidebar-border hidden lg:block">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary/20 flex items-center justify-center">
              <Coffee className="w-6 h-6 text-sidebar-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">Godavari Cafe</h1>
              <p className="text-xs text-sidebar-foreground/60">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Spacer for mobile */}
        <div className="h-20 lg:hidden" />

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/25'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Back to POS */}
        <div className="p-4 border-t border-sidebar-border">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to POS</span>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
