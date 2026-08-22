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
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50 text-stone-900">
      {/* ── METRICS SUMMARY CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
          <div className="text-[10px] text-stone-500 font-semibold">Mauzo Yote</div>
          <div className="text-sm font-black text-stone-900">TZS {summary.totalRevenue.toLocaleString()}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
          <div className="text-[10px] text-stone-500 font-semibold">Cash Mkononi</div>
          <div className="text-sm font-black text-emerald-800">TZS {summary.cashCollected.toLocaleString()}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
          <div className="text-[10px] text-stone-500 font-semibold">Madeni Yanayodaiwa</div>
          <div className="text-sm font-black text-amber-700">TZS {summary.creditOutstanding.toLocaleString()}</div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
          <div className="text-[10px] text-stone-500 font-semibold">Faida Halisi</div>
          <div className="text-sm font-black text-stone-900">TZS {summary.estimatedNetProfit.toLocaleString()}</div>
        </div>
      </div>

      {/* ── ACTIONS & FILTER ROW ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 bg-stone-200/70 p-1 rounded-xl overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
              filter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {lang === 'sw' ? 'Yote' : 'All'} ({sales.length})
          </button>
          <button
            onClick={() => setFilter('web')}
            className={`px-3 py-1 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
              filter === 'web' ? 'bg-emerald-800 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {lang === 'sw' ? '🌐 Oda za Mtandao' : '🌐 Web Orders'} ({sales.filter((s) => s.source === 'web_whatsapp').length})
          </button>
          <button
            onClick={() => setFilter('debts')}
            className={`px-3 py-1 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
              filter === 'debts' ? 'bg-white text-amber-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {lang === 'sw' ? 'Madeni' : 'Debts'} ({sales.filter((s) => s.balanceDue > 0).length})
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-3 py-1 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
              filter === 'paid' ? 'bg-white text-emerald-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {lang === 'sw' ? 'Yaliyolipwa' : 'Paid'} ({sales.filter((s) => s.balanceDue === 0).length})
          </button>
        </div>

        <button
          onClick={onOpenSaleForm}
          className="w-full sm:w-auto px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'sw' ? 'Rekodi Mauzo Mapya' : 'Log New Sale'}</span>
        </button>
      </div>

      {/* ── SALES LIST ── */}
      <div className="space-y-2.5">
        {filteredSales.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 text-stone-500 space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-stone-300" />
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
                className="bg-white rounded-2xl p-3.5 border border-stone-200 shadow-xs space-y-2.5 hover:border-stone-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-xs text-stone-900">{sale.customerName}</h4>
                      {sale.source === 'web_whatsapp' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-200">
                          🌐 Oda ya Mtandao
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                          hasDebt ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {hasDebt ? `Anadaiwa TZS ${sale.balanceDue.toLocaleString()}` : 'Imelipwa Yote ✅'}
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-600 mt-0.5 font-medium">
                      {sale.productName} {sale.quantity > 1 ? `(x${sale.quantity})` : ''} • TZS {sale.totalAmount.toLocaleString()} • {sale.customerPhone || 'Bila Namba'}
                    </div>

                    {(sale.customerLocation || sale.notes) && (
                      <div className="text-[10px] text-stone-500 mt-1 flex items-center gap-2">
                        {sale.customerLocation && <span>📍 {sale.customerLocation}</span>}
                        {sale.notes && <span className="italic">{sale.notes}</span>}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSendReceiptWhatsApp(sale)}
                      title="Tuma Risiti WhatsApp"
                      className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                    </button>

                    {hasDebt && (
                      <button
                        onClick={() => handleSendDebtWhatsApp(sale)}
                        title="Tuma Kumbusho la Deni WhatsApp"
                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => deleteSale(sale.id)}
                      title="Futa"
                      className="p-1.5 text-stone-300 hover:text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Debt details & payment collection */}
                {hasDebt && (
                  <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between text-amber-950 text-[11px]">
                      <span>Kiasi Kilicholipwa: TZS {sale.amountPaid.toLocaleString()}</span>
                      <span>Tarehe ya Ahadi: {sale.dueDate || 'Haikupangwa'}</span>
                    </div>

                    {isPaying ? (
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="number"
                          value={payAmountInput}
                          onChange={(e) => setPayAmountInput(e.target.value)}
                          placeholder={`Weka kiasi (Hadi ${sale.balanceDue})...`}
                          className="flex-1 px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-xs font-bold"
                        />
                        <button
                          onClick={() => handleSavePayment(sale.id)}
                          className="px-3 py-1 bg-amber-700 text-white rounded-lg text-xs font-bold hover:bg-amber-800"
                        >
                          Hifadhi
                        </button>
                        <button
                          onClick={() => setPayingSaleId(null)}
                          className="px-2 py-1 text-stone-500 text-xs"
                        >
                          Ghairi
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => markDebtPaid(sale.id, sale.balanceDue)}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold shadow-2xs transition-colors"
                        >
                          ✅ Thibitisha Imelipwa Yote
                        </button>
                        <button
                          onClick={() => {
                            setPayingSaleId(sale.id);
                            setPayAmountInput(String(sale.balanceDue));
                          }}
                          className="px-2.5 py-1 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 rounded-lg text-[11px] font-bold shadow-2xs transition-colors"
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
