// ===== 六爻占卜输入表单 =====
// 提供铜钱起卦法和时间起卦法两种方式

import { LiuyaoEngine } from '../core/liuyao-engine.js';

const engine = new LiuyaoEngine();

let selectedMethod = 'coins'; // 默认铜钱法
let coinResults = []; // 铜钱法结果：6组，每组3枚

/**
 * 渲染六爻占卜输入表单
 * @param {Function} onCalculate - 占卜结果回调
 */
export function renderLiuyaoForm(onCalculate) {
  const container = document.getElementById('liuyao-input');

  // 初始化铜钱结果
  coinResults = Array.from({ length: 6 }, () => Array.from({ length: 3 }, () => null));

  container.innerHTML = `
    <div class="max-w-2xl mx-auto">
      <div class="bg-ink-light/50 rounded-xl border border-gold/20 p-6 backdrop-blur-sm">
        <h2 class="font-brush text-2xl text-gold text-center mb-6">六爻占卜</h2>

        <!-- 方法选择 -->
        <div class="flex justify-center gap-3 mb-6">
          <button id="method-coins" class="method-btn bg-ink-light border-2 border-gold rounded-lg px-4 py-2 font-brush text-gold cursor-pointer transition-all">
            🪙 铜钱起卦
          </button>
          <button id="method-time" class="method-btn bg-ink border-2 border-gold/30 rounded-lg px-4 py-2 font-brush text-parchment-dark cursor-pointer transition-all hover:border-gold">
            🕐 时间起卦
          </button>
        </div>

        <!-- 铜钱起卦区 -->
        <div id="coins-area">
          <p class="text-sm text-parchment-dark/70 text-center mb-4">
            模拟铜钱投掷：每爻掷3枚铜钱，<br>
            <span class="text-gold">背面(阳)=1</span>，<span class="text-parchment-dark">字面(阴)=0</span><br>
            三背=老阳(动)，三字=老阴(动)
          </p>

          <!-- 6爻投掷区 -->
          <div class="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4" id="coins-grid">
            ${[0,1,2,3,4,5].map(yaoIdx => `
              <div class="text-center">
                <div class="text-xs text-gold/60 mb-2">${yaoIdx + 1}爻</div>
                <div class="flex gap-1 justify-center mb-2">
                  ${[0,1,2].map(coinIdx => `
                    <button class="coin-btn w-8 h-8 rounded-full border-2 border-gold/30 bg-ink text-parchment-dark/40 text-xs cursor-pointer transition-all hover:border-gold"
                            data-yao="${yaoIdx}" data-coin="${coinIdx}">
                      ?
                    </button>
                  `).join('')}
                </div>
                <div id="yao-result-${yaoIdx}" class="text-xs text-parchment-dark/40 h-5"></div>
              </div>
            `).join('')}
          </div>

          <!-- 快捷操作 -->
          <div class="flex justify-center gap-3 mb-4">
            <button id="btn-random-all" class="bg-vermilion/20 border border-vermilion/30 rounded-lg px-4 py-2 text-vermilion text-sm cursor-pointer transition-all hover:bg-vermilion/30">
              🎲 随机掷卦
            </button>
          </div>
        </div>

        <!-- 时间起卦区（隐藏） -->
        <div id="time-area" style="display:none">
          <p class="text-sm text-parchment-dark/70 text-center mb-4">
            根据当前时间自动起卦，点击下方按钮即可
          </p>
          <div class="flex justify-center gap-3 mb-4">
            <button id="btn-time-gua" class="bg-vermilion/20 border border-vermilion/30 rounded-lg px-6 py-3 text-vermilion font-brush text-lg cursor-pointer transition-all hover:bg-vermilion/30">
              🕐 以当前时间起卦
            </button>
          </div>
        </div>

        <!-- 占卜按钮 -->
        <button id="liuyao-calculate-btn" class="w-full bg-[var(--color-vermilion)] hover:bg-[var(--color-vermilion-dark)] text-[var(--color-parchment)] font-[var(--font-brush)] text-xl py-3 rounded-lg border-2 border-[var(--color-gold)]/40 transition-all hover:border-[var(--color-gold)] cursor-pointer tracking-widest" style="opacity:0.4; pointer-events:none;">
          起卦占卜（请先掷完铜钱或点"随机掷卦"）
        </button>
      </div>
    </div>
  `;

  bindEvents(onCalculate);
}

