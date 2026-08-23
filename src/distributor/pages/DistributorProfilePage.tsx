import { useState, FormEvent } from 'react';
import {
  MapPin,
  Copy,
  Check,
  Star,
  BadgeCheck,
} from 'lucide-react';
import { useDistributorStore } from '../../store/distributorStore';
import { useLang } from '../../context/LangContext';
import { RegionalDistributorLocator } from '../../components/distributor/RegionalDistributorLocator';
import { TESTIMONIALS } from '../../types';

export function DistributorProfilePage() {
  const { lang } = useLang();
  const distributor = useDistributorStore((s) => s.getActiveDistributor());
  const updateCurrentProfile = useDistributorStore((s) => s.updateCurrentProfile);

  const [copiedLink, setCopiedLink] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(distributor.name);
  const [phone, setPhone] = useState(distributor.phone);
  const [city, setCity] = useState(distributor.city);
  const [bio, setBio] = useState(distributor.bio || '');
  const [rank, setRank] = useState(distributor.rank);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/@${distributor.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault();
    updateCurrentProfile({
      name,
      phone,
      city,
      bio,
      rank,
    });
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ── Top Profile Card ── */}
      <div className="bg-stone-900/90 rounded-3xl p-5 sm:p-7 border border-[#1E4D3C] text-white shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <img
              src={distributor.avatarUrl || '/logo/distributor-circle.png'}
              alt={distributor.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-[#C5A059] bg-stone-800 shadow-md shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h2 className="text-xl font-black text-white">{distributor.name}</h2>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-black">
                  {distributor.rank || 'Crown Manager'}
                </span>
              </div>
              <p className="text-xs text-stone-300 flex items-center justify-center sm:justify-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>{distributor.city}, Tanzania</span> • <span>{distributor.phone}</span>
              </p>
              <p className="text-xs text-stone-400 max-w-xl mt-2 leading-relaxed">
                {distributor.bio || 'Msambazaji Rasmi wa Edmark Tanzania. Ushauri wa afya na bidhaa halisi za asili.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="w-full sm:w-auto px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              {isEditing ? (lang === 'sw' ? 'Ghairi' : 'Cancel') : (lang === 'sw' ? 'Badili Taarifa' : 'Edit Profile')}
            </button>

            <button
              onClick={handleCopyLink}
              className="w-full sm:w-auto px-4 py-2 bg-[#C5A059] hover:bg-[#d6b068] text-stone-950 font-black rounded-xl text-xs shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? (lang === 'sw' ? 'Imenakiliwa!' : 'Copied!') : (lang === 'sw' ? 'Nakili Kiungo cha Duka' : 'Copy Store Link')}</span>
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-bold">
            {lang === 'sw' ? 'Taarifa zako zimehifadhiwa kwa mafanikio!' : 'Profile updated successfully!'}
          </div>
        )}

        {/* Edit Profile Form */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="pt-4 border-t border-stone-800 space-y-4 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  {lang === 'sw' ? 'Jina Kamili' : 'Full Name'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  {lang === 'sw' ? 'Cheo / Rank' : 'Title / Rank'}
                </label>
                <input
                  type="text"
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  {lang === 'sw' ? 'Namba ya Simu / WhatsApp' : 'Phone / WhatsApp'}
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  {lang === 'sw' ? 'Mkoa / Jiji' : 'City / Region'}
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                {lang === 'sw' ? 'Maelezo Mafupi (Bio)' : 'Distributor Bio'}
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-stone-800 text-stone-300 rounded-xl text-xs font-bold"
              >
                {lang === 'sw' ? 'Ghairi' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black rounded-xl text-xs"
              >
                {lang === 'sw' ? 'Hifadhi Mabadiliko' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Regional Directory ── */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-stone-200 text-stone-900 shadow-sm">
        <RegionalDistributorLocator />
      </div>

      {/* ── Testimonials ── */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-stone-200 text-stone-900 shadow-sm space-y-4">
        <h4 className="font-black text-xs text-stone-800 uppercase tracking-wider">
          {lang === 'sw' ? 'Ushuhuda wa Wateja wa Edmark' : 'Edmark Customer Testimonials'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-xs text-stone-900">{t.name}</span>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-stone-600 italic leading-relaxed">
                "{t.text[lang] || t.text.sw}"
              </p>
              <div className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                <BadgeCheck className="w-3.5 h-3.5" />
                <span>{t.product} • {t.location}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
