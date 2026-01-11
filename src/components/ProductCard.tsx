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
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {!item.available && (
          <div className="absolute inset-0 bg-foreground/70 flex items-center justify-center">
            <span className="text-background font-bold text-xs md:text-sm rotate-[-12deg]">
              SOLD OUT
            </span>
          </div>
        )}
      </div>
      
      {/* Info Section */}
      <div className="p-2 md:p-3">
        <h3 className="font-semibold text-xs md:text-sm leading-tight text-foreground line-clamp-2 min-h-[2rem] md:min-h-[2.5rem]">
          {item.name}
        </h3>
        <p className="text-base md:text-lg font-bold text-primary mt-0.5">
          ₹{item.price}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
