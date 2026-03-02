import { useRef, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { X, Plus, Minus, ShoppingBag, Trash2, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { usePlaceOrder } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { OrderItem } from '../backend';

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

export default function CartSidebar() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice, isOpen, setIsOpen } = useCart();
  const placeOrder = usePlaceOrder();
  const navigate = useNavigate();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    const orderItems: OrderItem[] = items.map(i => ({
      product: i.product,
      quantity: BigInt(i.quantity),
    }));
    try {
      const orderId = await placeOrder.mutateAsync(orderItems);
      clearCart();
      setIsOpen(false);
      navigate({ to: '/order-confirmation', search: { orderId: orderId.toString() } });
    } catch (err) {
      console.error('Order failed:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-charcoal border-l border-gold/20 flex flex-col shadow-luxury animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gold/10">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-gold" />
            <h2 className="font-serif text-lg text-cream tracking-wide">Your Cart</h2>
            {items.length > 0 && (
              <span className="text-xs text-cream/50 font-sans">({items.length} {items.length === 1 ? 'item' : 'items'})</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-cream/50 hover:text-cream hover:bg-gold/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
            <ShoppingBag className="w-16 h-16 text-gold/20" />
            <p className="font-serif text-xl text-cream/50">Your cart is empty</p>
            <p className="font-sans text-sm text-cream/30">Discover our collection and add your favorites</p>
            <Button
              onClick={() => { setIsOpen(false); navigate({ to: '/catalog', search: { highlight: undefined, category: undefined } }); }}
              className="mt-2 bg-gold text-charcoal hover:bg-gold-light font-sans tracking-widest text-xs uppercase"
            >
              Browse Collection
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.product.id.toString()} className="flex gap-4 py-4 border-b border-gold/10 last:border-0">
                    <div className="w-20 h-24 rounded-sm overflow-hidden bg-charcoal-light shrink-0">
                      <img
                        src={getProductImageSrc(item.product.imageUrl, item.product.category)}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/generated/product-top.dim_600x800.png';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-sm text-cream leading-tight mb-1">{item.product.name}</h3>
                      <p className="font-sans text-xs text-cream/40 capitalize mb-3">{item.product.category}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 border border-gold/20 rounded-sm">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-cream/60 hover:text-gold transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-sans text-sm text-cream">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-cream/60 hover:text-gold transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-sans text-sm text-gold font-medium">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="text-cream/30 hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="px-6 py-5 border-t border-gold/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-sans text-sm text-cream/60 tracking-wide uppercase">Total</span>
                <span className="font-serif text-xl text-gold">${totalPrice.toFixed(2)}</span>
              </div>
              <Separator className="bg-gold/10" />
              <Button
                onClick={handlePlaceOrder}
                disabled={placeOrder.isPending}
                className="w-full bg-gold text-charcoal hover:bg-gold-light font-sans tracking-widest text-xs uppercase h-12 transition-all duration-300"
              >
                {placeOrder.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                ) : (
                  'Place Order'
                )}
              </Button>
              {placeOrder.isError && (
                <p className="text-destructive text-xs text-center font-sans">
                  Failed to place order. Please try again.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
