// src/components/AnalysisPanel.jsx
import { useState } from 'react';
import LogicBlocks from './LogicBlocks';
import TranslationPanel from './TranslationPanel';

const TYPE_CONFIG = {
  main:     { label: '主脉', dot: 'bg-apple-blue' },
  context:  { label: '背景', dot: 'bg-apple-muted' },
  modifier: { label: '支脉', dot: 'bg-apple-orange' },
  nested:   { label: '嵌套', dot: 'bg-apple-purple' },
  signal:   { label: '信号', dot: 'bg-apple-green' },
};

export default function AnalysisPanel({ sentence, result, onEnterChallenge }) {
  const [skeletonMode, setSkeletonMode] = useState(false);
  const [activeBlock, setActiveBlock] = useState(null);
  
  if (!result) return null;
  
  const { skeleton, logic_blocks, pattern_matches, graded_translations, expert_alert, confidence } = result;

  return (
    <div className="mt-6 flex flex-col gap-4">
      {expert_alert && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <div className="text-sm font-semibold text-amber-800">专家提示</div>
            <div className="text-sm text-amber-700 mt-1">{expert_alert}</div>
          </div>
        </div>
      )}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-apple-black">
            骨架提取
            {skeleton.is_inverted && (
              <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">倒装句</span>
            )}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-apple-muted">置信度 {confidence}%</span>
            <button
              onClick={() => setSkeletonMode(!skeletonMode)}
              className={`text-xs px-3 py-1 rounded-full border transition-all ${
                skeletonMode ? 'bg-apple-black text-white border-apple-black' : 'bg-white text-apple-gray border-gray-200 hover:border-gray-400'
              }`}
            >
              {skeletonMode ? '骨架模式 ON' : '全句模式'}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mb-5">
          {[
            { label: 'S 主语', value: skeleton.subject, color: 'border-l-blue-500' },
            { label: 'V 谓语', value: skeleton.verb, color: 'border-l-green-500' },
            { label: 'O/C 宾/补', value: skeleton.object_complement, color: 'border-l-orange-500' },
          ].filter(item => item.value).map((item, i) => (
            <div key={i} className={`border-l-4 ${item.color} pl-3 py-1`}>
              <div className="text-xs text-apple-muted">{item.label}</div>
              <div className="text-sm font-medium text-apple-black mt-0.5">{item.value}</div>
            </div>
          ))}
        </div>
        <LogicBlocks blocks={logic_blocks} skeletonMode={skeletonMode} activeBlock={activeBlock} onBlockClick={setActiveBlock} />
        <div className="flex flex-wrap gap-3 mt-4">
          {Object.entries(TYPE_CONFIG).map(([type, config]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${config.dot}`} />
              <span className="text-xs text-apple-muted">{config.label}</span>
            </div>
          ))}
        </div>
      </div>
      {pattern_matches?.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-apple-black mb-3">万能套路匹配</h2>
          <div className="flex flex-col gap-2">
            {pattern_matches.map((p, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="text-apple-blue font-mono text-sm bg-blue-50 px-2 py-0.5 rounded whitespace-nowrap">{p.pattern}</span>
                <span className="text-sm text-apple-gray">{p.tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <TranslationPanel translations={graded_translations} />
      
      <div className="mt-6 flex justify-center">
        <button
          onClick={onEnterChallenge}
          className="bg-apple-blue text-white px-6 py-3 rounded-full font-medium hover:bg-blue-600 transition-colors"
        >
          进入挑战模式
        </button>
      </div>
    </div>
  );
}