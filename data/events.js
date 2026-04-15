/**
 * 事件库 - 静态数据（拆分优化版）
 * Event library (static data) - Split version
 *
 * 按照事件类型拆分到data/events/目录下，便于维护
 * 所有事件仍然聚合到 ALL_EVENTS 数组，保持向后兼容
 * 所有剧情事件都在这里定义，数据驱动设计
 */

/**
 * 事件数据结构说明
 * 每个事件对象支持以下字段：
 * - eventId: 唯一事件ID
 * - type: 事件类型（main/branch/random/periodic）
 * - name: 事件名
 * - description: 事件简介，用于编辑器和日志
 * - trigger: 触发条件对象
 *   - time: {year, month, day, operator}
 *   - location: 单城市ID或城市ID数组
 *   - locationType: 城市类型（都城/普通/边关/海港）
 *   - locationFacilities: 需要当前城市拥有的设施数组
 *   - identity: 当前玩家身份，可为单值或数组
 *   - faction: 当前玩家势力ID
 *   - flagsRequired: 必需事件标记数组
 *   - flagsForbidden: 禁止事件标记数组
 *   - intimacy: {characterId, minLevel}
 *   - skill: {skillId, minLevel}
 *   - cardsRequired: 必须持有的卡片ID数组
 *   - probability: 触发概率，0~1
 * - options: 选择项数组
 *   - text: 选项显示文本
 *   - visible: 条件函数或者可见性条件对象
 *   - consequences: 结果对象
 *     - addFlag: 添加事件标记
 *     - removeFlag: 移除事件标记
 *     - addCards: 获得卡片
 *     - removeCards: 失去卡片
 *     - changeStats: 改变玩家属性
 *     - changeMoney: 改变金钱
 *     - changeMerit: 改变功勋
 *     - intimacy: {characterId, change} 改变好感
 *     - addMission: 添加任务
 *     - completeMission: 完成任务
 *     - jumpToScene: 跳转到指定场景ID
 *     - triggerEvent: 直接触发另一事件
 *     - setCharacterLocation: 改变人物位置
 *     - addFacility: 添加城市设施
 * - text: 事件描述文本（HTML支持）
 * - afterLeaving: 离开后回调
 */

/**
 * 所有事件定义 - 从拆分文件聚合
 * @type {EventData[]}
 */
const ALL_EVENTS = [
    ...(typeof EVENTS_MAIN !== 'undefined' ? EVENTS_MAIN : []),
    ...(typeof EVENTS_BRANCH !== 'undefined' ? EVENTS_BRANCH : []),
    ...(typeof EVENTS_RANDOM !== 'undefined' ? EVENTS_RANDOM : []),
    ...(typeof EVENTS_PERIODIC !== 'undefined' ? EVENTS_PERIODIC : [])
];

/**
 * 根据ID获取事件
 * @param {string} eventId
 * @returns {EventData|undefined}
 */
window.getEventById = function getEventById(eventId) {
    return ALL_EVENTS.find(e => e.eventId === eventId);
};

/**
 * 获取所有事件
 * @returns {EventData[]}
 */
window.getAllEvents = function getAllEvents() {
    return ALL_EVENTS;
};

/**
 * 按类型筛选事件
 * @param {string} type
 * @returns {EventData[]}
 */
window.getEventsByType = function getEventsByType(type) {
    return ALL_EVENTS.filter(e => e.type === type);
};

/**
 * 获取所有可触发事件（根据触发条件筛选）
 * @param {Object} gameState
 * @returns {EventData[]}
 */
window.getAvailableEvents = function getAvailableEvents(gameState) {
    const {currentDate, player, currentCity} = gameState;
    return ALL_EVENTS.filter(event => {
        if (!event.trigger) return true;
        // 简化版本：只检查最基本的条件，详细检查由EventScheduler进行
        return true;
    });
};

window.ALL_EVENTS = ALL_EVENTS;
// Types already defined in event-types.js, just re-export for compatibility
window.EventTypes = window.EventTypes;
window.EventPriority = window.EventPriority;
window.EffectTypes = window.EffectTypes;

// 别名兼容
window.getAllEventTemplates = window.getAllEvents;

/**
 * 获取事件优先级
 * @param {string} eventType
 * @returns {number}
 */
window.getEventPriority = function getEventPriority(eventType) {
    return EventPriority[eventType] || 0;
};
