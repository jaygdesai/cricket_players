import { motion, AnimatePresence } from 'framer-motion';

interface StreakBadgeProps {
  streak: number;
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak < 2) return null;

  const isHot = streak >= 5;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0 }}
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${
          isHot ? 'bg-orange-600 text-white' : 'bg-amber-800 text-amber-200'
        }`}
      >
        {isHot ? '🔥' : '⚡'} {streak} Streak!
        {isHot && <span className="text-xs ml-1">BONUS CARD!</span>}
      </motion.div>
    </AnimatePresence>
  );
}
