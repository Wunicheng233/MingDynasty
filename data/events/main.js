/**
 * main - 事件数据
 */

const EVENTS_MAIN = [
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
                            { type: 'set_flag', value: 'JOINED_REDBELLY' },
                            { type: 'advance_time', value: 28 }
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

    // ========== 支线事件示例 ==========
    {
        eventId: 'E_BRANCH_CHAPTER_INN',
        type: EventTypes.BRANCH,
        name: '酒楼密谈',
        description: '在应天都城的酒楼里，偶遇一名行脚商贩带来消息。',
        trigger: {
            time: null,
            locationType: '都城',
            locationFacilities: ['酒馆'],
            identity: ['soldier', 'retainer'],
            flagsRequired: [],
            flagsForbidden: ['E_BRANCH_CHAPTER_INN_DONE'],
            probability: 0.4
        },
        scenes: [
            {
                sceneId: 1,
                text: '应天都城的酒馆内，碗碟叮当，烟雾缭绕。你与一位行脚商贩对饮，他悄声道："听闻淮左军将发起一场大动作，若能先下手，必有大利可图。"',
                choices: [
                    {
                        text: '追问军队动向，看看是否有可利用之处',
                        effects: [
                            { type: 'add_intimacy', target: 1, value: 10 },
                            { type: 'set_flag', value: 'E_BRANCH_CHAPTER_INN_DONE' }
                        ],
                        nextScene: 2
                    },
                    {
                        text: '不予理会，继续打听其他消息',
                        effects: [
                            { type: 'advance_time', value: 1 },
                            { type: 'set_flag', value: 'E_BRANCH_CHAPTER_INN_DONE' }
                        ],
                        nextScene: null
                    }
                ]
            },
            {
                sceneId: 2,
                text: '你从商贩口中获悉，敌军正准备在六安集结。若能先发制人，便能在淮左打开局面。你暗自盘算，下一步该如何行动。',
                effects: [
                    { type: 'add_card', cardId: 'TACTIC_AMBUSH' },
                    { type: 'advance_time', value: 3 }
                ]
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

	// ========== 第一章主线：汤和来信 ==========
	{
		eventId: 'E_MAIN_TANG_HE_LETTER',
		type: EventTypes.MAIN,
		name: '汤和来信',
		description: '汤和在濠州城中来信，劝你下山投奔义军',
		trigger: {
			time: { year: 1352, month: 3, day: 1, operator: '>=' },
			location: null,
			identity: null,
			flagsRequired: ['E_MAIN_START_GAME_DONE', 'JOINED_REDBELLY'],
			flagsForbidden: ['E_MAIN_TANG_HE_LETTER_DONE'],
			probability: 1.0
		},
		scenes: [
			{
				sceneId: 1,
				text: '你在濠州城外皇觉寺挂单。一日清扫寺院，发现一封信件，信封上字迹潦草，却是你少年好友汤和的手笔：\n\n"元璋吾兄：\n    别来无恙？今濠州郭子兴举义，满城百姓欢呼，元兵不敢来犯。某在郭公帐下做了千户，想起兄长英雄，埋没于山寺之中，甚是可惜。不如下山，同取富贵，岂不强于饿死沟壑？\n                                                    弟 汤和 顿首"',
				choices: [
					{
						text: '收拾行囊，即日下山投奔郭子兴',
						effects: [
							{ type: 'change_role', value: 'soldier' },
							{ type: 'change_faction', value: 1 },
							{ type: 'set_flag', value: 'E_MAIN_TANG_HE_LETTER_DONE' },
							{ type: 'advance_time', value: 2 }
						],
						nextScene: 2
					},
					{
						text: '元兵势大，再观望几日',
						effects: [
							{ type: 'advance_time', value: 10 },
							{ type: 'sub_money', value: 10 }
						],
						nextScene: null
					}
				]
			},
			{
				sceneId: 2,
				text: '你怀揣书信，趁着暮色下山，径投濠州红巾军大营而来。',
				effects: [
					{ type: 'add_card', cardId: 'CHAR_TANG_HE' },
					{ type: 'add_intimacy', target: 2, value: 15 }
				]
			}
		]
	},

	// ========== 第一章主线：郭子兴收徒赐名 ==========
	{
		eventId: 'E_MAIN_GUO_ZIXING_RECRUIT',
		type: EventTypes.MAIN,
		name: '郭子兴赐名',
		description: '郭子兴收你为亲兵，赐名元璋',
		trigger: {
			time: { year: 1352, month: 3, day: 10, operator: '>=' },
			location: 1, // 濠州
			identity: ['soldier'],
			faction: 1,
			flagsRequired: ['E_MAIN_TANG_HE_LETTER_DONE', 'JOINED_REDBELLY'],
			flagsForbidden: ['E_MAIN_GUO_ZIXING_RECRUIT_DONE'],
			probability: 1.0
		},
		scenes: [
			{
				sceneId: 1,
				text: '营门守卫领你入帐。郭子升帐议事，你从容行礼，自报家门：\n\n"在下朱重八，见过郭都督。"'
			},
			{
				sceneId: 2,
				text: '郭子兴打量你半晌，见你身材魁梧，相貌奇异，捻须笑道：\n\n"好一条汉子！我看你改名元璋吧——元者，元也；璋者，美玉也。你就是我郭子兴手中的一块美玉，将来必定要打碎元朝天下！"\n\n郭子兴又看重你，便把你留在亲兵队，做了九夫长。',
				effects: [
					{ type: 'set_flag', value: 'E_MAIN_GUO_ZIXING_RECRUIT_DONE' },
					{ type: 'add_card', cardId: 'CHAR_GUO_ZIXING' },
					{ type: 'add_intimacy', target: 1, value: 20 },
					{ type: 'add_skill_exp', skillId: 'infantry', exp: 5 }
				]
			}
		]
	},

	// ========== 第一章主线：马秀英成婚 ==========
	{
		eventId: 'E_MAIN_MA_XIUYING',
		type: EventTypes.MAIN,
		name: '马公嫁女',
		description: '郭子兴将养女马秀英许配给你',
		trigger: {
			time: { year: 1353, month: 1, day: 1, operator: '>=' },
			location: 1, // 濠州
			identity: ['soldier'],
			faction: 1,
			flagsRequired: ['E_MAIN_GUO_ZIXING_RECRUIT_DONE'],
			flagsForbidden: ['E_MAIN_MA_XIUYING_DONE'],
			probability: 1.0
		},
		scenes: [
			{
				sceneId: 1,
				text: '一日议事毕，郭子兴留住你，开口便道：\n\n"元璋，你如今也单身，我养女马秀英，年二十，颇有智识，我做媒，你二人成婚如何？"\n\n马氏是郭子兴的老友马公之女，父母双亡，被郭子兴收为养女，聪慧贤淑，军中素有贤名。',
				choices: [
					{
						text: '多谢都督栽培，敢不从命！',
						effects: [
							{ type: 'set_flag', value: 'E_MAIN_MA_XIUYING_DONE' },
							{ type: 'add_card', cardId: 'CHAR_MA_XIUYING' },
							{ type: 'add_intimacy', target: 9, value: 50 },
							{ type: 'add_money', value: 50 },
							{ type: 'advance_time', value: 30 }
						],
						nextScene: 2
					},
					{
						text: '我功业未立，不敢娶妻，请容后再议',
						effects: [
							{ type: 'advance_time', value: 90 },
							{ type: 'add_intimacy', target: 1, value: -5 }
						],
						nextScene: null
					}
				]
			},
			{
				sceneId: 2,
				text: '吉期一到，濠州城中张灯结彩，你与马秀英拜堂成亲，入了洞房。\n\n灯下看新人，容色端庄秀丽，一双大脚天足，毫无缠足之俗，更添几分飒爽之气。\n\n从此，你在濠州城中，也有了一个家。郭子兴对你更加信任，军中诸将也另眼相看。',
				effects: [
				]
			}
		]
	},

	// ========== 第一章主线：郭子兴病逝 ==========
	{
		eventId: 'E_MAIN_GUO_ZIXING_DEATH',
		type: EventTypes.MAIN,
		name: '郭子兴病逝',
		description: '郭子兴病故，朱元璋接手兵权',
		trigger: {
			time: { year: 1355, month: 3, day: 1, operator: '>=' },
			location: null,
			identity: ['soldier', 'captain', 'general'],
			faction: 1,
			flagsRequired: ['E_MAIN_MA_XIUYING_DONE'],
			flagsForbidden: ['E_MAIN_GUO_ZIXING_DEATH_DONE'],
			probability: 1.0
		},
		scenes: [
			{
				sceneId: 1,
				text: '郭子兴病逝已经三日。\n\n帐中灯火昏暗，郭子兴之子郭天叙坐在主位，帐下诸将默然不语。\n\n郭子兴临死，将大事托付于你。诸将皆曰："郭公战死，军中不可无主，愿推朱公为都元帅。"',
				choices: [
					{
						text: '推辞再三，最终接受都元帅印',
						effects: [
							{ type: 'set_flag', value: 'E_MAIN_GUO_ZIXING_DEATH_DONE' },
							{ type: 'change_role', value: 'general' },
							{ type: 'add_merit', value: 500 },
							{ type: 'add_card', cardId: 'TITLE_GENERAL' },
							{ type: 'advance_time', value: 7 }
						],
						nextScene: 2
					},
					{
						text: '力主郭天叙继位，自己辅佐',
						effects: [
							{ type: 'change_role', value: 'lieutenant' },
							{ type: 'add_merit', value: 200 },
							{ type: 'add_intimacy', target: 1, value: 10 },
							{ type: 'advance_time', value: 7 }
						],
						nextScene: 3
					},
					{
						text: '辞离濠州，投奔别处诸侯',
						effects: [
							{ type: 'set_flag', value: 'E_MAIN_GUO_ZIXING_DEATH_DONE' },
							{ type: 'change_role', value: 'lieutenant' },
							{ type: 'add_merit', value: 100 },
							{ type: 'add_money', value: 50 },
							{ type: 'add_intimacy', target: 1, value: -10 },
							{ type: 'advance_time', value: 15 }
						],
						nextScene: 4
					}
				]
			},
			{
				sceneId: 2,
				text: '你接过元帅大印，坐上都元帅之位。濠州红巾军，从此改姓了朱。\n\n诸将纷纷上前见礼，徐达、汤和等人更是喜形于色。你终于从一个亲兵小校，变成了一方诸侯。',
				effects: [
				]
			},
			{
				sceneId: 3,
				text: '郭天叙继位，你为辅佐。诸将心中不服，暗中仍多听你号令。郭子兴旧部，终归还是你的。',
				effects: [
				]
			},
			{
				sceneId: 4,
				text: '你拜别了郭子兴旧部，只带了数名亲信离开濠州。\n\n"天下大势，分合无常，我朱元璋未必不能自己闯出一条路来。"\n\n你轻装简行，前往别处投奔 stronger 诸侯，等待时机东山再起。你的主命就是积累功勋，争取在新势力中站稳脚跟。',
				effects: [
				]
			}
		]
	},

	// ========== 第一章主线：攻占应天 ==========
	{
		eventId: 'E_MAIN_CAPTURE_YINGTIAN',
		type: EventTypes.MAIN,
		name: '攻占应天',
		description: '渡江攻占应天，建立根基',
		trigger: {
			time: { year: 1356, month: 3, day: 1, operator: '>=' },
			location: 4, // 和州
			identity: ['general'],
			faction: 1,
			flagsRequired: ['E_MAIN_GUO_ZIXING_DEATH_DONE'],
			flagsForbidden: ['E_MAIN_CAPTURE_YINGTIAN_DONE'],
			probability: 1.0
		},
		scenes: [
			{
				sceneId: 1,
				text: '诸将议事厅议事。你起身道：\n\n"江北郭子兴新丧，元军势大，久困濠州不是长策。依我之见，应当渡江直取金陵——金陵龙蟠虎踞，自古就是帝王之都，得了金陵，再图江南，可成大业！"\n\n众将议论纷纷，有的怕元军水师强大，有的担忧粮草不足。',
				choices: [
					{
						text: '力排众议，即日起兵渡江',
						effects: [
							{ type: 'set_flag', value: 'E_MAIN_CAPTURE_YINGTIAN_DONE' },
							{ type: 'trigger_battle', value: 'yingtian_capture' },
							{ type: 'advance_time', value: 10 }
						],
						nextScene: 2
					},
					{
						text: '再操练三月，备足粮草水军再去',
						effects: [
							{ type: 'advance_time', value: 90 },
							{ type: 'add_skill_exp', skillId: 'strategy', exp: 10 }
						],
						nextScene: null
					}
				]
			},
			{
				sceneId: 2,
				text: '采石矶一战，常遇春奋勇先登，元兵溃不成军。大军顺流而下，直薄金陵城下。\n\n元将福寿战死，城门大开，你率众入城，帖木儿不花被俘。\n\n应天，这座江南重镇，从此落入你手。',
				effects: [
					{ type: 'change_city_owner', cityId: 2, factionId: 1 },
					{ type: 'add_merit', value: 1000 },
					{ type: 'add_card', cardId: 'EVENT_CAPTURE_YINGTIAN' },
					{ type: 'add_card', cardId: 'PLACE_QINHUAI' }
				]
			}
		]
	},
];
