/**
 * events - 卡片数据
 */

const CARDS_EVENTS = [
    {
        card_id: "EVENT_JOIN_RED",
        name: "投身红巾",
        type: CardTypes.EVENT,
        rarity: 3,
        description: "元至正十二年，朱元璋投身郭子兴红巾军，命运的齿轮开始转动。",
        acquire_hint: "第一章开局触发。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "⚡"
    },
    {
        card_id: "EVENT_POYANG",
        name: "鄱阳湖之战",
        type: CardTypes.EVENT,
        rarity: 5,
        description: "1363年，朱元璋与陈友谅在鄱阳湖展开决战，以火攻大破陈军。",
        acquire_hint: "完成鄱阳湖之战剧情。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🔥"
    },
    {
        card_id: "EVENT_FOUND_MING",
        name: "建立大明",
        type: CardTypes.EVENT,
        rarity: 5,
        description: "1368年正月初四，朱元璋称帝应天，国号大明。",
        acquire_hint: "主线剧情完成称帝。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "👑"
    },
    {
        card_id: "EVENT_HAOZHOU_JUYI",
        name: "濠州聚义",
        type: CardTypes.EVENT,
        rarity: 3,
        description: "元至正十二年，朱元璋至濠州投军，与众豪杰聚义，开始开国基业。",
        acquire_hint: "第一章开局触发。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "⚔️"
    },
    {
        card_id: "EVENT_DINGYUAN_ZHAOBING",
        name: "定远招兵",
        type: CardTypes.EVENT,
        rarity: 3,
        description: "朱元璋前往定远招募兵马，收编壮士，得七百余人，奠定起家资本。",
        acquire_hint: "第一章早期触发。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🫂"
    },
    {
        card_id: "EVENT_GONGQU_HEZHOU",
        name: "攻取和州",
        type: CardTypes.EVENT,
        rarity: 3,
        description: "设计智取和州城，郭子兴任命朱元璋为总兵官，统领全城。",
        acquire_hint: "第一章早期触发。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🏰"
    },
    {
        card_id: "EVENT_DUJIANG_ZHIZHAN",
        name: "渡江之战",
        type: CardTypes.EVENT,
        rarity: 4,
        description: "郭子兴死后，朱元璋率军渡过长江，攻取太平，开辟江南根据地。",
        acquire_hint: "第一章中期触发。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🚤"
    },
    {
        card_id: "EVENT_GONGZHAN_YINGTIAN",
        name: "攻占应天",
        type: CardTypes.EVENT,
        rarity: 4,
        description: "攻克元朝水陆并进，攻破集庆路，改为应天府，作为新都。",
        acquire_hint: "第一章中期触发。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🏙️"
    },
    {
        card_id: "EVENT_JIANGDONGQIAO",
        name: "江东桥之战",
        type: CardTypes.EVENT,
        rarity: 4,
        description: "康茂才诈降，诱陈友谅进入伏击圈，大破陈军于江东桥。",
        acquire_hint: "第一章中期触发。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🌉"
    },
    {
        card_id: "EVENT_CHENYOULIANG_DIHUANG",
        name: "陈友谅称帝",
        type: CardTypes.EVENT,
        rarity: 4,
        description: "陈友谅攻占太平后称帝，国号汉，雄踞上游。",
        acquire_hint: "第一章中期触发。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "👑"
    },
    {
        card_id: "EVENT_HONGDU_BAOWEI",
        name: "洪都保卫战",
        type: CardTypes.EVENT,
        rarity: 5,
        description: "朱文正坚守洪都八十余日，挡住陈友谅六十万大军，为朱元璋争取了宝贵时间。",
        acquire_hint: "鄱阳湖之战前触发。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🛡️"
    },
    {
        card_id: "EVENT_GONGMIE_ZHANGSHICHENG",
        name: "攻灭张士诚",
        type: CardTypes.EVENT,
        rarity: 5,
        description: "徐达常遇春攻破平江，张士诚败亡，苏南浙北尽归朱元璋。",
        acquire_hint: "鄱阳湖之战后完成。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🏆"
    },
    {
        card_id: "EVENT_WANG_JINJUE",
        name: "吴王进爵",
        type: CardTypes.EVENT,
        rarity: 4,
        description: "攻灭陈友谅后，朱元璋进爵吴王，领百官，奠定称帝基础。",
        acquire_hint: "鄱阳湖之战后触发。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "⚜️"
    },
    {
        card_id: "EVENT_NORTHERN_EXPEDITION",
        name: "北伐中原",
        type: CardTypes.EVENT,
        rarity: 5,
        description: "命徐达为征虏大将军，北伐中原，攻取元大都，收复燕云。",
        acquire_hint: "称帝后触发。",
        is_hidden: false,
        unlock_condition: null,
        emoji: "🚩"
    },

];
