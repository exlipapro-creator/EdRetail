import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Scale,
  Sparkles,
  ShoppingBag,
  MessageCircle,
  Flame,
  Leaf,
  Zap,
  Clock,
  CheckCircle2,
  Lightbulb,
  User,
  ShieldCheck,
} from 'lucide-react';
import { useLang } from '../../context/LangContext';
import { useCartStore } from '../../store/cartStore';
import { useDistributorStore } from '../../store/distributorStore';
import { PRODUCTS, Product } from '../../types';
import { formatPrice, getActiveWhatsAppLink } from '../../utils/whatsappCompiler';

interface BmiHealthCalculatorProps {
  onOpenCart?: () => void;
  onNavigateToProducts?: () => void;
  onSelectProduct?: (product: Product) => void;
  onOpenGoalFinder?: () => void;
}

export const BmiHealthCalculator: React.FC<BmiHealthCalculatorProps> = ({
  onOpenCart,
  onNavigateToProducts: _onNavigateToProducts,
  onSelectProduct: _onSelectProduct,
  onOpenGoalFinder: _onOpenGoalFinder,
}) => {
  const { lang } = useLang();
  const addItem = useCartStore((s) => s.addItem);
  const distributor = useDistributorStore((s) => s.getActiveDistributor());

  // State inputs
  const [gender, setGender] = useState<'female' | 'male'>('female');
  const [age, setAge] = useState<number>(34);
  const [heightCm, setHeightCm] = useState<number>(165);
  const [weightKg, setWeightKg] = useState<number>(78);
  const [goal, setGoal] = useState<'weight_loss' | 'ulcers' | 'energy' | 'detox'>('weight_loss');
  const [addedNotice, setAddedNotice] = useState(false);

  // Calculations
  const heightM = heightCm / 100;
  const bmi = useMemo(() => {
    if (heightM <= 0) return 22;
    return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
  }, [weightKg, heightM]);

  const idealWeightMin = Math.round(18.5 * heightM * heightM);
  const idealWeightMax = Math.round(24.9 * heightM * heightM);
  const excessWeight = Math.max(0, Math.round(weightKg - idealWeightMax));

  // Category determination
  const bmiCategory = useMemo(() => {
    if (bmi < 18.5) {
      return {
        labelSw: 'Uzito Mdogo (Underweight)',
        labelEn: 'Underweight',
        color: 'text-sky-800 bg-sky-50 border-sky-200',
        badgeColor: 'bg-sky-600',
        riskLevelSw: 'Kinga dhaifu ya mwili & uchovu wa mara kwa mara.',
        riskLevelEn: 'Lower immune resilience and nutritional absorption deficiency.',
        level: 1,
      };
    }
    if (bmi >= 18.5 && bmi <= 24.9) {
      return {
        labelSw: 'Uzito Bora wa Kiafya (Normal)',
        labelEn: 'Optimal Healthy Weight',
        color: 'text-emerald-800 bg-emerald-50 border-emerald-200',
        badgeColor: 'bg-emerald-600',
        riskLevelSw: 'Hali nzuri ya kimetaboliki! Lenga kudumisha usafi wa utumbo na nishati.',
        riskLevelEn: 'Balanced metabolic profile. Maintain cellular vitality with regular detox.',
        level: 2,
      };
    }
    if (bmi >= 25 && bmi <= 29.9) {
      return {
        labelSw: 'Uzito Uliozidi (Overweight)',
        labelEn: 'Overweight',
        color: 'text-amber-900 bg-amber-50 border-amber-200',
        badgeColor: 'bg-amber-600',
        riskLevelSw: 'Kitambi cha awali & msukumo kwenye viungo vya miguu na mgongo.',
        riskLevelEn: 'Initial visceral abdominal accumulation and joint pressure.',
        level: 3,
      };
    }
    if (bmi >= 30 && bmi <= 34.9) {
      return {
        labelSw: 'Unene Daraja I (Class 1 Obesity)',
        labelEn: 'Class 1 Obesity',
        color: 'text-orange-900 bg-orange-50 border-orange-200',
        badgeColor: 'bg-orange-600',
        riskLevelSw: 'Hatari kubwa ya shinikizo la damu, uchovu, na sukari.',
        riskLevelEn: 'Elevated cardiovascular stress and insulin resistance risk.',
        level: 4,
      };
    }
    return {
      labelSw: 'Unene Uliokithiri (Severe Obesity)',
      labelEn: 'Severe Obesity (Class 2+)',
      color: 'text-rose-900 bg-rose-50 border-rose-200',
      badgeColor: 'bg-rose-600',
      riskLevelSw: 'Hatari kubwa ya mafuta kuziba mishipa, ini la mafuta, na pumzi kubana.',
      riskLevelEn: 'Critical visceral fat accumulation requiring structured lifestyle intervention.',
      level: 5,
    };
  }, [bmi]);

  // Recommended Products based on BMI & chosen goal
  const prescription = useMemo(() => {
    const shakeOff = PRODUCTS.find((p) => p.id === 'shake-off-phyto');
    const mrt = PRODUCTS.find((p) => p.id === 'mrt-complex');
    const splina = PRODUCTS.find((p) => p.id === 'splina-chlorophyll');
    const troika = PRODUCTS.find((p) => p.id === 'cafe-troika');
    const spirulina = PRODUCTS.find((p) => p.id === 'hawaiian-spirulina');

    if (goal === 'ulcers') {
      const items = [splina, spirulina].filter(Boolean) as Product[];
      return {
        titleSw: 'Mpango wa Asili wa Vidonda vya Tumbo & Asidi (Siku 14)',
        titleEn: 'Natural Ulcer & Acid Reflux Healing Protocol (14 Days)',
        descSw: 'Splina Chlorophyll hupunguza ukali wa asidi ndani ya dakika 15 na kuponya kuta za tumbo, wakati Spirulina hutoa virutubisho asilia bila kuumiza tumbo.',
        descEn: 'Alkaline chlorophyll soothes gastric mucosal inflammation within 15 minutes, paired with Hawaiian Spirulina for gentle cellular nourishment.',
        timelineSw: 'Nafuu ya haraka ndani ya siku 3–5',
        timelineEn: 'Noticeable relief within 3 to 5 days',
        items,
        bundleDiscountPercent: 10,
      };
    }

    if (goal === 'energy') {
      const items = [troika, splina].filter(Boolean) as Product[];
      return {
        titleSw: 'Kifurushi cha Nguvu, Stamina & Mzunguko wa Damu',
        titleEn: 'Peak Male Stamina & Vitality Bundle',
        descSw: 'Mchanganyiko wa Cafe Troika (Tongkat Ali + Ginseng + Ganoderma) na Splina Chlorophyll kutoa nguvu ya asili bila madhara ya moyo.',
        descEn: '100% natural Tongkat Ali, Ginseng, and Ganoderma combined with Liquid Chlorophyll for sustained cellular oxygenation.',
        timelineSw: 'Nguvu na uchangamfu papo hapo kuanzia kikombe cha kwanza',
        timelineEn: 'Instant daily vitality and alertness',
        items,
        bundleDiscountPercent: 10,
      };
    }

    if (goal === 'detox') {
      const items = [shakeOff, splina].filter(Boolean) as Product[];
      return {
        titleSw: 'Dozi ya Kusafisha Utumbo & Kuondoa Sumu Mwilini',
        titleEn: 'Colon Cleansing & Cellular Detox Protocol',
        descSw: 'Shake Off huondoa uchafu wote ulioganda tumboni ndani ya masaa 6–8, na Splina inasawazisha asidi mwilini.',
        descEn: 'Flushes encrusted mucoid toxins in 6–8 hours and restores pristine alkaline balance.',
        timelineSw: 'Tumbo kuwa jepesi ndani ya masaa 8',
        timelineEn: 'Light, flat stomach within 8 hours',
        items,
        bundleDiscountPercent: 10,
      };
    }

    // Default: Weight Loss / P4 System
    if (bmi >= 28 || excessWeight > 6) {
      const items = [shakeOff, mrt, splina].filter(Boolean) as Product[];
      return {
        titleSw: 'Mfumo Rasmi wa P4 Complete Slimming (Siku 24)',
        titleEn: 'Official 24-Day P4 Complete Slimming System',
        descSw: `Hatua ya 1 (Shake Off) inasafisha utumbo na kupunguza kitambi. Hatua ya 2 (MRT Complex) inachoma mafuta bila njaa. Hatua ya 3 (Splina) inasafisha damu na kuondoa asidi. Unapungua kilo ${Math.min(excessWeight, 8)} hadi 10 bila mazoezi ya kuumiza mwili.`,
        descEn: `Step 1 (Shake Off) flushes colon toxins. Step 2 (MRT Complex) burns visceral fat without starvation. Step 3 (Splina) restores cellular alkalinity. Target healthy reduction of ${Math.min(excessWeight, 8)}–10 kg.`,
        timelineSw: `Mpango wa siku 24: Unakadiria kupunguza kilo ${Math.min(excessWeight, 7)}–9`,
        timelineEn: `24-Day plan: Projected healthy loss of ${Math.min(excessWeight, 7)}–9 kg`,
        items,
        bundleDiscountPercent: 10,
      };
    }

    const items = [shakeOff, mrt].filter(Boolean) as Product[];
    return {
      titleSw: 'Kifurushi cha Kupunguza Kitambi (Starter Slimming Duo)',
      titleEn: 'Targeted Tummy Flattener Duo (Shake Off + MRT)',
      descSw: 'Mchanganyiko wa Shake Off Phyto Fiber na MRT Complex wa kuchoma mafuta ya kiunoni na tumboni kwa haraka.',
      descEn: 'Synergy of colon detox fiber and meal replacement fat burning to flatten stomach in 14 days.',
      timelineSw: 'Kupungua kilo 3–5 ndani ya siku 14',
      timelineEn: 'Projected 3–5 kg reduction in 14 days',
      items,
      bundleDiscountPercent: 10,
    };
  }, [goal, bmi, excessWeight]);

  // Total bundle calculation
  const originalTotalPrice = prescription.items.reduce((sum, item) => sum + item.price, 0);
  const discountedTotalPrice = Math.round(
    originalTotalPrice * (1 - prescription.bundleDiscountPercent / 100)
  );

  const handleAddAllToCart = () => {
    prescription.items.forEach((item) => {
      addItem({ ...item, quantity: 1 });
    });
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
    if (onOpenCart) {
      setTimeout(() => onOpenCart(), 500);
    }
  };

  const handleConsultWhatsApp = () => {
    const categoryName = lang === 'sw' ? bmiCategory.labelSw : bmiCategory.labelEn;
    const goalTitle = lang === 'sw' ? prescription.titleSw : prescription.titleEn;

    const message = [
      `USHAURI WA BMI NA AFYA - ED RETAIL`,
      `----------------------------------------`,
      `Mteja: ${gender === 'female' ? 'Mwanamke' : 'Mwanaume'}, Miaka ${age}`,
      `Urefu: ${heightCm} cm | Uzito: ${weightKg} kg`,
      `Kipimo cha BMI: ${bmi} (${categoryName})`,
      excessWeight > 0 ? `Uzito wa Kupunguza: ~${excessWeight} kg` : `Hali: Uzito mzuri wa kiafya`,
      `Lengo: ${goalTitle}`,
      `----------------------------------------`,
      `Habari ${distributor.name}! Nimepima BMI yangu kwenye tovuti na nimepata mapendekezo haya ya bidhaa za Edmark. Naomba mwongozo wa kuanza dozi hii.`,
    ].join('\n');

    const url = getActiveWhatsAppLink(message);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      id="bmi-health-calculator-section"
      className="bg-white rounded-3xl border border-neutral-200/90 shadow-sm overflow-hidden"
    >
      {/* ── HEADER BANNER ── */}
      <div className="bg-[#0C271E] p-6 sm:p-8 text-stone-100 border-b border-[#1A3D31] relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-[#E5C378] border border-white/10">
              <Calculator className="w-3.5 h-3.5 text-[#E5C378]" />
              <span>{lang === 'sw' ? 'Kikokotoo cha Afya & BMI' : 'Clinical BMI & Health Engine'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {lang === 'sw'
                ? 'Pima Hali ya Mwili & Pata Dozi Yako ya Edmark'
                : 'Calculate Your BMI & Custom Edmark Protocol'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-xl leading-relaxed">
              {lang === 'sw'
                ? 'Ingiza uzito na urefu wako upate uchambuzi wa kitaalamu na ratiba ya asili ya P4 Slimming au afya ya tumbo.'
                : 'Enter your biometric indicators for an instant clinical BMI evaluation, metabolic risk analysis, and tailored dosage recommendations.'}
            </p>
          </div>

          <div className="flex-shrink-0 bg-white/5 border border-white/15 p-4 rounded-2xl text-center min-w-[150px] shadow-sm">
            <p className="text-[11px] uppercase tracking-wider text-stone-300 font-bold">
              {lang === 'sw' ? 'Alama ya BMI Yako' : 'Your BMI Score'}
            </p>
            <div className="text-3xl sm:text-4xl font-black text-[#E5C378] my-0.5">{bmi}</div>
            <div className="text-[10px] font-extrabold text-white px-2.5 py-0.5 rounded-md bg-white/15 inline-block">
              {lang === 'sw' ? bmiCategory.labelSw.split(' ')[0] : bmiCategory.labelEn.split(' ')[0]}
            </div>
          </div>
        </div>
      </div>

      {/* ── INTERACTIVE CONTROLS & RESULTS ── */}
      <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: INPUT SLIDERS & GOAL PICKER (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-700" />
              <span>{lang === 'sw' ? '1. Taarifa za Mwili Wako' : '1. Biometric Parameters'}</span>
            </h3>

            {/* Gender Toggle */}
            <div>
              <label className="text-xs font-semibold text-stone-600 block mb-1.5">
                {lang === 'sw' ? 'Jinsia:' : 'Gender:'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    gender === 'female'
                      ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-rose-600" />
                  <span>{lang === 'sw' ? 'Mwanamke' : 'Female'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    gender === 'male'
                      ? 'bg-blue-50 border-blue-300 text-blue-800 shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>{lang === 'sw' ? 'Mwanaume' : 'Male'}</span>
                </button>
              </div>
            </div>

            {/* Weight Slider */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-stone-700">
                  {lang === 'sw' ? 'Uzito wa Sasa:' : 'Current Weight:'}
                </span>
                <span className="text-base font-extrabold text-emerald-800 bg-white px-2.5 py-0.5 rounded-lg border border-stone-200 shadow-2xs">
                  {weightKg} kg
                </span>
              </div>
              <input
                id="bmi-weight-slider"
                type="range"
                min={40}
                max={160}
                step={1}
                value={weightKg}
                onChange={(e) => setWeightKg(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                <span>40 kg</span>
                <span>100 kg</span>
                <span>160 kg</span>
              </div>
            </div>

            {/* Height Slider */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-stone-700">
                  {lang === 'sw' ? 'Urefu Wako:' : 'Height:'}
                </span>
                <span className="text-base font-extrabold text-emerald-800 bg-white px-2.5 py-0.5 rounded-lg border border-stone-200 shadow-2xs">
                  {heightCm} cm ({(heightCm / 100).toFixed(2)}m)
                </span>
              </div>
              <input
                id="bmi-height-slider"
                type="range"
                min={130}
                max={210}
                step={1}
                value={heightCm}
                onChange={(e) => setHeightCm(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                <span>130 cm</span>
                <span>170 cm</span>
                <span>210 cm</span>
              </div>
            </div>

            {/* Age Input */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-stone-700">
                  {lang === 'sw' ? 'Umri:' : 'Age:'}
                </span>
                <span className="text-base font-extrabold text-emerald-800 bg-white px-2.5 py-0.5 rounded-lg border border-stone-200 shadow-2xs">
                  {age} {lang === 'sw' ? 'miaka' : 'yrs'}
                </span>
              </div>
              <input
                id="bmi-age-slider"
                type="range"
                min={18}
                max={80}
                step={1}
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
              />
            </div>
          </div>

          {/* Goal Selector */}
          <div className="space-y-2.5 pt-2">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              <span>{lang === 'sw' ? '2. Chagua Lengo Lako Kuu' : '2. Primary Wellness Objective'}</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGoal('weight_loss')}
                className={`p-3.5 rounded-2xl text-left border transition-all ${
                  goal === 'weight_loss'
                    ? 'bg-emerald-50/80 border-emerald-600 shadow-xs ring-1 ring-emerald-600/20'
                    : 'bg-white border-stone-200 hover:bg-stone-50'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
                  <Flame className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-stone-900 leading-tight">
                  {lang === 'sw' ? 'Kupunguza Kitambi & Uzito' : 'Weight Loss & Flat Tummy'}
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5">
                  {lang === 'sw' ? 'P4 Slimming System' : 'P4 Fat Burning Protocol'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setGoal('ulcers')}
                className={`p-3.5 rounded-2xl text-left border transition-all ${
                  goal === 'ulcers'
                    ? 'bg-emerald-50/80 border-emerald-600 shadow-xs ring-1 ring-emerald-600/20'
                    : 'bg-white border-stone-200 hover:bg-stone-50'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2">
                  <Leaf className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-stone-900 leading-tight">
                  {lang === 'sw' ? 'Vidonda vya Tumbo & Gesi' : 'Stomach Ulcers & Acid'}
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5">
                  {lang === 'sw' ? 'Splina Chlorophyll Healing' : 'Alkaline Mucosal Repair'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setGoal('energy')}
                className={`p-3.5 rounded-2xl text-left border transition-all ${
                  goal === 'energy'
                    ? 'bg-emerald-50/80 border-emerald-600 shadow-xs ring-1 ring-emerald-600/20'
                    : 'bg-white border-stone-200 hover:bg-stone-50'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-stone-900 leading-tight">
                  {lang === 'sw' ? 'Nguvu & Stamina ya Mwili' : 'Male Stamina & Energy'}
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5">
                  {lang === 'sw' ? 'Cafe Troika & Ginseng' : 'Tongkat Ali + Ganoderma'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setGoal('detox')}
                className={`p-3.5 rounded-2xl text-left border transition-all ${
                  goal === 'detox'
                    ? 'bg-emerald-50/80 border-emerald-600 shadow-xs ring-1 ring-emerald-600/20'
                    : 'bg-white border-stone-200 hover:bg-stone-50'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-stone-900 leading-tight">
                  {lang === 'sw' ? 'Kusafisha Utumbo & Sumu' : 'Colon Cleanse & Detox'}
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5">
                  {lang === 'sw' ? 'Shake Off Phyto Fiber' : 'Mucoid Plaque Removal'}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CLINICAL DIAGNOSIS & PRESCRIPTION CARD (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Status Breakdown Box */}
          <div className={`p-5 rounded-2xl border ${bmiCategory.color} transition-all`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${bmiCategory.badgeColor}`} />
                <span className="text-sm font-bold">
                  {lang === 'sw' ? bmiCategory.labelSw : bmiCategory.labelEn}
                </span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/90 border border-stone-200 shadow-2xs">
                BMI: <strong>{bmi}</strong> kg/m²
              </span>
            </div>

            {/* Visual Risk Gauge Meter */}
            <div className="mt-3.5 mb-2">
              <div className="h-3 w-full bg-stone-200 rounded-full overflow-hidden flex">
                <div className="w-[18%] bg-sky-500" title="Underweight (<18.5)" />
                <div className="w-[30%] bg-emerald-600" title="Normal (18.5-24.9)" />
                <div className="w-[22%] bg-amber-500" title="Overweight (25-29.9)" />
                <div className="w-[18%] bg-orange-500" title="Obesity I (30-34.9)" />
                <div className="w-[12%] bg-rose-600" title="Severe (>35)" />
              </div>
              <div className="flex justify-between text-[9px] text-stone-500 mt-1 font-semibold">
                <span>18.5</span>
                <span>25.0</span>
                <span>30.0</span>
                <span>35.0+</span>
              </div>
            </div>

            <div className="flex items-start gap-1.5 text-xs mt-2 text-stone-800 leading-relaxed font-medium">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p>
                <strong>{lang === 'sw' ? 'Tathmini ya Kiafya:' : 'Clinical Assessment:'}</strong>{' '}
                {lang === 'sw' ? bmiCategory.riskLevelSw : bmiCategory.riskLevelEn}
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-stone-200/80 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-stone-500 block text-[11px]">
                  {lang === 'sw' ? 'Uzito Unaotakiwa Kuwa:' : 'Ideal Healthy Range:'}
                </span>
                <span className="font-bold text-stone-900">
                  {idealWeightMin} – {idealWeightMax} kg
                </span>
              </div>
              <div>
                <span className="text-stone-500 block text-[11px]">
                  {lang === 'sw' ? 'Uzito Unaopaswa Kupunguza:' : 'Target Weight Reduction:'}
                </span>
                <span className={`font-bold ${excessWeight > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {excessWeight > 0 ? `~${excessWeight} kg` : lang === 'sw' ? 'Uko sawa kabisa!' : 'On Target'}
                </span>
              </div>
            </div>
          </div>

          {/* PRESCRIPTION BUNDLE CARD */}
          <div className="p-5 sm:p-6 bg-[#0E2E23] text-stone-100 rounded-3xl border border-[#1A3D31] shadow-md space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C5A059] text-stone-950 text-[10px] font-black uppercase tracking-wider mb-1.5">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{lang === 'sw' ? 'Dozi Iliyopendekezwa na Mfumo' : 'System Recommended Protocol'}</span>
                </div>
                <h4 className="text-base sm:text-lg font-black text-white leading-snug">
                  {lang === 'sw' ? prescription.titleSw : prescription.titleEn}
                </h4>
                <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                  {lang === 'sw' ? prescription.descSw : prescription.descEn}
                </p>
              </div>
            </div>

            {/* Product Items Included in Recommended Plan */}
            <div className="space-y-2 pt-2 border-t border-[#1A3D31]">
              <span className="text-[11px] font-bold text-[#E5C378] uppercase tracking-wider block">
                {lang === 'sw' ? 'Bidhaa Zilizomo Kwenye Mpango Huu:' : 'Included Package Components:'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {prescription.items.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5"
                  >
                    <img
                      src={prod.image}
                      alt={prod.name.en}
                      className="w-10 h-10 object-contain rounded-lg bg-white/15 p-1 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-white truncate">
                        {lang === 'sw' ? prod.name.sw : prod.name.en}
                      </h5>
                      <p className="text-[11px] text-[#E5C378] font-bold">
                        TZS {formatPrice(prod.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Summary with 10% Discount */}
            <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[11px] text-stone-400 line-through block">
                  {lang === 'sw' ? 'Bei ya kawaida:' : 'Regular Total:'} TZS {formatPrice(originalTotalPrice)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-black text-[#E5C378]">
                    TZS {formatPrice(discountedTotalPrice)}
                  </span>
                  <span className="px-2 py-0.5 bg-rose-600 text-white font-extrabold text-[10px] rounded-md uppercase">
                    10% {lang === 'sw' ? 'Punguzo' : 'Off'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-stone-300 font-medium">
                <Clock className="w-3.5 h-3.5 text-[#E5C378]" />
                <span>{lang === 'sw' ? prescription.timelineSw : prescription.timelineEn}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                id="bmi-add-bundle-cart-btn"
                onClick={handleAddAllToCart}
                className="w-full py-3 px-4 rounded-xl bg-[#C5A059] hover:bg-[#d6b068] text-stone-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all transform active:scale-95 cursor-pointer"
              >
                {addedNotice ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-stone-950" />
                    <span>{lang === 'sw' ? 'Imewekwa Mkobani!' : 'Added to Cart!'}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>{lang === 'sw' ? 'Weka Mpango Wote Mkobani' : 'Add Bundle to Cart'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                id="bmi-consult-whatsapp-btn"
                onClick={handleConsultWhatsApp}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all transform active:scale-95 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-white" />
                <span>
                  {lang === 'sw'
                    ? `Agiza WhatsApp (${distributor.name.split(' ')[0]})`
                    : `Order on WhatsApp`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
