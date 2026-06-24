// ===== 六爻占卜核心引擎 =====
// 实现铜钱起卦法和时间起卦法，输出卦象、世应、六亲、动爻、变卦

import { Solar } from 'lunar-javascript';

// ===== 六十四卦数据 =====
// 八卦基本符号：0=阴爻(--)，1=阳爻(—)
const BA_GUA = {
  '乾': [1,1,1], '坤': [0,0,0], '震': [0,0,1], '巽': [1,1,0],
  '坎': [0,1,0], '离': [1,0,1], '艮': [1,0,0], '兑': [0,1,1]
};

// 八卦对应五行
const BA_WUXING = {
  '乾': '金', '坤': '土', '震': '木', '巽': '木',
  '坎': '水', '离': '火', '艮': '土', '兑': '金'
};

// 六十四卦对照表（下卦_上卦 → 卦名）
const LIUSHISI_GUA = buildGuaTable();

function buildGuaTable() {
  // 下卦(内卦)和上卦(外卦)组合形成64卦
  const guas = ['乾','坤','震','巽','坎','离','艮','兑'];
  const table = {};

  // 六十四卦完整映射（下卦_上卦 → 卦名）
  const map = {
    '乾_乾':'乾为天','坤_坤':'坤为地','震_震':'震为雷','巽_巽':'巽为风',
    '坎_坎':'坎为水','离_离':'离为火','艮_艮':'艮为山','兑_兑':'兑为泽',
    '乾_坤':'天地否','坤_乾':'地天泰','震_乾':'雷天大壮','巽_乾':'风天小畜',
    '坎_乾':'水天需','离_乾':'火天大有','艮_乾':'山天大畜','兑_乾':'泽天夬',
    '乾_震':'天雷无妄','坤_震':'地雷复','震_坤':'雷地豫','巽_震':'风雷益',
    '坎_震':'水雷屯','离_震':'火雷噬嗑','艮_震':'山雷颐','兑_震':'泽雷随',
    '乾_巽':'天风姤','坤_巽':'地风升','震_巽':'雷风恒','巽_坤':'风地观',
    '坎_巽':'水风井','离_巽':'火风鼎','艮_巽':'山风蛊','兑_巽':'泽风大过',
    '乾_坎':'天水讼','坤_坎':'地水师','震_坎':'雷水解','巽_坎':'风水涣',
    '坎_坤':'水地比','离_坎':'火水未济','艮_坎':'山水蒙','兑_坎':'泽水困',
    '乾_离':'天火同人','坤_离':'地火明夷','震_离':'雷火丰','巽_离':'风火家人',
    '坎_离':'水火既济','离_坤':'火地晋','艮_离':'山火贲','兑_离':'泽火革',
    '乾_艮':'天山遁','坤_艮':'地山谦','震_艮':'雷山小过','巽_艮':'风山渐',
    '坎_艮':'水山蹇','离_艮':'火山旅','艮_坤':'山地剥','兑_艮':'泽山咸',
    '乾_兑':'天泽履','坤_兑':'地泽临','震_兑':'雷泽归妹','巽_兑':'风泽中孚',
    '坎_兑':'水泽节','离_兑':'火泽睽','艮_兑':'山泽损','兑_坤':'泽地萃',
  };
  return map;
}

// 卦辞与解读（精简版，覆盖64卦）
const GUA_DESC = buildGuaDesc();

