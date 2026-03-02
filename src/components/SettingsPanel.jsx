// src/components/SettingsPanel.jsx
import { useState } from 'react';

const MODELS = [
  { id: 'glm-4-flash', name: 'GLM-4-Flash（默认）', note: 'https://open.bigmodel.cn', provider: 'zhipu' },
  { id: 'glm-4-air', name: 'GLM-4-Air', note: 'https://open.bigmodel.cn', provider: 'zhipu' },
  { id: 'glm-4-plus', name: 'GLM-4-Plus', note: 'https://open.bigmodel.cn', provider: 'zhipu' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash（免费）', note: 'https://generativelanguage.googleapis.com', provider: 'google' },
  { id: 'gpt-4o-mini', name: 'GPT-4o mini', note: 'https://api.openai.com', provider: 'openai' },
  { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku', note: 'https://api.anthropic.com', provider: 'anthropic' },
  { id: 'grok-3-mini', name: 'Grok-3 mini', note: 'https://api.x.ai', provider: 'xAI' },
];

export default function SettingsPanel({ isOpen, onClose }) {
  const [selectedModel, setSelectedModel] = useState(() => {
    return localStorage.getItem('selectedModel') || 'glm-4-flash';
  });
  const [expandedKey, setExpandedKey] = useState(null);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [keyInputs, setKeyInputs] = useState({});

  const handleModelChange = (modelId) => {
    setSelectedModel(modelId);
    localStorage.setItem('selectedModel', modelId);
  };

  // 初始化 keyInputs，从 localStorage 读取已保存的值
  const initializeKeyInputs = () => {
    const inputs = {};
    MODELS.forEach(model => {
      const keyName = model.id.startsWith('glm-') ? 'apiKey_glm' : `apiKey_${model.id}`;
      const saved = localStorage.getItem(keyName);
      if (saved) inputs[model.id] = saved;
    });
    setKeyInputs(inputs);
  };

  // 当面板打开时初始化输入框值
  if (isOpen && Object.keys(keyInputs).length === 0) {
    initializeKeyInputs();
  }

  const getApiKey = (modelId) => {
    if (modelId.startsWith('glm-')) {
      return localStorage.getItem('apiKey_glm');
    }
    return localStorage.getItem(`apiKey_${modelId}`);
  };

  const setApiKey = (modelId, key) => {
    if (modelId.startsWith('glm-')) {
      localStorage.setItem('apiKey_glm', key);
    } else {
      localStorage.setItem(`apiKey_${modelId}`, key);
    }
  };

  const handleApiKeySave = (modelId, key) => {
    setApiKey(modelId, key);
    setExpandedKey(null);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  const handleApiKeyClear = (modelId) => {
    setApiKey(modelId, '');
  };

  const getDisplayKey = (modelId) => {
    const key = getApiKey(modelId);
    if (!key) return '';
    return key.length > 4 ? key.substring(0, 4) + '****' : '****';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md max-h-[80vh] overflow-y-auto">
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
              <div key={model.id} className="border border-gray-200 rounded-lg">
                <label
                  className={`flex items-center justify-between p-3 cursor-pointer transition-all ${
                    selectedModel === model.id
                      ? 'bg-blue-50'
                      : 'hover:bg-blue-50'
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
                
                <div className="px-3 pb-3">
                  <button
                    onClick={() => setExpandedKey(expandedKey === model.id ? null : model.id)}
                    className="text-sm text-apple-blue hover:text-apple-black transition-colors"
                  >
                    {expandedKey === model.id ? '收起 Key' : '设置 Key'}
                  </button>
                  
                  {expandedKey === model.id && (
                    <div className="mt-2 space-y-2">
                      <input
                        type="password"
                        placeholder="请输入 API Key"
                        value={keyInputs[model.id] || ''}
                        onChange={(e) => setKeyInputs(prev => ({...prev, [model.id]: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-apple-blue focus:border-transparent"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            handleApiKeySave(model.id, keyInputs[model.id] || '');
                          }}
                          className="flex-1 bg-apple-blue text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          保存
                        </button>
                        <button
                          onClick={() => {
                            setKeyInputs(prev => ({...prev, [model.id]: ''}));
                            handleApiKeyClear(model.id);
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          清除
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {getApiKey(model.id) && (
                    <div className="mt-2 text-xs text-apple-muted">
                      已配置：{getDisplayKey(model.id)}
                    </div>
                  )}
                </div>
              </div>
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

        {showSavedToast && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-in slide-in-from-bottom-2 duration-300">
            已保存 ✓
          </div>
        )}
      </div>
    </div>
  );
}
