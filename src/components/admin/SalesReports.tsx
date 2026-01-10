import { useState } from 'react';
import { mockOrders, menuItems } from '@/data/mockData';
import { Calendar as CalendarIcon, CalendarDays, CalendarRange, TrendingUp, Star } from 'lucide-react';
import { format, isSameDay, subDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
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

// Generate last 7 days sales data
const getLast7DaysSales = () => {
  const today = new Date();
  const data = [];
  
  for (let i = 0; i < 7; i++) {
    const date = subDays(today, i);
    const seed = date.getDate() + date.getMonth() * 31 + date.getFullYear();
    const orders = 40 + (seed % 21); // Random 40-60
    const sales = 3000 + ((seed * 7) % 3001); // Random 3000-6000
    
    data.push({
      date,
      dateFormatted: format(date, 'dd MMM, EEE'),
      orders,
      sales,
      isToday: i === 0,
    });
  }
  
  return data;
};

const SalesReports = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const ordersForDate = generateMockOrdersForDate(selectedDate);
  const todaySales = ordersForDate.reduce((sum, order) => sum + order.total, 0);
  const orderCount = ordersForDate.length;
  
  const isToday = isSameDay(selectedDate, new Date());
  const dateLabel = isToday ? 'Today' : format(selectedDate, 'dd MMM');
  
  const last7DaysData = getLast7DaysSales();
  
  const getStatus = (sales: number) => {
    if (sales > 5000) return { label: 'Excellent', color: 'text-green-600' };
    if (sales > 3000) return { label: 'Good', color: 'text-blue-600' };
    return { label: 'Low', color: 'text-orange-500' };
  };

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

      {/* Last 7 Days Performance - NEW SECTION */}
      <div className="stat-card p-2 md:p-3">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-xs md:text-sm font-bold text-foreground">Last 7 Days Performance</h3>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-0">
            <Star className="w-2.5 h-2.5 mr-0.5" />
            Most Important
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground border-b border-border">
                <th className="pb-1.5 text-left font-medium">Date</th>
                <th className="pb-1.5 text-right font-medium">Orders</th>
                <th className="pb-1.5 text-right font-medium">Sales</th>
                <th className="pb-1.5 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {last7DaysData.map((day, index) => {
                const status = getStatus(day.sales);
                return (
                  <tr key={index} className={day.isToday ? 'bg-primary/5' : ''}>
                    <td className="py-1.5 font-medium text-foreground">
                      {day.isToday ? (
                        <span className="flex items-center gap-1">
                          {day.dateFormatted}
                          <span className="text-[10px] text-primary font-semibold">(Today)</span>
                        </span>
                      ) : (
                        day.dateFormatted
                      )}
                    </td>
                    <td className="py-1.5 text-right text-muted-foreground">{day.orders}</td>
                    <td className="py-1.5 text-right font-semibold text-foreground">₹{day.sales.toLocaleString()}</td>
                    <td className={`py-1.5 text-right font-medium ${status.color}`}>{status.label}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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