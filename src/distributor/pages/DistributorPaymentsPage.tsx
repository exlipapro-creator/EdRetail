import { useLang } from '../../context/LangContext';
import { PaymentAccountsManager } from '../../components/distributor/PaymentAccountsManager';

export function DistributorPaymentsPage() {
  const { lang } = useLang();

  return (
    <div className="portal-page">
      <div className="flex items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{lang === 'sw' ? 'Akaunti za Malipo' : 'Payment Accounts'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {lang === 'sw' ? 'Simamia akaunti zako za M-Pesa, Tigo Pesa na Airtel Money.' : 'Manage your M-Pesa, Tigo Pesa, and Airtel Money accounts.'}
          </p>
        </div>
      </div>
      <div className="panel-surface p-4 sm:p-5">
        <PaymentAccountsManager lang={lang} />
      </div>
    </div>
  );
}