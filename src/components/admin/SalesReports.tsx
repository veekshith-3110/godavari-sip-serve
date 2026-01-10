import { mockOrders } from '@/data/mockData';
import { Calendar, CalendarDays, CalendarRange, TrendingUp } from 'lucide-react';

const monthlyData = [
  { name: 'January', orders: 580, sales: 45200 },
  { name: 'February', orders: 520, sales: 41800 },
  { name: 'March', orders: 610, sales: 48600 },
  { name: 'April', orders: 590, sales: 47200 },
  { name: 'May', orders: 640, sales: 51200 },
  { name: 'June', orders: 680, sales: 54400 },
  { name: 'July', orders: 720, sales: 57600 },
  { name: 'August', orders: 690, sales: 55200 },
  { name: 'September', orders: 650, sales: 52000 },
  { name: 'October', orders: 612, sales: 48200 },
  { name: 'November', orders: 0, sales: 0 },
  { name: 'December', orders: 0, sales: 0 },
];

const yearlyData = [
  { year: 2022, orders: 6200, sales: 496000, growth: 0 },
  { year: 2023, orders: 7100, sales: 568000, growth: 14.5 },
  { year: 2024, orders: 7234, sales: 584600, growth: 2.9 },
];

const SalesReports = () => {
  const todaySales = mockOrders.reduce((sum, order) => sum + order.total, 0);
  const orderCount = mockOrders.length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Sales Reports</h2>

      {/* Summary Cards - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <CalendarDays className="w-5 h-5 text-info" />
            <span className="text-sm text-muted-foreground">This Month</span>
          </div>
          <p className="text-3xl font-bold text-foreground">₹48,200</p>
          <p className="text-sm text-muted-foreground">612 orders</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <CalendarRange className="w-5 h-5 text-warning" />
            <span className="text-sm text-muted-foreground">This Year</span>
          </div>
          <p className="text-3xl font-bold text-foreground">₹5,84,600</p>
          <p className="text-sm text-muted-foreground">7,234 orders</p>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="stat-card">
        <h3 className="text-lg font-bold text-foreground mb-4">Monthly Report (2024)</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-muted-foreground border-b border-border">
                <th className="pb-3 font-medium">Month</th>
                <th className="pb-3 font-medium text-right">Orders</th>
                <th className="pb-3 font-medium text-right">Sales</th>
                <th className="pb-3 font-medium text-right">Avg/Day</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {monthlyData.map((month) => (
                <tr key={month.name}>
                  <td className="py-3 font-medium text-foreground">{month.name}</td>
                  <td className="py-3 text-right text-muted-foreground">{month.orders}</td>
                  <td className="py-3 text-right font-semibold text-foreground">₹{month.sales.toLocaleString()}</td>
                  <td className="py-3 text-right text-muted-foreground">₹{Math.round(month.sales / 30).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Yearly Breakdown */}
      <div className="stat-card">
        <h3 className="text-lg font-bold text-foreground mb-4">Yearly Report</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-muted-foreground border-b border-border">
                <th className="pb-3 font-medium">Year</th>
                <th className="pb-3 font-medium text-right">Orders</th>
                <th className="pb-3 font-medium text-right">Total Sales</th>
                <th className="pb-3 font-medium text-right">Avg/Month</th>
                <th className="pb-3 font-medium text-right">Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {yearlyData.map((year) => (
                <tr key={year.year}>
                  <td className="py-3 font-medium text-foreground">{year.year}</td>
                  <td className="py-3 text-right text-muted-foreground">{year.orders.toLocaleString()}</td>
                  <td className="py-3 text-right font-semibold text-foreground">₹{year.sales.toLocaleString()}</td>
                  <td className="py-3 text-right text-muted-foreground">₹{Math.round(year.sales / 12).toLocaleString()}</td>
                  <td className={`py-3 text-right font-medium ${year.growth >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {year.growth >= 0 ? '+' : ''}{year.growth}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
