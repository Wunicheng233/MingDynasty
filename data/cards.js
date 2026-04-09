/**
 * 卡片库 - 静态数据
 * Card library (static data)
 * 按照核心数据层设计：统一管理所有600+卡片的定义，各系统通过card_id引用
 */

/**
 * 卡片类型枚举
 * 按照策划设计：共9种卡片类型
 */
const CardTypes = {
    CHARACTER: 'character',        // 人物卡 - 解锁可扮演角色
    SKILL: 'skill',              // 技能卡 - 收集图鉴用
    TACTIC_BATTLE: 'tactic_battle', // 合战战术卡 - 红色特殊效果卡
    MARTIAL_DUEL: 'martial_duel',  // 个人战武技卡 - 红色特殊技卡
    SECRET: 'secret',            // 秘传卡 - 名将专属金卡
    TITLE: 'title',              // 称号卡 - 达成条件后获得
    PLACE: 'place',              // 名所卡 - 名胜古迹
    EVENT: 'event',              // 事件卡 - 记录重大历史事件
    TREASURE: 'treasure'         // 宝物卡 - 贵重物品，可送礼/装备
};

/**
 * 卡片基础接口 - 所有卡片共有字段
 * @typedef {Object} Card
 * @property {string} card_id - 卡片ID (全局唯一)
 * @property {string} name - 卡片名称
 * @property {string} type - 卡片类型 (CardTypes)
 * @property {number} rarity - 稀有度 1-5星
 * @property {string} description - 卡片描述
 * @property {string} acquire_hint - 获取提示文本（图鉴显示）
 * @property {boolean} is_hidden - 是否隐藏（未获得时不显示）
 * @property {Object|null} unlock_condition - 解锁条件
 * @property {string} emoji - 图标Emoji
 */

/**
 * 所有卡片定义
 * 按照策划设计，先定义第一章核心卡片
 * @type {Card[]}
 */
