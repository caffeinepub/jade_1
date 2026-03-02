import Header from './Header';
import CartSidebar from './CartSidebar';
import ChatWidget from './ChatWidget';
import { Heart } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'jade-fashion');

  return (
    <div className="min-h-screen bg-charcoal flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        {children}
      </main>

      <footer className="border-t border-gold/10 py-10 px-6 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/jade-logo.dim_400x400.png"
              alt="Jade"
              className="w-7 h-7 object-contain opacity-60"
            />
            <span className="font-serif text-sm text-cream/40 tracking-[0.2em]">JADE</span>
          </div>
          <p className="font-sans text-xs text-cream/30 text-center">
            © {year} Jade. All rights reserved.
          </p>
          <p className="font-sans text-xs text-cream/30 flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-gold fill-gold" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold-light transition-colors underline underline-offset-2"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      <CartSidebar />
      <ChatWidget />
    </div>
  );
}
