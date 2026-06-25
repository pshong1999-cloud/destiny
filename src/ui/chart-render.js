// ===== 排盘表格渲染（用内联style，不依赖Tailwind） =====

const WX_COLORS = {
  '木': '#4CAF50', '火': '#E53935', '土': '#D4A843', '金': '#E0E0E0', '水': '#42A5F5'
};

const PILLAR_CN = { year: '年柱', month: '月柱', day: '日柱', hour: '时柱' };
const PILLAR_DESC = { year: '祖业', month: '父母', day: '自身', hour: '子女' };

export function renderChart(baziResult) {
  const container = document.getElementById('chart-area');
  try {
    const { basic, shiShen, hiddenStems, nayin, shenSha } = baziResult;
    const { solarDate, lunarInfo, gender, dayMaster, pillars } = basic;

    // 安全取值：防止undefined
    const safeShiShen = (k) => shiShen && shiShen[k] ? shiShen[k].ganShiShen : '—';
    const safeHidden = (k) => hiddenStems && hiddenStems[k] ? hiddenStems[k] : [];
    const safeNayin = () => nayin || [];

    container.innerHTML = `
      <div style="animation:fadeIn 0.8s ease-out">
        <div style="text-align:center;margin-bottom:1.5rem">
          <h2 style="font-family:var(--font-brush);font-size:1.75rem;color:var(--color-gold);letter-spacing:0.1em">八字命盘</h2>
          <p style="color:var(--color-parchment-dark);opacity:0.7;font-size:0.875rem;margin-top:0.5rem">
            阳历 ${solarDate} · ${lunarInfo.yearGanZhi}${lunarInfo.animal}年 · ${lunarInfo.monthGanZhi} · ${lunarInfo.dayGanZhi}
            · ${gender === '男' ? '乾造' : '坤造'}
          </p>
        </div>

        <div style="overflow-x:auto">
          <table class="bazi-table" style="width:100%;max-width:36rem;margin:0 auto">
            <thead>
              <tr>
                <th style="width:3.5rem"></th>
                ${['year','month','day','hour'].map(k => `
                  <th>${PILLAR_CN[k]}<br><small style="opacity:0.6;font-size:0.7rem">(${PILLAR_DESC[k]})</small></th>
                `).join('')}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="font-size:0.75rem;color:var(--color-gold);opacity:0.7">十神</td>
                ${['year','month','day','hour'].map(k => `
                  <td style="color:var(--color-gold);opacity:0.8;font-size:0.75rem">${safeShiShen(k)}</td>
                `).join('')}
              </tr>
              <tr>
                <td style="font-size:0.75rem;color:var(--color-gold);opacity:0.7">天干</td>
                ${['year','month','day','hour'].map(k => {
                  const p = pillars[k];
                  const c = WX_COLORS[p.ganWuxing] || '#F5E6D0';
                  return `<td>
                    <span style="font-size:2rem;font-weight:900;color:${c};display:block;line-height:1">${p.gan}</span>
                    <span style="font-size:0.75rem;color:${c};opacity:0.7">${p.ganWuxing}</span>
                  </td>`;
                }).join('')}
              </tr>
              <tr>
                <td style="font-size:0.75rem;color:var(--color-gold);opacity:0.7">地支</td>
                ${['year','month','day','hour'].map(k => {
                  const p = pillars[k];
                  const c = WX_COLORS[p.zhiWuxing] || '#F5E6D0';
                  return `<td>
                    <span style="font-size:2rem;font-weight:900;color:${c};display:block;line-height:1">${p.zhi}</span>
                    <span style="font-size:0.75rem;color:${c};opacity:0.7">${p.zhiWuxing}</span>
                  </td>`;
                }).join('')}
              </tr>
              <tr>
                <td style="font-size:0.75rem;color:var(--color-gold);opacity:0.7">藏干</td>
                ${['year','month','day','hour'].map(k => {
                  const cg = safeHidden(k);
                  return `<td>
                    <div style="display:flex;flex-direction:column;gap:2px">
                      ${cg.map(item => {
                        const c = WX_COLORS[item.wuxing] || '#F5E6D0';
                        return `<span style="font-size:0.85rem;opacity:0.7;color:${c}">${item.gan}<small style="font-size:0.7rem;opacity:0.5">${item.shiShen}</small></span>`;
                      }).join('')}
                    </div>
                  </td>`;
                }).join('')}
              </tr>
              <tr>
                <td style="font-size:0.7rem;color:rgba(245,230,208,0.5)">纳音</td>
                ${safeNayin().map(n => `
                  <td style="font-size:0.7rem;color:rgba(245,230,208,0.5)">${n.nayin}</td>
                `).join('')}
              </tr>
            </tbody>
          </table>
        </div>

        ${shenSha && shenSha.length > 0 ? `
          <div style="margin-top:1rem;text-align:center">
            <span style="font-size:0.75rem;color:var(--color-gold);opacity:0.6;margin-right:0.5rem">神煞:</span>
            ${shenSha.map(ss => `
              <span class="shensha-tag" title="${ss.effect}">${ss.name}(${ss.position})</span>
            `).join('')}
          </div>
        ` : ''}
        <div class="divider"></div>
      </div>
    `;
  } catch(e) {
    container.innerHTML = `<p style="color:var(--color-vermilion)">排盘渲染出错: ${e.message}</p><pre style="color:#999;font-size:0.8rem">${e.stack}</pre>`;
  }
}
