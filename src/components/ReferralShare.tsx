import { Share2 } from 'lucide-react';
import { useLang } from '../context/LangContext';
import { WHATSAPP_LINK } from '../utils/whatsappCompiler';

interface ReferralShareButtonProps {
  variant?: 'default' | 'compact';
}

export function ReferralShareButton({ variant = 'default' }: ReferralShareButtonProps) {
  const { lang } = useLang();

  const shareText =
    lang === 'sw'
      ? `Habari! Nimekuwa nikiagiza bidhaa za afya kutoka ED Retail (Edmark) — ubora mzuri, agizo rahisi kupitia WhatsApp. Agiza hapa: ${WHATSAPP_LINK}`
      : `Hi! I've been ordering wellness products from ED Retail (Edmark) — great quality, easy WhatsApp ordering. Check them out: ${WHATSAPP_LINK}`;

  const handleShare = async () => {
    // Prefer the native share sheet where available (most mobile browsers)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ED Retail',
          text: shareText,
        });
        return;
      } catch {
        // User cancelled the native share sheet — no fallback needed
        return;
      }
    }
    // Fallback: open WhatsApp's own share compose with no fixed recipient,
    // letting the user pick who to send it to from their own contacts.
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer');
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500 hover:text-gray-700 transition-colors outline-none [-webkit-tap-highlight-color:transparent]"
      >
        <Share2 className="w-3.5 h-3.5" />
        {lang === 'sw' ? 'Shiriki na rafiki' : 'Share with a friend'}
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 active:bg-indigo-800 transition-colors outline-none shadow-sm [-webkit-tap-highlight-color:transparent]"
    >
      <Share2 className="w-3.5 h-3.5" />
      {lang === 'sw' ? 'Shiriki na Rafiki' : 'Share with a Friend'}
    </button>
  );
}
