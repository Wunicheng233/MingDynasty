/**
 * 时间推进系统 - 拆分自GameState
 * 负责日期管理、时间推进、季节性衰减
 */

window.TimeSystem = {
    /**
     * 推进N天
     * @param {GameState} gameState
     * @param {number} days
     */
    advanceDays(gameState, days) {
        for (let i = 0; i < days; i++) {
            this.nextDay(gameState);
        }
    },

    /**
     * 推进到下一天
     * @param {GameState} gameState
     */
    nextDay(gameState) {
        // 重置评定会标记
        gameState._shouldAutoGoToEvaluation = false;

        gameState.day++;

        // 检查是否进入下个月
        const daysInMonth = this.getDaysInMonth(gameState.year, gameState.month);
        if (gameState.day > daysInMonth) {
            this.nextMonth(gameState);
        }

        // 检查当前任务是否超时
        if (gameState.currentTask && SkillSystem.checkMissionTimeout(gameState)) {
            const template = getMissionTemplateById(gameState.currentTask.templateId);
            gameState.addLog(`主命【${template.name}】超时未完成，任务失败！`);
            gameState.completeMission(false);
        }

        // 添加日志
        const yearTitle = gameState.year >= 1368 ? `洪武${gameState.year - 1368}年` : `至正${gameState.year - 1341 + 1}年`;
        gameState.addLog(`时间来到了${yearTitle}${gameState.month}月${gameState.day}日`);

        // 每天推进后检测是否有事件触发
        // 如果当前已经有事件在进行中，不重复检测
        if (!gameState.currentEvent && typeof EventScheduler !== 'undefined') {
            EventScheduler.checkAndTrigger(gameState);
        }
    },

    /**
     * 获取指定月份有多少天
     * 简单算法：1-12月，大小月
     */
    getDaysInMonth(year, month) {
        // 1,3,5,7,8,10,12 → 31天
        // 4,6,9,11 → 30天
        // 2月 → 28天（不考虑闰年，简化）
        if ([1, 3, 5,7, 8, 10, 12].includes(month)) {
            return 31;
        } else if ([4, 6, 9, 11].includes(month)) {
            return 30;
        } else {
            return 28;
        }
    },

    /**
     * 推进到下一个月
     * @param {GameState} gameState
     */
    nextMonth(gameState) {
        gameState.day = 1;
        gameState.month++;

        // 检查是否进入下一年
        if (gameState.month > 12) {
            gameState.month = 1;
            gameState.year++;
        }

        // 每半年（6个月）亲密度自然衰减
        const monthInYear = gameState.month;
        if (monthInYear === 1 || monthInYear === 7) {
            // 半年衰减一次
            SocialSystem.decayIntimacy(gameState);
        }

        // 评定会检查：每隔两个月召开一次，固定在奇数月一日
        if (SkillSystem.isEvaluationDay(gameState)) {
            if (!SkillSystem.isAtMainCity(gameState) && !gameState.currentTask) {
                // 不在主城，扣除功勋
                SkillSystem.handleEvaluationAbsence(gameState);
            } else if (SkillSystem.isAtMainCity(gameState) && !gameState.currentTask && !gameState.currentEvent) {
                // 在主城且没有当前任务，评定会召开，必须做出选择才能离开
                const title = SkillSystem.isPlayerRuler(gameState) ? '朝会' : '评定会';
                gameState.addLog(`📅 今日${title}召开，请接取新的主命！`);
                gameState._shouldAutoGoToEvaluation = true;
                gameState.evaluationPendingSelection = true;
            }
        }
    },

    /**
     * 获取当前日期的格式化字符串
     * @param {GameState} gameState
     * @returns {string} "XXXX年XX月XX日"
     */
    formatDate(gameState) {
        return `${gameState.year}年${gameState.month}月${gameState.day}日`;
    }
};
