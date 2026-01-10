import { useState } from 'react';
import { mockOrders, menuItems } from '@/data/mockData';
import { Calendar as CalendarIcon, CalendarDays, CalendarRange, TrendingUp, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { format, isSameDay, getDaysInMonth, startOfMonth } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

// Generate daily data for a month
const generateMonthlyDailyData = (year: number, month: number) => {
  const daysInMonth = getDaysInMonth(new Date(year, month));
  const today = new Date();
  const dailyData = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    
    // Skip future dates
    if (date > today) break;
    
    const orders = generateMockOrdersForDate(date);
    
    // Calculate items sold
    const itemsSold: Record<string, { name: string; quantity: number; revenue: number }> = {};
    let totalSales = 0;
    let totalItems = 0;
    
    orders.forEach(order => {
      totalSales += order.total;
      order.items.forEach(item => {
        totalItems += item.quantity;
        if (itemsSold[item.id]) {
          itemsSold[item.id].quantity += item.quantity;
          itemsSold[item.id].revenue += item.price * item.quantity;
        } else {
          itemsSold[item.id] = {
            name: item.name,
            quantity: item.quantity,
            revenue: item.price * item.quantity,
          };
        }
      });
    });

    dailyData.push({
      day,
      date,
      orders: orders.length,
      totalSales,
      totalItems,
      itemsSold: Object.values(itemsSold),
      profit: Math.round(totalSales * 0.35), // Mock 35% profit margin
    });
  }

  return dailyData;
};