const CARD_LIBRARY = [
    // ========== 人物卡 ==========
    {
        card_id: "CHAR_ZHU_YUANZHANG",
        name: "朱元璋",
        type: CardTypes.CHARACTER,
        rarity: 5,
        description: "明朝开国皇帝，从乞丐到皇帝的传奇人生。",
        acquire_hint: "第一章主角初始拥有。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "👨",
        portrait: "zhuyuanzhang",
        base_stats: { leadership: 85, strength: 78, politics: 72, intelligence: 80, charm: 82 },
        initial_skills: { infantry: 2, cavalry: 1, strategy: 2, martial: 2, engineering: 1, spy: 1 },
        faction: "朱元璋军",
        personality: "豪勇",
        exclusive_secret: "SECRET_HONGWU_KAITIAN",
        unlock_playable: true
    },
    {
        card_id: "CHAR_XU_DA",
        name: "徐达",
        type: CardTypes.CHARACTER,
        rarity: 5,
        description: "明朝开国第一功臣，用兵如神，被誉为'万里长城'。",
        acquire_hint: "与徐达亲密度达到3心，或完成北伐剧情。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🗡️",
        portrait: "xuda",
        base_stats: { leadership: 99, strength: 90, politics: 70, intelligence: 88, charm: 85 },
        initial_skills: { infantry: 3, cavalry: 3, navy: 2, firearm: 1, strategy: 3, martial: 3 },
        faction: "朱元璋军",
        personality: "忠义",
        exclusive_secret: "SECRET_BEIFA_TUJIN",
        unlock_playable: true
    },
    {
        card_id: "CHAR_CHANG_YUCHUN",
        name: "常遇春",
        type: CardTypes.CHARACTER,
        rarity: 5,
        description: "人称'常十万'，单骑突阵，勇猛无前。",
        acquire_hint: "与常遇春亲密度达到3心。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "⚔️",
        portrait: "changyuchun",
        base_stats: { leadership: 92, strength: 100, politics: 40, intelligence: 72, charm: 78 },
        initial_skills: { infantry: 3, cavalry: 3, strategy: 2, martial: 3 },
        faction: "朱元璋军",
        personality: "豪勇",
        exclusive_secret: "SECRET_CHANG_100K",
        unlock_playable: true
    },
    {
        card_id: "CHAR_LIU_BOWEN",
        name: "刘伯温",
        type: CardTypes.CHARACTER,
        rarity: 5,
        description: "浙东名士，通天文地理兵法，朱元璋称'吾之子房也'。",
        acquire_hint: "三顾茅庐请出刘伯温后获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🔮",
        portrait: "liubowen",
        base_stats: { leadership: 70, strength: 40, politics: 82, intelligence: 98, charm: 70 },
        initial_skills: { strategy: 3, spy: 2, law: 2, ritual: 2 },
        faction: "朱元璋军",
        personality: "智谋",
        exclusive_secret: "SECRET_JILI_MIAOSUAN",
        unlock_playable: true
    },
    {
        card_id: "CHAR_CHEN_YOULIANG",
        name: "陈友谅",
        type: CardTypes.CHARACTER,
        rarity: 4,
        description: "元末群雄之一，占据江州武昌，鄱阳湖之战与朱元璋决战。",
        acquire_hint: "鄱阳湖之战击败陈友谅后获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🐉",
        portrait: "chenyouliang",
        base_stats: { leadership: 80, strength: 75, politics: 60, intelligence: 72, charm: 68 },
        initial_skills: { navy: 3, strategy: 2, infantry: 2 },
        faction: "陈友谅军",
        personality: "豪勇",
        exclusive_secret: null,
        unlock_playable: true
    },
    {
        card_id: "CHAR_TANG_HE",
        name: "汤和",
        type: CardTypes.CHARACTER,
        rarity: 4,
        description: "朱元璋同乡，开国功臣，深谙激流勇退之道。",
        acquire_hint: "与汤和亲密度达到3心。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "👮",
        portrait: "tanghe",
        base_stats: { leadership: 68, strength: 75, politics: 62, intelligence: 70, charm: 75 },
        initial_skills: { infantry: 2, cavalry: 1, navy: 2, strategy: 2, martial: 2 },
        faction: "郭子兴军",
        personality: "慎重",
        exclusive_secret: null,
        unlock_playable: true
    },
    {
        card_id: "CHAR_GUO_ZIXING",
        name: "郭子兴",
        type: CardTypes.CHARACTER,
        rarity: 3,
        description: "濠州红巾军领袖，朱元璋的岳父与伯乐。",
        acquire_hint: "开局结识，亲密度达到3心获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "👴",
        portrait: "guozixing",
        base_stats: { leadership: 68, strength: 65, politics: 62, intelligence: 70, charm: 75 },
        initial_skills: { infantry: 2, strategy: 2, eloquence: 2 },
        faction: "郭子兴军",
        personality: "慎重",
        exclusive_secret: null,
        unlock_playable: false
    },
    {
        card_id: "CHAR_MA_XIUYING",
        name: "马秀英",
        type: CardTypes.CHARACTER,
        rarity: 4,
        description: "郭子兴义女，后来的孝慈高皇后，朱元璋的贤内助。",
        acquire_hint: "与马秀英结婚后获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "👩",
        portrait: "maxiuying",
        base_stats: { leadership: 55, strength: 40, politics: 85, intelligence: 80, charm: 90 },
        initial_skills: { eloquence: 2, politics: 3, ritual: 2 },
        faction: "郭子兴军",
        personality: "忠义",
        exclusive_secret: null,
        unlock_playable: false
    },
    {
        card_id: "CHAR_LI_SHANCHANG",
        name: "李善长",
        type: CardTypes.CHARACTER,
        rarity: 4,
        description: "朱元璋麾下首席谋臣，负责后勤财政，可比萧何。",
        acquire_hint: "结识后亲密度达到3心获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "📜",
        portrait: "lishanchang",
        base_stats: { leadership: 58, strength: 30, politics: 92, intelligence: 85, charm: 72 },
        initial_skills: { politics: 3, eloquence: 2, law: 2, trade: 1 },
        faction: "郭子兴军",
        personality: "慎重",
        exclusive_secret: null,
        unlock_playable: true
    },
    {
        card_id: "CHAR_ZHANG_SHICHENG",
        name: "张士诚",
        type: CardTypes.CHARACTER,
        rarity: 4,
        description: "盐贩出身，占据苏南浙北，割据一方称吴王。",
        acquire_hint: "击败张士诚后获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "💰",
        portrait: "zhangshicheng",
        base_stats: { leadership: 62, strength: 58, politics: 70, intelligence: 65, charm: 72 },
        initial_skills: { trade: 3, politics: 2, eloquence: 2 },
        faction: "张士诚军",
        personality: "慎重",
        exclusive_secret: null,
        unlock_playable: true
    },

    // ========== 技能卡 - 16项技能 × 3等级 ==========
    // 步战
    {
        card_id: "SKILL_INFANTRY_1",
        name: "步战·一级",
        type: CardTypes.SKILL,
        rarity: 1,
        description: "步战技能一级，解锁基础阵型。",
        acquire_hint: "步战技能升级到一级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "👟"
    },
    {
        card_id: "SKILL_INFANTRY_2",
        name: "步战·二级",
        type: CardTypes.SKILL,
        rarity: 2,
        description: "步战技能二级，解锁高级阵型。",
        acquire_hint: "步战技能升级到二级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "👟"
    },
    {
        card_id: "SKILL_INFANTRY_3",
        name: "步战·三级",
        type: CardTypes.SKILL,
        rarity: 3,
        description: "步战技能三级，解锁顶级阵型。",
        acquire_hint: "步战技能升级到三级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "👟"
    },
    // 骑战
    {
        card_id: "SKILL_CAVALRY_1",
        name: "骑战·一级",
        type: CardTypes.SKILL,
        rarity: 1,
        description: "骑战技能一级。",
        acquire_hint: "骑战技能升级到一级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🐎"
    },
    {
        card_id: "SKILL_CAVALRY_2",
        name: "骑战·二级",
        type: CardTypes.SKILL,
        rarity: 2,
        description: "骑战技能二级。",
        acquire_hint: "骑战技能升级到二级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🐎"
    },
    {
        card_id: "SKILL_CAVALRY_3",
        name: "骑战·三级",
        type: CardTypes.SKILL,
        rarity: 3,
        description: "骑战技能三级。",
        acquire_hint: "骑战技能升级到三级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🐎"
    },
    // 水战
    {
        card_id: "SKILL_NAVY_1",
        name: "水战·一级",
        type: CardTypes.SKILL,
        rarity: 1,
        description: "水战技能一级。",
        acquire_hint: "水战技能升级到一级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🚢"
    },
    {
        card_id: "SKILL_NAVY_2",
        name: "水战·二级",
        type: CardTypes.SKILL,
        rarity: 2,
        description: "水战技能二级。",
        acquire_hint: "水战技能升级到二级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🚢"
    },
    {
        card_id: "SKILL_NAVY_3",
        name: "水战·三级",
        type: CardTypes.SKILL,
        rarity: 3,
        description: "水战技能三级。",
        acquire_hint: "水战技能升级到三级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🚢"
    },
    // 火器
    {
        card_id: "SKILL_FIREARM_1",
        name: "火器·一级",
        type: CardTypes.SKILL,
        rarity: 1,
        description: "火器使用技能一级。",
        acquire_hint: "火器技能升级到一级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "💥"
    },
    {
        card_id: "SKILL_FIREARM_2",
        name: "火器·二级",
        type: CardTypes.SKILL,
        rarity: 2,
        description: "火器使用技能二级。",
        acquire_hint: "火器技能升级到二级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "💥"
    },
    {
        card_id: "SKILL_FIREARM_3",
        name: "火器·三级",
        type: CardTypes.SKILL,
        rarity: 3,
        description: "火器使用技能三级。",
        acquire_hint: "火器技能升级到三级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "💥"
    },
    // 兵法
    {
        card_id: "SKILL_STRATEGY_1",
        name: "兵法·一级",
        type: CardTypes.SKILL,
        rarity: 1,
        description: "兵法技能一级，增加秘策使用次数。",
        acquire_hint: "兵法技能升级到一级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "📜"
    },
    {
        card_id: "SKILL_STRATEGY_2",
        name: "兵法·二级",
        type: CardTypes.SKILL,
        rarity: 2,
        description: "兵法技能二级。",
        acquire_hint: "兵法技能升级到二级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "📜"
    },
    {
        card_id: "SKILL_STRATEGY_3",
        name: "兵法·三级",
        type: CardTypes.SKILL,
        rarity: 3,
        description: "兵法技能三级。",
        acquire_hint: "兵法技能升级到三级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "📜"
    },
    // 武艺
    {
        card_id: "SKILL_MARTIAL_1",
        name: "武艺·一级",
        type: CardTypes.SKILL,
        rarity: 1,
        description: "武艺技能一级，增加手牌上限。",
        acquire_hint: "武艺技能升级到一级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🥊"
    },
    {
        card_id: "SKILL_MARTIAL_2",
        name: "武艺·二级",
        type: CardTypes.SKILL,
        rarity: 2,
        description: "武艺技能二级。",
        acquire_hint: "武艺技能升级到二级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🥊"
    },
    {
        card_id: "SKILL_MARTIAL_3",
        name: "武艺·三级",
        type: CardTypes.SKILL,
        rarity: 3,
        description: "武艺技能三级。",
        acquire_hint: "武艺技能升级到三级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🥊"
    },
    // 医术
    {
        card_id: "SKILL_MEDICINE_1",
        name: "医术·一级",
        type: CardTypes.SKILL,
        rarity: 1,
        description: "医术技能一级。",
        acquire_hint: "医术技能升级到一级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "💊"
    },
    {
        card_id: "SKILL_MEDICINE_2",
        name: "医术·二级",
        type: CardTypes.SKILL,
        rarity: 2,
        description: "医术技能二级。",
        acquire_hint: "医术技能升级到二级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "💊"
    },
    {
        card_id: "SKILL_MEDICINE_3",
        name: "医术·三级",
        type: CardTypes.SKILL,
        rarity: 3,
        description: "医术技能三级。",
        acquire_hint: "医术技能升级到三级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "💊"
    },
    // 密探
    {
        card_id: "SKILL_SPY_1",
        name: "密探·一级",
        type: CardTypes.SKILL,
        rarity: 1,
        description: "潜入刺探技能一级。",
        acquire_hint: "密探技能升级到一级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🕵️"
    },
    {
        card_id: "SKILL_SPY_2",
        name: "密探·二级",
        type: CardTypes.SKILL,
        rarity: 2,
        description: "潜入刺探技能二级。",
        acquire_hint: "密探技能升级到二级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🕵️"
    },
    {
        card_id: "SKILL_SPY_3",
        name: "密探·三级",
        type: CardTypes.SKILL,
        rarity: 3,
        description: "潜入刺探技能三级。",
        acquire_hint: "密探技能升级到三级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🕵️"
    },
    // 农政
    {
        card_id: "SKILL_AGRICULTURE_1",
        name: "农政·一级",
        type: CardTypes.SKILL,
        rarity: 1,
        description: "农政技能一级。",
        acquire_hint: "农政技能升级到一级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🌾"
    },
    {
        card_id: "SKILL_AGRICULTURE_2",
        name: "农政·二级",
        type: CardTypes.SKILL,
        rarity: 2,
        description: "农政技能二级。",
        acquire_hint: "农政技能升级到二级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🌾"
    },
    {
        card_id: "SKILL_AGRICULTURE_3",
        name: "农政·三级",
        type: CardTypes.SKILL,
        rarity: 3,
        description: "农政技能三级。",
        acquire_hint: "农政技能升级到三级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🌾"
    },
    // 工政
    {
        card_id: "SKILL_ENGINEERING_1",
        name: "工政·一级",
        type: CardTypes.SKILL,
        rarity: 1,
        description: "工程建设技能一级。",
        acquire_hint: "工政技能升级到一级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🏗️"
    },
    {
        card_id: "SKILL_ENGINEERING_2",
        name: "工政·二级",
        type: CardTypes.SKILL,
        rarity: 2,
        description: "工程建设技能二级。",
        acquire_hint: "工政技能升级到二级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🏗️"
    },
    {
        card_id: "SKILL_ENGINEERING_3",
        name: "工政·三级",
        type: CardTypes.SKILL,
        rarity: 3,
        description: "工程建设技能三级。",
        acquire_hint: "工政技能升级到三级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🏗️"
    },
    // 商政
    {
        card_id: "SKILL_TRADE_1",
        name: "商政·一级",
        type: CardTypes.SKILL,
        rarity: 1,
        description: "商业贸易技能一级。",
        acquire_hint: "商政技能升级到一级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "💰"
    },
    {
        card_id: "SKILL_TRADE_2",
        name: "商政·二级",
        type: CardTypes.SKILL,
        rarity: 2,
        description: "商业贸易技能二级。",
        acquire_hint: "商政技能升级到二级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "💰"
    },
    {
        card_id: "SKILL_TRADE_3",
        name: "商政·三级",
        type: CardTypes.SKILL,
        rarity: 3,
        description: "商业贸易技能三级。",
        acquire_hint: "商政技能升级到三级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "💰"
    },
    // 律政
    {
        card_id: "SKILL_LAW_1",
        name: "律政·一级",
        type: CardTypes.SKILL,
        rarity: 1,
        description: "律法断案技能一级。",
        acquire_hint: "律政技能升级到一级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "⚖️"
    },
    {
        card_id: "SKILL_LAW_2",
        name: "律政·二级",
        type: CardTypes.SKILL,
        rarity: 2,
        description: "律法断案技能二级。",
        acquire_hint: "律政技能升级到二级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "⚖️"
    },
    {
        card_id: "SKILL_LAW_3",
        name: "律政·三级",
        type: CardTypes.SKILL,
        rarity: 3,
        description: "律法断案技能三级。",
        acquire_hint: "律政技能升级到三级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "⚖️"
    },
    // 口才
    {
        card_id: "SKILL_ELOQUENCE_1",
        name: "口才·一级",
        type: CardTypes.SKILL,
        rarity: 1,
        description: "游说辩论技能一级。",
        acquire_hint: "口才技能升级到一级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🗣️"
    },
    {
        card_id: "SKILL_ELOQUENCE_2",
        name: "口才·二级",
        type: CardTypes.SKILL,
        rarity: 2,
        description: "游说辩论技能二级。",
        acquire_hint: "口才技能升级到二级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🗣️"
    },
    {
        card_id: "SKILL_ELOQUENCE_3",
        name: "口才·三级",
        type: CardTypes.SKILL,
        rarity: 3,
        description: "游说辩论技能三级。",
        acquire_hint: "口才技能升级到三级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🗣️"
    },
    // 礼制
    {
        card_id: "SKILL_RITUAL_1",
        name: "礼制·一级",
        type: CardTypes.SKILL,
        rarity: 1,
        description: "朝仪礼法技能一级。",
        acquire_hint: "礼制技能升级到一级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🏛️"
    },
    {
        card_id: "SKILL_RITUAL_2",
        name: "礼制·二级",
        type: CardTypes.SKILL,
        rarity: 2,
        description: "朝仪礼法技能二级。",
        acquire_hint: "礼制技能升级到二级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🏛️"
    },
    {
        card_id: "SKILL_RITUAL_3",
        name: "礼制·三级",
        type: CardTypes.SKILL,
        rarity: 3,
        description: "朝仪礼法技能三级。",
        acquire_hint: "礼制技能升级到三级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🏛️"
    },
    // 航海
    {
        card_id: "SKILL_NAVIGATION_1",
        name: "航海·一级",
        type: CardTypes.SKILL,
        rarity: 1,
        description: "远洋航海技能一级。",
        acquire_hint: "航海技能升级到一级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🧭"
    },
    {
        card_id: "SKILL_NAVIGATION_2",
        name: "航海·二级",
        type: CardTypes.SKILL,
        rarity: 2,
        description: "远洋航海技能二级。",
        acquire_hint: "航海技能升级到二级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🧭"
    },
    {
        card_id: "SKILL_NAVIGATION_3",
        name: "航海·三级",
        type: CardTypes.SKILL,
        rarity: 3,
        description: "远洋航海技能三级。",
        acquire_hint: "航海技能升级到三级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🧭"
    },
    // 文墨
    {
        card_id: "SKILL_CALLIGRAPHY_1",
        name: "文墨·一级",
        type: CardTypes.SKILL,
        rarity: 1,
        description: "文书书法技能一级。",
        acquire_hint: "文墨技能升级到一级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "✍️"
    },
    {
        card_id: "SKILL_CALLIGRAPHY_2",
        name: "文墨·二级",
        type: CardTypes.SKILL,
        rarity: 2,
        description: "文书书法技能二级。",
        acquire_hint: "文墨技能升级到二级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "✍️"
    },
    {
        card_id: "SKILL_CALLIGRAPHY_3",
        name: "文墨·三级",
        type: CardTypes.SKILL,
        rarity: 3,
        description: "文书书法技能三级。",
        acquire_hint: "文墨技能升级到三级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "✍️"
    },

    // ========== 合战战术卡 ==========
    {
        card_id: "TACTIC_FIRE_ATTACK",
        name: "火攻",
        type: CardTypes.TACTIC_BATTLE,
        rarity: 3,
        description: "伤害×1.5，攻城时城防-3。",
        acquire_hint: "工政Lv1师事习得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🔥",
        color: "red",
        duration: "instant",
        effect: { damage_multiplier: 1.5, castle_defense_damage: 3 },
        acquire: { method: "learn", skill: "engineering", level: 1 }
    },
    {
        card_id: "TACTIC_AMBUSCADE",
        name: "伏兵",
        type: CardTypes.TACTIC_BATTLE,
        rarity: 2,
        description: "常驻卡，防御力×1.2，持续到被覆盖。",
        acquire_hint: "步战Lv1师事习得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🌳",
        color: "red",
        duration: "permanent",
        effect: { defense_multiplier: 1.2 },
        acquire: { method: "learn", skill: "infantry", level: 1 }
    },
    {
        card_id: "TACTIC_THREE_LINE_SHOT",
        name: "三段击",
        type: CardTypes.TACTIC_BATTLE,
        rarity: 4,
        description: "火器三连击，守城时伤害翻倍。",
        acquire_hint: "火器Lv2师事习得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "💥",
        color: "red",
        duration: "instant",
        effect: { hits: 3, damage_multiplier: 1.0, castle_bonus: 2.0 },
        acquire: { method: "learn", skill: "firearm", level: 2 }
    },
    {
        card_id: "TACTIC_CAVALRY_CHARGE",
        name: "马军突袭",
        type: CardTypes.TACTIC_BATTLE,
        rarity: 2,
        description: "骑兵伤害×1.5，先手概率提升。",
        acquire_hint: "骑战Lv1师事习得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🏇",
        color: "red",
        duration: "instant",
        effect: { cavalry_multiplier: 1.5, first_strike_bonus: 0.2 },
        acquire: { method: "learn", skill: "cavalry", level: 1 }
    },
    {
        card_id: "TACTIC_TEN_AMBUSH",
        name: "十面埋伏",
        type: CardTypes.TACTIC_BATTLE,
        rarity: 3,
        description: "常驻卡，攻击力×1.2，持续到被覆盖。",
        acquire_hint: "步战Lv2师事习得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🌲",
        color: "red",
        duration: "permanent",
        effect: { attack_multiplier: 1.2 },
        acquire: { method: "learn", skill: "infantry", level: 2 }
    },
    {
        card_id: "TACTIC_HIGH_WALL",
        name: "高垒深沟",
        type: CardTypes.TACTIC_BATTLE,
        rarity: 4,
        description: "常驻卡，守城时防御力×1.5。",
        acquire_hint: "工政Lv3师事习得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🧱",
        color: "red",
        duration: "permanent",
        effect: { defense_multiplier: 1.5, castle_only: true },
        acquire: { method: "learn", skill: "engineering", level: 3 }
    },

    // ========== 个人战武技卡 ==========
    {
        card_id: "MARTIAL_TAIZU_CHANGQUAN",
        name: "太祖长拳",
        type: CardTypes.MARTIAL_DUEL,
        rarity: 2,
        description: "基础连击，伤害稳定。",
        acquire_hint: "武艺Lv1任意武馆师事习得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "👊",
        priority: "B",
        effect: { hits: 2, base_damage: 18 },
        acquire: { method: "learn", skill: "martial", level: 1, location: "任意武馆" }
    },
    {
        card_id: "MARTIAL_IRON_SHIRT",
        name: "铁布衫",
        type: CardTypes.MARTIAL_DUEL,
        rarity: 2,
        description: "本回合防御力+50%。",
        acquire_hint: "武艺Lv2师事习得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🛡️",
        priority: "B",
        effect: { defense_multiplier: 1.5 },
        acquire: { method: "learn", skill: "martial", level: 2 }
    },
    {
        card_id: "MARTIAL_TIAOHU",
        name: "脱袍让位",
        type: CardTypes.MARTIAL_DUEL,
        rarity: 3,
        description: "本回合完全防御对手一次攻击，并反击。",
        acquire_hint: "武艺Lv3师事习得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🤼",
        priority: "A",
        effect: { counter_attack: true, full_defense: true },
        acquire: { method: "learn", skill: "martial", level: 3 }
    },
    {
        card_id: "MARTIAL_XIONG_QUAN",
        name: "铁砂掌",
        type: CardTypes.MARTIAL_DUEL,
        rarity: 3,
        description: "单次高伤害伤害+50%。",
        acquire_hint: "少林寺师事习得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "✋",
        priority: "A",
        effect: { damage_multiplier: 1.5 },
        acquire: { method: "learn", skill: "martial", location: "少林寺" }
    },

    // ========== 秘传卡 ==========
    {
        card_id: "SECRET_BEIFA_TUJIN",
        name: "北伐突进",
        type: CardTypes.SECRET,
        rarity: 5,
        description: "徐达专属，三连击，每击提升10%伤害，无视阵型防御。",
        acquire_hint: "拥有徐达人物卡，武艺Lv3，在'北伐'事件后切磋胜利习得。",
        is_hidden: true,
        unlock_condition: { required_card: "CHAR_XU_DA", required_event: "EVENT_NORTHERN_EXPEDITION", min_skill: { martial: 3 } },
        emoji: "🚀",
        exclusive_to: "CHAR_XU_DA",
        priority: "S",
        effect: { hits: 3, damage_scale: [1.0, 1.1, 1.2], ignore_defense: true }
    },
    {
        card_id: "SECRET_CHANG_100K",
        name: "常十万",
        type: CardTypes.SECRET,
        rarity: 5,
        description: "常遇春专属，单次极高伤害，20%概率触发即死（目标体力<30%）。",
        acquire_hint: "拥有常遇春人物卡，武艺Lv3，切磋胜利习得。",
        is_hidden: true,
        unlock_condition: { required_card: "CHAR_CHANG_YUCHUN", min_skill: { martial: 3 } },
        emoji: "💥",
        exclusive_to: "CHAR_CHANG_YUCHUN",
        priority: "S",
        effect: { hits: 1, damage_multiplier: 2.5, execution: { condition: "target_hp_percent < 30", effect: "instant_kill" } }
    },
    {
        card_id: "SECRET_HONGWU_KAITIAN",
        name: "洪武开天",
        type: CardTypes.SECRET,
        rarity: 5,
        description: "朱元璋专属，究极四连击，使用后本场战斗无法再使用秘传卡。",
        acquire_hint: "主线剧情'登基称帝'后自动习得。",
        is_hidden: true,
        unlock_condition: { required_event: "EVENT_FOUND_MING" },
        emoji: "👑",
        exclusive_to: "CHAR_ZHU_YUANZHANG",
        priority: "S",
        effect: { hits: 4, damage_multiplier: 1.2 }
    },

    // ========== 称号卡 ==========
    {
        card_id: "TITLE_RUSTIC",
        name: "乡勇",
        type: CardTypes.TITLE,
        rarity: 1,
        description: "个人战胜利5次获得，武力+1。",
        acquire_hint: "个人战累计胜利5次。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🏹",
        effect: { strength: 1 }
    },
    {
        card_id: "TITLE_HERO",
        name: "豪侠",
        type: CardTypes.TITLE,
        rarity: 2,
        description: "个人战胜利50次获得，武力+5，魅力+2。",
        acquire_hint: "个人战累计胜利50次，且击败至少一位知名武将。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🗡️",
        effect: { strength: 5, charm: 2 }
    },
    {
        card_id: "TITLE_STRATEGIST",
        name: "策士",
        type: CardTypes.TITLE,
        rarity: 2,
        description: "合战胜利10次获得，统率+3。",
        acquire_hint: "合战累计胜利10次。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "📜",
        effect: { leadership: 3 }
    },
    {
        card_id: "TITLE_WU_ZHUANGYUAN",
        name: "武状元",
        type: CardTypes.TITLE,
        rarity: 4,
        description: "武举殿试第一名获得，魅力+8，统率+5。",
        acquire_hint: "参加武举并获得殿试第一名。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🏆",
        effect: { charm: 8, leadership: 5 }
    },
    {
        card_id: "TITLE_WEN_ZHUANGYUAN",
        name: "文状元",
        type: CardTypes.TITLE,
        rarity: 4,
        description: "科举殿试第一名获得，智力+8，魅力+5。",
        acquire_hint: "参加科举并获得殿试第一名。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "📜",
        effect: { intelligence: 8, charm: 5 }
    },
    {
        card_id: "TITLE_MILITARY_GOD",
        name: "军神",
        type: CardTypes.TITLE,
        rarity: 5,
        description: "合战胜利80次获得，统率+15。",
        acquire_hint: "合战累计胜利80次。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "⚔️",
        effect: { leadership: 15 }
    },
    {
        card_id: "TITLE_WORLD_FIRST",
        name: "天下第一",
        type: CardTypes.TITLE,
        rarity: 5,
        description: "个人战胜利80次获得，武力+15。",
        acquire_hint: "个人战累计胜利80次。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🏆",
        effect: { strength: 15 }
    },
    {
        card_id: "TITLE_GREAT_DUKE",
        name: "吴国公",
        type: CardTypes.TITLE,
        rarity: 4,
        description: "晋升吴国公后获得，统率+5，魅力+3。",
        acquire_hint: "主线剧情晋升吴国公获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "⚜️",
        effect: { leadership: 5, charm: 3 }
    },

    // ========== 名所卡 ==========
    {
        card_id: "PLACE_HUANGJUE",
        name: "皇觉寺",
        type: CardTypes.PLACE,
        rarity: 2,
        description: "朱元璋早年出家之地，佛门清净处。",
        acquire_hint: "访问凤阳皇觉寺。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🕊️",
        location: "凤阳",
        specific_spot: "皇觉寺"
    },
    {
        card_id: "PLACE_QINHUAI",
        name: "秦淮河",
        type: CardTypes.PLACE,
        rarity: 2,
        description: "六朝金粉，十里秦淮。画舫凌波，笙歌彻夜。",
        acquire_hint: "访问应天府秦淮河畔。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🚢",
        location: "应天府",
        specific_spot: "秦淮河"
    },
    {
        card_id: "PLACE_ZHONGSHAN",
        name: "钟山",
        type: CardTypes.PLACE,
        rarity: 2,
        description: "钟山龙蟠，石头虎踞，此帝王之宅。",
        acquire_hint: "访问应天府钟山。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "⛰️",
        location: "应天府",
        specific_spot: "钟山"
    },
    {
        card_id: "PLACE_Poyang",
        name: "鄱阳湖",
        type: CardTypes.PLACE,
        rarity: 3,
        description: "中国第一大淡水湖，朱元璋陈友谅决战之地。",
        acquire_hint: "访问江州鄱阳湖。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🌊",
        location: "江州",
        specific_spot: "鄱阳湖"
    },
    {
        card_id: "PLACE_Jiayu",
        name: "嘉峪关",
        type: CardTypes.PLACE,
        rarity: 3,
        description: "明长城西端起点，天下第一雄关。",
        acquire_hint: "访问嘉峪关。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🏯",
        location: "肃州",
        specific_spot: "嘉峪关"
    },

    // ========== 事件卡 ==========
    {
        card_id: "EVENT_JOIN_RED",
        name: "投身红巾",
        type: CardTypes.EVENT,
        rarity: 3,
        description: "元至正十二年，朱元璋投身郭子兴红巾军，命运的齿轮开始转动。",
        acquire_hint: "第一章开局触发。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "⚡"
    },
    {
        card_id: "EVENT_POYANG",
        name: "鄱阳湖之战",
        type: CardTypes.EVENT,
        rarity: 5,
        description: "1363年，朱元璋与陈友谅在鄱阳湖展开决战，以火攻大破陈军。",
        acquire_hint: "完成鄱阳湖之战剧情。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🔥"
    },
    {
        card_id: "EVENT_FOUND_MING",
        name: "建立大明",
        type: CardTypes.EVENT,
        rarity: 5,
        description: "1368年正月初四，朱元璋称帝应天，国号大明。",
        acquire_hint: "主线剧情完成称帝。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "👑"
    },

    // ========== 宝物卡 ==========
    {
        card_id: "TREASURE_SWORD_TAIA",
        name: "泰阿剑",
        type: CardTypes.TREASURE,
        rarity: 5,
        description: "古代名剑，锋利无比，武力+5。",
        acquire_hint: "可在应天府铁匠铺高价购买。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🗡️",
        effect: { strength: 5 },
        value: 500,
        possible_locations: ["应天府"]
    },
    {
        card_id: "TREASURE_ANALECTS",
        name: "论语",
        type: CardTypes.TREASURE,
        rarity: 3,
        description: "孔子论语，儒家经典，智力+2。",
        acquire_hint: "各地书店均可购买。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "📖",
        effect: { intelligence: 2 },
        value: 50,
        possible_locations: ["应天府", "苏州"]
    },
    {
        card_id: "TREASURE_WUJING",
        name: "武经七书",
        type: CardTypes.TREASURE,
        rarity: 4,
        description: "古代七种军事经典汇编，兵法+2，统率+3。",
        acquire_hint: "应天府国子监书店出售。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "📚",
        effect: { strategy: 2, leadership: 3 },
        value: 200,
        possible_locations: ["应天府"]
    },
    {
        card_id: "TREASURE_ZHENUO",
        name: "赭黄袍",
        type: CardTypes.TREASURE,
        rarity: 5,
        description: "皇帝专用黄色龙袍，魅力+10。",
        acquire_hint: "称帝后获得。",
        is_hidden: true,
        unlock_condition: { required_event: "EVENT_FOUND_MING" },
        emoji: "👑",
        effect: { charm: 10 },
        value: 0,
        possible_locations: []
    },
    {
        card_id: "TREASURE_DRAGON_SPEAR",
        name: "龙吟枪",
        type: CardTypes.TREASURE,
        rarity: 5,
        description: "常遇春使用的长枪，武力+8。",
        acquire_hint: "常遇春好感度三心后赠予。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🔱",
        effect: { strength: 8 },
        value: 800,
        possible_locations: []
    },
    {
        card_id: "TREASURE_TEA_CAKE",
        name: "武夷茶饼",
        type: CardTypes.TREASURE,
        rarity: 2,
        description: "福建武夷好茶，送礼佳品，提升亲密度。",
        acquire_hint: "泉州茶市购买。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🍵",
        effect: { charm: 1 },
        value: 30,
        possible_locations: ["泉州"]
    }
];

