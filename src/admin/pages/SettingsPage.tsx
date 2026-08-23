import React, { useState, useRef } from 'react';
import {
  Settings,
  Download,
  Upload,
  FileSpreadsheet,
  RotateCcw,
  Shield,
  Activity,
  Trash2,
  Search,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Plus,
  Save,
  Clock,
  Eye,
  MousePointerClick,
  Globe,
  DollarSign,
  Info,
} from 'lucide-react';
import { useDistributorStore } from '../../store/distributorStore';
import { SponsorAd, DatabaseBackupPayload, AdNetworkMode, AdPlacement } from '../../types';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'backups' | 'logs' | 'ads' | 'logistics'>('backups');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Store actions
  const exportFullBackup = useDistributorStore((s) => s.exportFullBackup);
  const importFullBackup = useDistributorStore((s) => s.importFullBackup);
  const resetMasterDatabaseToDefaults = useDistributorStore((s) => s.resetMasterDatabaseToDefaults);
  const sales = useDistributorStore((s) => s.sales);
  const auditLogs = useDistributorStore((s) => s.auditLogs);
  const clearAuditLogs = useDistributorStore((s) => s.clearAuditLogs);
  const addAuditLog = useDistributorStore((s) => s.addAuditLog);

  // Ads & Monetization state
  const monetizationConfig = useDistributorStore((s) => s.monetizationConfig);
  const nativeAdsEnabled = useDistributorStore((s) => s.nativeAdsEnabled);
  const toggleNativeAds = useDistributorStore((s) => s.toggleNativeAds);
  const updateMonetizationConfig = useDistributorStore((s) => s.updateMonetizationConfig);
  const updateAdSenseConfig = useDistributorStore((s) => s.updateAdSenseConfig);
  const sponsorAds = useDistributorStore((s) => s.sponsorAds);
  const updateSponsorAd = useDistributorStore((s) => s.updateSponsorAd);
  const addSponsorAd = useDistributorStore((s) => s.addSponsorAd);
  const deleteSponsorAd = useDistributorStore((s) => s.deleteSponsorAd);

  // Logistics state
  const platformSettings = useDistributorStore((s) => s.platformSettings);
  const updatePlatformSettings = useDistributorStore((s) => s.updatePlatformSettings);

  const [logSearch, setLogSearch] = useState('');
  const [logCategoryFilter, setLogCategoryFilter] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // AdSense Form Local State
  const [adsensePublisherId, setAdsensePublisherId] = useState(
    monetizationConfig?.adsense?.publisherId || 'ca-pub-9842103487129034'
  );
  const [adsenseTestMode, setAdsenseTestMode] = useState(
    monetizationConfig?.adsense?.testMode ?? true
  );
  const [adsenseAutoAds, setAdsenseAutoAds] = useState(
    monetizationConfig?.adsense?.autoAdsEnabled ?? false
  );
  const [slotStorefront, setSlotStorefront] = useState(
    monetizationConfig?.adsense?.slotIds?.storefront_hero || '7840192831'
  );
  const [slotCatalog, setSlotCatalog] = useState(
    monetizationConfig?.adsense?.slotIds?.products_banner || '6592810342'
  );
  const [slotModal, setSlotModal] = useState(
    monetizationConfig?.adsense?.slotIds?.product_detail_modal || '3482019482'
  );
  const [slotCheckout, setSlotCheckout] = useState(
    monetizationConfig?.adsense?.slotIds?.checkout_footer || '8920193847'
  );

  // New Ad Modal State
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<SponsorAd | null>(null);
  const [adFormTitleEn, setAdFormTitleEn] = useState('');
  const [adFormTitleSw, setAdFormTitleSw] = useState('');
  const [adFormTaglineEn, setAdFormTaglineEn] = useState('');
  const [adFormTaglineSw, setAdFormTaglineSw] = useState('');
  const [adFormSponsor, setAdFormSponsor] = useState('');
  const [adFormBadge, setAdFormBadge] = useState('MFADHILI WA AFYA / SPONSORED');
  const [adFormImage, setAdFormImage] = useState('');
  const [adFormTarget, setAdFormTarget] = useState('');
  const [adFormPlacement, setAdFormPlacement] = useState<AdPlacement>('storefront_hero');
  const [adFormMonthlyFee, setAdFormMonthlyFee] = useState<number>(50000);
  const [adFormContactPhone, setAdFormContactPhone] = useState('+255 783 481 416');

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // 1. Export Full Database JSON
  const handleExportBackup = () => {
    try {
      const backup = exportFullBackup();
      const jsonStr = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `edretail-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('success', 'Full database JSON backup downloaded successfully!');
    } catch (err) {
      showToast('error', 'Failed to generate backup.');
    }
  };

  // 2. Restore Database from JSON
  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content) as DatabaseBackupPayload;
        const res = importFullBackup(parsed);
        if (res.success) {
          showToast('success', 'Database restored successfully!');
        } else {
          showToast('error', res.message);
        }
      } catch (err) {
        showToast('error', 'Invalid JSON backup file structure.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 3. Export Sales Ledger CSV
  const handleExportSalesCsv = () => {
    try {
      const headers = [
        'Sale ID',
        'Date',
        'Customer Name',
        'Phone',
        'Location',
        'Product Name',
        'Quantity',
        'Unit Price (TZS)',
        'Total Amount (TZS)',
        'Amount Paid (TZS)',
        'Balance Due (TZS)',
        'Payment Status',
        'Payment Method',
        'Notes',
      ];

      const rows = sales.map((s) => [
        s.id,
        s.createdAt.split('T')[0],
        `"${s.customerName.replace(/"/g, '""')}"`,
        s.customerPhone,
        `"${s.customerLocation.replace(/"/g, '""')}"`,
        `"${s.productName.replace(/"/g, '""')}"`,
        s.quantity,
        s.unitPrice,
        s.totalAmount,
        s.amountPaid,
        s.balanceDue,
        s.status,
        s.paymentType,
        `"${(s.notes || '').replace(/"/g, '""')}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `edretail-sales-ledger-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addAuditLog({
        action: 'Ripoti ya Mauzo Imepakuliwa (Sales CSV Export)',
        category: 'backup_export',
        details: `Ripoti ya mauzo ${sales.length} imepakuliwa kama CSV spreadsheet.`,
        user: 'Super Admin',
      });

      showToast('success', `Exported ${sales.length} sales records to CSV.`);
    } catch (err) {
      showToast('error', 'Failed to export sales CSV.');
    }
  };

  // Save AdSense Settings
  const handleSaveAdSenseSettings = () => {
    updateAdSenseConfig({
      publisherId: adsensePublisherId.trim(),
      testMode: adsenseTestMode,
      autoAdsEnabled: adsenseAutoAds,
      slotIds: {
        storefront_hero: slotStorefront.trim(),
        products_banner: slotCatalog.trim(),
        product_detail_modal: slotModal.trim(),
        checkout_footer: slotCheckout.trim(),
      },
    });

    addAuditLog({
      action: 'AdSense Configuration Updated',
      category: 'ad_management',
      details: `Google AdSense client set to ${adsensePublisherId.trim()} (Test mode: ${adsenseTestMode ? 'Active' : 'Live'}).`,
      user: 'Super Admin',
    });

    showToast('success', 'Google AdSense settings saved.');
  };

  // Filtered Audit Logs
  const filteredLogs = (auditLogs || []).filter((log) => {
    const matchesCat = logCategoryFilter === 'all' || log.category === logCategoryFilter;
    const matchesSearch =
      !logSearch.trim() ||
      log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.user.toLowerCase().includes(logSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenAdModal = (ad?: SponsorAd) => {
    if (ad) {
      setEditingAd(ad);
      setAdFormTitleEn(typeof ad.title === 'string' ? ad.title : ad.title.en);
      setAdFormTitleSw(typeof ad.title === 'string' ? ad.title : ad.title.sw || '');
      setAdFormTaglineEn(typeof ad.tagline === 'string' ? ad.tagline : ad.tagline.en);
      setAdFormTaglineSw(typeof ad.tagline === 'string' ? ad.tagline : ad.tagline.sw || '');
      setAdFormSponsor(ad.sponsorName);
      setAdFormBadge(ad.badgeText || 'MFADHILI WA AFYA / SPONSORED');
      setAdFormImage(ad.bannerImage);
      setAdFormTarget(ad.targetUrl);
      setAdFormPlacement(ad.placement);
      setAdFormMonthlyFee(ad.monthlyFee || 50000);
      setAdFormContactPhone(ad.contactPhone || '+255 783 481 416');
    } else {
      setEditingAd(null);
      setAdFormTitleEn('');
      setAdFormTitleSw('');
      setAdFormTaglineEn('');
      setAdFormTaglineSw('');
      setAdFormSponsor('');
      setAdFormBadge('MFADHILI WA AFYA / SPONSORED');
      setAdFormImage('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80');
      setAdFormTarget('https://wa.me/255783481416?text=Habari!%20Nimetoka%20ED%20Retail.');
      setAdFormPlacement('storefront_hero');
      setAdFormMonthlyFee(50000);
      setAdFormContactPhone('+255 783 481 416');
    }
    setIsAdModalOpen(true);
  };

  const handleSaveAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adFormTitleEn || !adFormSponsor || !adFormTarget) {
      showToast('error', 'Please fill in all required fields.');
      return;
    }

    const payload = {
      title: { en: adFormTitleEn, sw: adFormTitleSw || adFormTitleEn },
      tagline: { en: adFormTaglineEn, sw: adFormTaglineSw || adFormTaglineEn },
      sponsorName: adFormSponsor,
      badgeText: adFormBadge,
      bannerImage: adFormImage,
      ctaText: { en: 'View Offer', sw: 'Pata Ofa Hii' },
      targetUrl: adFormTarget,
      placement: adFormPlacement,
      enabled: true,
      monthlyFee: Number(adFormMonthlyFee) || 0,
      contactPhone: adFormContactPhone,
      expiryDate: '2026-12-31',
    };

    if (editingAd) {
      updateSponsorAd(editingAd.id, payload);
      addAuditLog({
        action: 'Sponsor Ad Updated',
        category: 'ad_management',
        details: `Sponsor slot "${adFormSponsor}" (${adFormPlacement}) updated.`,
        user: 'Super Admin',
      });
      showToast('success', 'Sponsor ad updated.');
    } else {
      addSponsorAd(payload);
      addAuditLog({
        action: 'New Sponsor Slot Created',
        category: 'ad_management',
        details: `New partner ad created for "${adFormSponsor}" on ${adFormPlacement}.`,
        user: 'Super Admin',
      });
      showToast('success', 'New sponsor ad created.');
    }
    setIsAdModalOpen(false);
  };

  // Aggregate metrics
  const totalPartnerSlotsCount = sponsorAds.length;
  const activePartnerSlotsCount = sponsorAds.filter((a) => a.enabled).length;
  const totalAdViews = sponsorAds.reduce((acc, a) => acc + (a.impressions || 0), 0);
  const totalAdClicks = sponsorAds.reduce((acc, a) => acc + (a.clicks || 0), 0);
  const totalMonthlyContractRevenue = sponsorAds
    .filter((a) => a.enabled)
    .reduce((acc, a) => acc + (a.monthlyFee || 0), 0);
  const averageCtr = totalAdViews > 0 ? ((totalAdClicks / totalAdViews) * 100).toFixed(1) : '0.0';
  const currentMode: AdNetworkMode = monetizationConfig?.mode || 'hybrid';

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto animate-fadeIn text-stone-100">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-indigo-400" />
            <span>Admin Settings, Backups & Audit Logs</span>
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Advanced system controls: Master database backups, activity audit logs, native ad monetization & logistics.
          </p>
        </div>

        {/* Global Toast Notification */}
        {notification && (
          <div
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg transition-all animate-fadeIn ${
              notification.type === 'success'
                ? 'bg-emerald-500 text-stone-950'
                : 'bg-red-500 text-white'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{notification.message}</span>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 bg-stone-900/90 p-1.5 rounded-2xl border border-stone-800 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('backups')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'backups'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Database Backups & Export</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'logs'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>System Audit Logs ({auditLogs?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('ads')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'ads'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Native Ads (Passive Income)</span>
        </button>

        <button
          onClick={() => setActiveTab('logistics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'logistics'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Platform & Logistics</span>
        </button>
      </div>

      {/* ── TAB 1: DATABASE BACKUPS & RESTORE ── */}
      {activeTab === 'backups' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Export Full JSON Backup Card */}
            <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-white">Full JSON Database Backup</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Downloads an exact snapshot of the entire application state: Catalog products, overrides, distributor registry, all sales records, debt tracker, tasks, settings, and logs.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleExportBackup}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Full Backup (.json)</span>
                </button>
              </div>
            </div>

            {/* Restore JSON Backup Card */}
            <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-white">Restore Database Snapshot</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Upload a previously downloaded JSON backup file to instantly restore all products, sales history, customer records, and settings.
                </p>
              </div>

              <div className="pt-2">
                <label className="w-full py-3 bg-stone-950 hover:bg-stone-800 text-stone-200 border border-stone-700 text-xs font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>Select Backup File to Restore</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileRestore}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Export Sales Ledger Spreadsheet */}
            <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-white">Export Sales Ledger (CSV)</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Export all {sales.length} sales and customer orders into Excel/CSV format with exact columns for customer name, phone, product, cash collected, and balance due.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleExportSalesCsv}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-stone-950 text-xs font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Download Sales Spreadsheet (.csv)</span>
                </button>
              </div>
            </div>

            {/* Catalog Defaults Reset */}
            <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-white">Reset Catalog Overrides</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Reverts custom product retail price modifications back to standard factory prices. Sales records and distributor debts are completely preserved.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to reset all catalog price overrides? Sales records will NOT be deleted.')) {
                      resetMasterDatabaseToDefaults();
                      showToast('success', 'Catalog overrides restored to defaults.');
                    }
                  }}
                  className="w-full py-3 bg-stone-950 hover:bg-amber-950/60 text-amber-300 border border-amber-500/40 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Price Overrides Only</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: SYSTEM AUDIT & ACTIVITY LOGS ── */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-stone-900/90 p-4 rounded-2xl border border-stone-800">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Search audit logs by action, details, user..."
                className="w-full pl-9 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={logCategoryFilter}
                onChange={(e) => setLogCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 focus:outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="price_change">Price Changes</option>
                <option value="product_management">Product Management</option>
                <option value="stock_toggle">Stock Toggles</option>
                <option value="sale_logged">Sales Entries</option>
                <option value="backup_export">Backup Operations</option>
                <option value="backup_restore">Restorations</option>
              </select>

              {auditLogs.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Clear all audit logs?')) {
                      clearAuditLogs();
                      showToast('success', 'Audit logs cleared.');
                    }
                  }}
                  className="px-3 py-2 bg-stone-950 hover:bg-red-950/60 text-stone-400 hover:text-red-300 border border-stone-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Logs</span>
                </button>
              )}
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-stone-950 text-stone-400 uppercase font-black tracking-wider text-[10px] border-b border-stone-800">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Action</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Details</th>
                    <th className="p-3.5">Initiator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-stone-500">
                        No activity records matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-stone-950/40 transition-colors">
                        <td className="p-3.5 whitespace-nowrap text-stone-400 font-mono text-[11px]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-stone-500" />
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-white whitespace-nowrap">
                          {log.action}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-stone-950 border border-stone-800 text-stone-300">
                            {log.category.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3.5 text-stone-300 max-w-md">
                          {log.details}
                        </td>
                        <td className="p-3.5 whitespace-nowrap text-stone-400 font-medium">
                          {log.user}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: NATIVE ADS & PASSIVE INCOME MONETIZATION ── */}
      {activeTab === 'ads' && (
        <div className="space-y-6">
          {/* Master Ad Monetization Banner */}
          <div className="bg-linear-to-r from-amber-950/40 via-stone-900 to-stone-950 p-5 sm:p-6 rounded-3xl border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h3 className="text-base font-black text-white">Native Ad Spaces & Multi-Channel Monetization</h3>
              </div>
              <p className="text-xs text-stone-400 max-w-2xl leading-relaxed">
                Empower your store network with passive revenue. Super Admin controls allow you to switch seamlessly between direct local partner placements (gyms, wellness spas, nutritionists) and programmatic Google AdSense banner networks.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto shrink-0 flex-wrap">
              <button
                onClick={() => {
                  const nextState = !nativeAdsEnabled;
                  toggleNativeAds(nextState);
                  updateMonetizationConfig({ enabled: nextState });
                  addAuditLog({
                    action: nextState ? 'Monetization Enabled' : 'Monetization Disabled',
                    category: 'ad_management',
                    details: `Master ad toggle turned ${nextState ? 'ON' : 'OFF'}.`,
                    user: 'Super Admin',
                  });
                  showToast('success', nextState ? 'Native ad system enabled.' : 'Native ad system paused.');
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  nativeAdsEnabled
                    ? 'bg-amber-400 text-stone-950 shadow-md shadow-amber-400/20'
                    : 'bg-stone-800 text-stone-400 border border-stone-700'
                }`}
              >
                {nativeAdsEnabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                <span>{nativeAdsEnabled ? 'Monetization Active' : 'Monetization Off'}</span>
              </button>

              <button
                onClick={() => handleOpenAdModal()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-98"
              >
                <Plus className="w-4 h-4" />
                <span>Add Partner Slot</span>
              </button>
            </div>
          </div>

          {/* Revenue & Performance Overview Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Direct Contract Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xl font-black text-emerald-400">
                TZS {totalMonthlyContractRevenue.toLocaleString()}
              </p>
              <p className="text-[10px] text-stone-500 font-medium">Monthly recurring partner retainers</p>
            </div>

            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Active Ad Slots</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-xl font-black text-white">
                {activePartnerSlotsCount} <span className="text-xs text-stone-400 font-normal">/ {totalPartnerSlotsCount} total</span>
              </p>
              <p className="text-[10px] text-stone-500 font-medium">Booked direct sponsor spaces</p>
            </div>

            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Impressions</span>
                <Eye className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-xl font-black text-white">{totalAdViews.toLocaleString()}</p>
              <p className="text-[10px] text-stone-500 font-medium">Storefront & modal customer views</p>
            </div>

            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Clicks & CTR</span>
                <MousePointerClick className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-xl font-black text-amber-300">
                {totalAdClicks.toLocaleString()} <span className="text-xs text-stone-400 font-normal">({averageCtr}%)</span>
              </p>
              <p className="text-[10px] text-stone-500 font-medium">Customer leads directed to sponsors</p>
            </div>
          </div>

          {/* Monetization Engine Mode Selection */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div>
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                <span>Monetization Delivery Mode</span>
              </h4>
              <p className="text-xs text-stone-400 mt-0.5">
                Select how ads are served across the store experience:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Option 1: Hybrid Mode */}
              <button
                type="button"
                onClick={() => {
                  updateMonetizationConfig({ mode: 'hybrid' });
                  showToast('success', 'Monetization mode set to Hybrid Waterfall.');
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  currentMode === 'hybrid'
                    ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-lg ring-1 ring-indigo-500/50'
                    : 'bg-stone-950/60 border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-indigo-300">⭐ Hybrid Waterfall</span>
                    {currentMode === 'hybrid' && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-indigo-500 text-white">Active</span>
                    )}
                  </div>
                  <h5 className="text-sm font-black text-white mt-1.5">Direct Ads + AdSense Fallback</h5>
                  <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                    Prioritizes your high-paying local direct sponsor bookings. If any slot is unbooked or paused, it automatically fills the gap with Google AdSense.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-stone-800/80 text-[10px] font-bold text-emerald-400">
                  Recommended for maximum income
                </div>
              </button>

              {/* Option 2: Custom Sponsor Slots Only */}
              <button
                type="button"
                onClick={() => {
                  updateMonetizationConfig({ mode: 'custom_sponsors_only' });
                  showToast('success', 'Monetization mode set to Direct Sponsor Slots Only.');
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  currentMode === 'custom_sponsors_only'
                    ? 'bg-amber-950/40 border-amber-500 text-white shadow-lg ring-1 ring-amber-500/50'
                    : 'bg-stone-950/60 border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-300">🤝 Direct Partners Only</span>
                    {currentMode === 'custom_sponsors_only' && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500 text-stone-950">Active</span>
                    )}
                  </div>
                  <h5 className="text-sm font-black text-white mt-1.5">Exclusive Local Sponsors</h5>
                  <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                    Exclusively renders manually created sponsor banners (e.g. gym passes, spa discounts, couriers). No third-party network ads.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-stone-800/80 text-[10px] font-bold text-amber-300">
                  100% control over advertiser brands
                </div>
              </button>

              {/* Option 3: AdSense Only */}
              <button
                type="button"
                onClick={() => {
                  updateMonetizationConfig({ mode: 'adsense_only' });
                  showToast('success', 'Monetization mode set to Google AdSense Only.');
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  currentMode === 'adsense_only'
                    ? 'bg-blue-950/40 border-blue-500 text-white shadow-lg ring-1 ring-blue-500/50'
                    : 'bg-stone-950/60 border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-blue-300">🌐 Google AdSense Only</span>
                    {currentMode === 'adsense_only' && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-blue-500 text-white">Active</span>
                    )}
                  </div>
                  <h5 className="text-sm font-black text-white mt-1.5">Pure Programmatic Network</h5>
                  <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                    Uses Google AdSense client tags across all ad slots. Completely automated monetization with no need to manage local advertisers.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-stone-800/80 text-[10px] font-bold text-blue-400">
                  Zero management effort
                </div>
              </button>
            </div>
          </div>

          {/* Google AdSense Configuration Panel */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
              <div>
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span>Google AdSense Integration Settings</span>
                </h4>
                <p className="text-xs text-stone-400 mt-0.5">
                  Configure your Google AdSense Publisher Client ID and individual responsive ad unit slot codes.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-stone-300 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adsenseTestMode}
                    onChange={(e) => setAdsenseTestMode(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 bg-stone-950 border-stone-700"
                  />
                  <span>Test Ad Mode (Mock / Sandbox)</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  AdSense Publisher ID (Client ID) *
                </label>
                <input
                  type="text"
                  value={adsensePublisherId}
                  onChange={(e) => setAdsensePublisherId(e.target.value)}
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[10px] text-stone-500 mt-1">
                  Found in your Google AdSense account &gt; Account Information &gt; Publisher ID.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Auto-Ads Network Injection
                </label>
                <div className="flex items-center justify-between px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-xl">
                  <span className="text-xs text-stone-300">Enable Google Page-Level Auto Ads</span>
                  <button
                    type="button"
                    onClick={() => setAdsenseAutoAds(!adsenseAutoAds)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-colors ${
                      adsenseAutoAds ? 'bg-indigo-600 text-white' : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    {adsenseAutoAds ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                <p className="text-[10px] text-stone-500 mt-1">
                  Lets Google automatically place ads in optimal positions on your store pages.
                </p>
              </div>
            </div>

            {/* Slot ID Mapping */}
            <div className="space-y-3 pt-2">
              <h5 className="text-xs font-black uppercase text-stone-400 tracking-wider">
                Ad Unit Slot ID Mapping (Per Placement)
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-300 mb-1">
                    Storefront Hero Slot ID
                  </label>
                  <input
                    type="text"
                    value={slotStorefront}
                    onChange={(e) => setSlotStorefront(e.target.value)}
                    placeholder="7840192831"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-300 mb-1">
                    Catalog Banner Slot ID
                  </label>
                  <input
                    type="text"
                    value={slotCatalog}
                    onChange={(e) => setSlotCatalog(e.target.value)}
                    placeholder="6592810342"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-300 mb-1">
                    Detail Modal Slot ID
                  </label>
                  <input
                    type="text"
                    value={slotModal}
                    onChange={(e) => setSlotModal(e.target.value)}
                    placeholder="3482019482"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-300 mb-1">
                    Checkout Footer Slot ID
                  </label>
                  <input
                    type="text"
                    value={slotCheckout}
                    onChange={(e) => setSlotCheckout(e.target.value)}
                    placeholder="8920193847"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-800">
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <Info className="w-4 h-4 text-indigo-400" />
                <span>Script automatically mounts `adsbygoogle.js` with responsive client parameters.</span>
              </div>

              <button
                type="button"
                onClick={handleSaveAdSenseSettings}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-98"
              >
                <Save className="w-4 h-4" />
                <span>Save AdSense Settings</span>
              </button>
            </div>
          </div>

          {/* Active Direct Sponsor Ads List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-black text-white">Direct Local Partner Slots ({sponsorAds.length})</h4>
                <p className="text-xs text-stone-400">
                  Manage individual local brand placements, monthly retainer agreements, and contact details.
                </p>
              </div>

              <button
                onClick={() => handleOpenAdModal()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Partner Spot</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {sponsorAds.map((ad) => (
                <div
                  key={ad.id}
                  className="bg-stone-900/90 border border-stone-800 rounded-3xl p-5 space-y-4 shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {ad.bannerImage && (
                          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-stone-700 bg-stone-950 shrink-0">
                            <img src={ad.bannerImage} alt={ad.sponsorName} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
                              {ad.placement.replace('_', ' ')}
                            </span>
                            {ad.monthlyFee && ad.monthlyFee > 0 && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                                TZS {ad.monthlyFee.toLocaleString()}/mo
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-black text-white mt-1">
                            {typeof ad.title === 'string' ? ad.title : ad.title.en}
                          </h4>
                          <span className="text-xs text-stone-400 font-semibold">{ad.sponsorName}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const nextState = !ad.enabled;
                          updateSponsorAd(ad.id, { enabled: nextState });
                          showToast('success', `Ad ${nextState ? 'activated' : 'paused'}.`);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-colors cursor-pointer ${
                          ad.enabled
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                            : 'bg-stone-800 text-stone-500 border border-stone-700'
                        }`}
                      >
                        {ad.enabled ? 'Active' : 'Paused'}
                      </button>
                    </div>

                    <p className="text-xs text-stone-300 leading-relaxed">
                      {typeof ad.tagline === 'string' ? ad.tagline : ad.tagline.en}
                    </p>

                    {ad.contactPhone && (
                      <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
                        <span className="text-stone-500">Contact / WhatsApp:</span>
                        <span className="text-indigo-300 font-mono">{ad.contactPhone}</span>
                      </div>
                    )}
                  </div>

                  {/* Performance Analytics Bar */}
                  <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5 text-stone-400">
                        <Eye className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{ad.impressions || 0} views</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-400">
                        <MousePointerClick className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{ad.clicks || 0} clicks</span>
                      </div>
                      <div className="text-[11px] text-amber-300 font-bold">
                        CTR: {ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : 0}%
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenAdModal(ad)}
                        className="px-2.5 py-1 bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this sponsor ad?')) {
                            deleteSponsorAd(ad.id);
                            showToast('success', 'Ad deleted.');
                          }
                        }}
                        className="p-1.5 bg-stone-950 hover:bg-red-950/60 text-stone-400 hover:text-red-400 border border-stone-800 rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: PLATFORM & LOGISTICS ── */}
      {activeTab === 'logistics' && (
        <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-sm max-w-2xl">
          <h3 className="text-base font-black text-white">Platform Logistics & Rates</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">
                Dar es Salaam Express Courier (TZS)
              </label>
              <input
                type="number"
                value={platformSettings.darExpressFee}
                onChange={(e) => updatePlatformSettings({ darExpressFee: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">
                Upcountry Bus Parcel Fee (TZS)
              </label>
              <input
                type="number"
                value={platformSettings.upcountryBusFee}
                onChange={(e) => updatePlatformSettings({ upcountryBusFee: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">
                Zanzibar Ferry Courier Fee (TZS)
              </label>
              <input
                type="number"
                value={platformSettings.zanzibarFerryFee}
                onChange={(e) => updatePlatformSettings({ zanzibarFerryFee: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">
                National Commission Rate (%)
              </label>
              <input
                type="number"
                value={platformSettings.nationalCommission}
                onChange={(e) => updatePlatformSettings({ nationalCommission: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Emergency Contact & Escalations
            </label>
            <input
              type="text"
              value={platformSettings.emergencyPhone}
              onChange={(e) => updatePlatformSettings({ emergencyPhone: e.target.value })}
              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={() => showToast('success', 'Platform settings saved successfully.')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      )}

      {/* ── CREATE / EDIT SPONSOR AD MODAL ── */}
      {isAdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-lg bg-stone-950 border border-stone-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl text-stone-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-black text-white">
              {editingAd ? 'Edit Partner Sponsor Space' : 'Create New Partner Sponsor Slot'}
            </h3>

            <form onSubmit={handleSaveAd} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Sponsor Business / Partner Name *
                </label>
                <input
                  type="text"
                  required
                  value={adFormSponsor}
                  onChange={(e) => setAdFormSponsor(e.target.value)}
                  placeholder="E.g. PowerGym Mlimani City, Afya Spa Dar"
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Title (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={adFormTitleEn}
                    onChange={(e) => setAdFormTitleEn(e.target.value)}
                    placeholder="E.g. Get 20% Gym Pass"
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Title (Kiswahili)
                  </label>
                  <input
                    type="text"
                    value={adFormTitleSw}
                    onChange={(e) => setAdFormTitleSw(e.target.value)}
                    placeholder="Mf: Pata Punguzo la 20%"
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Offer Tagline (English) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={adFormTaglineEn}
                    onChange={(e) => setAdFormTaglineEn(e.target.value)}
                    placeholder="E.g. Special fitness discount for Edmark detox clients."
                    className="w-full p-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Offer Tagline (Kiswahili)
                  </label>
                  <textarea
                    rows={2}
                    value={adFormTaglineSw}
                    onChange={(e) => setAdFormTaglineSw(e.target.value)}
                    placeholder="Mf: Punguzo maalum kwa wateja wa Edmark."
                    className="w-full p-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Placement Spot
                  </label>
                  <select
                    value={adFormPlacement}
                    onChange={(e) => setAdFormPlacement(e.target.value as AdPlacement)}
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="storefront_hero">Storefront Hero</option>
                    <option value="products_banner">Products Catalog Banner</option>
                    <option value="product_detail_modal">Product Detail Modal</option>
                    <option value="checkout_footer">Checkout Footer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Monthly Contract Fee (TZS)
                  </label>
                  <input
                    type="number"
                    value={adFormMonthlyFee}
                    onChange={(e) => setAdFormMonthlyFee(Number(e.target.value))}
                    placeholder="50000"
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Banner Image URL
                  </label>
                  <input
                    type="text"
                    value={adFormImage}
                    onChange={(e) => setAdFormImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Advertiser Contact Phone / WA
                  </label>
                  <input
                    type="text"
                    value={adFormContactPhone}
                    onChange={(e) => setAdFormContactPhone(e.target.value)}
                    placeholder="+255 783 481 416"
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Target WhatsApp Link or URL *
                </label>
                <input
                  type="text"
                  required
                  value={adFormTarget}
                  onChange={(e) => setAdFormTarget(e.target.value)}
                  placeholder="https://wa.me/255783481416?text=Habari!%20Nimetoka%20ED%20Retail."
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAdModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-400 hover:text-white rounded-xl bg-stone-900 border border-stone-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition-all shadow-md cursor-pointer active:scale-98"
                >
                  {editingAd ? 'Update Ad Spot' : 'Publish Ad Spot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
