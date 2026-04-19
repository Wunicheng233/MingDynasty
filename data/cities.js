/**
 * 城镇定义库 - 静态数据
 * City definition library (static data)
 * 按照核心数据层设计：定义每个城镇的静态属性，存档中cities从此复制初始值
 */

/**
 * 城镇模板属性接口
 * @typedef {Object} CityTemplate
 * @property {string} cityId - 城镇ID
 * @property {number} id - 数字ID
 * @property {string} name - 城镇名称
 * @property {number} x - 横坐标（0-100 百分比，基于地图背景）
 * @property {number} y - 纵坐标（0-100 百分比，基于地图背景）
 * @property {string} type - 类型: 都城/普通/边关/海港
 * @property {number} baseDefense - 初始城防度 0-100
 * @property {number} baseScale - 初始规模 1-10
 * @property {number} baseGold - 初始军资金
 * @property {number} baseFood - 初始粮草
 * @property {string[]} specialties - 特产列表
 * @property {string[]} facilities - 可用设施: 武馆/市集/工部作坊/国子监/锦衣卫所等
 * @property {string[]} nearbyLandmarks - 附近名胜
 * @property {Array<{target: string, baseDays: number}>} connections - 连接到其他城镇的基础移动天数
 * @property {string} initialFactionId - 初始所属势力ID
 */

/**
 * 所有城镇模板
 * 第一章濠州-应天地区核心城镇
 * @type {CityTemplate[]}
 */
const CITY_TEMPLATES = [
    {
        cityId: "HAOZHOU",
        id: 1,
        name: "濠州",
        x: 45,
        y: 50,
        type: "普通",
        baseDefense: 40,
        baseScale: 4,
        baseGold: 1000,
        baseFood: 5000,
        specialties: ["粮食", "食盐"],
        facilities: ["武馆", "市集", "酒馆"],
        nearbyLandmarks: ["皇觉寺"],
        connections: [
            { target: 3, baseDays: 4 },
            { target: 4, baseDays: 3 },
            { target: 8, baseDays: 2 }
        ],
        initialFactionId: 1 // 郭子兴军
    },
    {
        cityId: "YINGTIAN",
        id: 2,
        name: "应天",
        x: 68,
        y: 38,
        type: "都城",
        baseDefense: 70,
        baseScale: 7,
        baseGold: 5000,
        baseFood: 10000,
        specialties: ["丝绸", "茶叶", "火器"],
        facilities: ["武馆", "市集", "酒馆", "工部作坊", "国子监", "锦衣卫所"],
        nearbyLandmarks: ["秦淮河", "钟山"],
        connections: [
            // 镇江暂未加入，保留位置
            { target: 7, baseDays: 3 },
            { target: 3, baseDays: 4 },
            { target: 1, baseDays: 5 }
        ],
        initialFactionId: null // 无主
    },
    {
        cityId: "CHUZHOU",
        id: 3,
        name: "滁州",
        x: 55,
        y: 35,
        type: "普通",
        baseDefense: 30,
        baseScale: 3,
        baseGold: 800,
        baseFood: 4000,
        specialties: ["木材", "药材"],
        facilities: ["武馆", "市集", "酒馆"],
        nearbyLandmarks: [],
        connections: [
            { target: 1, baseDays: 4 },
            { target: 4, baseDays: 2 },
            { target: 2, baseDays: 4 }
        ],
        initialFactionId: 1
    },
    {
        cityId: "HEZHOU",
        id: 4,
        name: "和州",
        x: 52,
        y: 48,
        type: "普通",
        baseDefense: 25,
        baseScale: 3,
        baseGold: 600,
        baseFood: 3500,
        specialties: ["粮食", "鱼类"],
        facilities: ["市集", "酒馆"],
        nearbyLandmarks: [],
        connections: [
            { target: 1, baseDays: 3 },
            { target: 3, baseDays: 2 },
            { target: 5, baseDays: 5 }
        ],
        initialFactionId: 1
    },
    {
        cityId: "JIANGZHOU",
        id: 5,
        name: "江州",
        x: 18,
        y: 60,
        type: "普通",
        baseDefense: 60,
        baseScale: 5,
        baseGold: 2000,
        baseFood: 8000,
        specialties: ["茶叶", "木材"],
        facilities: ["武馆", "市集", "酒馆", "水寨"],
        nearbyLandmarks: ["鄱阳湖"],
        connections: [
            { target: 6, baseDays: 2 },
            { target: 4, baseDays: 5 }
        ],
        initialFactionId: 2 // 陈友谅军
    },
    {
        cityId: "WUCHANG",
        id: 6,
        name: "武昌",
        x: 10,
        y: 52,
        type: "都城",
        baseDefense: 65,
        baseScale: 6,
        baseGold: 3000,
        baseFood: 9000,
        specialties: ["鱼类", "食盐"],
        facilities: ["武馆", "市集", "酒馆", "水寨"],
        nearbyLandmarks: [],
        connections: [
            { target: 5, baseDays: 2 }
        ],
        initialFactionId: 2
    },
    {
        cityId: "SUZHOU",
        id: 7,
        name: "苏州",
        x: 82,
        y: 42,
        type: "普通",
        baseDefense: 55,
        baseScale: 6,
        baseGold: 3500,
        baseFood: 7000,
        specialties: ["丝绸", "茶叶"],
        facilities: ["武馆", "市集", "酒馆", "商帮会馆"],
        nearbyLandmarks: [],
        connections: [
            { target: 2, baseDays: 3 }
        ],
        initialFactionId: 3 // 张士诚军
    },
    {
        cityId: "FENGYANG",
        id: 8,
        name: "凤阳",
        x: 38,
        y: 42,
        type: "普通",
        baseDefense: 50,
        baseScale: 2,
        baseGold: 500,
        baseFood: 3000,
        specialties: ["粮食"],
        facilities: ["市集", "酒馆"],
        nearbyLandmarks: ["皇觉寺", "明皇陵"],
        connections: [
            { target: 1, baseDays: 2 }
        ],
        initialFactionId: 1
    }
];

