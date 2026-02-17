import type { QuizQuestion } from '../types';

export const DIFFICULTY_MULTIPLIER = {
  easy: 10,
  medium: 20,
  hard: 30,
};

export function calculateScore(question: QuizQuestion, timeRemaining: number): number {
  const basePoints = DIFFICULTY_MULTIPLIER[question.difficulty];
  const timeBonus = Math.floor(timeRemaining * 0.5);
  return basePoints + timeBonus;
}

export function calculateCoins(correctAnswers: number, totalQuestions: number, streak: number): number {
  const baseCoins = correctAnswers * 10;
  const streakBonus = streak >= 5 ? 50 : streak >= 3 ? 20 : 0;
  const perfectBonus = correctAnswers === totalQuestions ? 100 : 0;
  return baseCoins + streakBonus + perfectBonus;
}

export function calculateTeamRating(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  return Math.round(ratings.reduce((sum, r) => sum + r, 0) / ratings.length);
}
