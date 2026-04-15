// 类型定义在主文件 battle-cards.js 中，此处仅为语法检查通过
/* global BattleCardColor BattleCardTypes */
/**
 * attack - 红色攻击类战术卡
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
        acquire: { skill: 'archery', level: 2 }
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
        acquire: { skill: 'archery', level: 3 }
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
        acquire: { skill: 'archery', level: 1 }
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
