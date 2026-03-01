// src/components/ShareCard.jsx
import { useState } from 'react';
import html2canvas from 'html2canvas';

export default function ShareCard({ achievements, overallAccuracy }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    
    try {
      // 创建一个临时的 DOM 元素来渲染分享卡片
      const shareElement = document.createElement('div');
      shareElement.style.width = '600px';
      shareElement.style.height = '400px';
      shareElement.style.background = '#F5F5F7'; // Apple 浅灰背景
      shareElement.style.border = '2px solid #E5E5E7';
      shareElement.style.borderRadius = '20px';
      shareElement.style.position = 'fixed';
      shareElement.style.top = '-9999px';
      shareElement.style.left = '-9999px';
      shareElement.style.zIndex = '-9999';
      shareElement.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      shareElement.style.display = 'flex';
      shareElement.style.flexDirection = 'column';
      shareElement.style.justifyContent = 'center';
      shareElement.style.alignItems = 'center';
      shareElement.style.padding = '20px';
      shareElement.style.boxSizing = 'border-box';

      // 创建标题
      const title = document.createElement('div');
      title.style.fontSize = '24px';
      title.style.fontWeight = 'bold';
      title.style.color = '#1D1D1F';
      title.style.textAlign = 'center';
      title.style.marginBottom = '10px';
      title.textContent = 'The Syntax Atelier · 句法工坊';
      shareElement.appendChild(title);

      // 创建成就数量
      const unlockedCount = achievements.length;
      const totalCount = 5;
      const achievementCount = document.createElement('div');
      achievementCount.style.fontSize = '20px';
      achievementCount.style.color = '#424245';
      achievementCount.style.textAlign = 'center';
      achievementCount.style.marginBottom = '20px';
      achievementCount.textContent = `已解锁 ${unlockedCount}/${totalCount} 个成就`;
      shareElement.appendChild(achievementCount);

      // 创建综合正确率
      const accuracyContainer = document.createElement('div');
      accuracyContainer.style.display = 'flex';
      accuracyContainer.style.flexDirection = 'column';
      accuracyContainer.style.alignItems = 'center';
      accuracyContainer.style.marginBottom = '20px';

      const accuracyNumber = document.createElement('div');
      accuracyNumber.style.fontSize = '28px';
      accuracyNumber.style.fontWeight = 'bold';
      accuracyNumber.style.color = '#0071E3';
      accuracyNumber.textContent = `${overallAccuracy}%`;
      accuracyContainer.appendChild(accuracyNumber);

      const accuracyLabel = document.createElement('div');
      accuracyLabel.style.fontSize = '16px';
      accuracyLabel.style.color = '#424245';
      accuracyLabel.textContent = '综合正确率';
      accuracyContainer.appendChild(accuracyLabel);

      shareElement.appendChild(accuracyContainer);

      // 创建成就徽章容器
      const achievementsContainer = document.createElement('div');
      achievementsContainer.style.display = 'flex';
      achievementsContainer.style.gap = '20px';
      achievementsContainer.style.marginBottom = '20px';

      achievements.slice(0, 3).forEach((achievement) => {
        const badge = document.createElement('div');
        badge.style.width = '60px';
        badge.style.height = '60px';
        badge.style.borderRadius = '50%';
        badge.style.background = '#FFFFFF';
        badge.style.border = '2px solid #E5E5E7';
        badge.style.display = 'flex';
        badge.style.justifyContent = 'center';
        badge.style.alignItems = 'center';
        badge.style.fontSize = '32px';
        badge.textContent = achievement.emoji;
        achievementsContainer.appendChild(badge);
      });

      shareElement.appendChild(achievementsContainer);

      // 创建底部文案
      const footer = document.createElement('div');
      footer.style.fontSize = '14px';
      footer.style.color = '#424245';
      footer.style.textAlign = 'center';
      footer.style.lineHeight = '1.4';
      footer.innerHTML = '翻译不是搬运砖头，而是搬运蓝图。<br>—— The Syntax Atelier';
      shareElement.appendChild(footer);

      // 添加到 DOM
      document.body.appendChild(shareElement);

      // 使用 html2canvas 生成图片
      const canvas = await html2canvas(shareElement, {
        backgroundColor: null,
        scale: 2, // 提高分辨率
        useCORS: true,
        allowTaint: true
      });

      // 转换为 blob 并下载
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'syntax-atelier-share.png';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        
        // 清理临时元素
        document.body.removeChild(shareElement);
        setIsGenerating(false);
      }, 'image/png');

    } catch (error) {
      console.error('生成分享卡片失败:', error);
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-apple-black mb-4">分享卡片</h3>
      <p className="text-apple-muted mb-4 text-sm">
        生成一张精美的学习卡片，分享你的解构成果
      </p>
      <button
        onClick={handleDownload}
        disabled={isGenerating}
        className={`w-full py-3 rounded-full font-medium transition-all ${
          isGenerating
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-apple-blue text-white hover:bg-blue-600'
        }`}
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            生成中...
          </span>
        ) : '生成分享卡片'}
      </button>
    </div>
  );
}
