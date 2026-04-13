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
 * - scenes: 场景数组，按sceneId串联
 *   - sceneId: 场景ID
 *   - text: 文字内容
 *   - image: 场景插图路径
 *   - choices: 选项数组
 *     - text: 选项文字
 *     - effects: 效果数组
 *     - nextScene: 下一个场景ID 或 null
 *     - requirements: 选项可见条件（可选）
 * - effects: 可执行效果
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
    ADD_MERIT: 'add_merit',             // 增加功勋
    ADD_SALARY: 'add_salary',           // 发放俸禄
    COLLECT_QUARTERLY_TAX: 'collect_quarterly_tax',  // 收集季度税收
    DAILY_WORK_REWARD: 'daily_work_random_reward'    // 打工随机奖励
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

    // ========== 评定会剧情 - 多次缺席惩罚 ==========
    {
        eventId: 'E_EVALUATION_ABSENCE_WARNING',
        type: EventTypes.BRANCH,
        name: '缺席评定会警告',
        description: '多次缺席评定会，主公发出警告',
        trigger: {
            time: null,
            location: 1,
            identity: ['soldier', 'xiaoqi', 'zongqi', 'baihu', 'qianhu'],
            faction: 1,
            flagsRequired: ['E_EVALUATION_ABSENCE_1'],
            flagsForbidden: ['E_EVALUATION_ABSENCE_WARNING_DONE'],
            probability: 1.0
        },
        scenes: [
            {
                sceneId: 1,
                text: '你回到濠州复命，主公见到你，脸色不太好看。\n\n"元璋，这几次评定会你都缺席，军中将士都在议论。你是我的心腹，应当以身作则，怎么能屡次不来？\n\n再有下次，军法从事！"',
                choices: [
                    {
                        text: '末将知罪，下次不敢了',
                        effects: [
                            { type: 'add_intimacy', target: 1, value: -10 },
                            { type: 'set_flag', value: 'E_EVALUATION_ABSENCE_WARNING_DONE' }
                        ],
                        nextScene: null
                    }
                ]
            }
        ]
    },

    // ========== 主公建议事件 ==========
    {
        eventId: 'E_SUGGESTION_TO_LORD',
        type: EventTypes.BRANCH,
        name: '向主公进言',
        description: '评定会上向主公提出战略建议',
        trigger: {
            time: { month: [1, 3, 5, 7, 9, 11], day: [1, 2, 3], operator: '==' },
            location: 1,
            identity: ['baihu', 'qianhu', 'zhihuiqianshi'],
            faction: 1,
            intimacy: { characterId: 1, minLevel: 2 },
            flagsRequired: [],
            flagsForbidden: ['E_SUGGESTION_TO_LORD_DONE'],
            probability: 0.3
        },
        scenes: [
            {
                sceneId: 1,
                text: '评定会间隙，你走到主公近前，低声说出你的看法：\n\n"如今陈友谅虎踞江州，粮草充足，兵多将广。我军应当先取太平，再图安庆，稳扎稳打，不可冒进。"',
                choices: [
                    {
                        text: '静待主公答复',
                        effects: [
                            { type: 'add_merit', value: 50 },
                            { type: 'set_flag', value: 'E_SUGGESTION_TO_LORD_DONE' }
                        ],
                        nextScene: 2
                    }
                ]
            },
            {
                sceneId: 2,
                text: '朱元璋捻须沉吟良久，点头道："你说得有理，就依你之计。就命你前去准备，不可有误。"\n\n你的建议被主公采纳了。',
                effects: [
                    { type: 'add_intimacy', target: 1, value: 5 },
                    { type: 'add_skill_exp', skillId: 'strategy', exp: 10 }
                ]
            }
        ]
    },

    // ========== 晋升城主事件 ==========
    {
        eventId: 'E_PROMOTION_CASTLE_LORD',
        type: EventTypes.MAIN,
        name: '受封城主',
        description: '功勋足够，受封城主，获得城池',
        trigger: {
            time: null,
            identity: ['zhihui'],
            faction: 1,
            flagsRequired: ['E_CAPTURE_YINGTIAN_DONE'],
            flagsForbidden: ['E_PROMOTION_CASTLE_LORD_DONE'],
            probability: 1.0
        },
        scenes: [
            {
                sceneId: 1,
                text: '你累计功勋已经超过一万二千，吴王朱元璋在应天开殿，召你觐见。\n\n"元璋（注：此处玩家为其他角色），你跟随我多年，战功赫赫，勤勉能干。如今太平府缺少城主，我就命你为太平知府，兼管军事，去吧。"',
                choices: [
                    {
                        text: '臣，谢主隆恩！',
                        effects: [
                            { type: 'set_flag', value: 'E_PROMOTION_CASTLE_LORD_DONE' },
                            { type: 'add_card', cardId: 'TITLE_CASTLE_LORD' },
                            { type: 'add_merit', value: 500 }
                        ],
                        nextScene: 2
                    }
                ]
            },
            {
                sceneId: 2,
                text: '你接过印信，从此成为一城之主。\n\n你可以开府建衙，征收赋税，向家臣发布主命，真正开始独当一面了。',
                effects: []
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

    // ========== 分支剧情：反叛自立 ==========
    {
        eventId: 'E_BRANCH_REBEL_INDEPENDENCE',
        type: EventTypes.BRANCH,
        name: '佣兵自立',
        description: '与主公关系不和，举兵反叛自立门户',
        trigger: {
            time: { year: 1356, month: 3, day: 1, operator: '>=' },
            location: null,
            identity: ['qianhu', 'zhihuiqianshi', 'zhihuitongzhi', 'zhihui'],
            faction: 1,
            intimacy: { characterId: 1, maxLevel: 1 },
            flagsRequired: ['E_CAPTURE_YINGTIAN_DONE'],
            flagsForbidden: ['BECAME_INDEPENDENT', 'E_BRANCH_REBEL_INDEPENDENCE_DONE'],
            probability: 0.5
        },
        scenes: [
            {
                sceneId: 1,
                text: '你驻守边城，手握兵权，主公对你愈发猜忌。诸将也对粮草分配不满，不少人暗中和你联络。\n\n帐中夜谈，徐达对你道："大帅功高震主，不如就此举兵，自取天下！"',
                choices: [
                    {
                        text: '举兵反叛，自立门户',
                        effects: [
                            { type: 'set_flag', value: 'BECAME_INDEPENDENT' },
                            { type: 'set_flag', value: 'E_BRANCH_REBEL_INDEPENDENCE_DONE' },
                            { type: 'change_faction', value: 'player' },
                            { type: 'change_role', value: 'zhihui' },
                            { type: 'add_merit', value: 1000 },
                            { type: 'add_card', cardId: 'TITLE_INDEPENDENT' },
                            { type: 'add_intimacy', target: 1, value: -50 },
                            { type: 'advance_time', value: 10 }
                        ],
                        nextScene: 2
                    },
                    {
                        text: '继续忠于主公，不可二心',
                        effects: [
                            { type: 'set_flag', value: 'E_BRANCH_REBEL_INDEPENDENCE_DONE' },
                            { type: 'add_intimacy', target: 1, value: 10 },
                            { type: 'advance_time', value: 1 }
                        ],
                        nextScene: null
                    }
                ]
            },
            {
                sceneId: 2,
                text: '你斩了主公使者，宣布自立旗帜，建国号"大明"，自称元帅。\n\n从今往后，你就是自己的主公，可以开府建衙，任命官员，向家臣发布主命，逐鹿天下。',
                effects: []
            }
        ]
    },

    // ========== 分支剧情：落草为寇 ==========
    {
        eventId: 'E_BRANCH_BECOME_ROBBER',
        type: EventTypes.BRANCH,
        name: '落草为寇',
        description: '得罪官军，走投无路，上山落草',
        trigger: {
            time: null,
            location: null,
            identity: ['soldier', 'xiaoqi', 'zongqi'],
            flagsRequired: [],
            flagsForbidden: ['E_BRANCH_BECOME_ROBBER_DONE'],
            probability: 0.1
        },
        scenes: [
            {
                sceneId: 1,
                text: '你战败负伤，被官军追杀，走投无路，逃入大山绿林。\n\n山大王率众下山围住你，笑道："朋友看你也是一条好汉，不如就此留下，大块吃肉，大秤分金，岂不快活？"',
                choices: [
                    {
                        text: '入伙落草，劫富济贫',
                        effects: [
                            { type: 'set_flag', value: 'E_BRANCH_BECOME_ROBBER_DONE' },
                            { type: 'set_flag', value: 'BECAME_ROBBER' },
                            { type: 'change_faction', value: 'bandit' },
                            { type: 'change_role', value: 'xiaoqi' },
                            { type: 'add_card', cardId: 'TITLE_ROAD_KING' },
                            { type: 'add_money', value: 500 },
                            { type: 'advance_time', value: 5 }
                        ],
                        nextScene: 2
                    },
                    {
                        text: '不愿落草，下山投降',
                        effects: [
                            { type: 'set_flag', value: 'E_BRANCH_BECOME_ROBBER_DONE' },
                            { type: 'sub_money', value: 100 },
                            { type: 'advance_time', value: 5 }
                        ],
                        nextScene: null
                    }
                ]
            },
            {
                sceneId: 2,
                text: '你从此落草梁山，做了山大王。\n\n你的势力就是山寨，主命就是劫富济贫，积攒钱粮，招揽好汉，等待时机下山争雄。',
                effects: []
            }
        ]
    },

    // ========== 分支剧情：投奔陈友谅 ==========
    {
        eventId: 'E_BRANCH_JOIN_CHENYOUliang',
        type: EventTypes.BRANCH,
        name: '投奔陈友谅',
        description: '离开朱元璋，投奔汉王陈友谅',
        trigger: {
            time: { year: 1356, month: 1, day: 1, operator: '>=' },
            location: [2, 3, 4],
            identity: ['baihu', 'qianhu', 'zhihuiqianshi'],
            faction: 1,
            flagsRequired: ['E_CAPTURE_YINGTIAN_DONE'],
            flagsForbidden: ['E_BRANCH_JOIN_CHENYOUliang_DONE'],
            probability: 0.3
        },
        scenes: [
            {
                sceneId: 1,
                text: '你出使九江，陈友谅屏退左右，密对你说：\n\n"朱元璋不过一牧牛儿，岂能成大事？吾今有江西之地，带甲数十万，子玉肯来，吾得子玉，江东不足定也！\n\n"公鼎的位置，我给你留着。"',
                choices: [
                    {
                        text: '愿意归顺汉王',
                        effects: [
                            { type: 'set_flag', value: 'E_BRANCH_JOIN_CHENyouliang_DONE' },
                            { type: 'change_faction', value: 3 },
                            { type: 'add_intimacy', target: 4, value: 20 },
                            { type: 'add_merit', value: 200 },
                            { type: 'advance_time', value: 10 }
                        ],
                        nextScene: 2
                    },
                    {
                        text: '坚贞不二，辞谢不受',
                        effects: [
                            { type: 'set_flag', value: 'E_BRANCH_JOIN_CHENYOUliang_DONE' },
                            { type: 'add_intimacy', target: 1, value: 5 },
                            { type: 'advance_time', value: 10 }
                        ],
                        nextScene: null
                    }
                ]
            },
            {
                sceneId: 2,
                text: '你改换门庭，投奔陈友谅，封为枢密院佥事。\n\n汉王对你颇为器重，依然可以接取主命，积累功勋，徐图大业。',
                effects: []
            }
        ]
    },

    // ========== 分支剧情：投奔张士诚 ==========
    {
        eventId: 'E_BRANCH_JOIN_ZHANGshicheng',
        type: EventTypes.BRANCH,
        name: '投奔张士诚',
        description: '离开朱元璋，投奔吴王张士诚',
        trigger: {
            time: { year: 1356, month: 1, day: 1, operator: '>=' },
            location: [5, 6, 7],
            identity: ['baihu', 'qianhu', 'zhihuiqianshi'],
            faction: 1,
            flagsRequired: ['E_CAPTURE_YINGTIAN_DONE'],
            flagsForbidden: ['E_BRANCH_JOIN_ZHANGshicheng_DONE'],
            probability: 0.3
        },
        scenes: [
            {
                sceneId: 1,
                text: '你出使平江，张士诚盛情款待，席间对你说：\n\n"朱重八久困江北，江南之地，我已经有了三吴之地，富可敌国。子玉英雄，何不共取富贵？\n\n"江苏平章之位，虚位以待。"',
                choices: [
                    {
                        text: '愿意归顺吴王',
                        effects: [
                            { type: 'set_flag', value: 'E_BRANCH_JOIN_ZHANGshicheng_DONE' },
                            { type: 'change_faction', value: 4 },
                            { type: 'add_intimacy', target: 5, value: 20 },
                            { type: 'add_merit', value: 200 },
                            { type: 'advance_time', value: 10 }
                        ],
                        nextScene: 2
                    },
                    {
                        text: '不敢背义，辞谢不受',
                        effects: [
                            { type: 'set_flag', value: 'E_BRANCH_JOIN_ZHANGshicheng_DONE' },
                            { type: 'add_intimacy', target: 1, value: 5 },
                            { type: 'advance_time', value: 10 }
                        ],
                        nextScene: null
                    }
                ]
            },
            {
                sceneId: 2,
                text: '你来到平江，做了张士诚的平章政事。\n\n吴王富庶，你依然可以接取主命，建功立业。',
                effects: []
            }
        ]
    },

    // ========== 分支剧情：投降元廷 ==========
    {
        eventId: 'E_BRANCH_JOIN_YUAN',
        type: EventTypes.BRANCH,
        name: '招安降元',
        description: '接受元廷招安，成为朝廷命官',
        trigger: {
            time: { year: 1355, month: 1, day: 1, operator: '>=' },
            location: null,
            identity: ['baihu', 'qianhu'],
            faction: 1,
            flagsRequired: [],
            flagsForbidden: ['E_BRANCH_JOIN_YUAN_DONE'],
            probability: 0.2
        },
        scenes: [
            {
                sceneId: 1,
                text: '元廷遣使招安，承诺只要你归顺，便封你为江东廉访使，万户侯。\n\n使者道："将军何苦舍命从贼？不如归顺朝廷，博得个封妻荫子，岂不为美？"',
                choices: [
                    {
                        text: '接受招安，归顺朝廷',
                        effects: [
                            { type: 'set_flag', value: 'E_BRANCH_JOIN_YUAN_DONE' },
                            { type: 'change_faction', value: 5 },
                            { type: 'change_role', value: 'baihu' },
                            { type: 'add_merit', value: 300 },
                            { type: 'add_money', value: 1000 },
                            { type: 'add_intimacy', target: 1, value: -30 },
                            { type: 'advance_time', value: 7 }
                        ],
                        nextScene: 2
                    },
                    {
                        text: '拒绝招安，坚持反元',
                        effects: [
                            { type: 'set_flag', value: 'E_BRANCH_JOIN_YUAN_DONE' },
                            { type: 'advance_time', value: 1 }
                        ],
                        nextScene: null
                    }
                ]
            },
            {
                sceneId: 2,
                text: '你换了元廷官服，接过了江东廉访使的印信。\n\n从此你就是大元朝廷命官，继续在这乱世中打拼。',
                effects: []
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