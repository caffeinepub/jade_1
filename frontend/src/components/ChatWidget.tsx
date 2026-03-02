import { useState, useRef, useEffect } from 'react';
import { X, Send, RotateCcw, Sparkles } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useChatHistory } from '../hooks/useChatHistory';
import { useAllProducts } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Product } from '../backend';

type ConversationStep = 'welcome' | 'style' | 'occasion' | 'color' | 'suggestions' | 'done';

const styleOptions = ['Casual', 'Formal', 'Trendy', 'Classic'];
const occasionOptions = ['Work', 'Evening Out', 'Weekend', 'Special Event'];
const colorOptions = ['Neutrals', 'Bold Colors', 'Pastels', 'Dark Tones'];

interface UserPreferences {
  style?: string;
  occasion?: string;
  color?: string;
}

function suggestOutfits(products: Product[], prefs: UserPreferences): Product[][] {
  const { occasion, style } = prefs;

  const tops = products.filter(p => p.category === 'tops');
  const bottoms = products.filter(p => p.category === 'bottoms');
  const dresses = products.filter(p => p.category === 'dresses');
  const accessories = products.filter(p => p.category === 'accessories');

  const outfits: Product[][] = [];

  // Outfit 1: Dress + accessory (for formal/evening)
  if ((occasion === 'Evening Out' || occasion === 'Special Event' || style === 'Formal') && dresses.length > 0) {
    const outfit: Product[] = [dresses[0]];
    if (accessories.length > 0) outfit.push(accessories[0]);
    outfits.push(outfit);
  }

  // Outfit 2: Top + bottom
  if (tops.length > 0 && bottoms.length > 0) {
    const outfit: Product[] = [tops[0], bottoms[0]];
    if (accessories.length > 0 && outfits.length < 2) outfit.push(accessories[0]);
    outfits.push(outfit);
  }

  // Outfit 3: Another combination
  if (tops.length > 1 && bottoms.length > 0) {
    outfits.push([tops[Math.min(1, tops.length - 1)], bottoms[0]]);
  } else if (dresses.length > 0 && outfits.length < 3) {
    outfits.push([dresses[0]]);
  }

  // Fallback: just show available products
  if (outfits.length === 0 && products.length > 0) {
    outfits.push(products.slice(0, Math.min(3, products.length)));
  }

  return outfits.slice(0, 3);
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<ConversationStep>('welcome');
  const [prefs, setPrefs] = useState<UserPreferences>({});
  const [inputValue, setInputValue] = useState('');
  const { messages, addMessage, resetChat } = useChatHistory();
  const { data: products = [] } = useAllProducts();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleReset = () => {
    resetChat();
    setStep('welcome');
    setPrefs({});
    setInputValue('');
  };

  const handleOptionSelect = (option: string) => {
    addMessage({ role: 'user', content: option });

    if (step === 'welcome') {
      setStep('style');
      setTimeout(() => {
        addMessage({
          role: 'bot',
          content: "Wonderful! What's your style preference?",
        });
      }, 400);
    } else if (step === 'style') {
      setPrefs(p => ({ ...p, style: option }));
      setStep('occasion');
      setTimeout(() => {
        addMessage({
          role: 'bot',
          content: "Perfect! What's the occasion?",
        });
      }, 400);
    } else if (step === 'occasion') {
      setPrefs(p => ({ ...p, occasion: option }));
      setStep('color');
      setTimeout(() => {
        addMessage({
          role: 'bot',
          content: "Great choice! What color palette do you prefer?",
        });
      }, 400);
    } else if (step === 'color') {
      const finalPrefs = { ...prefs, color: option };
      setPrefs(finalPrefs);
      setStep('suggestions');

      setTimeout(() => {
        if (products.length === 0) {
          addMessage({
            role: 'bot',
            content: "I'm curating your perfect outfits! Our collection is loading — please visit the catalog to explore all pieces.",
          });
          setStep('done');
          return;
        }

        const outfits = suggestOutfits(products, finalPrefs);

        if (outfits.length === 0) {
          addMessage({
            role: 'bot',
            content: "I'd love to suggest outfits! Visit our catalog to explore the full collection.",
          });
          setStep('done');
          return;
        }

        addMessage({
          role: 'bot',
          content: `Based on your ${finalPrefs.style?.toLowerCase()} style for ${finalPrefs.occasion?.toLowerCase()}, here are my curated outfit suggestions for you:`,
        });

        outfits.forEach((outfit, i) => {
          setTimeout(() => {
            addMessage({
              role: 'bot',
              content: `✨ Look ${i + 1}: ${outfit.map(p => p.name).join(' + ')}`,
              productLinks: outfit.map(p => ({ id: p.id, name: p.name })),
            });
          }, (i + 1) * 600);
        });

        setTimeout(() => {
          addMessage({
            role: 'bot',
            content: "Click any item above to view it in our catalog. Would you like to explore more?",
          });
          setStep('done');
        }, (outfits.length + 1) * 600);
      }, 600);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    addMessage({ role: 'user', content: inputValue });
    setInputValue('');
    setTimeout(() => {
      addMessage({
        role: 'bot',
        content: "Thank you! Feel free to browse our collection or start a new style consultation.",
      });
    }, 400);
  };

  const handleProductClick = (productId: bigint) => {
    setIsOpen(false);
    navigate({ to: '/catalog', search: { highlight: productId.toString(), category: undefined } });
  };

  const getOptions = () => {
    if (step === 'welcome') return ['Yes, let\'s start!'];
    if (step === 'style') return styleOptions;
    if (step === 'occasion') return occasionOptions;
    if (step === 'color') return colorOptions;
    return [];
  };

  const options = getOptions();

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gold text-charcoal flex items-center justify-center shadow-luxury hover:bg-gold-light transition-all duration-300 animate-pulse-gold"
        aria-label="Open style advisor"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-charcoal border border-gold/20 rounded-sm shadow-luxury flex flex-col animate-slide-up overflow-hidden"
          style={{ maxHeight: 'calc(100vh - 120px)', height: '520px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gold/10 bg-charcoal-light">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold" />
              <div>
                <p className="font-serif text-sm text-cream">Style Advisor</p>
                <p className="font-sans text-xs text-cream/40">Jade AI</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="text-cream/30 hover:text-gold transition-colors"
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 px-4 py-3" ref={scrollRef}>
            <div className="space-y-3">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-sm text-sm font-sans leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gold text-charcoal'
                        : 'bg-charcoal-light text-cream/90 border border-gold/10'
                    }`}
                  >
                    <p>{msg.content}</p>
                    {msg.productLinks && msg.productLinks.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.productLinks.map(link => (
                          <button
                            key={link.id.toString()}
                            onClick={() => handleProductClick(link.id)}
                            className="block w-full text-left text-xs text-gold hover:text-gold-light underline underline-offset-2 transition-colors"
                          >
                            → View {link.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          {/* Options / Input */}
          <div className="px-4 py-3 border-t border-gold/10 space-y-2">
            {options.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => handleOptionSelect(opt)}
                    className="px-3 py-1.5 text-xs font-sans border border-gold/30 text-gold hover:bg-gold hover:text-charcoal rounded-sm transition-all duration-200 tracking-wide"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 bg-charcoal-light border border-gold/20 rounded-sm px-3 py-2 text-xs font-sans text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold/50"
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="shrink-0 bg-gold text-charcoal hover:bg-gold-light w-9 h-9"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
