import { useState } from 'react';
import { menuItems, Category } from '@/data/mockData';
import { Calendar as CalendarIcon, TrendingUp, TrendingDown, Minus, Coffee, UtensilsCrossed, Droplets, Flame, ChevronDown, ChevronUp } from 'lucide-react';
import { format, startOfWeek, addDays, subWeeks, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Generate day-wise item sales for a specific date
const generateDayItemSales = (date: Date) => {
  const seed = date.getDate() + date.getMonth() * 31 + date.getFullYear() * 365;
  const items: Record<string, number> = {};
  
  menuItems.forEach((item, index) => {
    const itemSeed = seed + index * 7;
    items[item.name] = Math.floor((itemSeed % 20) + 1); // 1-20 items per day
  });
  
  return items;
};

// Generate daily data for a month
const generateMonthDays = (year: number, monthIndex: number) => {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const days = [];
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, monthIndex, day);
    const itemSales = generateDayItemSales(date);
    const totalItems = Object.values(itemSales).reduce((a, b) => a + b, 0);
    const totalRevenue = menuItems.reduce((sum, item) => sum + (itemSales[item.name] || 0) * item.price, 0);
    
    days.push({
      day,
      date,
      itemSales,
      totalItems,
      totalRevenue,
      orders: Math.floor(totalItems / 3) + 5, // Approximate orders
    });
  }
  
  return days;
};

const yearlyData = [
  { 
    year: 2022, 
    orders: 6200, 
    sales: 496000, 
    growth: 0,
    months: [
      { name: 'Jan', monthIndex: 0, sales: 38000, orders: 480 },
      { name: 'Feb', monthIndex: 1, sales: 35000, orders: 440 },
      { name: 'Mar', monthIndex: 2, sales: 42000, orders: 530 },
      { name: 'Apr', monthIndex: 3, sales: 40000, orders: 500 },
      { name: 'May', monthIndex: 4, sales: 43000, orders: 540 },
      { name: 'Jun', monthIndex: 5, sales: 45000, orders: 560 },
      { name: 'Jul', monthIndex: 6, sales: 48000, orders: 600 },
      { name: 'Aug', monthIndex: 7, sales: 46000, orders: 575 },
      { name: 'Sep', monthIndex: 8, sales: 44000, orders: 550 },
      { name: 'Oct', monthIndex: 9, sales: 42000, orders: 525 },
      { name: 'Nov', monthIndex: 10, sales: 38000, orders: 475 },
      { name: 'Dec', monthIndex: 11, sales: 35000, orders: 425 },
    ]
  },
  { 
    year: 2023, 
    orders: 7100, 
    sales: 568000, 
    growth: 14.5,
    months: [
      { name: 'Jan', monthIndex: 0, sales: 42000, orders: 525 },
      { name: 'Feb', monthIndex: 1, sales: 38000, orders: 475 },
      { name: 'Mar', monthIndex: 2, sales: 48000, orders: 600 },
      { name: 'Apr', monthIndex: 3, sales: 46000, orders: 575 },
      { name: 'May', monthIndex: 4, sales: 50000, orders: 625 },
      { name: 'Jun', monthIndex: 5, sales: 52000, orders: 650 },
      { name: 'Jul', monthIndex: 6, sales: 55000, orders: 690 },
      { name: 'Aug', monthIndex: 7, sales: 53000, orders: 665 },
      { name: 'Sep', monthIndex: 8, sales: 50000, orders: 625 },
      { name: 'Oct', monthIndex: 9, sales: 48000, orders: 600 },
      { name: 'Nov', monthIndex: 10, sales: 44000, orders: 550 },
      { name: 'Dec', monthIndex: 11, sales: 42000, orders: 520 },
    ]
  },
  { 
    year: 2024, 
    orders: 7234, 
    sales: 584600, 
    growth: 2.9,
    months: [
      { name: 'Jan', monthIndex: 0, sales: 45200, orders: 580 },
      { name: 'Feb', monthIndex: 1, sales: 41800, orders: 520 },
      { name: 'Mar', monthIndex: 2, sales: 48600, orders: 610 },
      { name: 'Apr', monthIndex: 3, sales: 47200, orders: 590 },
      { name: 'May', monthIndex: 4, sales: 51200, orders: 640 },
      { name: 'Jun', monthIndex: 5, sales: 54400, orders: 680 },
      { name: 'Jul', monthIndex: 6, sales: 57600, orders: 720 },
      { name: 'Aug', monthIndex: 7, sales: 55200, orders: 690 },
      { name: 'Sep', monthIndex: 8, sales: 52000, orders: 650 },
      { name: 'Oct', monthIndex: 9, sales: 48200, orders: 612 },
      { name: 'Nov', monthIndex: 10, sales: 42600, orders: 532 },
      { name: 'Dec', monthIndex: 11, sales: 40600, orders: 410 },
    ]
  },
];

