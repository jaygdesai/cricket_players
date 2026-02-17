import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { players } from '../data/players';
import { useCollectionStore } from '../store/useCollectionStore';
import PlayerCardComponent from '../components/cards/PlayerCard';
import Button from '../components/ui/Button';
import { calculateTeamRating } from '../utils/scoring';

export default function DreamXI() {
  const { ownedCardIds, dreamXI, addToDreamXI, removeFromDreamXI, setDreamXI } = useCollectionStore();

  const ownedPlayers = useMemo(() => players.filter((p) => ownedCardIds.includes(p.id)), [ownedCardIds]);
  const selectedPlayers = useMemo(() => dreamXI.map((id) => players.find((p) => p.id === id)!).filter(Boolean), [dreamXI]);
  const teamRating = useMemo(() => calculateTeamRating(selectedPlayers.map((p) => p.stats.rating)), [selectedPlayers]);

  const roleCount = useMemo(() => {
    const counts = { batsman: 0, bowler: 0, 'all-rounder': 0, 'wicket-keeper': 0 };
    selectedPlayers.forEach((p) => counts[p.role]++);
    return counts;
  }, [selectedPlayers]);

  return (
    <div className="pt-16 pb-24 px-4 max-w-lg mx-auto">
      <div className="flex justify-between items-center mt-4 mb-4">
        <div>
          <h1 className="text-xl font-bold">Dream XI</h1>
          <p className="text-sm text-slate-400">{dreamXI.length}/11 selected</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-amber-400">{teamRating}</p>
          <p className="text-xs text-slate-400">Team Rating</p>
        </div>
      </div>

      {/* Role breakdown */}
      <div className="flex gap-2 mb-4">
        <span className="text-xs bg-slate-800 px-2 py-1 rounded-full">🏏 Bat: {roleCount.batsman}</span>
        <span className="text-xs bg-slate-800 px-2 py-1 rounded-full">🎳 Bowl: {roleCount.bowler}</span>
        <span className="text-xs bg-slate-800 px-2 py-1 rounded-full">⚡ AR: {roleCount['all-rounder']}</span>
        <span className="text-xs bg-slate-800 px-2 py-1 rounded-full">🧤 WK: {roleCount['wicket-keeper']}</span>
      </div>

      {/* Selected XI */}
      {dreamXI.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-amber-400 mb-2">Your XI:</h2>
          <div className="grid grid-cols-4 gap-2">
            {selectedPlayers.map((player) => (
              <motion.div key={player.id} layout>
                <PlayerCardComponent
                  player={player}
                  size="sm"
                  selected
                  onClick={() => removeFromDreamXI(player.id)}
                />
              </motion.div>
            ))}
            {Array.from({ length: 11 - dreamXI.length }).map((_, i) => (
              <div key={`empty-${i}`} className="w-28 h-40 rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center">
                <span className="text-slate-600 text-2xl">+</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {dreamXI.length > 0 && (
        <Button onClick={() => setDreamXI([])} variant="danger" size="sm" className="mb-4">
          Clear Team
        </Button>
      )}

      {/* Available players */}
      <h2 className="text-sm font-bold text-slate-400 mb-2">Available Players ({ownedPlayers.length}):</h2>
      {ownedPlayers.length === 0 ? (
        <div className="text-center text-slate-500 mt-8">
          <span className="text-4xl block mb-2">🃏</span>
          <p>No cards yet! Open packs in the Shop to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {ownedPlayers.filter((p) => !dreamXI.includes(p.id)).map((player) => (
            <PlayerCardComponent
              key={player.id}
              player={player}
              size="sm"
              onClick={() => addToDreamXI(player.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
