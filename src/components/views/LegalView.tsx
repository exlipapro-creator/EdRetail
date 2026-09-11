import { useLang } from '../../context/LangContext';
import { ShieldCheck, ScrollText, Truck, MessageCircle, Mail } from 'lucide-react';

/**
 * Privacy Notice + Terms of Service + Delivery/Returns + WhatsApp disclosure.
 *
 * Product-readiness documentation grounded in how EdRetail actually behaves:
 *  - Guest checkout collects name / phone / delivery location per order.
 *    There are no customer accounts — ordering needs no registration.
 *  - Language preference and cart persist in the browser's localStorage.
 *  - Orders are communicated to the distributor through the customer's own
 *    WhatsApp app; EdRetail composes the message but does not see the chat.
 *  - Data lives in Supabase (cloud hosting, auth, database).
 *
 * This is product documentation, not legal advice. It is written to align with
 * the principles of Tanzania's Personal Data Protection Act (PDPA) — lawful
 * processing, purpose limitation, data minimisation, accuracy, storage
 * limitation and data-subject rights — without claiming legal certification.
 */
export function LegalView() {
  const { lang } = useLang();
  const sw = lang === 'sw';

  const contactLine = (
    <p className="text-xs text-neutral-600 leading-relaxed">
      {sw ? (
        <>
          Wasiliana nasi kwa barua pepe{' '}
          <a href="mailto:support@edretail.tz" className="font-bold text-primary-700 underline">
            support@edretail.tz
          </a>{' '}
          au kupitia WhatsApp ya msambazaji wako.
        </>
      ) : (
        <>
          Contact us by email at{' '}
          <a href="mailto:support@edretail.tz" className="font-bold text-primary-700 underline">
            support@edretail.tz
          </a>{' '}
          or through your distributor’s WhatsApp.
        </>
      )}
    </p>
  );

  const sections = [
    {
      id: 'privacy',
      icon: ShieldCheck,
      title: sw ? 'Sera ya Faragha' : 'Privacy Notice',
      blocks: [
        sw
          ? 'EdRetail inakusanya taarifa zinazohitajika tu kukamilisha agizo lako: jina, namba ya simu, eneo la kufikisha, na maelezo ya bidhaa ulizozagiza. Huhitaji kuwa na akaunti — hatukusanyi barua pepe au neno la siri la wateja.'
          : 'EdRetail collects only the information needed to complete your order: your name, phone number, delivery location, and the products you order. No account is needed to order — we do not collect customer email addresses or passwords.',
        sw
          ? 'Upendeleo wa lugha na mkoba wako huhifadhiwa kwenye kivinjari chako (localStorage). Ukifika kupitia kiungo cha msambazaji (k.m. @jina), kiungo hicho kinaletwa kwenye ukurasa na kutumika kuonesha duka la msambazaji husika.'
          : 'Your language preference and cart are stored in your browser (localStorage). If you arrive through a distributor link (e.g. @name), that link is read from the page address and used to show the relevant distributor store.',
        sw
          ? 'Taarifa zako huhifadhiwa kwenye mfumo wa hifadhi ulio salama (Supabase) na haziuzi kwa wahusika wengine. Kumbukumbu za maagizo huhifadhiwa kwa madhumuni ya biashara na uhasibu tu.'
          : 'Your information is stored in secure cloud infrastructure (Supabase) and is never sold to third parties. Order records are kept for business and accounting purposes only.',
        sw
          ? 'Huna wajibu wa kupokea matangazo; hatutumii matangazo bila idhini yako. Ujumbe wa WhatsApp unaohusiana na agizo lako hutumwa kutoka kwa WhatsApp yako mwenyewe — EdRetail inaandaa ujumbe lakini haioni mazungumzo yako.'
          : 'Marketing is opt-in; we do not send promotional messages without your consent. Order-related WhatsApp messages are sent from your own WhatsApp account — EdRetail prepares the message but does not see your conversation.',
        sw
          ? 'Kwa mujibu wa kanuni za Sheria ya Ulinzi wa Taarifa Binafsi ya Tanzania (PDPA), una haki ya kupata, kusahihisha, au kuagiza kufutwa kwa taarifa zako. Tutekeleze ombi la busara unalotuma kwa support@edretail.tz. Hati hii ni mwongozo wa bidhaa, si ushauri wa kisheria.'
          : 'In line with the principles of Tanzania’s Personal Data Protection Act (PDPA), you may request access to, correction of, or deletion of your personal data. We will action reasonable requests sent to support@edretail.tz. This document is product guidance, not legal advice.',
      ],
    },
    {
      id: 'terms',
      icon: ScrollText,
      title: sw ? 'Masharti ya Matumizi' : 'Terms of Service',
      blocks: [
        sw
          ? 'Bidhaa zinauzwa kwa TZS. Malipo yanaweza kufanywa kwa Lipa Namba / M-Pesa / Airtel Money / Tigo Pesa / Halo Pesa (kwenye namba ya msambazaji aliyekubaliwa) au Cash on Delivery pale inapopatikana. Bei zilizoonyeshwa ndizo halali wakati wa kuagiza.'
          : 'Products are priced in TZS. Payment can be made via Lipa Namba / M-Pesa / Airtel Money / Tigo Pesa / Halo Pesa (to the authorized distributor’s number shown at checkout) or Cash on Delivery where available. Displayed prices are the applicable prices at the time of ordering.',
        sw
          ? 'Agizo halijakamilika hadi msambazaji wako athibitishe kupitia WhatsApp — kuthibitisha upatikanaji wa bidhaa, malipo, na utoaji. Tunashauri kutuma uthibitisho wa malipo (SMS ya muamala) kwenye mazungumzo hayo ya WhatsApp.'
          : 'An order is only complete once your distributor confirms it via WhatsApp — verifying product availability, payment, and dispatch. We recommend forwarding your payment confirmation (transaction SMS) in the same WhatsApp chat.',
        sw
          ? 'Bidhaa za Edmark ni virutubisho na bidhaa za afya — si dawa. Zisitumike kuchukua nafasi ya ushauri wa kitaalamu wa afya; wasiliana na mtaalamu wa afya kuhusu hali zozote za kiafya. Matokeo hutofautiana kati ya watu.'
          : 'Edmark products are food supplements and wellness products — not medicines. They are not a substitute for professional medical advice; consult a healthcare professional regarding any medical condition. Individual results vary.',
        sw
          ? 'Kurudisha bidhaa: bidhaa zisizofunguliwa na zisizoharibika zinarudishwa kwa makubaliano na msambazaji wako au timu ya EdRetail. Malipo yanarudishwa kwa njia iliyotumika, kando na gharama za usafirishaji.'
          : 'Returns: unopened, undamaged products may be returned by agreement with your distributor or the EdRetail team. Refunds are issued via the original payment method, excluding delivery costs.',
        sw
          ? 'Bidhaa halisi za Edmark zinalindwa na haki za biashara za Edmark International. Alama ya EdRetail na muundo wa duka hili ni mali ya ED Retail Tanzania.'
          : 'Genuine Edmark products are protected by Edmark International trademarks. The EdRetail brand and this store’s design belong to ED Retail Tanzania.',
      ],
    },
    {
      id: 'delivery',
      icon: Truck,
      title: sw ? 'Uwasilishaji & Kurudisha' : 'Delivery & Returns',
      blocks: [
        sw
          ? 'Eneo lako la uwasilishaji huamuliwa na ukanda wa msambazaji wako — angalia ukurasa wa Uwasilishaji kwa maeneo na muda wa kufikisha. Msambazaji atakuwasiliana kupitia WhatsApp kuhusu muda halisi wa kufikisha.'
          : 'Your delivery area is determined by your distributor’s coverage zone — see the Delivery page for areas and transit expectations. Your distributor will contact you via WhatsApp with the actual delivery timing.',
        sw
          ? 'Malipo ya mkononi (mobile money) yanahitajika kabla ya kufungasha kwa maeneo yasiyo ya Cash on Delivery. Uthibitisho wa malipo unaharakisha usafirishaji.'
          : 'Mobile-money payment is required before dispatch for non-Cash-on-Delivery areas. Forwarding your payment confirmation speeds up shipping.',
        sw
          ? 'Ikiwa bidhaa imefika ikiwa imeharibika au si sahihi, wasiliana na msambazaji wako ndani ya siku 7 kwa mchakato wa kusahihisha. Hatuuza bidhaa ghushi; kila bidhaa ina dhamana ya uhalisi wa Edmark.'
          : 'If a product arrives damaged or incorrect, contact your distributor within 7 days for resolution. We do not sell counterfeit goods; every product carries the Edmark authenticity guarantee.',
      ],
    },
    {
      id: 'whatsapp',
      icon: MessageCircle,
      title: sw ? 'WhatsApp & Mawasiliano' : 'WhatsApp & Contact',
      blocks: [
        sw
          ? 'Mchakato wetu wa kuagiza unatumia WhatsApp yako mwenyewe: tunakusanyia ujumbe wenye bidhaa, kiasi, jumla na namba ya malipo, kisha wewe mwenyewe unautuma. Hivyo mazungumzo yako na msambazaji yanasalia kati yenu — EdRetail haifikii ujumbe wako wa kibinafsi.'
          : 'Our ordering process uses your own WhatsApp: we prepare a message with the products, quantities, total, and payment number, and you send it yourself. Your chat with the distributor stays between you — EdRetail does not access your private messages.',
        sw
          ? 'Usimpe mtu yeyote PIN yako ya malipo au OTP; wafanyakazi wetu na wasambazaji hawataomba kamwe PIN au OTP yako kwa simu au WhatsApp.'
          : 'Never share your payment PIN or OTP with anyone; our staff and distributors will never ask for your payment PIN or OTP by phone or WhatsApp.',
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-10 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-neutral-200 pb-5">
        <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
          {sw ? 'Faragha, Masharti & Taarifa' : 'Privacy, Terms & Information'}
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-neutral-500 max-w-2xl leading-relaxed">
          {sw
            ? 'Tunachokusanya, kwa nini, na jinsi tunavyolinda taarifa zako — pamoja na masharti ya ununuzi na mawasiliano.'
            : 'What we collect, why, and how we protect your information — plus the terms of shopping with us.'}
        </p>
      </div>

      {/* Section anchor nav */}
      <nav aria-label={sw ? 'Sehemu za Ukurasa' : 'Page Sections'} className="flex flex-wrap gap-2">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#legal-${s.id}`}
            className="px-3 py-1.5 rounded-xl bg-white border border-neutral-200 text-[11px] font-bold text-neutral-600 hover:text-primary-700 hover:border-primary-300 transition-colors"
          >
            {s.title}
          </a>
        ))}
      </nav>

      {/* Sections */}
      {sections.map((s) => (
        <section
          key={s.id}
          id={`legal-${s.id}`}
          className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-5 sm:p-6 scroll-mt-20"
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-700 border border-primary-100 flex items-center justify-center shrink-0">
              <s.icon className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-extrabold text-neutral-900">{s.title}</h2>
          </div>
          <div className="space-y-3">
            {s.blocks.map((b, i) => (
              <p key={i} className="text-xs text-neutral-600 leading-relaxed">
                {b}
              </p>
            ))}
          </div>
        </section>
      ))}

      {/* Contact */}
      <section className="bg-primary-50/60 border border-primary-100 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-primary-600 text-white flex items-center justify-center shrink-0">
          <Mail className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-extrabold text-neutral-900 mb-1">
            {sw ? 'Maombi ya Faragha & Malalamiko' : 'Privacy Requests & Complaints'}
          </h2>
          {contactLine}
        </div>
      </section>

      <p className="text-[11px] text-neutral-400 leading-relaxed">
        {sw
          ? 'Hati hii inaeleza jinsi tovuti hii inavyofanya kazi leo. Taarifa za bidhaa zinazohusu afya ni kwa madhumuni ya elimu tu; wasiliana na mtaalamu wa afya kwa ushauri wa kimatibabu. Hakuna taarifa katika ukurasa huu inayobadilisha masharti halali ya mkataba wowote na msambazaji wako.'
          : 'This document describes how this website operates today. Health-related product information is for educational purposes only; consult a healthcare professional for medical advice. Nothing on this page overrides the actual terms of any agreement with your distributor.'}
      </p>
    </div>
  );
}