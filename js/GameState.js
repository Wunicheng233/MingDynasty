/**
 * 游戏场景枚举
 */
window.GameScene = {
    CHARACTER_VIEW: 'character',
    CITY_VIEW: 'city',
    MAP_VIEW: 'map',
    TASK_LIST: 'tasks',
    FARMING_GAME: 'farming',
    CARD_COLLECTION: 'cards'
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

        // 从localStorage加载全局卡片收集（跨存档继承）
        this.loadGlobalCollection();

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
};
