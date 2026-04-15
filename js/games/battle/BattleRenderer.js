/**
 * 合战渲染模块 - 拆分自BattleGame
 * 负责所有界面渲染
 */
window.BattleRenderer = {
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
                    <p>${this.getBattleTypeName(battle.battleType)}</p>
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
        BattleController.bindPreBattleEvents(gameState, gameView);
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
            html += this.renderSecretPhase(battle, gameState, gameView);
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
        BattleController.bindBattleEvents(gameState, gameView);
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
    renderSecretPhase(battle, gameState, gameView) {
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
        return cards.map(card => {
            // 绿色基础数字卡 - 使用背景图+居中大数字（只需要一张背景图）
            if (card.type === 'battle_normal' && card.color === 'green') {
                return `
                    <div class="battle-card ${card.color} number-card ${canSelect ? 'selectable' : ''}" data-card-id="${card.id}" data-phase="${phase}">
                        <span class="card-number">${card.number}</span>
                    </div>
                `;
            }
            // 红色战术卡 - 正常渲染
            return `
                <div class="battle-card ${card.color} ${canSelect ? 'selectable' : ''}" data-card-id="${card.id}" data-phase="${phase}">
                    <div class="battle-card-header">
                        <span class="battle-card-name">${card.emoji} ${card.name}</span>
                    </div>
                    <div class="battle-card-desc">${card.description}</div>
                </div>
            `;
        }).join('');
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
     * 获取战斗类型名称
     */
    getBattleTypeName(type) {
        switch (type) {
            case 'field': return '野战';
            case 'siege': return '攻城战';
            case 'naval': return '水战';
            default: return '合战';
        }
    },

    /**
     * 添加日志
     */
    addLog(battle, text) {
        battle.battleLog.push(text);
        if (battle.battleLog.length > 20) {
            battle.battleLog.shift();
        }
    }
};
