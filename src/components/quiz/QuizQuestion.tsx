import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { QuizQuestion as QuizQuestionType } from '../../types';

interface QuizQuestionProps {
  question: QuizQuestionType;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (selectedIndex: number, timeRemaining: number) => void;
  timeLimit?: number;
}

export default function QuizQuestionComponent({ question, questionNumber, totalQuestions, onAnswer, timeLimit = 15 }: QuizQuestionProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    setSelected(null);
    setTimeLeft(timeLimit);
    setAnswered(false);
  }, [question.id, timeLimit]);

  useEffect(() => {
    if (answered) return;
    if (timeLeft <= 0) {
      handleAnswer(-1);
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, answered]);

  const handleAnswer = (index: number) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
    setTimeout(() => onAnswer(index, timeLeft), 1200);
  };

  const getOptionStyle = (index: number) => {
    if (!answered) return 'bg-slate-700 hover:bg-slate-600 border-slate-600';
    if (index === question.correctIndex) return 'bg-green-800 border-green-500';
    if (index === selected && index !== question.correctIndex) return 'bg-red-800 border-red-500';
    return 'bg-slate-700 border-slate-600 opacity-50';
  };

  const timerColor = timeLeft > 10 ? 'text-green-400' : timeLeft > 5 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="max-w-lg md:max-w-xl lg:max-w-2xl mx-auto w-full px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-slate-400">
          Question {questionNumber}/{totalQuestions}
        </span>
        <div className="flex items-center gap-2">
          <span className={`text-2xl font-bold ${timerColor}`}>{timeLeft}s</span>
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-1.5 bg-slate-700 rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-amber-400 rounded-full"
          initial={{ width: '100%' }}
          animate={{ width: `${(timeLeft / timeLimit) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Category & Difficulty */}
      <div className="flex gap-2 mb-3">
        <span className="text-xs px-2 py-0.5 bg-blue-900 text-blue-300 rounded-full capitalize">
          {question.category}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
          question.difficulty === 'easy' ? 'bg-green-900 text-green-300' :
          question.difficulty === 'medium' ? 'bg-amber-900 text-amber-300' :
          'bg-red-900 text-red-300'
        }`}>
          {question.difficulty}
        </span>
      </div>

      {/* Question */}
      <h2 className="text-lg font-semibold mb-6">{question.question}</h2>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {question.options.map((option, index) => (
          <motion.button
            key={index}
            whileTap={!answered ? { scale: 0.98 } : {}}
            onClick={() => handleAnswer(index)}
            disabled={answered}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium cursor-pointer ${getOptionStyle(index)}`}
          >
            <span className="mr-3 text-slate-400">{String.fromCharCode(65 + index)}.</span>
            {option}
            {answered && index === question.correctIndex && (
              <span className="float-right">✅</span>
            )}
            {answered && index === selected && index !== question.correctIndex && (
              <span className="float-right">❌</span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
