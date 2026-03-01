// src/components/InputPanel.jsx
import { useState } from 'react';

const EXAMPLES = [
  "In a world optimized by hyper-personalized algorithms, the joy of serendipity is being replaced by predictive determinism.",
  "Had the committee known about the risks earlier, the project would have been cancelled.",
  "What seems to be a simple task actually requires years of rigorous training and dedication.",
  "Only by working together can we overcome the challenges that lie ahead of us.",
];

export default function InputPanel({ onAnalyze, isLoading }) {
  const [sentence, setSentence] = useState('');

  function handleSubmit() {
    if (sentence.trim()) onAnalyze(sentence.trim());
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-apple-black tracking-tight">句法手术台</h1>
        <p className="text-apple-muted text-sm mt-1">粘贴任意英文长句，AI 为你拆解逻辑骨架</p>
      </div>
      <textarea
        value={sentence}
        onChange={e => setSentence(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="In the era of artificial intelligence, the ability to critically evaluate..."
        className="w-full h-28 resize-none border border-gray-200 rounded-2xl px-4 py-3 text-apple-black text-base leading-relaxed placeholder:text-gray-300 focus:outline-none focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/10 transition-all"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="text-xs text-apple-muted self-center">示例：</span>
        {EXAMPLES.map((ex, i) => (
          <button
            key={i}
            onClick={() => setSentence(ex)}
            className="text-xs text-apple-blue bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full transition-colors"
          >
            示例 {i + 1}
          </button>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-apple-muted">
          {sentence.length > 0 ? `${sentence.split(/\s+/).filter(Boolean).length} 个词` : '支持真题、新闻、博客任意来源'}
        </span>
        <div className="flex gap-2">
          {sentence && (
            <button onClick={() => setSentence('')} className="px-4 py-2 text-sm text-apple-muted hover:text-apple-black transition-colors">
              清空
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={isLoading || !sentence.trim()}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              isLoading || !sentence.trim()
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-apple-black text-white hover:bg-gray-800 active:scale-95'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                解构中…
              </span>
            ) : '开始解构 ⌘↵'}
          </button>
        </div>
      </div>
    </div>
  );
}