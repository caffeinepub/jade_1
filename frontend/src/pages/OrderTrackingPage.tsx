import { useState } from 'react';
import { Search, Package, AlertCircle, Loader2 } from 'lucide-react';
import { useGetOrder } from '../hooks/useQueries';
import OrderStatusTimeline from '../components/OrderStatusTimeline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const categoryLabels: Record<string, string> = {
  tops: 'Tops',
  bottoms: 'Bottoms',
  dresses: 'Dresses',
  accessories: 'Accessories',
};

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

export default function OrderTrackingPage() {
  const [inputId, setInputId] = useState('');
  const [searchId, setSearchId] = useState<bigint | null>(null);

  const { data: order, isLoading, isError } = useGetOrder(searchId);

  const handleSearch = () => {
    const trimmed = inputId.trim();
    if (!trimmed) return;
    try {
      setSearchId(BigInt(trimmed));
    } catch {
      setSearchId(null);
    }
  };

  const formatDate = (timestamp: bigint) => {
    const ms = Number(timestamp) / 1_000_000;
    return new Date(ms).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-charcoal">
      {/* Page Header */}
      <div className="pt-16 pb-12 px-6 text-center border-b border-gold/10">
        <p className="font-sans text-xs tracking-[0.4em] text-gold uppercase mb-3">Jade</p>
        <h1 className="font-serif text-5xl md:text-6xl text-cream mb-4">Track Order</h1>
        <div className="flex justify-center">
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Search */}
        <div className="bg-charcoal-light border border-gold/10 rounded-sm p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Package className="w-5 h-5 text-gold" />
            <h2 className="font-serif text-xl text-cream">Enter Your Order ID</h2>
          </div>
          <p className="font-sans text-sm text-cream/50 mb-6 leading-relaxed">
            Enter the order ID you received after placing your order to track its current status.
          </p>
          <div className="flex gap-3">
            <Input
              value={inputId}
              onChange={e => setInputId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. 1, 2, 3..."
              className="flex-1 bg-charcoal border-gold/20 text-cream placeholder:text-cream/30 focus:border-gold/50 font-sans"
            />
            <Button
              onClick={handleSearch}
              disabled={isLoading || !inputId.trim()}
              className="bg-gold text-charcoal hover:bg-gold-light font-sans tracking-widest text-xs uppercase px-6 transition-all duration-300"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <><Search className="w-4 h-4 mr-2" /> Track</>
              )}
            </Button>
          </div>
        </div>

        {/* Error */}
        {isError && searchId !== null && (
          <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/30 rounded-sm p-4 mb-8">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-sans text-sm text-destructive font-medium">Order not found</p>
              <p className="font-sans text-xs text-cream/50 mt-1">
                No order found with ID #{searchId.toString()}. Please check your order ID and try again.
              </p>
            </div>
          </div>
        )}

        {/* Order Details */}
        {order && (
          <div className="space-y-6 animate-fade-in">
            {/* Order Header */}
            <div className="bg-charcoal-light border border-gold/10 rounded-sm p-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-sans text-xs text-cream/40 tracking-widest uppercase mb-1">Order</p>
                  <h3 className="font-serif text-2xl text-gold">#{order.id.toString()}</h3>
                </div>
                <div className="text-right">
                  <p className="font-sans text-xs text-cream/40 tracking-widest uppercase mb-1">Total</p>
                  <p className="font-serif text-xl text-cream">${order.total.toFixed(2)}</p>
                </div>
              </div>
              <p className="font-sans text-xs text-cream/40 mt-3">
                Placed on {formatDate(order.timestamp)}
              </p>
            </div>

            {/* Status Timeline */}
            <div className="bg-charcoal-light border border-gold/10 rounded-sm p-6">
              <h3 className="font-serif text-lg text-cream mb-4">Order Status</h3>
              <OrderStatusTimeline status={order.status} />
            </div>

            {/* Items */}
            <div className="bg-charcoal-light border border-gold/10 rounded-sm p-6">
              <h3 className="font-serif text-lg text-cream mb-4">Items Ordered</h3>
              <div className="space-y-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex gap-4 py-3 border-b border-gold/10 last:border-0">
                    <div className="w-16 h-20 rounded-sm overflow-hidden bg-charcoal shrink-0">
                      <img
                        src={getProductImageSrc(item.product.imageUrl, item.product.category)}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/generated/product-top.dim_600x800.png';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-serif text-sm text-cream">{item.product.name}</p>
                      <p className="font-sans text-xs text-cream/40 capitalize mt-0.5">
                        {categoryLabels[item.product.category] || item.product.category}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="font-sans text-xs text-cream/50">Qty: {item.quantity.toString()}</p>
                        <p className="font-sans text-sm text-gold">
                          ${(item.product.price * Number(item.quantity)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
