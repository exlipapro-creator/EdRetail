import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Heart,
  Share2,
  Star,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
  Sparkles,
  Phone,
  ArrowLeft,
} from 'lucide-react';
import { Product, CATEGORIES } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { formatPrice, formatUsd, WHATSAPP_LINK, DISTRIBUTOR_NAME } from '../../utils/whatsappCompiler';
import { useLang } from '../../context/LangContext';
import { motionTokens } from '../../design/motion';

export interface ProductDetailModalProps {
  product: Product | null;
  isOpen?: boolean;
  onClose: () => void;
}

const CATEGORY_TAG_COLORS: Record<string, string> = {
  'p4-slimming': 'bg-blue-50 text-blue-700 border-blue-200',
  'health-wellness': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'lifestyle-beverages': 'bg-amber-50 text-amber-700 border-amber-200',
};

const BENEFIT_CHIPS: Record<string, string[]> = {
  'mrt-complex': ['Meal Replacement', 'High Protein', 'Weight Loss', 'Metabolism Boost'],
  'shake-off-phyto': ['Colon Cleanse', 'Digestion Support', 'Detox Formula', 'Rich in Fiber'],
  'splina-chlorophyll': ['Natural Detox', 'Alkalises Body', 'Blood Health', 'Antioxidants'],
  'hawaiian-spirulina': ['Immunity Booster', 'Superfood', 'Vital Energy', 'Essential Nutrients'],
  'ginseng-coffee': ['No Jitters', 'Sustained Energy', 'Mental Focus', 'Korean Ginseng'],
  'cafe-troika': ['Ganoderma & Ginseng', 'Tongkat Ali', 'Male Vitality', 'Stamina'],
  'cocollagen': ['Marine Collagen', 'Radiant Skin', 'Joint Support', 'Overnight Care'],
};

