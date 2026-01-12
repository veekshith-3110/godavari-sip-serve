import { Category } from '@/data/mockData';
import { LayoutGrid, Coffee, UtensilsCrossed, Droplets, Flame } from 'lucide-react';

interface CategoryTabsProps {
  activeCategory: Category | 'all';
  onCategoryChange: (category: Category | 'all') => void;
}

const categories: { id: Category | 'all'; icon: React.ReactNode; label: string }[] = [
  { id: 'all', icon: <LayoutGrid className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2} />, label: 'All' },
  { id: 'hot', icon: <Coffee className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2} />, label: 'Hot' },
  { id: 'snacks', icon: <UtensilsCrossed className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2} />, label: 'Snacks' },
  { id: 'cold', icon: <Droplets className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2} />, label: 'Cold' },
  { id: 'smoke', icon: <Flame className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2} />, label: 'Smoke' },
];

const CategoryTabs = ({ activeCategory, onCategoryChange }: CategoryTabsProps) => {
  return (
    <div className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide py-1">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.id)}
          className={`flex items-center justify-center gap-2 px-5 py-3 md:px-6 md:py-3.5 rounded-xl transition-all duration-200 whitespace-nowrap font-medium ${
            activeCategory === cat.id 
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
              : 'bg-card text-foreground border border-border/60 hover:border-primary/30 hover:bg-primary/5'
          }`}
        >
          <span className={activeCategory === cat.id ? 'text-primary-foreground' : 'text-primary'}>
            {cat.icon}
          </span>
          <span className="text-sm md:text-base">{cat.label}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;
