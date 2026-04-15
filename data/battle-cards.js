/**
 * 合战与个人战卡片数据定义（拆分优化版）
 * Battle cards data definition - Split version
 *
 * 按照卡片用途拆分到data/battle-cards/目录下，便于维护
 * 所有卡片仍然聚合到 ALL_BATTLE_CARDS 数组，保持向后兼容
 */

/**
 * 合战卡片接口
 * @typedef {Object} BattleCard
 * @property {string} id - 卡片ID
 * @property {string} name - 卡片名称
 * @property {string} color - green/red
 * @property {string} type - 卡片类型
 * @property {number} [number] - 数字（仅绿色基础卡）1-9
 * @property {number} damage - 基础伤害
 * @property {string} description - 描述
 * @property {string} emoji - 图标
 * @property {Object} [effect] - 效果（仅红色战术卡）
 * @property {number} [effect.damageMultiplier] - 伤害倍率
 * @property {number} [effect.fortificationDamage] - 城防伤害（攻城）
 * @property {number} [effect.hitCount] - 连击次数
 * @property {number} [effect.moraleChange] - 士气变化
 * @property {boolean} [effect.permanent] - 是否常驻效果
 * @property {number} [effect.permanentAttackMul] - 常驻攻击倍率
 * @property {number} [effect.permanentDefenseMul] - 常驻防御倍率
 * @property {number} [effect.moralePerTurn] - 每回合士气变化
 * @property {string} [condition] - 使用条件描述
 * @property {string} duration - instant/permanent
 * @property {Object} [acquire] - 获取条件
 * @property {string} [acquire.skill] - 需要技能
 * @property {number} [acquire.level] - 需要技能等级
 */

/**
 * 所有合战卡片定义 - 从拆分文件聚合
 * @type {BattleCard[]}
 */
const ALL_BATTLE_CARDS = [
    ...(typeof BATTLE_NORMAL_CARDS !== 'undefined' ? BATTLE_NORMAL_CARDS : []),
    ...(typeof BATTLE_TACTIC_ATTACK !== 'undefined' ? BATTLE_TACTIC_ATTACK : []),
    ...(typeof BATTLE_TACTIC_SUPPORT !== 'undefined' ? BATTLE_TACTIC_SUPPORT : []),
    ...(typeof BATTLE_TACTIC_NAVAL !== 'undefined' ? BATTLE_TACTIC_NAVAL : []),
    ...(typeof BATTLE_TACTIC_SPECIAL !== 'undefined' ? BATTLE_TACTIC_SPECIAL : [])
];

/**
 * 根据ID获取合战卡片
 * @param {string} id
 * @returns {BattleCard|undefined}
 */
window.getBattleCardById = function getBattleCardById(id) {
    return ALL_BATTLE_CARDS.find(c => c.id === id) || (typeof DUEL_CARDS !== 'undefined' ? DUEL_CARDS : []).find(c => c.id === id);
};

/**
 * 获取所有个人战卡片
 * @returns {BattleCard[]}
 */
window.getAllDuelCards = function getAllDuelCards() {
    return typeof DUEL_CARDS !== 'undefined' ? DUEL_CARDS : [];
};

/**
 * 根据ID获取个人战卡片
 * @param {string} id
 * @returns {BattleCard|undefined}
 */
window.getDuelCardById = function getDuelCardById(id) {
    return typeof DUEL_CARDS !== 'undefined' ? DUEL_CARDS.find(c => c.id === id) : undefined;
};

/**
 * 抽n张卡片（洗牌）
 * @param {number} n
 * @param {BattleCard[]} pool
 * @returns {BattleCard[]}
 */
window.drawNCards = function drawNCards(n, pool) {
    // 克隆洗牌
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, n);
};

/**
 * 检查是否是火攻类卡片
 * @param {BattleCard} card
 * @returns {boolean}
 */
window.isFireCard = function isFireCard(card) {
    return card && card.effect && card.effect.isFire;
};

// Types already defined in battle-types.js, just re-export for compatibility
window.BattleCardTypes = window.BattleCardTypes;
window.BattleCardColor = window.BattleCardColor;
window.ALL_BATTLE_CARDS = ALL_BATTLE_CARDS;
