import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Send, User, Phone, MapPin, ShoppingBag, Package, CheckCircle2, Heart, BadgeCheck, Eye, EyeOff } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { compileWhatsAppMessage, buildOrderMessage, formatPrice, validateCustomer, DISTRIBUTOR_NAME } from '../utils/whatsappCompiler';
import { useLang } from '../context/LangContext';
import { PRODUCTS } from '../types';
import { ReferralShareButton } from './ReferralShare';
import { motionTokens } from '../design/motion';

interface CheckoutSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckoutSheet({ isOpen, onClose }: CheckoutSheetProps) {
  const { lang, t } = useLang();
  const { items, updateQuantity, clearCart, favourites, addItem } = useCartStore();

  const [name, setName]         = useState('');
  const [phone, setPhone]       = useState('');
  const [location, setLocation] = useState('');
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [touched, setTouched]   = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess]       = useState(false);
  const [orderUrl, setOrderUrl]         = useState('');
  const [showPreview, setShowPreview]   = useState(false);

  // Focus management
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const favouriteProducts = PRODUCTS.filter((p) => favourites.includes(p.id) && !items.find((i) => i.id === p.id));

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
      // save previously focused element and move focus into sheet
      previouslyFocusedElement.current = document.activeElement as HTMLElement | null;
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 50);
    } else {
      // restore focus when closed
      previouslyFocusedElement.current?.focus?.();
    }
  }, [isOpen]);

  const handleSubmit = () => {
    setTouched({ name: true, phone: true, location: true });

    // prevent double submissions
    if (isSubmitting) return;

    if (!validate() || items.length === 0) return;

    setIsSubmitting(true);
    const url = compileWhatsAppMessage(items, { name, phone, location }, lang);
    setOrderUrl(url);

    // simulate send delay — keep submission atomic and announce
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 800);
  };

  const handleOpenWhatsApp = () => {
    window.location.href = orderUrl;
    clearCart();
    onClose();
    setIsSuccess(false);
    setName(''); setPhone(''); setLocation('');
    setErrors({}); setTouched({}); setShowPreview(false);
  };

  const isValid = Object.keys(validateCustomer(name, phone, location)).length === 0 && items.length > 0;
  const previewMessage = isValid ? buildOrderMessage(items, { name, phone, location }, lang) : '';

  // Error announcement helper: returns the first error message for aria-live role="alert"
  const firstErrorMessage = () => {
    const keys = Object.keys(errors);
    return keys.length ? errors[keys[0]] : '';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl max-w-lg mx-auto max-h-[92vh] overflow-y-auto shadow-2xl"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: motionTokens.spring.damping, stiffness: motionTokens.spring.stiffness }}
            onClick={(e) => e.stopPropagation()}
            aria-modal="true"
            role="dialog"
            aria-label={lang === 'sw' ? 'Fomu ya Malipo' : 'Checkout form'}
          >
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
            </div>

            {/* make the form region announce busy state during submit */}
            <div className="px-5 pb-8" aria-busy={isSubmitting} aria-live="polite" aria-atomic="true">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-md flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {lang === 'sw' ? 'Mkoba Wako' : 'Your Cart'}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {totalItems} {lang === 'sw' ? 'bidhaa' : 'items'} • {formatPrice(totalPrice)} TZS
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={onClose}
                  className="p-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors outline-none [-webkit-tap-highlight-color:transparent]"
                  whileTap={{ scale: motionTokens.press }}
                  aria-label={lang === 'sw' ? 'Funga fomu' : 'Close checkout'}
                >
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>

              {/* success screen */}
              <AnimatePresence>
                {isSuccess && (
                  <motion.div
                    className="flex flex-col items-center text-center py-8"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    role="status"
                    aria-live="polite"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
                    >
                      <CheckCircle2 className="w-16 h-16 text-success mb-4" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {lang === 'sw' ? 'Agizo Liko Tayari!' : 'Order Ready!'}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {lang === 'sw'
                        ? `Jumla: ${formatPrice(totalPrice)} TZS kwa bidhaa ${totalItems}`
                        : `Total: ${formatPrice(totalPrice)} TZS for ${totalItems} item${totalItems !== 1 ? 's' : ''}`}
                    </p>
                    <p className="text-xs text-gray-400 mb-6 leading-relaxed max-w-xs">
                      {lang === 'sw'
                        ? `Hifadhi nambari ya ${DISTRIBUTOR_NAME} kwenye anwani zako ili maagizo ya baadaye yawe rahisi zaidi.`
                        : `Save ${DISTRIBUTOR_NAME}'s number to your contacts for faster future orders.`}
                    </p>
                    <motion.button
                      onClick={handleOpenWhatsApp}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-success text-white rounded-md font-semibold text-sm hover:bg-success/90 transition-colors outline-none"
                      whileTap={{ scale: motionTokens.press }}
                    >
                      <Send className="w-4 h-4" />
                      {lang === 'sw' ? 'Fungua WhatsApp' : 'Open WhatsApp'}
                    </motion.button>
                    <div className="w-full mt-2.5">
                      <ReferralShareButton />
                    </div>
                    <button
                      onClick={() => { setIsSuccess(false); onClose(); clearCart(); setName(''); setPhone(''); setLocation(''); setErrors({}); setTouched({}); setShowPreview(false); }}
                      className="mt-3 text-xs text-gray-400 underline outline-none [-webkit-tap-highlight-color:transparent]"
                    >
                      {lang === 'sw' ? 'Futa na Rudi' : 'Clear cart & go back'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {!isSuccess && (
                <>
                  {/* empty */}
                  {items.length === 0 && (
                    <div className="text-center py-10 text-gray-400">
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-medium">
                        {lang === 'sw' ? 'Mkoba wako uko tupu' : 'Your cart is empty'}
                      </p>
                      <p className="text-xs mt-1">
                        {lang === 'sw' ? 'Ongeza bidhaa kuanza' : 'Add some products to get started'}
                      </p>

                      {/* favourites quick-add */}
                      {favouriteProducts.length > 0 && (
                        <div className="mt-6 text-left">
                          <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5 text-rose-400" />
                            {lang === 'sw' ? 'Vipendwa vyako' : 'Your favourites'}
                          </p>
                          <div className="space-y-2">
                            {favouriteProducts.map((p) => (
                              <div key={p.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-100">
                                <span className="text-sm text-gray-700 font-medium">{t(p.name)}</span>
                                <button
                                  onClick={() => addItem({ ...p, quantity: 1 })}
                                  className="text-xs px-3 py-1.5 bg-primary-600 text-white rounded-md font-semibold outline-none [-webkit-tap-highlight-color:transparent]"
                                  aria-label={lang === 'sw' ? `Ongeza ${t(p.name)}` : `Add ${t(p.name)}`}
                                >
                                  + {lang === 'sw' ? 'Ongeza' : 'Add'}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* cart items */}
                  {items.length > 0 && (
                    <div className="space-y-2 mb-5">
                      {items.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border border-gray-100"
                        >
                          <div className="w-11 h-11 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-gray-900 truncate">{t(item.name)}</h4>
                            <p className="text-xs text-gray-500">{formatPrice(item.price)} TZS {lang === 'sw' ? 'kila moja' : 'each'}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <motion.button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-9 h-9 flex items-center justify-center bg-white rounded-md border border-gray-200 outline-none [-webkit-tap-highlight-color:transparent]"
                              whileTap={{ scale: motionTokens.press }}
                              aria-label={lang === 'sw' ? 'Punguza idadi' : 'Decrease quantity'}
                            >
                              <Minus className="w-3 h-3 text-gray-600" />
                            </motion.button>
                            <span className="w-8 text-center font-semibold text-sm text-gray-900">{item.quantity}</span>
                            <motion.button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-9 h-9 flex items-center justify-center bg-primary-600 rounded-md outline-none [-webkit-tap-highlight-color:transparent]"
                              whileTap={{ scale: motionTokens.press }}
                              aria-label={lang === 'sw' ? 'Ongeza idadi' : 'Increase quantity'}
                            >
                              <Plus className="w-3 h-3 text-white" />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* total */}
                  {items.length > 0 && (
                    <div className="flex items-center justify-between py-4 border-t border-dashed border-gray-200 mb-5">
                      <span className="text-sm text-gray-600 font-medium">
                        {lang === 'sw' ? 'Jumla ya Agizo' : 'Order Total'}
                      </span>
                      <span className="text-xl font-semibold text-gray-900">
                        {formatPrice(totalPrice)} <span className="text-sm font-normal text-gray-400">TZS</span>
                      </span>
                    </div>
                  )}

                  {/* form */}
                  {items.length > 0 && (
                    <div className="space-y-3 mb-5">
                      <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                        <User className="w-4 h-4 text-primary-600" />
                        {lang === 'sw' ? 'Maelezo ya Uwasilishaji' : 'Delivery Details'}
                      </h3>

                      {/* Name */}
                      <div>
                        <div className="relative group">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                          <input
                            ref={firstInputRef}
                            type="text"
                            autoComplete="name"
                            placeholder={lang === 'sw' ? 'Jina lako kamili' : 'Your full name'}
                            value={name}
                            onChange={(e) => { setName(e.target.value); if (touched.name) validate(e.target.value, phone, location); }}
                            onBlur={() => handleBlur('name')}
                            aria-invalid={!!(touched.name && errors.name)}
                            className={`w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-md text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${
                              touched.name && errors.name
                                ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500'
                                : 'border-gray-200 focus:ring-primary-200/60 focus:border-primary-500'
                            }`}
                          />
                        </div>
                        {touched.name && errors.name && (
                          <div role="alert" className="text-xs text-red-500 mt-1 ml-1">{errors.name}</div>
                        )}
                      </div>

                      {/* Phone */}
                      <div>
                        <div className="relative group">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                          <input
                            type="tel"
                            autoComplete="tel"
                            placeholder={lang === 'sw' ? 'Nambari ya simu (mfano 0712 345 678)' : 'Phone number (e.g. 0712 345 678)'}
                            value={phone}
                            onChange={(e) => { setPhone(e.target.value); if (touched.phone) validate(name, e.target.value, location); }}
                            onBlur={() => handleBlur('phone')}
                            aria-invalid={!!(touched.phone && errors.phone)}
                            className={`w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-md text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${
                              touched.phone && errors.phone
                                ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500'
                                : 'border-gray-200 focus:ring-primary-200/60 focus:border-primary-500'
                            }`}
                          />
                        </div>
                        {touched.phone && errors.phone && (
                          <div role="alert" className="text-xs text-red-500 mt-1 ml-1">{errors.phone}</div>
                        )}
                      </div>

                      {/* Location */}
                      <div>
                        <div className="relative group">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                          <input
                            type="text"
                            autoComplete="address-line1"
                            placeholder={lang === 'sw' ? 'Mahali pa uwasilishaji (mfano Kinondoni, DSM)' : 'Delivery location (e.g. Kinondoni, Dar)'}
                            value={location}
                            onChange={(e) => { setLocation(e.target.value); if (touched.location) validate(name, phone, e.target.value); }}
                            onBlur={() => handleBlur('location')}
                            aria-invalid={!!(touched.location && errors.location)}
                            className={`w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-md text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${
                              touched.location && errors.location
                                ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500'
                                : 'border-gray-200 focus:ring-primary-200/60 focus:border-primary-500'
                            }`}
                          />
                        </div>
                        {touched.location && errors.location && (
                          <div role="alert" className="text-xs text-red-500 mt-1 ml-1">{errors.location}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* submit */}
                  {items.length > 0 && (
                    <>
                      {isValid && (
                        <div className="mb-3">
                          <button
                            type="button"
                            onClick={() => setShowPreview((v) => !v)}
                            className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium text-gray-500 hover:text-gray-700 transition-colors outline-none [-webkit-tap-highlight-color:transparent]"
                          >
                            {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            {showPreview
                              ? (lang === 'sw' ? 'Ficha ujumbe' : 'Hide message preview')
                              : (lang === 'sw' ? 'Ona ujumbe kabla ya kutuma' : 'Preview message before sending')}
                          </button>
                          <AnimatePresence>
                            {showPreview && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: motionTokens.hover, ease: 'easeInOut' }}
                                className="overflow-hidden"
                              >
                                <div className="bg-[#dcf8c6] border border-[#c5edb0] rounded-md rounded-tr-none p-3 mb-1">
                                  <pre className="text-[11px] text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                                    {previewMessage}
                                  </pre>
                                </div>
                                <p className="text-[10px] text-gray-400 text-center">
                                  {lang === 'sw' ? 'Hivi ndivyo ujumbe wako utakavyoonekana kwenye WhatsApp' : 'This is exactly what will be sent on WhatsApp'}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                      <div className="flex items-center justify-center gap-1.5 mb-3">
                        <BadgeCheck className="w-3.5 h-3.5 text-primary-600" />
                        <span className="text-[11px] text-gray-500">
                          {lang === 'sw' ? 'Agizo litatumwa kwa' : 'Order will be sent to'}{' '}
                          <span className="font-medium text-gray-700">{DISTRIBUTOR_NAME}</span>
                        </span>
                      </div>

                      <motion.button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !isValid}
                        aria-disabled={isSubmitting || !isValid}
                        className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-md font-semibold text-sm transition-colors outline-none ${
                          isValid && !isSubmitting ? 'bg-success text-white hover:bg-success/90' : 'bg-gray-200 text-gray-400'
                        }`}
                        whileTap={isValid && !isSubmitting ? { scale: motionTokens.press } : {}}
                      >
                        {isSubmitting ? (
                          <span role="status" aria-live="polite" aria-label={lang === 'sw' ? 'Inatuma...' : 'Sending...'} className="flex items-center">
                            <motion.div
                              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                            />
                          </span>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            {lang === 'sw' ? 'Tuma Agizo kwa WhatsApp' : 'Send Order via WhatsApp'}
                          </>
                        )}
                      </motion.button>

                      {!isValid && (
                        <p className="text-center text-xs text-gray-400 mt-2">
                          {lang === 'sw' ? 'Jaza maelezo yote hapo juu ili kuendelea' : 'Complete all delivery details above to continue'}
                        </p>
                      )}
                      <p className="text-center text-[11px] text-gray-400 mt-3 leading-relaxed">
                        {lang === 'sw'
                          ? "Utaelekezwa WhatsApp kukamilisha agizo lako na msambazaji"
                          : "You'll be redirected to WhatsApp to complete your order with the distributor"}
                      </p>

                      {/* inline error live region (first error) */}
                      {firstErrorMessage() && (
                        <div role="alert" className="text-center text-xs text-red-500 mt-3">
                          {firstErrorMessage()}
                        </div>
                      )}
                    </>
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
