import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../utils/whatsappCompiler';
import { LoanRecord, SaleItem } from '../types';
import { Plus, X, Save, Loader2, ChevronDown, MessageCircle, CheckCircle2 } from 'lucide-react';
import { WHATSAPP_LINK } from '../../utils/whatsappCompiler';

const STATUS_COLOR = {
  active:  'text-red-400 bg-red-950 border-red-800',
  partial: 'text-amber-400 bg-amber-950 border-amber-800',
  cleared: 'text-green-400 bg-green-950 border-green-800',
};

export function LoansPage() {
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
    const { data } = await supabase.from('loans').select('*').order('created_at', { ascending: false });
    setLoans((data as LoanRecord[]) ?? []);
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

    await Promise.all([
      supabase.from('loan_payments').insert({ loan_id: loan.id, amount, notes: payNote || null }),
      supabase.from('loans').update({ amount_paid: newPaid, status: newStatus }).eq('id', loan.id),
    ]);
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
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Loans & Credit</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loans.filter(l => l.status !== 'cleared').length} active · {formatPrice(loans.filter(l => l.status !== 'cleared').reduce((s, l) => s + l.balance, 0))} TZS outstanding
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {(['all','active','partial','cleared'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div> : (
        <div className="space-y-2">
          {filtered.map(loan => (
            <div key={loan.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 flex items-center gap-3 cursor-pointer" onClick={() => setExpanded(expanded === loan.id ? null : loan.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white">{loan.customer_name}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLOR[loan.status]}`}>
                      {loan.status}
                    </span>
                  </div>
                  <div className="flex gap-3 mt-0.5">
                    <span className="text-xs text-gray-500">Total: {formatPrice(loan.total_amount)} TZS</span>
                    <span className="text-xs text-red-400 font-semibold">Owed: {formatPrice(loan.balance)} TZS</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {loan.status !== 'cleared' && (
                    <>
                      <button onClick={e => { e.stopPropagation(); sendWhatsAppReminder(loan); }}
                        className="p-1.5 text-green-500 hover:text-green-400 transition-colors" title="Send WhatsApp reminder">
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); setPayModal({ loan }); setPayAmount(''); setPayNote(''); }}
                        className="p-1.5 text-indigo-400 hover:text-indigo-300 transition-colors" title="Record payment">
                        <Plus className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {loan.status === 'cleared' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expanded === loan.id ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {expanded === loan.id && (
                <div className="px-4 pb-4 border-t border-gray-800 pt-3 space-y-3">
                  <div className="text-xs text-gray-400 space-y-1">
                    {loan.customer_phone && <p>📞 {loan.customer_phone}</p>}
                    {loan.customer_location && <p>📍 {loan.customer_location}</p>}
                    {loan.due_date && <p>📅 Due: {new Date(loan.due_date).toLocaleDateString()}</p>}
                  </div>

                  {/* Items */}
                  <div className="space-y-1">
                    {(loan.items as SaleItem[]).map((item, i) => (
                      <div key={i} className="flex justify-between text-xs text-gray-300">
                        <span>{item.quantity}× {item.product_name}</span>
                        <span>{formatPrice(item.total)} TZS</span>
                      </div>
                    ))}
                  </div>

                  {/* Payment summary */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Total', value: formatPrice(loan.total_amount), color: 'text-white' },
                      { label: 'Paid',  value: formatPrice(loan.amount_paid),  color: 'text-green-400' },
                      { label: 'Owed',  value: formatPrice(loan.balance),      color: 'text-red-400' },
                    ].map(x => (
                      <div key={x.label} className="bg-gray-800 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-gray-500">{x.label}</p>
                        <p className={`text-xs font-bold ${x.color}`}>{x.value}</p>
                      </div>
                    ))}
                  </div>

                  {loan.notes && <p className="text-xs text-gray-500 italic">{loan.notes}</p>}
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center text-gray-600 py-12 text-sm">No loan records</p>}
        </div>
      )}

      {/* Payment Modal */}
      {payModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <h2 className="text-base font-bold text-white">Record Payment</h2>
              <button onClick={() => setPayModal(null)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <p className="text-sm text-gray-400">
                Balance for <span className="text-white font-semibold">{payModal.loan.customer_name}</span>:
                <span className="text-red-400 font-bold ml-1">{formatPrice(payModal.loan.balance)} TZS</span>
              </p>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Amount Paid (TZS)</label>
                <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Notes (optional)</label>
                <input value={payNote} onChange={e => setPayNote(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-800 flex gap-3">
              <button onClick={() => setPayModal(null)} className="flex-1 py-2.5 border border-gray-700 text-gray-400 text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors">Cancel</button>
              <button onClick={recordPayment} disabled={saving || !payAmount}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Confirm</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