function buildGuaDesc() {
  return {
    '乾为天': { desc: '刚健中正，自强不息。大吉之卦，宜积极进取，但需防亢龙有悔。', judgment: '元亨利贞', advice: '主动出击，顺势而为，但不可骄横' },
    '坤为地': { desc: '柔顺包容，厚德载物。宜顺从守正，不宜冒进，待时而动。', judgment: '元亨，利牝马之贞', advice: '低调配合，厚积薄发' },
    '震为雷': { desc: '震动惊惧，变化突来。虽令人不安，但雷后必晴，终有好转。', judgment: '亨，震来虩虩', advice: '冷静面对突发变故，不慌不乱' },
    '巽为风': { desc: '顺风而行，潜移默化。宜顺势渗透，不宜强硬对抗。', judgment: '小亨，利有攸往', advice: '顺势而为，柔中带刚' },
    '坎为水': { desc: '重险陷溺，困难重重。需坚守信念，步步小心，终可脱险。', judgment: '有孚，维心亨', advice: '谨慎行事，坚持信念，渡过难关' },
    '离为火': { desc: '光明依附，文明之象。宜依附强者，但需防明极生暗。', judgment: '利贞，亨', advice: '借力而行，光明正大' },
    '艮为山': { desc: '静止稳定，宜守不宜进。当前以静制动，积蓄力量。', judgment: '艮其背，不获其身', advice: '暂停等待，不宜冒进' },
    '兑为泽': { desc: '喜悦和悦，言谈有信。宜与人合作谈判，利口舌之争。', judgment: '亨，利贞', advice: '和气生财，善用言辞' },
    '天地否': { desc: '天地不交，闭塞不通。不利行动，需静待否极泰来。', judgment: '否之匪人', advice: '暂缓行动，等待时机转变' },
    '地天泰': { desc: '天地交通，万物通达。大吉之卦，宜积极行动，诸事亨通。', judgment: '小往大来，吉亨', advice: '大胆行动，万事亨通' },
    '雷天大壮': { desc: '阳气壮盛，力量充沛。但过于刚壮易折，需守正勿逞强。', judgment: '利贞', advice: '实力强大但需守规矩，忌蛮干' },
    '风天小畜': { desc: '力量尚弱，积蓄不够。宜耐心等待，逐步积累。', judgment: '亨，密云不雨', advice: '暂缓大动作，小步积累' },
    '水天需': { desc: '等待时机，守正待变。虽有利可图，但时机未到需耐心。', judgment: '有孚，光亨', advice: '耐心等待，准备充分后再行动' },
    '火天大有': { desc: '日中天，丰收大有。大吉之卦，事业财运俱佳。', judgment: '元亨', advice: '乘势而为，大有收获' },
    '山天大畜': { desc: '积蓄丰厚，实力壮大。宜学习积累，厚积薄发。', judgment: '利贞，不家食吉', advice: '多学多积，不宜消耗' },
    '泽天夬': { desc: '决断果决，斩断阻碍。宜果断决策，但需防过刚伤人。', judgment: '扬于王庭', advice: '果断决策，一鼓作气' },
    '天雷无妄': { desc: '无妄之行，真实不虚。行为端正则吉，妄动则灾。', judgment: '元亨利贞', advice: '实事求是，不可妄为' },
    '地雷复': { desc: '一阳来复，否极泰来。转机之卦，宜重新开始。', judgment: '亨，出入无疾', advice: '抓住转机，重新出发' },
    '雷地豫': { desc: '喜悦安逸，和乐之象。宜享受成果，但防沉迷安逸。', judgment: '利建侯行师', advice: '适度享乐，积极备战' },
    '风雷益': { desc: '增益助人，互利共赢。宜助人利己，合作共赢。', judgment: '利有攸往，利涉大川', advice: '积极合作，互相增益' },
    '水雷屯': { desc: '初创艰难，万事起步。虽困难重重，但坚持必成。', judgment: '元亨利贞', advice: '创业艰难，坚持不懈' },
    '火雷噬嗑': { desc: '咬合断狱，明辨是非。宜果断处理纠纷，除害惩恶。', judgment: '亨，利用狱', advice: '果断处理障碍，明辨是非' },
    '山雷颐': { desc: '颐养保健，慎言节食。宜修身养性，注意养生。', judgment: '贞吉', advice: '修身养性，注意饮食起居' },
    '泽雷随': { desc: '随顺时势，因势利导。宜顺应潮流，灵活应变。', judgment: '元亨利贞', advice: '顺势而行，灵活应变' },
    '天风姤': { desc: '偶然相遇，不期而合。短期有利，但需防不长久。', judgment: '女壮，勿用取女', advice: '把握偶遇机遇，但不宜长期依赖' },
    '地风升': { desc: '步步上升，渐进发展。宜稳扎稳打，逐步攀升。', judgment: '元亨，用见大人', advice: '循序渐进，稳步上升' },
    '雷风恒': { desc: '持之以恒，久常不变。宜守常不变，坚持不懈。', judgment: '亨，无咎，利贞', advice: '坚持正道，守常不变' },
    '风地观': { desc: '观察审视，展示示范。宜观察学习，以身作则。', judgment: '盥而不荐，有孚颙若', advice: '多观察少行动，学习他人' },
    '水风井': { desc: '井水不竭，养人不穷。有恒久之利，但需维护保养。', judgment: '改邑不改井', advice: '维护好已有资源，可持续利用' },
    '火风鼎': { desc: '鼎新革故，革故鼎新。宜改革创新，建立新秩序。', judgment: '元吉，亨', advice: '革除旧弊，建立新制' },
    '山风蛊': { desc: '败坏腐朽，积弊待治。宜整治改革，拨乱反正。', judgment: '元亨，利涉大川', advice: '正视问题，大胆整治改革' },
    '泽风大过': { desc: '过度超常，压力重大。需非常手段应对，但防过犹不及。', judgment: '栋桡，利有攸往', advice: '采取非常手段，但要适度' },
    '天水讼': { desc: '争讼冲突，纷争不和。宜和解退让，不宜强硬争辩。', judgment: '有孚窒惕', advice: '避免冲突争讼，和解为上' },
    '地水师': { desc: '领军征战，纪律严明。宜有序组织，团队协作。', judgment: '贞，丈人吉', advice: '听从指挥，团队协作' },
    '雷水解': { desc: '解除困难，危机消散。宜趁势化解矛盾，及时行动。', judgment: '利西南', advice: '趁机化解矛盾，及时行动' },
    '风水涣': { desc: '涣散离散，人心分离。宜重建团结，凝聚人心。', judgment: '亨，王假有庙', advice: '重建凝聚力，化解涣散' },
    '水地比': { desc: '亲比相辅，团结互助。宜与人合作，亲近贤人。', judgment: '吉', advice: '主动合作，亲近贵人' },
    '火水未济': { desc: '事未完成，渡河未终。虽未成功，但有望完成，需坚持。', judgment: '亨，小狐汔济', advice: '坚持下去，事将可成' },
    '山水蒙': { desc: '蒙昧幼稚，需要启蒙。宜学习请教，接受教导。', judgment: '亨，匪我求童蒙', advice: '虚心学习，接受指导' },
    '泽水困': { desc: '困顿困境，进退两难。需坚守信念，等待解脱。', judgment: '亨，贞大人吉', advice: '坚守信念，等待解脱时机' },
    '天火同人': { desc: '志同道合，团结合作。宜与人同心协力，共谋大事。', judgment: '同人于野，亨', advice: '寻找志同道合者，团结合作' },
    '地火明夷': { desc: '光明受损，韬光养晦。宜隐藏实力，低调等待。', judgment: '利艰贞', advice: '韬光养晦，低调行事' },
    '雷火丰': { desc: '丰收丰盛，盛大之象。宜趁盛时进取，但防盛极而衰。', judgment: '亨，王假之', advice: '乘势进取，但不可挥霍' },
    '风火家人': { desc: '家道治理，内外和谐。宜整顿家务，和睦相处。', judgment: '利女贞', advice: '注重家庭和睦，内外有序' },
    '水火既济': { desc: '事已完成，功德圆满。吉卦但需防骄怠，守成不易。', judgment: '亨，小利贞', advice: '已完成但需维护，守成不易' },
    '火地晋': { desc: '日出地上，晋升上进。宜积极进取，光明前行。', judgment: '康侯用锡马蕃庶', advice: '积极进取，争取晋升' },
    '山火贲': { desc: '文饰装扮，修饰美化。宜注重外在形象，但不可华而不实。', judgment: '亨，小利有攸往', advice: '注重形象修饰，但求实质' },
    '泽火革': { desc: '变革革新，除旧布新。宜大胆改革，更新换代。', judgment: '己日乃孚，元亨利贞', advice: '大胆变革，顺势革新' },
    '天山遁': { desc: '退避隐遁，远离是非。宜暂时退让，保存实力。', judgment: '亨，小利贞', advice: '暂时退避，保存实力' },
    '地山谦': { desc: '谦逊谦虚，低调守正。大吉之卦，谦虚者终受益。', judgment: '亨，君子有终', advice: '谦虚待人，低调行事' },
    '雷山小过': { desc: '小有过越，稍偏离正。宜小事可行，大事不宜。', judgment: '亨，利贞', advice: '小事可做，大事谨慎' },
    '风山渐': { desc: '渐进有序，稳步前行。宜循序渐进，不宜急进。', judgment: '女归吉，利贞', advice: '循序渐进，稳步发展' },
    '水山蹇': { desc: '行路艰难，阻碍重重。宜退守等待，不宜强行。', judgment: '利西南，不利东北', advice: '遇阻暂退，另寻出路' },
    '火山旅': { desc: '旅途客居，漂泊不定。宜小心谨慎，临时应对。', judgment: '小亨，旅贞吉', advice: '小心行事，不宜定居' },
    '山地剥': { desc: '剥落衰败，运势下落。宜守不宜进，等待重新积累。', judgment: '不利有攸往', advice: '守而不进，等待转机' },
    '泽山咸': { desc: '感应交流，情感互通。利感情交际，男女相感。', judgment: '亨利贞，取女吉', advice: '注重情感沟通，利交际' },
    '天泽履': { desc: '循礼而行，谨慎实践。宜守规矩行事，步步踏实。', judgment: '履虎尾，不咥人，亨', advice: '循规蹈矩，谨慎行事' },
    '地泽临': { desc: '居高临下，亲临指导。宜主动介入，利管理指导。', judgment: '元亨利贞', advice: '主动介入管理，利领导' },
    '雷泽归妹': { desc: '归嫁从人，感情冲动。需审慎抉择，不可冲动行事。', judgment: '征凶，无攸利', advice: '感情之事需审慎，不可冲动' },
    '风泽中孚': { desc: '诚信守约，忠实不欺。宜以诚待人，信誉为本。', judgment: '豚鱼吉，利涉大川', advice: '诚信为本，以诚待人' },
    '水泽节': { desc: '节制约束，适度自律。宜适当节制，不可放纵。', judgment: '亨，苦节不可贞', advice: '适度节制，不可过度约束' },
    '火泽睽': { desc: '背离乖异，意见不合。宜求同存异，化解分歧。', judgment: '小事吉', advice: '小事可成，大事需统一意见' },
    '山泽损': { desc: '减损放弃，舍己为人。先损后益，暂时牺牲终有回报。', judgment: '有孚，元吉', advice: '适当舍弃，先损后益' },
    '泽地萃': { desc: '聚集汇聚，人才荟萃。宜聚集力量，团结合作。', judgment: '亨，王假有庙', advice: '聚集人才力量，团结合作' },
  };
}

