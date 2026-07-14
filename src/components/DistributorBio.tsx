import { motion } from 'framer-motion';
import { Crown, MapPin, Clock, ShieldCheck, Star, MessageCircle } from 'lucide-react';
import { useLang } from '../context/LangContext';
import { WHATSAPP_LINK, DISTRIBUTOR_NAME } from '../utils/whatsappCompiler';

const STATS = [
  { valueEn: '5+',    valueSw: '5+',    labelEn: 'Years',    labelSw: 'Miaka'   },
  { valueEn: '500+',  valueSw: '500+',  labelEn: 'Clients',  labelSw: 'Wateja'  },
  { valueEn: '4.9',   valueSw: '4.9',   labelEn: 'Rating',   labelSw: 'Tathmini'},
];

export function DistributorBio() {
  const { lang } = useLang();
  const firstName = DISTRIBUTOR_NAME.split(' ')[0];

  return (
    <section className="max-w-lg mx-auto px-4 py-5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
      >
        {/* ── Gradient banner ── */}
        <div className="h-20 bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-700" />

        {/* ── Avatar ── */}
        <div className="absolute top-8 left-5">
          <div className="relative">
            <img
              src="/logo/distributor-circle.png"
              alt={DISTRIBUTOR_NAME}
              className="w-20 h-20 rounded-full object-cover border-[3px] border-white shadow-md"
            />
            {/* Crown badge */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              <Crown className="w-3 h-3 text-amber-900" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* ── Verified badge (top-right of banner) ── */}
        <div className="absolute top-3.5 right-4 flex items-center gap-1 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-2.5 py-1">
          <ShieldCheck className="w-3 h-3 text-white" strokeWidth={2} />
          <span className="text-[10px] font-semibold text-white tracking-wide uppercase">
            {lang === 'sw' ? 'Imethibitishwa' : 'Verified'}
          </span>
        </div>

        {/* ── Main content ── */}
        <div className="pt-14 px-5 pb-5">
          {/* Name + rank */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <h3 className="text-base font-bold text-gray-900 leading-tight">{DISTRIBUTOR_NAME}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wide">
                  <Crown className="w-2.5 h-2.5" />
                  {lang === 'sw' ? 'Meneja wa Taji' : 'Crown Manager'}
                </span>
              </div>
            </div>
            {/* Star rating pill */}
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 rounded-full px-2.5 py-1 flex-shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-amber-700">4.9</span>
            </div>
          </div>

          {/* Location + hours */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 mb-3">
            <span className="flex items-center gap-1 text-[11px] text-gray-500">
              <MapPin className="w-3 h-3 text-gray-400" />
              Dar es Salaam, Tanzania
            </span>
            <span className="flex items-center gap-1 text-[11px] text-gray-500">
              <Clock className="w-3 h-3 text-gray-400" />
              {lang === 'sw' ? 'Jibu ndani ya dakika 30' : 'Replies within 30 min'}
            </span>
          </div>

          {/* Bio */}
          <p className="text-[12px] text-gray-600 leading-relaxed mb-4">
            {lang === 'sw'
              ? `Msambazaji rasmi wa Edmark kwa miaka 5+. Ninasaidia wateja kote Tanzania kupata bidhaa sahihi za afya na mwongozo wa kitaalamu wa bure.`
              : `Authorized Edmark distributor for 5+ years. I help customers across Tanzania find the right wellness products with free expert guidance.`}
          </p>

          {/* ── Stats row ── */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {STATS.map((s) => (
              <div key={s.labelEn} className="flex flex-col items-center py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-base font-bold text-gray-900 leading-none">
                  {lang === 'sw' ? s.valueSw : s.valueEn}
                </span>
                <span className="text-[10px] text-gray-400 mt-0.5 font-medium">
                  {lang === 'sw' ? s.labelSw : s.labelEn}
                </span>
              </div>
            ))}
          </div>

          {/* ── CTA ── */}
          <motion.a
            href={WHATSAPP_LINK}
            whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors outline-none [-webkit-tap-highlight-color:transparent] shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            {lang === 'sw' ? `Ongea na ${firstName} sasa` : `Chat with ${firstName} now`}
          </motion.a>

          {/* Hours note */}
          <p className="text-center text-[10px] text-gray-400 mt-2">
            {lang === 'sw' ? 'Jumatatu – Jumamosi, 8am – 8pm' : 'Mon – Sat, 8 am – 8 pm'}
          </p>
        </div>
      </motion.div>
    </section>
  );
}
