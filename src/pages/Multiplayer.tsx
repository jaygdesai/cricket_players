import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import QuizQuestionComponent from '../components/quiz/QuizQuestion';
import { questions } from '../data/questions';
import { useGameStore } from '../store/useGameStore';
import { calculateScore } from '../utils/scoring';

type MultiplayerState = 'menu' | 'waiting' | 'playing' | 'results';

export default function Multiplayer() {
  const [state, setState] = useState<MultiplayerState>('menu');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const { addCoins, addScore, incrementGamesPlayed, incrementGamesWon } = useGameStore();

  const battleQuestions = useMemo(() => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10);
  }, [state === 'playing']);

  const startSearch = () => {
    setState('waiting');
    // Simulate finding opponent
    setTimeout(() => setState('playing'), 2000);
  };

  const handleAnswer = useCallback((selectedIndex: number, timeRemaining: number) => {
    const q = battleQuestions[currentIndex];
    const isCorrect = selectedIndex === q.correctIndex;
    if (isCorrect) {
      const pts = calculateScore(q, timeRemaining);
      setMyScore((s) => s + pts);
      // correct answer tracked via score
    }

    // Simulate opponent answer
    const oppCorrect = Math.random() > 0.4;
    if (oppCorrect) {
      setOpponentScore((s) => s + calculateScore(q, Math.floor(Math.random() * 10)));
    }

    setTimeout(() => {
      if (currentIndex + 1 >= battleQuestions.length) {
        incrementGamesPlayed();
        const won = myScore + (isCorrect ? calculateScore(q, timeRemaining) : 0) > opponentScore;
        if (won) {
          incrementGamesWon();
          addCoins(200);
        } else {
          addCoins(50);
        }
        addScore(myScore);
        setState('results');
      } else {
        setCurrentIndex((i) => i + 1);
      }
    }, 300);
  }, [currentIndex, battleQuestions, myScore, opponentScore]);

  const reset = () => {
    setState('menu');
    setCurrentIndex(0);
    setMyScore(0);
    setOpponentScore(0);
    // reset state
  };

  if (state === 'menu') {
    return (
      <div className="pt-16 pb-24 px-4 max-w-lg mx-auto md:pt-8 md:pb-8 md:max-w-4xl lg:max-w-6xl flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <span className="text-6xl mb-4 block">⚔️</span>
          <h1 className="text-2xl font-bold mb-2">Multiplayer Battle</h1>
          <p className="text-slate-400 mb-1">1v1 Quiz Battle</p>
          <p className="text-sm text-slate-500 mb-6">Race to answer 10 questions. Highest score wins 200 coins!</p>
          <Button onClick={startSearch} variant="accent" size="lg">Find Opponent</Button>
        </motion.div>
      </div>
    );
  }

  if (state === 'waiting') {
    return (
      <div className="pt-16 pb-24 px-4 max-w-lg mx-auto md:pt-8 md:pb-8 md:max-w-4xl lg:max-w-6xl flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="text-6xl mb-4">
          ⚔️
        </motion.div>
        <p className="text-lg font-medium">Finding opponent...</p>
        <p className="text-sm text-slate-400 mt-2">Matching you with a worthy challenger</p>
      </div>
    );
  }

  if (state === 'results') {
    const won = myScore > opponentScore;
    return (
      <div className="pt-16 pb-24 px-4 max-w-lg mx-auto md:pt-8 md:pb-8 md:max-w-4xl lg:max-w-6xl text-center mt-8">
        <span className="text-6xl mb-4 block">{won ? '🏆' : '😤'}</span>
        <h1 className="text-2xl font-bold mb-4">{won ? 'Victory!' : 'Defeat'}</h1>
        <div className="bg-slate-800 rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <div className="text-center flex-1">
              <p className="text-sm text-slate-400">You</p>
              <p className="text-2xl font-bold text-blue-400">{myScore}</p>
            </div>
            <span className="text-xl text-slate-600">vs</span>
            <div className="text-center flex-1">
              <p className="text-sm text-slate-400">Opponent</p>
              <p className="text-2xl font-bold text-red-400">{opponentScore}</p>
            </div>
          </div>
          <p className="text-amber-400 font-bold">+{won ? 200 : 50} coins</p>
        </div>
        <Button onClick={reset} variant="accent" size="lg">Play Again</Button>
      </div>
    );
  }

  return (
    <div className="pt-16 pb-24 min-h-screen flex flex-col justify-center">
      {/* Score bar */}
      <div className="flex justify-between items-center px-4 mb-4">
        <div className="bg-blue-900/50 px-3 py-1 rounded-lg">
          <span className="text-xs text-slate-400">You: </span>
          <span className="font-bold text-blue-400">{myScore}</span>
        </div>
        <div className="bg-red-900/50 px-3 py-1 rounded-lg">
          <span className="text-xs text-slate-400">Opp: </span>
          <span className="font-bold text-red-400">{opponentScore}</span>
        </div>
      </div>
      <QuizQuestionComponent
        question={battleQuestions[currentIndex]}
        questionNumber={currentIndex + 1}
        totalQuestions={10}
        onAnswer={handleAnswer}
        timeLimit={10}
      />
    </div>
  );
}
