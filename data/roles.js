/**
 * 身份等级定义 - 主命系统
 * Role definition
 * 按照策划设计：从红巾军士兵到皇帝的完整晋升路线
 */

/**
 * 身份属性接口
 * @typedef {Object} Role
 * @property {string} id - 身份ID
 * @property {string} name - 身份名称（明朝官名）
 * @property {number} requiredMerit - 所需功勋
 * @property {number} troops - 可带兵力
 * @property {string[]} allowedMissionTypes - 可接受主命类型
 * @property {number} order - 排序顺序
 */

/**
 * 完整身份晋升序列 - 完全按照策划表格
 * @type {Role[]}
 */
const ROLES = [
    { id: 'peasant', name: '放牛娃/游方僧', requiredMerit: 0, troops: 0, allowedMissionTypes: [], order: 1 },
    { id: 'soldier', name: '红巾军士兵', requiredMerit: 50, troops: 100, allowedMissionTypes: ['初级军务'], order: 2 },
    { id: 'xiaoqi', name: '小旗', requiredMerit: 200, troops: 300, allowedMissionTypes: ['初级军务'], order: 3 },
    { id: 'zongqi', name: '总旗', requiredMerit: 600, troops: 500, allowedMissionTypes: ['初级军务', '中级军务'], order: 4 },
    { id: 'baihu', name: '百户', requiredMerit: 1400, troops: 1000, allowedMissionTypes: ['中级军务', '初级政务'], order: 5 },
    { id: 'qianhu', name: '千户', requiredMerit: 3000, troops: 2000, allowedMissionTypes: ['中级军务', '高级军务', '中级政务'], order: 6 },
    { id: 'zhihuiqianshi', name: '指挥佥事', requiredMerit: 5000, troops: 3000, allowedMissionTypes: ['高级军务', '外交'], order: 7 },
    { id: 'zhihuitongzhi', name: '指挥同知', requiredMerit: 8000, troops: 4000, allowedMissionTypes: ['all'], order: 8 },
    { id: 'zhihui', name: '指挥使', requiredMerit: 12000, troops: 5000, allowedMissionTypes: ['all'], order: 9 },
    { id: 'dudujianshi', name: '都督佥事', requiredMerit: 18000, troops: 6000, allowedMissionTypes: ['all'], order: 10 },
    { id: 'dutongzhi', name: '都督同知', requiredMerit: 25000, troops: 7000, allowedMissionTypes: ['all'], order: 11 },
    { id: 'wujun', name: '五军都督', requiredMerit: 35000, troops: 8000, allowedMissionTypes: ['all'], order: 12 }
];

/**
 * 根据功勋获取当前应该晋升到的身份
 * @param {number} merit
 * @returns {Role}
 */
window.getCurrentRoleByMerit = function getCurrentRoleByMerit(merit) {
    // 按功勋从大到小找，找到第一个满足的
    return [...ROLES].reverse().find(r => merit >= r.requiredMerit);
};

/**
 * 获取所有身份
 * @returns {Role[]}
 */
window.getAllRoles = function getAllRoles() {
    return [...ROLES].sort((a, b) => a.order - b.order);
};

/**
 * 根据ID获取身份
 * @param {string} id
 * @returns {Role|undefined}
 */
window.getRoleById = function getRoleById(id) {
    return ROLES.find(r => r.id === id);
};
