/**
 * 游戏结果管理器
 * 统一处理所有小游戏的结算逻辑
 * 提取各个小游戏中重复的奖励计算代码
 */

window.GameResultManager = {
    /**
     * 处理练习模式结算（在设施中练习技能）
     * @param {Object} gameState - 游戏主状态
     * @param {Object} gameView - 游戏视图
     * @param {string} skillType - 技能类型
     * @param {number} ratio - 完成率 0-1
     * @param {string} resultText - 结果文本
     * @param {number} days - 消耗天数，默认为5
     * @description 用于设施中的练习，不需要任务结算，只给经验消耗时间
     */
    settlePractice(gameState, gameView, skillType, ratio, resultText, days = 5) {
        const expGained = Math.round(10 * ratio);
        gameState.addSkillExp(skillType, expGained);
        gameState.addLog(`${resultText} 获得 ${expGained} ${skillType}经验，消耗${days}天时间。`);
        gameState.advanceDays(days);

        // 清理游戏状态，返回设施场景
        this.clearGameState(gameState, gameState.currentTask ? null : 'FACILITY');
        gameView.renderAll();
    },

    /**
     * 处理任务模式结算（主命任务）
     * @param {Object} gameState - 游戏主状态
     * @param {Object} gameView - 游戏视图
     * @param {Object} task - 任务模板
     * @param {number} ratio - 完成率 0-1
     * @param {string} resultText - 结果文本
     * @description 用于主命任务，结算后返回城市，推进两个月
     */
    settleMission(gameState, gameView, task, ratio, resultText) {
        const finalMerit = Math.round(task.rewardMerit * ratio);
        const finalMoney = Math.round(task.rewardMoney * ratio);
        const expGained = task.requiredSkill ? Math.round(10 * ratio) : 0;

        gameState.merit += finalMerit;
        gameState.money += finalMoney;
        if (task.requiredSkill) {
            gameState.addSkillExp(task.requiredSkill, expGained);
        }

        gameState.checkRolePromotion();
        gameState.addLog(`任务【${task.name}】完成：${resultText} 获得 ${finalMerit} 功勋，${finalMoney} 金钱${task.requiredSkill ? '，' + expGained + ' ' + task.requiredSkill + '经验' : ''}。`);

        gameView.advanceTwoMonths();
        this.clearGameState(gameState, 'CITY');
        gameView.renderAll();
    },

    /**
     * 根据误差计算完成率 - 用于筑城考工这类误差越小得分越高的游戏
     * @param {number} error - 误差值
     * @param {number} perfectTolerance - 完美误差阈值
     * @param {number} goodTolerance - 合格误差阈值
     * @param {number} maxError - 最大误差
     * @returns {Object} { ratio, resultText }
     */
    calculateRatioByError(error, perfectTolerance, goodTolerance, maxError) {
        let ratio, resultText;

        if (error <= perfectTolerance) {
            ratio = 1.0;
            resultText = `🎉 完胜！误差${error} ≤ ${perfectTolerance}，完美符合要求。`;
        } else if (error <= goodTolerance) {
            ratio = 0.7;
            resultText = `✅ 合格！误差${error} ≤ ${goodTolerance}，合格。`;
        } else {
            ratio = Math.max(0.2, 1 - error / maxError);
            resultText = `❌ 不合格，误差${error} > ${goodTolerance}，误差太大。`;
        }

        return { ratio, resultText };
    },

    /**
     * 根据剩余资金计算完成率 - 用于开垦荒地这类需要剩余资金判断完胜的
     * @param {boolean} success - 是否完成目标
     * @param {number} remaining - 剩余资源
     * @param {number} perfectThreshold - 完胜阈值
     * @param {number} total - 总目标
     * @returns {Object} { ratio, resultText }
     */
    calculateRatioByRemaining(success, remaining, perfectThreshold, total) {
        let ratio, resultText;

        if (!success) {
            ratio = 0.3;
            resultText = '资源耗尽，任务失败。';
        } else {
            if (remaining >= perfectThreshold) {
                ratio = 1.0;
                resultText = `🎉 全部${total}项任务完成！剩余资源${remaining}，完胜！`;
            } else {
                ratio = 0.6;
                resultText = `✅ 全部${total}项任务完成，但剩余资源${remaining}，小胜。`;
            }
        }

        return { ratio, resultText };
    },

    /**
     * 根据正确数量计算完成率
     * @param {number} correct - 正确数
     * @param {number} total - 总数
     * @returns {Object} { ratio, resultText }
     */
    calculateRatioByCorrect(correct, total) {
        const ratio = correct / total;
        if (ratio >= 0.9) {
            return { ratio, resultText: `🎉 完胜！${correct}/${total} 正确。` };
        } else if (ratio >= 0.6) {
            return { ratio, resultText: `✅ 合格！${correct}/${total} 正确。` };
        } else {
            return { ratio, resultText: `❌ 不合格，仅${correct}/${total} 正确。` };
        }
    },

    /**
     * 清理小游戏状态，切换场景
     * @param {Object} gameState - 游戏主状态
     * @param {string|null} targetScene - 目标场景 'CITY' | 'FACILITY' | null 不切换
     */
    clearGameState(gameState, targetScene = null) {
        // 清理所有可能的小游戏状态
        const gameKeys = [
            'farmingGame', 'eloquenceGame', 'infantryGame', 'cavalryGame',
            'engineeringGame', 'tradeGame', 'lawGame', 'navyGame',
            'strategyGame', 'spyGame', 'navigationGame', 'medicineGame',
            'calligraphyGame', 'ritualGame', 'firearmGame', 'battleGame',
            'martialGame', 'duelGame'
        ];

        // 停止所有动画
        AnimationManager.stopAllAnimations(gameState);

        // 清理状态引用
        gameKeys.forEach(key => {
            if (gameState[key]) {
                gameState[key] = null;
            }
        });

        // 清空当前任务
        gameState.currentTask = null;

        // 切换场景
        if (targetScene === 'CITY') {
            gameState.currentScene = GameScene.CITY_VIEW;
        } else if (targetScene === 'FACILITY') {
            gameState.currentScene = GameScene.FACILITY;
            gameState.currentFacility = null;
        }
    },

    /**
     * 添加日志到游戏日志区域（通用方法）
     * @param {string} logId - 日志区域DOM ID
     * @param {string} text - 日志文本（支持HTML）
     */
    addLog(logId, text) {
        const logEl = document.getElementById(logId);
        if (logEl) {
            logEl.innerHTML += `<div class="game-log-entry">${text}</div>`;
            logEl.scrollTop = logEl.scrollHeight;
        }
    }
};
