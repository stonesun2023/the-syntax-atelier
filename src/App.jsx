// src/App.jsx
import { useState } from 'react';
import InputPanel from './components/InputPanel';
import AnalysisPanel from './components/AnalysisPanel';
import ChallengeMode from './components/ChallengeMode';
import ArchiveMode from './components/ArchiveMode';
import SettingsPanel from './components/SettingsPanel';
import AchievementToast from './components/AchievementToast';
import { analyzeSentence } from './services/claudeApi';
import { saveAnalysis, getAllQuizRecords } from './services/db';
import { checkAndUnlockAchievements } from './services/achievementEngine';

export default function App() {
  const [mode, setMode] = useState('analyze');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [currentSentence, setCurrentSentence] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [newAchievements, setNewAchievements] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);

  async function handleAnalyze(sentence) {
    if (!sentence.trim()) return;
    setIsLoading(true);
    setError('');
    setAnalysisResult(null);
    setCurrentSentence(sentence);
    try {
      const result = await analyzeSentence(sentence);
      setAnalysisResult(result);
      await saveAnalysis(sentence, result);
      
      // 检测并解锁成就
      const newlyUnlocked = await checkAndUnlockAchievements('analysis_complete', { sentence, analysisResult: result });
      if (newlyUnlocked.length > 0) setNewAchievements(newlyUnlocked);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-apple-bg">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">✦</span>
            <span className="font-semibold text-apple-black tracking-tight">The Syntax Atelier</span>
            <span className="text-apple-muted text-sm hidden sm:block">· 句法工坊</span>
          </div>
          <div className="flex items-center gap-2">
            <nav className="flex gap-1">
              {[
                { key: 'analyze', label: '解构' },
                { key: 'challenge', label: '挑战' },
                { key: 'archive', label: '档案' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setMode(tab.key)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    mode === tab.key ? 'bg-apple-black text-white' : 'text-apple-gray hover:text-apple-black'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="设置"
            >
              <svg className="w-5 h-5 text-apple-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-10">
        {mode === 'analyze' && (
          <>
            <InputPanel onAnalyze={handleAnalyze} isLoading={isLoading} />
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
                {error}
              </div>
            )}
            {analysisResult && (
              <AnalysisPanel 
                sentence={currentSentence} 
                result={analysisResult} 
                onEnterChallenge={() => setMode('challenge')}
              />
            )}
          </>
        )}
        {mode === 'challenge' && (
          analysisResult ? (
            <ChallengeMode
              sentence={currentSentence}
              analysisResult={analysisResult}
              onBack={() => setMode('analyze')}
            />
          ) : (
            <div className="text-center py-20 text-apple-muted">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-lg font-medium text-apple-black">请先解构一个句子</p>
              <p className="mt-2 text-sm">挑战模式需要基于解构结果出题</p>
            </div>
          )
        )}
        {mode === 'archive' && <ArchiveMode />}
      </main>
      {newAchievements.length > 0 && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-2">
          {newAchievements.map((a, i) => (
            <div
              key={i}
              className="bg-apple-black text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-3"
              onClick={() => setNewAchievements([])}
            >
              <span className="text-2xl">{a.icon}</span>
              <div>
                <div className="font-semibold text-sm">成就解锁！{a.name}</div>
                <div className="text-xs text-gray-400">{a.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <SettingsPanel 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
    </div>
  );
}
