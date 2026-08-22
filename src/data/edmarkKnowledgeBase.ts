export interface ProductDetailKnowledge {
  id: string;
  name: string;
  swahiliName: string;
  taglineEn: string;
  taglineSw: string;
  wholesaleCostTzs: number; // Mwanahamisi buying price
  suggestedRetailTzs: number; // Retail selling price
  profitMarginTzs: number; // Retail profit
  svPoints: number; // Sales Volume (Edmark bonus point system)
  bvPoints: number; // Business Volume
  packSize: string;
  durationDays: number;
  ingredients: string[];
  keyBenefitsEn: string[];
  keyBenefitsSw: string[];
  howItWorksEn: string;
  howItWorksSw: string;
  prosEn: string[];
  prosSw: string[];
  consAndPrecautionsEn: string[];
  consAndPrecautionsSw: string[];
  whoShouldUseEn: string[];
  whoShouldUseSw: string[];
  whoShouldAvoidEn: string[];
  whoShouldAvoidSw: string[];
  exactDosageEn: string;
  exactDosageSw: string;
  commonQuestions: {
    questionEn: string;
    questionSw: string;
    answerEn: string;
    answerSw: string;
  }[];
}

export const EDMARK_KNOWLEDGE_BASE: Record<string, ProductDetailKnowledge> = {
  'shake-off-phyto': {
    id: 'shake-off-phyto',
    name: 'Shake Off Phyto Fiber',
    swahiliName: 'Shake Off Phyto Fiber (Kusafisha Utumbo)',
    taglineEn: 'Fast-acting organic colon detox cleanse — feel results in 6 to 8 hours',
    taglineSw: 'Dawa asilia ya kusafisha utumbo mkubwa — matokeo ya haraka ndani ya masaa 6 hadi 8',
    wholesaleCostTzs: 26000,
    suggestedRetailTzs: 35000,
    profitMarginTzs: 9000,
    svPoints: 12,
    bvPoints: 8500,
    packSize: '12 sachets / box (20g per sachet)',
    durationDays: 12,
    ingredients: [
      'Plant Fiber (Oats, Roselle, Psyllium Husk)',
      'Inulin (Prebiotic bifidus booster)',
      'Garcinia Cambogia (Natural appetite moderator)',
      'Organic Pandan Extract (Decongestant & natural soothing scent)',
    ],
    keyBenefitsEn: [
      'Flushes accumulated hardened mucoid plaque and toxins from intestinal walls',
      'Relieves chronic constipation naturally without cramping',
      'Flattens protruding potbelly by eliminating gas, bloating, and trapped fecal waste',
      'Improves skin clarity by clearing internal toxins that cause breakouts',
      'Lowers LDL bad cholesterol and promotes beneficial gut bacteria',
    ],
    keyBenefitsSw: [
      'Inasafisha na kung\'oa uchafu na sumu zilizoganda kwenye kuta za utumbo',
      'Inatibu tatizo sugu la kukosa choo bila maumivu ya tumbo',
      'Inapunguza kitambi na gesi tumboni haraka',
      'Inasafisha ngozi na chunusi kwa kuondoa sumu mwilini',
      'Inashusha lehemu (cholesterol) mbaya na kulinda bakteria wazuri wa tumboni',
    ],
    howItWorksEn:
      'High-potency soluble and insoluble fiber absorbs water, expanding into a gentle gelatinous sponge that sweeps along the 30-foot intestinal tract, binding with encrusted toxins and expelling them effortlessly in 6–8 hours.',
    howItWorksSw:
      'Nyuzi-lishe asilia hufyonza maji na kutanuka kama sponji laini inayopita utumbo mzima, ikifagia mafuta, sumu, na kinyesi kigumu na kukitoa nje kwa urahisi ndani ya masaa 6 hadi 8.',
    prosEn: [
      '100% natural plant-based ingredients; non-addictive',
      'Noticeable belly lightness on the very first morning',
      'Great natural Pandan / Lemon flavors',
      'Prebiotic inulin protects healthy gut flora',
    ],
    prosSw: [
      'Asilia 100% bila kemikali wala madhara ya kutegemea dawa',
      'Unajisikia mwepesi tumboni kuanzia asubuhi ya kwanza',
      'Ladha nzuri ya asili bila shida kumeza',
      'Inalinda bakteria wazuri wa mmeng\'enyo wa chakula',
    ],
    consAndPrecautionsEn: [
      'Must be consumed immediately upon mixing before it turns gelatinous',
      'Expect frequent comfortable bowel movements during the first 2–3 days',
      'Requires drinking at least 2.5 to 3 Litres of water daily',
    ],
    consAndPrecautionsSw: [
      'Lazima inywe mara tu baada ya kukoroga kabla haijaganda kuwa uji mzito',
      'Utaenda choo mara 2-3 asubuhi katika siku za kwanza (ni kawaida)',
      'Unahitaji kunywa maji ya kutosha (lita 2.5 - 3 kwa siku)',
    ],
    whoShouldUseEn: [
      'People struggling with constipation, gas, heavy bloating, or potbelly',
      'Anyone starting a slimming program (P4 Step 1 prerequisite)',
      'Individuals suffering from body odor, chronic tiredness, or dull skin from toxin buildup',
      'People who eat processed meat, fried foods, and low-fiber diets',
    ],
    whoShouldUseSw: [
      'Wenye tatizo la kukosa choo, tumbo kujaa gesi, au kitambi',
      'Mtu yeyote anayeanza safari ya kupunguza uzito',
      'Wanaosumbuliwa na uchovu sugu, harufu mbaya ya jasho, au ngozi kufifia kwa sumu',
      'Wanaokula nyama nyingi, vyakula vya mafuta, na wanga bila mboga za kutosha',
    ],
    whoShouldAvoidEn: [
      'Pregnant women in first trimester without physician consultation',
      'Patients with acute intestinal obstruction or severe recent abdominal surgery',
    ],
    whoShouldAvoidSw: [
      'Wajawazito miezi ya mwanzo bila ushauri wa daktari',
      'Wenye matatizo ya dharura ya kuziba utumbo au waliotoka kufanyiwa upasuaji mkubwa wa tumbo',
    ],
    exactDosageEn:
      'Day 1 to 7: Mix 1 sachet in 250ml cool water, shake vigorously in a shaker for 5 seconds, and drink immediately before sleeping. Day 8 onwards: Take 1 sachet every 2 to 3 days for maintenance.',
    exactDosageSw:
      'Siku ya 1 hadi ya 7: Koroga kifurushi 1 kwenye maji baridi au ya kawaida 250ml, tikisa vizuri sekunde 5, kunywa yote mara moja kabla ya kulala usiku. Siku ya 8 na kuendelea: Tumia kifurushi 1 kila baada ya siku 2 hadi 3.',
    commonQuestions: [
      {
        questionEn: 'Will Shake Off give me painful running stomach / cramps?',
        questionSw: 'Je, Shake Off itaniletea kuharisha kwa maumivu au kusokotwa tumbo?',
        answerEn:
          'No. Unlike chemical laxatives, Shake Off uses gentle dietary fiber that creates a smooth stool bulk. You will feel a natural urge with zero painful spasms.',
        answerSw:
          'Hapana kabisa. Shake Off siyo dawa ya kuharisha ya kemikali. Inatumia nyuzi-lishe asilia inayolainisha choo vizuri bila maumivu wala kukata tumbo.',
      },
      {
        questionEn: 'Can I use Shake Off if I have stomach ulcers?',
        questionSw: 'Je, naweza kutumia Shake Off kama nina vidonda vya tumbo?',
        answerEn:
          'Yes, but it is best to combine with Splina Liquid Chlorophyll to coat and soothe the stomach lining, and take Shake Off after a light evening snack rather than on an empty irritated stomach.',
        answerSw:
          'Ndiyo, lakini inashauriwa kuichanganya na Splina Liquid Chlorophyll ili kutuliza asidi, na unywe baada ya kupata mlo mwepesi usiku badala ya kukaa na njaa.',
      },
    ],
  },

  'mrt-complex': {
    id: 'mrt-complex',
    name: 'MRT Complex (Meal Replacement Therapy)',
    swahiliName: 'MRT Complex (Mlo Mbadala wa Kupunguza Uzito)',
    taglineEn: 'Clinically balanced meal replacement drink to burn visceral fat and nourish muscles',
    taglineSw: 'Kinywaji lishe mbadala wa chakula kinachochoma mafuta sugu huku kikiimarisha misuli',
    wholesaleCostTzs: 33000,
    suggestedRetailTzs: 45000,
    profitMarginTzs: 12000,
    svPoints: 16,
    bvPoints: 11000,
    packSize: '28 sachets / box (20g per sachet)',
    durationDays: 14,
    ingredients: [
      'Isolated Soy Protein (High bioavailability muscle retention)',
      'Fructose (Low glycemic index sustained energy)',
      'L-Carnitine (Direct fatty-acid transporter to mitochondrial fat-burning furnaces)',
      'Lecithin & Inositol (Fat emulsifiers preventing fatty liver)',
      'Complete Vitamin A, B-Complex, C, D, E & Mineral matrix',
    ],
    keyBenefitsEn: [
      'Triggers rapid safe lipolysis (burning stored body fat for energy)',
      'Suppresses intense hunger pangs for 3–5 hours with zero nutrient deprivation',
      'Preserves lean muscle mass while shrinking waistline, hips, and thighs',
      'Provides complete RDA vitamins and minerals in just 83 calories per sachet',
      'Prevents post-weight-loss skin sagging due to essential amino acids',
    ],
    keyBenefitsSw: [
      'Inachochea mwili kuchoma mafuta ya ziada (tumboni, mapajani na kiunoni) kuwa nishati',
      'Inakata njaa na hamu ya kula ovyo kwa masaa 3 hadi 5',
      'Inapunguza unene bila kulegeza misuli wala ngozi',
      'Ina kalori 83 tu lakini inajaza vitamini na madini yote anayohitaji binadamu kwa siku',
      'Inazuia ngozi kulegea baada ya kupungua uzito',
    ],
    howItWorksEn:
      'By replacing high-calorie heavy carbohydrate meals with an 83-calorie nutrient-dense MRT shake, the body enters a controlled calorie deficit. L-Carnitine transports stored visceral fat into cellular furnaces, converting stubborn fat into active energy.',
    howItWorksSw:
      'Kwa kubadilisha milo mikubwa ya wanga na mafuta kwa kutumia MRT yenye kalori 83 tu, mwili unalazimika kutumia mafuta yaliyoganda tumboni kama chanzo cha nishati bila wewe kujisikia kizunguzungu wala njaa.',
    prosEn: [
      'Tastes delicious like natural chocolate / vanilla shake',
      'Zero hunger or fatigue during dieting',
      'Saves cooking time and lunch expenses in busy working days',
      'Maintains mental sharpness and stamina',
    ],
    prosSw: [
      'Ladha tamu sana kama maziwa ya chokoleti au vanilla',
      'Hupati njaa wala kizunguzungu wakati wa kupunguza uzito',
      'Inaokoa gharama za kununua vyakula vya mgahawani mchana',
      'Inakupa nguvu ya kufanya kazi bila kuchoka',
    ],
    consAndPrecautionsEn: [
      'Must drink plenty of Splina or water between meals to flush metabolized fat byproducts',
      'Avoid high-sugar sodas and heavy fatty dinners during the program',
    ],
    consAndPrecautionsSw: [
      'Ni lazima unywe maji au Splina kwa wingi ili kutoa mabaki ya mafuta yaliyochomwa',
      'Epuka soda, bia, na vyakula vyenye sukari na mafuta mengi wakati wa programu',
    ],
    whoShouldUseEn: [
      'Men and women wanting to lose 3 to 15 kg in a healthy, supervised manner',
      'Busy corporate workers who need a healthy quick breakfast or lunch on the go',
      'Individuals struggling with fatty liver, high cholesterol, or pre-diabetes',
    ],
    whoShouldUseSw: [
      'Wanaume na wanawake wanaotaka kupunguza kilo 3 hadi 15 kwa usalama',
      'Wafanyakazi au wafanyabiashara wenye haraka asubuhi au mchana',
      'Wenye matatizo ya mafuta kwenye ini au lehemu nyingi',
    ],
    whoShouldAvoidEn: [
      'Severe kidney disease patients requiring strict low-protein dialysis limits without doctor approval',
    ],
    whoShouldAvoidSw: [
      'Wagonjwa wenye hitilafu kubwa ya figo waliozuiwa protini na daktari',
    ],
    exactDosageEn:
      'Standard Weight Loss Program: Take 1 sachet of MRT mixed with 250ml cold/room water to replace Breakfast and Lunch. Eat a light, balanced dinner (vegetables + lean protein). For intensive P4 fast track: Replace all 3 meals for 7 days taking MRT every 3 hours.',
    exactDosageSw:
      'Mpango wa Kawaida: Koroga sachet 1 kwenye maji baridi 250ml asubuhi (badala ya chai) na mchana (badala ya chakula cha mchana). Kula chakula cha kawaida chepesi jioni (mboga za majani na protini). Kunywa maji ya kutosha.',
    commonQuestions: [
      {
        questionEn: 'How much weight will I lose with MRT in 2 weeks?',
        questionSw: 'Nitapungua kilo ngapi nikitumia MRT kwa wiki 2?',
        answerEn:
          'Most disciplined clients lose between 3kg to 7kg in 14 days when following the P4 Shake Off + MRT routine and drinking adequate water.',
        answerSw:
          'Wateja wengi hupungua wastani wa kilo 3 hadi 7 ndani ya siku 14 wanapofuata utaratibu sahihi wa Shake Off na MRT pamoja na kunywa maji mengi.',
      },
    ],
  },

  'splina-chlorophyll': {
    id: 'splina-chlorophyll',
    name: 'Splina Liquid Chlorophyll',
    swahiliName: 'Splina Liquid Chlorophyll (Klorofili ya Maji)',
    taglineEn: 'Nature’s green blood purifier, acid neutralizer, and cellular rejuvenator',
    taglineSw: 'Kisafisha damu asilia, kiondoa asidi na kinga kuu ya seli za mwili',
    wholesaleCostTzs: 21000,
    suggestedRetailTzs: 28000,
    profitMarginTzs: 7000,
    svPoints: 10,
    bvPoints: 7000,
    packSize: '500ml bottle (100 servings)',
    durationDays: 30,
    ingredients: [
      'Pure Mulberry Leaf Extract (Morus Alba - rich in therapeutic chlorophyllin)',
      'Bio-available Zinc, Selenium, Vitamin E, Vitamin C, Calcium, Iron',
    ],
    keyBenefitsEn: [
      'Neutralizes excess stomach acid and accelerates healing of gastric & duodenal ulcers',
      'Oxygenates and purifies bloodstream, building healthy red blood cells (hemoglobin)',
      'Eliminates chronic body odor, bad breath (halitosis), and smelly sweat',
      'Maintains ideal slightly alkaline body pH (7.35–7.45) inhibiting chronic disease growth',
      'Accelerates external and internal wound healing',
    ],
    keyBenefitsSw: [
      'Inatibu na kutuliza vidonda vya tumbo na kuondoa asidi kali (kiungulia)',
      'Inasafisha damu na kuongeza damu haraka kwa wenye upungufu (HB ndogo)',
      'Inaondoa harufu mbaya ya kinywa, jasho na mwili mzima',
      'Inatenganisha asidi mwilini na kuweka mwili katika mazingira ya afya (Alkaline)',
      'Inaponya majeraha ya ndani na nje kwa haraka',
    ],
    howItWorksEn:
      'The molecular structure of chlorophyll is nearly identical to human hemoglobin, replacing the central iron atom with magnesium. It readily binds with toxins, heavy metals, and acid metabolites, neutralizing them and carrying fresh oxygen to depleted organs.',
    howItWorksSw:
      'Muundo wa Splina unafanana kabisa na chembe nyekundu za damu ya binadamu. Inapita kwenye mishipa na viungo vya mwili, ikifyonza asidi, sumu, na kurekebisha seli zilizoharibika huku ikiongeza hewa safi ya oksijeni.',
    prosEn: [
      '1 bottle provides 100 servings (very economical for entire family)',
      'Instant soothing relief for burning ulcer pains and acid reflux in minutes',
      'Safe for children, elderly, and adults alike',
      'No harsh chemical taste, refreshing green water',
    ],
    prosSw: [
      'Chupa 1 ina glasi zaidi ya 100 (inatosha familia nzima mwezi mzima)',
      'Inatuliza maumivu makali ya vidonda vya tumbo na kiungulia ndani ya dakika chache',
      'Ni salama kwa watoto, watu wazima na wazee',
      'Ladha laini na ya kuburudisha bila uchungu',
    ],
    consAndPrecautionsEn: [
      'Do not mix with boiling water (heat destroys delicate chlorophyll enzymes)',
      'Keep refrigerated after opening or in a cool shaded room away from direct sunlight',
    ],
    consAndPrecautionsSw: [
      'Usichanganye na maji yanayochemka (moto unaharibu virutubisho vya chlorophyll)',
      'Weka mahali pa baridi au kivulini mbali na jua kali',
    ],
    whoShouldUseEn: [
      'People suffering from gastric ulcers, chronic acid reflux, or burning throat sensations',
      'Anyone experiencing low blood count, fatigue, or pale skin',
      'Smokers, drinkers, and people exposed to city pollution',
      'Anyone who rarely eats fresh dark green leafy vegetables',
    ],
    whoShouldUseSw: [
      'Wenye vidonda vya tumbo, gesi kali inayopanda kifuani, na kiungulia',
      'Wenye upungufu wa damu au uchovu wa mara kwa mara',
      'Wavutaji sigara, watumiaji wa vileo na wanaofanya kazi kwenye vumbi au kemikali',
      'Watu wasiokula mboga za majani za kutosha kila siku',
    ],
    whoShouldAvoidEn: [
      'Safe for virtually everyone; rare individuals on strict prescription potassium restriction should monitor intake',
    ],
    whoShouldAvoidSw: [
      'Ni salama kwa karibu kila mtu; haina kemikali yoyote hatarishi',
    ],
    exactDosageEn:
      'Add 1 cap (5ml) of Splina into 250ml–500ml of room temperature or cold water. Stir and drink 2 to 3 times daily. For severe ulcers: Drink 1 glass every morning 30 minutes before any food and before sleeping.',
    exactDosageSw:
      'Weka kifuniko 1 (5ml) cha Splina kwenye glasi au chupa ya maji baridi/ya kawaida (300ml - 500ml). Koroga na unywe mara 2 hadi 3 kwa siku. Kwa vidonda vya tumbo: Kunywa glasi 1 asubuhi kabla ya kula chochote na glasi 1 usiku kabla ya kulala.',
    commonQuestions: [
      {
        questionEn: 'How long until I see relief from stomach ulcers?',
        questionSw: 'Itachukua muda gani kupata nafuu ya vidonda vya tumbo?',
        answerEn:
          'Most users feel soothing acid relief within 15–30 minutes of drinking Splina. Healing and repair of the mucosa typically stabilizes within 14 to 30 days of continuous use.',
        answerSw:
          'Kutuliza maumivu na kiungulia hutokea ndani ya dakika 15 hadi 30. Vidonda kupona kabisa huchukua siku 14 hadi 30 za matumizi mfululizo.',
      },
    ],
  },

  'hawaiian-spirulina': {
    id: 'hawaiian-spirulina',
    name: 'Hawaiian Spirulina',
    swahiliName: 'Hawaiian Spirulina (Mfalme wa Vyakula Bora)',
    taglineEn: 'The world’s most nutrient-rich blue-green algae superfood for immune defense',
    taglineSw: 'Chakula bora cha asili chenye virutubisho vingi zaidi duniani kwa kinga na uzima',
    wholesaleCostTzs: 24000,
    suggestedRetailTzs: 32000,
    profitMarginTzs: 8000,
    svPoints: 11,
    bvPoints: 8000,
    packSize: '200 tablets / bottle (200mg per tablet)',
    durationDays: 30,
    ingredients: [
      '100% Pure Hawaiian Cultured Spirulina Platensis (Sun-grown in pristine deep sea ocean water)',
      'Rich in Phycocyanin, Beta-Carotene, Gamma Linolenic Acid (GLA), Complete Plant Protein (65%)',
    ],
    keyBenefitsEn: [
      'Massively fortifies immune system and white blood cell activity',
      'Rich in plant iron and B-12 for combating anemia and chronic fatigue',
      'Provides powerful cellular anti-aging antioxidant protection against free radicals',
      'Supplies all 8 essential amino acids, minerals, and chlorophyll in pure bioavailable form',
      'Improves mental concentration and physical stamina',
    ],
    keyBenefitsSw: [
      'Inaimarisha kinga ya mwili mara dufu dhidi ya magonjwa na maambukizi',
      'Ina madini ya chuma na Vitamini B12 kwa wingi inayotibu upungufu wa damu',
      'Inalinda seli zisizeeke haraka na kuzuia madhara ya sumu',
      'Ina protini safi asilia 65% na madini yote muhimu',
      'Inaongeza umakini kazini na stamina ya mwili',
    ],
    howItWorksEn:
      'Spirulina is single-cell microalgae with thin mucopolysaccharide cell walls, allowing 95% human digestive absorption within 20 minutes, directly nourishing cellular mitochondria.',
    howItWorksSw:
      'Mwani huu unanyonywa na mwili kwa 95% ndani ya dakika 20 tu, ukifikisha virutubisho na nguvu moja kwa moja kwenye seli na mifupa.',
    prosEn: [
      '100% organic ocean-harvested in Hawaii with zero contaminants',
      'Complete superfood in easy-to-swallow small tablets',
      'Great for growing children, malnourished individuals, and elderly',
    ],
    prosSw: [
      'Asilia 100% bila sumu wala kemikali',
      'Vidonge vidogo rahisi kumeza kwa mtu yeyote',
      'Bora sana kwa watoto wanaokua, wajawazito, na wazee',
    ],
    consAndPrecautionsEn: [
      'Drink plenty of water when taking tablets',
      'Those with rare autoimmune condition flare-ups should start with smaller doses',
    ],
    consAndPrecautionsSw: [
      'Kunywa maji ya kutosha wakati wa kumeza vidonge',
    ],
    whoShouldUseEn: [
      'People with weak immunity who catch flu and infections easily',
      'Pregnant and nursing mothers seeking rich natural plant nutrition and milk flow',
      'People dealing with sickle cell, low hemoglobin, or recovering from illness',
      'Vegetarians needing complete B12 and rich plant protein',
    ],
    whoShouldUseSw: [
      'Wenye kinga ndogo ya mwili na wanaougua mafua mara kwa mara',
      'Wajawazito na wanaonyonyesha wanaohitaji kuongeza damu na maziwa ya mtoto',
      'Wenye tatizo la selimundu (sickle cell) au waliotoka kuugua',
      'Watu wasiokula nyama wanaohitaji protini na Vitamini B12',
    ],
    whoShouldAvoidEn: ['Patients with Phenylketonuria (PKU) rare metabolic disorder'],
    whoShouldAvoidSw: ['Wenye hitilafu nadra ya kimaumbile ya kimetaboliki (PKU)'],
    exactDosageEn:
      'Take 3 to 6 tablets daily with water. Adults: 3 tablets morning and 3 tablets evening 30 minutes before food. Children: 1 to 2 tablets daily.',
    exactDosageSw:
      'Meza vidonge 3 asubuhi na vidonge 3 jioni nusu saa kabla ya kula chakula na maji ya kutosha. Watoto: Vidonge 1 hadi 2 kwa siku.',
    commonQuestions: [
      {
        questionEn: 'Can pregnant women take Hawaiian Spirulina?',
        questionSw: 'Je, mjamzito anaweza kutumia Hawaiian Spirulina?',
        answerEn:
          'Yes! It is one of the safest and most recommended natural iron, folic acid, and protein sources for pregnancy health.',
        answerSw:
          'Ndiyo kabisa! Ni chanzo bora na salama cha asili cha madini chuma, folic acid, na protini kwa ajili ya afya ya mama na mtoto tumboni.',
      },
    ],
  },

  'cafe-troika': {
    id: 'cafe-troika',
    name: 'Cafe Troika',
    swahiliName: 'Kahawa ya Troika (Nishati & Nguvu)',
    taglineEn: 'Triple-powered premium wellness coffee with Ganoderma, Ginseng & Tongkat Ali',
    taglineSw: 'Kahawa ya kipekee yenye mchanganyiko wa nguvu wa Ganoderma, Ginseng na Tongkat Ali',
    wholesaleCostTzs: 20000,
    suggestedRetailTzs: 27000,
    profitMarginTzs: 7000,
    svPoints: 9,
    bvPoints: 6500,
    packSize: '20 sachets / box (20g per sachet)',
    durationDays: 20,
    ingredients: [
      'Gourmet Arabica & Robusta Coffee Blend',
      'Tongkat Ali Extract (Eurycoma Longifolia - natural testosterone booster)',
      'Korean Ginseng Extract (Panax - adaptogen for stamina and blood flow)',
      'Ganoderma Lucidum (Lingzhi / Reishi mushroom for heart & cellular health)',
    ],
    keyBenefitsEn: [
      'Enhances natural male vitality, libido, and physical stamina',
      'Supports healthy blood circulation and erectile vascular function',
      'Reduces physical exhaustion and chronic back/joint fatigue',
      'Boosts testosterone levels naturally without artificial stimulant crashes',
      'Improves mental drive, confidence, and workday alertness',
    ],
    keyBenefitsSw: [
      'Inaongeza nguvu za kiume, hamu na stamina wakati wa tendo la ndoa',
      'Inaboresha mzunguko wa damu kwenye mishipa na viungo vya uzazi',
      'Inaondoa uchovu wa mwili mzima, maumivu ya mgongo na kiuno',
      'Inapandisha homoni ya kiume (testosterone) kiasili bila madhara ya moyo',
      'Inaongeza ukakamavu, umakini na kujiamini kazini',
    ],
    howItWorksEn:
      'Tongkat Ali stimulates release of free testosterone from sex-hormone binding globulin (SHBG). Ginseng stimulates nitric oxide production, expanding blood vessels, while Ganoderma strengthens cardiac efficiency and stamina.',
    howItWorksSw:
      'Tongkat Ali huchochea homoni za kiume kufanya kazi vizuri. Ginseng hupanua mishipa ya damu ili kusafirisha damu na oksijeni kwa nguvu, huku Ganoderma ikilinda moyo na kuondoa uchovu sugu.',
    prosEn: [
      'Rich, aromatic coffee taste; smooth and non-bitter',
      'Zero palpitations or sudden blood pressure spikes',
      'Contains medicinal herbs revered for centuries',
    ],
    prosSw: [
      'Ladha nzuri sana na harufu ya kuvutia ya kahawa halisi',
      'Haidundi moyo kwa kasi kama dawa za kemikali',
      'Ina mimea tiba maarufu duniani yenye historia ya miaka mingi',
    ],
    consAndPrecautionsEn: [
      'Take only 1 cup daily; do not exceed 2 cups per day',
      'Best taken in the morning or early afternoon (avoid late night if sensitive to caffeine)',
    ],
    consAndPrecautionsSw: [
      'Kikombe 1 kwa siku kinatosha; usizidishe vikombe 2 kwa siku',
      'Inafaa kutumiwa asubuhi au mchana kabla ya saa 10 jioni',
    ],
    whoShouldUseEn: [
      'Men experiencing low energy, diminished libido, or fatigue from stress and age',
      'Hardworking individuals needing sustained stamina and alertness without jittery crashes',
      'Couples looking to reignite romance and intimacy naturally',
    ],
    whoShouldUseSw: [
      'Wanaume wanaosumbuliwa na upungufu wa nguvu za kiume, uchovu na msongo wa mawazo',
      'Watu wanaofanya kazi ngumu au za masaa mengi wanaohitaji stamina',
      'Watu wanaotaka kuamsha furaha ya ndoa kiasili',
    ],
    whoShouldAvoidEn: [
      'Children under 18',
      'Pregnant women',
      'Patients with uncontrolled severe cardiac hypertension taking nitroglycerin prescriptions',
    ],
    whoShouldAvoidSw: [
      'Watoto chini ya miaka 18',
      'Wajawazito',
      'Wenye shinikizo kali la damu (BP) lisilodhibitiwa na daktari',
    ],
    exactDosageEn:
      'Empty 1 sachet into a cup, add 150ml of hot water, stir well and drink. Take 1 cup every morning after breakfast.',
    exactDosageSw:
      'Weka kifurushi 1 kwenye kikombe, mimina maji moto 150ml, koroga vizuri na unywe asubuhi baada ya kiamsha kinywa.',
    commonQuestions: [
      {
        questionEn: 'Does Cafe Troika have side effects like pharmaceutical blue pills?',
        questionSw: 'Je, Troika ina madhara kama dawa za kemikali za kuongeza nguvu?',
        answerEn:
          'No. Chemical pills force artificial blood pressure surges that strain the heart. Troika is a 100% herbal beverage that nourishes natural bodily systems gradually and sustainably.',
        answerSw:
          'Hapana kabisa. Dawa za kemikali hupandisha shinikizo la damu ghafla na kudhuru moyo. Troika ni kinywaji cha mimea asilia kinachorutubisha mwili taratibu bila kuleta madhara ya moyo.',
      },
    ],
  },

  'ginseng-coffee': {
    id: 'ginseng-coffee',
    name: 'Ginseng Coffee',
    swahiliName: 'Kahawa ya Ginseng (Umakini & Kumbukumbu)',
    taglineEn: 'Smooth energy brew with Korean Ginseng to sharpen memory and eliminate fatigue',
    taglineSw: 'Kahawa laini yenye Ginseng ya Korea kuongeza umakini, kumbukumbu na kuondoa uvivu',
    wholesaleCostTzs: 18000,
    suggestedRetailTzs: 25000,
    profitMarginTzs: 7000,
    svPoints: 8,
    bvPoints: 6000,
    packSize: '20 sachets / box (18g per sachet)',
    durationDays: 20,
    ingredients: [
      'Finest Colombian Arabica & Robusta Coffee Beans',
      'High-grade Korean Panax Ginseng Extract (Rich in active Ginsenosides)',
    ],
    keyBenefitsEn: [
      'Sharpens mental focus, memory retention, and working alertness',
      'Increases physical stamina and combats morning sluggishness',
      'Lowers heart rate under mental stress, promoting calm clarity',
      'Assists in lowering bad cholesterol and boosting antioxidant defense',
      'Smooth taste without stomach acid aggravation',
    ],
    keyBenefitsSw: [
      'Inanoa ubongo, kuongeza kumbukumbu na umakini kazini na masomoni',
      'Inaongeza nguvu za mwili na kuondoa uvivu wa asubuhi',
      'Inatuliza akili wakati wa msongo wa mawazo (stress)',
      'Inasaidia kushusha lehemu mbaya mwilini',
      'Haiwashi tumbo wala kusababisha kiungulia kama kahawa za kawaida',
    ],
    howItWorksEn:
      'Ginsenosides act as adaptogens on the adrenal-pituitary axis, balancing cortisol hormones and boosting acetylcholine neurotransmitters for rapid cerebral response.',
    howItWorksSw:
      'Dondoo ya Ginseng inafanya kazi kwenye mishipa ya fahamu na ubongo, ikipunguza homoni za msongo wa mawazo na kuongeza uwezo wa ubongo kufikiri kwa haraka.',
    prosEn: [
      'Very mild and creamy taste',
      'Does not cause nervous jittery shaking',
      'Great for both men and women of all professions',
    ],
    prosSw: [
      'Ladha nzuri na laini sana',
      'Haikupi wasiwasi wala kutetemeka mikono kama kahawa nyingine',
      'Inafaa wanaume na wanawake wa taaluma zote',
    ],
    consAndPrecautionsEn: ['Best enjoyed morning or afternoon; avoid within 3 hours of sleep'],
    consAndPrecautionsSw: ['Inafaa asubuhi au mchana; epuka kunywa karibu na muda wa kulala'],
    whoShouldUseEn: [
      'Students, office workers, drivers, and entrepreneurs needing razor-sharp concentration',
      'People feeling tired, burned out, or struggling to get started in the morning',
    ],
    whoShouldUseSw: [
      'Wanafunzi, wafanyakazi wa ofisini, madereva na wafanyabiashara wanaohitaji akili kuwa wazi',
      'Watu wanaojisikia kuchoka na kukosa hamasa ya kufanya kazi',
    ],
    whoShouldAvoidEn: ['Young children under 12'],
    whoShouldAvoidSw: ['Watoto wadogo chini ya miaka 12'],
    exactDosageEn:
      'Mix 1 sachet in 150ml hot water. Stir well and drink 1 to 2 cups daily during morning or afternoon.',
    exactDosageSw:
      'Koroga sachet 1 kwenye maji moto 150ml. Kunywa kikombe 1 hadi 2 kwa siku, asubuhi na mchana.',
    commonQuestions: [
      {
        questionEn: 'Can I drink Ginseng Coffee if regular coffee gives me heart palpitations?',
        questionSw: 'Je, naweza kunywa Ginseng Coffee kama kahawa nyingine inanifanya moyo uende mbio?',
        answerEn:
          'Yes! The adaptogenic Korean Ginseng balances caffeine absorption, delivering smooth steady energy without heart racing.',
        answerSw:
          'Ndiyo! Mmea wa Ginseng unasawazisha utendaji wa kahawa, hivyo inakupa nguvu bila kufanya moyo uende mbio.',
      },
    ],
  },

  'cocollagen': {
    id: 'cocollagen',
    name: 'CoCollagen',
    swahiliName: 'CoCollagen (Ngozi Nyuso & Viungo)',
    taglineEn: 'Hydrolyzed marine collagen & chocolate drink for youthful radiant skin and flexible joints',
    taglineSw: 'Kinywaji cha chokoleti na collagen ya asili ya baharini kwa ngozi nyororo na viungo imara',
    wholesaleCostTzs: 22000,
    suggestedRetailTzs: 30000,
    profitMarginTzs: 8000,
    svPoints: 10,
    bvPoints: 7500,
    packSize: '20 sachets / box (30g per sachet)',
    durationDays: 20,
    ingredients: [
      'Pure Enzymatic Hydrolyzed Marine Collagen (High absorption micro-peptides)',
      'Rich Cocoa Extract (Natural polyphenols and mood enhancer)',
      'Amino Acids (Glycine, L-Proline, L-Hydroxyproline)',
      'Sucrose & Natural Flavors',
    ],
    keyBenefitsEn: [
      'Restores skin elasticity, firming sagging facial contours and smoothing fine lines/wrinkles',
      'Deeply hydrates dry, dull skin from the inside out for a natural glow',
      'Strengthens brittle nails and stimulates thicker, shinier hair growth',
      'Lubricates stiff knee joints and replenishes cartilage collagen matrix',
      'Promotes deep, restorative REM sleep when taken warm before bed',
    ],
    keyBenefitsSw: [
      'Inarudisha unyumbulifu wa ngozi, inakaza ngozi iliyolegea na kufuta mikunjo',
      'Inalainisha ngozi kavu na kuifanya ing\'ae na kuwa nyororo kiasili',
      'Inaimarisha kucha zisikatike na kukuza nywele nzito na zenye afya',
      'Inalainisha viungo vya magoti na kupunguza maumivu ya mifupa kusagana',
      'Inaleta usingizi mzito na wa amani ukinywa ikiwa ya uvuguvugu usiku',
    ],
    howItWorksEn:
      'Hydrolyzed marine collagen peptides enter the bloodstream intact, signaling fibroblast cells in the dermis layer to synthesize fresh new collagen and hyaluronic acid structures.',
    howItWorksSw:
      'Collagen ya baharini inanyonywa kwa haraka na damu, ikienda moja kwa moja kwenye seli za ngozi na viungo ili kuzalisha upya nyuzi-lishe zinazofanya ngozi kuwa changa na viungo kuwa na uteute.',
    prosEn: [
      'Delicious rich chocolate cocoa taste loved by everyone',
      'Micro-peptide formulation absorbs faster than tablet collagen',
      'Natural nighttime relaxation and anti-aging ritual',
    ],
    prosSw: [
      'Ladha tamu sana ya chokoleti asilia',
      'Inafyonzwa haraka zaidi mwilini kuliko vidonge vya kawaida',
      'Inakupa utulivu na kupumzisha mwili usiku kabla ya kulala',
    ],
    consAndPrecautionsEn: ['People with severe seafood/fish allergies should test carefully'],
    consAndPrecautionsSw: ['Watu wenye mzio (allergy) mkali wa samaki wanapaswa kuwa waangalifu'],
    whoShouldUseEn: [
      'Women and men over 25 noticing fine lines, dull skin tone, or dark circles',
      'People suffering from aching knees, joint stiffness, or hair thinning',
      'Anyone wanting a guilt-free luxurious evening chocolate drink with real health benefits',
    ],
    whoShouldUseSw: [
      'Watu wenye umri kuanzia miaka 25 wanaotaka kulinda muonekano wa ujana na ngozi laini',
      'Wenye maumivu ya viungo vya magoti, mgongo au kucha na nywele kukatika',
      'Wanaopenda kinywaji kitamu cha chokoleti chenye manufaa ya afya usiku',
    ],
    whoShouldAvoidEn: ['Individuals with severe diagnosed fish/marine allergies'],
    whoShouldAvoidSw: ['Wenye mzio mkali wa vyakula vya baharini (samaki)'],
    exactDosageEn:
      'Mix 1 sachet in 200ml warm water or milk. Stir well and drink 1 cup every evening 30 minutes before sleep for optimal overnight tissue regeneration.',
    exactDosageSw:
      'Koroga sachet 1 kwenye kikombe cha maji ya uvuguvugu au maziwa 200ml. Kunywa jioni nusu saa kabla ya kulala.',
    commonQuestions: [
      {
        questionEn: 'How soon will I notice smoother skin with CoCollagen?',
        questionSw: 'Nitaanza lini kuona mabadiliko ya ngozi laini na CoCollagen?',
        answerEn:
          'Skin hydration and glow improve within 7–10 days; noticeable firming of wrinkles and stronger nails typically occur by week 3 to 4.',
        answerSw:
          'Ngozi kuanza kuwa laini na kung\'aa huanza kuonekana ndani ya siku 7 hadi 10. Kukaza ngozi na kuimarika kwa kucha huonekana kuanzia wiki ya 3 hadi 4.',
      },
    ],
  },
};
