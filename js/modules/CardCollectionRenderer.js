/**
 * 卡片图鉴渲染模块
 * 显示所有已收集/未收集卡片，按类型分组
 */

window.CardCollectionRenderer = {
    /**
     * 渲染卡片图鉴视图
     */
    render(gameState) {
        const container = document.getElementById('card-collection-view');
        if (!container) return;

        const stats = gameState.getCollectionStats();
        const groupedCards = gameState.getCollectedCardsByType();

        const typeNames = {
            [CardTypes.CHARACTER]: '人物卡',
            [CardTypes.SKILL]: '技能卡',
            [CardTypes.TACTIC_BATTLE]: '合战战术卡',
            [CardTypes.MARTIAL_DUEL]: '个人战武技卡',
            [CardTypes.SECRET]: '秘传卡',
            [CardTypes.TITLE]: '称号卡',
            [CardTypes.PLACE]: '名所卡',
            [CardTypes.EVENT]: '事件卡',
            [CardTypes.TREASURE]: '宝物卡',
        };

        let html = `
            <div class="card-collection-container">
                <h2 class="view-title">卡片图鉴</h2>
                <div class="collection-stats">
                    <div class="stat-item">
                        <span class="stat-label">总计收集</span>
                        <span class="stat-value">${stats.total} / ${stats.totalPossible}</span>
                    </div>
                </div>
                <div class="collection-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${stats.total * 100 / stats.totalPossible}%"></div>
                    </div>
                    <span class="progress-text">${Math.round(stats.total * 100 / stats.totalPossible)}%</span>
                </div>
        `;

        for (const [type, cards] of Object.entries(groupedCards)) {
            if (cards.length === 0) continue;

            const typeName = typeNames[type] || type;
            const typeTotal = stats.byType[type] ? stats.byType[type].total : 0;
            const collected = stats.byType[type] ? stats.byType[type].collected : 0;

            html += `
                <div class="card-type-section">
                    <h3 class="type-title">${typeName} (${collected} / ${typeTotal})</h3>
                    <div class="cards-grid">
            `;

            cards.forEach(card => {
                const collected = gameState.hasCard(card.card_id);
                const rarityClass = card.rarity ? `rarity-${card.rarity}` : '';
                html += `
                    <div class="card-item ${collected ? 'collected' : 'uncollected'} ${rarityClass}">
                `;

                // 确定图片路径：
                // 1. 人物卡优先使用portrait对应的立绘图片（按星级分子目录）
                // 2. 其他卡片使用自带的image字段
                // 3. 都没有则使用emoji
                let imagePath = null;
                if (collected) {
                    if (card.type === CardTypes.CHARACTER && card.portrait) {
                        // 人物卡按rarity分目录
                        let subDir;
                        if (card.rarity >= 5) {
                            subDir = '5star';
                        } else if (card.rarity >= 4) {
                            subDir = '4star';
                        } else if (card.rarity >= 3) {
                            subDir = '3star';
                        } else {
                            subDir = '';
                        }
                        imagePath = `images/characters/${subDir}/${card.portrait}.png`;
                    } else if (card.image) {
                        imagePath = card.image;
                    }
                }

                if (imagePath) {
                    html += `<div class="card-illustration">
                        <img src="${imagePath}" alt="${card.name}">
                    </div>`;
                } else {
                    // 没有插图，继续用emoji
                    html += `<div class="card-emoji">${card.emoji || '🃏'}</div>`;
                }

                html += `
                        <div class="card-info">
                            <div class="card-name">${collected ? card.name : '???'}</div>
                            ${collected ? `<div class="card-desc">${card.description || ''}</div>` : '<div class="card-desc">未收集</div>'}
                        </div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        }

        html += `</div>`;
        container.innerHTML = html;
        container.style.display = 'block';
    }
};
