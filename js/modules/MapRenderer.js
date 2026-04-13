/**
 * 大地图渲染模块 - 地理地图版本
 * 显示真实地理背景地图，每个城市标记在正确方位，点击可以移动
 */

window.MapRenderer = {
    /**
     * 渲染大地图视图
     */
    render(gameState) {
        const container = document.getElementById('map-view');
        if (!container) return;

        const allCities = getAllCityTemplates();
        const currentCityId = gameState.currentCityId;

        let html = `
            <div class="map-container">
                <h2 class="view-title">元末江淮形势图</h2>
                <p class="map-info">当前位置: <strong>${gameState.getCurrentCity().name}</strong></p>
                <div class="geo-map-container">
                    <div class="geo-map-content">
        `;

        allCities.forEach(city => {
            const isCurrent = city.id === currentCityId;
            const connected = gameState.getCurrentCity().connections &&
                gameState.getCurrentCity().connections.some(c => c.target === city.id);
            const days = gameState.getMoveDaysToCity(city.id);
            const disabled = city.id === currentCityId;

            html += `
                <div class="city-marker ${isCurrent ? 'current' : ''} ${connected ? 'connected' : 'disconnected'}"
                     style="left: ${city.x}%; top: ${city.y}%;"
                     data-city-id="${city.id}">
                    <div class="city-marker-inner">
                        <div class="city-marker-dot"></div>
                        <div class="city-marker-name">${city.name}</div>
                        ${!disabled && connected ? `<div class="travel-tooltip">${days}天行程</div>` : ''}
                    </div>
                </div>
            `;
        });

        html += `
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
        container.style.display = 'block';

        // 绑定点击事件到可到达城市标记
        container.querySelectorAll('.city-marker.connected').forEach(marker => {
            marker.addEventListener('click', (e) => {
                const cityId = parseInt(e.currentTarget.dataset.cityId);
                gameState.moveToCity(cityId);
                this.render(gameState);
                window.game.gameView.renderAll();
            });
        });
    }
};
