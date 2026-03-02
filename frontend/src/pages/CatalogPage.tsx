import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useSearch } from '@tanstack/react-router';
import { useAllProducts, useSearchProducts } from '../hooks/useQueries';
import ProductCard from '../components/ProductCard';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Category, type Product } from '../backend';

const categories = [
  { label: 'All', value: 'all' },
  { label: "Men's", value: Category.mens },
  { label: "Women's", value: Category.womens },
  { label: 'Shoes', value: Category.shoes },
  { label: 'Tops', value: Category.tops },
  { label: 'Bottoms', value: Category.bottoms },
  { label: 'Dresses', value: Category.dresses },
  { label: 'Accessories', value: Category.accessories },
];

export default function CatalogPage() {
  const search = useSearch({ from: '/catalog' });
  const highlightId = search.highlight;
  const categoryParam = search.category;

  const [activeCategory, setActiveCategory] = useState<string>(
    categoryParam ?? 'all'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Sync category from URL param when it changes (e.g. navigating from header)
  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
      setSearchTerm('');
    }
  }, [categoryParam]);

  const { data: allProducts = [], isLoading: allLoading } = useAllProducts();
  const { data: searchResults = [], isLoading: searchLoading } = useSearchProducts(debouncedSearch);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Scroll to highlighted product
  useEffect(() => {
    if (highlightId) {
      setTimeout(() => {
        const el = document.getElementById(`product-${highlightId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }, [highlightId, allProducts]);

  const isLoading = allLoading || (!!debouncedSearch && searchLoading);

  const displayProducts: Product[] = (() => {
    if (debouncedSearch) return searchResults;
    if (activeCategory === 'all') return allProducts;
    return allProducts.filter(p => p.category === activeCategory);
  })();

  const activeCategoryLabel =
    categories.find(c => c.value === activeCategory)?.label ?? 'Collection';

  return (
    <div className="min-h-screen bg-charcoal">
      {/* Page Header */}
      <div className="pt-16 pb-12 px-6 text-center border-b border-gold/10">
        <p className="font-sans text-xs tracking-[0.4em] text-gold uppercase mb-3">Jade</p>
        <h1 className="font-serif text-5xl md:text-6xl text-cream mb-4">
          {activeCategory === 'all' ? 'Collection' : activeCategoryLabel}
        </h1>
        <div className="flex justify-center">
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-6 mb-10">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 flex-wrap">
            <SlidersHorizontal className="w-4 h-4 text-gold/50 mr-2 shrink-0" />
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => { setActiveCategory(cat.value); setSearchTerm(''); }}
                className={`px-4 py-2 font-sans text-xs tracking-widest uppercase transition-all duration-200 rounded-sm ${
                  activeCategory === cat.value && !debouncedSearch
                    ? 'bg-gold text-charcoal'
                    : 'text-cream/50 hover:text-cream border border-transparent hover:border-gold/20'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-sm ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/30" />
            <Input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search pieces..."
              className="pl-9 pr-9 bg-charcoal-light border-gold/20 text-cream placeholder:text-cream/30 focus:border-gold/50 font-sans text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/30 hover:text-cream transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        {!isLoading && (
          <p className="font-sans text-xs text-cream/30 mb-6 tracking-wide">
            {displayProducts.length} {displayProducts.length === 1 ? 'piece' : 'pieces'} found
            {debouncedSearch && ` for "${debouncedSearch}"`}
          </p>
        )}

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full bg-charcoal-light" />
                <Skeleton className="h-4 w-3/4 bg-charcoal-light" />
                <Skeleton className="h-4 w-1/2 bg-charcoal-light" />
              </div>
            ))}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-serif text-2xl text-cream/30 mb-3">No pieces found</p>
            <p className="font-sans text-sm text-cream/20">
              {debouncedSearch ? 'Try a different search term' : 'Check back soon for new arrivals'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayProducts.map(product => (
              <ProductCard
                key={product.id.toString()}
                product={product}
                highlighted={highlightId === product.id.toString()}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
