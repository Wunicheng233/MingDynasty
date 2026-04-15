// 类型定义在主文件 battle-cards.js 中，此处仅为语法检查通过
/* global BattleCardColor BattleCardTypes */
/**
 * special - 特殊战术卡
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

