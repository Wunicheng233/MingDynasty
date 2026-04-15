// 类型定义在主文件 battle-cards.js 中，此处仅为语法检查通过
/* global BattleCardColor BattleCardTypes */
/**
 * naval - 水军特殊战术卡
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
