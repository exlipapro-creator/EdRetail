import { useLang } from '../../context/LangContext';
import { PaymentAccountsManager } from '../../components/distributor/PaymentAccountsManager';

export function DistributorPaymentsPage() {
  const { lang } = useLang();

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-stone-900/90 rounded-3xl p-4 sm:p-6 border border-stone-800 text-stone-100 shadow-sm">
        <PaymentAccountsManager lang={lang} />
      </div>
    </div>
  );
}
