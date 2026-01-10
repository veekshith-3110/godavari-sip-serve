import { getTodayStats, getHourlyData } from '@/data/mockData';
import { Coffee, Wallet, TrendingUp, MinusCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardWidgets = () => {
  const stats = getTodayStats();
  const hourlyData = getHourlyData();

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Chai Counter */}
        <div className="stat-card bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Chais Sold Today</p>
              <p className="text-4xl font-extrabold text-primary mt-2">{stats.totalChais}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl">
              <Coffee className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        {/* Total Sales */}
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
              <p className="text-4xl font-extrabold text-foreground mt-2">₹{stats.totalSales}</p>
            </div>
            <div className="p-3 bg-success/10 rounded-xl">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>

        {/* Expenses */}
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Expenses</p>
              <p className="text-4xl font-extrabold text-destructive mt-2">₹{stats.totalExpenses}</p>
            </div>
            <div className="p-3 bg-destructive/10 rounded-xl">
              <MinusCircle className="w-6 h-6 text-destructive" />
            </div>
          </div>
        </div>

        {/* Cash in Drawer */}
        <div className="stat-card bg-gradient-to-br from-success/10 to-success/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cash in Drawer</p>
              <p className="text-4xl font-extrabold text-success mt-2">₹{stats.cashInDrawer}</p>
            </div>
            <div className="p-3 bg-success/10 rounded-xl">
              <Wallet className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Rush Chart */}
      <div className="stat-card">
        <h3 className="text-lg font-bold text-foreground mb-4">Hourly Rush</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData}>
              <XAxis 
                dataKey="hour" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
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
