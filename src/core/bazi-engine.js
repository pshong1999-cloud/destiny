// ===== 八字排盘核心引擎 =====
// 基于 lunar-javascript 库，封装专业级排盘数据输出

import { Solar, Lunar } from 'lunar-javascript';

// ===== 天干映射表 =====
const GAN_NAMES = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const ZHI_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 天干五行映射（export 供其他模块引用）
export const GAN_WUXING = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
};

// 地支五行映射（export 供其他模块引用）
export const ZHI_WUXING = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
  '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
};

// 天干阴阳映射
const GAN_YINYANG = {
  '甲': '阳', '乙': '阴', '丙': '阳', '丁': '阴', '戊': '阳',
  '己': '阴', '庚': '阳', '辛': '阴', '壬': '阳', '癸': '阴'
};

// 地支藏干映射
const ZHI_CANGGAN = {
  '子': ['癸'],
  '丑': ['己', '癸', '辛'],
  '寅': ['甲', '丙', '戊'],
  '卯': ['乙'],
  '辰': ['戊', '乙', '癸'],
  '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'],
  '未': ['己', '丁', '乙'],
  '申': ['庚', '壬', '戊'],
  '酉': ['辛'],
  '戌': ['戊', '辛', '丁'],
  '亥': ['壬', '甲']
};

// 十神对照表
// 根据日主天干 + 其他天干 → 十神名称
const SHISHEN_TABLE = buildShiShenTable();

function buildShiShenTable() {
  // 五行生克关系:
  // 木→火(生), 火→土(生), 土→金(生), 金→水(生), 水→木(生)
  // 木→土(克), 土→水(克), 水→火(克), 火→金(克), 金→木(克)
  // 同我=比肩/劫财, 我生=食神/伤官, 我克=偏财/正财, 克我=七杀/正官, 生我=偏印/正印

  const wuxingOrder = ['木', '火', '土', '金', '水'];
  const table = {};

  for (let i = 0; i < GAN_NAMES.length; i++) {
    const dayGan = GAN_NAMES[i];
    const dayWx = GAN_WUXING[dayGan];
    const dayYy = GAN_YINYANG[dayGan]; // 日主阴阳

    for (let j = 0; j < GAN_NAMES.length; j++) {
      const otherGan = GAN_NAMES[j];
      const otherWx = GAN_WUXING[otherGan];
      const otherYy = GAN_YINYANG[otherGan]; // 他干阴阳

      const sameYy = dayYy === otherYy;

      if (dayGan === otherGan) {
        table[`${dayGan}_${otherGan}`] = '日主';
        continue;
      }

      // 同五行
      if (dayWx === otherWx) {
        table[`${dayGan}_${otherGan}`] = sameYy ? '比肩' : '劫财';
        continue;
      }

      // 我生（日主五行所生的五行）
      const shengWx = wuxingOrder[(wuxingOrder.indexOf(dayWx) + 1) % 5];
      if (otherWx === shengWx) {
        table[`${dayGan}_${otherGan}`] = sameYy ? '食神' : '伤官';
        continue;
      }

      // 我克（日主五行所克的五行）
      const keWx = wuxingOrder[(wuxingOrder.indexOf(dayWx) + 2) % 5];
      if (otherWx === keWx) {
        table[`${dayGan}_${otherGan}`] = sameYy ? '偏财' : '正财';
        continue;
      }

      // 克我（克制日主五行的五行）
      const keMeWx = wuxingOrder[(wuxingOrder.indexOf(dayWx) - 2 + 5) % 5];
      if (otherWx === keMeWx) {
        table[`${dayGan}_${otherGan}`] = sameYy ? '七杀' : '正官';
        continue;
      }

      // 生我（生助日主五行的五行）
      const shengMeWx = wuxingOrder[(wuxingOrder.indexOf(dayWx) - 1 + 5) % 5];
      if (otherWx === shengMeWx) {
        table[`${dayGan}_${otherGan}`] = sameYy ? '偏印' : '正印';
        continue;
      }
    }
  }
  return table;
}

