import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  cards: number;
}

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'CricketKing99', score: 25400, cards: 87 },
  { rank: 2, name: 'SixerMaster', score: 21200, cards: 72 },
  { rank: 3, name: 'BowlerBoss', score: 18900, cards: 65 },
  { rank: 4, name: 'TestCrickFan', score: 15600, cards: 58 },
  { rank: 5, name: 'IPLFanatic', score: 14200, cards: 54 },
  { rank: 6, name: 'GullyChamp', score: 12800, cards: 49 },
  { rank: 7, name: 'CricketNerd', score: 11500, cards: 45 },
  { rank: 8, name: 'SpinWizard', score: 10200, cards: 42 },
  { rank: 9, name: 'PaceMachine', score: 9800, cards: 38 },
  { rank: 10, name: 'WicketHunter', score: 8900, cards: 35 },
];

export default function Leaderboard() {
  const [tab, setTab] = useState<'score' | 'cards'>('score');
  const { totalScore } = useGameStore();

  const sorted = [...mockLeaderboard].sort((a, b) => tab === 'score' ? b.score - a.score : b.cards - a.cards);

  const medalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="pt-16 pb-24 px-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mt-4 mb-4">🏆 Leaderboard</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('score')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer border-none ${tab === 'score' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
        >
          By Score
        </button>
        <button
          onClick={() => setTab('cards')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer border-none ${tab === 'cards' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}
        >
          By Collection
        </button>
      </div>

      {/* Your rank */}
      <div className="bg-amber-900/30 border border-amber-700 rounded-xl p-3 mb-4 flex justify-between items-center">
        <div>
          <p className="text-sm text-amber-300 font-medium">Your Position</p>
          <p className="text-xs text-slate-400">Keep playing to climb!</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-amber-400">{totalScore.toLocaleString()}</p>
          <p className="text-xs text-slate-400">Total Score</p>
        </div>
      </div>

      {/* Leaderboard list */}
      <div className="flex flex-col gap-2">
        {sorted.map((entry, i) => (
          <motion.div
            key={entry.name}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-center justify-between p-3 rounded-xl ${
              i < 3 ? 'bg-slate-800 border border-slate-700' : 'bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`text-lg font-bold min-w-[2.5rem] ${i < 3 ? 'text-xl' : 'text-slate-500'}`}>
                {medalEmoji(entry.rank)}
              </span>
              <span className="font-medium text-sm">{entry.name}</span>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm">{tab === 'score' ? entry.score.toLocaleString() : entry.cards}</p>
              <p className="text-xs text-slate-500">{tab === 'score' ? 'points' : 'cards'}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-xs text-slate-600 text-center mt-4">
        Sign in with Google to save your score to the global leaderboard
      </p>
    </div>
  );
}
