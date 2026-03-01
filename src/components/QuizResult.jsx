// src/components/QuizResult.jsx
import { useState } from 'react';
import { generateQuiz } from '../services/claudeApi';
import { saveQuizRecord } from '../services/db';

export default function QuizResult({ results, sentence, onRetry, onBack }) {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const correctCount = results.filter(r => r.isCorrect).length;
  const skippedCount = results.filter(r => r.skipped).length;
  const totalCount = results.length;
  const accuracy = skippedCount === totalCount ? 0 : Math.round((correctCount / (totalCount - skippedCount)) * 100);

  const getQuestionTypeLabel = (questionType) => {
    const labels = {
      'L1_skeleton': '剥离术：找主干',
      'L2_reorder': '语序重组：选最顺的中文',
      'L3_imagery': '神韵对比：选最传神的译文',
      'L4_strategy': '心理战术：专家第一步怎么做'
    };
    return labels[questionType] || questionType;
  };

  const handleAnalyzePerformance = async () => {
    setIsAnalyzing(true);
    setAnalysis(null);
    
    try {
      const apiKey = import.meta.env.VITE_GLM_API_KEY;
      if (!apiKey) throw new Error('未找到 API Key');

      const ANALYSIS_PROMPT = `你是一位语言教育专家，根据用户在挑战模式中的答题表现，生成一份学习分析报告。

答题记录：
${results.map((r, i) => `第${i+1}题：${r.isCorrect ? '✓ 答对' : r.skipped ? '— 跳过' : '✗ 答错'}`).join('\n')}

原始句子：${sentence}

请分析用户的强项与盲点，给出具体的学习建议。`;

      const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'glm-4-flash',
          messages: [
            { role: 'system', content: ANALYSIS_PROMPT },
            { role: 'user', content: '请生成学习分析报告' },
          ],
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error('API 请求失败');
      }

      const data = await response.json();
      const rawText = data.choices[0]?.message?.content || '';
      const cleaned = rawText.replace(/```json|```/g, '').trim();
      
      setAnalysis(cleaned);
    } catch (err) {
      setAnalysis('分析生成失败，请稍后重试。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🎉</div>
        <h2 className="text-2xl font-semibold text-apple-black mb-2">挑战完成！</h2>
        <p className="text-apple-muted">你的解构思维表现如何？</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-apple-blue">{correctCount} / {totalCount}</div>
          <div className="text-sm text-apple-muted">得分</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-apple-green">{accuracy}%</div>
          <div className="text-sm text-apple-muted">准确率</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-apple-orange">{skippedCount}</div>
          <div className="text-sm text-apple-muted">跳过</div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-apple-black mb-3">答题回顾</h3>
        <div className="space-y-2">
          {results.map((result, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <span className="text-sm text-apple-muted">第 {index + 1} 题</span>
              <div className="flex items-center gap-2">
                {result.isCorrect ? (
                  <span className="text-apple-green font-medium">✓ 答对</span>
                ) : result.skipped ? (
                  <span className="text-apple-orange font-medium">— 跳过</span>
                ) : (
                  <span className="text-apple-muted font-medium">✗ 答错</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={handleAnalyzePerformance}
          disabled={isAnalyzing}
          className={`w-full py-3 rounded-full font-medium transition-all ${
            isAnalyzing
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-apple-purple text-white hover:bg-purple-600'
          }`}
        >
          {isAnalyzing ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              分析中...
            </span>
          ) : '分析我的表现'}
        </button>

        {analysis && (
          <div className="mt-4 bg-apple-black text-white rounded-2xl p-4">
            <div className="text-sm font-semibold mb-2">AI 学习分析</div>
            <div className="text-gray-200 text-sm leading-relaxed">{analysis}</div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={async () => {
            // 自动保存答题记录
            const record = {
              sentence: sentence,
              date: new Date().toISOString(),
              results: results.map((result, index) => ({
                questionType: result.questionType || 'unknown',
                isCorrect: result.isCorrect || false,
                skipped: result.skipped || false
              })),
              score: correctCount,
              accuracy: accuracy
            };
            await saveQuizRecord(record);
            onRetry();
          }}
          className="flex-1 bg-apple-blue text-white py-3 rounded-full font-medium hover:bg-blue-600 transition-colors"
        >
          再挑战一次
        </button>
        <button
          onClick={async () => {
            // 自动保存答题记录
            const record = {
              sentence: sentence,
              date: new Date().toISOString(),
              results: results.map((result, index) => ({
                questionType: result.questionType || 'unknown',
                isCorrect: result.isCorrect || false,
                skipped: result.skipped || false
              })),
              score: correctCount,
              accuracy: accuracy
            };
            await saveQuizRecord(record);
            onBack();
          }}
          className="flex-1 bg-gray-100 text-apple-black py-3 rounded-full font-medium hover:bg-gray-200 transition-colors"
        >
          返回解构
        </button>
      </div>
    </div>
  );
}