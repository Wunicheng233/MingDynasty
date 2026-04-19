/**
 * 主命模板库 - 静态数据
 * Mission template library (static data)
 * 按照核心数据层设计：所有主命的参数定义，评定会从中选择生成任务
 */

/**
 * 主命模板属性接口
 * @typedef {Object} MissionTemplate
 * @property {string} mission_id - 任务ID
 * @property {number} id - 数字ID
 * @property {string} name - 任务名称
 * @property {string} category - 类别: 军务/政务/外交/调略/特殊
 * @property {string} minRank - 最低身份要求 (role id)
 * @property {string[]} requiredSkills - 关联技能ID列表
 * @property {number} baseDifficulty - 基础难度 1-5
 * @property {number} baseReward - 基础功勋奖励
 * @property {number} timeLimitDays - 限时天数
 * @property {string} completionType - 完成类型: minigame/battle/personal/combined
 * @property {string} gameType - 对应小游戏类型
 * @property {string} targetParam - 目标参数
 * @property {string} description - 任务描述
 */

/**
 * 所有主命模板
 * 按照策划分类：军务/政务/外交/调略/特殊
 * @type {MissionTemplate[]}
 */
const MISSION_TEMPLATES = [
    // ========== 军务类 ==========
    {
        mission_id: "M_RECRUIT",
        id: 1,
        name: "征兵",
        category: "军务",
        minRank: "zongqi",
        requiredSkills: ["eloquence", "strategy"],
        baseDifficulty: 2,
        baseReward: 80,
        timeLimitDays: 20,
        completionType: "external",
        gameType: "eloquence",
        targetParam: "recruit_amount",
        description: "前往城镇说服百姓参军，口才好就能招募更多士兵。"
    },
    {
        mission_id: "M_TRAIN",
        id: 2,
        name: "训练新兵",
        category: "军务",
        minRank: "zongqi",
        requiredSkills: ["infantry"],
        baseDifficulty: 2,
        baseReward: 70,
        timeLimitDays: 15,
        completionType: "external",
        gameType: "infantry",
        targetParam: "training_score",
        description: "前往校场进行步兵操练，考核你对步兵战术的掌握。"
    },
    {
        mission_id: "M_BUY_MATERIAL",
        id: 3,
        name: "物资采买",
        category: "军务",
        minRank: "soldier",
        requiredSkills: ["trade", "eloquence"],
        baseDifficulty: 1,
        baseReward: 50,
        timeLimitDays: 30,
        completionType: "external",
        gameType: "trade",
        targetParam: "purchase_complete",
        description: "采购军事物资（米/马/火器），本金不足需要自行垫付，低价买入完成任务。"
    },
    {
        mission_id: "M_SCOUT",
        id: 4,
        name: "侦查敌城",
        category: "军务",
        minRank: "baihu",
        requiredSkills: ["spy"],
        baseDifficulty: 3,
        baseReward: 120,
        timeLimitDays: 25,
        completionType: "external",
        gameType: "spy",
        targetParam: "scout_complete",
        description: "潜入敌城收集情报，成功侦查获得敌城布防信息。"
    },
    {
        mission_id: "M_CAMPAIGN",
        id: 5,
        name: "出征攻城",
        category: "军务",
        minRank: "qianhu",
        requiredSkills: ["leadership", "strategy"],
        baseDifficulty: 4,
        baseReward: 500,
        timeLimitDays: 60,
        completionType: "external",
        gameType: "none",
        targetParam: "capture_city",
        description: "率军出征攻打敌方城池，击败敌军占领城池。"
    },
    {
        mission_id: "M_NAVY_TRAIN",
        id: 6,
        name: "水军操练",
        category: "军务",
        minRank: "qianhu",
        requiredSkills: ["navy"],
        baseDifficulty: 3,
        baseReward: 100,
        timeLimitDays: 20,
        completionType: "external",
        gameType: "navy",
        targetParam: "navy_training",
        description: "前往水寨进行水军训练，指挥战船躲避暗礁完成操练。"
    },

    // ========== 政务类 ==========
    {
        mission_id: "G_TAX",
        id: 7,
        name: "征收赋税",
        category: "政务",
        minRank: "baihu",
        requiredSkills: ["trade", "eloquence"],
        baseDifficulty: 2,
        baseReward: 80,
        timeLimitDays: 20,
        completionType: "external",
        gameType: "trade",
        description: "前往城镇征收赋税，与商户农民交涉，完成征收指标。"
    },
    {
        mission_id: "G_RECLAMATION",
        id: 8,
        name: "开垦新田",
        category: "政务",
        minRank: "qianhu",
        requiredSkills: ["agriculture"],
        baseDifficulty: 2,
        baseReward: 90,
        timeLimitDays: 30,
        completionType: "external",
        gameType: "agriculture",
        description: "开垦荒地增加粮食产量，分配资源完成开垦指标。"
    },
    {
        mission_id: "G_REPAIR_WALL",
        id: 9,
        name: "修葺城墙",
        category: "政务",
        minRank: "qianhu",
        requiredSkills: ["engineering"],
        baseDifficulty: 2,
        baseReward: 100,
        timeLimitDays: 25,
        completionType: "external",
        gameType: "engineering",
        description: "加固城池城墙，调配石料达到目标重量。"
    },
    {
        mission_id: "G_TRIAL",
        id: 10,
        name: "审理案件",
        category: "政务",
        minRank: "zhihuiqianshi",
        requiredSkills: ["law", "intelligence"],
        baseDifficulty: 3,
        baseReward: 120,
        timeLimitDays: 15,
        completionType: "external",
        gameType: "law",
        description: "审理民间案件，找出证词矛盾，依据《大明律》做出判决。"
    },
    {
        mission_id: "G_FLOOD_CONTROL",
        id: 11,
        name: "兴修水利",
        category: "政务",
        minRank: "zhihuitongzhi",
        requiredSkills: ["engineering"],
        baseDifficulty: 3,
        baseReward: 150,
        timeLimitDays: 40,
        completionType: "external",
        gameType: "engineering",
        description: "修建水利工程，便利农田灌溉，减少水患。"
    },
    {
        mission_id: "G_FAMINE_RELIEF",
        id: 12,
        name: "赈济灾民",
        category: "政务",
        minRank: "zhihui",
        requiredSkills: ["charm", "eloquence"],
        baseDifficulty: 2,
        baseReward: 130,
        timeLimitDays: 20,
        completionType: "external",
        gameType: "none",
        targetParam: "relief_complete",
        description: "灾荒后赈济灾民，调配粮食安抚民心。"
    },

    // ========== 外交类 ==========
    {
        mission_id: "D_ENVOY",
        id: 13,
        name: "出使友邦",
        category: "外交",
        minRank: "qianhu",
        requiredSkills: ["ritual", "eloquence"],
        baseDifficulty: 2,
        baseReward: 100,
        timeLimitDays: 30,
        completionType: "external",
        gameType: "ritual",
        description: "出使友好势力，完成外交礼节递交国书。"
    },
    {
        mission_id: "D_ALLIANCE",
        id: 14,
        name: "缔结同盟",
        category: "外交",
        minRank: "zhihuiqianshi",
        requiredSkills: ["ritual", "eloquence"],
        baseDifficulty: 3,
        baseReward: 150,
        timeLimitDays: 45,
        completionType: "external",
        gameType: "none",
        targetParam: "alliance_agree",
        description: "游说对方势力缔结盟约，共同对抗第三方。"
    },
    {
        mission_id: "D_SURRENDER",
        id: 15,
        name: "劝降敌将",
        category: "外交",
        minRank: "zhihui",
        requiredSkills: ["eloquence", "charm"],
        baseDifficulty: 4,
        baseReward: 180,
        timeLimitDays: 30,
        completionType: "external",
        gameType: "none",
        targetParam: "persuasion_success",
        description: "劝降敌方守城将领，使其开城投降。"
    },
    {
        mission_id: "D_TRIBUTE",
        id: 16,
        name: "进贡朝廷",
        category: "外交",
        minRank: "dudujianshi",
        requiredSkills: ["ritual", "eloquence"],
        baseDifficulty: 2,
        baseReward: 200,
        timeLimitDays: 50,
        completionType: "external",
        gameType: "none",
        targetParam: "tribute_complete",
        description: "向元廷/朝廷进贡，保持表面和平，换取发展时间。"
    },

    // ========== 调略类 ==========
    {
        mission_id: "C_RECRUIT_TALENT",
        id: 17,
        name: "人才探访",
        category: "调略",
        minRank: "soldier",
        requiredSkills: [],
        baseDifficulty: 1,
        baseReward: 30,
        timeLimitDays: 20,
        completionType: "external",
        gameType: "explore",
        description: "在各城镇探访隐居人才，招入麾下。"
    },
    {
        mission_id: "C_SABOTAGE",
        id: 18,
        name: "破坏敌城",
        category: "调略",
        minRank: "baihu",
        requiredSkills: ["spy"],
        baseDifficulty: 3,
        baseReward: 80,
        timeLimitDays: 15,
        completionType: "external",
        gameType: "none",
        targetParam: "sabotage_complete",
        description: "潜入敌城破坏城防，降低防御度。"
    },
    {
        mission_id: "C_RUMOR",
        id: 19,
        name: "流言离间",
        category: "调略",
        minRank: "qianhu",
        requiredSkills: ["spy", "eloquence"],
        baseDifficulty: 3,
        baseReward: 90,
        timeLimitDays: 20,
        completionType: "external",
        gameType: "none",
        targetParam: "rumor_spread",
        description: "散布流言离间敌方君臣关系，降低敌人士气。"
    },
    {
        mission_id: "C_BURN_FOOD",
        id: 20,
        name: "放火烧粮",
        category: "调略",
        minRank: "qianhu",
        requiredSkills: ["spy"],
        baseDifficulty: 4,
        baseReward: 120,
        timeLimitDays: 15,
        completionType: "external",
        gameType: "none",
        targetParam: "fire_complete",
        description: "潜入纵火焚烧敌军粮草，削弱敌方持续作战能力。"
    },

    // ========== 特殊类 ==========
    {
        mission_id: "S_ARREST",
        id: 21,
        name: "缉拿要犯",
        category: "特殊",
        minRank: "baihu",
        requiredSkills: ["martial", "spy"],
        baseDifficulty: 3,
        baseReward: 100,
        timeLimitDays: 20,
        completionType: "external",
        gameType: "duel",
        description: "缉拿朝廷通缉的要犯，击败擒获归案。"
    },
    {
        mission_id: "S_ESCORT_FOOD",
        id: 22,
        name: "护送粮草",
        category: "特殊",
        minRank: "xiaoqi",
        requiredSkills: ["leadership"],
        baseDifficulty: 2,
        baseReward: 70,
        timeLimitDays: 25,
        completionType: "external",
        gameType: "none",
        targetParam: "escort_complete",
        description: "护送粮草前往前线，路上可能遭遇山贼拦截。"
    },
    {
        mission_id: "S_HEAL_TROOPS",
        id: 23,
        name: "医治伤兵",
        category: "特殊",
        minRank: "zhihuiqianshi",
        requiredSkills: ["medicine"],
        baseDifficulty: 2,
        baseReward: 90,
        timeLimitDays: 15,
        completionType: "external",
        gameType: "medicine",
        description: "战后医治伤兵，按药方抓药治疗伤员。"
    },
    {
        mission_id: "S_BUILD_MAUSOLEUM",
        id: 24,
        name: "督建皇陵",
        category: "特殊",
        minRank: "dutongzhi",
        requiredSkills: ["engineering", "charm"],
        baseDifficulty: 4,
        baseReward: 200,
        timeLimitDays: 60,
        completionType: "external",
        gameType: "none",
        targetParam: "construction_complete",
        description: "督建凤阳皇陵，监管工程进度质量。"
    },

    // ========== 君主阶段 - 内政类 ==========
    {
        mission_id: "R_RAISE_FUNDS",
        id: 25,
        name: "筹措军资金",
        category: "内政",
        minRank: "zhihui",
        requiredSkills: ["trade", "eloquence"],
        baseDifficulty: 2,
        baseReward: 100,
        timeLimitDays: 30,
        completionType: "external",
        gameType: "trade",
        targetParam: "funds_raised",
        description: "向城中富商筹措军资金，充实国库。"
    },
    {
        mission_id: "R_BUY_GRAIN",
        id: 26,
        name: "收购兵粮",
        category: "内政",
        minRank: "baihu",
        requiredSkills: ["trade", "eloquence"],
        baseDifficulty: 1,
        baseReward: 60,
        timeLimitDays: 25,
        completionType: "external",
        gameType: "trade",
        targetParam: "grain_bought",
        description: "从各地收购粮草储备，以备军需。"
    },
    {
        mission_id: "R_SELL_GRAIN",
        id: 27,
        name: "兵粮卖却",
        category: "内政",
        minRank: "baihu",
        requiredSkills: ["trade", "eloquence"],
        baseDifficulty: 1,
        baseReward: 50,
        timeLimitDays: 20,
        completionType: "external",
        gameType: "trade",
        targetParam: "grain_sold",
        description: "高价出售囤积兵粮，换取军资金。"
    },
    {
        mission_id: "R_DEVELOP_FARM",
        id: 28,
        name: "开发新田",
        category: "内政",
        minRank: "qianhu",
        requiredSkills: ["agriculture"],
        baseDifficulty: 2,
        baseReward: 120,
        timeLimitDays: 40,
        completionType: "external",
        gameType: "agriculture",
        targetParam: "acres_developed",
        description: "开垦荒地扩大农田面积，增加粮食产量。"
    },
    {
        mission_id: "R_DEVELOP_MINE",
        id: 29,
        name: "开发矿山",
        category: "内政",
        minRank: "qianhu",
        requiredSkills: ["engineering"],
        baseDifficulty: 3,
        baseReward: 130,
        timeLimitDays: 35,
        completionType: "external",
        gameType: "engineering",
        targetParam: "mine_developed",
        description: "勘探并开发矿山，获取铁矿银矿等资源。"
    },
    {
        mission_id: "R_REPAIR_CASTLE",
        id: 30,
        name: "修补城墙",
        category: "内政",
        minRank: "baihu",
        requiredSkills: ["engineering"],
        baseDifficulty: 2,
        baseReward: 80,
        timeLimitDays: 30,
        completionType: "external",
        gameType: "engineering",
        targetParam: "repair_complete",
        description: "修补加固城墙，提升城防度。"
    },
    {
        mission_id: "R_IMPERIAL_EXAM",
        id: 31,
        name: "开科取士",
        category: "国策",
        minRank: "dudujianshi",
        requiredSkills: ["intelligence", "law"],
        baseDifficulty: 3,
        baseReward: 300,
        timeLimitDays: 60,
        completionType: "external",
        gameType: "dialog",
        targetParam: "exam_complete",
        description: "举办科举考试，选拔天下人才入朝为官。（明朝独有）"
    },
    {
        mission_id: "R_MILITARY_EXAM",
        id: 32,
        name: "武举选将",
        category: "国策",
        minRank: "dudujianshi",
        requiredSkills: ["martial", "strategy"],
        baseDifficulty: 3,
        baseReward: 280,
        timeLimitDays: 45,
        completionType: "external",
        gameType: "duel",
        targetParam: "exam_complete",
        description: "举办武举考试，选拔勇武将才。（明朝独有）"
    },

    // ========== 君主阶段 - 军备类 ==========
    {
        mission_id: "MASS_RECRUIT",
        id: 33,
        name: "大规模征兵",
        category: "军备",
        minRank: "zhihuiqianshi",
        requiredSkills: ["eloquence", "leadership"],
        baseDifficulty: 2,
        baseReward: 150,
        timeLimitDays: 30,
        completionType: "external",
        gameType: "eloquence",
        targetParam: "recruited_total",
        description: "在全国范围内征召士兵，扩充军队。"
    },
    {
        mission_id: "MASS_TRAIN",
        id: 34,
        name: "全军训练",
        category: "军备",
        minRank: "zhihuiqianshi",
        requiredSkills: ["infantry", "leadership"],
        baseDifficulty: 2,
        baseReward: 130,
        timeLimitDays: 25,
        completionType: "external",
        gameType: "infantry",
        targetParam: "training_score",
        description: "组织大规模军事训练，提升全军战斗力。"
    },
    {
        mission_id: "BUY_HORSES",
        id: 35,
        name: "购入军马",
        category: "军备",
        minRank: "qianhu",
        requiredSkills: ["trade", "eloquence"],
        baseDifficulty: 2,
        baseReward: 100,
        timeLimitDays: 40,
        completionType: "external",
        gameType: "trade",
        targetParam: "horses_bought",
        description: "从草原购买优良战马，组建骑兵部队。"
    },
    {
        mission_id: "BUY_FIREARMS",
        id: 36,
        name: "购置火器",
        category: "军备",
        minRank: "zhihuiqianshi",
        requiredSkills: ["engineering", "trade"],
        baseDifficulty: 3,
        baseReward: 160,
        timeLimitDays: 50,
        completionType: "external",
        gameType: "firearm",
        targetParam: "firearms_bought",
        description: "铸造购买火铳火炮，装备神机营。"
    },

    // ========== 君主阶段 - 调略类 ==========
    {
        mission_id: "TALENT_SCOUT",
        id: 37,
        name: "人才调查",
        category: "调略",
        minRank: "xiaoqi",
        requiredSkills: ["eloquence"],
        baseDifficulty: 1,
        baseReward: 40,
        timeLimitDays: 30,
        completionType: "external",
        gameType: "explore",
        targetParam: "talent_found",
        description: "在各地寻访隐居人才，记录其能力位置。"
    },
    {
        mission_id: "CITY_INVESTIGATE",
        id: 38,
        name: "城池侦查",
        category: "调略",
        minRank: "baihu",
        requiredSkills: ["spy"],
        baseDifficulty: 2,
        baseReward: 80,
        timeLimitDays: 25,
        completionType: "external",
        gameType: "spy",
        targetParam: "info_gathered",
        description: "潜入敌城收集城池布防、粮草等情报。"
    },
    {
        mission_id: "POACH_TALENT",
        id: 39,
        name: "劝诱浪人",
        category: "调略",
        minRank: "baihu",
        requiredSkills: ["eloquence", "charm"],
        baseDifficulty: 2,
        baseReward: 70,
        timeLimitDays: 30,
        completionType: "external",
        gameType: "eloquence",
        targetParam: "persuasion_success",
        description: "招揽在野浪人加入我方势力。"
    },
    {
        mission_id: "SABOTAGE_ENEMY",
        id: 40,
        name: "破坏敌城",
        category: "调略",
        minRank: "qianhu",
        requiredSkills: ["spy"],
        baseDifficulty: 4,
        baseReward: 140,
        timeLimitDays: 20,
        completionType: "external",
        gameType: "spy",
        targetParam: "sabotage_done",
        description: "潜入敌城破坏城墙设施，降低防御。"
    },
    {
        mission_id: "SPREAD_RUMOR",
        id: 41,
        name: "散布流言",
        category: "调略",
        minRank: "qianhu",
        requiredSkills: ["spy", "eloquence"],
        baseDifficulty: 3,
        baseReward: 100,
        timeLimitDays: 15,
        completionType: "external",
        gameType: "none",
        targetParam: "rumor_done",
        description: "在敌城散布流言，离间敌方君臣关系。"
    },

    // ========== 君主阶段 - 外交类 ==========
    {
        mission_id: "FACTION_ALLIANCE",
        id: 42,
        name: "缔结同盟",
        category: "外交",
        minRank: "zhihui",
        requiredSkills: ["ritual", "eloquence"],
        baseDifficulty: 3,
        baseReward: 200,
        timeLimitDays: 50,
        completionType: "external",
        gameType: "ritual",
        targetParam: "alliance_success",
        description: "与其他势力缔结盟约，共同对抗强敌。"
    },
    {
        mission_id: "FACTION_BREAK",
        id: 43,
        name: "废除同盟",
        category: "外交",
        minRank: "zhihui",
        requiredSkills: ["ritual", "intelligence"],
        baseDifficulty: 2,
        baseReward: 50,
        timeLimitDays: 10,
        completionType: "external",
        gameType: "none",
        targetParam: "break_complete",
        description: "宣布与同盟势力断绝盟约关系。"
    },
    {
        mission_id: "PAY_TRIBUTE",
        id: 44,
        name: "朝廷贡奉",
        category: "外交",
        minRank: "zhihuiqianshi",
        requiredSkills: ["ritual", "eloquence"],
        baseDifficulty: 2,
        baseReward: 150,
        timeLimitDays: 40,
        completionType: "external",
        gameType: "none",
        targetParam: "tribute_complete",
        description: "向朝廷进贡宝物，换取暂时和平。"
    },
    {
        mission_id: "DECLARE_WAR",
        id: 45,
        name: "宣战",
        category: "外交",
        minRank: "zhihui",
        requiredSkills: ["leadership", "strategy"],
        baseDifficulty: 5,
        baseReward: 300,
        timeLimitDays: 15,
        completionType: "external",
        gameType: "battle",
        targetParam: "war_declared",
        description: "正式向敌国宣战，发起全面战争。"
    },
    {
        mission_id: "PEACE_NEGOTIATION",
        id: 46,
        name: "遣使议和",
        category: "外交",
        minRank: "zhihui",
        requiredSkills: ["ritual", "eloquence"],
        baseDifficulty: 3,
        baseReward: 250,
        timeLimitDays: 30,
        completionType: "external",
        gameType: "ritual",
        targetParam: "peace_agreed",
        description: "派遣使者与敌方谈判，达成和平协议。"
    },

    // ========== 特色任务：明朝特有 ==========
    {
        mission_id: "SALT_LAW_MIDDLE",
        id: 47,
        name: "开中法盐引",
        category: "特殊",
        minRank: "xiaoqi",
        requiredSkills: ["trade", "agriculture"],
        baseDifficulty: 3,
        baseReward: 180,
        timeLimitDays: 60,
        completionType: "external",
        gameType: "trade",
        targetParam: "salt_voucher_complete",
        description: "向边关运送军粮换取盐引，贩卖食盐获利。（开中法，明朝独有）"
    },
    {
        mission_id: "S_WEBSITE_SURVEILLANCE",
        id: 48,
        name: "侦缉官员",
        category: "特殊",
        minRank: "zhihui",
        requiredSkills: ["spy", "law"],
        baseDifficulty: 4,
        baseReward: 200,
        timeLimitDays: 30,
        completionType: "external",
        gameType: "spy",
        targetParam: "surveillance_complete",
        description: "锦衣卫密探任务，监视不忠官员，收集罪证。（厂卫特色）"
    },
    {
        mission_id: "S_KAOCHENG_ASSESS",
        id: 49,
        name: "考成考核",
        category: "国策",
        minRank: "dudujianshi",
        requiredSkills: ["law", "intelligence"],
        baseDifficulty: 3,
        baseReward: 250,
        timeLimitDays: 45,
        completionType: "external",
        gameType: "none",
        targetParam: "assessment_complete",
        description: "考核地方官员政绩，罢黜无能，晋升贤能。（张居正考成法）"
    }
];

