// ===== 万年历工具 =====
// 阳历农历互转、节气查询、干支纪年、月历视图

import { Solar, Lunar } from 'lunar-javascript';

const GAN_NAMES = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const ZHI_NAMES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const ANIMAL_NAMES = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
const MONTH_CN = ['正','二','三','四','五','六','七','八','九','十','冬','腊'];

// 节气名称
const JIEQI_NAMES = [
  '小寒','大寒','立春','雨水','惊蛰','春分',
  '清明','谷雨','立夏','小满','芒种','夏至',
  '小暑','大暑','立秋','处暑','白露','秋分',
  '寒露','霜降','立冬','小雪','大雪','冬至'
];

let currentCalYear = new Date().getFullYear();
let currentCalMonth = new Date().getFullYear() * 100 + (new Date().getMonth() + 1);

/**
 * 渲染万年历页面
 */
export function renderCalendar() {
  const container = document.getElementById('calendar-main');

  const nowYear = new Date().getFullYear();
  const nowMonth = new Date().getMonth() + 1;
  currentCalYear = nowYear;
  currentCalMonth = nowYear * 100 + nowMonth;

  container.innerHTML = `
    <div class="fade-in">
      <h2 class="font-brush text-2xl text-gold text-center mb-6 tracking-widest">万年历</h2>

      <!-- 日期转换工具 -->
      <div class="bg-ink-light/40 rounded-xl border border-gold/20 p-5 mb-6 max-w-2xl mx-auto">
        <h3 class="text-gold font-bold mb-3 text-center">日期转换</h3>

        <!-- 阳历 → 农历 -->
        <div class="mb-4">
          <label class="text-sm text-parchment-dark/60 mb-1 block">阳历 → 农历</label>
          <div class="flex gap-2 items-center">
            <input id="conv-year" type="number" value="${nowYear}" min="1900" max="2099"
                   class="w-20 bg-ink border border-gold/30 rounded-lg px-2 py-2 text-parchment text-center focus:border-gold focus:outline-none">
            <span class="text-parchment-dark/40">年</span>
            <input id="conv-month" type="number" value="${nowMonth}" min="1" max="12"
                   class="w-14 bg-ink border border-gold/30 rounded-lg px-2 py-2 text-parchment text-center focus:border-gold focus:outline-none">
            <span class="text-parchment-dark/40">月</span>
            <input id="conv-day" type="number" value="${new Date().getDate()}" min="1" max="31"
                   class="w-14 bg-ink border border-gold/30 rounded-lg px-2 py-2 text-parchment text-center focus:border-gold focus:outline-none">
            <span class="text-parchment-dark/40">日</span>
            <button id="btn-convert" class="bg-gold/20 border border-gold/30 rounded-lg px-3 py-2 text-gold text-sm cursor-pointer hover:bg-gold/30 transition-all">
              转换
            </button>
          </div>
          <div id="conv-result" class="mt-2 text-sm text-parchment-dark/70 min-h-[60px]"></div>
        </div>

        <!-- 农历 → 阳历 -->
        <div>
          <label class="text-sm text-parchment-dark/60 mb-1 block">农历 → 阳历</label>
          <div class="flex gap-2 items-center">
            <input id="lconv-year" type="number" value="${nowYear}" min="1900" max="2099"
                   class="w-20 bg-ink border border-gold/30 rounded-lg px-2 py-2 text-parchment text-center focus:border-gold focus:outline-none">
            <span class="text-parchment-dark/40">年</span>
            <input id="lconv-month" type="number" min="1" max="12" placeholder="月"
                   class="w-14 bg-ink border border-gold/30 rounded-lg px-2 py-2 text-parchment text-center focus:border-gold focus:outline-none">
            <span class="text-parchment-dark/40">月</span>
            <input id="lconv-day" type="number" min="1" max="30" placeholder="日"
                   class="w-14 bg-ink border border-gold/30 rounded-lg px-2 py-2 text-parchment text-center focus:border-gold focus:outline-none">
            <span class="text-parchment-dark/40">日</span>
            <label class="text-xs text-parchment-dark/40 flex items-center gap-1">
              <input id="lconv-leap" type="checkbox" class="accent-gold"> 闰月
            </label>
            <button id="btn-lconvert" class="bg-gold/20 border border-gold/30 rounded-lg px-3 py-2 text-gold text-sm cursor-pointer hover:bg-gold/30 transition-all">
              转换
            </button>
          </div>
          <div id="lconv-result" class="mt-2 text-sm text-parchment-dark/70 min-h-[40px]"></div>
        </div>
      </div>

      <!-- 月历视图 -->
      <div class="max-w-2xl mx-auto">
        <!-- 月份导航 -->
        <div class="flex items-center justify-between mb-4">
          <button id="cal-prev" class="bg-ink border border-gold/30 rounded-lg px-3 py-2 text-gold cursor-pointer hover:bg-ink-light transition-all">
            ◀ 上月
          </button>
          <div id="cal-title" class="font-brush text-xl text-gold"></div>
          <button id="cal-next" class="bg-ink border border-gold/30 rounded-lg px-3 py-2 text-gold cursor-pointer hover:bg-ink-light transition-all">
            下月 ▶
          </button>
        </div>

        <!-- 日历网格 -->
        <div id="cal-grid" class="mb-6"></div>

        <!-- 本月节气 -->
        <div id="cal-jieqi" class="bg-ink-light/30 rounded-xl border border-gold/15 p-4"></div>
      </div>

      <div class="divider"></div>
    </div>
  `;

  renderMonthView(currentCalYear, currentCalMonth % 100);
  bindCalendarEvents();
}

