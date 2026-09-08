import { useState } from 'react';
import {
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  Phone,
  HelpCircle,
  Search,
  Package,
  ChevronDown,
} from 'lucide-react';
import { DELIVERY_ZONES } from '../../types';
import { useLang } from '../../context/LangContext';
import { WHATSAPP_LINK } from '../../utils/whatsappCompiler';

interface FaqEntry {
  q: { en: string; sw: string };
  a: { en: string; sw: string };
}

// Only questions already answered by the existing page content — nothing invented.
const FAQS: FaqEntry[] = [
  {
    q: {
      en: 'How is payment arranged?',
      sw: 'Malipo yanafanyikaje?',
    },
    a: {
      en: 'Payment is confirmed directly with the distributor via M-Pesa, TigoPesa, Airtel Money, or cash on delivery within Dar es Salaam.',
      sw: 'Malipo hupangwa moja kwa moja na msambazaji kupitia M-Pesa, TigoPesa, Airtel Money au pesa taslimu unapoletewa (Dar es Salaam).',
    },
  },
  {
    q: {
      en: 'Is door-to-door delivery available?',
      sw: 'Je, bidhaa inafika mpaka mlangoni?',
    },
    a: {
      en: 'Yes, doorstep delivery is standard in Dar es Salaam. For remote regions, verified bus parcel lockers and direct couriers ensure safe collection.',
      sw: 'Ndiyo, ndani ya Dar es Salaam na miji mikuu. Kwa mikoa ya mbali, vifurushi hutumwa kupitia vituo vikuu vya mabasi kwa usalama mkubwa.',
    },
  },
];

