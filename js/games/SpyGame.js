/**
 * 潜龙谍影小游戏（密探）
 * 潜入敌营，从起点走到终点，每次移动增加警报值，警报满了就被发现
 */

window.SpyGame = {
    /**
     * 启动游戏
     */
    start(gameView, gameState, title = null) {
        const task = gameState.currentTask;

        // 根据技能等级调整迷宫大小和难度（难度自适应）
        let skillLevel = 1;
        if (task && task.requiredSkill) {
            skillLevel = SkillSystem.getSkillLevel(gameState, task.requiredSkill);
        }

        // Lv1: 5x5, Lv2: 6x6, Lv3: 7x7 - 难度递增
        let size;
        let maxAlarm;
        let randomFlips;
        if (skillLevel <= 1) {
            size = 5;
            maxAlarm = 60;
            randomFlips = 4;
        } else if (skillLevel === 2) {
            size = 6;
            maxAlarm = 75;
            randomFlips = 6;
        } else {
            size = 7;
            maxAlarm = 90;
            randomFlips = 8;
        }

        // 初始化游戏状态
        gameState.spyGame = {
            playerPos: {x: 0, y: 0},
            alarm: 0,
            maxAlarm: maxAlarm,
            size: size
        };

        // 生成迷宫：起点(0,0)，终点(size-1,size-1)，保证通路
        // 0: 路, 1: 墙, 2: 出口
        const maze = Array(size).fill().map(() => Array(size).fill(0));

        // 默认生成一些基础墙
        for (let y = 1; y < size - 1; y++) {
            for (let x = 1; x < size - 1; x++) {
                if (Math.random() < 0.3) {
                    maze[y][x] = 1;
                }
            }
        }

        // 设置出口
        maze[size - 1][size - 1] = 2;

        // 随机翻转一些墙，让每次迷宫不一样
        for (let i = 0; i < randomFlips; i++) {
            const x = Math.floor(Math.random() * (size - 2)) + 1;
            const y = Math.floor(Math.random() * (size - 2)) + 1;
            maze[y][x] = maze[y][x] === 1 ? 0 : 1;
        }

        gameState.spyGame.maze = maze;
        const game = gameState.spyGame;

        const alarmPercent = (game.alarm / game.maxAlarm) * 100;

        let html = `
            <div class="spy-header">
                <h2>${task.name}</h2>
                <p>你是密探，潜入敌营找到右下角出口 🎯</p>
                <div style="background: #f5f0e1; padding: 10px; border-radius: 5px; margin: 10px 0;">
                    <p>警报值：${game.alarm} / ${game.maxAlarm}</p>
                    <div style="background: #ddd; height: 20px; border-radius: 10px; margin-top: 5px;">
                        <div style="background: #e74c3c; height: 100%; width: ${alarmPercent}%; border-radius: 10px;"></div>
                    </div>
                    <p style="font-size: 14px; color: #666; margin: 5px 0 0 0;">每次移动有概率增加警报，警报满了你会被发现！</p>
                </div>
                <p>点击相邻格子移动你（🔴）</p>
            </div>
            <div class="spy-maze" id="spy-maze" style="display: inline-block; border: 2px solid #8b4513; border-radius: 5px;">
                ${maze.map((row, y) => `
                    <div class="spy-row" style="display: flex;">
                        ${row.map((cell, x) => {
                            const className = cell === 1 ? 'spy-wall' : (cell === 2 ? 'spy-exit' : 'spy-path');
                            let content = '';
                            let bg = cell === 1 ? '#2c3e50' : cell === 2 ? '#2ecc71' : '#ecf0f1';
                            if (x === 0 && y === 0) content = '🔴';
                            else if (cell === 2) content = '🎯';
                            return `<div class="spy-cell ${className}" data-x="${x}" data-y="${y}" style="width: 40px; height: 40px; border: 1px solid #bdc3c7; display: flex; align-items: center; justify-content: center; background: ${bg};">${content}</div>`;
                        }).join('')}
                    </div>
                `).join('')}
            </div>
            <div class="spy-log" id="spy-log" style="margin-top: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; min-height: 50px;">
                你从左上角出发了，悄悄向敌营深处前进...
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        this.bindEvents(gameState, gameView);
    },

    /**
     * 绑定事件
     */
    bindEvents(gameState, gameView) {
        document.querySelectorAll('.spy-cell.spy-path, .spy-cell.spy-exit').forEach(cell => {
            cell.addEventListener('click', () => {
                const x = parseInt(cell.dataset.x);
                const y = parseInt(cell.dataset.y);
                this.onMove(x, y, gameState, gameView);
            });
        });
    },

    /**
     * 处理移动
     */
    onMove(x, y, gameState, gameView) {
        const game = gameState.spyGame;
        const player = game.playerPos;

        // 只能走相邻一格
        if (Math.abs(x - player.x) + Math.abs(y - player.y) !== 1) {
            return;
        }
        // 不能走墙
        if (game.maze[y][x] === 1) {
            return;
        }

        // 20%概率增加警报
        if (Math.random() < 0.2) {
            const add = Math.floor(Math.random() * 15) + 5;
            game.alarm += add;
            document.getElementById('spy-log').innerHTML = `⚠ 被巡逻哨兵发现踪迹！警报 +${add}`;
        } else {
            document.getElementById('spy-log').innerHTML = `✓ 悄悄移动，没有被发现`;
        }

        // 移动玩家
        const oldCell = document.querySelector(`.spy-cell[data-x="${player.x}"][data-y="${player.y}"]`);
        oldCell.textContent = '';
        oldCell.style.background = '#ecf0f1';

        game.playerPos = {x, y};
        const newCell = document.querySelector(`.spy-cell[data-x="${x}"][data-y="${y}"]`);
        newCell.textContent = '🔴';
        newCell.style.background = '#e74c3c';

        // 检查警报是否满了
        if (game.alarm >= game.maxAlarm) {
            this.finish(false, gameState, gameView);
            return;
        }

        // 检查是否到出口
        if (game.maze[y][x] === 2) {
            this.finish(true, gameState, gameView);
            return;
        }

        // 重新渲染警报条 - 其实只需要更新警报条，这里简化了直接重新渲染
        this.start(gameView, gameState, title);
    },

    /**
     * 结算游戏
     */
    finish(success, gameState, gameView) {
        const game = gameState.spyGame;
        const task = gameState.currentTask;

        let ratio;
        let resultTitle, resultDesc;

        if (success && game.maze[game.playerPos.y][game.playerPos.x] === 2) {
            // 根据剩余警报计算奖励
            const remainingAlarm = game.maxAlarm - game.alarm;
            ratio = 0.7 + (remainingAlarm / game.maxAlarm) * 0.3; // 0.7 ~ 1.0
            resultTitle = '✔ 潜入成功！';
            resultDesc = '你成功摸到敌营主将营帐，完成任务全身而退！';
        } else {
            // 被发现，失败，给少量奖励
            const distanceToExit = Math.abs(4 - game.playerPos.x) + Math.abs(4 - game.playerPos.y);
            const totalDistance = 8; // max distance in 5x5
            ratio = Math.max(0.2, (1 - distanceToExit / totalDistance) * 0.5);
            resultTitle = '✘ 潜入失败';
            resultDesc = '你的行踪被敌人发现，不得不撤退，只走到了离出口还有 ' + distanceToExit + ' 格的位置。';
        }

        const template = getMissionTemplateById(gameState.currentTask.templateId);
        // 实际进度 = 目标值 * 完成率
        const actualProgress = Math.round(gameState.currentTask.targetValue * ratio);
        const success = actualProgress > 0;

        // 使用新的主命系统结算
        const result = gameState.completeMission(success, actualProgress);

        gameState.addLog(`【${template.name}】${resultTitle} 最终警报值${game.alarm}`);

        // 显示结果页
        let html = `
            <div class="spy-result" style="text-align: center; padding: 30px;">
                <h2 style="font-size: 28px; margin-bottom: 20px; color: #8b4513;">${resultTitle}</h2>
                <p style="font-size: 16px; margin-bottom: 20px;">${resultDesc}</p>
                <div style="background: #f5f0e1; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                    <p>最终警报值：${game.alarm} / ${game.maxAlarm}</p>
                </div>
                <p>功勋奖励：${result.meritGained > 0 ? '+' : ''}${result.meritGained}</p>
                <div style="margin-top: 30px;">
                    <button class="btn primary-btn" id="spy-done-btn">返回</button>
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        document.getElementById('spy-done-btn').addEventListener('click', () => {
            // 时间推进：按任务限时推进
            TimeSystem.advanceDays(gameState, template.timeLimitDays);
            gameState.spyGame = null;
            gameState.currentScene = GameScene.CITY_VIEW;
            gameView.renderAll();
        });
    }
};
