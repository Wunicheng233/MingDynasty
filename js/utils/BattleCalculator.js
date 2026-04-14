/**
 * 合战计算工具模块
 * 组合判定、伤害计算等核心算法
 */

window.BattleCalculator = {
    /**
     * 判定基础卡组合
     * @param {Object[]} normalCards - 打出的基础卡数组（最多3张）
     * @returns {Object} {type, rank, multiplier, name}
     *  rank越高组合越强：4=三同张 > 3=三连张 > 2=二同张 > 1=无组合
     */
    determineCombination(normalCards) {
        if (!normalCards || normalCards.length === 0) {
            return {
                type: 'none',
                rank: 0,
                multiplier: 0.5,
                name: '无',
                sum: 0
            };
        }

        const numbers = normalCards
            .map(c => c.number)
            .sort((a, b) => a - b);

        // 三同张判定
        if (numbers.length === 3 && numbers[0] === numbers[1] && numbers[1] === numbers[2]) {
            // 数字越小威力越大：111 = 1.8，999 = 1.4
            const minNum = numbers[0];
            const multiplier = 1.8 - (minNum - 1) * 0.05;
            return {
                type: 'triple',
                rank: 4,
                multiplier: multiplier,
                name: '三同张',
                sum: numbers.reduce((a, b) => a + b, 0)
            };
        }

        // 三连张判定 (连续三张)
        if (numbers.length === 3 &&
            numbers[1] === numbers[0] + 1 &&
            numbers[2] === numbers[1] + 1) {
            // 起始越小威力越大：123 = 1.5，789 = 1.32
            const startNum = numbers[0];
            const multiplier = 1.5 - (startNum - 1) * 0.03;
            return {
                type: 'sequence',
                rank: 3,
                multiplier: multiplier,
                name: '三连张',
                sum: numbers.reduce((a, b) => a + b, 0)
            };
        }

        // 二同张判定
        if (numbers.length >= 2) {
            // 检查是否有对子
            let hasPair = false;
            if (numbers.length === 2 && numbers[0] === numbers[1]) {
                hasPair = true;
            }
            if (numbers.length === 3 &&
                (numbers[0] === numbers[1] || numbers[1] === numbers[2])) {
                hasPair = true;
            }
            if (hasPair) {
                return {
                    type: 'pair',
                    rank: 2,
                    multiplier: 1.2,
                    name: '二同张',
                    sum: numbers.reduce((a, b) => a + b, 0)
                };
            }
        }

        // 无组合
        const baseMultiplier = 1.0;
        return {
            type: 'none',
            rank: 1,
            multiplier: baseMultiplier,
            name: '无组合',
            sum: numbers.reduce((a, b) => a + b, 0)
        };
    },

    /**
     * 计算最终伤害
     * @param {Object} attacker - 攻击方状态
     * @param {Object} defender - 防御方状态
     * @param {Object} combination - 组合判定结果
     * @param {Object|null} tacticCard - 战术卡
     * @param {Object} battle - 完整战斗状态
     * @returns {number} 最终伤害
     */
    calculateDamage(attacker, defender, combination, tacticCard, battle) {
        // 确保 combination 一定有值，默认空组合
        if (!combination) {
            combination = {
                type: 'none',
                rank: 0,
                multiplier: 0.5,
                name: '无',
                sum: 0
            };
        }

        // 确保基础属性一定是数字
        const attackerTroops = typeof attacker.troops === 'number' ? attacker.troops : 1;
        const attackerAttack = typeof attacker.attack === 'number' ? attacker.attack : 10;
        const defenderDefense = typeof defender.defense === 'number' ? defender.defense : 10;

        // 基础伤害公式：(攻击方兵力 × 攻击力) / (防御方防御力 × 0.5 + 120)
        const baseDamage = (attackerTroops * attackerAttack) / (defenderDefense * 0.5 + 120);

        let damage = baseDamage;

        // 1. 组合威力系数
        const multiplier = typeof combination.multiplier === 'number' ? combination.multiplier : 0.5;
        damage *= multiplier;

        // 2. 基础数字和，三同张/三连张会根据数字总和轻微调整
        // 较大的数字总和会有轻微加成
        const sum = combination.sum || 0;
        if (sum > 0) {
            damage *= (1 + sum * 0.02);
        }

        // 3. 战术卡处理
        let tacticMultiplier = 1;
        let hitCount = 1;
        let isPermanent = false;

        if (tacticCard && tacticCard.effect) {
            if (tacticCard.effect.damageMultiplier) {
                tacticMultiplier *= tacticCard.effect.damageMultiplier;
            }
            if (tacticCard.effect.hitCount) {
                hitCount = tacticCard.effect.hitCount;
            }
        }
        damage *= tacticMultiplier * hitCount;

        // 4. 兵种相克系数
        if (attacker.unitType && defender.unitType) {
            const troopMul = getTroopMultiplier(attacker.unitType.id, defender.unitType.id);
            damage *= troopMul;
        }

        // 5. 阵型相克修正
        if (attacker.formation && defender.formation) {
            const relation = getFormationRelationship(attacker.formation.id, defender.formation.id);
            damage *= relation.multiplier;
        }

        // 6. 阵型属性加成
        if (attacker.formation && attacker.formation.effects) {
            // 攻击加成
            if (attacker.formation.effects.attackBonus) {
                damage *= (1 + attacker.formation.effects.attackBonus);
            }
            // 骑兵加成
            if (attacker.unitType && attacker.unitType.id === 'cavalry' && attacker.formation.effects.cavalryBonus) {
                damage *= (1 + attacker.formation.effects.cavalryBonus);
            }
            // 远程加成
            if (attacker.unitType &&
                (attacker.unitType.id === 'archer' || attacker.unitType.id === 'firearm') &&
                attacker.formation.effects.rangeBonus) {
                damage *= (1 + attacker.formation.effects.rangeBonus);
            }
        }

        // 7. 士气修正
        let moraleMul = this.getMoraleMultiplier(attacker.morale);
        damage *= moraleMul;

        // 8. 常驻卡修正
        if (attacker.permanentCard && attacker.permanentCard.effect) {
            if (attacker.permanentCard.effect.permanentAttackMul) {
                damage *= attacker.permanentCard.effect.permanentAttackMul;
            }
        }
        if (defender.permanentCard && defender.permanentCard.effect) {
            if (defender.permanentCard.effect.permanentDefenseMul) {
                // 防御加成减少伤害
                damage /= defender.permanentCard.effect.permanentDefenseMul;
            }
        }

        // 9. 水战特殊修正
        if (battle.battleType === 'naval') {
            // 火攻加成
            if (tacticCard && isFireCard(tacticCard)) {
                damage *= 1.5; // 水战火攻额外加成
                // 风向加成
                if (battle.environment.wind === 'player' && attacker === battle.player) {
                    damage *= 1.2;
                } else if (battle.environment.wind === 'enemy' && attacker === battle.enemy) {
                    damage *= 1.2;
                }
            }
            // 敌方铁索连环特殊修正
            if (defender.permanentCard && defender.permanentCard.id === 'tiesuo_lianhuan') {
                if (tacticCard && isFireCard(tacticCard)) {
                    damage *= 2.5; // 火攻对铁索连环加倍
                }
            }
        }

        // 10. 雨天火器伤害减半
        if (battle.environment.weather === 'rain' && attacker.unitType && attacker.unitType.id === 'firearm') {
            damage *= 0.5;
        }

        // 11. 攻城战特殊修正（已经在战术效果里处理了）

        return Math.max(1, Math.round(damage));
    },

    /**
     * 获取士气对应的伤害倍率
     * @param {number} morale - 0-100
     * @returns {number}
     */
    getMoraleMultiplier(morale) {
        if (morale >= 80) return 1.1;
        if (morale < 30) return 0.8;
        if (morale < 50) return 0.9;
        return 1.0;
    },

    /**
     * 应用阵型相克带来的士气变化
     * @param {Object} attackerFormation
     * @param {Object} defenderFormation
     * @returns { {attackerAdd: number, defenderAdd: number} }
     */
    getMoraleChangeFromFormation(attackerFormation, defenderFormation) {
        if (!attackerFormation || !defenderFormation) {
            return { attackerAdd: 0, defenderAdd: 0 };
        }

        // 车悬阵特殊
        if (attackerFormation.id === 'chexuan') {
            return { attackerAdd: 10, defenderAdd: -10 };
        }

        let result = { attackerAdd: 0, defenderAdd: 0 };

        if (attackerFormation.strongAgainst.includes(defenderFormation.id)) {
            result.attackerAdd = 10;
            result.defenderAdd = -10;
        } else if (attackerFormation.weakAgainst.includes(defenderFormation.id)) {
            result.attackerAdd = -10;
            result.defenderAdd = 10;
        }

        // 鸳鸯阵额外
        if (attackerFormation.id === 'yuanyang' && defenderFormation.id === 'changshe') {
            result.attackerAdd += 10;
            result.defenderAdd += -10;
        }

        return result;
    },

    /**
     * 检查战斗是否结束
     * @param {Object} battle
     * @returns {Object|null} {winner: 'player'|'enemy', reason: string} 没结束返回null
     */
    checkBattleEnd(battle) {
        const p = battle.player;
        const e = battle.enemy;

        // 玩家兵力耗尽
        if (p.troops <= 0) {
            return { winner: 'enemy', reason: '我方兵力耗尽' };
        }
        // 敌方兵力耗尽
        if (e.troops <= 0) {
            return { winner: 'player', reason: '敌方兵力耗尽' };
        }
        // 玩家士气耗尽
        if (p.morale <= 0) {
            return { winner: 'enemy', reason: '我方士气崩溃' };
        }
        // 敌方士气耗尽
        if (e.morale <= 0) {
            return { winner: 'player', reason: '敌方士气崩溃' };
        }
        // 攻城战检查城防
        if (battle.battleType === 'siege' && e.fortification <= 0) {
            return { winner: 'player', reason: '城池防御被攻破' };
        }
        // 超过最大回合，判定兵力多的赢（现在设为999回合，几乎不会触发）
        if (battle.environment.currentTurn > battle.maxTurns) {
            if (p.troops > e.troops) {
                return { winner: 'player', reason: '回合结束，我方剩余兵力更多' };
            } else {
                return { winner: 'enemy', reason: '回合结束，敌方剩余兵力更多' };
            }
        }

        return null; // 战斗继续
    },

    /**
     * 获取组合描述文字
     * @param {Object} combination
     * @returns {string}
     */
    getCombinationDescription(combination) {
        const base = `${combination.name}，威力系数${combination.multiplier.toFixed(2)}`;
        return base;
    }
};
