import { useState } from 'react';
import {
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Award,
  Phone,
} from 'lucide-react';
import { useDistributorStore } from '../../store/distributorStore';
import { useLang } from '../../context/LangContext';
import { FieldLedgerPanel } from '../../components/chat/FieldLedgerPanel';
import { LogOfflineSaleModal } from '../../components/distributor/LogOfflineSaleModal';

export function DistributorDashboardPage() {
  const { lang } = useLang();
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const sales = useDistributorStore((s) => s.sales);
  const getFinancialSummary = useDistributorStore((s) => s.getFinancialSummary);
  const getMaintenanceAnalysis = useDistributorStore((s) => s.getMaintenanceAnalysis);
  const distributor = useDistributorStore((s) => s.getActiveDistributor());

  const [showSaleModal, setShowSaleModal] = useState(false);

  const summary = getFinancialSummary();
  const maintenance = getMaintenanceAnalysis();
  const debtorSales = sales.filter((s) => s.status !== 'paid' && (s.balanceDue ?? 0) > 0);
  const pendingDebtsTotal = debtorSales.reduce((acc, s) => acc + (s.balanceDue ?? 0), 0);

  const handleSendDebtReminder = (sale: (typeof sales)[0]) => {
    const msg =
      `Habari ${sale.customerName}! Ni ${distributor.name} kutoka ED Retail. ` +
      `Kukumbusha salio lako la TZS ${(sale.balanceDue || 0).toLocaleString()} ` +
      `kwa ajili ya oda yako ya ${sale.productName}. Unaweza kulipa kupitia ${distributor.lipaNumber}. Asante!`;
    const cleanDigits = (sale.customerPhone || '').replace(/\D/g, '');
    const phone = cleanDigits.startsWith('0')
      ? '255' + cleanDigits.slice(1)
      : cleanDigits.startsWith('255')
      ? cleanDigits
      : '255' + cleanDigits;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ── SECTION A: GLOBAL REPORTING PERIOD & 4 CORE METRICS ── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-stone-200 uppercase tracking-wider">
              {lang === 'sw' ? 'Muhtasari wa Biashara Yako' : 'Business Financial Snapshot'}
            </span>
            <span className="text-[11px] text-stone-400 font-medium">
              ({sales.length} {lang === 'sw' ? 'mauzo jumla' : 'total sales logged'})
            </span>
          </div>

          {/* Timeframe Filter */}
          <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 p-1 rounded-xl text-xs self-start sm:self-auto">
            {(['today', 'week', 'month', 'all'] as const).map((tId) => {
              const labels = {
                today: { en: 'Today', sw: 'Leo' },
                week: { en: 'Week', sw: 'Wiki' },
                month: { en: 'Month', sw: 'Mwezi' },
                all: { en: 'All Time', sw: 'Yote' },
              };
              const isActive = timeframe === tId;
              return (
                <button
                  key={tId}
                  onClick={() => setTimeframe(tId)}
                  className={`px-2.5 py-1 font-black rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-400 text-stone-950 shadow-xs'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {labels[tId][lang]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4 Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {/* 1. Total Revenue */}
          <div className="bg-stone-900/90 p-3.5 sm:p-4 rounded-2xl border border-stone-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {lang === 'sw' ? 'Jumla ya Mauzo' : 'Total Revenue'}
              </span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-base sm:text-xl font-black text-white truncate">
              TZS {summary.totalRevenue.toLocaleString()}
            </div>
            <div className="text-[10px] text-stone-400 font-medium">
              {summary.totalUnitsSold} {lang === 'sw' ? 'bidhaa zilizouzwa' : 'units sold'}
            </div>
          </div>

          {/* 2. Cash Collected */}
          <div className="bg-stone-900/90 p-3.5 sm:p-4 rounded-2xl border border-stone-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {lang === 'sw' ? 'Cash Mkononi' : 'Cash Collected'}
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-base sm:text-xl font-black text-emerald-400 truncate">
              TZS {summary.cashCollected.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-500 font-bold">
              {summary.totalRevenue > 0
                ? `${Math.round((summary.cashCollected / summary.totalRevenue) * 100)}% collected`
                : '100%'}
            </div>
          </div>

          {/* 3. Debts */}
          <div className={`p-3.5 sm:p-4 rounded-2xl border shadow-sm space-y-1 ${
            debtorSales.length > 0
              ? 'bg-amber-950/40 border-amber-500/50'
              : 'bg-stone-900/90 border-stone-800'
          }`}>
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                {lang === 'sw' ? 'Madeni ya Wateja' : 'Credit / Debts'}
              </span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-base sm:text-xl font-black text-amber-300 truncate">
              TZS {summary.creditOutstanding.toLocaleString()}
            </div>
            <div className="text-[10px] text-amber-400 font-bold">
              {debtorSales.length} {lang === 'sw' ? 'wateja wanadaiwa' : 'active debtors'}
            </div>
          </div>

          {/* 4. Estimated Profit */}
          <div className="bg-stone-900/90 p-3.5 sm:p-4 rounded-2xl border border-stone-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {lang === 'sw' ? 'Faida Halisi (Net)' : 'Est. Net Profit'}
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-base sm:text-xl font-black text-white truncate">
              TZS {summary.estimatedNetProfit.toLocaleString()}
            </div>
            <div className="text-[10px] text-stone-400 font-medium">
              {lang === 'sw' ? 'Baada ya bei ya jumla' : 'After wholesale cost'}
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION B: 2,000 SV CHALLENGE PROGRESS ── */}
      <div className="bg-stone-900/90 rounded-2xl p-4 sm:p-5 border border-emerald-900/40 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-black text-sm text-white">
                {lang === 'sw'
                  ? `Lengo la Mwezi: ${maintenance.fundName} (2,000 SV Challenge)`
                  : `Month Goal: ${maintenance.fundName} (2,000 SV Challenge)`}
              </h3>
              <p className="text-[11px] text-stone-400">
                {lang === 'sw'
                  ? `Mwezi wa ${maintenance.currentMonthIndex} kati ya 3 • Zimebaki siku ${maintenance.daysRemaining}`
                  : `Month ${maintenance.currentMonthIndex} of 3 consecutive • ${maintenance.daysRemaining} days remaining`}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-black">
            <span className="text-white">
              {maintenance.totalSv.toLocaleString()} / {maintenance.targetSv.toLocaleString()} SV
            </span>
            <span className="text-emerald-400 font-extrabold">{maintenance.percentComplete}%</span>
          </div>
          <div className="w-full h-2.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, maintenance.percentComplete)}%` }}
            />
          </div>
        </div>

        {/* Pacing Mini Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <div className="p-2 bg-stone-950/80 rounded-xl border border-stone-800 text-center">
            <div className="text-[10px] text-stone-400 font-semibold">{lang === 'sw' ? 'Pengo la SV' : 'SV Gap'}</div>
            <div className="text-xs font-black text-amber-300">{maintenance.gapSv.toLocaleString()} SV</div>
          </div>
          <div className="p-2 bg-stone-950/80 rounded-xl border border-stone-800 text-center">
            <div className="text-[10px] text-stone-400 font-semibold">{lang === 'sw' ? 'Kasi ya Kila Siku' : 'Daily Run Rate'}</div>
            <div className="text-xs font-black text-white">{maintenance.dailyPacingSv} SV/day</div>
          </div>
          <div className="p-2 bg-stone-950/80 rounded-xl border border-stone-800 text-center">
            <div className="text-[10px] text-stone-400 font-semibold">{lang === 'sw' ? 'P4 Slimming Inahitajika' : 'P4 Kits Needed'}</div>
            <div className="text-xs font-black text-emerald-400">{maintenance.p4KitsNeeded} kits</div>
          </div>
          <div className="p-2 bg-stone-950/80 rounded-xl border border-stone-800 text-center">
            <div className="text-[10px] text-stone-400 font-semibold">{lang === 'sw' ? 'Shake Off Inahitajika' : 'Shake Off Boxes'}</div>
            <div className="text-xs font-black text-white">{maintenance.shakeOffBoxesNeeded} boxes</div>
          </div>
        </div>
      </div>

      {/* ── SECTION C: ACTION DEBT REMINDERS ── */}
      {debtorSales.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300 font-extrabold text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {lang === 'sw'
                  ? `🚨 Madeni Yanayohitaji Kufuatiliwa (Wateja ${debtorSales.length} • TZS ${pendingDebtsTotal.toLocaleString()})`
                  : `🚨 Action Required: Debts (${debtorSales.length} clients • TZS ${pendingDebtsTotal.toLocaleString()})`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {debtorSales.slice(0, 2).map((sale) => (
              <div
                key={sale.id}
                className="bg-stone-900/90 p-2.5 rounded-xl border border-amber-500/30 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="font-extrabold text-xs text-white truncate">{sale.customerName}</div>
                  <div className="text-[10px] text-amber-300 font-bold">
                    Salio: TZS {sale.balanceDue?.toLocaleString()} ({sale.productName})
                  </div>
                </div>
                <button
                  onClick={() => handleSendDebtReminder(sale)}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-stone-950 rounded-lg text-[10px] font-black flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                >
                  <Phone className="w-3 h-3" />
                  <span>Kumbusho</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SECTION D: LIVE SALES LEDGER PANEL ── */}
      <div className="bg-stone-900/90 rounded-3xl p-4 sm:p-6 border border-stone-800 text-stone-100 shadow-sm">
        <FieldLedgerPanel
          onOpenSaleForm={() => setShowSaleModal(true)}
          lang={lang}
        />
      </div>

      {/* Sale Modal */}
      {showSaleModal && (
        <LogOfflineSaleModal
          isOpen={showSaleModal}
          onClose={() => setShowSaleModal(false)}
        />
      )}
    </div>
  );
}
