import { useState, useMemo } from 'react';
import { players } from '../data/players';
import { useCollectionStore } from '../store/useCollectionStore';
import PlayerCardComponent from '../components/cards/PlayerCard';
import Modal from '../components/ui/Modal';
import type { PlayerCard } from '../types';

type FilterRarity = 'all' | 'common' | 'rare' | 'epic' | 'legendary';
type FilterRole = 'all' | 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper';

export default function Collection() {
  const { ownedCardIds } = useCollectionStore();
  const [filterRarity, setFilterRarity] = useState<FilterRarity>('all');
  const [filterRole, setFilterRole] = useState<FilterRole>('all');
  const [selectedCard, setSelectedCard] = useState<PlayerCard | null>(null);
  const [showOwned, setShowOwned] = useState(false);

  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      if (filterRarity !== 'all' && p.rarity !== filterRarity) return false;
      if (filterRole !== 'all' && p.role !== filterRole) return false;
      if (showOwned && !ownedCardIds.includes(p.id)) return false;
      return true;
    });
  }, [filterRarity, filterRole, showOwned, ownedCardIds]);

  return (
    <div className="pt-16 pb-24 px-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-1 mt-4">My Collection</h1>
      <p className="text-sm text-slate-400 mb-4">
        {ownedCardIds.length} / {players.length} cards collected ({Math.round((ownedCardIds.length / players.length) * 100)}%)
      </p>

      {/* Progress bar */}
      <div className="h-2 bg-slate-700 rounded-full mb-4 overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${(ownedCardIds.length / players.length) * 100}%` }} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={filterRarity}
          onChange={(e) => setFilterRarity(e.target.value as FilterRarity)}
          className="bg-slate-800 text-sm rounded-lg px-3 py-1.5 border border-slate-600"
        >
          <option value="all">All Rarities</option>
          <option value="common">Common</option>
          <option value="rare">Rare</option>
          <option value="epic">Epic</option>
          <option value="legendary">Legendary</option>
        </select>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value as FilterRole)}
          className="bg-slate-800 text-sm rounded-lg px-3 py-1.5 border border-slate-600"
        >
          <option value="all">All Roles</option>
          <option value="batsman">Batsman</option>
          <option value="bowler">Bowler</option>
          <option value="all-rounder">All-Rounder</option>
          <option value="wicket-keeper">WK</option>
        </select>
        <button
          onClick={() => setShowOwned(!showOwned)}
          className={`text-sm px-3 py-1.5 rounded-lg border cursor-pointer ${
            showOwned ? 'bg-amber-600 border-amber-500 text-white' : 'bg-slate-800 border-slate-600'
          }`}
        >
          {showOwned ? 'Owned' : 'All'}
        </button>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-3 gap-2">
        {filteredPlayers.map((player) => (
          <PlayerCardComponent
            key={player.id}
            player={player}
            owned={ownedCardIds.includes(player.id)}
            onClick={() => setSelectedCard(player)}
            size="sm"
          />
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <div className="text-center text-slate-500 mt-12">
          <span className="text-4xl block mb-2">🔍</span>
          <p>No cards found with these filters</p>
        </div>
      )}

      {/* Card Detail Modal */}
      <Modal isOpen={!!selectedCard} onClose={() => setSelectedCard(null)} title={selectedCard?.name}>
        {selectedCard && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <PlayerCardComponent player={selectedCard} size="lg" owned={ownedCardIds.includes(selectedCard.id)} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-slate-700 rounded-lg p-2"><span className="text-slate-400">Matches:</span> {selectedCard.stats.matches}</div>
              <div className="bg-slate-700 rounded-lg p-2"><span className="text-slate-400">Bat Avg:</span> {selectedCard.stats.battingAvg}</div>
              <div className="bg-slate-700 rounded-lg p-2"><span className="text-slate-400">Bowl Avg:</span> {selectedCard.stats.bowlingAvg}</div>
              <div className="bg-slate-700 rounded-lg p-2"><span className="text-slate-400">High Score:</span> {selectedCard.stats.highScore}</div>
              <div className="bg-slate-700 rounded-lg p-2"><span className="text-slate-400">Wickets:</span> {selectedCard.stats.wickets}</div>
              <div className="bg-slate-700 rounded-lg p-2"><span className="text-slate-400">Rating:</span> <span className="text-amber-400 font-bold">{selectedCard.stats.rating}</span></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