/**
 * 获取所有卡片
 * @returns {Card[]}
 */
window.getAllCards = function getAllCards() {
    return CARD_LIBRARY;
};

/**
 * 根据ID获取卡片
 * @param {string} cardId
 * @returns {Card|undefined}
 */
window.getCardById = function getCardById(cardId) {
    return CARD_LIBRARY.find(c => c.card_id === cardId);
};

/**
 * 根据类型获取所有该类型卡片
 * @param {string} type
 * @returns {Card[]}
 */
window.getCardsByType = function getCardsByType(type) {
    return CARD_LIBRARY.filter(c => c.type === type);
};

/**
 * 获取开局初始卡片ID列表（朱元璋开局）
 * @returns {string[]}
 */
window.getInitialCardIds = function getInitialCardIds() {
    return [
        "CHAR_ZHU_YUANZHANG",
        "CHAR_TANG_HE",
        "CHAR_GUO_ZIXING",
        "CHAR_MA_XIUYING",
        "SKILL_INFANTRY_1",
        "SKILL_MARTIAL_1",
        "SKILL_STRATEGY_1",
        "MARTIAL_TAIZU_CHANGQUAN",
        "MARTIAL_IRON_SHIRT",
        "TACTIC_FIRE_ATTACK",
        "PLACE_HUANGJUE",
        "EVENT_JOIN_RED",
        "TITLE_RUSTIC"
    ];
};

/**
 * 检查卡片是否已经收集
 * @param {Object} collectedCards 已收集卡片 {card_id: true}
 * @param {string} cardId
 * @returns {boolean}
 */
window.hasCard = function hasCard(collectedCards, cardId) {
    return !!collectedCards[cardId];
};

/**
 * 获取卡片类型中文名称
 * @param {string} type
 * @returns {string}
 */
window.getCardTypeName = function getCardTypeName(type) {
    const names = {
        [CardTypes.CHARACTER]: '人物卡',
        [CardTypes.SKILL]: '技能卡',
        [CardTypes.TACTIC_BATTLE]: '合战战术卡',
        [CardTypes.MARTIAL_DUEL]: '个人战武技卡',
        [CardTypes.SECRET]: '秘传卡',
        [CardTypes.TITLE]: '称号卡',
        [CardTypes.PLACE]: '名所卡',
        [CardTypes.EVENT]: '事件卡',
        [CardTypes.TREASURE]: '宝物卡'
    };
    return names[type] || type;
};

window.CardTypes = CardTypes;
