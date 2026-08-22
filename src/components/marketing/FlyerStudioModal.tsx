import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Sparkles,
  Download,
  Share2,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { useLang } from '../../context/LangContext';
import { useDistributorStore } from '../../store/distributorStore';
import { formatPrice, getActiveWhatsAppLink } from '../../utils/whatsappCompiler';

interface FlyerStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FlyerTemplate {
  id: string;
  categoryNameSw: string;
  categoryNameEn: string;
  headlineSw: string;
  headlineEn: string;
  subheadlineSw: string;
  subheadlineEn: string;
  productId: string;
  badgeSw: string;
  badgeEn: string;
  bulletsSw: string[];
  bulletsEn: string[];
  primaryColor: string;
  accentColor: string;
  gradientBg: [string, string];
}

const FLYER_TEMPLATES: FlyerTemplate[] = [
  {
    id: 'flat-tummy',
    categoryNameSw: 'Kitambi & Flat Tummy',
    categoryNameEn: 'Flat Tummy & P4 Slimming',
    headlineSw: 'ONDOA KITAMBI & SUMU TUMBONI NDANI YA SIKU 24!',
    headlineEn: 'FLATTEN YOUR TUMMY & DETOX IN 24 DAYS!',
    subheadlineSw: 'Mfumo Rasmi wa Edmark P4 Slimming — 100% Asilia Bila Mazoezi Magumu',
    subheadlineEn: 'Official Edmark P4 Slimming System — 100% Natural & Safe',
    productId: 'shake-off-phyto',
    badgeSw: 'OFISI RASMI YA EDMARK',
    badgeEn: 'AUTHORIZED DISTRIBUTOR',
    bulletsSw: [
      '✅ Shake Off: Inasafisha utumbo ndani ya masaa 8',
      '✅ MRT Complex: Inachoma mafuta bila njaa wala uchovu',
      '✅ Splina: Inasafisha damu na kuondoa asidi',
      '🚚 Uwasilishaji BURE nchi nzima',
    ],
    bulletsEn: [
      '✅ Shake Off: Cleanses colon in 6-8 hours',
      '✅ MRT Complex: Burns stubborn visceral fat',
      '✅ Splina: Rebalances cellular pH',
      '🚚 Free doorstep delivery nationwide',
    ],
    primaryColor: '#047857', // Emerald
    accentColor: '#F59E0B', // Amber
    gradientBg: ['#064e3b', '#022c22'],
  },
  {
    id: 'ulcers-splina',
    categoryNameSw: 'Vidonda vya Tumbo & Gesi',
    categoryNameEn: 'Ulcers & Acid Reflux',
    headlineSw: 'TIBA ASILIA YA VIDONDA VYA TUMBO & ASIDI!',
    headlineEn: 'NATURAL RELIEF FOR ULCERS & ACID REFLUX!',
    subheadlineSw: 'Splina Liquid Chlorophyll — Hutuliza Maumivu Ndani ya Dakika 15',
    subheadlineEn: 'Splina Liquid Chlorophyll — Fast Mucosal Healing',
    productId: 'splina-chlorophyll',
    badgeSw: '100% ASILIA & SALAMA',
    badgeEn: '100% NATURAL & SAFE',
    bulletsSw: [
      '✅ Huponya kuta za tumbo zilizoliwa na asidi',
      '✅ Huondoa kiungulia na kuvimbiwa papo hapo',
      '✅ Huongeza oksijeni safi kwenye seli za mwili',
      '✅ Salama kwa watoto, wajawazito na wazee',
    ],
    bulletsEn: [
      '✅ Heals gastric ulcerations and inflammation',
      '✅ Eliminates heartburn & hyperacidity quickly',
      '✅ Boosts cellular oxygenation',
      '✅ Safe for the whole family',
    ],
    primaryColor: '#059669',
    accentColor: '#10B981',
    gradientBg: ['#065f46', '#022c22'],
  },
  {
    id: 'male-stamina',
    categoryNameSw: 'Nguvu & Stamina',
    categoryNameEn: 'Male Stamina & Energy',
    headlineSw: 'ONGEZA NGUVU, STAMINA & UCHANGAMFU WA MWILI!',
    headlineEn: 'MAXIMIZE MALE STAMINA & CELLULAR ENERGY!',
    subheadlineSw: 'Cafe Troika — Tongkat Ali, Ginseng na Ganoderma ya Asili',
    subheadlineEn: 'Cafe Troika — Premium Herbal Synergy for Peak Performance',
    productId: 'cafe-troika',
    badgeSw: 'NGUVU YA ASILI BILA MADHARA',
    badgeEn: 'ALL-NATURAL VITALITY',
    bulletsSw: [
      '✅ Hufungua na kuimarisha mzunguko wa damu',
      '✅ Huondoa uchovu sugu na kuboresha usingizi',
      '✅ Huongeza hamu na uwezo wa mwili kiasili',
      '✅ Haina kemikali wala kuongeza mapigo ya moyo',
    ],
    bulletsEn: [
      '✅ Enhances peripheral micro-circulation',
      '✅ Eradicates chronic fatigue and brain fog',
      '✅ Elevates stamina and hormonal balance naturally',
      '✅ 100% natural herbs with zero palpitations',
    ],
    primaryColor: '#B45309', // Amber/Coffee
    accentColor: '#F59E0B',
    gradientBg: ['#451a03', '#1c1917'],
  },
  {
    id: 'glowing-skin',
    categoryNameSw: 'Ngozi Nzuri & Kolajeni',
    categoryNameEn: 'Youthful Skin & Collagen',
    headlineSw: 'NGÔZI LAINI, INAYONG\'AA NA AFYA YA VIUNGO!',
    headlineEn: 'GLOWING RADIANT SKIN & JOINT NOURISHMENT!',
    subheadlineSw: 'CoCollagen — Kolajeni Safi ya Asili kutoka Baharini',
    subheadlineEn: 'CoCollagen — Pure Deep-Sea Bio-Active Collagen',
    productId: 'cocollagen',
    badgeSw: 'UREMBO WA ASILI WA NDANI',
    badgeEn: 'INNER CELLULAR BEAUTY',
    bulletsSw: [
      '✅ Huondoa makunyanzi na kuimarisha unyevu wa ngozi',
      '✅ Huponya maumivu ya magoti na viungo vya mwili',
      '✅ Husaidia ukuaji wa nywele na kucha imara',
      '✅ Ladha tamu ya chokoleti yenye virutubisho',
    ],
    bulletsEn: [
      '✅ Restores dermal elasticity and fine-line reduction',
      '✅ Lubricates joints and cartilage',
      '✅ Strengthens hair folicles and nails',
      '✅ Delicious chocolate amino-acid drink',
    ],
    primaryColor: '#BE185D', // Pink/Rose
    accentColor: '#F472B6',
    gradientBg: ['#831843', '#4c0519'],
  },
];

