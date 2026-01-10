import { getTodayStats, getHourlyData } from '@/data/mockData';
import { Coffee, Wallet, TrendingUp, MinusCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardWidgets = () => {
  const stats = getTodayStats();
  const hourlyData = getHourlyData();

  return (
    <div className="space-y-4 lg:space-y-6">
      <h2 className="text-xl lg:text-2xl font-bold text-foreground">Dashboard</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {/* Chai Counter */}
        <div className="stat-card p-3 lg:p-4 bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-muted-foreground">Chais Today</p>
              <p className="text-2xl lg:text-4xl font-extrabold text-primary mt-1 lg:mt-2">{stats.totalChais}</p>
            </div>
            <div className="p-2 lg:p-3 bg-primary/10 rounded-lg lg:rounded-xl">
              <Coffee className="w-4 h-4 lg:w-6 lg:h-6 text-primary" />
            </div>
          </div>
        </div>

        {/* Total Sales */}
        <div className="stat-card p-3 lg:p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-muted-foreground">Total Sales</p>
              <p className="text-2xl lg:text-4xl font-extrabold text-foreground mt-1 lg:mt-2">₹{stats.totalSales}</p>
            </div>
            <div className="p-2 lg:p-3 bg-success/10 rounded-lg lg:rounded-xl">
              <TrendingUp className="w-4 h-4 lg:w-6 lg:h-6 text-success" />
            </div>
          </div>
        </div>

        {/* Expenses */}
        <div className="stat-card p-3 lg:p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-muted-foreground">Expenses</p>
              <p className="text-2xl lg:text-4xl font-extrabold text-destructive mt-1 lg:mt-2">₹{stats.totalExpenses}</p>
            </div>
            <div className="p-2 lg:p-3 bg-destructive/10 rounded-lg lg:rounded-xl">
              <MinusCircle className="w-4 h-4 lg:w-6 lg:h-6 text-destructive" />
            </div>
          </div>
        </div>

        {/* Cash in Drawer */}
        <div className="stat-card p-3 lg:p-4 bg-gradient-to-br from-success/10 to-success/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-muted-foreground">Cash in Drawer</p>
              <p className="text-2xl lg:text-4xl font-extrabold text-success mt-1 lg:mt-2">₹{stats.cashInDrawer}</p>
            </div>
            <div className="p-2 lg:p-3 bg-success/10 rounded-lg lg:rounded-xl">
              <Wallet className="w-4 h-4 lg:w-6 lg:h-6 text-success" />
            </div>
          </div>
        </div>
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
