/**
 * 人物模板库 - 静态数据
 * Character template library (static data)
 * 按照核心数据层设计：所有NPC的基础属性/技能，游戏首次生成时从此复制到存档
 */

/**
 * 人物模板属性接口
 * @typedef {Object} CharacterTemplate
 * @property {string} templateId - 模板ID (全局唯一)
 * @property {number} id - 数字ID
 * @property {string} name - 人物姓名
 * @property {string} emoji - 用Emoji代替头像
 * @property {string} portrait - 立绘资源ID
 * @property {string} color - 头像背景色
 * @property {Object} baseStats - 基础五维 {统率: number, 武力: number, 内政: number, 智力: number, 魅力: number}
 * @property {Object} initialSkills - 初始技能 {skillId: level}
 * @property {string[]} initialCards - 初始拥有卡片ID列表
 * @property {string|null} exclusiveSecretCard - 专属秘传卡ID
 * @property {string} personality - 性格: 忠义/豪勇/智谋/慎重/胆小
 * @property {string} faction - 初始所属势力
 * @property {string} initialRank - 初始身份/官职
 * @property {number[]|null} birthDeath - [出生年, 死亡年]
 * @property {string} description - 人物描述
 * @property {number} locationCityId - 初始所在城市ID
 */

/**
 * 所有人物模板
 * 核心元末明初历史人物 - 第一章濠州-应天时期关键人物
 * @type {CharacterTemplate[]}
 */
