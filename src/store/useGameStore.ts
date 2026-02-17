import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameState {
  coins: number;
  currentStreak: number;
  bestStreak: number;
  totalScore: number;
  gamesPlayed: number;
  gamesWon: number;
  dailyChallengeDate: string;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  incrementStreak: () => void;
  resetStreak: () => void;
  addScore: (points: number) => void;
  incrementGamesPlayed: () => void;
  incrementGamesWon: () => void;
  setDailyChallengeDate: (date: string) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      coins: 500,
      currentStreak: 0,
      bestStreak: 0,
      totalScore: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      dailyChallengeDate: '',

      addCoins: (amount) => set((s) => ({ coins: s.coins + amount })),
      
      spendCoins: (amount) => {
        const { coins } = get();
        if (coins >= amount) {
          set({ coins: coins - amount });
          return true;
        }
        return false;
      },

      incrementStreak: () => set((s) => ({
        currentStreak: s.currentStreak + 1,
        bestStreak: Math.max(s.bestStreak, s.currentStreak + 1),
      })),

      resetStreak: () => set({ currentStreak: 0 }),

      addScore: (points) => set((s) => ({ totalScore: s.totalScore + points })),

      incrementGamesPlayed: () => set((s) => ({ gamesPlayed: s.gamesPlayed + 1 })),

      incrementGamesWon: () => set((s) => ({ gamesWon: s.gamesWon + 1 })),

      setDailyChallengeDate: (date) => set({ dailyChallengeDate: date }),
    }),
    { name: 'cricket-game-store' }
  )
);
