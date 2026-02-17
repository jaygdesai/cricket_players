import { useGameStore } from '../store/useGameStore';
import { useCollectionStore } from '../store/useCollectionStore';
import { useAuthStore } from '../store/useAuthStore';
import { players } from '../data/players';
import Button from '../components/ui/Button';

export default function Profile() {
  const { coins, totalScore, gamesPlayed, gamesWon, bestStreak } = useGameStore();
  const collectionCount = useCollectionStore((s) => s.ownedCardIds.length);
  const { user, signIn, signOutUser } = useAuthStore();

  return (
    <div className="pt-16 pb-24 px-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mt-4 mb-4">Profile</h1>

      {/* Auth section */}
      <div className="bg-slate-800 rounded-xl p-4 mb-4">
        {user ? (
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold">{user.displayName}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
            <Button onClick={signOutUser} variant="secondary" size="sm">Sign Out</Button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-slate-400 mb-2">Sign in to save progress & access leaderboards</p>
            <Button onClick={signIn} variant="primary">Sign in with Google</Button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">🪙 {coins.toLocaleString()}</p>
          <p className="text-xs text-slate-400">Coins</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{totalScore.toLocaleString()}</p>
          <p className="text-xs text-slate-400">Total Score</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">{collectionCount}/{players.length}</p>
          <p className="text-xs text-slate-400">Cards</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{gamesPlayed}</p>
          <p className="text-xs text-slate-400">Games Played</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{gamesWon}</p>
          <p className="text-xs text-slate-400">Games Won</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-orange-400">🔥 {bestStreak}</p>
          <p className="text-xs text-slate-400">Best Streak</p>
        </div>
      </div>
    </div>
  );
}