window.CHARACTER_TEMPLATES = [
    {
        templateId: "ZHU_YUANZHANG",
        id: 1,
        name: "朱元璋",
        emoji: "👨",
        image: "images/characters/5star/zhuyuanzhang3.png",
        portrait: "zhuyuanzhang3",
        color: "#4a90e2",
        baseStats: {
            leadership: 85,
            strength: 78,
            politics: 72,
            intelligence: 80,
            charm: 82
        },
        initialSkills: {
            infantry: 2,
            cavalry: 1,
            navy: 0,
            firearm: 0,
            strategy: 2,
            martial: 2,
            medicine: 0,
            eloquence: 1,
            agriculture: 0,
            engineering: 1,
            trade: 0,
            law: 0,
            spy: 1,
            navigation: 0,
            ritual: 0,
            calligraphy: 0
        },
        initialCards: ["步战·二", "兵法·二", "武艺·二", "太祖长拳"],
        exclusiveSecretCard: "SECRET_HONGWU_KAITIAN",
        personality: "豪勇",
        faction: "GUO",
        initialRank: "红巾军士兵",
        birthDeath: [1328, 1398],
        description: "明朝开国皇帝，从乞丐到皇帝的传奇人生。",
        locationCityId: 1
    },
    {
        templateId: "XU_DA",
        id: 2,
        name: "徐达",
        emoji: "🗡️",
        image: "images/characters/5star/xuda.png",
        portrait: "xuda",
        color: "#50c878",
        baseStats: {
            leadership: 99,
            strength: 90,
            politics: 70,
            intelligence: 88,
            charm: 85
        },
        initialSkills: {
            infantry: 3,
            cavalry: 3,
            navy: 2,
            firearm: 1,
            strategy: 3,
            martial: 3,
            medicine: 0,
            eloquence: 2,
            agriculture: 1,
            engineering: 2,
            trade: 0,
            law: 1,
            spy: 1,
            navigation: 0,
            ritual: 2,
            calligraphy: 1
        },
        initialCards: ["步战·三", "骑战·三", "兵法·三", "武艺·三", "北伐突进"],
        exclusiveSecretCard: "SECRET_BEIFA_TUJIN",
        personality: "忠义",
        faction: "郭子兴军",
        initialRank: "元帅",
        birthDeath: [1332, 1385],
        description: "明朝开国第一功臣，用兵如神，朱元璋誉为'万里长城'。",
        locationCityId: 1
    },
    {
        templateId: "CHANG_YUCHUN",
        id: 3,
        name: "常遇春",
        emoji: "⚔️",
        image: "images/characters/5star/changyuchun.png",
        portrait: "changyuchun",
        color: "#e74c3c",
        baseStats: {
            leadership: 92,
            strength: 100,
            politics: 40,
            intelligence: 72,
            charm: 78
        },
        initialSkills: {
            infantry: 3,
            cavalry: 3,
            navy: 1,
            firearm: 1,
            strategy: 2,
            martial: 3,
            medicine: 0,
            eloquence: 1,
            agriculture: 0,
            engineering: 0,
            trade: 0,
            law: 0,
            spy: 0,
            navigation: 0,
            ritual: 1,
            calligraphy: 0
        },
        initialCards: ["骑战·三", "武艺·三", "常十万"],
        exclusiveSecretCard: "SECRET_CHANG_100K",
        personality: "豪勇",
        faction: "郭子兴军",
        initialRank: "都督",
        birthDeath: [1330, 1369],
        description: "人称'常十万'，单骑突阵，勇猛无前。",
        locationCityId: 1
    },
    {
        templateId: "TANG_HE",
        id: 4,
        name: "汤和",
        emoji: "👮",
        image: "images/characters/4star/tanghe.png",
        portrait: "tanghe",
        color: "#3498db",
        baseStats: {
            leadership: 68,
            strength: 75,
            politics: 62,
            intelligence: 70,
            charm: 75
        },
        initialSkills: {
            infantry: 2,
            cavalry: 1,
            navy: 2,
            firearm: 0,
            strategy: 2,
            martial: 2,
            medicine: 0,
            eloquence: 1,
            agriculture: 0,
            engineering: 0,
            trade: 0,
            law: 0,
            spy: 1,
            navigation: 1,
            ritual: 1,
            calligraphy: 0
        },
        initialCards: ["步战·二", "水战·二"],
        exclusiveSecretCard: null,
        personality: "慎重",
        faction: "郭子兴军",
        initialRank: "千户",
        birthDeath: [1326, 1395],
        description: "朱元璋同乡，开国功臣，深谙激流勇退之道。",
        locationCityId: 1
    },
    {
        templateId: "GUO_ZIXING",
        id: 5,
        name: "郭子兴",
        emoji: "👴",
        image: "images/characters/3star/guozixing.png",
        portrait: "guozixing",
        color: "#808080",
        baseStats: {
            leadership: 68,
            strength: 65,
            politics: 62,
            intelligence: 70,
            charm: 75
        },
        initialSkills: {
            infantry: 2,
            strategy: 2,
            eloquence: 2,
            martial: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "慎重",
        faction: "郭子兴军",
        initialRank: "元帅",
        birthDeath: [1302, 1355],
        description: "濠州红巾军领袖，朱元璋的岳父与伯乐。",
        locationCityId: 1
    },
    {
        templateId: "MA_XIUYING",
        id: 6,
        name: "马秀英",
        emoji: "👩",
        image: "images/characters/4star/maxiuying.png",
        portrait: "maxiuying",
        color: "#ff69b4",
        baseStats: {
            leadership: 55,
            strength: 40,
            politics: 85,
            intelligence: 80,
            charm: 90
        },
        initialSkills: {
            eloquence: 2,
            politics: 3,
            ritual: 2
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "忠义",
        faction: "郭子兴军",
        initialRank: "侍女",
        birthDeath: [1332, 1382],
        description: "郭子兴义女，后来的孝慈高皇后，朱元璋的贤内助。",
        locationCityId: 1
    },
    {
        templateId: "LI_SHANCHANG",
        id: 7,
        name: "李善长",
        emoji: "📜",
        image: "images/characters/4star/lishanchang.png",
        portrait: "lishanchang",
        color: "#9b59b6",
        baseStats: {
            leadership: 58,
            strength: 30,
            politics: 92,
            intelligence: 85,
            charm: 72
        },
        initialSkills: {
            politics: 3,
            eloquence: 2,
            law: 2,
            trade: 1,
            ritual: 2
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "慎重",
        faction: "郭子兴军",
        initialRank: "掌书记",
        birthDeath: [1314, 1390],
        description: "朱元璋麾下首席谋臣，负责后勤财政，可比萧何。",
        locationCityId: 1
    },
    {
        templateId: "LIU_BOWEN",
        id: 8,
        name: "刘伯温",
        emoji: "🔮",
        image: "images/characters/5star/liubowen.png",
        portrait: "liubowen",
        color: "#34495e",
        baseStats: {
            leadership: 70,
            strength: 40,
            politics: 82,
            intelligence: 98,
            charm: 70
        },
        initialSkills: {
            strategy: 3,
            spy: 2,
            law: 2,
            ritual: 2,
            calligraphy: 2
        },
        initialCards: [],
        exclusiveSecretCard: "SECRET_JILI_MIAOSUAN",
        personality: "智谋",
        faction: null,
        initialRank: "隐士",
        birthDeath: [1311, 1375],
        description: "浙东名士，通天文地理兵法，朱元璋称'吾之子房也'。",
        locationCityId: 2 // 应天
    },
    {
        templateId: "CHEN_YOULIANG",
        id: 9,
        name: "陈友谅",
        emoji: "🐉",
        image: "images/characters/4star/chenyouliang.png",
        portrait: "chenyouliang",
        color: "#c0392b",
        baseStats: {
            leadership: 80,
            strength: 75,
            politics: 60,
            intelligence: 72,
            charm: 68
        },
        initialSkills: {
            navy: 3,
            strategy: 2,
            infantry: 2,
            eloquence: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "豪勇",
        faction: "陈友谅军",
        initialRank: "汉王",
        birthDeath: [1320, 1363],
        description: "元末群雄之一，占据江州武昌，鄱阳湖之战与朱元璋决战。",
        locationCityId: 5 // 江州
    },
    {
        templateId: "ZHANG_SHICHENG",
        id: 10,
        name: "张士诚",
        emoji: "💰",
        image: "images/characters/4star/zhangshicheng.png",
        portrait: "zhangshicheng",
        color: "#16a085",
        baseStats: {
            leadership: 62,
            strength: 58,
            politics: 70,
            intelligence: 65,
            charm: 72
        },
        initialSkills: {
            trade: 3,
            politics: 2,
            eloquence: 2
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "慎重",
        faction: "张士诚军",
        initialRank: "吴王",
        birthDeath: [1321, 1367],
        description: "盐贩出身，占据苏南浙北，割据一方称吴王。",
        locationCityId: 6 // 苏州
    },
    {
        templateId: "WUGUAN_SHIFU",
        id: 101,
        name: "武馆师傅",
        emoji: "🥋",
        image: "images/characters/npc/wuguanshifu.png",
        portrait: "wuguanshifu",
        color: "#8b4513",
        baseStats: {
            leadership: 30,
            strength: 70,
            politics: 30,
            intelligence: 40,
            charm: 50
        },
        initialSkills: {
            martial: 3
        },
        initialCards: ["taizu_boxing", "jin-gang_li"],
        exclusiveSecretCard: null,
        personality: "豪勇",
        faction: "中立",
        initialRank: "武师",
        birthDeath: null,
        description: "濠州城中武馆的教头，自幼习武，拳法娴熟。",
        locationCityId: 1, // 濠州，所有武馆都有他
        belongFacility: '武馆' // 属于武馆，只在武馆显示
    },
    // 第一章核心人物 - 新增15人
    {
        templateId: "LI_WENZHONG",
        id: 11,
        name: "李文忠",
        emoji: "⚔️",
        image: "images/characters/4star/liwenzhong.png",
        portrait: "liwenzhong",
        color: "#50c878",
        baseStats: {
            leadership: 86,
            strength: 82,
            politics: 60,
            intelligence: 78,
            charm: 75
        },
        initialSkills: {
            infantry: 2,
            cavalry: 3,
            strategy: 2,
            martial: 2
        },
        initialCards: [],
        exclusiveSecretCard: "SECRET_QIANLI_BENXI",
        personality: "豪勇",
        faction: "朱元璋军",
        initialRank: "指挥佥事",
        birthDeath: [1339, 1384],
        description: "朱元璋外甥，明朝开国名将，千里奔袭屡破强敌。",
        locationCityId: 1
    },
    {
        templateId: "MU_YING",
        id: 12,
        name: "沐英",
        emoji: "🏹",
        image: "images/characters/4star/muying.png",
        portrait: "muying",
        color: "#8e44ad",
        baseStats: {
            leadership: 82,
            strength: 78,
            politics: 70,
            intelligence: 75,
            charm: 76
        },
        initialSkills: {
            infantry: 2,
            cavalry: 2,
            strategy: 2,
            martial: 2
        },
        initialCards: [],
        exclusiveSecretCard: "SECRET_YUNNAN_PINGDIAN",
        personality: "忠义",
        faction: "朱元璋军",
        initialRank: "千户",
        birthDeath: [1345, 1392],
        description: "明朝开国名将，平定云南，镇守南疆十余年。",
        locationCityId: 1
    },
    {
        templateId: "DENG_YU",
        id: 13,
        name: "邓愈",
        emoji: "🛡️",
        image: "images/characters/4star/dengyu.png",
        portrait: "dengyu",
        color: "#3498db",
        baseStats: {
            leadership: 84,
            strength: 76,
            politics: 65,
            intelligence: 76,
            charm: 78
        },
        initialSkills: {
            infantry: 3,
            cavalry: 2,
            strategy: 2
        },
        initialCards: [],
        exclusiveSecretCard: "SECRET_GUOQI_JINGYUAN",
        personality: "忠义",
        faction: "朱元璋军",
        initialRank: "指挥使",
        birthDeath: [1337, 1377],
        description: "明朝开国功臣，攻守兼备，早年投奔朱元璋，战功赫赫。",
        locationCityId: 1
    },
    {
        templateId: "HU_DAHAI",
        id: 14,
        name: "胡大海",
        emoji: "💪",
        image: "images/characters/4star/hudahai.png",
        portrait: "hudahai",
        color: "#e74c3c",
        baseStats: {
            leadership: 72,
            strength: 92,
            politics: 40,
            intelligence: 55,
            charm: 65
        },
        initialSkills: {
            infantry: 2,
            martial: 3
        },
        initialCards: [],
        exclusiveSecretCard: "SECRET_YONGGUAN_SANJUN",
        personality: "豪勇",
        faction: "朱元璋军",
        initialRank: "指挥使",
        birthDeath: [1302, 1362],
        description: "元末明初朱元璋部将，勇悍善战，可惜早亡于浙东。",
        locationCityId: 2
    },
    {
        templateId: "ZHU_WENZHENG",
        id: 15,
        name: "朱文正",
        emoji: "🏰",
        image: "images/characters/4star/zhuwenzheng.png",
        portrait: "zhuwenzheng",
        color: "#34495e",
        baseStats: {
            leadership: 85,
            strength: 68,
            politics: 72,
            intelligence: 80,
            charm: 60
        },
        initialSkills: {
            infantry: 2,
            strategy: 3,
            engineering: 2
        },
        initialCards: [],
        exclusiveSecretCard: "SECRET_HONGDU_SHOUSHOU",
        personality: "豪勇",
        faction: "朱元璋军",
        initialRank: "都督",
        birthDeath: [1336, 1365],
        description: "朱元璋侄子，洪都保卫战坚守数月，挡住陈友谅六十万大军。",
        locationCityId: 3
    },
    {
        templateId: "LIAO_YONGZHONG",
        id: 16,
        name: "廖永忠",
        emoji: "🌊",
        image: "images/characters/4star/liaoyongzhong.png",
        portrait: "liaoyongzhong",
        color: "#2980b9",
        baseStats: {
            leadership: 83,
            strength: 75,
            politics: 58,
            intelligence: 72,
            charm: 70
        },
        initialSkills: {
            navy: 3,
            infantry: 2,
            strategy: 2
        },
        initialCards: [],
        exclusiveSecretCard: "SECRET_HENGKONG_DUANLANG",
        personality: "慎重",
        faction: "朱元璋军",
        initialRank: "指挥使",
        birthDeath: [1323, 1375],
        description: "明朝开国名将，水战专家，鄱阳湖之战战功卓著。",
        locationCityId: 2
    },
    {
        templateId: "FU_YOUDE",
        id: 17,
        name: "傅友德",
        emoji: "⚔️",
        image: "images/characters/4star/fuyoude.png",
        portrait: "fuyoude",
        color: "#e67e22",
        baseStats: {
            leadership: 88,
            strength: 85,
            politics: 50,
            intelligence: 70,
            charm: 68
        },
        initialSkills: {
            infantry: 2,
            cavalry: 3,
            strategy: 2
        },
        initialCards: [],
        exclusiveSecretCard: "SECRET_PINGSHU_TUZHEN",
        personality: "豪勇",
        faction: "朱元璋军",
        initialRank: "指挥使",
        birthDeath: [1327, 1394],
        description: "明朝开国名将，平四川破云南，百战百胜。",
        locationCityId: 1
    },
    {
        templateId: "FENG_GUOSHENG",
        id: 18,
        name: "冯国胜",
        emoji: "📜",
        image: "images/characters/4star/fengguosheng.png",
        portrait: "fengguosheng",
        color: "#7f8c8d",
        baseStats: {
            leadership: 78,
            strength: 65,
            politics: 70,
            intelligence: 78,
            charm: 72
        },
        initialSkills: {
            strategy: 3,
            infantry: 2
        },
        initialCards: [],
        exclusiveSecretCard: "SECRET_CHUQI_ZHISHENG",
        personality: "慎重",
        faction: "朱元璋军",
        initialRank: "指挥使",
        birthDeath: [1330, 1395],
        description: "明初将领，通晓兵法，随朱元璋多年征战。",
        locationCityId: 1
    },
    {
        templateId: "ZHAO_PUSHENG",
        id: 19,
        name: "赵普胜",
        emoji: "🔱",
        image: "images/characters/4star/zhaopusheng.png",
        portrait: "zhaopusheng",
        color: "#c0392b",
        baseStats: {
            leadership: 75,
            strength: 88,
            politics: 40,
            intelligence: 60,
            charm: 65
        },
        initialSkills: {
            infantry: 2,
            navy: 2,
            martial: 3
        },
        initialCards: [],
        exclusiveSecretCard: "SECRET_FEIJIAN_XIANZHEN",
        personality: "豪勇",
        faction: "陈友谅军",
        initialRank: "太尉",
        birthDeath: [1330, 1359],
        description: "陈友谅麾下猛将，骁勇善战，人称'双刀赵'。",
        locationCityId: 5
    },
    {
        templateId: "ZHANG_DINGBIAN",
        id: 20,
        name: "张定边",
        emoji: "⚓",
        image: "images/characters/5star/zhangdingbian.png",
        portrait: "zhangdingbian",
        color: "#2c3e50",
        baseStats: {
            leadership: 90,
            strength: 95,
            politics: 65,
            intelligence: 80,
            charm: 75
        },
        initialSkills: {
            infantry: 2,
            navy: 3,
            strategy: 2,
            martial: 3
        },
        initialCards: [],
        exclusiveSecretCard: "SECRET_MENGCHONG_MENGJIANG",
        personality: "忠义",
        faction: "陈友谅军",
        initialRank: "太尉",
        birthDeath: [1330, 1363],
        description: "陈友谅第一猛将，鄱阳湖之战孤军深入直取朱元璋，堪称勇猛无双。",
        locationCityId: 5
    },
    {
        templateId: "KANG_MAOC",
        id: 21,
        name: "康茂才",
        emoji: "🚢",
        image: "images/characters/3star/kangmaocai.png",
        portrait: "kangmaocai",
        color: "#95a5a6",
        baseStats: {
            leadership: 65,
            strength: 62,
            politics: 60,
            intelligence: 70,
            charm: 68
        },
        initialSkills: {
            navy: 2,
            infantry: 1
        },
        initialCards: [],
        exclusiveSecretCard: "SECRET_TIE_SHAOGONG",
        personality: "慎重",
        faction: "朱元璋军",
        initialRank: "指挥使",
        birthDeath: [1314, 1370],
        description: "元末降将，投奔朱元璋，江东桥之战诈降立功。",
        locationCityId: 2
    },
    {
        templateId: "HU_WEIYONG",
        id: 22,
        name: "胡惟庸",
        emoji: "📜",
        image: "images/characters/4star/huweiyong.png",
        portrait: "huweiyong",
        color: "#bdc3c7",
        baseStats: {
            leadership: 55,
            strength: 40,
            politics: 85,
            intelligence: 82,
            charm: 70
        },
        initialSkills: {
            politics: 3,
            law: 2,
            eloquence: 2
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "慎重",
        faction: "朱元璋军",
        initialRank: "知县",
        birthDeath: [1330, 1380],
        description: "明初丞相，中国历史上最后一位中书省丞相。",
        locationCityId: 2
    },
    {
        templateId: "WANG_GUANGYANG",
        id: 23,
        name: "汪广洋",
        emoji: "📖",
        image: "images/characters/3star/wangguangyang.png",
        portrait: "wangguangyang",
        color: "#7f8c8d",
        baseStats: {
            leadership: 48,
            strength: 35,
            politics: 72,
            intelligence: 75,
            charm: 65
        },
        initialSkills: {
            politics: 2,
            calligraphy: 2
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "慎重",
        faction: "朱元璋军",
        initialRank: "参政",
        birthDeath: [1310, 1379],
        description: "明初重臣，元末进士，擅长篆隶，为官宽仁持重。",
        locationCityId: 2
    },
    {
        templateId: "GUO_YING",
        id: 24,
        name: "郭英",
        emoji: "🏹",
        image: "images/characters/4star/guoying.png",
        portrait: "guoying",
        color: "#27ae60",
        baseStats: {
            leadership: 72,
            strength: 80,
            politics: 55,
            intelligence: 68,
            charm: 70
        },
        initialSkills: {
            infantry: 2,
            cavalry: 2,
            martial: 2
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "忠义",
        faction: "朱元璋军",
        initialRank: "千户",
        birthDeath: [1335, 1403],
        description: "明初将领，朱元璋同乡，身经百战，屡获战功。",
        locationCityId: 1
    },
    {
        templateId: "LAN_YU",
        id: 25,
        name: "蓝玉",
        emoji: "🎯",
        image: "images/characters/5star/lanyu.png",
        portrait: "lanyu",
        color: "#c0392b",
        baseStats: {
            leadership: 90,
            strength: 88,
            politics: 45,
            intelligence: 70,
            charm: 65
        },
        initialSkills: {
            infantry: 3,
            cavalry: 3,
            strategy: 2
        },
        initialCards: [],
        exclusiveSecretCard: "SECRET_BUYU_ERHAI",
        personality: "豪勇",
        faction: "朱元璋军",
        initialRank: "千户",
        birthDeath: [1340, 1393],
        description: "明初名将，捕鱼儿海大破北元，威震天下。",
        locationCityId: 2
    },
    // ---------- 濠州城平民百姓 ----------
    {
        templateId: "FARMER_ADANIU",
        id: 26,
        name: "阿牛",
        emoji: "🌾",
        image: "images/characters/npc/common-farmer.png",
        portrait: "common-farmer",
        color: "#8b7355",
        baseStats: {
            leadership: 20,
            strength: 45,
            politics: 25,
            intelligence: 30,
            charm: 40
        },
        initialSkills: {
            agriculture: 2
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "平和",
        faction: "平民",
        initialRank: "佃农",
        birthDeath: null,
        description: "濠州城外种田的佃农，老实本分，种得一手好庄稼。",
        locationCityId: 1
    },
    {
        templateId: "FARMER_ERNIU",
        id: 27,
        name: "二牛",
        emoji: "🌾",
        image: "images/characters/npc/common-farmer.png",
        portrait: "common-farmer",
        color: "#8b7355",
        baseStats: {
            leadership: 25,
            strength: 50,
            politics: 20,
            intelligence: 25,
            charm: 35
        },
        initialSkills: {
            agriculture: 1,
            martial: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "豪爽",
        faction: "平民",
        initialRank: "自耕农",
        birthDeath: null,
        description: "阿牛的弟弟，年轻力壮，闲时喜欢练两把拳脚。",
        locationCityId: 1
    },
    {
        templateId: "FISHER_A-GOU",
        id: 28,
        name: "阿狗",
        emoji: "🎣",
        image: "images/characters/npc/common-fisher.png",
        portrait: "common-fisher",
        color: "#4a6fa5",
        baseStats: {
            leadership: 18,
            strength: 42,
            politics: 15,
            intelligence: 35,
            charm: 30
        },
        initialSkills: {
            navigation: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "机灵",
        faction: "平民",
        initialRank: "渔民",
        birthDeath: null,
        description: "淮河上打鱼的渔民，熟悉水情，走船稳当。",
        locationCityId: 1
    },
    {
        templateId: "CARPENTER_TIEZHU",
        id: 29,
        name: "铁柱",
        emoji: "🪓",
        image: "images/characters/npc/common-carpenter.png",
        portrait: "common-carpenter",
        color: "#8b4513",
        baseStats: {
            leadership: 22,
            strength: 55,
            politics: 18,
            intelligence: 40,
            charm: 38
        },
        initialSkills: {
            engineering: 2
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "朴实",
        faction: "平民",
        initialRank: "木匠",
        birthDeath: null,
        description: "濠州城里木匠，手艺好，桌椅板凳农具都能做。",
        locationCityId: 1
    },
    {
        templateId: "BUTCHER_DAKOU",
        id: 30,
        name: "大口",
        emoji: "🔪",
        image: "images/characters/npc/common-butcher.png",
        portrait: "common-butcher",
        color: "#c0392b",
        baseStats: {
            leadership: 28,
            strength: 65,
            politics: 20,
            intelligence: 32,
            charm: 42
        },
        initialSkills: {
            trade: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "豪爽",
        faction: "平民",
        initialRank: "屠夫",
        birthDeath: null,
        description: "濠州猪肉摊子掌柜，力气大，刀子快。",
        locationCityId: 1
    },
    {
        templateId: "BOATMAN_AJIN",
        id: 31,
        name: "阿金",
        emoji: "🚣",
        image: "images/characters/npc/common-boatman.png",
        portrait: "common-boatman",
        color: "#27ae60",
        baseStats: {
            leadership: 20,
            strength: 48,
            politics: 15,
            intelligence: 38,
            charm: 35
        },
        initialSkills: {
            navy: 1,
            navigation: 2
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "谨慎",
        faction: "平民",
        initialRank: "船工",
        birthDeath: null,
        description: "淮河渡口撑船的艄公，往来两岸接送客人。",
        locationCityId: 1
    },
    {
        templateId: "Peddler_LAOLI",
        id: 32,
        name: "老李",
        emoji: "🧺",
        image: "images/characters/npc/common-peddler.png",
        portrait: "common-peddler",
        color: "#f39c12",
        baseStats: {
            leadership: 25,
            strength: 35,
            politics: 30,
            intelligence: 45,
            charm: 50
        },
        initialSkills: {
            trade: 2,
            eloquence: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "圆滑",
        faction: "平民",
        initialRank: "货郎",
        birthDeath: null,
        description: "走街串巷卖杂货，什么小东西都有，嘴甜会说话。",
        locationCityId: 1
    },
    {
        templateId: "TAILOR_GUIYING",
        id: 33,
        name: "桂英",
        emoji: "🧵",
        image: "images/characters/npc/common-tailor.png",
        portrait: "common-tailor",
        color: "#8e44ad",
        baseStats: {
            leadership: 15,
            strength: 25,
            politics: 20,
            intelligence: 45,
            charm: 45
        },
        initialSkills: {
            trade: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "细心",
        faction: "平民",
        initialRank: "裁缝",
        birthDeath: null,
        description: "濠州城里裁缝，量体裁衣，针脚细密。",
        locationCityId: 1
    },
    {
        templateId: "WATCHMAN_WANG_LAOHAN",
        id: 34,
        name: "王老汉",
        emoji: "🥁",
        image: "images/characters/npc/common-watchman.png",
        portrait: "common-watchman",
        color: "#7f8c8d",
        baseStats: {
            leadership: 20,
            strength: 30,
            politics: 25,
            intelligence: 40,
            charm: 35
        },
        initialSkills: {
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "负责",
        faction: "平民",
        initialRank: "更夫",
        birthDeath: null,
        description: "濠州城打更匠，一夜五次锣，平安无事就是功劳。",
        locationCityId: 1
    },
    {
        templateId: "MILKER_XINGHUA",
        id: 35,
        name: "杏花",
        emoji: "🐄",
        image: "images/characters/npc/common-farmer-w.png",
        portrait: "common-farmer-w",
        color: "#f1c40f",
        baseStats: {
            leadership: 12,
            strength: 28,
            politics: 22,
            intelligence: 35,
            charm: 42
        },
        initialSkills: {
            agriculture: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "温柔",
        faction: "平民",
        initialRank: "奶农",
        birthDeath: null,
        description: "城郊养奶牛的村姑，每天送新鲜牛奶进城。",
        locationCityId: 1
    },
    {
        templateId: "Bakery_WU_DA",
        id: 36,
        name: "吴大",
        emoji: "🍞",
        image: "images/characters/npc/common-baker.png",
        portrait: "common-baker",
        color: "#d35400",
        baseStats: {
            leadership: 22,
            strength: 42,
            politics: 20,
            intelligence: 35,
            charm: 40
        },
        initialSkills: {
            trade: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "憨厚",
        faction: "平民",
        initialRank: " baker",
        birthDeath: null,
        description: "濠州城烧饼师傅，烤的烧饼金黄酥脆，香飘一条街。",
        locationCityId: 1
    },
    {
        templateId: "Wine_zhang_lao",
        id: 37,
        name: "张老头",
        emoji: "🍶",
        image: "images/characters/npc/common-wine.png",
        portrait: "common-wine",
        color: "#8e44ad",
        baseStats: {
            leadership: 25,
            strength: 35,
            politics: 30,
            intelligence: 40,
            charm: 55
        },
        initialSkills: {
            trade: 2
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "好客",
        faction: "平民",
        initialRank: "酒家",
        birthDeath: null,
        description: "濠州城西开酒馆，自酿米酒，客人来了都招呼。",
        locationCityId: 1
    },
    {
        templateId: "Doctor_chen",
        id: 38,
        name: "陈大夫",
        emoji: "💊",
        image: "images/characters/npc/common-doctor.png",
        portrait: "common-doctor",
        color: "#27ae60",
        baseStats: {
            leadership: 28,
            strength: 25,
            politics: 35,
            intelligence: 60,
            charm: 50
        },
        initialSkills: {
            medicine: 2
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "仁心",
        faction: "平民",
        initialRank: "郎中",
        birthDeath: null,
        description: "应天府城里祖传郎中，望闻问切，治病救人。",
        locationCityId: 2
    },
    {
        templateId: "Teacher_Zhou",
        id: 39,
        name: "周先生",
        emoji: "📖",
        image: "images/characters/npc/common-teacher.png",
        portrait: "common-teacher",
        color: "#3498db",
        baseStats: {
            leadership: 30,
            strength: 20,
            politics: 40,
            intelligence: 70,
            charm: 55
        },
        initialSkills: {
            calligraphy: 2,
            ritual: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "儒雅",
        faction: "平民",
        initialRank: "私塾先生",
        birthDeath: null,
        description: "应天府城里私塾教书先生，识文断字，教小孩子读书。",
        locationCityId: 2
    },
    {
        templateId: "Guard_XIAOWU",
        id: 40,
        name: "小武",
        emoji: "🪖",
        image: "images/characters/npc/common-guard.png",
        portrait: "common-guard",
        color: "#2c3e50",
        baseStats: {
            leadership: 35,
            strength: 60,
            politics: 20,
            intelligence: 30,
            charm: 35
        },
        initialSkills: {
            infantry: 1,
            martial: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "勇猛",
        faction: "平民",
        initialRank: "城门卫兵",
        birthDeath: null,
        description: "濠州城门守卫，当兵吃粮，检查进出。",
        locationCityId: 1
    },
    {
        templateId: "Beggar_laoliu",
        id: 41,
        name: "老刘头",
        emoji: "🥣",
        image: "images/characters/npc/common-beggar.png",
        portrait: "common-beggar",
        color: "#7f8c8d",
        baseStats: {
            leadership: 15,
            strength: 30,
            politics: 20,
            intelligence: 50,
            charm: 25
        },
        initialSkills: {
            spy: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "逍遥",
        faction: "平民",
        initialRank: "乞丐",
        birthDeath: null,
        description: "应天街头乞丐，走街串巷，消息灵通。",
        locationCityId: 2
    },
    {
        templateId: "Shepherd_guai",
        id: 42,
        name: "拐子",
        emoji: "🐑",
        image: "images/characters/npc/common-shepherd.png",
        portrait: "common-shepherd",
        color: "#aed6af",
        baseStats: {
            leadership: 10,
            strength: 35,
            politics: 10,
            intelligence: 30,
            charm: 28
        },
        initialSkills: {
            agriculture: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "孤独",
        faction: "平民",
        initialRank: "羊倌",
        birthDeath: null,
        description: "洛阳邙山山坡放羊，早出晚归。",
        locationCityId: 4
    },
    {
        templateId: "Miner_Gouzi",
        id: 43,
        name: "狗子",
        emoji: "⛏️",
        image: "images/characters/npc/common-miner.png",
        portrait: "common-miner",
        color: "#5d4037",
        baseStats: {
            leadership: 22,
            strength: 58,
            politics: 15,
            intelligence: 28,
            charm: 30
        },
        initialSkills: {
            engineering: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "耿直",
        faction: "平民",
        initialRank: "矿工",
        birthDeath: null,
        description: "大同煤矿挖煤，一身黑，力气大。",
        locationCityId: 7
    },
    {
        templateId: "Pottery_San",
        id: 44,
        name: "阿三",
        emoji: "🏺",
        image: "images/characters/npc/common-potter.png",
        portrait: "common-potter",
        color: "#d35400",
        baseStats: {
            leadership: 18,
            strength: 45,
            politics: 20,
            intelligence: 38,
            charm: 32
        },
        initialSkills: {
            trade: 1,
            engineering: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "耐心",
        faction: "平民",
        initialRank: "陶匠",
        birthDeath: null,
        description: "景德镇陶窑烧陶罐瓷器，手艺祖传。",
        locationCityId: 8
    },
    {
        templateId: "Cotton_meiying",
        id: 45,
        name: "美英",
        emoji: "🧶",
        image: "images/characters/npc/common-weaver.png",
        portrait: "common-weaver",
        color: "#9b59b6",
        baseStats: {
            leadership: 10,
            strength: 25,
            politics: 18,
            intelligence: 40,
            charm: 45
        },
        initialSkills: {
            trade: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "勤劳",
        faction: "平民",
        initialRank: "织女",
        birthDeath: null,
        description: "松江织布纺线，织出来的布细密平整。",
        locationCityId: 9
    },
    // 洛阳新增 - 酒馆老板
    {
        templateId: "Tavern_wang",
        id: 46,
        name: "王掌柜",
        emoji: "🍶",
        image: "images/characters/npc/common-tavern.png",
        portrait: "common-tavern",
        color: "#8e44ad",
        baseStats: {
            leadership: 40,
            strength: 35,
            politics: 50,
            intelligence: 55,
            charm: 65
        },
        initialSkills: {
            trade: 2,
            charm: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "圆滑",
        faction: "平民",
        initialRank: "酒馆掌柜",
        birthDeath: null,
        description: "洛阳城好酒菜馆掌柜，三教九流都能结交，消息灵通。",
        locationCityId: 4
    },
    // 大同新增 - 皮匠
    {
        templateId: "Leather_lao",
        id: 47,
        name: "老皮",
        emoji: "👢",
        image: "images/characters/npc/common-leather.png",
        portrait: "common-leather",
        color: "#795548",
        baseStats: {
            leadership: 15,
            strength: 48,
            politics: 18,
            intelligence: 35,
            charm: 28
        },
        initialSkills: {
            trade: 2,
            engineering: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "踏实",
        faction: "平民",
        initialRank: "皮匠",
        birthDeath: null,
        description: "大同边城皮匠，熟皮子做靴鞋，给过往商客修补马具。",
        locationCityId: 7
    },
    // 景德镇新增 - 窑主
    {
        templateId: "Kiln_master_chen",
        id: 48,
        name: "陈窑主",
        emoji: "🔥",
        image: "images/characters/npc/common-kiln.png",
        portrait: "common-kiln",
        color: "#e65100",
        baseStats: {
            leadership: 50,
            strength: 40,
            politics: 35,
            intelligence: 52,
            charm: 48
        },
        initialSkills: {
            trade: 2,
            engineering: 2
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "精明",
        faction: "平民",
        initialRank: "窑主",
        birthDeath: null,
        description: "景德镇瓷窑主人，经营瓷窑多年，烧制的青花瓷远销海外。",
        locationCityId: 8
    },
    // 松江新增 - 船老大
    {
        templateId: "Boat_captain_he",
        id: 49,
        name: "何老大",
        emoji: "🚢",
        image: "images/characters/npc/common-boat.png",
        portrait: "common-boat",
        color: "#283593",
        baseStats: {
            leadership: 55,
            strength: 60,
            politics: 25,
            intelligence: 42,
            charm: 40
        },
        initialSkills: {
            navigation: 2,
            trade: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "豪爽",
        faction: "平民",
        initialRank: "船老大",
        birthDeath: null,
        description: "松江水运船老大，跑运河往返南北，见过不少世面。",
        locationCityId: 9
    }
];

/**
 * 根据模板ID获取人物模板
 * @param {string} templateId
 * @returns {CharacterTemplate|undefined}
 */
window.getCharacterTemplateById = function getCharacterTemplateById(templateId) {
    return window.CHARACTER_TEMPLATES.find(c => c.templateId === templateId);
};

/**
 * 根据数字ID获取人物模板
 * @param {number} id
 * @returns {CharacterTemplate|undefined}
 */
window.getCharacterTemplateByNumId = function getCharacterTemplateByNumId(id) {
    return window.CHARACTER_TEMPLATES.find(c => c.id === id);
};

/**
 * 获取所有人物模板
 * @returns {CharacterTemplate[]}
 */
window.getAllCharacterTemplates = function getAllCharacterTemplates() {
    return window.CHARACTER_TEMPLATES;
};

/**
 * 根据势力获取该势力所有人物模板
 * @param {string} factionName
 * @returns {CharacterTemplate[]}
 */
window.getCharacterTemplatesByFaction = function getCharacterTemplatesByFaction(factionName) {
    return window.CHARACTER_TEMPLATES.filter(c => c.faction === factionName);
};


