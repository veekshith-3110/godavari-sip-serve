import { useState } from 'react';
import { getTodayStats, getHourlyData, mockOrders, menuItems, Category } from '@/data/mockData';
import { Wallet, TrendingUp, MinusCircle, Package, Calendar as CalendarIcon, Coffee, UtensilsCrossed, Droplets, Flame } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, isSameDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Generate mock data for a specific date
const getStatsForDate = (date: Date) => {
  const isToday = isSameDay(date, new Date());
  
  if (isToday) {
    return getTodayStats();
  }
  
  const seed = date.getDate() + date.getMonth() * 31;
  const totalSales = 2500 + ((seed * 13) % 3500);
  const totalExpenses = 200 + (seed % 300);
  const totalChais = 80 + (seed % 70);
  
  return {
    totalSales,
    totalExpenses,
    cashInDrawer: totalSales - totalExpenses,
    totalChais,
  };
};

// Generate item sales for a specific date
const getItemsForDate = (date: Date) => {
  const isToday = isSameDay(date, new Date());
  
  if (isToday) {
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
    
    return Object.values(itemsSoldToday).sort((a, b) => b.quantity - a.quantity);
  }
  
  // Generate mock items for past dates
  const seed = date.getDate() + date.getMonth() * 31;
  
  return menuItems.map((item, index) => {
    const itemSeed = seed + index * 7;
    const quantity = Math.floor((itemSeed % 12) + 3);
    return {
      id: item.id,
      name: item.name,
      quantity,
      revenue: quantity * item.price,
      price: item.price,
      category: item.category,
    };
  }).sort((a, b) => b.quantity - a.quantity);
};

// Generate hourly data for a specific date
const getHourlyDataForDate = (date: Date) => {
  const isToday = isSameDay(date, new Date());
  
  if (isToday) {
    return getHourlyData();
  }
  
  const seed = date.getDate() + date.getMonth() * 31;
  const hours = ['6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM'];
  
  return hours.map((hour, index) => ({
    hour,
    sales: 100 + ((seed + index * 17) % 500),
  }));
};

const categoryConfig: Record<Category, { label: string; icon: React.ReactNode; color: string }> = {
  hot: { label: 'Hot', icon: <Coffee className="w-3.5 h-3.5" />, color: 'text-orange-500 bg-orange-500/10' },
  snacks: { label: 'Snacks', icon: <UtensilsCrossed className="w-3.5 h-3.5" />, color: 'text-yellow-600 bg-yellow-500/10' },
  cold: { label: 'Cold', icon: <Droplets className="w-3.5 h-3.5" />, color: 'text-blue-500 bg-blue-500/10' },
  smoke: { label: 'Smoke', icon: <Flame className="w-3.5 h-3.5" />, color: 'text-gray-500 bg-gray-500/10' },
};

