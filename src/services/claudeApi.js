// src/services/claudeApi.js

const SYSTEM_PROMPT = `你是一位语言教育专家与逻辑分析师，专注于英语长难句的结构解析与教学。

你的任务：接收用户输入的英文句子，按照四步解构算法进行分析，严格按照 JSON 格式输出结果。

四步解构算法：
1. 信号探测：识别 which/that/because 等连接词，锁定介词短语与非谓语动词
2. 骨架提取：屏蔽所有修饰成分，锁定核心 S（主）+ V（谓）+ O（宾）
3. 逻辑分层：划分主脉/支脉/背景/嵌套
4. 语序重排：遵循中文叙事习惯（状语前置、被动转主动）

输出规则：
1. logic_blocks 中所有 text 字段拼接后必须 100% 等于原句
2. 只输出合法 JSON，不含任何 Markdown 标记
3. 三阶译文：L1直白平铺，L2语序重排消除翻译腔，L3意象脱壳实现信达雅
4. 严格要求：graded_translations 中的三个字段必须是中文翻译，绝对不能返回英文原文。
5. 如果句子较复杂，仍然必须给出中文翻译，不得以任何理由返回原文。
6. foundation：直白的中文翻译，主谓宾齐全
7. intermediate：语序符合中文习惯的翻译
8. professional：意象脱壳、信达雅的中文翻译
9. expert_alert 仅在倒装、虚拟语气、插入语、双重否定时触发，否则为空字符串
10. confidence 为解析准确性置信度（0-100）

输出格式（只输出 JSON，不要有任何其他内容）：
{
  "skeleton": {
    "subject": "主语文本",
    "verb": "谓语文本",
    "object_complement": "宾语或补语文本",
    "is_inverted": false,
    "inversion_type": ""
  },
  "logic_blocks": [
    {
      "id": 1,
      "text": "原句中的文本片段",
      "type": "main",
      "level": 0,
      "explanation": "功能说明",
      "referent": ""
    }
  ],
  "pattern_matches": [
    {
      "pattern": "套路名称",
      "tip": "使用说明"
    }
  ],
  "graded_translations": {
    "foundation": "骨架译文",
    "intermediate": "逻辑译文",
    "professional": "神韵译文"
  },
  "expert_alert": "",
  "confidence": 95
}`;

const QUIZ_PROMPT = `你是一位语言教育专家，根据提供的英文句子和解构结果，生成4道选择题。

重要规则：
1. 题目文本（question字段）和选项中，禁止使用"+"符号连接句子成分。
2. 禁止在题干中直接呈现答案结构。题目应描述任务，而不是展示答案。
3. 错误示例："找出句子主干：The cat + sat + on the mat"
4. 正确示例："以下哪个选项正确提取了该句的主干S+V+O？"

题型：
- L1_skeleton：找出正确主干 S+V+O
- L2_reorder：选出语序最符合中文逻辑的译文
- L3_imagery：选出最具文学张力的译文
- L4_strategy：面对此类句子，专家第一步做什么

只输出合法 JSON 数组，格式：
[
  {
    "id": 1,
    "type": "L1_skeleton",
    "label": "L1 基础关：剥离术",
    "question": "题目文本",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
    "correct": "D",
    "rationale": "原理解释"
  }
]`;

/**
 * 获取模型配置
 * @returns {Object} { endpoint, apiKey, modelId, provider }
 */
export function getModelConfig() {
  const selectedModel = localStorage.getItem('selectedModel') || 'glm-4-flash';
  
  // 获取 API Key
  let apiKey;
  if (selectedModel.startsWith('glm-')) {
    apiKey = localStorage.getItem('apiKey_glm');
  } else {
    apiKey = localStorage.getItem(`apiKey_${selectedModel}`);
  }
  
  // 模型配置
  const modelConfigs = {
    'glm-4-flash': { endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions', provider: 'zhipu' },
    'glm-4-air': { endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions', provider: 'zhipu' },
    'glm-4-plus': { endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions', provider: 'zhipu' },
    'gemini-2.0-flash': { endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', provider: 'google' },
    'gpt-4o-mini': { endpoint: 'https://api.openai.com/v1/chat/completions', provider: 'openai' },
    'claude-haiku-4-5-20251001': { endpoint: 'https://api.anthropic.com/v1/messages', provider: 'anthropic' },
    'grok-3-mini': { endpoint: 'https://api.x.ai/v1/chat/completions', provider: 'xAI' }
  };
  
  const config = modelConfigs[selectedModel];
  
  if (!config) {
    throw new Error(`不支持的模型：${selectedModel}`);
  }
  
  if (!apiKey) {
    throw new Error(`请先在设置中配置 ${selectedModel} 的 API Key`);
  }
  
  return {
    endpoint: config.endpoint,
    apiKey: apiKey,
    modelId: selectedModel,
    provider: config.provider
  };
}

/**
 * 构建请求头
 * @param {string} provider 
 * @param {string} apiKey 
 * @returns {Object} headers
 */
function buildHeaders(provider, apiKey) {
  switch (provider) {
    case 'anthropic':
      return {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      };
    default:
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      };
  }
}

/**
 * 构建请求体
 * @param {string} provider 
 * @param {string} modelId 
 * @param {Array} messages 
 * @param {number} maxTokens 
 * @returns {Object} body
 */
function buildRequestBody(provider, modelId, messages, maxTokens) {
  switch (provider) {
    case 'anthropic':
      return {
        model: modelId,
        messages: messages,
        max_tokens: maxTokens
      };
    default:
      return {
        model: modelId,
        messages: messages,
        max_tokens: maxTokens
      };
  }
}

export async function analyzeSentence(sentence) {
  try {
    const { endpoint, apiKey, modelId, provider } = getModelConfig();

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `请解构以下英文句子：\n\n${sentence}` }
    ];

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: buildHeaders(provider, apiKey),
      body: JSON.stringify(buildRequestBody(provider, modelId, messages, 2000)),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API 请求失败：${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const rawText = data.choices[0]?.message?.content || '';
    const cleaned = rawText.replace(/```json|```/g, '').trim();

    try {
      return JSON.parse(cleaned);
    } catch (e) {
      console.error('JSON 解析失败，原始返回：', rawText);
      throw new Error('AI 返回格式异常，请重试');
    }
  } catch (error) {
    throw error;
  }
}

export async function generateQuiz(sentence, analysisResult) {
  try {
    const { endpoint, apiKey, modelId, provider } = getModelConfig();

    const messages = [
      { role: 'system', content: QUIZ_PROMPT },
      { role: 'user', content: `原句：${sentence}\n\n解构结果：${JSON.stringify(analysisResult)}` }
    ];

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: buildHeaders(provider, apiKey),
      body: JSON.stringify(buildRequestBody(provider, modelId, messages, 2000)),
    });

    const data = await response.json();
    const rawText = data.choices[0]?.message?.content || '';
    const cleaned = rawText.replace(/```json|```/g, '').trim();

    try {
      return JSON.parse(cleaned);
    } catch (e) {
      throw new Error('出题失败，请重试');
    }
  } catch (error) {
    throw error;
  }
}
