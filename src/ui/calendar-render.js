// ===== 万年历工具 =====
// 阳历农历互转、节气查询、干支纪年、黄历宜忌

import { Solar, Lunar } from 'lunar-javascript';

const MONTH_CN = ['正','二','三','四','五','六','七','八','九','十','冬','腊'];

let currentCalYear = new Date().getFullYear();
let currentCalMonth = new Date().getFullYear() * 100 + (new Date().getMonth() + 1);

/**
 * 渲染万年历页面
 */
export function renderCalendar() {
  const container = document.getElementById('calendar-main');

  const nowYear = new Date().getFullYear();
  const nowMonth = new Date().getMonth() + 1;
  const nowDay = new Date().getDate();
  currentCalYear = nowYear;
  currentCalMonth = nowYear * 100 + nowMonth;

  container.innerHTML = `
    <div class="fade-in">
      <h2 class="font-[var(--font-brush)] text-2xl text-[var(--color-gold)] text-center mb-6 tracking-widest">万年历</h2>

      <!-- 日期转换工具 -->
      <div class="bg-[var(--color-ink-light)]/40 rounded-xl border border-[var(--color-gold)]/20 p-5 mb-6 max-w-2xl mx-auto">
        <h3 class="text-[var(--color-gold)] font-bold mb-3 text-center">日期转换 + 黄历查询</h3>

        <!-- 阳历 → 农历 + 宜忌 -->
        <div class="mb-4">
          <label class="text-sm text-[var(--color-parchment-dark)]/60 mb-1 block">阳历 → 农历 / 黄历</label>
          <div class="flex gap-2 items-center flex-wrap">
            <input id="conv-year" type="number" value="${nowYear}" min="1900" max="2099"
                   style="width:70px" class="bg-[var(--color-ink)] border border-[var(--color-gold)]/30 rounded-lg px-2 py-2 text-[var(--color-parchment)] text-center focus:border-[var(--color-gold)] focus:outline-none">
            <span class="text-[var(--color-parchment-dark)]/40">年</span>
            <input id="conv-month" type="number" value="${nowMonth}" min="1" max="12"
                   style="width:50px" class="bg-[var(--color-ink)] border border-[var(--color-gold)]/30 rounded-lg px-2 py-2 text-[var(--color-parchment)] text-center focus:border-[var(--color-gold)] focus:outline-none">
            <span class="text-[var(--color-parchment-dark)]/40">月</span>
            <input id="conv-day" type="number" value="${nowDay}" min="1" max="31"
                   style="width:50px" class="bg-[var(--color-ink)] border border-[var(--color-gold)]/30 rounded-lg px-2 py-2 text-[var(--color-parchment)] text-center focus:border-[var(--color-gold)] focus:outline-none">
            <span class="text-[var(--color-parchment-dark)]/40">日</span>
            <button id="btn-convert" class="bg-[var(--color-gold)]/20 border border-[var(--color-gold)]/30 rounded-lg px-3 py-2 text-[var(--color-gold)] text-sm cursor-pointer hover:bg-[var(--color-gold)]/30 transition-all">
              查询
            </button>
          </div>
          <div id="conv-result" class="mt-3 min-h-[100px]"></div>
        </div>

        <!-- 农历 → 阳历 -->
        <div>
          <label class="text-sm text-[var(--color-parchment-dark)]/60 mb-1 block">农历 → 阳历</label>
          <div class="flex gap-2 items-center flex-wrap">
            <input id="lconv-year" type="number" value="${nowYear}" min="1900" max="2099"
                   style="width:70px" class="bg-[var(--color-ink)] border border-[var(--color-gold)]/30 rounded-lg px-2 py-2 text-[var(--color-parchment)] text-center focus:border-[var(--color-gold)] focus:outline-none">
            <span class="text-[var(--color-parchment-dark)]/40">年</span>
            <input id="lconv-month" type="number" min="1" max="12" placeholder="月"
                   style="width:50px" class="bg-[var(--color-ink)] border border-[var(--color-gold)]/30 rounded-lg px-2 py-2 text-[var(--color-parchment)] text-center focus:border-[var(--color-gold)] focus:outline-none">
            <span class="text-[var(--color-parchment-dark)]/40">月</span>
            <input id="lconv-day" type="number" min="1" max="30" placeholder="日"
                   style="width:50px" class="bg-[var(--color-ink)] border border-[var(--color-gold)]/30 rounded-lg px-2 py-2 text-[var(--color-parchment)] text-center focus:border-[var(--color-gold)] focus:outline-none">
            <span class="text-[var(--color-parchment-dark)]/40">日</span>
            <label class="text-xs text-[var(--color-parchment-dark)]/40 flex items-center gap-1 cursor-pointer">
              <input id="lconv-leap" type="checkbox" style="accent-color:var(--color-gold)"> 闰月
            </label>
            <button id="btn-lconvert" class="bg-[var(--color-gold)]/20 border border-[var(--color-gold)]/30 rounded-lg px-3 py-2 text-[var(--color-gold)] text-sm cursor-pointer hover:bg-[var(--color-gold)]/30 transition-all">
              转换
            </button>
          </div>
          <div id="lconv-result" class="mt-2 min-h-[40px]"></div>
        </div>
      </div>

      <!-- 月历视图 -->
      <div class="max-w-2xl mx-auto">
        <div class="flex items-center justify-between mb-4">
          <button id="cal-prev" style="cursor:pointer" class="bg-[var(--color-ink)] border border-[var(--color-gold)]/30 rounded-lg px-3 py-2 text-[var(--color-gold)] hover:bg-[var(--color-ink-light)] transition-all">
            ◀ 上月
          </button>
          <div id="cal-title" class="font-[var(--font-brush)] text-xl text-[var(--color-gold)]"></div>
          <button id="cal-next" style="cursor:pointer" class="bg-[var(--color-ink)] border border-[var(--color-gold)]/30 rounded-lg px-3 py-2 text-[var(--color-gold)] hover:bg-[var(--color-ink-light)] transition-all">
            下月 ▶
          </button>
        </div>

        <div id="cal-grid" class="mb-6"></div>

        <!-- 今日黄历 -->
        <div id="cal-huangli" class="bg-[var(--color-ink-light)]/30 rounded-xl border border-[var(--color-gold)]/15 p-4 mb-4"></div>

        <!-- 本月节气 -->
        <div id="cal-jieqi" class="bg-[var(--color-ink-light)]/30 rounded-xl border border-[var(--color-gold)]/15 p-4"></div>
      </div>

      <div class="divider"></div>
    </div>
  `;

  renderMonthView(currentCalYear, currentCalMonth % 100);
  renderTodayHuangli();
  bindCalendarEvents();
}

