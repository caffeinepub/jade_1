import { useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { CheckCircle, Package, ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrderConfirmationPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/order-confirmation' });
  const orderId = (search as { orderId?: string }).orderId;

  useEffect(() => {
    if (!orderId) {
      navigate({ to: '/' });
    }
  }, [orderId, navigate]);

  if (!orderId) return null;

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-2 border-gold/30 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-gold" />
            </div>
            <div className="absolute inset-0 rounded-full border border-gold/10 animate-ping" />
          </div>
        </div>

        {/* Content */}
        <p className="font-sans text-xs tracking-[0.4em] text-gold uppercase mb-4">Order Confirmed</p>
        <h1 className="font-serif text-4xl md:text-5xl text-cream mb-4">
          Thank You
        </h1>
        <div className="flex justify-center mb-6">
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>
        <p className="font-sans text-base text-cream/60 mb-8 leading-relaxed">
          Your order has been placed successfully. We're preparing your pieces with care.
        </p>

        {/* Order ID */}
        <div className="bg-charcoal-light border border-gold/20 rounded-sm p-6 mb-8">
          <p className="font-sans text-xs text-cream/40 tracking-widest uppercase mb-2">Your Order ID</p>
          <p className="font-serif text-4xl text-gold">#{orderId}</p>
          <p className="font-sans text-xs text-cream/40 mt-2">
            Save this number to track your order
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate({ to: '/track-order' })}
            className="bg-gold text-charcoal hover:bg-gold-light font-sans tracking-widest text-xs uppercase px-8 h-12 transition-all duration-300 group"
          >
            <Package className="w-4 h-4 mr-2" />
            Track Order
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/catalog', search: { highlight: undefined, category: undefined } })}
            className="border-cream/20 text-cream/70 hover:border-gold/50 hover:text-gold font-sans tracking-widest text-xs uppercase px-8 h-12 bg-transparent transition-all duration-300"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
