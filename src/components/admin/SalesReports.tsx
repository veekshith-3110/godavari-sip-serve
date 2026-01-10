import { mockOrders } from '@/data/mockData';
import { Calendar, TrendingUp } from 'lucide-react';

const SalesReports = () => {
  const todaySales = mockOrders.reduce((sum, order) => sum + order.total, 0);
  const orderCount = mockOrders.length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Sales Reports</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Today</span>
          </div>
          <p className="text-3xl font-bold text-foreground">₹{todaySales}</p>
          <p className="text-sm text-muted-foreground">{orderCount} orders</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-success" />
            <span className="text-sm text-muted-foreground">This Week</span>
          </div>
          <p className="text-3xl font-bold text-foreground">₹12,450</p>
          <p className="text-sm text-muted-foreground">156 orders</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-info" />
            <span className="text-sm text-muted-foreground">This Month</span>
          </div>
          <p className="text-3xl font-bold text-foreground">₹48,200</p>
          <p className="text-sm text-muted-foreground">612 orders</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="stat-card">
        <h3 className="text-lg font-bold text-foreground mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-muted-foreground border-b border-border">
                <th className="pb-3 font-medium">Token</th>
                <th className="pb-3 font-medium">Items</th>
                <th className="pb-3 font-medium">Total</th>
                <th className="pb-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockOrders.map((order) => (
                <tr key={order.id}>
                  <td className="py-3">
                    <span className="font-bold text-primary">#{order.tokenNumber}</span>
                  </td>
                  <td className="py-3 text-foreground">
                    {order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}
                  </td>
                  <td className="py-3 font-semibold text-foreground">₹{order.total}</td>
                  <td className="py-3 text-muted-foreground">
                    {order.timestamp.toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesReports;