function bindCalendarEvents() {
  // 阳历转农历 + 宜忌
  document.getElementById('btn-convert').addEventListener('click', () => {
    const y = parseInt(document.getElementById('conv-year').value);
    const m = parseInt(document.getElementById('conv-month').value);
    const d = parseInt(document.getElementById('conv-day').value);
    const resultEl = document.getElementById('conv-result');

    try {
      const solar = Solar.fromYmd(y, m, d);
      const lunar = solar.getLunar();

      const yi = lunar.getDayYi();
      const ji = lunar.getDayJi();
      const lunarYearGanZhi = lunar.getYearInGanZhi();
      const lunarMonthGanZhi = lunar.getMonthInGanZhi();
      const lunarDayGanZhi = lunar.getDayInGanZhi();
      const animal = lunar.getYearShengXiao();
      const lunarMonth = lunar.getMonth();
      const lunarDay = lunar.getDay();
      const isLeap = lunar.getMonth() < 0;
      const jieqi = lunar.getJieQi();

      resultEl.innerHTML = `
        <div class="text-[var(--color-gold)] font-bold text-lg">${lunarYearGanZhi}年(${animal}) ${isLeap ? '闰' : ''}${MONTH_CN[Math.abs(lunarMonth)-1]}月${lunarDay}日</div>
        <div class="text-xs mt-1 text-[var(--color-parchment-dark)]/70">
          干支: ${lunarYearGanZhi}年 ${lunarMonthGanZhi}月 ${lunarDayGanZhi}日 · ${animal}年 · 星期${solar.getWeek()}
          ${jieqi ? ` · 节气: ${jieqi}` : ''}
        </div>
        <div class="mt-2 grid grid-cols-2 gap-3">
          <div class="rounded-lg p-2 border border-green-800/40 bg-green-900/10">
            <div class="text-xs font-bold" style="color:#4CAF50">宜</div>
            <div class="text-xs mt-1" style="color:#81C784">${yi.length > 0 ? yi.join('、') : '无'}</div>
          </div>
          <div class="rounded-lg p-2 border border-red-900/40 bg-red-900/10">
            <div class="text-xs font-bold" style="color:#E53935">忌</div>
            <div class="text-xs mt-1" style="color:#EF9A9A">${ji.length > 0 ? ji.join('、') : '无'}</div>
          </div>
        </div>
      `;
    } catch (e) {
      resultEl.innerHTML = `<span style="color:var(--color-vermilion)">查询失败: ${e.message}</span>`;
    }
  });

  // 自动触发一次查询（显示今天的黄历）
  document.getElementById('btn-convert').click();

  // 农历转阳历
  document.getElementById('btn-lconvert').addEventListener('click', () => {
    const y = parseInt(document.getElementById('lconv-year').value);
    const m = parseInt(document.getElementById('lconv-month').value);
    const d = parseInt(document.getElementById('lconv-day').value);
    const isLeap = document.getElementById('lconv-leap').checked;
    const resultEl = document.getElementById('lconv-result');

    try {
      const lunarObj = Lunar.fromYmd(y, isLeap ? -m : m, d);
      const solar = lunarObj.getSolar();

      resultEl.innerHTML = `
        <div class="text-[var(--color-gold)] font-bold">阳历: ${solar.getYear()}年${solar.getMonth()}月${solar.getDay()}日</div>
      `;
    } catch (e) {
      resultEl.innerHTML = `<span style="color:var(--color-vermilion)">转换失败: ${e.message}</span>`;
    }
  });

  // 月份导航
  document.getElementById('cal-prev').addEventListener('click', () => {
    currentCalMonth -= 1;
    if (currentCalMonth % 100 === 0) {
      currentCalMonth = (currentCalYear - 1) * 100 + 12;
    }
    currentCalYear = Math.floor(currentCalMonth / 100);
    const month = currentCalMonth % 100;
    renderMonthView(currentCalYear, month);
  });

  document.getElementById('cal-next').addEventListener('click', () => {
    currentCalMonth += 1;
    if (currentCalMonth % 100 === 13) {
      currentCalMonth = (currentCalYear + 1) * 100 + 1;
    }
    currentCalYear = Math.floor(currentCalMonth / 100);
    const month = currentCalMonth % 100;
    renderMonthView(currentCalYear, month);
  });
}

