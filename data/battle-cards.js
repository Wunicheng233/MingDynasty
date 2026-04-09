/**
 * 合战与个人战卡片数据定义
 * Battle cards data definition
 */

/**
 * 卡片类型枚举
 */
const BattleCardTypes = {
    // 合战卡片
    BATTLE_ATTACK: 'battle_attack',    // 攻击
    BATTLE_STRATEGY: 'battle_strategy',  // 计策
    BATTLE_FORMATION: 'battle_formation', // 阵法
    BATTLE_SPECIAL: 'battle_special',    // 特殊
    // 个人战卡片
    DUEL_ATTACK: 'duel_attack',    // 攻击招式
    DUEL_DEFENSE: 'duel_defense',  // 防御格挡
    DUEL_SPECIAL: 'duel_special',  // 特殊必杀
};

/**
 * 合战卡片接口
 * @typedef {Object} BattleCard
 * @property {string} id - 卡片ID
 * @property {string} name - 卡片名称
 * @property {string} type - 卡片类型
 * @property {number} damage - 基础伤害
 * @property {string} description - 描述
 * @property {string} emoji - 图标
 * @property {string} [condition] - 使用条件
 */

/**
 * 所有合战卡片
 * @type {BattleCard[]}
 */
const BATTLE_CARDS = [
    // ========== 攻击类 ==========
    {
        id: 'infantry-charge',
        name: '步兵突击',
        type: BattleCardTypes.BATTLE_ATTACK,
        damage: 10,
        description: '步兵挺着长矛向前冲锋，压制敌方阵线',
        emoji: '⚔️'
    },
    {
        id: 'cavalry-charge',
        name: '铁骑冲锋',
        type: BattleCardTypes.BATTLE_ATTACK,
        damage: 15,
        description: '骑兵策马冲锋，冲垮敌方阵型',
        emoji: '🐎'
    },
    {
        id: 'firearm-volley',
        name: '火器齐射',
        type: BattleCardTypes.BATTLE_ATTACK,
        damage: 12,
        description: '火铳兵齐发射击，远距离杀伤敌人',
        emoji: '🔫'
    },
    {
        id: 'archer-volley',
        name: '弓弩齐发',
        type: BattleCardTypes.BATTLE_ATTACK,
        damage: 8,
        description: '弓箭手一起放箭，覆盖杀伤敌军',
        emoji: '🏹'
    },
    // ========== 计策类 ==========
    {
        id: 'fire-attack',
        name: '火攻',
        type: BattleCardTypes.BATTLE_STRATEGY,
        damage: 20,
        description: '顺风纵火，焚烧敌方连营，鄱阳湖决战经典战术',
        emoji: '🔥'
    },
    {
        id: 'water-attack',
        name: '水攻',
        type: BattleCardTypes.BATTLE_STRATEGY,
        damage: 18,
        description: '掘开水坝，放水淹没敌方营地',
        emoji: '💧'
    },
    {
        id: 'ambush',
        name: '伏兵',
        type: BattleCardTypes.BATTLE_STRATEGY,
        damage: 15,
        description: '在两侧埋伏士兵，敌人经过时突然杀出',
        emoji: '👥'
    },
    {
        id: 'feint',
        name: '疑兵',
        type: BattleCardTypes.BATTLE_STRATEGY,
        damage: 5,
        description: '多树旗帜，让敌人误以为我军众多，降低敌方士气',
        emoji: '🏳️'
    },
    {
        id: 'pincer-attack',
        name: '夹击',
        type: BattleCardTypes.BATTLE_STRATEGY,
        damage: 16,
        description: '两路夹攻，让敌人顾此失彼',
        emoji: '🔱'
    },
    // ========== 阵法类 ==========
    {
        id: 'square-formation',
        name: '方圆阵',
        type: BattleCardTypes.BATTLE_FORMATION,
        damage: 0,
        description: '坚固的圆形阵法，减少受到的伤害',
        emoji: '◻️'
    },
    {
        id: 'goose-wing',
        name: '雁行阵',
        type: BattleCardTypes.BATTLE_FORMATION,
        damage: 0,
        description: '横向展开的雁形阵型，方便弓弩发挥',
        emoji: '🦅'
    },
    {
        id: 'snake-formation',
        name: '长蛇阵',
        type: BattleCardTypes.BATTLE_FORMATION,
        damage: 0,
        description: '首尾相连的长蛇阵型，灵活应变',
        emoji: '🐍'
    },
    {
        id: 'wedge-formation',
        name: '锥形阵',
        type: BattleCardTypes.BATTLE_FORMATION,
        damage: 0,
        description: '锥形冲锋阵型，中央突破敌方阵线',
        emoji: '🔼'
    },
    // ========== 特殊类 ==========
    {
        id: 'poyang-fire',
        name: '鄱阳湖火攻',
        type: BattleCardTypes.BATTLE_SPECIAL,
        damage: 30,
        description: '对陈友谅专用，赤壁故技，火烧连船',
        emoji: '🚢🔥'
    },
    {
        id: 'northern-expedition',
        name: '北伐突进',
        type: BattleCardTypes.BATTLE_SPECIAL,
        damage: 25,
        description: '北伐元军专用，一举攻破大都',
        emoji: '⚡'
    },
    {
        id: 'win-over',
        name: '招降纳叛',
        type: BattleCardTypes.BATTLE_SPECIAL,
        damage: 10,
        description: '劝降敌方将领，让其倒戈',
        emoji: '🤝'
    }
];

/**
 * 个人战卡片
 * @type {BattleCard[]}
 */
const DUEL_CARDS = [
    // ========== 攻击 ==========
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
    // ========== 防御 ==========
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
    // ========== 特殊必杀 ==========
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
    return BATTLE_CARDS;
};

/**
 * 获取所有个人战卡片
 * @returns {BattleCard[]}
 */
window.getAllDuelCards = function getAllDuelCards() {
    return DUEL_CARDS;
};

/**
 * 根据ID获取合战卡片
 * @param {string} id
 * @returns {BattleCard|undefined}
 */
window.getBattleCardById = function getBattleCardById(id) {
    return BATTLE_CARDS.find(c => c.id === id);
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
 * 抽n张卡片
 * @param {number} n
 * @param {BattleCard[]} pool
 * @returns {BattleCard[]}
 */
window.drawNCards = function drawNCards(n, pool) {
    // 克隆洗牌
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, n);
};

window.BattleCardTypes = BattleCardTypes;