function bindCalendarEvents() {
  // 阳历转农历
  document.getElementById('btn-convert').addEventListener('click', () => {
    const y = parseInt(document.getElementById('conv-year').value);
    const m = parseInt(document.getElementById('conv-month').value);
    const d = parseInt(document.getElementById('conv-day').value);
    const resultEl = document.getElementById('conv-result');

    try {
      const solar = Solar.fromYmd(y, m, d);
      const lunar = solar.getLunar();

      const lunarYearGanZhi = lunar.getYearInGanZhi();
      const lunarMonthGanZhi = lunar.getMonthInGanZhi();
      const lunarDayGanZhi = lunar.getDayInGanZhi();
      const animal = lunar.getYearShengXiao();
      const lunarMonth = lunar.getMonth();
      const lunarDay = lunar.getDay();
      const isLeap = lunar.getMonth() < 0;

      resultEl.innerHTML = `
        <div class="text-gold font-bold">${lunarYearGanZhi}年(${animal}) ${isLeap ? '闰' : ''}${MONTH_CN[Math.abs(lunarMonth)-1]}月${lunarDay}日</div>
        <div class="text-xs mt-1">
          干支: ${lunarYearGanZhi}年 ${lunarMonthGanZhi}月 ${lunarDayGanZhi}日
          · ${lunar.getYearInGanZhi()}属${animal}
          · 星期${solar.getWeek()}
        </div>
      `;
    } catch (e) {
      resultEl.innerHTML = `<span class="text-vermilion">转换失败: ${e.message}</span>`;
    }
  });

  // 农历转阳历
  document.getElementById('btn-lconvert').addEventListener('click', () => {
    const y = parseInt(document.getElementById('lconv-year').value);
    const m = parseInt(document.getElementById('lconv-month').value);
    const d = parseInt(document.getElementById('lconv-day').value);
    const isLeap = document.getElementById('lconv-leap').checked;
    const resultEl = document.getElementById('lconv-result');

    try {
      const lunarYear = Lunar.fromYmd(y, isLeap ? -m : m, d);
      const solar = lunarYear.getSolar();

      resultEl.innerHTML = `
        <div class="text-gold font-bold">阳历: ${solar.getYear()}年${solar.getMonth()}月${solar.getDay()}日</div>
      `;
    } catch (e) {
      resultEl.innerHTML = `<span class="text-vermilion">转换失败: ${e.message}</span>`;
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

function renderMonthView(year, month) {
  const titleEl = document.getElementById('cal-title');
  const gridEl = document.getElementById('cal-grid');
  const jieqiEl = document.getElementById('cal-jieqi');

  // 月份标题（含农历年干支）
  try {
    const solar = Solar.fromYmd(year, month, 1);
    const lunar = solar.getLunar();
    titleEl.innerHTML = `${year}年${month}月 · ${lunar.getYearInGanZhi()}年(${lunar.getYearShengXiao()})`;
  } catch {
    titleEl.innerHTML = `${year}年${month}月`;
  }

  // 获取该月的天数和第一天星期几
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayWeek = new Date(year, month - 1, 1).getDay(); // 0=Sun

  // 星期标题
  const weekHeaders = ['日', '一', '二', '三', '四', '五', '六'];

  // 构建日历网格
  let gridHTML = '<div class="grid grid-cols-7 gap-1">';

  // 星期标题行
  weekHeaders.forEach(w => {
    gridHTML += `<div class="text-center text-xs text-gold/60 py-1">${w}</div>`;
  });

  // 空位填充
  for (let i = 0; i < firstDayWeek; i++) {
    gridHTML += '<div class="p-1"></div>';
  }

  // 日期格子
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${month}-${day}`;
    const isToday = dateStr === todayStr;

    let lunarText = '';
    let lunarMonth = '';
    try {
      const solar = Solar.fromYmd(year, month, day);
      const lunar = solar.getLunar();
      const lunarDay = lunar.getDay();
      const lunarMonthNum = lunar.getMonth();

      // 农历日期文字
      if (lunarDay === 1) {
        // 初一显示月份
        const isLeap = lunarMonthNum < 0;
        lunarMonth = `${isLeap ? '闰' : ''}${MONTH_CN[Math.abs(lunarMonthNum)-1]}月`;
        lunarText = `<div class="text-xs font-bold text-gold">${lunarMonth}</div>`;
      } else {
        lunarText = `<div class="text-xs text-parchment-dark/50">${lunarDayInChinese(lunarDay)}</div>`;
      }

      // 节气标注
      const jieqi = lunar.getJieQi();
      if (jieqi) {
        lunarText = `<div class="text-xs text-vermilion font-bold">${jieqi}</div>`;
      }
    } catch {
      lunarText = `<div class="text-xs text-parchment-dark/30">-</div>`;
    }

    gridHTML += `
      <div class="rounded-lg p-1 text-center border
        ${isToday ? 'border-vermilion bg-vermilion/10' : 'border-gold/10 bg-ink-light/20'}
        hover:border-gold/40 transition-all cursor-default min-h-[40px]">
        <div class="font-bold ${isToday ? 'text-vermilion text-lg' : 'text-parchment text-sm'}">${day}</div>
        ${lunarText}
      </div>
    `;
  }

  gridHTML += '</div>';
  gridEl.innerHTML = gridHTML;

  // 本月节气
  renderJieqi(year, month, jieqiEl);
}

function renderJieqi(year, month, container) {
  try {
    // 该月包含的节气（每月2个节气）
    const jieqiList = [];

    // 遍历该月每一天找节气
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      try {
        const solar = Solar.fromYmd(year, month, day);
        const lunar = solar.getLunar();
        const jq = lunar.getJieQi();
        if (jq) {
          jieqiList.push({ name: jq, day });
        }
      } catch {}
    }

    if (jieqiList.length > 0) {
      container.innerHTML = `
        <h3 class="text-gold font-bold mb-2">本月节气</h3>
        <div class="flex gap-4 justify-center">
          ${jieqiList.map(jq => `
            <div class="text-center">
              <div class="text-vermilion font-bold">${jq.name}</div>
              <div class="text-xs text-parchment-dark/60">${month}月${jq.day}日</div>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      container.innerHTML = `
        <h3 class="text-gold font-bold mb-2">本月节气</h3>
        <p class="text-sm text-parchment-dark/40 text-center">暂未查询到节气数据</p>
      `;
    }
  } catch {
    container.innerHTML = `<p class="text-sm text-parchment-dark/40 text-center">节气数据加载失败</p>`;
  }
}

// 农历日期中文转换
function lunarDayInChinese(day) {
  const days = ['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
                '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
                '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];
  return days[day - 1] || `${day}`;
}