// 渲染今日黄历
function renderTodayHuangli() {
  const container = document.getElementById('cal-huangli');
  try {
    const now = new Date();
    const solar = Solar.fromYmd(now.getFullYear(), now.getMonth() + 1, now.getDate());
    const lunar = solar.getLunar();

    const yi = lunar.getDayYi();
    const ji = lunar.getDayJi();
    const dayGanZhi = lunar.getDayInGanZhi();
    const monthGanZhi = lunar.getMonthInGanZhi();
    const yearGanZhi = lunar.getYearInGanZhi();

    container.innerHTML = `
      <h3 class="text-[var(--color-gold)] font-bold mb-2">今日黄历</h3>
      <div class="text-sm text-[var(--color-parchment-dark)]/70 mb-2">
        ${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日 · ${yearGanZhi}年${monthGanZhi}月${dayGanZhi}日
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="rounded-lg p-3 border border-green-800/50 bg-green-900/15">
          <div class="font-bold" style="color:#4CAF50">✅ 宜</div>
          <div class="text-sm mt-1" style="color:#81C784">${yi.join('、')}</div>
        </div>
        <div class="rounded-lg p-3 border border-red-900/50 bg-red-900/15">
          <div class="font-bold" style="color:#E53935">❌ 忌</div>
          <div class="text-sm mt-1" style="color:#EF9A9A">${ji.join('、')}</div>
        </div>
      </div>
    `;
  } catch {
    container.innerHTML = `<p class="text-sm text-[var(--color-parchment-dark)]/40 text-center">黄历数据加载失败</p>`;
  }
}

