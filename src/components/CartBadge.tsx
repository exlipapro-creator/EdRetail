import { motion, AnimatePresence } from 'framer-motion';

interface CartBadgeProps {
  count: number;
}

export function CartBadge({ count }: CartBadgeProps) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          className="absolute -top-2 -right-2 w-5 h-5 bg-success text-white text-[10px] rounded-full flex items-center justify-center font-semibold shadow-sm"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        >
          {count > 99 ? '99+' : count}
        </motion.span>
      )}
    </AnimatePresence>
  );
}
