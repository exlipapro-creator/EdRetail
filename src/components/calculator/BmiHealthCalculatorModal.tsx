import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calculator, ArrowRight } from 'lucide-react';
import { BmiHealthCalculator } from './BmiHealthCalculator';
import { Product } from '../../types';
import { useLang } from '../../context/LangContext';

interface BmiHealthCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (product: Product) => void;
  onOpenGoalFinder?: () => void;
}

export const BmiHealthCalculatorModal: React.FC<BmiHealthCalculatorModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onOpenGoalFinder,
}) => {
  const { lang } = useLang();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative w-full max-w-4xl bg-neutral-50 rounded-3xl border border-neutral-200 shadow-2xl overflow-hidden z-10 my-auto max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-[#0C271E] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#1A3D31] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#164132] border border-[#235844] text-[#E5C378] flex items-center justify-center font-bold">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  {lang === 'sw' ? 'Kikokotoo cha Afya & BMI' : 'BMI & Body Health Assessment'}
                </h3>
                <p className="text-xs text-stone-300">
                  {lang === 'sw'
                    ? 'Pima uzito wako na upate mpango sahihi wa bidhaa za Edmark'
                    : 'Analyze your body metrics and receive custom dosage recommendations'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
            <BmiHealthCalculator
              onSelectProduct={(p) => {
                onClose();
                onSelectProduct?.(p);
              }}
              onOpenGoalFinder={() => {
                onClose();
                onOpenGoalFinder?.();
              }}
            />
          </div>

          {/* Footer Action */}
          <div className="p-3.5 bg-white border-t border-neutral-200 flex items-center justify-between flex-shrink-0">
            <span className="text-xs text-neutral-500 font-medium hidden sm:inline">
              {lang === 'sw' ? 'Ushauri wa bure wa afya kutoka kwa kiongozi wako' : 'Free consultative guidance included'}
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                {lang === 'sw' ? 'Funga' : 'Close'}
              </button>
              {onOpenGoalFinder && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenGoalFinder();
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{lang === 'sw' ? 'Tazama Pakiti (Bundles)' : 'View Goal Bundles'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
