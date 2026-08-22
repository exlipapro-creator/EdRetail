import { EDMARK_KNOWLEDGE_BASE } from '../data/edmarkKnowledgeBase';
import { useDistributorStore } from '../store/distributorStore';
import { PRODUCTS } from '../types';
import { WHATSAPP_LINK, DISTRIBUTOR_NAME } from './whatsappCompiler';

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user' | 'system';
  text: string;
  timestamp: string;
  options?: { label: string; action: string; payload?: unknown }[];
  actionType?: 'add_to_cart' | 'whatsapp_handoff' | 'whatsapp_share' | 'price_updated' | 'stock_toggled' | 'sale_logged' | 'report_ready';
  actionPayload?: unknown;
}

export function parseCustomerOrDistributorIntent(
  input: string,
  isAdmin: boolean,
  lang: 'en' | 'sw' = 'sw'
): ChatMessage {
  const rawText = input.trim();
  const text = rawText.toLowerCase();
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const msgId = 'msg-' + Date.now();

  // ── 1. ADMIN PIN / UNLOCK COMMANDS ──
  if (
    text === 'admin' ||
    text === 'admin login' ||
    text === '255' ||
    text === '1234' ||
    text.includes('mwanahamisi login') ||
    text === '*255*'
  ) {
    useDistributorStore.getState().setAdminAuthenticated(true);
    return {
      id: msgId,
      sender: 'bot',
      timestamp: now,
      text:
        lang === 'sw'
          ? `Karibu Mwanahamisi! (Distributor Command Center)\n\nUko kwenye chumba kikuu cha usimamizi wa biashara. Chagua unachotaka kufanya au andika kwa maneno ya kawaida:`
          : `Welcome Mwanahamisi! (Distributor Command Center)\n\nYou are now in the business cockpit. Select what you would like to do or type naturally:`,
      options: [
        { label: lang === 'sw' ? 'Fungua Dashibodi Kuu' : 'Open Admin Dashboard', action: 'cmd_admin_dashboard' },
        { label: lang === 'sw' ? '3-Month Fund Challenge (2,000 SV)' : '3-Month Fund Challenge', action: 'cmd_maintenance_tracker' },
        { label: lang === 'sw' ? 'Usimamizi wa Stoo (Inventory Toggle)' : 'Manage Stock Toggle', action: 'cmd_manage_catalog' },
        { label: lang === 'sw' ? 'Rekodi Mauzo ya Mkononi' : 'Log Offline Sale', action: 'cmd_prompt_sale' },
        { label: lang === 'sw' ? 'Ushauri wa Faida & Mikakati' : 'Profit Advisory', action: 'cmd_financial_advice' },
        { label: lang === 'sw' ? 'Rudi Hali ya Wateja' : 'Exit to Customer Mode', action: 'cmd_exit_admin' },
      ],
    };
  }

  // ── 2. ADMIN ACTIONS (IF AUTHENTICATED) ──
  if (isAdmin) {
    // A. Financial Report
    if (
      text.includes('ripoti') ||
      text.includes('report') ||
      text.includes('faida') ||
      (text.includes('mauzo') && !text.includes('rekodi')) ||
      text.includes('financial')
    ) {
      const summary = useDistributorStore.getState().getFinancialSummary('all');

      const reportText =
        lang === 'sw'
          ? `RIPOTI YA BIASHARA - ED RETAIL\n` +
            `Msambazaji: ${DISTRIBUTOR_NAME}\n` +
            `Tarehe: ${new Date().toLocaleDateString('sw-TZ')}\n` +
            `────────────────────\n` +
            `Jumla ya Mauzo Yote: TZS ${summary.totalRevenue.toLocaleString()}\n` +
            `Pesa Mkononi (Cash/M-Pesa): TZS ${summary.cashCollected.toLocaleString()}\n` +
            `Madeni Yanayodaiwa: TZS ${summary.creditOutstanding.toLocaleString()}\n` +
            `Makadirio ya Faida Halisi: TZS ${summary.estimatedNetProfit.toLocaleString()}\n` +
            `Jumla ya Alama (SV): ${summary.totalSvPoints} SV (${summary.totalBvPoints} BV)\n` +
            `Jumla ya Bidhaa Zilizouzwa: ${summary.totalUnitsSold} units\n` +
            `────────────────────\n` +
            `Madeni yaliyopitiliza: ${summary.overdueDebtsCount}\n` +
            `Wateja wa Refill leo: ${summary.pendingRefillsCount}\n\n` +
            `Je, ungependa nitume muhtasari huu moja kwa moja kwenye WhatsApp yako?`
          : `ED RETAIL BUSINESS PERFORMANCE REPORT\n` +
            `Distributor: ${DISTRIBUTOR_NAME}\n` +
            `Date: ${new Date().toLocaleDateString('en-GB')}\n` +
            `────────────────────\n` +
            `Total Gross Volume: TZS ${summary.totalRevenue.toLocaleString()}\n` +
            `Cash In Hand / Collected: TZS ${summary.cashCollected.toLocaleString()}\n` +
            `Outstanding Receivables: TZS ${summary.creditOutstanding.toLocaleString()}\n` +
            `Estimated Net Retail Profit: TZS ${summary.estimatedNetProfit.toLocaleString()}\n` +
            `Total SV Points: ${summary.totalSvPoints} SV\n` +
            `Units Sold: ${summary.totalUnitsSold} items\n` +
            `────────────────────\n\n` +
            `Would you like to send this report to your WhatsApp?`;

      const waReportUrl = `${WHATSAPP_LINK}?text=${encodeURIComponent(reportText)}`;

      return {
        id: msgId,
        sender: 'bot',
        timestamp: now,
        text: reportText,
        actionType: 'report_ready',
        actionPayload: { url: waReportUrl },
        options: [
          { label: lang === 'sw' ? 'Tuma Ripoti WhatsApp Yangu' : 'Send Report to WhatsApp', action: 'open_url', payload: waReportUrl },
          { label: lang === 'sw' ? 'Fungua Dashibodi Kuu' : 'Open Admin Dashboard', action: 'cmd_admin_dashboard' },
          { label: lang === 'sw' ? 'Alama za Maintenance & Funds' : 'Maintenance & Funds', action: 'cmd_maintenance_tracker' },
          { label: lang === 'sw' ? 'Nipe Ushauri wa Faida' : 'Give Profit Advice', action: 'cmd_financial_advice' },
          { label: lang === 'sw' ? 'Angalia Orodha ya Madeni' : 'View Credit Ledger', action: 'cmd_view_debts' },
        ],
      };
    }

    // A2. Maintenance Tracking
    if (
      text.includes('maintenance') ||
      text.includes('alama') ||
      text.includes('fund') ||
      text.includes('gari') ||
      text.includes('car') ||
      text.includes('nyumba') ||
      text.includes('house') ||
      text.includes('travel') ||
      text.includes('safari') ||
      text.includes('miezi 3') ||
      text.includes('3 months') ||
      text.includes('pacing') ||
      text.includes('2000') ||
      text.includes('sv') ||
      text.includes('downline')
    ) {
      const analysis = useDistributorStore.getState().getMaintenanceAnalysis();
      const records = useDistributorStore.getState().consecutiveMonthsRecord;

      const streakVisual = records
        .map((r) => {
          if (r.status === 'completed') return `[${r.monthName}: ${r.achievedSv} SV - Imekamilika]`;
          if (r.status === 'current') return `[${r.monthName}: ${analysis.totalSv}/${r.targetSv} SV (${analysis.percentComplete}%)]`;
          return `[${r.monthName}: Inasubiri]`;
        })
        .join('\n');

      let maintenanceText = '';
      if (lang === 'sw') {
        maintenanceText =
          `CHALLENGE YA MIEZI 3 - EDMARK ${analysis.fundName.toUpperCase()}\n` +
          `────────────────────\n` +
          `Mzunguko wa Siku 90 (3-Month Streak):\n${streakVisual}\n\n` +
          `Hali ya Mwezi Huu (Mwezi ${analysis.currentMonthIndex}/3):\n` +
          `• Lengo la Kikundi (CPGS): ${analysis.targetSv.toLocaleString()} SV\n` +
          `• Alama Zilizofikiwa Leo: ${analysis.totalSv.toLocaleString()} SV (${analysis.percentComplete}%)\n` +
          `• Alama Binafsi (CPS): ${analysis.personalCurrentSv}/100 SV\n` +
          `• Pengo Lililobaki: ${analysis.gapSv.toLocaleString()} SV\n` +
          `• Siku Zilizobaki Mwezini: ${analysis.daysRemaining} siku\n` +
          `• Kasi Inayohitajika: ${analysis.dailyPacingSv} SV/siku\n\n` +
          `Ushauri wa Kimkakati: Ili kuziba pengo hili kwa urahisi, piga simu kwa wateja waliomaliza Shake Off siku 10 zilizopita kwa ajili ya refill.`;
      } else {
        maintenanceText =
          `3-MONTH STREAK CHALLENGE - EDMARK ${analysis.fundName.toUpperCase()}\n` +
          `────────────────────\n` +
          `90-Day Pacing Progress:\n${streakVisual}\n\n` +
          `Current Month Target (Month ${analysis.currentMonthIndex}/3):\n` +
          `• Group Target (CPGS): ${analysis.targetSv.toLocaleString()} SV\n` +
          `• Current Points: ${analysis.totalSv.toLocaleString()} SV (${analysis.percentComplete}%)\n` +
          `• Remaining Gap: ${analysis.gapSv.toLocaleString()} SV (${analysis.dailyPacingSv} SV/day)\n\n` +
          `Tip: Proactively message Day-10 refill clients to lock in remaining volume.`;
      }

      return {
        id: msgId,
        sender: 'bot',
        timestamp: now,
        text: maintenanceText,
        options: [
          { label: lang === 'sw' ? 'Fungua Tracker ya Miezi 3' : 'Open 3-Month Fund Tracker', action: 'cmd_maintenance_tracker' },
          { label: lang === 'sw' ? 'Arifa za Refill za Siku 10' : 'Day-10 Refill CRM', action: 'cmd_admin_dashboard' },
          { label: lang === 'sw' ? 'Angalia Ripoti ya Mauzo' : 'View Sales Report', action: 'cmd_report_today' },
        ],
      };
    }

    // Debts inquiry
    if (text.includes('madeni') || text.includes('debt') || text.includes('ledger') || text.includes('daftari')) {
      const debts = useDistributorStore.getState().sales.filter((s) => s.balanceDue > 0);
      if (debts.length === 0) {
        return {
          id: msgId,
          sender: 'bot',
          timestamp: now,
          text: lang === 'sw' ? 'Hongera! Huna mteja yeyote anayekudai kwa sasa.' : 'No outstanding customer debts currently!',
          options: [
            { label: lang === 'sw' ? 'Fungua Dashibodi Kuu' : 'Open Admin Dashboard', action: 'cmd_admin_dashboard' },
          ],
        };
      }

      const debtList = debts
        .map((d, i) => {
          return `${i + 1}. ${d.customerName} (${d.customerPhone || 'Simu haipo'}): Anadaiwa TZS ${d.balanceDue.toLocaleString()} (${d.productName}) | Tarehe: ${d.dueDate || 'Haikupangwa'}`;
        })
        .join('\n\n');

      return {
        id: msgId,
        sender: 'bot',
        timestamp: now,
        text:
          lang === 'sw'
            ? `ORODHA YA MADENI YA WATEJA\n────────────────────\n${debtList}\n\nUnaweza kubonyeza hapa chini kutuma ujumbe wa kistaarabu wa kumbusho WhatsApp.`
            : `OUTSTANDING CUSTOMER DEBTS\n────────────────────\n${debtList}`,
        options: [
          { label: lang === 'sw' ? 'Tuma Kumbusho la Kirafiki WhatsApp' : 'Send Polite WA Reminder', action: 'cmd_send_debt_reminder' },
          { label: lang === 'sw' ? 'Fungua Dashibodi Kuu' : 'Open Admin Dashboard', action: 'cmd_admin_dashboard' },
        ],
      };
    }
  }

  // ── 3. COMPREHENSIVE CONVERSATIONAL HEALTH CONCIERGE ──

  // TOPIC 1: WEIGHT GAIN / HEALTHY BULKING / ONGEZA UZITO / SPIRULINA & SPIRO
  if (
    text.includes('gain weight') ||
    text.includes('kuongeza uzito') ||
    text.includes('ongeza uzito') ||
    text.includes('ongeza mwili') ||
    text.includes('kuwa mnene') ||
    text.includes('unene wenye afya') ||
    text.includes('weight gain') ||
    text.includes('build muscle') ||
    text.includes('skinny') ||
    text.includes('kukonda') ||
    text.includes('kupata mwili') ||
    text.includes('mwani') ||
    text.includes('spiro')
  ) {
    const spirulina = PRODUCTS.find((p) => p.id === 'hawaiian-spirulina');
    const spiro = PRODUCTS.find((p) => p.id === 'spiro-cereal');
    const splina = PRODUCTS.find((p) => p.id === 'splina-chlorophyll');

    return {
      id: msgId,
      sender: 'bot',
      timestamp: now,
      text:
        lang === 'sw'
          ? `Mwongozo wa Kuongeza Uzito na Mwili Wenye Afya (Healthy Weight Gain):\n\n` +
            `Ikiwa unataka kuongeza uzito na kupata mwili mzuri bila kujaza mafuta mabaya tumboni, Edmark ina mchanganyiko maalum wa asili unaofanya kazi kupitia hatua hizi:\n\n` +
            `1. Hawaiian Spirulina (Mwani Safi wa Baharini):\n` +
            `• Ina zaidi ya 60% ya protini asilia ya mimea, madini ya chuma, na amino acids zinazosaidia kujenga misuli na kuongeza hamu ya kula.\n` +
            `• Ratiba ya kuongeza uzito: Kunywa vidonge 2 hadi 3 mara 3 kwa siku dakika 30 BAADA ya chakula (badala ya kabla ya kula).\n\n` +
            `2. SpiRO Oat Cereal (Ngano na Mwani):\n` +
            `• Lishe mnono yenye nyuzinyuzi na protini inayoongeza kalori safi na nishati mwilini.\n\n` +
            `3. Splina Liquid Chlorophyll:\n` +
            `• Inasafisha kuta za utumbo na kuwezesha mwili kufyonza virutubisho vyote vya chakula unachokula badala ya chakula kupita bila kunufaisha mwili.\n\n` +
            `Je, ungependa kuanza na Hawaiian Spirulina au pakiti ya lishe ya Spirulina na Splina?`
          : `Healthy Weight Gain & Muscle Nourishment Guide:\n\n` +
            `If your goal is to build lean healthy body mass and increase appetite without accumulating toxic abdominal visceral fat, here is the proven Edmark protocol:\n\n` +
            `1. Hawaiian Spirulina:\n` +
            `• Contains over 60% pure complete vegetable protein, bioavailable iron, and essential amino acids that stimulate healthy muscle development and appetite.\n` +
            `• Weight Gain Protocol: Take 2-3 tablets 3 times daily 30 minutes AFTER meals (paired with full-fat milk, juice, or smoothies).\n\n` +
            `2. SpiRO Oat Cereal:\n` +
            `• Calorie-dense, nutrient-rich oat cereal infused with Hawaiian Spirulina for sustained energy and daily bulk.\n\n` +
            `3. Splina Liquid Chlorophyll:\n` +
            `• Optimizes gastrointestinal absorption efficiency so your digestive system absorbs all vitamins and proteins from your daily meals.\n\n` +
            `Would you like to add Hawaiian Spirulina to your cart or consult directly on WhatsApp?`,
      options: [
        { label: lang === 'sw' ? 'Weka Hawaiian Spirulina Mkobani (TZS 32,000)' : 'Add Hawaiian Spirulina to Cart', action: 'add_to_cart', payload: spirulina },
        { label: lang === 'sw' ? 'Weka SpiRO Cereal (TZS 26,000)' : 'Add SpiRO Cereal', action: 'add_to_cart', payload: spiro },
        { label: lang === 'sw' ? 'Weka Splina Chlorophyll (TZS 28,000)' : 'Add Splina Chlorophyll', action: 'add_to_cart', payload: splina },
        { label: lang === 'sw' ? 'Ongea na Msambazaji WhatsApp' : 'Consult on WhatsApp', action: 'open_whatsapp_consult' },
      ],
    };
  }

  // TOPIC 2: PREGNANCY & BREASTFEEDING SAFETY
  if (
    text.includes('mjamzito') ||
    text.includes('mimba') ||
    text.includes('kunyonyesha') ||
    text.includes('pregnant') ||
    text.includes('pregnancy') ||
    text.includes('breastfeed') ||
    text.includes('nursing') ||
    text.includes('mtoto mchanga')
  ) {
    const splina = PRODUCTS.find((p) => p.id === 'splina-chlorophyll');
    const spirulina = PRODUCTS.find((p) => p.id === 'hawaiian-spirulina');

    return {
      id: msgId,
      sender: 'bot',
      timestamp: now,
      text:
        lang === 'sw'
          ? `Mwongozo wa Usalama kwa Wajawazito na Wanaonyonyesha:\n\n` +
            `Afya ya mama na mtoto ni kipaumbele kikuu. Huu hapa mgawanyo rasmi wa bidhaa za Edmark:\n\n` +
            `BIDHAA SALAMA NA ZINAZOSHAURIWA SANA:\n` +
            `• Splina Liquid Chlorophyll: Nzuri sana! Huongeza kiwango cha damu (hemoglobin), huondoa asidi na kiungulia cha ujauzito, na huongeza wingi na ubora wa maziwa ya mama.\n` +
            `• Hawaiian Spirulina: Ina madini ya chuma na protini safi kwa ajili ya ukuaji wa mtoto bila kusababisha kichefuchefu.\n` +
            `• Bubble C: Hutoa vitamini C ya kutosha kuimarisha kinga ya mwili.\n\n` +
            `BIDHAA ZINAZOPASWA KUEPŪKWA WAKATI WA UJAUZITO:\n` +
            `• Shake Off Phyto Fiber & MRT Complex: Hazishauriwi kwa wajawazito au wanaonyonyesha watoto chini ya miezi 6 kwa sababu usafishaji wa utumbo na upunguzaji wa kalori unaweza kuwa mzito kwa mtoto.\n\n` +
            `Kwa maelezo zaidi ya dozi ya mama, bonyeza hapa chini kuwasiliana na Mwanahamisi.`
          : `Pregnancy & Breastfeeding Safety Guide:\n\n` +
            `SAFE & HIGHLY BENEFICIAL PRODUCTS:\n` +
            `• Splina Liquid Chlorophyll: Highly recommended. Boosts red blood cell count (hemoglobin), neutralizes pregnancy heartburn, and enriches breast milk quality.\n` +
            `• Hawaiian Spirulina: Safe, natural plant protein and rich source of bioavailable iron.\n` +
            `• Bubble C: Natural Vitamin C for maternal immune defense.\n\n` +
            `PRODUCTS TO AVOID DURING PREGNANCY:\n` +
            `• Shake Off Phyto Fiber & MRT Complex: Not recommended during pregnancy or while exclusively nursing babies under 6 months due to intensive colon detox motility and calorie restriction.\n\n` +
            `Would you like to start with Splina Chlorophyll?`,
      options: [
        { label: lang === 'sw' ? 'Weka Splina Chlorophyll Mkobani' : 'Add Splina Chlorophyll to Cart', action: 'add_to_cart', payload: splina },
        { label: lang === 'sw' ? 'Weka Hawaiian Spirulina' : 'Add Hawaiian Spirulina', action: 'add_to_cart', payload: spirulina },
        { label: lang === 'sw' ? 'Pata Ushauri wa Kibinafsi WhatsApp' : 'Get Personal Advice on WA', action: 'open_whatsapp_consult' },
      ],
    };
  }

  // TOPIC 3: STOMACH ULCERS, ACID REFLUX, GASTRO & KIUNGULIA
  if (
    text.includes('vidonda') ||
    text.includes('ulcer') ||
    text.includes('kiungulia') ||
    text.includes('asidi') ||
    text.includes('acid') ||
    text.includes('gesi') ||
    text.includes('gastritis') ||
    text.includes('tumbo kuwaka') ||
    text.includes('goal_ulcers')
  ) {
    const splina = PRODUCTS.find((p) => p.id === 'splina-chlorophyll');
    const spirulina = PRODUCTS.find((p) => p.id === 'hawaiian-spirulina');

    return {
      id: msgId,
      sender: 'bot',
      timestamp: now,
      text:
        lang === 'sw'
          ? `Suluhisho la Uhakika la Vidonda vya Tumbo, Kiungulia & Asidi:\n\n` +
            `Splina Liquid Chlorophyll ndio suluhisho kuu linalopendwa zaidi nchini kwa changamoto za kuta za tumbo:\n\n` +
            `• Hutuliza Asidi Ndani ya Dakika 15: Chlorophyll ina asili ya alkali (pH ya juu) inayopunguza ukali wa asidi ya hydrochloric mara moja.\n` +
            `• Huponya Kuta za Tumbo: Huweka tabaka la ulinzi (mucosal coating) linaloruhusu vidonda kupona bila kuchomwa na asidi.\n` +
            `• Huondoa Gesi & Kuvimbiwa: Huweka sawa usagaji wa chakula tumboni.\n\n` +
            `Ratiba ya Matumizi:\n` +
            `Kunywa kifuniko 1 cha Splina kwenye glasi 1 ya maji ya kawaida (yasiyo ya baridi wala moto sana) asubuhi kabla ya kula na jioni kabla ya kulala.`
          : `Natural Protocol for Stomach Ulcers, Acid Reflux & Gastritis:\n\n` +
            `Splina Liquid Chlorophyll is an alkaline botanical formula designed for digestive mucosal recovery:\n\n` +
            `• Rapid Acid Relief: Neutralizes aggressive gastric acid within 15 minutes of intake.\n` +
            `• Accelerates Tissue Healing: Forms a soothing alkaline layer over the stomach lining to promote natural ulcer healing.\n` +
            `• Relieves Bloating & Gas: Restores balanced enzymatic digestive motility.\n\n` +
            `Dosage: Mix 1 capful in room-temperature water twice daily on an empty stomach.`,
      options: [
        { label: lang === 'sw' ? 'Weka Splina Mkobani (TZS 28,000)' : 'Add Splina to Cart', action: 'add_to_cart', payload: splina },
        { label: lang === 'sw' ? 'Weka Spirulina ya Vidonda' : 'Add Spirulina', action: 'add_to_cart', payload: spirulina },
        { label: lang === 'sw' ? 'Ongea na Mwanahamisi WhatsApp' : 'Chat on WhatsApp', action: 'open_whatsapp_consult' },
      ],
    };
  }

  // TOPIC 4: WEIGHT LOSS / POTBELLY / P4 SLIMMING SYSTEM
  if (
    text.includes('punguza') ||
    text.includes('kitambi') ||
    text.includes('tumbo') ||
    text.includes('slimming') ||
    text.includes('lose weight') ||
    text.includes('belly fat') ||
    text.includes('p4') ||
    text.includes('mrt') ||
    text.includes('shake off') ||
    text.includes('goal_weight_loss')
  ) {
    const shakeOff = PRODUCTS.find((p) => p.id === 'shake-off-phyto');
    const mrt = PRODUCTS.find((p) => p.id === 'mrt-complex');

    return {
      id: msgId,
      sender: 'bot',
      timestamp: now,
      text:
        lang === 'sw'
          ? `Mfumo Rasmi wa Kupunguza Uzito & Kitambi (P4 Slimming System):\n\n` +
            `Kupunguza kitambi kupitia Edmark hakuhitaji kujinyima kula au mazoezi magumu ya kuumiza mwili. Mfumo unatumia hatua 2 za kibayolojia:\n\n` +
            `Hatua 1: Shake Off Phyto Fiber (Kusafisha Utumbo)\n` +
            `• Huondoa sumu na uchafu ulioganda kwenye kuta za utumbo unaofanya tumbo liwe gumu na kubwa.\n` +
            `• Matokeo yanaonekana ndani ya masaa 6–8 baada ya kunywa.\n\n` +
            `Hatua 2: MRT Complex (Mlo Mbadala wa Kuchoma Mafuta)\n` +
            `• Mlo kamili wenye kalori chache lakini virutubisho 100% vya mwili. Huufanya mwili kuchoma mafuta ya ziada ya ndani bila kusababisha kizunguzungu wala njaa.\n\n` +
            `Matokeo ya kawaida: Upungufu wa kilo 3 hadi 7 ndani ya siku 14–21!`
          : `Official Edmark P4 Slimming & Fat Reduction Protocol:\n\n` +
            `Edmark's weight management protocol achieves safe, lasting weight reduction through a synergistic 2-step process:\n\n` +
            `Step 1: Shake Off Phyto Fiber (Colon Cleansing)\n` +
            `• Flushes encrusted mucoid plaque and toxic waste from the colon walls.\n` +
            `• Noticeable tummy flattening within 6 to 8 hours.\n\n` +
            `Step 2: MRT Complex (Fat Burning Meal Replacement)\n` +
            `• Clinically formulated meal replacement that satisfies hunger while inducing natural thermogenic fat burning.\n\n` +
            `Expected result: 3–7 kg healthy weight loss within 14 to 21 days.`,
      options: [
        { label: lang === 'sw' ? 'Weka Pakiti ya P4 (Punguzo la 10%)' : 'Add P4 Bundle (10% Off)', action: 'add_p4_bundle' },
        { label: lang === 'sw' ? 'Weka Shake Off Tu (TZS 35,000)' : 'Add Shake Off Only', action: 'add_to_cart', payload: shakeOff },
        { label: lang === 'sw' ? 'Weka MRT Complex Tu (TZS 45,000)' : 'Add MRT Complex Only', action: 'add_to_cart', payload: mrt },
        { label: lang === 'sw' ? 'Tazama Ratiba ya Dozi ya P4' : 'View P4 Dosage Schedule', action: 'show_p4_schedule' },
      ],
    };
  }

  // TOPIC 5: CONSTIPATION / KUKOSA CHOO / CHOO KIGUMU / GESI
  if (
    text.includes('kukosa choo') ||
    text.includes('choo kigumu') ||
    text.includes('constipation') ||
    text.includes('kutopata choo') ||
    text.includes('tumbo kujaa') ||
    text.includes('bloating')
  ) {
    const shakeOff = PRODUCTS.find((p) => p.id === 'shake-off-phyto');
    const splina = PRODUCTS.find((p) => p.id === 'splina-chlorophyll');

    return {
      id: msgId,
      sender: 'bot',
      timestamp: now,
      text:
        lang === 'sw'
          ? `Msaada wa Haraka wa Tatizo la Kukosa Choo & Choo Kigumu:\n\n` +
            `Tatizo la kukosa choo husababishwa na ukosefu wa nyuzinyuzi (fiber), ukavu wa utumbo, au uchafu ulioganda. Hivi ndivyo utakavyopata nafuu ya haraka:\n\n` +
            `1. Shake Off Phyto Fiber (Suluhisho la Saa 8):\n` +
            `• Kunywa sachet 1 iliyochanganywa kwenye maji baridi 250ml kabla ya kulala.\n` +
            `• Asubuhi utapata choo laini na chepesi bila maumivu ya tumbo wala kuharisha.\n\n` +
            `2. Splina Liquid Chlorophyll:\n` +
            `• Huweka unyevu na kusafisha utumbo ili tatizo la kukosa choo lisijirudie.\n\n` +
            `Kumbuka kunywa glasi 8 za maji wakati wa mchana.`
          : `Fast Natural Relief for Chronic Constipation & Bloating:\n\n` +
            `1. Shake Off Phyto Fiber:\n` +
            `• Drink 1 sachet in 250ml cold water before sleep.\n` +
            `• Experience gentle, complete bowel evacuation in 6 to 8 hours without painful cramping.\n\n` +
            `2. Splina Liquid Chlorophyll:\n` +
            `• Maintains gastrointestinal hydration and peristalsis to prevent recurring constipation.\n\n` +
            `Would you like to order Shake Off for delivery today?`,
      options: [
        { label: lang === 'sw' ? 'Weka Shake Off Mkobani' : 'Add Shake Off to Cart', action: 'add_to_cart', payload: shakeOff },
        { label: lang === 'sw' ? 'Weka Splina Chlorophyll' : 'Add Splina Chlorophyll', action: 'add_to_cart', payload: splina },
        { label: lang === 'sw' ? 'Agiza Haraka WhatsApp' : 'Quick WhatsApp Order', action: 'open_whatsapp_consult' },
      ],
    };
  }

  // TOPIC 6: MALE STAMINA / TROIKA / GINSENG / ENERGY
  if (
    text.includes('nguvu za kiume') ||
    text.includes('stamina') ||
    text.includes('troika') ||
    text.includes('libido') ||
    text.includes('uchovu') ||
    text.includes('kiume') ||
    text.includes('male energy') ||
    text.includes('goal_energy')
  ) {
    const troika = PRODUCTS.find((p) => p.id === 'cafe-troika');
    const ginseng = PRODUCTS.find((p) => p.id === 'ginseng-coffee');

    return {
      id: msgId,
      sender: 'bot',
      timestamp: now,
      text:
        lang === 'sw'
          ? `Nguvu za Asili, Stamina na Uchangamfu wa Mwili:\n\n` +
            `Edmark inatoa vinywaji asilia 100% visivyo na kemikali wala kuathiri moyo:\n\n` +
            `1. Cafe Troika (Kahawa ya Mimea 3 ya Asili):\n` +
            `• Tongkat Ali: Huongeza homoni ya kiume na nguvu za asili za mwili.\n` +
            `• Ginseng: Huboresha mzunguko wa damu kwenye mishipa midogo ya mwili.\n` +
            `• Ganoderma: Huimarisha moyo na kupunguza maumivu ya mgongo na kiuno.\n\n` +
            `2. Ginseng Coffee:\n` +
            `• Huondoa uchovu kazini, huongeza usikivu wa akili na kukupa nishati siku nzima.\n\n` +
            `Maagizo yote yanasafirishwa kwa usiri mkubwa kwa ajili ya heshima yako.`
          : `Natural Male Stamina, Circulation & Sustained Vitality:\n\n` +
            `100% natural, heart-safe herbal beverages for peak performance:\n\n` +
            `1. Cafe Troika (Tongkat Ali + Ginseng + Ganoderma):\n` +
            `• Tongkat Ali: Natural testosterone support and stamina.\n` +
            `• Ginseng: Promotes healthy micro-vascular blood flow.\n` +
            `• Ganoderma: Supports endurance and vitality without palpitations.\n\n` +
            `2. Ginseng Coffee:\n` +
            `• Sharp mental focus and anti-fatigue booster.\n\n` +
            `Discreet packaging and same-day delivery available.`,
      options: [
        { label: lang === 'sw' ? 'Weka Cafe Troika Mkobani' : 'Add Cafe Troika to Cart', action: 'add_to_cart', payload: troika },
        { label: lang === 'sw' ? 'Weka Ginseng Coffee' : 'Add Ginseng Coffee', action: 'add_to_cart', payload: ginseng },
        { label: lang === 'sw' ? 'Agiza kwa Siri WhatsApp' : 'Discreet WhatsApp Order', action: 'open_whatsapp_consult' },
      ],
    };
  }

  // TOPIC 7: DIFFERENCE BETWEEN COFFEES (TROIKA VS GINSENG VS CAFE 73)
  if (
    text.includes('tofauti ya') ||
    text.includes('difference between') ||
    text.includes('troika na ginseng') ||
    text.includes('kahawa ipi') ||
    text.includes('which coffee')
  ) {
    const troika = PRODUCTS.find((p) => p.id === 'cafe-troika');
    const ginseng = PRODUCTS.find((p) => p.id === 'ginseng-coffee');
    const cafe73 = PRODUCTS.find((p) => p.id === 'cafe-73');

    return {
      id: msgId,
      sender: 'bot',
      timestamp: now,
      text:
        lang === 'sw'
          ? `Ulinganisho wa Kahawa za Edmark (Troika vs Ginseng vs Cafe 73):\n\n` +
            `1. Cafe Troika (Nguvu & Stamina):\n` +
            `• Viungo: Tongkat Ali + Ginseng + Ganoderma.\n` +
            `• Lengo: Stamina ya mwili, nguvu za kiume, na mzunguko wa damu.\n\n` +
            `2. Ginseng Coffee (Nishati & Umakini):\n` +
            `• Viungo: Ginseng safi ya Kikorea.\n` +
            `• Lengo: Kuamsha ubongo, kuzuia uchovu kazini, na kuondoa usingizi mchana.\n\n` +
            `3. Cafe 73 (Ganoderma Bila Sukari):\n` +
            `• Viungo: Ganoderma Lucidum (Kuvu Tiba).\n` +
            `• Lengo: Kinga ya mwili, oksijeni kwenye damu, na inafaa sana kwa wenye kisukari au wasiotumia sukari.`
          : `Edmark Coffee Comparison (Troika vs Ginseng vs Cafe 73):\n\n` +
            `1. Cafe Troika: Tongkat Ali + Ginseng + Ganoderma for peak male stamina and endurance.\n` +
            `2. Ginseng Coffee: Korean Ginseng for daytime focus, mental clarity, and fatigue relief.\n` +
            `3. Cafe 73: Sugar-free Ganoderma coffee ideal for immune support and blood sugar balance.`,
      options: [
        { label: lang === 'sw' ? 'Weka Cafe Troika' : 'Add Troika', action: 'add_to_cart', payload: troika },
        { label: lang === 'sw' ? 'Weka Ginseng Coffee' : 'Add Ginseng', action: 'add_to_cart', payload: ginseng },
        { label: lang === 'sw' ? 'Weka Cafe 73' : 'Add Cafe 73', action: 'add_to_cart', payload: cafe73 },
      ],
    };
  }

  // TOPIC 8: DIABETES & HIGH BLOOD PRESSURE
  if (
    text.includes('kisukari') ||
    text.includes('sukari') ||
    text.includes('diabetes') ||
    text.includes('presha') ||
    text.includes('shinikizo la damu') ||
    text.includes('hypertension') ||
    text.includes('blood pressure')
  ) {
    const splina = PRODUCTS.find((p) => p.id === 'splina-chlorophyll');
    const spirulina = PRODUCTS.find((p) => p.id === 'hawaiian-spirulina');
    const cafe73 = PRODUCTS.find((p) => p.id === 'cafe-73');

    return {
      id: msgId,
      sender: 'bot',
      timestamp: now,
      text:
        lang === 'sw'
          ? `Msaada wa Asili wa Kisukari na Shinikizo la Damu (Presha):\n\n` +
            `Edmark ina virutubisho asilia vinavyosaidia kuboresha afya ya mishipa ya damu na kimetaboliki:\n\n` +
            `1. Splina Liquid Chlorophyll:\n` +
            `• Inasafisha damu, inapunguza ukali wa asidi mwilini, na huboresha mzunguko wa damu kwenye mishipa mikuu.\n\n` +
            `2. Cafe 73 (Ganoderma Coffee Bila Sukari):\n` +
            `• Ganoderma ina adenosine inayosaidia kulegeza mishipa ya damu na kusawazisha shinikizo la damu kiasili.\n\n` +
            `3. Hawaiian Spirulina:\n` +
            `• Hutoa madini muhimu na protini bila kuongeza kiwango cha sukari kwenye damu.`
          : `Natural Support for Blood Sugar & Blood Pressure Balance:\n\n` +
            `1. Splina Liquid Chlorophyll: Purifies blood and alkalizes the system for smooth circulation.\n` +
            `2. Cafe 73: Sugar-free Ganoderma coffee that helps relax arterial walls and supports healthy BP.\n` +
            `3. Hawaiian Spirulina: Low glycemic nutritional powerhouse.`,
      options: [
        { label: lang === 'sw' ? 'Weka Splina Mkobani' : 'Add Splina', action: 'add_to_cart', payload: splina },
        { label: lang === 'sw' ? 'Weka Cafe 73 (Bila Sukari)' : 'Add Cafe 73', action: 'add_to_cart', payload: cafe73 },
        { label: lang === 'sw' ? 'Weka Hawaiian Spirulina' : 'Add Spirulina', action: 'add_to_cart', payload: spirulina },
      ],
    };
  }

  // TOPIC 9: JOINING EDMARK AS DISTRIBUTOR
  if (
    text.includes('msambazaji') ||
    text.includes('biashara') ||
    text.includes('kujiunga') ||
    text.includes('join edmark') ||
    text.includes('distributor') ||
    text.includes('faida ya biashara')
  ) {
    return {
      id: msgId,
      sender: 'bot',
      timestamp: now,
      text:
        lang === 'sw'
          ? `Jinsi ya Kuwa Msambazaji Rasmi wa Edmark Tanzania:\n\n` +
            `Kujiunga na biashara ya Edmark kupitia kiongozi wetu ${DISTRIBUTOR_NAME} kunakupa faida zifuatazo:\n\n` +
            `• Punguzo la Bei ya Jumla (15% hadi 25% ya Faida ya Rejareja).\n` +
            `• Bonasi 9 tofauti za kila mwezi zikiwemo House Fund, Car Fund na Travel Fund.\n` +
            `• Duka lako binafsi la kisasa mtandaoni (Online Store Link) kama hili kwa jina lako.\n` +
            `• Mafunzo ya bure ya bidhaa na jinsi ya kuuza kupitia WhatsApp na mitandao ya kijamii.\n\n` +
            `Bonyeza hapa chini kuwasiliana na Mwanahamisi upokee maelekezo ya kujiandikisha.`
          : `How to Become an Authorized Edmark Distributor:\n\n` +
            `Partner with ${DISTRIBUTOR_NAME} to unlock direct wholesale distributor pricing (15-25% retail profit), 9 monthly company bonuses, your own replicated web storefront, and personal mentorship.\n\n` +
            `Would you like to connect directly on WhatsApp to get registered?`,
      options: [
        { label: lang === 'sw' ? 'Jiunge Kupitia WhatsApp' : 'Connect on WhatsApp', action: 'open_whatsapp_consult' },
        { label: lang === 'sw' ? 'Tazama Bidhaa za Dukani' : 'View Store Products', action: 'nav_products' },
      ],
    };
  }

  // TOPIC 10: SPECIFIC INDIVIDUAL PRODUCT INQUIRIES
  const allProductKeys = Object.keys(EDMARK_KNOWLEDGE_BASE);
  for (const key of allProductKeys) {
    const kb = EDMARK_KNOWLEDGE_BASE[key];
    const pName = kb.name.toLowerCase();
    const pSw = kb.swahiliName.toLowerCase();

    if (
      text.includes(key) ||
      text.includes(pName) ||
      text.includes(pSw) ||
      (key === 'cocollagen' && (text.includes('collagen') || text.includes('kolajeni'))) ||
      (key === 'bubble-c' && (text.includes('bubble c') || text.includes('vitamini c'))) ||
      (key === 'bio-elixir' && (text.includes('bio elixir') || text.includes('elixir') || text.includes('hgh')))
    ) {
      const pObj = PRODUCTS.find((p) => p.id === key);
      const effectivePrice = pObj ? useDistributorStore.getState().getEffectiveProducts().find((p) => p.id === key)?.price || pObj.price : kb.suggestedRetailTzs;

      return {
        id: msgId,
        sender: 'bot',
        timestamp: now,
        text:
          lang === 'sw'
            ? `${kb.swahiliName}\n${kb.taglineSw}\n\n` +
              `Bei Rasmi: TZS ${effectivePrice.toLocaleString()}\n` +
              `Kifurushi: ${kb.packSize}\n\n` +
              `Faida Kuu:\n${kb.keyBenefitsSw.slice(0, 3).map((b) => `• ${b}`).join('\n')}\n\n` +
              `Jinsi ya Kutumia:\n${kb.exactDosageSw}`
            : `${kb.name}\n${kb.taglineEn}\n\n` +
              `Retail Price: TZS ${effectivePrice.toLocaleString()}\n` +
              `Pack Size: ${kb.packSize}\n\n` +
              `Key Benefits:\n${kb.keyBenefitsEn.slice(0, 3).map((b) => `• ${b}`).join('\n')}\n\n` +
              `Dosage Instructions:\n${kb.exactDosageEn}`,
        options: [
          { label: lang === 'sw' ? `Weka ${kb.name} Mkobani` : `Add ${kb.name} to Cart`, action: 'add_to_cart', payload: pObj },
          { label: lang === 'sw' ? 'Agiza WhatsApp Moja kwa Moja' : 'Order via WhatsApp', action: 'order_whatsapp_single', payload: pObj },
        ],
      };
    }
  }

  // TOPIC 11: DELIVERY & PAYMENT INFO
  if (
    text.includes('delivery') ||
    text.includes('usafirishaji') ||
    text.includes('mikoani') ||
    text.includes('dar') ||
    text.includes('agiza') ||
    text.includes('order') ||
    text.includes('kulipa') ||
    text.includes('malipo') ||
    text.includes('m-pesa') ||
    text.includes('mpesa') ||
    text.includes('lipa')
  ) {
    return {
      id: msgId,
      sender: 'bot',
      timestamp: now,
      text:
        lang === 'sw'
          ? `Taarifa za Usafirishaji & Malipo (ED Retail):\n\n` +
            `• Dar es Salaam: Usafirishaji wa haraka siku hiyo hiyo ndani ya masaa 2–4 kupitia courier au bodaboda wa uhakika. Malipo yanafanyika kwa M-Pesa au Cash baada ya kukabidhiwa mzigo.\n\n` +
            `• Mikoani Yote ya Tanzania (Arusha, Mwanza, Dodoma, Mbeya, Morogoro, n.k.): Mzigo unatumwa kwa basi la uhakika lenye risiti na namba ya simu ya dereva au ofisi ya basi. Unafika ndani ya masaa 24–48 ukiwa salama.\n\n` +
            `• Malipo ya M-Pesa / Tigo Pesa: Namba rasmi ya malipo ni ${DISTRIBUTOR_NAME} (${useDistributorStore.getState().getActiveDistributor().phone}).`
          : `Delivery & Payment Information:\n\n` +
            `• Dar es Salaam: Same-day dispatch within 2–4 hours. Cash on delivery or Mobile Money accepted.\n` +
            `• All Tanzania Regions: 24-48 hours via secure registered express bus parcel services with direct tracking receipt.\n` +
            `• Mobile Money: M-Pesa / Tigo Pesa to authorized distributor ${DISTRIBUTOR_NAME}.`,
      options: [
        { label: lang === 'sw' ? 'Tazama Bidhaa Zote' : 'Browse Catalog', action: 'nav_products' },
        { label: lang === 'sw' ? 'Wasiliana na Msambazaji WhatsApp' : 'Chat on WhatsApp', action: 'open_whatsapp_consult' },
      ],
    };
  }

  // DEFAULT CONVERSATIONAL GREETING & GUIDANCE
  return {
    id: msgId,
    sender: 'bot',
    timestamp: now,
    text:
      lang === 'sw'
        ? `Habari! Karibu sana ED Retail — Duka lako rasmi la bidhaa asilia za afya za Edmark.\n\nMimi ni Msaidizi wako wa Afya. Naweza kukupa ushauri wa kitaalamu na kukuongoza kuchagua dozi inayokufaa zaidi:\n\nUnaweza kuniuliza chochote kwa maneno yako ya kawaida, kwa mfano:\n• "Nataka kuongeza uzito na mwili"\n• "Jinsi ya kutibu vidonda vya tumbo na asidi"\n• "P4 slimming schedule inafanyaje kazi?"\n• "Tofauti ya Troika na Ginseng"\n\nUngependa kupata suluhisho la nini leo?`
        : `Hello and welcome to ED Retail — your authorized distributor for authentic Edmark wellness products.\n\nI am your Health Concierge. You can ask me any question naturally, such as:\n• "What if I want to gain weight and build muscle?"\n• "How to soothe stomach ulcers and acid reflux?"\n• "How does the P4 slimming system work?"\n• "Difference between Cafe Troika and Ginseng Coffee"\n\nHow may I help you today?`,
    options: [
      { label: lang === 'sw' ? 'Kupunguza Kitambi & Uzito (P4)' : 'Weight Loss & Flat Tummy', action: 'Kupunguza Kitambi & Uzito' },
      { label: lang === 'sw' ? 'Kuongeza Uzito & Mwili' : 'Gain Weight & Muscle', action: 'Kuongeza Uzito & Mwili' },
      { label: lang === 'sw' ? 'Vidonda vya Tumbo & Asidi' : 'Stomach Ulcers & Acid', action: 'Vidonda vya Tumbo & Asidi' },
      { label: lang === 'sw' ? 'Nguvu & Stamina (Troika)' : 'Male Stamina & Energy', action: 'Nguvu & Stamina' },
      { label: lang === 'sw' ? 'Usafirishaji & Malipo' : 'Delivery & Payment Info', action: 'Usafirishaji & Malipo' },
      { label: lang === 'sw' ? 'Mwanahamisi Admin Login' : 'Distributor Login', action: 'admin' },
    ],
  };
}
