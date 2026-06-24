// ===== 命理解读引擎 =====
// 根据排盘数据生成5维度的命理解读文字

// ===== 日主五行性格描述 =====
const DAYMASTER_PERSONALITY = {
  '木': {
    nature: '仁',
    traits: '仁慈正直，心地善良，有进取心和向上生长的力量。木之人如树木般坚韧挺拔，但也容易固执己见，不愿弯腰。',
    strength: '木旺之人个性刚直，行动力强，但可能过于倔强、不易妥协。',
    weakness: '木弱之人容易犹豫不决，缺乏主见，做事难以坚持到底。',
    direction: '东方',
    color: '绿色',
    season: '春季'
  },
  '火': {
    nature: '礼',
    traits: '热情开朗，彬彬有礼，光明正大。火之人如烈焰般激情四射，但也可能急躁冲动，情绪起伏大。',
    strength: '火旺之人热情大方，感染力强，但可能过于急躁、缺乏耐心。',
    weakness: '火弱之人容易消极冷淡，缺乏自信，做事畏首畏尾。',
    direction: '南方',
    color: '红色',
    season: '夏季'
  },
  '土': {
    nature: '信',
    traits: '忠厚诚信，稳重踏实，包容万象。土之人如大地般宽厚可靠，但也可能过于保守、缺乏变通。',
    strength: '土旺之人踏实可靠，信誉良好，但可能过于固执、不善变通。',
    weakness: '土弱之人容易缺乏定力，信用不足，做事难以坚持。',
    direction: '中央',
    color: '黄色',
    season: '长夏'
  },
  '金': {
    nature: '义',
    traits: '刚毅果断，义薄云天，是非分明。金之人如利刃般锐利果敢，但也可能过于严苛、不懂柔情。',
    strength: '金旺之人果断干脆，执行力强，但可能过于强硬、缺乏柔和。',
    weakness: '金弱之人容易优柔寡断，缺乏魄力，做事拖泥带水。',
    direction: '西方',
    color: '白色',
    season: '秋季'
  },
  '水': {
    nature: '智',
    traits: '聪慧灵活，深谋远虑，善于应变。水之人如江河般通达流转，但也可能过于圆滑、缺乏定性。',
    strength: '水旺之人聪明灵活，适应力强，但可能过于多变、不够坚定。',
    weakness: '水弱之人容易思维僵化，不善应变，缺乏智慧。',
    direction: '北方',
    color: '蓝色/黑色',
    season: '冬季'
  }
};

// ===== 十神与事业方向 =====
const SHISHEN_CAREER = {
  '比肩': '适合自主创业、合伙经营、竞争性行业。比肩主同辈助力，利团队协作。',
  '劫财': '适合投机性、竞争性强的事业。劫财主争夺，利抢夺市场份额，但需防破财。',
  '食神': '适合餐饮、教育、艺术、服务类行业。食神主才华展现，利温和创造型工作。',
  '伤官': '适合自由职业、技术创新、艺术创作类。伤官主叛逆创新，利打破常规的工作。',
  '偏财': '适合商业贸易、投资理财、社交型行业。偏财主灵活理财，利经营和投资。',
  '正财': '适合稳定行业、金融理财、行政管理。正财主勤勉守财，利稳步积累。',
  '七杀': '适合军警、执法、管理、高压行业。七杀主权威果断，利需要魄力的工作。',
  '正官': '适合政府、体制内、管理、正规行业。正官主守规矩，利有规章制度的组织。',
  '偏印': '适合技术研发、学术研究、玄学宗教。偏印主偏门独到，利非主流专业。',
  '正印': '适合教育、文化、行政、辅佐类。正印主学问庇护，利有文凭门槛的工作。'
};

