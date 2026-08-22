/**
 * EDMARK MAINTENANCE & LEADERSHIP FUND PLAYBOOK
 * Authentic compensation plan data and strategic maintenance tracking logic
 * for Edmark Tanzania distributors (Mwanahamisi Lissu).
 */

export interface MaintenanceFundInfo {
  id: 'car' | 'house' | 'travel' | 'manager';
  name: string;
  swahiliName: string;
  bonusPercent: string;
  targetRank: string;
  qualificationCycleMonths: number;
  descriptionSw: string;
  descriptionEn: string;
  monthlySvRequirement: number;
  personalSvRequirement: number;
  rules: string[];
}

export interface DownlineLeg {
  id: string;
  name: string;
  location: string;
  phone: string;
  currentSv: number;
  targetSv: number;
  activeMembers: number;
  lastActive: string;
  status: 'on_track' | 'needs_boost' | 'at_risk';
}

export const EDMARK_FUNDS: MaintenanceFundInfo[] = [
  {
    id: 'car',
    name: 'Edmark Car Fund',
    swahiliName: 'Mfuko wa Gari wa Edmark (Car Fund)',
    bonusPercent: '3%',
    targetRank: 'Diamond Manager & Above',
    qualificationCycleMonths: 3,
    monthlySvRequirement: 2000,
    personalSvRequirement: 100,
    descriptionSw:
      'Pata bonasi ya ziada ya 3% kila mwezi kununua gari lako jipya la ndoto. Inahitaji kudumisha alama za Manager (2,000 SV CPGS + 100 SV CPS) kwa miezi 3 mfululizo ukiwa na laini 5 za mameneja waliofuzu.',
    descriptionEn:
      'Earn an additional 3% monthly bonus pool for your dream car. Requires maintaining 2,000 SV CPGS and 100 SV CPS for 3 consecutive months with active qualified manager legs.',
    rules: [
      'Lazima udumishe angalau 2,000 SV (Group Sales) na 100 SV (Personal Sales) kila mwezi.',
      'Ukikosa mwezi 1 katikati ya miezi 3, mzunguko wa siku 90 unajirudia kuanzia mwezi wa kwanza.',
      'Laini za downline 5 lazima ziwe hai na zifanye manunuzi ya mara kwa mara.',
      'Inalipwa moja kwa moja kwenye akaunti yako au ukombozi wa gari kupitia Edmark International.',
    ],
  },
  {
    id: 'house',
    name: 'Edmark House Fund',
    swahiliName: 'Mfuko wa Nyumba wa Edmark (House Fund)',
    bonusPercent: '2%',
    targetRank: 'Crown Manager & Above',
    qualificationCycleMonths: 3,
    monthlySvRequirement: 2000,
    personalSvRequirement: 100,
    descriptionSw:
      'Mfuko wa 2% wa kumiliki nyumba ya kifahari. Huwezesha kupokea hadi 200% ya thamani ya nyumba kwa kipindi cha miaka 20 baada ya kufuzu Car Fund na kudumisha ushindi wa miezi 3 mfululizo.',
    descriptionEn:
      'A 2% luxury housing fund supporting home ownership up to 200% value over 20 years for Crown Managers who maintain consecutive 3-month performance.',
    rules: [
      'Kufuzu Car Fund kwanza ni kigezo cha awali.',
      'Kudumisha hadhi ya Crown Manager kwa miezi 3 mfululizo bila kukosa.',
      'Alama za kikundi (CPGS) zisipungue 2,000 SV kila mwezi.',
    ],
  },
  {
    id: 'travel',
    name: 'Edmark Travel Fund',
    swahiliName: 'Mfuko wa Safari za Kimataifa (Travel Fund)',
    bonusPercent: '2%',
    targetRank: 'Ruby Manager & Above',
    qualificationCycleMonths: 3,
    monthlySvRequirement: 2000,
    personalSvRequirement: 100,
    descriptionSw:
      'Gharama zote zikilipwa na Edmark kusafiri kwenye mikutano na likizo za kifahari za kimataifa (Malaysia, Dubai, Ulaya, Afrika Kusini) kila mwaka.',
    descriptionEn:
      'All-expense-paid luxury international leadership seminars (Malaysia, Dubai, Europe, South Africa) for qualified Ruby Managers and above.',
    rules: [
      'Kufikia cheo cha Ruby Manager (Laini 2 za Mameneja waliofuzu).',
      'Kudumisha angalau miezi 3 mfululizo ya uzalishaji wa pointi za uongozi.',
      'Mfuko huu hautolewi fedha taslimu; unatumika moja kwa moja kwa safari na malazi ya kifahari.',
    ],
  },
  {
    id: 'manager',
    name: 'Manager Monthly Qualification (PGBV)',
    swahiliName: 'Kigezo cha Kila Mwezi cha Manager (2,000 SV)',
    bonusPercent: '14% - 20%',
    targetRank: 'Manager / Senior Manager',
    qualificationCycleMonths: 1,
    monthlySvRequirement: 2000,
    personalSvRequirement: 100,
    descriptionSw:
      'Kila mwezi Manager anapaswa kufikisha 2,000 SV za kikundi na 100 SV binafsi ili kupokea Manager Bonus (14%), Performance Bonus (hadi 20%), na kuzuia alama kuanguka.',
    descriptionEn:
      'Monthly manager active maintenance target of 2,000 SV Group Sales and 100 SV Personal Sales to unlock all 9 marketing plan bonuses.',
    rules: [
      '100 SV CPS (Personal) lazima ziingie kwenye namba yako ya uanachama.',
      '1,900 SV zilizobaki zinaweza kutoka kwa wateja wako wa rejareja na downlines wasio mameneja.',
      'Mwezi unamalizika siku ya mwisho ya mwezi saa 11:59 jioni (Saa za Dar es Salaam).',
    ],
  },
];

