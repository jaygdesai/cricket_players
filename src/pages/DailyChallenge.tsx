import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import QuizQuestionComponent from '../components/quiz/QuizQuestion';
import Button from '../components/ui/Button';
import { questions } from '../data/questions';
import { useGameStore } from '../store/useGameStore';
import { useCollectionStore } from '../store/useCollectionStore';
import { calculateScore, calculateCoins } from '../utils/scoring';
import { openPack, PACK_TYPES } from '../utils/packGenerator';
import PlayerCardComponent from '../components/cards/PlayerCard';
import type { PlayerCard } from '../types';

export default function DailyChallenge() {
  const today = new Date().toISOString().split('T')[0];
  const { dailyChallengeDate, setDailyChallengeDate, addCoins, addScore } = useGameStore();
  const { addCards } = useCollectionStore();

  const alreadyCompleted = dailyChallengeDate === today;

  const dailyQuestions = useMemo(() => {
    const seed = today.split('-').reduce((a, b) => a + parseInt(b), 0);
    const sorted = [...questions].sort((a, b) => {
      const ha = a.id.charCodeAt(1) * seed % 1000;
      const hb = b.id.charCodeAt(1) * seed % 1000;
      return ha - hb;
    });
    return sorted.slice(0, 10);
  }, [today]);

  const [playing, setPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [bonusCards, setBonusCards] = useState<PlayerCard[]>([]);

  const start = () => {
    setPlaying(true);
    setCurrentIndex(0);
    setScore(0);
    setCorrectCount(0);
    setFinished(false);
    setBonusCards([]);
  };

  const handleAnswer = (selectedIndex: number, timeRemaining: number) => {
    const q = dailyQuestions[currentIndex];
    const isCorrect = selectedIndex === q.correctIndex;
    if (isCorrect) {
      setScore((s) => s + calculateScore(q, timeRemaining));
      setCorrectCount((c) => c + 1);
    }

    setTimeout(() => {
      if (currentIndex + 1 >= dailyQuestions.length) {
        const totalCoins = calculateCoins(correctCount + (isCorrect ? 1 : 0), 10, 0) * 2;
        addCoins(totalCoins);
        addScore(score);
        setDailyChallengeDate(today);

        const silverPack = PACK_TYPES.find((p) => p.id === 'silver')!;
        const cards = openPack(silverPack);
        addCards(cards.map((c) => c.id));
        setBonusCards(cards);
        setFinished(true);
        setPlaying(false);
      } else {
        setCurrentIndex((i) => i + 1);
      }
    }, 300);
  };

  if (alreadyCompleted && !finished) {
    return (
      <div className="pt-16 pb-24 px-4 max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <span className="text-6xl mb-4">✅</span>
        <h1 className="text-2xl font-bold mb-2">Challenge Complete!</h1>
        <p className="text-slate-400">Come back tomorrow for a new daily challenge.</p>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="pt-16 pb-24 px-4 max-w-lg mx-auto text-center mt-8">
        <span className="text-6xl mb-4 block">🎉</span>
        <h1 className="text-2xl font-bold mb-4">Daily Challenge Complete!</h1>
        <div className="bg-slate-800 rounded-xl p-4 mb-4">
          <p className="text-lg"><span className="text-green-400 font-bold">{correctCount}/10</span> correct</p>
          <p className="text-amber-400 font-bold text-lg">+{calculateCoins(correctCount, 10, 0) * 2} coins (2x bonus!)</p>
        </div>
        <h3 className="text-sm text-amber-400 mb-2 font-bold">🎁 Bonus Silver Pack:</h3>
        <div className="flex justify-center gap-2 flex-wrap">
          {bonusCards.map((card, i) => (
            <PlayerCardComponent key={i} player={card} size="sm" />
          ))}
        </div>
      </div>
    );
  }

  if (playing) {
    return (
      <div className="pt-16 pb-24 min-h-screen flex flex-col justify-center">
        <div className="text-center mb-2">
          <span className="text-xs bg-green-800 text-green-300 px-3 py-1 rounded-full">📅 Daily Challenge — 2x Coins!</span>
        </div>
        <QuizQuestionComponent
          question={dailyQuestions[currentIndex]}
          questionNumber={currentIndex + 1}
          totalQuestions={10}
          onAnswer={handleAnswer}
        />
      </div>
    );
  }

  return (
    <div className="pt-16 pb-24 px-4 max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh]">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
        <span className="text-6xl mb-4 block">📅</span>
        <h1 className="text-2xl font-bold mb-2">Daily Challenge</h1>
        <p className="text-slate-400 mb-1">10 curated questions — refreshes daily</p>
        <p className="text-sm text-green-400 mb-6">2x coin rewards + FREE Silver Pack!</p>
        <Button onClick={start} variant="accent" size="lg">Start Challenge</Button>
      </motion.div>
    </div>
  );
}