// 天干五行
const GAN_WUXING = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
};

// 地支五行
const ZHI_WUXING = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
  '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
};

// 地支藏干
const ZHI_CANGGAN = {
  '子': ['癸'], '丑': ['己', '癸', '辛'], '寅': ['甲', '丙', '戊'],
  '卯': ['乙'], '辰': ['戊', '乙', '癸'], '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'], '未': ['己', '丁', '乙'], '申': ['庚', '壬', '戊'],
  '酉': ['辛'], '戌': ['戊', '辛', '丁'], '亥': ['壬', '甲']
};

// 六亲对照（根据卦宫五行与爻五行对比）
// 同我=兄弟，我生=子孙，我克=妻财，克我=官鬼，生我=父母
const LIUQIN_MAP = {
  'same': '兄弟', 'iSheng': '子孙', 'iKe': '妻财', 'keMe': '官鬼', 'shengMe': '父母'
};

// 纳甲表（天干地支配各卦各爻）
// 乾内卦纳甲子,外卦纳甲午;坤内卦纳乙未,外卦纳乙丑...
const NA_JIA = buildNaJia();

function buildNaJia() {
  // 纳甲法：每卦6爻各配一个天干+地支
  // 从初爻到上爻
  return {
    '乾': { gan: '甲', zhi: ['子','寅','辰','午','申','戌'] },  // 内甲子，外甲午
    '坤': { gan: '乙', zhi: ['未','巳','卯','丑','亥','酉'] },
    '震': { gan: '庚', zhi: ['子','寅','辰','午','申','戌'] },
    '巽': { gan: '辛', zhi: ['丑','亥','酉','未','巳','卯'] },
    '坎': { gan: '戊', zhi: ['寅','辰','午','申','戌','子'] },
    '离': { gan: '己', zhi: ['卯','丑','亥','酉','未','巳'] },
    '艮': { gan: '丙', zhi: ['辰','午','申','戌','子','寅'] },
    '兑': { gan: '丁', zhi: ['巳','卯','丑','亥','酉','未'] },
  };
}

