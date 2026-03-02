// src/components/QuizCard.jsx
import { useState, useEffect } from 'react';

const TYPE_LABELS = {
  'L1_skeleton': '剥离术：找主干',
  'L2_reorder': '语序重组：选最顺的中文',
  'L3_imagery': '神韵对比：选最传神的译文',
  'L4_strategy': '心理战术：专家第一步怎么做'
};

export default function QuizCard({ question, questionIndex, total, onAnswer, onSkip }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLocked, setIsLocked] = useState(false);

  // 当题目变化时重置状态
  useEffect(() => {
    setSelectedOption(null);
    setIsLocked(false);
  }, [question]);

  const handleOptionClick = (optionIndex) => {
    if (isLocked) return;
    
    setSelectedOption(optionIndex);
    setIsLocked(true);
  };

  const handleSkip = () => {
    setIsLocked(true);
  };

  const handleNextQuestion = () => {
    const isCorrect = selectedOption === question.correct.charCodeAt(0) - 'A'.charCodeAt(0);
    onAnswer(isCorrect);
  };

  const getOptionLabel = (index) => {
    return String.fromCharCode('A'.charCodeAt(0) + index);
  };

  const isCorrectOption = (index) => {
    return index === question.correct.charCodeAt(0) - 'A'.charCodeAt(0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm bg-apple-blue text-white px-2 py-1 rounded-full font-medium">
          {TYPE_LABELS[question.type] || question.type}
        </span>
        <span className="text-xs text-apple-muted">
          第 {questionIndex + 1} 题 / 共 {total} 题
        </span>
      </div>

      <div className="text-apple-black text-base leading-relaxed">
        {question.question}
      </div>

      <div className="space-y-2">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(index)}
            disabled={isLocked}
            className={`w-full text-left p-3 rounded-lg border transition-all ${
              selectedOption === index
                ? isCorrectOption(index)
                  ? 'border-apple-green bg-green-50 text-apple-green'
                  : 'border-apple-muted bg-gray-50 text-apple-muted'
                : 'border-gray-200 hover:border-apple-blue hover:bg-blue-50 text-apple-black'
            } ${isLocked && !isCorrectOption(index) && selectedOption === index ? 'border-apple-muted bg-red-50 text-apple-muted' : ''}`}
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm w-6">{getOptionLabel(index)}.</span>
              <span className="flex-1">{option}</span>
              {isLocked && isCorrectOption(index) && (
                <span className="text-apple-green font-medium">✓</span>
              )}
              {isLocked && !isCorrectOption(index) && selectedOption === index && (
                <span className="text-apple-muted font-medium">✗</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {isLocked && (
        <div className="bg-apple-black text-white rounded-2xl p-4">
          <div className="text-sm font-semibold mb-2">原理解释</div>
          <div className="text-gray-200 text-sm leading-relaxed">{question.rationale}</div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSkip}
          disabled={isLocked}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            isLocked
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-apple-orange text-white hover:bg-orange-600'
          }`}
        >
          跳过
        </button>
        {isLocked && (
          <button
            onClick={handleNextQuestion}
            className="px-6 py-2 bg-apple-blue text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            下一题 →
          </button>
        )}
      </div>
    </div>
  );
}