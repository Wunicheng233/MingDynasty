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
const CHARACTER_TEMPLATES = [
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
        locationCityId: 1 // 濠州，所有武馆都有他
    }
];

/**
 * 根据模板ID获取人物模板
 * @param {string} templateId
 * @returns {CharacterTemplate|undefined}
 */
window.getCharacterTemplateById = function getCharacterTemplateById(templateId) {
    return CHARACTER_TEMPLATES.find(c => c.templateId === templateId);
};

/**
 * 根据数字ID获取人物模板
 * @param {number} id
 * @returns {CharacterTemplate|undefined}
 */
window.getCharacterTemplateByNumId = function getCharacterTemplateByNumId(id) {
    return CHARACTER_TEMPLATES.find(c => c.id === id);
};

/**
 * 获取所有人物模板
 * @returns {CharacterTemplate[]}
 */
window.getAllCharacterTemplates = function getAllCharacterTemplates() {
    return CHARACTER_TEMPLATES;
};

/**
 * 根据势力获取该势力所有人物模板
 * @param {string} factionName
 * @returns {CharacterTemplate[]}
 */
window.getCharacterTemplatesByFaction = function getCharacterTemplatesByFaction(factionName) {
    return CHARACTER_TEMPLATES.filter(c => c.faction === factionName);
};


