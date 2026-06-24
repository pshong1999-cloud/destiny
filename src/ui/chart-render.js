// ===== 排盘表格渲染 =====
// 将八字排盘数据渲染为传统风格的排盘表格

import { GAN_WUXING } from '../core/bazi-engine.js';

// 五行对应的CSS颜色类
const WX_COLOR_CLASS = {
  '木': 'wx-wood', '火': 'wx-fire', '土': 'wx-earth', '金': 'wx-metal', '水': 'wx-water'
};

// 五行对应背景色类
const WX_BG_CLASS = {
  '木': 'wx-bg-wood', '火': 'wx-bg-fire', '土': 'wx-bg-earth', '金': 'wx-bg-metal', '水': 'wx-bg-water'
};

// 柱位中文标签
const PILLAR_LABELS = {
  year: '年柱（祖业）',
  month: '月柱（父母）',
  day: '日柱（自身）',
  hour: '时柱（子女）'
};

/**
 * 渲染排盘表格
 * @param {object} baziResult - 排盘引擎输出数据
 */
export function renderChart(baziResult) {
  const container = document.getElementById('chart-area');
  const { basic, shiShen, hiddenStems, nayin, shenSha } = baziResult;
  const { solarDate, lunarInfo, gender, dayMaster, pillars } = basic;

  container.innerHTML = `
    <div class="fade-in">
      <!-- 标题信息 -->
      <div class="text-center mb-6">
        <h2 class="font-brush text-3xl text-gold tracking-widest">八字命盘</h2>
        <p class="text-parchment-dark text-sm mt-2">
          阳历 ${solarDate} · ${lunarInfo.yearGanZhi}${lunarInfo.animal}年 · ${lunarInfo.monthGanZhi} · ${lunarInfo.dayGanZhi}
          · ${gender === '男' ? '乾造' : '坤造'}
        </p>
      </div>

      <!-- 排盘主表格 -->
      <div class="overflow-x-auto">
        <table class="bazi-table w-full max-w-xl mx-auto">
          <thead>
            <tr>
              <th class="w-16"></th>
              ${['year', 'month', 'day', 'hour'].map(k => `
                <th>${PILLAR_LABELS[k]}</th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            <!-- 十神行 -->
            <tr>
              <td class="text-xs text-gold/70">十神</td>
              ${['year', 'month', 'day', 'hour'].map(k => `
                <td class="shishen-label">${shiShen[k].ganShiShen}</td>
              `).join('')}
            </tr>

            <!-- 天干行 -->
            <tr>
              <td class="text-xs text-gold/70">天干</td>
              ${['year', 'month', 'day', 'hour'].map(k => {
                const p = pillars[k];
                const wxClass = WX_COLOR_CLASS[p.ganWuxing];
                return `<td>
                  <span class="gan-char ${wxClass}">${p.gan}</span>
                  <span class="text-xs ${wxClass} opacity-70">${p.ganWuxing}</span>
                </td>`;
              }).join('')}
            </tr>

            <!-- 地支行 -->
            <tr>
              <td class="text-xs text-gold/70">地支</td>
              ${['year', 'month', 'day', 'hour'].map(k => {
                const p = pillars[k];
                const wxClass = WX_COLOR_CLASS[p.zhiWuxing];
                return `<td>
                  <span class="zhi-char ${wxClass}">${p.zhi}</span>
                  <span class="text-xs ${wxClass} opacity-70">${p.zhiWuxing}</span>
                </td>`;
              }).join('')}
            </tr>

            <!-- 藏干行 -->
            <tr>
              <td class="text-xs text-gold/70">藏干</td>
              ${['year', 'month', 'day', 'hour'].map(k => {
                const cg = hiddenStems[k];
                return `<td>
                  <div class="flex flex-col gap-0.5">
                    ${cg.map(item => `
                      <span class="canggan-label ${WX_COLOR_CLASS[item.wuxing]}">${item.gan}<small class="text-xs opacity-50">${item.shiShen}</small></span>
                    `).join('')}
                  </div>
                </td>`;
              }).join('')}
            </tr>

            <!-- 纳音行 -->
            <tr>
              <td class="text-xs text-gold/70">纳音</td>
              ${nayin.map(n => `
                <td><span class="nayin-label">${n.nayin}</span></td>
              `).join('')}
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 神煞标注 -->
      ${shenSha.length > 0 ? `
        <div class="mt-4 text-center">
          <span class="text-xs text-gold/60 mr-2">神煞:</span>
          ${shenSha.map(ss => `
            <span class="shensha-tag" title="${ss.effect}">${ss.name}(${ss.position})</span>
          `).join('')}
        </div>
      ` : ''}

      <!-- 分割线 -->
      <div class="divider"></div>
    </div>
  `;
}
