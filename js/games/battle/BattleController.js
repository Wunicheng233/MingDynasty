/**
 * 合战控制模块 - 拆分自BattleGame
 * 负责事件绑定、回合处理、结算
 */
window.BattleController = {
    /**
     * 绑定战前选择事件
     */
    bindPreBattleEvents(gameState, gameView) {
        const battle = gameState.battleGame;
        let selectedId = null;
        document.querySelectorAll('.formation-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.formation-item').forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                selectedId = item.dataset.formationId;
                document.getElementById('confirm-formation-btn').disabled = false;
            });
        });

        document.getElementById('confirm-formation-btn').addEventListener('click', () => {
            const formation = getFormationById(selectedId);
            battle.player.formation = formation;
            // 应用阵型每回合士气加成
            if (formation.effects.moralePerTurn) {
                battle.player.morale += formation.effects.moralePerTurn;
            }
            // 初始抽牌
            battle.player.handCards = drawNCards(5, battle.player.drawPile);
            battle.phase = 'discard';
            BattleRenderer.renderBattle(gameState, gameView);
        });
    },

    /**
     * 绑定战斗阶段事件
     */
    bindBattleEvents(gameState, gameView) {
        const battle = gameState.battleGame;

        // 弃牌阶段
        if (battle.phase === 'discard') {
            let selectedToDiscard = [];

            // 点击手牌选要弃的
            document.querySelectorAll('#player-hand-cards .battle-card.selectable').forEach(cardEl => {
                cardEl.addEventListener('click', () => {
                    const cardId = cardEl.dataset.cardId;
                    const card = battle.player.handCards.find(c => c.id === cardId);
                    const index = selectedToDiscard.findIndex(c => c.id === cardId);

                    if (index >= 0) {
                        selectedToDiscard.splice(index, 1);
                        cardEl.classList.remove('selected');
                    } else {
                        if (selectedToDiscard.length >= 3) return;
                        selectedToDiscard.push(card);
                        cardEl.classList.add('selected');
                    }

                    BattleRenderer.updateDiscardSlots(selectedToDiscard);
                });
            });

            // 清空
            document.getElementById('btn-clear-discard').addEventListener('click', () => {
                selectedToDiscard = [];
                document.querySelectorAll('#player-hand-cards .battle-card').forEach(c => c.classList.remove('selected'));
                BattleRenderer.updateDiscardSlots([]);
            });

            // 确认弃牌
            document.getElementById('btn-confirm-discard').addEventListener('click', () => {
                // 弃牌
                selectedToDiscard.forEach(c => {
                    battle.player.handCards = battle.player.handCards.filter(hc => hc.id !== c.id);
                });
                // 补牌
                const need = 5 - battle.player.handCards.length;
                for (let i = 0; i < need && battle.player.drawPile.length > 0; i++) {
                    battle.player.handCards.push(battle.player.drawPile.shift());
                }

                // 添加日志
                if (selectedToDiscard.length > 0) {
                    BattleRenderer.addLog(battle, `弃掉了 ${selectedToDiscard.length} 张牌，补入新牌。`);
                } else {
                    BattleRenderer.addLog(battle, `保留所有手牌，进入下一阶段。`);
                }

                // 进入秘策阶段
                battle.phase = 'secret';
                BattleRenderer.renderBattle(gameState, gameView);
            });
        }

        // 秘策阶段
        if (battle.phase === 'secret') {
            document.getElementById('btn-skip-secret').addEventListener('click', () => {
                BattleRenderer.addLog(battle, `跳过秘策。`);
                battle.phase = 'play';
                BattleRenderer.renderBattle(gameState, gameView);
            });

            // 点击战术卡使用秘策
            document.querySelectorAll('#tactic-list .battle-card').forEach(cardEl => {
                cardEl.addEventListener('click', () => {
                    const cardId = cardEl.dataset.cardId;
                    const tactic = getAllBattleCards().find(c => c.id === cardId);

                    // 让玩家选一张手牌替换
                    this.showReplaceCardDialog(battle, tactic, gameState, gameView);
                });
            });
        }

        // 出牌阶段
        if (battle.phase === 'play') {
            let selectedNormal = [...battle.player.selectedNormal];
            let selectedTactic = battle.player.selectedTactic;

            // 更新选中显示
            BattleRenderer.updatePlaySelection(selectedNormal, selectedTactic);

            // 点击手牌
            document.querySelectorAll('#player-hand-cards .battle-card.selectable').forEach(cardEl => {
                cardEl.addEventListener('click', () => {
                    const cardId = cardEl.dataset.cardId;
                    const card = battle.player.handCards.find(c => c.id === cardId);

                    if (card.color === 'green') {
                        // 基础卡，加到选中
                        const index = selectedNormal.findIndex(c => c.id === cardId);
                        if (index >= 0) {
                            selectedNormal.splice(index, 1);
                            cardEl.classList.remove('selected');
                        } else {
                            if (selectedNormal.length >= 3) return;
                            selectedNormal.push(card);
                            cardEl.classList.add('selected');
                        }
                    } else if (card.color === 'red') {
                        // 战术卡，切换选择
                        if (selectedTactic && selectedTactic.id === card.id) {
                            selectedTactic = null;
                            cardEl.classList.remove('selected');
                        } else {
                            if (selectedTactic) {
                                document.querySelector(`[data-card-id="${selectedTactic.id}"]`).classList.remove('selected');
                            }
                            selectedTactic = card;
                            cardEl.classList.add('selected');
                        }
                    }

                    BattleRenderer.updatePlaySelection(selectedNormal, selectedTactic);
                    BattleRenderer.updateConfirmPlayButton(selectedNormal);
                });
            });

            // 清空选择
            document.getElementById('btn-clear-selection').addEventListener('click', () => {
                selectedNormal = [];
                selectedTactic = null;
                document.querySelectorAll('#player-hand-cards .battle-card').forEach(c => c.classList.remove('selected'));
                BattleRenderer.updatePlaySelection(selectedNormal, selectedTactic);
                BattleRenderer.updateConfirmPlayButton(selectedNormal);
            });

            // 确认出牌
            document.getElementById('btn-confirm-play').addEventListener('click', () => {
                battle.player.selectedNormal = selectedNormal;
                battle.player.selectedTactic = selectedTactic;
                this.resolveTurn(gameState, gameView);
            });
        }
    },

    /**
     * 显示换牌对话框
     */
    showReplaceCardDialog(battle, newTactic, gameState, gameView) {
        if (battle.player.secretStrategyUsesLeft <= 0) return;

        let html = `<p>请选择一张手牌替换为【${newTactic.emoji} ${newTactic.name}】:</p><div class="secret-replace-cards">`;
        battle.player.handCards.forEach(c => {
            html += `<div class="battle-card ${c.color} selectable" data-card-id="${c.id}">
                <div class="battle-card-name">${c.emoji} ${c.name}</div>
            </div>`;
        });
        html += `</div>`;

        // 简单用overlay做dialog
        const container = document.createElement('div');
        container.className = 'modal-overlay';
        container.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-header">
                    <h3>使用秘策换牌</h3>
                </div>
                <div class="modal-body">
                    ${html}
                </div>
                <div class="modal-footer">
                    <button class="btn secondary-btn" id="cancel-replace">取消</button>
                </div>
            </div>
        `;
        document.body.appendChild(container);

        container.querySelector('#cancel-replace').addEventListener('click', () => {
            document.body.removeChild(container);
        });

        container.querySelectorAll('.secret-replace-cards .battle-card').forEach(cardEl => {
            cardEl.addEventListener('click', () => {
                const cardId = cardEl.dataset.cardId;
                // 移除旧牌
                battle.player.handCards = battle.player.handCards.filter(c => c.id !== cardId);
                // 添加新牌
                battle.player.handCards.push(newTactic);
                // 减秘策次数
                battle.player.secretStrategyUsesLeft--;
                BattleRenderer.addLog(battle, `使用秘策，将一张手牌替换为【${newTactic.name}】。剩余秘策次数: ${battle.player.secretStrategyUsesLeft}`);
                // 进入出牌阶段
                battle.phase = 'play';
                document.body.removeChild(container);
                BattleRenderer.renderBattle(gameState, gameView);
            });
        });
    },

    /**
     * 解决一回合
     */
    resolveTurn(gameState, gameView) {
        const battle = gameState.battleGame;
        // 玩家出牌
        const pCards = battle.player.selectedNormal;
        const pTactic = battle.player.selectedTactic;

        // 从手牌移除打出的牌
        pCards.forEach(c => {
            battle.player.handCards = battle.player.handCards.filter(hc => hc.id !== c.id);
        });
        if (pTactic) {
            battle.player.handCards = battle.player.handCards.filter(hc => hc.id !== pTactic.id);
        }

        // AI选择出牌
        const aiResult = BattleAI.selectCards(battle.enemy, battle);
        const aiCards = aiResult.normalCards;
        const aiTactic = aiResult.tacticCard;

        // 判定组合
        const pCombination = BattleCalculator.determineCombination(pCards);
        const aiCombination = BattleCalculator.determineCombination(aiCards);

        // 记录打出的牌
        battle.player.playedNormal = pCards;
        battle.player.playedTactic = pTactic;
        battle.enemy.playedNormal = aiCards;
        battle.enemy.playedTactic = aiTactic;

        // 阵型相克士气变化
        const pRelation = BattleCalculator.getMoraleChangeFromFormation(
            battle.player.formation,
            battle.enemy.formation
        );
        battle.player.morale += pRelation.attackerAdd;
        battle.enemy.morale += pRelation.defenderAdd;

        // 阵型每回合士气加成
        if (battle.player.formation.effects.moralePerTurn) {
            battle.player.morale += battle.player.formation.effects.moralePerTurn;
        }
        if (battle.enemy.formation.effects.moralePerTurn) {
            battle.enemy.morale += battle.enemy.formation.effects.moralePerTurn;
        }

        // 处理常驻卡效果 - 玩家战术卡
        if (pTactic && pTactic.effect && pTactic.effect.permanent) {
            battle.player.permanentCard = pTactic; // 覆盖
            BattleRenderer.addLog(battle, `你使用常驻卡【${pTactic.name}】，效果持续生效。`);
        }
        // AI处理
        if (aiTactic && aiTactic.effect && aiTactic.effect.permanent) {
            battle.enemy.permanentCard = aiTactic;
            BattleRenderer.addLog(battle, `敌方使用常驻卡【${aiTactic.name}】，效果持续生效。`);
        }

        // 计算双方伤害
        const pDamage = BattleCalculator.calculateDamage(
            battle.player,
            battle.enemy,
            pCombination,
            pTactic,
            battle
        );
        const aiDamage = BattleCalculator.calculateDamage(
            battle.enemy,
            battle.player,
            aiCombination,
            aiTactic,
            battle
        );

        // 保证一定是数字，避免 NaN
        const safePDamage = typeof pDamage === 'number' && !isNaN(pDamage) ? pDamage : 1;
        const safeAiDamage = typeof aiDamage === 'number' && !isNaN(aiDamage) ? aiDamage : 1;

        // 应用伤害
        battle.enemy.troops -= safePDamage;
        battle.player.troops -= safeAiDamage;

        // 限制范围，保证不会 NaN
        battle.player.troops = Math.max(0, typeof battle.player.troops === 'number' && !isNaN(battle.player.troops) ? battle.player.troops : 1);
        battle.enemy.troops = Math.max(0, typeof battle.enemy.troops === 'number' && !isNaN(battle.enemy.troops) ? battle.enemy.troops : 1);
        battle.player.morale = Math.max(0, Math.min(100, typeof battle.player.morale === 'number' && !isNaN(battle.player.morale) ? battle.player.morale : 50));
        battle.enemy.morale = Math.max(0, Math.min(100, typeof battle.enemy.morale === 'number' && !isNaN(battle.enemy.morale) ? battle.enemy.morale : 50));
        battle.player.morale = Math.max(0, Math.min(100, battle.player.morale));
        battle.enemy.morale = Math.max(0, Math.min(100, battle.enemy.morale));

        // 处理特殊战术效果
        this.processSpecialEffects(battle, pTactic, 'player');
        this.processSpecialEffects(battle, aiTactic, 'enemy');

        // 添加日志
        let pDesc = `你打出${pTactic ? `【${pTactic.name}】 + ` : ''}${pCombination.name}(${pCards.map(c => c.number).join('-')})`;
        pDesc += `，对敌方造成 ${safePDamage} 伤害。`;
        BattleRenderer.addLog(battle, pDesc);

        let aiDesc = `敌方打出${aiTactic ? `【${aiTactic.name}】 + ` : ''}${aiCombination.name}(${aiCards.map(c => c.number).join('-')})`;
        aiDesc += `，对你方造成 ${safeAiDamage} 伤害。`;
        BattleRenderer.addLog(battle, aiDesc);

        // 检查战斗是否结束
        const result = BattleCalculator.checkBattleEnd(battle);
        if (result) {
            this.finish(battle, gameState, gameView, result.winner === 'player');
            return;
        }

        // 抽新牌到5张
        this.refillHand(battle.player);

        // AI抽牌
        this.aiRefillHand(battle.enemy);

        // 下回合
        battle.environment.currentTurn++;
        battle.phase = 'discard';

        // 随机新风向（水战每回合重新随机）
        if (battle.battleType === 'naval') {
            const rand = Math.random();
            if (rand < 0.33) battle.environment.wind = 'player';
            else if (rand < 0.66) battle.environment.wind = 'enemy';
            else battle.environment.wind = 'none';
        }

        BattleRenderer.renderBattle(gameState, gameView);
        // 滚动日志到底部
        setTimeout(() => {
            const log = document.getElementById('battle-log');
            if (log) log.scrollTop = log.scrollHeight;
        }, 100);
    },

    /**
     * 处理特殊战术效果
     */
    processSpecialEffects(battle, tacticCard, side) {
        if (!tacticCard || !tacticCard.effect) return;

        const attacker = side === 'player' ? battle.player : battle.enemy;
        const defender = side === 'player' ? battle.enemy : battle.player;

        // 士气变化
        if (tacticCard.effect.enemyMoraleChange) {
            defender.morale += tacticCard.effect.enemyMoraleChange;
            defender.morale = Math.max(0, Math.min(100, defender.morale));
            BattleRenderer.addLog(battle, `${side === 'player' ? '敌方' : '我方'}士气 ${tacticCard.effect.enemyMoraleChange > 0 ? '+' : ''}${tacticCard.effect.enemyMoraleChange}`);
        }

        // 城防伤害
        if (battle.battleType === 'siege' && tacticCard.effect.fortificationDamage) {
            battle.fortification -= tacticCard.effect.fortificationDamage;
            BattleRenderer.addLog(battle, `城防 -${tacticCard.effect.fortificationDamage}`);
        }

        // 百分比伤害
        if (tacticCard.effect.percentageDamagePerTurn) {
            const damage = Math.round(defender.troops * tacticCard.effect.percentageDamagePerTurn);
            defender.troops -= damage;
            BattleRenderer.addLog(battle, `${side === 'player' ? '敌方' : '我方'}兵力 -${damage} (${tacticCard.effect.percentageDamagePerTurn * 100}%)`);
        }

        // 自伤
        if (tacticCard.effect.selfDamagePercent) {
            const damage = Math.round(attacker.troops * tacticCard.effect.selfDamagePercent);
            attacker.troops -= damage;
            BattleRenderer.addLog(battle, `${side === 'player' ? '我方' : '敌方'}自身反伤 -${damage}`);
        }
    },

    /**
     * 补牌到5张
     */
    refillHand(player) {
        while (player.handCards.length < 5 && player.drawPile.length > 0) {
            player.handCards.push(player.drawPile.shift());
        }
    },

    /**
     * AI补牌
     */
    aiRefillHand(ai) {
        // AI先弃牌
        const toDiscard = BattleAI.selectCardsToDiscard(ai.handCards, 3);
        toDiscard.forEach(c => {
            ai.handCards = ai.handCards.filter(hc => hc.id !== c.id);
        });
        // 补牌
        while (ai.handCards.length < 5 && ai.drawPile.length > 0) {
            ai.drawPile.push(getAllBattleCards()[Math.floor(Math.random() * getAllBattleCards().length)]);
            ai.handCards.push(ai.drawPile.shift());
        }
    },

    /**
     * 结束战斗结算
     */
    finish(battle, gameState, gameView, playerWin) {
        const template = getMissionTemplateById(gameState.currentTask.templateId);
        let ratio = playerWin ? 1 : Math.max(0.3, battle.player.troops / battle.player.maxTroops);

        // 实际进度 = 目标值 * 完成率
        const actualProgress = Math.round(gameState.currentTask.targetValue * ratio);
        const successResult = actualProgress > 0;

        // 使用新的主命系统结算
        const result = gameState.completeMission(successResult, actualProgress);

        // 增加合战胜利次数用于称号
        if (playerWin) {
            gameState.incrementBattleWinCount(battle.battleType);
            // 如果玩家使用火器胜利，增加火器计数
            if (battle.player.unitType.id === 'firearm') {
                if (typeof gameState.battleWins.firearm !== 'undefined') {
                    gameState.battleWins.firearm++;
                    gameState.saveBattleWins();
                    gameState.checkBattleTitles();
                }
            }
        }

        let resultMsg = `合战【${template.name}】完成！你${playerWin ? '获胜' : '战败'}`;
        gameState.addLog(resultMsg);

        const logContainer = document.getElementById('battle-log');
        BattleRenderer.addLog(battle, resultMsg);
        logContainer.innerHTML = BattleRenderer.renderBattleLog(battle);
        logContainer.scrollTop = logContainer.scrollHeight;

        // 延迟返回
        setTimeout(() => {
            // 时间推进：按任务限时推进
            TimeSystem.advanceDays(gameState, template.timeLimitDays);
            gameState.battleGame = null;
            gameState.currentScene = GameScene.CITY_VIEW;
            gameView.renderAll();
        }, 2000);
    },

    /**
     * AI初始化抽牌
     */
    aiInitDraw(battle) {
        const aiDeck = [...getAllNormalBattleCards()];
        // AI随机一些战术卡
        const allTactics = getAllBattleCards().filter(c => c.color === 'red');
        for (let i = 0; i < 8; i++) {
            aiDeck.push(allTactics[Math.floor(Math.random() * allTactics.length)]);
        }
        const shuffled = aiDeck.sort(() => Math.random() - 0.5);
        battle.enemy.handCards = shuffled.slice(0, 5);
        battle.enemy.drawPile = shuffled.slice(5);
    }
};
