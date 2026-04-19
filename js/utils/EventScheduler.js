/**
 * 事件调度器模块
 * 条件检测、优先级排序、效果执行
 * 按照数据驱动设计，添加新事件只需修改data/events.js，不需要改这里
 */

import { getCityTemplateById, getAllCityTemplates } from '../../data/cities.js';
import { getAllEventTemplates, getEventPriority, EventTypes } from '../../data/events.js';
import EconomicCalculator from './EconomicCalculator.js';

const EventScheduler = {
    /**
     * 检查单个条件是否满足
     * @param {Object} trigger - 触发条件对象
     * @param {Object} gameState - 游戏状态
     * @returns {boolean} 是否满足
     */
    checkConditions(trigger, gameState) {
        // 时间条件
        if (trigger.time) {
            if (!this.checkTimeCondition(trigger.time, gameState)) {
                return false;
            }
        }

        const currentCity = getCityTemplateById(gameState.currentCityId);

        // 地点条件 - 单个城市ID或城市ID数组
        if (trigger.location) {
            const locationMatch = Array.isArray(trigger.location)
                ? trigger.location.includes(currentCity ? currentCity.cityId : null)
                : currentCity && currentCity.cityId === trigger.location;
            if (!locationMatch) {
                return false;
            }
        }

        // 地点类型条件 - 城市类型（都城/普通/边关/海港）
        if (trigger.locationType) {
            if (!currentCity || currentCity.type !== trigger.locationType) {
                return false;
            }
        }

        // 地点设施条件 - 当前城市是否包含指定设施
        if (trigger.locationFacilities && trigger.locationFacilities.length > 0) {
            if (!currentCity) {
                return false;
            }
            for (const facility of trigger.locationFacilities) {
                if (!currentCity.facilities.includes(facility)) {
                    return false;
                }
            }
        }

        // 势力条件
        if (trigger.faction !== undefined) {
            // 玩家势力存储在gameState，默认从角色模板读取初始值
            const playerFaction = gameState.playerFaction || gameState.getPlayerCharacter()?.faction;
            if (playerFaction !== trigger.faction) {
                return false;
            }
        }

        // 身份条件，可接受单个值或数组
        if (trigger.identity) {
            const identityMatch = Array.isArray(trigger.identity)
                ? trigger.identity.includes(gameState.currentRoleId)
                : gameState.currentRoleId === trigger.identity;
            if (!identityMatch) {
                return false;
            }
        }

        // 需要的事件标记
        if (trigger.flagsRequired && trigger.flagsRequired.length > 0) {
            for (const flag of trigger.flagsRequired) {
                if (!gameState.hasEventFlag(flag)) {
                    return false;
                }
            }
        }

        // 禁止的事件标记（已经触发过就不能再触发）
        if (trigger.flagsForbidden && trigger.flagsForbidden.length > 0) {
            for (const flag of trigger.flagsForbidden) {
                if (gameState.hasEventFlag(flag)) {
                    return false;
                }
            }
        }

        // 亲密度条件 {characterId: number, minLevel: number, maxLevel: number}
        if (trigger.intimacy) {
            const { characterId, minLevel, maxLevel } = trigger.intimacy;
            const intimacy = gameState.getIntimacy(characterId);
            const level = EconomicCalculator.getIntimacyLevel(intimacy);
            if (minLevel !== undefined && level < minLevel) {
                return false;
            }
            if (maxLevel !== undefined && level > maxLevel) {
                return false;
            }
        }

        // 技能条件 {skillId: string, minLevel: number}
        if (trigger.skill) {
            const { skillId, minLevel } = trigger.skill;
            const level = gameState.getSkillLevel(skillId);
            if (level < minLevel) {
                return false;
            }
        }

        // 持有卡片条件
        if (trigger.cardsRequired && trigger.cardsRequired.length > 0) {
            for (const cardId of trigger.cardsRequired) {
                if (!gameState.collectedCards[cardId]) {
                    return false;
                }
            }
        }

        // 最低功勋条件
        if (trigger.meritMin !== undefined) {
            if (gameState.merit < trigger.meritMin) {
                return false;
            }
        }

        // 最低金钱条件
        if (trigger.moneyMin !== undefined) {
            if (gameState.money < trigger.moneyMin) {
                return false;
            }
        }

        // 概率条件（随机事件/可重复触发事件）
        if (trigger.probability !== undefined && trigger.probability < 1.0) {
            if (Math.random() > trigger.probability) {
                return false;
            }
        }

        // 所有条件都通过
        return true;
    },

    /**
     * 检查时间条件
     * @param {Object} timeCond - {year, month, day, operator}
     * @param {Object} gameState
     * @returns {boolean}
     */
    checkTimeCondition(timeCond, gameState) {
        const { year, month, day, operator } = timeCond;

        if (operator === '>=') {
            // 日期 >= 指定日期
            if (gameState.year < year) return false;
            if (gameState.year === year && gameState.month < month) return false;
            if (gameState.year === year && gameState.month === month && gameState.day < day) return false;
            return true;
        } else if (operator === '==') {
            // 日期 == 指定日期（比如每月1日）
            if (month !== undefined && gameState.month !== month) return false;
            if (day !== undefined && gameState.day !== day) return false;
            return true;
        }
        return true;
    },

    /**
     * 扫描所有事件，找到满足条件的候选事件
     * @param {Object} gameState
     * @returns {EventTemplate[]} 候选事件数组
     */
    findCandidateEvents(gameState) {
        const allEvents = getAllEventTemplates();
        const candidates = [];

        for (const event of allEvents) {
            // 随机事件总是可以重复触发，非随机事件只能触发一次
            if (event.type !== EventTypes.RANDOM) {
                if (gameState.isEventTriggered(event.eventId)) {
                    continue;
                }
            }

            if (this.checkConditions(event.trigger, gameState)) {
                candidates.push(event);
            }
        }

        return candidates;
    },

    /**
     * 按优先级排序，选择最高优先级事件
     * @param {EventTemplate[]} candidates
     * @returns {EventTemplate|null}
     */
    selectHighestPriority(candidates) {
        if (candidates.length === 0) return null;

        // 按优先级降序排序
        candidates.sort((a, b) => {
            const pa = getEventPriority(a);
            const pb = getEventPriority(b);
            return pb - pa;
        });

        return candidates[0];
    },

    /**
     * 检查并触发事件（入口）
     * @param {Object} gameState
     * @returns {EventTemplate|null} 触发了哪个事件，null表示没有
     */
    checkAndTrigger(gameState) {
        const candidates = this.findCandidateEvents(gameState);
        if (candidates.length === 0) {
            return null;
        }

        const selected = this.selectHighestPriority(candidates);
        if (selected) {
            // 标记已触发（非随机事件）
            if (selected.type !== EventTypes.RANDOM) {
                gameState.markEventTriggered(selected.eventId);
            }
            // 开始执行事件 - 设置当前事件到游戏状态，切换场景
            gameState.startEvent(selected);
            return selected;
        }

        return null;
    },

    /**
     * 执行单个效果
     * @param {Object} effect - 效果对象
     * @param {Object} gameState - 游戏状态
     * @returns {any} 特殊效果返回对应对象（比如用于跳转）
     */
    executeEffect(effect, gameState) {
        switch (effect.type) {
            case EffectTypes.ADD_MONEY:
                gameState.money += effect.value;
                return null;

            case EffectTypes.SUB_MONEY:
                gameState.money = Math.max(0, gameState.money - effect.value);
                return null;

            case EffectTypes.ADD_CARD:
                gameState.acquireCard(effect.cardId);
                return null;

            case EffectTypes.SET_FLAG:
                gameState.setEventFlag(effect.flag, true);
                return null;

            case EffectTypes.CLEAR_FLAG:
                gameState.setEventFlag(effect.flag, false);
                return null;

            case EffectTypes.ADD_INTIMACY:
                gameState.addIntimacy(effect.target, effect.value);
                return null;

            case EffectTypes.CHANGE_IDENTITY:
                // 修改玩家当前身份（存储在gameState）
                gameState.currentRoleId = effect.value;
                gameState.checkRolePromotion();
                return null;

            case EffectTypes.CHANGE_FACTION:
                // 修改玩家当前势力（存储在gameState）
                gameState.playerFaction = effect.value;
                return null;

            case EffectTypes.ADVANCE_TIME:
                gameState.advanceDays(effect.value);
                return null;

            case EffectTypes.ADD_SKILL_EXP:
                gameState.addSkillExp(effect.skillId, effect.exp);
                return null;

            case EffectTypes.ADD_SKILL_LEVEL:
                // 直接提升技能等级
                for (let i = 0; i < effect.levels; i++) {
                    gameState.addSkillExp(effect.skillId, 9999); // 足够大的经验值确保升一级
                }
                return null;

            case EffectTypes.CHANGE_ROLE:
                gameState.currentRoleId = effect.value;
                return null;

            case EffectTypes.CHANGE_CITY_OWNER:
                // 改变城池所属势力
                const cityEconomy = gameState.getCityEconomy(effect.cityId);
                if (cityEconomy) {
                    cityEconomy.ownerFaction = effect.factionId;
                    gameState.addLog(`城池已归属新势力：${effect.cityId}`);
                }
                return null;

            case EffectTypes.UNLOCK_FACILITY:
                // 解锁城市设施
                const cityTpl = getCityTemplateById(effect.cityId);
                if (cityTpl) {
                    if (!cityTpl.facilities) {
                        cityTpl.facilities = [];
                    }
                    if (!cityTpl.facilities.includes(effect.facility)) {
                        cityTpl.facilities.push(effect.facility);
                        gameState.addLog(`解锁新设施：${effect.facility}`);
                    }
                }
                return null;

            case EffectTypes.UNLOCK_MISSION_CATEGORY:
                // 开放主命任务分类
                // 主命系统已经按身份和分类筛选，这里只需要标记即可
                // 后续可扩展存储解锁的分类到gameState
                gameState.setEventFlag(`MISSION_CAT_${effect.category}_UNLOCKED`, true);
                gameState.addLog(`开放主命分类：${effect.category}`);
                return null;

            case EffectTypes.ADD_MERIT:
                gameState.merit += effect.value;
                gameState.checkRolePromotion();
                return null;

            case 'add_salary':
                // 发放两个月俸禄
                const salary = EconomicCalculator.calculateBiMonthlySalary(gameState.currentRoleId);
                if (salary > 0) {
                    gameState.money += salary;
                    gameState.logs.push(`领取两个月俸禄：${EconomicCalculator.wenToGuan(salary).toFixed(2)} 贯`);
                }
                return null;

            case 'collect_quarterly_tax':
                // 收集所有所属城镇的季度税收
                let totalTax = 0;
                const allCities = getAllCityTemplates();
                for (const cityTpl of allCities) {
                    const cityEconomy = gameState.getCityEconomy(cityTpl.id);
                    // 只有属于玩家势力的城市才收税
                    // 玩家势力从gameState获取
                    const playerFaction = gameState.playerFaction || gameState.getPlayerCharacter().faction;
                    if (cityEconomy.ownerFaction === playerFaction) {
                        const tax = EconomicCalculator.calculateCityTax(cityEconomy, cityTpl);
                        totalTax += tax;
                        const loyaltyChange = EconomicCalculator.calculateLoyaltyChange(cityEconomy.taxRate || 0.15);
                        cityEconomy.loyalty = (cityEconomy.loyalty || 50) + loyaltyChange;
                        cityEconomy.loyalty = Math.max(0, Math.min(100, cityEconomy.loyalty));
                    }
                }
                if (totalTax > 0) {
                    gameState.money += totalTax;
                    gameState.logs.push(`收取季度税收：${EconomicCalculator.wenToGuan(totalTax).toFixed(2)} 贯`);
                }
                return null;

            case 'daily_work_random_reward':
                // 酒馆打工人随机报酬，30-150文，有概率多给或少给
                let baseMin = 30;
                let baseMax = 150;
                // 根据体力/强壮技能可以多一点
                const strengthLevel = gameState.getSkillLevel('martial');
                if (strengthLevel > 3) {
                    baseMin += 30;
                    baseMax += 30;
                }
                const reward = Math.floor(baseMin + Math.random() * (baseMax - baseMin + 1));
                gameState.money += reward;
                gameState.advanceDays(1);
                if (reward >= 120) {
                    gameState.logs.push(`今天活特别累，掌柜多给了工钱，你赚到 ${reward} 文（${EconomicCalculator.wenToGuan(reward).toFixed(2)} 贯）`);
                } else {
                    gameState.logs.push(`干完一天活，你赚到 ${reward} 文（${EconomicCalculator.wenToGuan(reward).toFixed(2)} 贯）`);
                }
                gameState.currentEvent = null;
                return null;

            case EffectTypes.TRIGGER_BATTLE:
                // 返回需要触发合战，让上层处理
                return { type: 'battle', data: effect.value };

            case EffectTypes.TRIGGER_DUEL:
                // 返回需要触发个人战，让上层处理
                return { type: 'duel', data: effect.value };

            default:
                console.warn('未知事件效果类型:', effect.type);
                return null;
        }
    },

    /**
     * 执行玩家选择选项
     * @param {Object} event - 当前事件
     * @param {number} sceneIndex - 当前场景索引（scenes数组中）
     * @param {Object} choice - 玩家选择的选项
     * @param {Object} gameState - 游戏状态
     * @returns {number|null} 下一个场景ID，如果null表示事件结束
     */
    executeChoice(event, sceneIndex, choice, gameState) {
        // 执行所有效果
        if (choice.effects && choice.effects.length > 0) {
            for (const effect of choice.effects) {
                const result = this.executeEffect(effect, gameState);
                // 如果是触发战斗，这里会返回，但战斗由上层处理
                if (result && (result.type === 'battle' || result.type === 'duel')) {
                    // 事件结束，等待战斗完成后再继续
                    gameState.currentEvent = null;
                    return null;
                }
            }
        }

        // 返回下一个场景ID
        return choice.nextScene;
    }
};

export default EventScheduler;

// 保留全局暴露用于兼容性调试
window.EventScheduler = EventScheduler;
