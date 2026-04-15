/**
 * random - 事件数据
 */

const EVENTS_RANDOM = [
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
                text: '转过一道山梁，忽然林中跳出几个强人，手持刀棍拦住去路：\n"此树是我栽，此路是我开！要想从此过，留下买路财！"',
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

];
