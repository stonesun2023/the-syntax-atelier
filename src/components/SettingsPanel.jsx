// src/components/SettingsPanel.jsx
import { useState } from 'react';

const MODELS = [
  { id: 'glm-4-flash', name: 'GLM-4-Flash（默认，最快）', note: '当前默认' },
  { id: 'glm-4-air', name: 'GLM-4-Air（均衡）', note: '同一 API 端点' },
  { id: 'glm-4-plus', name: 'GLM-4-Plus（最强）', note: '同一 API 端点' },
];

export default function SettingsPanel({ isOpen, onClose }) {
  const [selectedModel, setSelectedModel] = useState(() => {
    return localStorage.getItem('selectedModel') || 'glm-4-flash';
  });

  const handleModelChange = (modelId) => {
    setSelectedModel(modelId);
    localStorage.setItem('selectedModel', modelId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-apple-black">AI 模型设置</h2>
          <button
            onClick={onClose}
            className="text-apple-muted hover:text-apple-black transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          <p className="text-sm text-apple-muted mb-4">
            选择当前使用的 AI 引擎，切换后立即生效
          </p>
          
          <div className="space-y-3">
            {MODELS.map((model) => (
              <label
                key={model.id}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedModel === model.id
                    ? 'border-apple-blue bg-blue-50'
                    : 'border-gray-200 hover:border-apple-blue hover:bg-blue-50'
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-apple-black">{model.name}</span>
                  <span className="text-xs text-apple-muted">{model.note}</span>
                </div>
                <input
                  type="radio"
                  name="model"
                  value={model.id}
                  checked={selectedModel === model.id}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="w-4 h-4 text-apple-blue border-gray-300 focus:ring-apple-blue"
                />
              </label>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-apple-black hover:text-apple-gray transition-colors"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}