// ===== 神煞判定表 =====
// 天乙贵人
const TIANYI_GUIREN = {
  '甲': ['丑', '未'], '乙': ['子', '申'], '丙': ['亥', '酉'],
  '丁': ['亥', '酉'], '戊': ['丑', '未'], '己': ['子', '申'],
  '庚': ['丑', '未'], '辛': ['午', '寅'], '壬': ['卯', '巳'],
  '癸': ['卯', '巳']
};

// 驿马
const YIMA = {
  '申': '寅', '子': '寅', '辰': '寅',   // 申子辰马在寅
  '寅': '申', '午': '申', '戌': '申',   // 寅午戌马在申
  '巳': '亥', '酉': '亥', '丑': '亥',   // 巳酉丑马在亥
  '亥': '卯', '卯': '卯', '未': '卯'    // 亥卯未马在卯
};

// 华盖
const HUAGAI = {
  '申': '辰', '子': '辰', '辰': '辰',
  '寅': '戌', '午': '戌', '戌': '戌',
  '巳': '丑', '酉': '丑', '丑': '丑',
  '亥': '未', '卯': '未', '未': '未'
};

// 羊刃（禄的对冲）
const YANGREN = {
  '甲': '卯', '乙': '辰', '丙': '午', '丁': '未',
  '戊': '午', '己': '未', '庚': '酉', '辛': '戌',
  '壬': '子', '癸': '丑'
};

// 禄神
const LUSHEN = {
  '甲': '寅', '乙': '卯', '丙': '巳', '丁': '午',
  '戊': '巳', '己': '午', '庚': '申', '辛': '酉',
  '壬': '亥', '癸': '子'
};

// 文昌贵人
const WENCHANG = {
  '甲': '巳', '乙': '午', '丙': '申', '丁': '酉',
  '戊': '申', '己': '酉', '庚': '亥', '辛': '子',
  '壬': '寅', '癸': '卯'
};

// 纳音表（六十甲子纳音）
const NAYIN_TABLE = buildNayinTable();

function buildNayinTable() {
  // 六十甲子纳音五行表
  const pairs = [
    ['甲子', '乙丑', '海中金'], ['丙寅', '丁卯', '炉中火'], ['戊辰', '己巳', '大林木'],
    ['庚午', '辛未', '路旁土'], ['壬申', '癸酉', '剑锋金'], ['甲戌', '乙亥', '山头火'],
    ['丙子', '丁丑', '涧下水'], ['戊寅', '己卯', '城头土'], ['庚辰', '辛巳', '白蜡金'],
    ['壬午', '癸未', '杨柳木'], ['甲申', '乙酉', '泉中水'], ['丙戌', '丁亥', '屋上土'],
    ['戊子', '己丑', '霹雳火'], ['庚寅', '辛卯', '松柏木'], ['壬辰', '癸巳', '长流水'],
    ['甲午', '乙未', '沙中金'], ['丙申', '丁酉', '山下火'], ['戊戌', '己亥', '平地木'],
    ['庚子', '辛丑', '壁上土'], ['壬寅', '癸卯', '金箔金'], ['甲辰', '乙巳', '覆灯火'],
    ['丙午', '丁未', '天河水'], ['戊申', '己酉', '大驿土'], ['庚戌', '辛亥', '钗钏金'],
    ['壬子', '癸丑', '桑柘木'], ['甲寅', '乙卯', '大溪水'], ['丙辰', '丁巳', '沙中土'],
    ['戊午', '己未', '天上火'], ['庚申', '辛酉', '石榴木'], ['壬戌', '癸亥', '大海水']
  ];

  const table = {};
  pairs.forEach(([p1, p2, nayin]) => {
    table[p1] = nayin;
    table[p2] = nayin;
  });
  return table;
}

