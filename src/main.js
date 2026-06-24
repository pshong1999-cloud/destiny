// ===== 天机排盘 - 应用入口 =====
import './style.css';
import { renderInputForm } from './ui/input-form.js';
import { BaziEngine } from './core/bazi-engine.js';
import { renderChart } from './ui/chart-render.js';
import { renderAnalysis } from './ui/analysis-render.js';
import { renderDayun } from './ui/dayun-render.js';
import { renderReading } from './ui/reading-render.js';
import { renderLiuyaoForm } from './ui/liuyao-form.js';
import { renderLiuyaoResult } from './ui/liuyao-result.js';
import { renderCalendar } from './ui/calendar-render.js';
import { renderHistory } from './ui/history-render.js';
import { exportAsImage, exportAsText, saveToHistory, loadHistory } from './core/export-utils.js';

// 全局状态
const state = {
  currentPage: 'bazi',
  baziResult: null,
  liuyaoResult: null,
  engine: new BaziEngine(),
};

// 页面切换
function switchPage(pageName) {
  state.currentPage = pageName;

  // 隐藏所有页面
  document.querySelectorAll('.page-section').forEach(s => s.classList.add('hidden'));

  // 显示目标页面
  const target = document.getElementById(`page-${pageName}`);
  if (target) target.classList.remove('hidden');

  // 更新导航按钮样式
  document.querySelectorAll('.nav-btn').forEach(btn => {
    if (btn.dataset.page === pageName) {
      btn.classList.remove('bg-ink', 'border-gold/30', 'text-parchment-dark');
      btn.classList.add('bg-ink-light', 'border-gold', 'text-gold');
    } else {
      btn.classList.remove('bg-ink-light', 'border-gold', 'text-gold');
      btn.classList.add('bg-ink', 'border-gold/30', 'text-parchment-dark');
    }
  });

  // 渲染对应页面
  if (pageName === 'calendar') renderCalendar();
  if (pageName === 'history') renderHistory(state);
}

// 八字排盘回调
function onBaziCalculate(params) {
  const { year, month, day, hourIndex, gender } = params;
  try {
    state.baziResult = state.engine.calculate(year, month, day, hourIndex, gender);

    const resultSection = document.getElementById('bazi-result');
    resultSection.classList.remove('hidden');
    resultSection.classList.add('fade-in');

    const exportBar = document.getElementById('export-bar');
    exportBar.classList.remove('hidden');

    renderChart(state.baziResult);
    renderAnalysis(state.baziResult);
    renderDayun(state.baziResult);
    renderReading(state.baziResult);

    // 保存到历史
    saveToHistory('bazi', state.baziResult);
  } catch (error) {
    console.error('排盘出错:', error);
    alert('排盘计算出现错误，请检查输入。\n' + error.message);
  }
}

// 六爻占卜回调
function onLiuyaoCalculate(params) {
  try {
    state.liuyaoResult = params.result;
    const resultSection = document.getElementById('liuyao-result');
    resultSection.classList.remove('hidden');
    resultSection.classList.add('fade-in');

    renderLiuyaoResult(state.liuyaoResult);

    // 保存到历史
    saveToHistory('liuyao', state.liuyaoResult);
  } catch (error) {
    console.error('六爻计算出错:', error);
    alert('六爻占卜出现错误。\n' + error.message);
  }
}

// 导出按钮绑定
function bindExportButtons() {
  const imgBtn = document.getElementById('btn-export-img');
  const textBtn = document.getElementById('btn-export-text');

  if (imgBtn) {
    imgBtn.addEventListener('click', async () => {
      await exportAsImage(state.baziResult);
    });
  }
  if (textBtn) {
    textBtn.addEventListener('click', () => {
      exportAsText(state.baziResult);
    });
  }
}

// 初始化应用
function initApp() {
  // 渲染八字输入表单
  renderInputForm(onBaziCalculate);

  // 渲染六爻输入表单
  renderLiuyaoForm(onLiuyaoCalculate);

  // 导航按钮事件
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchPage(btn.dataset.page));
  });

  // 导出按钮
  bindExportButtons();
}

initApp();
