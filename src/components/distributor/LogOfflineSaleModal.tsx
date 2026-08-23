import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Plus,
  ShoppingBag,
  User,
  Phone,
  Calendar,
  CreditCard,
  Send,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useLang } from '../../context/LangContext';
import { useDistributorStore } from '../../store/distributorStore';
import { WHATSAPP_LINK } from '../../utils/whatsappCompiler';

interface LogOfflineSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogOfflineSaleModal: React.FC<LogOfflineSaleModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { lang } = useLang();
  const distributor = useDistributorStore((s) => s.getActiveDistributor());
  const addSale = useDistributorStore((s) => s.addSale);
  const getLiveProducts = useDistributorStore((s) => s.getEffectiveProducts);

  const liveProducts = getLiveProducts();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerLocation, setCustomerLocation] = useState(distributor.city || 'Dar es Salaam');
  const [selectedProductId, setSelectedProductId] = useState(liveProducts[0]?.id || 'shake-off-phyto');
  const [quantity, setQuantity] = useState(1);
  const [paymentType, setPaymentType] = useState<'cash' | 'mobile_money' | 'credit'>('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const currentProduct = liveProducts.find((p) => p.id === selectedProductId) || liveProducts[0];
  const unitPrice = currentProduct?.price || 35000;
  const totalAmount = unitPrice * quantity;
  const svPoints = Math.round((totalAmount / 3500) * 10) / 10;

  const handleSaveSale = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = customerName.trim();
    if (!cleanName) {
      setErrorMsg(lang === 'sw' ? 'Tafadhali weka jina la mteja.' : 'Please enter customer name.');
      return;
    }

    let paid = totalAmount;
    let balance = 0;

    if (paymentType === 'credit') {
      const parsedPaid = parseInt(amountPaid || '0', 10);
      paid = isNaN(parsedPaid) ? 0 : parsedPaid;
      balance = Math.max(0, totalAmount - paid);
    }

    const status: 'paid' | 'partial' | 'unpaid' = balance === 0 ? 'paid' : paid > 0 ? 'partial' : 'unpaid';

    addSale({
      customerName: cleanName,
      customerPhone: customerPhone.trim(),
      customerLocation: customerLocation.trim() || 'Tanzania',
      productId: currentProduct.id,
      productName: currentProduct.name.sw,
      quantity,
      unitPrice,
      totalAmount,
      paymentType,
      amountPaid: paid,
      balanceDue: balance,
      dueDate: dueDate || undefined,
      status,
      source: 'field',
    });

    // Generate formatted WhatsApp Receipt
    const receiptText =
      `🧾 *RISITI YA MAUZO YA EDMARK - ED RETAIL*\n` +
      `----------------------------------------\n` +
      `👤 *Mteja:* ${cleanName}\n` +
      `📦 *Bidhaa:* ${currentProduct.name.sw} (Idadi: ${quantity})\n` +
      `💰 *Jumla:* TZS ${totalAmount.toLocaleString()}\n` +
      `💵 *Kiasi Kilicholipwa:* TZS ${paid.toLocaleString()} (${paymentType === 'credit' ? 'Deni / Awamu' : paymentType === 'mobile_money' ? 'Lipa Namba' : 'Cash'})\n` +
      `${balance > 0 ? `⚠️ *Salio Lililobaki:* TZS ${balance.toLocaleString()}\n📅 *Tarehe ya Malipo:* ${dueDate || 'Makubaliano'}\n` : '✅ *Hali:* IMELIPWA YOTE (PAID IN FULL)\n'}` +
      `----------------------------------------\n` +
      `🏅 *Msambazaji:* ${distributor.name} (${distributor.phone})\n` +
      `📍 *Mkoa:* ${distributor.city}\n\n` +
      `Asante sana kwa kuchagua bidhaa asilia za Edmark kwa afya bora! 🌿`;

    const cleanPhone = customerPhone.replace(/\D/g, '').replace(/^0/, '255');
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(receiptText)}`
      : `${WHATSAPP_LINK}?text=${encodeURIComponent(receiptText)}`;

    // Reset and close
    setCustomerName('');
    setCustomerPhone('');
    setAmountPaid('');
    setDueDate('');
    setErrorMsg('');
    onClose();

    // Open WhatsApp Receipt dispatch
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-stone-950/85 backdrop-blur-xs isolate">
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 16 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden relative"
      >
        {/* ── MODAL HEADER ── */}
        <div className="px-5 py-4 bg-[#0C271E] text-white flex items-center justify-between border-b border-[#1A3D31] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#164132] border border-[#235844] flex items-center justify-center text-[#E5C378]">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                {lang === 'sw' ? 'Rekodi Mauzo ya Mkononi' : 'Log Field & Offline Sale'}
              </h3>
              <p className="text-[11px] text-stone-300">
                {lang === 'sw' ? 'Hurekodiwa kwenye Stoo, Daftari, na Pointi za SV' : 'Instantly updates inventory, CRM & SV tracking'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── ERROR BANNER ── */}
        {errorMsg && (
          <div className="px-5 py-2.5 bg-red-50 border-b border-red-200 text-red-800 text-xs flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ── MODAL BODY (SCROLLABLE) ── */}
        <form onSubmit={handleSaveSale} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-white text-stone-900 text-xs">
          {/* Customer Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-black text-stone-800 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span>{lang === 'sw' ? 'Jina la Mteja:' : 'Customer Name:'} <strong className="text-red-500">*</strong></span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Mfano: Mama Sarah / Baba Kelvin"
                className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl font-semibold text-stone-950 focus:bg-white focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block font-black text-stone-800 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                <span>{lang === 'sw' ? 'Simu (WhatsApp):' : 'Phone (WhatsApp):'}</span>
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Mfano: 0712345678"
                className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl font-mono font-semibold text-stone-950 focus:bg-white focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 transition-all outline-none"
              />
            </div>
          </div>

          {/* Product Picker & Quantity */}
          <div className="space-y-1.5">
            <label className="block font-black text-stone-800 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
              <span>{lang === 'sw' ? 'Bidhaa Iliyouzwa:' : 'Product Sold:'}</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="sm:col-span-3 p-3 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-950 focus:bg-white focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 transition-all outline-none text-xs"
              >
                {liveProducts.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.name.sw} — TZS {prod.price.toLocaleString()} ({Math.round(prod.price / 3500)} SV)
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1 bg-stone-50 border border-stone-300 rounded-xl p-1 justify-between">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg bg-white hover:bg-stone-200 text-stone-900 font-black flex items-center justify-center border border-stone-200 cursor-pointer"
                >
                  -
                </button>
                <span className="font-extrabold text-xs px-2 text-stone-950">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-lg bg-white hover:bg-stone-200 text-stone-900 font-black flex items-center justify-center border border-stone-200 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Pricing & SV Calculation Preview */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-stone-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-emerald-900 block">
                {lang === 'sw' ? 'Jumla ya Mauzo' : 'Total Sale Value'}
              </span>
              <span className="text-base sm:text-lg font-black text-stone-950 font-mono">
                TZS {totalAmount.toLocaleString()}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-black tracking-wider text-amber-800 block flex items-center justify-end gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>{lang === 'sw' ? 'Pointi za SV' : 'Earned SV Points'}</span>
              </span>
              <span className="text-sm font-black text-amber-900 font-mono bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-lg">
                +{svPoints} SV
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <label className="block font-black text-stone-800 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
              <span>{lang === 'sw' ? 'Njia ya Malipo:' : 'Payment Method:'}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'cash', labelSw: 'Cash Mkononi', labelEn: 'Cash' },
                { id: 'mobile_money', labelSw: 'Lipa Namba', labelEn: 'M-Pesa / Tigo' },
                { id: 'credit', labelSw: 'Deni / Awamu', labelEn: 'Credit / Debt' },
              ].map((pm) => (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setPaymentType(pm.id as any)}
                  className={`py-2.5 px-2 rounded-xl font-extrabold text-xs transition-all border text-center cursor-pointer ${
                    paymentType === pm.id
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                  }`}
                >
                  {lang === 'sw' ? pm.labelSw : pm.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Credit / Debt Fields */}
          {paymentType === 'credit' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-amber-50 rounded-2xl border border-amber-300 space-y-3"
            >
              <div className="flex items-center gap-2 text-amber-950 font-black text-xs">
                <Calendar className="w-4 h-4 text-amber-700" />
                <span>{lang === 'sw' ? 'Makubaliano ya Awamu & Salio' : 'Credit Terms & Installment'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-amber-900 mb-1">
                    {lang === 'sw' ? 'Kiasi Alichotanguliza (TZS):' : 'Deposit Paid (TZS):'}
                  </label>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="0"
                    className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-amber-900 mb-1">
                    {lang === 'sw' ? 'Tarehe ya Kumalizia Salio:' : 'Due Date for Balance:'}
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="text-[11px] text-amber-900 font-bold bg-amber-100/80 p-2 rounded-lg flex justify-between">
                <span>{lang === 'sw' ? 'Salio Litakalobaki:' : 'Remaining Balance:'}</span>
                <span className="font-mono text-xs text-red-700 font-black">
                  TZS {Math.max(0, totalAmount - (parseInt(amountPaid || '0', 10) || 0)).toLocaleString()}
                </span>
              </div>
            </motion.div>
          )}

          {/* Customer Location */}
          <div>
            <label className="block font-bold text-stone-600 mb-1">
              {lang === 'sw' ? 'Eneo / Mkoa wa Mteja:' : 'Customer Region / City:'}
            </label>
            <input
              type="text"
              value={customerLocation}
              onChange={(e) => setCustomerLocation(e.target.value)}
              placeholder="Mfano: Kinondoni, Dar es Salaam"
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-semibold text-stone-900"
            />
          </div>

          {/* ── FOOTER ACTIONS ── */}
          <div className="pt-3 border-t border-stone-200 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-stone-300 font-black text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              {lang === 'sw' ? 'Ghairi' : 'Cancel'}
            </button>

            <button
              type="submit"
              className="flex-[2] py-3 rounded-xl bg-[#0C271E] hover:bg-[#164132] font-black text-white shadow-md flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer"
            >
              <Send className="w-4 h-4 text-[#E5C378]" />
              <span>{lang === 'sw' ? 'Hifadhi & Tuma Risiti' : 'Save & Send Receipt'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
