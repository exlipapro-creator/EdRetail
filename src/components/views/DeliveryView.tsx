import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  Phone,
  HelpCircle,
  CheckCircle2,
  Search,
  Package,
} from 'lucide-react';
import { DELIVERY_ZONES } from '../../types';
import { useLang } from '../../context/LangContext';
import { WHATSAPP_LINK, DISTRIBUTOR_NAME } from '../../utils/whatsappCompiler';

export function DeliveryView() {
  const { lang } = useLang();
  const [searchCity, setSearchCity] = useState('');

  const filteredZones = DELIVERY_ZONES.filter((zone) =>
    zone.zone.toLowerCase().includes(searchCity.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-8 animate-fadeIn">
      {/* ── HERO BANNER ── */}
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <Truck className="w-3.5 h-3.5" />
            <span>{lang === 'sw' ? 'Usafirishaji wa Uhakika' : 'Nationwide Fulfillment'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
            {lang === 'sw' ? 'Uwasilishaji Tanzania Nzima na Zanzibar' : 'Fast Delivery Across Tanzania & Zanzibar'}
          </h1>
          <p className="text-sm text-primary-100 mt-2 leading-relaxed">
            {lang === 'sw'
              ? 'Tunakuletea bidhaa zako za Edmark popote ulipo kwa usalama, haraka, na kwa kufuatilia moja kwa moja kupitia WhatsApp.'
              : 'Reliable, tracked delivery for all genuine Edmark wellness products right to your doorstep or regional hub.'}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              id="delivery-hero-whatsapp-btn"
              href={`${WHATSAPP_LINK}?text=${encodeURIComponent('Hello Mwanahamisi, I would like to inquire about delivery to my location:')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-primary-700 hover:bg-primary-50 rounded-xl text-xs font-bold shadow-md transition-transform active:scale-95"
            >
              <Phone className="w-4 h-4 text-secondary-green" />
              <span>{lang === 'sw' ? 'Uliza Gharama za Usafirishaji' : 'Inquire Delivery Rates'}</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── 3 KEY PILLARS ── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-neutral-900 text-sm">
            {lang === 'sw' ? 'Kila Mkoa na Kisiwa' : 'Every Region & Island'}
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            {lang === 'sw'
              ? 'Dar es Salaam, Arusha, Mwanza, Dodoma, Mbeya, Zanzibar na mikoa yote ya pembezoni.'
              : 'Comprehensive delivery coverage reaching Dar es Salaam, major hubs, Zanzibar, and remote upcountry towns.'}
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-neutral-900 text-sm">
            {lang === 'sw' ? 'Siku Hiyo Hiyo Dar' : 'Same-Day in Dar es Salaam'}
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            {lang === 'sw'
              ? 'Maagizo yanayotolewa kabla ya saa 6 mchana yanafika siku hiyo hiyo ndani ya Dar es Salaam.'
              : 'Orders confirmed before 12:00 PM are dispatched for same-day delivery across Dar es Salaam.'}
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-neutral-900 text-sm">
            {lang === 'sw' ? 'Ufuatiliaji wa Moja kwa Moja' : 'Real-time Tracking'}
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            {lang === 'sw'
              ? 'Pata taarifa za moja kwa moja za usafirishaji, namba ya dereva, na risiti kupitia WhatsApp.'
              : 'Receive direct updates, driver dispatch details, and bus parcel tracking receipts via WhatsApp.'}
          </p>
        </div>
      </section>

      {/* ── DELIVERY ZONES & ESTIMATED TIMES ── */}
      <section className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">
              {lang === 'sw' ? 'Muda wa Usafirishaji kwa Kila Eneo' : 'Delivery Timeline by Zone'}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              {lang === 'sw'
                ? 'Tazama makadirio ya muda wa kufika mzigo wako'
                : 'Estimated transit timelines and regional delivery notes'}
            </p>
          </div>

          {/* Quick filter input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              id="delivery-city-search"
              type="text"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              placeholder={lang === 'sw' ? 'Andika jiji au mkoa wako...' : 'Type your city or region...'}
              className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:border-primary-500"
            />
          </div>
        </div>

        {/* Zones Grid */}
        <div className="space-y-3">
          {filteredZones.map((zone, idx) => (
            <motion.div
              key={zone.zone}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 rounded-2xl bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-neutral-200 shadow-xs flex items-center justify-center text-primary-600 flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">{zone.zone}</h4>
                  {zone.note && (
                    <p className="text-[11px] text-amber-700 font-medium mt-0.5">
                      ℹ {zone.note}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="px-3 py-1 bg-primary-50 text-primary-700 border border-primary-100 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {zone.days}
                </span>
              </div>
            </motion.div>
          ))}

          {filteredZones.length === 0 && (
            <div className="text-center py-8 text-neutral-400 text-xs">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>
                {lang === 'sw'
                  ? `Hatukupata eneo kwa "${searchCity}". Tuma ujumbe WhatsApp kuthibitisha upatikanaji.`
                  : `No exact zone match for "${searchCity}". Contact distributor on WhatsApp for custom routing.`}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── FREQUENTLY ASKED QUESTIONS ── */}
      <section className="bg-neutral-50 rounded-3xl border border-neutral-200/80 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-bold text-neutral-900">
            {lang === 'sw' ? 'Maswali ya Kawaida Kuhusu Usafirishaji' : 'Delivery Frequently Asked Questions'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="p-4 bg-white rounded-2xl border border-neutral-200/60 shadow-xs space-y-1.5">
            <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {lang === 'sw' ? 'Malipo yanafanyikaje?' : 'How is payment arranged?'}
            </h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {lang === 'sw'
                ? 'Malipo hupangwa moja kwa moja na msambazaji kupitia M-Pesa, TigoPesa, Airtel Money au pesa taslimu unapoletewa (Dar es Salaam).'
                : 'Payment is confirmed directly with the distributor via M-Pesa, TigoPesa, Airtel Money, or cash on delivery within Dar es Salaam.'}
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-neutral-200/60 shadow-xs space-y-1.5">
            <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {lang === 'sw' ? 'Je, bidhaa inafika mpaka mlangoni?' : 'Is door-to-door delivery available?'}
            </h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {lang === 'sw'
                ? 'Ndiyo, ndani ya Dar es Salaam na miji mikuu. Kwa mikoa ya mbali, vifurushi hutumwa kupitia vituo vikuu vya mabasi kwa usalama mkubwa.'
                : 'Yes, doorstep delivery is standard in Dar es Salaam. For remote regions, verified bus parcel lockers and direct couriers ensure safe collection.'}
            </p>
          </div>
        </div>
      </section>

      {/* ── DISTRIBUTOR HELP CALLOUT ── */}
      <section className="p-6 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-emerald-950 text-sm">
              {lang === 'sw' ? `Una swali la usafirishaji? Wasiliana na ${DISTRIBUTOR_NAME}` : `Need custom delivery assistance? Chat with ${DISTRIBUTOR_NAME}`}
            </h3>
            <p className="text-xs text-emerald-800 mt-0.5">
              {lang === 'sw' ? 'Tunajibu ndani ya dakika 30 kupitia WhatsApp.' : 'Average WhatsApp response time: under 30 minutes.'}
            </p>
          </div>
        </div>

        <a
          id="delivery-chat-whatsapp-btn"
          href={`${WHATSAPP_LINK}?text=${encodeURIComponent('Hello Mwanahamisi, I need assistance with delivery timing for my order.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md text-center transition-colors flex-shrink-0"
        >
          {lang === 'sw' ? 'Wasiliana WhatsApp' : 'Chat on WhatsApp'}
        </a>
      </section>
    </div>
  );
}
