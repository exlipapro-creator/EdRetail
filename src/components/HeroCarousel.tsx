import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Phone } from 'lucide-react';
import { motionTokens } from '../design/motion';
import { WHATSAPP_LINK } from '../utils/whatsappCompiler';

interface Slide {
  id: string;
  image: string;
  alt: string;
  ctaLabel: string;
  ctaHref: string;
}

const SLIDES: Slide[] = [
  {
    id: 'ginseng',
    image: '/hero/hero-ginseng.png',
    alt: 'Start Your Day the Edmark Way — Ginseng Coffee',
    ctaLabel: 'Shop Now',
    ctaHref: '#products',
  },
  {
    id: 'splina',
    image: '/hero/hero-splina.png',
    alt: 'Nourish Your Body Every Day — Splina Chlorophyll',
    ctaLabel: 'Shop Now',
    ctaHref: '#products',
  },
  {
    id: 'mrt-metabolism',
    image: '/hero/hero-mrt-metabolism.png',
    alt: 'Power Your Metabolism Naturally — MRT Complex',
    ctaLabel: 'Shop Now',
    ctaHref: '#products',
  },
  {
    id: 'mrt-balance',
    image: '/hero/hero-mrt-balance.png',
    alt: 'Balance Your Health Inside & Out — MRT Complex',
    ctaLabel: 'Shop Now',
    ctaHref: '#products',
  },
  {
    id: 'shakeoff-1',
    image: '/hero/hero-shakeoff-1.png',
    alt: 'Shake Off — Feel Light. Live Right.',
    ctaLabel: 'Shop Now',
    ctaHref: '#products',
  },
  {
    id: 'shakeoff-2',
    image: '/hero/hero-shakeoff-2.png',
    alt: 'Shake Off Your Daily Cleanse',
    ctaLabel: 'Shop Now',
    ctaHref: '#products',
  },
];

const INTERVAL = 8000;

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused]   = useState(false);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % SLIDES.length);
  }, []);

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
      {/* Slide stack */}
      <div className="relative w-full" style={{ aspectRatio: '1 / 1' }}>
        <AnimatePresence mode="wait">
          {SLIDES.map((slide, i) => i === current && (
            <motion.div
              key={slide.id}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={motionTokens.easings.heroFade}
            >
              {/* Campaign image — full bleed */}
              <img
                src={slide.image}
                alt={slide.alt}
                className="w-full h-full object-cover object-center"
              />

              {/* Bottom CTA overlay — subtle dark gradient + buttons */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent px-5 pt-10 pb-5">
                <div className="flex gap-3 max-w-lg mx-auto">
                  <a
                    href={slide.ctaHref}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors shadow-md"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {slide.ctaLabel}
                  </a>
                  <a
                    href={WHATSAPP_LINK}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/15 hover:bg-white/25 border border-white/40 text-white rounded-xl text-sm font-semibold backdrop-blur-sm transition-colors shadow-md"
                  >
                    <Phone className="w-4 h-4" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-1.5">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => { setCurrent(i); setPaused(true); }}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 outline-none [-webkit-tap-highlight-color:transparent] ${
              i === current ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>

      {/* Screen-reader announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {`Slide ${current + 1} of ${SLIDES.length}: ${SLIDES[current].alt}`}
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
