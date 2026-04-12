/**
 * 市集交易场景
 * 处理市集的渲染和用户交互
 * 重构：卡片式布局 + 一键交易
 */

window.MarketScene = {
    /**
     * 场景状态
     */
    state: {
        currentMode: 'buy', // buy | sell
        selectedGoods: null,
        quantity: 1,
        message: ''
    },

    /**
     * 初始化场景
     */
    init() {
        this.state = {
            currentMode: 'buy',
            selectedGoods: null,
            quantity: 1,
            message: ''
        };
    },

    /**
     * 渲染市集场景 - 卡片式布局 + 一键交易
     * @param {Object} gameState - 游戏状态
     * @returns {string} HTML 渲染内容
     */
    render(gameState) {
        const currentCityId = gameState.currentCityId;
        const currentCity = getCityTemplateById(currentCityId);

        let html = `<div class="market-scene">\n`;
        html += `<h2>${currentCity.name} · 市集</h2>\n`;
        html += `<div class="money-info">持有金钱：<strong>${EconomicCalculator.wenToGuan(gameState.money).toFixed(2)} 贯</strong></div>\n`;

        // 消息提示
        if (this.state.message) {
            html += `<div class="message">${this.state.message}</div>\n`;
        }

        // 获取当前城镇可交易商品（特产+基础商品）
        const tradableGoods = this.getTradableGoods(currentCity);

        // 商品卡片网格
        html += `<div class="market-cards-grid">\n`;

        for (const goods of tradableGoods) {
            const buyPriceWen = EconomicCalculator.calculateBuyPrice(
                goods.goodsId,
                gameState.getCityEconomy(currentCityId),
                gameState
            );
            const sellPriceWen = EconomicCalculator.calculateSellPrice(buyPriceWen);
            const holding = this.getPlayerGoodsQuantity(gameState, goods.goodsId);
            const maxBuy = this.getMaxBuyable(gameState, buyPriceWen);
            const maxSell = holding;

            const buyPrice = EconomicCalculator.wenToGuan(buyPriceWen).toFixed(2);
            const sellPrice = EconomicCalculator.wenToGuan(sellPriceWen).toFixed(2);

            html += `<div class="goods-card">\n`;
            html += `<div class="goods-card-header">\n`;
            html += `<span class="goods-card-name">${goods.name}</span>`;
            html += `<span class="goods-card-category">${goods.category}</span>`;
            html += `</div>\n`;
            html += `<div class="goods-card-desc">${goods.description}</div>\n`;
            html += `<div class="goods-card-info">\n`;
            html += `<span class="goods-card-price">买入: ${buyPrice} 贯<br>卖出: ${sellPrice} 贯</span>\n`;
            html += `<span class="goods-card-holding">持有: ${holding}</span>\n`;
            html += `</div>\n`;
            html += `<div class="goods-card-actions">\n`;
            html += `<div class="row">\n`;
            html += `<button class="btn-buy" onclick="MarketScene.quickBuy(window.game.gameState, '${goods.goodsId}', 1)" ${maxBuy >= 1 ? '' : 'disabled'}>+1</button>\n`;
            html += `<button class="btn-buy" onclick="MarketScene.quickBuy(window.game.gameState, '${goods.goodsId}', ${maxBuy})" ${maxBuy > 0 ? '' : 'disabled'}>最大</button>\n`;
            html += `</div>\n`;
            html += `<div class="row">\n`;
            html += `<button class="btn-sell" onclick="MarketScene.quickSell(window.game.gameState, '${goods.goodsId}', 1)" ${maxSell >= 1 ? '' : 'disabled'}>-1</button>\n`;
            html += `<button class="btn-sell" onclick="MarketScene.quickSell(window.game.gameState, '${goods.goodsId}', ${maxSell})" ${maxSell > 0 ? '' : 'disabled'}>全部</button>\n`;
            html += `</div>\n`;
            html += `</div>\n`;
            html += `</div>\n`;
        }

        html += `</div>\n`;

        // 功能按钮区（保留城镇投资）
        html += `<div class="action-buttons">\n`;
        html += `<button onclick="MarketScene.investMenu(window.game.gameState)">城镇投资</button>\n`;
        html += `<button onclick="window.game.gameView.goBackToCity()">返回城镇</button>\n`;
        html += `</div>\n`;

        html += `</div>\n`;

        return html;
    },

    /**
     * 计算最大可买入数量
     */
    getMaxBuyable(gameState, buyPriceWen) {
        if (buyPriceWen <= 0) return 0;
        return Math.floor(gameState.money / buyPriceWen);
    },

    /**
     * 一键买入
     */
    quickBuy(gameState, goodsId, quantity) {
        if (quantity <= 0) {
            this.state.message = '数量必须大于0';
            window.game.gameView.renderAll();
            return;
        }

        const currentCityId = gameState.currentCityId;
        const goods = getGoodsTemplateById(goodsId);
        const buyPriceWen = EconomicCalculator.calculateBuyPrice(
            goodsId,
            gameState.getCityEconomy(currentCityId),
            gameState
        );
        const totalCost = buyPriceWen * quantity;

        if (gameState.money < totalCost) {
            this.state.message = '金钱不足，无法购买';
            window.game.gameView.renderAll();
            return;
        }

        // 扣除金钱，增加货物
        gameState.money -= totalCost;
        gameState.addToInventory(goodsId, quantity);

        this.state.message = `成功买入 ${quantity} 单位 ${goods.name}，花费 ${EconomicCalculator.wenToGuan(totalCost).toFixed(2)} 贯`;

        // 消耗一天时间
        gameState.advanceDays(1);
        window.game.gameView.renderAll();
    },

    /**
     * 一键卖出
     */
    quickSell(gameState, goodsId, quantity) {
        if (quantity <= 0) {
            this.state.message = '数量必须大于0';
            window.game.gameView.renderAll();
            return;
        }

        const currentCityId = gameState.currentCityId;
        const goods = getGoodsTemplateById(goodsId);
        const playerQuantity = this.getPlayerGoodsQuantity(gameState, goodsId);

        if (playerQuantity < quantity) {
            this.state.message = '持有商品不足';
            window.game.gameView.renderAll();
            return;
        }

        const buyPriceWen = EconomicCalculator.calculateBuyPrice(
            goodsId,
            gameState.getCityEconomy(currentCityId),
            gameState
        );
        const sellPriceWen = EconomicCalculator.calculateSellPrice(buyPriceWen);
        const totalRevenue = sellPriceWen * quantity;

        // 扣除货物，增加金钱
        gameState.removeFromInventory(goodsId, quantity);
        gameState.money += totalRevenue;

        this.state.message = `成功卖出 ${quantity} 单位 ${goods.name}，获得 ${EconomicCalculator.wenToGuan(totalRevenue).toFixed(2)} 贯`;

        // 消耗一天时间
        gameState.advanceDays(1);
        window.game.gameView.renderAll();
    },

    /**
     * 获取当前城镇可交易商品列表
     * @param {Object} cityTemplate
     * @returns {GoodsTemplate[]}
     */
    getTradableGoods(cityTemplate) {
        const allGoods = getAllGoodsTemplates();
        // 如果城镇有特产，优先列出特产，加上基础商品
        const result = [];

        // 先加特产
        if (cityTemplate.specialties) {
            for (const specName of cityTemplate.specialties) {
                const goods = allGoods.find(g => g.name === specName);
                if (goods && !result.find(r => r.goodsId === goods.goodsId)) {
                    result.push(goods);
                }
            }
        }

        // 再加其他商品
        for (const goods of allGoods) {
            if (!result.find(r => r.goodsId === goods.goodsId) && goods.goodsId !== 'salt_ticket') {
                result.push(goods);
            }
        }

        return result;
    },

    /**
     * 获取玩家持有某商品数量
     */
    getPlayerGoodsQuantity(gameState, goodsId) {
        if (!gameState.playerInventory) {
            return 0;
        }
        return gameState.playerInventory[goodsId] || 0;
    },

    /**
     * 选择商品
     */
    selectGoods(goodsId, gameState) {
        const goods = getGoodsTemplateById(goodsId);
        this.state.selectedGoods = goods;
        this.state.quantity = 1;
        GameView.render(gameState);
    },

    /**
     * 切换买卖模式
     */
    switchMode(mode) {
        this.state.currentMode = mode;
        this.state.selectedGoods = null;
        this.state.quantity = 1;
        GameView.render(window.gameState);
    },

    /**
     * 增加数量
     */
    increaseQuantity() {
        const max = this.state.currentMode === 'buy'
            ? Math.floor(window.gameState.money / EconomicCalculator.calculateBuyPrice(
                this.state.selectedGoods.goodsId,
                window.gameState.getCityEconomy(window.gameState.currentCityId),
                window.gameState
            ))
            : this.getPlayerGoodsQuantity(window.gameState, this.state.selectedGoods.goodsId);

        if (this.state.quantity < max) {
            this.state.quantity++;
        }
        GameView.render(window.gameState);
    },

    /**
     * 减少数量
     */
    decreaseQuantity() {
        if (this.state.quantity > 1) {
            this.state.quantity--;
        }
        GameView.render(window.gameState);
    },

    /**
     * 确认买入
     */
    confirmBuy(gameState) {
        if (!this.state.selectedGoods || this.state.quantity <= 0) {
            this.state.message = '请选择要购买的商品和数量';
            GameView.render(gameState);
            return;
        }

        const currentCityEconomy = gameState.getCityEconomy(gameState.currentCityId);
        const buyPriceWen = EconomicCalculator.calculateBuyPrice(
            this.state.selectedGoods.goodsId,
            currentCityEconomy,
            gameState
        );
        const totalCost = buyPriceWen * this.state.quantity;

        if (gameState.money < totalCost) {
            this.state.message = '金钱不足，无法购买';
            GameView.render(gameState);
            return;
        }

        // 扣除金钱，增加货物
        gameState.money -= totalCost;
        gameState.addToInventory(this.state.selectedGoods.goodsId, this.state.quantity);

        this.state.message = `成功买入 ${this.state.quantity} 单位 ${this.state.selectedGoods.name}，花费 ${EconomicCalculator.wenToGuan(totalCost).toFixed(2)} 贯`;
        this.state.selectedGoods = null;
        this.state.quantity = 1;

        // 消耗一天时间
        gameState.advanceDays(1);
        window.game.gameView.renderAll();
    },

    /**
     * 确认卖出
     */
    confirmSell(gameState) {
        if (!this.state.selectedGoods || this.state.quantity <= 0) {
            this.state.message = '请选择要卖出的商品和数量';
            GameView.render(gameState);
            return;
        }

        const playerQuantity = this.getPlayerGoodsQuantity(gameState, this.state.selectedGoods.goodsId);
        if (playerQuantity < this.state.quantity) {
            this.state.message = '持有商品不足';
            GameView.render(gameState);
            return;
        }

        const currentCityEconomy = gameState.getCityEconomy(gameState.currentCityId);
        const buyPriceWen = EconomicCalculator.calculateBuyPrice(
            this.state.selectedGoods.goodsId,
            currentCityEconomy,
            gameState
        );
        const sellPriceWen = EconomicCalculator.calculateSellPrice(buyPriceWen);
        const totalRevenue = sellPriceWen * this.state.quantity;

        // 扣除货物，增加金钱
        gameState.removeFromInventory(this.state.selectedGoods.goodsId, this.state.quantity);
        gameState.money += totalRevenue;

        this.state.message = `成功卖出 ${this.state.quantity} 单位 ${this.state.selectedGoods.name}，获得 ${EconomicCalculator.wenToGuan(totalRevenue).toFixed(2)} 贯`;
        this.state.selectedGoods = null;
        this.state.quantity = 1;

        // 消耗一天时间
        gameState.advanceDays(1);
        window.game.gameView.renderAll();
    },

    /**
     * 选择商品
     */
    selectGoods(goodsId, gameState) {
        const goods = getGoodsTemplateById(goodsId);
        this.state.selectedGoods = goods;
        this.state.quantity = 1;
        window.game.gameView.renderAll();
    },

    /**
     * 投资菜单
     */
    investMenu(gameState) {
        const cityEconomy = gameState.getCityEconomy(gameState.currentCityId);
        const city = getCityTemplateById(gameState.currentCityId);
        const nextLevel = (cityEconomy.investmentLevel || 0) + 1;
        const cost = EconomicCalculator.getInvestmentLevelCost(nextLevel);

        let message = `投资城镇：${city.name}\n\n`;
        message += `当前投资等级：${cityEconomy.investmentLevel || 0}\n`;
        message += `当前繁荣度：${cityEconomy.prosperity || 50}\n`;
        message += `升级到等级 ${nextLevel} 需要：${EconomicCalculator.wenToGuan(cost).toFixed(2)} 贯\n\n`;
        message += '投资可以提升城镇繁荣度，降低商品物价，增加税收。';

        if (gameState.money >= cost) {
            if (confirm(message + '\n\n确认投资吗？')) {
                this.confirmInvest(gameState, cost);
            }
        } else {
            alert(message + '\n\n金钱不足');
        }
    },

    /**
     * 确认投资
     */
    confirmInvest(gameState, cost) {
        gameState.money -= cost;
        const cityEconomy = gameState.getCityEconomy(gameState.currentCityId);
        cityEconomy.investmentLevel = (cityEconomy.investmentLevel || 0) + 1;
        const prosperityGain = EconomicCalculator.calculateProsperityGain(cost);
        cityEconomy.prosperity = (cityEconomy.prosperity || 50) + prosperityGain;
        cityEconomy.prosperity = Math.min(100, cityEconomy.prosperity);

        this.state.message = `投资成功！投资等级提升到 ${cityEconomy.investmentLevel}，繁荣度提升 ${prosperityGain}`;

        // 消耗3天时间
        gameState.advanceDays(3);
        window.game.gameView.renderAll();
    }
};

// 让点击事件可访问
window.MarketScene = MarketScene;
