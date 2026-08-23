import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ShoppingBag, Heart, X, Info, Check } from 'lucide-react';
import { CATEGORIES, Product } from '../types';
import { useCartStore } from '../store/cartStore';
import { formatPrice, formatUsd } from '../utils/whatsappCompiler';
import { useLang } from '../context/LangContext';

interface ProductCardProps {
  product: Product;
}

const CATEGORY_BADGE_COLOR: Record<string, string> = {
  'p4-slimming':         'bg-emerald-50 text-[#0E6B52] border-emerald-200',
  'health-wellness':     'bg-teal-50 text-teal-800 border-teal-200',
  'lifestyle-beverages': 'bg-[#E8EEF5] text-[#123B6D] border-[#C3D3E7]',
};

export function ProductCard({ product }: ProductCardProps) {
  const { lang, t } = useLang();
  const categoryLabel = CATEGORIES.find((c) => c.id === product.category)?.label;
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const items = useCartStore((s) => s.items);
  const toggleFavourite = useCartStore((s) => s.toggleFavourite);
  const isFavourite = useCartStore((s) => s.isFavourite(product.id));

  const [showDetail, setShowDetail] = useState(false);

  const cartItem = items.find((i) => i.id === product.id);
  const qty = cartItem?.quantity ?? 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.inStock) return;
    if (qty === 0) {
      addItem({ ...product, quantity: 1 });
    } else {
      updateQuantity(product.id, qty + 1);
    }
  };

  const handleMinus = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(product.id, qty - 1);
  };

  const badgeColor = CATEGORY_BADGE_COLOR[product.category] ?? 'bg-neutral-100 text-neutral-700 border-neutral-200';

  return (
    <>
      <div
        className="relative bg-white rounded-2xl overflow-hidden border border-neutral-200/90 hover:border-[#123B6D]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        onClick={() => setShowDetail(true)}
      >
        {/* Favourite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavourite(product.id);
          }}
          className={`absolute top-2.5 right-2.5 z-20 p-2 rounded-xl border backdrop-blur-xs transition-colors ${
            isFavourite
              ? 'bg-rose-50 text-rose-600 border-rose-200'
              : 'bg-white/90 text-neutral-400 hover:text-neutral-700 border-neutral-200 shadow-2xs'
          }`}
          aria-label={
            isFavourite
              ? t({ en: 'Remove from favourites', sw: 'Ondoa kwenye vipendwa' })
              : t({ en: 'Add to favourites', sw: 'Ongeza kwenye vipendwa' })
          }
          style={{ minWidth: 40, minHeight: 40 }}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavourite ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Product Badge */}
        {product.badge && (
          <div
            className={`absolute top-2.5 left-2.5 z-20 px-2 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-wider ${badgeColor}`}
          >
            {product.badge}
          </div>
        )}

        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-xs font-bold text-neutral-500 bg-white border border-neutral-200 px-3 py-1 rounded-full shadow-2xs">
              {t({ en: 'Out of stock', sw: 'Haipatikani' })}
            </span>
          </div>
        )}

        {/* Product Image */}
        <div className="relative h-36 sm:h-44 bg-neutral-50 flex items-center justify-center p-3 overflow-hidden border-b border-neutral-100">
          <img
            src={product.image}
            alt={t(product.name)}
            className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const el = e.currentTarget;
              el.style.display = 'none';
              const fallback = el.nextElementSibling as HTMLElement | null;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div className="w-20 h-20 rounded-xl bg-neutral-100 items-center justify-center hidden">
            <ShoppingBag className="w-8 h-8 text-neutral-300" />
          </div>
        </div>

        {/* Product Content */}
        <div className="p-3.5 flex flex-col justify-between flex-grow">
          <div>
            {categoryLabel && (
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight block mb-0.5">
                {t(categoryLabel)}
              </span>
            )}
            {/* 2-line title support with line clamp to prevent aggressive truncation */}
            <h3 className="font-extrabold text-neutral-900 text-xs sm:text-sm leading-snug line-clamp-2 min-h-[2.4rem]">
              {t(product.name)}
            </h3>
            <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
              {t(product.description)}
            </p>
          </div>

          {/* Pricing and Action row */}
          <div className="pt-3 mt-3 border-t border-neutral-100">
            <div className="flex items-baseline justify-between gap-1 mb-2.5">
              <div>
                <span className="text-sm sm:text-base font-black text-neutral-900 leading-tight">
                  {formatPrice(product.price)}
                </span>
                <span className="text-[10px] text-neutral-500 font-semibold ml-1">TZS</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-medium">
                ({formatUsd(product.priceUsd)})
              </span>
            </div>

            <div className="flex items-center justify-between gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetail(true);
                }}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
                aria-label={t({ en: 'View details', sw: 'Ona maelezo' })}
                title="View full details"
              >
                <Info className="w-4 h-4" />
              </button>

              <AnimatePresence mode="wait">
                {qty === 0 ? (
                  <motion.button
                    key="add"
                    onClick={handleAdd}
                    disabled={!product.inStock}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#123B6D] hover:bg-[#0D315D] text-white rounded-xl text-xs font-black shadow-2xs transition-colors disabled:opacity-40"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{lang === 'sw' ? 'Weka' : 'Add'}</span>
                  </motion.button>
                ) : (
                  <motion.div
                    key="qty"
                    className="flex-1 flex items-center justify-between border border-[#123B6D]/30 bg-[#F0F4F9] rounded-xl p-0.5"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <button
                      onClick={handleMinus}
                      className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-[#123B6D] font-black text-xs shadow-2xs hover:bg-neutral-100"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-black text-[#123B6D] px-2">{qty}</span>
                    <button
                      onClick={handleAdd}
                      className="w-7 h-7 bg-[#123B6D] text-white rounded-lg flex items-center justify-center font-black text-xs shadow-2xs hover:bg-[#0D315D]"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Product Detail Sheet */}
      <AnimatePresence>
        {showDetail && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetail(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-w-lg mx-auto max-h-[85vh] overflow-y-auto shadow-2xl p-5"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center -mt-2 pb-3">
                <div className="w-12 h-1 bg-stone-300 rounded-full" />
              </div>

              <div className="flex items-center justify-between mb-3">
                {product.badge && (
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${badgeColor}`}>
                    {product.badge}
                  </span>
                )}
                <button
                  onClick={() => setShowDetail(false)}
                  className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 ml-auto"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Detail Image */}
              <div className="h-52 bg-stone-50 rounded-2xl flex items-center justify-center p-4 border border-stone-200/60 mb-4">
                <img
                  src={product.image}
                  alt={t(product.name)}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <h2 className="text-lg font-black text-neutral-900 mb-1 leading-snug">
                {t(product.name)}
              </h2>
              <div className="text-[#123B6D] font-extrabold text-sm mb-3">
                {formatPrice(product.price)} TZS <span className="text-xs text-neutral-400">({formatUsd(product.priceUsd)})</span>
              </div>

              <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                {t(product.description)}
              </p>

              {product.usage && (
                <div className="space-y-2 mb-4 bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200/60">
                  <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider">
                    {lang === 'sw' ? 'Matumizi na Maelekezo' : 'How to Use'}
                  </h4>
                  <p className="text-xs text-neutral-700 leading-relaxed flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#0E6B52] flex-shrink-0 mt-0.5" />
                    <span>{t(product.usage)}</span>
                  </p>
                </div>
              )}

              {/* Bottom Sticky Action */}
              <div className="pt-3 border-t border-neutral-200 flex items-center gap-3">
                <button
                  onClick={handleAdd}
                  disabled={!product.inStock}
                  className="w-full py-3 bg-[#123B6D] hover:bg-[#0D315D] text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>{lang === 'sw' ? 'Weka kwenye Mkoba' : 'Add to Cart'}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
