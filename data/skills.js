/**
 * 技能定义库 - 静态数据
 * Skill definition library (static data)
 * 按照核心数据层设计：定义16项技能及等级效果
 */

/**
 * 技能属性接口
 * @typedef {Object} Skill
 * @property {string} id - 技能ID
 * @property {string} name - 技能名称
 * @property {string} category - 分类: 统率类|个人类|内政类|特殊类
 * @property {string} description - 技能描述
 * @property {number} maxLevel - 最大等级 1-3
 * @property {number} expPerLevel - 每级需要的经验
 * @property {string} minigame - 对应小游戏名称
 * @property {Object} levelEffects - 各等级解锁效果 {level: {unlock_formations: string[], secret_strategy_count: number}}
 */

/**
 * 所有技能定义 - 16项技能，完全按照策划设计
 * @type {Skill[]}
 */
const SKILLS = [
    // ========== 统率类 ==========
    {
        id: "infantry",
        name: "步战",
        category: "统率",
        description: "统领步兵、攻城拔寨的能力",
        maxLevel: 3,
        expPerLevel: 100,
        minigame: "步军演武",
        levelEffects: {
            1: { unlock_formations: ["鱼鳞", "伏兵"], secret_strategy_count: 1 },
            2: { unlock_formations: ["方圆", "十面埋伏"], secret_strategy_count: 2 },
            3: { unlock_formations: ["衡轭", "追击"], secret_strategy_count: 3 }
        }
    },
    {
        id: "cavalry",
        name: "骑战",
        category: "统率",
        description: "统领骑兵、追击奔袭的能力",
        maxLevel: 3,
        expPerLevel: 100,
        minigame: "赛马争先",
        levelEffects: {
            1: { unlock_formations: ["长蛇"], secret_strategy_count: 1 },
            2: { unlock_formations: ["锋矢"], secret_strategy_count: 2 },
            3: { unlock_formations: [], secret_strategy_count: 3 }
        }
    },
    {
        id: "navy",
        name: "水战",
        category: "统率",
        description: "水军指挥，鄱阳湖决战的决胜技能",
        maxLevel: 3,
        expPerLevel: 100,
        minigame: "楼船破浪",
        levelEffects: {
            1: { unlock_tactics: ["神速"], secret_strategy_count: 1 },
            2: { unlock_tactics: ["夹击", "焙烙"], secret_strategy_count: 2 },
            3: { unlock_tactics: ["楼船冲撞", "火船突击"], secret_strategy_count: 3 }
        }
    },
    {
        id: "firearm",
        name: "火器",
        category: "统率",
        description: "使用火铳火炮，明朝后期核心技能",
        maxLevel: 3,
        expPerLevel: 100,
        minigame: "神机校射",
        levelEffects: {
            1: { unlock_tactics: ["早合"], secret_strategy_count: 1 },
            2: { unlock_tactics: ["三段击"], secret_strategy_count: 2 },
            3: { unlock_tactics: ["钓瓶击", "鸳鸯阵"], secret_strategy_count: 3 }
        }
    },
    {
        id: "strategy",
        name: "兵法",
        category: "统率",
        description: "军学谋略，排兵布阵",
        maxLevel: 3,
        expPerLevel: 100,
        minigame: "排兵布阵",
        levelEffects: {
            1: { unlock_formations: ["雁行"], secret_strategy_count: 2 },
            2: { unlock_formations: ["鹤翼"], secret_strategy_count: 3 },
            3: { unlock_formations: ["偃月"], secret_strategy_count: 4 }
        }
    },

    // ========== 个人类 ==========
    {
        id: "martial",
        name: "武艺",
        category: "个人",
        description: "个人武勇，单挑战决定胜负",
        maxLevel: 3,
        expPerLevel: 100,
        minigame: "武馆切磋", // 直接使用个人战系统
        levelEffects: {
            1: { extra_handcards: 1 },
            2: { extra_handcards: 2 },
            3: { extra_handcards: 3 }
        }
    },
    {
        id: "medicine",
        name: "医术",
        category: "个人",
        description: "治疗伤病，可获'神医'称号",
        maxLevel: 3,
        expPerLevel: 100,
        minigame: "本草配方",
        levelEffects: {
            1: { heal_amount: 20 },
            2: { heal_amount: 35 },
            3: { heal_amount: 50 }
        }
    },
    {
        id: "spy",
        name: "密探",
        category: "个人",
        description: "潜入情报收集，锦衣卫特色能力",
        maxLevel: 3,
        expPerLevel: 100,
        minigame: "潜龙谍影",
        levelEffects: {
            1: { success_chance: 0.6 },
            2: { success_chance: 0.75 },
            3: { success_chance: 0.9 }
        }
    },

    // ========== 内政类 ==========
    {
        id: "agriculture",
        name: "农政",
        category: "内政",
        description: "开垦屯田，劝课农桑",
        maxLevel: 3,
        expPerLevel: 100,
        minigame: "劝课农桑",
        levelEffects: {
            1: { bonus_yield: 0.1 },
            2: { bonus_yield: 0.2 },
            3: { bonus_yield: 0.3 }
        }
    },
    {
        id: "engineering",
        name: "工政",
        category: "内政",
        description: "工程建设，筑城治水",
        maxLevel: 3,
        expPerLevel: 100,
        minigame: "筑城考工",
        levelEffects: {
            1: { unlock_tactics: ["火攻"], precision_bonus: 0 },
            2: { unlock_tactics: ["落石"], precision_bonus: 10 },
            3: { unlock_tactics: ["水攻"], precision_bonus: 20 }
        }
    },
    {
        id: "trade",
        name: "商政",
        category: "内政",
        description: "商业贸易，盐引经营",
        maxLevel: 3,
        expPerLevel: 100,
        minigame: "珠算商贾",
        levelEffects: {
            1: { price_info: true },
            2: { salt_quote_bonus: 0.1 },
            3: { unlock_tactics: ["断粮围城"], salt_quote_bonus: 0.2 }
        }
    },
    {
        id: "law",
        name: "律政",
        category: "内政",
        description: "法律断案，大明律实践",
        maxLevel: 3,
        expPerLevel: 100,
        minigame: "明律断案",
        levelEffects: {
            1: { difficulty_penalty: 0 },
            2: { difficulty_penalty: -1 },
            3: { difficulty_penalty: -2 }
        }
    },

    // ========== 特殊类 ==========
    {
        id: "eloquence",
        name: "口才",
        category: "特殊",
        description: "辩舌游说，外交交涉",
        maxLevel: 3,
        expPerLevel: 100,
        minigame: "游说纵横",
        levelEffects: {
            1: { unlock_tactics: ["骂阵"], starting_mood: 0 },
            2: { unlock_tactics: ["招降"], starting_mood: 20 },
            3: { unlock_tactics: ["求和"], starting_mood: 40 }
        }
    },
    {
        id: "ritual",
        name: "礼制",
        category: "特殊",
        description: "礼仪法度，朝仪外交",
        maxLevel: 3,
        expPerLevel: 100,
        minigame: "朝仪习礼",
        levelEffects: {
            1: { memory_steps: 4 },
            2: { memory_steps: 5 },
            3: { memory_steps: 6 }
        }
    },
    {
        id: "navigation",
        name: "航海",
        category: "特殊",
        description: "远洋航海，郑和下西洋",
        maxLevel: 3,
        expPerLevel: 100,
        minigame: "罗盘导航",
        levelEffects: {
            1: { error_margin: 15 },
            2: { error_margin: 10 },
            3: { error_margin: 5 }
        }
    },
    {
        id: "calligraphy",
        name: "文墨",
        category: "特殊",
        description: "文书书法，文官基本能力",
        maxLevel: 3,
        expPerLevel: 100,
        minigame: "文墨填空",
        levelEffects: {
            1: { bonus_charm: 1 },
            2: { bonus_charm: 2 },
            3: { bonus_charm: 3 }
        }
    }
];

/**
 * 根据ID获取技能
 * @param {string} id
 * @returns {Skill|undefined}
 */
window.getSkillById = function getSkillById(id) {
    return SKILLS.find(s => s.id === id);
};

/**
 * 获取所有技能
 * @returns {Skill[]}
 */
window.getAllSkills = function getAllSkills() {
    return SKILLS;
};

/**
 * 按分类获取技能
 * @param {string} category
 * @returns {Skill[]}
 */
window.getSkillsByCategory = function getSkillsByCategory(category) {
    return SKILLS.filter(s => s.category === category);
};

/**
 * 获取技能总数量
 * @returns {number}
 */
window.getTotalSkillCount = function getTotalSkillCount() {
    return SKILLS.length;
};
