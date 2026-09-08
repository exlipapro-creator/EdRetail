import { useLang } from '../../context/LangContext';
import { InventoryManagerPanel } from '../../components/distributor/InventoryManagerPanel';

export function DistributorInventoryPage() {
  const { lang } = useLang();

  return (
    <div className="portal-page">
      <div className="flex items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{lang === 'sw' ? 'Stoo & Bei' : 'Inventory & Pricing'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {lang === 'sw' ? 'Dhibiti stoo, bei na uonekano wa bidhaa dukani.' : 'Manage stock, prices, and product visibility.'}
          </p>
        </div>
      </div>
      <div className="panel-surface p-4 sm:p-5">
        <InventoryManagerPanel lang={lang} />
      </div>
    </div>
  );
}