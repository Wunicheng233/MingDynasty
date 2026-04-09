/**
 * 事件库 - 静态数据
 * Event library (static data)
 * 所有剧情事件都在这里定义，数据驱动设计
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
 * 效果类型枚举
 */
window.EffectTypes = {
    ADD_MONEY: 'add_money',             // 增加金钱
    SUB_MONEY: 'sub_money',             // 减少金钱
    ADD_CARD: 'add_card',               // 添加卡片
    SET_FLAG: 'set_flag',               // 设置事件标记
    CLEAR_FLAG: 'clear_flag',           // 清除事件标记
    ADD_INTIMACY: 'add_intimacy',       // 增加亲密度
    CHANGE_IDENTITY: 'change_identity', // 改变身份
    CHANGE_FACTION: 'change_faction',  // 改变势力
    ADVANCE_TIME: 'advance_time',       // 推进时间
    TRIGGER_BATTLE: 'trigger_battle',   // 触发合战
    TRIGGER_DUEL: 'trigger_duel',       // 触发个人战
    ADD_SKILL_EXP: 'add_skill_exp',     // 增加技能经验
    CHANGE_ROLE: 'change_role',         // 改变身份等级（功勋晋升）
    ADD_MERIT: 'add_merit'             // 增加功勋
};

/**
 * 所有事件定义数组
 * @type {EventTemplate[]}
 */
const ALL_EVENTS = [
    // ========== 第一章主线事件 ==========
    {
        eventId: 'E_MAIN_START_GAME',
        type: EventTypes.MAIN,
        name: '皇觉寺抉择',
        description: '游戏开局，至正十二年二月，你在皇觉寺为僧，饥饿迫你做出选择',
        trigger: {
            time: { year: 1352, month: 2, day: 1, operator: '>=' },
            location: null,
            identity: null,
            flagsRequired: [],
            flagsForbidden: ['E_MAIN_START_GAME_DONE'],
            probability: 1.0
        },
        scenes: [
            {
                sceneId: 1,
                text: '至正十二年，春。\n\n濠州旱灾已经连续三年了，皇觉寺的存粮也快吃完了。住持说，寺里养不起这么多闲人，让你们自己下山化缘……\n\n你站在皇觉寺山门前，望着漫天黄尘，不知道去哪里才好。听说濠州城里郭子兴拉起了红巾军，元军和红巾军打得不可开交。可是留在山里，只有饿死一条路。',
                choices: [
                    {
                        text: '下山投奔郭子兴，横竖都是死，不如反了！',
                        effects: [
                            { type: 'change_role', value: 'soldier' },
                            { type: 'change_faction', value: 1 },
                            { type: 'add_merit', value: 0 },
                            { type: 'add_money', value: 1000 },
                            { type: 'set_flag', value: 'E_MAIN_START_GAME_DONE' },
                            { type: 'set_flag', value: 'JOINED_REDBELLY' }
                        ],
                        nextScene: 2
                    },
                    {
                        text: '继续留在皇觉寺，忍饥挨饿等待转机',
                        effects: [
                            { type: 'advance_time', value: 30 },
                            { type: 'sub_money', value: 50 },
                            { type: 'set_flag', value: 'STAYED_TEMPLE' }
                        ],
                        nextScene: 3
                    }
                ]
            },
            {
                sceneId: 2,
                text: '你收拾了几件破衣，连夜下山投奔濠州红巾军大营。郭子兴见你身材魁伟，相貌不凡，当即收下你做了亲兵。\n\n从此，你就是红巾军的一员了。',
                effects: [
                    { type: 'add_card', cardId: 'CHAR_GUO_ZIXING' },
                    { type: 'add_intimacy', target: 1, value: 20 }
                ]
            },
            {
                sceneId: 3,
                text: '你继续留在皇觉寺，每日挑水砍柴，勉强糊口。但饥饿越来越严重，恐怕撑不了几个月了……\n\n也许，下一次红巾军来的时候，你还是得下山。',
                effects: []
            }
        ]
    },

    // ========== 随机事件示例 ==========
    {
        eventId: 'E_RANDOM_WEATHER_RAIN',
        type: EventTypes.RANDOM,
        name: '暴雨行路',
        description: '暴雨耽误行程',
        trigger: {
            time: null,
            location: null,
            identity: null,
            flagsRequired: [],
            flagsForbidden: [],
            probability: 0.05  // 每天5%概率
        },
        scenes: [
            {
                sceneId: 1,
                text: '走到半路，忽然乌云密布，大雨倾盆而下。你急忙找了个破庙躲雨，这一等就是一整天。',
                choices: [
                    {
                        text: '只好等到雨停',
                        effects: [
                            { type: 'advance_time', value: 1 }
                        ],
                        nextScene: null
                    }
                ]
            }
        ]
    },

    {
        eventId: 'E_RANDOM_ROBBER',
        type: EventTypes.RANDOM,
        name: '遭遇山贼',
        description: '行路遇到山贼拦路抢劫',
        trigger: {
            time: null,
            location: null,
            identity: null,
            flagsRequired: [],
            flagsForbidden: [],
            probability: 0.03  // 每天3%概率
        },
        scenes: [
            {
                sceneId: 1,
                text: '转过一道山梁，忽然林中跳出几个强人，手持刀棍拦住去路：\n“此树是我栽，此路是我开！要想从此过，留下买路财！”',
                choices: [
                    {
                        text: '乖乖留下钱财，保得一身平安',
                        effects: [
                            { type: 'sub_money', value: 500 },
                            { type: 'advance_time', value: 1 }
                        ],
                        nextScene: null
                    },
                    {
                        text: '拔出佩剑，杀开一条血路',
                        effects: [
                            { type: 'trigger_duel', value: 'robber' }
                        ],
                        nextScene: null
                    }
                ]
            }
        ]
    },

    // ========== 定期事件示例 - 评定会已经在主命系统处理，这里放新年示例 ==========
    {
        eventId: 'E_PERIODIC_NEW_YEAR',
        type: EventTypes.PERIODIC,
        name: '新年元旦',
        description: '新年元旦，百官朝贺',
        trigger: {
            time: { month: 1, day: 1, operator: '==' },
            location: null,
            identity: null,
            flagsRequired: [],
            flagsForbidden: [],
            probability: 1.0
        },
        scenes: [
            {
                sceneId: 1,
                text: '爆竹声中一岁除，春风送暖入屠苏。\n\n新的一年开始了，你站在城头，望着远方，心中充满了期待。',
                choices: [
                    {
                        text: '新的一年，继续努力！',
                        effects: [],
                        nextScene: null
                    }
                ]
            }
        ]
    }
];

/**
 * 根据ID获取事件模板
 * @param {string} eventId
 * @returns {EventTemplate|undefined}
 */
window.getEventTemplateById = function getEventTemplateById(eventId) {
    return ALL_EVENTS.find(e => e.eventId === eventId);
};

/**
 * 获取所有事件模板
 * @returns {EventTemplate[]}
 */
window.getAllEventTemplates = function getAllEventTemplates() {
    return ALL_EVENTS;
};

/**
 * 获取事件优先级
 * @param {EventTemplate} event
 * @returns {number}
 */
window.getEventPriority = function getEventPriority(event) {
    return EventPriority[event.type] || 0;
};
