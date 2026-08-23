import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  CheckCircle2,
  Clock,
  TrendingUp,
  Package,
  Users,
  MessageSquare,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useDistributorStore } from '../../store/distributorStore';
import { EDMARK_FUNDS } from '../../data/edmarkMaintenancePlaybook';
import { DISTRIBUTOR_NAME } from '../../utils/whatsappCompiler';

interface MaintenanceTrackerPanelProps {
  onSendChatMessage: (text: string) => void;
  lang: 'en' | 'sw';
}

export const MaintenanceTrackerPanel: React.FC<MaintenanceTrackerPanelProps> = ({
  onSendChatMessage,
  lang,
}) => {
  const targetFund = useDistributorStore((s) => s.targetFund);
  const setTargetFund = useDistributorStore((s) => s.setTargetFund);
  const consecutiveMonthsRecord = useDistributorStore((s) => s.consecutiveMonthsRecord);
  const downlineLegs = useDistributorStore((s) => s.downlineLegs);
  const updateDownlineLegSv = useDistributorStore((s) => s.updateDownlineLegSv);
  const completeMonthChallenge = useDistributorStore((s) => s.completeMonthChallenge);
  const getMaintenanceAnalysis = useDistributorStore((s) => s.getMaintenanceAnalysis);

  const analysis = getMaintenanceAnalysis();
  const selectedFund = EDMARK_FUNDS.find((f) => f.id === targetFund) || EDMARK_FUNDS[0];

  const [editingLegId, setEditingLegId] = useState<string | null>(null);
  const [legSvInput, setLegSvInput] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  const handleUpdateLeg = (legId: string) => {
    const val = parseInt(legSvInput, 10);
    if (!isNaN(val) && val >= 0) {
      updateDownlineLegSv(legId, val);
      setEditingLegId(null);
      setLegSvInput('');
    }
  };

  const handleMarkMonthCompleted = (monthIndex: 1 | 2 | 3) => {
    completeMonthChallenge(monthIndex);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 4000);
  };

  const handleSendDownlineWhatsApp = (legName: string, phone: string, currentSv: number, targetSv: number) => {
    const gap = Math.max(0, targetSv - currentSv);
    const msg =
      `Habari ${legName}! Ni ${DISTRIBUTOR_NAME}. Nimeangalia maendeleo ya mwezi huu: timu yako imefikisha ${currentSv} SV. ` +
      `Imebaki ${gap} SV tu kufikia lengo lako la ${targetSv} SV la mwezi! ` +
      `Hii ni sawa na kuuza P4 Slimming Kit ${Math.ceil(gap / 50)} au Shake Off ${Math.ceil(gap / 10)}. ` +
      `Unahitaji msaada wowote au mafunzo kwa wateja wako leo? Tupige hatua pamoja!`;

    const cleanPhone = phone.replace(/^0/, '255');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="flex-1 overflow-y-auto space-y-4 bg-transparent text-stone-100">
      {/* ── CELEBRATION NOTIFICATION ── */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-3 bg-emerald-800 text-emerald-50 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-md"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>
                {lang === 'sw'
                  ? 'Hongera sana! Mwezi umethibitishwa kikamilifu kuelekea Edmark Fund!'
                  : 'Congratulations! Month qualification confirmed towards Edmark Fund!'}
              </span>
            </div>
            <button onClick={() => setShowCelebration(false)} className="text-emerald-200 text-xs hover:text-white">
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER & FUND SELECTOR ── */}
      <div className="bg-stone-950/80 rounded-2xl p-4 sm:p-5 border border-stone-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-400">
                <Award className="w-5 h-5" />
              </span>
              <h4 className="font-extrabold text-sm sm:text-base text-white">
                {lang === 'sw' ? `${selectedFund.swahiliName} (${selectedFund.bonusPercent})` : `${selectedFund.name} (${selectedFund.bonusPercent})`}
              </h4>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              {lang === 'sw' ? selectedFund.descriptionSw : selectedFund.descriptionEn}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={targetFund}
              onChange={(e) => setTargetFund(e.target.value as any)}
              className="px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="car">🚗 Car Fund (3%)</option>
              <option value="house">🏡 House Fund (2%)</option>
              <option value="travel">✈️ Travel Fund (2%)</option>
              <option value="manager">🛡️ Manager Active (14%)</option>
            </select>
          </div>
        </div>

        {/* ── 3-MONTH CONSECUTIVE STREAK ── */}
        <div className="grid grid-cols-3 gap-2.5">
          {consecutiveMonthsRecord.map((rec) => {
            const isDone = rec.status === 'completed';
            const isCurrent = rec.status === 'current';

            return (
              <div
                key={rec.monthIndex}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isDone
                    ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-200'
                    : isCurrent
                    ? 'bg-amber-950/40 border-amber-500/60 text-amber-200 ring-1 ring-amber-400'
                    : 'bg-stone-900/40 border-stone-800 text-stone-500'
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-stone-600" />
                  )}
                  <span className="text-[11px] font-black uppercase tracking-wide">Mwezi {rec.monthIndex}</span>
                </div>

                <div className="text-xs sm:text-sm font-black text-white">
                  {isDone ? `${rec.achievedSv} SV` : isCurrent ? `${analysis.totalSv} / 2,000` : 'Inasubiri'}
                </div>

                <div className="text-[10px] mt-0.5 opacity-90">
                  {isDone ? 'Imekamilika ✅' : isCurrent ? `${analysis.percentComplete}% Imefikiwa` : 'Mwezi Ujao'}
                </div>

                {isCurrent && analysis.gapSv === 0 && (
                  <button
                    onClick={() => handleMarkMonthCompleted(rec.monthIndex)}
                    className="mt-2 w-full py-1.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 rounded-lg text-[10px] font-black cursor-pointer"
                  >
                    Kamilisha ✅
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CURRENT MONTH LIVE GAUGE ── */}
      <div className="bg-stone-950/80 rounded-2xl p-4 sm:p-5 border border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300">
              <TrendingUp className="w-4.5 h-4.5" />
            </span>
            <span className="font-extrabold text-xs sm:text-sm text-white">
              {lang === 'sw' ? 'Hali ya Mwezi Huu (Live Group CPGS)' : 'Current Month Live Group CPGS'}
            </span>
          </div>

          <span
            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
              analysis.paceStatus === 'ahead' || analysis.gapSv === 0
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                : analysis.paceStatus === 'on_track'
                ? 'bg-blue-950/80 text-blue-300 border border-blue-700/60'
                : 'bg-amber-950/80 text-amber-300 border border-amber-700/60'
            }`}
          >
            {analysis.gapSv === 0
              ? 'Lengo Limekamilika'
              : analysis.paceStatus === 'on_track'
              ? 'Mwendokasi Mzuri'
              : 'Inahitaji Nguvu'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-stone-300">
            <span>{analysis.totalSv.toLocaleString()} SV Zilizofikiwa</span>
            <span>Lengo: {analysis.targetSv.toLocaleString()} SV</span>
          </div>
          <div className="w-full h-3 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${analysis.percentComplete}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full transition-all ${
                analysis.percentComplete >= 100
                  ? 'bg-emerald-500'
                  : analysis.percentComplete >= 70
                  ? 'bg-amber-400'
                  : 'bg-stone-500'
              }`}
            />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="p-3.5 bg-stone-900/60 rounded-xl border border-stone-800/80 space-y-1">
            <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Pengo Lililobaki</div>
            <div className="text-sm sm:text-base font-black text-amber-300">{analysis.gapSv.toLocaleString()} SV</div>
          </div>
          <div className="p-3.5 bg-stone-900/60 rounded-xl border border-stone-800/80 space-y-1">
            <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Siku Zilizobaki</div>
            <div className="text-sm sm:text-base font-black text-white">{analysis.daysRemaining} Siku</div>
          </div>
          <div className="p-3.5 bg-stone-900/60 rounded-xl border border-stone-800/80 space-y-1">
            <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Mwendokasi kwa Siku</div>
            <div className="text-sm sm:text-base font-black text-emerald-400">{analysis.dailyPacingSv} SV/siku</div>
          </div>
          <div className="p-3.5 bg-stone-900/60 rounded-xl border border-stone-800/80 space-y-1">
            <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Alama Binafsi (CPS)</div>
            <div className="text-sm sm:text-base font-black text-white">{analysis.personalCurrentSv}/100 SV</div>
          </div>
        </div>
      </div>

      {/* ── GAP CLOSING PRODUCT COMBINATIONS ── */}
      {analysis.gapSv > 0 && (
        <div className="bg-stone-950/80 rounded-2xl p-4 sm:p-5 border border-stone-800 shadow-xs space-y-3.5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-950/80 border border-amber-700/60 text-amber-400">
              <Package className="w-4.5 h-4.5" />
            </span>
            <div>
              <h4 className="font-extrabold text-xs sm:text-sm text-white">
                {lang === 'sw' ? 'Mbinu za Kuziba Pengo kwa Mauzo ya Bidhaa' : 'Product Sales Strategies to Close Gap'}
              </h4>
              <p className="text-[11px] text-stone-400">
                {lang === 'sw'
                  ? `Ili kufikisha ${analysis.gapSv} SV kabla ya tarehe 30, tekeleza moja ya haya:`
                  : `To reach ${analysis.gapSv} SV before month end, execute one of these:`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3.5 bg-stone-900/60 border border-stone-800 rounded-xl space-y-1.5 hover:border-emerald-500 transition-colors">
              <div className="text-xs font-extrabold text-white">🎁 Pakiti za P4 Slimming</div>
              <div className="text-base font-black text-emerald-400">{analysis.p4KitsNeeded} Pakiti</div>
              <div className="text-[11px] text-stone-400 leading-tight">
                Kila pakiti (Shake Off + MRT) inatoa ~50 SV + faida TZS 21,000
              </div>
            </div>

            <div className="p-3.5 bg-stone-900/60 border border-stone-800 rounded-xl space-y-1.5 hover:border-emerald-500 transition-colors">
              <div className="text-xs font-extrabold text-white">🌿 Mabox ya Shake Off</div>
              <div className="text-base font-black text-emerald-400">{analysis.shakeOffBoxesNeeded} Boxes</div>
              <div className="text-[11px] text-stone-400 leading-tight">
                Mabox 10 kwa kila wateja 6 wanaorudia dozi siku ya 12
              </div>
            </div>

            <div className="p-3.5 bg-stone-900/60 border border-stone-800 rounded-xl space-y-1.5 hover:border-emerald-500 transition-colors">
              <div className="text-xs font-extrabold text-white">🍵 Chupa za Splina Chlorophyll</div>
              <div className="text-base font-black text-emerald-400">{analysis.splinaBottlesNeeded} Chupa</div>
              <div className="text-[11px] text-stone-400 leading-tight">
                Kwa wateja wenye vidonda vya tumbo & asidi
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DOWNLINE LEGS PERFORMANCE ── */}
      <div className="bg-stone-950/80 rounded-2xl p-4 sm:p-5 border border-stone-800 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300">
              <Users className="w-4.5 h-4.5" />
            </span>
            <div>
              <h4 className="font-extrabold text-xs sm:text-sm text-white">
                {lang === 'sw' ? 'Laini za Downlines Wako (Team Volume)' : 'Downline Legs Performance'}
              </h4>
              <p className="text-[11px] text-stone-400">
                {lang === 'sw' ? 'Kujenga laini 3 imara huleta 2,000 SV bila kutegemea mtu mmoja' : '3 active legs ensure 2,000 SV stability'}
              </p>
            </div>
          </div>

          <button
            onClick={() => onSendChatMessage('downlines')}
            className="text-xs font-black text-emerald-400 hover:text-emerald-300 cursor-pointer"
          >
            {lang === 'sw' ? 'Ushauri wa Timu 💬' : 'Team Advice 💬'}
          </button>
        </div>

        <div className="space-y-2.5">
          {downlineLegs.map((leg) => {
            const isEditing = editingLegId === leg.id;
            const legPercent = Math.min(100, Math.round((leg.currentSv / leg.targetSv) * 100));

            return (
              <div key={leg.id} className="p-3.5 bg-stone-900/60 rounded-xl border border-stone-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs text-white">{leg.name}</span>
                      <span className="text-[11px] text-stone-400">({leg.location})</span>
                    </div>
                    <div className="text-[11px] text-stone-400">
                      {leg.activeMembers} wanachama hai • Ilifanya kazi: {leg.lastActive}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleSendDownlineWhatsApp(leg.name, leg.phone, leg.currentSv, leg.targetSv)}
                      title="Tuma Ujumbe wa WhatsApp"
                      className="p-2 bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900 rounded-xl border border-emerald-700/60 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (isEditing) {
                          setEditingLegId(null);
                        } else {
                          setEditingLegId(leg.id);
                          setLegSvInput(String(leg.currentSv));
                        }
                      }}
                      className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-700 rounded-xl text-xs font-bold text-stone-300 cursor-pointer"
                    >
                      {isEditing ? 'Ghairi' : 'Badili SV'}
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="number"
                      value={legSvInput}
                      onChange={(e) => setLegSvInput(e.target.value)}
                      placeholder="Weka SV mpya..."
                      className="flex-1 px-3 py-1.5 bg-stone-950 border border-stone-700 rounded-lg text-xs font-bold text-white"
                    />
                    <button
                      onClick={() => handleUpdateLeg(leg.id)}
                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 rounded-lg text-xs font-black cursor-pointer"
                    >
                      Hifadhi
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold text-stone-300">
                      <span>{leg.currentSv} SV</span>
                      <span>Lengo: {leg.targetSv} SV ({legPercent}%)</span>
                    </div>
                    <div className="w-full h-2 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                      <div
                        style={{ width: `${legPercent}%` }}
                        className={`h-full rounded-full ${
                          legPercent >= 100 ? 'bg-emerald-500' : legPercent >= 60 ? 'bg-amber-400' : 'bg-red-500'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── STRATEGIC PLAYBOOK TIPS (DOS & DONTS) ── */}
      <div className="bg-stone-950/80 rounded-2xl p-4 sm:p-5 border border-stone-800 shadow-xs space-y-3.5">
        <div className="flex items-center gap-2 border-b border-stone-800 pb-2.5">
          <span className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300">
            <ShieldCheck className="w-4.5 h-4.5" />
          </span>
          <h4 className="font-extrabold text-xs sm:text-sm text-white">
            {lang === 'sw' ? 'Kanuni Muhimu za Kufuzu Edmark Funds' : 'Qualification Strategy & Golden Rules'}
          </h4>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-700/60 rounded-xl space-y-1">
            <span className="font-black text-emerald-300 text-xs">✅ Mbinu ya Siku ya 12 (Shake Off Refill Formula):</span>
            <p className="text-xs text-emerald-200/90 leading-relaxed">
              Box la Shake Off lina sachets 12. Piga simu siku ya 10 kuuliza: "Umeona wepesi kiasi gani?". 70% ya wateja huagiza box la 2 papo hapo, ikikupa 10 SV bila kutafuta mteja mpya.
            </p>
          </div>

          <div className="p-3.5 bg-red-950/40 border border-red-700/60 rounded-xl space-y-1">
            <span className="font-black text-red-300 text-xs">🚫 Jambo la Kuepuka Kabisa (Don’t):</span>
            <p className="text-xs text-red-200/90 leading-relaxed">
              Usisubiri tarehe 25 kuanza kutafuta 2,000 SV. Lenga 500 SV kila wiki (Day 7, Day 14, Day 21, Day 28) kupitia laini 3 za downlines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
