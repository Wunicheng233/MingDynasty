/**
 * 社交互动视图渲染模块
 * 社交系统 - 与单个NPC的互动界面
 */

window.SocialRenderer = {
    /**
     * 渲染社交互动视图
     */
    render(gameState) {
        const container = document.getElementById('social-view');
        if (!container) {
            // 如果容器不存在，先创建
            const mainDisplay = document.getElementById('main-display');
            const div = document.createElement('div');
            div.id = 'social-view';
            div.className = 'scene-view';
            div.style.display = 'block';
            mainDisplay.appendChild(div);
        }

        const targetId = gameState.currentSocialTarget;
        if (targetId === null) {
            container.innerHTML = '<p class="error">没有选中的人物，返回上一页。</p>';
            container.style.display = 'block';
            return;
        }

        const npc = getCharacterTemplateByNumId(targetId);
        if (!npc) {
            container.innerHTML = '<p class="error">人物不存在。</p>';
            container.style.display = 'block';
            return;
        }

        const intimacy = gameState.getIntimacy(targetId);
        const intimacyText = gameState.getIntimacyDescription(intimacy);
        const intimacyHearts = gameState.getIntimacyHearts(intimacy);

        // 获取玩家的宝物卡列表
        const treasureCards = [];
        for (const cardId in gameState.collectedCards) {
            const card = getCardById(cardId);
            if (card && card.type === CardTypes.TREASURE) {
                treasureCards.push(card);
            }
        }

        // 获取对应人物卡获取rarity来确定子目录
        const cardId = `CHAR_${npc.templateId}`;
        const card = getCardById(cardId);
        const rarity = card?.rarity || 5;
        const isNpc = npc.templateId === 'WUGUAN_SHIFU'; // 特殊处理NPC
        // 使用公共工具获取立绘路径
        const portraitPath = CharacterRendererUtils.getPortraitPath(npc.portrait, rarity, isNpc);

        let html = `
            <div class="social-container">
                <div class="social-header">
                    <div class="npc-portrait">
                        ${portraitPath ? `<img src="${portraitPath}" alt="${npc.name}">` : `<div class="npc-portrait-placeholder">${npc.emoji || '👤'}</div>`}
                    </div>
                    <div class="npc-info">
                        <h2>${npc.name}</h2>
                        <p><span class="npc-info-item">身份：${npc.initialRank}</span>
                        <span class="npc-info-item">性格：${npc.personality}</span>
                        <span class="npc-info-item">关系：${intimacyHearts} ${intimacyText}</span></p>
                    </div>
                </div>
                <div class="social-description">
                    <p>${npc.description}</p>
                </div>
                ${CharacterRendererUtils.generateAttributesHtml(npc.baseStats)}
                ${CharacterRendererUtils.generateSkillsHtml(npc.initialSkills || {})}
        `;

        html += `
                <div class="social-actions">
                    <h3>可进行的互动</h3>
                    <div class="action-list">
        `;

        // 送礼 - 需要有宝物
        if (treasureCards.length > 0) {
            html += `
                <div class="action-group">
                    <h4>赠送宝物</h4>
                    <div class="gift-list">
            `;
            treasureCards.forEach(card => {
                html += `
                    <button class="btn secondary-btn gift-btn" data-card-id="${card.card_id}">
                        ${card.name} <span class="rarity">${'⭐'.repeat(card.rarity)}</span>
                    </button>
                `;
            });
            html += `
                    </div>
                </div>
            `;
        }

        // 茶会
        const canTea = intimacy >= -1 && gameState.money >= 5;
        html += `
            <div class="action-item">
                <button class="btn secondary-btn tea-btn" ${!canTea ? 'disabled' : ''}>
                    🍵 邀请茶会 (5贯)
                </button>
                <p class="action-desc">一起喝茶聊天，提升亲密度。</p>
            </div>
        `;

        // 宴饮
        const canFeast = intimacy >= 0 && gameState.money >= 15;
        html += `
            <div class="action-item">
                <button class="btn secondary-btn feast-btn" ${!canFeast ? 'disabled' : ''}>
                    🍲 邀请宴饮 (15贯)
                </button>
                <p class="action-desc">设宴饮酒，提升更多亲密度。</p>
            </div>
        `;

        // 切磋武艺
        const canDuel = intimacy >= 1;
        html += `
            <div class="action-item">
                <button class="btn secondary-btn duel-btn" ${!canDuel ? 'disabled' : ''}>
                    ⚔️ 请求切磋
                </button>
                <p class="action-desc">切磋武艺，胜利增加亲密度，可能习得秘传。</p>
            </div>
        `;

        // 结义
        const canBrother = gameState.canSwearBrotherhood(targetId);
        if (canBrother) {
            html += `
                <div class="action-item special-action">
                    <button class="btn primary-btn brother-btn">
                        🎯 结为异姓兄弟
                    </button>
                    <p class="action-desc">亲密度达到4心可以结义，结义后关系锁定永不背叛。</p>
                </div>
            `;
        }

        // 求婚
        const canMarry = gameState.canProposeMarriage(targetId);
        if (canMarry) {
            html += `
                <div class="action-item special-action">
                    <button class="btn primary-btn marry-btn">
                        💍 求婚
                    </button>
                    <p class="action-desc">亲密度达到4心可以求婚，婚后关系锁定永不分离。</p>
                </div>
            `;
        }

        // 请求指导技能 - 需要亲密度 >= 2
        if (intimacy >= 2) {
            html += `
                <div class="action-item">
                    <button class="btn secondary-btn practice-btn">
                        📖 请求指导
                    </button>
                    <p class="action-desc">请对方指导你的某项技能，提升技能经验。（尚未实现）</p>
                </div>
            `;
        }

        html += `
                    </div>
                </div>
                <div class="social-footer">
                    <button class="btn secondary-btn back-btn">返回人物列表</button>
                </div>
            </div>
        `;

        container.innerHTML = html;
        container.style.display = 'block';

        // 绑定事件
        container.querySelector('.back-btn')?.addEventListener('click', () => {
            gameState.currentSocialTarget = null;
            // 根据来源返回对应场景：从设施来返回设施，从人物列表来返回人物列表
            const backScene = gameState.previousSceneFromSocial || GameScene.CHARACTER_LIST_VIEW;
            gameState.currentScene = backScene;
            window.game.gameView.renderAll();
        });

        container.querySelector('.tea-btn')?.addEventListener('click', () => {
            gameState.inviteTea(targetId);
            window.game.gameView.renderAll();
        });

        container.querySelector('.feast-btn')?.addEventListener('click', () => {
            gameState.inviteFeast(targetId);
            window.game.gameView.renderAll();
        });

        container.querySelector('.duel-btn')?.addEventListener('click', () => {
            if (gameState.requestDuel(targetId)) {
                gameState.addLog(`个人战系统尚未完成，敬请期待。`);
                window.game.gameView.renderAll();
            }
        });

        container.querySelector('.brother-btn')?.addEventListener('click', () => {
            if (confirm(`确定要与${npc.name}结为异姓兄弟吗？`)) {
                gameState.doSwearBrotherhood(targetId);
                window.game.gameView.renderAll();
            }
        });

        container.querySelector('.marry-btn')?.addEventListener('click', () => {
            if (confirm(`确定要向${npc.name}求婚吗？需要100贯聘礼和一件宝物。`)) {
                gameState.proposeMarriage(targetId);
                window.game.gameView.renderAll();
            }
        });

        container.querySelectorAll('.gift-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cardId = e.target.dataset.cardId;
                gameState.giftTreasure(targetId, cardId);
                window.game.gameView.renderAll();
            });
        });
    }
};
