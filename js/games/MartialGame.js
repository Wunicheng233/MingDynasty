/**
 * 武馆切磋小游戏（武学）
 * 卡片对决个人战，使用数字卡组合和特殊技击败对手
 */

window.MartialGame = {
    /**
     * 启动游戏
     */
    start(gameView, gameState) {
        const task = gameState.currentTask;

        // 获取玩家属性
        const player = gameState.getPlayerCharacter();
        const strength = player.strength || 50;
        const martialLevel = gameState.getSkillLevel('martial') || 0;

        // 计算初始属性
        const maxHp = strength * 2 + 50;
        const handSize = 4 + martialLevel; // 武艺LV0=4, LV3=7

        // 对手 - 馆主，中等属性
        const enemy = {
            name: '武馆师傅',
            maxHp: (strength - 10) * 2 + 50,
            hp: (strength - 10) * 2 + 50,
            handSize: 4 + Math.max(0, martialLevel - 1),
            skillLevel: {martial: Math.max(0, martialLevel - 1)}
        };

        // 初始化牌堆 - 数字卡 1-9 + 已学会的特殊技
        let playerDeck = [];
        // 数字卡 1-9 各一张
        for (let i = 1; i <= 9; i++) {
            playerDeck.push({type: 'number', value: i});
        }
        // 添加默认特殊技太祖长拳
        playerDeck.push({type: 'special', cardId: 'taizu_boxing'});

        // 洗牌
        playerDeck.sort(() => Math.random() - 0.5);

        // 敌人牌堆
        const enemyDeck = this.buildEnemyDeck(enemy);

        // 初始化游戏状态 - 敌人和玩家结构统一
        gameState.martialGame = {
            player: {
                hp: maxHp,
                maxHp: maxHp,
                hand: [],
                deck: playerDeck,
                discard: [],
                handSize: handSize,
                skillLevel: {martial: martialLevel}
            },
            enemy: {
                hp: enemy.maxHp,
                maxHp: enemy.maxHp,
                hand: [],
                deck: enemyDeck,
                discard: [],
                handSize: enemy.handSize,
                skillLevel: enemy.skillLevel
            },
            round: 1,
            phase: 'select', // select -> playing -> result -> next
            playerMove: null,
            enemyMove: null,
            enemyCombo: null,
            comboActivated: null,
            dodgeNext: false,
            gameOver: false
        };

        // 抽初始手牌
        this.drawCardsToHand(gameState.martialGame.player, handSize, gameState);
        this.drawCardsToHand(gameState.martialGame.enemy, enemy.handSize, gameState);

        this.renderRound(gameState, gameView);
    },

    /**
     * 构建对手牌堆
     */
    buildEnemyDeck(enemy) {
        let deck = [];
        // 数字卡
        for (let i = 1; i <= 9; i++) {
            deck.push({type: 'number', value: i});
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
    drawCardsToHand(fighter, handSize, gameState) {
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
    renderRound(gameState, gameView) {
        const game = gameState.martialGame;
        const player = game.player;
        const enemy = game.enemy;

        const playerHpPercent = (player.hp / player.maxHp) * 100;
        const enemyHpPercent = (enemy.hp / enemy.maxHp) * 100;

        // 分出类型：数字卡和特殊卡
        const numberCards = player.hand.filter(c => c.type === 'number');
        const specialCards = player.hand.filter(c => c.type === 'special');

        let html = `
            <div class="personal-battle-header">
                <h2>个人战 · ${gameState.currentTask.name}</h2>
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
                <p style="font-size: 14px; color: #666;">请选择：最多出 1 张特殊技 + 最多 3 张数字卡</p>
            </div>
            <div class="player-hand" style="margin: 15px 0;">
                <div class="special-cards" style="margin-bottom: 15px;">
                    <p><strong>特殊技卡片（最多选1张）：</strong></p>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
                        <button class="btn special-card-btn" data-action="none" style="background: ${game.playerMove && game.playerMove.special === null ? '#e8dcc8' : ''};">不选</button>
                        ${specialCards.map(c => {
                            const spec = PERSONAL_SPECIALS.find(s => s.id === c.cardId);
                            const selected = game.playerMove && game.playerMove.special === c.cardId;
                            return `<button class="btn special-card-btn" data-card="${c.cardId}" style="background: ${selected ? '#e8dcc8' : '#fff'}; color: #333; border: 2px solid #c0392b;">${spec.name}</button>`;
                        }).join('')}
                    </div>
                </div>
                <div class="number-cards">
                    <p><strong>数字卡片（最多选3张，点击选择/取消）：</strong></p>
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
                    game.playerMove.special = btn.dataset.card;
                    document.querySelectorAll('.special-card-btn').forEach(b => {
                        b.style.background = b.dataset.action === 'none' ? '#e8dcc8' : '#fff';
                    });
                    btn.style.background = '#e8dcc8';
                }
                this.updateConfirmButton();
            });
        });

        // 数字卡选择
        document.querySelectorAll('.number-card-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const game = gameState.martialGame;
                if (!game.playerMove) game.playerMove = {special: null, numbers: []};

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
        // 至少要有一张牌
        const hasCard = (game.playerMove.special !== null) || (game.playerMove.numbers.length > 0);
        btn.disabled = !hasCard;
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
        }
        // 识别敌人数字组合
        const enemyCombo = this.identifyCombo(game.enemyMove.numbers);
        if (enemyCombo) {
            game.enemyCombo = enemyCombo;
        }

        // 计算双方优先度
        const playerPriority = this.calculatePriority(game.playerMove, playerCombo, true);
        const enemyPriority = this.calculatePriority(game.enemyMove, enemyCombo, false);

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

        // 记录日志
        let log = this.getRoundStartLog(playerPriority, enemyPriority, firstIsPlayer, gameState);
        game.log = log;

        // 第一人攻击第二人
        this.performAttack(firstFighter, secondFighter, firstMove, firstCombo, game, firstIsPlayer);

        if (secondFighter.hp <= 0) {
            this.finish(gameState, gameView);
            return;
        }

        // 检查第二人是否完全防御
        let secondCanAttack = true;
        if (game.dodgeNext && firstIsPlayer) {
            // 玩家八卦游身闪避了
            game.log += '\n你施展八卦游身，闪避了对手攻击！';
            game.dodgeNext = false;
            secondCanAttack = false;
        }

        // 检查铁门闩完全防御
        if (firstMove.special) {
            const spec = PERSONAL_SPECIALS.find(s => s.id === firstMove.special);
            if (spec && spec.fullDefense && firstIsPlayer) {
                game.log += '\n你施展铁门闩，完全防御对手攻击！';
                secondCanAttack = false;
            }
        }
        if (firstMove.special && firstIsPlayer === false) {
            const spec = PERSONAL_SPECIALS.find(s => s.id === firstMove.special);
            if (spec && spec.fullDefense) {
                game.log += '\n对手施展铁门闩，完全防御你的攻击！';
                secondCanAttack = false;
            }
        }

        if (secondCanAttack) {
            this.performAttack(secondFighter, firstFighter, secondMove, secondCombo, game, !firstIsPlayer);
        }

        if (firstFighter.hp <= 0 || secondFighter.hp <= 0) {
            this.finish(gameState, gameView);
            return;
        }

        // 弃牌抽新牌
        this.discardAndDraw(player, gameState);
        this.discardAndDraw(enemy, gameState);

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
     */
    aiEnemyPlay(gameState) {
        const game = gameState.martialGame;
        const enemy = game.enemy;

        // AI简单策略：如果有特殊技就出，然后选1-3个数字卡
        let special = null;
        const specialCards = enemy.hand.filter(c => c.type === 'special');
        if (specialCards.length > 0 && Math.random() > 0.3) {
            // 随机出一张
            special = specialCards[Math.floor(Math.random() * specialCards.length)].cardId;
        }

        // 选数字卡 - 随机选1-3张
        const numberCards = enemy.hand.filter(c => c.type === 'number').map(c => c.value);
        const count = Math.min(numberCards.length, Math.floor(Math.random() * 3) + 1);
        const selectedNumbers = [];
        for (let i = 0; i < count && numberCards.length > 0; i++) {
            const idx = Math.floor(Math.random() * numberCards.length);
            selectedNumbers.push(numberCards[idx]);
            numberCards.splice(idx, 1);
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
    calculatePriority(move, combo, isPlayer) {
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

        let damageList = [];
        let totalDamage = 0;
        let hasHeal = false;

        // 特殊技加成
        let damageBonus = 0;
        let fullDefense = false;
        let counterAttack = false;

        if (move.special) {
            const spec = PERSONAL_SPECIALS.find(s => s.id === move.special);
            damageBonus += spec.damageBonus || 0;
            if (spec.fullDefense) fullDefense = true;
            if (spec.counterAttack) counterAttack = true;
            if (spec.heal) {
                attacker.hp = Math.min(attacker.maxHp, attacker.hp + spec.heal);
                game.log += `\n${attackerIsPlayer ? '你' : '对手'}使用${spec.name}，恢复 ${spec.heal} 点体力`;
                hasHeal = true;
            }
        }

        // 组合效果处理
        if (combo && combo.effect && !hasHeal) {
            damageList = combo.effect(combo, attacker.hp, baseDamage, attacker.maxHp, attacker, game);
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

        // 应用伤害
        let totalApplied = 0;
        damageList.forEach(dmg => {
            if (fullDefense) {
                game.log += `\n防御成功，不受伤害`;
                return;
            }
            defender.hp -= Math.round(dmg);
            totalApplied += Math.round(dmg);
        });

        if (totalApplied > 0) {
            game.log += `\n${attackerIsPlayer ? '你' : '对手'}击中，${defender === game.player ? '你' : '对手'}总共受到 ${totalApplied} 点伤害`;
        }

        // 反击
        if (counterAttack && defender.hp > 0) {
            const counterDmg = Math.round(baseDamage * 0.5);
            attacker.hp -= counterDmg;
            game.log += `\n${attackerIsPlayer ? '对手' : '你'}四两拨千斤，反击造成 ${counterDmg} 点伤害`;
        }

        defender.hp = Math.max(0, defender.hp);
    },

    /**
     * 弃牌并抽新牌
     */
    discardAndDraw(fighter, gameState) {
        // 所有打出的牌进入弃牌堆
        // 这里简化：全部手牌弃掉，然后抽至上限
        fighter.discard.push(...fighter.hand);
        fighter.hand = [];
        this.drawCardsToHand(fighter, fighter.handSize < fighter.handSize ? fighter.handSize : fighter.handSize, gameState);
    },

    /**
     * 获取回合开始日志
     */
    getRoundStartLog(p1prio, p2prio, firstIsPlayer, gameState) {
        const game = gameState.martialGame;
        const existing = document.getElementById('battle-log') ? document.getElementById('battle-log').innerHTML : '';
        let log = existing ? existing + '\n\n' : '';
        log += `===== 回合 ${game.round} =====`;
        log += `\n你的优先度 ${p1prio.toFixed(1)}，对手优先度 ${p2prio.toFixed(1)}`;
        if (firstIsPlayer) {
            log += '\n你抢先出手！';
        } else {
            log += '\n对手抢先出手！';
        }
        return log;
    },

    /**
     * 战斗结束
     */
    finish(gameState, gameView) {
        const game = gameState.martialGame;
        const playerWon = game.enemy.hp <= 0;
        const task = gameState.currentTask;

        let ratio;
        if (playerWon) {
            ratio = 1.0;
        } else {
            ratio = Math.max(0.2, game.player.hp / (game.player.hp + game.enemy.hp));
        }

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
};
