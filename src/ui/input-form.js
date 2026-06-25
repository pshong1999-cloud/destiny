// ===== 八字排盘输入表单 =====
// 用内联style代替Tailwind class，确保100%可靠

import { Solar, Lunar } from 'lunar-javascript';

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

let selectedHour = null;
let selectedGender = null;
let onCalculateCallback = null;

export function renderInputForm(onCalculate) {
  const container = document.getElementById('bazi-input');
  onCalculateCallback = onCalculate;
  selectedHour = null;
  selectedGender = null;

  const now = new Date();

  container.innerHTML = `
    <div style="max-width:36rem;margin:0 auto">
      <div style="background:rgba(22,33,62,0.5);border-radius:12px;border:1px solid rgba(212,168,67,0.2);padding:1.5rem">
        <h2 style="font-family:var(--font-brush);font-size:1.5rem;color:var(--color-gold);text-align:center;margin-bottom:1.5rem">请输入出生信息</h2>

        <!-- 阳历日期 -->
        <div style="margin-bottom:1.25rem">
          <label style="display:block;font-size:0.875rem;color:var(--color-parchment-dark);opacity:0.6;margin-bottom:0.5rem">阳历出生日期</label>
          <div style="display:flex;gap:0.5rem;align-items:center">
            <select id="input-year" style="flex:1;background:var(--color-ink);border:1px solid rgba(212,168,67,0.3);border-radius:8px;padding:0.5rem 0.75rem;color:var(--color-parchment);font-size:0.9rem;cursor:pointer">
              <option value="">选择年份</option>
              ${yearOptions()}
            </select>
            <span style="color:rgba(245,230,208,0.4)">年</span>
            <select id="input-month" style="width:60px;background:var(--color-ink);border:1px solid rgba(212,168,67,0.3);border-radius:8px;padding:0.5rem;color:var(--color-parchment);font-size:0.9rem;cursor:pointer">
              <option value="">月</option>
              ${monthOptions()}
            </select>
            <span style="color:rgba(245,230,208,0.4)">月</span>
            <select id="input-day" style="width:60px;background:var(--color-ink);border:1px solid rgba(212,168,67,0.3);border-radius:8px;padding:0.5rem;color:var(--color-parchment);font-size:0.9rem;cursor:pointer">
              <option value="">日</option>
              ${dayOptions()}
            </select>
            <span style="color:rgba(245,230,208,0.4)">日</span>
          </div>
          <div id="lunar-preview" style="margin-top:0.5rem;font-size:0.875rem;color:var(--color-parchment-dark);opacity:0.6;min-height:1.25rem"></div>
        </div>

        <!-- 时辰选择 -->
        <div style="margin-bottom:1.25rem">
          <label style="display:block;font-size:0.875rem;color:var(--color-parchment-dark);opacity:0.6;margin-bottom:0.5rem">出生时辰</label>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:0.5rem" id="shichen-grid">
            ${SHICHEN_MAP.map((sc, i) => `
              <button data-index="${i}" style="cursor:pointer;background:var(--color-ink);border:1px solid rgba(212,168,67,0.2);border-radius:8px;padding:0.5rem;color:var(--color-parchment);text-align:center;font-family:inherit;font-size:inherit;opacity:1">
                <span style="font-weight:bold;font-size:1rem">${sc.zhi}</span>
                <span style="font-size:0.75rem;display:block;color:var(--color-parchment-dark);opacity:0.6">${sc.time}</span>
                <span style="font-size:0.75rem;color:var(--color-parchment-dark);opacity:0.4">${sc.icon}</span>
              </button>
            `).join('')}
          </div>
          <div id="shichen-selected" style="margin-top:0.5rem;font-size:0.875rem;color:var(--color-gold);min-height:1.25rem"></div>
        </div>

        <!-- 性别选择 -->
        <div style="margin-bottom:1.5rem">
          <label style="display:block;font-size:0.875rem;color:var(--color-parchment-dark);opacity:0.6;margin-bottom:0.5rem">性别</label>
          <div style="display:flex;gap:0.75rem">
            <button id="gender-male" style="cursor:pointer;flex:1;background:var(--color-ink);border:1px solid rgba(212,168,67,0.2);border-radius:8px;padding:0.75rem;color:var(--color-parchment);text-align:center;font-family:inherit;font-size:inherit;opacity:1">
              <span style="font-size:1.25rem">♂</span> 乾（男）
            </button>
            <button id="gender-female" style="cursor:pointer;flex:1;background:var(--color-ink);border:1px solid rgba(212,168,67,0.2);border-radius:8px;padding:0.75rem;color:var(--color-parchment);text-align:center;font-family:inherit;font-size:inherit;opacity:1">
              <span style="font-size:1.25rem">♀</span> 坤（女）
            </button>
          </div>
        </div>

        <!-- 排盘按钮 -->
        <button id="calculate-btn" style="width:100%;background:var(--color-vermilion);color:var(--color-parchment);font-family:var(--font-brush);font-size:1.25rem;padding:0.75rem;border-radius:8px;border:2px solid rgba(212,168,67,0.4);cursor:pointer;letter-spacing:0.1em;opacity:0.4;pointer-events:none">
          请先选择日期、时辰和性别
        </button>
      </div>
    </div>
  `;

  bindEvents();
}

