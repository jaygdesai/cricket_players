import { Link, useLocation } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';

const navItems = [
  { path: '/', label: 'Home', icon: '🏏' },
  { path: '/quiz', label: 'Quiz', icon: '❓' },
  { path: '/collection', label: 'Cards', icon: '🃏' },
  { path: '/shop', label: 'Shop', icon: '🛒' },
  { path: '/dream-xi', label: 'XI', icon: '⭐' },
  { path: '/daily', label: 'Daily', icon: '📅' },
  { path: '/multiplayer', label: 'Battle', icon: '⚔️' },
  { path: '/leaderboard', label: 'Ranks', icon: '🏆' },
  { path: '/profile', label: 'Profile', icon: '👤' },
];

export default function Navbar() {
  const location = useLocation();
  const coins = useGameStore((s) => s.coins);

  return (
    <>
      {/* Mobile: Top bar with coins */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 px-4 py-2 flex justify-between items-center md:hidden">
        <Link to="/" className="text-lg font-bold text-amber-400 no-underline">
          🏏 Cricket Players
        </Link>
        <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full">
          <span className="text-amber-400">🪙</span>
          <span className="font-bold text-amber-300">{coins.toLocaleString()}</span>
        </div>
      </div>

      {/* Mobile: Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 md:hidden">
        <div className="flex justify-around items-center py-2 max-w-lg mx-auto">
          {navItems.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors no-underline ${
                  isActive ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop: Sidebar navigation */}
      <aside className="hidden md:flex fixed top-0 left-0 h-screen z-50 flex-col bg-slate-900 border-r border-slate-700 w-20 lg:w-64">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 px-4 py-4 border-b border-slate-700 no-underline">
          <span className="text-2xl">🏏</span>
          <span className="hidden lg:block text-lg font-bold text-amber-400">Cricket Players</span>
        </Link>

        {/* Nav items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors no-underline ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span className="text-xl w-8 text-center">{item.icon}</span>
                <span className="hidden lg:block font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Coin counter at bottom */}
        <div className="border-t border-slate-700 p-4">
          <div className="flex items-center justify-center lg:justify-start gap-2 bg-slate-800 px-3 py-2 rounded-lg">
            <span className="text-amber-400 text-xl">🪙</span>
            <span className="hidden lg:block font-bold text-amber-300">{coins.toLocaleString()}</span>
          </div>
        </div>
      </aside>
    </>
  );
}
