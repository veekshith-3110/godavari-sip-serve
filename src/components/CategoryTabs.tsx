import { Category, categoryIcons } from '@/data/mockData';
import { Coffee, UtensilsCrossed, Droplets, Cigarette } from 'lucide-react';

interface CategoryTabsProps {
  activeCategory: Category | 'all';
  onCategoryChange: (category: Category | 'all') => void;
}

const categories: { id: Category | 'all'; icon: React.ReactNode; label: string }[] = [
  { id: 'all', icon: '🏪', label: 'All' },
  { id: 'hot', icon: <Coffee className="w-6 h-6" />, label: 'Hot' },
  { id: 'snacks', icon: <UtensilsCrossed className="w-6 h-6" />, label: 'Snacks' },
  { id: 'cold', icon: <Droplets className="w-6 h-6" />, label: 'Cold' },
  { id: 'smoke', icon: <Cigarette className="w-6 h-6" />, label: 'Smoke' },
];

const CategoryTabs = ({ activeCategory, onCategoryChange }: CategoryTabsProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.id)}
          className={`category-tab flex items-center justify-center gap-2 min-w-[70px] ${
            activeCategory === cat.id ? 'active' : 'bg-muted text-muted-foreground'
          }`}
        >
          <span className="text-xl">{cat.icon}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;
