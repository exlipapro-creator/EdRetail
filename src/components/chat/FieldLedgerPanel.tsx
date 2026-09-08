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
    <div className="flex-1 overflow-y-auto space-y-4 text-gray-900">
      {/* ── METRICS SUMMARY CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="panel-inner p-3.5 sm:p-4 space-y-1">
          <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Mauzo Yote</div>
          <div className="text-sm sm:text-base font-bold text-gray-900 truncate">TZS {summary.totalRevenue.toLocaleString()}</div>
        </div>
        <div className="panel-inner p-3.5 sm:p-4 space-y-1">
          <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Cash Mkononi</div>
          <div className="text-sm sm:text-base font-bold text-emerald-700 truncate">TZS {summary.cashCollected.toLocaleString()}</div>
        </div>
        <div className="panel-inner p-3.5 sm:p-4 space-y-1">
          <div className="text-[10px] text-amber-600 font-semibold uppercase tracking-wider">Madeni Yanayodaiwa</div>
          <div className="text-sm sm:text-base font-bold text-amber-700 truncate">TZS {summary.creditOutstanding.toLocaleString()}</div>
        </div>
        <div className="panel-inner p-3.5 sm:p-4 space-y-1">
          <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Faida Halisi</div>
          <div className="text-sm sm:text-base font-bold text-gray-900 truncate">TZS {summary.estimatedNetProfit.toLocaleString()}</div>
        </div>
      </div>

      {/* ── ACTIONS & FILTER ROW ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-md border border-gray-200 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded whitespace-nowrap transition-all cursor-pointer ${
              filter === 'all' ? 'bg-primary-600 text-white shadow-xs font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {lang === 'sw' ? 'Yote' : 'All'} ({sales.length})
          </button>
          <button
            onClick={() => setFilter('web')}
            className={`px-3 py-1.5 text-xs font-semibold rounded whitespace-nowrap transition-all cursor-pointer ${
              filter === 'web' ? 'bg-primary-600 text-white shadow-xs font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {lang === 'sw' ? 'Oda za Mtandao' : 'Web Orders'} ({sales.filter((s) => s.source === 'web_whatsapp').length})
          </button>
          <button
            onClick={() => setFilter('debts')}
            className={`px-3 py-1.5 text-xs font-semibold rounded whitespace-nowrap transition-all cursor-pointer ${
              filter === 'debts' ? 'bg-primary-600 text-white shadow-xs font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {lang === 'sw' ? 'Madeni' : 'Debts'} ({sales.filter((s) => s.balanceDue > 0).length})
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-3 py-1.5 text-xs font-semibold rounded whitespace-nowrap transition-all cursor-pointer ${
              filter === 'paid' ? 'bg-primary-600 text-white shadow-xs font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {lang === 'sw' ? 'Yaliyolipwa' : 'Paid'} ({sales.filter((s) => s.balanceDue === 0).length})
          </button>
        </div>

        <button
          onClick={onOpenSaleForm}
          className="w-full sm:w-auto px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-md shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{lang === 'sw' ? 'Rekodi Mauzo Mapya' : 'Log New Sale'}</span>
        </button>
      </div>

      {/* ── SALES LIST ── */}
      <div className="space-y-2.5">
        {filteredSales.length === 0 ? (
          <div className="panel-inner p-8 text-center text-gray-400 space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-gray-300" />
            <p className="text-xs font-semibold">
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
                className="panel-inner p-4 space-y-3 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-gray-900">{sale.customerName}</h4>
                      {sale.source === 'web_whatsapp' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {lang === 'sw' ? 'Oda ya Mtandao' : 'Web Order'}
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          hasDebt ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-green-50 text-green-700 border border-green-200'
                        }`}
                      >
                        {hasDebt ? `Anadaiwa TZS ${sale.balanceDue.toLocaleString()}` : 'Imelipwa Yote'}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600">
                      {sale.productName} {sale.quantity > 1 ? `(x${sale.quantity})` : ''} • <span className="text-gray-900 font-semibold">TZS {sale.totalAmount.toLocaleString()}</span> • {sale.customerPhone || 'Bila Namba'}
                    </div>

                    {(sale.customerLocation || sale.notes) && (
                      <div className="text-[11px] text-gray-400 flex items-center gap-2">
                        {sale.customerLocation && <span>📍 {sale.customerLocation}</span>}
                        {sale.notes && <span className="italic text-gray-400">"{sale.notes}"</span>}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleSendReceiptWhatsApp(sale)}
                      title="Tuma Risiti WhatsApp"
                      className="p-2 bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-700 border border-gray-200 rounded-md transition-colors cursor-pointer"
                    >
                      <Receipt className="w-4 h-4" />
                    </button>

                    {hasDebt && (
                      <button
                        onClick={() => handleSendDebtWhatsApp(sale)}
                        title="Tuma Kumbusho la Deni WhatsApp"
                        className="p-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-md transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => deleteSale(sale.id)}
                      title="Futa"
                      className="p-2 text-gray-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Debt details & payment collection */}
                {hasDebt && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-md space-y-2 text-xs">
                    <div className="flex justify-between text-amber-900 text-xs font-medium">
                      <span>Kiasi Kilicholipwa: <strong className="text-gray-900 font-semibold">TZS {sale.amountPaid.toLocaleString()}</strong></span>
                      <span>Tarehe ya Ahadi: <strong className="text-amber-700 font-semibold">{sale.dueDate || 'Haikupangwa'}</strong></span>
                    </div>

                    {isPaying ? (
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="number"
                          value={payAmountInput}
                          onChange={(e) => setPayAmountInput(e.target.value)}
                          placeholder={`Weka kiasi (Hadi ${sale.balanceDue})...`}
                          className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                        <button
                          onClick={() => handleSavePayment(sale.id)}
                          className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded text-xs font-semibold cursor-pointer"
                        >
                          Hifadhi
                        </button>
                        <button
                          onClick={() => setPayingSaleId(null)}
                          className="px-2.5 py-1.5 text-gray-500 hover:text-gray-900 text-xs cursor-pointer"
                        >
                          Ghairi
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => markDebtPaid(sale.id, sale.balanceDue)}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Thibitisha Imelipwa Yote
                        </button>
                        <button
                          onClick={() => {
                            setPayingSaleId(sale.id);
                            setPayAmountInput(String(sale.balanceDue));
                          }}
                          className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-amber-700 rounded text-xs font-semibold transition-colors cursor-pointer"
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
