import { motion } from 'framer-motion';
import type { PlayerCard, BowlerSpellStats } from '../../types';

interface BowlerSelectorProps {
  bowlers: PlayerCard[];
  bowlerStats: Record<string, BowlerSpellStats>;
  maxOversPerBowler: number;
  onSelectBowler: (bowlerId: string) => void;
}

function formatBowlerFigures(stats: BowlerSpellStats): string {
  const ballsInOver = stats.balls % 6;
  const overs = ballsInOver === 0 ? `${stats.overs}` : `${stats.overs}.${ballsInOver}`;
  return `${overs}-${stats.runsConceded}-${stats.wickets}`;
}

export default function BowlerSelector({ bowlers, bowlerStats, maxOversPerBowler, onSelectBowler }: BowlerSelectorProps) {
  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-white mb-1">Select Your Bowler</h3>
        <p className="text-sm text-slate-400">Choose who bowls this over</p>
      </div>

      <div className="space-y-2">
        {bowlers.map((bowler) => {
          const stats = bowlerStats[bowler.id];
          const oversBowled = stats ? stats.overs + (stats.balls % 6 > 0 ? 1 : 0) : 0;
          const hasMaxedOut = oversBowled >= maxOversPerBowler;

          return (
            <motion.button
              key={bowler.id}
              whileHover={!hasMaxedOut ? { scale: 1.02 } : {}}
              whileTap={!hasMaxedOut ? { scale: 0.98 } : {}}
              onClick={() => !hasMaxedOut && onSelectBowler(bowler.id)}
              disabled={hasMaxedOut}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                hasMaxedOut
                  ? 'bg-slate-700/30 cursor-not-allowed opacity-40'
                  : 'bg-gradient-to-r from-slate-700/50 to-slate-600/50 hover:from-slate-600/70 hover:to-slate-500/70 border border-slate-500/30'
              }`}
            >
              {/* Bowler avatar */}
              <div className="w-10 h-10 rounded-full bg-slate-600 border-2 border-blue-500/50 flex items-center justify-center text-slate-300 font-bold text-xs flex-shrink-0">
                {bowler.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>

              {/* Bowler info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white text-sm truncate">{bowler.name}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    bowler.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-400' :
                    bowler.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                    bowler.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {bowler.role}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Avg: {bowler.stats.bowlingAvg.toFixed(1)} | Wkts: {bowler.stats.wickets} | Rating: {bowler.stats.rating}
                </p>
              </div>

              {/* Spell stats */}
              <div className="text-right flex-shrink-0">
                {stats ? (
                  <div>
                    <p className="text-xs font-mono text-white">{formatBowlerFigures(stats)}</p>
                    <p className="text-xs text-slate-400">Econ: {stats.economy.toFixed(1)}</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Not bowled</p>
                )}
                {hasMaxedOut && (
                  <p className="text-xs text-red-400 font-medium">Max overs</p>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-3 text-center text-xs text-slate-500">
        Max {maxOversPerBowler} overs per bowler
      </div>
    </div>
  );
}
