import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useLang } from '../../context/LangContext';
import { useDistributorStore } from '../../store/distributorStore';
import { ReferralShareButton } from '../ReferralShare';
import { ScreenId } from './AppHeader';

interface StorefrontFooterProps {
  onNavigate: (screen: ScreenId) => void;
}

/**
 * Storefront footer — home of the secondary navigation (Orders & Help,
 * Delivery Info, Become a Distributor, Distributor Portal) so the primary
 * navbar stays focused on customer journeys.
 */
export function StorefrontFooter({ onNavigate }: StorefrontFooterProps) {
  const { lang, setLang } = useLang();
  const distributor = useDistributorStore((s) => s.getActiveDistributor());

  const link = (screen: ScreenId, labelEn: string, labelSw: string, key: string) => (
    <button
      key={key}
      onClick={() => onNavigate(screen)}
      className="block text-left text-xs text-neutral-500 hover:text-[#123B6D] transition-colors py-1 cursor-pointer"
    >
      {lang === 'sw' ? labelSw : labelEn}
    </button>
  );

  return (
    <footer className="border-t border-neutral-200/80 bg-white mt-8 pb-24 lg:pb-12">
      <div className="max-w-6xl mx-auto px-4 py-10 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-2">
            <img src="/logo/wordmark.png" alt="ED Retail Tanzania" className="h-8 w-auto object-contain" />
            <p className="text-xs text-neutral-500 leading-relaxed max-w-[220px]">
              {lang === 'sw'
                ? 'Bidhaa bora za afya Tanzania nzima.'
                : 'Quality wellness products across Tanzania.'}
            </p>
          </div>

          {/* Shop */}
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-neutral-400 mb-2">
              {lang === 'sw' ? 'Duka' : 'Shop'}
            </h3>
            {link('home', 'Home', 'Mwanzo', 'f-home')}
            {link('products', 'Products', 'Bidhaa', 'f-products')}
            {link('goals', 'Goal Finder', 'Lengo & Pakiti', 'f-goals')}
            {link('flyers', 'View Flyers', 'Angalia Kampeni', 'f-flyers')}
          </div>

          {/* Help & Information */}
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-neutral-400 mb-2">
              {lang === 'sw' ? 'Msaada & Taarifa' : 'Help & Information'}
            </h3>
            {link('help', 'Orders & Help', 'Maagizo & Msaada', 'f-help')}
            {link('delivery', 'Delivery Info', 'Uwasilishaji', 'f-delivery')}
          </div>

          {/* Distributor */}
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-neutral-400 mb-2">
              {lang === 'sw' ? 'Msambazaji' : 'Distributor'}
            </h3>
            {link('distributor', 'Become a Distributor', 'Kuwa Msambazaji', 'f-distributor')}
            <Link
              to="/portal"
              className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-[#123B6D] transition-colors py-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold">
                {lang === 'sw' ? 'Distributor Portal' : 'Distributor Portal'}
              </span>
            </Link>

            {/* Language */}
            <div className="pt-2 space-y-1.5">
              <h3 className="text-[11px] font-black uppercase tracking-wider text-neutral-400">
                {lang === 'sw' ? 'Lugha' : 'Language'}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLang('sw')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                    lang === 'sw' ? 'bg-[#123B6D] text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  Kiswahili
                </button>
                <button
                  onClick={() => setLang('en')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                    lang === 'en' ? 'bg-[#123B6D] text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  English
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-5 border-t border-neutral-100 space-y-3">
          {/* Distributor attribution + referral share (folded from the old
              HomePage footer so the storefront has exactly one footer) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-extrabold text-neutral-600">
                {lang === 'sw' ? `Msambazaji Rasmi: ${distributor.name}` : `Authorized Leader: ${distributor.name}`}
              </span>
            </div>
            <ReferralShareButton />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-[11px] text-neutral-400">
              © {new Date().getFullYear()} ED Retail Tanzania · {distributor.name}. Genuine Edmark product trademarks belong to Edmark International.
            </p>
            <p className="text-[11px] text-neutral-400">
              {lang === 'sw' ? 'Bidhaa halisi za Edmark.' : 'Genuine Edmark wellness products.'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}