function bindEvents(onCalculate) {
  // 方法切换
  const methodBtns = document.querySelectorAll('.method-btn');
  methodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const method = btn.id === 'method-coins' ? 'coins' : 'time';
      selectedMethod = method;

      methodBtns.forEach(b => {
        b.classList.remove('bg-ink-light', 'border-gold', 'text-gold');
        b.classList.add('bg-ink', 'border-gold/30', 'text-parchment-dark');
      });
      btn.classList.remove('bg-ink', 'border-gold/30', 'text-parchment-dark');
      btn.classList.add('bg-ink-light', 'border-gold', 'text-gold');

      const coinsArea = document.getElementById('coins-area');
      const timeArea = document.getElementById('time-area');
      if (method === 'coins') {
        coinsArea.style.display = 'block';
        timeArea.style.display = 'none';
      } else {
        coinsArea.style.display = 'none';
        timeArea.style.display = 'block';
      }
    });
  });

  // 铜钱点击
  const coinBtns = document.querySelectorAll('.coin-btn');
  coinBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const yaoIdx = parseInt(btn.dataset.yao);
      const coinIdx = parseInt(btn.dataset.coin);
      const current = coinResults[yaoIdx][coinIdx];

      // 切换：null → 1(背/阳) → 0(字/阴) → null
      if (current === null) {
        coinResults[yaoIdx][coinIdx] = 1;
        btn.textContent = '背';
        btn.classList.remove('border-gold/30', 'text-parchment-dark/40');
        btn.classList.add('border-gold', 'text-gold', 'bg-gold/20');
      } else if (current === 1) {
        coinResults[yaoIdx][coinIdx] = 0;
        btn.textContent = '字';
        btn.classList.remove('border-gold', 'text-gold', 'bg-gold/20');
        btn.classList.add('border-parchment-dark/50', 'text-parchment-dark');
      } else {
        coinResults[yaoIdx][coinIdx] = null;
        btn.textContent = '?';
        btn.classList.remove('border-parchment-dark/50', 'text-parchment-dark');
        btn.classList.add('border-gold/30', 'text-parchment-dark/40');
      }

      updateYaoResult(yaoIdx);
      updateCalcButton();
    });
  });

  // 随机掷卦
  const randomBtn = document.getElementById('btn-random-all');
  randomBtn.addEventListener('click', () => {
    coinResults = Array.from({ length: 6 }, () =>
      Array.from({ length: 3 }, () => Math.random() > 0.5 ? 1 : 0)
    );

    // 更新所有铜钱按钮
    coinBtns.forEach(btn => {
      const yaoIdx = parseInt(btn.dataset.yao);
      const coinIdx = parseInt(btn.dataset.coin);
      const val = coinResults[yaoIdx][coinIdx];

      if (val === 1) {
        btn.textContent = '背';
        btn.classList.remove('border-gold/30', 'text-parchment-dark/40', 'border-parchment-dark/50', 'text-parchment-dark');
        btn.classList.add('border-gold', 'text-gold', 'bg-gold/20');
      } else {
        btn.textContent = '字';
        btn.classList.remove('border-gold/30', 'text-parchment-dark/40', 'border-gold', 'text-gold', 'bg-gold/20');
        btn.classList.add('border-parchment-dark/50', 'text-parchment-dark');
      }
    });

    // 更新爻结果
    for (let i = 0; i < 6; i++) updateYaoResult(i);
    updateCalcButton();
  });

  // 时间起卦按钮
  const timeBtn = document.getElementById('btn-time-gua');
  timeBtn.addEventListener('click', () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hour = now.getHours();
    // 时辰映射
    const hourMap = [23,1,3,5,7,9,11,13,15,17,19,21];
    let hourIdx = 0;
    if (hour === 23 || hour === 0) hourIdx = 0;
    else hourIdx = Math.floor((hour + 1) / 2);

    const result = engine.timeMethod(year, month, day, hourIdx);
    onCalculate({ result });
  });

  // 占卜按钮
  const calcBtn = document.getElementById('liuyao-calculate-btn');
  calcBtn.addEventListener('click', () => {
    if (selectedMethod === 'coins') {
      // 验证所有爻是否已掷完
      const allFilled = coinResults.every(group => group.every(v => v !== null));
      if (!allFilled) {
        alert('请先掷完所有铜钱（6爻×3枚 = 18枚），或点击"随机掷卦"');
        return;
      }
      const result = engine.coinsMethod(coinResults);
      onCalculate({ result });
    }
  });

  function updateYaoResult(yaoIdx) {
    const group = coinResults[yaoIdx];
    const el = document.getElementById(`yao-result-${yaoIdx}`);
    const allSet = group.every(v => v !== null);

    if (!allSet) {
      el.textContent = '未完成';
      el.className = 'text-xs text-parchment-dark/40 h-5';
      return;
    }

    const backs = group.reduce((a, b) => a + b, 0);
    let typeText, typeClass;

    if (backs === 3) {
      typeText = '老阳 ⚊ (动)';
      typeClass = 'text-xs text-vermilion font-bold h-5';
    } else if (backs === 2) {
      typeText = '少阳 ⚊';
      typeClass = 'text-xs wx-fire h-5';
    } else if (backs === 1) {
      typeText = '少阴 ⚋';
      typeClass = 'text-xs wx-water h-5';
    } else {
      typeText = '老阴 ⚋ (动)';
      typeClass = 'text-xs text-blue-300 font-bold h-5';
    }

    el.textContent = typeText;
    el.className = typeClass;
  }

  function updateCalcButton() {
    const btn = document.getElementById('liuyao-calculate-btn');
    if (selectedMethod === 'coins') {
      const allFilled = coinResults.every(group => group.every(v => v !== null));
      if (allFilled) {
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
        btn.textContent = '起卦占卜';
      } else {
        btn.style.opacity = '0.4';
        btn.style.pointerEvents = 'none';
        btn.textContent = '起卦占卜（请先掷完铜钱或点"随机掷卦"）';
      }
    } else {
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
      btn.textContent = '起卦占卜';
    }
  }
}