// Generate weekly report data
const getWeeklyReport = () => {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
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
    
    // Generate consistent mock data based on date
    const seed = date.getDate() + date.getMonth() * 31;
    const lastWeekSeed = lastWeekDate.getDate() + lastWeekDate.getMonth() * 31;
    
    const orders = isFuture ? 0 : 35 + (seed % 30); // 35-65 orders
    const sales = isFuture ? 0 : 2500 + ((seed * 13) % 4000); // ₹2500-6500
    const items = isFuture ? 0 : 80 + (seed % 50); // 80-130 items per day
    const lastWeekSales = 2500 + ((lastWeekSeed * 13) % 4000);
    
    totalSales += sales;
    totalOrders += orders;
    totalItems += items;
    lastWeekTotalSales += lastWeekSales;
    
    days.push({
      date,
      dayName: format(date, 'EEE'),
      dateFormatted: format(date, 'dd MMM'),
      orders,
      sales,
      items,
      lastWeekSales,
      isToday: isCurrentDay,
      isFuture,
    });
  }
  
  const weeklyGrowth = lastWeekTotalSales > 0 
    ? ((totalSales - lastWeekTotalSales) / lastWeekTotalSales * 100).toFixed(1)
    : 0;
  
  const daysElapsed = days.filter(d => !d.isFuture).length;
  
  return { days, totalSales, totalOrders, totalItems, weeklyGrowth, weekStart, daysElapsed };
};

// Yearly Report Card with expandable month-wise breakdown
interface YearData {
  year: number;
  orders: number;
  sales: number;
  growth: number;
  months: { name: string; monthIndex: number; sales: number; orders: number }[];
}

