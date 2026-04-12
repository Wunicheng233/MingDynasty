/**
 * 个人战计算模块 - 拆分自MartialGame
 * 负责组合识别、优先度计算、伤害计算
 */
window.MartialCalculator = {
    /**
     * 构建对手牌堆
     */
    buildEnemyDeck(enemyTemplate) {
        let deck = [];
        // 数字卡 1-9 各三张
        for (let i = 1; i <= 9; i++) {
            for (let j = 0; j < 3; j++) {
                deck.push({type: 'number', value: i});
            }
        }
        // 添加敌人模板的初始特殊技
        if (enemyTemplate && enemyTemplate.initialCards) {
            enemyTemplate.initialCards.forEach(cardId => {
                deck.push({type: 'special', cardId: cardId});
            });
        } else {
            // 默认添加基础特殊技
            deck.push({type: 'special', cardId: 'taizu_boxing'});
            deck.push({type: 'special', cardId: 'jin-gang_li'});
        }
        deck.sort(() => Math.random() - 0.5);
        return deck;
    },

    /**
     * 抽牌到手牌
     */
    drawCardsToHand(fighter, handSize) {
        while (fighter.hand.length < handSize && fighter.deck.length > 0) {
            const card = fighter.deck.shift();
            fighter.hand.push(card);
        }
        // 如果牌堆空了，洗牌弃牌堆
        if (fighter.deck.length === 0 && fighter.discard.length > 0) {
            fighter.deck = [...fighter.discard];
            fighter.discard = [];
            fighter.deck.sort(() => Math.random() - 0.5);
            // 继续抽
            while (fighter.hand.length < handSize && fighter.deck.length > 0) {
                fighter.hand.push(fighter.deck.shift());
            }
        }
    },

    /**
     * AI出牌
     * 遵循新规则：要么出一张特殊卡，要么出1-3张数字卡，不能同时出
     */
    aiEnemyPlay(game) {
        const enemy = game.enemy;

        const specialCards = enemy.hand.filter(c => c.type === 'special');
        const numberCards = enemy.hand.filter(c => c.type === 'number');

        // 70%概率出特殊卡如果有，否则出数字卡
        let special = null;
        let selectedNumbers = [];

        if (specialCards.length > 0 && Math.random() < 0.7) {
            // 出一张特殊卡，不出数字
            special = specialCards[Math.floor(Math.random() * specialCards.length)].cardId;
            selectedNumbers = [];
        } else {
            // 出数字卡，不出特殊，选1-3张
            special = null;
            const count = Math.min(numberCards.length, Math.floor(Math.random() * 3) + 1);
            selectedNumbers = [];
            const availableValues = numberCards.map(c => c.value);
            for (let i = 0; i < count && availableValues.length > 0; i++) {
                const idx = Math.floor(Math.random() * availableValues.length);
                selectedNumbers.push(availableValues[idx]);
                availableValues.splice(idx, 1);
            }
        }

        game.enemyMove = {special, numbers: selectedNumbers};
        game.enemyCombo = this.identifyCombo(selectedNumbers);
    },

    /**
     * 识别数字组合
     */
    identifyCombo(numbers) {
        if (numbers.length === 0) return null;
        // 排序便于匹配
        const sorted = [...numbers].sort((a, b) => a - b);

        // 检查组合
        for (const combo of PERSONAL_COMBOS) {
            const cSorted = [...combo.numbers].sort((a, b) => a - b);
            if (cSorted.length === sorted.length && cSorted.every((v, i) => v === sorted[i])) {
                return combo;
            }
        }
        return null;
    },

    /**
     * 计算优先度
     */
    calculatePriority(move, combo) {
        let priority = 0;

        // 秘传 > 特殊 > 组合
        // 这里简化：特殊卡基础15，组合看组合优先级
        if (move.special) {
            const spec = PERSONAL_SPECIALS.find(s => s.id === move.special);
            priority += spec.priority;
            if (spec.priorityBonus) {
                priority += spec.priorityBonus;
            }
        }
        if (combo) {
            priority += combo.priority;
        }
        // 数字卡总和加分
        const sum = move.numbers.reduce((a, b) => a + b, 0);
        priority += sum / 3;

        return priority;
    },

    /**
     * 执行攻击
     */
    performAttack(attacker, defender, move, combo, game, attackerIsPlayer) {
        const baseDamage = Math.ceil((attacker.maxHp / 10) / 2);

        // 检查八卦游身闪避
        const defenderHasDodge = attackerIsPlayer ? game.enemyDodgeNext : game.playerDodgeNext;
        if (defenderHasDodge) {
            // 闪避，清除buff，并反击
            if (attackerIsPlayer) {
                game.enemyDodgeNext = false;
                game.log += `\n对手八卦游身闪开你的攻击，并反击！`;
            } else {
                game.playerDodgeNext = false;
                game.log += `\n你八卦游身闪开对手攻击，并反击！`;
            }
            // 反击
            const counterDmg = Math.round(baseDamage);
            attacker.hp -= counterDmg;
            game.log += `\n反击造成 ${counterDmg} 点伤害`;
            attacker.hp = Math.max(0, attacker.hp);
            return;
        }

        let damageList = [];
        let hasHeal = false;

        // 攻击方特殊技加成
        let damageBonus = 0;
        let noCounterAttack = false;
        let attackerIgnoreDefense = false;
        let skipAttack = false;

        if (move.special) {
            const spec = PERSONAL_SPECIALS.find(s => s.id === move.special);
            damageBonus += spec.damageBonus || 0;
            if (spec.noCounterAttack) noCounterAttack = true;
            if (spec.heal) {
                attacker.hp = Math.min(attacker.maxHp, attacker.hp + spec.heal);
                game.log += `\n${attackerIsPlayer ? '你' : '对手'}使用${spec.name}，恢复 ${spec.heal} 点体力`;
                hasHeal = true;
            }
            if (spec.nextPriorityBonus) {
                // 放弃本回合攻击，下回合优先度加成
                if (attackerIsPlayer) {
                    game.playerNextPriorityBonus = spec.nextPriorityBonus;
                } else {
                    game.enemyNextPriorityBonus = spec.nextPriorityBonus;
                }
                game.log += `\n${attackerIsPlayer ? '你' : '对手'}蓄力以待，下回合优先度+${Math.round(spec.nextPriorityBonus * 100)}%`;
                skipAttack = true;
            }
        }

        if (skipAttack) {
            return;
        }

        // 攻击方组合效果
        if (combo && combo.effect && !hasHeal) {
            damageList = combo.effect(combo, attacker.hp, baseDamage, attacker.maxHp, attacker, game);
            if (combo.noCounterAttack) noCounterAttack = true;
            if (combo.ignoreDefense) attackerIgnoreDefense = true;
        } else if (move.numbers.length > 0) {
            // 没有组合就是每一下正常伤害
            move.numbers.forEach(() => {
                const dmg = baseDamage * (1 + damageBonus);
                damageList.push(dmg);
            });
        } else if (move.special && damageBonus > 0) {
            // 只有特殊技，打一下
            damageList.push(baseDamage * (1 + damageBonus));
        }

        // 防御方防御效果处理（如果攻击者不忽视防御）
        let fullDefense = false;
        let defenseMultiplier = 1;
        let counterAttack = false;

        if (!attackerIgnoreDefense) {
            const defenderMove = attackerIsPlayer ? game.enemyMove : game.playerMove;
            if (defenderMove.special) {
                const defSpec = PERSONAL_SPECIALS.find(s => s.id === defenderMove.special);
                if (defSpec.fullDefense) fullDefense = true;
                if (defSpec.defenseBonus) {
                    // 防御力+X% = 受到伤害 × (1 - defenseBonus/(1+defenseBonus))
                    // 简化：防御加成 0.5 → 受到伤害 1/(1+0.5) = 0.666...
                    defenseMultiplier = 1 / (1 + defSpec.defenseBonus);
                }
                if (defSpec.counterAttack) counterAttack = true;
            }
        }

        // 应用伤害
        let totalApplied = 0;
        damageList.forEach(dmg => {
            if (fullDefense) {
                game.log += `\n防御成功，不受伤害`;
                return;
            }
            const finalDmg = Math.round(dmg * defenseMultiplier);
            defender.hp -= finalDmg;
            totalApplied += finalDmg;
        });

        if (totalApplied > 0) {
            game.log += `\n${attackerIsPlayer ? '你' : '对手'}击中，${defender === game.player ? '你' : '对手'}总共受到 ${totalApplied} 点伤害`;
        }

        // 反击（如果攻击者不无视反击）
        if (counterAttack && defender.hp > 0 && !noCounterAttack) {
            const counterDmg = Math.round(baseDamage * 0.5);
            attacker.hp -= counterDmg;
            game.log += `\n${attackerIsPlayer ? '对手' : '你'}四两拨千斤，反击造成 ${counterDmg} 点伤害`;
        }

        defender.hp = Math.max(0, defender.hp);
    },

    /**
     * 弃牌并抽新牌
     * 规则：保留未打出的牌，每回合额外抽 (武艺等级 + 1) 张
     * 初始双方都是 5 张，手牌最大不超过 9 张
     */
    discardAndDraw(fighter, move) {
        // move = {special, numbers} - 打出的牌
        // 移除打出的特殊卡
        if (move.special) {
            const specialIndex = fighter.hand.findIndex(c => c.type === 'special' && c.cardId === move.special);
            if (specialIndex >= 0) {
                fighter.discard.push(fighter.hand[specialIndex]);
                fighter.hand.splice(specialIndex, 1);
            }
        }
        // 移除打出的数字卡
        move.numbers.forEach(value => {
            const numIndex = fighter.hand.findIndex(c => c.type === 'number' && c.value === value);
            if (numIndex >= 0) {
                fighter.discard.push(fighter.hand[numIndex]);
                fighter.hand.splice(numIndex, 1);
            }
        });
        // 每回合抽 武艺等级 张，直到手牌达到上限 9 张
        const drawCount = Math.min(
            fighter.skillLevel.martial,
            9 - fighter.hand.length
        );

        // 抽牌
        let drawn = 0;
        for (let i = 0; i < drawCount && fighter.deck.length > 0; i++) {
            const card = fighter.deck.shift();
            fighter.hand.push(card);
            drawn++;
        }
        // 如果牌堆空了，洗牌继续抽
        const remaining = drawCount - drawn;
        if (remaining > 0 && fighter.discard.length > 0) {
            fighter.deck = [...fighter.discard];
            fighter.discard = [];
            fighter.deck.sort(() => Math.random() - 0.5);
            for (let i = 0; i < remaining && fighter.deck.length > 0; i++) {
                const card = fighter.deck.shift();
                fighter.hand.push(card);
            }
        }
    },

    /**
     * 获取回合开始日志
     */
    getRoundStartLog(firstIsPlayer, game) {
        const existing = document.getElementById('battle-log') ? document.getElementById('battle-log').innerHTML : '';
        let log = existing ? existing + '\n\n' : '';
        log += `===== 回合 ${game.round} =====`;
        if (firstIsPlayer) {
            log += '\n你先手攻击！';
        } else {
            log += '\n对手先手攻击！';
        }
        return log;
    },

    /**
     * 获取出牌描述日志
     */
    getMoveDescription(move, combo) {
        let desc = '';
        if (move.special) {
            const spec = PERSONAL_SPECIALS.find(s => s.id === move.special);
            desc += `\n对手打出特殊技：${spec.name}`;
        }
        if (move.numbers.length > 0) {
            desc += `\n对手打出数字卡：${move.numbers.join(', ')}`;
            if (combo) {
                desc += `，触发组合：${combo.name}`;
            }
        }
        return desc;
    }
};
