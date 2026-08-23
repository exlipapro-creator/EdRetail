import React, { useState } from 'react';
import {
  MessageSquare,
  Phone,
  Bot,
  Receipt,
} from 'lucide-react';
import { useDistributorStore } from '../../store/distributorStore';
import { WHATSAPP_LINK } from '../../utils/whatsappCompiler';
import { parseCustomerOrDistributorIntent, ChatMessage } from '../../utils/chatbotEngine';

interface ClientCareCrmPanelProps {
  lang: 'en' | 'sw';
}

export const ClientCareCrmPanel: React.FC<ClientCareCrmPanelProps> = ({ lang }) => {
  const distributor = useDistributorStore((s) => s.getActiveDistributor());
  const sales = useDistributorStore((s) => s.sales);

  const [selectedScriptType, setSelectedScriptType] = useState<'progress' | 'refill' | 'next_step'>('refill');
  const [customClientName, setCustomClientName] = useState('Mama Sarah');
  const [customClientPhone, setCustomClientPhone] = useState('0712345678');
  const [customClientProduct, setCustomClientProduct] = useState('Shake Off & MRT Complex');

  // AI Simulator
  const [simQuery, setSimQuery] = useState('Nina vidonda vya tumbo nitumie nini?');
  const [simResult, setSimResult] = useState<ChatMessage | null>(null);

  const handleRunSimulator = () => {
    if (!simQuery.trim()) return;
    const res = parseCustomerOrDistributorIntent(simQuery, false, lang);
    setSimResult(res);
  };

  const handleSendCustomWhatsApp = (sequenceType: 'day3_detox' | 'day7_ulcer' | 'day14_refill' | 'day30_review') => {
    let msg = '';
    const cleanPhone = customClientPhone.replace(/\D/g, '').replace(/^0/, '255');

    if (sequenceType === 'day3_detox') {
      msg =
        `Habari ${customClientName}! Ni ${distributor.name} kutoka ED Retail. ` +
        `Uko kwenye Siku ya 3 ya dozi yako ya ${customClientProduct}. ` +
        `Je, unakunywa maji ya kutosha (lita 2–3 kwa siku)? Utumbo unavyojisafisha unahitaji maji mengi kurahisisha kutoa sumu. Nambie jinsi unavyojisikia leo!`;
    } else if (sequenceType === 'day7_ulcer') {
      msg =
        `Habari ${customClientName}! Ni ${distributor.name}. ` +
        `Kwenye Siku ya 7 ya kutumia Splina Liquid Chlorophyll & Shake Off: Je, maumivu ya gesi na kuwaka moto kifuani yamepungua? Kumbuka kunywa Splina kwenye maji baridi au ya uvuguvugu asubuhi kabla ya kula.`;
    } else if (sequenceType === 'day14_refill') {
      msg =
        `Habari ${customClientName}! Ni ${distributor.name}. ` +
        `Uko katikati ya mzunguko wako wa siku 14 na ${customClientProduct}. ` +
        `Kama unahitaji boksi la kuendeleza dozi yako ili matokeo yasikatike, nambie nikuletee au nikutumie leo kabla stoo haijafungwa!`;
    } else if (sequenceType === 'day30_review') {
      msg =
        `Hongera sana ${customClientName}! 🎉 Ni ${distributor.name}. ` +
        `Umetimiza Siku 30 tangu uanze safari yako ya afya na Edmark. ` +
        `Je, umepima uzito au maendeleo ya afya yako? Ningependa kusikia ushuhuda wako ili tukuwekee mpango wa afya endelevu.`;
    }

    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
      : `${WHATSAPP_LINK}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="space-y-6 bg-transparent text-stone-100">
      {/* Overview Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 to-stone-900 text-white rounded-2xl border border-emerald-800/60 shadow-xs space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-0.5 bg-amber-400 text-stone-950 font-black text-[10px] rounded-md uppercase">
            {lang === 'sw' ? 'Mkakati wa Kudumu wa Mauzo' : 'Retention & Refill CRM'}
          </span>
          <span className="text-emerald-300 text-xs font-semibold">
            {lang === 'sw' ? 'Ufuatiliaji wa Kitaalamu' : 'Consultative Aftercare'}
          </span>
        </div>
        <h3 className="text-sm sm:text-base font-extrabold text-white">
          {lang === 'sw'
            ? 'Arifa za Siku ya 10 & Ufuatiliaji wa Afya ya Wateja'
            : 'Day-10 Refill Alerts & Consultative Follow-ups'}
        </h3>
        <p className="text-xs text-stone-300 leading-relaxed max-w-2xl">
          {lang === 'sw'
            ? 'Wateja wanaotumia Shake Off, MRT, au Splina hukaribia kumaliza dozi baada ya siku 10–14. Tumia ujumbe huu wa kirafiki kuwajulia hali na kuwasaidia kuongeza mzigo mapema kabla dozi haijakatika.'
            : 'Follow up with clients around Day 10 in a caring, health-first tone to ensure continuous usage and effortless repeat orders.'}
        </p>
      </div>

      {/* Script Mode Selector */}
      <div className="bg-stone-950/80 p-4 sm:p-5 rounded-2xl border border-stone-800 space-y-3">
        <span className="text-xs font-bold text-stone-300 block">
          {lang === 'sw' ? 'Chagua Muktadha wa Ujumbe wa WhatsApp:' : 'Select Follow-up Context & Message Tone:'}
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => setSelectedScriptType('refill')}
            className={`p-3.5 rounded-xl text-left border text-xs transition-all cursor-pointer ${
              selectedScriptType === 'refill'
                ? 'bg-emerald-950/60 border-emerald-500 font-bold text-emerald-200 shadow-2xs'
                : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            <div className="font-extrabold text-white">🚨 {lang === 'sw' ? 'Siku 10: Mzigo Unakaribia' : 'Day 10: Refill Reminder'}</div>
            <div className="text-[11px] text-stone-400 mt-1">Zimebaki pakiti 2–3 za dozi</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedScriptType('progress')}
            className={`p-3.5 rounded-xl text-left border text-xs transition-all cursor-pointer ${
              selectedScriptType === 'progress'
                ? 'bg-emerald-950/60 border-emerald-500 font-bold text-emerald-200 shadow-2xs'
                : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            <div className="font-extrabold text-white">🌱 {lang === 'sw' ? 'Siku 5: Kujulia Hali' : 'Day 5: Progress Check'}</div>
            <div className="text-[11px] text-stone-400 mt-1">Kufuatilia tumbo kuwa jepesi</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedScriptType('next_step')}
            className={`p-3.5 rounded-xl text-left border text-xs transition-all cursor-pointer ${
              selectedScriptType === 'next_step'
                ? 'bg-emerald-950/60 border-emerald-500 font-bold text-emerald-200 shadow-2xs'
                : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            <div className="font-extrabold text-white">✨ {lang === 'sw' ? 'Hatua ya Pili: P4 Slimming' : 'Phase 2: Slimming Next Step'}</div>
            <div className="text-[11px] text-stone-400 mt-1">Kutoka Shake Off kwenda MRT</div>
          </button>
        </div>
      </div>

      {/* Real Queue from Sales */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
          {lang === 'sw' ? 'Orodha ya Wateja Wanaohitaji Ufuatiliaji:' : 'Active Client Follow-up Queue:'}
        </h4>

        {sales.length === 0 ? (
          <div className="p-8 text-center bg-stone-950/60 rounded-2xl border border-stone-800 text-stone-400 text-xs">
            <Receipt className="w-6 h-6 mx-auto text-stone-600 mb-2" />
            <p className="font-bold">
              {lang === 'sw'
                ? 'Bado haujarekodi mauzo. Rekodi mauzo ili mfumo upange tarehe za ufuatiliaji kiotomatiki.'
                : 'No sales logged yet. Add sales records to auto-schedule follow-ups.'}
            </p>
          </div>
        ) : (
          sales.map((sale) => {
            const getMessageForSale = () => {
              if (selectedScriptType === 'progress') {
                return `Habari ${sale.customerName}! Ni ${distributor.name} kutoka ED Retail. Nilikuwa nakusalimia na kufuatilia maendeleo ya afya yako baada ya kuanza kutumia ${sale.productName}. Je, tumbo limeanza kuwa jepesi au una swali lolote kuhusu unywaji?`;
              }
              if (selectedScriptType === 'next_step') {
                return `Habari ${sale.customerName}! Hongera sana kwa kukamilisha usafi na ${sale.productName}. Hatua inayofuata kwenye mfumo wa P4 ni MRT Complex ya kuchoma mafuta na Splina kusafisha damu. Ungependa nikuandalie kifurushi hiki kwa bei ya ofa?`;
              }
              return `Habari ${sale.customerName}! Ni ${distributor.name}. Natumai unaendelea vizuri na unaona matokeo mazuri ya ${sale.productName}! Kulingana na ratiba yako, mzigo wako unakaribia kuisha (zimebaki sachet chache). Je, nikuwekee oda nyingine mapema ili usikatishe dozi yako na uendelee kupata matokeo mazuri?`;
            };

            const messageText = getMessageForSale();
            const cleanPhone = sale.customerPhone.replace(/\D/g, '').replace(/^0/, '255');
            const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;

            return (
              <div
                key={sale.id}
                className="p-4 bg-stone-950/80 rounded-2xl border border-stone-800 shadow-2xs space-y-2.5 hover:border-emerald-700/60 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-xs sm:text-sm">{sale.customerName}</span>
                      <span className="text-xs text-stone-400 font-mono">({sale.customerPhone || 'Bila Namba'})</span>
                    </div>
                    <div className="text-xs text-stone-400 mt-1">
                      Bidhaa: <strong className="text-white">{sale.productName}</strong> • Tarehe: {new Date(sale.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{lang === 'sw' ? 'Tuma Ujumbe WhatsApp' : 'Dispatch via WhatsApp'}</span>
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Manual 1-Tap Customer Dispatch */}
      <div className="bg-stone-950/80 p-4 sm:p-5 rounded-2xl border border-stone-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-extrabold text-xs sm:text-sm text-white flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'sw' ? 'Tuma Ujumbe kwa Mteja Maalum (Manual)' : 'Quick-Dispatch to Custom Client'}</span>
          </span>
          <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded-md font-bold">1-Tap WhatsApp</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-stone-900/60 p-3.5 rounded-xl border border-stone-800">
          <div>
            <label className="block text-[11px] font-bold text-stone-400 mb-1">{lang === 'sw' ? 'Jina:' : 'Name:'}</label>
            <input
              type="text"
              value={customClientName}
              onChange={(e) => setCustomClientName(e.target.value)}
              className="w-full p-2 bg-stone-950 border border-stone-700 rounded-lg text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-stone-400 mb-1">{lang === 'sw' ? 'Simu WhatsApp:' : 'WhatsApp Phone:'}</label>
            <input
              type="tel"
              value={customClientPhone}
              onChange={(e) => setCustomClientPhone(e.target.value)}
              className="w-full p-2 bg-stone-950 border border-stone-700 rounded-lg text-xs font-mono font-semibold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-stone-400 mb-1">{lang === 'sw' ? 'Bidhaa:' : 'Product:'}</label>
            <input
              type="text"
              value={customClientProduct}
              onChange={(e) => setCustomClientProduct(e.target.value)}
              className="w-full p-2 bg-stone-950 border border-stone-700 rounded-lg text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => handleSendCustomWhatsApp('day3_detox')}
            className="p-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 rounded-xl text-[11px] font-bold text-center transition-colors cursor-pointer"
          >
            Siku 3 (Maji)
          </button>
          <button
            onClick={() => handleSendCustomWhatsApp('day7_ulcer')}
            className="p-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 rounded-xl text-[11px] font-bold text-center transition-colors cursor-pointer"
          >
            Siku 7 (Vidonda)
          </button>
          <button
            onClick={() => handleSendCustomWhatsApp('day14_refill')}
            className="p-2.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 rounded-xl text-[11px] font-bold text-center transition-colors cursor-pointer"
          >
            Siku 14 (Refill)
          </button>
          <button
            onClick={() => handleSendCustomWhatsApp('day30_review')}
            className="p-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 rounded-xl text-[11px] font-bold text-center transition-colors cursor-pointer"
          >
            Siku 30 (Ushuhuda)
          </button>
        </div>
      </div>

      {/* AI Health Simulator */}
      <div className="bg-stone-950/80 p-4 sm:p-5 rounded-2xl border border-stone-800 space-y-3">
        <div className="flex items-center gap-2 text-white font-extrabold text-xs sm:text-sm">
          <Bot className="w-4 h-4 text-emerald-400" />
          <span>{lang === 'sw' ? 'Jaribu Ushauri wa Afya (AI Health Simulator)' : 'AI Health Advisor Response Preview'}</span>
        </div>
        <p className="text-stone-400 text-xs">
          {lang === 'sw'
            ? 'Andika swali lolote la afya ili kuona jinsi roboti inavyowajibu wateja kwa weledi na kuwaelekeza WhatsApp yako.'
            : 'Test common questions to preview consultative responses routing back to your WhatsApp.'}
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={simQuery}
            onChange={(e) => setSimQuery(e.target.value)}
            placeholder="Mfano: Nina vidonda vya tumbo nitumie nini?..."
            className="flex-1 p-2.5 bg-stone-900 border border-stone-700 rounded-xl text-xs font-semibold text-white placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            onClick={handleRunSimulator}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black rounded-xl transition-colors cursor-pointer whitespace-nowrap text-xs"
          >
            {lang === 'sw' ? 'Jaribu' : 'Test'}
          </button>
        </div>

        {simResult && (
          <div className="p-3.5 bg-stone-900/80 rounded-xl border border-emerald-700/60 space-y-1.5">
            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
              {lang === 'sw' ? 'Majibu Yanayotumwa kwa Mteja:' : 'Response Output:'}
            </span>
            <p className="text-xs text-stone-200 whitespace-pre-wrap leading-relaxed">
              {simResult.text}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
