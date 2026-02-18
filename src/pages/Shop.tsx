import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import PackOpening from '../components/cards/PackOpening';
import { useGameStore } from '../store/useGameStore';
import { useCollectionStore } from '../store/useCollectionStore';
import { PACK_TYPES, openPack } from '../utils/packGenerator';
import type { PlayerCard } from '../types';

export default function Shop() {
  const { coins, spendCoins } = useGameStore();
  const { addCards } = useCollectionStore();
  const [openedCards, setOpenedCards] = useState<PlayerCard[] | null>(null);
  const [openedPackName, setOpenedPackName] = useState('');

  const buyPack = (packId: string) => {
    const pack = PACK_TYPES.find((p) => p.id === packId)!;
    if (spendCoins(pack.price)) {
      const cards = openPack(pack);
      setOpenedCards(cards);
      setOpenedPackName(pack.name);
    }
  };

  const handlePackComplete = () => {
    if (openedCards) {
      addCards(openedCards.map((c) => c.id));
    }
    setOpenedCards(null);
  };

  return (
    <div className="pt-16 pb-24 px-4 max-w-lg mx-auto md:pt-8 md:pb-8 md:max-w-4xl lg:max-w-6xl">
      <h1 className="text-xl font-bold mt-4 mb-1">Card Shop</h1>
      <p className="text-sm text-slate-400 mb-6">Spend coins to open card packs</p>

      <div className="flex flex-col gap-4 md:grid md:grid-cols-2">
        {PACK_TYPES.map((pack, i) => (
          <motion.div
            key={pack.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-slate-800 rounded-xl p-5 border border-slate-700 ${
              pack.id === 'gold' ? 'pack-glow' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{pack.image}</span>
                <div>
                  <h3 className="font-bold text-lg">{pack.name}</h3>
                  <p className="text-sm text-slate-400">{pack.cardCount} cards per pack</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs text-gray-400">C:{Math.round(pack.rarityWeights.common * 100)}%</span>
                    <span className="text-xs text-blue-400">R:{Math.round(pack.rarityWeights.rare * 100)}%</span>
                    <span className="text-xs text-purple-400">E:{Math.round(pack.rarityWeights.epic * 100)}%</span>
                    <span className="text-xs text-amber-400">L:{Math.round(pack.rarityWeights.legendary * 100)}%</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => buyPack(pack.id)}
                variant={coins >= pack.price ? 'accent' : 'secondary'}
                disabled={coins < pack.price}
              >
                🪙 {pack.price}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Free daily pack info */}
      <div className="mt-6 bg-green-900/30 border border-green-700 rounded-xl p-4 text-center">
        <span className="text-2xl">🎁</span>
        <p className="text-sm text-green-300 mt-1 font-medium">Complete the Daily Challenge for a FREE rare pack!</p>
      </div>

      {/* Pack Opening overlay */}
      {openedCards && (
        <PackOpening cards={openedCards} onComplete={handlePackComplete} packName={openedPackName} />
      )}
    </div>
  );
}
