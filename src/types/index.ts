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