function yearOptions() {
  let h = '';
  for (let y = 2026; y >= 1940; y--) h += `<option value="${y}">${y}年</option>`;
  return h;
}
function monthOptions() {
  let h = '';
  for (let m = 1; m <= 12; m++) h += `<option value="${m}">${m}月</option>`;
  return h;
}
function dayOptions() {
  let h = '';
  for (let d = 1; d <= 31; d++) h += `<option value="${d}">${d}日</option>`;
  return h;
}

function bindEvents() {
  // 时辰
  const scBtns = document.querySelectorAll('#shichen-grid button');
  scBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      scBtns.forEach(b => { b.style.borderColor = 'rgba(212,168,67,0.2)'; b.style.background = 'var(--color-ink)'; });
      btn.style.borderColor = 'var(--color-gold)';
      btn.style.background = 'var(--color-ink-light)';
      selectedHour = parseInt(btn.dataset.index);
      const sc = SHICHEN_MAP[selectedHour];
      document.getElementById('shichen-selected').textContent = `已选择: ${sc.label}(${sc.time})`;
      updateBtn();
    });
  });

  // 性别
  const gBtns = [document.getElementById('gender-male'), document.getElementById('gender-female')];
  gBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      gBtns.forEach(b => { b.style.borderColor = 'rgba(212,168,67,0.2)'; b.style.background = 'var(--color-ink)'; });
      btn.style.borderColor = 'var(--color-gold)';
      btn.style.background = 'var(--color-ink-light)';
      selectedGender = btn.id === 'gender-male' ? '男' : '女';
      updateBtn();
    });
  });

  // 日期
  const ySel = document.getElementById('input-year');
  const mSel = document.getElementById('input-month');
  const dSel = document.getElementById('input-day');

  [ySel, mSel, dSel].forEach(sel => {
    sel.addEventListener('change', () => {
      updateLunarPreview(ySel, mSel, dSel);
      updateBtn();
    });
  });

  // 排盘按钮点击
  document.getElementById('calculate-btn').addEventListener('click', () => {
    if (selectedHour === null || !selectedGender) return;
    const y = parseInt(ySel.value);
    const m = parseInt(mSel.value);
    const d = parseInt(dSel.value);
    if (!y || !m || !d) return;

    onCalculateCallback({
      year: y, month: m, day: d,
      hourIndex: selectedHour,
      gender: selectedGender
    });
  });
}

function updateBtn() {
  const ySel = document.getElementById('input-year');
  const mSel = document.getElementById('input-month');
  const dSel = document.getElementById('input-day');
  const btn = document.getElementById('calculate-btn');
  const y = ySel.value, m = mSel.value, d = dSel.value;

  if (y && m && d && selectedHour !== null && selectedGender) {
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
    btn.textContent = '开始排盘';
  } else {
    btn.style.opacity = '0.4';
    btn.style.pointerEvents = 'none';
    btn.textContent = '请先选择日期、时辰和性别';
  }
}

function updateLunarPreview(ySel, mSel, dSel) {
  const preview = document.getElementById('lunar-preview');
  const y = parseInt(ySel.value), m = parseInt(mSel.value), d = parseInt(dSel.value);
  if (!y || !m || !d) { preview.textContent = ''; return; }
  try {
    const solar = Solar.fromYmd(y, m, d);
    const lunar = solar.getLunar();
    preview.textContent = `农历: ${lunar.toString()} · ${lunar.getYearInGanZhi()}年(${lunar.getYearShengXiao()})`;
  } catch(e) {
    preview.textContent = '日期异常';
  }
}
