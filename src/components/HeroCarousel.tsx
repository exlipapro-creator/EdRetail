import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, MessageCircle } from 'lucide-react';
import { motionTokens } from '../design/motion';
import { getActiveWhatsAppLink } from '../utils/whatsappCompiler';
import { useDistributorStore } from '../store/distributorStore';
import { useLang } from '../context/LangContext';
import { ScreenId } from './navigation/AppHeader';

interface Slide {
  id: string;
  image: string;
  titleEn: string;
  titleSw: string;
  ctaEn: string;
  ctaSw: string;
}

/**
 * Hero banners are complete, art-directed marketing compositions supplied by
 * EdRetail (real product artwork). The artwork carries its own headline/copy,
 * so the carousel renders it clean — no duplicate text overlay — and adds
 * only a compact CTA row over a subtle bottom scrim.
 */
const SLIDES: Slide[] = [
  {
    id: 'shake-off',
    image: '/hero/hero-shakeoff.jpg',
    titleEn: 'Shake Off Phyto Fiber',
    titleSw: 'Shake Off Phyto Fiber',
    ctaEn: 'Shop Shake Off',
    ctaSw: 'Nunua Shake Off',
  },
  {
    id: 'spirulina',
    image: '/hero/hero-spirulina.jpg',
    titleEn: 'Hawaiian Spirulina',
    titleSw: 'Hawaiian Spirulina',
    ctaEn: 'Shop Spirulina',
    ctaSw: 'Nunua Spirulina',
  },
  {
    id: 'troika',
    image: '/hero/hero-troika.jpg',
    titleEn: 'Café Troika Premium Coffee',
    titleSw: 'Café Troika Kahawa Bora',
    ctaEn: 'Shop Troika',
    ctaSw: 'Nunua Troika',
  },
  {
    id: 'cocollagen',
    image: '/hero/hero-cocollagen.jpg',
    titleEn: 'CoCollagen Chocolate Drink',
    titleSw: 'Kinywaji cha CoCollagen',
    ctaEn: 'Shop CoCollagen',
    ctaSw: 'Nunua CoCollagen',
  },
];

const INTERVAL = 7000;

interface HeroCarouselProps {
  onNavigate?: (screen: ScreenId) => void;
}

export function HeroCarousel({ onNavigate }: HeroCarouselProps) {
  const { lang } = useLang();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const distributor = useDistributorStore((s) => s.getActiveDistributor());

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, INTERVAL);
    return () => clearInterval(t);
  }, [next, paused]);

  const slide = SLIDES[current];
  const title = lang === 'sw' ? slide.titleSw : slide.titleEn;

  return (
    <section
      id="featured-wellness-banner"
      className="relative rounded-none sm:rounded-3xl overflow-hidden bg-stone-900 border-y sm:border border-stone-800/60 sm:border-stone-200/80 shadow-none sm:shadow-2xs w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative w-full min-h-[260px] sm:min-h-[300px] flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            className="absolute inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={motionTokens.easings.heroFade}
          >
            <img
              src={slide.image}
              alt={title}
              className="w-full h-full object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>

        {/* Bottom scrim — legibility for the CTA row only; artwork stays clean */}
        <div className="absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />

        {/* CTA row */}
        <div className="absolute bottom-3 left-4 z-20 flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate ? onNavigate('products') : undefined}
            className="px-4 py-2 bg-[#123B6D] hover:bg-[#0D315D] text-white rounded-xl text-xs font-black shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-white/20"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{lang === 'sw' ? slide.ctaSw : slide.ctaEn}</span>
          </button>

          <a
            href={getActiveWhatsAppLink(
              `Habari ${distributor.name}, ninahitaji maelezo na kuagiza ${title}:`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white border border-white/30 rounded-xl text-xs font-bold backdrop-blur-xs transition-colors flex items-center gap-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#0E6B52]" />
            <span>{lang === 'sw' ? 'Uliza WhatsApp' : 'Ask on WhatsApp'}</span>
          </a>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-5 right-4 z-20 flex gap-1.5">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => {
                setCurrent(i);
                setPaused(true);
              }}
              aria-label={`Slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                i === current ? 'w-6 bg-emerald-400' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