// ===== 十神与婚姻感情 =====
const SHISHEN_MARRIAGE = {
  '男命': {
    '正财': '正财为妻星，婚姻稳定，妻子贤惠持家，感情和睦。',
    '偏财': '偏财为偏妻，异性缘好，但感情可能不够稳定，需防外遇。',
    '无财星': '命局无财星，婚姻缘薄，需主动出击才能找到伴侣。',
    '财多': '财星过多，异性缘旺但感情复杂，需专注方能安稳。',
    '财被克': '财星被比劫克制，婚姻易有波折，需防第三者介入。'
  },
  '女命': {
    '正官': '正官为夫星，丈夫端正可靠，婚姻稳定，夫唱妇随。',
    '七杀': '七杀为偏夫，丈夫个性强势，婚姻有压力但也可成大器。',
    '无官杀': '命局无官杀，婚姻缘薄，需积极寻觅才能找到伴侣。',
    '官杀多': '官杀混杂，异性缘多但感情困扰，需明辨选择。',
    '官被克': '官星被伤官克制，婚姻易有矛盾，需包容沟通。'
  }
};

// ===== 五行与健康 =====
const WX_HEALTH = {
  '木': { organs: '肝、胆', symptoms: '肝气不舒则易怒、头痛、眼疾；木太过则肝火上炎', advice: '注意疏肝理气，少饮酒，保持心情舒畅' },
  '火': { organs: '心、小肠', symptoms: '心火旺则失眠、心悸、口舌生疮；火不足则畏寒、心弱', advice: '注意养心安神，避免过度激动，适当运动' },
  '土': { organs: '脾、胃', symptoms: '脾土虚弱则消化不良、面色萎黄；土太过则湿热困脾', advice: '注意饮食规律，忌暴饮暴食，温养脾胃' },
  '金': { organs: '肺、大肠', symptoms: '金弱则呼吸系统弱、皮肤干燥；金太过则咳嗽、便秘', advice: '注意呼吸系统保养，防感冒，适当润肺' },
  '水': { organs: '肾、膀胱', symptoms: '水弱则肾气不足、腰膝酸软；水太过则寒湿困体', advice: '注意保暖，适度运动强肾，避免熬夜' }
};

/**
 * 生成命理解读
 * @param {object} baziResult - 排盘引擎输出数据
 * @returns {object} 5个维度的解读
 */
export function generateReading(baziResult) {
  const { basic, shiShen, wuxingCount, wuxingMissing, strength, pattern, yongShen, shenSha } = baziResult;
  const { dayMaster, pillars, gender } = basic;

  return {
    personality: generatePersonality(dayMaster, strength, pattern, wuxingMissing, yongShen),
    career: generateCareer(dayMaster, shiShen, pattern, strength, pillars, yongShen),
    marriage: generateMarriage(dayMaster, shiShen, gender, pillars, wuxingMissing, yongShen),
    health: generateHealth(wuxingCount, wuxingMissing, dayMaster, yongShen),
    social: generateSocial(dayMaster, shiShen, shenSha, strength, yongShen)
  };
}

// ===== 性格解读 =====
function generatePersonality(dayMaster, strength, pattern, wuxingMissing, yongShen) {
  const wxInfo = DAYMASTER_PERSONALITY[dayMaster.wuxing];
  let text = '';

  text += `您属${dayMaster.gan}${dayMaster.wuxing}日主，${dayMaster.yinyang}${dayMaster.wuxing}之人。\n\n`;
  text += `【核心特质】\n`;
  text += `${dayMaster.wuxing}主"${wxInfo.nature}"——${wxInfo.traits}\n\n`;

  if (strength.isStrong) {
    text += `【身强表现】\n${wxInfo.strength}\n\n`;
    text += `日主得令得助，个性较为强势自主，做事有魄力。但需注意不可过于刚愎自用，学会柔中有刚。`;
  } else {
    text += `【身弱表现】\n${wxInfo.weakness}\n\n`;
    text += `日主力量不足，个性较为温和随顺，但需培养自主性和决断力，不可一味退让。`;
  }

  text += `\n\n【格局影响】\n`;
  text += `您的格局为"${pattern.type}"，${pattern.desc}。`;

  if (wuxingMissing.length > 0) {
    text += `\n\n【五行缺失】\n`;
    text += `命局缺${wuxingMissing.join('、')}，性格中可能缺乏这些五行代表的特质：`;
    wuxingMissing.forEach(wx => {
      text += `\n• 缺${wx}：缺"${DAYMASTER_PERSONALITY[wx].nature}"的特质，${DAYMASTER_PERSONALITY[wx].weakness}`;
    });
  }

  return { title: '性格特质', icon: '📖', text };
}

