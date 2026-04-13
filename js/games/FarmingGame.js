/**
 * 开垦荒地小游戏
 * 合理分配资金开垦荒地，完成10块地开垦任务
 */

window.FarmingGame = {
    /**
     * 启动游戏
     */
    start(gameView, gameState) {
        const task = gameState.currentTask;
        // 根据技能等级调整难度 (符合策划难度曲线)
        // Lv1: 10块地 50贯, Lv2: 12块地 40贯, Lv3: 15块地 30贯
        let skillLevel = 1;
        if (task && task.requiredSkill) {
            skillLevel = SkillSystem.getSkillLevel(gameState, task.requiredSkill);
        }
        let totalFields, initialMoney;
        if (skillLevel >= 3) {
            totalFields = 15;
            initialMoney = 30;
        } else if (skillLevel === 2) {
            totalFields = 12;
            initialMoney = 40;
        } else {
            totalFields = 10;
            initialMoney = 50;
        }

        // 初始化游戏状态 - 按照策划设计
        gameState.farmingGame = {
            totalFields: totalFields,
            clearedFields: 0,
            money: initialMoney,
            labor: 3,
            irrigation: 1,
            eventLog: []
        };

        this.renderRound(gameState);
    },

    /**
     * 渲染当前回合
     */
    renderRound(gameState) {
        const game = gameState.farmingGame;
        const task = gameState.currentTask;

        // 进度条
        const progressBar = '■'.repeat(game.clearedFields) + '□'.repeat(game.totalFields - game.clearedFields);

        let html = `
            <div class="farming-header">
                <h2>${task.name}</h2>
                <p>你有 ${game.totalFields} 块荒地需要开垦，合理分配资金完成开垦</p>
            </div>
            <div class="farming-status">
                <p>已开垦：${game.clearedFields}/${game.totalFields} 块 &nbsp; 剩余资金：<strong>${game.money}</strong> 贯</p>
                <p>人力：${'■'.repeat(game.labor)}${'□'.repeat(5 - game.labor)} (${game.labor}/5) → 更高人力增加开垦收益</p>
                <p>水利：${'■'.repeat(game.irrigation)}${'□'.repeat(5 - game.irrigation)} (${game.irrigation}/5) → 更高水利增加开垦收益</p>
                <p>进度：${progressBar}</p>
            </div>
            <div class="farming-log" id="farming-log">
                ${game.eventLog.map(entry => `<div class="farming-log-entry">${entry}</div>`).join('')}
            </div>
            <div class="farming-actions">
                <p>请选择本次行动：</p>
                <div class="farming-buttons" style="display: flex; flex-direction: column; gap: 10px; max-width: 500px; margin: 0 auto;">
                    <button class="btn primary-btn farming-action-btn" data-action="clear">1. 开垦荒地 (耗费8贯)</button>
                    <button class="btn primary-btn farming-action-btn" data-action="irrigate">2. 修建水利 (耗费10贯，提升产出)</button>
                    <button class="btn primary-btn farming-action-btn" data-action="recruit">3. 招募佃农 (耗费5贯，提升人力)</button>
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        this.bindEvents(gameState, gameView);
    },

    /**
     * 绑定事件
     */
    bindEvents(gameState, gameView) {
        document.querySelectorAll('.farming-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.onAction(btn.dataset.action, gameState, gameView);
            });
        });
    },

    /**
     * 处理玩家行动
     */
    onAction(action, gameState, gameView) {
        const game = gameState.farmingGame;

        switch(action) {
            case 'clear':
                if (game.money < 8) {
                    game.eventLog.push('<span class="text-warning">资金不足，无法开垦！</span>');
                    this.checkGameOver(gameState, gameView);
                    return;
                }
                game.money -= 8;
                // 根据人力和水利收获产出，增加资金
                const baseIncome = 10;
                const income = baseIncome + game.labor * 2 + game.irrigation * 3;
                game.money += income;
                game.clearedFields += 1;
                game.eventLog.push(`开垦了一块新荒地，资金-8贯，产出+${income}贯。已开垦${game.clearedFields}/${game.totalFields}块。`);

                // 每开垦3块触发随机事件
                if (game.clearedFields % 3 === 0 && game.clearedFields < game.totalFields) {
                    this.triggerRandomEvent(game);
                }
                break;

            case 'irrigate':
                if (game.money < 10) {
                    game.eventLog.push('<span class="text-warning">资金不足，无法修建水利！</span>');
                    this.checkGameOver(gameState, gameView);
                    return;
                }
                if (game.irrigation >= 5) {
                    game.eventLog.push('<span class="text-info">水利等级已经满了！</span>');
                    this.renderRound(gameState);
                    return;
                }
                game.money -= 10;
                game.irrigation += 1;
                game.eventLog.push(`修建了水利设施，资金-10贯。水利提升到${game.irrigation}。`);
                break;

            case 'recruit':
                if (game.money < 5) {
                    game.eventLog.push('<span class="text-warning">资金不足，无法招募佃农！</span>');
                    this.checkGameOver(gameState, gameView);
                    return;
                }
                if (game.labor >= 5) {
                    game.eventLog.push('<span class="text-info">人力已经足够了！</span>');
                    this.renderRound(gameState);
                    return;
                }
                game.money -= 5;
                game.labor += 1;
                game.eventLog.push(`招募了新佃农，资金-5贯。人力提升到${game.labor}。`);
                break;
        }

        this.checkGameOver(gameState, gameView);
    },

    /**
     * 触发随机事件
     */
    triggerRandomEvent(game) {
        const events = [
            {text: '☀️ 遭遇旱灾，一块已开垦地干涸绝收，需要重新开垦。', effect: () => { game.clearedFields -= 1; }},
            {text: '🦗 蝗灾爆发，损失了部分收成，资金减少5贯。', effect: () => { game.money -= 5; }},
            {text: '🌾 今年风调雨顺，获得大丰收，额外获得10贯租金。', effect: () => { game.money += 10; }},
            {text: '🌧️ 大雨冲垮了一段水渠，花费3贯修缮。', effect: () => { game.money -= 3; }}
        ];

        const event = events[Math.floor(Math.random() * events.length)];
        event.effect();
        game.eventLog.push(`<span class="event">【随机事件】${event.text}</span>`);
    },

    /**
     * 检查游戏是否结束
     */
    checkGameOver(gameState, gameView) {
        const game = gameState.farmingGame;

        if (game.money <= 0) {
            // 资金耗尽，失败
            this.finish(false, gameState, gameView);
            return;
        }

        if (game.clearedFields >= game.totalFields) {
            // 全部开垦完成，结算
            this.finish(true, gameState, gameView);
            return;
        }

        // 继续
        this.renderRound(gameState);

        // 滚动到底部看最新日志
        const logEl = document.getElementById('farming-log');
        logEl.scrollTop = logEl.scrollHeight;
    },

    /**
     * 结算游戏
     */
    finish(success, gameState, gameView) {
        const game = gameState.farmingGame;
        const task = gameState.currentTask;

        let ratio;
        let resultText;

        if (!success) {
            ratio = 0.3;
            resultText = '资金耗尽，开垦失败。';
        } else {
            // 判定完胜/小胜
            if (game.money >= 20) {
                ratio = 1.0;
                resultText = `🎉 全部${game.totalFields}块荒地开垦完成！剩余资金${game.money}贯，完胜！`;
            } else {
                ratio = 0.6;
                resultText = `✅ 全部${game.totalFields}块荒地开垦完成，但剩余资金不足${game.money}贯，小胜。`;
            }
        }

        const template = getMissionTemplateById(gameState.currentTask.templateId);
        // 实际进度 = 目标值 * 完成率
        const actualProgress = Math.round(gameState.currentTask.targetValue * ratio);
        const success = actualProgress > 0;

        // 使用新的主命系统结算
        const result = gameState.completeMission(success, actualProgress);

        gameState.addLog(`【${template.name}】${resultText}`);

        // 时间推进：按任务限时推进
        TimeSystem.advanceDays(gameState, template.timeLimitDays);

        gameState.farmingGame = null;
        gameState.currentScene = GameScene.CITY_VIEW;
        gameView.renderAll();
    }
};
