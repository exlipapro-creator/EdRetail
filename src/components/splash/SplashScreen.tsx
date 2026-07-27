import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EDRetailAnimatedLogo } from './EDRetailAnimatedLogo';

// Full sequence (E/D lock in -> Retail wipes -> cart + trails -> shimmer)
// finishes around 2.1s; give it a beat of hold before starting the exit fade.
const HOLD_MS = 2100;

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), HOLD_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-[#f9fafb]"
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        >
          <EDRetailAnimatedLogo className="w-64 sm:w-80" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
