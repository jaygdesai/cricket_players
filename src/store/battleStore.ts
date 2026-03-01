import { create } from 'zustand';
import type { PlayerCard, BattlePhase, InningsState, BallOutcome, BattleTeam, MatchRewards, BowlerSpellStats, FieldPlacement } from '../types';

interface BattleStore {
  // Match setup
  phase: BattlePhase;
  playerTeam: BattleTeam | null;
  opponentTeam: BattleTeam | null;
  tossWinner: 'player' | 'opponent' | null;
  playerBattingFirst: boolean;

  // Current innings state
  currentInnings: 1 | 2;
  firstInningsScore: number | null;
  playerInnings: InningsState;
  opponentInnings: InningsState;

  // Current ball state
  currentBatsman: PlayerCard | null;
  currentBowler: PlayerCard | null;
  lastBallResult: BallOutcome | null;
  isAnimating: boolean;

  // Bowling phase state
  needsBowlerSelection: boolean;
  needsFieldPlacement: boolean;
  selectedFieldPlacement: FieldPlacement | null;
  aiFieldPlacement: FieldPlacement | null;
  maxOversPerBowler: number;
  specialDeliveryCooldowns: Record<string, number>; // bowlerId -> balls remaining

  // Match settings
  totalOvers: number;
  totalBalls: number;

  // Progression
  trophyPoints: number;
  matchesPlayed: number;
  matchesWon: number;

  // Actions
  setPhase: (phase: BattlePhase) => void;
  setPlayerTeam: (team: BattleTeam) => void;
  setOpponentTeam: (team: BattleTeam) => void;
  performToss: () => void;
  chooseToBat: () => void;
  chooseToBowl: () => void;
  startInnings: () => void;
  recordBall: (outcome: BallOutcome) => void;
  nextBatsman: () => void;
  nextBowler: () => void;
  selectBowler: (bowlerId: string) => void;
  setLastBallResult: (result: BallOutcome | null) => void;
  setIsAnimating: (animating: boolean) => void;
  setNeedsBowlerSelection: (needs: boolean) => void;
  setFieldPlacement: (placement: FieldPlacement) => void;
  setAIFieldPlacement: (placement: FieldPlacement) => void;
  useSpecialDelivery: (bowlerId: string, cooldown: number) => void;
  tickCooldowns: () => void;
  endInnings: () => void;
  endMatch: (rewards: MatchRewards) => void;
  resetMatch: () => void;
  addTrophyPoints: (points: number) => void;
}

const initialInningsState: InningsState = {
  runs: 0,
  wickets: 0,
  balls: 0,
  overs: 0,
  ballsThisOver: 0,
  currentBatsmanIndex: 0,
  currentBowlerIndex: 0,
  ballHistory: [],
  bowlerStats: {},
};

