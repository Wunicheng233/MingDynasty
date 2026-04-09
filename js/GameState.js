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
    CHARACTER_LIST_VIEW: 'character_list'
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

        // 技能等级与经验
        // { skillId: { level: number, exp: number } }
        this.skills = this.initDefaultSkills();

        // 身份 - 根据功勋自动晋升
        this.currentRoleId = 'soldier'; // 开局士兵

        // 卡片收集 - { cardId: true }
        this.collectedCards = this.initCollectedCards();

        // 当前佩戴的称号卡
        this.currentTitle = null;

        // 合战胜利次数统计（用于称号解锁）
        this.battleWins = {
            total: 0,
            naval: 0,
            field: 0,
            siege: 0,
            firearm: 0
        };
        // 从localStorage加载
        this.loadBattleWins();

        // ========== 社交系统 ==========
        // 亲密度关系网 - { relationshipKey: intimacyValue }
        // relationshipKey格式: "player_characterId"
        this.relationships = this.initDefaultRelationships();

        // 当前选中社交互动的NPC
        this.currentSocialTarget = null;

        // 配偶（如果已婚）- characterId
        this.spouse = null;

        // 结义兄弟列表 - characterId[]
        this.brothers = [];

        // ========== 社交系统结束 ==========

        // 从localStorage加载全局卡片收集（跨存档继承）
        this.loadGlobalCollection();

        // 从localStorage加载亲密度关系（跨存档保留人际关系）
        this.loadRelationships();

        // 根据初始功勋检查晋升
        this.checkRolePromotion();
    }

    /**
     * 初始化开局已经收集的卡片
     * 使用新卡片库的ID规范
     */
    initCollectedCards() {
        const cards = {};
        getInitialCardIds().forEach(cardId => {
            cards[cardId] = true;
        });
        return cards;
    }

    /**
     * 检查并收集新卡片 - 统一入口
     * @param {string} cardId
     * @returns {boolean} true表示是新收集的，false表示已经有了
     */
    acquireCard(cardId) {
        if (this.collectedCards[cardId]) {
            return false;
        }

        this.collectedCards[cardId] = true;
        const card = getCardById(cardId);

        if (card) {
            this.addLog(`获得新卡片：${getCardTypeName(card.type)}【${card.name}】`);

            // 根据卡片类型执行附加效果
            this.processCardAcquired(card);
        }

        // 保存到全局收集（跨存档继承）
        this.saveGlobalCollection();

        return true;
    };

    /**
     * 别名兼容
     */
    collectCard(cardId) {
        return this.acquireCard(cardId);
    }

    /**
     * 卡片获取后的附加处理
     * @param {Card} card
     */
    processCardAcquired(card) {
        switch (card.type) {
            case CardTypes.TITLE:
                // 称号卡，如果玩家当前没有佩戴主称号，可以自动佩戴
                if (!this.currentTitle && card.effect) {
                    this.currentTitle = card.card_id;
                }
                break;
            case CardTypes.CHARACTER:
                // 人物卡，解锁可扮演，不需要即时处理，新游戏时读取即可
                break;
            case CardTypes.TACTIC_BATTLE:
            case CardTypes.MARTIAL_DUEL:
            case CardTypes.SECRET:
                // 战术/武技/秘传，玩家已经收集，战斗时会自动读取可用列表
                break;
            default:
                break;
        }
    }

    /**
     * 从localStorage加载全局卡片收集（跨存档继承）
     */
    loadGlobalCollection() {
        try {
            const saved = localStorage.getItem('hongwu_card_collection');
            if (saved) {
                const data = JSON.parse(saved);
                if (data.collectedCards && typeof data.collectedCards === 'object') {
                    // 合并到当前收集 - 当前存档已收集的保留，全局收集的也添加
                    for (const cardId in data.collectedCards) {
                        if (!this.collectedCards[cardId]) {
                            this.collectedCards[cardId] = data.collectedCards[cardId];
                        }
                    }
                }
            }
        } catch (e) {
            console.warn('加载全局卡片收集失败', e);
        }
    }

    /**
     * 保存全局卡片收集到localStorage（跨存档继承）
     */
    saveGlobalCollection() {
        try {
            // 统计收集信息
            const stats = {
                total_collected: Object.keys(this.collectedCards).length,
                by_type: {}
            };
            for (const cardId in this.collectedCards) {
                const card = getCardById(cardId);
                if (card) {
                    const typeName = getCardTypeName(card.type);
                    stats.by_type[typeName] = (stats.by_type[typeName] || 0) + 1;
                }
            }

            const data = {
                collectedCards: this.collectedCards,
                collection_stats: stats,
                updated_at: new Date().toISOString()
            };

            localStorage.setItem('hongwu_card_collection', JSON.stringify(data));
        } catch (e) {
            console.warn('保存全局卡片收集失败', e);
        }
    }

    /**
     * 获取当前所有已收集卡片按类型分组
     * @returns {Object} {type: cards[]}
     */
    getCollectedCardsByType() {
        const result = {};
        for (const cardId in this.collectedCards) {
            const card = getCardById(cardId);
            if (card) {
                if (!result[card.type]) {
                    result[card.type] = [];
                }
                result[card.type].push(card);
            }
        }
        return result;
    }

    /**
     * 获取收集统计
     * @returns {Object} {total: number, totalPossible: number, byType: {type: {collected: number, total: number}}}
     */
    getCollectionStats() {
        const allCards = getAllCards();
        const collectedByType = this.getCollectedCardsByType();

        const stats = {
            total: Object.keys(this.collectedCards).length,
            totalPossible: allCards.length,
            byType: {}
        };

        const allByType = {};
        allCards.forEach(card => {
            if (!allByType[card.type]) {
                allByType[card.type] = 0;
            }
            allByType[card.type]++;
        });

        for (const type in allByType) {
            stats.byType[type] = {
                collected: (collectedByType[type] || []).length,
                total: allByType[type]
            };
        }

        return stats;
    }

    /**
     * 检查玩家是否拥有某张卡片
     * @param {string} cardId
     * @returns {boolean}
     */
    hasCard(cardId) {
        return !!this.collectedCards[cardId];
    }

    /**
     * 获取当前称号提供的属性加成
     * @returns {Object} {attribute: bonusValue}
     */
    getCurrentTitleBonus() {
        if (!this.currentTitle) {
            return {};
        }
        const titleCard = getCardById(this.currentTitle);
        if (titleCard && titleCard.type === CardTypes.TITLE && titleCard.effect) {
            return titleCard.effect;
        }
        return {};
    }

    /**
     * 初始化朱元璋开局默认技能
     */
    initDefaultSkills() {
        const defaultSkills = {};
        // 开局朱元璋基础技能
        defaultSkills.agriculture = { level: 1, exp: 0 }; // 农政
        defaultSkills.strategy = { level: 1, exp: 0 }; // 兵法
        defaultSkills.martial = { level: 1, exp: 20 }; // 武艺
        defaultSkills.infantry = { level: 1, exp: 10 }; // 步战
        // 其他技能初始0级0经验
        getAllSkills().forEach(skill => {
            if (!defaultSkills[skill.id]) {
                defaultSkills[skill.id] = { level: 0, exp: 0 };
            }
        });
        return defaultSkills;
    }

    /**
     * 添加技能经验，处理升级
     * @param {string} skillId
     * @param {number} exp
     * @returns {boolean} 是否升级成功
     */
    addSkillExp(skillId, exp) {
        const skillData = this.skills[skillId];
        const skillConfig = getSkillById(skillId);
        if (!skillData || !skillConfig || skillData.level >= skillConfig.maxLevel) {
            return false;
        }

        skillData.exp += exp;
        let leveledUp = false;

        // 检查是否升级
        while (skillData.level < skillConfig.maxLevel && skillData.exp >= skillConfig.expPerLevel) {
            skillData.exp -= skillConfig.expPerLevel;
            skillData.level++;
            leveledUp = true;
            const skillName = skillConfig.name;
            this.addLog(`${skillName} 升级了！当前等级：${skillData.level}`);
        }

        return leveledUp;
    }

    /**
     * 获取玩家技能等级
     */
    getSkillLevel(skillId) {
        return this.skills[skillId]?.level || 0;
    }

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
     * 推进一天
     */
    advanceDay() {
        this.day++;

        // 简单处理月份进位，不考虑不同月份天数差异
        const daysInMonth = 30;
        if (this.day > daysInMonth) {
            this.day = 1;
            this.month++;
            if (this.month > 12) {
                this.month = 1;
                this.year++;
            }
        }

        // 添加日志
        const yearTitle = this.year >= 1368 ? `洪武${this.year - 1368}年` : `至正${this.year - 1341 + 1}年`;
        this.addLog(`时间来到了${yearTitle}${this.month}月${this.day}日`);
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
     * 检查身份晋升，如果功勋够了自动晋升
     * @returns {Role|null} 新身份，如果没晋升返回null
     */
    checkRolePromotion() {
        const currentRole = getRoleById(this.currentRoleId);
        const newRole = getCurrentRoleByMerit(this.merit);
        if (newRole && newRole.order > currentRole.order) {
            // 晋升了
            this.currentRoleId = newRole.id;
            // 更新人物数据里的身份
            const player = this.getPlayerCharacter();
            if (player) {
                player.role = newRole.name;
            }
            this.addLog(`身份晋升！现在你是：${newRole.name}`);
            return newRole;
        }
        return null;
    }

    /**
     * 获取当前身份
     */
    getCurrentRole() {
        return getRoleById(this.currentRoleId);
    }

    /**
     * 检查今天是否是评定会日
     * 评定会规则：每隔两个月召开一次，固定在奇数月一日
     * @returns {boolean}
     */
    isEvaluationDay() {
        return this.day === 1 && (this.month % 2) === 1;
    }

    /**
     * 检查玩家是否在主公居城（评定会需要身处居城才能参加）
     * @returns {boolean}
     */
    isAtMainCity() {
        // 开局玩家在濠州，这是郭子兴军的本城
        // 后续可以根据玩家势力动态判断
        const player = this.getPlayerCharacter();
        if (player && player.faction) {
            const faction = getForceTemplateByFactionId(player.faction);
            if (faction && faction.initialCities.length > 0) {
                return this.currentCityId === faction.initialCities[0];
            }
        }
        // 默认判断：初始在濠州就是本城
        return this.currentCityId === 1;
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
     * @param {MissionTemplate} missionTemplate - 主命模板
     */
    startMission(missionTemplate) {
        this.currentTask = {
            templateId: missionTemplate.id,
            missionId: missionTemplate.mission_id,
            name: missionTemplate.name,
            category: missionTemplate.category,
            startYear: this.year,
            startMonth: this.month,
            startDay: this.day,
            deadlineDay: this.day + missionTemplate.timeLimitDays,
            timeLimitDays: missionTemplate.timeLimitDays,
            targetParam: missionTemplate.targetParam,
            completionType: missionTemplate.completionType,
            gameType: missionTemplate.gameType,
            progress: 0,
            targetValue: this.calculateMissionTarget(missionTemplate),
            startedAt: `${this.year}-${this.month}-${this.day}`
        };

        this.addLog(`接受主命：${missionTemplate.name}，限时${missionTemplate.timeLimitDays}天完成`);
        this.currentScene = GameScene.TASK_LIST;
    }

    /**
     * 根据任务模板和玩家技能计算目标值
     * @param {MissionTemplate} missionTemplate
     * @returns {number}
     */
    calculateMissionTarget(missionTemplate) {
        // 基础目标 = 基础难度 * (1 + 技能加成)
        let baseTarget = missionTemplate.baseDifficulty * 10;

        // 根据关联技能等级加成目标
        if (missionTemplate.requiredSkills && missionTemplate.requiredSkills.length > 0) {
            let totalSkillLevel = 0;
            missionTemplate.requiredSkills.forEach(skillId => {
                totalSkillLevel += this.getSkillLevel(skillId);
            });
            // 每级技能增加5%目标（也增加完成后的经验奖励）
            baseTarget = Math.round(baseTarget * (1 + totalSkillLevel * 0.05));
        }

        return baseTarget;
    }

    /**
     * 检查当前主命是否超时
     * @returns {boolean} true表示已超时
     */
    checkMissionTimeout() {
        if (!this.currentTask) {
            return false;
        }
        return this.day > this.currentTask.deadlineDay;
    }

    /**
     * 获取当前主命剩余天数
     * @returns {number}
     */
    getRemainingDaysForMission() {
        if (!this.currentTask) {
            return 0;
        }
        return Math.max(0, this.currentTask.deadlineDay - this.day);
    }

    /**
     * 完成当前主命，进行结算
     * @param {boolean} success - 是否成功完成
     * @param {number} actualProgress - 实际完成进度
     * @returns {Object} 结算结果 {meritGained: number, skillsExp: Object}
     */
    completeMission(success, actualProgress = 0) {
        if (!this.currentTask) {
            return { success: false, meritGained: 0 };
        }

        const template = getMissionTemplateById(this.currentTask.templateId);
        if (!template) {
            this.currentTask = null;
            return { success: false, meritGained: 0 };
        }

        let result = {
            success: success,
            meritGained: 0,
            skillsExp: {},
            newCard: null
        };

        if (success) {
            // 计算功勋奖励
            let merit = template.baseReward;

            // 根据完成度倍率奖励
            if (actualProgress >= this.currentTask.targetValue * 2) {
                merit = merit * 2;
                this.addLog(`超额完成目标！获得双倍功勋：${merit}`);
            } else if (actualProgress >= this.currentTask.targetValue) {
                this.addLog(`完成目标！获得功勋：${merit}`);
            } else {
                // 未达标但仍算部分完成，按比例给功勋
                merit = Math.round(merit * (actualProgress / this.currentTask.targetValue));
                this.addLog(`未完全达成目标，获得部分功勋：${merit}`);
            }

            this.merit += merit;
            result.meritGained = merit;

            // 给关联技能增加经验
            if (template.requiredSkills && template.requiredSkills.length > 0) {
                template.requiredSkills.forEach(skillId => {
                    // 基础经验奖励 = 难度 * 5
                    const exp = template.baseDifficulty * 5;
                    this.addSkillExp(skillId, exp);
                    result.skillsExp[skillId] = exp;
                });
            }

            // 检查是否有卡片奖励（某些任务完成后给卡片）
            // 这里预留接口，后续可以根据任务配置给卡
            this.addLog(`主命【${template.name}】完成，功勋+${result.meritGained}`);

            // 检查身份晋升
            const newRole = this.checkRolePromotion();
            if (newRole) {
                result.promotion = newRole;
            }
        } else {
            // 任务失败，扣除部分功勋
            const penalty = Math.round(template.baseReward * 0.3);
            this.merit = Math.max(0, this.merit - penalty);
            this.addLog(`主命【${template.name}】失败，扣除功勋${penalty}`);
            result.meritGained = -penalty;
        }

        // 清空当前任务
        this.currentTask = null;

        return result;
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

    // ========== 社交系统 - 亲密度关系管理 ==========

    /**
     * 初始化默认人际关系（开局预设）
     */
    initDefaultRelationships() {
        const defaults = {};
        // 开局朱元璋和郭子兴、汤和、徐达等有基础关系
        // 实际关系会从localStorage加载，这里只留空对象
        return defaults;
    }

    /**
     * 获取关系key
     */
    getRelationshipKey(characterId) {
        return `${this.playerCharacterId}_${characterId}`;
    }

    /**
     * 获取玩家与某NPC的亲密度
     * @param {number} characterId
     * @returns {number} 亲密度 -4 ~ +5
     */
    getIntimacy(characterId) {
        const key = this.getRelationshipKey(characterId);
        return this.relationships[key] || 0;
    }

    /**
     * 设置玩家与某NPC的亲密度
     * @param {number} characterId
     * @param {number} value
     */
    setIntimacy(characterId, value) {
        // 限制范围 -4 ~ +5
        const clamped = Math.max(-4, Math.min(5, value));
        const key = this.getRelationshipKey(characterId);
        this.relationships[key] = clamped;

        // 检查是否达到3心，自动解锁人物卡
        if (clamped >= 3) {
            this.tryUnlockCharacterCard(characterId);
        }

        this.saveRelationships();
        return clamped;
    }

    /**
     * 增加亲密度
     * @param {number} characterId
     * @param {number} delta
     */
    addIntimacy(characterId, delta) {
        const current = this.getIntimacy(characterId);
        return this.setIntimacy(characterId, current + delta);
    }

    /**
     * 尝试解锁人物卡（亲密度达到3心时）
     */
    tryUnlockCharacterCard(characterId) {
        const character = getCharacterTemplateByNumId(characterId);
        if (!character) return false;

        // 查找对应的人物卡
        const cardId = `CHAR_${character.templateId}`;
        const card = getCardById(cardId);

        if (card && !this.hasCard(cardId)) {
            this.acquireCard(cardId);
            this.addLog(`因为亲密度提升，${character.name}赠予了你他的人物卡！`);
            return true;
        }
        return false;
    }

    /**
     * 获取亲密度等级的文字描述
     * @param {number} intimacy
     */
    getIntimacyDescription(intimacy) {
        switch (intimacy) {
            case -4: return '不共戴天';
            case -3: return '仇敌';
            case -2: return '交恶';
            case -1: return '冷淡';
            case 0: return '中立';
            case 1: return '一面之缘';
            case 2: return '略有交情';
            case 3: return '推心置腹';
            case 4: return '莫逆之交';
            case 5: return '生死相随';
            default: return '中立';
        }
    }

    /**
     * 获取亲密度的心形图标表示
     * @param {number} intimacy
     */
    getIntimacyHearts(intimacy) {
        // 正数显示实心心，负数显示空心
        let hearts = '';
        if (intimacy > 0) {
            for (let i = 1; i <= 5; i++) {
                hearts += i <= intimacy ? '❤️' : '♡';
            }
        } else {
            for (let i = -4; i <= 0; i++) {
                if (i <= intimacy) {
                    hearts += '💔';
                } else {
                    hearts += '♡';
                }
            }
        }
        return hearts;
    }

    /**
     * 检查是否可以拜师（请求指导技能）
     * @param {number} characterId
     */
    canInvitePractice(characterId) {
        // 需要亲密度 >= 2心
        return this.getIntimacy(characterId) >= 2;
    }

    /**
     * 检查是否可以劝诱加入己方势力
     * @param {number} characterId
     */
    canPersuade(characterId) {
        // 需要亲密度 >= 2心
        return this.getIntimacy(characterId) >= 2;
    }

    /**
     * 检查是否可以结义
     * @param {number} characterId
     */
    canSwearBrotherhood(characterId) {
        // 需要亲密度 >= 4心，且同性，且不超过2个结义兄弟
        const character = getCharacterTemplateByNumId(characterId);
        const player = this.getPlayerCharacter();
        if (!character || !player) return false;

        // 性别判断简化：名字最后一个字不判断，假设朱元璋是男，马秀英是女
        // 实际：玩家和NPC性别不同不能结义（需要婚姻）
        // 这里简化：已结婚偶不影响，只要不同性别就是婚姻候选
        const isPlayerMale = player.name !== '马秀英';
        const isNpcMale = character.name !== '马秀英';

        if (isPlayerMale !== isNpcMale) {
            return false; // 不同性别应该结婚，不是结义
        }

        return this.getIntimacy(characterId) >= 4 && this.brothers.length < 2;
    }

    /**
     * 检查是否可以求婚
     * @param {number} characterId
     */
    canProposeMarriage(characterId) {
        const character = getCharacterTemplateByNumId(characterId);
        const player = this.getPlayerCharacter();
        if (!character || !player) return false;

        // 已经有配偶了不能再求婚
        if (this.spouse !== null) return false;

        // 需要亲密度 >= 4心
        if (this.getIntimacy(characterId) < 4) return false;

        // 不同性别
        const isPlayerMale = player.name !== '马秀英';
        const isNpcMale = character.name !== '马秀英';

        return isPlayerMale !== isNpcMale;
    }

    /**
     * 执行送礼操作
     * @param {number} characterId - NPC ID
     * @param {string} treasureCardId - 宝物卡ID
     * @returns {boolean} 是否成功
     */
    giftTreasure(characterId, treasureCardId) {
        if (!this.hasCard(treasureCardId)) {
            this.addLog('你没有这件宝物，无法赠送。');
            return false;
        }

        const character = getCharacterTemplateByNumId(characterId);
        if (!character) return false;

        // 移除玩家的宝物卡
        delete this.collectedCards[treasureCardId];

        // 根据宝物稀有度增加亲密度
        const card = getCardById(treasureCardId);
        let intimacyIncrease = 5;
        if (card && card.rarity) {
            intimacyIncrease = card.rarity * 5;
        }

        const newIntimacy = this.addIntimacy(characterId, intimacyIncrease);
        this.addLog(`你赠送给${character.name}一件宝物，亲密度增加了${intimacyIncrease}点。`);
        this.addLog(`现在你和${character.name}的关系：${this.getIntimacyDescription(newIntimacy)} ${this.getIntimacyHearts(newIntimacy)}`);

        this.saveRelationships();
        return true;
    }

    /**
     * 邀请茶会
     * @param {number} characterId
     * @returns {boolean} 是否成功
     */
    inviteTea(characterId) {
        const cost = 5; // 5贯
        if (this.money < cost) {
            this.addLog('金钱不足，无法支付茶会费用。');
            return false;
        }

        const character = getCharacterTemplateByNumId(characterId);
        if (!character) return false;

        const currentIntimacy = this.getIntimacy(characterId);
        if (currentIntimacy < -1) {
            this.addLog(`${character.name}拒绝了你的茶会邀请。`);
            return false;
        }

        this.money -= cost;

        // 简单成功判定，根据口才技能提高成功率
        const eloquenceLevel = this.getSkillLevel('eloquence');
        const successChance = 0.5 + eloquenceLevel * 0.15;
        const success = Math.random() < successChance;

        if (success) {
            const increase = 10 + Math.floor(Math.random() * 6);
            const newIntimacy = this.addIntimacy(characterId, increase);
            this.addLog(`茶会愉快，你和${character.name}相谈甚欢，亲密度+${increase}。`);
            this.addLog(`现在关系：${this.getIntimacyDescription(newIntimacy)} ${this.getIntimacyHearts(newIntimacy)}`);
        } else {
            this.addLog(`谈话不太投机，${character.name}早早告辞，亲密度没有变化。`);
        }

        // 消耗1天时间
        this.advanceDays(1);
        this.saveRelationships();
        return true;
    }

    /**
     * 邀请宴饮
     * @param {number} characterId
     * @returns {boolean} 是否成功
     */
    inviteFeast(characterId) {
        const cost = 15; // 15贯
        if (this.money < cost) {
            this.addLog('金钱不足，无法支付宴饮费用。');
            return false;
        }

        const character = getCharacterTemplateByNumId(characterId);
        if (!character) return false;

        const currentIntimacy = this.getIntimacy(characterId);
        if (currentIntimacy < 0) {
            this.addLog(`${character.name}拒绝了你的宴饮邀请。`);
            return false;
        }

        this.money -= cost;

        const eloquenceLevel = this.getSkillLevel('eloquence');
        const successChance = 0.6 + eloquenceLevel * 0.1;
        const success = Math.random() < successChance;

        if (success) {
            const increase = 15 + Math.floor(Math.random() * 11);
            const newIntimacy = this.addIntimacy(characterId, increase);
            this.addLog(`宴饮尽兴，你和${character.name}开怀畅饮，亲密度+${increase}。`);
            this.addLog(`现在关系：${this.getIntimacyDescription(newIntimacy)} ${this.getIntimacyHearts(newIntimacy)}`);
        } else {
            this.addLog(`${character.name}因有事提前离去，亲密度只增加了一点。`);
            this.addIntimacy(characterId, 5);
        }

        // 消耗1天时间
        this.advanceDays(1);
        this.saveRelationships();
        return true;
    }

    /**
     * 请求切磋武艺
     * @param {number} characterId
     * @returns {boolean} 是否同意切磋
     */
    requestDuel(characterId) {
        const character = getCharacterTemplateByNumId(characterId);
        if (!character) return false;

        const intimacy = this.getIntimacy(characterId);
        if (intimacy < 1) {
            this.addLog(`${character.name}不愿意和你切磋。`);
            return false;
        }

        // 性格判断：豪勇性格更容易同意
        if (character.personality === '豪勇' || character.personality === '勇猛') {
            this.addLog(`${character.name}欣然同意了你的切磋邀请！`);
        } else if (character.personality === '慎重') {
            if (Math.random() > 0.5) {
                this.addLog(`${character.name}稍加犹豫后，同意了切磋。`);
            } else {
                this.addLog(`${character.name}今日无心比武，拒绝了你。`);
                return false;
            }
        }

        // 切磋会进入个人战，这里只记录状态，实际战斗由个人战系统处理
        this.addLog(`你准备和${character.name}切磋武艺。`);
        this.currentSocialTarget = characterId;

        // 不消耗时间，进入个人战界面后再计算
        return true;
    }

    /**
     * 切磋完成后处理亲密度
     */
    onDuelComplete(characterId, playerWon) {
        const character = getCharacterTemplateByNumId(characterId);
        if (!character) return;

        let increase = 2;
        if (playerWon) {
            increase = character.personality === '豪勇' ? 10 : 5;
            this.addLog(`你战胜了${character.name}，亲密度+${increase}。`);

            // 有几率习得对方的秘传卡
            this.tryLearnSecretFromCharacter(characterId);
        } else {
            this.addLog(`${character.name}战胜了你，但也指点了你几招，亲密度+${increase}。`);
        }

        this.addIntimacy(characterId, increase);
        this.advanceDays(1);
        this.saveRelationships();
    }

    /**
     * 尝试从NPC习得秘传卡
     */
    tryLearnSecretFromCharacter(characterId) {
        const character = getCharacterTemplateByNumId(characterId);
        if (!character || !character.exclusiveSecretCard) return false;

        // 需要拥有该人物卡
        const cardId = `CHAR_${character.templateId}`;
        if (!this.hasCard(cardId)) return false;

        // 需要武艺达到一定等级
        const martialLevel = this.getSkillLevel('martial');
        if (martialLevel < 3) return false;

        const secretCardId = character.exclusiveSecretCard;
        if (this.hasCard(secretCardId)) return false;

        // 50%几率习得
        if (Math.random() > 0.5) return false;

        this.acquireCard(secretCardId);
        this.addLog(`🎉 你在切磋中领悟了${character.name}的秘传【${getCardById(secretCardId).name}】！`);
        return true;
    }

    /**
     * 执行结义
     */
    doSwearBrotherhood(characterId) {
        if (!this.canSwearBrotherhood(characterId)) {
            this.addLog('无法结义，条件不满足。');
            return false;
        }

        const character = getCharacterTemplateByNumId(characterId);
        this.brothers.push(characterId);
        this.setIntimacy(characterId, 5); // 锁定为5心
        this.addLog(`🎯 你和${character.name}桃园结义，从此结为异姓兄弟！`);
        this.addLog('你们关系锁定为生死相随，永不背叛。');

        // 消耗50贯和1天
        this.money -= 50;
        this.advanceDays(1);
        this.saveRelationships();
        return true;
    }

    /**
     * 求婚
     */
    proposeMarriage(characterId) {
        if (!this.canProposeMarriage(characterId)) {
            this.addLog('无法求婚，条件不满足。');
            return false;
        }

        const character = getCharacterTemplateByNumId(characterId);
        // 需要聘礼
        const hasEnoughTreasure = this.countTreasures() >= 1;
        if (this.money < 100 || !hasEnoughTreasure) {
            this.addLog('你需要至少100贯和一件宝物作为聘礼。');
            return false;
        }

        // 扣除聘礼
        this.money -= 100;
        // TODO: 扣除一件宝物，这里简化

        this.spouse = characterId;
        this.setIntimacy(characterId, 5); // 锁定为5心
        this.addLog(`💍 你和${character.name}成婚了！婚礼举办了三天，宾主尽欢。`);
        this.addLog('你们关系锁定为生死相随，永不分离。');

        // 消耗3天
        this.advanceDays(3);
        this.saveRelationships();
        return true;
    }

    /**
     * 统计玩家持有的宝物卡数量
     */
    countTreasures() {
        let count = 0;
        for (const cardId in this.collectedCards) {
            const card = getCardById(cardId);
            if (card && card.type === CardTypes.TREASURE) {
                count++;
            }
        }
        return count;
    }

    /**
     * 获取当前城市中的所有NPC
     * 根据人物模板的locationCityId匹配
     */
    getCharactersInCurrentCity() {
        const allCharacters = getAllCharacterTemplates();
        return allCharacters.filter(c => c.locationCityId === this.currentCityId);
    }

    /**
     * 自然衰减：每半年无互动亲密度-2
     * 应该在时间推进半年时调用
     */
    decayIntimacy() {
        // 每半年（6个月）衰减一次
        for (const key in this.relationships) {
            if (this.relationships[key] > 0) {
                this.relationships[key] -= 2;
                if (this.relationships[key] < 0) {
                    this.relationships[key] = 0;
                }
            }
        }
        this.addLog('长时间未互动的人际关系略有疏远。');
        this.saveRelationships();
    }

    /**
     * 从localStorage加载亲密度关系
     */
    loadRelationships() {
        try {
            const saved = localStorage.getItem('hongwu_relationships');
            if (saved) {
                const data = JSON.parse(saved);
                if (data.relationships && typeof data.relationships === 'object') {
                    this.relationships = data.relationships;
                }
            }
            // 加载配偶和结义
            const savedMarriage = localStorage.getItem('hongwu_marriage_brothers');
            if (savedMarriage) {
                const data = JSON.parse(savedMarriage);
                if (data.spouse !== undefined) {
                    this.spouse = data.spouse;
                }
                if (data.brothers && Array.isArray(data.brothers)) {
                    this.brothers = data.brothers;
                }
            }
        } catch (e) {
            console.warn('加载人际关系失败', e);
        }
    }

    /**
     * 保存亲密度关系到localStorage
     */
    saveRelationships() {
        try {
            const data = {
                relationships: this.relationships,
                updated_at: new Date().toISOString()
            };
            localStorage.setItem('hongwu_relationships', JSON.stringify(data));

            const marriageData = {
                spouse: this.spouse,
                brothers: this.brothers
            };
            localStorage.setItem('hongwu_marriage_brothers', JSON.stringify(marriageData));
        } catch (e) {
            console.warn('保存人际关系失败', e);
        }
    }

    /**
     * 开始与某个NPC的社交互动
     */
    startSocialInteraction(characterId) {
        this.currentSocialTarget = characterId;
        this.currentScene = GameScene.SOCIAL_VIEW;
        const character = getCharacterTemplateByNumId(characterId);
        this.addLog(`你开始与${character.name}交谈。`);
    }

    /**
     * 淮西集团同乡加成 - 预设初始关系
     * 这个在游戏初始化时调用，给同乡们加好感
     */
    applyHuaixiGroupBonus() {
        // 淮西集团核心人物ID列表
        const huaixiIds = [
            1, // 朱元璋自己不算
            2, // 徐达
            3, // 常遇春
            4, // 汤和
            // ... 更多可以后续添加
        ];

        const playerId = this.playerCharacterId;
        // 如果玩家是朱元璋，给他的同乡加好感
        if (playerId === 1) {
            huaixiIds.forEach(id => {
                if (id !== playerId) {
                    this.addIntimacy(id, 20); // +20 = 2心
                }
            });
        }
    }

 /**
  * 从localStorage加载合战胜利次数
  */
 loadBattleWins() {
     try {
         const saved = localStorage.getItem('hongwu_battle_wins');
         if (saved) {
             const data = JSON.parse(saved);
             this.battleWins.total = data.total || 0;
             this.battleWins.naval = data.naval || 0;
             this.battleWins.field = data.field || 0;
             this.battleWins.siege = data.siege || 0;
             this.battleWins.firearm = data.firearm || 0;
         }
     } catch (e) {
         console.warn('加载合战胜利次数失败', e);
     }
 }

 /**
  * 保存合战胜利次数到localStorage
  */
 saveBattleWins() {
     try {
         localStorage.setItem('hongwu_battle_wins', JSON.stringify(this.battleWins));
     } catch (e) {
         console.warn('保存合战胜利次数失败', e);
     }
 }

 /**
  * 增加合战胜利次数
  * @param {string} battleType - 'field'|'siege'|'naval'
  */
 incrementBattleWinCount(battleType) {
     this.battleWins.total++;
     if (typeof this.battleWins[battleType] !== 'undefined') {
         this.battleWins[battleType]++;
     }
     this.saveBattleWins();

     // 检查是否解锁称号
     this.checkBattleTitles();
 }

 /**
  * 检查是否解锁合战相关称号
  */
 checkBattleTitles() {
     // 策士 - 合战胜利10次
     if (this.battleWins.total >= 10 && !this.hasCard('TITLE_BATTLE_1')) {
         this.acquireCard('TITLE_BATTLE_1');
     }
     // 军师 - 合战胜利20次
     if (this.battleWins.total >= 20 && !this.hasCard('TITLE_BATTLE_2')) {
         this.acquireCard('TITLE_BATTLE_2');
     }
     // 智将 - 合战胜利40次
     if (this.battleWins.total >= 40 && !this.hasCard('TITLE_BATTLE_3')) {
         this.acquireCard('TITLE_BATTLE_3');
     }
     // 军神 - 合战胜利80次
     if (this.battleWins.total >= 80 && !this.hasCard('TITLE_BATTLE_4')) {
         this.acquireCard('TITLE_BATTLE_4');
     }
     // 水战都督 - 水战胜利20次
     if (this.battleWins.naval >= 20 && !this.hasCard('TITLE_BATTLE_NAVAL')) {
         this.acquireCard('TITLE_BATTLE_NAVAL');
     }
     // 火器专家 - 使用火器胜利30次
     if (this.battleWins.firearm >= 30 && !this.hasCard('TITLE_BATTLE_FIREARM')) {
         this.acquireCard('TITLE_BATTLE_FIREARM');
     }
 }
};
