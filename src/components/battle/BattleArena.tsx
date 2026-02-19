import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBattleStore } from '../../store/battleStore';
import { useGameStore } from '../../store/useGameStore';
import type { ShotType, MatchRewards } from '../../types';
import {
  simulateBall,
  selectAIShot,
  selectAIDelivery,
  calculateMatchRewards,
} from '../../utils/battleEngine';
import Scoreboard from './Scoreboard';
import { ShotSelector } from './ShotSelector';
import BallResult from './BallResult';

export default function BattleArena() {
  const {
    phase,
    setPhase,
    playerTeam,
    opponentTeam,
    tossWinner,
    playerBattingFirst,
    currentInnings,
    firstInningsScore,
    playerInnings,
    opponentInnings,
    currentBatsman,
    currentBowler,
    lastBallResult,
    isAnimating,
    totalBalls,
    performToss,
    chooseToBat,
    chooseToBowl,
    startInnings,
    recordBall,
    nextBatsman,
    nextBowler,
    setLastBallResult,
    setIsAnimating,
    endMatch,
    resetMatch,
  } = useBattleStore();

  const addCoins = useGameStore((s) => s.addCoins);
  const [matchRewards, setMatchRewards] = useState<MatchRewards | null>(null);

  const isPlayerBatting = currentInnings === 1
    ? playerBattingFirst
    : !playerBattingFirst;

  // Handle toss on mount
  useEffect(() => {
    if (phase === 'setup' && playerTeam && opponentTeam) {
      performToss();
    }
  }, [phase, playerTeam, opponentTeam, performToss]);

  // Auto-play for AI turn
  const handleAITurn = useCallback(() => {
    if (!currentBatsman || !currentBowler || isAnimating) return;

    setIsAnimating(true);

    // AI is batting - select shot
    if (!isPlayerBatting) {
      const aiShot = selectAIShot(
        currentBatsman,
        currentBowler,
        opponentInnings.runs,
        currentInnings === 2 ? (firstInningsScore ?? 0) + 1 : null,
        totalBalls - opponentInnings.balls,
        4 - opponentInnings.wickets
      );

      // Player's bowler - use default delivery for AI
      const aiDelivery = selectAIDelivery(
        currentBatsman,
        currentBowler,
        5 - opponentInnings.overs,
        currentInnings === 2 ? 4 - opponentInnings.wickets : 5
      );

      const result = simulateBall(currentBatsman, currentBowler, aiShot, aiDelivery);
      setLastBallResult(result);
      recordBall(result);

      if (result.isWicket) {
        setTimeout(() => nextBatsman(), 100);
      }
    }
    // AI is bowling - player bats (handled by ShotSelector)
    // AI is fielding - player bowls (handled by DeliverySelector)
  }, [
    currentBatsman,
    currentBowler,
    isAnimating,
    isPlayerBatting,
    currentInnings,
    firstInningsScore,
    opponentInnings,
    totalBalls,
    setIsAnimating,
    setLastBallResult,
    recordBall,
    nextBatsman,
  ]);

  // Handle ball result dismiss
  const handleDismissResult = useCallback(() => {
    setLastBallResult(null);
    setIsAnimating(false);

    // Check for over change
    const innings = isPlayerBatting ? playerInnings : opponentInnings;
    if (innings.ballsThisOver === 0 && innings.balls > 0) {
      nextBowler();
    }
  }, [isPlayerBatting, playerInnings, opponentInnings, setLastBallResult, setIsAnimating, nextBowler]);

  // Auto-play AI turns when it's their batting turn
  useEffect(() => {
    if (phase === 'bowling' && !isAnimating && currentBatsman && currentBowler) {
      const timeout = setTimeout(() => {
        handleAITurn();
        // Auto-dismiss result after a short delay during bowling phase
        setTimeout(() => {
          handleDismissResult();
        }, 1200);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [phase, isAnimating, handleAITurn, currentBatsman, currentBowler, handleDismissResult]);

  // Handle player shot selection
  const handleShotSelection = (shot: ShotType) => {
    if (!currentBatsman || !currentBowler || isAnimating) return;

    setIsAnimating(true);

    // AI bowler selects delivery
    const aiDelivery = selectAIDelivery(
      currentBatsman,
      currentBowler,
      5 - playerInnings.overs,
      currentInnings === 1 ? 5 : 4 - playerInnings.wickets
    );

    const result = simulateBall(currentBatsman, currentBowler, shot, aiDelivery);
    setLastBallResult(result);
    recordBall(result);

    if (result.isWicket) {
      setTimeout(() => nextBatsman(), 100);
    }
  };

  // Handle innings break continue
  const handleInningsBreakContinue = () => {
    setPhase(isPlayerBatting ? 'bowling' : 'batting');
    startInnings();
  };

  // Calculate match result
  useEffect(() => {
    if (phase === 'result' && !matchRewards) {
      const won = playerBattingFirst
        ? playerInnings.runs > opponentInnings.runs
        : playerInnings.runs >= (firstInningsScore ?? 0) + 1;

      const rewards = calculateMatchRewards(
        won,
        playerBattingFirst ? playerInnings.wickets : opponentInnings.wickets,
        playerBattingFirst ? playerInnings.runs : opponentInnings.runs,
        playerBattingFirst ? null : (firstInningsScore ?? 0) + 1
      );

      setMatchRewards(rewards);
      endMatch(rewards);
      addCoins(rewards.coins);
    }
  }, [phase, playerBattingFirst, playerInnings, opponentInnings, firstInningsScore, endMatch, addCoins, matchRewards]);

  // Render toss screen
  const renderToss = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      <motion.div
        animate={{ rotateY: [0, 180, 360] }}
        transition={{ duration: 1, repeat: 2 }}
        className="text-6xl mb-6"
      >
        🪙
      </motion.div>

      <h2 className="text-2xl font-bold text-white mb-4">
        {tossWinner === 'player' ? 'You won the toss!' : `${opponentTeam?.name} won the toss`}
      </h2>

      {tossWinner === 'player' ? (
        <div className="space-y-3">
          <p className="text-slate-400 mb-4">What would you like to do?</p>
          <div className="flex gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={chooseToBat}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-bold text-white"
            >
              🏏 Bat First
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={chooseToBowl}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl font-bold text-white"
            >
              🎳 Bowl First
            </motion.button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-slate-400 mb-4">
            {opponentTeam?.name} chose to {playerBattingFirst ? 'bowl' : 'bat'} first
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // AI chooses randomly
              if (Math.random() < 0.5) {
                chooseToBowl();
              } else {
                chooseToBat();
              }
            }}
            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-bold text-white"
          >
            Start Match
          </motion.button>
        </div>
      )}
    </motion.div>
  );

  // Render innings break
  const renderInningsBreak = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      <h2 className="text-2xl font-bold text-amber-400 mb-4">Innings Break</h2>

      <div className="bg-slate-800 rounded-xl p-6 mb-6 max-w-sm mx-auto">
        <p className="text-slate-400 mb-2">First Innings Score</p>
        <p className="text-4xl font-black text-white">
          {firstInningsScore}/{playerBattingFirst ? playerInnings.wickets : opponentInnings.wickets}
        </p>
        <p className="text-slate-400 mt-2">
          {playerBattingFirst ? 'Your Team' : opponentTeam?.name}
        </p>
      </div>

      <p className="text-slate-400 mb-4">
        {playerBattingFirst ? opponentTeam?.name : 'You'} need{' '}
        <span className="text-amber-400 font-bold">{(firstInningsScore ?? 0) + 1} runs</span> to win
      </p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleInningsBreakContinue}
        className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-bold text-white"
      >
        Start 2nd Innings
      </motion.button>
    </motion.div>
  );

  // Render match result
  const renderResult = () => {
    const playerWon = playerBattingFirst
      ? playerInnings.runs > opponentInnings.runs
      : playerInnings.runs >= (firstInningsScore ?? 0) + 1;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 8 }}
          className="text-6xl mb-4"
        >
          {playerWon ? '🏆' : '😢'}
        </motion.div>

        <h2 className={`text-3xl font-black mb-4 ${playerWon ? 'text-amber-400' : 'text-slate-400'}`}>
          {playerWon ? 'VICTORY!' : 'DEFEAT'}
        </h2>

        <div className="bg-slate-800 rounded-xl p-6 mb-6 max-w-sm mx-auto">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-slate-400 text-sm">Your Team</p>
              <p className="text-2xl font-bold text-white">
                {playerInnings.runs}/{playerInnings.wickets}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">{opponentTeam?.name}</p>
              <p className="text-2xl font-bold text-white">
                {opponentInnings.runs}/{opponentInnings.wickets}
              </p>
            </div>
          </div>

          {matchRewards && (
            <div className="border-t border-slate-700 pt-4">
              <p className="text-slate-400 text-sm mb-2">Rewards</p>
              <div className="flex justify-center gap-4">
                <div className="text-center">
                  <p className="text-amber-400 text-xl font-bold">+{matchRewards.coins}</p>
                  <p className="text-xs text-slate-400">Coins</p>
                </div>
                <div className="text-center">
                  <p className="text-blue-400 text-xl font-bold">+{matchRewards.xp}</p>
                  <p className="text-xs text-slate-400">XP</p>
                </div>
                <div className="text-center">
                  <p className="text-purple-400 text-xl font-bold">+{matchRewards.trophyPoints}</p>
                  <p className="text-xs text-slate-400">Trophies</p>
                </div>
              </div>
              {matchRewards.bonuses.length > 0 && (
                <div className="mt-3 space-y-1">
                  {matchRewards.bonuses.map((bonus, i) => (
                    <p key={i} className="text-green-400 text-xs">{bonus}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetMatch}
          className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-bold text-white"
        >
          Play Again
        </motion.button>
      </motion.div>
    );
  };

  // Render current players
  const renderCurrentPlayers = () => (
    <div className="bg-slate-800 rounded-xl p-4 mb-4">
      <div className="flex justify-between items-center">
        {/* Batsman */}
        <div className="flex items-center gap-3">
          {currentBatsman?.image ? (
            <img
              src={currentBatsman.image}
              alt={currentBatsman.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-amber-500"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-slate-700 border-2 border-amber-500 flex items-center justify-center text-slate-400 font-bold text-sm">
              {currentBatsman?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-white text-sm">{currentBatsman?.name}</p>
            <p className="text-xs text-slate-400">
              {currentBatsman?.country} • ⭐ {currentBatsman?.stats.rating}
            </p>
          </div>
        </div>

        {/* VS */}
        <div className="text-center">
          <span className="text-2xl">⚔️</span>
          <p className="text-xs text-slate-500 mt-1">FACING</p>
        </div>

        {/* Bowler */}
        <div className="flex items-center gap-3 text-right">
          <div>
            <p className="font-semibold text-white text-sm">{currentBowler?.name}</p>
            <p className="text-xs text-slate-400">
              {currentBowler?.country} • 🎳 {currentBowler?.stats.bowlingAvg.toFixed(1)}
            </p>
          </div>
          {currentBowler?.image ? (
            <img
              src={currentBowler.image}
              alt={currentBowler.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-slate-700 border-2 border-blue-500 flex items-center justify-center text-slate-400 font-bold text-sm">
              {currentBowler?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="pt-16 pb-24 px-4 max-w-lg mx-auto md:pt-8 md:pb-8">
      <AnimatePresence mode="wait">
        {phase === 'toss' && (
          <motion.div key="toss" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {renderToss()}
          </motion.div>
        )}

        {(phase === 'batting' || phase === 'bowling') && (
          <motion.div key="match" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Scoreboard />
            {renderCurrentPlayers()}

            {phase === 'batting' && currentBatsman && currentBowler && (
              <ShotSelector
                batsman={currentBatsman}
                bowler={currentBowler}
                onSelectShot={handleShotSelection}
                disabled={isAnimating}
              />
            )}

            {phase === 'bowling' && currentBatsman && currentBowler && (
              <div className="text-center py-4">
                <p className="text-slate-400 mb-2">AI is batting...</p>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="inline-block text-3xl"
                >
                  🏏
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {phase === 'innings_break' && (
          <motion.div key="break" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {renderInningsBreak()}
          </motion.div>
        )}

        {phase === 'result' && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {renderResult()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ball result overlay */}
      <BallResult result={lastBallResult} onDismiss={handleDismissResult} />
    </div>
  );
}
