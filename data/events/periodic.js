/**
 * periodic - 事件数据
 */

const EVENTS_PERIODIC = [
	// ========== 定期事件 - 俸禄发放（评定会后） ==========
	{
		eventId: 'E_PERIODIC_SALARY',
		type: EventTypes.PERIODIC,
		name: '俸禄发放',
		description: '评定会发放两个月俸禄',
		trigger: {
			time: { month: [1, 3, 5, 7, 9, 11], day: 1, operator: '==' },
			location: null,
			identity: ['soldier', 'captain', 'lieutenant', 'hundred', 'thousand', 'commandant', 'commandant_junior', 'commandant_senior', 'duke_junior', 'duke', 'duke_senior'],
			flagsRequired: [],
			flagsForbidden: [],
			probability: 1.0
		},
		scenes: [
			{
				sceneId: 1,
				text: '评定会结束，官府发放这两个月的俸禄。',
				choices: [
					{
						text: '领取俸禄',
						effects: [
							{ type: 'add_salary', value: 'auto' }
						],
						nextScene: 2
					}
				]
			},
			{
				sceneId: 2,
				text: '你接过俸禄袋，沉甸甸的压手。这两个月的俸禄，已经入账了。',
				effects: []
			}
		]
	},

	// ========== 定期事件 - 季度收税（城主以上） ==========
	{
		eventId: 'E_PERIODIC_QUARTERLY_TAX',
		type: EventTypes.PERIODIC,
		name: '季度收税',
		description: '征收所属城镇季度税收',
		trigger: {
			time: { month: [1, 4, 7, 10], day: 1, operator: '==' },
			location: null,
			identity: ['thousand', 'commandant', 'commandant_junior', 'commandant_senior', 'duke_junior', 'duke', 'duke_senior'],
			flagsRequired: [],
			flagsForbidden: [],
			probability: 1.0
		},
		scenes: [
			{
				sceneId: 1,
				text: '季度税期已到，各地税官将本季度税收解押送来。你打开税册核对，各地税收陆续入库。',
				choices: [
					{
						text: '收下税收',
						effects: [
							{ type: 'collect_quarterly_tax' }
						],
						nextScene: null
					}
				]
			}
		]
	},

	// ========== 日常事件 - 酒馆打零工 ==========
	{
		eventId: 'E_DAILY_WORK_TAVERN',
		type: EventTypes.DAILY,
		name: '酒馆帮工',
		description: '在酒馆帮工赚取工钱，适合初期谋生',
		trigger: {
			location: null,
			identity: ['peasant', 'monk', 'soldier'],
			flagsRequired: [],
			flagsForbidden: [],
			probability: 1.0
		},
		scenes: [
			{
				sceneId: 1,
				text: '你来到酒馆，问掌柜要不要帮工。掌柜打量你一番，说正好缺个搬酒伙计，干一天给一天钱。',
				choices: [
					{
						text: '干一天活挣一天钱',
						effects: [
							{ type: 'daily_work_random_reward' }
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
    },

    // ========== 评定会剧情 - 家臣模式 ==========
    {
        eventId: 'E_EVALUATION_ASSEMBLY_VASSAL',
        type: EventTypes.PERIODIC,
        name: '评定会开幕（家臣）',
        description: '评定会召开，主公发布议题',
        trigger: {
            time: { month: [1, 3, 5, 7, 9, 11], day: 1, operator: '==' },
            location: 1, // 主城濠州/应天
            identity: ['peasant', 'soldier', 'xiaoqi', 'zongqi', 'baihu', 'qianhu', 'zhihuiqianshi', 'zhihuitongzhi', 'zhihui'],
            faction: 1,
            flagsRequired: [],
            flagsForbidden: [],
            probability: 1.0
        },
        scenes: [
            {
                sceneId: 1,
                text: '卯时三刻，鼓响三通，评定会正式开始。\n\n主公朱元璋端坐大堂之上，扫视帐下文武：\n\n"如今元廷无道，天下大乱。我军驻扎濠州，粮少兵微，亟需扩军备战。诸位有何良策？谁愿为我分忧？"',
                choices: [
                    {
                        text: '末将愿往，分忧解难',
                        effects: [],
                        nextScene: null
                    }
                ]
            }
        ]
    },

    // ========== 评定会剧情 - 君主模式（朝会） ==========
    {
        eventId: 'E_EVALUATION_ASSEMBLY_RULER',
        type: EventTypes.PERIODIC,
        name: '朝会开幕（君主）',
        description: '朝会召开，六部尚书分列两侧',
        trigger: {
            time: { month: [1, 3, 5, 7, 9, 11], day: 1, operator: '==' },
            locationType: '都城',
            identity: ['dudujianshi', 'dutongzhi', 'wujun'],
            flagsRequired: [],
            flagsForbidden: [],
            probability: 1.0
        },
        scenes: [
            {
                sceneId: 1,
                text: '南京奉天殿，钟鼓齐鸣。\n\n文武百官按文东武西站定，六部尚书捧着笏板出列。\n\n你端坐龙椅之上，俯视阶下群臣：\n\n"诸位爱卿，本朝开国百废待兴，今日朝会可有本奏？"',
                choices: [
                    {
                        text: '今日商议军国大事，诸卿听令',
                        effects: [],
                        nextScene: null
                    }
                ]
            }
        ]
    },
    // ========== 开科举事件 ==========
    {
        eventId: 'E_IMPERIAL_EXAMINATION',
        type: EventTypes.PERIODIC,
        name: '科举开考',
        description: '三年一度科举考试开考（君主特有）',
        trigger: {
            time: { year: 1368, month: 3, day: 1, operator: '>=' },
            locationType: '都城',
            identity: ['dudujianshi', 'dutongzhi', 'wujun'],
            flagsRequired: [],
            flagsForbidden: [],
            probability: 1.0
        },
        scenes: [
            {
                sceneId: 1,
                text: '礼部尚书出班奏道：\n\n"陛下，三年一度科举已到开考之期，天下举人已齐聚南京，恭请陛下钦点主考官。"',
                choices: [
                    {
                        text: '钦点刘伯温为主考官，即刻开考',
                        effects: [
                            { type: 'add_skill_exp', skillId: 'law', exp: 20 },
                            { type: 'add_card', cardId: 'EVENT_IMPERIAL_EXAM' }
                        ],
                        nextScene: 2
                    }
                ]
            },
            {
                sceneId: 2,
                text: '三月放榜，状元、榜眼、探花出炉。新科进士们穿着绯红色官袍，在长安街夸官三日。\n\n天下读书人奔走相告，从此朱家天子开科取士，寒门也可得公卿。',
                effects: []
            }
        ]
    },
];