// 八宫归属（每宫8卦，用于定六亲）
// 宫的五行决定六亲关系
const BA_GONG = {
  '乾为天': '乾', '泽天夬': '乾', '火天大有': '乾', '雷天大壮': '乾',
  '天风姤': '乾', '风天小畜': '乾', '山天大畜': '乾', '地天泰': '乾',
  '坎为水': '坎', '泽水困': '坎', '水火既济': '坎', '雷水解': '坎',
  '天水讼': '坎', '风水涣': '坎', '山水蒙': '坎', '地水师': '坎',
  '艮为山': '艮', '山火贲': '艮', '山天大畜': '艮', '山泽损': '艮',
  '火山旅': '艮', '风山渐': '艮', '水山蹇': '艮', '地山谦': '艮',
  '震为雷': '震', '雷地豫': '震', '雷水解': '震', '雷风恒': '震',
  '雷天大壮': '震', '泽雷随': '震', '火雷噬嗑': '震', '风雷益': '震',
  '巽为风': '巽', '风天小畜': '巽', '风火家人': '巽', '风雷益': '巽',
  '天风姤': '巽', '泽风大过': '巽', '火风鼎': '巽', '山风蛊': '巽',
  '离为火': '离', '火山旅': '离', '火风鼎': '离', '火水未济': '离',
  '天火同人': '离', '泽火革': '离', '雷火丰': '离', '地火明夷': '离',
  '兑为泽': '兑', '泽水困': '兑', '泽地萃': '兑', '泽山咸': '兑',
  '泽风大过': '兑', '天泽履': '兑', '火泽睽': '兑', '风泽中孚': '兑',
  '坤为地': '坤', '地雷复': '坤', '地泽临': '坤', '地天泰': '坤',
  '天地否': '坤', '风地观': '坤', '山地剥': '坤', '水地比': '坤',
};

