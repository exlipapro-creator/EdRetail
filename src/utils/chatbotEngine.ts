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
  const text = input.trim().toLowerCase();
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
          ? `👑 *Karibu Mwanahamisi! (Distributor Command Center)*\n\nUko kwenye chumba kikuu cha usimamizi wa biashara. Chagua unachotaka kufanya au andika kwa maneno ya kawaida:`
          : `👑 *Welcome Mwanahamisi! (Distributor Command Center)*\n\nYou are now in the business cockpit. Select what you would like to do or type naturally:`,
      options: [
        { label: lang === 'sw' ? '📊 Fungua Dashibodi Kuu' : '📊 Open Admin Dashboard', action: 'cmd_admin_dashboard' },
        { label: lang === 'sw' ? '🏆 3-Month Fund Challenge (2,000 SV)' : '🏆 3-Month Fund Challenge', action: 'cmd_maintenance_tracker' },
        { label: lang === 'sw' ? '📦 Usimamizi wa Stoo (Inventory Toggle)' : '📦 Manage Stock Toggle', action: 'cmd_manage_catalog' },
        { label: lang === 'sw' ? '📒 Rekodi Mauzo ya Mkononi' : '📒 Log Offline Sale', action: 'cmd_prompt_sale' },
        { label: lang === 'sw' ? '💡 Ushauri wa Faida & Mikakati' : '💡 Profit Advisory', action: 'cmd_financial_advice' },
        { label: lang === 'sw' ? '🛍️ Rudi Hali ya Wateja' : '🛍️ Exit to Customer Mode', action: 'cmd_exit_admin' },
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
          ? `📊 *RIPOTI YA BIASHARA - ED RETAIL*\n` +
            `👤 Msambazaji: ${DISTRIBUTOR_NAME}\n` +
            `📅 Tarehe: ${new Date().toLocaleDateString('sw-TZ')}\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `💰 *Jumla ya Mauzo Yote:* TZS ${summary.totalRevenue.toLocaleString()}\n` +
            `💵 *Pesa Mkononi (Cash/M-Pesa):* TZS ${summary.cashCollected.toLocaleString()}\n` +
            `📝 *Madeni Yanayodaiwa:* TZS ${summary.creditOutstanding.toLocaleString()}\n` +
            `📈 *Makadirio ya Faida Halisi:* TZS ${summary.estimatedNetProfit.toLocaleString()}\n` +
            `✨ *Jumla ya Alama (SV):* ${summary.totalSvPoints} SV (${summary.totalBvPoints} BV)\n` +
            `📦 *Jumla ya Bidhaa Zilizouzwa:* ${summary.totalUnitsSold} units\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `⚠️ Madeni yaliyopitiliza: ${summary.overdueDebtsCount}\n` +
            `🔔 Wateja wa Refill leo: ${summary.pendingRefillsCount}\n\n` +
            `Je, ungependa nitume muhtasari huu moja kwa moja kwenye WhatsApp yako?`
          : `📊 *ED RETAIL BUSINESS PERFORMANCE REPORT*\n` +
            `👤 Distributor: ${DISTRIBUTOR_NAME}\n` +
            `📅 Date: ${new Date().toLocaleDateString('en-GB')}\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `💰 *Total Gross Volume:* TZS ${summary.totalRevenue.toLocaleString()}\n` +
            `💵 *Cash In Hand / Collected:* TZS ${summary.cashCollected.toLocaleString()}\n` +
            `📝 *Outstanding Receivables:* TZS ${summary.creditOutstanding.toLocaleString()}\n` +
            `📈 *Estimated Net Retail Profit:* TZS ${summary.estimatedNetProfit.toLocaleString()}\n` +
            `✨ *Total SV Points:* ${summary.totalSvPoints} SV\n` +
            `📦 *Units Sold:* ${summary.totalUnitsSold} items\n` +
            `━━━━━━━━━━━━━━━━━━━━\n\n` +
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
          { label: lang === 'sw' ? '📲 Tuma Ripoti WhatsApp Yangu' : '📲 Send Report to WhatsApp', action: 'open_url', payload: waReportUrl },
          { label: lang === 'sw' ? '📊 Fungua Dashibodi Kuu' : '📊 Open Admin Dashboard', action: 'cmd_admin_dashboard' },
          { label: lang === 'sw' ? '🏆 Alama za Maintenance & Funds' : '🏆 Maintenance & Funds', action: 'cmd_maintenance_tracker' },
          { label: lang === 'sw' ? '💡 Nipe Ushauri wa Faida' : '💡 Give Profit Advice', action: 'cmd_financial_advice' },
          { label: lang === 'sw' ? '📒 Angalia Orodha ya Madeni' : '📒 View Credit Ledger', action: 'cmd_view_debts' },
        ],
      };
    }

    // A2. Maintenance Tracking & 3-Month Fund Challenge (Car / House / Travel / 2000 SV PGBV)
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
      const legs = useDistributorStore.getState().downlineLegs;

      const streakVisual = records
        .map((r) => {
          if (r.status === 'completed') return `[✅ ${r.monthName}: ${r.achievedSv} SV]`;
          if (r.status === 'current') return `[🟡 ${r.monthName}: ${analysis.totalSv}/${r.targetSv} SV (${analysis.percentComplete}%)]`;
          return `[⚪ ${r.monthName}: Inasubiri]`;
        })
        .join('\n');

      const legsSummary = legs
        .map((l) => `• *${l.name}* (${l.location}): ${l.currentSv}/${l.targetSv} SV (${l.status === 'on_track' ? '✅ Nzuri' : l.status === 'needs_boost' ? '🟡 Inahitaji Nguvu' : '🔴 Hatari'})`)
        .join('\n');

      let maintenanceText = '';
      if (lang === 'sw') {
        maintenanceText =
          `🏆 *CHALLENGE YA MIEZI 3 - EDMARK ${analysis.fundName.toUpperCase()}*\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `📌 *Mzunguko wa Siku 90 (3-Month Streak):*\n${streakVisual}\n\n` +
          `📊 *Hali ya Mwezi Huu (Mwezi ${analysis.currentMonthIndex}/3):*\n` +
          `• *Lengo la Kikundi (CPGS):* ${analysis.targetSv.toLocaleString()} SV\n` +
          `• *Alama Zilizofikiwa Leo:* ${analysis.totalSv.toLocaleString()} SV (${analysis.percentComplete}%)\n` +
          `• *Alama Binafsi (CPS):* ${analysis.personalCurrentSv}/100 SV (Inahitajika kwa Manager)\n` +
          `• *Pengo Lililobaki:* *${analysis.gapSv.toLocaleString()} SV*\n` +
          `• *Siku Zilizobaki Mwezini:* ${analysis.daysRemaining} siku\n` +
          `• *Kasi Inayohitajika kwa Siku:* *${analysis.dailyPacingSv} SV/siku*\n\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `📦 *Mkakati wa Bidhaa Kufidia Pengo la ${analysis.gapSv} SV:*\n` +
          `👉 *Pakiti ${analysis.p4KitsNeeded} za P4 Complete Slimming* (~50 SV kila moja) AU\n` +
          `👉 *Mabox ${analysis.shakeOffBoxesNeeded} ya Shake Off* (~10 SV kila moja) AU\n` +
          `👉 *Chupa ${analysis.splinaBottlesNeeded} za Splina Chlorophyll* (~8 SV kila moja)\n\n` +
          `👥 *Mchango wa Downlines (Legs):*\n${legsSummary}`;
      } else {
        maintenanceText =
          `🏆 *3-MONTH QUALIFICATION TRACKER - ${analysis.fundName.toUpperCase()}*\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `📌 *Consecutive 90-Day Cycle:*\n${streakVisual}\n\n` +
          `📊 *Current Month Status (Month ${analysis.currentMonthIndex}/3):*\n` +
          `• *Group Target (CPGS):* ${analysis.targetSv.toLocaleString()} SV\n` +
          `• *Current Achieved:* ${analysis.totalSv.toLocaleString()} SV (${analysis.percentComplete}%)\n` +
          `• *Personal Sales (CPS):* ${analysis.personalCurrentSv}/100 SV\n` +
          `• *Gap to Target:* *${analysis.gapSv.toLocaleString()} SV*\n` +
          `• *Days Remaining:* ${analysis.daysRemaining} days\n` +
          `• *Required Daily Run-Rate:* *${analysis.dailyPacingSv} SV/day*\n\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `📦 *Actionable Bundle Multipliers:*\n` +
          `To close the ${analysis.gapSv} SV gap before month-end, execute:\n` +
          `👉 *${analysis.p4KitsNeeded} P4 Slimming Bundles* (~50 SV each) OR\n` +
          `👉 *${analysis.shakeOffBoxesNeeded} Shake Off Boxes* (~10 SV each) OR\n` +
          `👉 *${analysis.splinaBottlesNeeded} Splina Chlorophyll Bottles* (~8 SV each)\n\n` +
          `👥 *Downline Leg Breakdown:*\n${legsSummary}`;
      }

      return {
        id: msgId,
        sender: 'bot',
        timestamp: now,
        text: maintenanceText,
        options: [
          { label: lang === 'sw' ? '🎯 Fungua Dashibodi ya Maintenance' : '🎯 Open Maintenance Dashboard', action: 'cmd_maintenance_tracker' },
          { label: lang === 'sw' ? '📊 Fungua Dashibodi Kuu' : '📊 Open Admin Dashboard', action: 'cmd_admin_dashboard' },
          { label: lang === 'sw' ? '📒 Rekodi Mauzo ya Mkononi' : '📒 Log Offline Sale', action: 'cmd_prompt_sale' },
        ],
      };
    }

    // B. Financial Advisor Analysis
    if (
      text.includes('ushauri') ||
      text.includes('advice') ||
      text.includes('mtaji') ||
      text.includes('faida zaidi') ||
      text.includes('uwekezaji') ||
      text.includes('kodi')
    ) {
      const summary = useDistributorStore.getState().getFinancialSummary('all');
      const creditPercent = summary.totalRevenue > 0 ? Math.round((summary.creditOutstanding / summary.totalRevenue) * 100) : 0;

      let adviceText = '';
      if (lang === 'sw') {
        adviceText =
          `💡 *USHAURI WA KIFEDHA & MKAKATI WA BIASHARA*\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `1. *Udhibiti wa Madeni (Credit Risk):*\n` +
          `• Madeni yako ni TZS ${summary.creditOutstanding.toLocaleString()} (${creditPercent}% ya mauzo yote).\n` +
          `${
            creditPercent > 30
              ? `⚠️ *Tahadhari:* Kiwango cha madeni kiko juu (>30%). Sitisha kutoa mkopo mpya kwa wateja wasiomaliza salio lao ili kulinda mtaji wa kununua bidhaa mpya Edmark.`
              : `✅ *Hali nzuri:* Kiwango cha madeni kiko salama chini ya 30%. Endelea kukusanya madeni kwa wakati.`
          }\n\n` +
          `2. *Bidhaa Yenye Faida Kubwa Zaidi (High Margin):*\n` +
          `• *MRT Complex*: Faida ni TZS 12,000 kwa box + 16 SV (Alama kubwa zaidi).\n` +
          `• *Shake Off*: Faida ni TZS 9,000 kwa box + 12 SV.\n` +
          `👉 *Mkakati:* Lenga kuuza *P4 Complete Bundle (MRT + Shake Off)*. Kila ukiuza bundle 1 unapata faida ya TZS 21,000 na 28 SV papo hapo!\n\n` +
          `3. *Mkakati wa Refills (Kuingiza Pesa Kirahisi):*\n` +
          `• Wateja wa Shake Off humaliza box ndani ya siku 12. Ukiwapigia simu siku ya 10, asilimia 70% huagiza box la pili bila gharama ya kumtafuta mteja mpya!`;
      } else {
        adviceText =
          `💡 *FINANCIAL & STRATEGIC ADVISORY*\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `1. *Receivables & Cash Flow:*\n` +
          `• Outstanding credit is TZS ${summary.creditOutstanding.toLocaleString()} (${creditPercent}% of total revenue).\n` +
          `${
            creditPercent > 30
              ? `⚠️ *Action Required:* Credit exposure is high (>30%). Prioritize recovering pending debts before issuing new credit to protect working capital for Edmark stock replenishments.`
              : `✅ *Good Condition:* Credit exposure is healthy under 30%.`
          }\n\n` +
          `2. *Highest Margin Product Champions:*\n` +
          `• *MRT Complex*: TZS 12,000 profit margin + 16 SV points.\n` +
          `• *Shake Off*: TZS 9,000 profit margin + 12 SV points.\n` +
          `👉 Strategy: Focus presentations on the *P4 Slimming Bundle*. Selling 10 bundles generates TZS 210,000 in immediate net profit plus 280 SV points!`;
      }

      return {
        id: msgId,
        sender: 'bot',
        timestamp: now,
        text: adviceText,
        options: [
          { label: lang === 'sw' ? '📊 Fungua Dashibodi Kuu' : '📊 Open Admin Dashboard', action: 'cmd_admin_dashboard' },
          { label: lang === 'sw' ? '📒 Angalia Madeni ya Wateja' : '📒 View Customer Debts', action: 'cmd_view_debts' },
          { label: lang === 'sw' ? '🏆 3-Month Fund Challenge' : '🏆 3-Month Challenge', action: 'cmd_maintenance_tracker' },
        ],
      };
    }

    // C. Natural Language Price Update (e.g. "weka shake off 40000" or "change mrt price to 50000")
    const priceMatch = text.match(/(?:weka|badilisha|change|set|price|bei)\s+(?:ya\s+)?([a-z\s-]+?)(?:\s+(?:iwe|to|be|=))?\s+(\d{4,6})/i);
    if (priceMatch) {
      const prodQuery = priceMatch[1].trim();
      const newPrice = parseInt(priceMatch[2], 10);

      const targetProd = PRODUCTS.find(
        (p) =>
          p.id.toLowerCase().includes(prodQuery) ||
          p.name.en.toLowerCase().includes(prodQuery) ||
          p.name.sw.toLowerCase().includes(prodQuery)
      );

      if (targetProd && newPrice > 1000) {
        useDistributorStore.getState().updateProductPrice(targetProd.id, newPrice);
        return {
          id: msgId,
          sender: 'bot',
          timestamp: now,
          text:
            lang === 'sw'
              ? `✅ *Bei Imesasishwa Papo Hapo!*\n\nBidhaa: *${targetProd.name.sw}*\nBei Mpya Dukani: *TZS ${newPrice.toLocaleString()}*\n\nBei hii sasa inaonekana moja kwa moja kwa wateja wote kwenye tovuti.`
              : `✅ *Price Updated Live!*\n\nProduct: *${targetProd.name.en}*\nNew Store Price: *TZS ${newPrice.toLocaleString()}*\n\nAll store visitors will see this updated price immediately.`,
          actionType: 'price_updated',
          actionPayload: { productId: targetProd.id, newPrice },
          options: [
            { label: lang === 'sw' ? '📊 Fungua Dashibodi Kuu' : '📊 Open Admin Dashboard', action: 'cmd_admin_dashboard' },
            { label: lang === 'sw' ? '🛒 Tazama Orodha ya Bidhaa' : '🛒 View Catalog', action: 'nav_products' },
            { label: lang === 'sw' ? '👑 Menyu ya Msambazaji' : '👑 Admin Menu', action: 'admin' },
          ],
        };
      }
    }

    // D. Stock Control (e.g. "spirulina imeisha" or "troika out of stock" or "shake off ipo")
    if (text.includes('imeisha') || text.includes('out of stock') || text.includes('haipo')) {
      const targetProd = PRODUCTS.find(
        (p) =>
          text.includes(p.id) ||
          text.includes(p.name.en.toLowerCase()) ||
          text.includes(p.name.sw.toLowerCase())
      );
      if (targetProd) {
        useDistributorStore.getState().toggleProductStock(targetProd.id, false);
        return {
          id: msgId,
          sender: 'bot',
          timestamp: now,
          text:
            lang === 'sw'
              ? `📦 *Hali ya Stoo Imesasishwa!*\n\nBidhaa: *${targetProd.name.sw}* imewekwa kama *OUT OF STOCK* (Imeisha).\n\nWateja hawataweza kuiongeza kwenye mkoba hadi uirejeshe stoo.`
              : `📦 *Stock Status Updated!*\n\nProduct: *${targetProd.name.en}* marked as *OUT OF STOCK*.\n\nCustomers cannot add it to cart until replenished.`,
          actionType: 'stock_toggled',
          actionPayload: { productId: targetProd.id, inStock: false },
          options: [
            { label: lang === 'sw' ? '📊 Fungua Dashibodi Kuu' : '📊 Open Admin Dashboard', action: 'cmd_admin_dashboard' },
          ],
        };
      }
    }

    if (text.includes('imeingia') || text.includes('in stock') || text.includes('ipo stoo') || text.includes('restock')) {
      const targetProd = PRODUCTS.find(
        (p) =>
          text.includes(p.id) ||
          text.includes(p.name.en.toLowerCase()) ||
          text.includes(p.name.sw.toLowerCase())
      );
      if (targetProd) {
        useDistributorStore.getState().toggleProductStock(targetProd.id, true);
        return {
          id: msgId,
          sender: 'bot',
          timestamp: now,
          text:
            lang === 'sw'
              ? `✅ *Bidhaa Imerejeshwa Stoo!*\n\nBidhaa: *${targetProd.name.sw}* sasa ipo *IN STOCK* na inaweza kuagizwa dukani.`
              : `✅ *Product Back In Stock!*\n\nProduct: *${targetProd.name.en}* is now live for customer orders.`,
          actionType: 'stock_toggled',
          actionPayload: { productId: targetProd.id, inStock: true },
          options: [
            { label: lang === 'sw' ? '📊 Fungua Dashibodi Kuu' : '📊 Open Admin Dashboard', action: 'cmd_admin_dashboard' },
          ],
        };
      }
    }

    // E. Credit & Debts List
    if (text.includes('madeni') || text.includes('deni') || text.includes('debt') || text.includes('kopa')) {
      const debts = useDistributorStore.getState().sales.filter((s) => s.balanceDue > 0);
      if (debts.length === 0) {
        return {
          id: msgId,
          sender: 'bot',
          timestamp: now,
          text: lang === 'sw' ? '🎉 Hongera! Huna mteja yeyote anayekudai kwa sasa.' : '🎉 No outstanding customer debts currently!',
          options: [
            { label: lang === 'sw' ? '📊 Fungua Dashibodi Kuu' : '📊 Open Admin Dashboard', action: 'cmd_admin_dashboard' },
          ],
        };
      }

      const debtList = debts
        .map((d, i) => {
          return `${i + 1}. *${d.customerName}* (${d.customerPhone || 'Simu haipo'}): Anadaiwa *TZS ${d.balanceDue.toLocaleString()}* (${d.productName}) | Tarehe: ${d.dueDate || 'Haikupangwa'}`;
        })
        .join('\n\n');

      return {
        id: msgId,
        sender: 'bot',
        timestamp: now,
        text:
          lang === 'sw'
            ? `📒 *ORODHA YA MADENI YA WATEJA*\n━━━━━━━━━━━━━━━━━━━━\n${debtList}\n\nUnaweza kubonyeza hapa chini kutuma ujumbe wa kistaarabu wa kumbusho WhatsApp.`
            : `📒 *OUTSTANDING CUSTOMER DEBTS*\n━━━━━━━━━━━━━━━━━━━━\n${debtList}`,
        options: [
          { label: lang === 'sw' ? '📲 Tuma Kumbusho la Kirafiki WhatsApp' : '📲 Send Polite WA Reminder', action: 'cmd_send_debt_reminder' },
          { label: lang === 'sw' ? '📊 Fungua Dashibodi Kuu' : '📊 Open Admin Dashboard', action: 'cmd_admin_dashboard' },
        ],
      };
    }
  }

  // ── 3. CUSTOMER MULTI-STEP HEALTH CONSULTATION & SHOPPING ENGINE ──

  // Sub-step: P4 Dosage Schedule & Step-by-Step System
  if (text.includes('p4 schedule') || text.includes('ratiba ya dozi ya p4') || text.includes('ratiba ya p4') || text.includes('show_p4_schedule')) {
    return {
      id: msgId,
      sender: 'bot',
      timestamp: now,
      text:
        lang === 'sw'
          ? `📋 *RATIBA RASMI YA DOZI YA P4 SLIMMING SYSTEM (Siku 1–24):*\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `🌅 *Asubuhi (Saa 1:00 – 2:00 Asubuhi):*\n` +
            `• Glasi 1 ya maji vuguvugu yenye kifuniko 1 cha *Splina Liquid Chlorophyll*.\n` +
            `• Kunywa kikombe cha *Ginseng Coffee* au *Cafe 73* kwa ajili ya nguvu ya asubuhi.\n\n` +
            `☀️ *Mchana (Saa 7:00 – 8:00 Mchana):*\n` +
            `• Kunywa sachet 1 ya *MRT Complex* iliyochanganywa kwenye maji baridi au ya kawaida 250ml badala ya chakula kikuu cha mchana.\n\n` +
            `🌙 *Jioni / Usiku (Saa 2:00 – 3:00 Usiku):*\n` +
            `• Kula mlo mwepesi sana (mbogamboga/matunda) au sachet ya pili ya *MRT Complex*.\n` +
            `• *Kabla ya Kulala:* Changanya sachet 1 ya *Shake Off Phyto Fiber* na maji baridi 250ml, tikisa haraka kwenye shaker, na unywe mara moja. (Usitumie maji moto!).\n\n` +
            `💧 *Kumbuka:* Kunywa maji lita 2.5 hadi 3 wakati wa mchana ili kusaidia fiber kuyeyusha mafuta kwa urahisi.`
          : `📋 *OFFICIAL P4 SLIMMING DOSAGE SCHEDULE (Day 1–24):*\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `🌅 *Morning (7:00 AM – 8:00 AM):*\n` +
            `• 1 glass room-temp water with 1 capful *Splina Liquid Chlorophyll*.\n` +
            `• 1 cup of *Ginseng Coffee* or *Cafe 73* for natural morning energy.\n\n` +
            `☀️ *Lunch (1:00 PM – 2:00 PM):*\n` +
            `• 1 sachet of *MRT Complex* mixed with 250ml water as your complete meal replacement.\n\n` +
            `🌙 *Bedtime (9:30 PM – 10:30 PM):*\n` +
            `• 1 sachet *Shake Off Phyto Fiber* shaken vigorously in 250ml cold water. Drink immediately before sleep.\n\n` +
            `💧 *Vital Tip:* Hydrate with at least 2.5–3 liters of water throughout the day.`,
      options: [
        { label: lang === 'sw' ? '🎁 Agiza Pakiti ya P4 (10% Punguzo)' : '🎁 Order P4 Bundle (10% Off)', action: 'add_p4_bundle' },
        { label: lang === 'sw' ? '💬 Ongea na Msambazaji WhatsApp' : '💬 Chat with Mwanahamisi', action: 'open_whatsapp_consult' },
      ],
    };
  }

  // A. Product Knowledge Inquiries (Splina, Shake Off, MRT, Troika, Spirulina, CoCollagen, Ginseng, Bubble C, SpiRO)
  const allProductKeys = Object.keys(EDMARK_KNOWLEDGE_BASE);
  for (const key of allProductKeys) {
    const kb = EDMARK_KNOWLEDGE_BASE[key];
    const pName = kb.name.toLowerCase();
    const pSw = kb.swahiliName.toLowerCase();

    if (
      text.includes(key) ||
      text.includes(pName) ||
      text.includes(pSw) ||
      (key === 'shake-off-phyto' && (text.includes('shake off') || text.includes('kusafisha utumbo'))) ||
      (key === 'splina-chlorophyll' && (text.includes('splina') || text.includes('klorofili'))) ||
      (key === 'mrt-complex' && (text.includes('mrt') || text.includes('meal replacement'))) ||
      (key === 'cafe-troika' && (text.includes('troika') || text.includes('kahawa troika'))) ||
      (key === 'hawaiian-spirulina' && (text.includes('spirulina') || text.includes('mwani'))) ||
      (key === 'cocollagen' && (text.includes('collagen') || text.includes('kolajeni'))) ||
      (key === 'ginseng-coffee' && (text.includes('ginseng') || text.includes('kahawa ya ginseng'))) ||
      (key === 'bubble-c' && (text.includes('bubble c') || text.includes('vitamini c'))) ||
      (key === 'spiro-cereal' && (text.includes('spiro') || text.includes('oats')))
    ) {
      const pObj = PRODUCTS.find((p) => p.id === key);
      const effectivePrice = pObj ? useDistributorStore.getState().getEffectiveProducts().find((p) => p.id === key)?.price || pObj.price : kb.suggestedRetailTzs;

      // Dosage inquiry
      if (text.includes('dozi') || text.includes('tumia') || text.includes('how to use') || text.includes('usage') || text.includes('kunywa')) {
        return {
          id: msgId,
          sender: 'bot',
          timestamp: now,
          text:
            lang === 'sw'
              ? `📋 *Jinsi ya Kutumia ${kb.swahiliName}:*\n\n${kb.exactDosageSw}\n\n*Vidokezo Muhimu:* Kunywa maji ya kutosha (lita 2-3 kwa siku) ili kupata matokeo kamili na ya haraka.`
              : `📋 *How to Use ${kb.name}:*\n\n${kb.exactDosageEn}\n\n*Key Tip:* Stay well-hydrated with 2.5–3L water daily for optimal assimilation.`,
          options: [
            { label: lang === 'sw' ? `🛒 Weka ${kb.name} Mkobani` : `🛒 Add ${kb.name} to Cart`, action: 'add_to_cart', payload: pObj },
            { label: lang === 'sw' ? '💬 Ongea na Mwanahamisi WhatsApp' : '💬 Chat with Distributor', action: 'open_whatsapp_consult' },
          ],
        };
      }

      // Who should use inquiry
      if (text.includes('nani') || text.includes('who') || text.includes('mjamzito') || text.includes('pregnant') || text.includes('mtoto')) {
        return {
          id: msgId,
          sender: 'bot',
          timestamp: now,
          text:
            lang === 'sw'
              ? `🔎 *Mwongozo wa Walengwa wa ${kb.swahiliName}:*\n\n` +
                `✅ *Inashauriwa Kwa:*\n${kb.whoShouldUseSw.map((w) => `• ${w}`).join('\n')}\n\n` +
                `⚠️ *Wanaopaswa Kuwa Waangalifu:*\n${kb.whoShouldAvoidSw.map((a) => `• ${a}`).join('\n')}`
              : `🔎 *Target Suitability Guide for ${kb.name}:*\n\n` +
                `✅ *Recommended For:*\n${kb.whoShouldUseEn.map((w) => `• ${w}`).join('\n')}\n\n` +
                `⚠️ *Precautions:*\n${kb.whoShouldAvoidEn.map((a) => `• ${a}`).join('\n')}`,
          options: [
            { label: lang === 'sw' ? `🛒 Nunua kwa TZS ${effectivePrice.toLocaleString()}` : `🛒 Buy for TZS ${effectivePrice.toLocaleString()}`, action: 'add_to_cart', payload: pObj },
            { label: lang === 'sw' ? '❓ Uliza Kuhusu Bidhaa Nyingine' : '❓ Ask Another Question', action: 'prompt_question' },
          ],
        };
      }

      // Full product overview
      return {
        id: msgId,
        sender: 'bot',
        timestamp: now,
        text:
          lang === 'sw'
            ? `🌿 *${kb.swahiliName}*\n${kb.taglineSw}\n\n` +
              `💰 *Bei Rasmi:* TZS ${effectivePrice.toLocaleString()}\n` +
              `📦 *Kifurushi:* ${kb.packSize}\n\n` +
              `✨ *Faida Kuu:*\n${kb.keyBenefitsSw.slice(0, 3).map((b) => `• ${b}`).join('\n')}\n\n` +
              `🔬 *Jinsi Inavyofanya Kazi:*\n${kb.howItWorksSw}`
            : `🌿 *${kb.name}*\n${kb.taglineEn}\n\n` +
              `💰 *Retail Price:* TZS ${effectivePrice.toLocaleString()}\n` +
              `📦 *Pack Size:* ${kb.packSize}\n\n` +
              `✨ *Key Benefits:*\n${kb.keyBenefitsEn.slice(0, 3).map((b) => `• ${b}`).join('\n')}\n\n` +
              `🔬 *Mechanism:*\n${kb.howItWorksEn}`,
        options: [
          { label: lang === 'sw' ? `🛒 Weka ${kb.name} Mkobani` : `🛒 Add to Cart`, action: 'add_to_cart', payload: pObj },
          { label: lang === 'sw' ? '📋 Ratiba Kamili ya Dozi' : '📋 Dosage Instructions', action: 'show_dosage', payload: key },
          { label: lang === 'sw' ? '📲 Agiza WhatsApp Moja kwa Moja' : '📲 Order via WhatsApp', action: 'order_whatsapp_single', payload: pObj },
        ],
      };
    }
  }

  // B. Health Goals: Weight Loss / Potbelly / Kitambi / P4 System
  if (
    text.includes('punguza') ||
    text.includes('uzito') ||
    text.includes('tumbo') ||
    text.includes('kitambi') ||
    text.includes('weight') ||
    text.includes('slim') ||
    text.includes('belly') ||
    text.includes('fat') ||
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
          ? `🎯 *Mpango wa Kupunguza Uzito & Kitambi (P4 Slimming System):*\n\n` +
            `Habari! Kupunguza kitambi na uzito kupitia mfumo wa Edmark hakuhitaji kujinyima kula au kufanya mazoezi magumu ya kuumiza mwili. Inatumia sayansi ya hatua 2:\n\n` +
            `1️⃣ *Hatua 1: Shake Off Phyto Fiber (Kusafisha Utumbo)*\n` +
            `• Huondoa sumu na uchafu ulioganda kwenye utumbo (mucoid plaque) unaosababisha kitambi kuwa kigumu.\n` +
            `• Matokeo yanaonekana ndani ya masaa 6–8 baada ya kunywa.\n\n` +
            `2️⃣ *Hatua 2: MRT Complex (Kuchoma Mafuta Mwilini)*\n` +
            `• Mlo mbadala wenye protini na virutubisho kamili unaozuia njaa na kulazimisha mwili kuchoma mafuta yaliyohifadhiwa kuwa nishati.\n\n` +
            `Matokeo ya kawaida: Kilo 3 hadi 7 hupungua ndani ya siku 14–21!`
          : `🎯 *Weight Loss & Potbelly Reduction (P4 Slimming System):*\n\n` +
            `Welcome! Edmark’s weight management system does not require dangerous starvation diets. It works through a verified 2-step biological synergy:\n\n` +
            `1️⃣ *Step 1: Shake Off Phyto Fiber (Colon Cleansing)*\n` +
            `• Flushes out encrusted mucoid plaque and toxins from the colon walls.\n` +
            `• Noticeable tummy flattening within 6 to 8 hours.\n\n` +
            `2️⃣ *Step 2: MRT Complex (Fat Burning Meal Replacement)*\n` +
            `• Complete balanced nutrition that induces thermogenesis and burns visceral fat while maintaining energy.\n\n` +
            `Expected healthy weight reduction: 3–7 kg in 14 to 21 days!`,
      options: [
        { label: lang === 'sw' ? '🎁 Weka Pakiti Kamili (P4 Bundle - 10% Off)' : '🎁 Add Complete P4 Bundle (10% Off)', action: 'add_p4_bundle' },
        { label: lang === 'sw' ? '📋 Ratiba ya Dozi ya P4' : '📋 P4 Dosage Schedule', action: 'show_p4_schedule' },
        { label: lang === 'sw' ? '🌿 Weka Shake Off Tu (TZS 35,000)' : '🌿 Add Shake Off Only', action: 'add_to_cart', payload: shakeOff },
        { label: lang === 'sw' ? '🥤 Weka MRT Complex Tu (TZS 45,000)' : '🥤 Add MRT Complex Only', action: 'add_to_cart', payload: mrt },
      ],
    };
  }

  // C. Health Goals: Stomach Ulcers / Acid Reflux / Kiungulia / Vidonda vya Tumbo
  if (
    text.includes('vidonda') ||
    text.includes('ulcer') ||
    text.includes('kiungulia') ||
    text.includes('asidi') ||
    text.includes('acid') ||
    text.includes('gesi') ||
    text.includes('goal_ulcers')
  ) {
    const splina = PRODUCTS.find((p) => p.id === 'splina-chlorophyll');
    return {
      id: msgId,
      sender: 'bot',
      timestamp: now,
      text:
        lang === 'sw'
          ? `🌿 *Suluhisho la Uhakika la Vidonda vya Tumbo, Kiungulia & Gesi:*\n\n` +
            `Pole sana kwa changamoto ya tumbo. *Splina Liquid Chlorophyll* ndio suluhisho kuu linalopendwa zaidi Tanzania:\n\n` +
            `• *Hutuliza Asidi Ndani ya Dakika 15:* Chlorophyll ina asili ya alkali (alkaline) inayopunguza ukali wa asidi mara moja.\n` +
            `• *Huponya Vidonda:* Inasaidia kurejesha ngozi ya ndani ya tumbo (mucous lining) iliyoathiriwa na asidi au bakteria ya H. Pylori.\n` +
            `• *Huzuia Gesi & Kichefuchefu:* Huweka sawa mfumo mzima wa mmeng'enyo wa chakula.\n\n` +
            `*Jinsi ya Kutumia:* Weka kijiko 1 (5ml) kwenye glasi ya maji ya kawaida (si ya baridi sana) asubuhi kabla ya kula na jioni.`
          : `🌿 *Solution for Stomach Ulcers, Acid Reflux & Gastritis:*\n\n` +
            `*Splina Liquid Chlorophyll* is nature's alkaline miracle for digestive recovery:\n\n` +
            `• *Neutralizes Acid in 15 Minutes:* Restores optimal alkaline pH balance in gastric tract.\n` +
            `• *Accelerates Wound Healing:* Stimulates rapid mucosal tissue repair along stomach lining.\n` +
            `• *Relieves Gas & Bloating:* Restores healthy digestive motility.\n\n` +
            `*Dosage:* Mix 1 tablespoon (5ml) in a glass of room-temperature water before meals.`,
      options: [
        { label: lang === 'sw' ? '🛒 Weka Splina Mkobani (TZS 28,000)' : '🛒 Add Splina to Cart', action: 'add_to_cart', payload: splina },
        { label: lang === 'sw' ? '📋 Dozi Kamili ya Vidonda vya Tumbo' : '📋 Ulcer Healing Schedule', action: 'show_dosage', payload: 'splina-chlorophyll' },
        { label: lang === 'sw' ? '💬 Ongea na Mwanahamisi WhatsApp' : '💬 Chat with Distributor', action: 'open_whatsapp_consult' },
      ],
    };
  }

  // D. Health Goals: Male Stamina / Energy / Nguvu za Kiume / Troika
  if (
    text.includes('nguvu') ||
    text.includes('stamina') ||
    text.includes('troika') ||
    text.includes('kiume') ||
    text.includes('energy') ||
    text.includes('libido') ||
    text.includes('uchovu') ||
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
          ? `☕ *Nguvu ya Asili, Nishati & Stamina (Cafe Troika & Ginseng):*\n\n` +
            `Kwa wanaume na wenye kazi zinazochosha mwili, Edmark inatoa virutubisho asilia 100% visivyo na madhara:\n\n` +
            `1️⃣ *Cafe Troika (3-in-1 Premium Herbal Coffee)*\n` +
            `• *Tongkat Ali:* Huongeza homoni ya kiume na nguvu za tendo kiasili.\n` +
            `• *Ginseng:* Hupanua mishipa ya damu na kuboresha mzunguko wa damu mwilini.\n` +
            `• *Ganoderma:* Huimarisha moyo na kupunguza maumivu ya mgongo na kiuno.\n\n` +
            `2️⃣ *Ginseng Coffee:* Huondoa uchovu, usingizi kazini na kuongeza usikivu wa akili (focus).`
          : `☕ *Natural Stamina, Vitality & Endurance (Cafe Troika & Ginseng):*\n\n` +
            `100% natural, heart-safe wellness beverages for sustained stamina and circulation:\n\n` +
            `1️⃣ *Cafe Troika (Tongkat Ali + Ginseng + Ganoderma)*\n` +
            `• Natural testosterone support and peak endurance without artificial chemicals.\n\n` +
            `2️⃣ *Ginseng Coffee*\n` +
            `• Sharp mental focus and anti-fatigue booster throughout busy work days.`,
      options: [
        { label: lang === 'sw' ? '🛒 Weka Cafe Troika Mkobani' : '🛒 Add Cafe Troika to Cart', action: 'add_to_cart', payload: troika },
        { label: lang === 'sw' ? '☕ Weka Ginseng Coffee Mkobani' : '☕ Add Ginseng Coffee', action: 'add_to_cart', payload: ginseng },
        { label: lang === 'sw' ? '💬 Agiza kwa Siri WhatsApp' : '💬 Discreet WhatsApp Order', action: 'open_whatsapp_consult' },
      ],
    };
  }

  // E. Health Goals: Skin, Youthfulness & Anti-Aging
  if (
    text.includes('ngozi') ||
    text.includes('skin') ||
    text.includes('collagen') ||
    text.includes('kolajeni') ||
    text.includes('ujana') ||
    text.includes('glow') ||
    text.includes('beauty') ||
    text.includes('goal_skin')
  ) {
    const cocollagen = PRODUCTS.find((p) => p.id === 'cocollagen');
    const bioelixir = PRODUCTS.find((p) => p.id === 'bio-elixir');

    return {
      id: msgId,
      sender: 'bot',
      timestamp: now,
      text:
        lang === 'sw'
          ? `✨ *Urembo, Ngozi Nzuri & Kupunguza Makunyanzi (CoCollagen & Bio-Elixir):*\n\n` +
            `1️⃣ *CoCollagen (Kinywaji cha Kolajeni Asilia ya Samaki wa Baharini):*\n` +
            `• Huipa ngozi unyevu, ulaini na kung'aa kiasili.\n` +
            `• Hufuta mikunjo na mistari usoni na kuimarisha nywele na kucha.\n\n` +
            `2️⃣ *Bio-Elixir (Kichocheo cha Asili cha HGH):*\n` +
            `• Husaidia mwili kuzalisha seli mpya, kurudisha ujana na kuboresha usingizi mzito mnono.`
          : `✨ *Radiant Skin, Collagen & Youthful Vitality:*\n\n` +
            `1️⃣ *CoCollagen (Hydrolyzed Marine Collagen Chocolate Drink)*\n` +
            `• Deep hydration, firmness, and natural radiant skin elasticity.\n\n` +
            `2️⃣ *Bio-Elixir (Natural HGH Releaser)*\n` +
            `• Cellular rejuvenation and deep restorative sleep.`,
      options: [
        { label: lang === 'sw' ? '🍫 Weka CoCollagen Mkobani' : '🍫 Add CoCollagen to Cart', action: 'add_to_cart', payload: cocollagen },
        { label: lang === 'sw' ? '🌿 Weka Bio-Elixir Mkobani' : '🌿 Add Bio-Elixir to Cart', action: 'add_to_cart', payload: bioelixir },
      ],
    };
  }

  // F. Delivery, Regions & Dispatch Information
  if (
    text.includes('delivery') ||
    text.includes('usafirishaji') ||
    text.includes('mikoani') ||
    text.includes('dar') ||
    text.includes('agiza') ||
    text.includes('order') ||
    text.includes('fika') ||
    text.includes('info_delivery')
  ) {
    return {
      id: msgId,
      sender: 'bot',
      timestamp: now,
      text:
        lang === 'sw'
          ? `🚚 *Taarifa za Usafirishaji & Uwasilishaji (ED Retail):*\n\n` +
            `• *Dar es Salaam:* Usafirishaji wa haraka siku hiyo hiyo ndani ya masaa 2–4 kupitia bodaboda au courier rasmi. Malipo unaweza kufanya ukikabidhiwa mzigo wako mkononi au M-Pesa.\n\n` +
            `• *Mikoani Yote ya Tanzania (Arusha, Mwanza, Dodoma, Mbeya, Morogoro, n.k.):* Mzigo unatumwa kwa basi la uhakika lenye risiti na namba ya simu ya dereva/kondakta. Unafika ndani ya masaa 24–48 ukiwa umefungwa kwa usalama.\n\n` +
            `• *Zanzibar:* Mzigo unatumwa kwa boti ya Azam Marine Express na unafika siku hiyo hiyo au masaa 24.`
          : `🚚 *Delivery & Dispatch Information (ED Retail):*\n\n` +
            `• *Dar es Salaam:* Same-day fast dispatch within 2–4 hours. Cash or Mobile Money on delivery.\n` +
            `• *All Tanzania Regions (Arusha, Mwanza, Dodoma, Mbeya, etc.):* 1–2 days via secure parcel bus/courier.\n` +
            `• *Zanzibar:* Same-day or 24hr via Azam Marine ferry express.`,
      options: [
        { label: lang === 'sw' ? '🛒 Tazama Bidhaa Zote' : '🛒 Browse Catalog', action: 'nav_products' },
        { label: lang === 'sw' ? '📲 Wasiliana na Mwanahamisi WhatsApp' : '📲 Chat on WhatsApp', action: 'open_whatsapp_consult' },
      ],
    };
  }

  // G. Authenticity & Halal/GMP Certification
  if (text.includes('original') || text.includes('halali') || text.includes('halal') || text.includes('gmp') || text.includes('tfda') || text.includes('tmda') || text.includes('feiki') || text.includes('fake')) {
    return {
      id: msgId,
      sender: 'bot',
      timestamp: now,
      text:
        lang === 'sw'
          ? `🛡️ *Uhakika wa Ubora & Uhalisi wa Bidhaa (100% Authentic Edmark):*\n\n` +
            `Bidhaa zote zinazouzwa kupitia *ED Retail* na msambazaji rasmi *Mwanahamisi Lissu* ni halisi 100% kutoka Edmark International kiwandani Selangor, Malaysia:\n\n` +
            `✅ *Viwango vya Kimataifa vya GMP (Good Manufacturing Practice)*\n` +
            `✅ *Udhibitisho wa Halal wa Kimataifa (JAKIM Malaysia)*\n` +
            `✅ *Udhibitisho wa Usalama wa Chakula ISO 22000*\n` +
            `✅ *Zinasajiliwa na Kudhibitiwa na Mamlaka ya Dawa na Vyakula (TMDA)*\n\n` +
            `Kila box lina barcode na hologram rasmi ya Edmark.`
          : `🛡️ *100% Authentic Edmark Guarantee:*\n\n` +
            `All products distributed by *ED Retail* via authorized distributor *Mwanahamisi Lissu* are 100% genuine directly from Edmark International (Selangor, Malaysia):\n\n` +
            `✅ *International GMP Certified*\n` +
            `✅ *Halal Certified (JAKIM)*\n` +
            `✅ *ISO 22000 Food Safety Standards*\n` +
            `✅ *TMDA Tanzania Compliant*\n\n` +
            `Every unit features authentic factory holographic seal and batch barcode.`,
      options: [
        { label: lang === 'sw' ? '🛒 Angalia Bidhaa Dukani' : '🛒 View Store Products', action: 'nav_products' },
        { label: lang === 'sw' ? '💬 Ongea na Msambazaji WhatsApp' : '💬 Chat with Distributor', action: 'open_whatsapp_consult' },
      ],
    };
  }

  // H. Default Friendly Bilingual Shopper Response
  return {
    id: msgId,
    sender: 'bot',
    timestamp: now,
    text:
      lang === 'sw'
        ? `Habari! Karibu sana *ED Retail* — Duka lako rasmi la bidhaa asilia za afya za Edmark.\n\nMimi ni Msaidizi wako wa Afya. Naweza kukupa ushauri wa kitaalamu na kukuongoza kuchagua dozi inayokufaa zaidi:\n\nUngependa kupata suluhisho la nini leo?`
        : `Hello and welcome to *ED Retail* — your authorized direct distributor for authentic Edmark wellness products.\n\nI am your Health Concierge. I can guide you to the perfect natural regimen for your wellness goals:\n\nWhat would you like to achieve today?`,
    options: [
      { label: lang === 'sw' ? '🔥 Kupunguza Kitambi & Uzito (P4)' : '🔥 Weight Loss & Flat Tummy', action: 'goal_weight_loss' },
      { label: lang === 'sw' ? '🌿 Vidonda vya Tumbo & Asidi (Splina)' : '🌿 Stomach Ulcers & Acid Reflux', action: 'goal_ulcers' },
      { label: lang === 'sw' ? '⚡ Nguvu, Nishati & Troika' : '⚡ Male Stamina & Energy', action: 'goal_energy' },
      { label: lang === 'sw' ? '✨ Ngozi Nzuri & Kolajeni' : '✨ Glowing Skin & Collagen', action: 'goal_skin' },
      { label: lang === 'sw' ? '🚚 Usafirishaji & Uwasilishaji' : '🚚 Delivery & Dispatch Info', action: 'info_delivery' },
      { label: lang === 'sw' ? '👑 Msambazaji (Mwanahamisi Login)' : '👑 Distributor Admin Login', action: 'admin' },
    ],
  };
}
