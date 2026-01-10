import { useState } from 'react';
import { Wallet, TrendingUp, MinusCircle, Package, Calendar as CalendarIcon, Coffee, UtensilsCrossed, Droplets, Flame, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, isSameDay, startOfDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useOrders } from '@/hooks/useOrders';
import { useExpenses } from '@/hooks/useExpenses';
import { useMenu, MenuCategory } from '@/context/MenuContext';

const categoryConfig: Record<MenuCategory, { label: string; icon: React.ReactNode; color: string }> = {
  hot: { label: 'Hot', icon: <Coffee className="w-3.5 h-3.5" />, color: 'text-orange-500 bg-orange-500/10' },
  snacks: { label: 'Snacks', icon: <UtensilsCrossed className="w-3.5 h-3.5" />, color: 'text-yellow-600 bg-yellow-500/10' },
  cold: { label: 'Cold', icon: <Droplets className="w-3.5 h-3.5" />, color: 'text-blue-500 bg-blue-500/10' },
  smoke: { label: 'Smoke', icon: <Flame className="w-3.5 h-3.5" />, color: 'text-gray-500 bg-gray-500/10' },
};

const DashboardWidgets = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { orders, loading: ordersLoading } = useOrders();
  const { expenses, loading: expensesLoading } = useExpenses();
  const { menuItems } = useMenu();
  
  const isToday = isSameDay(selectedDate, new Date());
  const dateLabel = isToday ? 'Today' : format(selectedDate, 'dd MMM yyyy');

  // Filter orders for selected date
  const selectedDateStart = startOfDay(selectedDate);
  const selectedDateEnd = new Date(selectedDateStart);
  selectedDateEnd.setDate(selectedDateEnd.getDate() + 1);

  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= selectedDateStart && orderDate < selectedDateEnd;
  });

  const filteredExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.createdAt);
    return expDate >= selectedDateStart && expDate < selectedDateEnd;
  });

  // Calculate stats
  const totalSales = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const cashInDrawer = totalSales - totalExpenses;

  // Calculate items sold
  const itemsSold: Record<string, { id: string; name: string; quantity: number; revenue: number; price: number; category: MenuCategory }> = {};
  
  filteredOrders.forEach(order => {
    order.items.forEach(item => {
      const menuItem = menuItems.find(m => m.id === item.id);
      const category = menuItem?.category || 'hot';
      
      if (itemsSold[item.id]) {
        itemsSold[item.id].quantity += item.quantity;
        itemsSold[item.id].revenue += item.price * item.quantity;
      } else {
        itemsSold[item.id] = {
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          revenue: item.price * item.quantity,
          price: item.price,
          category,
        };
      }
    });
  });

  const itemsSoldArray = Object.values(itemsSold).sort((a, b) => b.quantity - a.quantity);

  // Calculate category totals
  const categoryTotals = itemsSoldArray.reduce((acc, item) => {
    const cat = item.category;
    if (!acc[cat]) {
      acc[cat] = { quantity: 0, revenue: 0 };
    }
    acc[cat].quantity += item.quantity;
    acc[cat].revenue += item.revenue;
    return acc;
  }, {} as Record<MenuCategory, { quantity: number; revenue: number }>);

  // Generate hourly data
  const hourlyData = Array.from({ length: 12 }, (_, i) => {
    const hour = 6 + i;
    const hourLabel = hour < 12 ? `${hour}AM` : hour === 12 ? '12PM' : `${hour - 12}PM`;
    
    const hourSales = filteredOrders
      .filter(order => {
        const orderHour = new Date(order.createdAt).getHours();
        return orderHour === hour;
      })
      .reduce((sum, order) => sum + order.total, 0);
    
    return { hour: hourLabel, sales: hourSales };
  });

  if (ordersLoading || expensesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
            <p className="text-base lg:text-2xl font-extrabold text-foreground">₹{totalSales.toLocaleString()}</p>
          </div>
        </div>

        {/* Expenses */}
        <div className="stat-card p-2 lg:p-3 overflow-hidden">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1">
              <MinusCircle className="w-3 h-3 lg:w-4 lg:h-4 text-destructive" />
              <p className="text-[10px] lg:text-xs font-medium text-muted-foreground">Expenses</p>
            </div>
            <p className="text-base lg:text-2xl font-extrabold text-destructive">₹{totalExpenses.toLocaleString()}</p>
          </div>
        </div>

        {/* Cash in Drawer */}
        <div className="stat-card p-2 lg:p-3 bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1">
              <Wallet className="w-3 h-3 lg:w-4 lg:h-4 text-success" />
              <p className="text-[10px] lg:text-xs font-medium text-muted-foreground">Net Profit</p>
            </div>
            <p className={cn("text-base lg:text-2xl font-extrabold", cashInDrawer >= 0 ? "text-success" : "text-destructive")}>
              ₹{cashInDrawer.toLocaleString()}
            </p>
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
          <p className="text-[10px] text-muted-foreground mb-0.5">Total Orders</p>
          <p className="text-xl lg:text-2xl font-bold text-green-600">
            {filteredOrders.length}
          </p>
          <p className="text-[10px] text-muted-foreground">{dateLabel}</p>
        </div>
      </div>

      {/* Category Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {(Object.keys(categoryConfig) as MenuCategory[]).map((cat) => {
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
                        categoryConfig[item.category]?.color || 'bg-muted'
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
