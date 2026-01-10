export type Category = 'hot' | 'snacks' | 'cold' | 'smoke';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: Category;
  image: string;
  available: boolean;
  buttonColor?: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  tokenNumber: number;
  items: CartItem[];
  total: number;
  timestamp: Date;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  timestamp: Date;
}

export const menuItems: MenuItem[] = [
  // Hot Drinks
  { id: '1', name: 'Irani Chai', price: 12, category: 'hot', image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=400&fit=crop', available: true },
  { id: '2', name: 'Coffee', price: 15, category: 'hot', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop', available: true },
  { id: '3', name: 'Bellam Tea', price: 15, category: 'hot', image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=400&fit=crop', available: true },
  { id: '4', name: 'Badam Milk', price: 20, category: 'hot', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=400&fit=crop', available: true },
  
  // Snacks
  { id: '5', name: 'Samosa', price: 5, category: 'snacks', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=400&fit=crop', available: true },
  { id: '6', name: 'Osmania Biscuit', price: 5, category: 'snacks', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop', available: true },
  { id: '7', name: 'Egg Puff', price: 20, category: 'snacks', image: 'https://images.unsplash.com/photo-1509365390695-33aee754301f?w=400&h=400&fit=crop', available: true },
  { id: '8', name: 'Mirchi Bajji', price: 10, category: 'snacks', image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=400&fit=crop', available: true },
  
  // Cold Drinks
  { id: '9', name: 'ThumsUp', price: 20, category: 'cold', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=400&fit=crop', available: true },
  { id: '10', name: 'Water Bottle', price: 20, category: 'cold', image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=400&fit=crop', available: true },
  
  // Smoke
  { id: '11', name: 'Gold Flake', price: 18, category: 'smoke', image: 'https://images.unsplash.com/photo-1527099908998-5a76ba738c78?w=400&h=400&fit=crop', available: true },
  { id: '12', name: 'Kings', price: 18, category: 'smoke', image: 'https://images.unsplash.com/photo-1474649107449-ea4f014b7e9f?w=400&h=400&fit=crop', available: true },
];

export const mockOrders: Order[] = [
  {
    id: '1',
    tokenNumber: 42,
    items: [
      { ...menuItems[0], quantity: 5 },
      { ...menuItems[4], quantity: 3 },
    ],
    total: 75,
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: '2',
    tokenNumber: 43,
    items: [
      { ...menuItems[1], quantity: 2 },
      { ...menuItems[6], quantity: 1 },
    ],
    total: 50,
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: '3',
    tokenNumber: 44,
    items: [
      { ...menuItems[0], quantity: 10 },
    ],
    total: 120,
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
];

export const mockExpenses: Expense[] = [
  { id: '1', description: 'Milk (5L)', amount: 250, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  { id: '2', description: 'Ice Block', amount: 50, timestamp: new Date(Date.now() - 1000 * 60 * 60) },
];

// Stats for dashboard
export const getTodayStats = () => {
  const totalChais = 127; // Mock data
  const totalSales = 3450;
  const totalExpenses = 300;
  const cashInDrawer = totalSales - totalExpenses;
  
  return {
    totalChais,
    totalSales,
    totalExpenses,
    cashInDrawer,
  };
};

export const getHourlyData = () => [
  { hour: '6AM', sales: 120 },
  { hour: '7AM', sales: 340 },
  { hour: '8AM', sales: 520 },
  { hour: '9AM', sales: 380 },
  { hour: '10AM', sales: 290 },
  { hour: '11AM', sales: 410 },
  { hour: '12PM', sales: 560 },
  { hour: '1PM', sales: 480 },
  { hour: '2PM', sales: 220 },
  { hour: '3PM', sales: 180 },
  { hour: '4PM', sales: 350 },
  { hour: '5PM', sales: 420 },
];

export const categoryIcons: Record<Category, string> = {
  hot: '☕',
  snacks: '🍔',
  cold: '💧',
  smoke: '🚬',
};
