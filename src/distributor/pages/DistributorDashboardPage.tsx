import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Award,
  Phone,
  Plus,
  PackagePlus,
  ChevronRight,
} from 'lucide-react';
import { useDistributorStore } from '../../store/distributorStore';
import { useLang } from '../../context/LangContext';
import { LogOfflineSaleModal } from '../../components/distributor/LogOfflineSaleModal';
import { ProductEditorModal } from '../../components/distributor/ProductEditorModal';

type Timeframe = 'today' | 'week' | 'month' | 'all';

const TIMEFRAMES: Array<{ id: Timeframe; label: { en: string; sw: string } }> = [
  { id: 'today', label: { en: 'Today', sw: 'Leo' } },
  { id: 'week', label: { en: 'Week', sw: 'Wiki' } },
  { id: 'month', label: { en: 'Month', sw: 'Mwezi' } },
  { id: 'all', label: { en: 'All time', sw: 'Yote' } },
];

function greeting(lang: 'en' | 'sw'): string {
  const h = new Date().getHours();
  if (lang === 'sw') {
    if (h < 12) return 'Habari za asubuhi';
    if (h < 18) return 'Habari za mchana';
    return 'Habari za jioni';
  }
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function Metric({
  label,
  value,
  sub,
  icon: Icon,
  tone = 'default',
}: {
  label: string;
  value: string;
  sub?: string;
  icon: typeof DollarSign;
  tone?: 'default' | 'success' | 'warning';
}) {
  const toneText =
    tone === 'warning' ? 'text-amber-700' : tone === 'success' ? 'text-emerald-700' : 'text-gray-900';
  const iconTone =
    tone === 'warning'
      ? 'text-amber-600'
      : tone === 'success'
      ? 'text-emerald-600'
      : 'text-gray-400';
  return (
    <div className="panel-surface p-3.5 space-y-1 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate">{label}</span>
        <Icon className={`w-4 h-4 shrink-0 ${iconTone}`} />
      </div>
      <div className={`text-lg font-bold truncate ${toneText}`}>{value}</div>
      {sub && <div className="text-[11px] text-gray-400 font-medium truncate">{sub}</div>}
    </div>
  );
}

export function DistributorDashboardPage() {
  const { lang } = useLang();
  const [timeframe, setTimeframe] = useState<Timeframe>('month');
  const sales = useDistributorStore((s) => s.sales);
  const getFinancialSummary = useDistributorStore((s) => s.getFinancialSummary);
  const getMaintenanceAnalysis = useDistributorStore((s) => s.getMaintenanceAnalysis);
  const distributor = useDistributorStore((s) => s.getActiveDistributor());

  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  const summary = getFinancialSummary(timeframe);
  const maintenance = getMaintenanceAnalysis();
  const debtorSales = sales.filter((s) => s.status !== 'paid' && (s.balanceDue ?? 0) > 0);
  const pendingDebtsTotal = debtorSales.reduce((acc, s) => acc + (s.balanceDue ?? 0), 0);
  const recentSales = [...sales].slice(-5).reverse();

  const handleSendDebtReminder = (sale: (typeof sales)[0]) => {
    const msg =
      `Habari ${sale.customerName}! Ni ${distributor.name} kutoka ED Retail. ` +
      `Kukumbusha salio lako la TZS ${(sale.balanceDue || 0).toLocaleString()} ` +
      `kwa ajili ya oda yako ya ${sale.productName}. Unaweza kulipa kupitia ${distributor.lipaNumber || distributor.phone}. Asante!`;
    const cleanDigits = (sale.customerPhone || '').replace(/\D/g, '');
    const phone = cleanDigits.startsWith('0')
      ? '255' + cleanDigits.slice(1)
      : cleanDigits.startsWith('255')
      ? cleanDigits
      : '255' + cleanDigits;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const firstName = distributor.name.split(' ')[0];

  return (
    <div className="portal-page space-y-6">
      {/* ── Page header: greeting + primary actions ── */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {greeting(lang)}, {firstName}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {distributor.rank} · {distributor.city}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowProductModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors outline-none"
          >
            <PackagePlus className="w-4 h-4" />
            {lang === 'sw' ? 'Ongeza Bidhaa' : 'Add Product'}
          </button>
          <button
            onClick={() => setShowSaleModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-colors outline-none"
          >
            <Plus className="w-4 h-4" />
            {lang === 'sw' ? 'Rekodi Mauzo' : 'Log Sale'}
          </button>
        </div>
      </div>

      {/* ── Key metrics + timeframe ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {lang === 'sw' ? 'Muhtasari wa Mauzo' : 'Sales Summary'}
          </p>
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-md p-0.5">
            {TIMEFRAMES.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setTimeframe(opt.id)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors outline-none ${
                  timeframe === opt.id
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {opt.label[lang]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <Metric
            label={lang === 'sw' ? 'Jumla ya Mauzo' : 'Total Revenue'}
            value={`TZS ${summary.totalRevenue.toLocaleString()}`}
            sub={`${summary.totalUnitsSold} ${lang === 'sw' ? 'bidhaa' : 'units'}`}
            icon={DollarSign}
          />
          <Metric
            label={lang === 'sw' ? 'Cash Mkononi' : 'Cash Collected'}
            value={`TZS ${summary.cashCollected.toLocaleString()}`}
            sub={
              summary.totalRevenue > 0
                ? `${Math.round((summary.cashCollected / summary.totalRevenue) * 100)}% ${lang === 'sw' ? 'imekusanywa' : 'collected'}`
                : '100%'
            }
            icon={CheckCircle2}
            tone="success"
          />
          <Metric
            label={lang === 'sw' ? 'Madeni' : 'Outstanding'}
            value={`TZS ${summary.creditOutstanding.toLocaleString()}`}
            sub={`${debtorSales.length} ${lang === 'sw' ? 'wateja' : 'debtors'}`}
            icon={AlertTriangle}
            tone={debtorSales.length > 0 ? 'warning' : 'default'}
          />
          <Metric
            label={lang === 'sw' ? 'Faida Halisi' : 'Est. Profit'}
            value={`TZS ${summary.estimatedNetProfit.toLocaleString()}`}
            sub={lang === 'sw' ? 'Baada ya bei ya jumla' : 'After wholesale cost'}
            icon={TrendingUp}
          />
        </div>
      </div>

      {/* ── SV / goal progress ── */}
      <div className="panel-surface p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              {lang === 'sw'
                ? `Lengo la Mwezi: ${maintenance.fundName} (2,000 SV)`
                : `Month Goal: ${maintenance.fundName} (2,000 SV)`}
            </h2>
            <p className="text-[11px] text-gray-500">
              {lang === 'sw'
                ? `Mwezi ${maintenance.currentMonthIndex} kati ya 3 · Siku ${maintenance.daysRemaining} zimebaki`
                : `Month ${maintenance.currentMonthIndex} of 3 · ${maintenance.daysRemaining} days remaining`}
            </p>
          </div>
          <span className="ml-auto text-sm font-bold text-primary-700">{maintenance.percentComplete}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, maintenance.percentComplete)}%` }}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="panel-inner p-2 text-center">
            <div className="text-[10px] text-gray-500 font-medium">{lang === 'sw' ? 'Pengo la SV' : 'SV Gap'}</div>
            <div className="text-xs font-bold text-gray-900">{maintenance.gapSv.toLocaleString()} SV</div>
          </div>
          <div className="panel-inner p-2 text-center">
            <div className="text-[10px] text-gray-500 font-medium">{lang === 'sw' ? 'Kasi ya Siku' : 'Daily Rate'}</div>
            <div className="text-xs font-bold text-gray-900">{maintenance.dailyPacingSv} SV/day</div>
          </div>
          <div className="panel-inner p-2 text-center">
            <div className="text-[10px] text-gray-500 font-medium">{lang === 'sw' ? 'P4 Inahitajika' : 'P4 Kits'}</div>
            <div className="text-xs font-bold text-gray-900">{maintenance.p4KitsNeeded} kits</div>
          </div>
          <div className="panel-inner p-2 text-center">
            <div className="text-[10px] text-gray-500 font-medium">{lang === 'sw' ? 'Shake Off' : 'Shake Off'}</div>
            <div className="text-xs font-bold text-gray-900">{maintenance.shakeOffBoxesNeeded} boxes</div>
          </div>
        </div>
      </div>

      {/* ── Attention: outstanding debts (concise) ── */}
      {debtorSales.length > 0 && (
        <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              {lang === 'sw'
                ? `Madeni ya kufuatiliwa (${debtorSales.length} · TZS ${pendingDebtsTotal.toLocaleString()})`
                : `Debts to follow up (${debtorSales.length} · TZS ${pendingDebtsTotal.toLocaleString()})`}
            </p>
            <Link
              to="/portal/ledger"
              className="text-[11px] font-semibold text-amber-800 hover:underline inline-flex items-center gap-0.5 shrink-0"
            >
              {lang === 'sw' ? 'Mauzo Yote' : 'View Sales'}
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {debtorSales.slice(0, 2).map((sale) => (
              <div key={sale.id} className="bg-white border border-amber-200 rounded-md p-2.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-gray-900 truncate">{sale.customerName}</div>
                  <div className="text-[11px] text-amber-800">
                    TZS {sale.balanceDue?.toLocaleString()} · {sale.productName}
                  </div>
                </div>
                <button
                  onClick={() => handleSendDebtReminder(sale)}
                  className="px-2.5 py-1.5 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors outline-none"
                >
                  <Phone className="w-3 h-3" />
                  {lang === 'sw' ? 'Kumbusho' : 'Remind'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recent activity (concise — full management lives in Sales) ── */}
      <section className="panel-surface p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-sm font-semibold text-gray-900">
            {lang === 'sw' ? 'Mauzo ya Hivi Karibuni' : 'Recent Sales'}
          </h2>
          <Link
            to="/portal/ledger"
            className="text-[11px] font-semibold text-primary-700 hover:underline inline-flex items-center gap-0.5 shrink-0"
          >
            {lang === 'sw' ? 'Yote' : 'View all'}
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        {recentSales.length === 0 ? (
          <div className="panel-inner p-6 text-center text-gray-400 text-xs">
            {lang === 'sw' ? 'Hakuna mauzo bado.' : 'No sales yet.'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentSales.slice(0, 5).map((sale) => {
              const hasDebt = (sale.balanceDue ?? 0) > 0;
              return (
                <div key={sale.id} className="py-2.5 flex items-center justify-between gap-3 min-w-0">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-gray-900 truncate">{sale.customerName}</div>
                    <div className="text-[11px] text-gray-500 truncate">
                      {sale.productName} {sale.quantity > 1 ? `(x${sale.quantity})` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-gray-900">TZS {sale.totalAmount.toLocaleString()}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        hasDebt
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-green-50 text-green-700 border border-green-200'
                      }`}
                    >
                      {hasDebt
                        ? `${lang === 'sw' ? 'Anadaiwa' : 'Outstanding'}`
                        : lang === 'sw' ? 'Imelipwa' : 'Paid'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modals */}
      {showSaleModal && <LogOfflineSaleModal isOpen={showSaleModal} onClose={() => setShowSaleModal(false)} />}
      {showProductModal && (
        <ProductEditorModal isOpen={showProductModal} onClose={() => setShowProductModal(false)} lang={lang} />
      )}
    </div>
  );
}