export function DeliveryView() {
  const { lang } = useLang();
  const [searchCity, setSearchCity] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const query = searchCity.trim().toLowerCase();
  const filteredZones = DELIVERY_ZONES.filter((zone) =>
    zone.zone.toLowerCase().includes(query)
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-10 animate-fadeIn">
      {/* ── HERO — restrained, informative ── */}
      <section className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 border border-primary-100 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3">
          <Truck className="w-3.5 h-3.5" />
          <span>{lang === 'sw' ? 'Usafirishaji wa Uhakika' : 'Nationwide Fulfillment'}</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 leading-tight">
          {lang === 'sw' ? 'Uwasilishaji Tanzania Nzima na Zanzibar' : 'Delivery across Tanzania & Zanzibar'}
        </h1>
        <p className="text-sm text-neutral-500 mt-2 leading-relaxed max-w-xl">
          {lang === 'sw'
            ? 'Tunakuletea bidhaa zako za Edmark popote ulipo kwa usalama na kwa kufuatilia moja kwa moja kupitia WhatsApp.'
            : 'Reliable, tracked delivery for genuine Edmark wellness products — right to your doorstep or regional hub.'}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold text-neutral-400">
          <span>Dar es Salaam</span>
          <span aria-hidden>·</span>
          <span>{lang === 'sw' ? 'Miji mikuu' : 'Major cities'}</span>
          <span aria-hidden>·</span>
          <span>Zanzibar</span>
          <span aria-hidden>·</span>
          <span>{lang === 'sw' ? 'Mikoa ya pembezoni' : 'Upcountry'}</span>
        </div>

        <a
          id="delivery-hero-whatsapp-btn"
          href={`${WHATSAPP_LINK}?text=${encodeURIComponent('Hello ED Retail, I would like to inquire about delivery to my location:')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-[#123B6D] hover:bg-[#0D315D] text-white rounded-xl text-xs font-bold transition-colors"
        >
          <Phone className="w-4 h-4" />
          <span>{lang === 'sw' ? 'Uliza Gharama za Usafirishaji' : 'Check delivery availability'}</span>
        </a>
      </section>

      {/* ── COVERAGE + TIMELINE ── */}
      <section className="bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-600" />
              {lang === 'sw' ? 'Tunafikia wapi' : 'Where we deliver'}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              {lang === 'sw'
                ? 'Muda wa kufika kwa kila eneo'
                : 'Estimated transit timelines by destination'}
            </p>
          </div>

          {/* Quick filter — wired to the zone list below */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              id="delivery-city-search"
              type="text"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              placeholder={lang === 'sw' ? 'Andika jiji au mkoa wako...' : 'Type your city or region...'}
              className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Structured zone rows — table-like on desktop, stacked on mobile */}
        <div className="border border-neutral-200/80 rounded-xl overflow-hidden">
          {filteredZones.map((zone, idx) => (
            <div
              key={zone.zone}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 px-4 py-3.5 ${
                idx % 2 === 1 ? 'bg-neutral-50/60' : 'bg-white'
              } ${idx > 0 ? 'border-t border-neutral-100' : ''}`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 border border-primary-100 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-neutral-900">{zone.zone}</h3>
                  {zone.note && (
                    <p className="text-[11px] text-amber-700 font-medium mt-0.5">{zone.note}</p>
                  )}
                </div>
              </div>

              <div className="pl-11 sm:pl-0 shrink-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 border border-primary-100 rounded-full text-xs font-bold">
                  <Clock className="w-3 h-3" />
                  {zone.days}
                </span>
              </div>
            </div>
          ))}

          {filteredZones.length === 0 && (
            <div className="text-center py-8 text-neutral-400 text-xs bg-white">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>
                {lang === 'sw'
                  ? `Hatukupata eneo kwa "${searchCity}". Tuma ujumbe WhatsApp kuthibitisha upatikanaji.`
                  : `No exact zone match for "${searchCity}". Contact us on WhatsApp for custom routing.`}
              </p>
            </div>
          )}
        </div>

        {/* Trust pillars — compact inline row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
            <Clock className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <p className="text-[11px] text-neutral-600 leading-relaxed">
              <span className="font-bold text-neutral-900 block">
                {lang === 'sw' ? 'Siku Hiyo Hiyo Dar' : 'Same-day in Dar es Salaam'}
              </span>
              {lang === 'sw'
                ? 'Maagizo kabla ya saa 6 mchana yanafika siku hiyo hiyo.'
                : 'Orders confirmed before 12:00 PM arrive the same day.'}
            </p>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <p className="text-[11px] text-neutral-600 leading-relaxed">
              <span className="font-bold text-neutral-900 block">
                {lang === 'sw' ? 'Ufuatiliaji' : 'Real-time tracking'}
              </span>
              {lang === 'sw'
                ? 'Taarifa za usafirishaji na risiti kupitia WhatsApp.'
                : 'Dispatch updates and parcel receipts via WhatsApp.'}
            </p>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
            <Truck className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
            <p className="text-[11px] text-neutral-600 leading-relaxed">
              <span className="font-bold text-neutral-900 block">
                {lang === 'sw' ? 'Kila Mkoa na Kisiwa' : 'Every region & island'}
              </span>
              {lang === 'sw'
                ? 'Dar, miji mikuu, Zanzibar na mikoa ya pembezoni.'
                : 'Dar es Salaam, major hubs, Zanzibar, and remote towns.'}
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ — accessible accordion ── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-bold text-neutral-900">
            {lang === 'sw' ? 'Maswali ya Kawaida' : 'Frequently asked questions'}
          </h2>
        </div>

        <div className="bg-white border border-neutral-200/80 rounded-2xl overflow-hidden shadow-xs">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className={idx > 0 ? 'border-t border-neutral-100' : ''}>
                <button
                  id={`delivery-faq-btn-${idx}`}
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  aria-controls={`delivery-faq-panel-${idx}`}
                  className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 text-left hover:bg-neutral-50/60 transition-colors cursor-pointer"
                >
                  <span className="text-sm font-semibold text-neutral-900">
                    {lang === 'sw' ? faq.q.sw : faq.q.en}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div
                    id={`delivery-faq-panel-${idx}`}
                    role="region"
                    className="px-4 sm:px-5 pb-4 text-xs text-neutral-600 leading-relaxed"
                  >
                    {lang === 'sw' ? faq.a.sw : faq.a.en}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── WHATSAPP ASSISTANCE — integrated, not oversized ── */}
      <section className="p-5 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-emerald-950 text-sm">
              {lang === 'sw' ? 'Una swali la usafirishaji?' : 'Need help with delivery?'}
            </h3>
            <p className="text-xs text-emerald-800 mt-0.5">
              {lang === 'sw'
                ? 'Tunajibu ndani ya dakika 30 kupitia WhatsApp.'
                : 'Talk to the EdRetail team on WhatsApp — average response under 30 minutes.'}
            </p>
          </div>
        </div>

        <a
          id="delivery-chat-whatsapp-btn"
          href={`${WHATSAPP_LINK}?text=${encodeURIComponent('Hello ED Retail, I need assistance with delivery timing for my order.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold text-center transition-colors shrink-0"
        >
          {lang === 'sw' ? 'Wasiliana WhatsApp' : 'Chat on WhatsApp'}
        </a>
      </section>
    </div>
  );
}
