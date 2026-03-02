import { useState } from 'react';
import { Search, Package, AlertCircle, Loader2, LogIn, LogOut, User, ShieldCheck } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetOrder } from '../hooks/useQueries';
import OrderStatusTimeline from '../components/OrderStatusTimeline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

function abbreviatePrincipal(principal: string): string {
  if (!principal) return '';
  if (principal.length <= 16) return principal;
  return `${principal.slice(0, 8)}…${principal.slice(-4)}`;
}

const categoryLabels: Record<string, string> = {
  tops: 'Tops',
  bottoms: 'Bottoms',
  dresses: 'Dresses',
  accessories: 'Accessories',
  mens: "Men's",
  womens: "Women's",
  shoes: 'Shoes',
};

function getProductImageSrc(imageUrl: string, category: string): string {
  if (imageUrl.startsWith('ic://')) {
    const catMap: Record<string, string> = {
      dresses: '/assets/generated/product-dress.dim_600x800.png',
      tops: '/assets/generated/product-top.dim_600x800.png',
      bottoms: '/assets/generated/product-trousers.dim_600x800.png',
      accessories: '/assets/generated/product-blazer.dim_600x800.png',
      mens: '/assets/generated/product-blazer.dim_600x800.png',
      womens: '/assets/generated/product-dress.dim_600x800.png',
      shoes: '/assets/generated/product-trousers.dim_600x800.png',
    };
    return catMap[category] || '/assets/generated/product-top.dim_600x800.png';
  }
  return imageUrl;
}

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function OrderLookup() {
  const [inputId, setInputId] = useState('');
  const [searchId, setSearchId] = useState<bigint | null>(null);
  const [inputError, setInputError] = useState('');

  const { data: order, isLoading, isError } = useGetOrder(searchId);

  const handleSearch = () => {
    const trimmed = inputId.trim();
    if (!trimmed) return;
    setInputError('');
    try {
      setSearchId(BigInt(trimmed));
    } catch {
      setInputError('Please enter a valid numeric order ID.');
      setSearchId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="bg-charcoal-light border border-gold/10 rounded-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Package className="w-5 h-5 text-gold" />
          <h3 className="font-serif text-lg text-cream">Look Up an Order</h3>
        </div>
        <p className="font-sans text-xs text-cream/50 mb-5 leading-relaxed">
          Enter your order ID to view its details and current status.
        </p>
        <div className="flex gap-3">
          <Input
            value={inputId}
            onChange={e => { setInputId(e.target.value); setInputError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="e.g. 1, 2, 3…"
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
              <><Search className="w-4 h-4 mr-2" />Find</>
            )}
          </Button>
        </div>
        {inputError && (
          <p className="font-sans text-xs text-destructive mt-2">{inputError}</p>
        )}
      </div>

      {/* Error */}
      {isError && searchId !== null && (
        <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/30 rounded-sm p-4">
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
        <div className="space-y-4 animate-fade-in">
          {/* Order Header */}
          <div className="bg-charcoal-light border border-gold/10 rounded-sm p-6">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-sans text-xs text-cream/40 tracking-widest uppercase mb-1">Order</p>
                <h4 className="font-serif text-2xl text-gold">#{order.id.toString()}</h4>
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
            <h4 className="font-serif text-base text-cream mb-4">Order Status</h4>
            <OrderStatusTimeline status={order.status} />
          </div>

          {/* Items */}
          <div className="bg-charcoal-light border border-gold/10 rounded-sm p-6">
            <h4 className="font-serif text-base text-cream mb-4">Items Ordered</h4>
            <div className="space-y-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-4 py-3 border-b border-gold/10 last:border-0">
                  <div className="w-14 h-18 rounded-sm overflow-hidden bg-charcoal shrink-0">
                    <img
                      src={getProductImageSrc(item.product.imageUrl, item.product.category)}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                      onError={e => {
                        (e.target as HTMLImageElement).src = '/assets/generated/product-top.dim_600x800.png';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-sm text-cream truncate">{item.product.name}</p>
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
  );
}

export default function ProfilePage() {
  const { login, clear, loginStatus, identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  const principalStr = identity?.getPrincipal().toString() ?? '';
  const abbreviated = abbreviatePrincipal(principalStr);

  return (
    <div className="min-h-screen bg-charcoal">
      {/* Page Header */}
      <div className="pt-16 pb-12 px-6 text-center border-b border-gold/10">
        <p className="font-sans text-xs tracking-[0.4em] text-gold uppercase mb-3">Jade</p>
        <h1 className="font-serif text-5xl md:text-6xl text-cream mb-4">My Profile</h1>
        <div className="flex justify-center">
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-16 space-y-10">
        {/* Account Section */}
        <section>
          <h2 className="font-sans text-xs tracking-[0.3em] text-gold uppercase mb-6">Account</h2>

          {isInitializing ? (
            <div className="bg-charcoal-light border border-gold/10 rounded-sm p-8 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border border-gold/20 animate-pulse bg-gold/5" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-32 bg-gold/10 rounded animate-pulse" />
                <div className="h-2 w-48 bg-gold/5 rounded animate-pulse" />
              </div>
            </div>
          ) : isAuthenticated ? (
            <div className="bg-charcoal-light border border-gold/10 rounded-sm p-6">
              <div className="flex items-start gap-4">
                <Avatar className="w-14 h-14 shrink-0">
                  <AvatarFallback className="bg-gold/20 border border-gold/30 text-gold">
                    <User className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-gold shrink-0" />
                    <span className="font-sans text-xs text-gold tracking-widest uppercase">Authenticated</span>
                  </div>
                  <p className="font-serif text-lg text-cream mb-1">{abbreviated}</p>
                  <p className="font-sans text-xs text-cream/40 break-all leading-relaxed">{principalStr}</p>
                </div>
              </div>

              <Separator className="my-5 bg-gold/10" />

              <div className="flex items-center justify-between">
                <p className="font-sans text-xs text-cream/40">
                  Signed in with Internet Identity
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clear}
                  className="font-sans text-xs tracking-widest uppercase text-cream/60 hover:text-gold hover:bg-gold/10 border border-gold/20 hover:border-gold/40 transition-all duration-300 px-4 h-8 rounded-sm gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-charcoal-light border border-gold/10 rounded-sm p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gold/5 border border-gold/20 flex items-center justify-center mx-auto mb-5">
                <User className="w-7 h-7 text-gold/60" />
              </div>
              <h3 className="font-serif text-xl text-cream mb-2">Welcome to Jade</h3>
              <p className="font-sans text-sm text-cream/50 mb-6 leading-relaxed max-w-sm mx-auto">
                Sign in to access your profile and look up your orders.
              </p>
              <Button
                onClick={login}
                disabled={isLoggingIn}
                className="bg-gold text-charcoal hover:bg-gold-light font-sans tracking-widest text-xs uppercase px-8 h-10 transition-all duration-300 disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing In…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </span>
                )}
              </Button>
            </div>
          )}
        </section>

        {/* My Orders Section */}
        <section>
          <h2 className="font-sans text-xs tracking-[0.3em] text-gold uppercase mb-6">My Orders</h2>

          {isAuthenticated ? (
            <OrderLookup />
          ) : (
            <div className="bg-charcoal-light border border-gold/10 rounded-sm p-8 text-center">
              <Package className="w-10 h-10 text-gold/30 mx-auto mb-4" />
              <p className="font-serif text-lg text-cream mb-2">Order History</p>
              <p className="font-sans text-sm text-cream/50 leading-relaxed max-w-sm mx-auto">
                Sign in to look up your past orders and track their status.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
