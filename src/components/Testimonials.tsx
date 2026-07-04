import { Star } from 'lucide-react';
import { TESTIMONIALS } from '../types';
import { useLang } from '../context/LangContext';

export function Testimonials() {
  const { lang, t } = useLang();

  return (
    <section className="max-w-lg mx-auto px-4 py-6">
      <h2 className="text-base font-semibold text-gray-900 mb-1">
        {lang === 'sw' ? 'Wanachosema Wateja Wetu' : 'What Our Customers Say'}
      </h2>
      <p className="text-xs text-gray-400 mb-4">
        {lang === 'sw' ? 'Matokeo ya kweli kutoka Tanzania' : 'Real results from across Tanzania'}
      </p>

      <div className="space-y-3">
        {TESTIMONIALS.map((item) => (
          <div key={item.id} className="bg-white rounded-[10px] border border-gray-100 p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                <p className="text-[11px] text-gray-400">{item.location} · {item.product}</p>
              </div>
              <span className="text-[10px] font-semibold text-green-700 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full whitespace-nowrap ml-2">
                {item.result}
              </span>
            </div>
            <div className="flex gap-0.5 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed italic">"{t(item.text)}"</p>
          </div>
        ))}
      </div>
    </section>
  );
}
