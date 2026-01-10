import { useState } from 'react';
import { mockOrders, menuItems } from '@/data/mockData';
import { Calendar as CalendarIcon, CalendarDays, CalendarRange, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format, isSameDay, startOfWeek, addDays, subWeeks } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const monthlyData = [
  { name: 'Jan', orders: 580, sales: 45200 },
  { name: 'Feb', orders: 520, sales: 41800 },
  { name: 'Mar', orders: 610, sales: 48600 },
  { name: 'Apr', orders: 590, sales: 47200 },
  { name: 'May', orders: 640, sales: 51200 },
  { name: 'Jun', orders: 680, sales: 54400 },
  { name: 'Jul', orders: 720, sales: 57600 },
  { name: 'Aug', orders: 690, sales: 55200 },
  { name: 'Sep', orders: 650, sales: 52000 },
  { name: 'Oct', orders: 612, sales: 48200 },
  { name: 'Nov', orders: 0, sales: 0 },
  { name: 'Dec', orders: 0, sales: 0 },
];

const yearlyData = [
  { year: 2022, orders: 6200, sales: 496000, growth: 0 },
  { year: 2023, orders: 7100, sales: 568000, growth: 14.5 },
  { year: 2024, orders: 7234, sales: 584600, growth: 2.9 },
];

// Generate mock orders for a specific date
const generateMockOrdersForDate = (date: Date) => {
  const isToday = isSameDay(date, new Date());
  
  if (isToday) {
    return mockOrders;
  }
  
  const seed = date.getDate() + date.getMonth() * 31;
  const orderCount = 3 + (seed % 8);
  
  const generatedOrders = [];
  for (let i = 0; i < orderCount; i++) {
    const itemIndex = (seed + i) % menuItems.length;
    const quantity = 1 + ((seed + i * 3) % 10);
    const item = menuItems[itemIndex];
    
    generatedOrders.push({
      id: `${date.toISOString()}-${i}`,
      tokenNumber: 40 + i,
      items: [{ ...item, quantity }],
      total: item.price * quantity,
      timestamp: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 8 + i, (seed * i) % 60),
    });
  }
  
  return generatedOrders;
};

// Generate weekly report data
const getWeeklyReport = () => {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const lastWeekStart = subWeeks(weekStart, 1);
  
  const days = [];
  let totalSales = 0;
  let totalOrders = 0;
  let lastWeekTotalSales = 0;
  
  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    const lastWeekDate = addDays(lastWeekStart, i);
    const isFuture = date > today;
    const isCurrentDay = isSameDay(date, today);
    
    // Generate consistent mock data based on date
    const seed = date.getDate() + date.getMonth() * 31;
    const lastWeekSeed = lastWeekDate.getDate() + lastWeekDate.getMonth() * 31;
    
    const orders = isFuture ? 0 : 35 + (seed % 30); // 35-65 orders
    const sales = isFuture ? 0 : 2500 + ((seed * 13) % 4000); // ₹2500-6500
    const lastWeekSales = 2500 + ((lastWeekSeed * 13) % 4000);
    
    totalSales += sales;
    totalOrders += orders;
    lastWeekTotalSales += lastWeekSales;
    
    days.push({
      date,
      dayName: format(date, 'EEE'),
      dateFormatted: format(date, 'dd MMM'),
      orders,
      sales,
      lastWeekSales,
      isToday: isCurrentDay,
      isFuture,
    });
  }
  
  const weeklyGrowth = lastWeekTotalSales > 0 
    ? ((totalSales - lastWeekTotalSales) / lastWeekTotalSales * 100).toFixed(1)
    : 0;
  
  return { days, totalSales, totalOrders, weeklyGrowth, weekStart };
};

