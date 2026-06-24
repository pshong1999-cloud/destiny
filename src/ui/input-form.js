// ===== 输入表单组件 =====
// 提供阳历日期、时辰、性别选择，并实时预览农历日期

import { Solar, Lunar } from 'lunar-javascript';

// 时辰对照表：地支名 + 对应时间段
const SHICHEN_MAP = [
  { zhi: '子', label: '子时', time: '23:00-01:00', icon: '鼠' },
  { zhi: '丑', label: '丑时', time: '01:00-03:00', icon: '牛' },
  { zhi: '寅', label: '寅时', time: '03:00-05:00', icon: '虎' },
  { zhi: '卯', label: '卯时', time: '05:00-07:00', icon: '兔' },
  { zhi: '辰', label: '辰时', time: '07:00-09:00', icon: '龙' },
  { zhi: '巳', label: '巳时', time: '09:00-11:00', icon: '蛇' },
  { zhi: '午', label: '午时', time: '11:00-13:00', icon: '马' },
  { zhi: '未', label: '未时', time: '13:00-15:00', icon: '羊' },
  { zhi: '申', label: '申时', time: '15:00-17:00', icon: '猴' },
  { zhi: '酉', label: '酉时', time: '17:00-19:00', icon: '鸡' },
  { zhi: '戌', label: '戌时', time: '19:00-21:00', icon: '狗' },
  { zhi: '亥', label: '亥时', time: '21:00-23:00', icon: '猪' }
];

/**
 * 渲染输入表单到页面
 * @param {Function} onCalculate - 排盘计算回调
 */
export function renderInputForm(onCalculate) {
  const container = document.getElementById('bazi-input');

  container.innerHTML = `
    <div class="max-w-2xl mx-auto">
      <div class="bg-ink-light/50 rounded-xl border border-gold/20 p-6 backdrop-blur-sm">
        <h2 class="font-brush text-2xl text-gold text-center mb-6">请输入出生信息</h2>

        <!-- 阳历日期选择 -->
        <div class="mb-5">
          <label class="block text-parchment-dark mb-2 text-sm">阳历出生日期</label>
          <div class="flex gap-3 items-center">
            <select id="input-year" class="flex-1 bg-ink border border-gold/30 rounded-lg px-3 py-2.5 text-parchment focus:border-gold focus:outline-none transition-colors">
              <option value="">选择年份</option>
              ${generateYearOptions()}
            </select>
            <select id="input-month" class="w-24 bg-ink border border-gold/30 rounded-lg px-3 py-2.5 text-parchment focus:border-gold focus:outline-none transition-colors">
              <option value="">月</option>
              ${generateMonthOptions()}
            </select>
            <select id="input-day" class="w-24 bg-ink border border-gold/30 rounded-lg px-3 py-2.5 text-parchment focus:border-gold focus:outline-none transition-colors">
              <option value="">日</option>
              ${generateDayOptions()}
            </select>
          </div>
          <!-- 农历预览 -->
          <div id="lunar-preview" class="mt-2 text-sm text-parchment-dark/60 h-5"></div>
        </div>

        <!-- 时辰选择 -->
        <div class="mb-5">
          <label class="block text-parchment-dark mb-2 text-sm">出生时辰</label>
          <div class="grid grid-cols-4 gap-2" id="shichen-grid">
            ${SHICHEN_MAP.map((sc, i) => `
              <button
                data-index="${i}"
                class="shichen-btn bg-ink border border-gold/20 rounded-lg px-2 py-2 text-parchment hover:border-gold hover:bg-ink-light transition-all text-center cursor-pointer"
              >
                <span class="font-bold text-base">${sc.zhi}</span>
                <span class="text-xs text-parchment-dark/60 block">${sc.time}</span>
                <span class="text-xs text-parchment-dark/40">${sc.icon}</span>
              </button>
            `).join('')}
          </div>
          <div id="shichen-selected" class="mt-2 text-sm text-gold h-5"></div>
        </div>

        <!-- 性别选择 -->
        <div class="mb-6">
          <label class="block text-parchment-dark mb-2 text-sm">性别</label>
          <div class="flex gap-3">
            <button id="gender-male" class="gender-btn flex-1 bg-ink border border-gold/20 rounded-lg px-4 py-3 text-parchment hover:border-gold transition-all text-center cursor-pointer">
              <span class="text-xl">♂</span> 乾（男）
            </button>
            <button id="gender-female" class="gender-btn flex-1 bg-ink border border-gold/20 rounded-lg px-4 py-3 text-parchment hover:border-gold transition-all text-center cursor-pointer">
              <span class="text-xl">♀</span> 坤（女）
            </button>
          </div>
        </div>

        <!-- 排盘按钮 -->
        <button id="calculate-btn" class="w-full bg-vermilion hover:bg-vermilion-dark text-parchment font-brush text-xl py-3 rounded-lg border-2 border-gold/40 transition-all hover:border-gold cursor-pointer tracking-widest disabled:opacity-40 disabled:cursor-not-allowed" disabled>
          开始排盘
        </button>
      </div>
    </div>
  `;

  // 绑定事件
  bindEvents(onCalculate);
}

