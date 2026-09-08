import { useState } from 'react';
import { useLang } from '../../context/LangContext';
import { FieldLedgerPanel } from '../../components/chat/FieldLedgerPanel';
import { LogOfflineSaleModal } from '../../components/distributor/LogOfflineSaleModal';

/**
 * Sales — the dedicated operational workspace for the distributor portal.
 * This is the single home of the full sales ledger (filters, debt follow-up,
 * payment recording, WhatsApp actions, deletion). The Overview page shows
 * only a concise recent-activity summary and links here.
 */
export function DistributorSalesPage() {
  const { lang } = useLang();
  const [showSaleModal, setShowSaleModal] = useState(false);

  return (
    <div className="portal-page space-y-6">
      {/* ── Page header (the ledger owns the single primary Log New Sale action) ── */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          {lang === 'sw' ? 'Mauzo' : 'Sales'}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {lang === 'sw'
            ? 'Simamia mauzo yote, madeni na malipo'
            : 'Manage all sales, debts and payments'}
        </p>
      </div>

      {/* ── Full sales ledger ── */}
      <section className="panel-surface p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          {lang === 'sw' ? 'Daftari la Mauzo' : 'Sales Ledger'}
        </h2>
        <FieldLedgerPanel onOpenSaleForm={() => setShowSaleModal(true)} lang={lang} />
      </section>

      {showSaleModal && <LogOfflineSaleModal isOpen={showSaleModal} onClose={() => setShowSaleModal(false)} />}
    </div>
  );
}