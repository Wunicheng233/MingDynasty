/**
 * 人物卡片图鉴渲染模块
 * 按照UI/08-人物图鉴界面.md设计规范重构
 * 相夹式卡片册设计，展示所有可收集人物，区分已获得/未获得
 */

import { getAllCharacterTemplates } from '../../data/characters.js';
import { getAllCards, CardTypes } from '../../data/cards.js';
import CharacterRendererUtils from '../utils/CharacterRendererUtils.js';
import NavigationManager from '../managers/NavigationManager.js';

const CardCollectionRenderer = {
    // 当前筛选状态
    currentFilter: 'all', // all, collected, uncollected, civil, military
    currentSort: 'name', // name, rank, favor
    currentPage: 1,
    cardsPerPage: 20, // 每页20张，4x5网格

    /**
     * 渲染卡片图鉴视图
     */
    render(gameState) {
        // 确保容器存在
        let container = document.getElementById('card-collection-view');
        if (!container) {
            container = document.createElement('div');
            container.id = 'card-collection-view';
            container.className = 'scene-view';
            document.getElementById('main-display').appendChild(container);
        }

        // 获取所有人物卡片
        const allCards = this.getAllCharacterCards(gameState);
        const collectedCount = allCards.filter(c => gameState.hasCard(c.card_id)).length;
        const totalCount = allCards.length;
        const progressPercent = Math.round((collectedCount / totalCount) * 100);

        // 筛选
        let filteredCards = this.filterCards(allCards, gameState, this.currentFilter);
        // 排序
        filteredCards = this.sortCards(filteredCards, this.currentSort, gameState);
        // 分页
        const totalPages = Math.ceil(filteredCards.length / this.cardsPerPage);
        const startIdx = (this.currentPage - 1) * this.cardsPerPage;
        const pageCards = filteredCards.slice(startIdx, startIdx + this.cardsPerPage);

        // 进度条颜色类
        let progressClass = '';
        if (progressPercent <= 30) progressClass = 'low';
        else if (progressPercent <= 70) progressClass = 'medium';
        else progressClass = 'high';

        const filterTabs = [
            { key: 'all', label: '全部' },
            { key: 'collected', label: '已获得' },
            { key: 'uncollected', label: '未获得' },
            { key: 'civil', label: '文臣' },
            { key: 'military', label: '武将' }
        ];

        let html = `
            <div class="card-collection-container">
                <!-- 顶部导航 -->
                <div class="collection-header">
                    <h2 class="collection-title">
                        <span class="stamp">录</span>
                        大明群英 · 人物图鉴
                    </h2>
                </div>

                <!-- 统计与筛选 -->
                <div class="stats-filter-section">
                    <!-- 收集进度 -->
                    <div class="collection-progress ${progressClass}">
                        <div class="progress-info">
                            <span class="progress-label">📜 收集进度</span>
                            <span class="progress-numbers">${collectedCount} / ${totalCount}</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                    </div>

                    <!-- 筛选标签 -->
                    <div class="filter-tabs">
                        ${filterTabs.map(tab => `
                            <button class="filter-tab ${this.currentFilter === tab.key ? 'active' : ''}" data-filter="${tab.key}">
                                ${tab.label}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- 卡片网格 -->
                <div class="cards-grid">
        `;

        if (pageCards.length === 0) {
            html += `
                <div class="empty-state">
                    <div class="empty-stamp stamp">暂无</div>
                    <p class="empty-text">暂无符合条件的人物</p>
                </div>
            `;
        } else {
            pageCards.forEach(card => {
                const collected = gameState.hasCard(card.card_id);
                this.renderCard(html, card, collected, gameState);
            });
        }

        html += `
                </div>

                <!-- 翻页 -->
                ${totalPages > 1 ? `
                <div class="pagination">
                    <button class="btn-secondary" id="page-prev" ${this.currentPage <= 1 ? 'disabled' : ''}>上一页</button>
                    <span class="page-info">第 ${this.currentPage} / ${totalPages} 页</span>
                    <button class="btn-secondary" id="page-next" ${this.currentPage >= totalPages ? 'disabled' : ''}>下一页</button>
                </div>
                ` : ''}
            </div>
        `;

        container.innerHTML = html;
        container.style.display = 'block';

        this.bindEvents(gameState, container);
        this.ensureStylesInjected();
    },

    // 获取所有人物卡片
    getAllCharacterCards(gameState) {
        const allCards = gameState.getAllCards ? gameState.getAllCards() : [];
        return allCards.filter(c => c.type === CardTypes.CHARACTER);
    },

    // 筛选卡片
    filterCards(cards, gameState, filter) {
        switch (filter) {
            case 'collected':
                return cards.filter(c => gameState.hasCard(c.card_id));
            case 'uncollected':
                return cards.filter(c => !gameState.hasCard(c.card_id));
            case 'civil':
                return cards.filter(c => !c.isMilitary);
            case 'military':
                return cards.filter(c => c.isMilitary);
            default:
                return cards;
        }
    },

    // 排序卡片
    sortCards(cards, sortBy, gameState) {
        const sorted = [...cards];
        switch (sortBy) {
            case 'rank':
                // 按品级排序（高到低）
                return sorted.sort((a, b) => {
                    const rankA = a.rankLevel || 0;
                    const rankB = b.rankLevel || 0;
                    return rankB - rankA;
                });
            case 'favor':
                // 按亲密度排序
                return sorted.sort((a, b) => {
                    const favorA = gameState.getRelationship ? gameState.getRelationship(a.id)?.favor || 0 : 0;
                    const favorB = gameState.getRelationship ? gameState.getRelationship(b.id)?.favor || 0 : 0;
                    return favorB - favorA;
                });
            case 'name':
            default:
                return sorted.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
        }
    },

    // 渲染单张卡片
    renderCard(html, card, collected, gameState) {
        // 获取立绘路径
        let imagePath = null;
        if (collected) {
            if (card.portrait) {
                // 人物卡按rarity分目录
                let subDir = '';
                if (card.rarity >= 5) subDir = '5star';
                else if (card.rarity >= 4) subDir = '4star';
                else if (card.rarity >= 3) subDir = '3star';
                imagePath = `images/characters/${subDir}/${card.portrait}.png`;
            }
        }

        const rankText = collected && card.rank ? card.rank : '未获得';

        html += `
            <div class="person-card ${collected ? 'collected' : 'uncollected'}" data-card-id="${card.card_id}">
                <div class="portrait-area">
                    ${collected && imagePath ? `
                        <img src="${imagePath}" alt="${card.name}" class="portrait-img">
                    ` : `
                        <div class="unknown-portrait">
                            <span class="stamp unknown-stamp">?</span>
                        </div>
                    `}
                </div>
                <div class="card-name">${collected ? card.name : '???'}</div>
                <div class="card-rank ${collected ? '' : 'uncollected'}">${rankText}</div>
            </div>
        `;
    },

    // 绑定事件
    bindEvents(gameState, container) {
        // 筛选标签点击
        container.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.currentFilter = e.target.dataset.filter;
                this.currentPage = 1;
                this.render(gameState);
            });
        });

        // 翻页
        container.querySelector('#page-prev')?.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.render(gameState);
            }
        });

        container.querySelector('#page-next')?.addEventListener('click', () => {
            this.currentPage++;
            this.render(gameState);
        });

        // 卡片点击
        container.querySelectorAll('.person-card.collected').forEach(cardEl => {
            cardEl.addEventListener('click', (e) => {
                const cardId = parseInt(e.currentTarget.dataset.cardId, 10);
                // 打开人物详情 - 这里可以根据需求实现，目前跳转到社交互动
                if (window.SocialRenderer && gameState) {
                    const card = gameState.getCardById(cardId);
                    if (card && card.characterId) {
                        gameState.selectedCharacterId = card.characterId;
                        // 进入社交场景 - 使用新导航系统
                        NavigationManager.pushScreen('social', {}, 'scroll-expand');
                    }
                }
            });
        });

        // 未获得卡片点击
        container.querySelectorAll('.person-card.uncollected').forEach(cardEl => {
            cardEl.addEventListener('click', () => {
                alert('尚未结识此人，多在酒馆、市集等地打探消息吧');
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
#card-collection-view {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow-y: auto;
    padding: var(--space-md);
    background-color: var(--color-bg-primary);
    /* 古籍书页背景叠加 */
    background-image: url('images/decor/decor_book_line_1200x800.png');
    background-size: cover;
    background-blend-mode: multiply;
}

.card-collection-container {
    max-width: 1000px;
    margin: 0 auto;
}

.collection-header {
    text-align: center;
    margin-bottom: var(--space-md);
}

.collection-title {
    font-family: var(--font-serif);
    font-size: var(--text-heading-lg);
    color: var(--color-text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    margin: 0;
}

.stats-filter-section {
    background-color: rgba(253, 251, 247, 0.85);
    backdrop-filter: blur(4px);
    border: var(--border-default);
    border-radius: var(--radius-md);
    padding: var(--space-md);
    margin-bottom: var(--space-lg);
    box-shadow: var(--shadow-md);
}

.collection-progress {
    margin-bottom: var(--space-md);
}

.collection-progress.low .progress-fill {
    background-color: var(--color-accent-orange);
}

.collection-progress.medium .progress-fill {
    background-color: var(--color-accent-gold);
}

.collection-progress.high .progress-fill {
    background-color: var(--color-accent-primary);
}

.progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
}

.progress-label {
    font-family: var(--font-serif);
    font-size: var(--text-body);
    color: var(--color-text-primary);
}

.progress-numbers {
    font-family: var(--font-mono);
    font-size: var(--text-body);
    color: var(--color-text-primary);
}

.progress-bar {
    height: 12px;
    background-color: var(--color-border-default);
    border-radius: 6px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    border-radius: 6px;
    transition: width var(--transition-base);
}

.filter-tabs {
    display: flex;
    gap: var(--space-sm);
    overflow-x: auto;
    padding-bottom: 4px;
}

.filter-tab {
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    padding: 6px 16px;
    font-family: var(--font-serif);
    font-size: var(--text-body-sm);
    color: var(--color-text-secondary);
    border-radius: var(--radius-sm) var(--radius-sm) 0 0;
    cursor: pointer;
    transition: all var(--transition-fast);
}

.filter-tab:hover {
    color: var(--color-accent-primary);
}

.filter-tab.active {
    color: var(--color-accent-primary);
    border-bottom-color: var(--color-accent-primary);
}

.cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: var(--space-lg);
    margin-bottom: var(--space-lg);
}

.person-card {
    background-color: var(--color-bg-secondary);
    border: var(--border-default);
    border-radius: var(--radius-md);
    box-shadow: inset 0 -4px 0 rgba(0, 0, 0, 0.05), var(--shadow-md);
    padding: 12px;
    cursor: pointer;
    transition: all var(--transition-fast);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.person-card:hover {
    transform: translateY(-6px);
    box-shadow: inset 0 -4px 0 rgba(0, 0, 0, 0.05), var(--shadow-lg);
    border-color: var(--color-accent-primary);
}

.person-card.uncollected {
    opacity: 0.8;
}

.portrait-area {
    width: 140px;
    height: 140px;
    border-radius: var(--radius-sm);
    overflow: hidden;
    background-color: var(--color-bg-dark);
    display: flex;
    align-items: center;
    justify-content: center;
}

.portrait-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--transition-fast);
}

.person-card:hover.collected .portrait-img {
    transform: scale(1.02);
}

.unknown-portrait {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-bg-dark);
}

.unknown-stamp {
    font-size: 48px;
    padding: 8px 16px;
    opacity: 0.7;
}

.card-name {
    font-family: var(--font-serif);
    font-size: var(--text-heading-sm);
    color: var(--color-text-primary);
    font-weight: bold;
    text-align: center;
}

.card-rank {
    font-family: var(--font-serif);
    font-size: var(--text-caption);
    color: var(--color-accent-gold);
}

.card-rank.uncollected {
    color: var(--color-text-tertiary);
}

.empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: var(--space-2xl);
}

.empty-state .empty-stamp {
    font-size: 32px;
    display: inline-block;
    margin-bottom: var(--space-md);
}

.empty-state .empty-text {
    font-family: var(--font-serif);
    font-size: var(--text-body);
    color: var(--color-text-tertiary);
    margin: 0;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md) 0;
}

.page-info {
    font-family: var(--font-serif);
    font-size: var(--text-body);
    color: var(--color-text-secondary);
}

/* 响应式适配 */
@media (max-width: 768px) {
    .cards-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: var(--space-md);
    }

    .person-card {
        padding: 8px;
    }

    .portrait-area {
        width: 100%;
        height: 120px;
    }

    #card-collection-view {
        padding: var(--space-sm);
    }
}

@media (max-width: 480px) {
    .filter-tabs {
        flex-wrap: wrap;
    }
}
`;
        document.head.appendChild(style);
    }
};

export default CardCollectionRenderer;
window.CardCollectionRenderer = CardCollectionRenderer;
