/**
 * 游戏场景枚举
 */
window.GameScene = {
    CHARACTER_VIEW: 'character',
    CITY_VIEW: 'city',
    MAP_VIEW: 'map',
    TASK_LIST: 'tasks',
    FARMING_GAME: 'farming',
    CARD_COLLECTION: 'cards',
    SOCIAL_VIEW: 'social',
    CHARACTER_LIST_VIEW: 'character_list',
    MARKET: 'market',
    EVENT: 'event',
    FACILITY: 'facility'
};

/**
 * 亲密度等级定义
 * 范围: -4 ~ +5，每级对应一颗心
 */
const IntimacyLevel = {
    HOSTILE_4: -4,      // 不共戴天
    HOSTILE_3: -3,      // 仇敌
    HOSTILE_2: -2,      // 交恶
    HOSTILE_1: -1,      // 冷淡
    NEUTRAL: 0,         // 中立
    FRIENDLY_1: 1,      // 一面之缘
    FRIENDLY_2: 2,      // 略有交情 - 可邀请修行
    FRIENDLY_3: 3,      // 推心置腹 - 可获得人物卡/可结义
    FRIENDLY_4: 4,      // 莫逆之交
    FRIENDLY_5: 5       // 生死相随 - 配偶/结义
};

/**
 * 游戏状态管理类
 * 重构后：核心状态管理，通过委托调用各子系统
 */
