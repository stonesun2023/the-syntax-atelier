// src/services/achievementEngine.js
import { getAnalysisCount, getAllQuizRecords, unlockAchievement } from './db';

// 成就定义
const ACHIEVEMENTS = [
  {
    id: 'first_analysis',
    name: '手术室学徒',
    desc: '完成首次解构',
    emoji: '🔬',
    trigger: 'analysis_complete',
    check: async () => (await getAnalysisCount()) >= 1
  },
  {
    id: 'century_sentences',
    name: '百句斩',
    desc: '累计解构句子数 ≥ 100',
    emoji: '⚔️',
    trigger: 'analysis_complete',
    check: async () => (await getAnalysisCount()) >= 100
  },
  {
    id: 'imagery_master',
    name: '神韵大师',
    desc: 'L3 题型历史正确率 ≥ 70%（至少答过5题）',
    emoji: '✨',
    trigger: 'quiz_complete',
    check: async (quizRecords) => {
      const L3Questions = quizRecords.flatMap(r => r.results).filter(r => r.questionType === 'L3_imagery');
      const answered = L3Questions.filter(r => !r.skipped);
      
      if (answered.length < 5) return false;
      
      const correct = answered.filter(r => r.isCorrect).length;
      const accuracy = (correct / answered.length) * 100;
      
      return accuracy >= 70;
    }
  },
  {
    id: 'modifier_hunter',
    name: '定语从句猎手',
    desc: 'L2 题型历史正确率 ≥ 80%（至少答过5题）',
    emoji: '🎯',
    trigger: 'quiz_complete',
    check: async (quizRecords) => {
      const L2Questions = quizRecords.flatMap(r => r.results).filter(r => r.questionType === 'L2_reorder');
      const answered = L2Questions.filter(r => !r.skipped);
      
      if (answered.length < 5) return false;
      
      const correct = answered.filter(r => r.isCorrect).length;
      const accuracy = (correct / answered.length) * 100;
      
      return accuracy >= 80;
    }
  },
  {
    id: 'inversion_terminator',
    name: '倒装句终结者',
    desc: 'L4 题型历史正确率 ≥ 80%（至少答过5题）',
    emoji: '🏆',
    trigger: 'quiz_complete',
    check: async (quizRecords) => {
      const L4Questions = quizRecords.flatMap(r => r.results).filter(r => r.questionType === 'L4_strategy');
      const answered = L4Questions.filter(r => !r.skipped);
      
      if (answered.length < 5) return false;
      
      const correct = answered.filter(r => r.isCorrect).length;
      const accuracy = (correct / answered.length) * 100;
      
      return accuracy >= 80;
    }
  }
];

/**
 * 检测并解锁成就
 * @param {string} trigger - 触发类型：'analysis_complete' | 'quiz_complete'
 * @param {Object} payload - 触发载荷
 * @returns {Promise<Array>} 新解锁的成就数组
 */
export async function checkAndUnlockAchievements(trigger, payload) {
  const unlocked = await getAllQuizRecords(); // 获取所有已解锁的成就记录
  const unlockedIds = unlocked.map(a => a.achievementId);
  const newlyUnlocked = [];
  
  // 过滤出对应触发类型的成就
  const achievementsToCheck = ACHIEVEMENTS.filter(a => a.trigger === trigger);
  
  for (const achievement of achievementsToCheck) {
    // 跳过已解锁的成就
    if (unlockedIds.includes(achievement.id)) continue;
    
    try {
      let shouldUnlock = false;
      
      if (trigger === 'analysis_complete') {
        shouldUnlock = await achievement.check();
      } else if (trigger === 'quiz_complete') {
        shouldUnlock = await achievement.check(payload.quizRecords);
      }
      
      if (shouldUnlock) {
        const unlocked = await unlockAchievement(achievement.id);
        if (unlocked) {
          newlyUnlocked.push({
            id: achievement.id,
            name: achievement.name,
            desc: achievement.desc,
            emoji: achievement.emoji
          });
        }
      }
    } catch (error) {
      console.error(`检测成就 ${achievement.id} 时出错:`, error);
    }
  }
  
  return newlyUnlocked;
}