/**
 * 根据ID获取城镇模板
 * @param {number} id
 * @returns {CityTemplate|undefined}
 */
export function getCityTemplateById(id) {
    return CITY_TEMPLATES.find(c => c.id === id);
}

/**
 * 根据cityId获取城镇模板
 * @param {string} cityId
 * @returns {CityTemplate|undefined}
 */
export function getCityTemplateByCityId(cityId) {
    return CITY_TEMPLATES.find(c => c.cityId === cityId);
}

/**
 * 获取所有城镇模板
 * @returns {CityTemplate[]}
 */
export function getAllCityTemplates() {
    return CITY_TEMPLATES;
}

/**
 * 根据势力ID获取该势力占据的所有城镇
 * @param {number} forceId
 * @returns {CityTemplate[]}
 */
export function getCityTemplatesByForce(forceId) {
    return CITY_TEMPLATES.filter(c => c.initialFactionId === forceId);
}

/**
 * 获取无主城镇
 * @returns {CityTemplate[]}
 */
export function getUnownedCityTemplates() {
    return CITY_TEMPLATES.filter(c => c.initialFactionId === null);
}

/**
 * 获取移动距离矩阵 - 计算两个城镇间的基础移动天数
 * @param {number} fromId - 起始城镇数字ID
 * @param {number} toId - 目标城镇数字ID
 * @returns {number|null} 基础天数，如果不可直达返回null
 */
export function getTravelDays(fromId, toId) {
    const fromCity = CITY_TEMPLATES.find(c => c.id === fromId);
    if (!fromCity) return null;
    const connection = fromCity.connections.find(conn => conn.target === toId);
    return connection ? connection.baseDays : null;
}

// 保留全局暴露用于兼容性调试
window.getCityTemplateById = getCityTemplateById;
window.getCityTemplateByCityId = getCityTemplateByCityId;
window.getAllCityTemplates = getAllCityTemplates;
window.getCityTemplatesByForce = getCityTemplatesByForce;
window.getUnownedCityTemplates = getUnownedCityTemplates;
window.getTravelDays = getTravelDays;