export const useBattleStore = create<BattleStore>((set, get) => ({
  // Initial state
  phase: 'setup',
  playerTeam: null,
  opponentTeam: null,
  tossWinner: null,
  playerBattingFirst: true,

  currentInnings: 1,
  firstInningsScore: null,
  playerInnings: { ...initialInningsState },
  opponentInnings: { ...initialInningsState },

  currentBatsman: null,
  currentBowler: null,
  lastBallResult: null,
  isAnimating: false,

  needsBowlerSelection: false,
  needsFieldPlacement: false,
  selectedFieldPlacement: null,
  aiFieldPlacement: null,
  maxOversPerBowler: 2,
  specialDeliveryCooldowns: {},

  totalOvers: 5,
  totalBalls: 30,

  trophyPoints: 0,
  matchesPlayed: 0,
  matchesWon: 0,

  // Actions
  setPhase: (phase) => set({ phase }),

  setPlayerTeam: (team) => set({ playerTeam: team }),

  setOpponentTeam: (team) => set({ opponentTeam: team }),

  performToss: () => {
    const tossWinner = Math.random() < 0.5 ? 'player' : 'opponent';
    set({ tossWinner, phase: 'toss' });
  },

  chooseToBat: () => {
    set({ playerBattingFirst: true });
    get().startInnings();
  },

  chooseToBowl: () => {
    set({ playerBattingFirst: false });
    get().startInnings();
  },

  startInnings: () => {
    const { playerTeam, opponentTeam, playerBattingFirst, currentInnings } = get();
    if (!playerTeam || !opponentTeam) return;

    const isBattingTeam = currentInnings === 1
      ? playerBattingFirst
      : !playerBattingFirst;

    const battingTeam = isBattingTeam ? playerTeam : opponentTeam;
    const bowlingTeam = isBattingTeam ? opponentTeam : playerTeam;

    // Find first batsman and bowler
    const batsmen = battingTeam.players.filter(p =>
      p.role === 'batsman' || p.role === 'all-rounder' || p.role === 'wicket-keeper'
    );
    const bowlers = bowlingTeam.players.filter(p =>
      p.role === 'bowler' || p.role === 'all-rounder'
    );

    const currentBatsman = batsmen[0] || battingTeam.players[0];
    const currentBowler = bowlers[0] || bowlingTeam.players[0];

    set({
      phase: isBattingTeam ? 'batting' : 'bowling',
      currentBatsman,
      currentBowler,
      needsBowlerSelection: !isBattingTeam, // Player picks bowler when bowling
      needsFieldPlacement: !isBattingTeam,  // Player picks field when bowling
      selectedFieldPlacement: null,
      aiFieldPlacement: null,
      playerInnings: currentInnings === 1 && playerBattingFirst
        ? { ...initialInningsState }
        : get().playerInnings,
      opponentInnings: currentInnings === 1 && !playerBattingFirst
        ? { ...initialInningsState }
        : get().opponentInnings,
    });
  },

  recordBall: (outcome) => {
    const {
      phase,
      currentInnings,
      currentBowler,
      playerBattingFirst,
      playerInnings,
      opponentInnings,
      totalBalls,
      firstInningsScore,
    } = get();

    const isPlayerBatting = currentInnings === 1
      ? playerBattingFirst
      : !playerBattingFirst;

    const currentState = isPlayerBatting ? playerInnings : opponentInnings;

    // Don't count extras as balls faced
    const ballsToAdd = outcome.isExtra ? 0 : 1;
    const newBalls = currentState.balls + ballsToAdd;
    const newBallsThisOver = outcome.isExtra
      ? currentState.ballsThisOver
      : (currentState.ballsThisOver + 1) % 6;
    const newOvers = Math.floor(newBalls / 6);
    const isOverChange = newBallsThisOver === 0 && ballsToAdd > 0;

    // Update bowler stats
    const bowlerId = currentBowler?.id || '';
    const existingBowlerStats = currentState.bowlerStats[bowlerId] || {
      overs: 0, balls: 0, runsConceded: 0, wickets: 0, economy: 0,
    };
    const newBowlerBalls = existingBowlerStats.balls + ballsToAdd;
    const newBowlerOvers = Math.floor(newBowlerBalls / 6);
    const newBowlerRuns = existingBowlerStats.runsConceded + outcome.runs;
    const newBowlerWickets = existingBowlerStats.wickets + (outcome.isWicket ? 1 : 0);
    const updatedBowlerStats: BowlerSpellStats = {
      overs: newBowlerOvers,
      balls: newBowlerBalls,
      runsConceded: newBowlerRuns,
      wickets: newBowlerWickets,
      economy: newBowlerBalls > 0 ? (newBowlerRuns / newBowlerBalls) * 6 : 0,
    };

    const newState: InningsState = {
      runs: currentState.runs + outcome.runs,
      wickets: outcome.isWicket ? currentState.wickets + 1 : currentState.wickets,
      balls: newBalls,
      overs: newOvers,
      ballsThisOver: newBallsThisOver,
      currentBatsmanIndex: outcome.isWicket
        ? currentState.currentBatsmanIndex + 1
        : currentState.currentBatsmanIndex,
      currentBowlerIndex: isOverChange
        ? (currentState.currentBowlerIndex + 1) % 2
        : currentState.currentBowlerIndex,
      ballHistory: [...currentState.ballHistory, outcome],
      bowlerStats: {
        ...currentState.bowlerStats,
        [bowlerId]: updatedBowlerStats,
      },
    };

    const updates: Partial<BattleStore> = {};
    if (isPlayerBatting) {
      updates.playerInnings = newState;
    } else {
      updates.opponentInnings = newState;
    }

    // In bowling phase, player picks bowler and field at each over change
    if (phase === 'bowling' && isOverChange) {
      updates.needsBowlerSelection = true;
      updates.needsFieldPlacement = true;
      updates.selectedFieldPlacement = null;
    }

    set(updates);

    // Check for innings end
    const isChaseComplete =
      currentInnings === 2 &&
      firstInningsScore !== null &&
      newState.runs > firstInningsScore;

    const isInningsOver =
      newState.wickets >= 4 || // 5 players, 4 wickets = all out
      newBalls >= totalBalls ||
      isChaseComplete;

    if (isInningsOver) {
      setTimeout(() => get().endInnings(), 1500);
    }
  },

  nextBatsman: () => {
    const { playerTeam, opponentTeam, currentInnings, playerBattingFirst, playerInnings, opponentInnings } = get();

    const isPlayerBatting = currentInnings === 1
      ? playerBattingFirst
      : !playerBattingFirst;

    const battingTeam = isPlayerBatting ? playerTeam : opponentTeam;
    const innings = isPlayerBatting ? playerInnings : opponentInnings;

    if (!battingTeam) return;

    const batsmen = battingTeam.players.filter(p =>
      p.role === 'batsman' || p.role === 'all-rounder' || p.role === 'wicket-keeper'
    );

    const nextIndex = innings.currentBatsmanIndex;
    const nextBatsman = batsmen[nextIndex] || battingTeam.players[nextIndex];

    set({ currentBatsman: nextBatsman });
  },

  nextBowler: () => {
    const { playerTeam, opponentTeam, currentInnings, playerBattingFirst, playerInnings, opponentInnings } = get();

    const isPlayerBatting = currentInnings === 1
      ? playerBattingFirst
      : !playerBattingFirst;

    const bowlingTeam = isPlayerBatting ? opponentTeam : playerTeam;
    const innings = isPlayerBatting ? playerInnings : opponentInnings;

    if (!bowlingTeam) return;

    const bowlers = bowlingTeam.players.filter(p =>
      p.role === 'bowler' || p.role === 'all-rounder'
    );

    const nextIndex = innings.currentBowlerIndex % bowlers.length;
    const nextBowler = bowlers[nextIndex] || bowlingTeam.players[0];

    set({ currentBowler: nextBowler });
  },

  selectBowler: (bowlerId: string) => {
    const { playerTeam } = get();
    if (!playerTeam) return;

    const bowler = playerTeam.players.find(p => p.id === bowlerId);
    if (bowler) {
      set({ currentBowler: bowler, needsBowlerSelection: false });
    }
  },

  setLastBallResult: (result) => set({ lastBallResult: result }),

  setIsAnimating: (animating) => set({ isAnimating: animating }),

  setNeedsBowlerSelection: (needs) => set({ needsBowlerSelection: needs }),

  setFieldPlacement: (placement) => set({ selectedFieldPlacement: placement, needsFieldPlacement: false }),

  setAIFieldPlacement: (placement) => set({ aiFieldPlacement: placement }),

  useSpecialDelivery: (bowlerId, cooldown) => set((state) => ({
    specialDeliveryCooldowns: {
      ...state.specialDeliveryCooldowns,
      [bowlerId]: cooldown,
    },
  })),

  tickCooldowns: () => set((state) => {
    const updated: Record<string, number> = {};
    for (const [id, cd] of Object.entries(state.specialDeliveryCooldowns)) {
      if (cd > 1) updated[id] = cd - 1;
    }
    return { specialDeliveryCooldowns: updated };
  }),

  endInnings: () => {
    const { currentInnings, playerInnings, opponentInnings, playerBattingFirst } = get();

    if (currentInnings === 1) {
      const firstInningsScore = playerBattingFirst
        ? playerInnings.runs
        : opponentInnings.runs;

      set({
        currentInnings: 2,
        firstInningsScore,
        phase: 'innings_break',
      });
    } else {
      set({ phase: 'result' });
    }
  },

  endMatch: (rewards) => {
    set((state) => ({
      matchesPlayed: state.matchesPlayed + 1,
      matchesWon: rewards.trophyPoints >= 3 ? state.matchesWon + 1 : state.matchesWon,
      trophyPoints: state.trophyPoints + rewards.trophyPoints,
    }));
  },

  resetMatch: () => set({
    phase: 'setup',
    playerTeam: null,
    opponentTeam: null,
    tossWinner: null,
    playerBattingFirst: true,
    currentInnings: 1,
    firstInningsScore: null,
    playerInnings: { ...initialInningsState },
    opponentInnings: { ...initialInningsState },
    currentBatsman: null,
    currentBowler: null,
    lastBallResult: null,
    isAnimating: false,
    needsBowlerSelection: false,
    needsFieldPlacement: false,
    selectedFieldPlacement: null,
    aiFieldPlacement: null,
    specialDeliveryCooldowns: {},
  }),

  addTrophyPoints: (points) => set((state) => ({
    trophyPoints: state.trophyPoints + points,
  })),
}));
