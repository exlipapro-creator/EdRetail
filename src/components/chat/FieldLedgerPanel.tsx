import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  MessageSquare,
  Receipt,
  Trash2,
} from 'lucide-react';
import { useDistributorStore, OfflineSaleRecord } from '../../store/distributorStore';
import { WHATSAPP_LINK, DISTRIBUTOR_PHONE, DISTRIBUTOR_NAME } from '../../utils/whatsappCompiler';

interface FieldLedgerPanelProps {
  onOpenSaleForm: () => void;
  lang: 'en' | 'sw';
}

export const FieldLedgerPanel: React.FC<FieldLedgerPanelProps> = ({
  onOpenSaleForm,
  lang,
}) => {
  const sales = useDistributorStore((s) => s.sales);
  const markDebtPaid = useDistributorStore((s) => s.markDebtPaid);
  const deleteSale = useDistributorStore((s) => s.deleteSale);
  const getFinancialSummary = useDistributorStore((s) => s.getFinancialSummary);

  const [filter, setFilter] = useState<'all' | 'debts' | 'web' | 'paid'>('all');
  const [payingSaleId, setPayingSaleId] = useState<string | null>(null);
  const [payAmountInput, setPayAmountInput] = useState('');

  const summary = getFinancialSummary('all');

  const filteredSales = sales.filter((s) => {
    if (filter === 'debts') return s.balanceDue > 0;
    if (filter === 'web') return s.source === 'web_whatsapp';
    if (filter === 'paid') return s.balanceDue === 0;
    return true;
  });

  const handleSendDebtWhatsApp = (sale: OfflineSaleRecord) => {
    const msg =
      `Habari ${sale.customerName}! Ni ${DISTRIBUTOR_NAME} kutoka ED Retail. Natumai unaendelea vizuri. ` +
      `Nikukumbushe salio lako la ${sale.productName} TZS ${sale.balanceDue.toLocaleString()}` +
      `${sale.dueDate ? ` linalotarajiwa tarehe ${sale.dueDate}` : ''}. ` +
      `Unaweza kulipa kupitia M-Pesa ${DISTRIBUTOR_PHONE}. Asante sana!`;

    const cleanPhone = sale.customerPhone.replace(/^0/, '255');
    const waUrl = sale.customerPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
      : `${WHATSAPP_LINK}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  const handleSendReceiptWhatsApp = (sale: OfflineSaleRecord) => {
    const receiptText =
      `🧾 *RISITI YA MAUZO - ED RETAIL*\n` +
      `Mteja: ${sale.customerName}\n` +
      `Bidhaa: ${sale.productName} (x${sale.quantity})\n` +
      `Jumla: TZS ${sale.totalAmount.toLocaleString()}\n` +
      `Kiasi Kilicholipwa: TZS ${sale.amountPaid.toLocaleString()}\n` +
      `${sale.balanceDue > 0 ? `Salio Lililobaki: TZS ${sale.balanceDue.toLocaleString()}\nTarehe ya Malipo: ${sale.dueDate || 'Makubaliano'}\n` : 'Hali: IMELIPWA YOTE ✅\n'}` +
      `Msambazaji: ${DISTRIBUTOR_NAME} (${DISTRIBUTOR_PHONE})`;

    const cleanPhone = sale.customerPhone.replace(/^0/, '255');
    const waUrl = sale.customerPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(receiptText)}`
      : `${WHATSAPP_LINK}?text=${encodeURIComponent(receiptText)}`;
    window.open(waUrl, '_blank');
  };

  const handleSavePayment = (saleId: string) => {
    const amt = parseInt(payAmountInput, 10);
    if (!isNaN(amt) && amt > 0) {
      markDebtPaid(saleId, amt);
      setPayingSaleId(null);
      setPayAmountInput('');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto space-y-4 bg-transparent text-stone-100">
      {/* ── METRICS SUMMARY CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-stone-950/80 p-3.5 sm:p-4 rounded-2xl border border-stone-800 shadow-xs space-y-1">
          <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Mauzo Yote</div>
          <div className="text-sm sm:text-base font-black text-white truncate">TZS {summary.totalRevenue.toLocaleString()}</div>
        </div>
        <div className="bg-stone-950/80 p-3.5 sm:p-4 rounded-2xl border border-stone-800 shadow-xs space-y-1">
          <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Cash Mkononi</div>
          <div className="text-sm sm:text-base font-black text-emerald-400 truncate">TZS {summary.cashCollected.toLocaleString()}</div>
        </div>
        <div className="bg-stone-950/80 p-3.5 sm:p-4 rounded-2xl border border-stone-800 shadow-xs space-y-1">
          <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Madeni Yanayodaiwa</div>
          <div className="text-sm sm:text-base font-black text-amber-300 truncate">TZS {summary.creditOutstanding.toLocaleString()}</div>
        </div>
        <div className="bg-stone-950/80 p-3.5 sm:p-4 rounded-2xl border border-stone-800 shadow-xs space-y-1">
          <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Faida Halisi</div>
          <div className="text-sm sm:text-base font-black text-white truncate">TZS {summary.estimatedNetProfit.toLocaleString()}</div>
        </div>
      </div>

      {/* ── ACTIONS & FILTER ROW ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-1 bg-stone-950/80 p-1 rounded-xl border border-stone-800 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              filter === 'all' ? 'bg-amber-400 text-stone-950 shadow-xs font-black' : 'text-stone-400 hover:text-white'
            }`}
          >
            {lang === 'sw' ? 'Yote' : 'All'} ({sales.length})
          </button>
          <button
            onClick={() => setFilter('web')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              filter === 'web' ? 'bg-emerald-500 text-stone-950 shadow-xs font-black' : 'text-stone-400 hover:text-white'
            }`}
          >
            {lang === 'sw' ? '🌐 Oda za Mtandao' : '🌐 Web Orders'} ({sales.filter((s) => s.source === 'web_whatsapp').length})
          </button>
          <button
            onClick={() => setFilter('debts')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              filter === 'debts' ? 'bg-amber-400 text-stone-950 shadow-xs font-black' : 'text-stone-400 hover:text-white'
            }`}
          >
            {lang === 'sw' ? 'Madeni' : 'Debts'} ({sales.filter((s) => s.balanceDue > 0).length})
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              filter === 'paid' ? 'bg-emerald-500 text-stone-950 shadow-xs font-black' : 'text-stone-400 hover:text-white'
            }`}
          >
            {lang === 'sw' ? 'Yaliyolipwa' : 'Paid'} ({sales.filter((s) => s.balanceDue === 0).length})
          </button>
        </div>

        <button
          onClick={onOpenSaleForm}
          className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-black rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{lang === 'sw' ? 'Rekodi Mauzo Mapya' : 'Log New Sale'}</span>
        </button>
      </div>

      {/* ── SALES LIST ── */}
      <div className="space-y-2.5">
        {filteredSales.length === 0 ? (
          <div className="bg-stone-950/60 rounded-2xl p-8 text-center border border-stone-800 text-stone-400 space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-stone-600" />
            <p className="text-xs font-bold">
              {lang === 'sw' ? 'Hakuna rekodi ya mauzo kwenye kipengele hiki.' : 'No sales records in this category.'}
            </p>
          </div>
        ) : (
          filteredSales.map((sale) => {
            const hasDebt = sale.balanceDue > 0;
            const isPaying = payingSaleId === sale.id;

            return (
              <div
                key={sale.id}
                className="bg-stone-950/80 rounded-2xl p-4 border border-stone-800 shadow-xs space-y-3 hover:border-stone-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-sm text-white">{sale.customerName}</h4>
                      {sale.source === 'web_whatsapp' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-900/60 text-blue-300 border border-blue-700/60">
                          🌐 Oda ya Mtandao
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                          hasDebt ? 'bg-amber-900/50 text-amber-300 border border-amber-700/60' : 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/60'
                        }`}
                      >
                        {hasDebt ? `Anadaiwa TZS ${sale.balanceDue.toLocaleString()}` : 'Imelipwa Yote ✅'}
                      </span>
                    </div>

                    <div className="text-xs text-stone-300 font-medium">
                      {sale.productName} {sale.quantity > 1 ? `(x${sale.quantity})` : ''} • <span className="text-white font-bold">TZS {sale.totalAmount.toLocaleString()}</span> • {sale.customerPhone || 'Bila Namba'}
                    </div>

                    {(sale.customerLocation || sale.notes) && (
                      <div className="text-[11px] text-stone-400 flex items-center gap-2">
                        {sale.customerLocation && <span>📍 {sale.customerLocation}</span>}
                        {sale.notes && <span className="italic text-stone-400">"{sale.notes}"</span>}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleSendReceiptWhatsApp(sale)}
                      title="Tuma Risiti WhatsApp"
                      className="p-2 bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 rounded-xl transition-colors cursor-pointer"
                    >
                      <Receipt className="w-4 h-4" />
                    </button>

                    {hasDebt && (
                      <button
                        onClick={() => handleSendDebtWhatsApp(sale)}
                        title="Tuma Kumbusho la Deni WhatsApp"
                        className="p-2 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded-xl transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => deleteSale(sale.id)}
                      title="Futa"
                      className="p-2 text-stone-500 hover:text-red-400 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Debt details & payment collection */}
                {hasDebt && (
                  <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between text-amber-200 text-xs font-semibold">
                      <span>Kiasi Kilicholipwa: <strong className="text-white">TZS {sale.amountPaid.toLocaleString()}</strong></span>
                      <span>Tarehe ya Ahadi: <strong className="text-amber-300">{sale.dueDate || 'Haikupangwa'}</strong></span>
                    </div>

                    {isPaying ? (
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="number"
                          value={payAmountInput}
                          onChange={(e) => setPayAmountInput(e.target.value)}
                          placeholder={`Weka kiasi (Hadi ${sale.balanceDue})...`}
                          className="flex-1 px-3 py-1.5 bg-stone-900 border border-amber-500/50 rounded-lg text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                        />
                        <button
                          onClick={() => handleSavePayment(sale.id)}
                          className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-lg text-xs font-black cursor-pointer"
                        >
                          Hifadhi
                        </button>
                        <button
                          onClick={() => setPayingSaleId(null)}
                          className="px-2.5 py-1.5 text-stone-400 hover:text-white text-xs cursor-pointer"
                        >
                          Ghairi
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => markDebtPaid(sale.id, sale.balanceDue)}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 rounded-lg text-xs font-black shadow-2xs transition-colors cursor-pointer"
                        >
                          ✅ Thibitisha Imelipwa Yote
                        </button>
                        <button
                          onClick={() => {
                            setPayingSaleId(sale.id);
                            setPayAmountInput(String(sale.balanceDue));
                          }}
                          className="px-3 py-1.5 bg-stone-900 border border-amber-500/40 hover:bg-stone-800 text-amber-300 rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                        >
                          + Rekodi Kiasi
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
