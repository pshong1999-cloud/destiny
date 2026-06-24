// ===== 六爻占卜结果渲染 =====

const WX_COLOR_CLASS = {
  '木': 'wx-wood', '火': 'wx-fire', '土': 'wx-earth', '金': 'wx-metal', '水': 'wx-water'
};

const YAO_SYMBOLS = {
  1: '⚊', // 阳爻
  0: '⚋', // 阴爻
};

/**
 * 渲染六爻占卜结果
 * @param {object} result - 六爻引擎输出数据
 */
export function renderLiuyaoResult(result) {
  const chartContainer = document.getElementById('liuyao-chart');
  const readingContainer = document.getElementById('liuyao-reading');

  // ===== 卦象图 =====
  const yaoRows = result.yaoList.map((yao, i) => {
    const symbol = YAO_SYMBOLS[yao.yao];
    const movingSymbol = yao.moving ? (yao.yao === 1 ? '○' : '×') : '';
    const shiYingMark = yao.isShi ? '【世】' : (yao.isYing ? '【应】' : '');
    const yaoWx = getZhiWuxing(yao.naJia.zhi);
    const wxClass = WX_COLOR_CLASS[yaoWx];

    // 变爻符号
    const changedYao = result.changedYaoList[i];
    const changedSymbol = yao.moving ? YAO_SYMBOLS[changedYao.yao] : '';

    return `
      <tr>
        <td class="text-xs text-gold/50">${6 - i}</td>
        <td class="font-bold text-2xl ${wxClass}">${symbol}${movingSymbol ? `<span class="text-vermilion text-sm">${movingSymbol}</span>` : ''}</td>
        <td class="${wxClass}">${yao.naJia.gan}${yao.naJia.zhi}</td>
        <td class="text-sm ${WX_COLOR_CLASS[result.gongWuxing] === wxClass ? 'text-gold' : wxClass}">${yao.liuqin}</td>
        <td class="text-xs ${yao.isShi ? 'text-vermilion font-bold' : (yao.isYing ? 'text-gold font-bold' : 'text-parchment-dark/40')}">${shiYingMark}</td>
        <td class="text-xs text-vermilion">${yao.moving ? `→${changedSymbol}` : ''}</td>
      </tr>
    `;
  }).join('');

  chartContainer.innerHTML = `
    <div class="fade-in">
      <div class="text-center mb-4">
        <h2 class="font-brush text-3xl text-gold tracking-widest">${result.guaName}</h2>
        <p class="text-sm text-parchment-dark/60 mt-1">
          ${result.method} · ${result.innerGua}(${BA_WUXING[result.innerGua]})上${result.outerGua}(${BA_WUXING[result.outerGua]})
          · ${result.guaGong}宫(${result.gongWuxing}) · ${result.timestamp}
        </p>
      </div>

      <!-- 卦象表格 -->
      <div class="overflow-x-auto max-w-lg mx-auto">
        <table class="bazi-table w-full">
          <thead>
            <tr>
              <th class="w-8">爻位</th>
              <th class="w-16">卦象</th>
              <th class="w-16">纳甲</th>
              <th class="w-16">六亲</th>
              <th class="w-16">世应</th>
              <th class="w-16">变爻</th>
            </tr>
          </thead>
          <tbody>
            ${yaoRows}
          </tbody>
        </table>
      </div>

      <!-- 动爻提示 -->
      ${result.movingYao.length > 0 ? `
        <div class="mt-4 text-center">
          <span class="text-xs text-gold/60 mr-2">动爻:</span>
          ${result.movingYao.map(m => `
            <span class="shensha-tag">${6 - m.position}爻 ${m.type}(${m.liuqin} ${m.naJia.gan}${m.naJia.zhi})</span>
          `).join('')}
        </div>
      ` : '<div class="mt-4 text-center text-xs text-parchment-dark/40">无动爻，卦象稳定</div>'}

      <!-- 变卦 -->
      ${result.movingYao.length > 0 ? `
        <div class="mt-3 text-center text-sm">
          <span class="text-parchment-dark/60">变卦:</span>
          <span class="font-brush text-gold">${result.changedGuaName}</span>
        </div>
      ` : ''}
    </div>
  `;

  // ===== 解读文字 =====
  const guaDesc = result.guaDesc;
  const changedDesc = result.changedDesc;

  let readingText = `【本卦】${result.guaName}\n`;
  readingText += `卦辞：${guaDesc.judgment}\n`;
  readingText += `释义：${guaDesc.desc}\n`;
  readingText += `建议：${guaDesc.advice}\n\n`;

  if (result.movingYao.length > 0) {
    readingText += `【动爻分析】\n`;
    result.movingYao.forEach(m => {
      readingText += `${6 - m.position}爻动(${m.type})：${m.liuqin} ${m.naJia.gan}${m.naJia.zhi}\n`;

      // 动爻六亲解读
      const liuqinAdvice = {
        '父母': '动在父母爻：文书、长辈、房屋之事有变动',
        '兄弟': '动在兄弟爻：同辈、朋友、竞争之事有变动',
        '子孙': '动在子孙爻：子女、下属、解脱之事有变动',
        '妻财': '动在妻财爻：财物、妻子、利益之事有变动',
        '官鬼': '动在官鬼爻：官府、上司、疾病之事有变动'
      };
      readingText += `  ${liuqinAdvice[m.liuqin] || '此爻变动，注意相关事项'}\n`;
    });

    readingText += `\n【变卦】${result.changedGuaName}\n`;
    readingText += `释义：${changedDesc.desc}\n`;
    readingText += `建议：${changedDesc.advice}\n`;
  } else {
    readingText += `\n【断卦】\n无动爻，以本卦卦辞为准。`;
  }

  readingContainer.innerHTML = `
    <div class="fade-in">
      <div class="reading-card">
        <h3 class="font-brush text-lg text-gold flex items-center gap-2">
          <span>📜</span> 六爻断卦
        </h3>
        <div class="text-sm text-parchment-dark/80 whitespace-pre-line leading-relaxed">${readingText}</div>
      </div>

      <div class="mt-4 text-center text-xs text-parchment-dark/30 italic">
        六爻占卜为传统文化中的一种占断方法，结果仅供参考娱乐，不作为决策依据。
        占者当以理性思辨为重，不可执迷于卜。
      </div>

      <div class="divider"></div>
    </div>
  `;
}

// BA_WUXING 本地引用（避免循环导入）
const BA_WUXING = {
  '乾': '金', '坤': '土', '震': '木', '巽': '木',
  '坎': '水', '离': '火', '艮': '土', '兑': '金'
};

function getZhiWuxing(zhi) {
  const map = {
    '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
    '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
  };
  return map[zhi] || '土';
}