// 简化：某些卦归入多个宫，取第一宫
function getGuaGong(guaName) {
  return BA_GONG[guaName] || guessGongFromName(guaName);
}

function guessGongFromName(guaName) {
  // 从卦名推断宫位（看是否有纯卦名）
  for (const gong of ['乾','坤','震','巽','坎','离','艮','兑']) {
    if (guaName.includes(gong) || guaName === `${gong}为${BA_WUXING[gong] === '金' && gong === '乾' ? '天' : BA_WUXING[gong] === '土' && gong === '坤' ? '地' : BA_WUXING[gong] === '木' && gong === '震' ? '雷' : BA_WUXING[gong] === '木' && gong === '巽' ? '风' : BA_WUXING[gong] === '水' && gong === '坎' ? '水' : BA_WUXING[gong] === '火' && gong === '离' ? '火' : BA_WUXING[gong] === '土' && gong === '艮' ? '山' : '泽'}`) {
      return gong;
    }
  }
  // 从卦象推断
  return '乾'; // 默认
}

/**
 * 六爻占卜引擎
 */
export class LiuyaoEngine {

  /**
   * 铜钱起卦法
   * @param {Array} coins - 6组铜钱结果，每组3枚(0=阴/字,1=阳/背)
   * @returns {object} 六爻排盘结果
   */
  coinsMethod(coins) {
    // 每组3枚铜钱 → 1爻
    // 3背=老阳(1,动爻变为0), 2背1字=少阳(1), 2字1背=少阴(0), 3字=老阴(0,动爻变为1)
    const yaoList = coins.map(group => {
      const backs = group.reduce((a, b) => a + b, 0);
      if (backs === 3) return { yao: 1, moving: true, type: '老阳' };
      if (backs === 2) return { yao: 1, moving: false, type: '少阳' };
      if (backs === 1) return { yao: 0, moving: false, type: '少阴' };
      return { yao: 0, moving: true, type: '老阴' };
    });

    // 初爻在下，上爻在上
    const innerGuaYao = yaoList.slice(0, 3); // 内卦（下卦）
    const outerGuaYao = yaoList.slice(3, 6); // 外卦（上卦）

    // 确定内外卦名
    const innerGua = this.matchGua(innerGuaYao.map(y => y.yao));
    const outerGua = this.matchGua(outerGuaYao.map(y => y.yao));

    const guaName = LIUSHISI_GUA[`${innerGua}_${outerGua}`] || `${innerGua}${outerGua}卦`;

    // 变卦（动爻阴阳互变）
    const changedYaoList = yaoList.map(y => {
      if (y.moving) return { ...y, yao: y.yao === 1 ? 0 : 1 };
      return y;
    });
    const changedInner = this.matchGua(changedYaoList.slice(0, 3).map(y => y.yao));
    const changedOuter = this.matchGua(changedYaoList.slice(3, 6).map(y => y.yao));
    const changedGuaName = LIUSHISI_GUA[`${changedInner}_${changedOuter}`] || `${changedInner}${changedOuter}卦`;

    // 纳甲配爻
    const guaGong = getGuaGong(guaName);
    const gongWuxing = BA_WUXING[guaGong];
    const naJiaData = this.getNaJiaForGua(innerGua, outerGua);

    // 六亲
    const liuqinList = naJiaData.map(nj => {
      const爻Wx = ZHI_WUXING[nj.zhi];
      return this.getLiuqin(gongWuxing, 爻Wx);
    });

    // 世应位置
    const shiYing = this.getShiYing(guaName);

    return this.buildResult({
      method: '铜钱法',
      yaoList,
      innerGua,
      outerGua,
      guaName,
      changedYaoList,
      changedInner,
      changedOuter,
      changedGuaName,
      naJiaData,
      liuqinList,
      gongWuxing,
      shiYing,
      guaGong
    });
  }

