import { useState, useRef } from 'react';
import {
  CheckCircle2,
  Plus,
  ShoppingBag,
  Calculator,
  MessageCircle,
} from 'lucide-react';
import { Bundle, Product } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { useDistributorStore } from '../../store/distributorStore';
import { formatPrice, formatUsd, getActiveWhatsAppLink } from '../../utils/whatsappCompiler';
import { useLang } from '../../context/LangContext';
import { BmiHealthCalculator } from '../calculator/BmiHealthCalculator';
import { useThreePullGesture } from '../../hooks/useThreePullGesture';

interface GoalsBundlesViewProps {
  onSelectProduct: (product: Product) => void;
  /** Opens the hidden Distributor Login (3 deliberate upward pulls). */
  onHiddenAccess?: () => void;
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
    iconName: 'growth' as const,
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

export function GoalsBundlesView({ onSelectProduct, onHiddenAccess }: GoalsBundlesViewProps) {
  const { lang, t } = useLang();
  const [activeTab, setActiveTab] = useState<'matcher' | 'assessment'>('matcher');
  const [selectedGoalId, setSelectedGoalId] = useState<string>('weight-loss');
  const addItem = useCartStore((s) => s.addItem);
  const [addedBundleId, setAddedBundleId] = useState<string | null>(null);

  const getEffectiveBundles = useDistributorStore((s) => s.getEffectiveBundles);
  const getEffectiveProduct = useDistributorStore((s) => s.getEffectiveProduct);

  const liveBundles = getEffectiveBundles();

  // Hidden internal access: three deliberate upward pulls in the designated
  // bottom activation zone only (never ordinary scrolling elsewhere on the
  // page). Not a security boundary — server-side roles decide who gets in.
  const activationZoneRef = useRef<HTMLDivElement | null>(null);
  const triggerGesture = useRef(onHiddenAccess);
  triggerGesture.current = onHiddenAccess;
  useThreePullGesture({
    onTrigger: () => triggerGesture.current?.(),
    resetKey: selectedGoalId + activeTab,
    zoneRef: activationZoneRef,
    // The app footer renders after the (invisible) activation zone, so at a
    // natural scroll-to-bottom the zone is off-screen. Also accept pulls that
    // begin in the bottom viewport band (lower footer + bottom-nav area) so
    // the gesture fires where a user actually performs it. 160px covers a
    // natural thumb pull over the footer; mid-page pulls never count.
    viewportBand: 160,
  });

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
    <div className="max-w-5xl mx-auto px-3 sm:px-4 pb-8 sm:pb-10 space-y-8 sm:space-y-10 animate-fadeIn">
      {/* ── EDITORIAL HEADER ── */}
      <header className="pt-4 sm:pt-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary-700">
          {lang === 'sw' ? 'Mwelekeo wa Afya' : 'Wellness Guidance'}
        </p>
        <h1 className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 leading-tight">
          {lang === 'sw'
            ? 'Pata pakiti inayolingana na lengo lako'
            : 'Find the program that matches your goal'}
        </h1>
        <p className="mt-2 text-sm text-neutral-500 max-w-xl leading-relaxed">
          {lang === 'sw'
            ? 'Chagua lengo, pima BMI, au vinjari pakiti zetu — kila kifurushi kimeundwa na bidhaa halisi za Edmark.'
            : 'Choose a goal, check your BMI, or browse the full range — every bundle is built from genuine Edmark products.'}
        </p>

        <div className="mt-4 inline-flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200/80">
          <button
            onClick={() => setActiveTab('matcher')}
            className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'matcher'
                ? 'bg-white text-neutral-900 shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            {lang === 'sw' ? 'Malengo' : 'Goals'}
          </button>
          <button
            onClick={() => setActiveTab('assessment')}
            className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'assessment'
                ? 'bg-white text-neutral-900 shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{lang === 'sw' ? 'Kikokotoo cha BMI' : 'BMI Check'}</span>
          </button>
        </div>
      </header>

      {activeTab === 'assessment' ? (
        <section>
          <BmiHealthCalculator
            onSelectProduct={onSelectProduct}
            onOpenGoalFinder={() => setActiveTab('matcher')}
          />
        </section>
      ) : (
        <>
          {/* ── STEP 1 · GOAL SELECTION — editorial list, not a card grid ── */}
          <section>
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                {lang === 'sw' ? 'Hatua 1 · Lengo lako' : 'Step 1 · Your goal'}
              </span>
            </div>

            <div role="radiogroup" aria-label={lang === 'sw' ? 'Chagua lengo' : 'Choose your goal'} className="divide-y divide-neutral-100 border-y border-neutral-100">
              {GOALS.map((goal, idx) => {
                const isSelected = goal.id === selectedGoalId;
                return (
                  <button
                    key={goal.id}
                    id={`goal-btn-${goal.id}`}
                    onClick={() => setSelectedGoalId(goal.id)}
                    role="radio"
                    aria-checked={isSelected}
                    className={`w-full flex items-center gap-4 py-4 text-left transition-colors cursor-pointer group ${
                      isSelected ? 'bg-primary-50/60' : 'hover:bg-neutral-50/60'
                    }`}
                  >
                    <span
                      className={`pl-4 text-[11px] font-black tabular-nums w-6 shrink-0 ${
                        isSelected ? 'text-primary-700' : 'text-neutral-300'
                      }`}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block font-bold text-sm sm:text-base leading-snug ${isSelected ? 'text-neutral-900' : 'text-neutral-800'}`}>
                        {lang === 'sw' ? goal.titleSw : goal.titleEn}
                      </span>
                      <span className="block text-xs text-neutral-500 mt-0.5 leading-relaxed">
                        {lang === 'sw' ? goal.descSw : goal.descEn}
                      </span>
                    </span>
                    <span
                      className={`mr-4 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? 'border-primary-600 bg-primary-600'
                          : 'border-neutral-300 bg-white group-hover:border-neutral-400'
                      }`}
                      aria-hidden
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── STEP 2 · MATCHED RECOMMENDATION — product-first spotlight ── */}
          {recommendedBundle && recMetrics && (
            <section>
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                  {lang === 'sw' ? 'Hatua 2 · Pendekezo' : 'Step 2 · Matched for you'}
                </span>
                <span className="text-[11px] font-bold text-brand-red">
                  {lang === 'sw' ? `Okoa ${recommendedBundle.discountPercent}%` : `Save ${recommendedBundle.discountPercent}%`}
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
                {/* Product imagery strip — the real products lead the composition */}
                <div className="flex items-end justify-center gap-3 px-6 pt-6 pb-4 bg-gradient-to-b from-neutral-50 to-white">
                  {recommendedBundle.productIds.map((pId) => {
                    const prod = getEffectiveProduct(pId);
                    if (!prod) return null;
                    return (
                      <button
                        key={pId}
                        onClick={() => onSelectProduct(prod)}
                        className="group cursor-pointer"
                        aria-label={t(prod.name)}
                      >
                        <img
                          src={prod.image}
                          alt={t(prod.name)}
                          className="h-24 sm:h-28 w-auto object-contain drop-shadow-sm transition-transform group-hover:scale-105"
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="px-5 sm:px-6 pb-5">
                  <h3 className="text-lg sm:text-xl font-extrabold text-neutral-900 tracking-tight">
                    {t(recommendedBundle.name)}
                  </h3>
                  <p className="text-sm text-neutral-600 mt-1 leading-relaxed">
                    {t(recommendedBundle.description)}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                    {recommendedBundle.productIds.map((pId) => {
                      const prod = getEffectiveProduct(pId);
                      if (!prod) return null;
                      return (
                        <button
                          key={pId}
                          onClick={() => onSelectProduct(prod)}
                          className="text-xs font-semibold text-primary-700 hover:text-primary-900 underline-offset-2 hover:underline cursor-pointer"
                        >
                          {t(prod.name)}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-5 pt-4 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-neutral-900 tracking-tight">
                          {formatPrice(recMetrics.bundlePrice)}
                        </span>
                        <span className="text-sm font-bold text-neutral-600">TZS</span>
                        <span className="text-xs text-neutral-400 line-through">
                          {formatPrice(recMetrics.originalPrice)} TZS
                        </span>
                        <span className="text-[11px] text-neutral-400">({formatUsd(recMetrics.priceUsd)})</span>
                      </div>
                    </div>

                    <button
                      id="bundle-add-to-cart-btn"
                      onClick={() => handleAddBundleToCart(recommendedBundle)}
                      className={`w-full sm:w-auto py-3 px-6 rounded-xl text-sm font-bold text-white shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] ${
                        addedBundleId === recommendedBundle.id
                          ? 'bg-success-600'
                          : 'bg-primary-600 hover:bg-primary-700'
                      }`}
                    >
                      {addedBundleId === recommendedBundle.id ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{lang === 'sw' ? 'Imeongezwa kwenye Mkoba' : 'Added to Cart'}</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>{lang === 'sw' ? 'Weka Pakiti Mkobani' : 'Add Bundle to Cart'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── ALL BUNDLES — quiet editorial rows ── */}
          <section>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                {lang === 'sw' ? 'Pakiti Zote' : 'All Bundles'}
              </h2>
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                {lang === 'sw' ? 'Punguzo la kila pakiti' : 'Bundled savings'}
              </span>
            </div>

            <div className="space-y-3">
              {liveBundles
                .filter((b) => b.id !== recommendedBundle?.id)
                .map((bundle) => {
                  const isAdded = addedBundleId === bundle.id;
                  const metrics = getBundleMetrics(bundle);

                  return (
                    <div
                      key={bundle.id}
                      className="bg-white rounded-xl border border-neutral-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center gap-4 hover:border-neutral-300 transition-all"
                    >
                      {/* Compact real product imagery */}
                      <div className="flex items-center gap-1 shrink-0">
                        {bundle.productIds.map((pId) => {
                          const p = getEffectiveProduct(pId);
                          if (!p) return null;
                          return (
                            <button key={pId} onClick={() => onSelectProduct(p)} className="cursor-pointer" aria-label={t(p.name)}>
                              <img
                                src={p.image}
                                alt={t(p.name)}
                                className="h-12 w-auto object-contain"
                              />
                            </button>
                          );
                        })}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-neutral-900">{t(bundle.name)}</h3>
                        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {t(bundle.description)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                        <div className="text-right">
                          <div className="text-base font-extrabold text-neutral-900">
                            {formatPrice(metrics.bundlePrice)} <span className="text-[11px] font-bold text-neutral-500">TZS</span>
                          </div>
                          <div className="text-[11px] text-neutral-400 line-through">
                            {formatPrice(metrics.originalPrice)} TZS
                          </div>
                        </div>

                        <button
                          onClick={() => handleAddBundleToCart(bundle)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98] shrink-0 ${
                            isAdded
                              ? 'bg-success-600 text-white'
                              : 'bg-neutral-900 hover:bg-neutral-800 text-white'
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
                              <span>{lang === 'sw' ? 'Ongeza' : 'Add'}</span>
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

      {/* ── DISTRIBUTOR ASSISTANCE — quiet closing line ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-neutral-100 text-xs">
        <p className="text-neutral-500 leading-relaxed text-center sm:text-left">
          {lang === 'sw'
            ? 'Unahitaji mpango maalum? Wasiliana na msambazaji wetu kwa ushauri wa bure.'
            : 'Need a personalized plan? Chat directly with an authorized wellness coach.'}
        </p>
        <a
          href={getActiveWhatsAppLink(
            lang === 'sw'
              ? 'Habari ED Retail, naomba ushauri waAfya wa kibinafsi:'
              : 'Hello ED Retail, I would like a personalized wellness recommendation:'
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-success-600 hover:bg-success-700 text-white rounded-lg font-bold whitespace-nowrap shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
        >
          <MessageCircle className="w-3.5 h-3.5 text-white" />
          <span>{lang === 'sw' ? 'Ongea na Msambazaji' : 'Chat with Coach'}</span>
        </a>
      </div>

      {/* Hidden internal-access activation zone — deliberately invisible, no
          visual noise. Three deliberate upward pulls (wheel or touch) starting
          in this bottom strip open the Distributor Login. Scrolling anywhere
          else on the page never triggers it. Not a security boundary. */}
      <div
        ref={activationZoneRef}
        data-hidden-access-zone="goals"
        aria-hidden
        className="h-16 sm:h-20 w-full"
      />
    </div>
  );
}
