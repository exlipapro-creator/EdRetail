import {
  HelpCircle,
  MessageCircle,
  Package,
  CreditCard,
  Truck,
  ShieldCheck,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { DISTRIBUTOR_NAME, WHATSAPP_LINK } from '../../utils/whatsappCompiler';
import { useLang } from '../../context/LangContext';

export function OrdersHelpView() {
  const { lang } = useLang();

  const steps = [
    {
      step: '1',
      titleEn: 'Browse & Add to Cart',
      titleSw: 'Chagua Bidhaa Kwenye Mkoba',
      descEn: 'Explore individual wellness products or goal-based bundles and customize your quantities.',
      descSw: 'Chagua bidhaa unazohitaji au pakiti za malengo ya afya kisha weka kwenye mkoba wako.',
      icon: Package,
    },
    {
      step: '2',
      titleEn: 'Enter Delivery Information',
      titleSw: 'Jaza Taarifa za Uwasilishaji',
      descEn: 'Provide your name, phone number, and location so the distributor can calculate shipping.',
      descSw: 'Weka jina lako, namba ya simu, na mahali unapoishi ili kurahisisha usafirishaji.',
      icon: Truck,
    },
    {
      step: '3',
      titleEn: '1-Tap WhatsApp Handoff',
      titleSw: 'Tuma Agizo Kupitia WhatsApp',
      descEn: 'Our system compiles your order message cleanly. Tap send to dispatch directly to your authorized distributor.',
      descSw: 'Mfumo unaunda ujumbe nadhifu wa agizo lako. Gusa kitufe cha kutuma kwenda WhatsApp ya msambazaji wako rasmi.',
      icon: MessageCircle,
    },
    {
      step: '4',
      titleEn: 'Confirmation & Delivery',
      titleSw: 'Uthibitisho & Kupokea Mzigo',
      descEn: 'The distributor confirms stock, arranges payment (Mobile Money / Cash on delivery), and tracks transit.',
      descSw: 'Msambazaji anathibitisha agizo, anapanga malipo (M-Pesa/TigoPesa/Airtel Money au Pesa Taslimu) na kutuma mzigo.',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-8 animate-fadeIn">
      {/* ── HERO BANNER ── */}
      <section className="bg-gradient-to-br from-primary-800 via-primary-700 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-3 text-amber-300">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{lang === 'sw' ? 'Msaada & Muongozo wa Maagizo' : 'Orders & Assistance'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
            {lang === 'sw' ? 'Jinsi ya Kuagiza na Kufuatilia Mzigo Wako' : 'How Ordering & Delivery Works'}
          </h1>
          <p className="text-xs sm:text-sm text-primary-100 mt-2 leading-relaxed">
            {lang === 'sw'
              ? 'Mfumo wetu unakuunganisha moja kwa moja na msambazaji rasmi wa Edmark Tanzania kupitia WhatsApp kwa huduma ya haraka na ya kuaminika.'
              : 'Our platform seamlessly connects your cart to our authorized Edmark distributor on WhatsApp for fast, personalized checkout and tracking.'}
          </p>

          <div className="mt-5">
            <a
              id="orders-help-whatsapp-btn"
              href={`${WHATSAPP_LINK}?text=${encodeURIComponent('Hello ED Retail, I would like to check on my order / ask for assistance:')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0E6B52] hover:bg-[#082F28] active:bg-[#06241E] text-white rounded-xl text-xs font-bold shadow-md transition-transform active:scale-95"
            >
              <Phone className="w-4 h-4" />
              <span>{lang === 'sw' ? 'Wasiliana na Msambazaji WhatsApp' : 'Contact Distributor on WhatsApp'}</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS STEPS ── */}
      <section className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">
            {lang === 'sw' ? 'Hatua 4 Rahisi za Kuagiza' : '4 Simple Steps to Your Order'}
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            {lang === 'sw' ? 'Hakuna haja ya kadi ya benki wala akaunti ngumu' : 'No credit card or complicated account creation needed'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200/60 flex flex-col justify-between gap-3 relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-8 h-8 rounded-xl bg-primary-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                      {s.step}
                    </span>
                    <Icon className="w-5 h-5 text-primary-500" />
                  </div>

                  <h3 className="font-bold text-sm text-neutral-900 leading-snug">
                    {lang === 'sw' ? s.titleSw : s.titleEn}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                    {lang === 'sw' ? s.descSw : s.descEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FREQUENTLY ASKED QUESTIONS ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-neutral-900">
          {lang === 'sw' ? 'Maswali Yanayoulizwa Sana' : 'Common Questions'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-neutral-200/80 shadow-xs space-y-2">
            <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary-600" />
              {lang === 'sw' ? 'Nalipaje mzigo wangu?' : 'How do I pay for my order?'}
            </h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {lang === 'sw'
                ? 'Malipo yanafanyika baada ya kuthibitisha agizo na msambazaji kupitia M-Pesa, TigoPesa, Airtel Money, Halopesa au Pesa Taslimu unapoletewa (Dar es Salaam).'
                : 'Payment is confirmed directly with the distributor via M-Pesa, TigoPesa, Airtel Money, or cash on delivery upon arrival within Dar es Salaam.'}
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-neutral-200/80 shadow-xs space-y-2">
            <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary-600" />
              {lang === 'sw' ? 'Je, bidhaa ni halisi?' : 'Are all products authentic?'}
            </h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {lang === 'sw'
                ? `Ndiyo. ${DISTRIBUTOR_NAME} ni Msambazaji Mkuu aliyesajiliwa rasmi na Edmark International. Bidhaa zote zimefungwa na zina lebo ya ubora.`
                : `Yes. ${DISTRIBUTOR_NAME} is an authorized Crown Manager for Edmark International. All packages come factory-sealed with batch verification.`}
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-neutral-200/80 shadow-xs space-y-2">
            <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary-600" />
              {lang === 'sw' ? 'Inachukua muda gani kufika?' : 'How long does delivery take?'}
            </h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {lang === 'sw'
                ? 'Dar es Salaam ni siku 1–2 (au siku hiyo hiyo ukiagiza asubuhi). Mikoani kote ni siku 2–4 kupitia usafirishaji wa kuaminika.'
                : 'Dar es Salaam is 1–2 days (same-day available for morning orders). Regional upcountry delivery takes 2–4 business days.'}
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-neutral-200/80 shadow-xs space-y-2">
            <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary-600" />
              {lang === 'sw' ? 'Je, nitapata ushauri wa afya?' : 'Do I receive free coaching?'}
            </h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {lang === 'sw'
                ? 'Bila shaka! Utapata ratiba kamili ya jinsi ya kutumia bidhaa zako na ufuatiliaji wa mara kwa mara kupitia WhatsApp bila gharama yoyote ya ziada.'
                : 'Absolutely! You receive full dosage schedules, meal planning guides, and regular WhatsApp check-ins at no extra cost.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
