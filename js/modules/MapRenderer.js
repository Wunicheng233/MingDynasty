/**
 * 大地图渲染模块
 * 显示所有城镇，点击可以移动
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
                <h2 class="view-title">大地图</h2>
                <p class="map-info">当前位置: <strong>${gameState.getCurrentCity().name}</strong></p>
                <div class="city-grid">
        `;

        allCities.forEach(city => {
            const isCurrent = city.id === currentCityId;
            const connected = gameState.getCurrentCity().connections &&
                gameState.getCurrentCity().connections.some(c => c.target === city.id);

            // 计算移动天数
            const days = gameState.getMoveDaysToCity(city.id);
            const disabled = city.id === currentCityId;

            html += `
                <div class="city-card ${isCurrent ? 'current' : ''} ${connected ? 'connected' : 'disconnected'}">
                    <div class="city-header">
                        <span class="city-emoji">${this.getCityEmoji(city.type)}</span>
                        <div class="city-info">
                            <h3 class="city-name">${city.name}</h3>
                            <p class="city-type">${this.getTypeName(city.type)}</p>
                        </div>
                    </div>
                    <div class="city-stats">
                        <span class="stat">规模: ${'■'.repeat(city.scale)}</span>
                        ${!disabled && connected ? `<span class="move-days">${days}天</span>` : ''}
                    </div>
                    <button class="btn ${isCurrent ? 'primary-btn disabled' : 'primary-btn'} move-btn"
                            data-city-id="${city.id}" ${disabled ? 'disabled' : ''}>
                        ${isCurrent ? '当前位置' : '移动'}
                    </button>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        container.innerHTML = html;
        container.style.display = 'block';

        // 绑定移动事件
        container.querySelectorAll('.move-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cityId = parseInt(e.target.dataset.cityId);
                gameState.moveToCity(cityId);
                this.render(gameState);
                window.game.gameView.renderAll();
            });
        });
    },

    /**
     * 根据城镇类型获取emoji
     */
    getCityEmoji(type) {
        switch (type) {
            case 'capital': return '🏛️';
            case 'provincial': return '🏙️';
            case 'prefecture': return '🏘️';
            case 'county': return '🏡';
            default: return '🏘️';
        }
    },

    /**
     * 获取类型名称
     */
    getTypeName(type) {
        switch (type) {
            case 'capital': return '都城';
            case 'provincial': return '省会';
            case 'prefecture': return '府城';
            case 'county': return '县城';
            default: return '城镇';
        }
    }
};
