import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { motionTokens } from '../design/motion';

interface Slide {
  id: string;
  headline: string;
  highlight: string;
  sub: string;
  bg: string;
  accent: string;
  cta: string;
  image: string;
}

const SLIDES: Slide[] = [
  {
    id: 'mrt',
    headline: 'Manage your weight with',
    highlight: 'MRT Complex',
    sub: 'Meal Replacement Therapy packed with nutrients. Real results, no shortcuts.',
    bg: 'from-amber-800 to-amber-950',
    accent: 'text-amber-300',
    cta: 'Order MRT Complex',
    image: '/products/mrt-complex.png',
  },
  {
    id: 'splina',
    headline: 'Detox and energise with',
    highlight: 'Splina Chlorophyll',
    sub: "Nature's green miracle — alkalises your body, boosts energy, fights toxins.",
    bg: 'from-stone-700 to-stone-900',
    accent: 'text-stone-300',
    cta: 'Order Splina',
    image: '/products/splina.png',
  },
  {
    id: 'spirulina',
    headline: 'Power your body with',
    highlight: 'Hawaiian Spirulina',
    sub: 'Premium blue-green algae rich in protein, antioxidants, and essential nutrients.',
    bg: 'from-orange-800 to-orange-950',
    accent: 'text-orange-300',
    cta: 'Order Spirulina',
    image: '/products/spirulina.png',
  },
  {
    id: 'ginseng',
    headline: 'Start your morning with',
    highlight: 'Ginseng Coffee',
    sub: 'Premium Korean ginseng extract blended into a rich, smooth coffee. No jitters.',
    bg: 'from-yellow-800 to-yellow-950',
    accent: 'text-yellow-300',
    cta: 'Order Ginseng Coffee',
    image: '/products/ginseng-coffee.png',
  },
  {
    id: 'cocollagen',
    headline: 'Glow from within with',
    highlight: 'Cocollagen',
    sub: 'Collagen-rich chocolate drink for radiant skin, stronger joints, better sleep.',
    bg: 'from-amber-700 to-stone-900',
    accent: 'text-amber-300',
    cta: 'Order Cocollagen',
    image: '/products/cocollagen.png',
  },
];

const INTERVAL = 8000;

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused]   = useState(false);
  const prevRef = useRef(0);

  const go = useCallback((i: number) => {
    prevRef.current = current;
    setCurrent(i);
  }, [current]);

  const next = useCallback(() => {
    go((current + 1) % SLIDES.length);
  }, [current, go]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, INTERVAL);
    return () => clearInterval(t);
  }, [next, paused]);

  return (
    <section
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative" style={{ minHeight: 220 }}>
        <AnimatePresence mode="wait">
          {SLIDES.map((slide, i) => i === current && (
            <motion.div
              key={slide.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={motionTokens.easings.heroFade}
              className={`bg-gradient-to-br ${slide.bg} text-white`}
            >
              <div className="relative max-w-lg mx-auto px-5 pt-10 pb-14 overflow-hidden">

                {/* Decorative background image — atmospheric, not a thumbnail */}
                <img
                  src={slide.image}
                  alt=""
                  aria-hidden="true"
                  className="absolute right-0 top-1/2 -translate-y-1/2 h-[70%] w-auto object-contain opacity-10 pointer-events-none select-none"
                />

                {/* Text content */}
                <div className="relative z-10 max-w-[65%]">
                  <h2 className="text-2xl font-bold leading-tight mb-2">
                    {slide.headline}{' '}
                    <span className={slide.accent}>{slide.highlight}</span>
                  </h2>

                  <p className="text-white/70 text-sm leading-relaxed mb-6">
                    {slide.sub}
                  </p>

                  <a
                    href="#products"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {slide.cta}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Screen-reader slide position announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {`Slide ${current + 1} of ${SLIDES.length}: ${SLIDES[current].highlight}`}
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0 leading-none pointer-events-none">
        <svg viewBox="0 0 1440 40" fill="none" className="w-full h-auto" preserveAspectRatio="none">
          <path d="M0 40L60 34C120 28 240 18 360 16C480 14 600 18 720 24C840 30 960 36 1080 36C1200 36 1320 30 1380 27L1440 24V40H0Z" fill="#F9FAFB"/>
        </svg>
      </div>
    </section>
  );
}
