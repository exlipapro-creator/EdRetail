import React, { useState } from 'react';
import {
  TrendingUp,
  Package,
  Plus,
  Search,
  Check,
  X,
  Clock,
  DollarSign,
  Receipt,
  MessageSquare,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Award,
  RotateCcw,
} from 'lucide-react';
import { useDistributorStore, OfflineSaleRecord } from '../../store/distributorStore';
import { PRODUCTS } from '../../types';
import { WHATSAPP_LINK, DISTRIBUTOR_PHONE, DISTRIBUTOR_NAME } from '../../utils/whatsappCompiler';

interface AdminDashboardPanelProps {
  onOpenSaleForm: () => void;
  onNavigateToTab: (tab: 'chat' | 'maintenance' | 'ledger' | 'dashboard') => void;
  lang: 'en' | 'sw';
}

export const AdminDashboardPanel: React.FC<AdminDashboardPanelProps> = ({
  onOpenSaleForm,
  onNavigateToTab,
  lang,
}) => {
  const getFinancialSummary = useDistributorStore((s) => s.getFinancialSummary);
  const getMaintenanceAnalysis = useDistributorStore((s) => s.getMaintenanceAnalysis);
  const productOverrides = useDistributorStore((s) => s.productOverrides);
  const toggleProductStock = useDistributorStore((s) => s.toggleProductStock);
  const toggleProductVisibility = useDistributorStore((s) => s.toggleProductVisibility);
  const updateProductPrice = useDistributorStore((s) => s.updateProductPrice);
  const resetProductOverrides = useDistributorStore((s) => s.resetProductOverrides);
  const sales = useDistributorStore((s) => s.sales);
  const markDebtPaid = useDistributorStore((s) => s.markDebtPaid);
  const deleteSale = useDistributorStore((s) => s.deleteSale);
  const updateRefillStatus = useDistributorStore((s) => s.updateRefillStatus);
  const distributor = useDistributorStore((s) => s.getActiveDistributor());

  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<'all' | 'p4-slimming' | 'health-wellness' | 'lifestyle-beverages'>('all');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [newPriceInput, setNewPriceInput] = useState('');
  const [payingSaleId, setPayingSaleId] = useState<string | null>(null);
  const [payAmountInput, setPayAmountInput] = useState('');
  const [activeSubSection, setActiveSubSection] = useState<'overview' | 'inventory' | 'sales' | 'refills'>('overview');
  const [selectedScriptType, setSelectedScriptType] = useState<'progress' | 'refill' | 'next_step'>('refill');

  const summary = getFinancialSummary(timeframe);
  const maintenance = getMaintenanceAnalysis();

  // Filter products for inventory manager
  const filteredProducts = PRODUCTS.filter((p) => {
    const matchesCat = productCategoryFilter === 'all' || p.category === productCategoryFilter;
    const matchesSearch =
      !productSearch.trim() ||
      p.name.en.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.name.sw.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(productSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSavePrice = (productId: string) => {
    const priceNum = parseInt(newPriceInput, 10);
    if (!isNaN(priceNum) && priceNum >= 1000) {
      updateProductPrice(productId, priceNum);
      setEditingPriceId(null);
      setNewPriceInput('');
    }
  };

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
    <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-stone-50 text-stone-900">
      {/* ── HEADER BANNER ── */}
      <div className="bg-[#0C271E] text-stone-100 rounded-3xl p-4 sm:p-5 border border-[#1A3D31] shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#C5A059] text-stone-950 font-extrabold text-[10px] rounded-md uppercase tracking-wider">
                Distributor Command Center
              </span>
              <span className="text-emerald-400 text-xs font-semibold">Live Real-time Sync</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white mt-1">
              {lang === 'sw' ? `Dashibodi ya ${distributor.name || 'Msambazaji'}` : `${distributor.name || 'Distributor'} Business Dashboard`}
            </h2>
            <p className="text-xs text-stone-300">
              {lang === 'sw'
                ? 'Usimamizi wa mauzo, stoo ya bidhaa, madeni ya wateja, na pointi za SV'
                : 'Manage live sales, product inventory toggles, debts, and SV fund points'}
            </p>
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSaleForm}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'sw' ? 'Rekodi Mauzo ya Mkononi' : 'Log Offline Sale'}</span>
            </button>
          </div>
        </div>

        {/* ── SECTION SELECTOR TABS ── */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#1A3D31] overflow-x-auto text-xs">
          <button
            onClick={() => setActiveSubSection('overview')}
            className={`px-3 py-1.5 rounded-xl font-extrabold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeSubSection === 'overview'
                ? 'bg-white text-stone-950 shadow-xs'
                : 'text-stone-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{lang === 'sw' ? 'Muhtasari wa Fedha & SV' : 'Metrics & Financials'}</span>
          </button>

          <button
            onClick={() => setActiveSubSection('inventory')}
            className={`px-3 py-1.5 rounded-xl font-extrabold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeSubSection === 'inventory'
                ? 'bg-white text-stone-950 shadow-xs'
                : 'text-stone-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>{lang === 'sw' ? 'Usimamizi wa Stoo (Inventory Toggle)' : 'Inventory & Stock Toggle'}</span>
          </button>

          <button
            onClick={() => setActiveSubSection('sales')}
            className={`px-3 py-1.5 rounded-xl font-extrabold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeSubSection === 'sales'
                ? 'bg-white text-stone-950 shadow-xs'
                : 'text-stone-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>{lang === 'sw' ? 'Mauzo & Risiti' : 'Sales Records'}</span>
          </button>

          <button
            onClick={() => setActiveSubSection('refills')}
            className={`px-3 py-1.5 rounded-xl font-extrabold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeSubSection === 'refills'
                ? 'bg-amber-400 text-stone-950 shadow-xs'
                : 'text-amber-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{lang === 'sw' ? '🚨 Arifa za Siku 10 & Refill CRM' : '🚨 Day-10 Refill CRM'}</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SUB-SECTION 1: FINANCIAL METRICS & SV PACING OVERVIEW
      ───────────────────────────────────────────────────────────── */}
      {activeSubSection === 'overview' && (
        <div className="space-y-4">
          {/* Timeframe Filter */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-600">
              {lang === 'sw' ? 'Kipindi cha Ripoti:' : 'Reporting Period:'}
            </span>
            <div className="flex items-center gap-1 bg-stone-200/70 p-1 rounded-xl text-xs">
              {(['today', 'week', 'month', 'all'] as const).map((tId) => {
                const labels: Record<string, { en: string; sw: string }> = {
                  today: { en: 'Today', sw: 'Leo' },
                  week: { en: 'This Week', sw: 'Wiki Hii' },
                  month: { en: 'This Month', sw: 'Mwezi Huu' },
                  all: { en: 'All Time', sw: 'Yote' },
                };
                return (
                  <button
                    key={tId}
                    onClick={() => setTimeframe(tId)}
                    className={`px-2.5 py-1 font-bold rounded-lg transition-all ${
                      timeframe === tId ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {labels[tId][lang]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4 Core Financial Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-stone-500">
                <span className="text-[11px] font-bold">{lang === 'sw' ? 'Jumla ya Mauzo' : 'Total Revenue'}</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-base sm:text-lg font-black text-stone-900">
                TZS {summary.totalRevenue.toLocaleString()}
              </div>
              <div className="text-[10px] text-stone-500">
                {summary.totalUnitsSold} {lang === 'sw' ? 'bidhaa zilizouzwa' : 'units sold'}
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-stone-500">
                <span className="text-[11px] font-bold">{lang === 'sw' ? 'Cash Mkononi' : 'Cash Collected'}</span>
                <Check className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="text-base sm:text-lg font-black text-emerald-800">
                TZS {summary.cashCollected.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-700 font-semibold">
                {summary.totalRevenue > 0
                  ? `${Math.round((summary.cashCollected / summary.totalRevenue) * 100)}% ya mauzo`
                  : '100%'}
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-stone-500">
                <span className="text-[11px] font-bold">{lang === 'sw' ? 'Madeni ya Wateja' : 'Credit / Debts'}</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-base sm:text-lg font-black text-amber-800">
                TZS {summary.creditOutstanding.toLocaleString()}
              </div>
              <div className="text-[10px] text-amber-700 font-semibold">
                {sales.filter((s) => s.balanceDue > 0).length} {lang === 'sw' ? 'wateja wanadaiwa' : 'active debtors'}
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-stone-500">
                <span className="text-[11px] font-bold">{lang === 'sw' ? 'Faida Halisi (Net)' : 'Est. Net Profit'}</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-base sm:text-lg font-black text-stone-900">
                TZS {summary.estimatedNetProfit.toLocaleString()}
              </div>
              <div className="text-[10px] text-stone-500">
                {lang === 'sw' ? 'Baada ya bei ya jumla' : 'After wholesale cost'}
              </div>
            </div>
          </div>

          {/* ── 3-MONTH CHALLENGE LIVE SV GAUGE ── */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center">
                    <Award className="w-3.5 h-3.5" />
                  </span>
                  <h3 className="font-extrabold text-sm text-stone-900">
                    {lang === 'sw'
                      ? `Lengo la Mwezi: ${maintenance.fundName} (2,000 SV Challenge)`
                      : `Month Goal: ${maintenance.fundName} (2,000 SV Challenge)`}
                  </h3>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  {lang === 'sw'
                    ? `Mwezi wa ${maintenance.currentMonthIndex} kati ya 3 mfululizo • Zimebaki siku ${maintenance.daysRemaining}`
                    : `Month ${maintenance.currentMonthIndex} of 3 consecutive • ${maintenance.daysRemaining} days remaining`}
                </p>
              </div>

              <button
                onClick={() => onNavigateToTab('maintenance')}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl flex items-center gap-1 self-start sm:self-auto transition-colors"
              >
                <span>{lang === 'sw' ? 'Fungua Tracker Kamili' : 'Open Full Tracker'}</span>
              </button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-black">
                <span className="text-stone-900">
                  {maintenance.totalSv.toLocaleString()} / {maintenance.targetSv.toLocaleString()} SV
                </span>
                <span className="text-emerald-800 font-extrabold">{maintenance.percentComplete}%</span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                <div
                  className="h-full bg-emerald-700 rounded-full transition-all duration-500"
                  style={{ width: `${maintenance.percentComplete}%` }}
                />
              </div>
            </div>

            {/* Pacing Breakdown Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100 text-center">
                <div className="text-[10px] text-stone-500 font-semibold">{lang === 'sw' ? 'Alama Zilizobaki' : 'SV Point Gap'}</div>
                <div className="text-xs font-black text-amber-900">{maintenance.gapSv.toLocaleString()} SV</div>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100 text-center">
                <div className="text-[10px] text-stone-500 font-semibold">{lang === 'sw' ? 'Lengo kwa Siku' : 'Daily Run Rate'}</div>
                <div className="text-xs font-black text-stone-900">{maintenance.dailyPacingSv} SV / siku</div>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100 text-center">
                <div className="text-[10px] text-stone-500 font-semibold">{lang === 'sw' ? 'Pakiti za P4 Zilizobaki' : 'P4 Bundles to Goal'}</div>
                <div className="text-xs font-black text-emerald-800">{maintenance.p4KitsNeeded} bundles</div>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100 text-center">
                <div className="text-[10px] text-stone-500 font-semibold">{lang === 'sw' ? 'Shake Off Zilizobaki' : 'Shake Off Boxes'}</div>
                <div className="text-xs font-black text-stone-900">{maintenance.shakeOffBoxesNeeded} boxes</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SUB-SECTION 2: PRODUCT INVENTORY & STOCK TOGGLE MANAGER
      ───────────────────────────────────────────────────────────── */}
      {activeSubSection === 'inventory' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-700" />
                  <span>{lang === 'sw' ? 'Kidhibiti cha Stoo ya Bidhaa (Live Inventory)' : 'Live Product Inventory Controller'}</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {lang === 'sw'
                    ? 'Badilisha hali ya mzigo (In Stock / Out of Stock) au badilisha bei dukani papo hapo.'
                    : 'Toggle in-stock status or update catalog retail prices instantly.'}
                </p>
              </div>

              {Object.keys(productOverrides).length > 0 && (
                <button
                  onClick={() => resetProductOverrides()}
                  className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{lang === 'sw' ? 'Rejesha Bei za Awali' : 'Reset Overrides'}</span>
                </button>
              )}
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder={lang === 'sw' ? 'Tafuta bidhaa (Shake Off, Splina, Troika...)' : 'Search products...'}
                  className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                />
              </div>

              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl overflow-x-auto text-xs">
                <button
                  onClick={() => setProductCategoryFilter('all')}
                  className={`px-2.5 py-1 font-bold rounded-lg whitespace-nowrap transition-all ${
                    productCategoryFilter === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
                  }`}
                >
                  {lang === 'sw' ? 'Zote' : 'All'}
                </button>
                <button
                  onClick={() => setProductCategoryFilter('p4-slimming')}
                  className={`px-2.5 py-1 font-bold rounded-lg whitespace-nowrap transition-all ${
                    productCategoryFilter === 'p4-slimming' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
                  }`}
                >
                  P4 Slimming
                </button>
                <button
                  onClick={() => setProductCategoryFilter('health-wellness')}
                  className={`px-2.5 py-1 font-bold rounded-lg whitespace-nowrap transition-all ${
                    productCategoryFilter === 'health-wellness' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
                  }`}
                >
                  {lang === 'sw' ? 'Afya' : 'Wellness'}
                </button>
                <button
                  onClick={() => setProductCategoryFilter('lifestyle-beverages')}
                  className={`px-2.5 py-1 font-bold rounded-lg whitespace-nowrap transition-all ${
                    productCategoryFilter === 'lifestyle-beverages' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
                  }`}
                >
                  {lang === 'sw' ? 'Vinywaji' : 'Beverages'}
                </button>
              </div>
            </div>

            {/* Products Inventory List */}
            <div className="divide-y divide-stone-100">
              {filteredProducts.map((prod) => {
                const override = productOverrides[prod.id];
                const currentPrice = override?.price !== undefined ? override.price : prod.price;
                const isInStock = override?.inStock !== undefined ? override.inStock : prod.inStock;
                const isHidden = override?.hidden || false;
                const isEditingPrice = editingPriceId === prod.id;

                return (
                  <div
                    key={prod.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/80 rounded-xl px-2 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                        <img
                          src={prod.image}
                          alt={prod.name.en}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-xs text-stone-900">{prod.name.sw}</h4>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                              isInStock
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-red-100 text-red-900'
                            }`}
                          >
                            {isInStock ? 'In Stock ✅' : 'Out of Stock ❌'}
                          </span>
                          {isHidden && (
                            <span className="px-1.5 py-0.5 bg-stone-200 text-stone-600 text-[10px] rounded font-bold">
                              Hidden
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-2">
                          <span>{prod.category}</span>
                          <span>•</span>
                          <span className="font-bold text-stone-900">
                            TZS {currentPrice.toLocaleString()}
                          </span>
                          {override?.price && override.price !== prod.price && (
                            <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 rounded">
                              (Original: TZS {prod.price.toLocaleString()})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Controls Row */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {/* Price Editor */}
                      {isEditingPrice ? (
                        <div className="flex items-center gap-1 bg-white p-1 border border-stone-300 rounded-xl shadow-xs">
                          <input
                            type="number"
                            value={newPriceInput}
                            onChange={(e) => setNewPriceInput(e.target.value)}
                            placeholder="Price TZS..."
                            className="w-24 px-2 py-1 text-xs font-bold border-none focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSavePrice(prod.id)}
                            className="p-1 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingPriceId(null)}
                            className="p-1 text-stone-400 hover:text-stone-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingPriceId(prod.id);
                            setNewPriceInput(String(currentPrice));
                          }}
                          className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
                          title="Badilisha Bei"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>{lang === 'sw' ? 'Badili Bei' : 'Price'}</span>
                        </button>
                      )}

                      {/* Stock Toggle Button */}
                      <button
                        onClick={() => toggleProductStock(prod.id, !isInStock)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${
                          isInStock
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-red-50 hover:bg-red-100 text-red-900 border border-red-300'
                        }`}
                      >
                        <span>{isInStock ? 'Ipo Stoo' : 'Imeisha'}</span>
                      </button>

                      {/* Visibility Toggle */}
                      <button
                        onClick={() => toggleProductVisibility(prod.id, !isHidden)}
                        className={`p-1.5 rounded-xl text-xs font-bold border transition-colors ${
                          isHidden
                            ? 'bg-stone-200 text-stone-600 border-stone-300'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                        title={isHidden ? 'Onesha Dukani' : 'Ficha Dukani'}
                      >
                        {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SUB-SECTION 3: OFFLINE SALES LOGS & DEBT COLLECTION
      ───────────────────────────────────────────────────────────── */}
      {activeSubSection === 'sales' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-700" />
              <span>{lang === 'sw' ? 'Daftari la Mauzo ya Mkononi' : 'Offline Sales Ledger'}</span>
            </h3>

            <button
              onClick={onOpenSaleForm}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'sw' ? 'Rekodi Mauzo Mapya' : 'Log Sale'}</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {sales.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 text-stone-500 space-y-2">
                <Receipt className="w-8 h-8 mx-auto text-stone-300" />
                <p className="text-xs font-bold">
                  {lang === 'sw' ? 'Hakuna rekodi ya mauzo iliyopo kwa sasa.' : 'No offline sales records logged yet.'}
                </p>
              </div>
            ) : (
              sales.map((sale) => {
                const hasDebt = sale.balanceDue > 0;
                const isPaying = payingSaleId === sale.id;

                return (
                  <div
                    key={sale.id}
                    className="bg-white rounded-2xl p-3.5 border border-stone-200 shadow-xs space-y-2.5 hover:border-stone-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-stone-900">{sale.customerName}</h4>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                              hasDebt ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {hasDebt ? `Anadaiwa TZS ${sale.balanceDue.toLocaleString()}` : 'Imelipwa Yote ✅'}
                          </span>
                        </div>

                        <div className="text-[11px] text-stone-500 mt-0.5">
                          {sale.productName} (x{sale.quantity}) • TZS {sale.totalAmount.toLocaleString()} • {sale.customerPhone || 'Bila Namba'}
                        </div>
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
                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => {
                                setPayingSaleId(sale.id);
                                setPayAmountInput(String(sale.balanceDue));
                              }}
                              className="px-2.5 py-1 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 rounded-lg text-[11px] font-bold shadow-2xs"
                            >
                              + Rekodi Malipo ya Deni
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
      )}

      {/* ─────────────────────────────────────────────────────────────
          SUB-SECTION 4: VIP AFTERCARE & DAY-10 REFILL AUTOMATION CRM
      ───────────────────────────────────────────────────────────── */}
      {activeSubSection === 'refills' && (
        <div className="space-y-4">
          {/* Header & Instructions */}
          <div className="p-4 bg-gradient-to-r from-emerald-950 to-stone-900 text-white rounded-3xl border border-emerald-800/60 shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-amber-400 text-stone-950 font-black text-[10px] rounded-md uppercase">
                {lang === 'sw' ? 'Mkakati wa Kudumu wa Mauzo' : 'Retention & Lifetime Value Engine'}
              </span>
              <span className="text-emerald-300 text-xs font-semibold">
                {lang === 'sw' ? 'Ufuatiliaji wa Kitaalamu' : 'Consultative Follow-up'}
              </span>
            </div>
            <h3 className="text-base font-bold text-white">
              {lang === 'sw'
                ? 'Arifa za Siku ya 10 & Ufuatiliaji wa Afya ya Mteja (Refill CRM)'
                : 'Day-10 Refill Alerts & Consultative Client Care'}
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              {lang === 'sw'
                ? 'Wateja wanaotumia Shake Off, MRT, au Splina hukaribia kumaliza dozi baada ya siku 10–14. Tumia ujumbe huu wa kirafiki (usio wa kusukuma) kuwajulia hali na kuwasaidia kuongeza mzigo mapema kabla dozi haijakatika.'
                : 'Follow up with clients around Day 10 in a caring, health-first manner to ensure consistent usage and effortless re-orders.'}
            </p>
          </div>

          {/* Script Template Selector */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <span className="text-xs font-bold text-stone-700 block">
              {lang === 'sw' ? 'Chagua Aina ya Ujumbe wa WhatsApp:' : 'Select Message Tone & Context:'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedScriptType('refill')}
                className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                  selectedScriptType === 'refill'
                    ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-900 shadow-2xs'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <div className="font-bold">🚨 {lang === 'sw' ? 'Siku ya 10: Mzigo Unakaribia' : 'Day 10: Refill Reminder'}</div>
                <div className="text-[10px] text-stone-500 mt-0.5">Zimebaki pakiti 2–3</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedScriptType('progress')}
                className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                  selectedScriptType === 'progress'
                    ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-900 shadow-2xs'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <div className="font-bold">🌱 {lang === 'sw' ? 'Siku ya 5: Kujulia Hali' : 'Day 5: Progress Check'}</div>
                <div className="text-[10px] text-stone-500 mt-0.5">Kufuatilia tumbo kuwa jepesi</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedScriptType('next_step')}
                className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                  selectedScriptType === 'next_step'
                    ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-900 shadow-2xs'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <div className="font-bold">✨ {lang === 'sw' ? 'Hatua ya Pili: P4 Slimming' : 'Phase 2: Slimming Next Step'}</div>
                <div className="text-[10px] text-stone-500 mt-0.5">Kutoka Shake Off kwenda MRT</div>
              </button>
            </div>
          </div>

          {/* Active Sales List with Follow-up Action */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              {lang === 'sw' ? 'Orodha ya Wateja Wanaohitaji Ufuatiliaji:' : 'Active Clients Follow-up Queue:'}
            </h4>

            {sales.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 text-xs">
                {lang === 'sw'
                  ? 'Bado haujarekodi mauzo ya mkononi. Rekodi mauzo ili mfumo upange tarehe za ufuatiliaji kiotomatiki.'
                  : 'No offline sales logged yet. Add sales to generate automated follow-up schedules.'}
              </div>
            ) : (
              sales.map((sale) => {
                const getMessageForSale = () => {
                  if (selectedScriptType === 'progress') {
                    return `Habari ${sale.customerName}! Ni ${distributor.name} kutoka Edmark. Nilikuwa nakusalimia na kufuatilia maendeleo ya afya yako baada ya kuanza kutumia ${sale.productName}. Je, tumbo limeanza kuwa jepesi au una swali lolote kuhusu unywaji?`;
                  }
                  if (selectedScriptType === 'next_step') {
                    return `Habari ${sale.customerName}! Hongera sana kwa kukamilisha hatua ya kwanza ya usafi na ${sale.productName}. Hatua inayofuata kwenye mfumo wa P4 ni MRT Complex ya kuchoma mafuta na Splina kusafisha damu. Ungependa nikuandalie kifurushi hiki kwa bei ya ofa?`;
                  }
                  // Default: Day 10 Refill
                  return `Habari ${sale.customerName}! Ni ${distributor.name}. Natumai unaendelea vizuri na unaona matokeo mazuri ya ${sale.productName}! Kulingana na ratiba yako, mzigo wako unakaribia kuisha (zimebaki sachet chache). Je, nikuwekee oda nyingine mapema ili usikatishe dozi yako na uendelee kuwa na matokeo mazuri?`;
                };

                const messageText = getMessageForSale();
                const cleanPhone = sale.customerPhone.replace(/^0/, '255');
                const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;

                return (
                  <div
                    key={sale.id}
                    className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-3 hover:border-emerald-300 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-stone-900 text-sm">{sale.customerName}</span>
                          <span className="text-[11px] text-stone-500">({sale.customerPhone})</span>
                        </div>
                        <p className="text-xs text-emerald-800 font-semibold mt-0.5">
                          📦 {sale.productName} (x{sale.quantity}) • Tarehe: {new Date(sale.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            sale.refillStatus === 'reordered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sale.refillStatus === 'followed_up'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {sale.refillStatus === 'reordered'
                            ? '✅ Ameongeza Oda'
                            : sale.refillStatus === 'followed_up'
                            ? '💬 Nimeshamjulia Hali'
                            : '⏰ Inasubiri Ufuatiliaji'}
                        </span>
                      </div>
                    </div>

                    {/* Pre-formatted Script Preview */}
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-xs text-stone-700 italic">
                      "{messageText}"
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateRefillStatus(sale.id, 'followed_up')}
                          className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-bold"
                        >
                          Weka "Nimeshamjulia Hali"
                        </button>
                        <button
                          type="button"
                          onClick={() => updateRefillStatus(sale.id, 'reordered')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold"
                        >
                          Weka "Ameongeza Oda"
                        </button>
                      </div>

                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-2xs transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Tuma WhatsApp Papo Hapo</span>
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
