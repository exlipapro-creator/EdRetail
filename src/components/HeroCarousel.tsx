import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, MessageCircle, Sparkles } from 'lucide-react';
import { motionTokens } from '../design/motion';
import { getActiveWhatsAppLink } from '../utils/whatsappCompiler';
import { useDistributorStore } from '../store/distributorStore';
import { useLang } from '../context/LangContext';
import { ScreenId } from './navigation/AppHeader';

interface Slide {
  id: string;
  image: string;
  taglineEn: string;
  taglineSw: string;
  titleEn: string;
  titleSw: string;
  descEn: string;
  descSw: string;
  ctaEn: string;
  ctaSw: string;
}

const SLIDES: Slide[] = [
  {
    id: 'splina',
    image: '/hero/hero-splina.png',
    taglineEn: 'Daily Essential Detox',
    taglineSw: 'Usafi wa Damu Kila Siku',
    titleEn: 'Splina Liquid Chlorophyll',
    titleSw: 'Splina Liquid Chlorophyll',
    descEn: 'Alkalises body pH, boosts red blood cell vitality, and purifies cellular waste.',
    descSw: 'Huondoa asidi mwilini, huimarisha uzalishaji wa damu, na kusafisha sumu mwilini.',
    ctaEn: 'Shop Splina',
    ctaSw: 'Nunua Splina',
  },
  {
    id: 'shakeoff',
    image: '/hero/hero-shakeoff-1.png',
    taglineEn: 'Colon Cleansing Power',
    taglineSw: 'Kusafisha Tumbo & Kitambi',
    titleEn: 'Shake Off Phyto Fiber',
    titleSw: 'Shake Off Phyto Fiber',
    descEn: 'Fast-acting botanical colon cleanse. Relieves constipation and flushes intestinal toxins.',
    descSw: 'Husafisha utumbo mkubwa ndani ya saa 8. Huondoa choo kigumu na kutoa gesi na sumu.',
    ctaEn: 'Shop Shake Off',
    ctaSw: 'Nunua Shake Off',
  },
  {
    id: 'ginseng',
    image: '/hero/hero-ginseng.png',
    taglineEn: 'Sustained Morning Energy',
    taglineSw: 'Nishati & Umakini wa Asubuhi',
    titleEn: 'Ginseng Herbal Coffee',
    titleSw: 'Kahawa ya Ginseng',
    descEn: 'Korean ginseng extract for natural stamina and mental sharpness without coffee jitters.',
    descSw: 'Kahawa bora yenye dondoo ya ginseng ya Korea. Huamsha nguvu na umakini kazini bila mshtuko.',
    ctaEn: 'Shop Ginseng',
    ctaSw: 'Nunua Ginseng',
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

  return (
    <section
      id="featured-wellness-banner"
      className="relative rounded-3xl overflow-hidden bg-stone-900 border border-stone-200/80 shadow-2xs"
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
              alt={lang === 'sw' ? slide.titleSw : slide.titleEn}
              className="w-full h-full object-cover object-center brightness-[0.45]"
            />
          </motion.div>
        </AnimatePresence>

        {/* Content Overlay */}
        <div className="relative z-10 p-5 sm:p-8 max-w-xl text-white space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-black uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>{lang === 'sw' ? slide.taglineSw : slide.taglineEn}</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
            {lang === 'sw' ? slide.titleSw : slide.titleEn}
          </h3>

          <p className="text-xs sm:text-sm text-stone-200 leading-relaxed max-w-md">
            {lang === 'sw' ? slide.descSw : slide.descEn}
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              onClick={() => onNavigate ? onNavigate('products') : undefined}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>{lang === 'sw' ? slide.ctaSw : slide.ctaEn}</span>
            </button>

            <a
              href={getActiveWhatsAppLink(
                `Habari ${distributor.name}, ninahitaji maelezo na kuagiza ${lang === 'sw' ? slide.titleSw : slide.titleEn}:`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white border border-white/30 rounded-xl text-xs font-bold backdrop-blur-xs transition-colors flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'sw' ? 'Uliza WhatsApp' : 'Ask on WhatsApp'}</span>
            </a>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-3 right-4 z-20 flex gap-1.5">
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
