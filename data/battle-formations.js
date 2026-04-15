/**
 * 合战阵型数据定义
 * Battle formations data definition
 * 11种阵型，包含相克关系和属性加成
 */

/**
 * 阵型数据结构
 * @typedef {Object} BattleFormation
 * @property {string} id - 阵型ID
 * @property {string} name - 阵型名称
 * @property {string} emoji - 图标emoji
 * @property {string} description - 描述
 * @property {Object} effects - 属性加成
 * @property {number} effects.attackBonus - 攻击加成百分比
 * @property {number} effects.defenseBonus - 防御加成百分比
 * @property {number} effects.moralePerTurn - 每回合士气变化
 * @property {number} effects.cavalryBonus - 骑兵伤害加成
 * @property {number} effects.rangeBonus - 远程伤害加成
 * @property {string[]} strongAgainst - 克制哪些阵型ID
 * @property {string[]} weakAgainst - 被哪些阵型ID克制
 * @property {Object} acquire - 获取条件
 */

/**
 * 所有阵型数据
 * @type {BattleFormation[]}
 */
const BATTLE_FORMATIONS = [
    {
        id: 'none',
        name: '无形阵',
        emoji: '⬜',
        description: '默认阵型，兵力不足时的散阵，无加成',
        effects: {
            attackBonus: 0,
            defenseBonus: 0,
            moralePerTurn: 0,
            cavalryBonus: 0,
            rangeBonus: 0
        },
        strongAgainst: [],
        weakAgainst: [],
        acquire: {
            method: 'initial',
            skill: null,
            level: 0
        }
    },
    {
        id: 'yulin',
        name: '鱼鳞阵',
        emoji: '🐟',
        description: '步兵密集推进，攻击力+10%',
        effects: {
            attackBonus: 0.10,
            defenseBonus: 0,
            moralePerTurn: 0,
            cavalryBonus: 0,
            rangeBonus: 0
        },
        strongAgainst: ['yanxing'],
        weakAgainst: ['fengshi'],
        acquire: {
            method: 'skill',
            skill: 'infantry',
            level: 1
        }
    },
    {
        id: 'yanxing',
        name: '雁行阵',
        emoji: '🦅',
        description: '横向展开，弓兵/火器伤害+20%',
        effects: {
            attackBonus: 0,
            defenseBonus: 0,
            moralePerTurn: 0,
            cavalryBonus: 0,
            rangeBonus: 0.20
        },
        strongAgainst: ['fengshi'],
        weakAgainst: ['yueyue'],
        acquire: {
            method: 'skill',
            skill: 'strategy',
            level: 1
        }
    },
    {
        id: 'heyi',
        name: '鹤翼阵',
        emoji: '🕊️',
        description: '两翼包抄防守，侧翼防御+15%，被夹击伤害减半',
        effects: {
            attackBonus: 0,
            defenseBonus: 0.15,
            moralePerTurn: 0,
            cavalryBonus: 0,
            rangeBonus: 0
        },
        strongAgainst: ['yueyue'],
        weakAgainst: ['yulin'],
        acquire: {
            method: 'skill',
            skill: 'strategy',
            level: 2
        }
    },
    {
        id: 'fengshi',
        name: '锋矢阵',
        emoji: '🔼',
        description: '锥形冲锋，骑兵伤害+25%，先手率提升',
        effects: {
            attackBonus: 0,
            defenseBonus: 0,
            moralePerTurn: 0,
            cavalryBonus: 0.25,
            rangeBonus: 0
        },
        strongAgainst: ['yulin'],
        weakAgainst: ['henge'],
        acquire: {
            method: 'skill',
            skill: 'cavalry',
            level: 2
        }
    },
    {
        id: 'fangyuan',
        name: '方圆阵',
        emoji: '◻️',
        description: '坚固圆阵，防御力+20%，士气下降减慢',
        effects: {
            attackBonus: 0,
            defenseBonus: 0.20,
            moralePerTurn: 0,
            cavalryBonus: 0,
            rangeBonus: 0
        },
        strongAgainst: ['henge'],
        weakAgainst: ['changshe'],
        acquire: {
            method: 'skill',
            skill: 'infantry',
            level: 2
        }
    },
    {
        id: 'yueyue',
        name: '偃月阵',
        emoji: '🌙',
        description: '攻守兼备，攻击+15%，防御+5%',
        effects: {
            attackBonus: 0.15,
            defenseBonus: 0.05,
            moralePerTurn: 0,
            cavalryBonus: 0,
            rangeBonus: 0
        },
        strongAgainst: ['yanxing'],
        weakAgainst: ['heyi'],
        acquire: {
            method: 'skill',
            skill: 'strategy',
            level: 3
        }
    },
    {
        id: 'changshe',
        name: '长蛇阵',
        emoji: '🐍',
        description: '灵活机动，机动力+20%，撤退成功率提升',
        effects: {
            attackBonus: 0,
            defenseBonus: 0,
            moralePerTurn: 0,
            cavalryBonus: 0,
            rangeBonus: 0
        },
        strongAgainst: ['fangyuan'],
        weakAgainst: ['fengshi'],
        acquire: {
            method: 'skill',
            skill: 'cavalry',
            level: 1
        }
    },
    {
        id: 'henge',
        name: '衡轭阵',
        emoji: '⚖️',
        description: '抗骑方阵，对骑兵伤害+30%，长枪拒马',
        effects: {
            attackBonus: 0,
            defenseBonus: 0,
            moralePerTurn: 0,
            cavalryBonus: 0.30,
            rangeBonus: 0
        },
        strongAgainst: ['fengshi'],
        weakAgainst: ['fangyuan'],
        acquire: {
            method: 'skill',
            skill: 'infantry',
            level: 3
        }
    },
    {
        id: 'yuanyang',
        name: '鸳鸯阵',
        emoji: '🦆',
        description: '明朝独有，火器+步兵协同，攻防各+10%',
        effects: {
            attackBonus: 0.10,
            defenseBonus: 0.10,
            moralePerTurn: 0,
            cavalryBonus: 0,
            rangeBonus: 0
        },
        strongAgainst: ['changshe'],
        weakAgainst: ['yulin'],
        acquire: {
            method: 'skill',
            skill: 'firearm',
            level: 3,
            secondSkill: 'strategy',
            secondLevel: 3
        }
    },
    {
        id: 'chexuan',
        name: '车悬阵',
        emoji: '🌀',
        description: '徐达车轮战法，士气每回合+5，攻击+15%，克制所有阵型',
        effects: {
            attackBonus: 0.15,
            defenseBonus: 0,
            moralePerTurn: 5,
            cavalryBonus: 0,
            rangeBonus: 0
        },
        strongAgainst: ['all'],
        weakAgainst: [],
        acquire: {
            method: 'defeat',
            general: '徐达'
        }
    }
];