// ===== 格局判定 =====
// 格局类型列表
const PATTERN_TYPES = {
  '正官格': { desc: '官星透出，端正守规矩，适合体制、管理类工作', category: '贵格' },
  '七杀格': { desc: '杀星当权，个性刚强果断，适合军警、竞争性行业', category: '威格' },
  '正印格': { desc: '印星护身，聪慧善学习，适合教育、文化类工作', category: '秀格' },
  '偏印格': { desc: '偏印主变，思维独特偏门，适合技术、创意类工作', category: '巧格' },
  '食神格': { desc: '食神吐秀，温和有才华，适合餐饮、艺术类工作', category: '福格' },
  '伤官格': { desc: '伤官见官，叛逆有才，适合自由职业、创新类工作', category: '才格' },
  '偏财格': { desc: '偏财透出，善于交际理财，适合商业、投资类工作', category: '富格' },
  '正财格': { desc: '正财守业，勤劳节俭，适合稳定行业、理财类工作', category: '稳格' }
};

/**
 * 八字排盘引擎
 */
export class BaziEngine {

  /**
   * 计算八字排盘
   * @param {number} year - 阳历年份
   * @param {number} month - 阳历月份
   * @param {number} day - 阳历日期
   * @param {number} hourIndex - 时辰索引 (0=子时, 1=丑时, ... 11=亥时)
   * @param {string} gender - '男' 或 '女'
   * @returns {object} 排盘结果
   */
  calculate(year, month, day, hourIndex, gender) {
    // 将时辰索引转换为小时（取时辰中间值）
    const hour = this.shichenToHour(hourIndex);

    // 创建 Solar 对象
    const solar = Solar.fromYmdHour(year, month, day, hour);
    const lunar = solar.getLunar();

    // 获取八字对象（lunar-javascript 提供的）
    const bazi = lunar.getEightChar();

    // 四柱数据
    const yearGan = bazi.getYearGan();
    const yearZhi = bazi.getYearZhi();
    const monthGan = bazi.getMonthGan();
    const monthZhi = bazi.getMonthZhi();
    const dayGan = bazi.getDayGan();
    const dayZhi = bazi.getDayZhi();
    const hourGan = bazi.getTimeGan();
    const hourZhi = bazi.getTimeZhi();

    // 日主信息
    const dayMaster = {
      gan: dayGan,
      wuxing: GAN_WUXING[dayGan],
      yinyang: GAN_YINYANG[dayGan]
    };

    // 四柱
    const pillars = {
      year: this.buildPillar(yearGan, yearZhi, dayMaster),
      month: this.buildPillar(monthGan, monthZhi, dayMaster),
      day: this.buildPillar(dayGan, dayZhi, dayMaster),
      hour: this.buildPillar(hourGan, hourZhi, dayMaster)
    };

    // 五行计数（含藏干）
    const wuxingCount = this.countWuxing(pillars);

    // 五行缺什么
    const wuxingMissing = Object.entries(wuxingCount)
      .filter(([_, count]) => count === 0)
      .map(([wx]) => wx);

    // 日主强弱判定
    const strength = this.judgeStrength(dayMaster, pillars, monthZhi);

    // 格局判定
    const pattern = this.judgePattern(dayMaster, pillars, monthGan, monthZhi);

    // 用神判定
    const yongShen = this.judgeYongShen(dayMaster, strength, wuxingCount, wuxingMissing, monthZhi);

    // 神煞
    const shenSha = this.findShenSha(pillars, dayMaster);

    // 大运
    const daYun = this.calculateDaYun(bazi, gender);

    // 流年（当前年前后5年）
    const liuNian = this.calculateLiuNian(year);

    // 纳音
    const nayinList = this.getNayin(pillars);

    // 农历信息
    const lunarInfo = {
      dateStr: lunar.toString(),
      yearGanZhi: lunar.getYearInGanZhi() + '年',
      monthGanZhi: lunar.getMonthInGanZhi() + '月',
      dayGanZhi: lunar.getDayInGanZhi() + '日',
      animal: lunar.getYearShengXiao()
    };

    return {
      basic: {
        solarDate: `${year}年${month}月${day}日`,
        lunarInfo,
        gender,
        dayMaster,
        pillars
      },
      hiddenStems: this.extractHiddenStems(pillars, dayMaster),
      shiShen: this.getShiShenLabels(pillars, dayMaster),
      wuxingCount,
      wuxingMissing,
      strength,
      pattern,
      yongShen,
      shenSha,
      daYun,
      liuNian,
      nayin: nayinList
    };
  }

