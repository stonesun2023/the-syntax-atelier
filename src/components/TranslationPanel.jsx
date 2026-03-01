// src/components/TranslationPanel.jsx
import { useState } from 'react';

const LEVELS = [
  { key: 'foundation',   label: 'L1 骨架译', sublabel: '基础版', desc: '直白平铺，主谓宾齐全，验证主干理解', color: 'border-l-green-400',  badge: 'bg-green-100 text-green-700',   icon: '🟢' },
  { key: 'intermediate', label: 'L2 逻辑译', sublabel: '进阶版', desc: '语序重排，符合中文直觉，消除翻译腔', color: 'border-l-blue-400',   badge: 'bg-blue-100 text-blue-700',     icon: '🔵' },
  { key: 'professional', label: 'L3 神韵译', sublabel: '专家版', desc: '意象脱壳，信达雅，适配语境深度',     color: 'border-l-purple-400', badge: 'bg-purple-100 text-purple-700', icon: '🔴' },
];

export default function TranslationPanel({ translations }) {
  const [openLevel, setOpenLevel] = useState(null);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-apple-black">三阶译文</h2>
        <span className="text-xs text-apple-muted">点击逐级展开，先自己想再看答案</span>
      </div>
      <div className="flex flex-col gap-3">
        {LEVELS.map((level, i) => {
          const isOpen = openLevel !== null && openLevel >= i;
          const translation = translations[level.key];
          return (
            <div key={level.key} className={`border-l-4 ${level.color} pl-4 transition-all`}>
              <button onClick={() => setOpenLevel(isOpen && openLevel === i ? null : i)} className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{level.icon}</span>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-apple-black">{level.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${level.badge}`}>{level.sublabel}</span>
                    </div>
                    <div className="text-xs text-apple-muted mt-0.5">{level.desc}</div>
                  </div>
                </div>
                <span className="text-apple-muted">▾</span>
              </button>
              {isOpen && (
                <div className="mt-3 text-apple-black text-base leading-relaxed">{translation}</div>
              )}
            </div>
          );
        })}
        <button onClick={() => setOpenLevel(openLevel === 2 ? null : 2)} className="text-xs text-apple-blue hover:underline self-end mt-1">
          {openLevel === 2 ? '收起全部' : '展开全部对比'}
        </button>
      </div>
    </div>
  );
}