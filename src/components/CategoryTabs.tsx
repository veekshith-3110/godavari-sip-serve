import { Category } from '@/data/mockData';
import { LayoutGrid, Coffee, UtensilsCrossed, Droplets, Flame } from 'lucide-react';

interface CategoryTabsProps {
  activeCategory: Category | 'all';
  onCategoryChange: (category: Category | 'all') => void;
}

const categories: { id: Category | 'all'; icon: React.ReactNode; label: string }[] = [
  { id: 'all', icon: <LayoutGrid className="w-5 h-5" strokeWidth={1.5} />, label: 'All' },
  { id: 'hot', icon: <Coffee className="w-5 h-5" strokeWidth={1.5} />, label: 'Hot' },
  { id: 'snacks', icon: <UtensilsCrossed className="w-5 h-5" strokeWidth={1.5} />, label: 'Snacks' },
  { id: 'cold', icon: <Droplets className="w-5 h-5" strokeWidth={1.5} />, label: 'Cold' },
  { id: 'smoke', icon: <Flame className="w-5 h-5" strokeWidth={1.5} />, label: 'Smoke' },
];

const CategoryTabs = ({ activeCategory, onCategoryChange }: CategoryTabsProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.id)}
          className={`flex items-center justify-center min-w-[56px] md:min-w-[64px] p-3 md:p-4 rounded-xl transition-all duration-200 ${
            activeCategory === cat.id 
              ? 'bg-primary text-primary-foreground shadow-md' 
              : 'bg-card text-muted-foreground border border-border hover:border-primary/30 hover:text-foreground'
          }`}
        >
          {cat.icon}
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;