window.GameState = class GameState {
    constructor() {
        // 当前日期 - 元朝末年，至正十二年
        this.year = 1352;
        this.month = 2;
        this.day = 1;

        // 当前玩家角色ID - 初始为朱元璋
        this.playerCharacterId = 1;

        // 当前所在城市ID - 初始在濠州
        this.currentCityId = 1;

        // 玩家势力（从角色模板读取初始值）
        const playerTemplate1 = this.getPlayerCharacter();
        this.playerFaction = playerTemplate1 ? playerTemplate1.faction : null;

        // 玩家金钱
        this.money = 10;

        // 玩家功勋
        this.merit = 0;

        // 游戏日志
        this.logs = [];

        // 当前场景
        this.currentScene = GameScene.CHARACTER_VIEW;

        // 当前进行中的任务
        this.currentTask = null;

        // 耕地小游戏状态
        this.farmingGame = null;

        // 口才小游戏状态
        this.eloquenceGame = null;

        // 获取玩家角色模板
        const playerTemplate = getCharacterTemplateByNumId(this.playerCharacterId);

        // 技能等级与经验
        // { skillId: { level: number, exp: number } }
        this.skills = GameInitializer.initDefaultSkills(playerTemplate);

        // 身份 - 根据功勋自动晋升
        this.currentRoleId = 'peasant'; // 开局放牛娃/游方僧

        // 卡片收集 - { cardId: true }
        this.collectedCards = GameInitializer.initCollectedCards(playerTemplate);

        // 当前佩戴的称号卡
        this.currentTitle = null;

        // 合战胜利次数统计（用于称号解锁）
        this.battleWins = GameInitializer.initBattleWins();

        // ========== 社交系统 ==========
        // 亲密度关系网 - { relationshipKey: intimacyValue }
        // relationshipKey格式: "player_characterId"
        this.relationships = GameInitializer.initDefaultRelationships();

        // 当前选中社交互动的NPC
        this.currentSocialTarget = null;

        // 配偶（如果已婚）- characterId
        this.spouse = null;

        // 结义兄弟列表 - characterId[]
        this.brothers = [];
        // ========== 社交系统结束 ==========

        // ========== 经济系统 ==========
        // 玩家背包 - { goodsId: quantity } 存储持有商品
        this.playerInventory = {};

        // 城镇经济状态 - { cityId: { prosperity, taxRate, investmentLevel, atWar } }
        // 每个城镇独立的经济数据
        this.cityEconomies = {};
        // ========== 经济系统结束 ==========

        // ========== 事件系统 ==========
        // 事件标记 - { flagName: boolean } 用于分支剧情记录
        const eventData = GameInitializer.initEventData();
        this.eventFlags = eventData.eventFlags;
        this.triggeredEvents = eventData.triggeredEvents;

        // 当前正在进行的事件（多场景逐步展示）
        this.currentEvent = null;

        // 当前进行到事件的哪一个场景
        this.currentEventScene = null;

        // 当前进入的城乡设施
        this.currentFacility = null;

        // 评定会相关状态
        this._shouldAutoGoToEvaluation = false;
        this.evaluationPendingSelection = false;
        // ========== 事件系统结束 ==========

        // 从localStorage加载全局卡片收集（跨存档继承）
        CardSystem.loadGlobalCollection(this);

        // 从localStorage加载亲密度关系（跨存档保留人际关系）
        SocialSystem.loadRelationships(this);

        // 从localStorage加载合战胜利次数
        CardSystem.loadBattleWins(this);

        // 初始化所有城镇的经济状态
        SaveSystem.initAllCityEconomies(this);

        // 根据初始功勋检查晋升
        SkillSystem.checkRolePromotion(this);

        // 淮西集团同乡加成
        SocialSystem.applyHuaixiGroupBonus(this);

        // 初始化完成后检测一次触发事件（处理开局事件）
        if (typeof EventScheduler !== 'undefined') {
            EventScheduler.checkAndTrigger(this);
        }
    }

    // ========== 卡片系统委托 ==========

    /**
     * 检查并收集新卡片 - 统一入口
     * @param {string} cardId
     * @returns {boolean} true表示是新收集的，false表示已经有了
     */
    acquireCard(cardId) {
        return CardSystem.acquireCard(this, cardId);
    }

    /**
     * 别名兼容
     */
    collectCard(cardId) {
        return CardSystem.collectCard(this, cardId);
    }

    /**
     * 从localStorage加载全局卡片收集（跨存档继承）
     */
    loadGlobalCollection() {
        return CardSystem.loadGlobalCollection(this);
    }

    /**
     * 保存全局卡片收集到localStorage（跨存档继承）
     */
    saveGlobalCollection() {
        return CardSystem.saveGlobalCollection(this);
    }

    /**
     * 获取当前所有已收集卡片按类型分组
     * @returns {Object} {type: cards[]}
     */
    getCollectedCardsByType() {
        return CardSystem.getCollectedCardsByType(this);
    }

    /**
     * 获取收集统计
     * @returns {Object} {total: number, totalPossible: number, byType: {type: {collected: number, total: number}}}
     */
    getCollectionStats() {
        return CardSystem.getCollectionStats(this);
    }

    /**
     * 检查玩家是否拥有某张卡片
     * @param {string} cardId
     * @returns {boolean}
     */
    hasCard(cardId) {
        return CardSystem.hasCard(this, cardId);
    }

    /**
     * 获取当前称号提供的属性加成
     * @returns {Object} {attribute: bonusValue}
     */
    getCurrentTitleBonus() {
        return CardSystem.getCurrentTitleBonus(this);
    }

    /**
     * 增加合战胜利次数
     * @param {string} battleType - 'field'|'siege'|'naval'
     */
    incrementBattleWinCount(battleType) {
        return CardSystem.incrementBattleWinCount(this, battleType);
    }

    /**
     * 保存合战胜利次数到localStorage
     */
    saveBattleWins() {
        return CardSystem.saveBattleWins(this);
    }

    /**
     * 检查是否解锁合战相关称号
     */
    checkBattleTitles() {
        return CardSystem.checkBattleTitles(this);
    }

    /**
     * 统计玩家持有的宝物卡数量
     */
    countTreasures() {
        return CardSystem.countTreasures(this);
    }

    // ========== 技能系统委托 ==========

    /**
     * 添加技能经验，处理升级
     * @param {string} skillId
     * @param {number} exp
     * @returns {boolean} 是否升级成功
     */
    addSkillExp(skillId, exp) {
        return SkillSystem.addSkillExp(this, skillId, exp);
    }

    /**
     * 获取玩家技能等级
     */
    getSkillLevel(skillId) {
        return SkillSystem.getSkillLevel(this, skillId);
    }

    /**
     * 检查身份晋升，如果功勋够了自动晋升
     * @returns {Role|null} 新身份，如果没晋升返回null
     */
    checkRolePromotion() {
        return SkillSystem.checkRolePromotion(this);
    }

    /**
     * 获取当前身份
     */
    getCurrentRole() {
        return SkillSystem.getCurrentRole(this);
    }

    /**
     * 检查今天是否是评定会日
     * 评定会规则：每隔两个月召开一次，固定在奇数月一日
     * @returns {boolean}
     */
    isEvaluationDay() {
        return SkillSystem.isEvaluationDay(this);
    }

    /**
     * 检查玩家是否在主公居城（评定会需要身处居城才能参加）
     * @returns {boolean}
     */
    isAtMainCity() {
        return SkillSystem.isAtMainCity(this);
    }

    /**
     * 根据任务模板和玩家技能计算目标值
     * @param {MissionTemplate} missionTemplate
     * @returns {number}
     */
    calculateMissionTarget(missionTemplate) {
        return SkillSystem.calculateMissionTarget(this, missionTemplate);
    }

    // ========== 社交系统委托 ==========

    /**
     * 获取玩家与某NPC的亲密度
     * @param {number} characterId
     * @returns {number} 亲密度 -4 ~ +5
     */
    getIntimacy(characterId) {
        return SocialSystem.getIntimacy(this, characterId);
    }

    /**
     * 设置玩家与某NPC的亲密度
     * @param {number} characterId
     * @param {number} value
     */
    setIntimacy(characterId, value) {
        return SocialSystem.setIntimacy(this, characterId, value);
    }

    /**
     * 增加亲密度
     * @param {number} characterId
     * @param {number} delta
     */
    addIntimacy(characterId, delta) {
        return SocialSystem.addIntimacy(this, characterId, delta);
    }

    /**
     * 获取亲密度等级的文字描述
     * @param {number} intimacy
     */
    getIntimacyDescription(intimacy) {
        return SocialSystem.getIntimacyDescription(intimacy);
    }

    /**
     * 获取亲密度的心形图标表示
     * @param {number} intimacy
     */
    getIntimacyHearts(intimacy) {
        return SocialSystem.getIntimacyHearts(intimacy);
    }

    /**
     * 检查是否可以拜师（请求指导技能）
     * @param {number} characterId
     */
    canInvitePractice(characterId) {
        return SocialSystem.canInvitePractice(this, characterId);
    }

    /**
     * 检查是否可以劝诱加入己方势力
     * @param {number} characterId
     */
    canPersuade(characterId) {
        return SocialSystem.canPersuade(this, characterId);
    }

    /**
     * 检查是否可以结义
     * @param {number} characterId
     */
    canSwearBrotherhood(characterId) {
        return SocialSystem.canSwearBrotherhood(this, characterId);
    }

    /**
     * 检查是否可以求婚
     * @param {number} characterId
     */
    canProposeMarriage(characterId) {
        return SocialSystem.canProposeMarriage(this, characterId);
    }

    /**
     * 执行送礼操作
     * @param {number} characterId - NPC ID
     * @param {string} treasureCardId - 宝物卡ID
     * @returns {boolean} 是否成功
     */
    giftTreasure(characterId, treasureCardId) {
        return SocialSystem.giftTreasure(this, characterId, treasureCardId);
    }

    /**
     * 邀请茶会
     * @param {number} characterId
     * @returns {boolean} 是否成功
     */
    inviteTea(characterId) {
        return SocialSystem.inviteTea(this, characterId);
    }

    /**
     * 邀请宴饮
     * @param {number} characterId
     * @returns {boolean} 是否成功
     */
    inviteFeast(characterId) {
        return SocialSystem.inviteFeast(this, characterId);
    }

    /**
     * 请求切磋武艺
     * @param {number} characterId
     * @returns {boolean} 是否同意切磋
     */
    requestDuel(characterId) {
        return SocialSystem.requestDuel(this, characterId);
    }

    /**
     * 切磋完成后处理亲密度
     */
    onDuelComplete(characterId, playerWon) {
        return SocialSystem.onDuelComplete(this, characterId, playerWon);
    }

    /**
     * 执行结义
     */
    doSwearBrotherhood(characterId) {
        return SocialSystem.doSwearBrotherhood(this, characterId);
    }

    /**
     * 求婚
     */
    proposeMarriage(characterId) {
        return SocialSystem.proposeMarriage(this, characterId);
    }

    /**
     * 获取当前城市中的所有NPC
     * 根据人物模板的locationCityId匹配
     */
    getCharactersInCurrentCity() {
        return SocialSystem.getCharactersInCurrentCity(this);
    }

    /**
     * 自然衰减：每半年无互动亲密度-2
     * 应该在时间推进半年时调用
     */
    decayIntimacy() {
        return SocialSystem.decayIntimacy(this);
    }

    /**
     * 从localStorage加载亲密度关系
     */
    loadRelationships() {
        return SocialSystem.loadRelationships(this);
    }

    /**
     * 保存亲密度关系到localStorage
     */
    saveRelationships() {
        return SocialSystem.saveRelationships(this);
    }

    /**
     * 开始与某个NPC的社交互动
     */
    startSocialInteraction(characterId) {
        return SocialSystem.startSocialInteraction(this, characterId);
    }

    // ========== 经济/存档系统委托 ==========

    /**
     * 获取城镇经济状态
     */
    getCityEconomy(cityId) {
        return SaveSystem.getCityEconomy(this, cityId);
    }

    /**
     * 设置城镇战乱状态
     */
    setCityWarState(cityId, atWar) {
        return SaveSystem.setCityWarState(this, cityId, atWar);
    }

    /**
     * 添加商品到玩家背包
     */
    addToInventory(goodsId, quantity) {
        return SaveSystem.addToInventory(this, goodsId, quantity);
    }

    /**
     * 从玩家背包移除商品
     */
    removeFromInventory(goodsId, quantity) {
        return SaveSystem.removeFromInventory(this, goodsId, quantity);
    }

    /**
     * 获取玩家持有商品数量
     */
    getInventoryQuantity(goodsId) {
        return SaveSystem.getInventoryQuantity(this, goodsId);
    }

    /**
     * 检查事件标记是否为真
     */
    hasEventFlag(flag) {
        return SaveSystem.hasEventFlag(this, flag);
    }

    /**
     * 设置事件标记
     */
    setEventFlag(flag, value) {
        return SaveSystem.setEventFlag(this, flag, value);
    }

    /**
     * 检查事件是否已经触发过
     */
    isEventTriggered(eventId) {
        return SaveSystem.isEventTriggered(this, eventId);
    }

    /**
     * 标记事件已经触发
     */
    markEventTriggered(eventId) {
        return SaveSystem.markEventTriggered(this, eventId);
    }

    /**
     * 开始执行一个事件
     */
    startEvent(event) {
        return SaveSystem.startEvent(this, event);
    }

    // ========== 核心基础方法（保留在GameState中） ==========

    /**
     * 获取当前玩家角色对象
     */
    getPlayerCharacter() {
        return getCharacterTemplateByNumId(this.playerCharacterId);
    }

    /**
     * 获取当前所在城市
     */
    getCurrentCity() {
        return getCityTemplateById(this.currentCityId);
    }

    /**
     * 推进一天 - 委托给TimeSystem统一处理
     * 评定会检查、任务超时检查、事件检测都在TimeSystem中完成
     */
    advanceDay() {
        TimeSystem.nextDay(this);
    }

    /**
     * 添加日志
     */
    addLog(message) {
        this.logs.push(message);
        // 只保留最近50条日志
        if (this.logs.length > 50) {
            this.logs.shift();
        }
    }

    /**
     * 获取格式化的日期字符串
     */
    getFormattedDate() {
        let yearStr;
        if (this.year >= 1368) {
            yearStr = `洪武 ${this.year - 1368}年`;
        } else {
            yearStr = `至正 ${this.year - 1341 + 1}年`;
        }
        return `${yearStr} ${this.month}月${this.day}日`;
    }

    /**
     * 推进多天（用于移动、执行任务等）
     * @param {number} days - 要推进的天数
     */
    advanceDays(days) {
        for (let i = 0; i < days; i++) {
            this.advanceDay();
        }
    }

    /**
     * 计算移动到目标城市需要的天数
     * @param {number} targetCityId - 目标城市ID
     * @returns {number} 移动天数
     */
    getMoveDaysToCity(targetCityId) {
        const currentCity = this.getCurrentCity();
        if (!currentCity || !currentCity.connections) {
            return 0;
        }

        const connection = currentCity.connections.find(conn => conn.target === targetCityId);
        if (!connection) {
            return 0;
        }

        let baseDays = connection.baseDays;

        // 骑战技能减少移动时间，每级减10%，最少1天
        const cavalryLevel = this.getSkillLevel('cavalry');
        if (cavalryLevel > 0) {
            const reduction = cavalryLevel * 0.1;
            baseDays = Math.max(1, Math.floor(baseDays * (1 - reduction)));
        }

        // 冬季增加20%时间
        if (this.month >= 10 && this.month <= 12) {
            baseDays = Math.ceil(baseDays * 1.2);
        }

        return baseDays;
    }

    /**
     * 移动到目标城市，消耗对应天数
     * @param {number} targetCityId - 目标城市ID
     * @returns {number} 实际消耗的天数
     */
    moveToCity(targetCityId) {
        const days = this.getMoveDaysToCity(targetCityId);
        if (days > 0) {
            this.advanceDays(days);
            this.currentCityId = targetCityId;
            const targetCity = getCityTemplateById(targetCityId);
            this.addLog(`经过${days}天跋涉，你抵达了${targetCity.name}`);
        }
        return days;
    }


    /**
     * 开始接受并执行一个主命
     * @param {string} missionId - 任务ID
     * @returns {boolean} 是否成功接受
     */
    startMission(missionId) {
        return MissionSystem.acceptMission(this, missionId);
    }

    /**
     * 检查当前主命是否超时
     * @returns {boolean} true表示已超时
     */
    checkMissionTimeout() {
        return MissionSystem.checkMissionTimeout(this);
    }

    /**
     * 获取当前主命剩余天数
     * @returns {number}
     */
    getRemainingDaysForMission() {
        return MissionSystem.getRemainingDays(this);
    }

    /**
     * 完成当前主命，进行结算
     * @param {boolean} success - 是否成功完成
     * @param {number} actualProgress - 实际完成进度
     * @returns {Object} 结算结果 {meritGained: number, skillsExp: Object}
     */
    completeMission(success, actualProgress = 0) {
        return MissionSystem.completeMission(this, success, actualProgress);
    }

    /**
     * 获取可接的主命列表（根据当前身份筛选）
     * @returns {MissionTemplate[]}
     */
    getAvailableMissions() {
        return getAvailableMissionsForRole(this.currentRoleId);
    }

    /**
     * 按分类获取可接主命
     * @param {string} category
     * @returns {MissionTemplate[]}
     */
    getAvailableMissionsByCategory(category) {
        const allAvailable = this.getAvailableMissions();
        return allAvailable.filter(m => m.category === category);
    }

    /**
     * 检查玩家是否为君主（城主/国主/皇帝）
     * @returns {boolean}
     */
    isPlayerRuler() {
        return SkillSystem.isPlayerRuler(this);
    }

    /**
     * 获取君主可发布的所有主命
     * @returns {MissionTemplate[]}
     */
    getRulerPublishableMissions() {
        return getAllMissionTemplates().filter(m => {
            // 内政、军备、调略、外交、国策都是君主可发布的
            const rulerCategories = ['内政', '军备', '调略', '外交', '国策'];
            return rulerCategories.includes(m.category);
        });
    }

    /**
     * 取消当前任务
     * @returns {boolean} 是否成功取消
     */
    cancelCurrentMission() {
        if (!this.currentTask) {
            return false;
        }
        const template = getMissionTemplateById(this.currentTask.templateId);
        const penalty = Math.round(template.baseReward * 0.2);
        this.merit = Math.max(0, this.merit - penalty);
        this.addLog(`取消主命【${template.name}】，扣除功勋 ${penalty}`);
        this.currentTask = null;
        return true;
    }
};
