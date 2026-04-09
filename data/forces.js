/**
 * 势力定义库 - 静态数据
 * Faction definition library (static data)
 * 按照核心数据层设计：定义所有势力的初始数据
 */

/**
 * 势力模板属性接口
 * @typedef {Object} ForceTemplate
 * @property {string} factionId - 势力ID
 * @property {number} id - 数字ID
 * @property {string} name - 势力名称
 * @property {string} leader - 领袖人物templateId
 * @property {string} color - 势力颜色代码，用于UI显示
 * @property {string[]} initialCities - 初始占据城池ID列表
 * @property {string[]} initialOfficers - 初始武将templateId列表
 * @property {Object} diplomacy - 外交关系 {factionId: relationValue} 范围 -100 ~ +100
 */

/**
 * 所有势力模板
 * 元末群雄主要势力
 * @type {ForceTemplate[]}
 */
const FACTION_TEMPLATES = [
    {
        factionId: "GUO",
        id: 1,
        name: "郭子兴军",
        leader: "GUO_ZIXING",
        color: "#8b4513",
        initialCities: [1, 2, 3, 4],
        initialOfficers: ["GUO_ZIXING", "ZHU_YUANZHANG", "TANG_HE", "MA_XIUYING"],
        diplomacy: {
            "ZHU": 0,
            "CHEN": -60,
            "ZHANG": -30,
            "YUAN": -100
        }
    },
    {
        factionId: "ZHU",
        id: 2,
        name: "朱元璋军",
        leader: "ZHU_YUANZHANG",
        color: "#4a90e2",
        initialCities: [5],
        initialOfficers: ["ZHU_YUANZHANG", "XU_DA", "CHANG_YUCHUN", "LI_SHANCHANG", "TANG_HE"],
        diplomacy: {
            "GUO": 20,
            "CHEN": -70,
            "ZHANG": -40,
            "YUAN": -100
        }
    },
    {
        factionId: "CHEN",
        id: 3,
        name: "陈友谅军",
        leader: "CHEN_YOULIANG",
        color: "#c0392b",
        initialCities: [6, 7],
        initialOfficers: ["CHEN_YOULIANG", "ZHANG_DINGBIAN"],
        diplomacy: {
            "ZHU": -70,
            "ZHANG": -30,
            "YUAN": -50
        }
    },
    {
        factionId: "ZHANG",
        id: 4,
        name: "张士诚军",
        leader: "ZHANG_SHICHENG",
        color: "#16a085",
        initialCities: [8],
        initialOfficers: ["ZHANG_SHICHENG"],
        diplomacy: {
            "ZHU": -30,
            "CHEN": -20,
            "YUAN": -40
        }
    },
    {
        factionId: "YUAN",
        id: 5,
        name: "元廷",
        leader: "YUAN_SHUNDI",
        color: "#2c3e50",
        initialCities: [9, 10],
        initialOfficers: ["KUO_KUO_TE_MUER", "CHAMUAN_HUMA"],
        diplomacy: {
            "ZHU": -100,
            "CHEN": -50,
            "ZHANG": -50
        }
    }
];

/**
 * 根据ID获取势力模板
 * @param {number} id
 * @returns {ForceTemplate|undefined}
 */
window.getForceTemplateById = function getForceTemplateById(id) {
    return FACTION_TEMPLATES.find(f => f.id === id);
};

/**
 * 根据factionId获取势力模板
 * @param {string} factionId
 * @returns {ForceTemplate|undefined}
 */
window.getForceTemplateByFactionId = function getForceTemplateByFactionId(factionId) {
    return FACTION_TEMPLATES.find(f => f.factionId === factionId);
};

/**
 * 获取所有势力模板
 * @returns {ForceTemplate[]}
 */
window.getAllForceTemplates = function getAllForceTemplates() {
    return FACTION_TEMPLATES;
};

/**
 * 根据领袖人物templateId获取势力
 * @param {string} characterTemplateId
 * @returns {ForceTemplate|undefined}
 */
window.getForceByLeader = function getForceByLeader(characterTemplateId) {
    return FACTION_TEMPLATES.find(f => f.leader === characterTemplateId);
};

/**
 * 获取两个势力之间的关系值
 * @param {string} factionAId
 * @param {string} factionBId
 * @returns {number} 关系值 -100 ~ +100
 */
window.getDiplomacyRelation = function getDiplomacyRelation(factionAId, factionBId) {
    const factionA = FACTION_TEMPLATES.find(f => f.factionId === factionAId);
    if (!factionA || !factionA.diplomacy) return 0;
    return factionA.diplomacy[factionBId] || 0;
};
