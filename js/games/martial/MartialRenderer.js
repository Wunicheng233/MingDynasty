/**
 * 个人战渲染模块 - 拆分自MartialGame
 * 负责界面渲染
 */
window.MartialRenderer = {
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
                    <div style="display: flex; flex-wrap: wrap; gap: 16px; margin-top: 16px; align-items: flex-start;">
                        ${numberCards.map(c => {
                            const selected = game.playerMove && game.playerMove.numbers.includes(c.value);
                            return `
                                <div class="personal-number-card ${selected ? 'selected' : ''}" data-value="${c.value}">
                                    <span class="card-number">${c.value}</span>
                                </div>
                            `;
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
        MartialController.bindEvents(gameState, gameView);
    },

    /**
     * 更新确认按钮状态
     */
    updateConfirmButton(game) {
        const btn = document.getElementById('confirm-play-btn');
        // 新规则：要么选一张特殊卡，要么选1-3张数字卡，不能同时选
        const hasSpecial = game.playerMove.special !== null;
        const hasNumbers = game.playerMove.numbers.length > 0 && game.playerMove.numbers.length <= 3;
        const valid = (hasSpecial && game.playerMove.numbers.length === 0) || (!hasSpecial && hasNumbers);
        btn.disabled = !valid;
    }
};
