import { useCallback, useEffect, useRef, useState } from 'react';
import { ShoppingCart, Phone, ArrowRight } from 'lucide-react';
import { WHATSAPP_LINK } from '../utils/whatsappCompiler';

interface Slide {
  id: string;
  tag: string;
  headline: string;
  highlight: string;
  sub: string;
  bg: string;
  accent: string;
  cta: string;
  imagePlaceholder: string;
}

const SLIDES: Slide[] = [
  {
    id: 'mrt',
    tag: 'P4 Slimming Program · Step 1',
    headline: 'Manage your weight with',
    highlight: 'MRT Complex',
    sub: 'Meal Replacement Therapy packed with nutrients. Real results, no shortcuts.',
    bg: 'from-blue-800 to-blue-950',
    accent: 'text-blue-300',
    cta: 'Order MRT Complex',
    imagePlaceholder: 'MRT',
  },
  {
    id: 'splina',
    tag: 'Health & Wellness · Bestseller',
    headline: 'Detox and energise with',
    highlight: 'Splina Chlorophyll',
    sub: "Nature's green miracle — alkalises your body, boosts energy, fights toxins.",
    bg: 'from-green-800 to-green-950',
    accent: 'text-green-300',
    cta: 'Order Splina',
    imagePlaceholder: 'SPL',
  },
  {
    id: 'spirulina',
    tag: 'Health & Wellness · Superfood',
    headline: 'Power your body with',
    highlight: 'Hawaiian Spirulina',
    sub: 'Premium blue-green algae rich in protein, antioxidants, and essential nutrients.',
    bg: 'from-teal-800 to-teal-950',
    accent: 'text-teal-300',
    cta: 'Order Spirulina',
    imagePlaceholder: 'SPR',
  },
  {
    id: 'ginseng',
    tag: 'Lifestyle Beverages · Energy',
    headline: 'Start your morning with',
    highlight: 'Ginseng Coffee',
    sub: 'Premium Korean ginseng extract blended into a rich, smooth coffee. No jitters.',
    bg: 'from-amber-800 to-amber-950',
    accent: 'text-amber-300',
    cta: 'Order Ginseng Coffee',
    imagePlaceholder: 'GNS',
  },
  {
    id: 'cocollagen',
    tag: 'Lifestyle Beverages · Beauty',
    headline: 'Glow from within with',
    highlight: 'Cocollagen',
    sub: 'Collagen-rich chocolate drink for radiant skin, stronger joints, better sleep.',
    bg: 'from-rose-800 to-rose-950',
    accent: 'text-rose-300',
    cta: 'Order Cocollagen',
    imagePlaceholder: 'COC',
  },
];

const INTERVAL = 4500;

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const progressKey = useRef(0);

  const go = useCallback((i: number) => {
    progressKey.current += 1;
    setCurrent(i);
  }, []);

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
      {/* All slides stacked — cross-fade via opacity only, no layout shift */}
      <div className="relative">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.id}
            className={`bg-gradient-to-br ${slide.bg} text-white transition-opacity duration-700 ease-in-out ${
              i === current ? 'opacity-100 relative' : 'opacity-0 absolute inset-0'
            }`}
            aria-hidden={i !== current}
          >
            <div className="max-w-lg mx-auto px-5 pt-8 pb-10 flex gap-4 items-center">

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <span className="inline-block px-3 py-1 bg-white/10 border border-white/15 rounded-full text-[10px] font-medium mb-3 tracking-wide">
                  {slide.tag}
                </span>

                <h2 className="text-xl font-semibold leading-snug mb-2">
                  {slide.headline}{' '}
                  <span className={slide.accent}>{slide.highlight}</span>
                </h2>

                <p className="text-white/75 text-xs leading-relaxed mb-5">
                  {slide.sub}
                </p>

                <div className="flex gap-2">
                  <a
                    href="#products"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-gray-900 rounded-[8px] text-xs font-semibold hover:bg-gray-100 transition-colors"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    {slide.cta}
                    <ArrowRight className="w-3 h-3" />
                  </a>
                  <a
                    href={WHATSAPP_LINK}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-green-600 text-white rounded-[8px] text-xs font-semibold hover:bg-green-700 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    WhatsApp
                  </a>
                </div>
              </div>

              {/* Product image placeholder */}
              <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-white/10 border border-white/15 flex flex-col items-center justify-center gap-1">
                {/* Replace with <img> when real product photos are ready */}
                <span className="text-xl font-semibold text-white/60 tracking-widest">{slide.imagePlaceholder}</span>
                <span className="text-[9px] text-white/40 font-medium">Product image</span>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Screen-reader slide position announcement only — no visible indicators */}
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
