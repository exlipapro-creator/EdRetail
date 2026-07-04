import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ShoppingBag, Heart, X, Info } from 'lucide-react';
import { Product } from '../types';
import { useCartStore } from '../store/cartStore';
import { formatPrice, formatUsd } from '../utils/whatsappCompiler';
import { useLang } from '../context/LangContext';
import { motionTokens } from '../design/motion';

interface ProductCardProps {
  product: Product;
}

const CATEGORY_BADGE_COLOR: Record<string, string> = {
  'p4-slimming':         'bg-blue-100 text-blue-700 border-blue-200',
  'health-wellness':     'bg-green-100 text-green-700 border-green-200',
  'lifestyle-beverages': 'bg-amber-100 text-amber-700 border-amber-200',
};

export function ProductCard({ product }: ProductCardProps) {
  const { t } = useLang();
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

  const badgeColor = CATEGORY_BADGE_COLOR[product.category] ?? 'bg-gray-100 text-gray-600 border-gray-200';

  return (
    <>
      <div
        className="relative bg-white rounded-lg overflow-hidden border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer"
        onClick={() => setShowDetail(true)}
      >
        {/* Favourite */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavourite(product.id); }}
          className="absolute top-2 right-2 z-20 p-2 rounded-md bg-white/80 backdrop-blur-sm outline-none [-webkit-tap-highlight-color:transparent]"
          aria-label={isFavourite ? t({ en: 'Remove from favourites', sw: 'Ondoa kwenye vipendwa' }) : t({ en: 'Add to favourites', sw: 'Ongeza kwenye vipendwa' })}
          style={{ minWidth: 44, minHeight: 44 }}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${isFavourite ? 'fill-rose-500 text-rose-500' : 'text-gray-300'}`}
          />
        </button>

        {/* Badge */}
        {product.badge && (
          <div className={`absolute top-3 left-3 z-20 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${badgeColor} uppercase tracking-wide`}>
            {product.badge}
          </div>
        )}

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-full">
              {t({ en: 'Out of stock', sw: 'Haipatikani' })}
            </span>
          </div>
        )}

        {/* Image */}
        <div className="relative h-40 bg-gray-50 flex items-center justify-center overflow-hidden">
          <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center">
            <ShoppingBag className="w-9 h-9 text-gray-300" />
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">
            {t(product.name)}
          </h3>
          <p className="text-[11px] text-gray-400 mb-2 line-clamp-2 leading-relaxed">
            {t(product.description)}
          </p>

          {/* Price row */}
          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="text-sm font-semibold text-gray-900">{formatPrice(product.price)}</span>
            <span className="text-[10px] text-gray-400 font-medium">TZS</span>
            <span className="text-[10px] text-gray-300 ml-auto">{formatUsd(product.priceUsd)}</span>
          </div>

          {/* Add / qty control */}
          <div className="flex items-center justify-between">
            <button
              onClick={(e) => { e.stopPropagation(); setShowDetail(true); }}
              className="p-2 rounded-md text-gray-300 hover:text-primary-500 transition-colors outline-none [-webkit-tap-highlight-color:transparent]"
              aria-label={t({ en: 'View details', sw: 'Ona maelezo' })}
              style={{ minWidth: 44, minHeight: 44 }}
            >
              <Info className="w-4 h-4" />
            </button>

            <AnimatePresence mode="wait">
              {qty === 0 ? (
                <motion.button
                  key="add"
                  onClick={handleAdd}
                  disabled={!product.inStock}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-md text-xs font-semibold hover:bg-primary-700 active:bg-primary-800 transition-colors outline-none"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: motionTokens.hover }}
                  style={{ minHeight: 40 }}
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                  Add
                </motion.button>
              ) : (
                <motion.div
                  key="qty"
                  className="flex items-center gap-1"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: motionTokens.hover }}
                >
                  <motion.button
                    onClick={handleMinus}
                    className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-md hover:bg-gray-200 transition-colors outline-none [-webkit-tap-highlight-color:transparent]"
                    whileTap={{ scale: 0.9 }}
                  >
                    <Minus className="w-3 h-3 text-gray-700" strokeWidth={2.5} />
                  </motion.button>
                  <span className="w-8 text-center text-sm font-semibold text-gray-900">{qty}</span>
                  <motion.button
                    onClick={handleAdd}
                    className="w-10 h-10 flex items-center justify-center bg-primary-600 rounded-md hover:bg-primary-700 transition-colors outline-none [-webkit-tap-highlight-color:transparent]"
                    whileTap={{ scale: 0.9 }}
                  >
                    <Plus className="w-3 h-3 text-white" strokeWidth={2.5} />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Product Detail Sheet */}
      <AnimatePresence>
        {showDetail && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetail(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl max-w-lg mx-auto max-h-[85vh] overflow-y-auto"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>

              {/* Image area */}
              <div className="h-48 bg-gray-50 flex items-center justify-center mx-5 mt-2 rounded-xl relative">
                <ShoppingBag className="w-16 h-16 text-gray-200" />
                {product.badge && (
                  <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${badgeColor} uppercase tracking-wide`}>
                    {product.badge}
                  </span>
                )}
              </div>

              <div className="px-5 pt-4 pb-8">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h2 className="text-lg font-semibold text-gray-900 leading-tight">{t(product.name)}</h2>
                  <button
                    onClick={() => setShowDetail(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 flex-shrink-0 outline-none [-webkit-tap-highlight-color:transparent]"
                    style={{ minWidth: 44, minHeight: 44 }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-xl font-semibold text-gray-900">{formatPrice(product.price)}</span>
                  <span className="text-sm text-gray-400">TZS</span>
                  <span className="text-sm text-gray-300 ml-1">{formatUsd(product.priceUsd)}</span>
                </div>

                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t({ en: 'About', sw: 'Kuhusu' })}</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{t(product.description)}</p>
                </div>

                <div className="mb-6 p-3 bg-primary-50 rounded-md border border-primary-100">
                  <h3 className="text-xs font-semibold text-primary-700 uppercase tracking-wider mb-2">{t({ en: 'How to use', sw: 'Jinsi ya kutumia' })}</h3>
                  <p className="text-sm text-primary-900 leading-relaxed">{t(product.usage)}</p>
                </div>

                <AnimatePresence mode="wait">
                  {qty === 0 ? (
                    <motion.button
                      key="add-detail"
                      onClick={(e) => { handleAdd(e); setShowDetail(false); }}
                      disabled={!product.inStock}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-600 text-white rounded-md text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 outline-none"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Plus className="w-4 h-4" />
                      {product.inStock ? t({ en: 'Add to Cart', sw: 'Ongeza kwenye Mkoba' }) : t({ en: 'Out of Stock', sw: 'Haipatikani' })}
                    </motion.button>
                  ) : (
                    <motion.div
                      key="qty-detail"
                      className="flex items-center justify-between bg-gray-50 rounded-md p-2 border border-gray-100"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    >
                      <motion.button
                        onClick={handleMinus}
                        className="w-10 h-10 flex items-center justify-center bg-white rounded-md border border-gray-200 outline-none [-webkit-tap-highlight-color:transparent]"
                        whileTap={{ scale: 0.9 }}
                      >
                        <Minus className="w-4 h-4 text-gray-700" />
                      </motion.button>
                      <span className="text-base font-semibold text-gray-900">{qty} in cart</span>
                      <motion.button
                        onClick={handleAdd}
                        className="w-10 h-10 flex items-center justify-center bg-primary-600 rounded-md outline-none [-webkit-tap-highlight-color:transparent]"
                        whileTap={{ scale: 0.9 }}
                      >
                        <Plus className="w-4 h-4 text-white" />
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