  /**
   * 时间起卦法
   * @param {number} year - 年
   * @param {number} month - 月（农历）
   * @param {number} day - 日（农历）
   * @param {number} hourIndex - 时辰索引
   * @returns {object} 六爻排盘结果
   */
  timeMethod(year, month, day, hourIndex) {
    const solar = Solar.fromYmd(year, month, 1);
    const lunar = solar.getLunar();

    // 时间起卦法公式：
    // 上卦 = (年数+月数+日数) % 8 → 对应八卦序号
    // 下卦 = (年数+月数+日数+时辰数) % 8
    // 动爻 = (年数+月数+日数+时辰数) % 6

    const yearNum = (year - 4) % 12 + 1; // 简化取年支序号
    const monthNum = month;
    const dayNum = day;
    const hourNum = hourIndex + 1;

    const guaOrder = ['乾','兑','离','震','巽','坎','艮','坤'];

    const upperIdx = (yearNum + monthNum + dayNum) % 8;
    const lowerIdx = (yearNum + monthNum + dayNum + hourNum) % 8;
    const movingYao = (yearNum + monthNum + dayNum + hourNum) % 6;

    const outerGua = guaOrder[upperIdx];
    const innerGua = guaOrder[lowerIdx];

    // 构建爻列表
    const innerYao = BA_GUA[innerGua];
    const outerYao = BA_GUA[outerGua];
    const allYao = [...innerYao, ...outerYao];
    const yaoList = allYao.map((y, i) => ({
      yao: y,
      moving: i === movingYao,
      type: i === movingYao ? (y === 1 ? '老阳' : '老阴') : (y === 1 ? '少阳' : '少阴')
    }));

    const guaName = LIUSHISI_GUA[`${innerGua}_${outerGua}`] || `${innerGua}${outerGua}卦`;

    // 变卦
    const changedYaoList = yaoList.map(y => {
      if (y.moving) return { ...y, yao: y.yao === 1 ? 0 : 1 };
      return y;
    });
    const changedInner = this.matchGua(changedYaoList.slice(0, 3).map(y => y.yao));
    const changedOuter = this.matchGua(changedYaoList.slice(3, 6).map(y => y.yao));
    const changedGuaName = LIUSHISI_GUA[`${changedInner}_${changedOuter}`] || `${changedInner}${changedOuter}卦`;

    const guaGong = getGuaGong(guaName);
    const gongWuxing = BA_WUXING[guaGong];
    const naJiaData = this.getNaJiaForGua(innerGua, outerGua);
    const liuqinList = naJiaData.map(nj => this.getLiuqin(gongWuxing, ZHI_WUXING[nj.zhi]));
    const shiYing = this.getShiYing(guaName);

    return this.buildResult({
      method: '时间起卦法',
      yaoList,
      innerGua,
      outerGua,
      guaName,
      changedYaoList,
      changedInner,
      changedOuter,
      changedGuaName,
      naJiaData,
      liuqinList,
      gongWuxing,
      shiYing,
      guaGong
    });
  }

