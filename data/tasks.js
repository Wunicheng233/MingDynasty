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
        completionType: "minigame",
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
        completionType: "minigame",
        gameType: "infantry",
        targetParam: "training_score",
        description: "前往校场进行步兵操练，考核你对步兵战术的掌握。"
    },
    {
        mission_id: "M_BUY_MATERIAL",
        id: 3,
        name: "物资采买",
        category: "军务",
        minRank: "xiaoqi",
        requiredSkills: ["trade", "eloquence"],
        baseDifficulty: 1,
        baseReward: 50,
        timeLimitDays: 30,
        completionType: "minigame",
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
        completionType: "minigame",
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
        completionType: "battle",
        gameType: "battle",
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
        completionType: "minigame",
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
        completionType: "minigame",
        gameType: "trade",
        targetParam: "tax_amount",
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
        completionType: "minigame",
        gameType: "agriculture",
        targetParam: "reclaim_acres",
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
        completionType: "minigame",
        gameType: "engineering",
        targetParam: "wall_repair",
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
        completionType: "minigame",
        gameType: "law",
        targetParam: "correct_verdict",
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
        completionType: "minigame",
        gameType: "engineering",
        targetParam: "canal_complete",
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
        completionType: "dialog",
        gameType: "dialog",
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
        completionType: "minigame",
        gameType: "ritual",
        targetParam: "mission_complete",
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
        completionType: "minigame",
        gameType: "eloquence",
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
        completionType: "minigame",
        gameType: "eloquence",
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
        completionType: "complete",
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
        minRank: "xiaoqi",
        requiredSkills: [],
        baseDifficulty: 1,
        baseReward: 30,
        timeLimitDays: 20,
        completionType: "explore",
        gameType: "explore",
        targetParam: "find_talent",
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
        completionType: "minigame",
        gameType: "spy",
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
        completionType: "complete",
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
        completionType: "minigame",
        gameType: "spy",
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
        completionType: "personal",
        gameType: "duel",
        targetParam: "arrest_success",
        description: "缉拿朝廷通缉的要犯，击败擒获归案。"
    },
    {
        mission_id: "S_ESCORT_FOOD",
        id: 22,
        name: "护送粮草",
        category: "特殊",
        minRank: "zongqi",
        requiredSkills: ["leadership"],
        baseDifficulty: 2,
        baseReward: 70,
        timeLimitDays: 25,
        completionType: "personal",
        gameType: "duel",
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
        completionType: "minigame",
        gameType: "medicine",
        targetParam: "heal_complete",
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
        completionType: "minigame",
        gameType: "engineering",
        targetParam: "construction_complete",
        description: "督建凤阳皇陵，监管工程进度质量。"
    }
];

/**
 * 根据ID获取主命模板
 * @param {number} id
 * @returns {MissionTemplate|undefined}
 */
window.getMissionTemplateById = function getMissionTemplateById(id) {
    return MISSION_TEMPLATES.find(m => m.id === id);
};

/**
 * 根据missionId获取主命模板
 * @param {string} missionId
 * @returns {MissionTemplate|undefined}
 */
window.getMissionTemplateByMissionId = function getMissionTemplateByMissionId(missionId) {
    return MISSION_TEMPLATES.find(m => m.mission_id === missionId);
};

/**
 * 获取所有主命模板
 * @returns {MissionTemplate[]}
 */
window.getAllMissionTemplates = function getAllMissionTemplates() {
    return MISSION_TEMPLATES;
};

/**
 * 根据玩家当前身份获取可接任务
 * @param {string} currentRoleId
 * @returns {MissionTemplate[]}
 */
window.getAvailableMissionsForRole = function getAvailableMissionsForRole(currentRoleId) {
    const roleOrder = ROLES.find(r => r.id === currentRoleId)?.order || 0;
    return MISSION_TEMPLATES.filter(m => {
        const minRank = ROLES.find(r => r.id === m.minRank);
        if (!minRank) return true; // 没有最低限制
        return roleOrder >= minRank.order;
    });
};

/**
 * 按分类获取任务
 * @param {string} category
 * @returns {MissionTemplate[]}
 */
window.getMissionsByCategory = function getMissionsByCategory(category) {
    return MISSION_TEMPLATES.filter(m => m.category === category);
};
