/**
 * 卡片类型枚举 - 抽离出来让数据文件可以引用
 * Card types definition extracted for proper dependency order
 */
const CardTypes = {
    CHARACTER: 'character',        // 人物卡 - 解锁可扮演角色
    SKILL: 'skill',              // 技能卡 - 收集图鉴用
    TACTIC_BATTLE: 'tactic_battle', // 合战战术卡 - 红色特殊效果卡
    MARTIAL_DUEL: 'martial_duel',  // 个人战武技卡 - 红色特殊技卡
    SECRET: 'secret',            // 秘传卡 - 名将专属金卡
    TITLE: 'title',              // 称号卡 - 达成条件后获得
    PLACE: 'place',              // 名所卡 - 名胜古迹
    EVENT: 'event',              // 事件卡 - 记录重大历史事件
    TREASURE: 'treasure'         // 宝物卡 - 贵重物品，可送礼/装备
};

window.CardTypes = CardTypes;
