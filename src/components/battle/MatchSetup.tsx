import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PlayerCard, AITeam } from '../../types';
import { players } from '../../data/players';
import { getTeamsByDifficulty } from '../../data/aiTeams';
import { useCollectionStore } from '../../store/useCollectionStore';
import { useBattleStore } from '../../store/battleStore';
import { RARITY_GRADIENTS } from '../../types';

interface MatchSetupProps {
  onStartMatch: () => void;
}

type SetupStep = 'select_opponent' | 'draft_team' | 'confirm';

export default function MatchSetup({ onStartMatch }: MatchSetupProps) {
  const [step, setStep] = useState<SetupStep>('select_opponent');
  const [selectedOpponent, setSelectedOpponent] = useState<AITeam | null>(null);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [filterRole, setFilterRole] = useState<string>('all');

  const ownedCardIds = useCollectionStore((s) => s.ownedCardIds);
  const setPlayerTeam = useBattleStore((s) => s.setPlayerTeam);
  const setOpponentTeam = useBattleStore((s) => s.setOpponentTeam);
  const trophyPoints = useBattleStore((s) => s.trophyPoints);

  // Get owned players
  const ownedPlayers = useMemo(() =>
    players.filter(p => ownedCardIds.includes(p.id)),
    [ownedCardIds]
  );

  // Filter players by role
  const filteredPlayers = useMemo(() => {
    if (filterRole === 'all') return ownedPlayers;
    return ownedPlayers.filter(p => p.role === filterRole);
  }, [ownedPlayers, filterRole]);

  // Get opponent players
  const opponentPlayers = useMemo(() => {
    if (!selectedOpponent) return [];
    return selectedOpponent.playerIds
      .map(id => players.find(p => p.id === id))
      .filter((p): p is PlayerCard => p !== undefined);
  }, [selectedOpponent]);

  // Check team composition
  const selectedPlayers = useMemo(() =>
    selectedPlayerIds.map(id => players.find(p => p.id === id)).filter((p): p is PlayerCard => p !== undefined),
    [selectedPlayerIds]
  );

  const teamComposition = useMemo(() => {
    const batsmen = selectedPlayers.filter(p => p.role === 'batsman').length;
    const bowlers = selectedPlayers.filter(p => p.role === 'bowler').length;
    const allRounders = selectedPlayers.filter(p => p.role === 'all-rounder').length;
    const keepers = selectedPlayers.filter(p => p.role === 'wicket-keeper').length;
    return { batsmen, bowlers, allRounders, keepers };
  }, [selectedPlayers]);

  const isValidTeam = selectedPlayerIds.length === 5;

  // Unlock tiers based on trophy points
  const unlockedDifficulties = useMemo(() => {
    const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy'];
    if (trophyPoints >= 50) difficulties.push('medium');
    if (trophyPoints >= 150) difficulties.push('hard');
    return difficulties;
  }, [trophyPoints]);

  const handleSelectOpponent = (team: AITeam) => {
    setSelectedOpponent(team);
    setStep('draft_team');
  };

  const handleTogglePlayer = (playerId: string) => {
    if (selectedPlayerIds.includes(playerId)) {
      setSelectedPlayerIds(prev => prev.filter(id => id !== playerId));
    } else if (selectedPlayerIds.length < 5) {
      setSelectedPlayerIds(prev => [...prev, playerId]);
    }
  };

  const handleConfirmTeam = () => {
    if (!selectedOpponent || !isValidTeam) return;

    setPlayerTeam({
      name: 'Your Team',
      players: selectedPlayers,
      flag: '🏏',
    });

    setOpponentTeam({
      name: selectedOpponent.name,
      players: opponentPlayers,
      flag: selectedOpponent.flag,
    });

    onStartMatch();
  };

  const renderOpponentSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-amber-400 mb-2">Select Opponent</h2>
        <p className="text-slate-400">Choose a team to battle against</p>
        <div className="mt-2 flex justify-center gap-4 text-sm">
          <span className="text-amber-400">🏆 {trophyPoints} Trophy Points</span>
        </div>
      </div>

      {(['easy', 'medium', 'hard'] as const).map((difficulty) => {
        const teams = getTeamsByDifficulty(difficulty);
        const isUnlocked = unlockedDifficulties.includes(difficulty);
        const unlockAt = difficulty === 'medium' ? 50 : difficulty === 'hard' ? 150 : 0;

        return (
          <div key={difficulty} className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className={`text-lg font-semibold capitalize ${
                difficulty === 'easy' ? 'text-green-400' :
                difficulty === 'medium' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {difficulty === 'easy' ? '🟢' : difficulty === 'medium' ? '🟡' : '🔴'} {difficulty}
              </h3>
              {!isUnlocked && (
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                  🔒 Unlock at {unlockAt} trophies
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {teams.map((team) => (
                <motion.button
                  key={team.id}
                  whileHover={isUnlocked ? { scale: 1.02 } : {}}
                  whileTap={isUnlocked ? { scale: 0.98 } : {}}
                  onClick={() => isUnlocked && handleSelectOpponent(team)}
                  disabled={!isUnlocked}
                  className={`p-4 rounded-xl text-left transition-all ${
                    isUnlocked
                      ? 'bg-slate-800 hover:bg-slate-700 cursor-pointer'
                      : 'bg-slate-800/50 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{team.flag}</span>
                    <div>
                      <p className="font-semibold text-white">{team.name}</p>
                      <p className="text-xs text-slate-400 capitalize">{team.difficulty} difficulty</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderTeamDraft = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setStep('select_opponent')}
          className="text-slate-400 hover:text-white transition flex items-center gap-1"
        >
          ← Back
        </button>
        <div className="text-center">
          <h2 className="text-xl font-bold text-amber-400">Draft Your Team</h2>
          <p className="text-slate-400 text-sm">Select 5 players</p>
        </div>
        <div className="w-16" />
      </div>

      {/* Opponent preview */}
      <div className="bg-slate-800 rounded-xl p-3 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{selectedOpponent?.flag}</span>
          <span className="font-semibold text-white">{selectedOpponent?.name}</span>
          <span className={`text-xs px-2 py-0.5 rounded capitalize ${
            selectedOpponent?.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
            selectedOpponent?.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {selectedOpponent?.difficulty}
          </span>
        </div>
        <div className="flex gap-1 flex-wrap">
          {opponentPlayers.slice(0, 5).map((p) => (
            <span key={p.id} className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">
              {p.name}
            </span>
          ))}
        </div>
      </div>

      {/* Selected team summary */}
      <div className="bg-slate-800 rounded-xl p-3">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold text-white">Your Team ({selectedPlayerIds.length}/5)</span>
          <div className="flex gap-2 text-xs">
            <span className="text-blue-400">🏏 {teamComposition.batsmen}</span>
            <span className="text-green-400">🎳 {teamComposition.bowlers}</span>
            <span className="text-purple-400">⚡ {teamComposition.allRounders}</span>
            <span className="text-amber-400">🧤 {teamComposition.keepers}</span>
          </div>
        </div>
        <div className="flex gap-1 flex-wrap min-h-[32px]">
          {selectedPlayers.map((p) => (
            <motion.span
              key={p.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`text-xs bg-gradient-to-r ${RARITY_GRADIENTS[p.rarity]} px-2 py-1 rounded text-white`}
            >
              {p.name}
            </motion.span>
          ))}
          {selectedPlayerIds.length === 0 && (
            <span className="text-xs text-slate-500">Select players below</span>
          )}
        </div>
      </div>

      {/* Role filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'batsman', 'bowler', 'all-rounder', 'wicket-keeper'].map((role) => (
          <button
            key={role}
            onClick={() => setFilterRole(role)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition ${
              filterRole === role
                ? 'bg-amber-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {role === 'all' ? 'All' : role.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Player grid */}
      {ownedPlayers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-400 mb-2">You don't have any cards yet!</p>
          <p className="text-sm text-slate-500">Buy packs from the shop to collect players.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
          {filteredPlayers.map((player) => {
            const isSelected = selectedPlayerIds.includes(player.id);
            const isDisabled = !isSelected && selectedPlayerIds.length >= 5;

            return (
              <motion.button
                key={player.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => !isDisabled && handleTogglePlayer(player.id)}
                disabled={isDisabled}
                className={`p-3 rounded-xl text-left transition-all relative ${
                  isSelected
                    ? 'bg-amber-500/20 border-2 border-amber-500'
                    : isDisabled
                    ? 'bg-slate-800/50 opacity-50 cursor-not-allowed'
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-xs">
                    ✓
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {player.image ? (
                    <img
                      src={player.image}
                      alt={player.name}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 font-bold text-sm">
                      {player.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{player.name}</p>
                    <div className="flex items-center gap-1">
                      <span className={`text-xs px-1 rounded bg-gradient-to-r ${RARITY_GRADIENTS[player.rarity]} text-white`}>
                        {player.rarity[0].toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-400 capitalize">{player.role}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex gap-2 text-xs text-slate-400">
                  <span>⭐ {player.stats.rating}</span>
                  {player.role !== 'bowler' && <span>🏏 {player.stats.battingAvg.toFixed(1)}</span>}
                  {(player.role === 'bowler' || player.role === 'all-rounder') && player.stats.bowlingAvg > 0 && (
                    <span>🎳 {player.stats.bowlingAvg.toFixed(1)}</span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Confirm button */}
      <motion.button
        whileHover={isValidTeam ? { scale: 1.02 } : {}}
        whileTap={isValidTeam ? { scale: 0.98 } : {}}
        onClick={handleConfirmTeam}
        disabled={!isValidTeam}
        className={`w-full py-4 rounded-xl font-bold text-lg transition ${
          isValidTeam
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:brightness-110'
            : 'bg-slate-700 text-slate-400 cursor-not-allowed'
        }`}
      >
        {isValidTeam ? '⚔️ Start Match' : `Select ${5 - selectedPlayerIds.length} more player${5 - selectedPlayerIds.length !== 1 ? 's' : ''}`}
      </motion.button>
    </div>
  );

  return (
    <div className="pt-16 pb-24 px-4 max-w-lg mx-auto md:pt-8 md:pb-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {step === 'select_opponent' && renderOpponentSelection()}
          {step === 'draft_team' && renderTeamDraft()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
