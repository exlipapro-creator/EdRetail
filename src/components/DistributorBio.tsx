import { motion } from 'framer-motion';
import { Crown, MapPin, Clock, Phone } from 'lucide-react';
import { useLang } from '../context/LangContext';
import { WHATSAPP_LINK, DISTRIBUTOR_NAME } from '../utils/whatsappCompiler';

export function DistributorBio() {
  const { lang } = useLang();

  return (
    <section className="max-w-lg mx-auto px-4 py-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-[12px] border border-gray-100 p-4 flex gap-4 items-center"
      >
        {/* Photo */}
        <div className="relative flex-shrink-0">
          <img
            src="/logo/distributor-circle.png"
            alt={DISTRIBUTOR_NAME}
            className="w-20 h-20 rounded-full object-cover border-2 border-amber-300"
          />
          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-amber-400 rounded-full flex items-center justify-center border-2 border-white">
            <Crown className="w-3.5 h-3.5 text-amber-900" strokeWidth={2.5} />
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wide">
              {lang === 'sw' ? 'Meneja wa Taji' : 'Crown Manager'}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 leading-tight">{DISTRIBUTOR_NAME}</h3>
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 text-gray-400" />
            <span className="text-[11px] text-gray-500">Dar es Salaam, Tanzania</span>
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed mt-2">
            {lang === 'sw'
              ? 'Msambazaji rasmi wa Edmark. Ninasaidia wateja kote Tanzania kupata bidhaa sahihi za afya.'
              : 'Authorized Edmark distributor helping customers across Tanzania find the right wellness products.'}
          </p>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400">
            <Clock className="w-3 h-3" />
            <span>
              {lang === 'sw'
                ? 'Hujibu ndani ya dakika 30 · Jumatatu–Jumamosi, 8am–8pm'
                : 'Usually replies within 30 min · Mon–Sat, 8am–8pm'}
            </span>
          </div>
        </div>
      </motion.div>

      <motion.a
        href={WHATSAPP_LINK}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15 }}
        className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-[10px] text-xs font-semibold hover:bg-green-700 transition-colors outline-none [-webkit-tap-highlight-color:transparent]"
      >
        <Phone className="w-3.5 h-3.5" />
        {lang === 'sw' ? `Ongea na ${DISTRIBUTOR_NAME.split(' ')[0]}` : `Chat with ${DISTRIBUTOR_NAME.split(' ')[0]}`}
      </motion.a>
    </section>
  );
}
