import { useState } from 'react';
import { ShoppingBag, Eye } from 'lucide-react';
import type { Product } from '../backend';
import { useCart } from '../context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
  highlighted?: boolean;
}

function getProductImageSrc(imageUrl: string, category: string): string {
  if (imageUrl.startsWith('ic://')) {
    const catMap: Record<string, string> = {
      dresses: '/assets/generated/product-dress.dim_600x800.png',
      tops: '/assets/generated/product-top.dim_600x800.png',
      bottoms: '/assets/generated/product-trousers.dim_600x800.png',
      accessories: '/assets/generated/product-blazer.dim_600x800.png',
    };
    return catMap[category] || '/assets/generated/product-top.dim_600x800.png';
  }
  return imageUrl;
}

const categoryLabels: Record<string, string> = {
  tops: 'Tops',
  bottoms: 'Bottoms',
  dresses: 'Dresses',
  accessories: 'Accessories',
};

export default function ProductCard({ product, highlighted }: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAddToCart = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const imgSrc = imgError
    ? '/assets/generated/product-top.dim_600x800.png'
    : getProductImageSrc(product.imageUrl, product.category);

  return (
    <div
      className={`group relative bg-charcoal-light rounded-sm overflow-hidden card-hover ${
        highlighted ? 'ring-2 ring-gold' : ''
      }`}
      id={`product-${product.id}`}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-charcoal">
        <img
          src={imgSrc}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={() => setImgError(true)}
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Eye className="w-8 h-8 text-cream/80" />
        </div>
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <Badge
            variant="outline"
            className="bg-charcoal/80 border-gold/30 text-gold text-xs font-sans tracking-wider uppercase backdrop-blur-sm"
          >
            {categoryLabels[product.category] || product.category}
          </Badge>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-serif text-base text-cream leading-tight mb-1 group-hover:text-gold transition-colors duration-300">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-3">
          <span className="font-sans text-lg text-gold font-medium">
            ${product.price.toFixed(2)}
          </span>
          <Button
            size="sm"
            onClick={handleAddToCart}
            className={`font-sans text-xs tracking-widest uppercase transition-all duration-300 ${
              added
                ? 'bg-green-700 text-cream border-green-700'
                : 'bg-transparent border border-gold/50 text-gold hover:bg-gold hover:text-charcoal'
            }`}
            variant="outline"
          >
            {added ? (
              '✓ Added'
            ) : (
              <><ShoppingBag className="w-3 h-3 mr-1" /> Add</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
