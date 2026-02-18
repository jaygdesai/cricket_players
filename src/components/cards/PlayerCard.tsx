import { motion } from 'framer-motion';
import { type PlayerCard as PlayerCardType, RARITY_COLORS } from '../../types';

interface PlayerCardProps {
  player: PlayerCardType;
  owned?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
}

const roleEmoji: Record<string, string> = {
  batsman: '🏏',
  bowler: '🎳',
  'all-rounder': '⚡',
  'wicket-keeper': '🧤',
};

const countryFlag: Record<string, string> = {
  India: '🇮🇳',
  Australia: '🇦🇺',
  England: '🏴',
  Pakistan: '🇵🇰',
  'New Zealand': '🇳🇿',
  'South Africa': '🇿🇦',
  'West Indies': '🌴',
  'Sri Lanka': '🇱🇰',
  Bangladesh: '🇧🇩',
  Afghanistan: '🇦🇫',
  Zimbabwe: '🇿🇼',
};

const sizeClasses = {
  sm: 'w-28 h-40 md:w-32 md:h-44 lg:w-36 lg:h-52',
  md: 'w-36 h-52 md:w-40 md:h-56 lg:w-44 lg:h-64',
  lg: 'w-44 h-64 md:w-52 md:h-72 lg:w-56 lg:h-80',
};

export default function PlayerCardComponent({ player, owned = true, onClick, size = 'md', selected = false }: PlayerCardProps) {
  const borderColor = RARITY_COLORS[player.rarity];

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`${sizeClasses[size]} rounded-xl p-0.5 cursor-pointer card-shine ${
        !owned ? 'opacity-40 grayscale' : ''
      } ${selected ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900' : ''}`}
      style={{ background: `linear-gradient(135deg, ${borderColor}, ${borderColor}88)` }}
    >
      <div className="w-full h-full bg-slate-800 rounded-xl p-2 flex flex-col items-center justify-between">
        {/* Rating badge */}
        <div className="w-full flex justify-between items-start">
          <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: borderColor + '33', color: borderColor }}>
            {player.rarity.toUpperCase()}
          </span>
          <span className="text-lg font-black text-amber-400">{player.stats.rating}</span>
        </div>

        {/* Player icon */}
        <div className="text-3xl my-1">{roleEmoji[player.role]}</div>

        {/* Name & Country */}
        <div className="text-center w-full">
          <p className="text-xs font-bold truncate">{player.name}</p>
          <p className="text-[10px] text-slate-400">
            {countryFlag[player.country] || '🏳️'} {player.country}
          </p>
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-0 text-[9px] text-slate-400 w-full">
          <span>AVG: {player.stats.battingAvg}</span>
          <span>SR: {player.stats.highScore}</span>
        </div>
      </div>
    </motion.div>
  );
}
