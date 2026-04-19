/**
 * 大地图渲染模块 - 《洪武立志传》大明疆域图
 * 按照UI/05-大地图界面.md设计规范重构
 * 显示明代风格手绘地图，支持极简三按钮指令设计
 */

import { getAllCityTemplates, getCityTemplateById } from '../../data/cities.js';
import { getFactionById } from '../../data/forces.js';
import TextFormatter from '../utils/TextFormatter.js';
import TimeSystem from '../systems/TimeSystem.js';
import NavigationManager from '../managers/NavigationManager.js';

const MapRenderer = {
    // 当前选中城市（弹出详情）
    selectedCityId: null,

    /**
     * 渲染大地图视图
     */
    render(gameState) {
        // 确保容器存在
        let container = document.getElementById('map-view');
        if (!container) {
            container = document.createElement('div');
            container.id = 'map-view';
            container.className = 'map-view';
            document.getElementById('main-display').appendChild(container);
        }

        const allCities = getAllCityTemplates();
        const currentCity = gameState.getCurrentCity();
        const currentCityId = gameState.currentCityId;
        const targetCityId = gameState.targetCityId;
        const isMoving = !!targetCityId && targetCityId !== currentCityId;
        const travelProgress = gameState.travelProgress || 0;
        const remainingDays = gameState.getRemainingTravelDays ? gameState.getRemainingTravelDays() : 0;

        // 获取时间信息
        const year = gameState.year;
        const season = this.getSeasonName(gameState);
        const hour = gameState.hour || 8;
        const timeOfDay = this.getTimeOfDay(hour);
        const seasonClass = this.getSeasonClass(gameState);
        const timeIcon = this.getTimeOfDayIcon(hour);

        // 获取玩家状态
        const money = gameState.money || 0;
        const rank = currentCity && gameState.currentRole ? gameState.currentRole.rank : '无品级';

        let html = `
            <div class="map-main-container">
                <!-- 地图主体背景 -->
                <div class="map-background"></div>

                <!-- 城市标记层 -->
                <div class="map-city-layer">
        `;

        allCities.forEach(city => {
            const isCurrent = city.id === currentCityId;
            const isTarget = city.id === targetCityId;
            const connected = gameState.getCurrentCity().connections &&
                gameState.getCurrentCity().connections.some(c => c.target === city.id);
            const days = gameState.getMoveDaysToCity(city.id);
            const isCapital = city.type === 'capital';
            const isMajor = city.type === 'major';

            let markerClass = 'city-marker';
            if (isCurrent) markerClass += ' current';
            if (isTarget) markerClass += ' target';
            if (connected) markerClass += ' connected';
            if (!connected) markerClass += ' disconnected';
            if (isCapital) markerClass += ' capital';
            if (isMajor) markerClass += ' major';

            html += `
                <div class="${markerClass}"
                     style="left: ${city.x}%; top: ${city.y}%;"
                     data-city-id="${city.id}">
                    <div class="city-marker-inner">
                        <div class="city-dot"></div>
                        <div class="city-name">${city.name}</div>
                        ${connected && !isCurrent ? `<div class="days-badge">${days}日</div>` : ''}
                    </div>
                </div>
            `;
        });

        // 添加玩家标记
        const currentCityData = allCities.find(c => c.id === currentCityId);
        if (currentCityData) {
            html += `
                <div class="player-marker" style="left: ${currentCityData.x}%; top: ${currentCityData.y}%;">
                    <div class="player-marker-dot"></div>
                    <span class="player-label">当前</span>
                </div>
            `;
        }

        html += `
                </div>

                <!-- 左上：时间面板 -->
                ${(() => {
                    const yearNum = year >= 1368
                        ? year - 1368
                        : year - 1341 + 1;
                    const dynasty = year >= 1368 ? '洪武' : '至正';
                    return `
                <div class="map-panel time-panel ${seasonClass}">
                    <div class="time-row">
                        <span class="time-year">${dynasty}${TextFormatter.numberToChinese(yearNum)}年 · ${season}</span>
                    </div>
                    <div class="time-row">
                        ${timeIcon}
                        <span class="time-hour">${timeOfDay}</span>
                    </div>
                </div>
                    `;
                })()}

                <!-- 右上：状态面板 -->
                <div class="map-panel status-panel">
                    <div class="status-row">
                        <span class="status-icon">🪙</span>
                        <span class="status-label">银两</span>
                        <span class="status-value money-value">${TextFormatter.formatMoney(money)}</span>
                    </div>
                    <div class="status-row">
                        <span class="status-icon">👤</span>
                        <span class="status-label">官品</span>
                        <span class="status-value rank-value">${rank}</span>
                    </div>
                </div>

                <!-- 左下：追踪面板 -->
                ${targetCityId && targetCityId !== currentCityId ? `
                <div class="map-panel track-panel">
                    <div class="track-row">
                        <span class="track-icon">📍</span>
                        <span class="track-label">当前</span>
                        <span class="track-value">${currentCity.name}</span>
                    </div>
                    <div class="track-row">
                        <span class="track-icon">🚩</span>
                        <span class="track-label">目标</span>
                        <span class="track-value">${getCityTemplateById(targetCityId).name}</span>
                    </div>
                    <div class="track-row">
                        <span class="track-icon">⌛</span>
                        <span class="track-label">还需</span>
                        <span class="track-value">${remainingDays}日</span>
                    </div>
                </div>
                ` : `
                <div class="map-panel track-panel">
                    <div class="track-row">
                        <span class="track-icon">📍</span>
                        <span class="track-label">当前</span>
                        <span class="track-value">${currentCity.name}</span>
                    </div>
                </div>
                `}

                <!-- 底部：指令栏 -->
                <div class="map-command-bar">
                    <button class="btn-primary command-btn" id="cmd-return-capital" ${currentCity.type === 'capital' && currentCityId === currentCity.id ? 'disabled' : ''}>
                        回城
                    </button>
                    <button class="btn-secondary command-btn" id="cmd-select-destination">
                        指其止所
                    </button>
                </div>

                <!-- 城市详情卡片（点击弹出） -->
                ${this.selectedCityId ? this.renderCityDetailCard(this.selectedCityId, gameState) : ''}
            </div>
        `;

        container.innerHTML = html;
        container.style.display = 'block';

        this.bindEvents(gameState, container);
        this.ensureStylesInjected();
    },

    // 渲染城市详情卡片
    renderCityDetailCard(cityId, gameState) {
        const city = getCityTemplateById(cityId);
        const currentCity = gameState.getCurrentCity();
        const connected = currentCity.connections &&
            currentCity.connections.some(c => c.target === cityId);
        const days = gameState.getMoveDaysToCity(cityId);
        const force = city.forceId ? gameState.getForceById(city.forceId) : null;

        return `
            <div class="city-detail-card" id="city-detail-card">
                <div class="city-detail-header">
                    <h3 class="city-detail-name">${city.name}</h3>
                    ${force ? `<span class="force-badge">${force.name}</span>` : ''}
                </div>
                <div class="city-detail-info">
                    <div class="info-row">
                        <span class="info-label">发展度</span>
                        <span class="info-value">${city.development || 50}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">路程</span>
                        <span class="info-value">${connected ? `${days} 日行程` : '不可直达'}</span>
                    </div>
                </div>
                <div class="city-detail-actions">
                    ${connected && cityId !== currentCity.id ? `
                        <button class="btn-primary" id="btn-move-here">移动至此</button>
                    ` : ''}
                    <button class="btn-secondary" id="btn-close-detail">关闭</button>
                </div>
            </div>
        `;
    },

    // 获取季节名称
    getSeasonName(gameState) {
        const month = gameState.month || 1;
        if ([12, 1, 2].includes(month)) return '冬季';
        if ([3, 4, 5].includes(month)) return '春季';
        if ([6, 7, 8].includes(month)) return '夏季';
        return '秋季';
    },

    // 获取季节CSS类
    getSeasonClass(gameState) {
        const month = gameState.month || 1;
        if ([12, 1, 2].includes(month)) return 'winter';
        if ([3, 4, 5].includes(month)) return 'spring';
        if ([6, 7, 8].includes(month)) return 'summer';
        return 'autumn';
    },

    // 获取时辰名称
    getTimeOfDay(hour) {
        if (hour < 6) return '黎明';
        if (hour < 9) return '清晨';
        if (hour < 12) return '上午';
        if (hour < 14) return '正午';
        if (hour < 17) return '下午';
        if (hour < 19) return '黄昏';
        if (hour < 22) return '夜晚';
        return '深夜';
    },

    // 获取时辰图标
    getTimeOfDayIcon(hour) {
        if (hour >= 6 && hour < 18) {
            return '<span class="time-icon">☀️</span>';
        } else {
            return '<span class="time-icon">🌙</span>';
        }
    },

    // 绑定事件
    bindEvents(gameState, container) {
        // 可连接城市点击
        container.querySelectorAll('.city-marker.connected').forEach(marker => {
            marker.addEventListener('click', (e) => {
                const cityId = parseInt(e.currentTarget.dataset.cityId, 10);
                if (cityId === gameState.currentCityId) {
                    // 点击当前城市，清除选中
                    this.selectedCityId = null;
                    this.render(gameState);
                    return;
                }
                this.selectedCityId = cityId;
                this.render(gameState);
            });
        });

        // 不可连接城市点击 - 只显示信息不能移动
        container.querySelectorAll('.city-marker.disconnected').forEach(marker => {
            marker.addEventListener('click', (e) => {
                const cityId = parseInt(e.currentTarget.dataset.cityId, 10);
                this.selectedCityId = cityId;
                this.render(gameState);
            });
        });

        // 关闭详情卡片点击空白处
        const detailCard = document.getElementById('city-detail-card');
        if (detailCard) {
            detailCard.querySelector('#btn-close-detail')?.addEventListener('click', () => {
                this.selectedCityId = null;
                this.render(gameState);
            });
        }

        // 移动至此按钮
        const moveBtn = document.getElementById('btn-move-here');
        if (moveBtn && this.selectedCityId) {
            moveBtn.addEventListener('click', () => {
                if (typeof gameState.startTravel === 'function') {
                    gameState.startTravel(this.selectedCityId);
                } else {
                    gameState.moveToCity(this.selectedCityId);
                }
                this.selectedCityId = null;
                this.render(gameState);
                // 进入城镇 - 使用新导航系统压栈，镜头推进动画
                NavigationManager.pushScreen('city', {}, 'lens-zoom');
            });
        }

        // 底部指令按钮
        document.getElementById('cmd-return-capital')?.addEventListener('click', () => {
            if (typeof gameState.returnToCapital === 'function') {
                gameState.returnToCapital();
            }
            this.render(gameState);
            // 进入主城 - 使用新导航系统压栈，镜头推进动画
            NavigationManager.pushScreen('city', {}, 'lens-zoom');
        });

        document.getElementById('cmd-select-destination')?.addEventListener('click', () => {
            this.openDestinationSelector(gameState);
        });
    },

    // 打开目的地选择器（指其止所）
    openDestinationSelector(gameState) {
        const allCities = getAllCityTemplates();
        const currentCity = gameState.getCurrentCity();

        // 按势力分组
        const citiesByForce = {};
        allCities.forEach(city => {
            if (city.id === currentCity.id) return; // 跳过当前城市
            const forceId = city.forceId || 'none';
            if (!citiesByForce[forceId]) {
                citiesByForce[forceId] = [];
            }
            // 检查是否连通
            const connected = currentCity.connections &&
                currentCity.connections.some(c => c.target === city.id);
            if (connected) {
                citiesByForce[forceId].push(city);
            }
        });

        // 创建模态框
        let overlay = document.getElementById('destination-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'destination-overlay';
            overlay.className = 'destination-overlay';
            document.body.appendChild(overlay);
        }

        let html = `
            <div class="destination-modal">
                <div class="destination-header">
                    <h2>选择目的地</h2>
                    <button class="btn-text close-btn" id="close-destination">✕ 关闭</button>
                </div>
                <div class="destination-list">
        `;

        for (const [forceId, cities] of Object.entries(citiesByForce)) {
            if (cities.length === 0) continue;
            const force = forceId === 'none' ? { name: '无主' } : getFactionById(forceId) || { name: '无主' };
            html += `
                <div class="force-group">
                    <div class="force-group-title">${force.name}</div>
                    <div class="city-buttons">
            `;
            cities.forEach(city => {
                const days = gameState.getMoveDaysToCity(city.id);
                html += `
                    <button class="city-dest-btn" data-city-id="${city.id}">
                        <span class="city-dest-name">${city.name}</span>
                        <span class="city-dest-days">${days}日</span>
                    </button>
                `;
            });
            html += `
                    </div>
                </div>
            `;
        }

        if (Object.keys(citiesByForce).filter(k => citiesByForce[k].length > 0).length === 0) {
            html += `<div class="empty-state"><p>当前城市没有可直达的其他目的地</p></div>`;
        }

        html += `
                </div>
            </div>
        `;

        overlay.innerHTML = html;
        // 先让浏览器计算布局，避免瞬移动画
        overlay.style.display = 'block';
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });

        // 绑定事件
        overlay.querySelector('#close-destination').addEventListener('click', () => {
            overlay.classList.remove('active');
            requestAnimationFrame(() => {
                overlay.style.display = 'none';
            });
        });

        overlay.querySelectorAll('.city-dest-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cityId = parseInt(btn.dataset.cityId, 10);
                if (typeof gameState.startTravel === 'function') {
                    gameState.startTravel(cityId);
                } else {
                    gameState.moveToCity(cityId);
                }
                overlay.style.display = 'none';
                this.render(gameState);
                if (window.game && window.game.gameView) {
                    window.game.gameView.renderAll();
                }
                // 进入城镇
                NavigationManager.pushScreen('city', {}, 'lens-zoom');
            });
        });

        // 点击遮罩关闭
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
                requestAnimationFrame(() => {
                    overlay.style.display = 'none';
                });
            }
        });

        // 确保样式注入
        this.ensureDestinationStyles();
    },

    // 注入目的地选择器样式
    destinationStylesInjected: false,
    ensureDestinationStyles() {
        if (this.destinationStylesInjected) return;
        this.destinationStylesInjected = true;

        const style = document.createElement('style');
        style.textContent = `
.destination-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(2px);
    z-index: 200;
    display: none;
}

.destination-overlay.active {
    display: block;
}

.destination-modal {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.95);
    background-color: var(--color-bg-secondary);
    border: var(--border-double);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
    padding: var(--space-xl);
    width: 90%;
    max-width: 700px;
    max-height: 80vh;
    overflow-y: auto;
    opacity: 0;
    transition: all 250ms ease-out;
}

.destination-overlay.active .destination-modal {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
}

.destination-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-lg);
    padding-bottom: var(--space-md);
    border-bottom: var(--border-default);
}

.destination-header h2 {
    font-family: var(--font-serif);
    font-size: var(--text-heading-md);
    color: var(--color-text-primary);
    margin: 0;
}

.force-group {
    margin-bottom: var(--space-lg);
}

.force-group-title {
    font-family: var(--font-serif);
    font-size: var(--text-heading-sm);
    color: var(--color-accent-gold);
    margin-bottom: var(--space-sm);
    padding-left: var(--space-sm);
    border-left: 3px solid var(--color-accent-gold);
}

.city-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: var(--space-sm);
}

.city-dest-btn {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background-color: var(--color-bg-secondary);
    border: var(--border-default);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
    font-family: var(--font-serif);
}

.city-dest-btn:hover {
    background-color: rgba(158, 42, 43, 0.05);
    border-color: var(--color-accent-primary);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.city-dest-name {
    font-size: var(--text-body);
    color: var(--color-text-primary);
}

.city-dest-days {
    font-family: var(--font-mono);
    font-size: var(--text-caption);
    color: var(--color-accent-orange);
    background-color: rgba(160, 82, 45, 0.1);
    padding: 2px 6px;
    border-radius: var(--radius-xs);
}

/* 响应式 */
@media (max-width: 768px) {
    .destination-modal {
        width: 95%;
        max-height: 75vh;
        padding: var(--space-md);
    }

    .city-buttons {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }
}

@media (max-width: 480px) {
    .city-buttons {
        grid-template-columns: 1fr;
    }
}
`;
        document.head.appendChild(style);
    },

    // 注入样式（只注入一次）
    stylesInjected: false,
    ensureStylesInjected() {
        if (this.stylesInjected) return;
        this.stylesInjected = true;

        const style = document.createElement('style');
        style.textContent = `
#map-view {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.map-main-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.map-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--color-bg-primary);
    background-image: url(images/map/ming-jianghuai-bg.svg);
    background-size: cover;
    background-position: center;
    background-blend-mode: multiply;
}

.map-city-layer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

.city-marker {
    position: absolute;
    transform: translate(-50%, -50%);
    cursor: pointer;
    transition: all var(--transition-fast);
    z-index: 10;
}

.city-marker.disconnected {
    opacity: 0.4;
    cursor: not-allowed;
}

.city-marker:hover.connected {
    transform: translate(-50%, -50%) scale(1.1);
    z-index: 20;
}

.city-marker.current {
    z-index: 30;
}

.city-marker.target {
    z-index: 25;
}

.city-marker-inner {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
}

.city-dot {
    width: 12px;
    height: 12px;
    background-color: var(--color-text-primary);
    border: 2px solid var(--color-bg-secondary);
    border-radius: 50%;
    box-shadow: var(--shadow-sm);
}

.city-marker.capital .city-dot {
    width: 18px;
    height: 18px;
    background-color: var(--color-accent-gold);
    border: 3px solid #B45309;
}

.city-marker.major .city-dot {
    width: 15px;
    height: 15px;
    background-color: var(--color-accent-primary);
    border: 2px solid #7A1F20;
}

.city-marker.current .city-dot {
    background-color: var(--color-accent-green);
    border-color: var(--color-accent-green);
    box-shadow: 0 0 8px var(--color-accent-green);
}

.city-marker.target .city-dot {
    background-color: var(--color-accent-orange);
    border-color: var(--color-accent-orange);
    animation: pulse 2s infinite;
}

.city-name {
    font-family: var(--font-serif);
    font-size: var(--text-body-sm);
    color: var(--color-text-primary);
    background-color: rgba(253, 251, 247, 0.85);
    backdrop-filter: blur(4px);
    padding: 2px 6px;
    border-radius: var(--radius-xs);
    border: 1px solid rgba(0, 0, 0, 0.1);
    white-space: nowrap;
}

.days-badge {
    font-family: var(--font-mono);
    font-size: 10px;
    background-color: rgba(158, 42, 43, 0.15);
    color: var(--color-accent-primary);
    padding: 1px 4px;
    border-radius: var(--radius-xs);
    margin-top: 2px;
}

.player-marker {
    position: absolute;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 40;
}

.player-marker-dot {
    width: 20px;
    height: 20px;
    background-color: var(--color-accent-primary);
    border: 3px solid var(--color-bg-secondary);
    border-radius: 50%;
    box-shadow: var(--shadow-md);
}

.player-label {
    font-family: var(--font-serif);
    font-size: 10px;
    background-color: var(--color-accent-primary);
    color: white;
    padding: 1px 4px;
    border-radius: 3px;
    margin-top: 2px;
}

/* 悬浮面板通用样式 */
.map-panel {
    position: absolute;
    background-color: rgba(253, 251, 247, 0.85);
    backdrop-filter: blur(4px);
    border: var(--border-default);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    padding: 8px 16px;
    z-index: 50;
}

/* 左上时间面板 */
.time-panel {
    top: 16px;
    left: 16px;
    min-width: 140px;
}

.time-panel.spring {
    border-left: 3px solid #4ade80;
}

.time-panel.summer {
    border-left: 3px solid #60a5fa;
}

.time-panel.autumn {
    border-left: 3px solid var(--color-accent-gold);
}

.time-panel.winter {
    border-left: 3px solid #94a3b8;
}

.time-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.time-year {
    font-family: var(--font-serif);
    font-size: var(--text-body);
    color: var(--color-text-primary);
}

.time-hour {
    font-family: var(--font-serif);
    font-size: var(--text-body-sm);
    color: var(--color-text-secondary);
}

.time-icon {
    font-size: 14px;
}

/* 右上状态面板 */
.status-panel {
    top: 16px;
    right: 16px;
    min-width: 160px;
}

.status-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
}

.status-row:last-child {
    margin-bottom: 0;
}

.status-icon {
    font-size: 14px;
}

.status-label {
    font-family: var(--font-serif);
    font-size: var(--text-body-sm);
    color: var(--color-text-secondary);
    flex: 1;
}

.status-value {
    font-family: var(--font-serif);
    font-size: var(--text-body-sm);
    color: var(--color-text-primary);
}

.status-value.money-value {
    font-family: var(--font-mono);
    color: var(--color-accent-gold);
    font-weight: bold;
}

.status-value.rank-value {
    color: var(--color-accent-gold);
}

/* 左下追踪面板 */
.track-panel {
    bottom: 80px;
    left: 16px;
    min-width: 200px;
}

.track-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
}

.track-row:last-child {
    margin-bottom: 0;
}

.track-icon {
    font-size: 14px;
}

.track-label {
    font-family: var(--font-serif);
    font-size: var(--text-body-sm);
    color: var(--color-text-secondary);
    width: 40px;
}

.track-value {
    font-family: var(--font-serif);
    font-size: var(--text-body-sm);
    color: var(--color-text-primary);
    flex: 1;
    text-align: right;
}

/* 底部指令栏 */
.map-command-bar {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(253, 251, 247, 0.9);
    backdrop-filter: blur(8px);
    border: var(--border-default);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    padding: 12px 24px;
    display: flex;
    gap: 16px;
    z-index: 50;
}

.command-btn {
    min-width: 160px;
    padding: 12px 32px;
    font-size: 24px;
}

/* 城市详情卡片 */
.city-detail-card {
    position: absolute;
    background-color: var(--color-bg-secondary);
    border: var(--border-double);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    padding: var(--space-md);
    width: 280px;
    z-index: 60;
    animation: scaleFadeIn 200ms ease-out;
}

.city-detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-sm);
    padding-bottom: var(--space-sm);
    border-bottom: var(--border-default);
}

.city-detail-name {
    font-family: var(--font-serif);
    font-size: var(--text-heading-sm);
    color: var(--color-text-primary);
    margin: 0;
}

.force-badge {
    background-color: rgba(197, 160, 89, 0.15);
    color: var(--color-accent-gold);
    border: 1px solid rgba(197, 160, 89, 0.3);
    padding: 2px 8px;
    border-radius: var(--radius-xs);
    font-size: var(--text-caption);
}

.city-detail-info {
    margin-bottom: var(--space-md);
}

.info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
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

.city-detail-actions {
    display: flex;
    gap: var(--space-sm);
    justify-content: flex-end;
}

.city-detail-actions button {
    flex: 1;
}

/* 路径动画 */
@keyframes pulse {
    0%, 100% {
        opacity: 1;
        transform: scale(1);
    }
    50% {
        opacity: 0.7;
        transform: scale(1.2);
    }
}

/* 响应式适配 */
@media (max-width: 768px) {
    .map-command-bar {
        padding: 8px 16px;
        gap: 8px;
    }

    .command-btn {
        min-width: 90px;
        padding: 8px 12px;
        font-size: 14px;
    }

    .time-panel,
    .status-panel,
    .track-panel {
        padding: 6px 12px;
    }

    .city-detail-card {
        left: 50% !important;
        top: 50% !important;
        transform: translate(-50%, -50%);
        width: calc(90vw - 32px);
    }
}

@media (max-width: 480px) {
    .map-command-bar {
        flex-direction: column;
        width: calc(100vw - 32px);
    }
}
`;
        document.head.appendChild(style);
    }
};

export default MapRenderer;
window.MapRenderer = MapRenderer;
