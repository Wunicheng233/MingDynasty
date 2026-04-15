/**
 * 事件类型定义 - 抽离出来让数据文件可以引用
 * Event types definition extracted for proper dependency order
 */

/**
 * 事件类型枚举
 */
window.EventTypes = {
    MAIN: 'main',        // 主线事件 - 驱动核心叙事
    BRANCH: 'branch',    // 支线事件 - 可选剧情
    RANDOM: 'random',    // 随机事件 - 概率触发可重复
    PERIODIC: 'periodic'  // 定期事件 - 固定时间重复
};

/**
 * 事件优先级 - 数字越大优先级越高
 */
window.EventPriority = {
    [EventTypes.MAIN]: 100,
    [EventTypes.BRANCH]: 50,
    [EventTypes.PERIODIC]: 20,
    [EventTypes.RANDOM]: 10
};

/**
 * 事件效果类型枚举
 */
window.EffectTypes = {
    ADD_MONEY: 'add_money',
    SUB_MONEY: 'sub_money',
    ADD_CARD: 'add_card',
    SET_FLAG: 'set_flag',
    CLEAR_FLAG: 'clear_flag',
    ADD_INTIMACY: 'add_intimacy',
    CHANGE_IDENTITY: 'change_identity',
    CHANGE_FACTION: 'change_faction',
    ADVANCE_TIME: 'advance_time',
    ADD_SKILL_EXP: 'add_skill_exp',
    CHANGE_ROLE: 'change_role',
    ADD_MERIT: 'add_merit',
    TRIGGER_BATTLE: 'trigger_battle',
    TRIGGER_DUEL: 'trigger_duel'
};
