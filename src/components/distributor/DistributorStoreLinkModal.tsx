import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Copy,
  Check,
  MessageCircle,
  Globe,
} from 'lucide-react';
import { useLang } from '../../context/LangContext';
import { useDistributorStore } from '../../store/distributorStore';

interface DistributorStoreLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DistributorStoreLinkModal: React.FC<DistributorStoreLinkModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { lang } = useLang();
  const distributor = useDistributorStore((s) => s.getActiveDistributor());
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://edretail.tz';
  const customStoreUrl = `${currentHost}/?ref=${distributor.slug}`;
  const displaySlugUrl = `edretail.tz/@${distributor.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(customStoreUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = [
      `🌿 *Karibu kwenye Duka Langu la Mtandaoni la Bidhaa Asilia za Edmark!*`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `Habari! Mimi ni *${distributor.name}*, Msambazaji Rasmi wa Edmark Tanzania.`,
      '',
      `Kupitia kiungo hiki, unaweza kuona bidhaa zote za asili:`,
      `• Shake Off (Kusafisha utumbo & kuondoa kitambi)`,
      `• Splina Chlorophyll (Vidonda vya tumbo & asidi)`,
      `• Cafe Troika & Ginseng (Nguvu & stamina ya mwili)`,
      `• P4 Slimming System (Mpango wa siku 24 wa kupunguza uzito)`,
      '',
      `👇 *Bonyeza hapa kutembelea duka langu & kuagiza:*`,
      customStoreUrl,
      '',
      `🚚 *Uwasilishaji wa haraka popote ulipo Tanzania!*`,
    ].join('\n');

    const shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/75 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-primary-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                {lang === 'sw' ? 'Kiungo Chako cha Duka' : 'Your Personal Storefront'}
              </span>
              <h3 className="text-base font-bold text-white leading-tight">
                {distributor.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-neutral-600">
            {lang === 'sw'
              ? 'Wateja wakifungua kiungo hiki, jina lako, picha yako, na namba yako ya WhatsApp ndio vitakavyoonekana. Maagizo yote yataingia moja kwa moja kwenye simu yako!'
              : 'Share this unique link with clients. Any orders placed automatically route to your WhatsApp phone number and M-Pesa account!'}
          </p>

          {/* Link Box */}
          <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/90 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                {lang === 'sw' ? 'Kiungo Rasmi' : 'Replication Link'}
              </span>
              <p className="text-xs font-mono font-bold text-primary-700 truncate">
                {displaySlugUrl}
              </p>
            </div>
            <button
              onClick={handleCopyLink}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (lang === 'sw' ? 'Imenakiliwa!' : 'Copied!') : (lang === 'sw' ? 'Nakili' : 'Copy')}</span>
            </button>
          </div>

          {/* Features check */}
          <div className="space-y-1.5 text-xs text-neutral-600 bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200/60">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Maagizo yote ya wateja huenda WhatsApp: <strong>{distributor.phone}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Namba ya malipo: <strong>{distributor.lipaNumber || 'M-Pesa / Tigo Pesa'}</strong></span>
            </div>
          </div>

          {/* WhatsApp Share Button */}
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="w-full py-3 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{lang === 'sw' ? 'Tuma Duka Langu kwenye WhatsApp Status' : 'Share Store Link on WhatsApp'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
