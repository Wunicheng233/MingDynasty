/**
 * 合战兵种数据定义
 * Battle troop types data definition
 * 5种基础兵种，包含相克关系
 */

/**
 * 兵种数据结构
 * @typedef {Object} BattleTroop
 * @property {string} id - 兵种ID
 * @property {string} name - 兵种名称
 * @property {string} emoji - 图标emoji
 * @property {string} description - 描述
 * @property {number} baseAttack - 基础攻击
 * @property {number} baseDefense - 基础防御
 * @property {number} mobility - 机动力
 * @property {string[]} strongAgainst - 克制哪些兵种
 * @property {string[]} weakAgainst - 被哪些兵种克制
 * @property {string} skillBonus - 对应哪个技能提供加成
 * @property {boolean} waterOnly - 是否仅水战可用
 */

/**
 * 所有兵种数据
 * @type {BattleTroop[]}
 */
const BATTLE_TROOPS = [
    {
        id: 'infantry',
        name: '步兵',
        emoji: '⚔️',
        description: '明军主力，装备长枪刀牌，成本低，防御稳定',
        baseAttack: 12,
        baseDefense: 10,
        mobility: 6,
        strongAgainst: ['archer'],
        weakAgainst: ['cavalry'],
        skillBonus: 'infantry',
        waterOnly: false
    },
    {
        id: 'cavalry',
        name: '骑兵',
        emoji: '🐎',
        description: '高机动高攻击，造价昂贵，明初多为缴获元军马匹组建',
        baseAttack: 16,
        baseDefense: 8,
        mobility: 10,
        strongAgainst: ['infantry'],
        weakAgainst: ['firearm', 'archer'],
        skillBonus: 'cavalry',
        waterOnly: false
    },
    {
        id: 'archer',
        name: '弓兵',
        emoji: '🏹',
        description: '远程攻击，可先手削弱敌军，明军重视弓弩，武举必考射箭',
        baseAttack: 10,
        baseDefense: 7,
        mobility: 7,
        strongAgainst: ['cavalry'],
        weakAgainst: ['infantry'],
        skillBonus: 'strategy',
        waterOnly: false
    },
    {
        id: 'firearm',
        name: '火器兵',
        emoji: '🔫',
        description: '明朝特色，神机营配备，远程高伤，雨天威力减半',
        baseAttack: 14,
        baseDefense: 8,
        mobility: 5,
        strongAgainst: ['cavalry', 'infantry'],
        weakAgainst: [],
        skillBonus: 'firearm',
        waterOnly: false
    },
    {
        id: 'navy',
        name: '水军',
        emoji: '🚢',
        description: '水战专属，攻防均衡，鄱阳湖之战奠定明朝水师基础',
        baseAttack: 13,
        baseDefense: 9,
        mobility: 8,
        strongAgainst: [],
        weakAgainst: [],
        skillBonus: 'navy',
        waterOnly: true
    }
];

/**
 * 获取所有兵种
 * @returns {BattleTroop[]}
 */
window.getAllBattleTroops = function getAllBattleTroops() {
    return BATTLE_TROOPS;
};

/**
 * 根据ID获取兵种
 * @param {string} id
 * @returns {BattleTroop|undefined}
 */
window.getTroopById = function getTroopById(id) {
    return BATTLE_TROOPS.find(t => t.id === id);
};

/**
 * 获取可用于当前战斗的兵种列表
 * @param {string} battleType - 'field'|'siege'|'naval'
 * @returns {BattleTroop[]}
 */
window.getAvailableTroopsForBattle = function getAvailableTroopsForBattle(battleType) {
    if (battleType === 'naval') {
        // 水战可用：水军、弓兵、火器
        return BATTLE_TROOPS.filter(t => !t.waterOnly || t.id === 'navy' || t.id === 'archer' || t.id === 'firearm');
    }
    // 陆战/攻城：所有除了水军
    return BATTLE_TROOPS.filter(t => !t.waterOnly);
};

/**
 * 计算兵种相克倍率
 * @param {string} attackerTroopId
 * @param {string} defenderTroopId
 * @returns {number} 倍率
 */
window.getTroopMultiplier = function getTroopMultiplier(attackerTroopId, defenderTroopId) {
    const attacker = getTroopById(attackerTroopId);
    if (!attacker) return 1.0;

    if (attacker.strongAgainst.includes(defenderTroopId)) {
        return 1.3;
    }
    if (attacker.weakAgainst.includes(defenderTroopId)) {
        return 0.7;
    }
    return 1.0;
};

/**
 * 计算部队攻击力
 * @param {number} generalCommand - 武将统率
 * @param {number} generalForce - 武将武力
 * @param {Object} troop - 兵种数据
 * @param {number} skillLevel - 对应技能等级
 * @returns {number}
 */
window.calculateTroopAttack = function calculateTroopAttack(generalCommand, generalForce, troop, skillLevel) {
    // 公式：攻击力 = 统率 × 0.3 + 武力 × 0.1 + 兵种基础攻击 × (1 + 技能等级 × 0.1)
    const base = generalCommand * 0.3 + generalForce * 0.1;
    const troopBonus = troop.baseAttack * (1 + skillLevel * 0.1);
    return Math.round(base + troopBonus);
};

/**
 * 计算部队防御力
 * @param {number} generalCommand - 武将统率
 * @param {Object} troop - 兵种数据
 * @param {number} skillLevel - 对应技能等级
 * @returns {number}
 */
window.calculateTroopDefense = function calculateTroopDefense(generalCommand, troop, skillLevel) {
    // 公式：防御力 = 统率 × 0.2 + 兵种基础防御 × (1 + 技能等级 × 0.05)
    const base = generalCommand * 0.2;
    const troopBonus = troop.baseDefense * (1 + skillLevel * 0.05);
    return Math.round(base + troopBonus);
};
