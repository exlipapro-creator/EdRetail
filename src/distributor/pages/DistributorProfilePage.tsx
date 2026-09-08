import { useState, FormEvent } from 'react';
import {
  Copy,
  Check,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  KeyRound,
  Mail,
  ExternalLink,
  Pencil,
} from 'lucide-react';
import { useDistributorStore } from '../../store/distributorStore';
import { useLang } from '../../context/LangContext';
import { supabase } from '../../lib/supabase';
import { EdIcon } from '../../components/brand/EdIcon';

type Strength = 0 | 1 | 2 | 3;

function passwordStrength(pw: string): Strength {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Za-z]/.test(pw) && /\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw) && pw.length >= 10) s++;
  return s as Strength;
}

/* ── Editable row: label / value / action, with 44px touch target ── */
function InfoRow({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm text-gray-900 font-medium truncate">{value}</p>
      </div>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 min-h-[44px] rounded-md text-xs font-semibold text-primary-600 hover:text-primary-700 hover:bg-primary-50 transition-colors outline-none"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </button>
      )}
    </div>
  );
}

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

  // Security / change password state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const sw = lang === 'sw';
  const publicUrl = `${window.location.origin}/@${distributor.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault();
    updateCurrentProfile({ name, phone, city, bio, rank });
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const strength = passwordStrength(newPw);

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess(false);

    if (!currentPw || !newPw) {
      setPwError(sw ? 'Jaza nenosiri lako la sasa na jipya.' : 'Enter your current and new password.');
      return;
    }
    if (newPw.length < 8) {
      setPwError(sw ? 'Nenosiri jipya lazima liwe na angalau herufi 8.' : 'New password must be at least 8 characters.');
      return;
    }
    if (newPw !== confirmPw) {
      setPwError(sw ? 'Nenosiri jipya hazifanani.' : 'New passwords do not match.');
      return;
    }

    setPwLoading(true);
    try {
      // Verify the current password with the auth provider before updating.
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: distributor.email,
        password: currentPw,
      });
      if (verifyError) {
        setPwError(sw ? 'Nenosiri la sasa sio sahihi.' : verifyError.message || 'Your current password is incorrect.');
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPw });
      if (updateError) {
        setPwError(updateError.message);
        return;
      }

      setPwSuccess(true);
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (err: any) {
      setPwError(err?.message || (sw ? 'Imeshindikana kubadilisha nenosiri.' : 'Could not change your password.'));
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="portal-page space-y-6">
      {/* ── SECTION 1 · Identity header ── */}
      <div className="panel-surface p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <img
              src={distributor.avatarUrl || '/logo/distributor-circle.png'}
              alt={distributor.name}
              className="w-16 h-16 rounded-lg object-cover border border-gray-200 bg-white shrink-0"
            />
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-gray-900">{distributor.name}</h2>
              <p className="text-xs font-semibold text-primary-700">{distributor.rank || 'Crown Manager'}</p>
              <p className="text-xs text-gray-500">
                {distributor.city}, Tanzania · {distributor.phone}
              </p>
              {distributor.bio && (
                <p className="text-xs text-gray-500 max-w-xl pt-1 leading-relaxed">{distributor.bio}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-md bg-white border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors outline-none"
            >
              {isEditing ? (sw ? 'Ghairi' : 'Cancel') : sw ? 'Hariri Wasifu' : 'Edit Profile'}
            </button>
            <button
              onClick={handleCopyLink}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-colors outline-none flex items-center justify-center gap-1.5"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? (sw ? 'Imenakiliwa!' : 'Copied!') : sw ? 'Nakili Kiungo' : 'Copy Store Link'}
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-xs text-success font-semibold">
            {sw ? 'Taarifa zimehifadhiwa.' : 'Profile updated.'}
          </div>
        )}

        {isEditing && (
          <form onSubmit={handleSaveProfile} className="pt-4 mt-4 border-t border-gray-100 space-y-4 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">{sw ? 'Jina Kamili' : 'Full Name'}</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="portal-input" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">{sw ? 'Cheo / Rank' : 'Title / Rank'}</label>
                <input type="text" value={rank} onChange={(e) => setRank(e.target.value)} className="portal-input" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">{sw ? 'Simu / WhatsApp' : 'Phone / WhatsApp'}</label>
                <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} className="portal-input" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">{sw ? 'Mkoa / Jiji' : 'City / Region'}</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="portal-input" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{sw ? 'Maelezo Mafupi' : 'Distributor Bio'}</label>
              <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} className="portal-input" />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-md bg-white border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors"
              >
                {sw ? 'Ghairi' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-colors"
              >
                {sw ? 'Hifadhi' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── SECTION 2 · Personal information (editable rows) ── */}
      <section className="panel-surface p-5 sm:p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-1">{sw ? 'Taarifa za Kibinafsi' : 'Personal Information'}</h3>
        <p className="text-[11px] text-gray-500 mb-2">{sw ? 'Jinsi tulivyojua wewe.' : 'How we know you.'}</p>
        <InfoRow label={sw ? 'Jina Kamili' : 'Full name'} value={distributor.name} onEdit={() => setIsEditing(true)} />
        <InfoRow label={sw ? 'Simu' : 'Phone'} value={distributor.phone} onEdit={() => setIsEditing(true)} />
        <InfoRow label={sw ? 'Mkoa / Jiji' : 'Location'} value={distributor.city} onEdit={() => setIsEditing(true)} />
        <InfoRow
          label={sw ? 'Cheo cha kitaaluma' : 'Professional title'}
          value={distributor.rank || 'Crown Manager'}
          onEdit={() => setIsEditing(true)}
        />
      </section>

      {/* ── SECTION 3 · Distributor identity (her own, nobody else's) ── */}
      <section className="panel-surface p-5 sm:p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-1">{sw ? 'Wasifu wa Usambazaji' : 'Distributor Identity'}</h3>
        <p className="text-[11px] text-gray-500 mb-2">
          {sw ? 'Hali yako ndani ya mtandao wa EdRetail.' : 'Your standing in the EdRetail network.'}
        </p>
        <div className="flex items-center justify-between gap-3 py-3 border-b border-gray-100">
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{sw ? 'Cheo / Rank' : 'Rank'}</p>
            <p className="text-sm text-gray-900 font-medium">{distributor.rank || 'Crown Manager'}</p>
          </div>
          <EdIcon name="growth" className="w-5 h-5 text-primary-600 shrink-0" />
        </div>
        <div className="flex items-center justify-between gap-3 py-3 border-b border-gray-100">
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{sw ? 'Hali' : 'Status'}</p>
            <p className="text-sm font-medium flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${distributor.status === 'suspended' ? 'bg-red-500' : 'bg-success'}`}
              />
              <span className={distributor.status === 'suspended' ? 'text-red-700' : 'text-gray-900'}>
                {distributor.status === 'suspended' ? (sw ? 'Imesimamishwa' : 'Suspended') : sw ? 'Hai' : 'Active'}
              </span>
            </p>
          </div>
          <EdIcon name="shield" className="w-5 h-5 text-success shrink-0" />
        </div>
        <div className="flex items-center justify-between gap-3 py-3 last:border-0">
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{sw ? 'Uthibitisho' : 'Verification'}</p>
            <p className="text-sm text-gray-900 font-medium">{distributor.isVerified ? (sw ? 'Imethibitishwa' : 'Verified') : sw ? 'Haijathibitishwa' : 'Unverified'}</p>
          </div>
          {distributor.isVerified && <Check className="w-4 h-4 text-success shrink-0" />}
        </div>
      </section>

      {/* ── SECTION 4 · Public profile preview (HER card, not the directory) ── */}
      <section className="panel-surface p-5 sm:p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-1">{sw ? 'Wasifu wako wa Umma' : 'Your Public Profile'}</h3>
        <p className="text-[11px] text-gray-500 mb-4">{sw ? 'Hivi ndivyo wateja wanavyokuona.' : 'This is how customers see you.'}</p>

        <div className="rounded-lg border border-gray-200 bg-white p-4 flex items-center gap-4">
          <img
            src={distributor.avatarUrl || '/logo/distributor-circle.png'}
            alt={distributor.name}
            className="w-12 h-12 rounded-lg object-cover border border-gray-200 bg-gray-50 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-gray-900 truncate">{distributor.name}</p>
            <p className="text-xs text-primary-700 font-semibold">{distributor.rank || 'Crown Manager'}</p>
            <p className="text-[11px] text-gray-500">{distributor.city}, Tanzania</p>
          </div>
          <button
            onClick={() => window.open(publicUrl, '_blank', 'noopener')}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors outline-none"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {sw ? 'Tazama' : 'View'}
          </button>
        </div>
      </section>

      {/* ── SECTION 5 · Account security ── */}
      <section className="panel-surface p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-sm font-bold text-gray-900">{sw ? 'Usalama wa Akaunti' : 'Account Security'}</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {sw ? 'Badilisha nenosiri lako la kuingia.' : 'Change the password used to sign in to the portal.'}
            </p>
          </div>
        </div>

        {/* Email row — read-only identity fact */}
        <div className="flex items-center justify-between gap-3 py-3 border-y border-gray-100">
          <div className="flex items-center gap-3 min-w-0">
            <Mail className="w-4 h-4 text-gray-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{sw ? 'Barua Pepe' : 'Email'}</p>
              <p className="text-sm text-gray-900 font-medium truncate">{distributor.email}</p>
            </div>
          </div>
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-success bg-green-50 border border-green-200 rounded px-2 py-0.5">
            {sw ? 'Imethibitishwa' : 'Verified'}
          </span>
        </div>

        <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
          <div>
            <label htmlFor="current-password" className="block text-xs font-semibold text-gray-500 mb-1">
              {sw ? 'Nenosiri la Sasa' : 'Current Password'}
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="current-password"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={currentPw}
                onChange={(e) => {
                  setCurrentPw(e.target.value);
                  if (pwError) setPwError('');
                }}
                placeholder="••••••••"
                className="portal-input pl-9 pr-10"
              />
            </div>
          </div>

          <div>
            <label htmlFor="new-password" className="block text-xs font-semibold text-gray-500 mb-1">
              {sw ? 'Nenosiri Jipya' : 'New Password'}
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="new-password"
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={newPw}
                onChange={(e) => {
                  setNewPw(e.target.value);
                  if (pwError) setPwError('');
                }}
                placeholder="••••••••"
                className="portal-input pl-9 pr-10"
              />
            </div>
            {newPw.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        strength >= i ? (i === 1 ? 'bg-red-400' : i === 2 ? 'bg-amber-400' : 'bg-green-500') : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-gray-400">
                  {sw ? 'Angalau herufi 8, mchanganyiko wa herufi na nambari.' : 'At least 8 characters, mixing letters and numbers.'}
                </p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirm-new-password" className="block text-xs font-semibold text-gray-500 mb-1">
              {sw ? 'Thibitisha Nenosiri Jipya' : 'Confirm New Password'}
            </label>
            <input
              id="confirm-new-password"
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPw}
              onChange={(e) => {
                setConfirmPw(e.target.value);
                if (pwError) setPwError('');
              }}
              placeholder="••••••••"
              className="portal-input"
            />
            {confirmPw.length > 0 && confirmPw !== newPw && (
              <p className="mt-1 text-[11px] text-red-600">{sw ? 'Nenosiri hazifanani.' : 'Passwords do not match.'}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors outline-none"
            >
              {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showPw ? (sw ? 'Ficha' : 'Hide') : (sw ? 'Onyesha' : 'Show')}
            </button>
          </div>

          {pwError && (
            <div role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {pwError}
            </div>
          )}
          {pwSuccess && (
            <div role="status" className="text-xs text-success bg-green-50 border border-green-200 rounded-md px-3 py-2">
              {sw ? 'Nenosiri limebadilishwa kwa mafanikio.' : 'Your password has been changed successfully.'}
            </div>
          )}

          <button
            type="submit"
            disabled={pwLoading}
            className="px-5 py-2 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-colors outline-none disabled:opacity-50 inline-flex items-center gap-2"
          >
            {pwLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            {sw ? 'Badilisha Nenosiri' : 'Change Password'}
          </button>
        </form>

        <div className="flex items-center justify-between gap-3 py-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-gray-400 shrink-0" />
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{sw ? 'Uhifadhi' : 'Recovery'}</p>
              <p className="text-sm text-gray-900 font-medium">{sw ? 'Nenosiri la kupona kwa barua pepe' : 'Email password recovery'}</p>
            </div>
          </div>
          <span className="text-[11px] text-gray-400">{sw ? 'Tumia "Umesahau nenosiri?" kwenye ukurasa wa kuingia' : 'Use "Forgot password?" on the sign-in page'}</span>
        </div>
      </section>
    </div>
  );
}
