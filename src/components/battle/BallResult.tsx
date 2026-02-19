import { motion, AnimatePresence } from 'framer-motion';
import type { BallOutcome } from '../../types';

interface BallResultProps {
  result: BallOutcome | null;
  onDismiss: () => void;
}

export default function BallResult({ result, onDismiss }: BallResultProps) {
  if (!result) return null;

  const getResultColor = () => {
    if (result.isWicket) return 'from-red-600 to-red-800';
    if (result.runs === 6) return 'from-green-500 to-emerald-600';
    if (result.runs === 4) return 'from-blue-500 to-blue-600';
    if (result.isExtra) return 'from-yellow-500 to-amber-600';
    if (result.runs === 0) return 'from-slate-600 to-slate-700';
    return 'from-slate-500 to-slate-600';
  };

  const getResultIcon = () => {
    if (result.isWicket) return '💀';
    if (result.runs === 6) return '🚀';
    if (result.runs === 4) return '🔥';
    if (result.isExtra) return '⚠️';
    if (result.runs === 0) return '⛔';
    return '🏏';
  };

  const getResultText = () => {
    if (result.isWicket) return 'WICKET!';
    if (result.runs === 6) return 'SIX!';
    if (result.runs === 4) return 'FOUR!';
    if (result.isExtra) return result.extraType === 'wide' ? 'WIDE!' : 'NO BALL!';
    if (result.runs === 0) return 'DOT BALL';
    return `${result.runs} RUN${result.runs > 1 ? 'S' : ''}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
        onClick={onDismiss}
      >
        <motion.div
          initial={{ scale: 0.5, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', damping: 12 }}
          className={`bg-gradient-to-br ${getResultColor()} rounded-2xl p-8 text-center shadow-2xl max-w-sm mx-4`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', damping: 8 }}
            className="text-6xl mb-4"
          >
            {getResultIcon()}
          </motion.div>

          {/* Result text */}
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-black text-white mb-3"
          >
            {getResultText()}
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white/90 mb-4"
          >
            {result.description}
          </motion.p>

          {/* Shot/Delivery info */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center gap-4 text-sm text-white/70 mb-6"
          >
            <span>Shot: {result.shotType}</span>
            <span>|</span>
            <span>Delivery: {result.deliveryType.replace('_', ' ')}</span>
          </motion.div>

          {/* Continue button */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDismiss}
            className="px-8 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-bold text-white transition"
          >
            Continue
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