const DashboardWidgets = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const stats = getStatsForDate(selectedDate);
  const hourlyData = getHourlyDataForDate(selectedDate);
  const itemsSoldArray = getItemsForDate(selectedDate);
  
  const isToday = isSameDay(selectedDate, new Date());
  const dateLabel = isToday ? 'Today' : format(selectedDate, 'dd MMM yyyy');

  // Calculate category totals
  const categoryTotals = itemsSoldArray.reduce((acc, item) => {
    const cat = item.category as Category;
    if (!acc[cat]) {
      acc[cat] = { quantity: 0, revenue: 0 };
    }
    acc[cat].quantity += item.quantity;
    acc[cat].revenue += item.revenue;
    return acc;
  }, {} as Record<Category, { quantity: number; revenue: number }>);

  return (
    <div className="space-y-3 lg:space-y-4">
      {/* Header with Date Picker */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg lg:text-xl font-bold text-foreground">Dashboard</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 text-xs px-2 md:px-3",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
              {isToday ? 'Today' : format(selectedDate, "dd MMM")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              disabled={(date) => date > new Date()}
              initialFocus
              className={cn("p-2 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Date Display Banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-2 text-center">
        <p className="text-xs text-muted-foreground">Showing data for</p>
        <p className="text-sm font-bold text-foreground">{format(selectedDate, 'EEEE, dd MMMM yyyy')}</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 lg:gap-3">
        {/* Total Sales */}
        <div className="stat-card p-2 lg:p-3 bg-gradient-to-br from-success/10 to-success/5 overflow-hidden">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 text-success" />
              <p className="text-[10px] lg:text-xs font-medium text-muted-foreground">Total Sales</p>
            </div>
            <p className="text-base lg:text-2xl font-extrabold text-foreground">₹{stats.totalSales.toLocaleString()}</p>
          </div>
        </div>

        {/* Expenses */}
        <div className="stat-card p-2 lg:p-3 overflow-hidden">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1">
              <MinusCircle className="w-3 h-3 lg:w-4 lg:h-4 text-destructive" />
              <p className="text-[10px] lg:text-xs font-medium text-muted-foreground">Expenses</p>
            </div>
            <p className="text-base lg:text-2xl font-extrabold text-destructive">₹{stats.totalExpenses.toLocaleString()}</p>
          </div>
        </div>

        {/* Cash in Drawer */}
        <div className="stat-card p-2 lg:p-3 bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1">
              <Wallet className="w-3 h-3 lg:w-4 lg:h-4 text-success" />
              <p className="text-[10px] lg:text-xs font-medium text-muted-foreground">Net Profit</p>
            </div>
            <p className="text-base lg:text-2xl font-extrabold text-success">₹{stats.cashInDrawer.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Total Summary Box */}
      <div className="grid grid-cols-2 gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
        <div className="text-center border-r border-primary/20">
          <p className="text-[10px] text-muted-foreground mb-0.5">Total Items Sold</p>
          <p className="text-xl lg:text-2xl font-bold text-primary">
            {itemsSoldArray.reduce((sum, item) => sum + item.quantity, 0)}
          </p>
          <p className="text-[10px] text-muted-foreground">{dateLabel}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground mb-0.5">Total Revenue</p>
          <p className="text-xl lg:text-2xl font-bold text-green-600">
            ₹{itemsSoldArray.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-muted-foreground">{dateLabel}</p>
        </div>
      </div>

      {/* Category Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {(Object.keys(categoryConfig) as Category[]).map((cat) => {
          const config = categoryConfig[cat];
          const data = categoryTotals[cat] || { quantity: 0, revenue: 0 };
          return (
            <div key={cat} className={cn("p-2 rounded-lg", config.color.split(' ')[1])}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className={config.color.split(' ')[0]}>{config.icon}</span>
                <span className="text-[10px] font-medium text-foreground">{config.label}</span>
              </div>
              <p className="text-sm font-bold text-foreground">{data.quantity} items</p>
              <p className="text-[10px] text-muted-foreground">₹{data.revenue.toLocaleString()}</p>
            </div>
          );
        })}
      </div>

      {/* Items Sold */}
      <div className="stat-card p-2 lg:p-3">
        <div className="flex items-center gap-2 mb-2">
          <Package className="w-4 h-4 text-primary" />
          <h3 className="text-sm lg:text-base font-bold text-foreground">Items Sold - {dateLabel}</h3>
        </div>
        
        {itemsSoldArray.length > 0 ? (
          <div className="space-y-1.5">
            {itemsSoldArray.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg",
                  index < 3 ? "bg-green-500/5" : "bg-muted/50"
                )}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="w-5 h-5 flex items-center justify-center bg-primary/10 text-primary text-[10px] font-bold rounded-full flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs lg:text-sm text-foreground truncate">
                      {index < 3 && <span className="mr-1">🏆</span>}
                      {item.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      <span className={cn(
                        "px-1 py-0.5 rounded text-[8px]",
                        categoryConfig[item.category as Category]?.color || 'bg-muted'
                      )}>
                        {item.category}
                      </span>
                      {' '}• ₹{item.price} each
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-base lg:text-lg font-extrabold text-primary">×{item.quantity}</p>
                  <p className="text-[10px] text-muted-foreground">₹{item.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-6 text-xs">No items sold on this date</p>
        )}
      </div>

      {/* Hourly Rush Chart */}
      <div className="stat-card p-2 lg:p-3">
        <h3 className="text-sm lg:text-base font-bold text-foreground mb-2">Hourly Sales - {dateLabel}</h3>
        <div className="h-[180px] lg:h-[220px] -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData}>
              <XAxis 
                dataKey="hour" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                tickFormatter={(value) => `₹${value}`}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '11px',
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