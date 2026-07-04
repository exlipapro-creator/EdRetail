import { MapPin, Clock } from 'lucide-react';
import { DELIVERY_ZONES } from '../types';
import { useLang } from '../context/LangContext';

export function DeliveryInfo() {
  const { lang } = useLang();

  return (
    <section className="max-w-lg mx-auto px-4 py-4">
      <div className="bg-white rounded-[10px] border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100">
          <MapPin className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-semibold text-gray-900">
            {lang === 'sw' ? 'Uwasilishaji Tanzania Nzima' : 'Delivery Across Tanzania'}
          </h2>
        </div>
        <div className="divide-y divide-gray-50">
          {DELIVERY_ZONES.map((zone, i) => (
            <div key={i} className="px-4 py-3 flex items-start gap-3">
              <Clock className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm text-gray-900 font-medium">{zone.zone}</span>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {zone.days}
                  </span>
                </div>
                {zone.note && (
                  <p className="text-[11px] text-gray-400 mt-0.5">{zone.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-[11px] text-gray-500 leading-relaxed">
            {lang === 'sw'
              ? 'Maswali kuhusu uwasilishaji? Wasiliana nasi kupitia WhatsApp.'
              : 'Questions about delivery? Contact us via WhatsApp for confirmation.'}
          </p>
        </div>
      </div>
    </section>
  );
}