export function ProductDetailModal({
  product,
  isOpen = Boolean(product),
  onClose,
}: ProductDetailModalProps) {
  const { lang, t } = useLang();
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const items = useCartStore((s) => s.items);
  const toggleFavourite = useCartStore((s) => s.toggleFavourite);
  const isFavourite = useCartStore((s) => (product ? s.isFavourite(product.id) : false));

  const [selectedQty, setSelectedQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!product) return null;

  const categoryLabel = CATEGORIES.find((c) => c.id === product.category)?.label;
  const cartItem = items.find((i) => i.id === product.id);
  const currentInCart = cartItem?.quantity ?? 0;
  const chips = BENEFIT_CHIPS[product.id] || ['100% Authentic', 'Distributor Backed', 'Tanzania Delivery'];

  const handleAddToCart = () => {
    if (!product.inStock) return;
    if (currentInCart === 0) {
      addItem({ ...product, quantity: selectedQty });
    } else {
      updateQuantity(product.id, currentInCart + selectedQty);
    }
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleShare = async () => {
    const shareText = `Check out ${t(product.name)} at ED Retail (Tanzania): ${formatPrice(product.price)} TZS`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: t(product.name),
          text: shareText,
          url: window.location.href,
        });
      } catch {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(`${shareText} - ${window.location.href}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal / Sheet Container */}
          <motion.div
            id="product-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-label={t(product.name)}
            className="fixed bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 z-50 bg-white rounded-t-3xl sm:rounded-2xl max-w-xl w-full max-h-[92vh] sm:max-h-[88vh] overflow-y-auto shadow-2xl flex flex-col"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={motionTokens.easings.calmSpring}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab handle for mobile */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-12 h-1.5 bg-neutral-300 rounded-full" />
            </div>

            {/* Header controls bar */}
            <div className="px-5 py-3 flex items-center justify-between border-b border-neutral-100">
              <button
                id="modal-back-btn"
                onClick={onClose}
                className="p-2 -ml-2 text-neutral-600 hover:text-neutral-900 rounded-xl hover:bg-neutral-100 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                aria-label={lang === 'sw' ? 'Rudi' : 'Back'}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{lang === 'sw' ? 'Rudi' : 'Back'}</span>
              </button>

              <div className="flex items-center gap-2">
                {/* Share Button */}
                <button
                  id="modal-share-btn"
                  onClick={handleShare}
                  className="p-2 text-neutral-600 hover:text-primary-600 rounded-xl hover:bg-neutral-100 transition-colors relative"
                  aria-label="Share product"
                >
                  <Share2 className="w-4 h-4" />
                  {copiedLink && (
                    <span className="absolute -top-7 right-0 bg-neutral-900 text-white text-[10px] px-2 py-0.5 rounded shadow-md whitespace-nowrap">
                      {lang === 'sw' ? 'Kiungo kimenakiliwa' : 'Link copied!'}
                    </span>
                  )}
                </button>

                {/* Favourite Button */}
                <button
                  id="modal-favourite-btn"
                  onClick={() => toggleFavourite(product.id)}
                  className="p-2 text-neutral-600 hover:text-rose-600 rounded-xl hover:bg-neutral-100 transition-colors"
                  aria-label={isFavourite ? 'Remove favourite' : 'Add favourite'}
                >
                  <Heart className={`w-5 h-5 ${isFavourite ? 'fill-rose-500 text-rose-500' : 'text-neutral-400'}`} />
                </button>

                {/* Close Button */}
                <button
                  id="modal-close-btn"
                  onClick={onClose}
                  className="p-2 text-neutral-500 hover:text-neutral-900 rounded-xl hover:bg-neutral-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
              {/* Product Visual Area */}
              <div className="relative bg-gradient-to-b from-neutral-50 to-neutral-100/70 rounded-2xl h-56 sm:h-64 flex items-center justify-center p-6 border border-neutral-200/60 overflow-hidden">
                {product.badge && (
                  <span className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-xs text-primary-700 border border-primary-200/80 shadow-xs uppercase tracking-wide">
                    {product.badge}
                  </span>
                )}

                <img
                  src={product.image}
                  alt={t(product.name)}
                  className="max-h-full max-w-full object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
                    if (fb) fb.style.display = 'flex';
                  }}
                />
                <div className="hidden w-24 h-24 rounded-2xl bg-neutral-200 items-center justify-center text-neutral-400">
                  <ShoppingBag className="w-10 h-10" />
                </div>
              </div>

              {/* Title & Metadata */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  {categoryLabel && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${CATEGORY_TAG_COLORS[product.category] || 'bg-neutral-100 text-neutral-700'}`}>
                      {t(categoryLabel)}
                    </span>
                  )}
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>4.9</span>
                    <span className="text-neutral-400 text-[11px] font-normal">(120+ reviews)</span>
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 leading-snug">
                  {t(product.name)}
                </h2>

                {/* Price & Stock */}
                <div className="flex items-baseline justify-between gap-2 mt-2 pt-2 border-t border-neutral-100">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-neutral-900">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-sm font-semibold text-neutral-500">TZS</span>
                    <span className="text-xs text-neutral-400">({formatUsd(product.priceUsd)})</span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      product.inStock
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${product.inStock ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    {product.inStock
                      ? (lang === 'sw' ? 'Ipo Stoo' : 'In Stock')
                      : (lang === 'sw' ? 'Imeisha' : 'Out of Stock')}
                  </span>
                </div>
              </div>

              {/* Benefit Chips */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  {lang === 'sw' ? 'Faida Muhimu' : 'Key Highlights'}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {chips.map((chip, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full text-xs font-medium transition-colors"
                    >
                      ✓ {chip}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  {lang === 'sw' ? 'Maelezo ya Bidhaa' : 'Product Description'}
                </h4>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  {t(product.description)}
                </p>
              </div>

              {/* How to use */}
              <div className="p-4 bg-primary-50/80 rounded-2xl border border-primary-100 text-neutral-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary-800 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary-600" />
                  {lang === 'sw' ? 'Jinsi ya Kutumia' : 'How to Use & Dosage'}
                </h4>
                <p className="text-xs text-primary-950 leading-relaxed font-medium">
                  {t(product.usage)}
                </p>
              </div>

              {/* Distributor Direct Guarantee Notice */}
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 text-xs text-neutral-600">
                <CheckCircle2 className="w-5 h-5 text-secondary-green flex-shrink-0" />
                <p className="leading-snug">
                  {lang === 'sw'
                    ? `Imethibitishwa na ${DISTRIBUTOR_NAME}. Uwasilishaji salama na mwongozo wa bure wa afya kupitia WhatsApp.`
                    : `Verified genuine stock from ${DISTRIBUTOR_NAME}. Safe delivery and free dosage coaching on WhatsApp.`}
                </p>
              </div>
            </div>

            {/* Sticky Bottom Action Bar */}
            <div className="sticky bottom-0 bg-white border-t border-neutral-200 p-4 sm:p-5 flex items-center gap-3 shadow-lg">
              {/* Quantity Stepper */}
              <div className="flex items-center border border-neutral-300 rounded-xl p-1 bg-neutral-50 flex-shrink-0">
                <button
                  id="modal-qty-decrease-btn"
                  onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                  className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 transition-colors"
                  disabled={selectedQty <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-bold text-neutral-900">
                  {selectedQty}
                </span>
                <button
                  id="modal-qty-increase-btn"
                  onClick={() => setSelectedQty(selectedQty + 1)}
                  className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-neutral-700 hover:bg-neutral-100 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Cart CTA */}
              <motion.button
                id="modal-add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                whileTap={{ scale: 0.96 }}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white shadow-sm transition-all ${
                  product.inStock
                    ? justAdded
                      ? 'bg-emerald-600'
                      : 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800'
                    : 'bg-neutral-300 cursor-not-allowed text-neutral-500'
                }`}
              >
                {justAdded ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    {lang === 'sw' ? 'Imeongezwa kwenye Mkoba!' : 'Added to Cart!'}
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    {product.inStock
                      ? `${lang === 'sw' ? 'Ongeza kwenye Mkoba' : 'Add to Cart'} · ${formatPrice(product.price * selectedQty)} TZS`
                      : (lang === 'sw' ? 'Haipatikani Sasa' : 'Out of Stock')}
                  </>
                )}
              </motion.button>

              {/* Ask on WhatsApp button */}
              <a
                id="modal-whatsapp-ask-btn"
                href={`${WHATSAPP_LINK}?text=${encodeURIComponent(`Hello ${DISTRIBUTOR_NAME}, I have a question about ${t(product.name)}:`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl transition-colors flex items-center justify-center flex-shrink-0"
                title={lang === 'sw' ? 'Uliza msambazaji WhatsApp' : 'Ask distributor on WhatsApp'}
                aria-label="Ask distributor on WhatsApp"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
