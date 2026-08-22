import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  LayoutGrid,
  List,
  Filter,
  Heart,
  ShoppingBag,
  Plus,
  Minus,
  Coffee,
  Activity,
  Leaf,
  Sparkles,
} from 'lucide-react';
import { PRODUCTS, CATEGORIES, Product } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { useDistributorStore } from '../../store/distributorStore';
import { formatPrice, formatUsd } from '../../utils/whatsappCompiler';
import { useLang } from '../../context/LangContext';

interface ProductsViewProps {
  onSelectProduct: (product: Product) => void;
  initialSearch?: string;
}

const CATEGORY_ICONS: Record<string, typeof Activity> = {
  'p4-slimming': Activity,
  'health-wellness': Leaf,
  'lifestyle-beverages': Coffee,
};

export function ProductsView({ onSelectProduct, initialSearch = '' }: ProductsViewProps) {
  const { lang, t } = useLang();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState(initialSearch);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [inStockOnly, setInStockOnly] = useState(false);

  const getEffectiveProducts = useDistributorStore((s) => s.getEffectiveProducts);
  const liveProducts = getEffectiveProducts();

  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const cartItems = useCartStore((s) => s.items);
  const toggleFavourite = useCartStore((s) => s.toggleFavourite);
  const favourites = useCartStore((s) => s.favourites);

  const filteredProducts = useMemo(() => {
    let list = activeCategory === 'all'
      ? liveProducts
      : liveProducts.filter((p) => p.category === activeCategory);

    if (inStockOnly) {
      list = list.filter((p) => p.inStock);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.en.toLowerCase().includes(q) ||
          p.name.sw.toLowerCase().includes(q) ||
          p.description.en.toLowerCase().includes(q) ||
          p.description.sw.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeCategory, search, inStockOnly, liveProducts]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6 animate-fadeIn">
      {/* ── SEARCH & FILTER HEADER BAR ── */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              id="products-catalog-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === 'sw' ? 'Tafuta kwa jina la bidhaa, dalili, au faida...' : 'Search by product name, benefit, or category...'}
              className="w-full pl-10 pr-9 py-2.5 bg-neutral-50 border border-neutral-200/80 rounded-2xl text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Controls: In-Stock Filter & Layout Switcher */}
          <div className="flex items-center justify-between sm:justify-end gap-2">
            <button
              id="filter-instock-toggle"
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                inStockOnly
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-neutral-50 text-neutral-600 border-neutral-200/80 hover:bg-neutral-100'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{lang === 'sw' ? 'Zilizo Stoo Tu' : 'In Stock Only'}</span>
            </button>

            {/* Layout mode switcher */}
            <div className="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-200/60">
              <button
                id="view-mode-grid"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-primary-600 shadow-xs' : 'text-neutral-400 hover:text-neutral-700'
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                id="view-mode-list"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'list' ? 'bg-white text-primary-600 shadow-xs' : 'text-neutral-400 hover:text-neutral-700'
                }`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            id="cat-tab-all"
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'sw' ? 'Zote' : 'All Products'}</span>
            <span className="text-[10px] opacity-75">({PRODUCTS.length})</span>
          </button>

          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id] || Activity;
            const isCatActive = activeCategory === cat.id;
            const count = PRODUCTS.filter((p) => p.category === cat.id).length;

            return (
              <button
                key={cat.id}
                id={`cat-tab-${cat.id}`}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                  isCatActive
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t(cat.label)}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SUMMARY COUNT ── */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold text-neutral-800">
          {activeCategory === 'all'
            ? (lang === 'sw' ? 'Bidhaa Zote za Edmark' : 'All Edmark Wellness Products')
            : t(CATEGORIES.find((c) => c.id === activeCategory)?.label || { en: 'Products', sw: 'Bidhaa' })}
        </h2>
        <span className="text-xs text-neutral-500 font-medium">
          {filteredProducts.length} {lang === 'sw' ? 'bidhaa zinapatikana' : `item${filteredProducts.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* ── PRODUCTS GRID / LIST ── */}
      {filteredProducts.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4'
              : 'space-y-3'
          }
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => {
              const inCart = cartItems.find((i) => i.id === product.id);
              const qty = inCart?.quantity ?? 0;
              const isFav = favourites.includes(product.id);

              if (viewMode === 'list') {
                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary-300 transition-all"
                  >
                    <div
                      onClick={() => onSelectProduct(product)}
                      className="cursor-pointer flex items-center gap-4 min-w-0 flex-1"
                    >
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-neutral-50 p-2 border border-neutral-200/60 flex items-center justify-center flex-shrink-0">
                        <img
                          src={product.image}
                          alt={t(product.name)}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        {product.badge && (
                          <span className="text-[10px] font-bold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full uppercase mb-1 inline-block">
                            {product.badge}
                          </span>
                        )}
                        <h3 className="text-sm font-bold text-neutral-900 truncate">
                          {t(product.name)}
                        </h3>
                        <p className="text-xs text-neutral-500 line-clamp-2 mt-1">
                          {t(product.description)}
                        </p>
                        <div className="flex items-baseline gap-1.5 mt-2">
                          <span className="text-sm font-extrabold text-neutral-900">
                            {formatPrice(product.price)} TZS
                          </span>
                          <span className="text-[11px] text-neutral-400">
                            ({formatUsd(product.priceUsd)})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-100 justify-between sm:justify-end">
                      <button
                        onClick={() => toggleFavourite(product.id)}
                        className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                          isFav ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-neutral-50 text-neutral-400 border-neutral-200 hover:text-neutral-700'
                        }`}
                        aria-label="Favourite toggle"
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
                      </button>

                      {qty === 0 ? (
                        <button
                          onClick={() => addItem({ ...product, quantity: 1 })}
                          disabled={!product.inStock}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                            product.inStock
                              ? 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800'
                              : 'bg-neutral-300 cursor-not-allowed text-neutral-500'
                          }`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{product.inStock ? (lang === 'sw' ? 'Weka Mkobani' : 'Add to Cart') : (lang === 'sw' ? 'Imeisha' : 'Sold Out')}</span>
                        </button>
                      ) : (
                        <div className="flex items-center border border-primary-300 bg-primary-50 rounded-xl p-1">
                          <button
                            onClick={() => updateQuantity(product.id, qty - 1)}
                            className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-primary-700 font-bold shadow-xs hover:bg-primary-100 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-primary-900">{qty}</span>
                          <button
                            onClick={() => updateQuantity(product.id, qty + 1)}
                            className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-primary-700 font-bold shadow-xs hover:bg-primary-100 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              }

              // Grid view
              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl border border-neutral-200/80 p-3.5 sm:p-4 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-primary-300 transition-all relative group"
                >
                  {/* Favourite heart button */}
                  <button
                    id={`grid-fav-${product.id}-btn`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavourite(product.id);
                    }}
                    className={`absolute top-2.5 right-2.5 p-2 rounded-xl border backdrop-blur-xs transition-colors z-10 cursor-pointer ${
                      isFav
                        ? 'bg-rose-50 text-rose-600 border-rose-200'
                        : 'bg-white/90 text-neutral-400 hover:text-neutral-700 border-neutral-100 shadow-xs'
                    }`}
                    aria-label="Favourite toggle"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500' : ''}`} />
                  </button>

                  {/* Clickable Card Body */}
                  <div
                    onClick={() => onSelectProduct(product)}
                    className="cursor-pointer space-y-2.5"
                  >
                    <div className="relative bg-neutral-50 rounded-xl h-36 sm:h-44 flex items-center justify-center p-3 border border-neutral-200/60 overflow-hidden">
                      {product.badge && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-xs text-primary-700 font-bold text-[9px] rounded-full border border-primary-200 shadow-xs uppercase">
                          {product.badge}
                        </span>
                      )}
                      <img
                        src={product.image}
                        alt={t(product.name)}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-neutral-900 truncate">
                        {t(product.name)}
                      </h3>
                      <p className="text-[11px] text-neutral-500 line-clamp-2 mt-0.5 leading-snug">
                        {t(product.description)}
                      </p>
                    </div>
                  </div>

                  {/* Pricing & Add to cart button */}
                  <div className="pt-2.5 border-t border-neutral-100 mt-2 flex items-center justify-between gap-1">
                    <div>
                      <span className="text-xs sm:text-sm font-extrabold text-neutral-900 block leading-tight">
                        {formatPrice(product.price)} <span className="text-[10px] text-neutral-500 font-semibold">TZS</span>
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        ({formatUsd(product.priceUsd)})
                      </span>
                    </div>

                    {qty === 0 ? (
                      <motion.button
                        id={`grid-add-cart-${product.id}-btn`}
                        onClick={() => addItem({ ...product, quantity: 1 })}
                        disabled={!product.inStock}
                        whileTap={{ scale: 0.92 }}
                        className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-colors flex items-center gap-1 cursor-pointer ${
                          product.inStock
                            ? 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800'
                            : 'bg-neutral-300 cursor-not-allowed text-neutral-500'
                        }`}
                        aria-label={lang === 'sw' ? 'Weka kwenye mkoba' : 'Add to cart'}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{lang === 'sw' ? 'Weka' : 'Add'}</span>
                      </motion.button>
                    ) : (
                      <div className="flex items-center border border-primary-300 bg-primary-50 rounded-xl p-0.5">
                        <button
                          onClick={() => updateQuantity(product.id, qty - 1)}
                          className="w-6 h-6 bg-white rounded-md flex items-center justify-center text-primary-700 font-bold shadow-xs hover:bg-primary-100 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-primary-900">{qty}</span>
                        <button
                          onClick={() => updateQuantity(product.id, qty + 1)}
                          className="w-6 h-6 bg-white rounded-md flex items-center justify-center text-primary-700 font-bold shadow-xs hover:bg-primary-100 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200/80 p-8 space-y-3">
          <Coffee className="w-10 h-10 mx-auto text-neutral-300" />
          <h3 className="text-sm font-bold text-neutral-800">
            {lang === 'sw' ? `Hakuna bidhaa inayolingana na "${search}"` : `No products found matching "${search}"`}
          </h3>
          <p className="text-xs text-neutral-500">
            {lang === 'sw' ? 'Jaribu kubadilisha maneno ya utafutaji au kuchagua kikundi kingine.' : 'Try changing your search keywords or switching category filters.'}
          </p>
          <button
            onClick={() => {
              setSearch('');
              setActiveCategory('all');
              setInStockOnly(false);
            }}
            className="px-4 py-2 bg-primary-50 text-primary-700 font-bold text-xs rounded-xl hover:bg-primary-100 transition-colors cursor-pointer"
          >
            {lang === 'sw' ? 'Onyesha Bidhaa Zote' : 'Reset All Filters'}
          </button>
        </div>
      )}
    </div>
  );
}