// 生成年份选项（1940-2026）
function generateYearOptions() {
  let html = '';
  for (let y = 2026; y >= 1940; y--) {
    html += `<option value="${y}">${y}年</option>`;
  }
  return html;
}

// 生成月份选项
function generateMonthOptions() {
  let html = '';
  for (let m = 1; m <= 12; m++) {
    html += `<option value="${m}">${m}月</option>`;
  }
  return html;
}

// 生成日期选项
function generateDayOptions() {
  let html = '';
  for (let d = 1; d <= 31; d++) {
    html += `<option value="${d}">${d}日</option>`;
  }
  return html;
}

// 绑定所有交互事件
function bindEvents(onCalculate) {
  let selectedHour = null;
  let selectedGender = null;

  // 时辰选择
  const shichenBtns = document.querySelectorAll('.shichen-btn');
  shichenBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // 移除其他选中状态
      shichenBtns.forEach(b => {
        b.classList.remove('border-gold', 'bg-ink-light');
        b.classList.add('border-gold/20');
      });
      // 标记选中
      btn.classList.remove('border-gold/20');
      btn.classList.add('border-gold', 'bg-ink-light');
      selectedHour = parseInt(btn.dataset.index);

      const sc = SHICHEN_MAP[selectedHour];
      document.getElementById('shichen-selected').textContent =
        `已选择: ${sc.label}(${sc.time}) - ${sc.icon}年`;
      updateButtonState();
    });
  });

  // 性别选择
  const genderBtns = document.querySelectorAll('.gender-btn');
  genderBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      genderBtns.forEach(b => {
        b.classList.remove('border-gold', 'bg-ink-light');
        b.classList.add('border-gold/20');
      });
      btn.classList.remove('border-gold/20');
      btn.classList.add('border-gold', 'bg-ink-light');
      selectedGender = btn.id === 'gender-male' ? '男' : '女';
      updateButtonState();
    });
  });

  // 日期选择 - 实时更新农历预览
  const yearSel = document.getElementById('input-year');
  const monthSel = document.getElementById('input-month');
  const daySel = document.getElementById('input-day');

  [yearSel, monthSel, daySel].forEach(sel => {
    sel.addEventListener('change', () => {
      updateLunarPreview(yearSel, monthSel, daySel);
      updateButtonState();
    });
  });

  // 排盘按钮
  const calcBtn = document.getElementById('calculate-btn');
  calcBtn.addEventListener('click', () => {
    if (!selectedHour || !selectedGender) return;

    const year = parseInt(yearSel.value);
    const month = parseInt(monthSel.value);
    const day = parseInt(daySel.value);

    onCalculate({
      year,
      month,
      day,
      hourIndex: selectedHour,
      gender: selectedGender
    });
  });

  // 更新按钮启用状态
  function updateButtonState() {
    const year = yearSel.value;
    const month = monthSel.value;
    const day = daySel.value;
    const btn = document.getElementById('calculate-btn');

    if (year && month && day && selectedHour !== null && selectedGender) {
      btn.disabled = false;
    } else {
      btn.disabled = true;
    }
  }
}

// 更新农历日期预览
function updateLunarPreview(yearSel, monthSel, daySel) {
  const preview = document.getElementById('lunar-preview');
  const y = parseInt(yearSel.value);
  const m = parseInt(monthSel.value);
  const d = parseInt(daySel.value);

  if (!y || !m || !d) {
    preview.textContent = '';
    return;
  }

  try {
    const solar = Solar.fromYmd(y, m, d);
    const lunar = solar.getLunar();
    preview.textContent = `对应农历: ${lunar.toString()} · ${lunar.getYearInGanZhi()}年`;
  } catch (e) {
    preview.textContent = '日期转换异常，请检查';
  }
}
