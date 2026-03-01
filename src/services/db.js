// src/services/db.js
import Dexie from 'dexie';

const db = new Dexie('SyntaxAtelierDB');

db.version(4).stores({
  analyses: '++id, sentence, createdAt',
  quizRecords: '++id, date',
  achievements: '++id, achievementId, unlockedAt',
});

export async function saveAnalysis(sentence, result) {
  return await db.analyses.add({
    sentence,
    result,
    createdAt: new Date().toISOString(),
  });
}

export async function getAnalysisHistory(limit = 50) {
  return await db.analyses.orderBy('createdAt').reverse().limit(limit).toArray();
}

export async function getAnalysisCount() {
  return await db.analyses.count();
}

export async function getQuizStats() {
  const records = await db.quizRecords.toArray();
  const stats = { total: records.length, correct: records.filter(r => r.isCorrect).length, byType: {} };
  ['L1_skeleton', 'L2_reorder', 'L3_imagery', 'L4_strategy'].forEach(type => {
    const typeRecords = records.filter(r => r.questionType === type);
    const typeCorrect = typeRecords.filter(r => r.isCorrect).length;
    stats.byType[type] = {
      total: typeRecords.length,
      correct: typeCorrect,
      accuracy: typeRecords.length > 0 ? Math.round((typeCorrect / typeRecords.length) * 100) : 0,
    };
  });
  return stats;
}

const ACHIEVEMENTS = [
  { id: 'first_analysis', name: '手术室学徒', desc: '完成首次完整解构', icon: '🔬', check: async () => (await getAnalysisCount()) >= 1 },
  { id: 'hundred_sentences', name: '百句斩', desc: '累计解构 100 个句子', icon: '⚔️', check: async () => (await getAnalysisCount()) >= 100 },
];

export async function checkAndUnlockAchievements() {
  const unlocked = await db.achievements.toArray();
  const unlockedIds = unlocked.map(a => a.achievementId);
  const newlyUnlocked = [];
  for (const achievement of ACHIEVEMENTS) {
    if (unlockedIds.includes(achievement.id)) continue;
    const shouldUnlock = await achievement.check();
    if (shouldUnlock) {
      await db.achievements.add({ achievementId: achievement.id, unlockedAt: new Date().toISOString() });
      newlyUnlocked.push(achievement);
    }
  }
  return newlyUnlocked;
}

export async function getUnlockedAchievements() {
  const unlocked = await db.achievements.toArray();
  return ACHIEVEMENTS.map(a => ({
    ...a,
    isUnlocked: unlocked.some(u => u.achievementId === a.id),
    unlockedAt: unlocked.find(u => u.achievementId === a.id)?.unlockedAt,
  }));
}

// 新增方法：保存答题记录
export async function saveQuizRecord(record) {
  try {
    return await db.quizRecords.add({
      sentence: record.sentence,
      date: new Date().toISOString(),
      results: record.results,
      score: record.score,
      accuracy: record.accuracy
    });
  } catch (error) {
    console.error('保存答题记录失败:', error);
    // 不阻塞用户操作，仅打印错误
  }
}

// 新增方法：获取全部答题记录
export async function getAllQuizRecords() {
  return await db.quizRecords.orderBy('date').reverse().toArray();
}

// 新增方法：解锁一个成就（如已解锁则忽略，不重复写入）
export async function unlockAchievement(achievementId) {
  const unlocked = await db.achievements.toArray();
  const unlockedIds = unlocked.map(a => a.achievementId);
  
  if (unlockedIds.includes(achievementId)) {
    return false; // 已解锁，不重复写入
  }
  
  await db.achievements.add({ 
    achievementId: achievementId, 
    unlockedAt: new Date().toISOString() 
  });
  return true; // 成功解锁
}


export default db;
