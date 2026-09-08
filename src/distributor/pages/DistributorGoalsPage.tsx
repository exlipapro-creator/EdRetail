import { useLang } from '../../context/LangContext';
import { MaintenanceTrackerPanel } from '../../components/chat/MaintenanceTrackerPanel';

export function DistributorGoalsPage() {
  const { lang } = useLang();

  return (
    <div className="portal-page">
      <div className="flex items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{lang === 'sw' ? 'Malengo ya SV' : 'SV Goals & Pacing'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {lang === 'sw' ? 'Fuatilia changamoto ya 2,000 SV na vikundi vyako.' : 'Track the 2,000 SV challenge and your downline legs.'}
          </p>
        </div>
      </div>
      <div className="panel-surface p-4 sm:p-5">
        <MaintenanceTrackerPanel onSendChatMessage={() => {}} lang={lang} />
      </div>
    </div>
  );
}