// ===== 命理解读渲染 =====
// 将解读引擎的文字输出渲染为美观的卡片

import { generateReading } from '../core/interpreter.js';

const WX_COLOR_CLASS = {
  '木': 'wx-wood', '火': 'wx-fire', '土': 'wx-earth', '金': 'wx-metal', '水': 'wx-water'
};

/**
 * 渲染命理解读区域
 * @param {object} baziResult - 排盘引擎输出数据
 */
export function renderReading(baziResult) {
  const container = document.getElementById('reading-area');
  try {
  const reading = generateReading(baziResult);

  const sections = [
    reading.personality,
    reading.career,
    reading.marriage,
    reading.health,
    reading.social
  ];

  container.innerHTML = `
    <div class="fade-in">
      <h2 class="font-brush text-2xl text-gold text-center mb-6 tracking-widest">命理综合解读</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${sections.map(section => `
          <div class="reading-card">
            <h3 class="font-brush text-lg flex items-center gap-2">
              <span>${section.icon}</span>
              <span>${section.title}</span>
            </h3>
            <div class="text-sm text-parchment-dark/80 whitespace-pre-line leading-relaxed">${section.text}</div>
          </div>
        `).join('')}
      </div>

      <!-- 免责声明 -->
      <div class="mt-6 text-center text-xs text-parchment-dark/30 italic">
        以上解读基于传统命理学知识，仅供参考与学习，不构成科学依据或人生决策建议。
        命运掌握在自己手中，知命而不认命，方为智慧之道。
      </div>

      <div class="divider"></div>
    </div>
  `;
  } catch(e) {
    container.innerHTML = `<p style="color:var(--color-vermilion)">解读渲染出错: ${e.message}</p>`;
  }
}
