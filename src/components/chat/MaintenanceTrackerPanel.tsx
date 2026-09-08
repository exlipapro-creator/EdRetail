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
  // Sparkles removed — replaced by EdIcon (brand layer)
  ShieldCheck,
} from 'lucide-react';
import { useDistributorStore } from '../../store/distributorStore';
import { EDMARK_FUNDS } from '../../data/edmarkMaintenancePlaybook';
import { DISTRIBUTOR_NAME } from '../../utils/whatsappCompiler';
import { EdIcon } from '../brand/EdIcon';

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
    <div className="flex-1 overflow-y-auto space-y-4 text-gray-900">
      {/* ── CELEBRATION NOTIFICATION ── */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-3 bg-green-600 text-white rounded-lg flex items-center justify-between text-xs font-semibold shadow-md"
          >
            <div className="flex items-center gap-2">
              <EdIcon name="growth" className="w-5 h-5 text-amber-200" />
              <span>
                {lang === 'sw'
                  ? 'Hongera sana! Mwezi umethibitishwa kikamilifu kuelekea Edmark Fund!'
                  : 'Congratulations! Month qualification confirmed towards Edmark Fund!'}
              </span>
            </div>
            <button onClick={() => setShowCelebration(false)} className="text-white/80 text-xs hover:text-white">
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER & FUND SELECTOR ── */}
      <div className="panel-surface p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-primary-50 border border-primary-200 text-primary-700">
                <Award className="w-5 h-5" />
              </span>
              <h4 className="font-semibold text-sm sm:text-base text-gray-900">
                {lang === 'sw' ? `${selectedFund.swahiliName} (${selectedFund.bonusPercent})` : `${selectedFund.name} (${selectedFund.bonusPercent})`}
              </h4>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {lang === 'sw' ? selectedFund.descriptionSw : selectedFund.descriptionEn}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={targetFund}
              onChange={(e) => setTargetFund(e.target.value as any)}
              className="portal-input !w-auto text-xs font-semibold cursor-pointer"
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
                className={`p-3 rounded-md border text-center transition-all ${
                  isDone
                    ? 'bg-green-50 border-green-300 text-green-800'
                    : isCurrent
                    ? 'bg-amber-50 border-amber-300 text-amber-900 ring-1 ring-amber-300'
                    : 'bg-gray-50 border-gray-200 text-gray-500'
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : isCurrent ? (
                    <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-gray-300" />
                  )}
                  <span className="text-[11px] font-semibold uppercase tracking-wide">Mwezi {rec.monthIndex}</span>
                </div>

                <div className="text-xs sm:text-sm font-bold text-gray-900">
                  {isDone ? `${rec.achievedSv} SV` : isCurrent ? `${analysis.totalSv} / 2,000` : 'Inasubiri'}
                </div>

                <div className="text-[10px] mt-0.5">
                  {isDone ? 'Imekamilika' : isCurrent ? `${analysis.percentComplete}% Imefikiwa` : 'Mwezi Ujao'}
                </div>

                {isCurrent && analysis.gapSv === 0 && (
                  <button
                    onClick={() => handleMarkMonthCompleted(rec.monthIndex)}
                    className="mt-2 w-full py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-[10px] font-semibold cursor-pointer"
                  >
                    Kamilisha
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CURRENT MONTH LIVE GAUGE ── */}
      <div className="panel-surface p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-gray-100 text-gray-600">
              <TrendingUp className="w-4.5 h-4.5" />
            </span>
            <span className="font-semibold text-xs sm:text-sm text-gray-900">
              {lang === 'sw' ? 'Hali ya Mwezi Huu (Live Group CPGS)' : 'Current Month Live Group CPGS'}
            </span>
          </div>

          <span
            className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider ${
              analysis.paceStatus === 'ahead' || analysis.gapSv === 0
                ? 'bg-green-50 text-green-700 border border-green-200'
                : analysis.paceStatus === 'on_track'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
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
          <div className="flex justify-between text-xs font-semibold text-gray-600">
            <span>{analysis.totalSv.toLocaleString()} SV Zilizofikiwa</span>
            <span>Lengo: {analysis.targetSv.toLocaleString()} SV</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${analysis.percentComplete}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full transition-all ${
                analysis.percentComplete >= 100
                  ? 'bg-green-600'
                  : analysis.percentComplete >= 70
                  ? 'bg-amber-500'
                  : 'bg-gray-400'
              }`}
            />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="panel-inner p-3.5 space-y-1">
            <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Pengo Lililobaki</div>
            <div className="text-sm sm:text-base font-bold text-amber-700">{analysis.gapSv.toLocaleString()} SV</div>
          </div>
          <div className="panel-inner p-3.5 space-y-1">
            <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Siku Zilizobaki</div>
            <div className="text-sm sm:text-base font-bold text-gray-900">{analysis.daysRemaining} Siku</div>
          </div>
          <div className="panel-inner p-3.5 space-y-1">
            <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Mwendokasi kwa Siku</div>
            <div className="text-sm sm:text-base font-bold text-emerald-700">{analysis.dailyPacingSv} SV/siku</div>
          </div>
          <div className="panel-inner p-3.5 space-y-1">
            <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Alama Binafsi (CPS)</div>
            <div className="text-sm sm:text-base font-bold text-gray-900">{analysis.personalCurrentSv}/100 SV</div>
          </div>
        </div>
      </div>

      {/* ── GAP CLOSING PRODUCT COMBINATIONS ── */}
      {analysis.gapSv > 0 && (
        <div className="panel-surface p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700">
              <Package className="w-4.5 h-4.5" />
            </span>
            <div>
              <h4 className="font-semibold text-xs sm:text-sm text-gray-900">
                {lang === 'sw' ? 'Mbinu za Kuziba Pengo kwa Mauzo ya Bidhaa' : 'Product Sales Strategies to Close Gap'}
              </h4>
              <p className="text-[11px] text-gray-500">
                {lang === 'sw'
                  ? `Ili kufikisha ${analysis.gapSv} SV kabla ya tarehe 30, tekeleza moja ya haya:`
                  : `To reach ${analysis.gapSv} SV before month end, execute one of these:`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="panel-inner p-3.5 space-y-1.5 hover:border-gray-300 transition-colors">
              <div className="text-xs font-semibold text-gray-900">🎁 Pakiti za P4 Slimming</div>
              <div className="text-base font-bold text-emerald-700">{analysis.p4KitsNeeded} Pakiti</div>
              <div className="text-[11px] text-gray-500 leading-tight">
                Kila pakiti (Shake Off + MRT) inatoa ~50 SV + faida TZS 21,000
              </div>
            </div>

            <div className="panel-inner p-3.5 space-y-1.5 hover:border-gray-300 transition-colors">
              <div className="text-xs font-semibold text-gray-900">Mabox ya Shake Off</div>
              <div className="text-base font-bold text-emerald-700">{analysis.shakeOffBoxesNeeded} Boxes</div>
              <div className="text-[11px] text-gray-500 leading-tight">
                Mabox 10 kwa kila wateja 6 wanaorudia dozi siku ya 12
              </div>
            </div>

            <div className="panel-inner p-3.5 space-y-1.5 hover:border-gray-300 transition-colors">
              <div className="text-xs font-semibold text-gray-900">🍵 Chupa za Splina Chlorophyll</div>
              <div className="text-base font-bold text-emerald-700">{analysis.splinaBottlesNeeded} Chupa</div>
              <div className="text-[11px] text-gray-500 leading-tight">
                Kwa wateja wenye vidonda vya tumbo & asidi
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DOWNLINE LEGS PERFORMANCE ── */}
      <div className="panel-surface p-4 sm:p-5 space-y-3.5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-gray-100 text-gray-600">
              <Users className="w-4.5 h-4.5" />
            </span>
            <div>
              <h4 className="font-semibold text-xs sm:text-sm text-gray-900">
                {lang === 'sw' ? 'Laini za Downlines Wako (Team Volume)' : 'Downline Legs Performance'}
              </h4>
              <p className="text-[11px] text-gray-500">
                {lang === 'sw' ? 'Kujenga laini 3 imara huleta 2,000 SV bila kutegemea mtu mmoja' : '3 active legs ensure 2,000 SV stability'}
              </p>
            </div>
          </div>

          <button
            onClick={() => onSendChatMessage('downlines')}
            className="text-xs font-semibold text-primary-700 hover:text-primary-800 cursor-pointer"
          >
            {lang === 'sw' ? 'Ushauri wa Timu 💬' : 'Team Advice 💬'}
          </button>
        </div>

        <div className="space-y-2.5">
          {downlineLegs.map((leg) => {
            const isEditing = editingLegId === leg.id;
            const legPercent = Math.min(100, Math.round((leg.currentSv / leg.targetSv) * 100));

            return (
              <div key={leg.id} className="panel-inner p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs text-gray-900">{leg.name}</span>
                      <span className="text-[11px] text-gray-400">({leg.location})</span>
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {leg.activeMembers} wanachama hai • Ilifanya kazi: {leg.lastActive}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleSendDownlineWhatsApp(leg.name, leg.phone, leg.currentSv, leg.targetSv)}
                      title="Tuma Ujumbe wa WhatsApp"
                      className="p-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-md border border-green-200 transition-colors cursor-pointer"
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
                      className="px-2.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-md text-xs font-semibold text-gray-600 cursor-pointer"
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
                      className="flex-1 portal-input"
                    />
                    <button
                      onClick={() => handleUpdateLeg(leg.id)}
                      className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded text-xs font-semibold cursor-pointer"
                    >
                      Hifadhi
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-semibold text-gray-600">
                      <span>{leg.currentSv} SV</span>
                      <span>Lengo: {leg.targetSv} SV ({legPercent}%)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                      <div
                        style={{ width: `${legPercent}%` }}
                        className={`h-full rounded-full ${
                          legPercent >= 100 ? 'bg-green-600' : legPercent >= 60 ? 'bg-amber-500' : 'bg-red-500'
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
      <div className="panel-surface p-4 sm:p-5 space-y-3.5">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-2.5">
          <span className="p-2 rounded-lg bg-gray-100 text-gray-600">
            <ShieldCheck className="w-4.5 h-4.5" />
          </span>
          <h4 className="font-semibold text-xs sm:text-sm text-gray-900">
            {lang === 'sw' ? 'Kanuni Muhimu za Kufuzu Edmark Funds' : 'Qualification Strategy & Golden Rules'}
          </h4>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="p-3.5 bg-green-50 border border-green-200 rounded-md space-y-1">
            <span className="font-semibold text-green-800 text-xs">✅ Mbinu ya Siku ya 12 (Shake Off Refill Formula):</span>
            <p className="text-xs text-gray-700 leading-relaxed">
              Box la Shake Off lina sachets 12. Piga simu siku ya 10 kuuliza: "Umeona wepesi kiasi gani?". 70% ya wateja huagiza box la 2 papo hapo, ikikupa 10 SV bila kutafuta mteja mpya.
            </p>
          </div>

          <div className="p-3.5 bg-red-50 border border-red-200 rounded-md space-y-1">
            <span className="font-semibold text-red-800 text-xs">🚫 Jambo la Kuepuka Kabisa (Don’t):</span>
            <p className="text-xs text-gray-700 leading-relaxed">
              Usisubiri tarehe 25 kuanza kutafuta 2,000 SV. Lenga 500 SV kila wiki (Day 7, Day 14, Day 21, Day 28) kupitia laini 3 za downlines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
