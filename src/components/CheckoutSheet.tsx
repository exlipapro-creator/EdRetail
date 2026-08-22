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
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  Check,
  Truck,
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
import { PRODUCTS, DELIVERY_ZONES, PaymentMethodOption } from '../types';
import { ReferralShareButton } from './ReferralShare';
import { motionTokens } from '../design/motion';
import { supabase } from '../lib/supabase';
import { useDistributorStore } from '../store/distributorStore';

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodOption>('mpesa');
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
    const customerPayload = { name, phone, location: locWithZone, paymentMethod };
    const url = compileWhatsAppMessage(items, customerPayload, lang);
    setOrderUrl(url);

    // 1. Auto-record order into Distributor Store Field Ledger as Pending Web Order
    try {
      useDistributorStore.getState().addWebOrder({
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerLocation: locWithZone,
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        totalAmount: totalPrice,
        notes: `Zone: ${selectedZone || 'Tanzania'} | Payment: ${paymentMethod.toUpperCase()}`,
      });
    } catch (e) {
      console.warn('Local ledger sync notice:', e);
    }

    // 2. Cloud Supabase sync if configured
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
    }, 450);
  };

  const handleOpenWhatsApp = () => {
    window.location.href = orderUrl;
    clearCart();
    onClose();
    setIsSuccess(false);
    setName('');
    setPhone('');
    setLocation('');
    setPaymentMethod('mpesa');
    setErrors({});
    setTouched({});
    setShowPreview(false);
  };

  const isValid = Object.keys(validateCustomer(name, phone, location)).length === 0 && items.length > 0;
  const previewMessage = isValid
    ? buildOrderMessage(items, { name, phone, location: fullLocationString.trim(), paymentMethod }, lang)
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
            className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs z-50"
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
              <div className="w-12 h-1.5 bg-stone-300 rounded-full" />
            </div>

            <div className="px-5 sm:px-6 pb-8 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-stone-200 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-stone-100 text-stone-900 rounded-xl flex items-center justify-center border border-stone-200">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">
                      {lang === 'sw' ? 'Orodha ya Agizo Lako' : 'Your Order Cart'}
                    </h2>
                    <p className="text-xs text-stone-500">
                      {totalItems} {lang === 'sw' ? 'bidhaa' : `item${totalItems !== 1 ? 's' : ''}`} · {formatPrice(totalPrice)} TZS
                    </p>
                  </div>
                </div>

                <button
                  id="checkout-close-btn"
                  onClick={onClose}
                  className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Success Stage */}
              <AnimatePresence>
                {isSuccess && (
                  <motion.div
                    className="flex flex-col items-center text-center py-4 space-y-5"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg font-extrabold text-stone-900">
                        {lang === 'sw' ? 'Agizo Liko Tayari Kutumwa WhatsApp' : 'Order Ready to Send via WhatsApp'}
                      </h3>
                      <p className="text-xs text-stone-600 max-w-md mx-auto">
                        {lang === 'sw'
                          ? `Jumla ya TZS ${formatPrice(totalPrice)} kwa bidhaa ${totalItems}. Bofya kitufe hapa chini ili kumtumia Msambazaji wako (${DISTRIBUTOR_NAME}) na kuthibitisha malipo.`
                          : `Total: TZS ${formatPrice(totalPrice)} for ${totalItems} item${totalItems !== 1 ? 's' : ''}. Tap below to connect with ${DISTRIBUTOR_NAME} on WhatsApp.`}
                      </p>
                    </div>

                    {/* Verification Reminder Box */}
                    <div className="w-full text-left bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        <span>{lang === 'sw' ? 'Miongozo Muhimu ya Usalama wa Malipo' : 'Key Payment Verification Steps'}</span>
                      </div>

                      <div className="space-y-2 text-xs text-stone-700">
                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            1
                          </span>
                          <p>
                            {lang === 'sw'
                              ? 'Tuma ujumbe huu kwa WhatsApp na umwombe Msambazaji akuthibitishie upatikanaji wa bidhaa na akutumie Lipa Namba / Namba rasmi yenye jina sahihi.'
                              : 'Send this message and ask your coach to confirm product availability and provide the verified official payment number.'}
                          </p>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            2
                          </span>
                          <p>
                            {lang === 'sw'
                              ? 'Baada ya kulipia, tuma ujumbe wa uthibitisho (SMS ya M-Pesa / Tigo Pesa) kwenye WhatsApp hiyohiyo ili kifurushi chako kipakiwe mara moja.'
                              : 'After payment, forward the transaction confirmation SMS in the chat for instant packaging and dispatch.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      id="launch-whatsapp-success-btn"
                      onClick={handleOpenWhatsApp}
                      className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl font-bold text-sm shadow-sm transition-all"
                      whileTap={{ scale: 0.98 }}
                    >
                      <Send className="w-4 h-4" />
                      <span>{lang === 'sw' ? 'Fungua WhatsApp & Tuma Agizo' : 'Open WhatsApp & Send Order'}</span>
                    </motion.button>

                    <div className="w-full pt-2 border-t border-stone-200">
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
                      className="text-xs text-stone-500 hover:text-stone-800 underline"
                    >
                      {lang === 'sw' ? 'Funga na urudi kwenye duka' : 'Close and return to storefront'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Standard Checkout Form */}
              {!isSuccess && (
                <>
                  {items.length === 0 && (
                    <div className="text-center py-10 space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-400 mx-auto flex items-center justify-center border border-stone-200">
                        <Package className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-stone-900">
                          {lang === 'sw' ? 'Mkoba wako uko tupu' : 'Your cart is empty'}
                        </h3>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {lang === 'sw' ? 'Ongeza bidhaa za afya ili kuanza agizo lako' : 'Add products or bundle packages to get started'}
                        </p>
                      </div>

                      {upsellProducts.length > 0 && (
                        <div className="text-left pt-4 border-t border-stone-200">
                          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2.5">
                            {lang === 'sw' ? 'Bidhaa Zinazopendekezwa' : 'Recommended Products'}
                          </span>
                          <div className="space-y-2">
                            {upsellProducts.map((p) => (
                              <div
                                key={p.id}
                                className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl border border-stone-200"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <img src={p.image} alt={t(p.name)} className="w-10 h-10 object-contain rounded-lg bg-white p-1 border border-stone-200" />
                                  <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-stone-900 truncate">{t(p.name)}</h4>
                                    <span className="text-[11px] font-semibold text-stone-600">{formatPrice(p.price)} TZS</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => addItem({ ...p, quantity: 1 })}
                                  className="px-3 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-bold hover:bg-stone-800 transition-colors"
                                >
                                  {lang === 'sw' ? 'Weka' : 'Add'}
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
                        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                          {lang === 'sw' ? 'Bidhaa Zilizochaguliwa' : 'Selected Products'}
                        </span>
                        <button
                          onClick={clearCart}
                          className="text-[11px] font-semibold text-rose-700 hover:text-rose-800"
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
                          className="flex items-center justify-between gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-12 h-12 rounded-xl bg-white p-1 border border-stone-200 flex items-center justify-center flex-shrink-0">
                              <img src={item.image} alt={t(item.name)} className="max-h-full max-w-full object-contain" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-bold text-stone-900 truncate">{t(item.name)}</h4>
                              <p className="text-[11px] text-stone-600 font-medium">
                                {formatPrice(item.price)} TZS <span className="text-stone-400 font-normal">× {item.quantity}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center border border-stone-300 bg-white rounded-xl p-1 shadow-2xs">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-700 hover:bg-stone-100 transition-colors"
                              aria-label="Decrease"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-stone-900">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 rounded-lg bg-stone-900 text-white flex items-center justify-center hover:bg-stone-800 transition-colors"
                              aria-label="Increase"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Pricing Overview */}
                  {items.length > 0 && (
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                      <div className="flex justify-between text-xs text-stone-600">
                        <span>{lang === 'sw' ? 'Jumla ya Bidhaa' : 'Subtotal'}:</span>
                        <span className="font-bold text-stone-900">{formatPrice(totalPrice)} TZS</span>
                      </div>
                      <div className="flex justify-between text-xs text-stone-600">
                        <span>{lang === 'sw' ? 'Usafirishaji' : 'Delivery'}:</span>
                        <span className="text-emerald-700 font-semibold">
                          {lang === 'sw' ? 'Inathibitishwa na Msambazaji' : 'Confirmed with Coach'}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline">
                        <span className="text-sm font-bold text-stone-900">
                          {lang === 'sw' ? 'Jumla ya Malipo' : 'Total Price'}:
                        </span>
                        <span className="text-xl font-extrabold text-stone-900">
                          {formatPrice(totalPrice)} <span className="text-xs font-normal text-stone-500">TZS</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Customer Inputs */}
                  {items.length > 0 && (
                    <div className="space-y-3.5">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-stone-700" />
                          {lang === 'sw' ? 'Taarifa za Mpokeaji & Usafirishaji' : 'Customer & Delivery Information'}
                        </h3>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          {lang === 'sw' ? 'Jina Kamili' : 'Full Name'} *
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
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
                            className={`w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:ring-2 transition-all ${
                              touched.name && errors.name
                                ? 'border-red-400 focus:ring-red-100'
                                : 'border-stone-200 focus:border-stone-900 focus:ring-stone-100'
                            }`}
                          />
                        </div>
                        {touched.name && errors.name && (
                          <span className="text-[11px] text-red-500 mt-1 block">{errors.name}</span>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          {lang === 'sw' ? 'Namba ya Simu (WhatsApp)' : 'Phone Number (WhatsApp)'} *
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                          <input
                            id="checkout-customer-phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value);
                              if (touched.phone) validate(name, e.target.value, location);
                            }}
                            onBlur={() => handleBlur('phone')}
                            placeholder={lang === 'sw' ? 'Mfano: 0783 481 416' : 'e.g. 0783 481 416'}
                            className={`w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:ring-2 transition-all ${
                              touched.phone && errors.phone
                                ? 'border-red-400 focus:ring-red-100'
                                : 'border-stone-200 focus:border-stone-900 focus:ring-stone-100'
                            }`}
                          />
                        </div>
                        {touched.phone && errors.phone && (
                          <span className="text-[11px] text-red-500 mt-1 block">{errors.phone}</span>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          {lang === 'sw' ? 'Mkoa / Kanda ya Usafirishaji' : 'Delivery Region / Zone'}
                        </label>
                        <div className="relative">
                          <Truck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                          <select
                            id="checkout-delivery-zone"
                            value={selectedZone}
                            onChange={(e) => setSelectedZone(e.target.value)}
                            className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:bg-white focus:border-stone-900 focus:ring-2 focus:ring-stone-100 transition-all appearance-none"
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
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          {lang === 'sw' ? 'Mtaa / Kituo / Jengo la Karibu' : 'Street / Landmark / Bus Stop'} *
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                          <input
                            id="checkout-customer-location"
                            type="text"
                            value={location}
                            onChange={(e) => {
                              setLocation(e.target.value);
                              if (touched.location) validate(name, phone, e.target.value);
                            }}
                            onBlur={() => handleBlur('location')}
                            placeholder={lang === 'sw' ? 'Mfano: Mwenge karibu na stendi ya daladala' : 'e.g. Kinondoni, near Morocco Bus Terminal'}
                            className={`w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:ring-2 transition-all ${
                              touched.location && errors.location
                                ? 'border-red-400 focus:ring-red-100'
                                : 'border-stone-200 focus:border-stone-900 focus:ring-stone-100'
                            }`}
                          />
                        </div>
                        {touched.location && errors.location && (
                          <span className="text-[11px] text-red-500 mt-1 block">{errors.location}</span>
                        )}
                      </div>

                      {/* Payment Method Selector */}
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1.5">
                          {lang === 'sw' ? 'Njia ya Malipo Unayopendelea' : 'Preferred Payment Method'}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {[
                            { id: 'mpesa' as PaymentMethodOption, label: 'Vodacom M-Pesa', badge: 'Lipa Namba' },
                            { id: 'tigopesa' as PaymentMethodOption, label: 'Tigo Pesa', badge: 'Mixx by Yas' },
                            { id: 'airtel' as PaymentMethodOption, label: 'Airtel Money', badge: 'Lipa' },
                            { id: 'halopesa' as PaymentMethodOption, label: 'Halopesa', badge: 'Lipa' },
                            { id: 'cash' as PaymentMethodOption, label: lang === 'sw' ? 'Pesa Mkononi' : 'Cash on Delivery', badge: 'Dar Only' },
                          ].map((method) => {
                            const isSelected = paymentMethod === method.id;
                            return (
                              <button
                                key={method.id}
                                type="button"
                                id={`payment-method-${method.id}`}
                                onClick={() => setPaymentMethod(method.id)}
                                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                                  isSelected
                                    ? 'bg-stone-900 border-stone-900 text-white shadow-2xs'
                                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                                }`}
                              >
                                <div className="flex items-center justify-between w-full mb-1">
                                  <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                                    isSelected ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-600'
                                  }`}>
                                    {method.badge}
                                  </span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                                </div>
                                <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                                  {method.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1.5">
                          {lang === 'sw'
                            ? 'Msambazaji atakutumia Lipa Namba au maelezo sahihi ya mtandao huu mara tu atakapopokea agizo lako WhatsApp.'
                            : 'Your coach will share the exact merchant till / Lipa Namba for your chosen network upon receiving your order on WhatsApp.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Clear 3-Step High-Trust Verification Protocol Card */}
                  {items.length > 0 && (
                    <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 space-y-3.5">
                      <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        <h4 className="text-xs font-bold text-stone-900">
                          {lang === 'sw' ? 'Utaratibu wa Uhakiki na Malipo Salama' : 'Safe Order & Payment Protocol'}
                        </h4>
                      </div>

                      <div className="space-y-3 text-xs text-stone-700">
                        <div className="flex items-start gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-stone-200 text-stone-900 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                            1
                          </div>
                          <div>
                            <strong className="block text-stone-900">
                              {lang === 'sw' ? 'Thibitisha na Msambazaji Kabla ya Kulipa' : 'Confirm Stock & Lipa Namba with Coach'}
                            </strong>
                            <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                              {lang === 'sw'
                                ? 'Usiwalipe kabla ya kuthibitisha upatikanaji wa bidhaa na kupewa Lipa Namba rasmi yenye jina sahihi la msambazaji.'
                                : 'Always verify product availability and receive the confirmed Lipa Namba and recipient name from your coach before sending funds.'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-stone-200 text-stone-900 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                            2
                          </div>
                          <div>
                            <strong className="block text-stone-900">
                              {lang === 'sw' ? 'Lipa Kupitia Mitandao ya Simu' : 'Pay via Mobile Money (M-Pesa / Tigo / Airtel)'}
                            </strong>
                            <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                              {lang === 'sw'
                                ? 'Tumia Lipa Namba au namba iliyothibitishwa moja kwa moja kutoka kwenye simu yako.'
                                : 'Pay directly via M-Pesa, Tigo Pesa, or Airtel Money to the confirmed merchant number.'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-stone-200 text-stone-900 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                            3
                          </div>
                          <div>
                            <strong className="block text-stone-900">
                              {lang === 'sw' ? 'Thibitisha Baada ya Kulipa & Pokea Mzigo' : 'Send Payment SMS for Immediate Dispatch'}
                            </strong>
                            <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                              {lang === 'sw'
                                ? 'Tuma ujumbe wa muamala kwenye WhatsApp ili mzigo ufungashwe na risiti ya usafirishaji ikutumie.'
                                : 'Share the confirmation SMS in the chat so your coach dispatches the parcel with a live tracking receipt.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Message Preview */}
                  {items.length > 0 && (
                    <div className="space-y-2">
                      <button
                        type="button"
                        id="toggle-message-preview-btn"
                        onClick={() => setShowPreview(!showPreview)}
                        className="w-full py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>
                            {showPreview
                              ? (lang === 'sw' ? 'Ficha Muhtasari wa Ujumbe' : 'Hide WhatsApp Message Preview')
                              : (lang === 'sw' ? 'Ona Ujumbe Utakaotumwa WhatsApp' : 'Preview WhatsApp Order Message')}
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-400">
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
                            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-xs font-mono text-stone-800 shadow-2xs relative">
                              <div className="flex items-center justify-between mb-2 pb-2 border-b border-stone-200">
                                <span className="font-bold text-stone-900 text-[11px] flex items-center gap-1 font-sans">
                                  <ShieldCheck className="w-3.5 h-3.5 text-stone-700" />
                                  WhatsApp Message
                                </span>
                                <button
                                  onClick={handleCopyMessage}
                                  className="text-[11px] font-sans font-bold text-stone-800 hover:text-stone-950 flex items-center gap-1 bg-white border border-stone-200 px-2 py-0.5 rounded-md shadow-2xs"
                                >
                                  {copied ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                                  <span>{copied ? (lang === 'sw' ? 'Imenakiliwa' : 'Copied') : (lang === 'sw' ? 'Nakili' : 'Copy Text')}</span>
                                </button>
                              </div>
                              <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-stone-800">
                                {previewMessage || (lang === 'sw' ? 'Jaza jina na eneo lako kuona muhtasari...' : 'Fill in your name and location above to view the message...')}
                              </pre>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Submission Action */}
                  {items.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-center gap-1.5 text-xs text-stone-500">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        <span>
                          {lang === 'sw' ? 'Msambazaji Mpokeaji:' : 'Recipient:'}{' '}
                          <strong className="text-stone-900">{DISTRIBUTOR_NAME}</strong> (+{TARGET_PHONE})
                        </span>
                      </div>

                      <motion.button
                        id="submit-whatsapp-order-btn"
                        onClick={handleSubmit}
                        disabled={!isValid || isSubmitting}
                        whileTap={{ scale: isValid && !isSubmitting ? 0.98 : 1 }}
                        className={`w-full py-4 px-5 rounded-2xl font-bold text-sm text-white shadow-sm transition-all flex items-center justify-center gap-2.5 ${
                          isValid && !isSubmitting
                            ? 'bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 cursor-pointer'
                            : 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
                        }`}
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>{lang === 'sw' ? 'Tuma Agizo & Thibitisha WhatsApp' : 'Send Order & Confirm via WhatsApp'}</span>
                          </>
                        )}
                      </motion.button>

                      {!isValid && (
                        <p className="text-center text-[11px] text-stone-500">
                          {lang === 'sw'
                            ? 'Tafadhali kamilisha jina, simu, na eneo la uwasilishaji ili kuendelea.'
                            : 'Please enter your name, phone, and delivery address to continue.'}
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
