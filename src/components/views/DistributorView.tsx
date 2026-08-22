import { motion } from 'framer-motion';
import {
  BadgeCheck,
  Star,
  Phone,
  ShieldCheck,
  Award,
  Users,
  Clock,
  HeartHandshake,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { DISTRIBUTOR_NAME, TARGET_PHONE, WHATSAPP_LINK } from '../../utils/whatsappCompiler';
import { TESTIMONIALS } from '../../types';
import { useLang } from '../../context/LangContext';

export function DistributorView() {
  const { lang, t } = useLang();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-8 animate-fadeIn">
      {/* ── DISTRIBUTOR HERO CARD ── */}
      <section className="bg-gradient-to-br from-primary-800 via-primary-700 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar / Portrait Badge */}
          <div className="relative flex-shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-300 to-amber-200 p-1 shadow-xl">
              <div className="w-full h-full bg-primary-900 rounded-[22px] overflow-hidden flex items-center justify-center relative">
                <img
                  src="/logo/distributor-circle.png"
                  alt={DISTRIBUTOR_NAME}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to stylized monogram if circle image fails
                    e.currentTarget.style.display = 'none';
                    const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
                    if (fb) fb.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-full bg-gradient-to-br from-primary-600 to-indigo-800 items-center justify-center text-white font-extrabold text-3xl">
                  ML
                </div>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-amber-400 text-amber-950 p-1.5 rounded-full shadow-lg border-2 border-white" title="Verified Crown Manager">
              <Award className="w-4 h-4" />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
              <span className="px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold text-amber-300 flex items-center gap-1.5 border border-white/10">
                <Sparkles className="w-3.5 h-3.5" />
                Crown Manager
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 backdrop-blur-md rounded-full text-xs font-bold text-emerald-300 flex items-center gap-1.5 border border-emerald-400/20">
                <BadgeCheck className="w-3.5 h-3.5" />
                {lang === 'sw' ? 'Msambazaji Aliyeidhinishwa' : 'Authorized Distributor'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {DISTRIBUTOR_NAME}
            </h1>

            <p className="text-xs sm:text-sm text-primary-100 mt-1 flex items-center justify-center sm:justify-start gap-1.5">
              <span>Dar es Salaam, Tanzania</span>
              <span>·</span>
              <span className="text-emerald-300 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {lang === 'sw' ? 'Majibu ndani ya dakika 30' : 'Replies within 30 min'}
              </span>
            </p>

            <p className="text-xs text-primary-100/90 mt-3 leading-relaxed max-w-xl">
              {lang === 'sw'
                ? 'Karibu! Mimi ni Mwanahamisi Lissu, Msambazaji Mkuu wa Edmark International nchini Tanzania. Niko hapa kukusaidia kupata bidhaa halisi 100%, ratiba sahihi ya matumizi, na ushauri wa bure wa safari yako ya afya.'
                : 'Welcome! I am Mwanahamisi Lissu, an authorized Crown Manager for Edmark International in Tanzania. I am dedicated to providing you with 100% genuine wellness solutions, customized dosage coaching, and fast nationwide delivery.'}
            </p>

            {/* CTAs */}
            <div className="mt-5 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <a
                id="distributor-whatsapp-cta-btn"
                href={`${WHATSAPP_LINK}?text=${encodeURIComponent('Hello Mwanahamisi, I would like to consult with you regarding Edmark products:')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-secondary-green hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg transition-transform active:scale-95"
              >
                <Phone className="w-4 h-4" />
                <span>{lang === 'sw' ? 'Ongea Nami Kupitia WhatsApp' : 'Chat on WhatsApp with Mwanahamisi'}</span>
              </a>

              <span className="text-xs text-primary-200 font-medium">
                +{TARGET_PHONE}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-extrabold text-neutral-900 block leading-tight">5+ Years</span>
            <span className="text-[11px] text-neutral-500">{lang === 'sw' ? 'Uzoefu wa Edmark' : 'Edmark Experience'}</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-extrabold text-neutral-900 block leading-tight">500+</span>
            <span className="text-[11px] text-neutral-500">{lang === 'sw' ? 'Wateja Waliofanikiwa' : 'Happy Clients'}</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <span className="text-lg font-extrabold text-neutral-900 block leading-tight">4.9 / 5.0</span>
            <span className="text-[11px] text-neutral-500">{lang === 'sw' ? 'Kiwango cha Kuridhika' : 'Customer Rating'}</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-extrabold text-neutral-900 block leading-tight">100%</span>
            <span className="text-[11px] text-neutral-500">{lang === 'sw' ? 'Uhalisi Uliothibitishwa' : 'Genuine Products'}</span>
          </div>
        </div>
      </section>

      {/* ── DISTRIBUTOR COMMITMENT & HOURS ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 bg-white rounded-3xl border border-neutral-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-primary-600">
            <HeartHandshake className="w-5 h-5" />
            <h3 className="font-bold text-neutral-900 text-sm">
              {lang === 'sw' ? 'Ahadi Yangu Kwako' : 'My Personal Commitment'}
            </h3>
          </div>
          <ul className="space-y-2 text-xs text-neutral-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-secondary-green flex-shrink-0 mt-0.5" />
              <span>{lang === 'sw' ? 'Bidhaa zote ni asili 100% kutoka kiwanda cha Edmark.' : '100% genuine Edmark products sealed directly from manufacturer.'}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-secondary-green flex-shrink-0 mt-0.5" />
              <span>{lang === 'sw' ? 'Mwongozo wa bure wa jinsi ya kunywa na kufuata mpango wa afya.' : 'Free 1-on-1 dosage coaching and dietary guidance throughout your program.'}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-secondary-green flex-shrink-0 mt-0.5" />
              <span>{lang === 'sw' ? 'Ufuatiliaji wa kina wa uwasilishaji mpaka mzigo ukufikie mkononi.' : 'Active transit tracking until the package is securely in your hands.'}</span>
            </li>
          </ul>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-neutral-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-primary-600">
            <Clock className="w-5 h-5" />
            <h3 className="font-bold text-neutral-900 text-sm">
              {lang === 'sw' ? 'Saa za Kazi & Majibu' : 'Hours of Operation & Support'}
            </h3>
          </div>
          <div className="space-y-2 text-xs text-neutral-600">
            <div className="flex justify-between border-b border-neutral-100 pb-1.5">
              <span>{lang === 'sw' ? 'Jumatatu – Jumamosi:' : 'Monday – Saturday:'}</span>
              <span className="font-bold text-neutral-900">8:00 AM – 9:00 PM</span>
            </div>
            <div className="flex justify-between border-b border-neutral-100 pb-1.5">
              <span>{lang === 'sw' ? 'Jumapili & Sikukuu:' : 'Sundays & Public Holidays:'}</span>
              <span className="font-bold text-neutral-900">10:00 AM – 6:00 PM</span>
            </div>
            <p className="text-[11px] text-neutral-400 pt-1">
              {lang === 'sw' ? 'Maagizo ya WhatsApp yanapokelewa saa 24/7 na kujibiwa asubuhi mapema.' : 'Orders placed outside hours are confirmed first thing the following morning.'}
            </p>
          </div>
        </div>
      </section>

      {/* ── CLIENT TESTIMONIALS ── */}
      <section className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">
              {lang === 'sw' ? 'Wanachosema Wateja Wangu' : 'Customer Stories & Reviews'}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              {lang === 'sw' ? 'Uzoefu halisi kutoka kwa wateja waliohudumiwa' : 'Real feedback from clients guided through the wellness programs'}
            </p>
          </div>
          <div className="flex items-center gap-1 text-amber-500 font-extrabold text-sm bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200/60">
            <Star className="w-4 h-4 fill-amber-400" />
            <span>4.9 Rating</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TESTIMONIALS.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200/60 flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex gap-0.5 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-neutral-700 italic leading-relaxed">
                  "{t(item.text)}"
                </p>
              </div>

              <div className="border-t border-neutral-200/60 pt-3 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">{item.name}</h4>
                  <p className="text-[10px] text-neutral-400">{item.location} · {item.product}</p>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  {item.result}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