/**
 * 根据ID获取主命模板
 * @param {number} id
 * @returns {MissionTemplate|undefined}
 */
export function getMissionTemplateById(id) {
    return MISSION_TEMPLATES.find(m => m.id === id);
}

/**
 * 根据missionId获取主命模板
 * @param {string} missionId
 * @returns {MissionTemplate|undefined}
 */
export function getMissionTemplateByMissionId(missionId) {
    return MISSION_TEMPLATES.find(m => m.mission_id === missionId);
}

/**
 * 获取所有主命模板
 * @returns {MissionTemplate[]}
 */
export function getAllMissionTemplates() {
    return MISSION_TEMPLATES;
}

/**
 * 根据玩家当前身份获取可接任务
 * @param {string} currentRoleId
 * @returns {MissionTemplate[]}
 */
export function getAvailableMissionsForRole(currentRoleId) {
    const roleOrder = ROLES.find(r => r.id === currentRoleId)?.order || 0;
    return MISSION_TEMPLATES.filter(m => {
        const minRank = ROLES.find(r => r.id === m.minRank);
        if (!minRank) return true; // 没有最低限制
        return roleOrder >= minRank.order;
    });
}

/**
 * 按分类获取任务
 * @param {string} category
 * @returns {MissionTemplate[]}
 */
export function getMissionsByCategory(category) {
    return MISSION_TEMPLATES.filter(m => m.category === category);
}

// 保留全局暴露用于兼容性调试
window.getMissionTemplateById = getMissionTemplateById;
window.getMissionTemplateByMissionId = getMissionTemplateByMissionId;
window.getAllMissionTemplates = getAllMissionTemplates;
window.getAvailableMissionsForRole = getAvailableMissionsForRole;
window.getMissionsByCategory = getMissionsByCategory;
