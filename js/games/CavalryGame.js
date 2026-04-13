/**
 * 赛马小游戏（骑兵训练）
 * 骰子驱动竞速，从起点到终点共15点进度，每回合选择策马方式掷骰前进
 */

window.CavalryGame = {
    /**
     * 启动游戏
     */
    start(gameView, gameState) {
        const task = gameState.currentTask;
        // 根据技能等级调整难度 (符合策划难度曲线)
        // Lv1: 进度10点, Lv2: 进度15点, Lv3: 进度20点
        let skillLevel = 1;
        if (task && task.requiredSkill) {
            skillLevel = SkillSystem.getSkillLevel(gameState, task.requiredSkill);
        }
        let targetProgress;
        if (skillLevel >= 3) {
            targetProgress = 20;
        } else if (skillLevel === 2) {
            targetProgress = 15;
        } else {
            targetProgress = 10;
        }

        // 初始化游戏状态 - 按照策划设计
        gameState.cavalryGame = {
            playerProgress: 0,
            enemyProgress: 0,
            targetProgress: targetProgress,
            playerStunned: false
        };

        this.render(gameState);
    },

    /**
     * 渲染当前状态
     */
    render(gameState) {
        const game = gameState.cavalryGame;
        const template = getMissionTemplateById(gameState.currentTask.templateId);
        const playerBar = '■'.repeat(Math.floor(game.playerProgress / 2)) + '□'.repeat(8 - Math.floor(game.playerProgress / 2));
        const enemyBar = '■'.repeat(Math.floor(game.enemyProgress / 2)) + '□'.repeat(8 - Math.floor(game.enemyProgress / 2));

        let html = `
            <div class="cavalry-header">
                <h2>${template.name}</h2>
                <p>从起点到终点共需累积15点进度，先到终点获胜</p>
                <div class="cavalry-progress">
                    <p>你的进度: ${playerBar} <strong>${game.playerProgress}</strong> / ${game.targetProgress}</p>
                    <p>对手进度: ${enemyBar} <strong>${game.enemyProgress}</strong> / ${game.targetProgress}</p>
                </div>
            </div>
            <div class="cavalry-actions">
                <p>请选择策马方式：</p>
                <div class="cavalry-buttons">
                    <button class="btn primary-btn cavalry-btn" data-choice="steady">
                        1. 稳扎稳打<br>
                        <small style="color: #ffd700;">正常掷骰，无加成无惩罚</small>
                    </button>
                    <button class="btn primary-btn cavalry-btn" data-choice="dash">
                        2. 策马加鞭<br>
                        <small style="color: #ffd700;">掷骰+1（上限6），但若掷出1则马匹受惊，下一回合无法行动</small>
                    </button>
                    <button class="btn primary-btn cavalry-btn" data-choice="block">
                        3. 以身挡道<br>
                        <small style="color: #ffd700;">不增加进度，但对手本回合掷骰-2（下限1）</small>
                    </button>
                </div>
            </div>
            <div class="cavalry-log" id="cavalry-log"></div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        this.bindEvents(gameState, gameView);
    },

    /**
     * 绑定事件
     */
    bindEvents(gameState, gameView) {
        document.querySelectorAll('.cavalry-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.onChoice(btn.dataset.choice, gameState, gameView);
            });
        });
    },

    /**
     * 玩家选择了策马方式
     */
    onChoice(choice, gameState, gameView) {
        const game = gameState.cavalryGame;
        let playerRoll = Math.floor(Math.random() * 6) + 1; // 1d6

        // 根据选择应用修改
        if (choice === 'steady') {
            // 稳扎稳打：不修改
            if (!game.playerStunned) {
                game.playerProgress += playerRoll;
                this.addLog(`你选择稳扎稳打，掷出${playerRoll}，进度+${playerRoll}`, gameState);
            } else {
                this.addLog(`你马匹受惊，本回合无法行动`, gameState);
            }
        } else if (choice === 'dash') {
            // 策马加鞭：+1，但若掷出1则受惊下一回合不能动
            if (!game.playerStunned) {
                playerRoll = Math.min(6, playerRoll + 1);
                game.playerProgress += playerRoll;
                if (playerRoll === 1) {
                    game.playerStunned = true;
                    this.addLog(`你选择策马加鞭，掷出${playerRoll}，马匹受惊！下一回合无法行动，进度+${playerRoll}`, gameState);
                } else {
                    game.playerStunned = false;
                    this.addLog(`你选择策马加鞭，掷出${playerRoll}，进度+${playerRoll}`, gameState);
                }
            } else {
                this.addLog(`你马匹受惊，本回合无法行动`, gameState);
            }
        } else if (choice === 'block') {
            // 以身挡道：自己不前进，对手减2
            this.addLog(`你选择以身挡道，自己不前进，阻碍对手`, gameState);
            playerRoll = 0;
            game.playerStunned = false;
        }

        // 检查玩家是否已经到达终点
        if (game.playerProgress >= game.targetProgress) {
            this.finish(gameState, gameView);
            return;
        }

        // 对手回合 - AI也随机选择策略（简单AI）
        let enemyChoice = ['steady', 'dash', 'block'][Math.floor(Math.random() * 3)];
        let enemyRoll = Math.floor(Math.random() * 6) + 1;
        let enemyStunned = false;

        if (game.playerStunned) {
            this.addLog(`你马匹受惊，本回合无法行动`, gameState);
        }

        // 玩家回合已经处理了，处理对手回合
        if (enemyChoice === 'steady') {
            game.enemyProgress += enemyRoll;
            this.addLog(`对手选择稳扎稳打，掷出${enemyRoll}，进度+${enemyRoll}`, gameState);
        } else if (enemyChoice === 'dash') {
            enemyRoll = Math.min(6, enemyRoll + 1);
            game.enemyProgress += enemyRoll;
            if (enemyRoll === 1) {
                enemyStunned = true;
                this.addLog(`对手选择策马加鞭，掷出${enemyRoll}，马匹受惊，下一回合无法行动，进度+${enemyRoll}`, gameState);
            } else {
                this.addLog(`对手选择策马加鞭，掷出${enemyRoll}，进度+${enemyRoll}`, gameState);
            }
        } else if (enemyChoice === 'block') {
            // 对手挡道，直接记录，玩家已经行动过了所以不影响
            this.addLog(`对手选择以身挡道，阻碍你前进`, gameState);
        }

        // 更新受惊状态给下一回合
        game.playerStunned = game.playerStunned ? false : enemyStunned;

        // 检查对手是否到达终点
        if (game.enemyProgress >= game.targetProgress) {
            this.finish(gameState, gameView);
            return;
        }

        // 重新绑定事件等待下一回合
        this.bindEvents(gameState, gameView);

        // 滚动到最新日志
        const logEl = document.getElementById('cavalry-log');
        logEl.scrollTop = logEl.scrollHeight;
    },

    /**
     * 添加日志
     */
    addLog(text, gameState) {
        const logEl = document.getElementById('cavalry-log');
        logEl.innerHTML += `<div class="cavalry-log-entry">${text}</div>`;
    },

    /**
     * 结算游戏
     */
    finish(gameState, gameView) {
        const game = gameState.cavalryGame;
        const won = game.playerProgress >= game.targetProgress && game.enemyProgress < game.targetProgress;
        // 完胜条件：领先对手至少3点进度（策划要求）
        const perfectWin = won && (game.playerProgress - game.enemyProgress >= 3);
        const ratio = won ? (perfectWin ? 1.0 : 0.8) : (game.playerProgress / game.targetProgress);

        let resultText;
        if (perfectWin) {
            resultText = `🎉 完胜！你率先到达终点且领先对手至少3点进度，获得全额奖励。`;
        } else if (won) {
            resultText = `✅ 获胜！你率先到达终点。`;
        } else {
            resultText = `❌ 失败！对手先到达终点。`;
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

        gameState.cavalryGame = null;
        gameState.currentScene = GameScene.CITY_VIEW;
        gameView.renderAll();
    }
};
