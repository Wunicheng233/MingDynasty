/**
 * 合战AI出牌逻辑
 * 贪心算法，选择能造成最大伤害的出牌组合
 */

window.BattleAI = {
    /**
     * AI选择出牌
     * @param {Object} aiState - AI状态（包含handCards）
     * @param {Object} battle - 完整战斗状态
     * @returns { {normalCards: Object[], tacticCard: Object|null} }
     */
    selectCards(aiState, battle) {
        const hand = aiState.handCards;
        const normalCards = hand.filter(c => c.color === 'green');
        const tacticCards = hand.filter(c => c.color === 'red');

        // 找出所有可能的基础卡组合，选威力最大的
        const best = this.findBestNormalCombination(normalCards);

        // 选择最优战术卡
        const bestTactic = this.selectBestTactic(tacticCards, aiState, battle);

        return {
            normalCards: best.cards,
            tacticCard: bestTactic
        };
    },

    /**
     * 找出最佳的基础卡组合
     * @param {Object[]} normalCards
     * @returns { {cards: Object[], combination: Object, score: number} }
     */
    findBestNormalCombination(normalCards) {
        if (normalCards.length === 0) {
            // 没有绿色基础卡，返回默认空组合
            const emptyCombination = BattleCalculator.determineCombination([]);
            return { cards: [], combination: emptyCombination, score: 0 };
        }

        let bestScore = -1;
        let bestCards = [];
        let bestCombination = null;

        // 如果≤3张，全部考虑
        if (normalCards.length <= 3) {
            const combination = BattleCalculator.determineCombination(normalCards);
            const score = this.calculateCombinationScore(combination);
            return { cards: normalCards, combination, score };
        }

        // 如果>3张，枚举所有选1-3张的组合，找出最佳
        // 先试3张组合
        const combinations = this.generateCombinations(normalCards, 3);
        for (const combo of combinations) {
            const result = BattleCalculator.determineCombination(combo);
            const score = this.calculateCombinationScore(result);
            if (score > bestScore) {
                bestScore = score;
                bestCards = combo;
                bestCombination = result;
            }
        }

        // 如果没有好的3张组合，试2张
        if (bestScore <= this.getBaseScore(2)) {
            const combos2 = this.generateCombinations(normalCards, 2);
            for (const combo of combos2) {
                const result = BattleCalculator.determineCombination(combo);
                const score = this.calculateCombinationScore(result);
                if (score > bestScore) {
                    bestScore = score;
                    bestCards = combo;
                    bestCombination = result;
                }
            }
        }

        // 如果还是不好，选1张
        if (bestScore <= this.getBaseScore(1)) {
            // 选数字最大的1张
            let maxNum = -1;
            let bestCard = null;
            for (const card of normalCards) {
                if (card.number > maxNum) {
                    maxNum = card.number;
                    bestCard = card;
                }
            }
            if (bestCard) {
                const result = BattleCalculator.determineCombination([bestCard]);
                const score = this.calculateCombinationScore(result);
                if (score > bestScore) {
                    bestScore = score;
                    bestCards = [bestCard];
                    bestCombination = result;
                }
            }
        }

        return { cards: bestCards, combination: bestCombination, score: bestScore };
    },

    /**
     * 生成所有k张组合
     * @param {Object[]} arr
     * @param {number} k
     * @returns {Object[][]}
     */
    generateCombinations(arr, k) {
        const result = [];
        this.backtrack(arr, k, 0, [], result);
        return result;
    },

    /**
     * 回溯生成组合
     */
    backtrack(arr, k, start, current, result) {
        if (current.length === k) {
            result.push([...current]);
            return;
        }
        for (let i = start; i < arr.length; i++) {
            current.push(arr[i]);
            this.backtrack(arr, k, i + 1, current, result);
            current.pop();
        }
    },

    /**
     * 计算组合分数（越高越好）
     * @param {Object} combination
     * @returns {number}
     */
    calculateCombinationScore(combination) {
        // rank权重高，然后是multiplier
        return combination.rank * 100 + combination.multiplier * 10 + (combination.sum || 0);
    },

    /**
     * 获取基础分数（用于比较）
     * @param {number} count
     * @returns {number}
     */
    getBaseScore(count) {
        if (count === 2) return 2 * 100 + 1.2 * 10;
        if (count === 1) return 1 * 100 + 1.0 * 10;
        return 0;
    },

    /**
     * 选择最佳战术卡
     * @param {Object[]} tactics
     * @param {Object} aiState
     * @param {Object} battle
     * @returns {Object|null}
     */
    selectBestTactic(tactics, aiState, battle) {
        if (tactics.length === 0) return null;

        let bestScore = -Infinity;
        let bestTactic = null;

        for (const tactic of tactics) {
            const score = this.scoreTactic(tactic, aiState, battle);
            if (score > bestScore) {
                bestScore = score;
                bestTactic = tactic;
            }
        }

        // 如果最好分数太低，不选
        return bestScore > 0 ? bestTactic : null;
    },

    /**
     * 给战术卡评分
     * @param {Object} tactic
     * @param {Object} aiState
     * @param {Object} battle
     * @returns {number}
     */
    scoreTactic(tactic, aiState, battle) {
        let score = 0;
        const effect = tactic.effect;
        if (!effect) return 0;

        // 伤害倍率越高评分越高
        if (effect.damageMultiplier) {
            score += effect.damageMultiplier * 20;
        }

        // 连击加分
        if (effect.hitCount) {
            score += effect.hitCount * 10;
        }

        // 针对兵种条件加成
        if (effect.cavalryOnly && aiState.unitType.id === 'cavalry') {
            score += 30;
        }
        if (effect.archerOnly && aiState.unitType.id === 'archer') {
            score += 30;
        }
        if (effect.firearmOnly && aiState.unitType.id === 'firearm') {
            score += 30;
        }
        if (effect.infantryOnly && aiState.unitType.id === 'infantry') {
            score += 30;
        }
        if (effect.navalOnly && battle.battleType === 'naval') {
            score += 30;
        }
        if (effect.siegeOnly && battle.battleType === 'siege') {
            score += 30;
        }

        // 火攻在水战加分
        if (effect.isFire && battle.battleType === 'naval') {
            if (battle.environment.wind === 'enemy' || battle.environment.wind === 'none') {
                // AI是敌方，上风加分
                score += 20;
            }
        }

        // 常驻卡，如果当前没有常驻就分数高一些
        if (effect.permanent && !aiState.permanentCard) {
            if (effect.permanentAttackMul || effect.permanentDefenseMul) {
                score += 25;
            }
        }

        // 士气变化敌方减士气加分
        if (effect.enemyMoraleChange) {
            score += Math.abs(effect.enemyMoraleChange);
        }

        // 城防伤害攻城战加分
        if (effect.fortificationDamage && battle.battleType === 'siege') {
            score += effect.fortificationDamage * 2;
        }

        return score;
    },

    /**
     * AI选择弃牌
     * @param {Object[]} handCards - 当前手牌
     * @param {number} maxDiscard - 最多弃几张
     * @returns {Object[]} 要弃掉的牌
     */
    selectCardsToDiscard(handCards, maxDiscard) {
        const normalCards = handCards.filter(c => c.color === 'green');
        const tacticCards = handCards.filter(c => c.color === 'red');

        const toDiscard = [];

        // 找出重复的数字牌，弃掉重复的
        const numberCounts = {};
        for (const card of normalCards) {
            numberCounts[card.number] = (numberCounts[card.number] || 0) + 1;
        }

        // 如果有超过3张同数字，弃掉多余的
        for (const num in numberCounts) {
            if (numberCounts[num] > 3) {
                const duplicates = normalCards.filter(c => c.number === parseInt(num)).slice(3);
                toDiscard.push(...duplicates);
            }
        }

        // 如果还可以弃更多，弃掉小数字的（因为小数字组合威力小但三同张大，所以只弃单个小数字）
        if (toDiscard.length < maxDiscard) {
            const singles = normalCards.filter(c => {
                let count = 0;
                for (const nc of normalCards) {
                    if (nc.number === c.number) count++;
                }
                return count === 1;
            });
            singles.sort((a, b) => a.number - b.number);
            const remaining = maxDiscard - toDiscard.length;
            toDiscard.push(...singles.slice(0, remaining));
        }

        // 保证不超过最大数量
        return toDiscard.slice(0, maxDiscard);
    }
};