// Day detail component showing item-wise sales
const DayDetailCard = ({ day, year }: { day: { day: number; itemSales: Record<string, number>; totalItems: number; totalRevenue: number; orders: number }; year: number }) => {
  return (
    <div className="p-2 bg-muted/50 rounded border border-border/50">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-foreground">Day {day.day}</p>
        <p className="text-xs text-muted-foreground">{day.orders} orders • ₹{day.totalRevenue.toLocaleString()}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
        {menuItems.map((item) => {
          const qty = day.itemSales[item.name] || 0;
          return (
            <div key={item.id} className="flex items-center justify-between text-[10px] p-1 bg-background rounded">
              <span className="truncate text-foreground">{item.name}</span>
              <span className="font-semibold text-primary ml-1">{qty}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Month detail component with day-wise breakdown
const MonthDetailCard = ({ month, year, isExpanded, onToggle }: { 
  month: { name: string; monthIndex: number; sales: number; orders: number }; 
  year: number;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const days = generateMonthDays(year, month.monthIndex);
  
  const sortedMonths = yearlyData.find(y => y.year === year)?.months || [];
  const sortedByRevenue = [...sortedMonths].sort((a, b) => b.sales - a.sales);
  const isBest = sortedByRevenue[0]?.name === month.name;
  const isWorst = sortedByRevenue[sortedByRevenue.length - 1]?.name === month.name;
  const avgPerOrder = month.orders > 0 ? Math.round(month.sales / month.orders) : 0;
  
  return (
    <div className={cn(
      "border border-border/50 rounded overflow-hidden",
      isBest && "bg-green-500/5",
      isWorst && "bg-red-500/5"
    )}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-2 hover:bg-muted/30 transition-colors"
      >
        <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          {month.name}
          {isBest && <span className="text-[10px]">🏆</span>}
        </span>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-semibold text-foreground">₹{(month.sales / 1000).toFixed(1)}K</p>
            <p className="text-[9px] text-muted-foreground">{month.orders} orders</p>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-3 h-3 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          )}
        </div>
      </button>
      
      {isExpanded && (
        <div className="p-2 border-t border-border/50 space-y-2">
          {/* Summary */}
          <div className="flex gap-2 text-[10px] text-muted-foreground">
            <span>Avg/Order: <span className="font-semibold text-foreground">₹{avgPerOrder}</span></span>
            <span>•</span>
            <span>Days: <span className="font-semibold text-foreground">{days.length}</span></span>
          </div>
          
          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => (
              <button
                key={day.day}
                onClick={() => setSelectedDay(selectedDay === day.day ? null : day.day)}
                className={cn(
                  "p-1.5 text-center rounded text-[10px] transition-colors",
                  selectedDay === day.day 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted/50 hover:bg-muted text-foreground"
                )}
              >
                {day.day}
              </button>
            ))}
          </div>
          
          {/* Selected Day Details */}
          {selectedDay && (
            <DayDetailCard 
              day={days.find(d => d.day === selectedDay)!} 
              year={year} 
            />
          )}
        </div>
      )}
    </div>
  );
};

const YearlyReportCard = ({ yearData }: { yearData: YearData }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  
  // Find best and worst months
  const sortedMonths = [...yearData.months].sort((a, b) => b.sales - a.sales);
  const bestMonth = sortedMonths[0];
  const worstMonth = sortedMonths[sortedMonths.length - 1];
  
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Year Header - Clickable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm md:text-base font-bold text-foreground">{yearData.year}</span>
          <span className={cn(
            "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
            yearData.growth >= 0 ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
          )}>
            {yearData.growth >= 0 ? '+' : ''}{yearData.growth}%
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm md:text-base font-bold text-foreground">₹{(yearData.sales / 100000).toFixed(1)}L</p>
            <p className="text-[10px] text-muted-foreground">{yearData.orders.toLocaleString()} orders</p>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>
      
      {/* Expanded Month-wise Breakdown */}
      {isExpanded && (
        <div className="p-3 border-t border-border">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <p className="text-[10px] text-muted-foreground">Best Month</p>
              <p className="text-sm font-bold text-green-600">{bestMonth.name}</p>
              <p className="text-[10px] text-muted-foreground">₹{bestMonth.sales.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-red-500/10 rounded-lg">
              <p className="text-[10px] text-muted-foreground">Lowest Month</p>
              <p className="text-sm font-bold text-red-500">{worstMonth.name}</p>
              <p className="text-[10px] text-muted-foreground">₹{worstMonth.sales.toLocaleString()}</p>
            </div>
          </div>
          
          {/* Month-wise Expandable Cards */}
          <p className="text-[10px] text-muted-foreground mb-2">Click on a month to see day-wise breakdown:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {yearData.months.map((month) => (
              <MonthDetailCard
                key={month.name}
                month={month}
                year={yearData.year}
                isExpanded={expandedMonth === month.name}
                onToggle={() => setExpandedMonth(expandedMonth === month.name ? null : month.name)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Generate monthly item-wise sales report
const getMonthlyItemReport = (month: Date) => {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const today = new Date();
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd > today ? today : monthEnd });
  
  // Item-wise totals
  const itemTotals: Record<string, { name: string; category: Category; quantity: number; revenue: number }> = {};
  
  // Category-wise totals
  const categoryTotals: Record<Category, { quantity: number; revenue: number }> = {
    hot: { quantity: 0, revenue: 0 },
    snacks: { quantity: 0, revenue: 0 },
    cold: { quantity: 0, revenue: 0 },
    smoke: { quantity: 0, revenue: 0 },
  };
  
  // Initialize all menu items
  menuItems.forEach(item => {
    itemTotals[item.id] = { name: item.name, category: item.category, quantity: 0, revenue: 0 };
  });
  
  // Generate sales for each day
  daysInMonth.forEach(date => {
    const seed = date.getDate() + date.getMonth() * 31;
    
    // Generate item sales for this day
    menuItems.forEach((item, index) => {
      const itemSeed = seed + index * 7;
      const quantity = Math.floor((itemSeed % 15) + 2); // 2-16 items per day
      
      itemTotals[item.id].quantity += quantity;
      itemTotals[item.id].revenue += quantity * item.price;
      
      categoryTotals[item.category].quantity += quantity;
      categoryTotals[item.category].revenue += quantity * item.price;
    });
  });
  
  // Convert to array and sort by quantity
  const itemsArray = Object.values(itemTotals).sort((a, b) => b.quantity - a.quantity);
  
  return { itemTotals: itemsArray, categoryTotals, daysCount: daysInMonth.length };
};

const categoryConfig: Record<Category, { label: string; icon: React.ReactNode; color: string }> = {
  hot: { label: 'Hot Drinks', icon: <Coffee className="w-4 h-4" />, color: 'text-orange-500 bg-orange-500/10' },
  snacks: { label: 'Snacks', icon: <UtensilsCrossed className="w-4 h-4" />, color: 'text-yellow-600 bg-yellow-500/10' },
  cold: { label: 'Cold Drinks', icon: <Droplets className="w-4 h-4" />, color: 'text-blue-500 bg-blue-500/10' },
  smoke: { label: 'Smoke', icon: <Flame className="w-4 h-4" />, color: 'text-gray-500 bg-gray-500/10' },
};

const SalesReports = () => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  
  const weeklyReport = getWeeklyReport();
  const monthlyItemReport = getMonthlyItemReport(selectedMonth);

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

      {/* Monthly Item-wise Report */}
      <div className="stat-card p-2 md:p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs md:text-sm font-bold text-foreground">
            Monthly Item Report - {format(selectedMonth, 'MMMM yyyy')}
          </h3>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-[10px] px-2">
                <CalendarIcon className="mr-1 h-3 w-3" />
                {format(selectedMonth, 'MMM yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedMonth}
                onSelect={(date) => date && setSelectedMonth(date)}
                disabled={(date) => date > new Date()}
                initialFocus
                className={cn("p-2 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Monthly Total Summary */}
        <div className="grid grid-cols-2 gap-2 mb-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <div className="text-center border-r border-primary/20">
            <p className="text-[10px] text-muted-foreground mb-0.5">Total Items Sold</p>
            <p className="text-lg md:text-xl font-bold text-primary">
              {Object.values(monthlyItemReport.categoryTotals).reduce((sum, cat) => sum + cat.quantity, 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground">in {monthlyItemReport.daysCount} days</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground mb-0.5">Total Revenue</p>
            <p className="text-lg md:text-xl font-bold text-green-600">
              ₹{Object.values(monthlyItemReport.categoryTotals).reduce((sum, cat) => sum + cat.revenue, 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground">{format(selectedMonth, 'MMMM yyyy')}</p>
          </div>
        </div>
        
        {/* Category Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
          {(Object.keys(monthlyItemReport.categoryTotals) as Category[]).map((cat) => {
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
        
        {/* Item-wise Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground border-b border-border">
                <th className="pb-1.5 text-left font-medium">Item</th>
                <th className="pb-1.5 text-left font-medium">Category</th>
                <th className="pb-1.5 text-right font-medium">Qty Sold</th>
                <th className="pb-1.5 text-right font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {monthlyItemReport.itemTotals.map((item, index) => (
                <tr key={index} className={index < 3 ? 'bg-green-500/5' : ''}>
                  <td className="py-1.5 font-medium text-foreground">
                    <span className="flex items-center gap-1">
                      {index < 3 && <span className="text-[10px]">🏆</span>}
                      {item.name}
                    </span>
                  </td>
                  <td className="py-1.5">
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full",
                      categoryConfig[item.category].color
                    )}>
                      {categoryConfig[item.category].label}
                    </span>
                  </td>
                  <td className="py-1.5 text-right font-semibold text-foreground">{item.quantity}</td>
                  <td className="py-1.5 text-right text-muted-foreground">₹{item.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Yearly Reports with Month-wise Breakdown */}
      <div className="stat-card p-2 md:p-3">
        <h3 className="text-xs md:text-sm font-bold text-foreground mb-3">Yearly Summary</h3>
        
        <div className="space-y-3">
          {yearlyData.map((year) => (
            <YearlyReportCard key={year.year} yearData={year} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesReports;
