import { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, TrendingUp, TrendingDown, Minus, Coffee, UtensilsCrossed, Droplets, Flame, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { format, startOfWeek, addDays, subWeeks, startOfMonth, endOfMonth, eachDayOfInterval, startOfDay } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useOrders } from '@/hooks/useOrders';
import { useMenu, MenuCategory } from '@/context/MenuContext';

const categoryConfig: Record<MenuCategory, { label: string; icon: React.ReactNode; color: string }> = {
  hot: { label: 'Hot Drinks', icon: <Coffee className="w-4 h-4" />, color: 'text-orange-500 bg-orange-500/10' },
  snacks: { label: 'Snacks', icon: <UtensilsCrossed className="w-4 h-4" />, color: 'text-yellow-600 bg-yellow-500/10' },
  cold: { label: 'Cold Drinks', icon: <Droplets className="w-4 h-4" />, color: 'text-blue-500 bg-blue-500/10' },
  smoke: { label: 'Smoke', icon: <Flame className="w-4 h-4" />, color: 'text-gray-500 bg-gray-500/10' },
};

const SalesReports = () => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const { orders, loading } = useOrders();
  const { menuItems } = useMenu();

  // Weekly Report Data
  const weeklyReport = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const lastWeekStart = subWeeks(weekStart, 1);

    const days = [];
    let totalSales = 0;
    let totalOrders = 0;
    let totalItems = 0;
    let lastWeekTotalSales = 0;

    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      const lastWeekDate = addDays(lastWeekStart, i);
      const isFuture = date > today;
      const isCurrentDay = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

      const dayStart = startOfDay(date);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const lastWeekDayStart = startOfDay(lastWeekDate);
      const lastWeekDayEnd = new Date(lastWeekDayStart);
      lastWeekDayEnd.setDate(lastWeekDayEnd.getDate() + 1);

      // Get orders for this day
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= dayStart && orderDate < dayEnd;
      });

      // Get orders for last week same day
      const lastWeekOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= lastWeekDayStart && orderDate < lastWeekDayEnd;
      });

      const sales = dayOrders.reduce((sum, order) => sum + order.total, 0);
      const orderCount = dayOrders.length;
      const items = dayOrders.reduce((sum, order) => 
        sum + order.items.reduce((s, item) => s + item.quantity, 0), 0
      );
      const lastWeekSales = lastWeekOrders.reduce((sum, order) => sum + order.total, 0);

      if (!isFuture) {
        totalSales += sales;
        totalOrders += orderCount;
        totalItems += items;
      }
      lastWeekTotalSales += lastWeekSales;

      days.push({
        date,
        dayName: format(date, 'EEE'),
        dateFormatted: format(date, 'dd MMM'),
        orders: isFuture ? 0 : orderCount,
        sales: isFuture ? 0 : sales,
        items: isFuture ? 0 : items,
        lastWeekSales,
        isToday: isCurrentDay,
        isFuture,
      });
    }

    const weeklyGrowth = lastWeekTotalSales > 0
      ? ((totalSales - lastWeekTotalSales) / lastWeekTotalSales * 100).toFixed(1)
      : '0';

    const daysElapsed = days.filter(d => !d.isFuture).length;

    return { days, totalSales, totalOrders, totalItems, weeklyGrowth, weekStart, daysElapsed };
  }, [orders]);

  // Monthly Item Report
  const monthlyItemReport = useMemo(() => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const today = new Date();
    const effectiveEnd = monthEnd > today ? today : monthEnd;

    // Filter orders for the selected month
    const monthOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= monthStart && orderDate <= effectiveEnd;
    });

    // Item-wise totals
    const itemTotals: Record<string, { name: string; category: MenuCategory; quantity: number; revenue: number }> = {};

    // Category-wise totals
    const categoryTotals: Record<MenuCategory, { quantity: number; revenue: number }> = {
      hot: { quantity: 0, revenue: 0 },
      snacks: { quantity: 0, revenue: 0 },
      cold: { quantity: 0, revenue: 0 },
      smoke: { quantity: 0, revenue: 0 },
    };

    monthOrders.forEach(order => {
      order.items.forEach(item => {
        const menuItem = menuItems.find(m => m.id === item.id);
        const category = menuItem?.category || 'hot';

        if (!itemTotals[item.id]) {
          itemTotals[item.id] = { name: item.name, category, quantity: 0, revenue: 0 };
        }
        itemTotals[item.id].quantity += item.quantity;
        itemTotals[item.id].revenue += item.price * item.quantity;

        categoryTotals[category].quantity += item.quantity;
        categoryTotals[category].revenue += item.price * item.quantity;
      });
    });

    const itemsArray = Object.values(itemTotals).sort((a, b) => b.quantity - a.quantity);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: effectiveEnd });

    return { 
      itemTotals: itemsArray, 
      categoryTotals, 
      daysCount: daysInMonth.length,
      totalOrders: monthOrders.length,
      totalRevenue: monthOrders.reduce((sum, order) => sum + order.total, 0),
    };
  }, [orders, selectedMonth, menuItems]);

  // Generate month options for selector
  const monthOptions = useMemo(() => {
    const options = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      options.push({
        value: date.toISOString(),
        label: format(date, 'MMMM yyyy'),
      });
    }
    return options;
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-2 md:space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base md:text-lg font-bold text-foreground">Sales Reports</h2>
      </div>

      {/* Weekly Report */}
      <div className="stat-card p-2 md:p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs md:text-sm font-bold text-foreground">
            Weekly Report ({format(weeklyReport.weekStart, 'dd MMM')} - {format(addDays(weeklyReport.weekStart, 6), 'dd MMM')})
          </h3>
          <div className={cn(
            "flex items-center gap-1 text-[10px] md:text-xs font-medium px-2 py-0.5 rounded-full",
            Number(weeklyReport.weeklyGrowth) > 0 ? "bg-green-500/10 text-green-600" :
            Number(weeklyReport.weeklyGrowth) < 0 ? "bg-red-500/10 text-red-600" :
            "bg-muted text-muted-foreground"
          )}>
            {Number(weeklyReport.weeklyGrowth) > 0 ? <TrendingUp className="w-3 h-3" /> :
             Number(weeklyReport.weeklyGrowth) < 0 ? <TrendingDown className="w-3 h-3" /> :
             <Minus className="w-3 h-3" />}
            {Number(weeklyReport.weeklyGrowth) > 0 ? '+' : ''}{weeklyReport.weeklyGrowth}% vs last week
          </div>
        </div>
        
        {/* Weekly Total Summary */}
        <div className="grid grid-cols-2 gap-2 mb-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <div className="text-center border-r border-primary/20">
            <p className="text-[10px] text-muted-foreground mb-0.5">Total Items Sold</p>
            <p className="text-lg md:text-xl font-bold text-primary">
              {weeklyReport.totalItems.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground">in {weeklyReport.daysElapsed} days</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground mb-0.5">Total Revenue</p>
            <p className="text-lg md:text-xl font-bold text-green-600">
              ₹{weeklyReport.totalSales.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground">This Week</p>
          </div>
        </div>
        
        {/* Weekly Summary */}
        <div className="grid grid-cols-3 gap-2 mb-3 p-2 bg-muted/30 rounded-lg">
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground">Total Sales</p>
            <p className="text-sm md:text-base font-bold text-foreground">₹{weeklyReport.totalSales.toLocaleString()}</p>
          </div>
          <div className="text-center border-x border-border">
            <p className="text-[10px] text-muted-foreground">Total Orders</p>
            <p className="text-sm md:text-base font-bold text-foreground">{weeklyReport.totalOrders}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground">Avg/Day</p>
            <p className="text-sm md:text-base font-bold text-foreground">
              ₹{weeklyReport.daysElapsed > 0 ? Math.round(weeklyReport.totalSales / weeklyReport.daysElapsed).toLocaleString() : 0}
            </p>
          </div>
        </div>
        
        {/* Day-by-Day Breakdown */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground border-b border-border">
                <th className="pb-1.5 text-left font-medium">Day</th>
                <th className="pb-1.5 text-left font-medium">Date</th>
                <th className="pb-1.5 text-right font-medium">Orders</th>
                <th className="pb-1.5 text-right font-medium">Sales</th>
                <th className="pb-1.5 text-right font-medium hidden sm:table-cell">vs Last Wk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {weeklyReport.days.map((day, index) => {
                const diff = day.sales - day.lastWeekSales;
                const diffPercent = day.lastWeekSales > 0 ? ((diff / day.lastWeekSales) * 100).toFixed(0) : 0;
                
                return (
                  <tr 
                    key={index} 
                    className={cn(
                      day.isToday && "bg-primary/5",
                      day.isFuture && "opacity-40"
                    )}
                  >
                    <td className="py-1.5 font-medium text-foreground">{day.dayName}</td>
                    <td className="py-1.5 text-muted-foreground">{day.dateFormatted}</td>
                    <td className="py-1.5 text-right text-foreground">{day.orders}</td>
                    <td className="py-1.5 text-right font-medium text-foreground">₹{day.sales.toLocaleString()}</td>
                    <td className="py-1.5 text-right hidden sm:table-cell">
                      {!day.isFuture && (
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded",
                          diff > 0 ? "bg-green-500/10 text-green-600" :
                          diff < 0 ? "bg-red-500/10 text-red-600" :
                          "bg-muted text-muted-foreground"
                        )}>
                          {diff > 0 ? '+' : ''}{diffPercent}%
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {weeklyReport.totalOrders === 0 && (
          <p className="text-center text-muted-foreground py-4 text-xs">No orders this week yet</p>
        )}
      </div>

      {/* Monthly Item-wise Report */}
      <div className="stat-card p-2 md:p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs md:text-sm font-bold text-foreground">Monthly Item Report</h3>
          <Select
            value={selectedMonth.toISOString()}
            onValueChange={(value) => setSelectedMonth(new Date(value))}
          >
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-xs">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Month Summary */}
        <div className="grid grid-cols-2 gap-2 mb-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <div className="text-center border-r border-primary/20">
            <p className="text-[10px] text-muted-foreground mb-0.5">Total Orders</p>
            <p className="text-lg md:text-xl font-bold text-primary">
              {monthlyItemReport.totalOrders}
            </p>
            <p className="text-[10px] text-muted-foreground">{monthlyItemReport.daysCount} days</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground mb-0.5">Total Revenue</p>
            <p className="text-lg md:text-xl font-bold text-green-600">
              ₹{monthlyItemReport.totalRevenue.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground">{format(selectedMonth, 'MMM yyyy')}</p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
          {(Object.keys(categoryConfig) as MenuCategory[]).map((cat) => {
            const config = categoryConfig[cat];
            const data = monthlyItemReport.categoryTotals[cat];
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

        {/* Item-wise Breakdown */}
        <h4 className="text-xs font-semibold text-muted-foreground mb-2">Item-wise Sales</h4>
        {monthlyItemReport.itemTotals.length > 0 ? (
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
            {monthlyItemReport.itemTotals.map((item, index) => (
              <div
                key={item.name}
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
                    <p className="font-semibold text-xs text-foreground truncate">
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
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-base font-extrabold text-primary">×{item.quantity}</p>
                  <p className="text-[10px] text-muted-foreground">₹{item.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-6 text-xs">No sales data for this month</p>
        )}
      </div>
    </div>
  );
};

export default SalesReports;