export interface MaintenanceStrategyTip {
  titleSw: string;
  titleEn: string;
  category: 'dos' | 'donts' | 'creativity' | 'downline';
  contentSw: string;
  contentEn: string;
  actionableStepSw: string;
  actionableStepEn: string;
}

export const MAINTENANCE_STRATEGIES: MaintenanceStrategyTip[] = [
  {
    titleSw: 'Mbinu ya Siku ya 12-14: Kumbusho la Refill kwa Wateja wa Shake Off',
    titleEn: 'Day 12-14 Strategy: Shake Off & MRT Refill Follow-up',
    category: 'creativity',
    contentSw:
      'Sanduku 1 la Shake Off lina sachets 12. Siku ya 12 mteja anapomaliza, utumbo wake umeanza kusafika na anaanza kuona matokeo. Huu ndio wakati wa dhahabu wa kumpigia simu na kumpa ofa ya Splina au sanduku la pili la Shake Off. Asilimia 75 ya wateja hununua tena iwapo utawasiliana nao siku hii.',
    contentEn:
      'One Shake Off box has 12 sachets. On Day 12 when customer finishes, their colon detox has started and they feel light. Contact them immediately to recommend Splina or Box 2. 75% of customers reorder when prompted at this exact window.',
    actionableStepSw: 'Fungua orodha ya mauzo kwenye ED-Assistant, angalia wateja waliopita siku 10, na watumie ujumbe wa WhatsApp kwa kitufe kimoja.',
    actionableStepEn: 'Open the sales ledger in ED-Assistant and send instant WhatsApp check-in to customers on Day 10-12.',
  },
  {
    titleSw: 'Mbinu ya Vifurushi vya P4 (High-SV Bundles)',
    titleEn: 'P4 Slimming Bundle Multiplier Strategy',
    category: 'dos',
    contentSw:
      'Kuuza bidhaa moja moja (k.m. kahawa 1 = 5 SV) kunachukua muda mrefu kufikisha 2,000 SV. Kifurushi 1 cha P4 (Shake Off + 2 MRT + Splina + Cafe Troika) kinakupa takriban 50 SV papo hapo. Unahitaji wateja 40 tu wa P4 au wateja 10 kwa kila wiki kufikisha 2,000 SV kiurahisi.',
    contentEn:
      'Selling single retail items (e.g. coffee = 5 SV) takes too long. One full P4 Slimming Kit yields ~50 SV instantly. You only need 40 P4 packs per month (or 10 per week across your team) to secure 2,000 SV.',
    actionableStepSw: 'Tangaza kifurushi cha P4 kama suluhisho kamili la wiki 4 la kupunguza tumbo badala ya kuuza Shake Off pekee.',
    actionableStepEn: 'Position the P4 Kit as a complete 4-week body transformation rather than single detox sachets.',
  },
  {
    titleSw: 'Usicheleweshe Kuingiza Ankara Ofisini Hadi Siku ya Mwisho',
    titleEn: 'Do NOT Delay Purchase Invoicing to the Last Day',
    category: 'donts',
    contentSw:
      'Kosa kubwa la wasambazaji ni kukusanya pesa za wateja mfukoni na kusubiri tarehe 30 ndio waende ofisi ya Edmark Kariakoo. Mara nyingi tarehe 30 foleni huwa kubwa au mtandao unaweza kukwama na alama zikashindwa kuingia mwezi huo, na kusababisha kuvunjika kwa mzunguko wa miezi 3 wa Car Fund.',
    contentEn:
      'The costliest distributor mistake is holding customer cash and rushing to Edmark Kariakoo office on the 30th. High branch traffic or network downtime can cause points to slip into the next month, resetting your 3-month Car Fund streak.',
    actionableStepSw: 'Weka utaratibu wa kuwasilisha ankara kila Ijumaa au kila Jumatatu ili alama ziingie kwenye mfumo wiki kwa wiki.',
    actionableStepEn: 'Submit all customer orders at Edmark office weekly on Mondays and Fridays.',
  },
  {
    titleSw: 'Kuandaa WhatsApp "Mini Slimming Detox" Group ya Siku 3',
    titleEn: 'Host a 3-Day Free WhatsApp Detox Masterclass',
    category: 'creativity',
    contentSw:
      'Kila katikati ya mwezi (tarehe 15), anzisha group la WhatsApp la watu 15-20. Wafundishe bure kanuni 3 za kusafisha tumbo, unywaji wa maji, na madhara ya asidi mwilini. Mwisho wa siku ya tatu, tangaza ofa maalum ya Shake Off na Splina. Hii huzalisha mauzo ya 300 - 500 SV ndani ya masaa 48.',
    contentEn:
      'Host a free 3-day WhatsApp detox group on the 15th of each month for 15-20 prospects. Share gut health tips and introduce Shake Off + Splina on Day 3. Typically generates 300-500 SV in 48 hours.',
    actionableStepSw: 'Tumia kitufe cha "Shiriki na Wateja" kutuma mwaliko wa darasa jipya la afya kwenye WhatsApp status yako.',
    actionableStepEn: 'Use the referral and promo share tool to post WhatsApp class invites.',
  },
  {
    titleSw: 'Usiwape Wateja Mikopo Bila Mkataba wa Tarehe Maalumu',
    titleEn: 'Do NOT Give Unsecured Open-Ended Customer Credit',
    category: 'donts',
    contentSw:
      'Kukopesha bidhaa bila kupokea nusu ya pesa (deposit) na bila kuweka tarehe kamili ya mwisho kunanyonya mtaji wako wa kununua mzigo mpya na kukufanya ukose alama za CPS mwezi huo.',
    contentEn:
      'Offering products on credit without upfront down-payment drains your working capital and prevents you from purchasing monthly CPS stock.',
    actionableStepSw: 'Pokea angalau 50% ya malipo kabla ya kukabidhi mzigo na tumia ED-Assistant kutuma risiti yenye tarehe rasmi ya salio.',
    actionableStepEn: 'Require 50% advance and log exact due dates with automated WhatsApp reminder receipts.',
  },
  {
    titleSw: 'Mbinu ya Kuimarisha Downlines Wakuu (The Power of 3 Active Legs)',
    titleEn: 'Empower 3 Core Downline Legs (Pacing & Duplication)',
    category: 'downline',
    contentSw:
      'Badala ya kufanya kila kitu peke yako, gawa lengo la 2,000 SV katika vipande: Wewe fanya 500 SV rejareja, kisha saidia downlines wako 3 wakuu kila mmoja afikishe 500 SV kupitia wateja wao. Jumla inakuwa 2,000 SV kwa urahisi bila uchovu.',
    contentEn:
      'Split the 2,000 SV monthly target: Execute 500 SV through personal retail, then mentor 3 key downline legs to achieve 500 SV each with their customer networks.',
    actionableStepSw: 'Kagua maendeleo ya downlines wako kila Jumanne kwenye chumba cha Mbinu & Mkakati.',
    actionableStepEn: 'Review team leg progress every Tuesday to address bottlenecks before month-end.',
  },
];
