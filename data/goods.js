/**
 * 商品定义 - 静态数据
 * Goods definition (static data)
 * 定义所有可交易商品的基础属性
 */

/**
 * 商品模板属性接口
 * @typedef {Object} GoodsTemplate
 * @property {string} goodsId - 商品ID
 * @property {string} name - 商品名称
 * @property {string} category - 类别: 粮食/食盐/纺织品/矿产/木材/药材/特产/盐引
 * @property {number} basePrice - 基础价格（单位：文）
 * @property {number} baseWeight - 每单位重量（用于计算承载量）
 * @property {boolean} isLegal - 是否合法交易
 * @property {string} description - 描述
 */

/**
 * 所有商品基础模板
 * @type {GoodsTemplate[]}
 */
const GOODS_TEMPLATES = [
    {
        goodsId: "rice",
        name: "大米",
        category: "粮食",
        basePrice: 1000,      // 1贯/石
        baseWeight: 1,
        isLegal: true,
        description: "主食，各地都有出产，价格随丰歉波动较大"
    },
    {
        goodsId: "wheat",
        name: "小麦",
        category: "粮食",
        basePrice: 900,
        baseWeight: 1,
        isLegal: true,
        description: "北方主要粮食作物"
    },
    {
        goodsId: "salt",
        name: "食盐",
        category: "食盐",
        basePrice: 15000,    // 15贯/引
        baseWeight: 1,
        isLegal: true,
        description: "生活必需品，需盐引才能合法大额交易"
    },
    {
        goodsId: "silk",
        name: "丝绸",
        category: "纺织品",
        basePrice: 8000,     // 8贯/匹
        baseWeight: 0.1,
        isLegal: true,
        description: "江南特产，价格昂贵，利润空间大"
    },
    {
        goodsId: "cotton",
        name: "棉布",
        category: "纺织品",
        basePrice: 2000,
        baseWeight: 0.2,
        isLegal: true,
        description: "民间主要衣料"
    },
    {
        goodsId: "tea",
        name: "茶叶",
        category: "特产",
        basePrice: 3000,     // 3贯/斤
        baseWeight: 0.1,
        isLegal: true,
        description: "江南和福建特产，远销海外"
    },
    {
        goodsId: "iron",
        name: "生铁",
        category: "矿产",
        basePrice: 1200,
        baseWeight: 1,
        isLegal: true,
        description: "铸造兵器农具的原料"
    },
    {
        goodsId: "wood",
        name: "木材",
        category: "木材",
        basePrice: 800,
        baseWeight: 1,
        isLegal: true,
        description: "建筑和造船原料"
    },
    {
        goodsId: "herb",
        name: "药材",
        category: "药材",
        basePrice: 5000,
        baseWeight: 0.1,
        isLegal: true,
        description: "各类中药材，产地集中"
    },
    {
        goodsId: "horse",
        name: "战马",
        category: "特产",
        basePrice: 30000,    // 30贯/匹
        baseWeight: 5,
        isLegal: true,
        description: "北方出产，军队急需"
    },
    {
        goodsId: "salt_ticket",
        name: "盐引",
        category: "盐引",
        basePrice: 50000,    // 50贯/张
        baseWeight: 0.01,
        isLegal: true,
        description: "官府颁发的食盐贸易凭证，可到盐区支取食盐"
    }
];

/**
 * 根据ID获取商品模板
 * @param {string} goodsId
 * @returns {GoodsTemplate|undefined}
 */
export function getGoodsTemplateById(goodsId) {
    return GOODS_TEMPLATES.find(g => g.goodsId === goodsId);
}

/**
 * 获取所有商品模板
 * @returns {GoodsTemplate[]}
 */
export function getAllGoodsTemplates() {
    return GOODS_TEMPLATES;
}

/**
 * 根据类别获取商品
 * @param {string} category
 * @returns {GoodsTemplate[]}
 */
export function getGoodsByCategory(category) {
    return GOODS_TEMPLATES.filter(g => g.category === category);
}

// 保留全局暴露用于兼容性调试
window.getGoodsTemplateById = getGoodsTemplateById;
window.getAllGoodsTemplates = getAllGoodsTemplates;
window.getGoodsByCategory = getGoodsByCategory;
