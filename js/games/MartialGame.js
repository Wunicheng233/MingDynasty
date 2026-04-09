/**
 * 武馆切磋小游戏（武学）
 * 卡片对决个人战，使用数字卡组合和特殊技击败对手
 */

window.MartialGame = {
    /**
     * 启动游戏
     */
    start(gameView, gameState, title = null) {
        // 获取玩家属性
        const player = gameState.getPlayerCharacter();
        const strength = player.strength || 50;
        const martialLevel = gameState.getSkillLevel('martial') || 0;

        // 计算初始属性
        const maxHp = strength * 2 + 50;

        // 对手 - 馆主，中等属性
        const enemy = {
            name: '武馆师傅',
            maxHp: (strength - 10) * 2 + 50,
            hp: (strength - 10) * 2 + 50,
            skillLevel: {martial: Math.max(0, martialLevel - 1)}
        };

        // 初始化牌堆 - 数字卡 1-9 各 3 张 + 默认特殊技
        let playerDeck = [];
        // 数字卡 1-9 各三张
        for (let i = 1; i <= 9; i++) {
            for (let j = 0; j < 3; j++) {
                playerDeck.push({type: 'number', value: i});
            }
        }
        // 添加默认特殊技太祖长拳（一张）
        playerDeck.push({type: 'special', cardId: 'taizu_boxing'});
        // TODO: 未来可以添加玩家已学会的其他特殊技

        // 洗牌
        playerDeck.sort(() => Math.random() - 0.5);

        // 敌人牌堆
        const enemyDeck = this.buildEnemyDeck();

        // 初始化游戏状态 - 敌人和玩家结构统一
        gameState.martialGame = {
            player: {
                hp: maxHp,
                maxHp: maxHp,
                hand: [],
                deck: playerDeck,
                discard: [],
                skillLevel: {martial: martialLevel}
            },
            enemy: {
                hp: enemy.maxHp,
                maxHp: enemy.maxHp,
                hand: [],
                deck: enemyDeck,
                discard: [],
                skillLevel: enemy.skillLevel
            },
            round: 1,
            playerMove: null,
            enemyMove: null,
            enemyCombo: null,
            comboActivated: null,
            playerDodgeNext: false,
            enemyDodgeNext: false,
            playerNextPriorityBonus: 0,
            enemyNextPriorityBonus: 0,
            isPractice: title !== null // 是否是武馆拜师学艺（非主命任务）
        };

        // 抽初始手牌 - 用户要求：双方初始都是5张
        this.drawCardsToHand(gameState.martialGame.player, 5);
        this.drawCardsToHand(gameState.martialGame.enemy, 5);

        this.renderRound(gameState, gameView, title);
    },

    /**
     * 构建对手牌堆
     */
    buildEnemyDeck() {
        let deck = [];
        // 数字卡 1-9 各三张
        for (let i = 1; i <= 9; i++) {
            for (let j = 0; j < 3; j++) {
                deck.push({type: 'number', value: i});
            }
        }
        // 添加基础特殊技
        deck.push({type: 'special', cardId: 'taizu_boxing'});
        deck.push({type: 'special', cardId: 'jin-gang_li'});
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
     * 渲染当前回合
     */
    renderRound(gameState, gameView, title = null) {
        const game = gameState.martialGame;
        const player = game.player;
        const enemy = game.enemy;

        const playerHpPercent = (player.hp / player.maxHp) * 100;
        const enemyHpPercent = (enemy.hp / enemy.maxHp) * 100;

        // 分出类型：数字卡和特殊卡
        const numberCards = player.hand.filter(c => c.type === 'number');
        const specialCards = player.hand.filter(c => c.type === 'special');

        const headerTitle = title || (gameState.currentTask ? gameState.currentTask.name : '拜师学艺');
        let html = `
            <div class="personal-battle-header">
                <h2>个人战 · ${headerTitle}</h2>
                <div class="battle-status" style="display: flex; justify-content: space-between; margin: 10px 0;">
                    <div class="player-status">
                        <p><strong>你</strong> (武艺Lv${player.skillLevel.martial})</p>
                        <p>体力: ${player.hp}/${player.maxHp}</p>
                        <div style="background: #ddd; height: 15px; border-radius: 8px; width: 150px;">
                            <div style="background: #2ecc71; height: 100%; width: ${playerHpPercent}%; border-radius: 8px;"></div>
                        </div>
                    </div>
                    <div class="enemy-status">
                        <p><strong>${enemy.name}</strong></p>
                        <p>体力: ${enemy.hp}/${enemy.maxHp}</p>
                        <div style="background: #ddd; height: 15px; border-radius: 8px; width: 150px;">
                            <div style="background: #e74c3c; height: 100%; width: ${enemyHpPercent}%; border-radius: 8px;"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="battle-rules" style="background: #f5f0e1; padding: 10px; border-radius: 8px; margin: 10px 0;">
                <p><strong>回合 ${game.round}</strong> | 手牌：${player.hand.length} 张</p>
                <p style="font-size: 14px; color: #666;">请选择：<strong>要么选 1 张特殊技，要么选 1-3 张数字卡</strong>，不能同时选</p>
            </div>
            <div class="player-hand" style="margin: 15px 0;">
                <div class="special-cards" style="margin-bottom: 15px;">
                    <p><strong>特殊技卡片（选一张）：</strong></p>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
                        <button class="btn special-card-btn" data-action="none" style="background: ${game.playerMove && game.playerMove.special === null && game.playerMove.numbers.length === 0 ? '#e8dcc8' : ''};">不选</button>
                        ${specialCards.map(c => {
                            const spec = PERSONAL_SPECIALS.find(s => s.id === c.cardId);
                            const selected = game.playerMove && game.playerMove.special === c.cardId;
                            return `<button class="btn special-card-btn" data-card="${c.cardId}" style="background: ${selected ? '#e8dcc8' : '#fff'}; color: #333; border: 2px solid #c0392b;">${spec.name}</button>`;
                        }).join('')}
                    </div>
                </div>
                <div class="number-cards">
                    <p><strong>数字卡片（1-3张，点击选择/取消）：</strong></p>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
                        ${numberCards.map(c => {
                            const selected = game.playerMove && game.playerMove.numbers.includes(c.value);
                            return `<button class="btn number-card-btn" data-value="${c.value}" style="background: ${selected ? '#e8dcc8' : '#fff'}; color: #333; border: 2px solid #2c3e50; width: 50px;">${c.value}</button>`;
                        }).join('')}
                    </div>
                </div>
            </div>
            <div class="battle-actions" style="margin: 20px 0;">
                <button class="btn secondary-btn" id="clear-selection-btn">清空选择</button>
                <button class="btn primary-btn" id="confirm-play-btn" disabled style="margin-left: 10px;">出牌确认</button>
            </div>
            <div class="battle-log" id="battle-log" style="max-height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; border-radius: 5px; margin-top: 15px;">
                ${game.round === 1 ? '对局开始，请出牌...' : ''}
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        this.bindEvents(gameState, gameView);
    },

    /**
     * 绑定事件
     */
    bindEvents(gameState, gameView) {
        // 特殊卡选择
        document.querySelectorAll('.special-card-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const game = gameState.martialGame;
                if (!game.playerMove) game.playerMove = {special: null, numbers: []};

                if (btn.dataset.action === 'none') {
                    game.playerMove.special = null;
                    document.querySelectorAll('.special-card-btn').forEach(b => {
                        b.style.background = '';
                    });
                    btn.style.background = '#e8dcc8';
                } else {
                    // 选择了特殊卡，清空所有数字选择
                    game.playerMove.special = btn.dataset.card;
                    game.playerMove.numbers = [];
                    document.querySelectorAll('.special-card-btn').forEach(b => {
                        b.style.background = b.dataset.action === 'none' ? '#e8dcc8' : '#fff';
                    });
                    btn.style.background = '#e8dcc8';
                    // 取消数字卡样式
                    document.querySelectorAll('.number-card-btn').forEach(b => {
                        b.style.background = '';
                    });
                }
                this.updateConfirmButton(gameState);
            });
        });

        // 数字卡选择
        document.querySelectorAll('.number-card-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const game = gameState.martialGame;
                if (!game.playerMove) game.playerMove = {special: null, numbers: []};

                // 选择了数字卡，清空特殊卡选择
                game.playerMove.special = null;
                document.querySelectorAll('.special-card-btn').forEach(b => {
                    b.style.background = '';
                });
                document.querySelector('.special-card-btn[data-action="none"]').style.background = '#e8dcc8';

                const value = parseInt(btn.dataset.value);
                const idx = game.playerMove.numbers.indexOf(value);
                if (idx >= 0) {
                    // 取消选择
                    game.playerMove.numbers.splice(idx, 1);
                    btn.style.background = '#fff';
                } else {
                    // 超过3张不能选
                    if (game.playerMove.numbers.length >= 3) {
                        return;
                    }
                    game.playerMove.numbers.push(value);
                    btn.style.background = '#e8dcc8';
                }
                this.updateConfirmButton(gameState);
            });
        });

        // 清空选择
        document.getElementById('clear-selection-btn').addEventListener('click', () => {
            const game = gameState.martialGame;
            game.playerMove = {special: null, numbers: []};
            this.renderRound(gameState, gameView);
        });

        // 确认出牌
        document.getElementById('confirm-play-btn').addEventListener('click', () => {
            this.resolveRound(gameState, gameView);
        });
    },

    /**
     * 更新确认按钮状态
     */
    updateConfirmButton(gameState) {
        const game = gameState.martialGame;
        const btn = document.getElementById('confirm-play-btn');
        // 新规则：要么选一张特殊卡，要么选1-3张数字卡，不能同时选
        const hasSpecial = game.playerMove.special !== null;
        const hasNumbers = game.playerMove.numbers.length > 0 && game.playerMove.numbers.length <= 3;
        const valid = (hasSpecial && game.playerMove.numbers.length === 0) || (!hasSpecial && hasNumbers);
        btn.disabled = !valid;
    },

    /**
     * 结算当前回合
     */
    resolveRound(gameState, gameView) {
        const game = gameState.martialGame;
        const player = game.player;
        const enemy = game.enemy;

        // AI随机出牌
        this.aiEnemyPlay(gameState);

        // 识别玩家数字组合
        const playerCombo = this.identifyCombo(game.playerMove.numbers);
        if (playerCombo) {
            game.comboActivated = playerCombo;
            // 处理特殊组合效果
            if (playerCombo.dodgeNext) {
                game.playerDodgeNext = true;
            }
        }
        // 识别敌人数字组合
        const enemyCombo = this.identifyCombo(game.enemyMove.numbers);
        if (enemyCombo) {
            game.enemyCombo = enemyCombo;
            // 处理特殊组合效果
            if (enemyCombo.dodgeNext) {
                game.enemyDodgeNext = true;
            }
        }

        // 计算双方优先度（加上回合优先级奖励）
        let playerPriority = this.calculatePriority(game.playerMove, playerCombo);
        let enemyPriority = this.calculatePriority(game.enemyMove, enemyCombo);
        if (game.playerNextPriorityBonus) {
            playerPriority *= (1 + game.playerNextPriorityBonus);
        }
        if (game.enemyNextPriorityBonus) {
            enemyPriority *= (1 + game.enemyNextPriorityBonus);
        }
        // 清除奖励，只生效一回合
        game.playerNextPriorityBonus = 0;
        game.enemyNextPriorityBonus = 0;

        let firstFighter, secondFighter;
        let firstMove, secondMove;
        let firstCombo, secondCombo;
        let firstIsPlayer = true;

        // 后发先至交换顺序
        if (playerCombo && playerCombo.swapPriority) {
            if (playerPriority < enemyPriority) {
                // 交换
                firstFighter = player;
                secondFighter = enemy;
                firstMove = game.playerMove;
                secondMove = game.enemyMove;
                firstCombo = playerCombo;
                secondCombo = enemyCombo;
            }
        } else if (enemyCombo && enemyCombo.swapPriority) {
            if (enemyPriority < playerPriority) {
                firstFighter = enemy;
                secondFighter = player;
                firstMove = game.enemyMove;
                secondMove = game.playerMove;
                firstCombo = enemyCombo;
                secondCombo = playerCombo;
                firstIsPlayer = false;
            }
        } else {
            if (playerPriority >= enemyPriority) {
                firstFighter = player;
                secondFighter = enemy;
                firstMove = game.playerMove;
                secondMove = game.enemyMove;
                firstCombo = playerCombo;
                secondCombo = enemyCombo;
                firstIsPlayer = true;
            } else {
                firstFighter = enemy;
                secondFighter = player;
                firstMove = game.enemyMove;
                secondMove = game.playerMove;
                firstCombo = enemyCombo;
                secondCombo = playerCombo;
                firstIsPlayer = false;
            }
        }

        // 记录日志 - 添加对手出牌信息，不显示优先度
        let log = this.getRoundStartLog(firstIsPlayer, gameState);
        // 显示对手出了什么牌
        log += this.getMoveDescription(game.enemyMove, game.enemyCombo);
        // 如果有组合，添加组合说明
        if (playerCombo && firstIsPlayer) {
            log += `\n你触发组合技：${playerCombo.name} - ${playerCombo.description}`;
        }
        if (enemyCombo && !firstIsPlayer) {
            log += `\n对手触发组合技：${enemyCombo.name} - ${enemyCombo.description}`;
        }
        game.log = log;

        // 只有优先度高的一方行动，低的一方本回合不能行动
        if (firstIsPlayer) {
            // 玩家优先度更高，玩家攻击对手
            this.performAttack(game.player, game.enemy, game.playerMove, playerCombo, game, true);
        } else {
            // 对手优先度更高，对手攻击玩家
            this.performAttack(game.enemy, game.player, game.enemyMove, enemyCombo, game, false);
        }

        // 检查是否有人战败
        if (game.player.hp <= 0 || game.enemy.hp <= 0) {
            this.finish(gameState, gameView);
            return;
        }

        // 弃牌抽新牌 - 只丢弃打出的牌，保留未打出的
        this.discardAndDraw(player, game.playerMove, gameState);
        this.discardAndDraw(enemy, game.enemyMove, gameState);

        game.round++;
        game.playerMove = null;
        game.enemyMove = null;
        game.enemyCombo = null;
        game.comboActivated = null;

        // 渲染下一回合
        this.renderRound(gameState, gameView);
        // 添加历史日志
        document.getElementById('battle-log').innerHTML = game.log.replace(/\n/g, '<br>');
    },

    /**
     * AI出牌
     * 遵循新规则：要么出一张特殊卡，要么出1-3张数字卡，不能同时出
     */
    aiEnemyPlay(gameState) {
        const game = gameState.martialGame;
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

        // 先检查4连
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
        const gameState = window.game.gameState;
        const gameObj = gameState.martialGame;

        // 检查八卦游身闪避
        const defenderHasDodge = attackerIsPlayer ? gameObj.enemyDodgeNext : gameObj.playerDodgeNext;
        if (defenderHasDodge) {
            // 闪避，清除buff，并反击
            if (attackerIsPlayer) {
                gameObj.enemyDodgeNext = false;
                game.log += `\n对手八卦游身闪开你的攻击，并反击！`;
            } else {
                gameObj.playerDodgeNext = false;
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
        // 攻击方组合效果
        if (skipAttack) {
            // 放弃攻击（如后发制人）
            damageList = [];
        } else if (combo && combo.effect && !hasHeal) {
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
            const defenderMove = attackerIsPlayer ? gameObj.enemyMove : gameObj.playerMove;
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
            game.log += `\n${attackerIsPlayer ? '你' : '对手'}击中，${defender === gameObj.player ? '你' : '对手'}总共受到 ${totalApplied} 点伤害`;
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
    getRoundStartLog(firstIsPlayer, gameState) {
        const game = gameState.martialGame;
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
    },

    /**
     * 战斗结束
     */
    finish(gameState, gameView) {
        const game = gameState.martialGame;
        const playerWon = game.enemy.hp <= 0;
        const task = gameState.currentTask;
        const ratio = playerWon ? 1 : Math.max(0.2, game.player.hp / (game.player.hp + game.enemy.hp));

        if (game.isPractice) {
            // 武馆拜师学艺 - 非任务，固定奖励武艺经验，消耗5天
            const expGained = Math.round(15 * ratio);
            gameState.addSkillExp('martial', expGained);
            gameState.addLog(`拜师学艺完成！你${playerWon ? '获胜' : '战败'}，获得 ${expGained} 武艺经验，消耗5天时间。`);
            gameState.advanceDays(5);
            gameState.martialGame = null;

            // 显示结果页
            let html = `
                <div class="personal-result" style="text-align: center; padding: 30px;">
                    <h2 style="font-size: 28px; margin-bottom: 20px; color: #8b4513;">${playerWon ? '✔ 比武获胜' : '✘ 比试落败'}</h2>
                    <p style="font-size: 16px; margin-bottom: 20px;">${playerWon ? '你拳法进步，赢得师傅赞赏！' : '师傅武艺高超，你虽败犹荣。'}</p>
                    <div style="background: #f5f0e1; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                        <p>你的剩余体力：${game.player.hp} / ${game.player.maxHp}</p>
                        <p>师傅剩余体力：${game.enemy.hp} / ${game.enemy.maxHp}</p>
                    </div>
                    <p>获得：${expGained} 武艺经验</p>
                    <div style="margin-top: 30px;">
                        <button class="btn primary-btn" id="personal-done-btn">返回武馆</button>
                    </div>
                </div>
            `;

            document.getElementById('farming-game-view').innerHTML = html;
            document.getElementById('personal-done-btn').addEventListener('click', () => {
                // 返回设施场景
                gameState.currentScene = GameScene.FACILITY;
                gameView.renderAll();
            });
        } else {
            // 正常任务结算
            const finalMerit = Math.round(task.rewardMerit * ratio);
            const finalMoney = Math.round(task.rewardMoney * ratio);
            const expGained = Math.round(15 * ratio);

            gameState.merit += finalMerit;
            gameState.money += finalMoney;
            if (task.requiredSkill) {
                gameState.addSkillExp(task.requiredSkill, expGained);
            }

            gameState.checkRolePromotion();

            let resultLog = playerWon
                ? `任务【${task.name}】完成！你击败武馆师傅获胜，获得 ${finalMerit} 功勋，${finalMoney} 金钱，${expGained} ${getSkillById(task.requiredSkill)?.name || ''}经验。`
                : `任务【${task.name}】你不敌武馆师傅，获得部分奖励：${finalMerit} 功勋，${finalMoney} 金钱。`;

            gameState.addLog(resultLog);

            // 显示结果页
            let html = `
                <div class="personal-result" style="text-align: center; padding: 30px;">
                    <h2 style="font-size: 28px; margin-bottom: 20px; color: #8b4513;">${playerWon ? '✔ 比武获胜' : '✘ 比试落败'}</h2>
                    <p style="font-size: 16px; margin-bottom: 20px;">${playerWon ? '你拳法进步，赢得师傅赞赏！' : '师傅武艺高超，你虽败犹荣。'}</p>
                    <div style="background: #f5f0e1; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                        <p>你的剩余体力：${game.player.hp} / ${game.player.maxHp}</p>
                        <p>师傅剩余体力：${game.enemy.hp} / ${game.enemy.maxHp}</p>
                    </div>
                    <p>获得：${finalMerit} 功勋，${finalMoney} 金钱</p>
                    <div style="margin-top: 30px;">
                        <button class="btn primary-btn" id="personal-done-btn">返回</button>
                    </div>
                </div>
            `;

            document.getElementById('farming-game-view').innerHTML = html;
            document.getElementById('personal-done-btn').addEventListener('click', () => {
                gameView.advanceTwoMonths();
                gameState.currentTask = null;
                gameState.martialGame = null;
                gameState.currentScene = GameScene.CITY_VIEW;
                gameView.renderAll();
            });
        }
    }
};
