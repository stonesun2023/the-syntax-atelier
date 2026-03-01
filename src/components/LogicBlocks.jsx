// src/components/LogicBlocks.jsx
import { useState } from 'react';

const TYPE_STYLE = {
  main:     { bg: 'bg-blue-100',   text: 'text-blue-800',   border: 'border-blue-200',   label: '主脉' },
  context:  { bg: 'bg-gray-100',   text: 'text-gray-600',   border: 'border-gray-200',   label: '背景' },
  modifier: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', label: '支脉' },
  nested:   { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200', label: '嵌套' },
  signal:   { bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-200',  label: '信号' },
};

export default function LogicBlocks({ blocks, skeletonMode, activeBlock, onBlockClick }) {
  const [tooltip, setTooltip] = useState(null);
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) return null;

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1 leading-relaxed">
        {blocks.map((block) => {
          const style = TYPE_STYLE[block.type] || TYPE_STYLE.context;
          const isActive = activeBlock === block.id;
          const opacity = skeletonMode && block.type !== 'main' ? 'opacity-25' : 'opacity-100';
          return (
            <button
              key={block.id}
              onClick={() => {
                onBlockClick(isActive ? null : block.id);
                setTooltip(isActive ? null : block);
              }}
              className={`inline-flex items-center px-2 py-0.5 rounded-lg border text-sm font-mono transition-all ${style.bg} ${style.text} ${style.border} ${opacity} ${isActive ? 'ring-2 ring-offset-1 ring-blue-400 scale-105' : ''}`}
            >
              {block.text}
            </button>
          );
        })}
      </div>
      {tooltip && (
        <div className="mt-3 bg-apple-black text-white rounded-2xl px-4 py-3 text-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_STYLE[tooltip.type]?.bg} ${TYPE_STYLE[tooltip.type]?.text}`}>
              {TYPE_STYLE[tooltip.type]?.label}
            </span>
            {tooltip.level > 0 && <span className="text-xs text-gray-400">嵌套层级 {tooltip.level}</span>}
          </div>
          <p className="text-gray-200 leading-relaxed">{tooltip.explanation}</p>
          {tooltip.referent && <p className="text-gray-400 text-xs mt-1">指代：{tooltip.referent}</p>}
          <button onClick={() => { setTooltip(null); onBlockClick(null); }} className="mt-2 text-xs text-gray-400 hover:text-white">
            关闭 ✕
          </button>
        </div>
      )}
    </div>
  );
}