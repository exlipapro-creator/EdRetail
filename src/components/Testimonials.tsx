import { useEffect, useRef, useState } from 'react';
import { Star, Quote, BadgeCheck } from 'lucide-react';
import { TESTIMONIALS } from '../types';
import { useLang } from '../context/LangContext';

const CARD_W = 252;   // px — card width + gap
const GAP    = 12;
const INTERVAL = 3200;

const ACCENTS = [
  { bg: 'from-indigo-50 to-white', ring: 'border-indigo-100', dot: 'bg-indigo-500' },
  { bg: 'from-violet-50 to-white', ring: 'border-violet-100', dot: 'bg-violet-500' },
  { bg: 'from-blue-50 to-white',   ring: 'border-blue-100',   dot: 'bg-blue-500'   },
];

export function Testimonials() {
  const { lang, t } = useLang();
  const trackRef   = useRef<HTMLDivElement>(null);
  const [active, setActive]   = useState(0);
  const [paused, setPaused]   = useState(false);
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll the track to card `idx`
  const scrollTo = (idx: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * (CARD_W + GAP), behavior: 'smooth' });
    setActive(idx);
  };

  // Auto-advance
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setActive((prev) => {
        const next = (prev + 1) % TESTIMONIALS.length;
        scrollTo(next);
        return next;
      });
    }, INTERVAL);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  // Pause on user touch, resume after 3 s idle
  const handleTouchStart = () => {
    setPaused(true);
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
  };
  const handleTouchEnd = () => {
    pauseTimer.current = setTimeout(() => setPaused(false), 3000);
  };

  // Sync active dot when user manually swipes
  const handleScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / (CARD_W + GAP));
    setActive(idx);
  };

  return (
    <section className="py-6">
      {/* ── Header ── */}
      <div className="max-w-lg mx-auto px-4 mb-4">
        <div className="flex items-end justify-between">
          <div>
            <span className="inline-block text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full uppercase tracking-widest mb-2">
              {lang === 'sw' ? 'Ushuhuda' : 'Testimonials'}
            </span>
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">
              {lang === 'sw' ? 'Wanachosema Wateja Wetu' : 'What Our Customers Say'}
            </h2>
          </div>

          {/* Aggregate rating block */}
          <div className="flex flex-col items-center bg-indigo-600 rounded-2xl px-4 py-2.5 shadow-md flex-shrink-0">
            <span className="text-xl font-extrabold text-white leading-none">4.9</span>
            <div className="flex gap-0.5 my-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
              ))}
            </div>
            <span className="text-[9px] font-semibold text-indigo-200 uppercase tracking-wide">
              {lang === 'sw' ? 'Wastani' : 'Avg. rating'}
            </span>
          </div>
        </div>
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
        {TESTIMONIALS.map((item, idx) => {
          const ac = ACCENTS[idx % ACCENTS.length];
          return (
            <div
              key={item.id}
              style={{ width: CARD_W, minWidth: CARD_W }}
              className={`snap-start bg-gradient-to-br ${ac.bg} rounded-2xl border ${ac.ring} shadow-sm p-4 flex flex-col gap-3 flex-shrink-0`}
            >
              {/* Quote icon */}
              <div className={`w-7 h-7 ${ac.dot} rounded-lg flex items-center justify-center shadow-sm`}>
                <Quote className="w-3.5 h-3.5 text-white" />
              </div>

              {/* Review text */}
              <p className="text-[12px] text-gray-700 leading-relaxed italic line-clamp-4 flex-1">
                "{t(item.text)}"
              </p>

              {/* Stars */}
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-200 opacity-60" />

              {/* Author */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-8 h-8 rounded-full ${ac.dot} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <span className="text-xs font-bold text-white">{item.name.charAt(0)}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-bold text-gray-900 truncate">{item.name}</p>
                      <BadgeCheck className="w-3 h-3 text-indigo-500 flex-shrink-0" />
                    </div>
                    <p className="text-[10px] text-gray-400 truncate">{item.location}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                  {item.result}
                </span>
              </div>

              {/* Product pill */}
              <span className="self-start text-[10px] font-medium text-gray-500 bg-white border border-gray-100 px-2.5 py-0.5 rounded-full">
                {item.product}
              </span>
            </div>
          );
        })}
        {/* Trailing spacer so last card has breathing room */}
        <div className="flex-shrink-0 w-4" aria-hidden="true" />
      </div>

      {/* ── Dot indicators ── */}
      <div className="flex justify-center gap-1.5 mt-2">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => { scrollTo(i); setPaused(true); }}
            aria-label={`Review ${i + 1}`}
            className={`rounded-full transition-all duration-300 outline-none [-webkit-tap-highlight-color:transparent] ${
              i === active
                ? 'w-5 h-1.5 bg-indigo-600'
                : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