// ===== 事业财运解读 =====
function generateCareer(dayMaster, shiShen, pattern, strength, pillars, yongShen) {
  let text = '';

  // 找出命局中十神分布
  const allShiShen = [];
  for (const key of ['year', 'month', 'day', 'hour']) {
    allShiShen.push(shiShen[key].ganShiShen);
  }

  // 找主要十神（出现次数最多的）
  const ssCount = {};
  allShiShen.forEach(ss => {
    if (ss !== '日主') ssCount[ss] = (ssCount[ss] || 0) + 1;
  });
  const mainSS = Object.entries(ssCount).sort((a, b) => b[1] - a[1]);
  const topSS = mainSS[0]?.[0] || pattern.shiShen;

  text += `【事业方向】\n`;
  text += `您的命局以"${topSS}"为主要十神力量。\n`;
  text += `${SHISHEN_CAREER[topSS] || '综合型发展路线均可'}\n\n`;

  // 格局对应的事业
  text += `【格局指引】\n`;
  text += `${pattern.type}之人：${pattern.desc}\n\n`;

  // 用神指引
  text += `【用神与行业】\n`;
  text += `用神为"${yongShen.element}"，宜从事与${yongShen.element}相关的行业方向：`;
  text += getIndustryByWuxing(yongShen.element);

  // 财运
  text += `\n\n【财运特点】\n`;
  if (gender === '男') {
    const hasZhengCai = allShiShen.includes('正财');
    const hasPianCai = allShiShen.includes('偏财');
    if (hasZhengCai) {
      text += `命有正财，正财主稳定收入，适合工资制或固定收益型理财。`;
    }
    if (hasPianCai) {
      text += `命有偏财，偏财主灵活收入，适合投资、经商、副业等非固定收益。`;
    }
    if (!hasZhengCai && !hasPianCai) {
      text += `命局财星不明显，财运偏弱，需靠自身努力积累，不宜冒险投资。`;
    }
  } else {
    // 女命以官杀论丈夫财运
    text += `女命以官杀论丈夫事业，财星为自身理财能力。`;
    const hasZhengCai = allShiShen.includes('正财');
    const hasPianCai = allShiShen.includes('偏财');
    if (hasZhengCai || hasPianCai) {
      text += `命有财星，自身理财能力不错，可以辅助丈夫经营或独立理财。`;
    } else {
      text += `命局财星不明显，自身理财需谨慎，宜依附型理财为主。`;
    }
  }

  return { title: '事业财运', icon: '💰', text };
}

