/**
 * skills - 卡片数据
 */

const CARDS_SKILLS = [
    // 步战
    {
        card_id: "SKILL_INFANTRY_1",
        name: "步战·一级",
        type: CardTypes.SKILL,
        rarity: 1,
        description: "解锁基础阵型。",
        acquire_hint: "步战技能升级到一级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "👟",
        image: "images/cards/skills/buzhan.png"
    },
    {
        card_id: "SKILL_INFANTRY_2",
        name: "步战·二级",
        type: CardTypes.SKILL,
        rarity: 2,
        description: "解锁高级阵型。",
        acquire_hint: "步战技能升级到二级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "👟",
        image: "images/cards/skills/buzhan.png"
    },
    {
        card_id: "SKILL_INFANTRY_3",
        name: "步战·三级",
        type: CardTypes.SKILL,
        rarity: 3,
        description: "解锁顶级阵型。",
        acquire_hint: "步战技能升级到三级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "👟",
        image: "images/cards/skills/buzhan.png"
    },
    // 骑战
    {
        card_id: "SKILL_CAVALRY_1",
        name: "骑战·一级",
        type: CardTypes.SKILL,
        rarity: 1,
        description: "统领骑兵，追击奔袭。",
        acquire_hint: "骑战技能升级到一级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🐎",
        image: "images/cards/skills/qizhan.png"
    },
    {
        card_id: "SKILL_CAVALRY_2",
        name: "骑战·二级",
        type: CardTypes.SKILL,
        rarity: 2,
        description: "提升骑兵部队属性。",
        acquire_hint: "骑战技能升级到二级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🐎",
        image: "images/cards/skills/qizhan.png"
    },
    {
        card_id: "SKILL_CAVALRY_3",
        name: "骑战·三级",
        type: CardTypes.SKILL,
        rarity: 3,
        description: "顶级骑兵指挥能力。",
        acquire_hint: "骑战技能升级到三级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🐎",
        image: "images/cards/skills/qizhan.png"
    },
    // 水战
    {
        card_id: "SKILL_NAVY_1",
        name: "水战·一级",
        type: CardTypes.SKILL,
        rarity: 1,
        description: "基础水军指挥。",
        acquire_hint: "水战技能升级到一级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🚢",
        image: "images/cards/skills/shuizhan.png"
    },
    {
        card_id: "SKILL_NAVY_2",
        name: "水战·二级",
        type: CardTypes.SKILL,
        rarity: 2,
        description: "解锁高阶水战战术。",
        acquire_hint: "水战技能升级到二级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🚢",
        image: "images/cards/skills/shuizhan.png"
    },
    {
        card_id: "SKILL_NAVY_3",
        name: "水战·三级",
        type: CardTypes.SKILL,
        rarity: 3,
        description: "鄱阳湖决战决胜能力。",
        acquire_hint: "水战技能升级到三级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🚢",
        image: "images/cards/skills/shuizhan.png"
    },
    // 火器
    {
        card_id: "SKILL_FIREARM_1",
        name: "火器·一级",
        type: CardTypes.SKILL,
        rarity: 1,
        description: "基础火铳火炮使用。",
        acquire_hint: "火器技能升级到一级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "💥",
        image: "images/cards/skills/huoqi.png"
    },
    {
        card_id: "SKILL_FIREARM_2",
        name: "火器·二级",
        type: CardTypes.SKILL,
        rarity: 2,
        description: "提升火器部队伤害。",
        acquire_hint: "火器技能升级到二级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "💥",
        image: "images/cards/skills/huoqi.png"
    },
    {
        card_id: "SKILL_FIREARM_3",
        name: "火器·三级",
        type: CardTypes.SKILL,
        rarity: 3,
        description: "明朝后期核心军事技能。",
        acquire_hint: "火器技能升级到三级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "💥",
        image: "images/cards/skills/huoqi.png"
    },
    // 兵法
    {
        card_id: "SKILL_STRATEGY_1",
        name: "兵法·一级",
        type: CardTypes.SKILL,
        rarity: 1,
        description: "增加秘策使用次数。",
        acquire_hint: "兵法技能升级到一级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "📜",
        image: "images/cards/skills/bingfa.png"
    },
    {
        card_id: "SKILL_STRATEGY_2",
        name: "兵法·二级",
        type: CardTypes.SKILL,
        rarity: 2,
        description: "增加更多秘策使用次数。",
        acquire_hint: "兵法技能升级到二级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "📜",
        image: "images/cards/skills/bingfa.png"
    },
    {
        card_id: "SKILL_STRATEGY_3",
        name: "兵法·三级",
        type: CardTypes.SKILL,
        rarity: 3,
        description: "排兵布阵，料敌先机。",
        acquire_hint: "兵法技能升级到三级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "📜",
        image: "images/cards/skills/bingfa.png"
    },
    // 武艺
    {
        card_id: "SKILL_MARTIAL_1",
        name: "武艺·一级",
        type: CardTypes.SKILL,
        rarity: 1,
        description: "增加个人战手牌上限。",
        acquire_hint: "武艺技能升级到一级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🥊",
        image: "images/cards/skills/wuyi.png"
    },
    {
        card_id: "SKILL_MARTIAL_2",
        name: "武艺·二级",
        type: CardTypes.SKILL,
        rarity: 2,
        description: "提升个人战战斗能力。",
        acquire_hint: "武艺技能升级到二级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🥊",
        image: "images/cards/skills/wuyi.png"
    },
    {
        card_id: "SKILL_MARTIAL_3",
        name: "武艺·三级",
        type: CardTypes.SKILL,
        rarity: 3,
        description: "个人战顶级格斗能力。",
        acquire_hint: "武艺技能升级到三级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🥊",
        image: "images/cards/skills/wuyi.png"
    },
    // 医术
    {
        card_id: "SKILL_MEDICINE_1",
        name: "医术·一级",
        type: CardTypes.SKILL,
        rarity: 1,
        description: "基础疗伤能力。",
        acquire_hint: "医术技能升级到一级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "💊",
        image: "images/cards/skills/yishu.png"
    },
    {
        card_id: "SKILL_MEDICINE_2",
        name: "医术·二级",
        type: CardTypes.SKILL,
        rarity: 2,
        description: "提升战后恢复效果。",
        acquire_hint: "医术技能升级到二级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "💊",
        image: "images/cards/skills/yishu.png"
    },
    {
        card_id: "SKILL_MEDICINE_3",
        name: "医术·三级",
        type: CardTypes.SKILL,
        rarity: 3,
        description: "妙手回春，保命神医。",
        acquire_hint: "医术技能升级到三级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "💊",
        image: "images/cards/skills/yishu.png"
    },
    // 密探
    {
        card_id: "SKILL_SPY_1",
        name: "密探·一级",
        type: CardTypes.SKILL,
        rarity: 1,
        description: "基础潜入刺探。",
        acquire_hint: "密探技能升级到一级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🕵️",
        image: "images/cards/skills/mitan.png"
    },
    {
        card_id: "SKILL_SPY_2",
        name: "密探·二级",
        type: CardTypes.SKILL,
        rarity: 2,
        description: "获取更多敌军情报。",
        acquire_hint: "密探技能升级到二级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🕵️",
        image: "images/cards/skills/mitan.png"
    },
    {
        card_id: "SKILL_SPY_3",
        name: "密探·三级",
        type: CardTypes.SKILL,
        rarity: 3,
        description: "顶级间谍渗透能力。",
        acquire_hint: "密探技能升级到三级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🕵️",
        image: "images/cards/skills/mitan.png"
    },
    // 农政
    {
        card_id: "SKILL_AGRICULTURE_1",
        name: "农政·一级",
        type: CardTypes.SKILL,
        rarity: 1,
        description: "提升农田收入。",
        acquire_hint: "农政技能升级到一级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🌾",
        image: "images/cards/skills/nongzheng.png"
    },
    {
        card_id: "SKILL_AGRICULTURE_2",
        name: "农政·二级",
        type: CardTypes.SKILL,
        rarity: 2,
        description: "增加屯田产出。",
        acquire_hint: "农政技能升级到二级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🌾",
        image: "images/cards/skills/nongzheng.png"
    },
    {
        card_id: "SKILL_AGRICULTURE_3",
        name: "农政·三级",
        type: CardTypes.SKILL,
        rarity: 3,
        description: "五谷丰登，国泰民安。",
        acquire_hint: "农政技能升级到三级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🌾",
        image: "images/cards/skills/nongzheng.png"
    },
    // 工政
    {
        card_id: "SKILL_ENGINEERING_1",
        name: "工政·一级",
        type: CardTypes.SKILL,
        rarity: 1,
        description: "基础城池建设。",
        acquire_hint: "工政技能升级到一级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🏗️",
        image: "images/cards/skills/gongzheng.png"
    },
    {
        card_id: "SKILL_ENGINEERING_2",
        name: "工政·二级",
        type: CardTypes.SKILL,
        rarity: 2,
        description: "提升城防耐久度。",
        acquire_hint: "工政技能升级到二级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🏗️",
        image: "images/cards/skills/gongzheng.png"
    },
    {
        card_id: "SKILL_ENGINEERING_3",
        name: "工政·三级",
        type: CardTypes.SKILL,
        rarity: 3,
        description: "营建巨型城池。",
        acquire_hint: "工政技能升级到三级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🏗️",
        image: "images/cards/skills/gongzheng.png"
    },
    // 商政
    {
        card_id: "SKILL_TRADE_1",
        name: "商政·一级",
        type: CardTypes.SKILL,
        rarity: 1,
        description: "基础贸易通商。",
        acquire_hint: "商政技能升级到一级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "💰",
        image: "images/cards/skills/shangzheng.png"
    },
    {
        card_id: "SKILL_TRADE_2",
        name: "商政·二级",
        type: CardTypes.SKILL,
        rarity: 2,
        description: "增加商路收益。",
        acquire_hint: "商政技能升级到二级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "💰",
        image: "images/cards/skills/shangzheng.png"
    },
    {
        card_id: "SKILL_TRADE_3",
        name: "商政·三级",
        type: CardTypes.SKILL,
        rarity: 3,
        description: "富甲天下，垄断商路。",
        acquire_hint: "商政技能升级到三级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "💰",
        image: "images/cards/skills/shangzheng.png"
    },
    // 律政
    {
        card_id: "SKILL_LAW_1",
        name: "律政·一级",
        type: CardTypes.SKILL,
        rarity: 1,
        description: "基础律法断案。",
        acquire_hint: "律政技能升级到一级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "⚖️",
        image: "images/cards/skills/lvzheng.png"
    },
    {
        card_id: "SKILL_LAW_2",
        name: "律政·二级",
        type: CardTypes.SKILL,
        rarity: 2,
        description: "提升民心稳定。",
        acquire_hint: "律政技能升级到二级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "⚖️",
        image: "images/cards/skills/lvzheng.png"
    },
    {
        card_id: "SKILL_LAW_3",
        name: "律政·三级",
        type: CardTypes.SKILL,
        rarity: 3,
        description: "依法治国，稳定朝纲。",
        acquire_hint: "律政技能升级到三级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "⚖️",
        image: "images/cards/skills/lvzheng.png"
    },
    // 口才
    {
        card_id: "SKILL_ELOQUENCE_1",
        name: "口才·一级",
        type: CardTypes.SKILL,
        rarity: 1,
        description: "基础游说辩论。",
        acquire_hint: "口才技能升级到一级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🗣️",
        image: "images/cards/skills/koucai.png"
    },
    {
        card_id: "SKILL_ELOQUENCE_2",
        name: "口才·二级",
        type: CardTypes.SKILL,
        rarity: 2,
        description: "提升劝诱成功率。",
        acquire_hint: "口才技能升级到二级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🗣️",
        image: "images/cards/skills/koucai.png"
    },
    {
        card_id: "SKILL_ELOQUENCE_3",
        name: "口才·三级",
        type: CardTypes.SKILL,
        rarity: 3,
        description: "三寸不烂之舌，强于百万之师。",
        acquire_hint: "口才技能升级到三级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🗣️",
        image: "images/cards/skills/koucai.png"
    },
    // 礼制
    {
        card_id: "SKILL_RITUAL_1",
        name: "礼制·一级",
        type: CardTypes.SKILL,
        rarity: 1,
        description: "基础朝仪礼法。",
        acquire_hint: "礼制技能升级到一级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🏛️",
        image: "images/cards/skills/lizhi.png"
    },
    {
        card_id: "SKILL_RITUAL_2",
        name: "礼制·二级",
        type: CardTypes.SKILL,
        rarity: 2,
        description: "提升朝廷声望。",
        acquire_hint: "礼制技能升级到二级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🏛️",
        image: "images/cards/skills/lizhi.png"
    },
    {
        card_id: "SKILL_RITUAL_3",
        name: "礼制·三级",
        type: CardTypes.SKILL,
        rarity: 3,
        description: "万邦来朝，礼仪之邦。",
        acquire_hint: "礼制技能升级到三级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🏛️",
        image: "images/cards/skills/lizhi.png"
    },
    // 航海
    {
        card_id: "SKILL_NAVIGATION_1",
        name: "航海·一级",
        type: CardTypes.SKILL,
        rarity: 1,
        description: "基础远洋航行。",
        acquire_hint: "航海技能升级到一级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🧭",
        image: "images/cards/skills/hanghai.png"
    },
    {
        card_id: "SKILL_NAVIGATION_2",
        name: "航海·二级",
        type: CardTypes.SKILL,
        rarity: 2,
        description: "远洋贸易加成。",
        acquire_hint: "航海技能升级到二级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🧭",
        image: "images/cards/skills/hanghai.png"
    },
    {
        card_id: "SKILL_NAVIGATION_3",
        name: "航海·三级",
        type: CardTypes.SKILL,
        rarity: 3,
        description: "郑和下西洋，开创航海时代。",
        acquire_hint: "航海技能升级到三级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🧭",
        image: "images/cards/skills/hanghai.png"
    },
    // 文墨
    {
        card_id: "SKILL_CALLIGRAPHY_1",
        name: "文墨·一级",
        type: CardTypes.SKILL,
        rarity: 1,
        description: "基础文书书法。",
        acquire_hint: "文墨技能升级到一级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "✍️",
        image: "images/cards/skills/wenmo.png"
    },
    {
        card_id: "SKILL_CALLIGRAPHY_2",
        name: "文墨·二级",
        type: CardTypes.SKILL,
        rarity: 2,
        description: "提升文化产出。",
        acquire_hint: "文墨技能升级到二级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "✍️",
        image: "images/cards/skills/wenmo.png"
    },
    {
        card_id: "SKILL_CALLIGRAPHY_3",
        name: "文墨·三级",
        type: CardTypes.SKILL,
        rarity: 3,
        description: "笔墨丹青，流传千古。",
        acquire_hint: "文墨技能升级到三级自动获得。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "✍️",
        image: "images/cards/skills/wenmo.png"
    },

];
