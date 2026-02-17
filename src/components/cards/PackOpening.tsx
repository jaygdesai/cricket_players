import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PlayerCard as PlayerCardType } from '../../types';
import PlayerCardComponent from './PlayerCard';
import Button from '../ui/Button';

interface PackOpeningProps {
  cards: PlayerCardType[];
  onComplete: () => void;
  packName: string;
}

export default function PackOpening({ cards, onComplete, packName }: PackOpeningProps) {
  const [revealedIndex, setRevealedIndex] = useState(-1);
  const [allRevealed, setAllRevealed] = useState(false);

  const revealNext = () => {
    const next = revealedIndex + 1;
    if (next < cards.length) {
      setRevealedIndex(next);
    }
    if (next >= cards.length - 1) {
      setAllRevealed(true);
    }
  };

  const revealAll = () => {
    setRevealedIndex(cards.length - 1);
    setAllRevealed(true);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4">
      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-2xl font-bold text-amber-400 mb-6"
      >
        {packName}
      </motion.h2>

      <div className="flex flex-wrap justify-center gap-3 mb-6 max-w-lg">
        {cards.map((card, i) => (
          <AnimatePresence key={card.id + i}>
            {i <= revealedIndex ? (
              <motion.div
                initial={{ rotateY: 180, scale: 0.5 }}
                animate={{ rotateY: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
              >
                <PlayerCardComponent player={card} size="sm" />
              </motion.div>
            ) : (
              <motion.div
                className="w-28 h-40 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center cursor-pointer border border-slate-600"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={revealNext}
              >
                <span className="text-3xl">❓</span>
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>

      <div className="flex gap-3">
        {!allRevealed && (
          <>
            <Button onClick={revealNext} variant="primary">
              Reveal Next
            </Button>
            <Button onClick={revealAll} variant="secondary">
              Reveal All
            </Button>
          </>
        )}
        {allRevealed && (
          <Button onClick={onComplete} variant="accent" size="lg">
            Collect Cards!
          </Button>
        )}
      </div>
    </div>
  );
}
