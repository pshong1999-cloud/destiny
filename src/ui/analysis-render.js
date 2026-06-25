// ===== 五行与格局分析面板 =====
// 展示五行分布、日主强弱、格局判定、用神忌神

const WX_COLOR_CLASS = {
  '木': 'wx-wood', '火': 'wx-fire', '土': 'wx-earth', '金': 'wx-metal', '水': 'wx-water'
};

const WX_BG_CLASS = {
  '木': 'wx-bg-wood', '火': 'wx-bg-fire', '土': 'wx-bg-earth', '金': 'wx-bg-metal', '水': 'wx-bg-water'
};

// 五行对应颜色值（用于饼图）
const WX_CHART_COLORS = {
  '木': '#4CAF50', '火': '#E53935', '土': '#D4A843', '金': '#E0E0E0', '水': '#42A5F5'
};

/**
 * 渲染五行与格局分析面板
 * @param {object} baziResult - 排盘引擎输出数据
 */
export function renderAnalysis(baziResult) {
  const container = document.getElementById('analysis-area');
  try {

  // 五行总数
  const totalWx = Object.values(wuxingCount).reduce((a, b) => a + b, 0);

  // 五行占比
  const wxPercent = {};
  for (const [wx, count] of Object.entries(wuxingCount)) {
    wxPercent[wx] = Math.round((count / totalWx) * 100);
  }

  container.innerHTML = `
    <div class="fade-in">
      <h2 class="font-brush text-2xl text-gold text-center mb-6 tracking-widest">五行格局分析</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

        <!-- 左侧: 五行分布 -->
        <div class="bg-ink-light/40 rounded-xl border border-gold/20 p-5">
          <h3 class="text-gold font-bold mb-4 text-center">五行分布</h3>

          <!-- 五行柱状图 -->
          <div class="flex items-end justify-center gap-3 mb-4 h-32">
            ${Object.entries(wuxingCount).map(([wx, count]) => {
              const maxCount = Math.max(...Object.values(wuxingCount));
              const heightPercent = maxCount > 0 ? Math.max((count / maxCount) * 100, 5) : 5;
              const color = WX_CHART_COLORS[wx];
              return `
                <div class="flex flex-col items-center">
                  <span class="text-sm font-bold ${WX_COLOR_CLASS[wx]}">${count}</span>
                  <div style="height: ${heightPercent}%; width: 36px; background-color: ${color}; border-radius: 4px 4px 0 0; min-height: 4px; opacity: ${count === 0 ? 0.3 : 0.85};"></div>
                  <span class="text-xs mt-1 ${WX_COLOR_CLASS[wx]}">${wx}</span>
                </div>
              `;
            }).join('')}
          </div>

          <!-- 五行缺什么 -->
          ${wuxingMissing.length > 0 ? `
            <div class="text-center text-sm">
              <span class="text-parchment-dark">缺:</span>
              ${wuxingMissing.map(wx => `<span class="font-bold ${WX_COLOR_CLASS[wx]} text-lg mx-1">${wx}</span>`).join('')}
            </div>
          ` : `
            <div class="text-center text-sm text-parchment-dark">五行俱全，不缺任何五行</div>
          `}
        </div>

        <!-- 右侧: 日主强弱 + 格局 + 用神 -->
        <div class="bg-ink-light/40 rounded-xl border border-gold/20 p-5">
          <!-- 日主强弱 -->
          <div class="mb-4">
            <h3 class="text-gold font-bold mb-2">日主分析</h3>
            <div class="flex items-center gap-3 mb-2">
              <span class="font-bold text-lg ${WX_COLOR_CLASS[dayMaster.wuxing]}">${dayMaster.gan}${dayMaster.wuxing}</span>
              <span class="text-sm ${dayMaster.yinyang === '阳' ? 'text-red-400' : 'text-blue-400'}">${dayMaster.yinyang}</span>
              <span class="text-lg font-bold ${strength.isStrong ? 'text-vermilion' : 'text-blue-400'}">${strength.level}</span>
              <span class="text-sm text-parchment-dark">(评分: ${strength.score})</span>
            </div>
            <div class="text-sm text-parchment-dark/70">
              ${strength.reasons.map(r => `<p class="mb-1">• ${r}</p>`).join('')}
            </div>
          </div>

          <!-- 格局 -->
          <div class="mb-4">
            <h3 class="text-gold font-bold mb-2">格局</h3>
            <div class="flex items-center gap-2 mb-1">
              <span class="font-bold text-lg text-gold">${pattern.type}</span>
              <span class="text-xs text-parchment-dark/60">(${pattern.shiShen}当权)</span>
            </div>
            <p class="text-sm text-parchment-dark/70">${pattern.desc}</p>
          </div>

          <!-- 用神忌神 -->
          <div class="mb-4">
            <h3 class="text-gold font-bold mb-2">用神 & 忌神</h3>
            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-lg p-3 ${WX_BG_CLASS[yongShen.element]} border border-gold/20">
                <div class="text-xs text-parchment-dark/60">用神</div>
                <div class="font-bold text-lg ${WX_COLOR_CLASS[yongShen.element]}">${yongShen.element}</div>
                <div class="text-xs text-parchment-dark/50 mt-1">${yongShen.reason}</div>
              </div>
              <div class="rounded-lg p-3 ${WX_BG_CLASS[yongShen.jiShen]} border border-vermilion/20">
                <div class="text-xs text-parchment-dark/60">忌神</div>
                <div class="font-bold text-lg ${WX_COLOR_CLASS[yongShen.jiShen]}">${yongShen.jiShen}</div>
                <div class="text-xs text-parchment-dark/50 mt-1">${yongShen.jiReason}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="divider"></div>
    </div>
  `;
  } catch(e) {
    container.innerHTML = `<p style="color:var(--color-vermilion)">五行分析渲染出错: ${e.message}</p>`;
  }
}
