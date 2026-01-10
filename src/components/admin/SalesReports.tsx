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
    <div className="space-y-4 lg:space-y-6">
      <h2 className="text-xl lg:text-2xl font-bold text-foreground">Sales Reports</h2>

      {/* Summary Cards - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="stat-card p-3 lg:p-4">
          <div className="flex items-center gap-2 mb-1 lg:mb-2">
            <Calendar className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
            <span className="text-xs lg:text-sm text-muted-foreground">Today</span>
          </div>
          <p className="text-xl lg:text-3xl font-bold text-foreground">₹{todaySales}</p>
          <p className="text-xs lg:text-sm text-muted-foreground">{orderCount} orders</p>
        </div>

        <div className="stat-card p-3 lg:p-4">
          <div className="flex items-center gap-2 mb-1 lg:mb-2">
            <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-success" />
            <span className="text-xs lg:text-sm text-muted-foreground">Week</span>
          </div>
          <p className="text-xl lg:text-3xl font-bold text-foreground">₹12,450</p>
          <p className="text-xs lg:text-sm text-muted-foreground">156 orders</p>
        </div>

        <div className="stat-card p-3 lg:p-4">
          <div className="flex items-center gap-2 mb-1 lg:mb-2">
            <CalendarDays className="w-4 h-4 lg:w-5 lg:h-5 text-info" />
            <span className="text-xs lg:text-sm text-muted-foreground">Month</span>
          </div>
          <p className="text-xl lg:text-3xl font-bold text-foreground">₹48,200</p>
          <p className="text-xs lg:text-sm text-muted-foreground">612 orders</p>
        </div>

        <div className="stat-card p-3 lg:p-4">
          <div className="flex items-center gap-2 mb-1 lg:mb-2">
            <CalendarRange className="w-4 h-4 lg:w-5 lg:h-5 text-warning" />
            <span className="text-xs lg:text-sm text-muted-foreground">Year</span>
          </div>
          <p className="text-xl lg:text-3xl font-bold text-foreground">₹5,84,600</p>
          <p className="text-xs lg:text-sm text-muted-foreground">7,234 orders</p>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="stat-card p-3 lg:p-4">
        <h3 className="text-base lg:text-lg font-bold text-foreground mb-3 lg:mb-4">Monthly Report (2024)</h3>
        <div className="overflow-x-auto -mx-3 lg:mx-0">
          <table className="w-full min-w-[400px]">
            <thead>
              <tr className="text-left text-xs lg:text-sm text-muted-foreground border-b border-border">
                <th className="pb-2 lg:pb-3 px-3 lg:px-0 font-medium">Month</th>
                <th className="pb-2 lg:pb-3 font-medium text-right">Orders</th>
                <th className="pb-2 lg:pb-3 font-medium text-right">Sales</th>
                <th className="pb-2 lg:pb-3 px-3 lg:px-0 font-medium text-right hidden sm:table-cell">Avg/Day</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {monthlyData.map((month) => (
                <tr key={month.name}>
                  <td className="py-2 lg:py-3 px-3 lg:px-0 font-medium text-sm lg:text-base text-foreground">{month.name.slice(0, 3)}</td>
                  <td className="py-2 lg:py-3 text-right text-sm lg:text-base text-muted-foreground">{month.orders}</td>
                  <td className="py-2 lg:py-3 text-right text-sm lg:text-base font-semibold text-foreground">₹{month.sales.toLocaleString()}</td>
                  <td className="py-2 lg:py-3 px-3 lg:px-0 text-right text-sm lg:text-base text-muted-foreground hidden sm:table-cell">₹{Math.round(month.sales / 30).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Yearly Breakdown */}
      <div className="stat-card p-3 lg:p-4">
        <h3 className="text-base lg:text-lg font-bold text-foreground mb-3 lg:mb-4">Yearly Report</h3>
        <div className="overflow-x-auto -mx-3 lg:mx-0">
          <table className="w-full min-w-[400px]">
            <thead>
              <tr className="text-left text-xs lg:text-sm text-muted-foreground border-b border-border">
                <th className="pb-2 lg:pb-3 px-3 lg:px-0 font-medium">Year</th>
                <th className="pb-2 lg:pb-3 font-medium text-right hidden sm:table-cell">Orders</th>
                <th className="pb-2 lg:pb-3 font-medium text-right">Sales</th>
                <th className="pb-2 lg:pb-3 font-medium text-right hidden md:table-cell">Avg/Month</th>
                <th className="pb-2 lg:pb-3 px-3 lg:px-0 font-medium text-right">Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {yearlyData.map((year) => (
                <tr key={year.year}>
                  <td className="py-2 lg:py-3 px-3 lg:px-0 font-medium text-sm lg:text-base text-foreground">{year.year}</td>
                  <td className="py-2 lg:py-3 text-right text-sm lg:text-base text-muted-foreground hidden sm:table-cell">{year.orders.toLocaleString()}</td>
                  <td className="py-2 lg:py-3 text-right text-sm lg:text-base font-semibold text-foreground">₹{year.sales.toLocaleString()}</td>
                  <td className="py-2 lg:py-3 text-right text-sm lg:text-base text-muted-foreground hidden md:table-cell">₹{Math.round(year.sales / 12).toLocaleString()}</td>
                  <td className={`py-2 lg:py-3 px-3 lg:px-0 text-right text-sm lg:text-base font-medium ${year.growth >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {year.growth >= 0 ? '+' : ''}{year.growth}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="stat-card p-3 lg:p-4">
        <h3 className="text-base lg:text-lg font-bold text-foreground mb-3 lg:mb-4">Recent Orders</h3>
        <div className="overflow-x-auto -mx-3 lg:mx-0">
          <table className="w-full min-w-[350px]">
            <thead>
              <tr className="text-left text-xs lg:text-sm text-muted-foreground border-b border-border">
                <th className="pb-2 lg:pb-3 px-3 lg:px-0 font-medium">Token</th>
                <th className="pb-2 lg:pb-3 font-medium">Items</th>
                <th className="pb-2 lg:pb-3 font-medium text-right">Total</th>
                <th className="pb-2 lg:pb-3 px-3 lg:px-0 font-medium text-right hidden sm:table-cell">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockOrders.map((order) => (
                <tr key={order.id}>
                  <td className="py-2 lg:py-3 px-3 lg:px-0">
                    <span className="font-bold text-sm lg:text-base text-primary">#{order.tokenNumber}</span>
                  </td>
                  <td className="py-2 lg:py-3 text-sm lg:text-base text-foreground max-w-[150px] lg:max-w-none truncate">
                    {order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}
                  </td>
                  <td className="py-2 lg:py-3 text-right text-sm lg:text-base font-semibold text-foreground">₹{order.total}</td>
                  <td className="py-2 lg:py-3 px-3 lg:px-0 text-right text-sm lg:text-base text-muted-foreground hidden sm:table-cell">
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