function renderMonthView(year, month) {
  const titleEl = document.getElementById('cal-title');
  const gridEl = document.getElementById('cal-grid');
  const jieqiEl = document.getElementById('cal-jieqi');

  try {
    const solar = Solar.fromYmd(year, month, 1);
    const lunar = solar.getLunar();
    titleEl.innerHTML = `${year}年${month}月 · ${lunar.getYearInGanZhi()}年(${lunar.getYearShengXiao()})`;
  } catch {
    titleEl.innerHTML = `${year}年${month}月`;
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayWeek = new Date(year, month - 1, 1).getDay();
  const weekHeaders = ['日','一','二','三','四','五','六'];

  let gridHTML = '<div class="grid grid-cols-7 gap-1">';

  weekHeaders.forEach(w => {
    gridHTML += `<div class="text-center text-xs py-1" style="color:var(--color-gold);opacity:0.6">${w}</div>`;
  });

  for (let i = 0; i < firstDayWeek; i++) {
    gridHTML += '<div class="p-1"></div>';
  }

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${month}-${day}`;
    const isToday = dateStr === todayStr;

    let lunarText = '';
    try {
      const solar = Solar.fromYmd(year, month, day);
      const lunar = solar.getLunar();
      const lunarDay = lunar.getDay();
      const lunarMonthNum = lunar.getMonth();

      if (lunarDay === 1) {
        const isLeap = lunarMonthNum < 0;
        lunarText = `<div class="text-xs font-bold" style="color:var(--color-gold)">${isLeap ? '闰' : ''}${MONTH_CN[Math.abs(lunarMonthNum)-1]}月</div>`;
      } else {
        lunarText = `<div class="text-xs" style="color:var(--color-parchment-dark);opacity:0.5">${lunarDayInChinese(lunarDay)}</div>`;
      }

      // 节气标注
      const jieqi = lunar.getJieQi();
      if (jieqi) {
        lunarText = `<div class="text-xs font-bold" style="color:var(--color-vermilion)">${jieqi}</div>`;
      }
    } catch {
      lunarText = `<div class="text-xs" style="opacity:0.3">-</div>`;
    }

    const todayBorder = isToday ? 'border-color:var(--color-vermilion);background:rgba(199,62,58,0.1)' : 'border-color:rgba(212,168,67,0.1);background:rgba(22,33,62,0.2)';
    const todayFont = isToday ? 'color:var(--color-vermilion);font-size:1.1rem;font-weight:bold' : 'color:var(--color-parchment);font-size:0.875rem';

    gridHTML += `
      <div class="rounded-lg p-1 text-center border min-h-[40px]" style="${todayBorder};cursor:pointer" data-date="${year}-${month}-${day}">
        <div class="font-bold" style="${todayFont}">${day}</div>
        ${lunarText}
      </div>
    `;
  }

  gridHTML += '</div>';
  gridEl.innerHTML = gridHTML;

  // 点击日期查看黄历
  gridEl.querySelectorAll('[data-date]').forEach(cell => {
    cell.addEventListener('click', () => {
      const dateStr = cell.dataset.date;
      const [y, m, d] = dateStr.split('-').map(Number);

      try {
        const solar = Solar.fromYmd(y, m, d);
        const lunar = solar.getLunar();
        const yi = lunar.getDayYi();
        const ji = lunar.getDayJi();
        const dayGanZhi = lunar.getDayInGanZhi();

        const huangliEl = document.getElementById('cal-huangli');
        huangliEl.innerHTML = `
          <h3 class="font-bold mb-2" style="color:var(--color-gold)">${y}年${m}月${d}日 黄历 · ${dayGanZhi}日</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="rounded-lg p-3 border" style="border-color:rgba(76,175,80,0.3);background:rgba(76,175,80,0.08)">
              <div class="font-bold" style="color:#4CAF50">✅ 宜</div>
              <div class="text-sm mt-1" style="color:#81C784">${yi.length > 0 ? yi.join('、') : '今日无宜事'}</div>
            </div>
            <div class="rounded-lg p-3 border" style="border-color:rgba(229,57,53,0.3);background:rgba(229,57,53,0.08)">
              <div class="font-bold" style="color:#E53935">❌ 忌</div>
              <div class="text-sm mt-1" style="color:#EF9A9A">${ji.length > 0 ? ji.join('、') : '今日无忌事'}</div>
            </div>
          </div>
        `;
      } catch {}
    });
  });

  renderJieqi(year, month, jieqiEl);
}

function renderJieqi(year, month, container) {
  try {
    const jieqiList = [];
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      try {
        const solar = Solar.fromYmd(year, month, day);
        const lunar = solar.getLunar();
        const jq = lunar.getJieQi();
        if (jq) jieqiList.push({ name: jq, day });
      } catch {}
    }

    if (jieqiList.length > 0) {
      container.innerHTML = `
        <h3 class="font-bold mb-2" style="color:var(--color-gold)">本月节气</h3>
        <div class="flex gap-4 justify-center">
          ${jieqiList.map(jq => `
            <div class="text-center">
              <div class="font-bold" style="color:var(--color-vermilion)">${jq.name}</div>
              <div class="text-xs" style="color:var(--color-parchment-dark);opacity:0.6">${month}月${jq.day}日</div>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      container.innerHTML = `
        <h3 class="font-bold mb-2" style="color:var(--color-gold)">本月节气</h3>
        <p class="text-sm text-center" style="opacity:0.4">暂未查询到节气数据</p>
      `;
    }
  } catch {
    container.innerHTML = `<p class="text-sm text-center" style="opacity:0.4">节气数据加载失败</p>`;
  }
}

function lunarDayInChinese(day) {
  const days = ['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
                '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
                '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];
  return days[day - 1] || `${day}`;
}
