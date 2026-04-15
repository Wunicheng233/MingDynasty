/**
 * 存档持久化系统 - 拆分自GameState
 * 负责各类数据的localStorage持久化
 * 注：卡片和社交的持久化已分到对应系统中，这里只保留通用功能
 */
window.SaveSystem = {
    // 卡片持久化在CardSystem
    // 社交关系持久化在SocialSystem
    // 合战胜利次数在CardSystem

    /**
     * 初始化所有城镇的经济状态
     */
    initAllCityEconomies(gameState) {
        const allCities = getAllCityTemplates();
        for (const city of allCities) {
            this.initCityEconomy(gameState, city.cityId);
        }
    },

    /**
     * 初始化单个城镇的经济状态
     * @param {GameState} gameState
     * @param {string} cityId
     */
    initCityEconomy(gameState, cityId) {
        if (!gameState.cityEconomies[cityId]) {
            const cityTemplate = getCityTemplateByCityId(cityId);
            // 初始繁荣度和规模成正比
            const baseProsperity = (cityTemplate.baseScale || 3) * 10;
            gameState.cityEconomies[cityId] = {
                cityId: cityId,
                prosperity: baseProsperity,
                taxRate: 0.15, // 默认税率15%
                investmentLevel: 0,
                atWar: false // 是否处于战乱
            };
        }
    },

    /**
     * 获取城镇经济状态
     * @param {GameState} gameState
     * @param {number|string} cityId - 可以是数字ID（来自 gameState.currentCityId）或字符串cityId
     * @returns {Object}
     */
    getCityEconomy(gameState, cityId) {
        // 如果传入的是数字ID，先获取城镇模板得到字符串cityId
        if (typeof cityId === 'number') {
            const cityTemplate = getCityTemplateById(cityId);
            if (cityTemplate) {
                cityId = cityTemplate.cityId;
            }
        }
        this.initCityEconomy(gameState, cityId);
        return gameState.cityEconomies[cityId];
    },

    /**
     * 设置城镇战乱状态
     * @param {GameState} gameState
     * @param {string} cityId
     * @param {boolean} atWar
     */
    setCityWarState(gameState, cityId, atWar) {
        const economy = this.getCityEconomy(gameState, cityId);
        economy.atWar = atWar;
    },

    /**
     * 添加商品到玩家背包
     * @param {GameState} gameState
     * @param {string} goodsId
     * @param {number} quantity
     */
    addToInventory(gameState, goodsId, quantity) {
        if (!gameState.playerInventory[goodsId]) {
            gameState.playerInventory[goodsId] = 0;
        }
        gameState.playerInventory[goodsId] += quantity;
    },

    /**
     * 从玩家背包移除商品
     * @param {GameState} gameState
     * @param {string} goodsId
     * @param {number} quantity
     */
    removeFromInventory(gameState, goodsId, quantity) {
        if (!gameState.playerInventory[goodsId]) {
            return;
        }
        gameState.playerInventory[goodsId] -= quantity;
        if (gameState.playerInventory[goodsId] <= 0) {
            delete gameState.playerInventory[goodsId];
        }
    },

    /**
     * 获取玩家持有商品数量
     * @param {GameState} gameState
     * @param {string} goodsId
     * @returns {number}
     */
    getInventoryQuantity(gameState, goodsId) {
        return gameState.playerInventory[goodsId] || 0;
    },

    /**
     * 检查事件标记是否为真
     * @param {GameState} gameState
     * @param {string} flag
     * @returns {boolean}
     */
    hasEventFlag(gameState, flag) {
        return !!gameState.eventFlags[flag];
    },

    /**
     * 设置事件标记
     * @param {GameState} gameState
     * @param {string} flag
     * @param {boolean} value
     */
    setEventFlag(gameState, flag, value) {
        gameState.eventFlags[flag] = value;
    },

    /**
     * 检查事件是否已经触发过
     * @param {GameState} gameState
     * @param {string} eventId
     * @returns {boolean}
     */
    isEventTriggered(gameState, eventId) {
        return gameState.triggeredEvents.has(eventId);
    },

    /**
     * 标记事件已经触发
     * @param {GameState} gameState
     * @param {string} eventId
     */
    markEventTriggered(gameState, eventId) {
        gameState.triggeredEvents.add(eventId);
    },

    /**
     * 开始执行一个事件
     * @param {GameState} gameState
     * @param {Object} event
     */
    startEvent(gameState, event) {
        gameState.currentEvent = event;
        // 从第一个场景开始
        gameState.currentEventScene = event.scenes[0].sceneId;
        // 切换到事件场景
        gameState.currentScene = GameScene.EVENT;
    }
};
