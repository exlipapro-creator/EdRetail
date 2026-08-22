import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  CheckCircle2,
  Plus,
  ShoppingBag,
  Target,
  Package,
} from 'lucide-react';
import { Bundle, Product } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { useDistributorStore } from '../../store/distributorStore';
import { formatPrice, formatUsd, WHATSAPP_LINK, DISTRIBUTOR_NAME } from '../../utils/whatsappCompiler';
import { useLang } from '../../context/LangContext';

interface GoalsBundlesViewProps {
  onSelectProduct: (product: Product) => void;
}

interface GoalOption {
  id: string;
  titleEn: string;
  titleSw: string;
  descEn: string;
  descSw: string;
  iconName: string;
  recommendedBundleId: string;
}

const GOALS: GoalOption[] = [
  {
    id: 'weight-loss',
    titleEn: 'Weight Loss & Slimming',
    titleSw: 'Kupunguza Uzito & Mafuta',
    descEn: 'Target stubborn fat, boost metabolism and feel lighter in 2-4 weeks.',
    descSw: 'Kupunguza tumbo na unene, kuongeza kasi ya mmeng\'enyo wa chakula kwa wiki 2-4.',
    iconName: 'Scale',
    recommendedBundleId: 'p4-complete',
  },
  {
    id: 'colon-detox',
    titleEn: 'Colon Cleanse & Detox',
    titleSw: 'Kusafisha Tumbo & Sumu',
    descEn: 'Flush toxins, relieve chronic constipation, and alkalise digestive tract.',
    descSw: 'Kuondoa sumu mwilini, kumaliza tatizo la kukosa choo na kusafisha utumbo.',
    iconName: 'Sparkles',
    recommendedBundleId: 'detox-duo',
  },
  {
    id: 'daily-vitality',
    titleEn: 'Daily Vitality & Immunity',
    titleSw: 'Nguvu, Kinga & Nishati ya Kila Siku',
    descEn: 'Replenish micronutrients, sustain peak mental focus, and build stamina.',
    descSw: 'Kuongeza kinga ya mwili, nguvu za kiume/kike na umakini kazini bila kuchoka.',
    iconName: 'Zap',
    recommendedBundleId: 'wellness-duo',
  },
  {
    id: 'radiant-skin',
    titleEn: 'Youthful Skin & Collagen',
    titleSw: 'Ngozi Nyuso & Muonekano wa Ujana',
    descEn: 'Nourish skin elasticity, smooth wrinkles, and revitalize hair and nails.',
    descSw: 'Kurutubisha ngozi, kuondoa mikunjo na kuimarisha nywele na kucha.',
    iconName: 'Heart',
    recommendedBundleId: 'beauty-glow',
  },
];

export function GoalsBundlesView({ onSelectProduct }: GoalsBundlesViewProps) {
  const { lang, t } = useLang();
  const [selectedGoalId, setSelectedGoalId] = useState<string>('weight-loss');
  const addItem = useCartStore((s) => s.addItem);
  const [addedBundleId, setAddedBundleId] = useState<string | null>(null);

  const getEffectiveBundles = useDistributorStore((s) => s.getEffectiveBundles);
  const getEffectiveProduct = useDistributorStore((s) => s.getEffectiveProduct);

  const liveBundles = getEffectiveBundles();

  const getBundleMetrics = (bundle: Bundle) => {
    const originalPrice = bundle.productIds.reduce((sum, pId) => {
      const p = getEffectiveProduct(pId);
      return sum + (p?.price || 0);
    }, 0);

    const bundlePrice = Math.round(originalPrice * (1 - bundle.discountPercent / 100));

    const priceUsd = bundle.productIds.reduce((sum, pId) => {
      const p = getEffectiveProduct(pId);
      return sum + (p?.priceUsd || 0);
    }, 0) * (1 - bundle.discountPercent / 100);

    return { originalPrice, bundlePrice, priceUsd };
  };

  const activeGoal = GOALS.find((g) => g.id === selectedGoalId) || GOALS[0];
  const recommendedBundle = liveBundles.find((b) => b.id === activeGoal.recommendedBundleId) || liveBundles[0];
  const recMetrics = recommendedBundle ? getBundleMetrics(recommendedBundle) : null;

  const handleAddBundleToCart = (bundle: Bundle) => {
    bundle.productIds.forEach((productId) => {
      const product = getEffectiveProduct(productId);
      if (product) {
        addItem({ ...product, quantity: 1 });
      }
    });

    setAddedBundleId(bundle.id);
    setTimeout(() => setAddedBundleId(null), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-8 animate-fadeIn">
      {/* ── HEADER BANNER ── */}
      <div className="bg-[#0C271E] border border-[#1A3D31] rounded-3xl p-6 sm:p-8 text-stone-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold uppercase tracking-wider text-[#E5C378]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'sw' ? 'Mwelekeo wa Malengo & Pakiti' : 'Goal Matcher & Bundles'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white">
            {lang === 'sw'
              ? 'Tafuta Mchanganyiko Sahihi wa Malengo Yako ya Afya'
              : 'Targeted Solutions for Your Specific Health Goals'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-xl">
            {lang === 'sw'
              ? 'Chagua lengo lako hapa chini ili upate pakiti iliyojumuishwa kwa uangalifu na msambazaji ikiwa na punguzo na mpango kamili wa matumizi.'
              : 'Select your wellness focus to discover curated product combinations, bundled savings, and structured dosage plans.'}
          </p>
        </div>
      </div>

      {/* ── STEP 1: SELECT GOAL ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wider">
              {lang === 'sw' ? 'Hatua ya 1' : 'Step 1'}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
              {lang === 'sw' ? 'Lengo Lako Kuu ni Nini?' : 'What is your primary wellness goal?'}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {GOALS.map((goal) => {
            const isSelected = goal.id === selectedGoalId;

            return (
              <button
                key={goal.id}
                id={`goal-btn-${goal.id}`}
                onClick={() => setSelectedGoalId(goal.id)}
                className={`p-4 sm:p-5 rounded-2xl text-left border transition-all relative flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-primary-50/70 border-primary-500 shadow-md ring-2 ring-primary-500/20'
                    : 'bg-white border-neutral-200/80 hover:border-neutral-300 hover:bg-neutral-50/50 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      <Target className="w-5 h-5" />
                    </span>
                    {isSelected && (
                      <span className="px-2 py-0.5 bg-primary-600 text-white text-[10px] font-bold rounded-full">
                        {lang === 'sw' ? 'Limechaguliwa' : 'Selected'}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-neutral-900 leading-snug">
                    {lang === 'sw' ? goal.titleSw : goal.titleEn}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    {lang === 'sw' ? goal.descSw : goal.descEn}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── STEP 2: RECOMMENDED BUNDLE SPOTLIGHT ── */}
      {recommendedBundle && recMetrics && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                {lang === 'sw' ? 'Hatua ya 2 · Imependekezwa Kwako' : 'Step 2 · Matched Recommendation'}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
                {lang === 'sw' ? 'Pakiti Inayokufaa Zaidi' : 'Recommended Bundle for You'}
              </h2>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-primary-200 p-6 sm:p-8 shadow-md relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary-100/50 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-full">
                    {lang === 'sw' ? `Okoa ${recommendedBundle.discountPercent}%` : `Save ${recommendedBundle.discountPercent}% Bundle Discount`}
                  </span>
                  <span className="text-xs font-semibold text-neutral-400">
                    {lang === 'sw' ? 'Mpango wa Siku 14-30' : '14-30 Day Program'}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-900">
                  {t(recommendedBundle.name)}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {t(recommendedBundle.description)}
                </p>

                {/* Items included */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                    {lang === 'sw' ? 'Bidhaa Zilizomo Ndani:' : 'Products Included:'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {recommendedBundle.productIds.map((pId) => {
                      const prod = getEffectiveProduct(pId);
                      if (!prod) return null;
                      return (
                        <button
                          key={pId}
                          onClick={() => onSelectProduct(prod)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800 transition-colors"
                        >
                          <img src={prod.image} alt={t(prod.name)} className="w-5 h-5 object-contain" />
                          <span>{t(prod.name)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Price & Add Action */}
              <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200/80 w-full lg:w-72 flex flex-col justify-between gap-4 flex-shrink-0">
                <div>
                  <span className="text-xs text-neutral-500 block">
                    {lang === 'sw' ? 'Bei ya Pakiti Kamili' : 'Complete Bundle Price'}
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-neutral-900">
                      {formatPrice(recMetrics.bundlePrice)}
                    </span>
                    <span className="text-xs font-bold text-neutral-600">TZS</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-neutral-400 line-through">
                      {formatPrice(recMetrics.originalPrice)} TZS
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      ({formatUsd(recMetrics.priceUsd)})
                    </span>
                  </div>
                </div>

                <motion.button
                  id="bundle-add-to-cart-btn"
                  onClick={() => handleAddBundleToCart(recommendedBundle)}
                  whileTap={{ scale: 0.96 }}
                  className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white shadow-sm flex items-center justify-center gap-2 transition-all ${
                    addedBundleId === recommendedBundle.id
                      ? 'bg-emerald-600'
                      : 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800'
                  }`}
                >
                  {addedBundleId === recommendedBundle.id ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{lang === 'sw' ? 'Pakiti Imeongezwa!' : 'Bundle Added to Cart!'}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>{lang === 'sw' ? 'Weka Pakiti Yote Mkobani' : 'Add Bundle to Cart'}</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── ALL BUNDLES CATALOG ── */}
      <section className="space-y-4 pt-4 border-t border-neutral-200/80">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
            {lang === 'sw' ? 'Pakiti Zote za Punguzo' : 'All Curated Wellness Bundles'}
          </h2>
          <p className="text-xs text-neutral-500">
            {lang === 'sw' ? 'Chagua kifurushi kilichopangwa kitaalamu kwa matokeo ya haraka' : 'Expert-formulated stacks designed for synergy and savings'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {liveBundles.map((bundle) => {
            const isAdded = addedBundleId === bundle.id;
            const metrics = getBundleMetrics(bundle);

            return (
              <div
                key={bundle.id}
                className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs flex flex-col justify-between gap-4 hover:border-primary-300 transition-all"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 uppercase">
                      {lang === 'sw' ? 'Pakiti ya Afya' : 'Wellness Pack'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      {bundle.discountPercent}% OFF
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-neutral-900">
                    {t(bundle.name)}
                  </h3>
                  <p className="text-xs text-neutral-500 line-clamp-2">
                    {t(bundle.description)}
                  </p>

                  <div className="pt-1">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                      {lang === 'sw' ? 'Inajumuisha:' : 'Includes:'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {bundle.productIds.map((pId) => {
                        const p = getEffectiveProduct(pId);
                        if (!p) return null;
                        return (
                          <button
                            key={pId}
                            onClick={() => onSelectProduct(p)}
                            className="inline-flex items-center gap-1.5 px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-[11px] font-medium transition-colors"
                          >
                            <Package className="w-3 h-3 text-neutral-400" />
                            <span>{t(p.name)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-extrabold text-neutral-900">
                        {formatPrice(metrics.bundlePrice)} TZS
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-400 line-through">
                      {formatPrice(metrics.originalPrice)} TZS
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddBundleToCart(bundle)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                      isAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{lang === 'sw' ? 'Imeongezwa' : 'Added'}</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>{lang === 'sw' ? 'Weka Mkobani' : 'Add Bundle'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── DISTRIBUTOR ASSISTANCE BANNER ── */}
      <div className="p-5 bg-neutral-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-700 text-xs">
        <p className="leading-relaxed text-center sm:text-left">
          {lang === 'sw'
            ? `Je, unahitaji mpango uliotengenezwa mahususi kwako? Wasiliana na ${DISTRIBUTOR_NAME} moja kwa moja kwa ushauri wa bure.`
            : `Need a personalized plan tailored to your medical history? Chat directly with ${DISTRIBUTOR_NAME} on WhatsApp.`}
        </p>
        <a
          href={`${WHATSAPP_LINK}?text=${encodeURIComponent('Hello Mwanahamisi, I would like a personalized wellness recommendation:')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-secondary-green hover:bg-emerald-600 text-white rounded-xl font-bold whitespace-nowrap shadow-xs"
        >
          {lang === 'sw' ? 'Ongea na Msambazaji' : 'Chat with Coach'}
        </a>
      </div>
    </div>
  );
}
