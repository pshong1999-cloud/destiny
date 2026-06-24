// ===== 大运流年渲染 =====
// 展示大运时间轴和流年标注

import { GAN_WUXING, ZHI_WUXING } from '../core/bazi-engine.js';

const WX_COLOR_CLASS = {
  '木': 'wx-wood', '火': 'wx-fire', '土': 'wx-earth', '金': 'wx-metal', '水': 'wx-water'
};

// 柱位标签
const PILLAR_CN = {
  year: '年', month: '月', day: '日', hour: '时'
};

/**
 * 渲染大运流年面板
 * @param {object} baziResult - 排盘引擎输出数据
 */
export function renderDayun(baziResult) {
  const container = document.getElementById('dayun-area');
  const { daYun, liuNian } = baziResult;

  // 当前年份
  const currentYear = new Date().getFullYear(); // Note: uses current year for comparison

  // 判断当前大运
  const currentAge = getCurrentAge(baziResult);

  container.innerHTML = `
    <div class="fade-in">
      <h2 class="font-brush text-2xl text-gold text-center mb-6 tracking-widest">大运流年</h2>

      <!-- 大运时间轴 -->
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
        ${daYun.map((dy, i) => {
          const endAge = i < daYun.length - 1 ? daYun[i + 1].startAge : dy.startAge + 10;
          const isCurrent = currentAge >= dy.startAge && currentAge < endAge;
          return `
            <div class="dayun-item ${isCurrent ? 'current' : ''}">
              <div class="text-xs text-gold/60 mb-1">${dy.startAge}-${endAge}岁</div>
              <div class="flex items-center justify-center gap-2 mb-1">
                <span class="font-bold text-xl ${WX_COLOR_CLASS[dy.ganWuxing]}">${dy.gan}</span>
                <span class="font-bold text-xl ${WX_COLOR_CLASS[dy.zhiWuxing]}">${dy.zhi}</span>
              </div>
              <div class="text-xs text-center">
                <span class="${WX_COLOR_CLASS[dy.ganWuxing]}">${dy.ganWuxing}</span>
                <span class="${WX_COLOR_CLASS[dy.zhiWuxing]}">${dy.zhiWuxing}</span>
              </div>
              ${isCurrent ? '<div class="text-xs text-vermilion text-center mt-1 font-bold">★ 当前大运</div>' : ''}
              <div class="text-xs text-parchment-dark/50 mt-1 text-center">${dy.nayin}</div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- 流年滚动区 -->
      <div class="bg-ink-light/30 rounded-xl border border-gold/15 p-4">
        <h3 class="text-gold font-bold mb-3 text-center">近年流年</h3>
        <div class="flex gap-3 overflow-x-auto pb-2 justify-center">
          ${liuNian.map(ln => `
            <div class="flex-shrink-0 w-24 rounded-lg p-3 text-center border
              ${ln.isCurrent ? 'border-vermilion bg-vermilion/10' : 'border-gold/15 bg-ink-light/30'}">
              <div class="text-xs text-parchment-dark/60">${ln.year}年</div>
              <div class="font-bold text-lg ${WX_COLOR_CLASS[ln.ganWuxing]} ${WX_COLOR_CLASS[ln.zhiWuxing]}">
                ${ln.gan}${ln.zhi}
              </div>
              <div class="text-xs">
                <span class="${WX_COLOR_CLASS[ln.ganWuxing]}">${ln.ganWuxing}</span>
                <span class="${WX_COLOR_CLASS[ln.zhiWuxing]}">${ln.zhiWuxing}</span>
              </div>
              <div class="text-xs text-parchment-dark/40">${ln.animal}</div>
              ${ln.isCurrent ? '<div class="text-xs text-vermilion font-bold">今年</div>' : ''}
            </div>
          `).join('')}
        </div>
      </div>

      <div class="divider"></div>
    </div>
  `;
}

// 获取当前年龄（粗略估算）
// 注意：这里用出生年份估算，不精确到月日
function getCurrentAge(baziResult) {
  const birthYear = parseInt(baziResult.basic.solarDate.match(/(\d+)年/)[1]);
  const nowYear = new Date().getFullYear();
  return nowYear - birthYear;
}
