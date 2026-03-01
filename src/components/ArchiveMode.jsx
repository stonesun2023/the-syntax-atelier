// src/components/ArchiveMode.jsx
import { useState, useEffect } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { getAllQuizRecords, getUnlockedAchievements } from '../services/db';
import ShareCard from './ShareCard';

export default function ArchiveMode() {
  const [records, setRecords] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // 真实调用 getAllQuizRecords() 获取数据
        const quizRecords = await getAllQuizRecords();
        setRecords(quizRecords);
        
        // 获取成就数据
        const unlockedAchievements = await getUnlockedAchievements();
        setAchievements(unlockedAchievements);
      } catch (error) {
        console.error('加载档案数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-blue mx-auto"></div>
        <p className="mt-4 text-apple-muted">正在加载学习档案...</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📚</div>
        <h2 className="text-2xl font-semibold text-apple-black mb-2">还没有挑战记录</h2>
        <p className="text-apple-muted mb-6">去解构一个句子开始练习吧</p>
        <button className="bg-apple-blue text-white px-6 py-3 rounded-full font-medium hover:bg-blue-600 transition-colors">
          开始解构
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-apple-black">累计挑战次数</h3>
            <span className="text-2xl">📊</span>
          </div>
          <div className="text-3xl font-bold text-apple-black">{records.length}</div>
          <div className="text-sm text-apple-muted mt-1">次</div>
        </div>
        
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-apple-black">累计答题数</h3>
            <span className="text-2xl">🔢</span>
          </div>
          <div className="text-3xl font-bold text-apple-black">{calculateTotalQuestions(records)}</div>
          <div className="text-sm text-apple-muted mt-1">题（不含跳过）</div>
        </div>
        
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-apple-black">综合正确率</h3>
            <span className="text-2xl">🎯</span>
          </div>
          <div className="text-3xl font-bold text-apple-black">{calculateOverallAccuracy(records)}%</div>
          <div className="text-sm text-apple-muted mt-1">整体水平</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-apple-black mb-4">能力雷达图</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={getRadarChartData(records)}>
                <PolarGrid />
                <PolarAngleAxis dataKey="dimension" />
                <PolarRadiusAxis angle={60} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <Radar
                  name="正确率"
                  dataKey="accuracy"
                  stroke="#0071E3"
                  fill="#0071E3"
                  fillOpacity={0.2}
                  dot={{ fill: '#0071E3', stroke: '#0071E3' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-apple-black mb-4">盲点分析</h3>
          <BlindSpotAnalysis records={records} />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-apple-black mb-4">最近 5 次挑战记录</h3>
        <div className="space-y-3">
          {records.slice(0, 5).map((record, index) => (
            <div key={record.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-apple-black">
                  {truncateText(record.sentence, 20)}
                </div>
                <div className="text-sm text-apple-muted mt-1">
                  {new Date(record.date).toLocaleDateString('zh-CN', { 
                    year: 'numeric', 
                    month: '2-digit', 
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-apple-black">
                  {record.score}/4
                </div>
                <div className="text-sm text-apple-muted">
                  正确率 {record.accuracy}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-apple-black mb-4">成就徽章</h3>
        <AchievementGrid achievements={achievements} />
      </div>

      <ShareCard 
        achievements={achievements} 
        overallAccuracy={calculateOverallAccuracy(records)}
      />
    </div>
  );
}

// 计算总答题数（不含跳过）
function calculateTotalQuestions(records) {
  return records.reduce((total, record) => {
    const answeredQuestions = record.results.filter(r => !r.skipped).length;
    return total + answeredQuestions;
  }, 0);
}

// 计算综合正确率
function calculateOverallAccuracy(records) {
  if (records.length === 0) return 0;
  
  let totalCorrect = 0;
  let totalAnswered = 0;
  
  records.forEach(record => {
    const answered = record.results.filter(r => !r.skipped);
    totalCorrect += answered.filter(r => r.isCorrect).length;
    totalAnswered += answered.length;
  });
  
  return totalAnswered === 0 ? 0 : Math.round((totalCorrect / totalAnswered) * 100);
}

// 获取雷达图数据
function getRadarChartData(records) {
  const dimensions = [
    { key: 'L1_skeleton', label: '骨架提取', minQuestions: 3 },
    { key: 'L2_reorder', label: '语序重排', minQuestions: 3 },
    { key: 'L3_imagery', label: '意象捕捉', minQuestions: 3 },
    { key: 'L4_strategy', label: '解构策略', minQuestions: 3 }
  ];
  
  return dimensions.map(dim => {
    const questions = records.flatMap(r => r.results).filter(r => r.questionType === dim.key);
    const answered = questions.filter(r => !r.skipped);
    
    if (answered.length < dim.minQuestions) {
      return {
        dimension: dim.label,
        accuracy: 0,
        isDataInsufficient: true
      };
    }
    
    const correct = answered.filter(r => r.isCorrect).length;
    const accuracy = Math.round((correct / answered.length) * 100);
    
    return {
      dimension: dim.label,
      accuracy: accuracy
    };
  });
}

// 盲点分析组件
function BlindSpotAnalysis({ records }) {
  const dimensions = [
    { key: 'L1_skeleton', label: '骨架提取' },
    { key: 'L2_reorder', label: '语序重排' },
    { key: 'L3_imagery', label: '意象捕捉' },
    { key: 'L4_strategy', label: '解构策略' }
  ];
  
  const blindSpots = dimensions.map(dim => {
    const questions = records.flatMap(r => r.results).filter(r => r.questionType === dim.key);
    const answered = questions.filter(r => !r.skipped);
    
    if (answered.length === 0) {
      return { ...dim, accuracy: 0, isBlindSpot: false, isDataInsufficient: true };
    }
    
    const correct = answered.filter(r => r.isCorrect).length;
    const accuracy = Math.round((correct / answered.length) * 100);
    
    return {
      ...dim,
      accuracy,
      isBlindSpot: accuracy < 60,
      isDataInsufficient: false
    };
  });
  
  const hasBlindSpots = blindSpots.some(bs => bs.isBlindSpot);
  
  if (!hasBlindSpots) {
    return (
      <div className="text-center py-8 text-apple-muted">
        <div className="text-4xl mb-2">🎉</div>
        <div className="text-lg font-semibold text-apple-black">暂无明显盲点</div>
        <div className="text-sm">继续保持！</div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {blindSpots
        .filter(bs => bs.isBlindSpot)
        .map((bs, index) => (
          <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-apple-black">{bs.label}</h4>
              <span className="text-red-600 font-bold">{bs.accuracy}%</span>
            </div>
            <p className="text-sm text-apple-muted">{getReviewAdvice(bs.key)}</p>
          </div>
        ))}
    </div>
  );
}

// 获取复习建议
function getReviewAdvice(questionType) {
  const adviceMap = {
    'L1_skeleton': '遇到长句先找动词，动词左边是主语，右边是宾语',
    'L2_reorder': '记住口诀：状语前置、被动转主动、结果后置',
    'L3_imagery': '翻译前问自己：这句话的画面是什么？用中文直接描述画面',
    'L4_strategy': '复习四步解构算法：信号探测→骨架提取→逻辑分层→语序重排'
  };
  
  return adviceMap[questionType] || '继续练习，提升解构能力';
}

// 截断文本
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// 成就徽章网格组件
function AchievementGrid({ achievements }) {
  const allAchievements = [
    {
      id: 'first_analysis',
      name: '手术室学徒',
      emoji: '🔬',
      condition: '完成首次解构'
    },
    {
      id: 'century_sentences',
      name: '百句斩',
      emoji: '⚔️',
      condition: '累计解构句子数 ≥ 100'
    },
    {
      id: 'imagery_master',
      name: '神韵大师',
      emoji: '✨',
      condition: 'L3 题型历史正确率 ≥ 70%（至少答过5题）'
    },
    {
      id: 'modifier_hunter',
      name: '定语从句猎手',
      emoji: '🎯',
      condition: 'L2 题型历史正确率 ≥ 80%（至少答过5题）'
    },
    {
      id: 'inversion_terminator',
      name: '倒装句终结者',
      emoji: '🏆',
      condition: 'L4 题型历史正确率 ≥ 80%（至少答过5题）'
    }
  ];

  const unlockedIds = achievements.map(a => a.achievementId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {allAchievements.map((achievement) => {
        const isUnlocked = unlockedIds.includes(achievement.id);
        
        return (
          <div
            key={achievement.id}
            className={`p-4 rounded-2xl border-2 transition-all ${
              isUnlocked
                ? 'border-apple-black bg-white'
                : 'border-gray-200 bg-gray-50 grayscale'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`text-3xl ${isUnlocked ? '' : 'opacity-50'}`}>
                {achievement.emoji}
              </span>
              <div className="flex-1">
                <div className={`font-semibold ${isUnlocked ? 'text-apple-black' : 'text-gray-400'}`}>
                  {achievement.name}
                </div>
                <div className={`text-sm ${isUnlocked ? 'text-apple-muted' : 'text-gray-400'}`}>
                  {isUnlocked ? '已解锁' : achievement.condition}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
