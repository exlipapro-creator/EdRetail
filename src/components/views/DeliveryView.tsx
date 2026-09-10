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
    <div className="max-w-4xl mx-auto px-4 pb-10 sm:pb-12 space-y-8 sm:space-y-10 animate-fadeIn">
      {/* ── EDITORIAL HEADER — flat, informative, no box ── */}
      <header className="pt-4 sm:pt-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary-700">
          {lang === 'sw' ? 'Usafirishaji' : 'Delivery'}
        </p>
        <h1 className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 leading-tight">
          {lang === 'sw' ? 'Tunafikia Tanzania Nzima na Zanzibar' : 'Delivery across Tanzania & Zanzibar'}
        </h1>
        <p className="mt-2 text-sm text-neutral-500 max-w-xl leading-relaxed">
          {lang === 'sw'
            ? 'Tunakuletea bidhaa zako za Edmark popote ulipo — kwa usalama na kwa kufuatilia moja kwa moja kupitia WhatsApp.'
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
      </header>

      {/* ── ZONE FINDER — the core scannable table, unboxed ── */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-600" aria-hidden />
              {lang === 'sw' ? 'Tunafikia wapi' : 'Where we deliver'}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              {lang === 'sw' ? 'Muda wa kufika kwa kila eneo' : 'Estimated transit timelines by destination'}
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden />
            <input
              id="delivery-city-search"
              type="text"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              placeholder={lang === 'sw' ? 'Andika jiji au mkoa wako...' : 'Type your city or region...'}
              aria-label={lang === 'sw' ? 'Tafuta jiji au mkoa' : 'Search your city or region'}
              className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Zone rows — one row per destination, one clock icon per row.
            The single MapPin above labels the section; rows stay icon-light. */}
        <div className="border-y border-neutral-200/80 divide-y divide-neutral-100">
          {filteredZones.map((zone) => (
            <div
              key={zone.zone}
              className="flex items-center justify-between gap-4 py-3.5"
            >
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-neutral-900">{zone.zone}</h3>
                {zone.note && (
                  <p className="text-[11px] text-warning-700 font-medium mt-0.5">{zone.note}</p>
                )}
              </div>
              <span className="inline-flex items-center gap-1.5 shrink-0 text-xs font-bold text-primary-700 tabular-nums">
                <Clock className="w-3.5 h-3.5 text-primary-400" aria-hidden />
                {zone.days}
              </span>
            </div>
          ))}

          {filteredZones.length === 0 && (
            <div className="text-center py-8 text-neutral-400 text-xs">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-40" aria-hidden />
              <p>
                {lang === 'sw'
                  ? `Hatukupata eneo kwa "${searchCity}". Tuma ujumbe WhatsApp kuthibitisha upatikanaji.`
                  : `No exact zone match for "${searchCity}". Contact us on WhatsApp for custom routing.`}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── SUPPORT PILLARS — one flat row, meaning-bearing icons only ── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
        <div className="flex items-start gap-2.5">
          <Clock className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" aria-hidden />
          <p className="text-xs text-neutral-600 leading-relaxed">
            <span className="font-bold text-neutral-900 block">
              {lang === 'sw' ? 'Siku Hiyo Hiyo Dar' : 'Same-day in Dar es Salaam'}
            </span>
            {lang === 'sw'
              ? 'Maagizo kabla ya saa 6 mchana yanafika siku hiyo hiyo.'
              : 'Orders confirmed before 12:00 PM arrive the same day.'}
          </p>
        </div>
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-success-600 mt-0.5 shrink-0" aria-hidden />
          <p className="text-xs text-neutral-600 leading-relaxed">
            <span className="font-bold text-neutral-900 block">
              {lang === 'sw' ? 'Ufuatiliaji' : 'Real-time tracking'}
            </span>
            {lang === 'sw'
              ? 'Taarifa za usafirishaji na risiti kupitia WhatsApp.'
              : 'Dispatch updates and parcel receipts via WhatsApp.'}
          </p>
        </div>
        <div className="flex items-start gap-2.5">
          <Truck className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" aria-hidden />
          <p className="text-xs text-neutral-600 leading-relaxed">
            <span className="font-bold text-neutral-900 block">
              {lang === 'sw' ? 'Kila Mkoa na Kisiwa' : 'Every region & island'}
            </span>
            {lang === 'sw'
              ? 'Dar, miji mikuu, Zanzibar na mikoa ya pembezoni.'
              : 'Dar es Salaam, major hubs, Zanzibar, and remote towns.'}
          </p>
        </div>
      </section>

      {/* ── FAQ — accessible accordion ── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-5 h-5 text-primary-600" aria-hidden />
          <h2 className="text-lg font-bold text-neutral-900">
            {lang === 'sw' ? 'Maswali ya Kawaida' : 'Frequently asked questions'}
          </h2>
        </div>

        <div className="border-y border-neutral-200/80 divide-y divide-neutral-100">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx}>
                <button
                  id={`delivery-faq-btn-${idx}`}
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  aria-controls={`delivery-faq-panel-${idx}`}
                  className="w-full flex items-center justify-between gap-3 py-3.5 text-left hover:bg-neutral-50/60 transition-colors cursor-pointer"
                >
                  <span className="text-sm font-semibold text-neutral-900">
                    {lang === 'sw' ? faq.q.sw : faq.q.en}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    aria-hidden
                  />
                </button>
                {isOpen && (
                  <div
                    id={`delivery-faq-panel-${idx}`}
                    role="region"
                    className="pb-4 text-xs text-neutral-600 leading-relaxed"
                  >
                    {lang === 'sw' ? faq.a.sw : faq.a.en}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── WHATSAPP SUPPORT — quiet closing action ── */}
      <section className="pt-2 border-t border-neutral-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-xs text-neutral-500 leading-relaxed">
          {lang === 'sw'
            ? 'Una swali la usafirishaji? Tunajibu ndani ya dakika 30 kupitia WhatsApp.'
            : 'Need help with delivery? Talk to the EdRetail team — average response under 30 minutes.'}
        </p>
        <a
          id="delivery-chat-whatsapp-btn"
          href={`${WHATSAPP_LINK}?text=${encodeURIComponent('Hello ED Retail, I need assistance with delivery timing for my order.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-5 py-2.5 bg-[#123B6D] hover:bg-[#0D315D] text-white rounded-xl text-xs font-bold text-center transition-colors shrink-0"
        >
          <span className="inline-flex items-center gap-2">
            <Phone className="w-3.5 h-3.5" aria-hidden />
            {lang === 'sw' ? 'Wasiliana WhatsApp' : 'Chat on WhatsApp'}
          </span>
        </a>
      </section>
    </div>
  );
}