  // 时辰索引 → 大致小时数
  shichenToHour(index) {
    // 子时0→0点(取0), 丑1→2点, 寅2→4点, 卯3→6点...
    const hourMap = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
    return hourMap[index];
  }

  // 构建单柱数据
  buildPillar(gan, zhi, dayMaster) {
    return {
      gan,
      zhi,
      ganWuxing: GAN_WUXING[gan],
      zhiWuxing: ZHI_WUXING[zhi],
      ganYinyang: GAN_YINYANG[gan],
      canggan: ZHI_CANGGAN[zhi],
      shiShen: this.getShiShenForGan(dayMaster.gan, gan),
      nayin: NAYIN_TABLE[gan + zhi] || ''
    };
  }

  // 获取十神名称
  getShiShenForGan(dayGan, otherGan) {
    return SHISHEN_TABLE[`${dayGan}_${otherGan}`] || '未知';
  }

  // 五行计数（含藏干）
  countWuxing(pillars) {
    const count = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };

    for (const key of ['year', 'month', 'day', 'hour']) {
      const p = pillars[key];
      // 天干五行
      count[p.ganWuxing]++;
      // 地支五行
      count[p.zhiWuxing]++;
      // 藏干五行
      p.canggan.forEach(gan => {
        count[GAN_WUXING[gan]]++;
      });
    }

