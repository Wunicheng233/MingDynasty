/**
 * 合战与个人战卡片数据定义
 * Battle cards data definition
 */

/**
 * 合战卡片颜色类型
 * green - 绿色基础卡（数字1-9，组成组合）
 * red - 红色战术卡（特殊效果）
 */
const BattleCardColor = {
    GREEN: 'green',
    RED: 'red'
};

/**
 * 合战卡片类型枚举
 */
const BattleCardTypes = {
    // 合战卡片
    BATTLE_NORMAL: 'battle_normal',       // 绿色基础数字卡
    BATTLE_TACTIC: 'battle_tactic',       // 红色战术卡
    BATTLE_ATTACK: 'battle_attack',      // 攻击（旧兼容）
    BATTLE_STRATEGY: 'battle_strategy',  // 计策（旧兼容）
    BATTLE_FORMATION: 'battle_formation', // 阵法（旧兼容）
    BATTLE_SPECIAL: 'battle_special',    // 特殊（旧兼容）
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
 * ========== 绿色基础卡 ==========
 * 数字1-9，用于组成组合
 */
const BATTLE_NORMAL_CARDS = [
    { id: 'n1', name: '一', color: BattleCardColor.GREEN, type: BattleCardTypes.BATTLE_NORMAL, number: 1, damage: 0, description: '基础数字卡', emoji: '1️⃣', effect: null },
    { id: 'n2', name: '二', color: BattleCardColor.GREEN, type: BattleCardTypes.BATTLE_NORMAL, number: 2, damage: 0, description: '基础数字卡', emoji: '2️⃣', effect: null },
    { id: 'n3', name: '三', color: BattleCardColor.GREEN, type: BattleCardTypes.BATTLE_NORMAL, number: 3, damage: 0, description: '基础数字卡', emoji: '3️⃣', effect: null },
    { id: 'n4', name: '四', color: BattleCardColor.GREEN, type: BattleCardTypes.BATTLE_NORMAL, number: 4, damage: 0, description: '基础数字卡', emoji: '4️⃣', effect: null },
    { id: 'n5', name: '五', color: BattleCardColor.GREEN, type: BattleCardTypes.BATTLE_NORMAL, number: 5, damage: 0, description: '基础数字卡', emoji: '5️⃣', effect: null },
    { id: 'n6', name: '六', color: BattleCardColor.GREEN, type: BattleCardTypes.BATTLE_NORMAL, number: 6, damage: 0, description: '基础数字卡', emoji: '6️⃣', effect: null },
    { id: 'n7', name: '七', color: BattleCardColor.GREEN, type: BattleCardTypes.BATTLE_NORMAL, number: 7, damage: 0, description: '基础数字卡', emoji: '7️⃣', effect: null },
    { id: 'n8', name: '八', color: BattleCardColor.GREEN, type: BattleCardTypes.BATTLE_NORMAL, number: 8, damage: 0, description: '基础数字卡', emoji: '8️⃣', effect: null },
    { id: 'n9', name: '九', color: BattleCardColor.GREEN, type: BattleCardTypes.BATTLE_NORMAL, number: 9, damage: 0, description: '基础数字卡', emoji: '9️⃣', effect: null },
];

/**
 * ========== 红色战术卡 - 攻击类 ==========
 */
const BATTLE_TACTIC_ATTACK = [
    {
        id: 'fire_attack',
        name: '火攻',
        color: BattleCardColor.RED,
        type: BattleCardTypes.BATTLE_TACTIC,
        damage: 0,
        description: '顺风纵火，焚烧敌方连营，鄱阳湖决战经典战术',
        emoji: '🔥',
        effect: {
            damageMultiplier: 1.5,
            fortificationDamage: 3,
            isFire: true
        },
        duration: 'instant',
        acquire: { skill: 'engineering', level: 1 }
    },
    {
        id: 'cavalry_charge',
        name: '马军突袭',
        color: BattleCardColor.RED,
        type: BattleCardTypes.BATTLE_TACTIC,
        damage: 0,
        description: '骑兵策马冲锋，冲垮敌方阵线，伤害×1.5，先手概率提升',
        emoji: '🐎',
        effect: {
            damageMultiplier: 1.5,
            cavalryOnly: true
        },
        duration: 'instant',
        acquire: { skill: 'cavalry', level: 1 }
    },
    {
        id: 'chibei_charge',
        name: '赤备冲锋',
        color: BattleCardColor.RED,
        type: BattleCardTypes.BATTLE_TACTIC,
        damage: 0,
        description: '明军精骑，二连击',
        emoji: '⚡',
        effect: {
            hitCount: 2,
            cavalryOnly: true
        },
        duration: 'instant',
        acquire: { skill: 'cavalry', level: 2 }
    },
    {
        id: 'qishe_assault',
        name: '骑射突击',
        color: BattleCardColor.RED,
        type: BattleCardTypes.BATTLE_TACTIC,
        damage: 0,
        description: '骑射混合，伤害×1.3，无法被反击',
        emoji: '🏹',
        effect: {
            damageMultiplier: 1.3,
            noCounterAttack: true
        },
        duration: 'instant',
        acquire: { skill: 'cavalry', level: 3, secondSkill: 'strategy', secondLevel: 2 }
    },
    {
        id: 'sanduanji',
        name: '三段击',
        color: BattleCardColor.RED,
        type: BattleCardTypes.BATTLE_TACTIC,
        damage: 0,
        description: '明朝独有，神机营轮射战术，三连击，守城伤害翻倍',
        emoji: '🔫',
        effect: {
            hitCount: 3,
            firearmOnly: true,
            siegeDouble: true
        },
        duration: 'instant',
        acquire: { skill: 'firearm', level: 2 }
    },
    {
        id: 'diaopingji',
        name: '钓瓶击',
        color: BattleCardColor.RED,
        type: BattleCardTypes.BATTLE_TACTIC,
        damage: 0,
        description: '火器四连击，仅限守城使用',
        emoji: '💣',
        effect: {
            hitCount: 4,
            firearmOnly: true,
            siegeOnly: true
        },
        duration: 'instant',
        acquire: { skill: 'firearm', level: 3 }
    },
    {
        id: 'zaohe',
        name: '早合',
        color: BattleCardColor.RED,
        type: BattleCardTypes.BATTLE_TACTIC,
        damage: 0,
        description: '快速装填火药，二连击，先手概率高',
        emoji: '⚡',
        effect: {
            hitCount: 2,
            firearmOnly: true,
            firstChanceBonus: 0.3
        },
        duration: 'instant',
        acquire: { skill: 'firearm', level: 1 }
    },
    {
        id: 'qiangbow',
        name: '强弓',
        color: BattleCardColor.RED,
        type: BattleCardTypes.BATTLE_TACTIC,
        damage: 0,
        description: '明军硬弓手，弓兵伤害×2',
        emoji: '🏹',
        effect: {
            damageMultiplier: 2.0,
            archerOnly: true
        },
        duration: 'instant',
        acquire: { skill: 'strategy', level: 2 }
    },
    {
        id: 'mayu_attack',
        name: '五月雨击',
        color: BattleCardColor.RED,
        type: BattleCardTypes.BATTLE_TACTIC,
        damage: 0,
        description: '箭如雨下，弓兵三连击',
        emoji: '🌧️',
        effect: {
            hitCount: 3,
            archerOnly: true
        },
        duration: 'instant',
        acquire: { skill: 'strategy', level: 3 }
    },
    {
        id: 'fire_arrow',
        name: '火矢',
        color: BattleCardColor.RED,
        type: BattleCardTypes.BATTLE_TACTIC,
        damage: 0,
        description: '火箭焚船，伤害×1.5，水战时对敌船伤害翻倍',
        emoji: '🔥🏹',
        effect: {
            damageMultiplier: 1.5,
            navalDouble: true,
            isFire: true
        },
        duration: 'instant',
        acquire: { skill: 'strategy', level: 1 }
    },
    {
        id: 'beilao',
        name: '焙烙',
        color: BattleCardColor.RED,
        type: BattleCardTypes.BATTLE_TACTIC,
        damage: 0,
        description: '投掷火药罐，步兵伤害×2，水战攻城可用',
        emoji: '💥',
        effect: {
            damageMultiplier: 2.0,
            infantryOnly: true
        },
        duration: 'instant',
        acquire: { skill: 'navy', level: 3 }
    },
];

/**
 * ========== 红色战术卡 - 计策/辅助类 ==========
 */
const BATTLE_TACTIC_SUPPORT = [
    {
        id: 'jiaji',
        name: '夹击',
        color: BattleCardColor.RED,
        type: BattleCardTypes.BATTLE_TACTIC,
        damage: 0,
        description: '两路夹攻，伤害×1.5，需要两翼部队存在',
        emoji: '🔱',
        effect: {
            damageMultiplier: 1.5
        },
        duration: 'instant',
        acquire: { skill: 'strategy', level: 2 }
    },
    {
        id: 'fubing',
        name: '伏兵',
        color: BattleCardColor.RED,
        type: BattleCardTypes.BATTLE_TACTIC,
        damage: 0,
        description: '设伏待敌，常驻防御力×1.2，持续到被覆盖',
        emoji: '👥',
        effect: {
            permanent: true,
            permanentDefenseMul: 1.2
        },
        duration: 'permanent',
        acquire: { skill: 'infantry', level: 1 }
    },
    {
        id: 'shimian_maifu',
        name: '十面埋伏',
        color: BattleCardColor.RED,
        type: BattleCardTypes.BATTLE_TACTIC,
        damage: 0,
        description: '围歼战术，常驻攻击力×1.2，持续到被覆盖',
        emoji: '🎯',
        effect: {
            permanent: true,
            permanentAttackMul: 1.2
        },
        duration: 'permanent',
        acquire: { skill: 'infantry', level: 2 }
    },
    {
        id: 'gaolei_shengou',
        name: '高垒深沟',
        color: BattleCardColor.RED,
        type: BattleCardTypes.BATTLE_TACTIC,
        damage: 0,
        description: '朱元璋"高筑墙"战略，守城时常驻防御力×1.5',
        emoji: '🏯',
        effect: {
            permanent: true,
            permanentDefenseMul: 1.5,
            siegeOnly: true
        },
        duration: 'permanent',
        acquire: { skill: 'engineering', level: 3 }
    },
    {
        id: 'luoshi',
        name: '落石',
        color: BattleCardColor.RED,
        type: BattleCardTypes.BATTLE_TACTIC,
        damage: 0,
        description: '城防器械，守城时每回合敌兵力减少5%',
        emoji: '🪨',
        effect: {
            percentageDamagePerTurn: 0.05,
            siegeOnly: true
        },
        duration: 'instant',
        acquire: { skill: 'engineering', level: 2 }
    },
    {
        id: 'mazhen',
        name: '骂阵',
        color: BattleCardColor.RED,
        type: BattleCardTypes.BATTLE_TACTIC,
        damage: 0,
        description: '阵前激将，敌士气-15',
        emoji: '📢',
        effect: {
            enemyMoraleChange: -15
        },
        duration: 'instant',
        acquire: { skill: 'eloquence', level: 1 }
    },
    {
        id: 'zhaoxiang',
        name: '招降',
        color: BattleCardColor.RED,
        type: BattleCardTypes.BATTLE_TACTIC,
        damage: 0,
        description: '劝降纳叛，敌士气大幅下降，攻城可能直接令敌退却',
        emoji: '🤝',
        effect: {
            enemyMoraleChange: -25
        },
        duration: 'instant',
        acquire: { skill: 'eloquence', level: 2 }
    },
    {
        id: 'qiuhe',
        name: '求和',
        color: BattleCardColor.RED,
        type: BattleCardTypes.BATTLE_TACTIC,
        damage: 0,
        description: '外交斡旋，令敌总大将退却（仅守城，需要魅力高）',
        emoji: '🕊️',
        effect: {
            forceRetreat: true,
            defensiveOnly: true
        },
        duration: 'instant',
        acquire: { skill: 'eloquence', level: 3 }
    },
    {
        id: 'duanliang_weiqi',
        name: '断粮围城',
        color: BattleCardColor.RED,
        type: BattleCardTypes.BATTLE_TACTIC,
        damage: 0,
        description: '困城绝粮，常驻攻城时每回合敌士气-3',
        emoji: '🍞❌',
        effect: {
            permanent: true,
            enemyMoralePerTurn: -3,
            siegeOnly: true
        },
        duration: 'permanent',
        acquire: { skill: 'trade', level: 3 }
    },
    {
        id: 'shuigong',
        name: '水攻',
        color: BattleCardColor.RED,
        type: BattleCardTypes.BATTLE_TACTIC,
        damage: 0,
        description: '引水灌城，攻城时每回合城防-2，敌士气-5',
        emoji: '💧',
        effect: {
            fortificationDamagePerTurn: 2,
            enemyMoraleChange: -5,
            siegeOnly: true
        },
        duration: 'instant',
        acquire: { skill: 'engineering', level: 3 }
    },
    {
        id: 'didao_gongcheng',
        name: '地道攻城',
        color: BattleCardColor.RED,
        type: BattleCardTypes.BATTLE_TACTIC,
        damage: 0,
        description: '刘伯温善用地道，城防每回合-3',
        emoji: '🕳️',
        effect: {
            fortificationDamagePerTurn: 3,
            siegeOnly: true
        },
        duration: 'instant',
        acquire: { skill: 'spy', level: 4 }
    },
    {
        id: 'chengmen_baopo',
        name: '城门爆破',
        color: BattleCardColor.RED,
        type: BattleCardTypes.BATTLE_TACTIC,
        damage: 0,
        description: '炸开城门，城防-10（一次性）',
        emoji: '💥',
        effect: {
            fortificationDamage: 10,
            siegeOnly: true
        },
        duration: 'instant',
        acquire: { skill: 'spy', level: 3 }
    },
    {
        id: 'neiying_liuyan',
        name: '内应流言',
        color: BattleCardColor.RED,
        type: BattleCardTypes.BATTLE_TACTIC,
        damage: 0,
        description: '离间策反，常驻敌士气每回合-5',
        emoji: '🗣️',
        effect: {
            permanent: true,
            enemyMoralePerTurn: -5
        },
        duration: 'permanent',
        acquire: { skill: 'spy', level: 3 }
    },
    {
        id: 'shensu',
        name: '神速',
        color: BattleCardColor.RED,
        type: BattleCardTypes.BATTLE_TACTIC,
        damage: 0,
        description: '抢占上风位，本回合必定先手，伤害×1.1',
        emoji: '💨',
        effect: {
            damageMultiplier: 1.1,
            guaranteedFirst: true
        },
        duration: 'instant',
        acquire: { skill: 'navy', level: 1 }
    },
];

/**
 * ========== 水战专用战术卡 ==========
 */
const BATTLE_TACTIC_NAVAL = [
    {
        id: 'louchuan_ram',
        name: '楼船冲撞',
        color: BattleCardColor.RED,
        type: BattleCardTypes.BATTLE_TACTIC,
        damage: 0,
        description: '大型战船撞击，伤害×1.8，自身也受反伤',
        emoji: '🚢',
        effect: {
            damageMultiplier: 1.8,
            selfDamagePercent: 0.05,
            navalOnly: true
        },
        duration: 'instant',
        acquire: { skill: 'navy', level: 2 }
    },
    {
        id: 'huochuan_tuji',
        name: '火船突击',
        color: BattleCardColor.RED,
        type: BattleCardTypes.BATTLE_TACTIC,
        damage: 0,
        description: '鄱阳湖火攻战术，对敌船伤害×2.5，水战火攻',
        emoji: '🚢🔥',
        effect: {
            damageMultiplier: 2.5,
            isFire: true,
            navalOnly: true
        },
        duration: 'instant',
        acquire: { skill: 'navy', level: 2, secondSkill: 'engineering', secondLevel: 2 }
    },
    {
        id: 'tiesuo_lianhuan',
        name: '铁索连环',
        color: BattleCardColor.RED,
        type: BattleCardTypes.BATTLE_TACTIC,
        damage: 0,
        description: '陈友谅军专属，常驻防御×1.3，但受到火攻伤害×2.5',
        emoji: '🔗',
        effect: {
            permanent: true,
            permanentDefenseMul: 1.3,
            fireVulnerable: 2.5
        },
        duration: 'permanent',
        acquire: { method: 'event', event: 'poyang' }
    },
    {
        id: 'fenbo_heji',
        name: '分波合击',
        color: BattleCardColor.RED,
        type: BattleCardTypes.BATTLE_TACTIC,
        damage: 0,
        description: '水军分进合击，二连击',
        emoji: '🌊',
        effect: {
            hitCount: 2,
            navalOnly: true
        },
        duration: 'instant',
        acquire: { skill: 'navy', level: 3 }
    },
];

/**
 * ========== 历史战役特殊卡 ==========
 */
const BATTLE_TACTIC_SPECIAL = [
    {
        id: 'poyang_fire',
        name: '鄱阳湖火攻',
        color: BattleCardColor.RED,
        type: BattleCardTypes.BATTLE_TACTIC,
        damage: 0,
        description: '仅限鄱阳湖之战，对陈友谅军火攻伤害×3',
        emoji: '🔥🚢',
        effect: {
            damageMultiplier: 3.0,
            isFire: true,
            specialEvent: 'poyang'
        },
        duration: 'instant',
        acquire: { method: 'event', event: 'poyang' }
    },
];

/**
 * 合并所有合战卡片
 */
const ALL_BATTLE_CARDS = [
    ...BATTLE_NORMAL_CARDS,
    ...BATTLE_TACTIC_ATTACK,
    ...BATTLE_TACTIC_SUPPORT,
    ...BATTLE_TACTIC_NAVAL,
    ...BATTLE_TACTIC_SPECIAL
];

/**
 * ========== 个人战卡片（保留原有）==========
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

window.BattleCardTypes = BattleCardTypes;
window.BattleCardColor = BattleCardColor;