export const FlyerStudioModal: React.FC<FlyerStudioModalProps> = ({ isOpen, onClose }) => {
  const { lang } = useLang();
  const distributor = useDistributorStore((s) => s.getActiveDistributor());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('flat-tummy');
  const [customPrice, setCustomPrice] = useState<string>('75,000');
  const [showLipaNumber] = useState<boolean>(true);
  const [showDistributorBadge] = useState<boolean>(true);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const activeTemplate =
    FLYER_TEMPLATES.find((t) => t.id === selectedTemplateId) || FLYER_TEMPLATES[0];
  const getEffectiveProduct = useDistributorStore((s) => s.getEffectiveProduct);
  const getEffectiveProducts = useDistributorStore((s) => s.getEffectiveProducts);
  const activeProduct = getEffectiveProduct(activeTemplate.productId) || getEffectiveProducts()[0];

  // Set default price based on template
  useEffect(() => {
    if (activeProduct) {
      setCustomPrice(formatPrice(activeProduct.price));
    }
  }, [activeTemplate.id, activeProduct]);

  // Render high-res 1080x1920 canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsRendering(true);

    // Canvas Dimensions: 1080 x 1920 (9:16 vertical ratio)
    const W = 1080;
    const H = 1920;
    canvas.width = W;
    canvas.height = H;

    // 1. Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, activeTemplate.gradientBg[0]);
    bgGrad.addColorStop(1, activeTemplate.gradientBg[1]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Decorative geometric accents
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.beginPath();
    ctx.arc(W - 100, 200, 400, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(100, H - 300, 500, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Top Header: Brand Bar
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌿 EDMARK TANZANIA • 100% GENUINE SEALED STOCK', W / 2, 90);

    // Top Category Badge
    const badgeText = lang === 'sw' ? activeTemplate.badgeSw : activeTemplate.badgeEn;
    ctx.fillStyle = activeTemplate.accentColor;
    const badgeW = 600;
    const badgeH = 50;
    const badgeX = (W - badgeW) / 2;
    const badgeY = 130;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 25);
    ctx.fill();

    ctx.fillStyle = '#064E3B';
    ctx.font = '900 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(badgeText, W / 2, badgeY + 34);

    // 4. Main Headline
    const headline = lang === 'sw' ? activeTemplate.headlineSw : activeTemplate.headlineEn;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 52px sans-serif';
    ctx.textAlign = 'center';

    // Simple word wrapping for headline
    const words = headline.split(' ');
    let line1 = '';
    let line2 = '';
    words.forEach((w) => {
      if ((line1 + w).length < 24) {
        line1 += (line1 ? ' ' : '') + w;
      } else {
        line2 += (line2 ? ' ' : '') + w;
      }
    });

    ctx.fillText(line1, W / 2, 260);
    if (line2) {
      ctx.fillText(line2, W / 2, 330);
    }

    // Sub-headline
    const subheadline =
      lang === 'sw' ? activeTemplate.subheadlineSw : activeTemplate.subheadlineEn;
    ctx.fillStyle = '#D1FAE5';
    ctx.font = '500 28px sans-serif';
    ctx.fillText(subheadline, W / 2, line2 ? 390 : 330);

    // 5. Product Image & Center Glow
    const imgY = 460;
    const imgSize = 480;
    const imgX = (W - imgSize) / 2;

    // Glowing circle behind product
    const glowGrad = ctx.createRadialGradient(
      W / 2,
      imgY + imgSize / 2,
      50,
      W / 2,
      imgY + imgSize / 2,
      300
    );
    glowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(W / 2, imgY + imgSize / 2, 300, 0, Math.PI * 2);
    ctx.fill();

    // Load and draw product image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = activeProduct.image;
    img.onload = () => {
      ctx.save();
      // White container pill
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 15;
      ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
      ctx.restore();

      // 6. Price Badge on Top of Image Corner
      const priceY = 900;
      const priceW = 420;
      const priceH = 90;
      const priceX = (W - priceW) / 2;

      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.roundRect(priceX, priceY, priceW, priceH, 20);
      ctx.fill();

      ctx.fillStyle = '#064E3B';
      ctx.font = '900 38px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`TZS ${customPrice}`, W / 2, priceY + 58);

      // 7. Bullet Points Container
      const bulletsY = 1040;
      const bulletsW = 920;
      const bulletsH = 360;
      const bulletsX = (W - bulletsW) / 2;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(bulletsX, bulletsY, bulletsW, bulletsH, 30);
      ctx.fill();
      ctx.stroke();

      // Bullets Text
      const bullets = lang === 'sw' ? activeTemplate.bulletsSw : activeTemplate.bulletsEn;
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'left';
      bullets.forEach((bullet, idx) => {
        ctx.fillText(bullet, bulletsX + 40, bulletsY + 70 + idx * 72);
      });

      // 8. Distributor Branded Footer Card
      const footerY = 1450;
      const footerW = 960;
      const footerH = 400;
      const footerX = (W - footerW) / 2;

      const footerGrad = ctx.createLinearGradient(
        footerX,
        footerY,
        footerX + footerW,
        footerY + footerH
      );
      footerGrad.addColorStop(0, '#FFFFFF');
      footerGrad.addColorStop(1, '#F0FDF4');
      ctx.fillStyle = footerGrad;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 40;
      ctx.beginPath();
      ctx.roundRect(footerX, footerY, footerW, footerH, 36);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Distributor Name & Rank
      ctx.fillStyle = '#064E3B';
      ctx.font = '900 40px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `MSAMBAZAJI RASMI: ${distributor.name.toUpperCase()}`,
        W / 2,
        footerY + 70
      );

      ctx.fillStyle = '#059669';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText(
        `${distributor.rank} • ${distributor.city || 'Tanzania'}`,
        W / 2,
        footerY + 115
      );

      // WhatsApp / Call Button Graphic
      const callW = 760;
      const callH = 90;
      const callX = (W - callW) / 2;
      const callY = footerY + 145;

      ctx.fillStyle = '#25D366';
      ctx.beginPath();
      ctx.roundRect(callX, callY, callW, callH, 45);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 36px sans-serif';
      ctx.fillText(`📱 WHATSAPP / PIGA: ${distributor.phone}`, W / 2, callY + 58);

      // Lipa Namba / M-Pesa & Store URL
      if (showLipaNumber && distributor.lipaNumber) {
        ctx.fillStyle = '#1F2937';
        ctx.font = 'bold 26px sans-serif';
        ctx.fillText(`💳 ${distributor.lipaNumber}`, W / 2, footerY + 285);
      }

      ctx.fillStyle = '#6B7280';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(
        `🌐 Agiza mtandaoni: edretail.tz/@${distributor.slug} • Uwasilishaji Haraka!`,
        W / 2,
        footerY + 345
      );

      setIsRendering(false);
    };

    // If image is already cached
    if (img.complete) {
      img.onload?.(new Event('load'));
    }
  }, [
    activeTemplate,
    activeProduct,
    customPrice,
    distributor,
    showLipaNumber,
    showDistributorBadge,
    lang,
  ]);

  useEffect(() => {
    if (isOpen) {
      // Short timeout to ensure canvas is in DOM
      const timer = setTimeout(() => {
        renderCanvas();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, renderCanvas]);

  if (!isOpen) return null;

  const handleDownloadFlyer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `Edmark_${activeTemplate.id}_${distributor.slug}_status.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleShareToWhatsApp = () => {
    const caption = [
      `*${lang === 'sw' ? activeTemplate.headlineSw : activeTemplate.headlineEn}*`,
      '',
      `🌿 *${lang === 'sw' ? activeProduct.name.sw : activeProduct.name.en}*`,
      `💰 Bei: *TZS ${customPrice}*`,
      '',
      ...(lang === 'sw' ? activeTemplate.bulletsSw : activeTemplate.bulletsEn),
      '',
      `👤 *Mshauri:* ${distributor.name} (${distributor.rank})`,
      `📱 Piga/WhatsApp: ${distributor.phone}`,
      `🌐 Tovuti ya duka: edretail.tz/@${distributor.slug}`,
    ].join('\n');

    const url = getActiveWhatsAppLink(caption);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/80 backdrop-blur-md animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden max-h-[94vh] flex flex-col"
      >
        {/* ── TOP BANNER ── */}
        <div className="bg-gradient-to-r from-emerald-900 to-primary-900 p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                {lang === 'sw' ? 'Studio ya Picha za WhatsApp Status' : 'WhatsApp Status Flyer Studio'}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                {lang === 'sw'
                  ? 'Tengeneza Picha Yenye Namba Yako Ndani ya Sekunde 5'
                  : 'Instant Branded 9:16 Marketing Flyer Generator'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── STUDIO WORKSPACE (GRID) ── */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* LEFT: CONTROLS & TEMPLATES (5 Cols) */}
          <div className="md:col-span-5 space-y-4">
            {/* Template Selector */}
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1.5 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'sw' ? '1. Chagua Mada / Bidhaa:' : '1. Select Health Preset:'}</span>
              </label>
              <div className="space-y-2">
                {FLYER_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(t.id)}
                    className={`w-full p-2.5 rounded-xl text-left border transition-all flex items-center justify-between ${
                      selectedTemplateId === t.id
                        ? 'bg-emerald-50 border-emerald-500 shadow-xs'
                        : 'bg-white border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-neutral-900">
                        {lang === 'sw' ? t.categoryNameSw : t.categoryNameEn}
                      </div>
                      <div className="text-[11px] text-neutral-500 truncate max-w-[220px]">
                        {lang === 'sw' ? t.headlineSw : t.headlineEn}
                      </div>
                    </div>
                    {selectedTemplateId === t.id && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Price & Lipa Number */}
            <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
              <div>
                <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                  {lang === 'sw' ? 'Bei ya Tangazo (TZS):' : 'Flyer Price (TZS):'}
                </label>
                <input
                  type="text"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded-xl text-xs font-bold text-emerald-700"
                />
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-bold text-neutral-700 block">
                  {lang === 'sw' ? 'Taarifa za Msambazaji kwenye Picha:' : 'Distributor Branding:'}
                </label>
                <div className="text-xs text-neutral-600 bg-white p-2 rounded-xl border border-neutral-200/80 space-y-0.5">
                  <div className="font-bold text-neutral-900">{distributor.name}</div>
                  <div>📞 {distributor.phone}</div>
                  {distributor.lipaNumber && <div>💳 {distributor.lipaNumber}</div>}
                </div>
              </div>
            </div>

            {/* Action Buttons on Mobile / Desktop */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                id="download-flyer-btn"
                onClick={handleDownloadFlyer}
                disabled={isRendering}
                className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>
                  {downloadSuccess
                    ? lang === 'sw'
                      ? '✅ Imepakuliwa kwenye Simu!'
                      : '✅ Downloaded!'
                    : lang === 'sw'
                    ? 'Pakua Picha ya WhatsApp (PNG)'
                    : 'Download Status Flyer (PNG)'}
                </span>
              </button>

              <button
                type="button"
                id="share-whatsapp-flyer-btn"
                onClick={handleShareToWhatsApp}
                className="w-full py-2.5 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>{lang === 'sw' ? 'Tuma WhatsApp Status' : 'Share to WhatsApp Status'}</span>
              </button>
            </div>
          </div>

          {/* RIGHT: LIVE CANVAS PREVIEW (7 Cols) */}
          <div className="md:col-span-7 flex flex-col items-center justify-center bg-neutral-900 p-4 rounded-2xl relative min-h-[420px]">
            <span className="absolute top-2 left-3 text-[10px] font-mono text-neutral-400">
              WhatsApp Status Preview (1080 × 1920 HD)
            </span>

            <div className="relative max-w-[260px] sm:max-w-[300px] w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-neutral-800">
              <canvas
                ref={canvasRef}
                className="w-full h-auto object-contain block rounded-xl"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
