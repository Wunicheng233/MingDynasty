/**
 * 个人战系统 - 预定义数据
 * Personal Battle System - Predefined Data
 */

/**
 * 预定义数字组合技
 * 按照策划文档：明朝特色数字组合
 */
window.PERSONAL_COMBOS = [
    {
        name: '洪武定鼎',
        numbers: [1, 1, 1],
        priority: 30,
        description: '三连击，每击伤害逐次+10%',
        effect: (combo, playerHp, baseDamage) => {
            // 三击，每击+10%
            return [
                baseDamage * 1.0,
                baseDamage * 1.1,
                baseDamage * 1.2
            ];
        }
    },
    {
        name: '步步高升',
        numbers: [1, 2, 3],
        priority: 25,
        description: '攻击力+20%',
        effect: (combo, playerHp, baseDamage) => {
            return [baseDamage * 1.2];
        }
    },
    {
        name: '常山蛇势',
        numbers: [7, 6, 3],
        priority: 28,
        description: '高速攻击，忽视对手20%防御',
        effect: (combo, playerHp, baseDamage) => {
            return [baseDamage * 1.2];
        }
    },
    {
        name: '破军击',
        numbers: [3, 6, 7],
        priority: 32,
        description: '高暴击，对防御状态敌人伤害×1.5',
        effect: (combo, playerHp, baseDamage) => {
            // 这里简化为直接×1.5
            return [baseDamage * 1.5];
        }
    },
    {
        name: '连绵棍法',
        numbers: [2, 5, 9],
        priority: 26,
        description: '三连击，伤害递减 1.0 → 0.8 → 0.6',
        effect: (combo, playerHp, baseDamage) => {
            return [baseDamage * 1.0, baseDamage * 0.8, baseDamage * 0.6];
        }
    },
    {
        name: '背水一战',
        numbers: [9, 2, 9],
        priority: 30,
        description: '体力越低伤害越高，每损失10体力+5%',
        effect: (combo, playerHp, baseDamage, maxHp) => {
            const missing = maxHp - playerHp;
            const bonus = Math.floor(missing / 10) * 0.05;
            return [baseDamage * (1 + bonus)];
        }
    },
    {
        name: '调息回元',
        numbers: [1, 8, 4],
        priority: 20,
        description: '恢复体力，根据医术等级恢复',
        effect: (combo, playerHp, baseDamage, maxHp, player, game) => {
            const heal = 20 + (player.skillLevel.medicine || 0) * 15;
            player.hp = Math.min(player.maxHp, player.hp + heal);
            game.log += `\n你运功调息，恢复 ${heal} 点体力！`;
            return [];
        }
    },
    {
        name: '后发先至',
        numbers: [5, 8, 3],
        priority: 40,
        description: '本回合后手变为先手，伤害+15%',
        effect: (combo, playerHp, baseDamage) => {
            return [baseDamage * 1.15];
        },
        swapPriority: true
    },
    {
        name: '三箭定天山',
        numbers: [4, 3, 2],
        priority: 25,
        description: '远程攻击，不受反击',
        effect: (combo, playerHp, baseDamage) => {
            return [baseDamage];
        },
        noCounterAttack: true
    },
    {
        name: '六合枪',
        numbers: [6, 1, 5],
        priority: 27,
        description: '忽视对手防御技能（心眼、铁壁无效）',
        effect: (combo, playerHp, baseDamage) => {
            return [baseDamage * 1.1];
        },
        ignoreDefense: true
    },
    {
        name: '八卦游身',
        numbers: [8, 8, 8],
        priority: 35,
        description: '闪避下一次攻击，并反击',
        effect: (combo, playerHp, baseDamage) => {
            return [baseDamage];
        },
        dodgeNext: true
    }
];

/**
 * 预定义特殊技卡片
 */
window.PERSONAL_SPECIALS = [
    {
        id: 'taizu_boxing',
        name: '太祖长拳',
        description: '基础连击，伤害+20%',
        damageBonus: 0.2,
        priority: 20
    },
    {
        id: 'jin-gang_li',
        name: '金刚力',
        description: '本回合攻击力+30%',
        damageBonus: 0.3,
        priority: 18
    },
    {
        id: 'tiebu-shan',
        name: '铁布衫',
        description: '本回合防御力+50%',
        defenseBonus: 0.5,
        priority: 15
    },
    {
        id: 'hengsao',
        name: '横扫千军',
        description: '对多个敌人有效（这里单挑伤害+15%）',
        damageBonus: 0.15,
        priority: 22
    },
    {
        id: 'pojia',
        name: '破甲锥',
        description: '无视对手防御',
        ignoreDefense: true,
        damageBonus: 0,
        priority: 25
    },
    {
        id: 'liuxing',
        name: '流星赶月',
        description: '高速先手攻击，优先度+50',
        priorityBonus: 50,
        priority: 20
    },
    {
        id: 'four_two',
        name: '四两拨千斤',
        description: '格挡并反击，伤害减半反击',
        priority: 10,
        counterAttack: true
    },
    {
        id: 'tiemen_shuan',
        name: '铁门闩',
        description: '完全防御一回合，不受任何伤害',
        fullDefense: true,
        priority: 5
    },
    {
        id: 'houfa',
        name: '后发制人',
        description: '放弃本回合攻击，下回合优先度+50%',
        nextPriorityBonus: 0.5,
        priority: 8
    },
    {
        id: 'jinchuang_yao',
        name: '金疮药',
        description: '恢复20点体力',
        heal: 20,
        priority: 10
    }
];
