// ===== 历史记录页面渲染 =====

import { loadHistory, deleteHistoryItem, clearHistory } from '../core/export-utils.js';

/**
 * 渲染历史记录页面
 */
export function renderHistory(state) {
  const container = document.getElementById('history-list');
  const history = loadHistory();

  if (history.length === 0) {
    container.innerHTML = `
      <div class="fade-in text-center py-20">
        <div class="text-6xl text-gold/20 mb-4">📜</div>
        <p class="text-parchment-dark/40 font-brush text-xl">尚无排盘记录</p>
        <p class="text-sm text-parchment-dark/30 mt-2">排盘后结果会自动保存在这里</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="fade-in">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-brush text-2xl text-gold tracking-widest">历史记录</h2>
        <button id="btn-clear-history" class="bg-vermilion/20 border border-vermilion/30 rounded-lg px-3 py-2 text-vermilion text-sm cursor-pointer hover:bg-vermilion/30 transition-all">
          清空全部
        </button>
      </div>

      <div class="space-y-3">
        ${history.map(item => `
          <div class="bg-ink-light/30 rounded-xl border border-gold/15 p-4 flex items-center justify-between hover:border-gold/30 transition-all">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs ${item.type === 'bazi' ? 'text-gold' : 'text-vermilion'} bg-${item.type === 'bazi' ? 'gold/15' : 'vermilion/15'} rounded px-2 py-0.5">
                  ${item.type === 'bazi' ? '八字' : '六爻'}
                </span>
                <span class="font-bold text-gold">${item.summary}</span>
              </div>
              <div class="text-xs text-parchment-dark/50 mt-1">${item.time}</div>
            </div>
            <div class="flex gap-2">
              <button class="btn-view-history bg-gold/10 border border-gold/20 rounded-lg px-3 py-1 text-gold text-xs cursor-pointer hover:bg-gold/20 transition-all"
                      data-id="${item.id}" data-type="${item.type}">
                查看
              </button>
              <button class="btn-delete-history bg-vermilion/10 border border-vermilion/20 rounded-lg px-3 py-1 text-vermilion text-xs cursor-pointer hover:bg-vermilion/20 transition-all"
                      data-id="${item.id}">
                删除
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  bindHistoryEvents(state);
}

function bindHistoryEvents(state) {
  // 清空全部
  const clearBtn = document.getElementById('btn-clear-history');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('确定要清空所有历史记录吗？此操作不可恢复。')) {
        clearHistory();
        renderHistory(state);
      }
    });
  }

  // 查看历史记录
  const viewBtns = document.querySelectorAll('.btn-view-history');
  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const type = btn.dataset.type;
      const history = loadHistory();
      const item = history.find(h => h.id === id);

      if (!item) return;

      if (type === 'bazi') {
        // 切换到八字页面并重新渲染结果
        state.baziResult = item.data;
        switchToPage('bazi');

        const resultSection = document.getElementById('bazi-result');
        resultSection.classList.remove('hidden');
        const exportBar = document.getElementById('export-bar');
        exportBar.classList.remove('hidden');

        import('./chart-render.js').then(m => m.renderChart(item.data));
        import('./analysis-render.js').then(m => m.renderAnalysis(item.data));
        import('./dayun-render.js').then(m => m.renderDayun(item.data));
        import('./reading-render.js').then(m => m.renderReading(item.data));
      } else if (type === 'liuyao') {
        // 切换到六爻页面
        state.liuyaoResult = item.data;
        switchToPage('liuyao');

        const resultSection = document.getElementById('liuyao-result');
        resultSection.classList.remove('hidden');

        import('./liuyao-result.js').then(m => m.renderLiuyaoResult(item.data));
      }
    });
  });

  // 删除单条
  const deleteBtns = document.querySelectorAll('.btn-delete-history');
  deleteBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      deleteHistoryItem(id);
      renderHistory(state);
    });
  });
}

// 页面切换辅助（通过导航按钮模拟点击）
function switchToPage(pageName) {
  const navBtn = document.querySelector(`[data-page="${pageName}"]`);
  if (navBtn) navBtn.click();
}
