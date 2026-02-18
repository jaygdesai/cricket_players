import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { useCollectionStore } from '../store/useCollectionStore';
import { players } from '../data/players';

const menuItems = [
  { path: '/quiz', title: 'Quiz Mode', desc: 'Test your cricket knowledge', icon: '❓', color: 'from-blue-600 to-blue-800' },
  { path: '/daily', title: 'Daily Challenge', desc: 'New questions every day', icon: '📅', color: 'from-green-600 to-green-800' },
  { path: '/shop', title: 'Card Shop', desc: 'Open packs & collect players', icon: '🛒', color: 'from-purple-600 to-purple-800' },
  { path: '/collection', title: 'My Collection', desc: 'View your player cards', icon: '🃏', color: 'from-amber-600 to-amber-800' },
  { path: '/dream-xi', title: 'Dream XI', desc: 'Build your ultimate team', icon: '⭐', color: 'from-red-600 to-red-800' },
  { path: '/multiplayer', title: 'Multiplayer', desc: '1v1 quiz battles', icon: '⚔️', color: 'from-pink-600 to-pink-800' },
  { path: '/leaderboard', title: 'Leaderboard', desc: 'Global rankings', icon: '🏆', color: 'from-yellow-600 to-yellow-800' },
];

export default function Home() {
  const { totalScore, bestStreak } = useGameStore();
  const collectionCount = useCollectionStore((s) => s.ownedCardIds.length);

  return (
    <div className="pt-16 pb-24 px-4 max-w-lg mx-auto md:pt-8 md:pb-8 md:max-w-4xl lg:max-w-6xl">
      {/* Hero */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center my-6"
      >
        <h1 className="text-3xl font-black text-amber-400 mb-1">🏏 Cricket Players</h1>
        <p className="text-slate-400 text-sm">Quiz, Collect & Build Your Dream XI</p>
      </motion.div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="bg-slate-800 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-blue-400">{totalScore.toLocaleString()}</p>
          <p className="text-xs text-slate-400">Score</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-purple-400">{collectionCount}/{players.length}</p>
          <p className="text-xs text-slate-400">Cards</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-amber-400">🔥 {bestStreak}</p>
          <p className="text-xs text-slate-400">Best Streak</p>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {menuItems.map((item, i) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={item.path}
              className={`block rounded-xl p-4 bg-gradient-to-br ${item.color} no-underline text-white hover:brightness-110 transition`}
            >
              <span className="text-2xl">{item.icon}</span>
              <h3 className="font-bold mt-1 text-sm">{item.title}</h3>
              <p className="text-xs text-white/70">{item.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
