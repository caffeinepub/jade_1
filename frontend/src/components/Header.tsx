import { useState } from 'react';
import { Link, useNavigate, useLocation } from '@tanstack/react-router';
import { ShoppingBag, Menu, X, Package, LogIn, LogOut, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

type NavLink = {
  label: string;
  path: string;
  category?: string;
};

const navLinks: NavLink[] = [
  { label: 'Collection', path: '/catalog' },
  { label: "Men's", path: '/catalog', category: 'mens' },
  { label: "Women's", path: '/catalog', category: 'womens' },
  { label: 'Shoes', path: '/catalog', category: 'shoes' },
  { label: 'Track Order', path: '/track-order' },
];

function abbreviatePrincipal(principal: string): string {
  if (!principal) return '';
  const parts = principal.split('-');
  if (parts.length <= 2) return principal.slice(0, 8) + '…';
  return `${parts[0]}…${parts[parts.length - 1]}`;
}

export default function Header() {
  const { totalItems, setIsOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, clear, loginStatus, identity, isInitializing } = useInternetIdentity();

  const isActive = (path: string) => location.pathname === path;
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  const principalStr = identity?.getPrincipal().toString() ?? '';
  const abbreviated = abbreviatePrincipal(principalStr);

  const handleNavClick = (link: NavLink, closeMobile = false) => {
    if (closeMobile) setMobileOpen(false);
    if (link.path === '/catalog') {
      navigate({
        to: '/catalog',
        search: { highlight: undefined, category: link.category },
      });
    } else {
      navigate({ to: link.path as '/track-order' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-charcoal/90 backdrop-blur-md border-b border-gold/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/assets/generated/jade-logo.dim_400x400.png"
            alt="Jade"
            className="w-9 h-9 object-contain rounded-sm"
          />
          <span className="font-serif text-xl tracking-[0.2em] text-cream group-hover:text-gold transition-colors duration-300">
            JADE
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link)}
              className={`font-sans text-sm tracking-widest uppercase transition-colors duration-300 bg-transparent border-0 cursor-pointer ${
                isActive(link.path) ? 'text-gold' : 'text-cream/70 hover:text-cream'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '/track-order' })}
            className="hidden md:flex text-cream/70 hover:text-gold hover:bg-gold/10 transition-colors"
            title="Track Order"
          >
            <Package className="w-5 h-5" />
          </Button>

          {/* Profile icon — desktop */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '/profile' })}
            className={`hidden md:flex transition-colors ${
              isActive('/profile')
                ? 'text-gold bg-gold/10'
                : isAuthenticated
                ? 'text-gold/80 hover:text-gold hover:bg-gold/10'
                : 'text-cream/70 hover:text-gold hover:bg-gold/10'
            }`}
            title="My Profile"
          >
            {isAuthenticated ? (
              <Avatar className="w-6 h-6">
                <AvatarFallback className="bg-gold text-charcoal text-xs font-bold">
                  <User className="w-3.5 h-3.5" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <User className="w-5 h-5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(true)}
            className="relative text-cream/70 hover:text-gold hover:bg-gold/10 transition-colors"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold text-charcoal text-xs font-bold flex items-center justify-center">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Button>

          {/* Auth — desktop */}
          <div className="hidden md:flex items-center">
            {isInitializing ? (
              <div className="w-8 h-8 rounded-full border border-gold/20 animate-pulse bg-gold/5" />
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 hover:bg-gold/15 hover:border-gold/60 transition-all duration-300 px-3 py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                    title="Account"
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="bg-gold text-charcoal text-xs font-bold">
                        <User className="w-3.5 h-3.5" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-sans text-xs text-gold tracking-wide max-w-[90px] truncate">
                      {abbreviated}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-charcoal border border-gold/20 text-cream shadow-luxury min-w-[200px]"
                >
                  <DropdownMenuLabel className="font-sans text-xs text-cream/40 tracking-widest uppercase px-3 py-2">
                    Signed In
                  </DropdownMenuLabel>
                  <div className="px-3 py-1 mb-1">
                    <p className="font-sans text-xs text-gold/80 break-all leading-relaxed">
                      {principalStr}
                    </p>
                  </div>
                  <DropdownMenuSeparator className="bg-gold/10" />
                  <DropdownMenuItem
                    onClick={() => navigate({ to: '/profile' })}
                    className="font-sans text-sm text-cream/70 hover:text-cream hover:bg-gold/10 cursor-pointer gap-2 focus:bg-gold/10 focus:text-cream"
                  >
                    <User className="w-4 h-4 text-gold/60" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gold/10" />
                  <DropdownMenuItem
                    onClick={clear}
                    className="font-sans text-sm text-cream/70 hover:text-cream hover:bg-gold/10 cursor-pointer gap-2 focus:bg-gold/10 focus:text-cream"
                  >
                    <LogOut className="w-4 h-4 text-gold/60" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={login}
                disabled={isLoggingIn}
                className="font-sans text-xs tracking-widest uppercase text-gold border border-gold/30 hover:bg-gold/10 hover:border-gold/60 hover:text-gold transition-all duration-300 px-4 h-8 rounded-sm disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full border-2 border-gold/40 border-t-gold animate-spin" />
                    Signing In…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="w-3.5 h-3.5" />
                    Sign In
                  </span>
                )}
              </Button>
            )}
          </div>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-cream/70 hover:text-gold hover:bg-gold/10"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden bg-charcoal border-t border-gold/10 px-6 py-4 flex flex-col gap-4">
          {navLinks.map(link => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link, true)}
              className={`font-sans text-sm tracking-widest uppercase py-2 transition-colors duration-300 text-left bg-transparent border-0 cursor-pointer ${
                isActive(link.path) ? 'text-gold' : 'text-cream/70'
              }`}
            >
              {link.label}
            </button>
          ))}

          {/* Profile link — mobile */}
          <button
            onClick={() => { navigate({ to: '/profile' }); setMobileOpen(false); }}
            className={`flex items-center gap-2 font-sans text-sm tracking-widest uppercase py-2 text-left bg-transparent border-0 cursor-pointer transition-colors duration-300 ${
              isActive('/profile') ? 'text-gold' : isAuthenticated ? 'text-gold/70' : 'text-cream/70'
            }`}
          >
            <User className="w-4 h-4" />
            {isAuthenticated ? (
              <span className="flex items-center gap-2">
                Profile
                <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" />
              </span>
            ) : (
              'Profile'
            )}
          </button>

          {/* Auth — mobile */}
          <div className="pt-2 border-t border-gold/10">
            {isInitializing ? (
              <div className="h-9 rounded-sm border border-gold/20 animate-pulse bg-gold/5" />
            ) : isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-1 py-1">
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="bg-gold text-charcoal text-xs font-bold">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-sans text-xs text-gold/80 truncate max-w-[200px]">
                    {abbreviated}
                  </span>
                </div>
                <button
                  onClick={() => { clear(); setMobileOpen(false); }}
                  className="flex items-center gap-2 font-sans text-sm tracking-widest uppercase py-2 text-left text-cream/70 hover:text-gold bg-transparent border-0 cursor-pointer transition-colors duration-300"
                >
                  <LogOut className="w-4 h-4 text-gold/60" />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => { login(); setMobileOpen(false); }}
                disabled={isLoggingIn}
                className="flex items-center gap-2 font-sans text-sm tracking-widest uppercase py-2 text-left text-gold bg-transparent border-0 cursor-pointer transition-colors duration-300 disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-gold/40 border-t-gold animate-spin" />
                    Signing In…
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
