import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { PRODUCTS, Product } from '../../types';
import { useLang } from '../../context/LangContext';
import { formatPrice } from '../../utils/whatsappCompiler';

interface FavouritesViewProps {
  onSelectProduct: (product: Product) => void;
  onNavigateToProducts: () => void;
}

export function FavouritesView({ onSelectProduct, onNavigateToProducts }: FavouritesViewProps) {
  const { lang, t } = useLang();
  const favourites = useCartStore((s) => s.favourites);
  const toggleFavourite = useCartStore((s) => s.toggleFavourite);
  const addItem = useCartStore((s) => s.addItem);

  const favProducts = favourites
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter(Boolean) as Product[];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6 animate-fadeIn">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between border-b border-neutral-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-rose-500" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
              {lang === 'sw' ? 'Bidhaa Ulizozipenda' : 'Your Saved Favourites'}
            </h1>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            {lang === 'sw'
              ? `${favProducts.length} bidhaa zimehifadhiwa kwa ununuzi wa baadaye`
              : `${favProducts.length} item${favProducts.length !== 1 ? 's' : ''} saved for easy access`}
          </p>
        </div>
      </div>

      {/* ── LIST OR EMPTY STATE ── */}
      {favProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favProducts.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-xs flex flex-col justify-between gap-3 relative group"
            >
              {/* Remove button */}
              <button
                id={`remove-fav-${product.id}-btn`}
                onClick={() => toggleFavourite(product.id)}
                className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-xs rounded-xl text-neutral-400 hover:text-rose-600 shadow-xs border border-neutral-100 transition-colors z-10"
                aria-label="Remove from favourites"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div
                onClick={() => onSelectProduct(product)}
                className="cursor-pointer flex items-center gap-3"
              >
                <div className="w-20 h-20 rounded-xl bg-neutral-50 p-2 border border-neutral-200/60 flex items-center justify-center flex-shrink-0">
                  <img
                    src={product.image}
                    alt={t(product.name)}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  {product.badge && (
                    <span className="text-[9px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full uppercase">
                      {product.badge}
                    </span>
                  )}
                  <h3 className="text-xs font-bold text-neutral-900 mt-1 truncate">
                    {t(product.name)}
                  </h3>
                  <span className="text-xs font-extrabold text-neutral-900 block mt-1">
                    {formatPrice(product.price)} TZS
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100 flex items-center gap-2">
                <button
                  id={`fav-view-details-${product.id}-btn`}
                  onClick={() => onSelectProduct(product)}
                  className="flex-1 py-2 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold transition-colors text-center"
                >
                  {lang === 'sw' ? 'Tazama' : 'View Details'}
                </button>
                <button
                  id={`fav-add-cart-${product.id}-btn`}
                  onClick={() => addItem({ ...product, quantity: 1 })}
                  className="flex-1 py-2 px-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{lang === 'sw' ? 'Weka Mkobani' : 'Add to Cart'}</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200/80 p-8 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
            <Heart className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              {lang === 'sw' ? 'Bado haujahifadhi bidhaa yoyote' : 'No favourites saved yet'}
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              {lang === 'sw'
                ? 'Gusa alama ya moyo kwenye bidhaa yoyote ili kuihifadhi hapa kwa ajili ya ununuzi wa haraka.'
                : 'Tap the heart icon on any product in the catalog to bookmark items you wish to purchase later.'}
            </p>
          </div>
          <button
            id="fav-browse-products-btn"
            onClick={onNavigateToProducts}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-sm transition-transform active:scale-95"
          >
            <span>{lang === 'sw' ? 'Angalia Bidhaa Zote' : 'Browse Product Catalog'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