const SalesReports = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDailyBreakdown, setShowDailyBreakdown] = useState(false);
  
  const ordersForDate = generateMockOrdersForDate(selectedDate);
  const todaySales = ordersForDate.reduce((sum, order) => sum + order.total, 0);
  const orderCount = ordersForDate.length;
  
  const isToday = isSameDay(selectedDate, new Date());
  const dateLabel = isToday ? 'Today' : format(selectedDate, 'dd MMM');

  // Generate monthly daily data
  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth();
  const monthlyDailyData = generateMonthlyDailyData(currentYear, currentMonth);
  
  // Calculate monthly totals
  const monthlyTotals = monthlyDailyData.reduce((acc, day) => ({
    orders: acc.orders + day.orders,
    sales: acc.sales + day.totalSales,
    items: acc.items + day.totalItems,
    profit: acc.profit + day.profit,
  }), { orders: 0, sales: 0, items: 0, profit: 0 });

  // Download PDF Report
  const downloadMonthlyPDF = () => {
    const doc = new jsPDF();
    const monthName = format(new Date(currentYear, currentMonth), 'MMMM yyyy');
    
    // Title
    doc.setFontSize(18);
    doc.text(`Monthly Sales Report - ${monthName}`, 14, 20);
    
    // Summary
    doc.setFontSize(12);
    doc.text(`Total Sales: ₹${monthlyTotals.sales.toLocaleString()}`, 14, 35);
    doc.text(`Total Orders: ${monthlyTotals.orders}`, 14, 42);
    doc.text(`Total Items Sold: ${monthlyTotals.items}`, 14, 49);
    doc.text(`Total Profit: ₹${monthlyTotals.profit.toLocaleString()}`, 14, 56);
    
    // Daily breakdown table
    doc.setFontSize(14);
    doc.text('Daily Breakdown', 14, 70);
    
    const tableData = monthlyDailyData.map(day => [
      format(day.date, 'dd MMM'),
      day.orders.toString(),
      day.totalItems.toString(),
      `₹${day.totalSales.toLocaleString()}`,
      `₹${day.profit.toLocaleString()}`,
    ]);
    
    autoTable(doc, {
      startY: 75,
      head: [['Date', 'Orders', 'Items', 'Sales', 'Profit']],
      body: tableData,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
    });
    
    // Items sold breakdown for each day
    let yPos = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFontSize(14);
    doc.text('Daily Items Breakdown', 14, yPos);
    yPos += 10;
    
    monthlyDailyData.forEach(day => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${format(day.date, 'dd MMM yyyy')} - ₹${day.totalSales} (${day.orders} orders)`, 14, yPos);
      yPos += 6;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      if (day.itemsSold.length > 0) {
        day.itemsSold.forEach(item => {
          if (yPos > 280) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(`  • ${item.name}: ${item.quantity} pcs - ₹${item.revenue}`, 14, yPos);
          yPos += 5;
        });
      } else {
        doc.text('  No items sold', 14, yPos);
        yPos += 5;
      }
      
      yPos += 4;
    });
    
    // Save PDF
    doc.save(`Sales_Report_${monthName.replace(' ', '_')}.pdf`);
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
          <p className="text-sm md:text-lg font-bold text-foreground">₹{(monthlyTotals.sales / 1000).toFixed(1)}K</p>
          <p className="text-[10px] md:text-xs text-muted-foreground">{monthlyTotals.orders} orders</p>
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

      {/* Monthly Report with Daily Breakdown */}
      <div className="stat-card p-2 md:p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs md:text-sm font-bold text-foreground">
            Monthly Report - {format(new Date(currentYear, currentMonth), 'MMM yyyy')}
          </h3>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[10px] md:text-xs px-2"
              onClick={() => setShowDailyBreakdown(!showDailyBreakdown)}
            >
              {showDailyBreakdown ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
              {showDailyBreakdown ? 'Hide' : 'View'} Daily
            </Button>
            <Button
              variant="default"
              size="sm"
              className="h-7 text-[10px] md:text-xs px-2"
              onClick={downloadMonthlyPDF}
            >
              <Download className="w-3 h-3 mr-1" />
              PDF
            </Button>
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="grid grid-cols-4 gap-1.5 mb-2 text-center">
          <div className="bg-muted/50 rounded p-1.5">
            <p className="text-[10px] text-muted-foreground">Sales</p>
            <p className="text-xs md:text-sm font-bold text-foreground">₹{monthlyTotals.sales.toLocaleString()}</p>
          </div>
          <div className="bg-muted/50 rounded p-1.5">
            <p className="text-[10px] text-muted-foreground">Orders</p>
            <p className="text-xs md:text-sm font-bold text-foreground">{monthlyTotals.orders}</p>
          </div>
          <div className="bg-muted/50 rounded p-1.5">
            <p className="text-[10px] text-muted-foreground">Items</p>
            <p className="text-xs md:text-sm font-bold text-foreground">{monthlyTotals.items}</p>
          </div>
          <div className="bg-muted/50 rounded p-1.5">
            <p className="text-[10px] text-muted-foreground">Profit</p>
            <p className="text-xs md:text-sm font-bold text-success">₹{monthlyTotals.profit.toLocaleString()}</p>
          </div>
        </div>

        {/* Daily Breakdown Table */}
        {showDailyBreakdown && (
          <div className="overflow-x-auto max-h-60 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-card">
                <tr className="text-muted-foreground border-b border-border">
                  <th className="pb-1 text-left font-medium">Date</th>
                  <th className="pb-1 text-right font-medium">Orders</th>
                  <th className="pb-1 text-right font-medium">Items</th>
                  <th className="pb-1 text-right font-medium">Sales</th>
                  <th className="pb-1 text-right font-medium">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {monthlyDailyData.map((day) => (
                  <tr key={day.day} className="hover:bg-muted/30">
                    <td className="py-1.5 font-medium text-foreground">{format(day.date, 'dd MMM')}</td>
                    <td className="py-1.5 text-right text-muted-foreground">{day.orders}</td>
                    <td className="py-1.5 text-right text-muted-foreground">{day.totalItems}</td>
                    <td className="py-1.5 text-right font-semibold text-foreground">₹{day.totalSales}</td>
                    <td className="py-1.5 text-right font-medium text-success">₹{day.profit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Yearly Report */}
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
  );
};

export default SalesReports;