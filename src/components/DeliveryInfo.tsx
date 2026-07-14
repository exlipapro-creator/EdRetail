import { motion } from 'framer-motion';
import { MapPin, Truck, Zap, AlertCircle, Phone } from 'lucide-react';
import { DELIVERY_ZONES } from '../types';
import { useLang } from '../context/LangContext';
import { WHATSAPP_LINK } from '../utils/whatsappCompiler';

// Speed tiers mapped by index — fastest zones first
const TIER_CONFIG = [
  { color: 'bg-green-500',  label: 'Express', labelSw: 'Haraka',   textColor: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200' },
  { color: 'bg-blue-500',   label: 'Fast',    labelSw: 'Upesi',    textColor: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200'  },
  { color: 'bg-blue-400',   label: 'Fast',    labelSw: 'Upesi',    textColor: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200'  },
  { color: 'bg-violet-500', label: 'Island',  labelSw: 'Kisiwa',   textColor: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200'},
  { color: 'bg-amber-500',  label: 'Standard',labelSw: 'Kawaida',  textColor: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200' },
];

export function DeliveryInfo() {
  const { lang } = useLang();

  return (
    <section className="max-w-lg mx-auto px-4 py-6">

      {/* ── Header ── */}
      <div className="mb-4">
        <span className="inline-block text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full uppercase tracking-widest mb-2">
          {lang === 'sw' ? 'Uwasilishaji' : 'Delivery'}
        </span>
        <h2 className="text-2xl font-bold text-gray-900 leading-tight">
          {lang === 'sw' ? 'Tanzania Nzima' : 'Across Tanzania'}
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          {lang === 'sw'
            ? 'Tunasafirisha kwa kila mkoa nchini'
            : 'We ship to every region nationwide'}
        </p>
      </div>

      {/* ── Zone cards ── */}
      <div className="space-y-2.5">
        {DELIVERY_ZONES.map((zone, i) => {
          const tier = TIER_CONFIG[i] ?? TIER_CONFIG[TIER_CONFIG.length - 1];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Colour speed dot */}
                <div className={`w-2 h-10 rounded-full ${tier.color} flex-shrink-0`} />

                {/* Zone name + note */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-900 truncate">{zone.zone}</span>
                  </div>
                  {zone.note && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
                      <p className="text-[10px] text-gray-400 leading-snug">{zone.note}</p>
                    </div>
                  )}
                </div>

                {/* ETA pill */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${tier.bg} ${tier.border} ${tier.textColor} whitespace-nowrap`}>
                    {zone.days}
                  </span>
                  <span className={`text-[9px] font-semibold uppercase tracking-wide ${tier.textColor}`}>
                    {lang === 'sw' ? tier.labelSw : tier.label}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-3 gap-3 mt-5">
        {[
          { icon: <Truck className="w-4 h-4 text-indigo-500" />,  valueEn: 'Nationwide', valueSw: 'Nchi Nzima',     labelEn: 'Coverage',  labelSw: 'Maeneo' },
          { icon: <Zap className="w-4 h-4 text-green-500" />,     valueEn: 'Same-day',   valueSw: 'Siku Hiyo',     labelEn: 'DSM Express',labelSw: 'DSM Haraka' },
          { icon: <Phone className="w-4 h-4 text-amber-500" />,   valueEn: 'WhatsApp',   valueSw: 'WhatsApp',      labelEn: 'Tracking',  labelSw: 'Ufuatiliaji' },
        ].map((s) => (
          <div key={s.labelEn} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex flex-col items-center text-center gap-1.5">
            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
              {s.icon}
            </div>
            <span className="text-xs font-bold text-gray-900">{lang === 'sw' ? s.valueSw : s.valueEn}</span>
            <span className="text-[10px] text-gray-400 font-medium">{lang === 'sw' ? s.labelSw : s.labelEn}</span>
          </div>
        ))}
      </div>

      {/* ── CTA footer ── */}
      <div className="mt-4 flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
        <p className="text-xs text-indigo-700 font-medium leading-snug max-w-[65%]">
          {lang === 'sw'
            ? 'Swali kuhusu uwasilishaji wako?'
            : 'Questions about your delivery?'}
        </p>
        <motion.a
          href={WHATSAPP_LINK}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm outline-none [-webkit-tap-highlight-color:transparent]"
        >
          <Phone className="w-3 h-3" />
          {lang === 'sw' ? 'Uliza' : 'Ask us'}
        </motion.a>
      </div>
    </section>
  );
}
