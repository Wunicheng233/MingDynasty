/**
 * 城中人物列表渲染模块
 * 社交系统 - 显示当前城市中的所有可互动NPC
 */

window.CharacterListRenderer = {
    /**
     * 渲染当前城市中的人物列表
     */
    render(gameState) {
        const container = document.getElementById('character-list-view');
        if (!container) return;

        const characters = gameState.getCharactersInCurrentCity();
        const playerId = gameState.playerCharacterId;
        // 过滤掉玩家自己
        const npcs = characters.filter(c => c.id !== playerId);

        if (npcs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>当前城中没有可互动的人物。</p>
                </div>
            `;
            container.style.display = 'block';
            return;
        }

        let html = `
            <div class="character-list-container">
                <h2 class="view-title">城中人物</h2>
                <div class="character-list">
        `;

        npcs.forEach(npc => {
            const intimacy = gameState.getIntimacy(npc.id);
            const intimacyText = gameState.getIntimacyDescription(intimacy);
            const intimacyHearts = gameState.getIntimacyHearts(intimacy);
            const cardId = `CHAR_${npc.templateId}`;
            const unlocked = gameState.hasCard(cardId);

            html += `
                <div class="character-item">
                    <div class="character-info">
                        <div class="character-header">
                            <span class="character-emoji">${npc.emoji || '👤'}</span>
                            <span class="character-name">${npc.name}</span>
                            <span class="character-rank">${npc.initialRank}</span>
                        </div>
                        <p class="character-desc">${npc.description}</p>
                        <p class="character-relationship">关系：${intimacyHearts} ${intimacyText} ${unlocked ? '✓ 已获得人物卡' : ''}</p>
                    </div>
                    <button class="btn primary-btn interact-btn" data-char-id="${npc.id}">交谈</button>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        container.innerHTML = html;
        container.style.display = 'block';

        // 绑定事件
        container.querySelectorAll('.interact-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const charId = parseInt(e.target.dataset.charId);
                gameState.startSocialInteraction(charId);
                // 通知GameView重新渲染
                window.game.gameView.renderAll();
            });
        });
    }
};
