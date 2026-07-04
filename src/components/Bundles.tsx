import { motion } from 'framer-motion';
import { Package2, Plus } from 'lucide-react';
import { BUNDLES, PRODUCTS } from '../types';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../utils/whatsappCompiler';
import { useLang } from '../context/LangContext';

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
    <section className="max-w-lg mx-auto px-4 py-4">
      <h2 className="text-base font-semibold text-gray-900 mb-1">
        {lang === 'sw' ? 'Pakiti Maalum' : 'Bundle Deals'}
      </h2>
      <p className="text-xs text-gray-400 mb-4">
        {lang === 'sw' ? 'Okoa zaidi unaponunua pamoja' : 'Save more when you buy together'}
      </p>

      <div className="space-y-3">
        {BUNDLES.map((bundle) => {
          const products = bundle.productIds
            .map((id) => PRODUCTS.find((p) => p.id === id))
            .filter(Boolean) as typeof PRODUCTS;

          const originalTotal = products.reduce((sum, p) => sum + p.price, 0);
          const discountedTotal = Math.round(originalTotal * (1 - bundle.discountPercent / 100));
          const savings = originalTotal - discountedTotal;

          return (
            <div key={bundle.id} className="bg-white rounded-[10px] border border-blue-100 p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 bg-blue-50 rounded-[8px] flex items-center justify-center flex-shrink-0">
                  <Package2 className="w-[18px] h-[18px] text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-semibold text-gray-900">{t(bundle.name)}</h3>
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                      {bundle.discountPercent}% OFF
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{t(bundle.description)}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {products.map((p) => (
                  <span key={p.id} className="text-[10px] bg-gray-50 border border-gray-100 px-2 py-1 rounded-full text-gray-600 font-medium">
                    {t(p.name)}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-base font-semibold text-gray-900">{formatPrice(discountedTotal)}</span>
                  <span className="text-xs text-gray-400 ml-1">TZS</span>
                  <span className="text-xs text-gray-400 line-through ml-2">{formatPrice(originalTotal)}</span>
                  <span className="text-xs text-green-600 font-semibold ml-2">
                    {lang === 'sw' ? `Okoa ${formatPrice(savings)}` : `Save ${formatPrice(savings)}`}
                  </span>
                </div>
                <motion.button
                  onClick={() => handleAddBundle(bundle.productIds, bundle.discountPercent)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white rounded-[8px] text-xs font-semibold hover:bg-blue-700 transition-colors outline-none [-webkit-tap-highlight-color:transparent]"
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-3.5 h-3.5" />
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
