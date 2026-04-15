// 类型定义在主文件 battle-cards.js 中，此处仅为语法检查通过
/* global BattleCardColor BattleCardTypes */
/**
 * support - 红色辅助类战术卡
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
        acquire: { skill: 'archery', level: 2 }
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
