/**
 * 排兵布阵兵法小游戏
 * 选择克制对方的阵型，先推进 5 格到敌营获胜
 * 鱼鳞克鹤翼，鹤翼克方圆，方圆克鱼鳞
 */

window.StrategyGame = {
    /**
     * 启动游戏
     */
    start(gameView, gameState) {
        const task = gameState.currentTask;

        // 阵型定义和克制关系
        const formations = {
            '鱼鳞': {beats: ['鹤翼'], description: '密集阵形，冲击力强，克制鹤翼'},
            '鹤翼': {beats: ['方圆'], description: '散开阵形，包抄迂回，克制方圆'},
            '方圆': {beats: ['鱼鳞'], description: '坚固阵形，稳如泰山，克制鱼鳞'}
        };

        // 初始化游戏状态
        gameState.strategyGame = {
            playerProgress: 0,    // 我方推进进度
            enemyProgress: 0,    // 敌方推进进度
            maxProgress: 5,      // 先到5格获胜
            history: [],         // 对战历史
            currentEnemy: null   // 敌方这回合出什么
        };

        // 敌方第一回合随机出阵
        const game = gameState.strategyGame;
        game.currentEnemy = Object.keys(formations)[Math.floor(Math.random() * 3)];

        this.render(gameState, gameView);
    },

    /**
     * 渲染当前状态
     */
    render(gameState, gameView) {
        const game = gameState.strategyGame;
        const formations = {
            '鱼鳞': {beats: ['鹤翼'], description: '密集阵形，冲击力强，克制鹤翼'},
            '鹤翼': {beats: ['方圆'], description: '散开阵形，包抄迂回，克制方圆'},
            '方圆': {beats: ['鱼鳞'], description: '坚固阵形，稳如泰山，克制鱼鳞'}
        };

        let html = `
            <div class="strategy-header">
                <h2>${gameState.currentTask.name}</h2>
                <p>选择阵型克制对方，先推进 5 格到敌营获胜</p>
            </div>
            <div class="strategy-clues" style="background: #f5f0e1; padding: 12px; border-radius: 8px; margin: 15px 0;">
                <p><strong>克制关系：</strong></p>
                <p style="color: #8b4513; margin: 5px 0;">▶ 鱼鳞 → 克制 鹤翼</p>
                <p style="color: #8b4513; margin: 5px 0;">▶ 鹤翼 → 克制 方圆</p>
                <p style="color: #8b4513; margin: 5px 0;">▶ 方圆 → 克制 鱼鳞</p>
            </div>
            <div class="strategy-progress" style="display: flex; justify-content: space-between; margin: 15px 0;">
                <div style="text-align: center;">
                    <p><strong>我军推进</strong></p>
                    <div style="background: #ddd; width: 150px; height: 20px; border-radius: 10px;">
                        <div style="background: #2ecc71; height: 100%; width: ${(game.playerProgress / game.maxProgress) * 100}%; border-radius: 10px;"></div>
                    </div>
                    <p>${game.playerProgress} / ${game.maxProgress}</p>
                </div>
                <div style="text-align: center;">
                    <p><strong>敌军推进</strong></p>
                    <div style="background: #ddd; width: 150px; height: 20px; border-radius: 10px;">
                        <div style="background: #e74c3c; height: 100%; width: ${(game.enemyProgress / game.maxProgress) * 100}%; border-radius: 10px;"></div>
                    </div>
                    <p>${game.enemyProgress} / ${game.maxProgress}</p>
                </div>
            </div>
            <div class="strategy-enemy" style="background: #ffebee; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p><strong>敌方这回合排出：</strong> <span style="font-size: 20px; color: #c0392b;">${game.currentEnemy}</span></p>
                <p style="color: #666; margin: 5px 0 0 0;">请选择你的阵型应对：</p>
            </div>
            <div class="strategy-actions" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin: 15px 0;">
        `;

        for (const [name, info] of Object.entries(formations)) {
            html += `
                <button class="btn primary-btn formation-btn" data-formation="${name}" style="height: auto; padding: 15px;">
                    <strong style="font-size: 18px;">${name}</strong><br>
                    <span style="font-size: 12px; color: #666;">${info.description}</span>
                </button>
            `;
        }

        html += `
            </div>
            <div class="strategy-history" style="margin-top: 20px;">
                <p><strong>对战记录：</strong></p>
                <div id="history-list"></div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;

        document.querySelectorAll('.formation-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.onSelect(btn.dataset.formation, gameState, gameView);
            });
        });

        // 渲染历史记录
        let historyHtml = '';
        game.history.forEach((h, i) => {
            historyHtml += `
                <div style="padding: 8px; border-bottom: 1px solid #eee;">
                    回合 ${i+1}: 你出【${h.player}】敌军出【${h.enemy}】→ ${h.result}
                </div>
            `;
        });
        document.getElementById('history-list').innerHTML = historyHtml;
    },

    /**
     * 处理玩家选择
     */
    onSelect(playerFormation, gameState, gameView) {
        const game = gameState.strategyGame;
        const enemyFormation = game.currentEnemy;

        // 判定是否克制
        const formations = {
            '鱼鳞': {beats: ['鹤翼']},
            '鹤翼': {beats: ['方圆']},
            '方圆': {beats: ['鱼鳞']}
        };

        let resultText;

        if (formations[playerFormation].beats.includes(enemyFormation)) {
            // 我方克制，我方推进
            game.playerProgress++;
            resultText = `<span style="color: green;">✔ 你克制了敌军，我方前进一格！</span>`;
        } else if (formations[enemyFormation].beats.includes(playerFormation)) {
            // 敌方克制，敌方推进
            game.enemyProgress++;
            resultText = `<span style="color: red;">✘ 敌军克制了你，敌军前进一格！</span>`;
        } else {
            // 同阵型，都不推进
            resultText = `<span style="color: #666;">⚔ 双方同阵型，相持不下，互不前进。</span>`;
        }

        // 记录历史
        game.history.push({
            player: playerFormation,
            enemy: enemyFormation,
            result: resultText
        });

        // 检查是否游戏结束
        if (game.playerProgress >= game.maxProgress) {
            // 我方获胜
            this.finish(true, gameState, gameView);
            return;
        }
        if (game.enemyProgress >= game.maxProgress) {
            // 敌方获胜
            this.finish(false, gameState, gameView);
            return;
        }

        // 敌方下一回合随机出阵
        game.currentEnemy = Object.keys(formations)[Math.floor(Math.random() * 3)];

        // 重新渲染
        this.render(gameState, gameView);
    },

    /**
     * 结算游戏
     */
    finish(playerWin, gameState, gameView) {
        const game = gameState.strategyGame;
        const task = gameState.currentTask;

        let ratio;
        let resultTitle, resultDesc;

        if (playerWin) {
            // 获胜，根据我方战败对方多少格计算奖励
            const remaining = game.maxProgress - game.enemyProgress;
            ratio = 0.8 + (remaining / game.maxProgress) * 0.2; // 0.8 ~ 1.0
            resultTitle = '✔ 推演胜利！';
            resultDesc = '你成功击破敌军阵型，推进到敌营，推演大获全胜！';
        } else {
            // 失败，按我方推进多少给奖励
            ratio = Math.max(0.2, (game.playerProgress / game.maxProgress) * 0.6);
            resultTitle = '✘ 推演失败';
            resultDesc = `你的阵型被敌军层层克制，我方只推进了 ${game.playerProgress} 格，不得不收兵回营。`;
        }

        const finalMerit = Math.round(task.rewardMerit * ratio);
        const finalMoney = Math.round(task.rewardMoney * ratio);
        const expGained = Math.round(15 * ratio);

        gameState.merit += finalMerit;
        gameState.money += finalMoney;
        if (task.requiredSkill) {
            gameState.addSkillExp(task.requiredSkill, expGained);
        }

        const skillName = getSkillById(task.requiredSkill)?.name || '';
        gameState.checkRolePromotion();
        gameState.addLog(`任务【${task.name}】${resultTitle} 我军推进${game.playerProgress}格，获得 ${finalMerit} 功勋，${finalMoney} 金钱，${expGained} ${skillName}经验。`);

        // 显示结果页
        let html = `
            <div class="strategy-result" style="text-align: center; padding: 30px;">
                <h2 style="font-size: 28px; margin-bottom: 20px; color: #8b4513;">${resultTitle}</h2>
                <p style="font-size: 16px; margin-bottom: 20px;">${resultDesc}</p>
                <div style="background: #f5f0e1; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                    <p>最终推进：我军 ${game.playerProgress} - 敌军 ${game.enemyProgress}</p>
                </div>
                <p>获得：${finalMerit} 功勋，${finalMoney} 金钱</p>
                <div style="margin-top: 30px;">
                    <button class="btn primary-btn" id="strategy-done-btn">返回</button>
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        document.getElementById('strategy-done-btn').addEventListener('click', () => {
            gameView.advanceTwoMonths();
            gameState.currentTask = null;
            gameState.strategyGame = null;
            gameState.currentScene = GameScene.CITY_VIEW;
            gameView.renderAll();
        });
    }
};