    return count;
  }

  // 日主强弱判定
  judgeStrength(dayMaster, pillars, monthZhi) {
    const dayWx = dayMaster.wuxing;
    const monthWx = ZHI_WUXING[monthZhi];

    let score = 0;
    let reasons = [];

    // 得令（月令是否生助日主）
    const shengWx = this.getShengWx(dayWx);
    const sameWx = dayWx;
    if (monthWx === shengWx) {
      score += 3;
      reasons.push(`月令${monthZhi}(${monthWx})生助日主(${dayWx})，得令`);
    } else if (monthWx === sameWx) {
      score += 2;
      reasons.push(`月令${monthZhi}(${monthWx})同日主(${dayWx})，得令`);
    } else if (monthWx === this.getKeWx(dayWx)) {
      score -= 2;
      reasons.push(`月令${monthZhi}(${monthWx})克制日主(${dayWx})，失令`);
    }

    // 得地（地支是否有日主五行或生助）
    for (const key of ['year', 'month', 'day', 'hour']) {
      const zhiWx = pillars[key].zhiWuxing;
      if (zhiWx === dayWx || zhiWx === shengWx) {
        score += 1;
        reasons.push(`${key}支${pillars[key].zhi}(${zhiWx})有根`);
      }
    }

    // 得助（其他天干是否有比劫或印星）
    for (const key of ['year', 'month', 'hour']) {
      const ganWx = pillars[key].ganWuxing;
      if (ganWx === dayWx) {
        score += 1;
        reasons.push(`${key}干${pillars[key].gan}(${ganWx})比助日主`);
      } else if (ganWx === shengWx) {
        score += 0.5;
        reasons.push(`${key}干${pillars[key].gan}(${ganWx})生助日主`);
      }
    }

    const isStrong = score >= 4;
    return {
      level: isStrong ? '身强' : '身弱',
      score,
      isStrong,
      reasons
    };
  }

  // 格局判定
  judgePattern(dayMaster, pillars, monthGan, monthZhi) {
    // 格局以月令为主，看月支藏干透出哪个天干
    const monthCanggan = ZHI_CANGGAN[monthZhi];
    const dayWx = dayMaster.wuxing;

    // 月干十神
    const monthShiShen = this.getShiShenForGan(dayMaster.gan, monthGan);

    // 找出月支藏干透出的十神
    const monthCangganShiShen = monthCanggan.map(gan =>
      this.getShiShenForGan(dayMaster.gan, gan)
    );

    // 格局判定逻辑：
    // 1. 如果月干十神不是比劫，取月干十神定格局
    // 2. 如果月干是比劫，看藏干透出哪个十神
    const excludePatterns = ['日主', '比肩', '劫财'];

    if (!excludePatterns.includes(monthShiShen)) {
      return {
        type: monthShiShen + '格',
        shiShen: monthShiShen,
        desc: PATTERN_TYPES[monthShiShen + '格']?.desc || `${monthShiShen}当权`
      };
    }

    // 月干是比劫，找藏干透出
    for (const ss of monthCangganShiShen) {
      if (!excludePatterns.includes(ss)) {
        return {
          type: ss + '格',
          shiShen: ss,
          desc: PATTERN_TYPES[ss + '格']?.desc || `${ss}当权`
        };
      }
    }

    return {
      type: '比劫格',
      shiShen: '比肩',
      desc: '比劫当权，身旺需泄耗'
    };
  }

  // 用神判定
  judgeYongShen(dayMaster, strength, wuxingCount, wuxingMissing, monthZhi) {
    const dayWx = dayMaster.wuxing;
    const shengWx = this.getShengWx(dayWx);    // 生我的五行
    const keWx = this.getKeWx(dayWx);          // 我克的五行
    const keMeWx = this.getKeMeWx(dayWx);      // 克我的五行
    const woShengWx = this.getWoShengWx(dayWx); // 我生的五行

    let yongShen, reason;

    if (strength.isStrong) {
      // 身强：需要泄耗克制
      // 优先：食伤泄秀 → 财星耗身 → 官杀克身
      if (wuxingMissing.includes(woShengWx)) {
        yongShen = woShengWx;
        reason = `身强宜泄，${woShengWx}为食伤可泄日主(${dayWx})之旺气`;
      } else if (wuxingMissing.includes(keWx)) {
        yongShen = keWx;
        reason = `身强宜耗，${keWx}为财星可耗日主(${dayWx})之旺气`;
      } else if (wuxingMissing.includes(keMeWx)) {
        yongShen = keMeWx;
        reason = `身强宜克，${keMeWx}为官杀可克日主(${dayWx})之旺气`;
      } else {
        // 不缺，取最弱的作为用神
        yongShen = this.findWeakestWuxing(wuxingCount, [dayWx, shengWx]);
        reason = `身强取${yongShen}泄耗日主旺气`;
      }
    } else {
      // 身弱：需要生助扶
      // 优先：印星生身 → 比劫扶身
      if (wuxingMissing.includes(shengWx)) {
        yongShen = shengWx;
        reason = `身弱宜生，${shengWx}为印星可生助日主(${dayWx})`;
      } else if (wuxingMissing.includes(dayWx)) {
        yongShen = dayWx;
        reason = `身弱宜扶，${dayWx}为比劫可扶助日主`;
      } else {
        yongShen = this.findWeakestWuxing(wuxingCount, [keMeWx, keWx]);
        reason = `身弱取${yongShen}生助日主`;
      }
    }

    // 忌神（与用神对立的五行）
    const jiShen = strength.isStrong ? dayWx : this.getKeWx(dayMaster.wuxing);

    return {
      element: yongShen,
      reason,
      jiShen,
      jiReason: strength.isStrong
        ? `忌${dayWx}(比劫)继续助旺日主`
        : `忌${this.getKeWx(dayWx)}(财星)耗泄日主`
    };
  }

  // 查找最弱五行
  findWeakestWuxing(count, excludeList) {
    let weakest = null;
    let minCount = Infinity;
    for (const [wx, c] of Object.entries(count)) {
      if (excludeList.includes(wx)) continue;
      if (c < minCount) {
        minCount = c;
        weakest = wx;
      }
    }
    return weakest || '土'; // 默认
  }

  // 神煞查找
  findShenSha(pillars, dayMaster) {
    const result = [];
    const allZhi = ['year', 'month', 'day', 'hour'].map(k => pillars[k].zhi);
    const allGan = ['year', 'month', 'day', 'hour'].map(k => pillars[k].gan);

    // 天乙贵人 - 查日干对应的地支
    const tyZhis = TIANYI_GUIREN[dayMaster.gan] || [];
    for (const key of ['year', 'month', 'day', 'hour']) {
      if (tyZhis.includes(pillars[key].zhi)) {
        result.push({ name: '天乙贵人', position: `${key}柱`, effect: '主贵人相助，逢凶化吉，遇难呈祥' });
      }
    }

    // 驿马 - 查年支对应
    const yimaZhi = YIMA[pillars.year.zhi];
    if (yimaZhi) {
      for (const key of ['month', 'day', 'hour']) {
        if (pillars[key].zhi === yimaZhi) {
          result.push({ name: '驿马', position: `${key}柱`, effect: '主奔波变动，利远方求财谋事' });
        }
      }
    }

    // 华盖 - 查年支对应
    const huagaiZhi = HUAGAI[pillars.year.zhi];
    if (huagaiZhi) {
      for (const key of ['month', 'day', 'hour']) {
        if (pillars[key].zhi === huagaiZhi) {
          result.push({ name: '华盖', position: `${key}柱`, effect: '主聪明好学，偏于佛道玄学' });
        }
      }
    }

    // 羊刃 - 查日干对应地支
    const yrZhi = YANGREN[dayMaster.gan];
    if (yrZhi) {
      for (const key of ['year', 'month', 'day', 'hour']) {
        if (pillars[key].zhi === yrZhi) {
          result.push({ name: '羊刃', position: `${key}柱`, effect: '主刚强果断，性急好斗，需防血光' });
        }
      }
    }

    // 禄神 - 查日干对应地支
    const lsZhi = LUSHEN[dayMaster.gan];
    if (lsZhi) {
      for (const key of ['year', 'month', 'day', 'hour']) {
        if (pillars[key].zhi === lsZhi) {
          result.push({ name: '禄神', position: `${key}柱`, effect: '主食禄丰足，福气绵长' });
        }
      }
    }

    // 文昌贵人 - 查日干对应地支
    const wcZhi = WENCHANG[dayMaster.gan];
    if (wcZhi) {
      for (const key of ['year', 'month', 'day', 'hour']) {
        if (pillars[key].zhi === wcZhi) {
          result.push({ name: '文昌贵人', position: `${key}柱`, effect: '主聪明好学，文采出众，利考试升学' });
        }
      }
    }

    // 将星 - 年支三合局的中位地支
    const jiangXing = this.getJiangXing(pillars.year.zhi);
    if (jiangXing) {
      for (const key of ['month', 'day', 'hour']) {
        if (pillars[key].zhi === jiangXing) {
          result.push({ name: '将星', position: `${key}柱`, effect: '主领导才能，有威权' });
        }
      }
    }

    // 桃花 - 年支或日支三合局的下一个地支（子→酉，寅→卯等）
    const taohua = this.getTaohua(pillars.day.zhi);
    if (taohua) {
      for (const key of ['year', 'month', 'hour']) {
        if (pillars[key].zhi === taohua) {
          result.push({ name: '桃花', position: `${key}柱`, effect: '主人缘好，异性缘佳，有艺术才华' });
        }
      }
    }

    return result;
  }

  // 将星（三合局中间地支）
  getJiangXing(yearZhi) {
    const sanHe = {
      '申子辰': '子', '寅午戌': '午', '巳酉丑': '酉', '亥卯未': '卯'
    };
    for (const [key, mid] of Object.entries(sanHe)) {
      if (key.includes(yearZhi)) return mid;
    }
    return null;
  }

  // 桃花（三合局的下一个地支）
  getTaohua(dayZhi) {
    const taohuaMap = {
      '申': '酉', '子': '酉', '辰': '酉',
      '寅': '卯', '午': '卯', '戌': '卯',
      '巳': '午', '酉': '午', '丑': '午',
      '亥': '子', '卯': '子', '未': '子'
    };
    return taohuaMap[dayZhi] || null;
  }

  // 大运计算
  calculateDaYun(bazi, gender) {
    const daYunList = [];
    // lunar-javascript 提供了大运计算
    const yunList = bazi.getDaYun(gender === '男' ? 1 : -1, 8);

    for (const yun of yunList) {
      const startAge = yun.getStartAge();
      const gan = yun.getStartGanZhi().getGan();
      const zhi = yun.getStartGanZhi().getZhi();

      daYunList.push({
        startAge,
        gan,
        zhi,
        ganWuxing: GAN_WUXING[gan],
        zhiWuxing: ZHI_WUXING[zhi],
        nayin: NAYIN_TABLE[gan + zhi] || '',
        canggan: ZHI_CANGGAN[zhi]
      });
    }

    return daYunList;
  }

  // 流年计算（当前年前后5年）
  calculateLiuNian(currentYear) {
    const liuNianList = [];
    const startYear = currentYear - 5;
    const endYear = currentYear + 5;

    for (let y = startYear; y <= endYear; y++) {
      try {
        const solar = Solar.fromYmd(y, 1, 1);
        const lunar = solar.getLunar();
        const yearGan = lunar.getYearGan();
        const yearZhi = lunar.getYearZhi();
        const yearGanZhi = yearGan + yearZhi;

        liuNianList.push({
          year: y,
          gan: yearGan,
          zhi: yearZhi,
          ganZhi: yearGanZhi,
          ganWuxing: GAN_WUXING[yearGan],
          zhiWuxing: ZHI_WUXING[yearZhi],
          animal: lunar.getYearShengXiao(),
          isCurrent: y === currentYear
        });
      } catch (e) {
        // skip invalid years
      }
    }

    return liuNianList;
  }

  // 纳音
  getNayin(pillars) {
    return ['year', 'month', 'day', 'hour'].map(key => {
      const p = pillars[key];
      return {
        pillar: key,
        ganZhi: p.gan + p.zhi,
        nayin: NAYIN_TABLE[p.gan + p.zhi] || '未知'
      };
    });
  }

  // 提取藏干信息
  extractHiddenStems(pillars, dayMaster) {
    const result = {};
    for (const key of ['year', 'month', 'day', 'hour']) {
      result[key] = pillars[key].canggan.map(gan => ({
        gan,
        wuxing: GAN_WUXING[gan],
        shiShen: this.getShiShenForGan(dayMaster.gan, gan)
      }));
    }
    return result;
  }

  // 十神标注
  getShiShenLabels(pillars, dayMaster) {
    const result = {};
    for (const key of ['year', 'month', 'day', 'hour']) {
      result[key] = {
        ganShiShen: this.getShiShenForGan(dayMaster.gan, pillars[key].gan),
        cangganShiShen: pillars[key].canggan.map(gan =>
          this.getShiShenForGan(dayMaster.gan, gan)
        )
      };
    }
    return result;
  }

  // ===== 五行关系辅助函数 =====

  // 我生的五行（泄）
  getWoShengWx(wx) {
    const map = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
    return map[wx];
  }

  // 生我的五行（印）
  getShengWx(wx) {
    const map = { '木': '水', '火': '木', '土': '火', '金': '土', '水': '金' };
    return map[wx];
  }

  // 我克的五行（财）
  getKeWx(wx) {
    const map = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };
    return map[wx];
  }

  // 克我的五行（官杀）
  getKeMeWx(wx) {
    const map = { '木': '金', '火': '水', '土': '木', '金': '火', '水': '土' };
    return map[wx];
  }
}
