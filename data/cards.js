/**
 * 卡片库 - 静态数据（拆分优化版）
 * Card library (static data) - Split version
 *
 * 按照9种卡片类型拆分到data/cards/目录下，便于维护
 * 所有卡片仍然聚合到 CARD_LIBRARY 数组，保持向后兼容
 * 按照核心数据层设计：统一管理所有600+卡片的定义，各系统通过card_id引用
 */

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
 * 所有卡片定义 - 从拆分文件聚合
 * @type {Card[]}
 */
const CARD_LIBRARY = [
    // 人物卡
    ...(typeof CARDS_CHARACTERS !== 'undefined' ? CARDS_CHARACTERS : []),
    // 技能卡
    ...(typeof CARDS_SKILLS !== 'undefined' ? CARDS_SKILLS : []),
    // 合战战术卡
    ...(typeof CARDS_TACTICS !== 'undefined' ? CARDS_TACTICS : []),
    // 个人战武技卡
    ...(typeof CARDS_MARTIAL !== 'undefined' ? CARDS_MARTIAL : []),
    // 秘传卡
    ...(typeof CARDS_SECRETS !== 'undefined' ? CARDS_SECRETS : []),
    // 称号卡
    ...(typeof CARDS_TITLES !== 'undefined' ? CARDS_TITLES : []),
    // 名所卡
    ...(typeof CARDS_PLACES !== 'undefined' ? CARDS_PLACES : []),
    // 事件卡
    ...(typeof CARDS_EVENT_CARDS !== 'undefined' ? CARDS_EVENT_CARDS : []),
    // 宝物卡
    ...(typeof CARDS_TREASURES !== 'undefined' ? CARDS_TREASURES : [])
];

/**
 * 根据card_id查找卡片
 * @param {string} cardId
 * @returns {Card|undefined}
 */
window.getCardById = function getCardById(cardId) {
    return CARD_LIBRARY.find(card => card.card_id === cardId);
};

/**
 * 别名，兼容调用
 */
window.findCard = window.getCardById;

/**
 * 获取所有卡片
 * @returns {Card[]}
 */
window.getAllCards = function getAllCards() {
    return CARD_LIBRARY;
};

/**
 * 获取初始卡片ID列表（新游戏开局）
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

/**
 * 按类型筛选卡片
 * @param {string} type
 * @returns {Card[]}
 */
window.getCardsByType = function getCardsByType(type) {
    return CARD_LIBRARY.filter(card => card.type === type);
};

// CardTypes already defined in card-types.js, just re-export for compatibility
window.CardTypes = window.CardTypes;
window.CARD_LIBRARY = CARD_LIBRARY;
