import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BarChart3, UtensilsCrossed, Receipt, ArrowLeft } from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: BarChart3, label: 'Sales Reports', path: '/admin/sales' },
  { icon: UtensilsCrossed, label: 'Menu Manager', path: '/admin/menu' },
  { icon: Receipt, label: 'Expense Log', path: '/admin/expenses' },
];

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <aside className="admin-sidebar w-64 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground">GODAVARI CAFE</h1>
        <p className="text-sm text-sidebar-foreground/60">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
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
  );
};

export default AdminSidebar;