const SalesReports = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const ordersForDate = generateMockOrdersForDate(selectedDate);
  const todaySales = ordersForDate.reduce((sum, order) => sum + order.total, 0);
  const orderCount = ordersForDate.length;
  
  const isToday = isSameDay(selectedDate, new Date());
  const dateLabel = isToday ? 'Today' : format(selectedDate, 'dd MMM');
  
  const weeklyReport = getWeeklyReport();

  return (
    <div className="space-y-2 md:space-y-3">
      {/* Header with Date Picker */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base md:text-lg font-bold text-foreground">Sales Reports</h2>
        
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
              {selectedDate ? format(selectedDate, "dd MMM") : "Date"}
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

      {/* Summary Cards - Compact Grid */}
      <div className="grid grid-cols-4 gap-1.5 md:gap-2">
        <div className="stat-card p-2 md:p-3">
          <div className="flex items-center gap-1 mb-0.5">
            <CalendarIcon className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary" />
            <span className="text-[10px] md:text-xs text-muted-foreground truncate">{dateLabel}</span>
          </div>
          <p className="text-sm md:text-lg font-bold text-foreground">₹{todaySales}</p>
          <p className="text-[10px] md:text-xs text-muted-foreground">{orderCount} orders</p>
        </div>

        <div className="stat-card p-2 md:p-3">
          <div className="flex items-center gap-1 mb-0.5">
            <TrendingUp className="w-3 h-3 md:w-3.5 md:h-3.5 text-green-500" />
            <span className="text-[10px] md:text-xs text-muted-foreground">Week</span>
          </div>
          <p className="text-sm md:text-lg font-bold text-foreground">₹12.4K</p>
          <p className="text-[10px] md:text-xs text-muted-foreground">156 orders</p>
        </div>

        <div className="stat-card p-2 md:p-3">
          <div className="flex items-center gap-1 mb-0.5">
            <CalendarDays className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-500" />
            <span className="text-[10px] md:text-xs text-muted-foreground">Month</span>
          </div>
          <p className="text-sm md:text-lg font-bold text-foreground">₹48.2K</p>
          <p className="text-[10px] md:text-xs text-muted-foreground">612 orders</p>
        </div>

        <div className="stat-card p-2 md:p-3">
          <div className="flex items-center gap-1 mb-0.5">
            <CalendarRange className="w-3 h-3 md:w-3.5 md:h-3.5 text-orange-500" />
            <span className="text-[10px] md:text-xs text-muted-foreground">Year</span>
          </div>
          <p className="text-sm md:text-lg font-bold text-foreground">₹5.8L</p>
          <p className="text-[10px] md:text-xs text-muted-foreground">7.2K orders</p>
        </div>
      </div>

      {/* Orders for Selected Date - Compact */}
      <div className="stat-card p-2 md:p-3">
        <h3 className="text-xs md:text-sm font-bold text-foreground mb-2">Orders - {dateLabel}</h3>
        {ordersForDate.length > 0 ? (
          <div className="space-y-1">
            {ordersForDate.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-xs font-bold text-primary">#{order.tokenNumber}</span>
                  <span className="text-xs text-foreground truncate">{order.items.map(item => `${item.name} ×${item.quantity}`).join(', ')}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-semibold text-foreground">₹{order.total}</span>
                  <span className="text-[10px] text-muted-foreground hidden sm:inline">
                    {order.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4 text-xs">No orders</p>
        )}
      </div>

      {/* Weekly Report - Detailed */}
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
        
        {/* Weekly Summary */}
        <div className="grid grid-cols-3 gap-2 mb-3 p-2 bg-muted/30 rounded-lg">
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground">Total Sales</p>
            <p className="text-sm md:text-base font-bold text-foreground">₹{(weeklyReport.totalSales / 1000).toFixed(1)}K</p>
          </div>
          <div className="text-center border-x border-border">
            <p className="text-[10px] text-muted-foreground">Total Orders</p>
            <p className="text-sm md:text-base font-bold text-foreground">{weeklyReport.totalOrders}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground">Avg/Day</p>
            <p className="text-sm md:text-base font-bold text-foreground">₹{(weeklyReport.totalSales / 7 / 1000).toFixed(1)}K</p>
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
                    <td className="py-1.5 font-medium text-foreground">
                      <span className="flex items-center gap-1">
                        {day.dayName}
                        {day.isToday && <span className="text-[8px] bg-primary text-primary-foreground px-1 rounded">TODAY</span>}
                      </span>
                    </td>
                    <td className="py-1.5 text-muted-foreground">{day.dateFormatted}</td>
                    <td className="py-1.5 text-right text-muted-foreground">
                      {day.isFuture ? '-' : day.orders}
                    </td>
                    <td className="py-1.5 text-right font-semibold text-foreground">
                      {day.isFuture ? '-' : `₹${day.sales.toLocaleString()}`}
                    </td>
                    <td className={cn(
                      "py-1.5 text-right font-medium hidden sm:table-cell",
                      day.isFuture ? "text-muted-foreground" :
                      diff > 0 ? "text-green-600" : 
                      diff < 0 ? "text-red-500" : 
                      "text-muted-foreground"
                    )}>
                      {day.isFuture ? '-' : (
                        <>
                          {diff > 0 ? '+' : ''}{diffPercent}%
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly & Yearly Reports - Compact Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Monthly */}
        <div className="stat-card p-2 md:p-3">
          <h3 className="text-xs md:text-sm font-bold text-foreground mb-2">Monthly (2024)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="pb-1 text-left font-medium">Mon</th>
                  <th className="pb-1 text-right font-medium">Orders</th>
                  <th className="pb-1 text-right font-medium">Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {monthlyData.slice(0, 6).map((month) => (
                  <tr key={month.name}>
                    <td className="py-1 font-medium text-foreground">{month.name}</td>
                    <td className="py-1 text-right text-muted-foreground">{month.orders}</td>
                    <td className="py-1 text-right font-semibold text-foreground">₹{(month.sales / 1000).toFixed(1)}K</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Yearly */}
        <div className="stat-card p-2 md:p-3">
          <h3 className="text-xs md:text-sm font-bold text-foreground mb-2">Yearly</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="pb-1 text-left font-medium">Year</th>
                  <th className="pb-1 text-right font-medium">Sales</th>
                  <th className="pb-1 text-right font-medium">Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {yearlyData.map((year) => (
                  <tr key={year.year}>
                    <td className="py-1 font-medium text-foreground">{year.year}</td>
                    <td className="py-1 text-right font-semibold text-foreground">₹{(year.sales / 100000).toFixed(1)}L</td>
                    <td className={`py-1 text-right font-medium ${year.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {year.growth >= 0 ? '+' : ''}{year.growth}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReports;