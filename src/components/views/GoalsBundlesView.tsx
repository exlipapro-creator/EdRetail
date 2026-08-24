import { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Plus,
  ShoppingBag,
  Target,
  Package,
  Calculator,
  MessageCircle,
} from 'lucide-react';
import { Bundle, Product } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { useDistributorStore } from '../../store/distributorStore';
import { formatPrice, formatUsd, WHATSAPP_LINK } from '../../utils/whatsappCompiler';
import { useLang } from '../../context/LangContext';
import { BmiHealthCalculator } from '../calculator/BmiHealthCalculator';

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
  const [activeTab, setActiveTab] = useState<'matcher' | 'assessment'>('matcher');
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
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-5 animate-fadeIn">
      {/* ── HEADER BANNER & TAB TOGGLE (MINIMAL & SLEEK) ── */}
      <div className="bg-[#0C271E] border border-[#1A3D31] rounded-2xl p-4 sm:p-5 text-stone-100 shadow-xs relative overflow-hidden space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/10 rounded-full text-[11px] font-semibold uppercase tracking-wider text-[#E5C378]">
              <Sparkles className="w-3 h-3" />
              <span>{lang === 'sw' ? 'Mwelekeo wa Afya & Pakiti' : 'Goal Matcher & Bundles'}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              {lang === 'sw'
                ? 'Pata Pakiti na Mwongozo Sahihi wa Afya Yako'
                : 'Targeted Solutions for Your Health Goals'}
            </h1>
            <p className="text-xs text-stone-300 max-w-lg leading-relaxed">
              {lang === 'sw'
                ? 'Chagua lengo au pima BMI kupata mchanganyiko wa bidhaa zenye punguzo na ratiba ya matumizi.'
                : 'Choose a goal or assess your BMI for synergistic product stacks, savings, and dosage schedules.'}
            </p>
          </div>

          {/* Minimal Tab Switcher */}
          <div className="flex items-center gap-1.5 bg-black/30 p-1 rounded-xl border border-white/10 shrink-0">
            <button
              onClick={() => setActiveTab('matcher')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'matcher'
                  ? 'bg-[#C5A059] text-stone-950 shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>{lang === 'sw' ? 'Malengo (Goals)' : 'Goal Matcher'}</span>
            </button>

            <button
              onClick={() => setActiveTab('assessment')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'assessment'
                  ? 'bg-[#C5A059] text-stone-950 shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>{lang === 'sw' ? 'Kikokotoo cha BMI' : 'BMI Check'}</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'assessment' ? (
        <section className="space-y-4">
          <BmiHealthCalculator
            onSelectProduct={onSelectProduct}
            onOpenGoalFinder={() => setActiveTab('matcher')}
          />
        </section>
      ) : (
        <>
          {/* ── STEP 1: SELECT GOAL (MINIMAL & COMPACT) ── */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  {lang === 'sw' ? 'Hatua 1' : 'Step 1'}
                </span>
                <h2 className="text-sm sm:text-base font-bold text-neutral-900">
                  {lang === 'sw' ? 'Lengo Lako Kuu ni Nini?' : 'What is your primary wellness goal?'}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {GOALS.map((goal) => {
                const isSelected = goal.id === selectedGoalId;

                return (
                  <button
                    key={goal.id}
                    id={`goal-btn-${goal.id}`}
                    onClick={() => setSelectedGoalId(goal.id)}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-50/90 border-emerald-600 shadow-xs ring-1 ring-emerald-600'
                        : 'bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                            isSelected ? 'bg-emerald-700 text-white' : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          <Target className="w-3.5 h-3.5" />
                        </span>
                        {isSelected && (
                          <span className="px-1.5 py-0.5 bg-emerald-700 text-white text-[9px] font-black rounded-md uppercase">
                            {lang === 'sw' ? 'Limechaguliwa' : 'Selected'}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-xs sm:text-sm text-neutral-900 leading-snug">
                        {lang === 'sw' ? goal.titleSw : goal.titleEn}
                      </h3>
                      <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed line-clamp-2">
                        {lang === 'sw' ? goal.descSw : goal.descEn}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── STEP 2: RECOMMENDED BUNDLE SPOTLIGHT (COMPACT & BALANCED) ── */}
          {recommendedBundle && recMetrics && (
            <section className="space-y-2.5">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  {lang === 'sw' ? 'Hatua 2 · Pendekezo Maalum' : 'Step 2 · Matched Recommendation'}
                </span>
                <h2 className="text-sm sm:text-base font-bold text-neutral-900">
                  {lang === 'sw' ? 'Pakiti Inayokufaa Zaidi' : 'Recommended Bundle for You'}
                </h2>
              </div>

              <div className="bg-white rounded-2xl border border-emerald-300 p-4 sm:p-5 shadow-xs relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-md uppercase">
                        {lang === 'sw' ? `Okoa ${recommendedBundle.discountPercent}%` : `Save ${recommendedBundle.discountPercent}%`}
                      </span>
                      <span className="text-[11px] font-medium text-neutral-400">
                        {lang === 'sw' ? 'Mpango wa Siku 14-30' : '14-30 Day Regimen'}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-extrabold text-neutral-900">
                      {t(recommendedBundle.name)}
                    </h3>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {t(recommendedBundle.description)}
                    </p>

                    {/* Items included */}
                    <div className="pt-1">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                        {lang === 'sw' ? 'Bidhaa Zilizomo:' : 'Products Included:'}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {recommendedBundle.productIds.map((pId) => {
                          const prod = getEffectiveProduct(pId);
                          if (!prod) return null;
                          return (
                            <button
                              key={pId}
                              onClick={() => onSelectProduct(prod)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200/80 rounded-lg text-xs font-medium text-neutral-800 transition-colors cursor-pointer"
                            >
                              <img src={prod.image} alt={t(prod.name)} className="w-4 h-4 object-contain" />
                              <span>{t(prod.name)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Price & Add Action */}
                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/80 w-full md:w-64 flex flex-col justify-between gap-3 shrink-0">
                    <div>
                      <span className="text-[11px] text-neutral-500 block">
                        {lang === 'sw' ? 'Bei ya Pakiti Kamili' : 'Bundle Price'}
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-xl font-black text-neutral-900">
                          {formatPrice(recMetrics.bundlePrice)}
                        </span>
                        <span className="text-xs font-bold text-neutral-600">TZS</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-neutral-400 line-through">
                          {formatPrice(recMetrics.originalPrice)} TZS
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          ({formatUsd(recMetrics.priceUsd)})
                        </span>
                      </div>
                    </div>

                    <button
                      id="bundle-add-to-cart-btn"
                      onClick={() => handleAddBundleToCart(recommendedBundle)}
                      className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold text-white shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98 ${
                        addedBundleId === recommendedBundle.id
                          ? 'bg-emerald-600'
                          : 'bg-[#0E6B52] hover:bg-[#082F28]'
                      }`}
                    >
                      {addedBundleId === recommendedBundle.id ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{lang === 'sw' ? 'Imeongezwa!' : 'Added!'}</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{lang === 'sw' ? 'Weka Mkobani' : 'Add Bundle to Cart'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── ALL BUNDLES CATALOG (MINIMAL CARDS) ── */}
          <section className="space-y-2.5 pt-2 border-t border-neutral-200/80">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-neutral-900">
                {lang === 'sw' ? 'Pakiti Zote za Punguzo' : 'All Curated Wellness Bundles'}
              </h2>
              <p className="text-xs text-neutral-500">
                {lang === 'sw' ? 'Vifurushi vilivyopangwa kitaalamu kwa matokeo ya haraka na uokoaji wa gharama' : 'Formulated stacks for synergy and bundled savings'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {liveBundles.map((bundle) => {
                const isAdded = addedBundleId === bundle.id;
                const metrics = getBundleMetrics(bundle);

                return (
                  <div
                    key={bundle.id}
                    className="bg-white rounded-xl border border-neutral-200 p-3.5 sm:p-4 shadow-xs flex flex-col justify-between gap-3 hover:border-emerald-300 transition-all"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 uppercase">
                          {lang === 'sw' ? 'Pakiti ya Afya' : 'Wellness Pack'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-50 text-emerald-700">
                          {bundle.discountPercent}% OFF
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-neutral-900">
                        {t(bundle.name)}
                      </h3>
                      <p className="text-xs text-neutral-500 line-clamp-2">
                        {t(bundle.description)}
                      </p>

                      <div className="pt-1">
                        <div className="flex flex-wrap gap-1">
                          {bundle.productIds.map((pId) => {
                            const p = getEffectiveProduct(pId);
                            if (!p) return null;
                            return (
                              <button
                                key={pId}
                                onClick={() => onSelectProduct(p)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md text-[10px] font-medium transition-colors cursor-pointer"
                              >
                                <Package className="w-2.5 h-2.5 text-neutral-400" />
                                <span>{t(p.name)}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-neutral-100 flex items-center justify-between gap-2">
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm sm:text-base font-extrabold text-neutral-900">
                            {formatPrice(metrics.bundlePrice)} TZS
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-400 line-through">
                          {formatPrice(metrics.originalPrice)} TZS
                        </span>
                      </div>

                      <button
                        onClick={() => handleAddBundleToCart(bundle)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer active:scale-98 ${
                          isAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#0E6B52] hover:bg-[#082F28] text-white'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{lang === 'sw' ? 'Imeongezwa' : 'Added'}</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" />
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
        </>
      )}

      {/* ── DISTRIBUTOR ASSISTANCE BANNER (COMPACT) ── */}
      <div className="p-3.5 sm:p-4 bg-neutral-100 rounded-xl border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-neutral-800 text-xs">
        <p className="leading-relaxed text-center sm:text-left font-medium text-neutral-700">
          {lang === 'sw'
            ? 'Je, unahitaji mpango uliotengenezwa mahususi kwako? Wasiliana na msambazaji wetu moja kwa moja kwa ushauri wa bure.'
            : 'Need a customized plan tailored to your health goals? Chat directly with an authorized wellness coach.'}
        </p>
        <a
          href={`${WHATSAPP_LINK}?text=${encodeURIComponent('Hello ED Retail, I would like a personalized wellness recommendation:')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-[#0E6B52] hover:bg-[#082F28] active:bg-[#06241E] text-white rounded-lg font-bold whitespace-nowrap shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-200" />
          <span>{lang === 'sw' ? 'Ongea na Msambazaji' : 'Chat with Coach'}</span>
        </a>
      </div>
    </div>
  );
}
