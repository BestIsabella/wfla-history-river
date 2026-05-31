/** 上海市世外中学 · 历史数据与题库 */
const WFLA_DATA = {
  school: {
    name: '上海市世外中学',
    shortName: '世外中学',
    english: 'Shanghai World Foreign Language Academy',
    abbr: 'WFLA',
    motto: '培养走向世界的现代中国人',
    qualities: '爱心 · 优雅 · 大气',
    founded: 1996,
  },

  timelineEvents: [
    {
      id: 1, year: 1996, title: '桃源初建', fishTag: '建校',
      official: '上海市世外中学（原名上海市世界外国语中学）于1996年创办，由上海市首批特级校长罗佩明创立，是一所具有优秀学术声誉的民办中学。',
      secret: '罗佩明校长1964年毕业于北京大学西语系德语专业，曾出资设立"罗佩明奖学金和奖教金"，作为世外学子的最高荣誉之一。',
      rumor: '据说首批学生把校园称为"世外桃源"，这个名字后来成了世外文化的重要符号——虽为趣谈，却道出了师生对校园的 affection。',
      icon: '🏫',
    },
    {
      id: 2, year: 2001, title: '走向世界', fishTag: '姐妹校',
      official: '2001年，世外中学与英国 Arden School 签订第一所姐妹校协议，开启国际交流新篇章。',
      secret: '姐妹校合作不仅限于学生交换，更引入了跨文化课程设计理念，为日后 IB 课程落地埋下伏笔。',
      rumor: '有校友回忆，第一批赴英交流的同学带回来整整一箱英式茶包，在校园里引发了一阵"下午茶热"。',
      icon: '🌍',
    },
    {
      id: 3, year: 2004, title: 'IB 启航', fishTag: 'IB',
      official: '2004年，世外中学开始提供国际文凭中学课程（IB-MYP），成为上海探索国际化课程的先行者之一。',
      secret: 'MYP 的引入意味着课程要从"教知识"转向"培养探究者"，世外教师团队经历了密集的全员培训转型。',
      rumor: '坊间戏称：那一年的教师办公室，咖啡 consumption 量翻了三倍——备课到深夜是常态。',
      icon: '📚',
    },
    {
      id: 4, year: 2005, title: '均瑶携手', fishTag: '均瑶',
      official: '2005年，均瑶集团全资收购上海市世外小学和世外中学，学校发展进入新阶段；同年成为首批"上海市双语教学实验学校"之一。',
      secret: '均瑶的加入为世外提供了集团化办学的资源支撑，但世外始终保持着鲜明的学术独立性与办学特色。',
      rumor: '收购消息公布那天，有老师半开玩笑地说："以后出差能坐均瑶航空了？"——后来还真成了现实。',
      icon: '🤝',
    },
    {
      id: 5, year: 2006, title: '双料认证', fishTag: '认证',
      official: '2006年，世外中学获得 IB-MYP 正式授权，并成为徐汇区首批"素质教育实验校"之一。',
      secret: 'IB 授权审核极为严格，世外成为当时上海少数同时持有 MYP 授权与素质实验校称号的民办中学。',
      rumor: '授权通过那天，行政楼飘出了庆祝的欢呼声——据说连隔壁小学都听到了。',
      icon: '🏅',
    },
    {
      id: 6, year: 2008, title: 'DP 升级', fishTag: 'DP',
      official: '2008年，世外中学开始提供国际文凭大学预科课程（IB-DP），构建完整的 IB 课程体系。',
      secret: '从 MYP 到 DP 的贯通，使世外成为上海 IB 全体系办学的标杆学校之一，国际高中至今走过二十余年。',
      rumor: '第一届 DP 学子被戏称为" guinea pigs"——但他们用升学成果证明，自己是"先驱者"。',
      icon: '🎓',
    },
    {
      id: 7, year: 2012, title: '教育服务', fishTag: '世外外',
      official: '2012年，上海世外教育服务发展有限公司成立，标志着世外品牌开始系统化输出优质教育资源。',
      secret: '这一步骤为后来的集团化托管、合作办学模式奠定了法人主体与运营基础。',
      rumor: '公司名称很长，老师们给它起了个昵称："世外外"——外出的外。',
      icon: '🏢',
    },
    {
      id: 8, year: 2013, title: '托管公办', fishTag: '托管',
      official: '2013年，徐汇区教育局委托世外小学和世外中学管理康健外国语实验小学和实验中学，开启托管公办学校业务模式。',
      secret: '托管模式让世外课程理念融入公办学校，是响应"办老百姓身边好学校"号召的重要实践。',
      rumor: '托管校的学生第一次来母体校参观，有小朋友惊呼："原来世外这么大！"',
      icon: '🌉',
    },
    {
      id: 9, year: 2017, title: '集团成立', fishTag: '集团',
      official: '2017年，上海世外教育集团正式成立，以上海世外中学、世外小学为母体校，向华东乃至全国辐射优质教育。',
      secret: '集团首任总裁徐俭曾任世外中学校长，将母体校的学术基因注入每一所成员校。',
      rumor: '集团成立仪式上，有人数了数屏幕上的校徽——"世外系"已经是一张很大的网了。',
      icon: '🌐',
    },
    {
      id: 10, year: 2022, title: '更名世外', fishTag: '更名',
      official: '2022年，根据规范民办义务教育发展相关政策要求，学校由"上海市世界外国语中学"更名为"上海市世外中学"。',
      secret: '校名虽改，英文缩写 WFLA 与办学精神不变，"世外"二字反而更简洁地承载了三十载品牌积淀。',
      rumor: '更名后，老校友群里最热的讨论是："毕业证上写哪个名字？"——两个名字，一段历史。',
      icon: '✨',
    },
    {
      id: 11, year: 2024, title: '哈佛突破', fishTag: '哈佛',
      official: '2024届世外中学国际高中喜获哈佛录取，实现历史性突破；同年还收获剑桥5枚、牛津3枚等顶尖名校录取。',
      secret: '哈佛录取是世外国际高中十六年深耕的里程碑，此前已连获斯坦福、耶鲁等顶尖 offer。',
      rumor: '录取榜公布那天，朋友圈被世外红刷屏——"桃源"里真的游出了通往哈佛的鱼。',
      icon: '🏆',
    },
    {
      id: 12, year: 2026, title: '三十而立', fishTag: '三十载',
      official: '2026年正值世外中学成立三十周年、国际高中开办二十周年；学校团队赴模速空间、创智学院开展 AI 教育专题考察。',
      secret: '校长厉笑影在考察中表示，世外将继续探索 AI 与教育的深度融合，培养引领未来的创新型人才。',
      rumor: '有学生提议：三十周年校庆该办一场"世外河流节"——从时间轴钓历史，用知识游向世界。',
      icon: '🎉',
    },
  ],

  /** 钓鱼：不同年份河流中的"鱼" */
  fishByEra: {
    early: { label: '90年代·源起', years: [1996, 2000], color: '#4a90a4' },
    growth: { label: '2000年代·成长', years: [2001, 2010], color: '#2d6a7a' },
    bloom: { label: '2010年代·绽放', years: [2011, 2020], color: '#1a4d5c' },
    future: { label: '2020年代·新章', years: [2021, 2026], color: '#0d3340' },
  },

  fishTypes: [
    { type: 'official', name: '正史鱼', speed: 1.2, color: '#ffd700', points: 10, desc: '游速稳健，记载确凿史实' },
    { type: 'secret', name: '秘史鱼', speed: 2.0, color: '#c084fc', points: 20, desc: '行踪诡秘，藏有校内秘闻' },
    { type: 'rumor', name: '野史鱼', speed: 3.2, color: '#fb923c', points: 30, desc: '迅捷难捕，多为趣闻轶事' },
  ],

  quizzes: [
    { q: '上海市世外中学创办于哪一年？', options: ['1993', '1996', '2005', '2017'], answer: 1 },
    { q: '世外中学的英文缩写是？', options: ['SWFL', 'WFLA', 'SHWFL', 'WFLMS'], answer: 1 },
    { q: '世外中学的办学目标是？', options: ['培养精英商人', '培养走向世界的现代中国人', '培养外语专才', '培养艺术大师'], answer: 1 },
    { q: '学校培养学生品质不包括以下哪项？', options: ['爱心', '优雅', '大气', '激进'], answer: 3 },
    { q: '2005年世外中学加入了哪个集团？', options: ['复星集团', '均瑶集团', '阿里巴巴', '万科集团'], answer: 1 },
    { q: '世外中学于哪一年更名为现校名？', options: ['2017', '2020', '2022', '2024'], answer: 2 },
    { q: '世外中学的第一所姐妹校位于哪个国家？', options: ['美国', '英国', '法国', '德国'], answer: 1 },
    { q: '罗佩明校长毕业于哪所大学？', options: ['清华大学', '复旦大学', '北京大学', '华东师范大学'], answer: 2 },
    { q: '世外中学从哪一年开始提供 IB-DP 课程？', options: ['2004', '2006', '2008', '2012'], answer: 2 },
    { q: '上海世外教育集团成立于哪一年？', options: ['2013', '2015', '2017', '2019'], answer: 2 },
    { q: '2024届世外国际高中取得了哪所美国顶尖大学的历史性录取？', options: ['耶鲁', '斯坦福', '哈佛', '普林斯顿'], answer: 2 },
    { q: '世外中学曾用中文校名是？', options: ['上海市外国语中学', '上海市世界外国语中学', '上海市国际外国语中学', '上海市徐汇外国语中学'], answer: 1 },
    { q: '2013年世外开启了什么新业务模式？', options: ['海外并购', '托管公办学校', '线上教育', '职业教育'], answer: 1 },
    { q: '2026年世外中学迎来什么重要里程碑？', options: ['二十周年', '二十五周年', '三十周年', '三十五周年'], answer: 2 },
    { q: '世外品牌标识中"地球"图形寓意什么？', options: ['只学外语', '立足本土走向世界', '专注科技', '只招本地生'], answer: 1 },
  ],

  fishTypeMeta: {
    official: { label: '正史', emoji: '📜', fishName: '正史鱼' },
    secret: { label: '秘史', emoji: '🔮', fishName: '秘史鱼' },
    rumor: { label: '野史', emoji: '🎭', fishName: '野史鱼' },
  },

  /** 按年份为钓鱼生成一条带校史标签的鱼 */
  pickFishForSpawn(riverYear, fishType) {
    const ranked = [...this.timelineEvents].sort((a, b) => {
      const score = (ev) => Math.abs(ev.year - riverYear) + (ev.year > riverYear ? 6 : 0);
      return score(a) - score(b);
    });
    const pool = ranked.slice(0, 4);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    return {
      eventId: pick.id,
      fishTag: pick.fishTag || pick.title,
      eventTitle: pick.title,
      eventYear: pick.year,
    };
  },

  _historyFromEvent(event, fishType, year) {
    const meta = this.fishTypeMeta[fishType] || this.fishTypeMeta.official;
    return {
      key: `${event.id}-${fishType}`,
      year: event.year,
      title: event.title,
      icon: event.icon,
      fishType,
      fishName: meta.fishName,
      typeLabel: meta.label,
      typeEmoji: meta.emoji,
      content: event[fishType],
      riverYear: year,
      fishTag: event.fishTag,
    };
  },

  /** 根据鱼种与年份选取对应历史片段（可指定 eventId 与鱼身标签一致） */
  getHistoryForFish(fishType, year, usedKeys = [], eventId = null) {
    if (eventId) {
      const event = this.timelineEvents.find(ev => ev.id === eventId);
      if (event) return this._historyFromEvent(event, fishType, year);
    }

    const ranked = [...this.timelineEvents].sort((a, b) => {
      const score = (ev) => Math.abs(ev.year - year) + (ev.year > year ? 8 : 0);
      return score(a) - score(b);
    });

    let pick = ranked.find(ev => !usedKeys.includes(`${ev.id}-${fishType}`));
    if (!pick) pick = ranked[0];

    return this._historyFromEvent(pick, fishType, year);
  },
};

if (typeof module !== 'undefined') module.exports = WFLA_DATA;
