import React, { useState } from 'react';
import {
  MapPin,
  ShieldCheck,
  Star,
  MessageCircle,
  ExternalLink,
  Users,
  Search,
  CheckCircle2,
  Sparkles,
  Award,
} from 'lucide-react';
import { useLang } from '../../context/LangContext';
import { useDistributorStore, DistributorProfile } from '../../store/distributorStore';

interface RegionalDistributorLocatorProps {
  onSelectDistributor?: (distributor: DistributorProfile) => void;
  onOpenJoinModal?: () => void;
}

const REGIONS = [
  { id: 'all', labelEn: 'All Tanzania', labelSw: 'Mikoa Yote' },
  { id: 'dar', labelEn: 'Dar es Salaam', labelSw: 'Dar es Salaam' },
  { id: 'arusha', labelEn: 'Arusha & Moshi', labelSw: 'Arusha & Kilimanjaro' },
  { id: 'mwanza', labelEn: 'Mwanza & Lake Zone', labelSw: 'Mwanza & Kanda ya Ziwa' },
  { id: 'dodoma', labelEn: 'Dodoma (Capital)', labelSw: 'Dodoma (Makao Makuu)' },
];

export const RegionalDistributorLocator: React.FC<RegionalDistributorLocatorProps> = ({
  onSelectDistributor,
  onOpenJoinModal,
}) => {
  const { lang } = useLang();
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const savedDistributors = useDistributorStore((s) => s.savedDistributors);
  const activeDistributor = useDistributorStore((s) => s.getActiveDistributor());
  const setAttributedDistributor = useDistributorStore((s) => s.setAttributedDistributor);

  // Filter out central hub from the regional distributor cards list
  const certifiedLeaders = savedDistributors.filter((d) => !d.isCentral);

  const filteredLeaders = certifiedLeaders.filter((leader) => {
    const matchesSearch =
      leader.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leader.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leader.rank.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedRegion === 'all') return true;
    if (selectedRegion === 'dar') return leader.city.toLowerCase().includes('dar');
    if (selectedRegion === 'arusha') return leader.city.toLowerCase().includes('arusha') || leader.city.toLowerCase().includes('moshi');
    if (selectedRegion === 'mwanza') return leader.city.toLowerCase().includes('mwanza') || leader.city.toLowerCase().includes('ziwa');
    if (selectedRegion === 'dodoma') return leader.city.toLowerCase().includes('dodoma');

    return true;
  });

  const handleActivateDistributor = (leader: DistributorProfile) => {
    setAttributedDistributor(leader.slug, 30);
    if (onSelectDistributor) {
      onSelectDistributor(leader);
    }
    // Update URL hash / query param cleanly
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('ref', leader.slug);
      window.history.replaceState({}, '', url.toString());
    } catch {
      // safe fallback
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="regional-distributor-locator" className="bg-white rounded-3xl border border-neutral-200 p-5 sm:p-7 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-200">
              {lang === 'sw' ? 'Mtandao wa Wasambazaji' : 'Verified Local Leaders'}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-neutral-900 leading-tight">
            {lang === 'sw'
              ? 'Tafuta Msambazaji Aliye Karibu Nawe'
              : 'Find a Certified Distributor Near You'}
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            {lang === 'sw'
              ? 'Chagua kiongozi msambazaji katika mkoa wako kwa uwasilishaji wa haraka (saa 1-3) na ushauri wa moja kwa moja.'
              : 'Connect with an authorized Edmark leader in your city for rapid local dispatch and 1-on-1 wellness guidance.'}
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'sw' ? 'Tafuta kwa mkoa au jina...' : 'Search by city or name...'}
            className="w-full pl-8 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:border-primary-500 transition-all"
          />
        </div>
      </div>

      {/* Region Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {REGIONS.map((reg) => {
          const isSelected = selectedRegion === reg.id;
          return (
            <button
              key={reg.id}
              onClick={() => setSelectedRegion(reg.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
              }`}
            >
              {lang === 'sw' ? reg.labelSw : reg.labelEn}
            </button>
          );
        })}
      </div>

      {/* Leader Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLeaders.map((leader) => {
          const isCurrentlyActive = activeDistributor.slug === leader.slug;
          const waText = encodeURIComponent(
            `Habari ${leader.name}, nimeona duka lako kwenye ED Retail Tanzania. Ninahitaji ushauri wa bidhaa za Edmark:`
          );
          const waUrl = `https://wa.me/${leader.whatsappDigits}?text=${waText}`;

          return (
            <div
              key={leader.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                isCurrentlyActive
                  ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-400/20 shadow-xs'
                  : 'bg-white hover:bg-neutral-50/70 border-neutral-200/90 hover:border-neutral-300 shadow-2xs'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Avatar */}
                <div className="relative w-14 h-14 rounded-2xl bg-neutral-100 border border-neutral-200 flex-shrink-0 overflow-hidden">
                  <img
                    src={leader.avatarUrl || '/logo/distributor-circle.png'}
                    alt={leader.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-600 rounded-full border-2 border-white flex items-center justify-center text-white">
                    <ShieldCheck className="w-3 h-3" />
                  </div>
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-neutral-900 truncate">
                      {leader.name}
                    </h3>
                    {isCurrentlyActive ? (
                      <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-black rounded-full uppercase flex items-center gap-1 flex-shrink-0">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>{lang === 'sw' ? 'Duka Linalotumika' : 'Active Store'}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1 flex-shrink-0">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{leader.rating || '4.9'}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] font-semibold text-primary-700 mt-0.5">
                    {leader.rank}
                  </p>

                  <div className="flex items-center gap-1 text-[11px] text-neutral-500 mt-1">
                    <MapPin className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                    <span className="truncate">{leader.city}</span>
                  </div>

                  {leader.deliveryCoverage && (
                    <p className="text-[10px] text-neutral-600 bg-neutral-100/80 px-2 py-0.5 rounded-md mt-1.5 line-clamp-1">
                      🚚 {leader.deliveryCoverage}
                    </p>
                  )}
                </div>
              </div>

              {/* Bio summary */}
              {leader.bio && (
                <p className="text-[11px] text-neutral-600 line-clamp-2 italic bg-white/70 p-2 rounded-xl border border-neutral-100">
                  "{leader.bio}"
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => handleActivateDistributor(leader)}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isCurrentlyActive
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                      : 'bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200'
                  }`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>
                    {isCurrentlyActive
                      ? lang === 'sw'
                        ? 'Duka Linatumika'
                        : 'Currently Shopping Here'
                      : lang === 'sw'
                      ? `Tembelea @${leader.slug}`
                      : `Shop with ${leader.name.split(' ')[0]}`}
                  </span>
                </button>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
                  title="WhatsApp Consultation"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Become a Distributor CTA */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 to-primary-950 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold flex-shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-white">
              {lang === 'sw'
                ? 'Wewe ni Msambazaji wa Edmark? Pata Duka Lako la Mtandaoni!'
                : 'Are You an Edmark Distributor? Get Your Storefront!'}
            </h4>
            <p className="text-[11px] text-emerald-200/90 mt-0.5">
              {lang === 'sw'
                ? 'Tengeneza kiungo chako cha kipekee (edretail.store/@jina), picha za WhatsApp Status zenye picha yako, na namba yako ya Lipa M-Pesa.'
                : 'Launch your branded storefront (edretail.store/@yourname), 1-tap WhatsApp flyer kit, and direct Lipa Namba integration.'}
            </p>
          </div>
        </div>

        {onOpenJoinModal && (
          <button
            type="button"
            onClick={onOpenJoinModal}
            className="w-full sm:w-auto px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'sw' ? 'Jiunge / Unda Duka Lako' : 'Create Your Storefront'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