// ===== 婚姻感情解读 =====
function generateMarriage(dayMaster, shiShen, gender, pillars, wuxingMissing, yongShen) {
  let text = '';
  const allShiShen = [];
  for (const key of ['year', 'month', 'day', 'hour']) {
    allShiShen.push(shiShen[key].ganShiShen);
  }

  text += `【婚姻概况】\n`;

  if (gender === '男') {
    const zhengCaiCount = allShiShen.filter(ss => ss === '正财').length;
    const pianCaiCount = allShiShen.filter(ss => ss === '偏财').length;

    if (zhengCaiCount > 0) {
      text += SHISHEN_MARRIAGE['男命']['正财'] + '\n';
    }
    if (pianCaiCount > 0) {
      text += SHISHEN_MARRIAGE['男命']['偏财'] + '\n';
    }
    if (zhengCaiCount === 0 && pianCaiCount === 0) {
      text += SHISHEN_MARRIAGE['男命']['无财星'] + '\n';
    }
    if (zhengCaiCount + pianCaiCount >= 3) {
      text += SHISHEN_MARRIAGE['男命']['财多'] + '\n';
    }
  } else {
    const zhengGuanCount = allShiShen.filter(ss => ss === '正官').length;
    const qiShaCount = allShiShen.filter(ss => ss === '七杀').length;

    if (zhengGuanCount > 0) {
      text += SHISHEN_MARRIAGE['女命']['正官'] + '\n';
    }
    if (qiShaCount > 0) {
      text += SHISHEN_MARRIAGE['女命']['七杀'] + '\n';
    }
    if (zhengGuanCount === 0 && qiShaCount === 0) {
      text += SHISHEN_MARRIAGE['女命']['无官杀'] + '\n';
    }
    if (zhengGuanCount + qiShaCount >= 3) {
      text += SHISHEN_MARRIAGE['女命']['官杀多'] + '\n';
    }
  }

  // 日支（夫妻宫）
  text += `\n【夫妻宫】\n`;
  text += `日支"${pillars.day.zhi}"(${pillars.day.zhiWuxing})为夫妻宫。`;

  // 日支与日主的关系
  const dayZhiToGan = getZhiGanRelation(dayMaster, pillars.day.zhi);
  text += ` ${dayZhiToGan}\n`;

  text += `\n【感情建议】\n`;
  text += `用神为"${yongShen.element}"，宜找${yongShen.element}属性较重的伴侣（`;
  text += DAYMASTER_PERSONALITY[yongShen.element].traits.substring(0, 20) + '类型的人）。';

  return { title: '婚姻感情', icon: '💕', text };
}

// ===== 健康提示 =====
function generateHealth(wuxingCount, wuxingMissing, dayMaster, yongShen) {
  let text = '';

  text += `【五行与健康】\n`;
  text += `五行对应人体五脏：木→肝胆，火→心脏，土→脾胃，金→肺大肠，水→肾膀胱。\n\n`;

  // 缺什么五行，对应什么器官弱
  if (wuxingMissing.length > 0) {
    text += `【需注意的部位】\n`;
    text += `命局缺${wuxingMissing.join('、')}，对应脏腑先天偏弱：\n`;
    wuxingMissing.forEach(wx => {
      const info = WX_HEALTH[wx];
      text += `• 缺${wx}（${info.organs}）：${info.symptoms}\n`;
      text += `  建议：${info.advice}\n`;
    });
  } else {
    text += `五行俱全，先天脏腑无明显缺失，但需关注五行最弱的一项：\n`;
    // 找最弱的五行
    const weakest = Object.entries(wuxingCount).sort((a, b) => a[1] - b[1])[0];
    const info = WX_HEALTH[weakest[0]];
    text += `• ${weakest[0]}最弱（${info.organs}）：${info.symptoms}\n`;
    text += `  建议：${info.advice}\n`;
  }

  // 最旺五行也需注意过旺的问题
  const strongest = Object.entries(wuxingCount).sort((a, b) => b[1] - a[1])[0];
  if (strongest[1] >= 5) {
    text += `\n【过旺警示】\n`;
    text += `${strongest[0]}行过旺（${WX_HEALTH[strongest[0]].organs}），过旺也容易出问题：\n`;
    text += `  ${WX_HEALTH[strongest[0]].symptoms}\n`;
  }

  text += `\n【日常养生】\n`;
  text += `用神为"${yongShen.element}"，日常可多接触${yongShen.element}属性的事物：`;
  text += getHealthAdviceByWuxing(yongShen.element);

  return { title: '健康提示', icon: '🏥', text };
}

