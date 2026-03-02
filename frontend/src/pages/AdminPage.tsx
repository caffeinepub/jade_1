import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Lock, Eye, EyeOff, Plus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useActor } from '../hooks/useActor';
import { Category } from '../backend';

const ADMIN_PASSWORD = 'Mrudani.jade.jyo.hem';
const SESSION_KEY = 'adminAuthenticated';

const CATEGORIES: { value: Category; label: string }[] = [
  { value: Category.mens, label: "Men's" },
  { value: Category.womens, label: "Women's" },
  { value: Category.shoes, label: 'Shoes' },
  { value: Category.tops, label: 'Tops' },
  { value: Category.bottoms, label: 'Bottoms' },
  { value: Category.dresses, label: 'Dresses' },
  { value: Category.accessories, label: 'Accessories' },
];

// ─── Password Gate ────────────────────────────────────────────────────────────

function PasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      onSuccess();
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
      inputRef.current?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center">
            <Lock className="w-7 h-7 text-gold" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl tracking-[0.15em] text-cream mb-2">ADMIN ACCESS</h1>
          <p className="font-sans text-sm text-cream/40 tracking-wide">
            Enter your password to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="admin-password" className="font-sans text-xs tracking-widest uppercase text-cream/60">
              Password
            </Label>
            <div className="relative">
              <Input
                ref={inputRef}
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter admin password"
                className="bg-charcoal border-gold/20 text-cream placeholder:text-cream/20 focus:border-gold/60 focus-visible:ring-gold/20 pr-10 font-sans"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/30 hover:text-gold transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-xs font-sans mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={!password}
            className="w-full bg-gold text-charcoal font-sans text-xs tracking-widest uppercase hover:bg-gold/90 transition-colors h-10 rounded-sm disabled:opacity-40"
          >
            Enter Admin Panel
          </Button>
        </form>
      </div>
    </div>
  );
}

// ─── Add Product Form ─────────────────────────────────────────────────────────

interface ProductFormState {
  name: string;
  price: string;
  imageUrl: string;
  category: Category | '';
}

const emptyForm: ProductFormState = { name: '', price: '', imageUrl: '', category: '' };

function AddProductForm() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: keyof ProductFormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;
    if (!form.name.trim() || !form.price || !form.imageUrl.trim() || !form.category) {
      setError('All fields are required.');
      return;
    }
    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) {
      setError('Please enter a valid price.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await actor.addProduct(form.name.trim(), price, form.imageUrl.trim(), form.category as Category);
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      setSuccess(true);
      setForm(emptyForm);
    } catch (err) {
      setError('Failed to add product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Product Name */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="product-name" className="font-sans text-xs tracking-widest uppercase text-cream/60">
          Product Name
        </Label>
        <Input
          id="product-name"
          value={form.name}
          onChange={e => handleChange('name', e.target.value)}
          placeholder="e.g. Silk Evening Gown"
          className="bg-charcoal border-gold/20 text-cream placeholder:text-cream/20 focus:border-gold/60 focus-visible:ring-gold/20 font-sans"
        />
      </div>

      {/* Price */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="product-price" className="font-sans text-xs tracking-widest uppercase text-cream/60">
          Price (USD)
        </Label>
        <Input
          id="product-price"
          type="number"
          min="0.01"
          step="0.01"
          value={form.price}
          onChange={e => handleChange('price', e.target.value)}
          placeholder="e.g. 149.99"
          className="bg-charcoal border-gold/20 text-cream placeholder:text-cream/20 focus:border-gold/60 focus-visible:ring-gold/20 font-sans"
        />
      </div>

      {/* Image URL */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="product-image" className="font-sans text-xs tracking-widest uppercase text-cream/60">
          Image URL
        </Label>
        <Input
          id="product-image"
          value={form.imageUrl}
          onChange={e => handleChange('imageUrl', e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="bg-charcoal border-gold/20 text-cream placeholder:text-cream/20 focus:border-gold/60 focus-visible:ring-gold/20 font-sans"
        />
      </div>

      {/* Category */}
      <div className="flex flex-col gap-2">
        <Label className="font-sans text-xs tracking-widest uppercase text-cream/60">
          Category
        </Label>
        <Select
          value={form.category}
          onValueChange={val => handleChange('category', val)}
        >
          <SelectTrigger className="bg-charcoal border-gold/20 text-cream focus:border-gold/60 focus:ring-gold/20 font-sans">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent className="bg-charcoal border border-gold/20 text-cream">
            {CATEGORIES.map(cat => (
              <SelectItem
                key={cat.value}
                value={cat.value}
                className="font-sans text-cream/80 hover:text-cream focus:bg-gold/10 focus:text-cream cursor-pointer"
              >
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Feedback */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-xs font-sans">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-sans">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          Product added successfully!
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting || !actor}
        className="w-full bg-gold text-charcoal font-sans text-xs tracking-widest uppercase hover:bg-gold/90 transition-colors h-10 rounded-sm disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Adding Product…
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            Add Product
          </>
        )}
      </Button>
    </form>
  );
}

// ─── Admin Panel Content ──────────────────────────────────────────────────────

function AdminContent({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-charcoal">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-gold" />
            <div>
              <h1 className="font-serif text-2xl tracking-[0.15em] text-cream">ADMIN PANEL</h1>
              <p className="font-sans text-xs text-cream/40 tracking-wide mt-0.5">Jade Product Management</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="font-sans text-xs tracking-widest uppercase text-cream/40 hover:text-gold transition-colors bg-transparent border-0 cursor-pointer"
          >
            Lock
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-gold/10 mb-10" />

        {/* Add Product Section */}
        <section>
          <div className="mb-6">
            <h2 className="font-serif text-lg tracking-[0.1em] text-cream mb-1">Add New Product</h2>
            <p className="font-sans text-xs text-cream/40 tracking-wide">
              Fill in the details below to add a new product to the catalog.
            </p>
          </div>
          <div className="border border-gold/10 rounded-sm bg-gold/[0.02] p-6">
            <AddProductForm />
          </div>
        </section>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === 'true'
  );

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthenticated(false);
  };

  if (!authenticated) {
    return <PasswordGate onSuccess={() => setAuthenticated(true)} />;
  }

  return <AdminContent onLogout={handleLogout} />;
}
