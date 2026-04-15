// 人物模板按势力拆分 - 平民百姓（各种职业NPC）
// 类型定义在主文件 characters.js 中，此处仅存放数据
/* global */

const CHARACTERS_CIVILIANS = [
    {
        templateId: "FARMER_ADANIU",
        id: 26,
        name: "阿牛",
        emoji: "🌾",
        image: "images/characters/npc/common-farmer.png",
        portrait: "common-farmer",
        color: "#8b7355",
        baseStats: {
            leadership: 20,
            strength: 45,
            politics: 25,
            intelligence: 30,
            charm: 40
        },
        initialSkills: {
            agriculture: 2
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "平和",
        faction: "平民",
        initialRank: "佃农",
        birthDeath: null,
        description: "濠州城外种田的佃农，老实本分，种得一手好庄稼。",
        locationCityId: 1
    },
    {
        templateId: "FARMER_ERNIU",
        id: 27,
        name: "二牛",
        emoji: "🌾",
        image: "images/characters/npc/common-farmer.png",
        portrait: "common-farmer",
        color: "#8b7355",
        baseStats: {
            leadership: 25,
            strength: 50,
            politics: 20,
            intelligence: 25,
            charm: 35
        },
        initialSkills: {
            agriculture: 1,
            martial: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "豪爽",
        faction: "平民",
        initialRank: "自耕农",
        birthDeath: null,
        description: "阿牛的弟弟，年轻力壮，闲时喜欢练两把拳脚。",
        locationCityId: 1
    },
    {
        templateId: "FISHER_A-GOU",
        id: 28,
        name: "阿狗",
        emoji: "🎣",
        image: "images/characters/npc/common-fisher.png",
        portrait: "common-fisher",
        color: "#4a6fa5",
        baseStats: {
            leadership: 18,
            strength: 42,
            politics: 15,
            intelligence: 35,
            charm: 30
        },
        initialSkills: {
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "机灵",
        faction: "平民",
        initialRank: "渔民",
        birthDeath: null,
        description: "淮河上打鱼的渔民，熟悉水情，走船稳当。",
        locationCityId: 1
    },
    {
        templateId: "CARPENTER_TIEZHU",
        id: 29,
        name: "铁柱",
        emoji: "🪓",
        image: "images/characters/npc/common-carpenter.png",
        portrait: "common-carpenter",
        color: "#8b4513",
        baseStats: {
            leadership: 22,
            strength: 55,
            politics: 18,
            intelligence: 40,
            charm: 38
        },
        initialSkills: {
            engineering: 2
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "朴实",
        faction: "平民",
        initialRank: "木匠",
        birthDeath: null,
        description: "濠州城里木匠，手艺好，桌椅板凳农具都能做。",
        locationCityId: 1
    },
    {
        templateId: "BUTCHER_DAKOU",
        id: 30,
        name: "大口",
        emoji: "🔪",
        image: "images/characters/npc/common-butcher.png",
        portrait: "common-butcher",
        color: "#c0392b",
        baseStats: {
            leadership: 28,
            strength: 65,
            politics: 20,
            intelligence: 32,
            charm: 42
        },
        initialSkills: {
            trade: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "豪爽",
        faction: "平民",
        initialRank: "屠夫",
        birthDeath: null,
        description: "濠州猪肉摊子掌柜，力气大，刀子快。",
        locationCityId: 1
    },
    {
        templateId: "BOATMAN_AJIN",
        id: 31,
        name: "阿金",
        emoji: "🚣",
        image: "images/characters/npc/common-boatman.png",
        portrait: "common-boatman",
        color: "#27ae60",
        baseStats: {
            leadership: 20,
            strength: 48,
            politics: 15,
            intelligence: 38,
            charm: 35
        },
        initialSkills: {
            navy: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "谨慎",
        faction: "平民",
        initialRank: "船工",
        birthDeath: null,
        description: "淮河渡口撑船的艄公，往来两岸接送客人。",
        locationCityId: 1
    },
    {
        templateId: "Peddler_LAOLI",
        id: 32,
        name: "老李",
        emoji: "🧺",
        image: "images/characters/npc/common-peddler.png",
        portrait: "common-peddler",
        color: "#f39c12",
        baseStats: {
            leadership: 25,
            strength: 35,
            politics: 30,
            intelligence: 45,
            charm: 50
        },
        initialSkills: {
            trade: 2,
            eloquence: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "圆滑",
        faction: "平民",
        initialRank: "货郎",
        birthDeath: null,
        description: "走街串巷卖杂货，什么小东西都有，嘴甜会说话。",
        locationCityId: 1
    },
    {
        templateId: "TAILOR_GUIYING",
        id: 33,
        name: "桂英",
        emoji: "🧵",
        image: "images/characters/npc/common-tailor.png",
        portrait: "common-tailor",
        color: "#8e44ad",
        baseStats: {
            leadership: 15,
            strength: 25,
            politics: 20,
            intelligence: 45,
            charm: 45
        },
        initialSkills: {
            trade: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "细心",
        faction: "平民",
        initialRank: "裁缝",
        birthDeath: null,
        description: "濠州城里裁缝，量体裁衣，针脚细密。",
        locationCityId: 1
    },
    {
        templateId: "WATCHMAN_WANG_LAOHAN",
        id: 34,
        name: "王老汉",
        emoji: "🥁",
        image: "images/characters/npc/common-watchman.png",
        portrait: "common-watchman",
        color: "#7f8c8d",
        baseStats: {
            leadership: 20,
            strength: 30,
            politics: 25,
            intelligence: 40,
            charm: 35
        },
        initialSkills: {
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "负责",
        faction: "平民",
        initialRank: "更夫",
        birthDeath: null,
        description: "濠州城打更匠，一夜五次锣，平安无事就是功劳。",
        locationCityId: 1
    },
    {
        templateId: "MILKER_XINGHUA",
        id: 35,
        name: "杏花",
        emoji: "🐄",
        image: "images/characters/npc/common-farmer-w.png",
        portrait: "common-farmer-w",
        color: "#f1c40f",
        baseStats: {
            leadership: 12,
            strength: 28,
            politics: 22,
            intelligence: 35,
            charm: 42
        },
        initialSkills: {
            agriculture: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "温柔",
        faction: "平民",
        initialRank: "奶农",
        birthDeath: null,
        description: "城郊养奶牛的村姑，每天送新鲜牛奶进城。",
        locationCityId: 1
    },
    {
        templateId: "Bakery_WU_DA",
        id: 36,
        name: "吴大",
        emoji: "🍞",
        image: "images/characters/npc/common-baker.png",
        portrait: "common-baker",
        color: "#d35400",
        baseStats: {
            leadership: 22,
            strength: 42,
            politics: 20,
            intelligence: 35,
            charm: 40
        },
        initialSkills: {
            trade: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "憨厚",
        faction: "平民",
        initialRank: " baker",
        birthDeath: null,
        description: "濠州城烧饼师傅，烤的烧饼金黄酥脆，香飘一条街。",
        locationCityId: 1
    },
    {
        templateId: "Wine_zhang_lao",
        id: 37,
        name: "张老头",
        emoji: "🍶",
        image: "images/characters/npc/common-wine.png",
        portrait: "common-wine",
        color: "#8e44ad",
        baseStats: {
            leadership: 25,
            strength: 35,
            politics: 30,
            intelligence: 40,
            charm: 55
        },
        initialSkills: {
            trade: 2
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "好客",
        faction: "平民",
        initialRank: "酒家",
        birthDeath: null,
        description: "濠州城西开酒馆，自酿米酒，客人来了都招呼。",
        locationCityId: 1
    },
    {
        templateId: "Doctor_chen",
        id: 38,
        name: "陈大夫",
        emoji: "💊",
        image: "images/characters/npc/common-doctor.png",
        portrait: "common-doctor",
        color: "#27ae60",
        baseStats: {
            leadership: 28,
            strength: 25,
            politics: 35,
            intelligence: 60,
            charm: 50
        },
        initialSkills: {
            medicine: 2
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "仁心",
        faction: "平民",
        initialRank: "郎中",
        birthDeath: null,
        description: "应天府城里祖传郎中，望闻问切，治病救人。",
        locationCityId: 2
    },
    {
        templateId: "Teacher_Zhou",
        id: 39,
        name: "周先生",
        emoji: "📖",
        image: "images/characters/npc/common-teacher.png",
        portrait: "common-teacher",
        color: "#3498db",
        baseStats: {
            leadership: 30,
            strength: 20,
            politics: 40,
            intelligence: 70,
            charm: 55
        },
        initialSkills: {
            calligraphy: 2,
            ritual: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "儒雅",
        faction: "平民",
        initialRank: "私塾先生",
        birthDeath: null,
        description: "应天府城里私塾教书先生，识文断字，教小孩子读书。",
        locationCityId: 2
    },
    {
        templateId: "Guard_XIAOWU",
        id: 40,
        name: "小武",
        emoji: "🪖",
        image: "images/characters/npc/common-guard.png",
        portrait: "common-guard",
        color: "#2c3e50",
        baseStats: {
            leadership: 35,
            strength: 60,
            politics: 20,
            intelligence: 30,
            charm: 35
        },
        initialSkills: {
            infantry: 1,
            martial: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "勇猛",
        faction: "平民",
        initialRank: "城门卫兵",
        birthDeath: null,
        description: "濠州城门守卫，当兵吃粮，检查进出。",
        locationCityId: 1
    },
    {
        templateId: "Beggar_laoliu",
        id: 41,
        name: "老刘头",
        emoji: "🥣",
        image: "images/characters/npc/common-beggar.png",
        portrait: "common-beggar",
        color: "#7f8c8d",
        baseStats: {
            leadership: 15,
            strength: 30,
            politics: 20,
            intelligence: 50,
            charm: 25
        },
        initialSkills: {
            spy: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "逍遥",
        faction: "平民",
        initialRank: "乞丐",
        birthDeath: null,
        description: "应天街头乞丐，走街串巷，消息灵通。",
        locationCityId: 2
    },
    {
        templateId: "Shepherd_guai",
        id: 42,
        name: "拐子",
        emoji: "🐑",
        image: "images/characters/npc/common-shepherd.png",
        portrait: "common-shepherd",
        color: "#aed6af",
        baseStats: {
            leadership: 10,
            strength: 35,
            politics: 10,
            intelligence: 30,
            charm: 28
        },
        initialSkills: {
            agriculture: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "孤独",
        faction: "平民",
        initialRank: "羊倌",
        birthDeath: null,
        description: "洛阳邙山山坡放羊，早出晚归。",
        locationCityId: 4
    },
    {
        templateId: "Miner_Gouzi",
        id: 43,
        name: "狗子",
        emoji: "⛏️",
        image: "images/characters/npc/common-miner.png",
        portrait: "common-miner",
        color: "#5d4037",
        baseStats: {
            leadership: 22,
            strength: 58,
            politics: 15,
            intelligence: 28,
            charm: 30
        },
        initialSkills: {
            engineering: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "耿直",
        faction: "平民",
        initialRank: "矿工",
        birthDeath: null,
        description: "大同煤矿挖煤，一身黑，力气大。",
        locationCityId: 7
    },
    {
        templateId: "Pottery_San",
        id: 44,
        name: "阿三",
        emoji: "🏺",
        image: "images/characters/npc/common-potter.png",
        portrait: "common-potter",
        color: "#d35400",
        baseStats: {
            leadership: 18,
            strength: 45,
            politics: 20,
            intelligence: 38,
            charm: 32
        },
        initialSkills: {
            trade: 1,
            engineering: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "耐心",
        faction: "平民",
        initialRank: "陶匠",
        birthDeath: null,
        description: "景德镇陶窑烧陶罐瓷器，手艺祖传。",
        locationCityId: 8
    },
    {
        templateId: "Cotton_meiying",
        id: 45,
        name: "美英",
        emoji: "🧶",
        image: "images/characters/npc/common-weaver.png",
        portrait: "common-weaver",
        color: "#9b59b6",
        baseStats: {
            leadership: 10,
            strength: 25,
            politics: 18,
            intelligence: 40,
            charm: 45
        },
        initialSkills: {
            trade: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "勤劳",
        faction: "平民",
        initialRank: "织女",
        birthDeath: null,
        description: "松江织布纺线，织出来的布细密平整。",
        locationCityId: 9
    },
    {
        templateId: "Tavern_wang",
        id: 46,
        name: "王掌柜",
        emoji: "🍶",
        image: "images/characters/npc/common-tavern.png",
        portrait: "common-tavern",
        color: "#8e44ad",
        baseStats: {
            leadership: 40,
            strength: 35,
            politics: 50,
            intelligence: 55,
            charm: 65
        },
        initialSkills: {
            trade: 2,
            charm: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "圆滑",
        faction: "平民",
        initialRank: "酒馆掌柜",
        birthDeath: null,
        description: "洛阳城好酒菜馆掌柜，三教九流都能结交，消息灵通。",
        locationCityId: 4
    },
    {
        templateId: "Leather_lao",
        id: 47,
        name: "老皮",
        emoji: "👢",
        image: "images/characters/npc/common-leather.png",
        portrait: "common-leather",
        color: "#795548",
        baseStats: {
            leadership: 15,
            strength: 48,
            politics: 18,
            intelligence: 35,
            charm: 28
        },
        initialSkills: {
            trade: 2,
            engineering: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "踏实",
        faction: "平民",
        initialRank: "皮匠",
        birthDeath: null,
        description: "大同边城皮匠，熟皮子做靴鞋，给过往商客修补马具。",
        locationCityId: 7
    },
    {
        templateId: "Kiln_master_chen",
        id: 48,
        name: "陈窑主",
        emoji: "🔥",
        image: "images/characters/npc/common-kiln.png",
        portrait: "common-kiln",
        color: "#e65100",
        baseStats: {
            leadership: 50,
            strength: 40,
            politics: 35,
            intelligence: 52,
            charm: 48
        },
        initialSkills: {
            trade: 2,
            engineering: 2
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "精明",
        faction: "平民",
        initialRank: "窑主",
        birthDeath: null,
        description: "景德镇瓷窑主人，经营瓷窑多年，烧制的青花瓷远销海外。",
        locationCityId: 8
    },
    {
        templateId: "Boat_captain_he",
        id: 49,
        name: "何老大",
        emoji: "🚢",
        image: "images/characters/npc/common-boat.png",
        portrait: "common-boat",
        color: "#283593",
        baseStats: {
            leadership: 55,
            strength: 60,
            politics: 25,
            intelligence: 42,
            charm: 40
        },
        initialSkills: {
            trade: 1
        },
        initialCards: [],
        exclusiveSecretCard: null,
        personality: "豪爽",
        faction: "平民",
        initialRank: "船老大",
        birthDeath: null,
        description: "松江水运船老大，跑运河往返南北，见过不少世面。",
        locationCityId: 9
    }
];
