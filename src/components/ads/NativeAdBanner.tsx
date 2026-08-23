import React, { useEffect, useRef } from 'react';
import { ExternalLink, Sparkles, Globe, ShieldCheck } from 'lucide-react';
import { useDistributorStore } from '../../store/distributorStore';
import { useLang } from '../../context/LangContext';
import { AdPlacement } from '../../types';

interface NativeAdBannerProps {
  placement: AdPlacement;
  className?: string;
}

export const NativeAdBanner: React.FC<NativeAdBannerProps> = ({ placement, className = '' }) => {
  const { lang } = useLang();
  const monetizationConfig = useDistributorStore((s) => s.monetizationConfig);
  const nativeAdsEnabled = useDistributorStore((s) => s.nativeAdsEnabled);
  const sponsorAds = useDistributorStore((s) => s.sponsorAds);
  const recordAdImpression = useDistributorStore((s) => s.recordAdImpression);
  const recordAdClick = useDistributorStore((s) => s.recordAdClick);

  // Master switch
  const isGloballyEnabled = (monetizationConfig?.enabled ?? true) && nativeAdsEnabled;
  const mode = monetizationConfig?.mode || 'hybrid';
  const adsense = monetizationConfig?.adsense;

  // Direct sponsor ad matching this placement
  const sponsorAd = sponsorAds.find((a) => a.placement === placement && a.enabled);
  const recordedRef = useRef<string | null>(null);
  const adSenseRef = useRef<HTMLDivElement | null>(null);

  // Determine what to display based on mode & availability
  const showSponsorAd =
    (mode === 'custom_sponsors_only' || mode === 'hybrid') && Boolean(sponsorAd);
  const showAdSense =
    mode === 'adsense_only' || (mode === 'hybrid' && !sponsorAd && Boolean(adsense?.publisherId));

  // Record impression for sponsor ad
  useEffect(() => {
    if (showSponsorAd && sponsorAd && isGloballyEnabled && recordedRef.current !== sponsorAd.id) {
      recordAdImpression(sponsorAd.id);
      recordedRef.current = sponsorAd.id;
    }
  }, [showSponsorAd, sponsorAd?.id, isGloballyEnabled, recordAdImpression]);

  // Handle Google AdSense script loading & push
  useEffect(() => {
    if (showAdSense && isGloballyEnabled && adsense?.publisherId && !adsense.testMode) {
      try {
        // Check if AdSense script tag is already in <head>
        const scriptId = 'google-adsense-script';
        if (!document.getElementById(scriptId)) {
          const script = document.createElement('script');
          script.id = scriptId;
          script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense.publisherId}`;
          script.async = true;
          script.crossOrigin = 'anonymous';
          document.head.appendChild(script);
        }

        // Push ad unit
        if (typeof window !== 'undefined') {
          ((window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle =
            (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle || []).push({});
        }
      } catch (err) {
        console.warn('AdSense unit initialized in sandbox mode:', err);
      }
    }
  }, [showAdSense, isGloballyEnabled, adsense?.publisherId, adsense?.testMode, placement]);

  if (!isGloballyEnabled) {
    return null;
  }

  // ── 1. RENDER DIRECT SPONSOR SLOT (Sold by Super Admin to local gyms/couriers) ──
  if (showSponsorAd && sponsorAd) {
    const title = typeof sponsorAd.title === 'string' ? sponsorAd.title : sponsorAd.title[lang] || sponsorAd.title.en;
    const tagline = typeof sponsorAd.tagline === 'string' ? sponsorAd.tagline : sponsorAd.tagline[lang] || sponsorAd.tagline.en;
    const ctaText = typeof sponsorAd.ctaText === 'string' ? sponsorAd.ctaText : sponsorAd.ctaText[lang] || sponsorAd.ctaText.en;

    return (
      <div
        className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border border-stone-800 bg-gradient-to-r from-stone-900 via-stone-900 to-stone-950 p-4 sm:p-5 text-stone-100 shadow-md ${className}`}
      >
        {/* Background Subtle Glow & Texture */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left Side: Badge + Sponsor Info + Image */}
          <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
            {sponsorAd.bannerImage && (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden border border-stone-700/60 bg-stone-950 shrink-0 shadow-xs">
                <img
                  src={sponsorAd.bannerImage}
                  alt={sponsorAd.sponsorName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-400/15 text-amber-300 border border-amber-500/30">
                  <Sparkles className="w-2.5 h-2.5" />
                  {sponsorAd.badgeText || (lang === 'sw' ? 'MFADHILI WA AFYA' : 'SPONSORED')}
                </span>
                <span className="text-[11px] text-stone-400 font-semibold truncate">
                  {sponsorAd.sponsorName}
                </span>
              </div>

              <h4 className="text-xs sm:text-sm font-black text-white leading-tight">
                {title}
              </h4>

              <p className="text-[11px] sm:text-xs text-stone-300 line-clamp-2 leading-relaxed">
                {tagline}
              </p>
            </div>
          </div>

          {/* Right Side: CTA Link Button */}
          <a
            href={sponsorAd.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => recordAdClick(sponsorAd.id)}
            className="w-full sm:w-auto px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-black rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0 active:scale-95 cursor-pointer"
          >
            <span>{ctaText || (lang === 'sw' ? 'Fungua Ofa' : 'View Offer')}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  // ── 2. RENDER GOOGLE ADSENSE / PROGRAMMATIC NETWORK (OR TEST SANDBOX) ──
  if (showAdSense) {
    const slotId = adsense?.slotIds?.[placement] || '7840192831';
    const isTest = adsense?.testMode ?? true;

    if (isTest) {
      // Clean, elegant AdSense Test Preview Card showing publisher details
      return (
        <div
          className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border border-blue-900/40 bg-gradient-to-r from-slate-900 via-stone-900 to-slate-950 p-4 sm:p-5 text-stone-100 shadow-sm ${className}`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-blue-400 shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/15 px-2 py-0.5 rounded border border-blue-500/30">
                    Google AdSense Preview
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    Slot: {slotId}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  {lang === 'sw'
                    ? 'Boresha Afya Yako: Kliniki za Mazoezi na Vipimo Dar es Salaam'
                    : 'Wellness & Nutrition Network: Medical & Fitness Diagnostics'}
                </h4>
                <p className="text-[11px] text-stone-400">
                  {lang === 'sw'
                    ? 'Tangazo la Google AdSense linalolipwa kwa kila mtazamaji (Auto-Responsive Unit)'
                    : `Monetized via Google AdSense Client (${adsense?.publisherId || 'ca-pub-XXXXXXXXXX'})`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Ads by Google
              </span>
            </div>
          </div>
        </div>
      );
    }

    // Live Google AdSense Container
    return (
      <div
        ref={adSenseRef}
        className={`relative overflow-hidden rounded-2xl border border-stone-800 bg-stone-900/50 p-2 text-center my-3 ${className}`}
      >
        <div className="text-[9px] uppercase tracking-widest text-stone-500 mb-1 font-semibold">
          Advertisement
        </div>
        <ins
          className="adsbygoogle"
          style={{ display: 'block', minHeight: '90px' }}
          data-ad-client={adsense?.publisherId}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  return null;
};

