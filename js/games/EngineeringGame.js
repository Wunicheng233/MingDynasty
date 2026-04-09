/**
 * 修筑城墙小游戏（工程）
 * 筑城考工 - 使用不同大小石块堆砌，让总重量尽可能接近目标
 */

window.EngineeringGame = {
    /**
     * 启动游戏
     */
    start(gameView, gameState, title = null) {
        const task = gameState.currentTask;
        // 随机目标重量在 1400-1800 之间
        const targetWeight = Math.floor(Math.random() * 400) + 1400;

        gameState.engineeringGame = {
            targetWeight: targetWeight,
            currentWeight: 0,
            // 可用石块: 大块500，中块250，小块50
            availableStones: [
                {name: '大块青石', weight: 500},
                {name: '中块条石', weight: 250},
                {name: '小块碎石', weight: 50}
            ],
            isPractice: title !== null
        };

        this.render(gameState, title);
    },

    /**
     * 渲染当前状态
     */
    render(gameState, title = null) {
        const game = gameState.engineeringGame;
        const headerTitle = title || (gameState.currentTask ? gameState.currentTask.name : '修筑城防');
        let html = `
            <div class="engineering-header">
                <h2>${headerTitle}</h2>
                <p>用不同大小石块堆砌城墙，让总重量尽可能接近目标重量</p>
                <p>目标重量: <strong>${game.targetWeight}</strong> 贯</p>
                <p>当前重量: <strong id="current-weight">${game.currentWeight}</strong> 贯</p>
            </div>
            <div class="engineering-actions">
                <p>请选择添加的石块：</p>
                <div style="display: flex; flex-direction: column; gap: 10px; max-width: 500px; margin: 0 auto;">
                    <button class="btn primary-btn engineering-stone" data-weight="500">1. 大块青石 (500贯)</button>
                    <button class="btn primary-btn engineering-stone" data-weight="250">2. 中块条石 (250贯)</button>
                    <button class="btn primary-btn engineering-stone" data-weight="50">3. 小块碎石 (50贯)</button>
                </div>
            </div>
            <div class="engineering-log" id="engineering-log"></div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        this.bindEvents(gameState, gameView);
    },

    /**
     * 绑定事件
     */
    bindEvents(gameState, gameView) {
        document.querySelectorAll('.engineering-stone').forEach(btn => {
            btn.addEventListener('click', () => {
                this.addStone(parseInt(btn.dataset.weight), gameState, gameView);
            });
        });
    },

    /**
     * 添加石块
     */
    addStone(weight, gameState, gameView) {
        const game = gameState.engineeringGame;
        game.currentWeight += weight;
        const stone = game.availableStones.find(s => s.weight === weight);
        this.addLog(`添加了${stone.name}，重量+${weight}，当前${game.currentWeight}贯`, gameState);

        document.getElementById('current-weight').textContent = game.currentWeight;

        // 检查是否达到或超过目标
        if (game.currentWeight >= game.targetWeight) {
            this.finish(gameState, gameView);
        }
    },

    /**
     * 添加日志
     */
    addLog(text, gameState) {
        const logEl = document.getElementById('engineering-log');
        logEl.innerHTML += `<div class="engineering-log-entry">${text}</div>`;
        logEl.scrollTop = logEl.scrollHeight;
    },

    /**
     * 结算游戏
     */
    finish(gameState, gameView) {
        const game = gameState.engineeringGame;
        const task = gameState.currentTask;

        const error = Math.abs(game.currentWeight - game.targetWeight);
        let ratio;
        let resultText;

        if (error <= 20) {
            ratio = 1.0;
            resultText = `🎉 完胜！总重量${game.currentWeight}，目标${game.targetWeight}，误差${error}贯 ≤ 20，完美符合要求。`;
        } else if (error <= 50) {
            ratio = 0.7;
            resultText = `✅ 合格！总重量${game.currentWeight}，目标${game.targetWeight}，误差${error}贯 ≤ 50，合格。`;
        } else {
            ratio = Math.max(0.2, 1 - error / 100);
            resultText = `❌ 不合格，总重量${game.currentWeight}，目标${game.targetWeight}，误差${error}贯 > 50，误差太大。`;
        }

        if (game.isPractice) {
            // 工部作坊练习 - 非任务，固定奖励工政经验，消耗5天
            const expGained = Math.round(10 * ratio);
            gameState.addSkillExp('engineering', expGained);
            gameState.addLog(`修筑城防练习完成：${resultText} 获得 ${expGained} 工政经验，消耗5天时间。`);
            gameState.advanceDays(5);
            gameState.engineeringGame = null;
            // 返回设施场景
            gameState.currentScene = GameScene.FACILITY;
            gameView.renderAll();
        } else {
            // 正常任务结算
            const finalMerit = Math.round(task.rewardMerit * ratio);
            const finalMoney = Math.round(task.rewardMoney * ratio);
            const expGained = Math.round(10 * ratio);

            gameState.merit += finalMerit;
            gameState.money += finalMoney;
            if (task.requiredSkill) {
                gameState.addSkillExp(task.requiredSkill, expGained);
            }

            gameState.checkRolePromotion();
            gameState.addLog(`任务【${task.name}】完成：${resultText} 获得 ${finalMerit} 功勋，${finalMoney} 金钱，${expGained} 工政经验。`);

            gameView.advanceTwoMonths();
            gameState.currentTask = null;
            gameState.engineeringGame = null;
            gameState.currentScene = GameScene.CITY_VIEW;
            gameView.renderAll();
        }
    }
};
