import { useEffect, useRef, useState, Suspense, lazy } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInitializeProducts } from '../hooks/useQueries';

const ThreeDScene = lazy(() => import('../components/ThreeDScene'));

export default function LandingPage() {
  const navigate = useNavigate();
  const initProducts = useInitializeProducts();
  const [sceneLoaded, setSceneLoaded] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initProducts.mutate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const timer = setTimeout(() => setSceneLoaded(true), 300);
    const textTimer = setTimeout(() => setTextVisible(true), 800);
    return () => { clearTimeout(timer); clearTimeout(textTimer); };
  }, []);

  return (
    <div className="relative">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, oklch(0.10 0.005 260) 0%, oklch(0.14 0.006 260) 50%, oklch(0.10 0.005 260) 100%)'
        }}
      >
        {/* Background image */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(/assets/generated/hero-bg.dim_1920x1080.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* 3D Scene */}
        <div className="absolute inset-0 z-0">
          <Suspense fallback={null}>
            {sceneLoaded && <ThreeDScene />}
          </Suspense>
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 landing-overlay z-10" />

        {/* Hero Content */}
        <div
          className={`relative z-20 text-center px-6 max-w-4xl mx-auto transition-all duration-1000 ${
            textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Brand mark */}
          <div className="flex justify-center mb-6">
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-gold/60 to-transparent" />
          </div>

          <p className="font-sans text-xs tracking-[0.5em] text-gold uppercase mb-4 animate-fade-in">
            New Collection 2026
          </p>

          <h1 className="font-serif text-7xl md:text-9xl text-cream leading-none tracking-tight mb-6">
            JADE
          </h1>

          <div className="flex justify-center mb-6">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
          </div>

          <p className="font-sans text-base md:text-lg text-cream/60 tracking-wide max-w-md mx-auto mb-12 leading-relaxed">
            Where luxury meets intention. Curated pieces for the discerning wardrobe.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => navigate({ to: '/catalog', search: { highlight: undefined, category: undefined } })}
              className="bg-gold text-charcoal hover:bg-gold-light font-sans tracking-[0.2em] text-xs uppercase px-10 h-12 transition-all duration-300 hover:shadow-[0_0_30px_oklch(0.78_0.09_85/0.4)]"
            >
              Explore Collection
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/track-order' })}
              className="border-cream/20 text-cream/70 hover:border-gold/50 hover:text-gold font-sans tracking-[0.2em] text-xs uppercase px-10 h-12 bg-transparent transition-all duration-300"
            >
              Track Order
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-bounce">
          <span className="font-sans text-xs text-cream/30 tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-4 h-4 text-gold/50" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-charcoal">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-sans text-xs tracking-[0.4em] text-gold uppercase mb-4">The Jade Experience</p>
            <h2 className="font-serif text-4xl md:text-5xl text-cream">Crafted for You</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: 'Curated Collection',
                desc: 'Each piece is thoughtfully selected to complement your lifestyle and elevate your wardrobe.',
                icon: '◈',
              },
              {
                title: 'Timeless Design',
                desc: 'Pieces that transcend seasons — investment dressing for the modern individual.',
                icon: '◇',
              },
              {
                title: 'Effortless Style',
                desc: 'Our AI style advisor helps you discover outfits that speak to your unique aesthetic.',
                icon: '◉',
              },
            ].map((feature, i) => (
              <div key={i} className="text-center group">
                <div className="text-3xl text-gold mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-serif text-xl text-cream mb-3">{feature.title}</h3>
                <p className="font-sans text-sm text-cream/50 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-24 px-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, oklch(0.14 0.006 260), oklch(0.18 0.008 260))'
        }}
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'url(/assets/generated/hero-bg.dim_1920x1080.png)',
            backgroundSize: 'cover',
          }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-5xl text-cream mb-6">
            Discover Your <span className="text-gold italic">Signature</span> Look
          </h2>
          <p className="font-sans text-base text-cream/50 mb-10 leading-relaxed">
            Browse our curated catalog and let our AI style advisor guide you to your perfect outfit.
          </p>
          <Button
            onClick={() => navigate({ to: '/catalog', search: { highlight: undefined, category: undefined } })}
            className="bg-gold text-charcoal hover:bg-gold-light font-sans tracking-[0.2em] text-xs uppercase px-12 h-14 transition-all duration-300 group"
          >
            Shop Now
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>
    </div>
  );
}
