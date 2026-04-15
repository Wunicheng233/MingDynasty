/**
 * branch - 事件数据
 */

const EVENTS_BRANCH = [
    // 支线事件示例
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
