/**
 * 合战军团对战小游戏（兵法）
 * 完整实现：卡片组合 + 兵种相克 + 阵型相克 + 秘策系统 + 水战规则
 * 遵循策划《合战完整机制·本土化方案》
 */

window.BattleGame = {
    /**
     * 启动游戏
     */
    start(gameView, gameState) {
        const task = gameState.currentTask;
        const player = gameState.getPlayerCharacter();

        // 初始化战斗状态
        // 简化：玩家使用当前技能对应的兵种，这里默认根据任务类型
        let battleType = 'field';
        if (task && task.category === 'military') {
            if (task.missionType === 'siege') battleType = 'siege';
            if (task.missionType === 'naval') battleType = 'naval';
        }

        // 玩家兵种选择简化：根据技能等级选最高的
        const availableTroops = getAvailableTroopsForBattle(battleType);
        let playerTroop = availableTroops[0]; // 默认步兵
        let maxLevel = 0;
        for (const t of availableTroops) {
            const level = gameState.getSkillLevel(t.skillBonus);
            if (level > maxLevel) {
                maxLevel = level;
                playerTroop = t;
            }
        }

        // 获取玩家兵法等级决定秘策次数
        const strategyLevel = gameState.getSkillLevel('strategy');
        const secretUses = 1 + strategyLevel; // Lv1=2, Lv2=3, Lv3=4, Lv4=5

        // 敌方信息简化：根据任务难度设定
        const enemyTroopsCount = 100 + task.baseDifficulty * 10;
        const enemyMorale = 70 + task.baseDifficulty;

        // 发牌：牌堆由所有绿色基础卡 + 玩家已收集的战术卡组成
        let deck = [];
        // 加入所有绿色基础卡各一张（共9张）
        deck = deck.concat(getAllNormalBattleCards());
        // 加入玩家已收集的战术卡
        const playerTactics = getPlayerCollectedTactics(gameState.collectedCards);
        deck = deck.concat(playerTactics);
        // 洗牌
        deck = deck.sort(() => Math.random() - 0.5);

        // 计算玩家攻防
        const pAttack = calculateTroopAttack(
            player.command || 70,
            player.martial || 70,
            playerTroop,
            gameState.getSkillLevel(playerTroop.skillBonus)
        );
        const pDefense = calculateTroopDefense(
            player.command || 70,
            playerTroop,
            gameState.getSkillLevel(playerTroop.skillBonus)
        );

        // 敌方AI默认阵型
        const enemyFormation = getFormationById('none');

        // 随机风向（水战）
        let wind = 'none';
        if (battleType === 'naval') {
            const rand = Math.random();
            if (rand < 0.33) wind = 'player';
            else if (rand < 0.66) wind = 'enemy';
            else wind = 'none';
        }

        // 初始化完整战斗状态
        gameState.battleGame = {
            battleId: task.missionId,
            battleType: battleType,
            phase: 'preBattle', // preBattle → discard → secret → play → result
            currentTurn: 1,
            maxTurns: 5,

            player: {
                general: player,
                troops: 100,
                maxTroops: 100,
                morale: 80,
                formation: null, // 待选择
                unitType: playerTroop,
                attack: pAttack,
                defense: pDefense,
                handCards: [], // 待发牌
                drawPile: deck,
                selectedNormal: [],
                selectedTactic: null,
                playedNormal: null,
                playedTactic: null,
                permanentCard: null,
                secretStrategyUsesLeft: secretUses
            },

            enemy: {
                general: { name: task.name || '敌军' },
                troops: enemyTroopsCount,
                maxTroops: enemyTroopsCount,
                morale: enemyMorale,
                formation: enemyFormation,
                unitType: availableTroops[Math.floor(Math.random() * availableTroops.length)],
                attack: Math.round(10 + task.baseDifficulty * 2),
                defense: Math.round(8 + task.baseDifficulty),
                handCards: [],
                drawPile: [],
                selectedNormal: [],
                selectedTactic: null,
                permanentCard: null
            },

            environment: {
                wind: wind,
                weather: 'clear', // 暂时简化，只支持clear/rain
                currentTurn: 1
            },

            fortification: battleType === 'siege' ? 30 : 0, // 城防
            battleLog: []
        };

        // AI发初始牌
        this.aiInitDraw(gameState.battleGame);

        // 渲染战前阵型选择
        this.renderPreBattle(gameState, gameView);
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
    },

    /**
     * 渲染战前阵型选择
     */
    renderPreBattle(gameState, gameView) {
        const battle = gameState.battleGame;
        const availableFormations = getAvailableFormationsForPlayer(gameState.skills);

        let html = `
            <div class="battle-pre-setup">
                <div class="pre-battle-header">
                    <h2>合战 · 战前布阵</h2>
                    <p>${battle.battleType === 'field' ? '野战' : battle.battleType === 'siege' ? '攻城战' : '水战'}</p>
                </div>
                <div class="player-info-pre">
                    <p><strong>主帅:</strong> ${battle.player.general.name}</p>
                    <p><strong>兵种:</strong> ${battle.player.unitType.emoji} ${battle.player.unitType.name}</p>
                    <p><strong>兵力:</strong> ${battle.player.troops}</p>
                    <p><strong>秘策次数:</strong> ${battle.player.secretStrategyUsesLeft}次</p>
                </div>
                <h3>请选择阵型:</h3>
                <div class="formation-list">
        `;

        availableFormations.forEach(f => {
            html += `
                <div class="formation-item" data-formation-id="${f.id}">
                    <div class="formation-name">${f.emoji} ${f.name}</div>
                    <div class="formation-desc">${f.description}</div>
                </div>
            `;
        });

        html += `
                </div>
                <div class="pre-battle-footer">
                    <button class="btn primary-btn" id="confirm-formation-btn" disabled>确认选择</button>
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;

        // 绑定事件
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
            this.renderBattle(gameState, gameView);
        });
    },

    /**
     * 渲染主战斗界面
     */
    renderBattle(gameState, gameView) {
        const battle = gameState.battleGame;
        const p = battle.player;
        const e = battle.enemy;

        const pPercent = Math.max(0, Math.round((p.troops / p.maxTroops) * 100));
        const ePercent = Math.max(0, Math.round((e.troops / e.maxTroops) * 100));

        let html = `
            <div class="battle-container">
                <div class="battle-header">
                    <h2>${this.getBattleTypeName(battle.battleType)}</h2>
                    <p>第 ${battle.environment.currentTurn} / ${battle.maxTurns} 回合</p>
                </div>

                <div class="battle-status">
                    <div class="side-panel player-side">
                        <div class="side-title">我方 ${p.general.name}</div>
                        <div class="status-row">
                            <span>兵力:</span>
                            <div class="hp-bar">
                                <div class="hp-fill player" style="width: ${pPercent}%"></div>
                            </div>
                            <span>${p.troops} / ${p.maxTroops}</span>
                        </div>
                        <div class="status-row">
                            <span>士气:</span>
                            <div class="morale-bar">
                                <div class="morale-fill player" style="width: ${p.morale}%"></div>
                            </div>
                            <span>${p.morale}</span>
                        </div>
                        <div class="status-row">
                            <span>阵型:</span>
                            <span class="formation-name">${p.formation.emoji} ${p.formation.name}</span>
                        </div>
                        ${p.permanentCard ? `
                        <div class="status-row">
                            <span>常驻:</span>
                            <span class="permanent-name">${p.permanentCard.emoji} ${p.permanentCard.name}</span>
                        </div>
                        ` : ''}
                    </div>

                    <div class="side-panel enemy-side">
                        <div class="side-title">敌方 ${e.general.name}</div>
                        <div class="status-row">
                            <span>兵力:</span>
                            <div class="hp-bar">
                                <div class="hp-fill enemy" style="width: ${ePercent}%"></div>
                            </div>
                            <span>${e.troops} / ${e.maxTroops}</span>
                        </div>
                        <div class="status-row">
                            <span>士气:</span>
                            <div class="morale-bar">
                                <div class="morale-fill enemy" style="width: ${e.morale}%"></div>
                            </div>
                            <span>${e.morale}</span>
                        </div>
                        <div class="status-row">
                            <span>阵型:</span>
                            <span class="formation-name">${e.formation.emoji} ${e.formation.name}</span>
                        </div>
                        ${e.permanentCard ? `
                        <div class="status-row">
                            <span>常驻:</span>
                            <span class="permanent-name">${e.permanentCard.emoji} ${e.permanentCard.name}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
        `;

        // 环境信息
        if (battle.battleType === 'naval' || p.secretStrategyUsesLeft > 0) {
            html += `<div class="battle-environment">`;
            if (battle.battleType === 'naval') {
                const windText = {
                    'player': '我方上风',
                    'enemy': '敌方上风',
                    'none': '无风'
                };
                html += `<span>风向: ${windText[battle.environment.wind]}</span>`;
            }
            html += `<span>秘策剩余: ${p.secretStrategyUsesLeft} 次</span>`;
            html += `</div>`;
        }

        // 出牌区域 - 根据当前阶段显示不同内容
        if (battle.phase === 'discard') {
            html += this.renderDiscardPhase(battle);
        } else if (battle.phase === 'secret') {
            html += this.renderSecretPhase(battle);
        } else if (battle.phase === 'play') {
            html += this.renderPlayPhase(battle);
        }

        // 战斗日志
        html += `
                <div class="battle-log" id="battle-log">
                    ${this.renderBattleLog(battle)}
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        this.bindBattleEvents(battle, gameState, gameView);
    },

    /**
     * 渲染弃牌调整阶段
     */
    renderDiscardPhase(battle) {
        return `
            <div class="battle-play-area">
                <h3>阶段一：手牌调整（可弃掉最多3张，补到5张）</h3>
                <div class="hand-area">
                    <h4>你的手牌</h4>
                    <div class="battle-cards" id="player-hand-cards">
                        ${this.renderHandCards(battle.player.handCards, true, 'discard')}
                    </div>
                </div>
                <div class="selected-cards">
                    <div class="selected-section">
                        <label>已选要弃掉的牌:</label>
                        <div class="selected-slots" id="discard-slots">
                            <div class="selected-slot empty">—</div>
                            <div class="selected-slot empty">—</div>
                            <div class="selected-slot empty">—</div>
                        </div>
                    </div>
                </div>
                <div class="action-buttons">
                    <button class="battle-btn secondary" id="btn-clear-discard">清空选择</button>
                    <button class="battle-btn primary" id="btn-confirm-discard" ${this.canConfirmDiscard(battle) ? '' : 'disabled'}>确认弃牌</button>
                </div>
            </div>
        `;
    },

    /**
     * 渲染秘策阶段
     */
    renderSecretPhase(battle) {
        if (battle.player.secretStrategyUsesLeft <= 0) {
            // 没有秘策次数了，直接跳转到出牌
            battle.phase = 'play';
            this.renderBattle(gameState, gameView);
            return '';
        }

        const playerTactics = getPlayerCollectedTactics(gameState.collectedCards);

        return `
            <div class="battle-play-area">
                <h3>阶段二：秘策（剩余 ${battle.player.secretStrategyUsesLeft} 次）</h3>
                <p>使用秘策可将一张手牌替换为你已学会的任意战术卡。</p>
                <div class="secret-tactics-list">
                    <h4>你的战术卡:</h4>
                    <div class="battle-cards" id="tactic-list">
                        ${playerTactics.map(t => `
                            <div class="battle-card ${t.color}" data-card-id="${t.id}">
                                <div class="battle-card-header">
                                    <span class="battle-card-name">${t.emoji} ${t.name}</span>
                                </div>
                                <div class="battle-card-desc">${t.description}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="action-buttons">
                    <button class="battle-btn secondary" id="btn-skip-secret">跳过秘策</button>
                </div>
            </div>
        `;
    },

    /**
     * 渲染出牌阶段
     */
    renderPlayPhase(battle) {
        return `
            <div class="battle-play-area">
                <h3>阶段三：选择出牌</h3>
                <div class="selected-cards">
                    <div class="selected-section">
                        <label>战术卡（最多 1 张）:</label>
                        <div id="selected-tactic" class="selected-slot ${battle.player.selectedTactic ? battle.player.selectedTactic.color : ''} ${battle.player.selectedTactic ? 'filled' : ''}">
                            ${battle.player.selectedTactic ? `${battle.player.selectedTactic.emoji} ${battle.player.selectedTactic.name}` : '无'}
                        </div>
                    </div>
                    <div class="selected-section">
                        <label>基础卡（最多 3 张，组成数字组合）:</label>
                        <div class="selected-slots" id="normal-slots">
                            <div id="slot-0" class="selected-slot empty">—</div>
                            <div id="slot-1" class="selected-slot empty">—</div>
                            <div id="slot-2" class="selected-slot empty">—</div>
                        </div>
                    </div>
                </div>
                <div class="hand-area">
                    <h4>剩余手牌</h4>
                    <div class="battle-cards" id="player-hand-cards">
                        ${this.renderHandCards(battle.player.handCards, true, 'play')}
                    </div>
                </div>
                <div class="action-buttons">
                    <button class="battle-btn secondary" id="btn-clear-selection">清空选择</button>
                    <button class="battle-btn primary" id="btn-confirm-play" ${this.canConfirmPlay(battle) ? '' : 'disabled'}>确认出牌</button>
                </div>
            </div>
        `;
    },

    /**
     * 渲染手牌
     */
    renderHandCards(cards, canSelect, phase) {
        return cards.map(card => `
            <div class="battle-card ${card.color} ${canSelect ? 'selectable' : ''}" data-card-id="${card.id}" data-phase="${phase}">
                <div class="battle-card-header">
                    <span class="battle-card-name">${card.emoji} ${card.name}</span>
                </div>
                <div class="battle-card-desc">${card.description}</div>
            </div>
        `).join('');
    },

    /**
     * 渲染战斗日志
     */
    renderBattleLog(battle) {
        return battle.battleLog.map(entry => `<div class="battle-log-entry">${entry}</div>`).join('');
    },

    /**
     * 检查是否可以确认弃牌
     */
    canConfirmDiscard(battle) {
        // 总是可以确认，即使不弃也能进下一步
        return true;
    },

    /**
     * 检查是否可以确认出牌
     */
    canConfirmPlay(battle) {
        // 至少选一张基础卡
        return battle.player.selectedNormal.length > 0;
    },

    /**
     * 绑定事件
     */
    bindBattleEvents(battle, gameState, gameView) {
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

                    this.updateDiscardSlots(selectedToDiscard);
                });
            });

            // 清空
            document.getElementById('btn-clear-discard').addEventListener('click', () => {
                selectedToDiscard = [];
                document.querySelectorAll('#player-hand-cards .battle-card').forEach(c => c.classList.remove('selected'));
                this.updateDiscardSlots([]);
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
                    this.addLog(battle, `弃掉了 ${selectedToDiscard.length} 张牌，补入新牌。`);
                } else {
                    this.addLog(battle, `保留所有手牌，进入下一阶段。`);
                }

                // 进入秘策阶段
                battle.phase = 'secret';
                this.renderBattle(gameState, gameView);
            });
        }

        // 秘策阶段
        if (battle.phase === 'secret') {
            document.getElementById('btn-skip-secret').addEventListener('click', () => {
                this.addLog(battle, `跳过秘策。`);
                battle.phase = 'play';
                this.renderBattle(gameState, gameView);
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
            this.updatePlaySelection(selectedNormal, selectedTactic);

            // 点击手牌
            document.querySelectorAll('#player-hand-cards .battle-card.selectable').forEach(cardEl => {
                cardEl.addEventListener('click', () => {
                    const cardId = cardEl.dataset.cardId;
                    const card = battle.player.handCards.find(c => c.id === cardId);

                    if (card.color === 'green') {
                        // 基础卡，加到选中
                        const index = selectedNormal.findIndex(c => c.id === card.id);
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

                    this.updatePlaySelection(selectedNormal, selectedTactic);
                    this.updateConfirmPlayButton(selectedNormal);
                });
            });

            // 清空选择
            document.getElementById('btn-clear-selection').addEventListener('click', () => {
                selectedNormal = [];
                selectedTactic = null;
                document.querySelectorAll('#player-hand-cards .battle-card').forEach(c => c.classList.remove('selected'));
                this.updatePlaySelection(selectedNormal, selectedTactic);
                this.updateConfirmPlayButton(selectedNormal);
            });

            // 确认出牌
            document.getElementById('btn-confirm-play').addEventListener('click', () => {
                battle.player.selectedNormal = selectedNormal;
                battle.player.selectedTactic = selectedTactic;
                this.resolveTurn(battle, gameState, gameView);
            });
        }
    },

    /**
     * 更新弃牌槽显示
     */
    updateDiscardSlots(selected) {
        const container = document.getElementById('discard-slots');
        const slots = container.querySelectorAll('.selected-slot');
        for (let i = 0; i < 3; i++) {
            if (selected[i]) {
                slots[i].innerHTML = `${selected[i].emoji} ${selected[i].name}`;
                slots[i].className = `selected-slot filled ${selected[i].color}`;
            } else {
                slots[i].innerHTML = '—';
                slots[i].className = 'selected-slot empty';
            }
        }
    },

    /**
     * 更新出牌选择显示
     */
    updatePlaySelection(selectedNormal, selectedTactic) {
        // 更新战术槽
        const tacticSlot = document.getElementById('selected-tactic');
        if (selectedTactic) {
            tacticSlot.innerHTML = `${selectedTactic.emoji} ${selectedTactic.name}`;
            tacticSlot.className = `selected-slot filled ${selectedTactic.color}`;
        } else {
            tacticSlot.innerHTML = '无';
            tacticSlot.className = 'selected-slot';
        }

        // 更新基础槽
        for (let i = 0; i < 3; i++) {
            const slot = document.getElementById(`slot-${i}`);
            if (selectedNormal[i]) {
                slot.innerHTML = `${selectedNormal[i].emoji} ${selectedNormal[i].number}`;
                slot.className = `selected-slot filled ${selectedNormal[i].color}`;
            } else {
                slot.innerHTML = '—';
                slot.className = 'selected-slot empty';
            }
        }
    },

    /**
     * 更新确认按钮状态
     */
    updateConfirmPlayButton(selectedNormal) {
        const btn = document.getElementById('btn-confirm-play');
        btn.disabled = selectedNormal.length === 0;
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

        // 简单用confirm模拟dialog
        // 实际点击替换
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
                this.addLog(battle, `使用秘策，将一张手牌替换为【${newTactic.name}】。剩余秘策次数: ${battle.player.secretStrategyUsesLeft}`);
                // 进入出牌阶段
                battle.phase = 'play';
                document.body.removeChild(container);
                this.renderBattle(gameState, gameView);
            });
        });
    },

    /**
     * 添加日志
     */
    addLog(battle, text) {
        battle.battleLog.push(text);
        if (battle.battleLog.length > 20) {
            battle.battleLog.shift();
        }
    },

    /**
     * 解决一回合
     */
    resolveTurn(battle, gameState, gameView) {
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
            this.addLog(battle, `你使用常驻卡【${pTactic.name}】，效果持续生效。`);
        }
        // AI处理
        if (aiTactic && aiTactic.effect && aiTactic.effect.permanent) {
            battle.enemy.permanentCard = aiTactic;
            this.addLog(battle, `敌方使用常驻卡【${aiTactic.name}】，效果持续生效。`);
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
        pDesc += `，对敌方造成 ${pDamage} 伤害。`;
        this.addLog(battle, pDesc);

        let aiDesc = `敌方打出${aiTactic ? `【${aiTactic.name}】 + ` : ''}${aiCombination.name}(${aiCards.map(c => c.number).join('-')})`;
        aiDesc += `，对你方造成 ${aiDamage} 伤害。`;
        this.addLog(battle, aiDesc);

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

        this.renderBattle(gameState, gameView);
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
            this.addLog(battle, `${side === 'player' ? '敌方' : '我方'}士气 ${tacticCard.effect.enemyMoraleChange > 0 ? '+' : ''}${tacticCard.effect.enemyMoraleChange}`);
        }

        // 城防伤害
        if (battle.battleType === 'siege' && tacticCard.effect.fortificationDamage) {
            battle.fortification -= tacticCard.effect.fortificationDamage;
            this.addLog(battle, `城防 -${tacticCard.effect.fortificationDamage}`);
        }

        // 百分比伤害
        if (tacticCard.effect.percentageDamagePerTurn) {
            const damage = Math.round(defender.troops * tacticCard.effect.percentageDamagePerTurn);
            defender.troops -= damage;
            this.addLog(battle, `${side === 'player' ? '敌方' : '我方'}兵力 -${damage} (${tacticCard.effect.percentageDamagePerTurn * 100}%)`);
        }

        // 自伤
        if (tacticCard.effect.selfDamagePercent) {
            const damage = Math.round(attacker.troops * tacticCard.effect.selfDamagePercent);
            attacker.troops -= damage;
            this.addLog(battle, `${side === 'player' ? '我方' : '敌方'}自身反伤 -${damage}`);
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
        const task = gameState.currentTask;
        let ratio = playerWin ? 1 : Math.max(0.3, battle.player.troops / battle.player.maxTroops);

        const finalMerit = Math.round(task.rewardMerit * ratio);
        const finalMoney = Math.round(task.rewardMoney * ratio);
        const expGained = Math.round(task.baseDifficulty * 5 * ratio);

        gameState.merit += finalMerit;
        gameState.money += finalMoney;
        if (task.requiredSkill) {
            gameState.addSkillExp(task.requiredSkill, expGained);
        }

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

        const skillName = getSkillById(task.requiredSkill)?.name || '';
        gameState.checkRolePromotion();

        let resultMsg = `合战【${task.name}】完成！你${playerWin ? '获胜' : '战败'}，获得 ${finalMerit} 功勋，${finalMoney} 金钱，${expGained} ${skillName}经验。`;
        gameState.addLog(resultMsg);

        const logContainer = document.getElementById('battle-log');
        this.addLog(battle, resultMsg);
        logContainer.innerHTML = this.renderBattleLog(battle);
        logContainer.scrollTop = logContainer.scrollHeight;

        // 延迟返回
        setTimeout(() => {
            gameView.advanceTwoMonths();
            gameState.currentTask = null;
            gameState.battleGame = null;
            gameState.currentScene = GameScene.CITY_VIEW;
            gameView.renderAll();
        }, 2000);
    },

    /**
     * 获取战斗类型名称
     */
    getBattleTypeName(type) {
        switch (type) {
            case 'field': return '野战';
            case 'siege': return '攻城战';
            case 'naval': return '水战';
            default: return '合战';
        }
    }
};
