/**
 * 社交互动视图渲染模块
 * 按照UI/09-社交互动界面.md设计规范重构
 * 与NPC进行对话、赠礼、宴请、切磋等互动
 */

import { getCharacterTemplateByNumId } from '../../data/characters.js';
import { getCardById } from '../../data/cards.js';
import CharacterRendererUtils from '../utils/CharacterRendererUtils.js';
import NavigationManager from '../managers/NavigationManager.js';

const SocialRenderer = {
    /**
     * 渲染社交互动视图
     */
    render(gameState) {
        // 确保容器存在
        let container = document.getElementById('social-view');
        if (!container) {
            // 如果容器不存在，先创建
            const mainDisplay = document.getElementById('main-display');
            container = document.createElement('div');
            container.id = 'social-view';
            container.className = 'scene-view';
            mainDisplay.appendChild(container);
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

        // 获取亲密度信息
        const intimacy = gameState.getIntimacy(targetId);
        const intimacyPercent = Math.min(100, Math.round(((intimacy + 5) / 10) * 100)); // -5~5 -> 0~100%
        const intimacyText = gameState.getIntimacyDescription(intimacy);

        // 获取官职/品级
        const rank = npc.initialRank || '平民';

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
        const rarity = card?.rarity || 3;
        const isNpc = npc.templateId === 'WUGUAN_SHIFU';
        // 使用公共工具获取立绘路径
        const portraitPath = CharacterRendererUtils.getPortraitPath(npc.portrait, rarity, isNpc);

        // 如果有当前对话，显示对话气泡和选项
        const currentDialogue = gameState.currentDialogue;

        let html = `
            <div class="social-container">
                <!-- 顶部 NPC 信息区 -->
                <div class="npc-info-bar">
                    <div class="npc-avatar">
                        ${portraitPath ? `<img src="${portraitPath}" alt="${npc.name}">` : `<div class="avatar-placeholder">${npc.emoji || '👤'}</div>`}
                    </div>
                    <div class="npc-basic-info">
                        <div class="name-row">
                            <h2 class="npc-name">${npc.name}</h2>
                            <span class="npc-rank badge-cinnabar">${rank}</span>
                        </div>
                        <div class="favor-row">
                            <span class="favor-label">亲密度</span>
                            <div class="favor-bar-container">
                                <div class="favor-bar-fill" style="width: ${intimacyPercent}%"></div>
                            </div>
                            <span class="favor-value">${intimacyText}</span>
                        </div>
                    </div>
                    <button class="btn-text close-btn" id="social-close">✕</button>
                </div>
        `;

        // 如果有活跃对话，显示对话气泡和选项
        if (currentDialogue && currentDialogue.text) {
            html += `
                <!-- 对话气泡 -->
                <div class="dialogue-bubble">
                    ${currentDialogue.text}
                </div>
            `;

            // 如果有选项，显示选项列表
            if (currentDialogue.options && currentDialogue.options.length > 0) {
                html += `<div class="dialogue-options">`;
                currentDialogue.options.forEach(option => {
                    const change = option.favorChange || 0;
                    const changeText = change > 0 ? `+${change}` : `${change}`;
                    const badgeClass = change > 0 ? 'badge-green' : (change < 0 ? 'badge-cinnabar' : 'badge-default');
                    html += `
                        <div class="option-card" data-option-id="${option.id}">
                            <span class="option-text">${option.text}</span>
                            ${change !== 0 ? `<span class="badge ${badgeClass}">${changeText}</span>` : ''}
                        </div>
                    `;
                });
                html += `</div>`;
            }
        } else {
            // 没有活跃对话，显示人物描述
            html += `
                <div class="dialogue-bubble">
                    ${npc.description || '这位人物十分神秘，尚未有任何记载。'}
                </div>
            `;
        }

        // 底部快捷动作栏
        html += `
            <!-- 底部快捷动作栏 -->
            <div class="social-actions-bar">
                <h3 class="actions-title">互动</h3>
                <div class="actions-buttons">
                    <button class="btn-secondary action-btn" id="action-gift" ${treasureCards.length === 0 ? 'disabled' : ''}>
                        <span>🎁</span>
                        <span>赠礼</span>
                    </button>
                    <button class="btn-secondary action-btn" id="action-tea" ${gameState.money >= 5 ? '' : 'disabled'}>
                        <span>🍵</span>
                        <span>茶会</span>
                        <span class="cost">5</span>
                    </button>
                    <button class="btn-secondary action-btn" id="action-feast" ${gameState.money >= 15 ? '' : 'disabled'}>
                        <span>🍷</span>
                        <span>宴请</span>
                        <span class="cost">15</span>
                    </button>
                    <button class="btn-secondary action-btn" id="action-duel">
                        <span>⚔️</span>
                        <span>切磋</span>
                    </button>
                </div>
            </div>
        `;

        // 如果展开了赠礼，显示礼物列表
        if (gameState.showGiftSelection && treasureCards.length > 0) {
            html += `
                <!-- 礼物选择面板 -->
                <div class="gift-selection-panel">
                    <div class="gift-panel-header">
                        <h4>选择礼物</h4>
                        <button class="btn-text" id="close-gift-panel">关闭</button>
                    </div>
                    <div class="gift-grid">
            `;
            treasureCards.forEach(treasure => {
                const value = treasure.value || 1;
                html += `
                    <button class="gift-card" data-card-id="${treasure.card_id}">
                        <div class="gift-name">${treasure.name}</div>
                        <div class="gift-value">价值 ${value} 贯</div>
                    </button>
                `;
            });
            html += `
                    </div>
                </div>
            `;
        }

        // 特殊动作（结义/求婚）
        const specialActions = [];
        if (gameState.canSwearBrotherhood && gameState.canSwearBrotherhood(targetId)) {
            specialActions.push({ id: 'brotherhood', text: '结为兄弟', desc: '亲密度达到最高' });
        }
        if (gameState.canProposeMarriage && gameState.canProposeMarriage(targetId)) {
            specialActions.push({ id: 'marry', text: '求婚', desc: '亲密度达到最高' });
        }
        if (specialActions.length > 0) {
            html += `<div class="special-actions">`;
            specialActions.forEach(action => {
                html += `<button class="btn-primary special-action-btn" id="action-${action.id}">${action.text}</button>`;
            });
            html += `</div>`;
        }

        html += `
                <div class="social-footer">
                    <button class="btn-secondary back-btn" id="back-to-list">返回</button>
                </div>
            </div>
        `;

        container.innerHTML = html;
        container.style.display = 'block';

        this.bindEvents(gameState, container, targetId);
        this.ensureStylesInjected();
    },

    // 绑定事件
    bindEvents(gameState, container, targetId) {
        // 返回按钮 - 使用新导航系统返回
        container.querySelector('#back-to-list')?.addEventListener('click', () => {
            gameState.currentSocialTarget = null;
            NavigationManager.popScreen('scroll-collapse');
        });

        // 关闭按钮 - 使用新导航系统返回
        container.querySelector('#social-close')?.addEventListener('click', () => {
            gameState.currentSocialTarget = null;
            NavigationManager.popScreen('scroll-collapse');
        });

        // 对话选项点击
        container.querySelectorAll('.option-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const optionId = parseInt(e.currentTarget.dataset.optionId, 10);
                if (gameState.selectDialogueOption) {
                    gameState.selectDialogueOption(optionId);
                }
                if (window.game && window.game.gameView) {
                    window.game.gameView.renderAll();
                }
            });
        });

        // 动作按钮
        container.querySelector('#action-gift')?.addEventListener('click', () => {
            // 切换礼物面板显示
            gameState.showGiftSelection = !gameState.showGiftSelection;
            this.render(gameState);
        });

        container.querySelector('#close-gift-panel')?.addEventListener('click', () => {
            gameState.showGiftSelection = false;
            this.render(gameState);
        });

        container.querySelector('#action-tea')?.addEventListener('click', () => {
            gameState.inviteTea(targetId);
            if (window.game && window.game.gameView) {
                window.game.gameView.renderAll();
            }
        });

        container.querySelector('#action-feast')?.addEventListener('click', () => {
            gameState.inviteFeast(targetId);
            if (window.game && window.game.gameView) {
                window.game.gameView.renderAll();
            }
        });

        container.querySelector('#action-duel')?.addEventListener('click', () => {
            if (gameState.requestDuel) {
                gameState.requestDuel(targetId);
            }
            if (window.game && window.game.gameView) {
                window.game.gameView.renderAll();
            }
        });

        // 特殊动作
        container.querySelector('#action-brotherhood')?.addEventListener('click', () => {
            if (confirm(`确定要与${npc.name}结为异姓兄弟吗？`)) {
                gameState.doSwearBrotherhood(targetId);
                if (window.game && window.game.gameView) {
                    window.game.gameView.renderAll();
                }
            }
        });

        container.querySelector('#action-marry')?.addEventListener('click', () => {
            if (confirm(`确定要向${npc.name}求婚吗？`)) {
                gameState.proposeMarriage(targetId);
                if (window.game && window.game.gameView) {
                    window.game.gameView.renderAll();
                }
            }
        });

        // 礼物选择
        container.querySelectorAll('.gift-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const giftCardId = e.currentTarget.dataset.cardId;
                gameState.giftTreasure(targetId, giftCardId);
                gameState.showGiftSelection = false;
                if (window.game && window.game.gameView) {
                    window.game.gameView.renderAll();
                }
            });
        });
    },

    // 注入样式
    stylesInjected: false,
    ensureStylesInjected() {
        if (this.stylesInjected) return;
        this.stylesInjected = true;

        const style = document.createElement('style');
        style.textContent = `
#social-view {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow-y: auto;
    padding: var(--space-md);
}

.social-container {
    max-width: 700px;
    margin: 0 auto;
    background-color: var(--color-bg-primary);
    border-radius: var(--radius-lg);
    overflow: hidden;
}

/* 顶部 NPC 信息栏 */
.npc-info-bar {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    background-color: var(--color-bg-secondary);
    border: var(--border-default);
    border-radius: var(--radius-md);
    padding: var(--space-md);
    margin-bottom: var(--space-lg);
    box-shadow: var(--shadow-md);
}

.npc-avatar {
    width: 64px;
    height: 64px;
    border-radius: var(--radius-sm);
    overflow: hidden;
    border: 2px solid var(--color-border-default);
    background-color: var(--color-bg-dark);
}

.npc-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    background-color: var(--color-accent-primary);
}

.npc-basic-info {
    flex: 1;
}

.name-row {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin-bottom: 6px;
}

.npc-name {
    font-family: var(--font-serif);
    font-size: var(--text-heading-md);
    color: var(--color-text-primary);
    margin: 0;
}

.npc-rank {
    font-size: var(--text-caption);
}

.favor-row {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.favor-label {
    font-family: var(--font-serif);
    font-size: var(--text-body-sm);
    color: var(--color-text-secondary);
}

.favor-bar-container {
    flex: 1;
    max-width: 120px;
    height: 6px;
    background-color: var(--color-border-default);
    border-radius: 3px;
    overflow: hidden;
}

.favor-bar-fill {
    height: 100%;
    background-color: var(--color-accent-primary);
    transition: width var(--transition-base);
}

.favor-value {
    font-family: var(--font-serif);
    font-size: var(--text-body-sm);
    color: var(--color-text-primary);
    min-width: 60px;
    text-align: right;
}

.social-container .close-btn {
    margin-left: auto;
}

/* 对话气泡 - 带曰字印章 */
.dialogue-bubble {
    position: relative;
    background-color: var(--color-bg-secondary);
    border: var(--border-double);
    border-radius: var(--radius-md);
    padding: var(--space-lg) var(--space-lg) var(--space-lg) calc(var(--space-lg) + 30px);
    margin-bottom: var(--space-lg);
    box-shadow: var(--shadow-md);
    font-family: var(--font-serif);
    font-size: var(--text-body);
    line-height: 1.8;
    color: var(--color-text-primary);
}

.dialogue-bubble::before {
    content: "曰";
    position: absolute;
    left: 8px;
    top: 12px;
    font-family: var(--font-calligraphy);
    font-size: 24px;
    color: var(--color-text-inverse);
    background-color: var(--color-accent-primary);
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
}

/* 对话选项 */
.dialogue-options {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    margin-bottom: var(--space-lg);
}

.option-card {
    background-color: var(--color-bg-secondary);
    border: var(--border-default);
    border-radius: var(--radius-sm);
    padding: 12px 16px;
    cursor: pointer;
    transition: all var(--transition-fast);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.option-card:hover {
    border-color: var(--color-accent-primary);
    background-color: rgba(158, 42, 43, 0.03);
}

.option-text {
    font-family: var(--font-serif);
    font-size: var(--text-body);
    color: var(--color-text-primary);
}

/* 社交动作栏 */
.social-actions-bar {
    background-color: var(--color-bg-secondary);
    border: var(--border-default);
    border-radius: var(--radius-md);
    padding: var(--space-md);
    margin-bottom: var(--space-lg);
    box-shadow: var(--shadow-md);
}

.actions-title {
    font-family: var(--font-serif);
    font-size: var(--text-heading-sm);
    color: var(--color-text-primary);
    margin: 0 0 var(--space-sm);
}

.actions-buttons {
    display: flex;
    gap: var(--space-sm);
    flex-wrap: wrap;
}

.action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
}

.action-btn .cost {
    font-size: var(--text-caption);
    color: var(--color-accent-gold);
}

/* 礼物选择面板 */
.gift-selection-panel {
    background-color: var(--color-bg-secondary);
    border: var(--border-default);
    border-radius: var(--radius-md);
    padding: var(--space-md);
    margin-bottom: var(--space-lg);
    box-shadow: var(--shadow-md);
}

.gift-panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-md);
}

.gift-panel-header h4 {
    font-family: var(--font-serif);
    font-size: var(--text-heading-sm);
    color: var(--color-text-primary);
    margin: 0;
}

.gift-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: var(--space-sm);
}

.gift-card {
    background-color: rgba(253, 251, 247, 0.5);
    border: var(--border-default);
    border-radius: var(--radius-sm);
    padding: 8px;
    cursor: pointer;
    transition: all var(--transition-fast);
}

.gift-card:hover {
    border-color: var(--color-accent-primary);
    background-color: rgba(197, 160, 89, 0.1);
}

.gift-name {
    font-family: var(--font-serif);
    font-size: var(--text-body-sm);
    color: var(--color-text-primary);
    text-align: center;
    margin-bottom: 2px;
}

.gift-value {
    font-family: var(--font-mono);
    font-size: var(--text-caption);
    color: var(--color-accent-gold);
    text-align: center;
}

/* 特殊动作 */
.special-actions {
    display: flex;
    gap: var(--space-md);
    margin-bottom: var(--space-lg);
}

.special-action-btn {
    flex: 1;
}

.social-footer {
    display: flex;
    justify-content: flex-end;
    padding-bottom: var(--space-md);
}

/* 响应式 */
@media (max-width: 768px) {
    #social-view {
        padding: var(--space-sm);
    }

    .npc-info-bar {
        flex-wrap: wrap;
    }

    .actions-buttons {
        justify-content: center;
    }

    .dialogue-bubble {
        padding: var(--space-md) var(--space-md) var(--space-md) calc(var(--space-md) + 28px);
    }

    .dialogue-bubble::before {
        width: 24px;
        height: 24px;
        font-size: 18px;
        left: 6px;
        top: 8px;
    }

    .special-actions {
        flex-direction: column;
    }
}
`;
        document.head.appendChild(style);
    }
};

export default SocialRenderer;
window.SocialRenderer = SocialRenderer;
