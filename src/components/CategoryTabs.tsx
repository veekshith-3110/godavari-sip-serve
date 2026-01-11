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
    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.id)}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 md:px-5 md:py-3 rounded-full transition-all duration-200 whitespace-nowrap ${
            activeCategory === cat.id 
              ? 'bg-primary text-primary-foreground shadow-md' 
              : 'bg-card text-muted-foreground border border-border hover:bg-secondary hover:text-foreground'
          }`}
        >
          {cat.icon}
          <span className="text-sm md:text-base font-medium">{cat.label}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;
