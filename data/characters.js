/**
 * 人物模板库 - 静态数据（拆分优化版）
 * Character template library (static data) - Split version
 *
 * 按照势力拆分到data/characters/目录下，便于维护
 * 所有人物仍然聚合到 CHARACTER_TEMPLATES 数组，保持向后兼容
 * 按照核心数据层设计：所有NPC的基础属性/技能，游戏首次生成时从此复制到存档
 */

/**
 * 人物模板属性接口
 * @typedef {Object} CharacterTemplate
 * @property {string} templateId - 模板ID (全局唯一)
 * @property {number} id - 数字ID
 * @property {string} name - 人物姓名
 * @property {string} emoji - 用Emoji代替头像
 * @property {string} portrait - 立绘资源ID
 * @property {string} color - 头像背景色
 * @property {Object} baseStats - 基础五维 {统率: number, 武力: number, 内政: number, 智力: number, 魅力: number}
 * @property {Object} initialSkills - 初始技能 {skillId: level}
 * @property {string[]} initialCards - 初始拥有卡片ID列表
 * @property {string|null} exclusiveSecretCard - 专属秘传卡ID
 * @property {string} personality - 性格: 忠义/豪勇/智谋/慎重/胆小
 * @property {string} faction - 初始所属势力
 * @property {string} initialRank - 初始身份/官职
 * @property {number[]|null} birthDeath - [出生年, 死亡年]
 * @property {string} description - 人物描述
 * @property {number} locationCityId - 初始所在城市ID
 */

/**
 * 所有人物模板 - 从拆分文件聚合
 * @type {CharacterTemplate[]}
 */
window.CHARACTER_TEMPLATES = [
    // 郭子兴军
    ...(typeof CHARACTERS_GUO !== 'undefined' ? CHARACTERS_GUO : []),
    // 朱元璋军
    ...(typeof CHARACTERS_ZHU !== 'undefined' ? CHARACTERS_ZHU : []),
    // 其他起义军（陈友谅、张士诚、龙凤）
    ...(typeof CHARACTERS_OTHER_REBELS !== 'undefined' ? CHARACTERS_OTHER_REBELS : []),
    // 元朝朝廷
    ...(typeof CHARACTERS_YUAN !== 'undefined' ? CHARACTERS_YUAN : []),
    // 中立人物
    ...(typeof CHARACTERS_NEUTRAL !== 'undefined' ? CHARACTERS_NEUTRAL : []),
    // 平民百姓
    ...(typeof CHARACTERS_CIVILIANS !== 'undefined' ? CHARACTERS_CIVILIANS : [])
];

/**
 * 根据模板ID获取人物模板
 * @param {string} templateId
 * @returns {CharacterTemplate|undefined}
 */
window.getCharacterTemplateById = function getCharacterTemplateById(templateId) {
    return window.CHARACTER_TEMPLATES.find(c => c.templateId === templateId);
};

/**
 * 根据数字ID获取人物模板
 * @param {number} id
 * @returns {CharacterTemplate|undefined}
 */
window.getCharacterTemplateByNumId = function getCharacterTemplateByNumId(id) {
    return window.CHARACTER_TEMPLATES.find(c => c.id === id);
};

/**
 * 获取所有人物模板
 * @returns {CharacterTemplate[]}
 */
window.getAllCharacterTemplates = function getAllCharacterTemplates() {
    return window.CHARACTER_TEMPLATES;
};

/**
 * 根据势力获取该势力所有人物模板
 * @param {string} factionName
 * @returns {CharacterTemplate[]}
 */
window.getCharacterTemplatesByFaction = function getCharacterTemplatesByFaction(factionName) {
    return window.CHARACTER_TEMPLATES.filter(c => c.faction === factionName);
};