// ===== 人际关系解读 =====
function generateSocial(dayMaster, shiShen, shenSha, strength, yongShen) {
  let text = '';
  const allShiShen = [];
  for (const key of ['year', 'month', 'day', 'hour']) {
    allShiShen.push(shiShen[key].ganShiShen);
  }

  text += `【人际特点】\n`;

  // 比劫多少 → 同辈关系
  const bijieCount = allShiShen.filter(ss => ss === '比肩' || ss === '劫财').length;
  text += `命局比劫${bijieCount > 0 ? `有${bijieCount}个` : '不明显'}：`;
  if (bijieCount >= 2) {
    text += `朋友同辈较多，人际活跃，但需防因利益冲突而失和。\n`;
  } else if (bijieCount === 1) {
    text += `有少数知心好友，人际适度，不易因朋友而生烦恼。\n`;
  } else {
    text += `同辈缘薄，独立性强，宜主动拓展社交圈。\n`;
  }

  // 食伤 → 表达能力
  const shishangCount = allShiShen.filter(ss => ss === '食神' || ss === '伤官').length;
  text += `\n食伤${shishangCount > 0 ? `有${shishangCount}个` : '不明显'}：`;
  if (shishangCount >= 2) {
    text += `表达欲强，善于交际展现自我，人缘好但说话需注意分寸。\n`;
  } else if (shishangCount === 1) {
    text += `表达适度，能言善辩但不张扬，人际中给人好感。\n`;
  } else {
    text += `不善主动表达，人际中较为沉默，需学会适度表达自己。\n`;
  }

  // 神煞对人际的影响
  text += `\n【神煞影响】\n`;
  const hasTianyi = shenSha.some(ss => ss.name === '天乙贵人');
  const hasTaohua = shenSha.some(ss => ss.name === '桃花');
  const hasWenchang = shenSha.some(ss => ss.name === '文昌贵人');

  if (hasTianyi) {
    text += `☆ 有天乙贵人：容易得到长辈上司的提携帮助，关键时刻有人相助。\n`;
  }
  if (hasTaohua) {
    text += `☆ 有桃花：异性缘佳，人缘好，有艺术才华，但需专注感情。\n`;
  }
  if (hasWenchang) {
    text += `☆ 有文昌贵人：学识渊博受人敬重，利学术圈、文化圈交友。\n`;
  }

  text += `\n【社交建议】\n`;
  text += `用神为"${yongShen.element}"，宜多与${yongShen.element}属性的人交往：`;
  text += DAYMASTER_PERSONALITY[yongShen.element].traits.substring(0, 30) + '的人。';

  return { title: '人际关系', icon: '🤝', text };
}

// ===== 辅助函数 =====

// 五行对应行业方向
function getIndustryByWuxing(wx) {
  const industries = {
    '木': '\n• 教育、培训、文化出版\n• 木材、家具、园林种植\n• 医药、保健、公益慈善\n• 服装、纺织、设计创意',
    '火': '\n• 电子、科技、互联网\n• 餐饮、食品加工\n• 能源、电力、照明\n• 影视、娱乐、传媒',
    '土': '\n• 房地产、建筑、装修\n• 农业畜牧业\n• 矿产、石材、仓储物流\n• 保险、信托、殡葬',
    '金': '\n• 金融、银行、证券\n• 机械制造、五金加工\n• 珠宝、钟表、汽车\n• 法律、军警、执法管理',
    '水': '\n• 物流运输、贸易进出口\n• 旅游、酒店、航运\n• 酒水饮料、清洁洗涤\n• 通讯、软件、咨询策划'
  };
  return industries[wx] || '\n• 综合型发展方向均可';
}