/**
 * 获取所有阵型
 * @returns {BattleFormation[]}
 */
window.getAllBattleFormations = function getAllBattleFormations() {
    return BATTLE_FORMATIONS;
};

/**
 * 根据ID获取阵型
 * @param {string} id
 * @returns {BattleFormation|undefined}
 */
window.getFormationById = function getFormationById(id) {
    return BATTLE_FORMATIONS.find(f => f.id === id);
};

/**
 * 根据玩家技能获取可使用的阵型列表
 * @param {Object} skills - 玩家技能 {skillId: {level}}
 * @returns {BattleFormation[]}
 */
window.getAvailableFormationsForPlayer = function getAvailableFormationsForPlayer(skills) {
    return BATTLE_FORMATIONS.filter(formation => {
        if (formation.id === 'none') return true;
        if (!formation.acquire || !formation.acquire.skill) return true;
        const skillLevel = skills[formation.acquire.skill]?.level || 0;
        if (skillLevel < formation.acquire.level) return false;
        // 检查第二技能要求（鸳鸯阵需要两个技能）
        if (formation.acquire.secondSkill) {
            const secondLevel = skills[formation.acquire.secondSkill]?.level || 0;
            if (secondLevel < formation.acquire.secondLevel) return false;
        }
        return true;
    });
};

/**
 * 检查阵型相克，获取士气修正和倍率修正
 * @param {string} attackerFormationId
 * @param {string} defenderFormationId
 * @returns { {attackerMorale: number, defenderMorale: number, attackerMultiplier: number} }
 */
window.getFormationRelationship = function getFormationRelationship(attackerFormationId, defenderFormationId) {
    const attacker = getFormationById(attackerFormationId);
    const defender = getFormationById(defenderFormationId);

    let result = {
        attackerMorale: 0,
        defenderMorale: 0,
        multiplier: 1.0
    };

    if (!attacker || !defender) return result;

    // 车悬阵特殊处理
    if (attacker.id === 'chexuan') {
        // 车悬克制所有阵型
        result.attackerMorale = 10;
        result.defenderMorale = -10;
        result.multiplier = 1.15;
        return result;
    }

    // 检查攻击方是否克制防御方
    if (attacker.strongAgainst.includes(defender.id)) {
        result.attackerMorale = 10;
        result.defenderMorale = -10;
        result.multiplier = 1.15;
    } else if (attacker.weakAgainst.includes(defender.id)) {
        result.attackerMorale = -10;
        result.defenderMorale = 10;
        result.multiplier = 0.85;
    }

    // 鸳鸯阵额外相克
    if (attacker.id === 'yuanyang' && defender.id === 'changshe') {
        result.attackerMorale += 10;
        result.defenderMorale += -10;
        result.multiplier *= 1.15;
    }

    return result;
};
