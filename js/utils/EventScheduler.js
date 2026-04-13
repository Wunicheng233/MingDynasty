/**
 * 事件调度器模块
 * 条件检测、优先级排序、效果执行
 * 按照数据驱动设计，添加新事件只需修改data/events.js，不需要改这里
 */

window.EventScheduler = {
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

        // 地点条件 - 当前城市ID（字符串）
        if (trigger.location) {
            const currentCity = getCityTemplateById(gameState.currentCityId);
            if (!currentCity || currentCity.cityId !== trigger.location) {
                return false;
            }
        }

        // 身份条件
        if (trigger.identity) {
            const player = gameState.getPlayerCharacter();
            if (!player || player.role !== trigger.identity) {
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

        // 亲密度条件 {characterId: number, minLevel: number}
        if (trigger.intimacy) {
            const { characterId, minLevel } = trigger.intimacy;
            const intimacy = gameState.getIntimacy(characterId);
            // SocialSystem中intimacy已经是等级值 (-4 ~ +5)，直接比较
            if (intimacy < minLevel) {
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

        // 概率条件
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
                const player = gameState.getPlayerCharacter();
                if (player) {
                    player.role = effect.value;
                }
                return null;

            case EffectTypes.CHANGE_FACTION:
                const p = gameState.getPlayerCharacter();
                if (p) {
                    p.faction = effect.value;
                }
                return null;

            case EffectTypes.ADVANCE_TIME:
                gameState.advanceDays(effect.value);
                return null;

            case EffectTypes.ADD_SKILL_EXP:
                gameState.addSkillExp(effect.skillId, effect.exp);
                return null;

            case EffectTypes.CHANGE_ROLE:
                gameState.currentRoleId = effect.value;
                return null;

            case EffectTypes.ADD_MERIT:
                gameState.merit += effect.value;
                gameState.checkRolePromotion();
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
