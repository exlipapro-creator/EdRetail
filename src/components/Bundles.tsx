import { motion } from 'framer-motion';
import { Package2, Plus } from 'lucide-react';
import { BUNDLES, PRODUCTS } from '../types';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../utils/whatsappCompiler';
import { useLang } from '../context/LangContext';
import { SectionHeader, Badge } from './ui';

export function Bundles() {
  const { lang, t } = useLang();
  const addItem = useCartStore((s) => s.addItem);

  const handleAddBundle = (productIds: string[], discountPercent: number) => {
    productIds.forEach((id) => {
      const product = PRODUCTS.find((p) => p.id === id);
      if (!product) return;
      const discountedPrice = Math.round(product.price * (1 - discountPercent / 100));
      addItem({ ...product, price: discountedPrice, quantity: 1 });
    });
  };

  return (
    <section id="bundles" className="container-page py-4 scroll-mt-20">
      <SectionHeader
        label={lang === 'sw' ? 'Pakiti' : 'Bundles'}
        title={lang === 'sw' ? 'Pakiti Maalum' : 'Bundle Deals'}
        sub={lang === 'sw' ? 'Okoa zaidi unaponunua pamoja' : 'Save more when you buy together'}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {BUNDLES.map((bundle) => {
          const products = bundle.productIds
            .map((id) => PRODUCTS.find((p) => p.id === id))
            .filter(Boolean) as typeof PRODUCTS;

          const originalTotal = products.reduce((sum, p) => sum + p.price, 0);
          const discountedTotal = Math.round(originalTotal * (1 - bundle.discountPercent / 100));
          const savings = originalTotal - discountedTotal;

          return (
            <div key={bundle.id} className="bg-white rounded-xl border border-primary-100 p-4 shadow-card">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package2 className="w-[18px] h-[18px] text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-bold text-gray-900">{t(bundle.name)}</h3>
                    <Badge tone="primary">{bundle.discountPercent}% OFF</Badge>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{t(bundle.description)}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {products.map((p) => (
                  <span key={p.id} className="text-[10px] bg-gray-50 border border-gray-200 px-2 py-1 rounded-full text-gray-600 font-medium">
                    {t(p.name)}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-base font-bold text-gray-900">{formatPrice(discountedTotal)}</span>
                  <span className="text-xs text-gray-400 ml-1">TZS</span>
                  <span className="text-xs text-gray-400 line-through ml-2">{formatPrice(originalTotal)}</span>
                  <span className="text-xs text-green-600 font-bold ml-2">
                    {lang === 'sw' ? `Okoa ${formatPrice(savings)}` : `Save ${formatPrice(savings)}`}
                  </span>
                </div>
                <motion.button
                  onClick={() => handleAddBundle(bundle.productIds, bundle.discountPercent)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 text-white rounded-md text-xs font-bold hover:bg-primary-700 active:bg-primary-800 transition-colors outline-none shadow-card [-webkit-tap-highlight-color:transparent]"
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                  {lang === 'sw' ? 'Ongeza Pakiti' : 'Add Bundle'}
                </motion.button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
