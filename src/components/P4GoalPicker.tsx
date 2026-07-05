import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, Plus, ShoppingBag } from 'lucide-react';
import { PRODUCTS, BUNDLES } from '../types';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../utils/whatsappCompiler';
import { useLang } from '../context/LangContext';
import { motionTokens } from '../design/motion';

type GoalId = 'starting' | 'detox' | 'complete';

interface Goal {
  id: GoalId;
  label: { en: string; sw: string };
  sub: { en: string; sw: string };
}

const GOALS: Goal[] = [
  {
    id: 'starting',
    label: { en: 'Just getting started', sw: 'Kuanza tu' },
    sub: { en: 'Ease in with one product', sw: 'Anza na bidhaa moja' },
  },
  {
    id: 'detox',
    label: { en: 'Focus on detox first', sw: 'Kusafisha mwili kwanza' },
    sub: { en: 'Cleanse before you shift', sw: 'Safisha kabla ya kubadilisha' },
  },
  {
    id: 'complete',
    label: { en: 'Full transformation', sw: 'Mabadiliko kamili' },
    sub: { en: 'The complete P4 system', sw: 'Mfumo kamili wa P4' },
  },
];

export function P4GoalPicker() {
  const { lang, t } = useLang();
  const addItem = useCartStore((s) => s.addItem);
  const [selected, setSelected] = useState<GoalId | null>(null);
  const [added, setAdded] = useState(false);

  const handleSelect = (id: GoalId) => {
    setSelected(id);
    setAdded(false);
  };

  const handleAdd = () => {
    if (selected === 'starting') {
      const p = PRODUCTS.find((p) => p.id === 'mrt-complex');
      if (p) addItem({ ...p, quantity: 1 });
    } else if (selected === 'detox') {
      const p = PRODUCTS.find((p) => p.id === 'shake-off-phyto');
      if (p) addItem({ ...p, quantity: 1 });
    } else if (selected === 'complete') {
      const bundle = BUNDLES.find((b) => b.id === 'p4-complete');
      if (bundle) {
        bundle.productIds.forEach((id) => {
          const p = PRODUCTS.find((p) => p.id === id);
          if (!p) return;
          const discounted = Math.round(p.price * (1 - bundle.discountPercent / 100));
          addItem({ ...p, price: discounted, quantity: 1 });
        });
      }
    }
    setAdded(true);
  };

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1400);
    return () => clearTimeout(t);
  }, [added]);

  const recommendation = (() => {
    if (selected === 'starting') {
      const p = PRODUCTS.find((p) => p.id === 'mrt-complex');
      if (!p) return null;
      return { title: t(p.name), price: p.price, items: [t(p.name)] };
    }
    if (selected === 'detox') {
      const p = PRODUCTS.find((p) => p.id === 'shake-off-phyto');
      if (!p) return null;
      return { title: t(p.name), price: p.price, items: [t(p.name)] };
    }
    if (selected === 'complete') {
      const bundle = BUNDLES.find((b) => b.id === 'p4-complete');
      if (!bundle) return null;
      const products = bundle.productIds.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean) as typeof PRODUCTS;
      const original = products.reduce((sum, p) => sum + p.price, 0);
      const price = Math.round(original * (1 - bundle.discountPercent / 100));
      return { title: t(bundle.name), price, items: products.map((p) => t(p.name)), original };
    }
    return null;
  })();

  const ctaCopy = (() => {
    if (!selected) return lang === 'sw' ? 'Chagua lengo kwanza' : 'Choose a goal first';
    if (selected === 'complete') {
      return lang === 'sw' ? 'Ongeza mpango kamili kwenye mkoba' : 'Add full plan to cart';
    }
    return lang === 'sw' ? 'Ongeza mpango kwenye mkoba' : 'Add this plan to cart';
  })();

  return (
    <section className="max-w-lg mx-auto px-4 py-4">
      <div className="flex items-center gap-1.5 mb-1">
        <Sparkles className="w-3.5 h-3.5 text-primary-600" />
        <h2 className="text-base font-semibold text-gray-900">
          {lang === 'sw' ? 'Huna uhakika wapi kuanzia?' : "Not sure where to start?"}
        </h2>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        {lang === 'sw' ? 'Chagua lengo lako, tutapendekeza bidhaa' : 'Pick your goal — we\'ll recommend a plan'}
      </p>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {GOALS.map((goal) => (
          <button
            key={goal.id}
            onClick={() => handleSelect(goal.id)}
            className={`text-left min-h-16 p-2.5 rounded-lg border transition-colors outline-none [-webkit-tap-highlight-color:transparent] ${
              selected === goal.id
                ? 'bg-primary-50 border-primary-300'
                : 'bg-white border-gray-100 hover:border-gray-200'
            }`}
          >
            <div className={`text-[11px] font-semibold leading-tight mb-1 ${selected === goal.id ? 'text-primary-700' : 'text-gray-900'}`}>
              {lang === 'sw' ? goal.label.sw : goal.label.en}
            </div>
            <div className="text-[10px] text-gray-400 leading-tight">
              {lang === 'sw' ? goal.sub.sw : goal.sub.en}
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {recommendation && (
          <motion.div
            key={selected}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: motionTokens.durations.medium, ease: motionTokens.easings.inOut }}
            className="overflow-hidden"
          >
            <div className="relative bg-gradient-to-br from-primary-50 via-white to-primary-50 border border-primary-200 rounded-lg p-3.5 shadow-sm overflow-visible">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center flex-shrink-0 border border-primary-100 shadow-sm">
                  <ShoppingBag className="w-[18px] h-[18px] text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-semibold text-primary-600 uppercase tracking-wide mb-0.5">
                    {lang === 'sw' ? 'Tunapendekeza' : 'Recommended for you'}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">{recommendation.title}</h3>
                  {recommendation.items.length > 1 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {recommendation.items.map((name) => (
                        <span key={name} className="text-[10px] bg-white border border-primary-100 px-2 py-0.5 rounded-full text-gray-600">
                          {name}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-base font-semibold text-gray-900">{formatPrice(recommendation.price)}</span>
                    <span className="text-xs text-gray-400">TZS</span>
                    {recommendation.original && (
                      <span className="text-xs text-gray-400 line-through">{formatPrice(recommendation.original)}</span>
                    )}
                  </div>
                </div>
              </div>

              <p className="mt-3 text-[11px] text-gray-500">
                {lang === 'sw'
                  ? 'Gusa kitufe hiki ili kuongeza mpango uliopendekezwa kwenye mkoba wako.'
                  : 'Tap this button to add the recommended plan directly to your cart.'}
              </p>
              <motion.button
                type="button"
                onClick={handleAdd}
                disabled={added}
                whileTap={{ scale: 0.97 }}
                className={`w-full mt-2 flex items-center justify-center gap-1.5 py-2.75 rounded-md text-xs font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 [-webkit-tap-highlight-color:transparent] ${
                  added
                    ? 'bg-green-100 text-green-700'
                    : 'bg-primary text-white hover:bg-primary-700 shadow-sm'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    {lang === 'sw' ? 'Imeongezwa kwenye Mkoba' : 'Added to Cart'}
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    {ctaCopy}
                  </>
                )}
              </motion.button>
              {added && (
                <motion.span
                  initial={{ opacity: 0, y: 0, scale: 0.8 }}
                  animate={{ opacity: 1, y: -28, scale: 1.05 }}
                  exit={{ opacity: 0, y: -60, scale: 0.8 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="absolute right-3 top-3 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full shadow-sm"
                >
                  +1
                </motion.span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
