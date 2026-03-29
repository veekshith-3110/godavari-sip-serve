import { Order, CartItem } from '@/hooks/useOrders';
import { Expense } from '@/hooks/useExpenses';

// Menu items for demo orders
const demoMenuItems = [
  { id: 'demo-1', name: 'Irani Chai', price: 12, category: 'hot' as const, image: '', available: true },
  { id: 'demo-2', name: 'Coffee', price: 15, category: 'hot' as const, image: '', available: true },
  { id: 'demo-3', name: 'Bellam Tea', price: 15, category: 'hot' as const, image: '', available: true },
  { id: 'demo-4', name: 'Badam Milk', price: 20, category: 'hot' as const, image: '', available: true },
  { id: 'demo-5', name: 'Samosa', price: 5, category: 'snacks' as const, image: '', available: true },
  { id: 'demo-6', name: 'Osmania Biscuit', price: 5, category: 'snacks' as const, image: '', available: true },
  { id: 'demo-7', name: 'Egg Puff', price: 20, category: 'snacks' as const, image: '', available: true },
  { id: 'demo-8', name: 'Mirchi Bajji', price: 10, category: 'snacks' as const, image: '', available: true },
  { id: 'demo-9', name: 'ThumsUp', price: 20, category: 'cold' as const, image: '', available: true },
  { id: 'demo-10', name: 'Water Bottle', price: 20, category: 'cold' as const, image: '', available: true },
  { id: 'demo-11', name: 'Gold Flake', price: 18, category: 'smoke' as const, image: '', available: true },
  { id: 'demo-12', name: 'Kings', price: 18, category: 'smoke' as const, image: '', available: true },
];

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateOrdersForDay(date: Date, dayIndex: number): Order[] {
  const orders: Order[] = [];
  // More orders on weekdays, fewer on early days
  const baseOrders = 8 + Math.floor(seededRandom(dayIndex * 7) * 15);
  
  for (let i = 0; i < baseOrders; i++) {
    const hour = 6 + Math.floor(seededRandom(dayIndex * 100 + i) * 12);
    const minute = Math.floor(seededRandom(dayIndex * 200 + i) * 60);
    
    const orderDate = new Date(date);
    orderDate.setHours(hour, minute, 0, 0);
    
    // Skip if order would be in the future
    if (orderDate > new Date()) continue;
    
    // Pick 1-4 items per order
    const itemCount = 1 + Math.floor(seededRandom(dayIndex * 300 + i) * 4);
    const items: CartItem[] = [];
    let total = 0;
    
    for (let j = 0; j < itemCount; j++) {
      const menuIdx = Math.floor(seededRandom(dayIndex * 400 + i * 10 + j) * demoMenuItems.length);
      const menuItem = demoMenuItems[menuIdx];
      const quantity = 1 + Math.floor(seededRandom(dayIndex * 500 + i * 10 + j) * 5);
      
      // Check if item already in order
      const existing = items.find(it => it.id === menuItem.id);
      if (existing) {
        existing.quantity += quantity;
        total += menuItem.price * quantity;
      } else {
        items.push({ ...menuItem, quantity });
        total += menuItem.price * quantity;
      }
    }
    
    orders.push({
      id: `demo-order-${dayIndex}-${i}`,
      tokenNumber: (i % 100) + 1,
      items,
      total,
      createdAt: orderDate,
    });
  }
  
  return orders;
}

export function generateDemoOrders(): Order[] {
  const orders: Order[] = [];
  const today = new Date();
  
  // Generate for last 35 days (covers current month + last month)
  for (let d = 0; d < 35; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    date.setHours(0, 0, 0, 0);
    
    orders.push(...generateOrdersForDay(date, d));
  }
  
  return orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function generateDemoExpenses(): Expense[] {
  const expenses: Expense[] = [];
  const today = new Date();
  
  const expenseTemplates = [
    { description: 'Milk (5L)', amount: 250 },
    { description: 'Sugar (2kg)', amount: 80 },
    { description: 'Tea Powder', amount: 150 },
    { description: 'Ice Block', amount: 50 },
    { description: 'Samosa Stock', amount: 300 },
    { description: 'Bread & Buns', amount: 120 },
    { description: 'Gas Cylinder', amount: 900 },
    { description: 'Cleaning Supplies', amount: 200 },
    { description: 'Paper Cups', amount: 150 },
    { description: 'Electricity Bill', amount: 1500 },
  ];
  
  for (let d = 0; d < 35; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    
    // 1-3 expenses per day
    const count = 1 + Math.floor(seededRandom(d * 11) * 3);
    for (let i = 0; i < count; i++) {
      const templateIdx = Math.floor(seededRandom(d * 13 + i) * expenseTemplates.length);
      const template = expenseTemplates[templateIdx];
      
      const expDate = new Date(date);
      expDate.setHours(7 + Math.floor(seededRandom(d * 17 + i) * 10), 0, 0, 0);
      
      if (expDate > new Date()) continue;
      
      expenses.push({
        id: `demo-exp-${d}-${i}`,
        description: template.description,
        amount: template.amount + Math.floor(seededRandom(d * 19 + i) * 50),
        createdAt: expDate,
      });
    }
  }
  
  return expenses.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
