/**
 * 城镇据点视图渲染模块
 * 按照UI/06-城镇据点界面.md设计规范重构
 * 全屏场景背景 + 卡片式设施入口 + NPC交互点
 */

import { getCityTemplateById } from '../../data/cities.js';
import { getFactionById } from '../../data/forces.js';
import NavigationManager from '../managers/NavigationManager.js';
import MarketScene from './MarketScene.js';

const CityViewRenderer = {
    // 设施图标映射（emoji fallback，有图片时可替换）
    facilityIcons: {
        '酒馆': '🍶',
        '官衙': '🏛️',
        '市集': '🧺',
        '城门': '🚪',
        '自宅': '🏠',
        '寺庙': '🏯',
        '医馆': '💊',
        '武馆': '🥋',
        '商帮会馆': '💱',
        '校场': '⚔️',
        '工部作坊': '🔨',
        '刑部司': '⚖️',
        '国子监': '📚',
        '书院': '📖',
        '铁匠铺': '🗡️',
        '锦衣卫所': '🔍'
    },

    // 背景图片映射 - 按cityId索引，没有则使用通用背景
    backgroundMap: {
        'yingtian': 'images/cities/bg_city_yingtian_1920x1080.jpg',
        'suzhou': 'images/cities/bg_city_suzhou_1920x1080.jpg',
        'peking': 'images/cities/bg_city_peking_1920x1080.jpg',
    },

    /**
     * 渲染城市视图
     */
    render(gameState, gameView) {
        // 确保容器存在
        let container = document.getElementById('city-view');
        if (!container) {
            container = document.createElement('div');
            container.id = 'city-view';
            container.className = 'scene-view';
            document.getElementById('main-display').appendChild(container);
        }

        const city = gameState.getCurrentCity();
        const player = gameState.getPlayerCharacter();
        const force = city.forceId ? getFactionById(city.forceId) : null;

        // 获取背景图片URL
        const bgUrl = this.getBackgroundUrl(city);

        // 获取时辰叠加滤镜
        const hour = gameState.hour || 8;
        const timeOverlayClass = this.getTimeOverlayClass(hour);

        // 发展度等级（1-5级）
        const development = city.development || 50;
        const level = Math.ceil(development / 20); // 50 -> 3级
        const developmentText = this.getDevelopmentLevelText(level);

        // 获取可用设施
        const facilities = city.facilities || [];
        // 添加城门设施如果不在列表中（总是需要出城按钮）
        if (!facilities.includes('城门')) {
            facilities.push('城门');
        }

        // 获取当前在城镇的NPC
        const npcsInCity = gameState.getCharactersInCity ? gameState.getCharactersInCity(city.id) : [];

        let html = `
            <div class="city-view-container">
                <!-- 全屏场景背景 -->
                <div class="city-scene-bg" style="background-image: url(${bgUrl})"></div>
                <!-- 时辰叠加滤镜 -->
                <div class="time-overlay ${timeOverlayClass}"></div>

                <!-- 左上角返回按钮（按照导航规范） -->
                <button class="nav-back-btn" id="back-from-city">
                    <span>←</span>
                    <span>返回地图</span>
                </button>

                <!-- 右上城镇信息卡 -->
                <div class="city-info-panel">
                    <h2 class="city-name">${city.name}</h2>
                    <div class="city-info-row">
                        <span class="info-label">所属</span>
                        <span class="info-value">${force ? force.name : '无主'}</span>
                    </div>
                    <div class="city-info-row">
                        <span class="info-label">规模</span>
                        <span class="info-value development-text">
                            ${developmentText}
                        </span>
                    </div>
                </div>

                <!-- NPC交互点 - 动态定位 -->
                <div class="npc-layer">
        `;

        // 渲染NPC交互点（使用百分比坐标，如果NPC有位置数据）
        npcsInCity.forEach((npc, index) => {
            // 如果NPC没有预定义位置，分散排列
            const left = npc.x ? `${npc.x}%` : `${15 + index * 25}%`;
            const top = npc.y ? `${npc.y}%` : '60%';

            html += `
                <div class="npc-interact" style="left: ${left}; top: ${top};" data-character-id="${npc.id}">
                    <div class="npc-avatar">
                        ${npc.avatarUrl ? `<img src="${npc.avatarUrl}" alt="${npc.name}">` : `<div class="avatar-placeholder">${npc.name.charAt(0)}</div>`}
                    </div>
                    <div class="npc-name-tag">${npc.name}</div>
                </div>
            `;
        });

        html += `
                </div>

                <!-- 顶部：评定按钮（仅当需要时） -->
                ${player.forceId && player.role !== '君主' ? `
                <div class="top-action-bar">
                    <button class="btn-primary" id="enter-assessment-btn">进入官邸接任务</button>
                </div>
                ` : ''}

                <!-- 底部设施入口栏 -->
                <div class="facilities-bar">
                    <div class="facilities-scroll">
        `;

        // 渲染每个设施卡片
        facilities.forEach(facility => {
            const isClickable = facility !== '城门'; // 城门在出城按钮处理
            const icon = this.facilityIcons[facility] || '🏘️';

            if (isClickable) {
                html += `
                    <button class="facility-card" data-facility="${facility}">
                        <div class="facility-icon">${icon}</div>
                        <span class="facility-name">${facility}</span>
                    </button>
                `;
            }
        });

        html += `
                    </div>
                    <div class="exit-action">
                        <button class="btn-secondary" id="exit-city-btn">
                            <span>🚪</span>
                            <span>出城</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
        container.style.display = 'block';

        this.bindEvents(gameState, gameView);
        this.ensureStylesInjected();
    },

    // 获取背景URL
    getBackgroundUrl(city) {
        // 先按id查映射
        if (this.backgroundMap[city.id]) {
            return this.backgroundMap[city.id];
        }
        // 根据类型判断
        if (city.type === 'capital' || city.type === 'capital') {
            return 'images/cities/bg_city_yingtian_1920x1080.jpg';
        }
        if (city.type === 'military') {
            return 'images/cities/bg_city_military_1920x1080.jpg';
        }
        // 通用背景
        return 'images/cities/bg_city_generic_1920x1080.jpg';
    },

    // 获取时辰滤镜class
    getTimeOverlayClass(hour) {
        if (hour < 6 || hour >= 19) return 'night';
        if (hour >= 6 && hour < 9) return 'dawn';
        if (hour >= 16 && hour < 19) return 'dusk';
        return 'day';
    },

    // 获取发展度等级文字描述
    getDevelopmentLevelText(level) {
        const levelTexts = {
            1: '十里一铺',
            2: '烟火百家',
            3: '三里为城',
            4: '九里雄州',
            5: '四方辐辏'
        };
        return levelTexts[level] || levelTexts[1];
    },

    // 绑定事件
    bindEvents(gameState, gameView) {
        // 进入评定厅
        const assessmentBtn = document.getElementById('enter-assessment-btn');
        if (assessmentBtn) {
            assessmentBtn.addEventListener('click', () => {
                // 进入评定厅 - 使用新导航系统
                NavigationManager.pushScreen('task-list', {}, 'scroll-expand');
            });
        }

        // 左上角返回按钮
        document.getElementById('back-from-city').addEventListener('click', () => {
            // 返回大地图 - 使用新导航系统
            NavigationManager.popScreen('lens-unzoom');
        });

        // 底部出城按钮
        document.getElementById('exit-city-btn').addEventListener('click', () => {
            // 返回大地图 - 使用新导航系统
            NavigationManager.popScreen('lens-unzoom');
        });

        // NPC交互
        document.querySelectorAll('.npc-interact').forEach(npcEl => {
            npcEl.addEventListener('click', (e) => {
                const characterId = parseInt(e.currentTarget.dataset.characterId, 10);
                // 打开人物详情（后续会弹出模态框），这里先进入社交视图
                if (window.SocialRenderer && gameState) {
                    gameState.selectedCharacterId = characterId;
                    // 进入社交互动界面 - 全屏子系统，压栈
                    NavigationManager.pushScreen('social', {}, 'scroll-expand');
                }
            });
        });

        // 设施卡片点击
        document.querySelectorAll('.facility-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const facilityName = e.currentTarget.dataset.facility;
                if (facilityName === '市集') {
                    // 进入市集 - 全屏子系统，压栈
                    MarketScene.init();
                    NavigationManager.pushScreen('market', {}, 'scroll-expand');
                } else if (facilityName === '城门') {
                    // 出城 - 返回大地图，出栈
                    NavigationManager.popScreen('lens-unzoom');
                } else {
                    // 进入通用设施场景 - 使用新导航系统
                    gameState.currentFacility = facilityName;
                    NavigationManager.pushScreen('facility', {}, 'scroll-expand');
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
#city-view {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.city-view-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

/* 全屏场景背景 */
.city-scene-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--color-bg-primary);
    background-size: cover;
    background-position: center;
    background-blend-mode: multiply;
}

/* 时辰叠加滤镜 */
.time-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    transition: background-color var(--transition-base);
}

.time-overlay.day {
    background-color: transparent;
}

.time-overlay.dawn {
    background-color: rgba(255, 223, 186, 0.15);
}

.time-overlay.dusk {
    background-color: rgba(205, 127, 50, 0.15);
}

.time-overlay.night {
    background-color: rgba(20, 30, 60, 0.35);
}

/* 右上信息面板 */
.city-info-panel {
    position: absolute;
    top: 16px;
    right: 16px;
    background-color: rgba(253, 251, 247, 0.85);
    backdrop-filter: blur(4px);
    border: var(--border-default);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    padding: 12px 20px;
    z-index: 50;
    min-width: 180px;
}

.city-name {
    font-family: var(--font-serif);
    font-size: var(--text-heading-md);
    color: var(--color-text-primary);
    margin: 0 0 var(--space-sm);
    text-align: center;
}

.city-info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
}

.city-info-row:last-child {
    margin-bottom: 0;
}

.info-label {
    font-family: var(--font-serif);
    font-size: var(--text-body-sm);
    color: var(--color-text-secondary);
}

.info-value {
    font-family: var(--font-serif);
    font-size: var(--text-body-sm);
    color: var(--color-text-primary);
}

.development-text {
    font-family: var(--font-serif);
    font-size: var(--text-body-sm);
    color: var(--color-accent-gold);
    font-weight: 500;
}

/* NPC交互层 */
.npc-layer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 140px;
    z-index: 40;
}

.npc-interact {
    position: absolute;
    transform: translate(-50%, 0);
    cursor: pointer;
    transition: transform var(--transition-fast);
}

.npc-interact:hover {
    transform: translate(-50%, 0) scale(1.05);
}

.npc-avatar {
    width: 64px;
    height: 64px;
    border-radius: var(--radius-md);
    overflow: hidden;
    border: 2px solid rgba(253, 251, 247, 0.8);
    box-shadow: var(--shadow-md);
    background-color: var(--color-bg-secondary);
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
    font-family: var(--font-serif);
    font-size: 24px;
    color: var(--color-text-primary);
    background-color: var(--color-accent-primary);
    color: white;
}

.npc-name-tag {
    text-align: center;
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    font-family: var(--font-serif);
    font-size: var(--text-caption);
    padding: 2px 8px;
    border-radius: var(--radius-xs);
    margin-top: 4px;
    white-space: nowrap;
}

/* 顶部动作条 */
.top-action-bar {
    position: absolute;
    top: 16px;
    left: 16px;
    z-index: 50;
}

/* 底部设施栏 */
.facilities-bar {
    position: absolute;
    bottom: 16px;
    left: 16px;
    right: 16px;
    background-color: rgba(253, 251, 247, 0.9);
    backdrop-filter: blur(8px);
    border: var(--border-default);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    padding: var(--space-md);
    z-index: 50;
}

.facilities-scroll {
    display: flex;
    gap: var(--space-md);
    overflow-x: auto;
    padding-bottom: var(--space-sm);
    margin-bottom: var(--space-sm);
    scrollbar-width: thin;
}

.facilities-scroll::-webkit-scrollbar {
    height: 4px;
}

.facilities-scroll::-webkit-scrollbar-thumb {
    background-color: var(--color-border-default);
    border-radius: 2px;
}

.facility-card {
    flex: 0 0 100px;
    background-color: var(--color-bg-secondary);
    border: var(--border-default);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    padding: 12px 8px;
    cursor: pointer;
    transition: all var(--transition-fast);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.facility-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--color-accent-primary);
}

.facility-card:active {
    transform: translateY(-2px) scale(0.98);
}

.facility-icon {
    font-size: 40px;
    line-height: 48px;
}

.facility-name {
    font-family: var(--font-serif);
    font-size: var(--text-body-sm);
    color: var(--color-text-primary);
    text-align: center;
}

.exit-action {
    display: flex;
    justify-content: center;
}

.exit-action button {
    min-width: 140px;
}

.exit-action button span {
    margin: 0 2px;
}

/* 响应式适配 */
@media (max-width: 768px) {
    .city-info-panel {
        padding: 8px 12px;
        min-width: 140px;
    }

    .city-name {
        font-size: var(--text-heading-sm);
    }

    .facility-card {
        flex: 0 0 80px;
        padding: 8px 4px;
    }

    .facility-icon {
        font-size: 32px;
        line-height: 36px;
    }

    .npc-interact {
        transform: translate(-50%, 0) scale(0.9);
    }

    .npc-avatar {
        width: 56px;
        height: 56px;
    }
}

@media (max-width: 480px) {
    .facilities-bar {
        padding: var(--space-sm);
    }

    .facility-card {
        flex: 0 0 70px;
    }
}
`;
        document.head.appendChild(style);
    }
};

export default CityViewRenderer;
window.CityViewRenderer = CityViewRenderer;
