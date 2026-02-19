export interface PlayerCard {
  id: string;
  name: string;
  country: string;
  role: 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  stats: {
    matches: number;
    battingAvg: number;
    bowlingAvg: number;
    highScore: number;
    wickets: number;
    rating: number;
  };
  image: string;
}

export interface QuizQuestion {
  id: string;
  category: 'history' | 'records' | 'rules' | 'current' | 'players';
  question: string;
  options: string[];
  correctIndex: number;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  coins: number;
  totalScore: number;
  streak: number;
  bestStreak: number;
  collection: string[];
  dreamXI: string[];
  dailyChallengeDate: string;
  gamesPlayed: number;
  gamesWon: number;
  createdAt: string;
}

export interface CardPack {
  id: string;
  name: string;
  price: number;
  cardCount: number;
  rarityWeights: {
    common: number;
    rare: number;
    epic: number;
    legendary: number;
  };
  image: string;
}

export interface BattleState {
  battleId: string;
  player1: { uid: string; displayName: string; score: number; answers: number[] };
  player2: { uid: string; displayName: string; score: number; answers: number[] };
  questions: string[];
  currentQuestion: number;
  status: 'waiting' | 'active' | 'finished';
  createdAt: string;
}

export interface DailyChallenge {
  date: string;
  questions: string[];
  bonusCoins: number;
  bonusPackType: string;
}

export type RarityColor = {
  [K in PlayerCard['rarity']]: string;
};

export const RARITY_COLORS: RarityColor = {
  common: '#9CA3AF',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#F59E0B',
};

export const RARITY_GRADIENTS: RarityColor = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-amber-600',
};

// Battle Types
export type ShotType = 'defend' | 'push' | 'attack' | 'slog';
export type DeliveryType = 'line_length' | 'yorker' | 'bouncer' | 'slower';

export interface ShotConfig {
  type: ShotType;
  label: string;
  icon: string;
  risk: 'low' | 'medium' | 'high' | 'very_high';
  minRuns: number;
  maxRuns: number;
  baseSuccessRate: number;
  statModifier: 'battingAvg' | 'rating' | 'highScore';
}

export interface DeliveryConfig {
  type: DeliveryType;
  label: string;
  icon: string;
  wicketChance: number;
  runModifier: number;
}

export interface BallOutcome {
  runs: number;
  isWicket: boolean;
  isExtra: boolean;
  extraType?: 'wide' | 'no_ball';
  description: string;
  shotType: ShotType;
  deliveryType: DeliveryType;
}

export interface InningsState {
  runs: number;
  wickets: number;
  balls: number;
  overs: number;
  ballsThisOver: number;
  currentBatsmanIndex: number;
  currentBowlerIndex: number;
  ballHistory: BallOutcome[];
}

export interface BattleTeam {
  name: string;
  players: PlayerCard[];
  flag?: string;
}

export type BattlePhase = 'setup' | 'toss' | 'batting' | 'bowling' | 'innings_break' | 'result';

export interface MatchRewards {
  coins: number;
  xp: number;
  trophyPoints: number;
  bonuses: string[];
}

export interface AITeam {
  id: string;
  name: string;
  flag: string;
  difficulty: 'easy' | 'medium' | 'hard';
  playerIds: string[];
}
