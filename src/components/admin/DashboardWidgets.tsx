import { getTodayStats, getHourlyData, mockOrders } from '@/data/mockData';
import { Wallet, TrendingUp, MinusCircle, Package } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardWidgets = () => {
  const stats = getTodayStats();
  const hourlyData = getHourlyData();

  // Calculate items sold today from orders
  const itemsSoldToday = mockOrders.reduce((acc, order) => {
    order.items.forEach(item => {
      if (acc[item.id]) {
        acc[item.id].quantity += item.quantity;
        acc[item.id].revenue += item.price * item.quantity;
      } else {
        acc[item.id] = {
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          revenue: item.price * item.quantity,
          price: item.price,
          category: item.category,
        };
      }
    });
    return acc;
  }, {} as Record<string, { id: string; name: string; quantity: number; revenue: number; price: number; category: string }>);

  const itemsSoldArray = Object.values(itemsSoldToday).sort((a, b) => b.quantity - a.quantity);

  return (
    <div className="space-y-4 lg:space-y-6">
      <h2 className="text-xl lg:text-2xl font-bold text-foreground">Dashboard</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 lg:gap-4">
        {/* Total Sales */}
        <div className="stat-card p-2 lg:p-4 bg-gradient-to-br from-success/10 to-success/5 overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-1">
            <div className="min-w-0">
              <p className="text-[10px] lg:text-sm font-medium text-muted-foreground truncate">Total Sales</p>
              <p className="text-lg lg:text-4xl font-extrabold text-foreground mt-0.5 lg:mt-2">₹{stats.totalSales}</p>
            </div>
            <div className="hidden lg:flex p-2 lg:p-3 bg-success/10 rounded-lg lg:rounded-xl flex-shrink-0">
              <TrendingUp className="w-4 h-4 lg:w-6 lg:h-6 text-success" />
            </div>
          </div>
        </div>

        {/* Expenses */}
        <div className="stat-card p-2 lg:p-4 overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-1">
            <div className="min-w-0">
              <p className="text-[10px] lg:text-sm font-medium text-muted-foreground truncate">Expenses</p>
              <p className="text-lg lg:text-4xl font-extrabold text-destructive mt-0.5 lg:mt-2">₹{stats.totalExpenses}</p>
            </div>
            <div className="hidden lg:flex p-2 lg:p-3 bg-destructive/10 rounded-lg lg:rounded-xl flex-shrink-0">
              <MinusCircle className="w-4 h-4 lg:w-6 lg:h-6 text-destructive" />
            </div>
          </div>
        </div>

        {/* Cash in Drawer */}
        <div className="stat-card p-2 lg:p-4 bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-1">
            <div className="min-w-0">
              <p className="text-[10px] lg:text-sm font-medium text-muted-foreground truncate">Cash in Drawer</p>
              <p className="text-lg lg:text-4xl font-extrabold text-success mt-0.5 lg:mt-2">₹{stats.cashInDrawer}</p>
            </div>
            <div className="hidden lg:flex p-2 lg:p-3 bg-success/10 rounded-lg lg:rounded-xl flex-shrink-0">
              <Wallet className="w-4 h-4 lg:w-6 lg:h-6 text-success" />
            </div>
          </div>
        </div>
      </div>

      {/* Items Sold Today */}
      <div className="stat-card p-3 lg:p-4">
        <div className="flex items-center gap-2 mb-3 lg:mb-4">
          <Package className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
          <h3 className="text-base lg:text-lg font-bold text-foreground">Items Sold Today</h3>
        </div>
        
        {itemsSoldArray.length > 0 ? (
          <div className="space-y-2">
            {itemsSoldArray.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="w-6 h-6 flex items-center justify-center bg-primary/10 text-primary text-xs font-bold rounded-full flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm lg:text-base text-foreground truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{item.category} • ₹{item.price} each</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="text-lg lg:text-xl font-extrabold text-primary">×{item.quantity}</p>
                  <p className="text-xs lg:text-sm text-muted-foreground">₹{item.revenue}</p>
                </div>
              </div>
            ))}
            
            {/* Summary */}
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-xl mt-3">
              <span className="font-semibold text-sm lg:text-base text-foreground">Total Items Sold</span>
              <div className="text-right">
                <span className="text-lg lg:text-xl font-extrabold text-primary">
                  {itemsSoldArray.reduce((sum, item) => sum + item.quantity, 0)} items
                </span>
                <p className="text-xs lg:text-sm text-muted-foreground">
                  ₹{itemsSoldArray.reduce((sum, item) => sum + item.revenue, 0)} revenue
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8 text-sm lg:text-base">No items sold yet today</p>
        )}
      </div>

      {/* Hourly Rush Chart */}
      <div className="stat-card p-3 lg:p-4">
        <h3 className="text-base lg:text-lg font-bold text-foreground mb-3 lg:mb-4">Hourly Rush</h3>
        <div className="h-[200px] lg:h-[300px] -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData}>
              <XAxis 
                dataKey="hour" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                tickFormatter={(value) => `₹${value}`}
                width={45}
              />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`₹${value}`, 'Sales']}
              />
              <Bar 
                dataKey="sales" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardWidgets;
