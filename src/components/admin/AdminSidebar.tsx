import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BarChart3, UtensilsCrossed, Receipt, ArrowLeft, Menu, X, Printer } from 'lucide-react';
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
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar p-4 flex items-center justify-between border-b border-sidebar-border">
        <h1 className="text-lg font-bold text-sidebar-foreground">GODAVARI CAFE</h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-sidebar-accent text-sidebar-foreground"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar w-64 flex flex-col fixed lg:relative h-full z-50 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Header - Hidden on mobile (shown in top bar) */}
        <div className="p-6 border-b border-sidebar-border hidden lg:block">
          <h1 className="text-xl font-bold text-sidebar-foreground">GODAVARI CAFE</h1>
          <p className="text-sm text-sidebar-foreground/60">Admin Panel</p>
        </div>

        {/* Spacer for mobile */}
        <div className="h-16 lg:hidden" />

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
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
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
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
