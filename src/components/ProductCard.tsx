import { MenuItem } from '@/data/mockData';

interface ProductCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

const ProductCard = ({ item, onAdd }: ProductCardProps) => {
  const handleClick = () => {
    if (item.available) {
      onAdd(item);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`product-card flex flex-col ${
        !item.available ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {/* Image Section - 80% */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {!item.available && (
          <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
            <span className="text-background font-bold text-sm md:text-lg rotate-[-15deg]">
              SOLD OUT
            </span>
          </div>
        )}
      </div>
      
      {/* Info Section - 20% */}
      <div className="p-2 md:p-3 bg-card border-t border-border">
        <h3 className="font-bold text-sm md:text-base lg:text-lg truncate text-foreground">
          {item.name}
        </h3>
        <p className="text-lg md:text-xl lg:text-2xl font-extrabold text-primary">
          ₹{item.price}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
