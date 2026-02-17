import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuizQuestionComponent from '../components/quiz/QuizQuestion';
import StreakBadge from '../components/quiz/StreakBadge';
import Button from '../components/ui/Button';
import { questions } from '../data/questions';
import { useGameStore } from '../store/useGameStore';
import { useCollectionStore } from '../store/useCollectionStore';
import { calculateScore, calculateCoins } from '../utils/scoring';
import { getStreakRewardCard } from '../utils/packGenerator';
import PlayerCardComponent from '../components/cards/PlayerCard';
import type { PlayerCard } from '../types';

type QuizState = 'menu' | 'playing' | 'results';

export default function Quiz() {
  const [state, setState] = useState<QuizState>('menu');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [earnedCards, setEarnedCards] = useState<PlayerCard[]>([]);
  const { addCoins, addScore, incrementStreak, resetStreak, incrementGamesPlayed } = useGameStore();
  const { addCard } = useCollectionStore();

  const quizQuestions = useMemo(() => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10);
  }, [state]);

  const startQuiz = () => {
    setState('playing');
    setCurrentIndex(0);
    setScore(0);
    setCorrectCount(0);
    setStreak(0);
    setEarnedCards([]);
  };

  const handleAnswer = useCallback((selectedIndex: number, timeRemaining: number) => {
    const question = quizQuestions[currentIndex];
    const isCorrect = selectedIndex === question.correctIndex;

    if (isCorrect) {
      const points = calculateScore(question, timeRemaining);
      setScore((s) => s + points);
      setCorrectCount((c) => c + 1);
      setStreak((s) => {
        const newStreak = s + 1;
        incrementStreak();
        if (newStreak % 5 === 0) {
          const card = getStreakRewardCard();
          setEarnedCards((prev) => [...prev, card]);
          addCard(card.id);
        }
        return newStreak;
      });
    } else {
      setStreak(0);
      resetStreak();
    }

    setTimeout(() => {
      if (currentIndex + 1 >= quizQuestions.length) {
        const coins = calculateCoins(correctCount + (isCorrect ? 1 : 0), quizQuestions.length, streak);
        addCoins(coins);
        addScore(score);
        incrementGamesPlayed();
        setState('results');
      } else {
        setCurrentIndex((i) => i + 1);
      }
    }, 300);
  }, [currentIndex, quizQuestions, correctCount, streak, score]);

  if (state === 'menu') {
    return (
      <div className="pt-16 pb-24 px-4 max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <span className="text-6xl mb-4 block">❓</span>
          <h1 className="text-2xl font-bold mb-2">Quiz Mode</h1>
          <p className="text-slate-400 mb-2">Answer 10 cricket trivia questions</p>
          <p className="text-sm text-slate-500 mb-6">Earn coins for correct answers. Get 5 in a row for bonus cards!</p>
          <Button onClick={startQuiz} variant="accent" size="lg">Start Quiz</Button>
        </motion.div>
      </div>
    );
  }

  if (state === 'results') {
    const totalCoins = calculateCoins(correctCount, quizQuestions.length, streak);
    return (
      <div className="pt-16 pb-24 px-4 max-w-lg mx-auto">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center mt-8">
          <span className="text-6xl mb-4 block">{correctCount >= 8 ? '🏆' : correctCount >= 5 ? '👏' : '📚'}</span>
          <h1 className="text-2xl font-bold mb-4">Quiz Complete!</h1>
          <div className="bg-slate-800 rounded-xl p-6 mb-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div><p className="text-2xl font-bold text-green-400">{correctCount}/10</p><p className="text-xs text-slate-400">Correct</p></div>
              <div><p className="text-2xl font-bold text-blue-400">{score}</p><p className="text-xs text-slate-400">Score</p></div>
              <div><p className="text-2xl font-bold text-amber-400">+{totalCoins}</p><p className="text-xs text-slate-400">Coins Earned</p></div>
              <div><p className="text-2xl font-bold text-purple-400">{earnedCards.length}</p><p className="text-xs text-slate-400">Cards Won</p></div>
            </div>
          </div>
          {earnedCards.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm text-amber-400 mb-2 font-bold">🔥 Streak Reward Cards:</h3>
              <div className="flex justify-center gap-2 flex-wrap">
                {earnedCards.map((card, i) => (
                  <PlayerCardComponent key={i} player={card} size="sm" />
                ))}
              </div>
            </div>
          )}
          <Button onClick={startQuiz} variant="accent" size="lg">Play Again</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-16 pb-24 min-h-screen flex flex-col justify-center">
      <div className="text-center mb-4">
        <StreakBadge streak={streak} />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={currentIndex} initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}>
          <QuizQuestionComponent
            question={quizQuestions[currentIndex]}
            questionNumber={currentIndex + 1}
            totalQuestions={quizQuestions.length}
            onAnswer={handleAnswer}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
