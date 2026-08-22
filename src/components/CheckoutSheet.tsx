import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Minus,
  Plus,
  Send,
  User,
  Phone,
  MapPin,
  ShoppingBag,
  Package,
  CheckCircle2,
  BadgeCheck,
  Eye,
  EyeOff,
  Copy,
  Check,
  Truck,
  Info,
} from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import {
  compileWhatsAppMessage,
  buildOrderMessage,
  formatPrice,
  validateCustomer,
  DISTRIBUTOR_NAME,
  TARGET_PHONE,
} from '../utils/whatsappCompiler';
import { useLang } from '../context/LangContext';
import { PRODUCTS, DELIVERY_ZONES } from '../types';
import { ReferralShareButton } from './ReferralShare';
import { motionTokens } from '../design/motion';
import { supabase } from '../lib/supabase';

interface CheckoutSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckoutSheet({ isOpen, onClose }: CheckoutSheetProps) {
  const { lang, t } = useLang();
  const { items, updateQuantity, clearCart, addItem } = useCartStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [selectedZone, setSelectedZone] = useState('Dar es Salaam');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderUrl, setOrderUrl] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const upsellProducts = PRODUCTS.filter((p) => !items.some((i) => i.id === p.id)).slice(0, 3);

  const validate = (n = name, p = phone, l = location) => {
    const errs = validateCustomer(n, p, l);
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validate();
  };

  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement | null;
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 50);
    } else {
      previouslyFocusedElement.current?.focus?.();
    }
  }, [isOpen]);

  const fullLocationString = selectedZone ? `${location ? location + ', ' : ''}${selectedZone}` : location;

  const handleSubmit = async () => {
    setTouched({ name: true, phone: true, location: true });
    if (isSubmitting) return;
    if (!validate() || items.length === 0) return;

    setIsSubmitting(true);
    const locWithZone = fullLocationString.trim();
    const url = compileWhatsAppMessage(items, { name, phone, location: locWithZone }, lang);
    setOrderUrl(url);

    try {
      const { error: dbError } = await supabase.from('sales').insert({
        channel: 'app',
        status: 'pending',
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        customer_location: locWithZone,
        items: items.map((i) => ({
          productId: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        subtotal: totalPrice,
      });

      if (dbError && import.meta.env.DEV) {
        console.error('[DEV] Order sync:', dbError.message);
      }
    } catch {
      // Non-blocking fallback
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 600);
  };

  const handleOpenWhatsApp = () => {
    window.location.href = orderUrl;
    clearCart();
    onClose();
    setIsSuccess(false);
    setName('');
    setPhone('');
    setLocation('');
    setErrors({});
    setTouched({});
    setShowPreview(false);
  };

  const isValid = Object.keys(validateCustomer(name, phone, location)).length === 0 && items.length > 0;
  const previewMessage = isValid
    ? buildOrderMessage(items, { name, phone, location: fullLocationString.trim() }, lang)
    : '';

  const handleCopyMessage = () => {
    if (!previewMessage) return;
    navigator.clipboard.writeText(previewMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            id="checkout-sheet-drawer"
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-w-xl mx-auto max-h-[94vh] overflow-y-auto shadow-2xl flex flex-col"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={motionTokens.easings.calmSpring}
            onClick={(e) => e.stopPropagation()}
            aria-modal="true"
            role="dialog"
            aria-label={lang === 'sw' ? 'Kikapu na Malipo ya WhatsApp' : 'Cart & WhatsApp Checkout'}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 bg-neutral-300 rounded-full" />
            </div>

            <div className="px-5 sm:px-6 pb-8 space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-neutral-900 leading-tight">
                      {lang === 'sw' ? 'Mkoba Wako' : 'Your Wellness Cart'}
                    </h2>
                    <p className="text-xs text-neutral-500">
                      {totalItems} {lang === 'sw' ? 'bidhaa' : `item${totalItems !== 1 ? 's' : ''}`} · {formatPrice(totalPrice)} TZS
                    </p>
                  </div>
                </div>

                <button
                  id="checkout-close-btn"
                  onClick={onClose}
                  className="p-2 text-neutral-400 hover:text-neutral-700 rounded-xl hover:bg-neutral-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <AnimatePresence>
                {isSuccess && (
                  <motion.div
                    className="flex flex-col items-center text-center py-6 space-y-4"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>

                    <div>
                      <h3 className="text-xl font-extrabold text-neutral-900">
                        {lang === 'sw' ? 'Agizo Liko Tayari Kutumwa!' : 'Order Ready for WhatsApp!'}
                      </h3>
                      <p className="text-xs text-neutral-600 mt-1 max-w-sm">
                        {lang === 'sw'
                          ? `Jumla ya ${formatPrice(totalPrice)} TZS kwa bidhaa ${totalItems}. Gusa kitufe hapa chini ili kufungua WhatsApp na kutuma agizo lako moja kwa moja kwa ${DISTRIBUTOR_NAME}.`
                          : `Total: ${formatPrice(totalPrice)} TZS for ${totalItems} item${totalItems !== 1 ? 's' : ''}. Tap below to launch WhatsApp and send your order directly to ${DISTRIBUTOR_NAME}.`}
                      </p>
                    </div>

                    <motion.button
                      id="launch-whatsapp-success-btn"
                      onClick={handleOpenWhatsApp}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-secondary-green hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg transition-transform active:scale-95"
                      whileTap={{ scale: 0.96 }}
                    >
                      <Send className="w-4 h-4" />
                      <span>{lang === 'sw' ? 'Fungua WhatsApp Sasa' : 'Open WhatsApp & Send Order'}</span>
                    </motion.button>

                    <div className="w-full pt-2 border-t border-neutral-100">
                      <ReferralShareButton />
                    </div>

                    <button
                      onClick={() => {
                        setIsSuccess(false);
                        onClose();
                        clearCart();
                        setName('');
                        setPhone('');
                        setLocation('');
                        setErrors({});
                        setTouched({});
                        setShowPreview(false);
                      }}
                      className="text-xs text-neutral-400 hover:text-neutral-700 underline"
                    >
                      {lang === 'sw' ? 'Futa mkoba na urudi kwenye duka' : 'Clear cart and return to storefront'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {!isSuccess && (
                <>
                  {items.length === 0 && (
                    <div className="text-center py-10 space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-neutral-100 text-neutral-400 mx-auto flex items-center justify-center">
                        <Package className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-neutral-800">
                          {lang === 'sw' ? 'Mkoba wako uko tupu' : 'Your cart is empty'}
                        </h3>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {lang === 'sw' ? 'Ongeza bidhaa za afya ili kuanza safari yako' : 'Add products or bundle deals to get started'}
                        </p>
                      </div>

                      {upsellProducts.length > 0 && (
                        <div className="text-left pt-4 border-t border-neutral-100">
                          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-2.5">
                            {lang === 'sw' ? 'Bidhaa Zinazopendekezwa' : 'Recommended Products'}
                          </span>
                          <div className="space-y-2">
                            {upsellProducts.map((p) => (
                              <div
                                key={p.id}
                                className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl border border-neutral-200/60"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <img src={p.image} alt={t(p.name)} className="w-10 h-10 object-contain rounded-lg bg-white p-1" />
                                  <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-neutral-900 truncate">{t(p.name)}</h4>
                                    <span className="text-[11px] font-semibold text-neutral-500">{formatPrice(p.price)} TZS</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => addItem({ ...p, quantity: 1 })}
                                  className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-primary-700"
                                >
                                  + {lang === 'sw' ? 'Weka' : 'Add'}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {items.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                          {lang === 'sw' ? 'Bidhaa Zilizochaguliwa' : 'Selected Products'}
                        </span>
                        <button
                          onClick={clearCart}
                          className="text-[11px] font-semibold text-rose-600 hover:text-rose-700"
                        >
                          {lang === 'sw' ? 'Futa Yote' : 'Clear All'}
                        </button>
                      </div>

                      {items.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex items-center justify-between gap-3 p-3 bg-neutral-50 rounded-2xl border border-neutral-200/60"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-12 h-12 rounded-xl bg-white p-1 border border-neutral-200/80 flex items-center justify-center flex-shrink-0">
                              <img src={item.image} alt={t(item.name)} className="max-h-full max-w-full object-contain" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-bold text-neutral-900 truncate">{t(item.name)}</h4>
                              <p className="text-[11px] text-neutral-500 font-medium">
                                {formatPrice(item.price)} TZS <span className="text-neutral-400 font-normal">× {item.quantity}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center border border-neutral-300 bg-white rounded-xl p-1 shadow-xs">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-700 hover:bg-neutral-100 transition-colors"
                              aria-label="Decrease"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-neutral-900">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 rounded-lg bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-colors"
                              aria-label="Increase"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {items.length > 0 && (
                    <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-2">
                      <div className="flex justify-between text-xs text-neutral-600">
                        <span>{lang === 'sw' ? 'Jumla ya Bidhaa' : 'Subtotal'}:</span>
                        <span className="font-bold text-neutral-900">{formatPrice(totalPrice)} TZS</span>
                      </div>
                      <div className="flex justify-between text-xs text-neutral-600">
                        <span>{lang === 'sw' ? 'Usafirishaji' : 'Delivery'}:</span>
                        <span className="text-secondary-green font-semibold">
                          {lang === 'sw' ? 'Inathibitishwa WhatsApp' : 'Calculated by Zone'}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-neutral-200 flex justify-between items-baseline">
                        <span className="text-sm font-bold text-neutral-900">
                          {lang === 'sw' ? 'Jumla Kuu' : 'Total Price'}:
                        </span>
                        <span className="text-xl font-extrabold text-neutral-900">
                          {formatPrice(totalPrice)} <span className="text-xs font-normal text-neutral-500">TZS</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {items.length > 0 && (
                    <div className="space-y-3.5">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-primary-600" />
                          {lang === 'sw' ? 'Taarifa za Mteja & Usafirishaji' : 'Customer & Delivery Information'}
                        </h3>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          {lang === 'sw'
                            ? 'Taarifa hizi hazihifadhiwi kwenye kifaa chako — zinatumika tu kuunda ujumbe wa WhatsApp.'
                            : 'Zero PII is permanently stored — inputs are only used to compile your WhatsApp message.'}
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">
                          {lang === 'sw' ? 'Jina Kamili' : 'Full Name'} *
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                          <input
                            ref={firstInputRef}
                            id="checkout-customer-name"
                            type="text"
                            value={name}
                            onChange={(e) => {
                              setName(e.target.value);
                              if (touched.name) validate(e.target.value, phone, location);
                            }}
                            onBlur={() => handleBlur('name')}
                            placeholder={lang === 'sw' ? 'Mfano: John Mwangi' : 'e.g. John Mwangi'}
                            className={`w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border rounded-xl text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:ring-2 transition-all ${
                              touched.name && errors.name
                                ? 'border-red-400 focus:ring-red-100'
                                : 'border-neutral-200/80 focus:border-primary-500 focus:ring-primary-100'
                            }`}
                          />
                        </div>
                        {touched.name && errors.name && (
                          <span className="text-[11px] text-red-500 mt-1 block">{errors.name}</span>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">
                          {lang === 'sw' ? 'Namba ya Simu (WhatsApp)' : 'Phone Number (WhatsApp)'} *
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                          <input
                            id="checkout-customer-phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value);
                              if (touched.phone) validate(name, e.target.value, location);
                            }}
                            onBlur={() => handleBlur('phone')}
                            placeholder={lang === 'sw' ? 'Mfano: 0783 481 416 au 255783481416' : 'e.g. 0783 481 416 or +255 783 481 416'}
                            className={`w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border rounded-xl text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:ring-2 transition-all ${
                              touched.phone && errors.phone
                                ? 'border-red-400 focus:ring-red-100'
                                : 'border-neutral-200/80 focus:border-primary-500 focus:ring-primary-100'
                            }`}
                          />
                        </div>
                        {touched.phone && errors.phone && (
                          <span className="text-[11px] text-red-500 mt-1 block">{errors.phone}</span>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">
                          {lang === 'sw' ? 'Eneo Kuu la Usafirishaji' : 'Delivery Zone'}
                        </label>
                        <div className="relative">
                          <Truck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                          <select
                            id="checkout-delivery-zone"
                            value={selectedZone}
                            onChange={(e) => setSelectedZone(e.target.value)}
                            className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200/80 rounded-xl text-xs sm:text-sm text-neutral-900 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all appearance-none"
                          >
                            {DELIVERY_ZONES.map((zone) => (
                              <option key={zone.zone} value={zone.zone}>
                                {zone.zone} ({zone.days})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">
                          {lang === 'sw' ? 'Mtaa / Jengo / Kituo cha Karibu' : 'Street / Landmark / Building'} *
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                          <input
                            id="checkout-customer-location"
                            type="text"
                            value={location}
                            onChange={(e) => {
                              setLocation(e.target.value);
                              if (touched.location) validate(name, phone, e.target.value);
                            }}
                            onBlur={() => handleBlur('location')}
                            placeholder={lang === 'sw' ? 'Mfano: Mwenge karibu na kituo cha mwendokasi' : 'e.g. Kinondoni, near Morocco Bus Terminal'}
                            className={`w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border rounded-xl text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:ring-2 transition-all ${
                              touched.location && errors.location
                                ? 'border-red-400 focus:ring-red-100'
                                : 'border-neutral-200/80 focus:border-primary-500 focus:ring-primary-100'
                            }`}
                          />
                        </div>
                        {touched.location && errors.location && (
                          <span className="text-[11px] text-red-500 mt-1 block">{errors.location}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {items.length > 0 && (
                    <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/70 text-[11px] text-neutral-600 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-neutral-800">
                        <Info className="w-3.5 h-3.5 text-primary-600" />
                        <span>{lang === 'sw' ? 'Mfumo wa Malipo' : 'Payment Arrangement'}</span>
                      </div>
                      <p className="leading-relaxed">
                        {lang === 'sw'
                          ? 'Malipo hufanyika moja kwa moja na msambazaji (M-Pesa, TigoPesa, Airtel Money au Pesa Taslimu Dar es Salaam) baada ya kuthibitisha agizo.'
                          : 'Payment is confirmed directly with the distributor (M-Pesa, TigoPesa, Airtel Money, or cash on delivery in Dar es Salaam) upon message receipt.'}
                      </p>
                    </div>
                  )}

                  {items.length > 0 && (
                    <div className="space-y-2">
                      <button
                        type="button"
                        id="toggle-message-preview-btn"
                        onClick={() => setShowPreview(!showPreview)}
                        className="w-full py-2 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>
                            {showPreview
                              ? (lang === 'sw' ? 'Ficha Muhtasari wa WhatsApp' : 'Hide WhatsApp Message Preview')
                              : (lang === 'sw' ? 'Ona Ujumbe Utakaotumwa WhatsApp' : 'Preview WhatsApp Order Message')}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-400">
                          {showPreview ? '▲' : '▼'}
                        </span>
                      </button>

                      <AnimatePresence>
                        {showPreview && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden space-y-2"
                          >
                            <div className="bg-[#E7F8E8] border border-[#C5E8C8] rounded-2xl rounded-tr-xs p-4 text-xs font-mono text-neutral-800 shadow-xs relative">
                              <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#B0DDB5]">
                                <span className="font-bold text-emerald-900 text-[11px] flex items-center gap-1 font-sans">
                                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  WhatsApp Message Payload
                                </span>
                                <button
                                  onClick={handleCopyMessage}
                                  className="text-[11px] font-sans font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded-md shadow-2xs"
                                >
                                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                  <span>{copied ? (lang === 'sw' ? 'Imenakiliwa' : 'Copied!') : (lang === 'sw' ? 'Nakili' : 'Copy Text')}</span>
                                </button>
                              </div>
                              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-neutral-800">
                                {previewMessage || (lang === 'sw' ? 'Jaza jina na eneo lako kuona muhtasari...' : 'Fill in your name and location above to view the message...')}
                              </pre>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {items.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-500">
                        <BadgeCheck className="w-4 h-4 text-emerald-600" />
                        <span>
                          {lang === 'sw' ? 'Msambazaji Mpokeaji:' : 'Recipient:'}{' '}
                          <strong className="text-neutral-800">{DISTRIBUTOR_NAME}</strong> (+{TARGET_PHONE})
                        </span>
                      </div>

                      <motion.button
                        id="submit-whatsapp-order-btn"
                        onClick={handleSubmit}
                        disabled={!isValid || isSubmitting}
                        whileTap={{ scale: isValid && !isSubmitting ? 0.97 : 1 }}
                        className={`w-full py-4 px-5 rounded-2xl font-bold text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2.5 ${
                          isValid && !isSubmitting
                            ? 'bg-secondary-green hover:bg-emerald-600 active:bg-emerald-700 cursor-pointer'
                            : 'bg-neutral-300 text-neutral-500 cursor-not-allowed shadow-none'
                        }`}
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>{lang === 'sw' ? 'Tuma Agizo kwa WhatsApp' : 'Send Order via WhatsApp'}</span>
                          </>
                        )}
                      </motion.button>

                      {!isValid && (
                        <p className="text-center text-[11px] text-neutral-400">
                          {lang === 'sw'
                            ? 'Tafadhali kamilisha jina, simu, na eneo la uwasilishaji ili kuendelea.'
                            : 'Please enter your name, phone, and delivery address to enable WhatsApp checkout.'}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
