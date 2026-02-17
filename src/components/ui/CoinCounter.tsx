import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface CoinCounterProps {
  amount: number;
  showChange?: boolean;
}

export default function CoinCounter({ amount, showChange = false }: CoinCounterProps) {
  const [prevAmount, setPrevAmount] = useState(amount);
  const [change, setChange] = useState(0);

  useEffect(() => {
    if (amount !== prevAmount) {
      setChange(amount - prevAmount);
      setPrevAmount(amount);
      const timer = setTimeout(() => setChange(0), 2000);
      return () => clearTimeout(timer);
    }
  }, [amount, prevAmount]);

  return (
    <div className="relative inline-flex items-center gap-2">
      <span className="text-2xl">🪙</span>
      <motion.span
        key={amount}
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        className="text-xl font-bold text-amber-300"
      >
        {amount.toLocaleString()}
      </motion.span>
      <AnimatePresence>
        {showChange && change !== 0 && (
          <motion.span
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -20 }}
            exit={{ opacity: 0 }}
            className={`absolute -top-4 right-0 text-sm font-bold ${change > 0 ? 'text-green-400' : 'text-red-400'}`}
          >
            {change > 0 ? '+' : ''}{change}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
