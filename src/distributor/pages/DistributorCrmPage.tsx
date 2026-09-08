import { useLang } from '../../context/LangContext';
import { ClientCareCrmPanel } from '../../components/distributor/ClientCareCrmPanel';

export function DistributorCrmPage() {
  const { lang } = useLang();

  return (
    <div className="portal-page">
      <div className="flex items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{lang === 'sw' ? 'Wateja & Refill' : 'Customer CRM'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {lang === 'sw' ? 'Fuatilia wateja, madeni na kumbusho za refill.' : 'Track clients, debts, and refill reminders.'}
          </p>
        </div>
      </div>
      <div className="panel-surface p-4 sm:p-5">
        <ClientCareCrmPanel lang={lang} />
      </div>
    </div>
  );
}