import { Link, useLocation } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';

const navItems = [
  { path: '/', label: 'Home', icon: '🏏' },
  { path: '/quiz', label: 'Quiz', icon: '❓' },
  { path: '/collection', label: 'Cards', icon: '🃏' },
  { path: '/shop', label: 'Shop', icon: '🛒' },
  { path: '/dream-xi', label: 'XI', icon: '⭐' },
];

export default function Navbar() {
  const location = useLocation();
  const coins = useGameStore((s) => s.coins);

  return (
    <>
      {/* Top bar with coins */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 px-4 py-2 flex justify-between items-center">
        <Link to="/" className="text-lg font-bold text-amber-400 no-underline">
          🏏 Cricket Players
        </Link>
        <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full">
          <span className="text-amber-400">🪙</span>
          <span className="font-bold text-amber-300">{coins.toLocaleString()}</span>
        </div>
      </div>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700">
        <div className="flex justify-around items-center py-2 max-w-lg mx-auto">
          {navItems.map((item) => {
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
    </>
  );
}
