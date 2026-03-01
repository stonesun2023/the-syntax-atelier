// src/components/AchievementToast.jsx
import { useEffect, useState } from 'react';

export default function AchievementToast({ achievements, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (achievements.length === 0) return;

    if (currentIndex >= achievements.length) {
      // 所有成就都显示完毕，3秒后关闭
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // 动画结束后调用关闭回调
      }, 3000);
      return () => clearTimeout(timer);
    }

    // 每个成就显示1秒后切换到下一个
    const timer = setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentIndex, achievements.length, onClose]);

  if (achievements.length === 0 || !isVisible) {
    return null;
  }

  const currentAchievement = achievements[currentIndex];

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-apple-black text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3 animate-slide-down">
        <span className="text-2xl">{currentAchievement.emoji}</span>
        <div>
          <div className="font-semibold text-sm">成就解锁：{currentAchievement.name}</div>
          <div className="text-xs text-gray-300">{currentAchievement.desc}</div>
        </div>
      </div>
    </div>
  );
}

// CSS 动画样式
const style = document.createElement('style');
style.textContent = `
  @keyframes slide-down {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  @keyframes slide-up {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(-20px);
      opacity: 0;
    }
  }
  .animate-slide-down {
    animation: slide-down 0.3s ease-out;
  }
  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }
`;
document.head.appendChild(style);