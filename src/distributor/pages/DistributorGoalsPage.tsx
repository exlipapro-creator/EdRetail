import { useLang } from '../../context/LangContext';
import { MaintenanceTrackerPanel } from '../../components/chat/MaintenanceTrackerPanel';

export function DistributorGoalsPage() {
  const { lang } = useLang();

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-stone-200 text-stone-900 shadow-sm">
        <MaintenanceTrackerPanel
          onSendChatMessage={() => {}}
          lang={lang}
        />
      </div>
    </div>
  );
}