// 五行养生建议
function getHealthAdviceByWuxing(wx) {
  const advice = {
    '木': '\n• 多食绿色蔬菜，疏肝理气\n• 亲近自然，树林散步\n• 方位利东方',
    '火': '\n• 适度运动，养心安神\n• 多晒太阳，温暖环境\n• 方位利南方',
    '土': '\n• 规律饮食，温养脾胃\n• 安定居所，不宜频繁搬迁\n• 方位利本地',
    '金': '\n• 注意呼吸系统，防感冒\n• 适度锻炼强肺\n• 方位利西方',
    '水': '\n• 注意保暖，强肾固本\n• 适度游泳或温水泡澡\n• 方位利北方'
  };
  return advice[wx] || '\n• 均衡养生即可';
}

// 日支与日主的关系
function getZhiGanRelation(dayMaster, dayZhi) {
  // 日支藏干与日主的关系
  const cangganRelation = ZHI_CANGGAN[dayZhi] || [];
  if (!cangganRelation.length) return '';

  const mainGan = cangganRelation[0]; // 主气
  // 用十神表判断
  const relation = getShiShenSimple(dayMaster.gan, mainGan);

  const relationDesc = {
    '比肩': '夫妻关系平等互助，如朋友般相处',
    '劫财': '夫妻间有竞争摩擦，需互相尊重',
    '食神': '配偶温和有才华，家庭生活温馨',
    '伤官': '配偶个性独立，夫妻间需包容',
    '偏财': '配偶善于理财，物质生活不错',
    '正财': '配偶踏实持家，婚姻稳定（男命尤佳）',
    '七杀': '配偶强势有魄力，夫妻需磨合',
    '正官': '配偶正直可靠，婚姻有序（女命尤佳）',
    '偏印': '配偶思维独特，有精神共鸣',
    '正印': '配偶包容体贴，婚姻有庇护感'
  };

  return relationDesc[relation] || '夫妻关系需实际相处中观察';
}

function getShiShenSimple(dayGan, otherGan) {
  // 简版十神判断
  const wuxingOrder = ['木', '火', '土', '金', '水'];
  const dayWx = GAN_WUXING[dayGan];
  const dayYy = GAN_YINYANG[dayGan];
  const otherWx = GAN_WUXING[otherGan];
  const otherYy = GAN_YINYANG[otherGan];
  const sameYy = dayYy === otherYy;

  if (dayGan === otherGan) return '日主';
  if (dayWx === otherWx) return sameYy ? '比肩' : '劫财';

  const shengIdx = (wuxingOrder.indexOf(dayWx) + 1) % 5;
  if (otherWx === wuxingOrder[shengIdx]) return sameYy ? '食神' : '伤官';

  const keIdx = (wuxingOrder.indexOf(dayWx) + 2) % 5;
  if (otherWx === wuxingOrder[keIdx]) return sameYy ? '偏财' : '正财';

  const keMeIdx = (wuxingOrder.indexOf(dayWx) - 2 + 5) % 5;
  if (otherWx === wuxingOrder[keMeIdx]) return sameYy ? '七杀' : '正官';

  const shengMeIdx = (wuxingOrder.indexOf(dayWx) - 1 + 5) % 5;
  if (otherWx === wuxingOrder[shengMeIdx]) return sameYy ? '偏印' : '正印';

  return '未知';
}

// 内部引用的常量（避免循环导入）
const GAN_WUXING_LOCAL = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
};
const GAN_YINYANG_LOCAL = {
  '甲': '阳', '乙': '阴', '丙': '阳', '丁': '阴', '戊': '阳',
  '己': '阴', '庚': '阳', '辛': '阴', '壬': '阳', '癸': '阴'
};
const ZHI_CANGGAN_LOCAL = {
  '子': ['癸'], '丑': ['己', '癸', '辛'], '寅': ['甲', '丙', '戊'],
  '卯': ['乙'], '辰': ['戊', '乙', '癸'], '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'], '未': ['己', '丁', '乙'], '申': ['庚', '壬', '戊'],
  '酉': ['辛'], '戌': ['戊', '辛', '丁'], '亥': ['壬', '甲']
};
