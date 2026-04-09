/**
 * 经济计算工具模块
 * 物价计算、价格波动、投资收益等核心算法
 */

window.EconomicCalculator = {
    /**
     * 货币换算：文转换为贯（显示用）
     * @param {number} wen - 文
     * @returns {number} 贯
     */
    wenToGuan(wen) {
        return wen / 1000;
    },

    /**
     * 贯转换为文（存储用）
     * @param {number} guan - 贯
     * @returns {number} 文
     */
    guanToWen(guan) {
        return Math.round(guan * 1000);
    },

    /**
     * 文转换为银两（1两 ≈ 1.5贯）
     * @param {number} wen - 文
     * @returns {number} 两
     */
    wenToSilver(wen) {
        return wen / 1000 / 1.5;
    },

    /**
     * 计算商品当前价格（考虑各种影响因素）
     * @param {string} goodsId - 商品ID
     * @param {Object} cityEconomy - 城镇经济状态
     * @param {Object} gameState - 游戏状态（用于获取日期、战乱等）
     * @returns {number} 当前买入价格（文）
     */
    calculateBuyPrice(goodsId, cityEconomy, gameState) {
        const template = getGoodsTemplateById(goodsId);
        if (!template) return 0;

        let price = template.basePrice;

        // 1. 繁荣度影响：越繁荣价格越稳定，略高
        const prosperity = cityEconomy.prosperity || 50;
        price *= 1 + (prosperity - 50) / 500;

        // 2. 季节影响：粮食价格随季节波动
        if (template.category === '粮食') {
            // 春季（2-4月）青黄不接，价格上涨 10-20%
            // 秋季（8-10月）秋收，价格下跌 10-20%
            const month = gameState.month;
            if (month >= 2 && month <= 4) {
                price *= 1.15;
            } else if (month >= 8 && month <= 10) {
                price *= 0.85;
            }
        }

        // 3. 战乱影响：交战城镇物价上涨 20%
        if (cityEconomy.atWar) {
            price *= 1.2;
        }

        // 4. 投资等级影响：投资越高，物价越便宜
        const investmentLevel = cityEconomy.investmentLevel || 0;
        price *= 1 - investmentLevel * 0.02;

        // 5. 特产加成：本地特产价格略低
        const cityTemplate = getCityTemplateByCityId(cityEconomy.cityId);
        if (cityTemplate && cityTemplate.specialties && cityTemplate.specialties.includes(template.name)) {
            price *= 0.9;
        }

        return Math.max(1, Math.round(price));
    },

    /**
     * 计算卖出价格（通常是买入价的 80%）
     * @param {number} buyPrice - 买入价格
     * @returns {number} 卖出价格
     */
    calculateSellPrice(buyPrice) {
        return Math.max(1, Math.round(buyPrice * 0.8));
    },

    /**
     * 获取物价波动系数（用于每月刷新）
     * @returns {number} 波动系数 0.9 - 1.1
     */
    getRandomPriceModifier() {
        // 在±10%范围内波动
        return 0.9 + Math.random() * 0.2;
    },

    /**
     * 计算投资获得的繁荣度提升
     * @param {number} moneyInvested - 投资的金钱（文）
     * @returns {number} 繁荣度提升量
     */
    calculateProsperityGain(moneyInvested) {
        // 每100贯（100000文）增加1点繁荣度
        return Math.floor(moneyInvested / 100000);
    },

    /**
     * 计算投资等级所需金钱
     * @param {number} currentLevel - 当前等级
     * @returns {number} 升级到下一级所需总金钱（文）
     */
    getInvestmentLevelCost(currentLevel) {
        // 等级越高，越贵
        // 等级 1: 500贯，等级 2: 1500贯，等级 3: 3000贯...
        return this.guanToWen(500 * currentLevel * currentLevel);
    },

    /**
     * 计算城镇税收
     * @param {Object} cityEconomy - 城镇经济状态
     * @param {Object} cityTemplate - 城镇模板
     * @returns {number} 税额（文）
     */
    calculateCityTax(cityEconomy, cityTemplate) {
        const prosperity = cityEconomy.prosperity || 50;
        const taxRate = cityEconomy.taxRate || 0.15;
        // 基础税收和繁荣度、规模成正比
        const baseTax = cityTemplate.baseScale * prosperity * 100;
        return Math.round(baseTax * taxRate);
    },

    /**
     * 计算民忠变化（根据税率）
     * @param {number} taxRate - 税率 0-1
     * @returns {number} 民忠变化量
     */
    calculateLoyaltyChange(taxRate) {
        if (taxRate > 0.2) {
            return -2; // 高税率民忠下降
        } else if (taxRate < 0.1) {
            return 1; // 低税率民忠上升
        }
        return 0;
    },

    /**
     * 计算商人运货利润
     * @param {number} buyPrice - 买入价
     * @param {number} sellPrice - 卖出价
     * @param {number} quantity - 数量
     * @param {number} travelCost - 运费
     * @returns {number} 净利润
     */
    calculateTradeProfit(buyPrice, sellPrice, quantity, travelCost) {
        const totalRevenue = sellPrice * quantity;
        const totalCost = buyPrice * quantity + travelCost;
        return totalRevenue - totalCost;
    },

    /**
     * 检查盐引交易是否合法
     * @param {string} cityId - 当前城镇ID
     * @param {string} goodsId - 商品ID
     * @param {Object} gameState - 游戏状态
     * @returns {boolean} 是否合法
     */
    isSaltTradeLegal(cityId, goodsId, gameState) {
        if (goodsId !== 'salt') return true;

        // 如果是产盐区或者玩家有盐引，可以合法交易
        const city = getCityTemplateByCityId(cityId);
        if (!city) return false;

        // 检查是否是盐运司所在地（扬州、淮安等）
        // 对于第一章，我们简化处理：大额交易需要盐引
        // 实际项目中可以扩展判断
        return true;
    },

    /**
     * 获取亲密度等级（根据数值）
     * @param {number} intimacy - 亲密度数值 0-100 或负数
     * @returns {number} 心级 -4 ~ +5
     */
    getIntimacyLevel(intimacy) {
        if (intimacy <= -80) return -4;
        if (intimacy <= -60) return -3;
        if (intimacy <= -30) return -2;
        if (intimacy <= -1) return -1;
        if (intimacy <= 19) return 0;
        if (intimacy <= 39) return 1;
        if (intimacy <= 59) return 2;
        if (intimacy <= 79) return 3;
        if (intimacy <= 94) return 4;
        return 5;
    },

    /**
     * 获取亲密度等级名称
     * @param {number} level - 心级
     * @returns {string} 等级名称
     */
    getIntimacyLevelName(level) {
        const names = {
            [-4]: '不共戴天',
            [-3]: '仇敌',
            [-2]: '交恶',
            [-1]: '冷淡',
            [0]: '中立',
            [1]: '一面之缘',
            [2]: '略有交情',
            [3]: '推心置腹',
            [4]: '莫逆之交',
            [5]: '生死相随'
        };
        return names[level] || '中立';
    },

    /**
     * 获取心型显示字符串
     * @param {number} intimacy - 亲密度数值
     * @returns {string} 心形图标字符串
     */
    getIntimacyHearts(intimacy) {
        const level = this.getIntimacyLevel(intimacy);
        let result = '';

        // 负心（黑桃）
        for (let i = 0; i < -level && i < 4; i++) {
            result += '♤';
        }

        // 正心（红心）
        for (let i = 0; i < level && i < 5; i++) {
            result += '♥';
        }

        // 填空白
        const total = Math.abs(level) + (level > 0 ? 5 - level : 4 + level);
        for (let i = 0; i < total - (level > 0 ? level : -level); i++) {
            result += '♡';
        }

        return result;
    },

    /**
     * 自然衰减亲密度（每半年调用一次）
     * @param {number} intimacy - 当前亲密度
     * @returns {number} 衰减后亲密度
     */
    decayIntimacy(intimacy) {
        // 永不衰减：已经锁定（配偶/结义），5心不衰减
        if (intimacy >= 95) return intimacy;
        // 衰减 2，最低降到 0（中立）
        return Math.max(0, intimacy - 2);
    },

    /**
     * 计算送礼增加的亲密度
     * @param {number} giftValue - 礼物价值（文）
     * @param {boolean} isLiked - 是否是对方喜欢的类型
     * @returns {number} 增加量
     */
    calculateGiftIntimacyGain(giftValue, isLiked) {
        // 基础：每10贯增加1点，上限25点
        let gain = Math.floor(giftValue / 10000);
        gain = Math.min(gain, 25);
        if (isLiked) gain *= 1.5;
        return Math.max(5, Math.round(gain));
    }
};
