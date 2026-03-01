// src/components/ChallengeMode.jsx
import { useState, useEffect } from 'react';
import { generateQuiz } from '../services/claudeApi';
import QuizCard from './QuizCard';
import QuizResult from './QuizResult';

export default function ChallengeMode({ sentence, analysisResult, onBack }) {
  const [quizState, setQuizState] = useState('loading'); // loading | quizzing | finished
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadQuiz() {
      try {
        setError('');
        const quizQuestions = await generateQuiz(sentence, analysisResult);
        setQuestions(quizQuestions);
        setQuizState('quizzing');
      } catch (err) {
        setError(err.message);
        setQuizState('error');
      }
    }
    loadQuiz();
  }, [sentence, analysisResult]);

  const handleAnswer = (isCorrect) => {
    const newResult = {
      questionIndex: currentQuestionIndex,
      isCorrect,
      skipped: false
    };
    setResults(prev => [...prev, newResult]);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setQuizState('finished');
    }
  };

  const handleSkip = () => {
    const newResult = {
      questionIndex: currentQuestionIndex,
      isCorrect: false,
      skipped: true
    };
    setResults(prev => [...prev, newResult]);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setQuizState('finished');
    }
  };

  const handleRetry = () => {
    setQuizState('loading');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setResults([]);
    setError('');
  };

  const correctCount = results.filter(r => r.isCorrect).length;
  const skippedCount = results.filter(r => r.skipped).length;
  const totalCount = results.length;
  const accuracy = skippedCount === totalCount ? 0 : Math.round((correctCount / (totalCount - skippedCount)) * 100);

  if (quizState === 'loading') {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-blue mx-auto mb-4"></div>
          <p className="text-apple-black font-medium">AI 正在出题…</p>
        </div>
      </div>
    );
  }

  if (quizState === 'error') {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <div className="text-center py-10">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-apple-black font-medium mb-2">出题失败</p>
          <p className="text-apple-muted text-sm mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="bg-apple-blue text-white px-6 py-2 rounded-full font-medium hover:bg-blue-600 transition-colors"
          >
            重新出题
          </button>
        </div>
      </div>
    );
  }

  if (quizState === 'quizzing') {
    const currentQuestion = questions[currentQuestionIndex];
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="text-sm text-apple-muted">
              第 {currentQuestionIndex + 1} 题 / 共 {questions.length} 题
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-apple-green">✓ {correctCount}</span>
              <span className="text-apple-muted">✗ {totalCount - correctCount - skippedCount}</span>
              <span className="text-apple-orange">— {skippedCount}</span>
            </div>
          </div>
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-apple-blue h-2 rounded-full" 
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <QuizCard
          question={currentQuestion}
          questionIndex={currentQuestionIndex}
          total={questions.length}
          onAnswer={handleAnswer}
          onSkip={handleSkip}
        />
      </div>
    );
  }

  if (quizState === 'finished') {
    return (
      <QuizResult
        results={results}
        sentence={sentence}
        onRetry={handleRetry}
        onBack={onBack}
      />
    );
  }

  return null;
}