  // 匹配卦名
  matchGua(yaoArr) {
    for (const [name, pattern] of Object.entries(BA_GUA)) {
      if (pattern.length === yaoArr.length &&
          pattern.every((v, i) => v === yaoArr[i])) {
        return name;
      }
    }
    // 默认
    return '乾';
  }

  // 纳甲配爻
  getNaJiaForGua(innerGua, outerGua) {
    const innerNa = NA_JIA[innerGua];
    const outerNa = NA_JIA[outerGua];

    // 内卦3爻 + 外卦3爻 = 6爻
    // 注意：外卦纳甲可能需要换天干
    const innerGan = innerNa.gan;
    const outerGan = this.getOuterGan(innerGua, outerGua);

    const result = [];
    // 初爻到三爻（内卦）
    for (let i = 0; i < 3; i++) {
      result.push({ gan: innerGan, zhi: innerNa.zhi[i] });
    }
    // 四爻到六爻（外卦）
    for (let i = 0; i < 3; i++) {
      result.push({ gan: outerGan, zhi: outerNa.zhi[i] });
    }
    return result;
  }

  // 外卦天干
  getOuterGan(innerGua, outerGua) {
    // 纳甲规则：乾纳甲壬，坤纳乙癸等
    // 简化处理：内卦用本天干，外卦用对冲天干
    const ganMap = { '乾': '壬', '坤': '癸', '震': '庚', '巽': '辛',
                     '坎': '戊', '离': '己', '艮': '丙', '兑': '丁' };
    return ganMap[outerGua] || NA_JIA[outerGua].gan;
  }

  // 六亲判定
  getLiuqin(gongWx, yaoWx) {
    const wuxingOrder = ['木', '火', '土', '金', '水'];
    if (gongWx === yaoWx) return '兄弟';
    const gIdx = wuxingOrder.indexOf(gongWx);
    const yIdx = wuxingOrder.indexOf(yaoWx);
    if ((gIdx + 1) % 5 === yIdx) return '子孙';  // 我生
    if ((gIdx + 2) % 5 === yIdx) return '妻财';  // 我克
    if ((yIdx + 2) % 5 === gIdx) return '官鬼';  // 克我
    if ((yIdx + 1) % 5 === gIdx) return '父母';  // 生我
    return '兄弟';
  }

  // 世应位置
  getShiYing(guaName) {
    // 世应位置规则（归魂、游魂等特殊）
    // 简化：纯卦世在六应三，一世卦世在初应四...
    const pureGua = ['乾为天','坤为地','震为雷','巽为风','坎为水','离为火','艮为山','兑为泽'];
    if (pureGua.includes(guaName)) return { shi: 5, ying: 2 }; // 世六应三

    // 归魂卦世在三
    if (guaName.includes('归')) return { shi: 2, ying: 5 };

    // 游魂卦世在四
    if (guaName.includes('游')) return { shi: 3, ying: 0 };

    // 默认：世在初爻，应在四爻
    return { shi: 0, ying: 3 };
  }

  // 构建完整结果
  buildResult(params) {
    const { method, yaoList, innerGua, outerGua, guaName,
            changedYaoList, changedInner, changedOuter, changedGuaName,
            naJiaData, liuqinList, gongWuxing, shiYing, guaGong } = params;

    const guaDesc = GUA_DESC[guaName] || { desc: `${guaName}，请参看易经原文`, judgment: '', advice: '参考易经原文细究' };
    const changedDesc = GUA_DESC[changedGuaName] || { desc: `${changedGuaName}，请参看易经原文`, judgment: '', advice: '参考易经原文细究' };

    // 动爻信息
    const movingYaoInfo = yaoList
      .map((y, i) => ({ ...y, position: i, liuqin: liuqinList[i], naJia: naJiaData[i] }))
      .filter(y => y.moving);

    return {
      method,
      guaName,
      innerGua,
      outerGua,
      guaGong,
      gongWuxing,
      yaoList: yaoList.map((y, i) => ({
        ...y,
        position: i,
        liuqin: liuqinList[i],
        naJia: naJiaData[i],
        isShi: shiYing.shi === i,
        isYing: shiYing.ying === i
      })),
      shiYing,
      movingYao: movingYaoInfo,
      changedGuaName,
      changedInner,
      changedOuter,
      changedYaoList: changedYaoList.map((y, i) => ({ ...y, position: i })),
      guaDesc,
      changedDesc,
      timestamp: new Date().toLocaleString('zh-CN')
    };
  }
}
