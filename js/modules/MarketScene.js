/**
 * 市集交易场景
 * 处理市集的渲染和用户交互
 */

import { getAllGoodsTemplates, getGoodsTemplateById } from '../../data/goods.js';
import { getCityTemplateById } from '../../data/cities.js';
import { GameScene } from '../GameState.js';
import EconomicCalculator from '../utils/EconomicCalculator.js';
import NavigationManager from '../managers/NavigationManager.js';

const MarketScene = {
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
     * 渲染市集场景
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

        // 商品表格
        html += `<table class="market-table">\n`;
        html += `<thead><tr><th>商品</th><th>类别</th><th>买入价(贯)</th><th>卖出价(贯)</th><th>描述</th></tr></thead>\n`;
        html += `<tbody>\n`;

        for (const goods of tradableGoods) {
            const buyPriceWen = EconomicCalculator.calculateBuyPrice(
                goods.goodsId,
                gameState.getCityEconomy(currentCityId),
                gameState
            );
            const sellPriceWen = EconomicCalculator.calculateSellPrice(buyPriceWen);
            const isSelected = this.state.selectedGoods && this.state.selectedGoods.goodsId === goods.goodsId;
            const rowClass = isSelected ? 'selected' : '';

            html += `<tr class="${rowClass}" data-goods-id="${goods.goodsId}">
                <td>${goods.name}</td>
                <td>${goods.category}</td>
                <td>${EconomicCalculator.wenToGuan(buyPriceWen).toFixed(2)}</td>
                <td>${EconomicCalculator.wenToGuan(sellPriceWen).toFixed(2)}</td>
                <td>${goods.description}</td>
            </tr>\n`;
        }

        html += `</tbody></table>\n`;

        // 选中商品操作区
        if (this.state.selectedGoods) {
            const goods = this.state.selectedGoods;
            const buyPriceWen = EconomicCalculator.calculateBuyPrice(
                goods.goodsId,
                gameState.getCityEconomy(currentCityId),
                gameState
            );
            const sellPriceWen = EconomicCalculator.calculateSellPrice(buyPriceWen);
            const totalCost = this.state.mode === 'buy' ? buyPriceWen * this.state.quantity : 0;
            const totalRevenue = this.state.mode === 'sell' ? sellPriceWen * this.state.quantity : 0;

            html += `<div class="trade-panel">\n`;
            html += `<h3>交易：${goods.name}</h3>\n`;

            html += `<div class="quantity-control">
                <span>数量：</span>
                <button onclick="MarketScene.decreaseQuantity()">-</button>
                <span class="quantity">${this.state.quantity}</span>
                <button onclick="MarketScene.increaseQuantity()">+</button>
            </div>\n`;

            if (this.state.currentMode === 'buy') {
                html += `<p>总价格：<strong>${EconomicCalculator.wenToGuan(totalCost).toFixed(2)} 贯</strong></p>\n`;
                html += `<button onclick="MarketScene.confirmBuy(window.game.gameState)">确认买入</button>\n`;
            } else {
                html += `<p>可卖出：<strong>${this.getPlayerGoodsQuantity(gameState, goods.goodsId)}</strong></p>\n`;
                html += `<p>总收入：<strong>${EconomicCalculator.wenToGuan(totalRevenue).toFixed(2)} 贯</strong></p>\n`;
                html += `<button onclick="MarketScene.confirmSell(window.game.gameState)">确认卖出</button>\n`;
            }

            html += `</div>\n`;
        }

        // 功能按钮区
        html += `<div class="action-buttons">\n`;
        html += `<button onclick="MarketScene.switchMode('buy')" class="${this.state.currentMode === 'buy' ? 'active' : ''}">买入</button>\n`;
        html += `<button onclick="MarketScene.switchMode('sell')" class="${this.state.currentMode === 'sell' ? 'active' : ''}">卖出</button>\n`;
        html += `<button onclick="MarketScene.investMenu(window.game.gameState)">城镇投资</button>\n`;
        html += `<button onclick="window.game.gameView.goBackToCity()">返回城镇</button>\n`;
        html += `</div>\n`;

        html += `</div>\n`;

        // 渲染后需要绑定事件
        setTimeout(() => this.bindTableEvents(), 0);

        return html;
    },

    /**
     * 绑定表格行点击事件
     */
    bindTableEvents() {
        document.querySelectorAll('.market-table tr[data-goods-id]').forEach(row => {
            row.addEventListener('click', () => {
                const goodsId = row.dataset.goodsId;
                this.selectGoods(goodsId, window.game.gameState);
            });
        });
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
     * 切换买卖模式
     */
    switchMode(mode) {
        this.state.currentMode = mode;
        this.state.selectedGoods = null;
        this.state.quantity = 1;
        window.game.gameView.renderAll(window.gameState);
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
        window.game.gameView.renderAll(window.gameState);
    },

    /**
     * 减少数量
     */
    decreaseQuantity() {
        if (this.state.quantity > 1) {
            this.state.quantity--;
        }
        window.game.gameView.renderAll(window.gameState);
    },

    /**
     * 确认买入
     */
    confirmBuy(gameState) {
        if (!this.state.selectedGoods || this.state.quantity <= 0) {
            this.state.message = '请选择要购买的商品和数量';
            window.game.gameView.renderAll(gameState);
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
            window.game.gameView.renderAll(gameState);
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
            window.game.gameView.renderAll(gameState);
            return;
        }

        const playerQuantity = this.getPlayerGoodsQuantity(gameState, this.state.selectedGoods.goodsId);
        if (playerQuantity < this.state.quantity) {
            this.state.message = '持有商品不足';
            window.game.gameView.renderAll(gameState);
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

export default MarketScene;
// 让点击事件可访问
window.MarketScene = MarketScene;
