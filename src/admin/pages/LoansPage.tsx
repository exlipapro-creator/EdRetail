import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { formatPrice, WHATSAPP_LINK } from '../../utils/whatsappCompiler';
import { LoanRecord, SaleItem } from '../types';
import { Plus, Save, Loader2, ChevronDown, MessageCircle, CheckCircle2, Phone, MapPin, CalendarDays } from 'lucide-react';
import { useDistributorStore } from '../../store/distributorStore';
import { useLang } from '../../context/LangContext';
import {
  PageHeader, Modal, Field, inputClasses, buttonClasses,
  FilterPills, Badge, EmptyState, Spinner, cn,
} from '../../components/ui';

const STATUS_TONE = {
  active:  'danger' as const,
  partial: 'warning' as const,
  cleared: 'success' as const,
};

export function LoansPage() {
  const { lang } = useLang();
  const [loans, setLoans]     = useState<LoanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<'all' | 'active' | 'partial' | 'cleared'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [payModal, setPayModal] = useState<{ loan: LoanRecord } | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payNote, setPayNote]   = useState('');
  const [saving, setSaving]     = useState(false);

  const load = async () => {
    setLoading(true);
    let loadedFromDb = false;
    try {
      const { data, error } = await supabase.from('loans').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setLoans(data as LoanRecord[]);
        loadedFromDb = true;
      }
    } catch {
      // Fallback
    }

    if (!loadedFromDb) {
      const localSales = useDistributorStore.getState().sales;
      const creditSales = localSales.filter((s) => s.paymentType === 'credit' || s.balanceDue > 0);
      const mapped: LoanRecord[] = creditSales.map((s) => ({
        id: s.id,
        sale_id: s.id,
        created_at: s.createdAt,
        updated_at: s.createdAt,
        customer_name: s.customerName,
        customer_phone: s.customerPhone,
        customer_location: s.customerLocation,
        total_amount: s.totalAmount,
        amount_paid: s.amountPaid,
        balance: s.balanceDue,
        status: s.balanceDue === 0 ? 'cleared' : s.amountPaid > 0 ? 'partial' : 'active',
        due_date: s.dueDate || null,
        notes: s.notes || null,
        payments: [],
        items: [
          {
            product_id: s.productId,
            product_name: s.productName,
            quantity: s.quantity,
            unit_price: s.unitPrice,
            total: s.totalAmount,
          },
        ],
      }));
      setLoans(mapped);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === 'all' ? loans : loans.filter(l => l.status === filter);

  const recordPayment = async () => {
    if (!payModal || !payAmount) return;
    setSaving(true);
    const amount = Number(payAmount);
    const loan   = payModal.loan;
    const newPaid   = loan.amount_paid + amount;
    const newBalance = loan.total_amount - newPaid;
    const newStatus  = newBalance <= 0 ? 'cleared' : newPaid > 0 ? 'partial' : 'active';

    useDistributorStore.getState().markDebtPaid(loan.id, amount);

    try {
      await Promise.all([
        supabase.from('loan_payments').insert({ loan_id: loan.id, amount, notes: payNote || null }),
        supabase.from('loans').update({ amount_paid: newPaid, status: newStatus }).eq('id', loan.id),
      ]);
    } catch {
      // Offline safe
    }

    await load();
    setPayModal(null);
    setPayAmount('');
    setPayNote('');
    setSaving(false);
  };

  const sendWhatsAppReminder = (loan: LoanRecord) => {
    const msg = `Hello ${loan.customer_name}, this is a reminder that you have an outstanding balance of ${formatPrice(loan.balance)} TZS with ED Retail. Please arrange payment at your earliest convenience. Thank you!`;
    const phone = loan.customer_phone.replace(/\D/g, '');
    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
      : `${WHATSAPP_LINK}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl">
      <PageHeader
        title={lang === 'sw' ? 'Mikopo na Malipo ya Awamu' : 'Loans & Credit'}
        sub={
          <>
            {loans.filter(l => l.status !== 'cleared').length} active ·{' '}
            <span className="tabular-nums">
              {formatPrice(loans.filter(l => l.status !== 'cleared').reduce((s, l) => s + l.balance, 0))} TZS outstanding
            </span>
          </>
        }
      />

      <FilterPills
        ariaLabel="Filter loans by status"
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all',     label: 'All'     },
          { value: 'active',  label: 'Active'  },
          { value: 'partial', label: 'Partial' },
          { value: 'cleared', label: 'Cleared' },
        ]}
      />

      {loading ? (
        <div className="flex items-center justify-center h-48"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl">
          <EmptyState
            icon={<CheckCircle2 className="w-5 h-5 text-gray-400" />}
            title={lang === 'sw' ? 'Hakuna rekodi za mikopo' : 'No loan records'}
            sub={filter === 'all'
              ? 'Loans created from the Sales page will appear here.'
              : 'No loans with this status.'}
          />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(loan => (
            <div key={loan.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div
                className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === loan.id ? null : loan.id)}
                aria-expanded={expanded === loan.id}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900">{loan.customer_name}</p>
                    <Badge tone={STATUS_TONE[loan.status]}>{loan.status}</Badge>
                  </div>
                  <div className="flex gap-3 mt-0.5 tabular-nums">
                    <span className="text-xs text-gray-500">Total: {formatPrice(loan.total_amount)} TZS</span>
                    <span className="text-xs text-red-600 font-semibold">Owed: {formatPrice(loan.balance)} TZS</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {loan.status !== 'cleared' && (
                    <>
                      <button
                        onClick={e => { e.stopPropagation(); sendWhatsAppReminder(loan); }}
                        className="p-2 rounded-md text-green-600 hover:text-green-700 hover:bg-green-50 transition-colors outline-none"
                        title={lang === 'sw' ? 'Tuma ukumbusho wa WhatsApp' : 'Send WhatsApp reminder'}
                        aria-label={`Send WhatsApp reminder to ${loan.customer_name}`}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setPayModal({ loan }); setPayAmount(''); setPayNote(''); }}
                        className="p-2 rounded-md text-primary-600 hover:text-primary-700 hover:bg-primary-50 transition-colors outline-none"
                        title={lang === 'sw' ? 'Rekodi malipo' : 'Record payment'}
                        aria-label={`Record payment for ${loan.customer_name}`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {loan.status === 'cleared' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                  <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', expanded === loan.id && 'rotate-180')} />
                </div>
              </div>

              {expanded === loan.id && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                  <div className="text-xs text-gray-500 space-y-1">
                    {loan.customer_phone && (
                      <p className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {loan.customer_phone}</p>
                    )}
                    {loan.customer_location && (
                      <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {loan.customer_location}</p>
                    )}
                    {loan.due_date && (
                      <p className="flex items-center gap-1.5"><CalendarDays className="w-3 h-3" /> Due: {new Date(loan.due_date).toLocaleDateString()}</p>
                    )}
                  </div>

                  {/* Items */}
                  <div className="space-y-1">
                    {(loan.items as SaleItem[]).map((item, i) => (
                      <div key={i} className="flex justify-between text-xs text-gray-600 tabular-nums">
                        <span>{item.quantity}× {item.product_name}</span>
                        <span>{formatPrice(item.total)} TZS</span>
                      </div>
                    ))}
                  </div>

                  {/* Payment summary */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Total', value: formatPrice(loan.total_amount), color: 'text-gray-900' },
                      { label: 'Paid',  value: formatPrice(loan.amount_paid),  color: 'text-green-600' },
                      { label: 'Owed',  value: formatPrice(loan.balance),      color: 'text-red-600' },
                    ].map(x => (
                      <div key={x.label} className="bg-gray-50 rounded-md p-2 text-center">
                        <p className="text-[10px] text-gray-400">{x.label}</p>
                        <p className={cn('text-xs font-bold tabular-nums', x.color)}>{x.value}</p>
                      </div>
                    ))}
                  </div>

                  {loan.notes && <p className="text-xs text-gray-500 italic">{loan.notes}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Payment Modal */}
      <Modal
        open={Boolean(payModal)}
        onClose={() => setPayModal(null)}
        title={lang === 'sw' ? 'Rekodi Malipo' : 'Record Payment'}
        size="sm"
        footer={
          <>
            <button onClick={() => setPayModal(null)} className={buttonClasses('secondary', 'flex-1')}>{lang === 'sw' ? 'Ghairi' : 'Cancel'}</button>
            <button
              onClick={recordPayment}
              disabled={saving || !payAmount}
              className={buttonClasses('primary', 'flex-1')}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Confirm</>}
            </button>
          </>
        }
      >
        {payModal && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Balance for <span className="text-gray-900 font-semibold">{payModal.loan.customer_name}</span>:
              <span className="text-red-600 font-bold ml-1 tabular-nums">{formatPrice(payModal.loan.balance)} TZS</span>
            </p>
            <Field label={lang === 'sw' ? 'Kiasi Kilicholipwa (TZS)' : 'Amount Paid (TZS)'}>
              <input
                type="number"
                value={payAmount}
                onChange={e => setPayAmount(e.target.value)}
                className={cn(inputClasses, 'tabular-nums')}
              />
            </Field>
            <Field label={lang === 'sw' ? 'Maelezo (hiari)' : 'Notes (optional)'}>
              <input
                value={payNote}
                onChange={e => setPayNote(e.target.value)}
                className={inputClasses}
              />
            </Field>
          </div>
        )}
      </Modal>
    </div>
  );
}
