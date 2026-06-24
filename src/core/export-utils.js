// ===== 分享导出与历史记录 =====
// html2canvas导出图片、文字复制、localStorage历史记录

import html2canvas from 'html2canvas';

const HISTORY_KEY = 'destiny_history';
const MAX_HISTORY = 20;

/**
 * 导出排盘结果为图片
 */
export async function exportAsImage(baziResult) {
  try {
    // 找到要截图的区域
    const captureArea = document.getElementById('bazi-result');
    if (!captureArea) {
      alert('没有可导出的内容');
      return;
    }

    // 使用 html2canvas
    const canvas = await html2canvas(captureArea, {
      backgroundColor: '#1A1A2E',
      scale: 2,
      useCORS: true,
      logging: false
    });

    // 转为图片并下载
    const link = document.createElement('a');
    link.download = `八字排盘_${baziResult.basic.solarDate}_${baziResult.basic.gender}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('导出图片失败:', error);
    alert('导出图片失败，请尝试使用浏览器截图功能。\n错误: ' + error.message);
  }
}

/**
 * 导出排盘结果为纯文字（复制到剪贴板）
 */
export function exportAsText(baziResult) {
  try {
    const text = generateTextOutput(baziResult);

    navigator.clipboard.writeText(text).then(() => {
      alert('排盘文字已复制到剪贴板！\n可直接粘贴到微信、QQ等聊天中分享。');
    }).catch(() => {
      // 降级方案
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('排盘文字已复制到剪贴板！');
    });
  } catch (error) {
    alert('复制失败: ' + error.message);
  }
}

// 生成纯文字输出
function generateTextOutput(baziResult) {
  const { basic, shiShen, hiddenStems, nayin, shenSha, wuxingCount, wuxingMissing, strength, pattern, yongShen, daYun } = baziResult;
  const { solarDate, lunarInfo, gender, dayMaster, pillars } = basic;

  let text = '';
  text += `===== 八字命盘 =====\n`;
  text += `阳历: ${solarDate} · ${lunarInfo.yearGanZhi}${lunarInfo.animal}年\n`;
  text += `性别: ${gender === '男' ? '乾造' : '坤造'}\n\n`;

  text += `四柱:\n`;
  for (const key of ['year', 'month', 'day', 'hour']) {
    const p = pillars[key];
    text += `${key === 'year' ? '年' : key === 'month' ? '月' : key === 'day' ? '日' : '时'}柱: ${p.gan}${p.zhi}(${p.ganWuxing}${p.zhiWuxing}) ${shiShen[key].ganShiShen} 纳音:${nayin.find(n=>n.pillar===key)?.nayin||''}\n`;
  }

  text += `\n五行: `;
  for (const [wx, count] of Object.entries(wuxingCount)) {
    text += `${wx}${count} `;
  }
  if (wuxingMissing.length > 0) text += `缺:${wuxingMissing.join('')}`;
  text += `\n`;

  text += `日主: ${dayMaster.gan}${dayMaster.wuxing}(${dayMaster.yinyang}) ${strength.level}\n`;
  text += `格局: ${pattern.type}\n`;
  text += `用神: ${yongShen.element} | 忌神: ${yongShen.jiShen}\n`;

  if (shenSha.length > 0) {
    text += `神煞: ${shenSha.map(ss => `${ss.name}(${ss.position})`).join('、')}\n`;
  }

  text += `\n===== 天机排盘 =====`;

  return text;
}

/**
 * 保存到历史记录
 */
export function saveToHistory(type, data) {
  try {
    const history = loadHistory();
    const record = {
      id: Date.now(),
      type,  // 'bazi' 或 'liuyao'
      time: new Date().toLocaleString('zh-CN'),
      summary: type === 'bazi'
        ? `八字 · ${data.basic.solarDate} · ${data.basic.gender === '男' ? '乾造' : '坤造'} · ${data.basic.dayMaster.gan}${data.basic.dayMaster.wuxing}`
        : `六爻 · ${data.guaName} · ${data.method}`,
      data
    };

    history.unshift(record);

    // 限制数量
    if (history.length > MAX_HISTORY) {
      history.splice(MAX_HISTORY);
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.warn('保存历史失败:', error);
  }
}

/**
 * 加载历史记录
 */
export function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * 清除历史记录
 */
export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

/**
 * 删除单条历史记录
 */
export function deleteHistoryItem(id) {
  const history = loadHistory();
  const filtered = history.filter(item => item.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
}
