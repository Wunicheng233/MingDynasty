// 类型定义在主文件 battle-cards.js 中，此处仅为语法检查通过
/* global BattleCardColor BattleCardTypes */
/**
 * duel - 个人战所有卡片
 */

const DUEL_CARDS = [
    {
        id: 'slash',
        name: '横斩',
        type: BattleCardTypes.DUEL_ATTACK,
        damage: 5,
        description: '一刀横向劈砍',
        emoji: '⚔️'
    },
    {
        id: 'thrust',
        name: '突刺',
        type: BattleCardTypes.DUEL_ATTACK,
        damage: 6,
        description: '长枪向前突刺',
        emoji: '🔱'
    },
    {
        id: 'taizu-boxing',
        name: '太祖长拳',
        type: BattleCardTypes.DUEL_ATTACK,
        damage: 8,
        description: '朱元璋亲创太祖长拳，刚猛有力',
        emoji: '👊'
    },
    {
        id: 'shaolin-staff',
        name: '少林棍法',
        type: BattleCardTypes.DUEL_ATTACK,
        damage: 7,
        description: '少林正宗棍法，变幻莫测',
        emoji: '🥢'
    },
    {
        id: 'wudang-sword',
        name: '武当剑法',
        type: BattleCardTypes.DUEL_ATTACK,
        damage: 7,
        description: '武当派轻灵剑法，飘逸灵动',
        emoji: '🗡️'
    },
    {
        id: 'swift-kick',
        name: '连环腿',
        type: BattleCardTypes.DUEL_ATTACK,
        damage: 4,
        description: '连环飞踢，快速连击',
        emoji: '🦶'
    },
    {
        id: 'block',
        name: '格挡',
        type: BattleCardTypes.DUEL_DEFENSE,
        damage: 0,
        description: '兵器格挡，减少受到的伤害',
        emoji: '🛡️'
    },
    {
        id: 'dodge',
        name: '闪避',
        type: BattleCardTypes.DUEL_DEFENSE,
        damage: 0,
        description: '身形闪开，完全避开攻击',
        emoji: '💨'
    },
    {
        id: 'parry',
        name: '卸力',
        type: BattleCardTypes.DUEL_DEFENSE,
        damage: 0,
        description: '四两拨千斤，化开对方劲力',
        emoji: '🌀'
    },
    {
        id: 'whirlwind-cut',
        name: '旋风斩',
        type: BattleCardTypes.DUEL_SPECIAL,
        damage: 15,
        description: '三张刀法牌组合，旋转一周横扫',
        emoji: '🌪️'
    },
    {
        id: 'crushing-fist',
        name: '崩山拳',
        type: BattleCardTypes.DUEL_SPECIAL,
        damage: 18,
        description: '三张拳法牌组合，一拳打出崩山裂石',
        emoji: '💥'
    },
    {
        id: 'thunder-stab',
        name: '惊雷刺',
        type: BattleCardTypes.DUEL_SPECIAL,
        damage: 16,
        description: '三张枪法牌组合，一枪刺出如惊雷闪电',
        emoji: '⚡'
    }
];

/**
 * 获取所有合战卡片
 * @returns {BattleCard[]}
 */
window.getAllBattleCards = function getAllBattleCards() {
    return ALL_BATTLE_CARDS;
};

/**
 * 获取所有绿色基础卡
 * @returns {BattleCard[]}
 */
window.getAllNormalBattleCards = function getAllNormalBattleCards() {
    return BATTLE_NORMAL_CARDS;
};

/**
 * 获取玩家已收集的合战战术卡
 * @param {Object} collectedCards - 玩家收集的卡片ID map
 * @returns {BattleCard[]}
 */
window.getPlayerCollectedTactics = function getPlayerCollectedTactics(collectedCards) {
    return ALL_BATTLE_CARDS.filter(card =>
        card.color === BattleCardColor.RED && collectedCards[`TACTIC_${card.id}`]
    );
};

/**
 * 根据ID获取合战卡片
 * @param {string} id
 * @returns {BattleCard|undefined}
 */
window.getBattleCardById = function getBattleCardById(id) {
    return ALL_BATTLE_CARDS.find(c => c.id === id) || DUEL_CARDS.find(c => c.id === id);
};

/**
 * 获取所有个人战卡片
 * @returns {BattleCard[]}
 */
window.getAllDuelCards = function getAllDuelCards() {
    return DUEL_CARDS;
};

/**
 * 根据ID获取个人战卡片
 * @param {string} id
 * @returns {BattleCard|undefined}
 */
window.getDuelCardById = function getDuelCardById(id) {
    return DUEL_CARDS.find(c => c.id === id);
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
