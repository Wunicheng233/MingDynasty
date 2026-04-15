/**
 * 城市视图渲染模块
 * 渲染城市信息、设施列表、交互按钮
 */

window.CityViewRenderer = {
    /**
     * 渲染城市视图
     */
    render(gameState, gameView) {
        const container = document.getElementById('city-view');
        if (!container) return;

        const city = gameState.getCurrentCity();
        const player = gameState.getPlayerCharacter();
        const force = player.faction ? getForceTemplateByFactionId(player.faction) : null;

        // 规模显示转换
        const scaleText = ['小型', '中型', '大型', '巨城'];
        const scale = city.baseScale || city.scale || 1;
        const scaleLabel = scaleText[scale - 1] || '小型';

        let html = `
            <div class="city-view-container">
                <div class="city-info-card">
                    <div class="city-info-header">
                        <h2 class="city-name">${city.name}</h2>
                    </div>
                    <div class="city-info-details">
                        <div class="info-row">
                            <span class="info-label">所属势力</span>
                            <span class="info-value">${force ? force.name : '无主'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">城市规模</span>
                            <span class="info-value">${scaleLabel} (${'■'.repeat(scale)})</span>
                        </div>
                    </div>
                </div>

                <!-- 城市背景图 -->
                <div class="city-background-img">
                    <img src="images/cities/city-bg-${scale}.png" alt="${city.name}" onerror="this.style.display='none'">
                </div>

                <div class="city-actions-top">
        `;

        // 仅当玩家有所属势力且不是君主时显示"进入评定厅"
        if (player.forceId && player.role !== '君主') {
            html += `<button class="btn primary-btn" id="enter-assessment-btn">进入评定厅接任务</button>`;
        }

        html += `
                </div>

                <div class="city-facilities-section">
                    <h3 class="section-title">城内设施</h3>
                    <div class="facilities-grid">
        `;

        // 列出城市设施 - 改用网格布局更美观
        if (city.facilities && city.facilities.length > 0) {
            const facilityIcons = {
                '市集': '🏬',
                '武馆': '🥋',
                '商帮会馆': '💱',
                '官衙': '🏛️',
                '校场': '⚔️',
                '工部作坊': '🔨',
                '刑部司': '⚖️',
                '国子监': '📚',
                '书院': '📖',
                '寺庙': '⛩️',
                '酒馆': '🍶',
                '铁匠铺': '🗡️',
                '医馆': '💊',
                '锦衣卫所': '🔍'
            };

            // 汉字到拼音文件名映射（和你实际文件名对应）
            const pinyinMap = {
                '市集': 'shiji',
                '武馆': 'wuguan',
                '商帮会馆': 'shangbang_huiguan',
                '官衙': 'guanya',
                '校场': 'jiaochang',
                '工部作坊': 'gongbu_zuofang',
                '刑部司': 'xingbu_si',
                '国子监': 'guozijian',
                '书院': 'shuyuan',
                '寺庙': 'simiao',
                '酒馆': 'jiuguan',
                '铁匠铺': 'tiejiangpu',
                '医馆': 'yiguan',
                '锦衣卫所': 'jinyiwei_suo'
            };

            city.facilities.forEach(facility => {
                // 给可进入的设施加上点击按钮
                // 所有策划文档中定义的设施都支持点击进入
                const clickableFacilities = {
                    '市集': true,
                    '武馆': true,
                    '商帮会馆': true,
                    '官衙': true,
                    '校场': true,
                    '工部作坊': true,
                    '刑部司': true,
                    '国子监': true,
                    '书院': true,
                    '寺庙': true,
                    '酒馆': true,
                    '铁匠铺': true,
                    '医馆': true,
                    '锦衣卫所': true
                };
                const emojiIcon = facilityIcons[facility] || '🏘️';
                // 使用拼音文件名（和你实际保存的一致）
                const imageSlug = pinyinMap[facility];
                const iconHtml = `<div class="facility-icon-img">
                    <img src="images/facilities/icon/${imageSlug}.png" alt="${facility}" onerror="this.parentElement.innerHTML='${emojiIcon}';this.parentElement.className='facility-icon'">
                </div>`;
                if (clickableFacilities[facility]) {
                    html += `
                        <button class="facility-card-btn" data-facility="${facility}">
                            ${iconHtml}
                            <span class="facility-name">${facility}</span>
                        </button>
                    `;
                } else {
                    html += `
                        <div class="facility-card-disabled">
                            ${iconHtml}
                            <span class="facility-name">${facility}</span>
                        </div>
                    `;
                }
            });
        }

        html += `
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // 绑定事件
        if (player.forceId && player.role !== '君主') {
            document.getElementById('enter-assessment-btn').addEventListener('click', () => {
                gameState.currentScene = GameScene.TASK_LIST;
                gameView.renderAll();
            });
        }

        // 绑定设施点击事件
        document.querySelectorAll('.facility-card-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const facilityName = e.target.dataset.facility || e.currentTarget.dataset.facility;
                if (facilityName === '市集') {
                    // 进入市集
                    MarketScene.init();
                    gameState.currentScene = GameScene.MARKET;
                    gameView.renderAll();
                } else {
                    // 进入通用设施场景
                    gameState.currentFacility = facilityName;
                    gameState.currentScene = GameScene.FACILITY;
                    gameView.renderAll();
                }
            });
        });
    }
};
