import { useEffect, useRef, useState } from 'react';
import { Star, Quote, BadgeCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TESTIMONIALS as STATIC_TESTIMONIALS } from '../types';
import { useLang } from '../context/LangContext';
import { SectionHeader } from './ui';

interface TestimonialRow {
  id: string;
  name: string;
  location: string;
  product: string;
  text: string;
  result: string;
}

const CARD_W  = 252;
const GAP     = 12;
const INTERVAL = 3200;

function useTestimonials() {
  const [items, setItems]   = useState<TestimonialRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('testimonials')
      .select('id, name, location, product, text, result')
      .eq('visible', true)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setItems(data as TestimonialRow[]);
        } else {
          // Fallback to static JSON testimonials
          setItems(
            STATIC_TESTIMONIALS.map((t) => ({
              id: t.id,
              name: t.name,
              location: t.location,
              product: t.product,
              text: t.text.en,   // use English for static fallback
              result: t.result,
            }))
          );
        }
        setLoading(false);
      });
  }, []);

  return { items, loading };
}

export function Testimonials() {
  const { lang } = useLang();
  const { items, loading } = useTestimonials();
  const trackRef   = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollTo = (idx: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * (CARD_W + GAP), behavior: 'smooth' });
    setActive(idx);
  };

  useEffect(() => {
    if (paused || items.length === 0) return;
    const timer = setInterval(() => {
      setActive((prev) => {
        const next = (prev + 1) % items.length;
        scrollTo(next);
        return next;
      });
    }, INTERVAL);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, items]);

  const handleTouchStart = () => {
    setPaused(true);
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
  };
  const handleTouchEnd = () => {
    pauseTimer.current = setTimeout(() => setPaused(false), 3000);
  };

  const handleScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / (CARD_W + GAP));
    setActive(idx);
  };

  if (loading) return null; // silent — section appears once data is ready

  return (
    <section id="reviews" className="py-6 scroll-mt-20">
      {/* ── Header ── */}
      <div className="container-page mb-4">
        <SectionHeader
          label={lang === 'sw' ? 'Ushuhuda' : 'Testimonials'}
          title={lang === 'sw' ? 'Wanachosema Wateja Wetu' : 'What Our Customers Say'}
          aside={
            <div className="flex flex-col items-center bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-card">
              <span className="text-xl font-extrabold text-gray-900 leading-none">4.9</span>
              <div className="flex gap-0.5 my-1" aria-label="Rated 4.9 out of 5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-2.5 h-2.5 fill-gold-400 text-gold-400" />
                ))}
              </div>
              <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">
                {lang === 'sw' ? 'Wastani' : 'Avg. rating'}
              </span>
            </div>
          }
        />
      </div>

      {/* ── Scrollable track ── */}
      <div
        ref={trackRef}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="flex gap-3 overflow-x-auto px-4 pb-3 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            style={{ width: CARD_W, minWidth: CARD_W }}
            className="snap-start bg-white rounded-xl border border-gray-100 shadow-card p-4 flex flex-col gap-3 flex-shrink-0"
          >
            <div className="w-7 h-7 bg-primary-50 rounded-lg flex items-center justify-center">
              <Quote className="w-3.5 h-3.5 text-primary-600" />
            </div>

            <p className="text-[12px] text-gray-700 leading-relaxed italic line-clamp-4 flex-1">
              "{item.text}"
            </p>

            <div className="flex gap-0.5" aria-label="Rated 5 out of 5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-gold-400 text-gold-400" />
              ))}
            </div>

            <div className="h-px bg-gray-100" />

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-gray-600">{item.name.charAt(0)}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-gray-900 truncate">{item.name}</p>
                    <BadgeCheck className="w-3 h-3 text-primary-500 flex-shrink-0" />
                  </div>
                  <p className="text-[10px] text-gray-400 truncate">{item.location}</p>
                </div>
              </div>
              {item.result && (
                <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                  {item.result}
                </span>
              )}
            </div>

            {item.product && (
              <span className="self-start text-[10px] font-medium text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-0.5 rounded-full">
                {item.product}
              </span>
            )}
          </div>
        ))}
        <div className="flex-shrink-0 w-4" aria-hidden="true" />
      </div>

      {/* ── Dot indicators ── */}
      <div className="flex justify-center gap-1.5 mt-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => { scrollTo(i); setPaused(true); }}
            aria-label={`Review ${i + 1}`}
            className={`rounded-full transition-all duration-300 outline-none [-webkit-tap-highlight-color:transparent] ${
              i === active
                ? 'w-5 h-1.5 bg-primary-600'
                : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
