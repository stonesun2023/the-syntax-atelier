// src/services/claudeApi.js
// AI 引擎：智谱 GLM-4-Flash

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
4. expert_alert 仅在倒装、虚拟语气、插入语、双重否定时触发，否则为空字符串
5. confidence 为解析准确性置信度（0-100）

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

export async function analyzeSentence(sentence) {
  const apiKey = import.meta.env.VITE_GLM_API_KEY;
  if (!apiKey) throw new Error('未找到 API Key，请在 .env 文件中设置 VITE_GLM_API_KEY');

  const selectedModel = localStorage.getItem('selectedModel') || 'glm-4-flash';

  const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: selectedModel,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `请解构以下英文句子：\n\n${sentence}` },
      ],
      max_tokens: 2000,
    }),
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
}

export async function generateQuiz(sentence, analysisResult) {
  const apiKey = import.meta.env.VITE_GLM_API_KEY;
  if (!apiKey) throw new Error('未找到 API Key，请在 .env 文件中设置 VITE_GLM_API_KEY');

  const selectedModel = localStorage.getItem('selectedModel') || 'glm-4-flash';

  const QUIZ_PROMPT = `你是一位语言教育专家，根据提供的英文句子和解构结果，生成4道选择题。

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

  const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: selectedModel,
      messages: [
        { role: 'system', content: QUIZ_PROMPT },
        { role: 'user', content: `原句：${sentence}\n\n解构结果：${JSON.stringify(analysisResult)}` },
      ],
      max_tokens: 2000,
    }),
  });

  const data = await response.json();
  const rawText = data.choices[0]?.message?.content || '';
  const cleaned = rawText.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error('出题失败，请重试');
  }
}