import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, MessageCircle } from 'lucide-react';
import { motionTokens } from '../design/motion';
import { getActiveWhatsAppLink } from '../utils/whatsappCompiler';
import { useDistributorStore } from '../store/distributorStore';
import { useLang } from '../context/LangContext';
import { ScreenId } from './navigation/AppHeader';
import { fetchPublishedHeroes, PublishedHero, isProductDestination, resolveProfileIdBySlug } from '../lib/heroes';
import { Product } from '../types';

const INTERVAL = 7000;

interface HeroCarouselProps {
  onNavigate?: (screen: ScreenId) => void;
  onSelectProduct?: (product: Product) => void;
}

/**
 * Hero banners come from persisted, published hero_slides records
 * (global + active-distributor scope). The artwork carries its own
 * headline/copy, so each slide renders clean — no duplicate text overlay —
 * with only a compact CTA row over a subtle bottom scrim.
 *
 * Honest empty state: with zero published heroes we show a neutral
 * EdRetail welcome band — no fake promotional content, and no hardcoded
 * slides silently overriding valid published content.
 */
export function HeroCarousel({ onNavigate, onSelectProduct }: HeroCarouselProps) {
  const { lang } = useLang();
  const [slides, setSlides] = useState<PublishedHero[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const distributor = useDistributorStore((s) => s.getActiveDistributor());
  const activeRefSlug = useDistributorStore((s) => s.activeRefSlug);
  const products = useDistributorStore((s) => s.getEffectiveProducts());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // The storefront's registry ids are presentation ids — hero ownership is
    // keyed to the real distributor_profiles.id, so resolve the active ref
    // slug against the DB. Unknown slugs resolve to null (global-only).
    resolveProfileIdBySlug(activeRefSlug)
      .then((profileId) => {
        if (cancelled) return;
        return fetchPublishedHeroes(profileId);
      })
      .then((rows) => {
        if (cancelled || !rows) return;
        setSlides(rows);
        setCurrent(0);
      })
      .catch(() => {
        if (cancelled) return;
        setSlides([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeRefSlug]);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % Math.max(slides.length, 1));
  }, [slides.length]);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const t = setInterval(next, INTERVAL);
    return () => clearInterval(t);
  }, [next, paused, slides.length]);

  // Loading: keep the previous carousel height without flashing content.
  if (loading) {
    return <div className="w-full min-h-[260px] sm:min-h-[300px] bg-stone-100 animate-pulse" aria-hidden />;
  }

  // Honest neutral state — no fake promotions when nothing is published.
  if (slides.length === 0) {
    return (
      <section
        id="featured-wellness-banner"
        className="relative rounded-none sm:rounded-3xl overflow-hidden bg-primary-600 border-y sm:border border-primary-700 sm:border-stone-200/80 shadow-none sm:shadow-2xs w-full"
      >
        <div className="relative w-full min-h-[200px] sm:min-h-[220px] flex flex-col items-center justify-center gap-3 px-6 text-center">
          <img src="/logo/wordmark.png" alt="ED Retail Tanzania" className="h-8 w-auto object-contain opacity-95" />
          <div>
            <h2 className="text-white font-extrabold text-lg sm:text-xl tracking-tight">
              {lang === 'sw' ? 'Bidhaa halisi za Edmark Tanzania' : 'Genuine Edmark wellness products in Tanzania'}
            </h2>
            <p className="text-primary-100 text-xs sm:text-sm mt-1 max-w-md mx-auto">
              {lang === 'sw'
                ? 'Kutoka kwa msambazaji wako wa karibu — dhamana ya uhalisi kila agizo.'
                : 'Delivered by your local authorized distributor — authenticity guaranteed on every order.'}
            </p>
          </div>
          <button
            onClick={() => onNavigate?.('products')}
            className="px-4 py-2 bg-white text-primary-700 rounded-xl text-xs font-black shadow-xs transition-colors cursor-pointer hover:bg-primary-50 flex items-center gap-1.5"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {lang === 'sw' ? 'Tazama Bidhaa' : 'Shop Products'}
          </button>
        </div>
      </section>
    );
  }

  const slide = slides[Math.min(current, slides.length - 1)];
  const title = lang === 'sw' ? slide.headline_sw || slide.headline_en : slide.headline_en || slide.headline_sw;
  const ctaLabel = lang === 'sw' ? slide.cta_sw || slide.cta_en : slide.cta_en || slide.cta_sw;
  const subhead = lang === 'sw' ? slide.subhead_sw || slide.subhead_en : slide.subhead_en || slide.subhead_sw;

  // Resolve the CTA to a real destination. A product that no longer exists
  // falls back to the catalog screen — never a dead button.
  const handleCta = () => {
    if (isProductDestination(slide.cta_destination)) {
      const pid = slide.cta_destination.slice('product:'.length);
      const product = products.find((p) => p.id === pid);
      if (product && onSelectProduct) {
        onSelectProduct(product);
        return;
      }
      onNavigate?.('products');
      return;
    }
    if (slide.cta_destination === 'goals') {
      onNavigate?.('goals');
      return;
    }
    if (slide.cta_destination === 'whatsapp') {
      const link = getActiveWhatsAppLink();
      if (link) window.open(link, '_blank', 'noopener,noreferrer');
      return;
    }
    onNavigate?.('products');
  };

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
              src={slide.imageUrl || '/logo/wordmark.png'}
              alt={subhead ? `${title}. ${subhead}` : title}
              className="w-full h-full object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>

        {/* Bottom scrim — legibility for the CTA row only; artwork stays clean */}
        <div className="absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />

        {/* CTA row */}
        <div className="absolute bottom-3 left-4 z-20 flex flex-wrap items-center gap-2.5">
          {ctaLabel && (
            <button
              onClick={handleCta}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-white/20"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>{ctaLabel}</span>
            </button>
          )}

          <a
            href={getActiveWhatsAppLink(
              lang === 'sw'
                ? `Habari ${distributor.name}, ninaomba maelezo na kuagiza ${title}:`
                : `Hello ${distributor.name}, I would like more details and to order ${title}:`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white border border-white/30 rounded-xl text-xs font-bold backdrop-blur-xs transition-colors flex items-center gap-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5 text-success-600" />
            <span>{lang === 'sw' ? 'Uliza WhatsApp' : 'Ask on WhatsApp'}</span>
          </a>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-5 right-4 z-20 flex gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => {
                setCurrent(i);
                setPaused(true);
              }}
              aria-label={`${lang === 'sw' ? 'Slaidi' : 'Slide'} ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                i === current ? 'w-6 bg-gold-400' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}