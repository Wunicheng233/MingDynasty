/**
 * 劝课农桑小游戏（农业）
 * 改进玩法：田间管理，点击除草除虫，收割成熟庄稼
 * - 农田里不断随机长出杂草、蝗虫、幼苗庄稼
 * - 幼苗需要等几秒才成熟，成熟变黄才能收割，错点扣分！
 * - 你需要及时点击处理：除掉杂草蝗虫，收割成熟庄稼
 * - 限定时间60秒，处理越多得分越高
 * 典故：明代鼓励垦荒，劝课农桑是地方官重要政绩
 */

window.FarmingGame = {
    /**
     * 生长计时器
     */
    growTimer: null,
    ripenTimer: null,

    /**
     * 启动游戏 - 先显示说明界面
     */
    start(gameView, gameState, title = null) {
        const headerTitle = title || (gameState.currentTask ? gameState.currentTask.name : '劝课农桑');

        let html = `
            <div style="max-height: 70vh; overflow-y: auto; padding: 0 5px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #8b4513; font-size: 28px; margin-bottom: 8px;">🌾 劝课农桑</h2>
                    <p style="color: #6b5b45; font-size: 16px;">管理农田，及时除草除虫，收割成熟庄稼！</p>
                </div>

                <div style="background: #f5f0e1; padding: 18px; border-radius: 8px; margin-bottom: 16px;">
                    <h3 style="color: #8b4513; margin-top: 0; font-size: 22px; margin-bottom: 10px;">游戏规则</h3>
                    <ul style="line-height: 1.7; color: #333; font-size: 18px; padding-left: 20px; margin: 0;">
                        <li>农田里会不断长出：<strong>🌿杂草</strong>、<strong>🦗蝗虫</strong>、<strong>🌱幼苗</strong></li>
                        <li><strong>🌿杂草</strong>（浅黄色）→ 点击除掉 +10分</li>
                        <li><strong>🦗蝗虫</strong>（红色）→ 点击除掉 +15分</li>
                        <li><strong>🌱幼苗</strong>（深绿色）→ <strong>不能点！点了扣10分</strong>，等3-5秒变黄成熟</li>
                        <li><strong>🌾成熟庄稼</strong>（金黄色）→ 点击收割 +25分</li>
                        <li>所有东西${5 - 1 * 2}秒(Lv1)内没点会自动消失，过时不候</li>
                        <li>等级越高 → 地块越大，消失越快，难度越大</li>
                    </ul>
                </div>

                <div style="text-align: center; margin-top: 20px;">
                    <button class="btn primary-btn" id="start-farming-btn" style="padding: 12px 40px; font-size: 18px;">开始游戏</button>
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        document.getElementById('start-farming-btn').addEventListener('click', () => {
            this.startActualGame(gameView, gameState, title);
        });
    },

    /**
     * 真正开始游戏
     */
    startActualGame(gameView, gameState, title = null) {
        const task = gameState.currentTask;

        // 根据技能等级调整地图大小和生长速度（难度自适应）
        let skillLevel = 1;
        if (task && task.requiredSkill) {
            skillLevel = window.SkillSystem.getSkillLevel(gameState, task.requiredSkill);
        }

        // 难度递增：等级越高，地块越大，生长越快
        let size, gameTime, growInterval;
        if (skillLevel <= 1) {
            size = 5;
            gameTime = 60;
            growInterval = 1500; // 每1.5秒长一个新的
        } else if (skillLevel === 2) {
            size = 6;
            gameTime = 60;
            growInterval = 1200; // 更快
        } else {
            size = 7;
            gameTime = 60;
            growInterval = 900; // 更快
        }

        // 地块状态说明：
        // 0=空耕地（待生长）
        // 1=杂草（需要点击除，可点击）
        // 2=蝗虫（需要点击除，可点击）
        // 3=幼苗（青庄稼，不可点击，点了扣分，等待成熟）
        // 4=成熟庄稼（金黄色，需要点击收割，可点击）
        const grid = Array(size).fill().map(() => Array(size).fill(0));

        // 初始化游戏状态
        Object.assign(gameState.farmingGame, {
            size: size,
            skillLevel: skillLevel,
            grid: grid,
            gameTime: gameTime,
            remainingTime: gameTime,
            growInterval: growInterval,
            score: 0,
            harvested: 0,
            weedsRemoved: 0,
            locustsRemoved: 0,
            isPractice: title !== null,
            ripening: 0 // 正在成熟的计数
        });

        this.render(gameState, title);
        this.bindEvents(gameState, gameView);
        this.startGrowTimer(gameState, gameView);
        this.startCountdown(gameState, gameView);
    },

    /**
     * 获取格子类型的样式
     */
    getCellInfo(type) {
        switch (type) {
            case 0: return { bg: '#8fbc8f', text: '', emoji: '' }; // 空耕地 - 绿色
            case 1: return { bg: '#f9e79f', text: '除草', emoji: '🌿' }; // 杂草 - 浅黄色
            case 2: return { bg: '#e74c3c', text: '除虫', emoji: '🦗' }; // 蝗虫 - 红色
            case 3: return { bg: '#229954', text: '幼苗', emoji: '🌱' }; // 幼苗庄稼 - 深绿色
            case 4: return { bg: '#f4d03f', text: '收割', emoji: '🌾' }; // 成熟庄稼 - 金黄色
            default: return { bg: '#8fbc8f', text: '', emoji: '' };
        }
    },

    /**
     * 渲染整个游戏
     */
    render(gameState, title = null) {
        const game = gameState.farmingGame;
        const headerTitle = game.isPractice ? (title || '劝课农桑') : (gameState.currentTask ? gameState.currentTask.name : '劝课农桑');

        let html = `
            <div style="max-height: 70vh; overflow-y: auto; padding: 0 5px;">
                <div class="farming-header">
                    <h2>${headerTitle}</h2>
                    <p>🌾 田间管理：点击<strong>杂草🌿/蝗虫🦗</strong>除掉，<strong>庄稼🌱要等变黄成熟🌾才能收割</strong>！</p>
                    <div style="background: #f5f0e1; padding: 10px; border-radius: 5px; margin: 10px 0;">
                        <p>剩余时间: <strong id="remaining-time">${game.remainingTime}</strong> 秒</p>
                        <p>得分: <strong id="current-score">${game.score}</strong> | 已收割: <span id="count-harvested">${game.harvested}</span> | 除草: <span id="count-weeds">${game.weedsRemoved}</span> | 除虫: <span id="count-locusts">${game.locustsRemoved}</span></p>
                        <p style="font-size: 13px; color: #e74c3c; margin: 5px 0 0 0;">⚠ 错点青幼苗💚 直接扣10分！看清楚颜色再点！</p>
                        <div style="background: #ddd; height: 20px; border-radius: 10px; margin-top: 5px;">
                            <div id="time-bar" style="background: #27ae60; height: 100%; width: 100%; border-radius: 10px; transition: width 0.3s;"></div>
                        </div>
                    </div>
                </div>
                <div style="text-align: center;">
                    <div class="farming-grid" id="farming-grid" style="display: inline-block; border: 3px solid #8b4513; border-radius: 8px; padding: 5px; background: #f5deb3;">
                        ${game.grid.map((row, y) => `
                            <div class="farming-row" style="display: flex; gap: 4px; margin-bottom: 4px;">
                                ${row.map((cell, x) => {
                                    const info = this.getCellInfo(cell);
                                    return `<div class="farming-cell" data-x="${x}" data-y="${y}" style="width: 50px; height: 50px; border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: ${info.bg}; cursor: pointer; font-size: 24px;">${info.emoji}</div>`;
                                }).join('')}
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="farming-tip" style="text-align: center; margin-top: 15px; color: #666; font-size: 14px;">
                    <p>💡 🌿杂草+10分，🦗蝗虫+15分，🌾成熟庄稼+25分 | 🌱青幼苗不能点，点了扣10分</p>
                    <p>💡 所有东西出现后<strong>${5 - (game.skillLevel - 1) * 2}秒</strong>没点会自动消失，过时不候！</p>
                    <p>💡 庄稼刚长出来是绿色幼苗🌱，等待3-5秒变黄成熟🌾才能收割</p>
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
    },

    /**
     * 重新渲染单个格子
     */
    renderCell(x, y, type) {
        const cell = document.querySelector(`.farming-cell[data-x="${x}"][data-y="${y}"]`);
        const info = this.getCellInfo(type);
        if (cell) {
            cell.style.background = info.bg;
            cell.innerHTML = info.emoji;
        }
    },

    /**
     * 更新分数和时间UI
     */
    updateUI(gameState) {
        const game = gameState.farmingGame;
        const percent = (game.remainingTime / game.gameTime) * 100;
        document.getElementById('remaining-time').textContent = game.remainingTime;
        document.getElementById('current-score').textContent = game.score;
        document.getElementById('count-harvested').textContent = game.harvested;
        document.getElementById('count-weeds').textContent = game.weedsRemoved;
        document.getElementById('count-locusts').textContent = game.locustsRemoved;
        document.getElementById('time-bar').style.width = `${percent}%`;
        if (percent < 20) {
            document.getElementById('time-bar').style.background = '#e74c3c';
        }
    },

    /**
     * 绑定点击事件
     */
    bindEvents(gameState, gameView) {
        const self = this;
        document.querySelectorAll('.farming-cell').forEach(cell => {
            cell.addEventListener('click', function() {
                const x = parseInt(cell.dataset.x);
                const y = parseInt(cell.dataset.y);
                self.onClick(x, y, gameState, gameView);
            });
        });
    },

    /**
     * 幼苗成熟：从🌱 → 🌾
     */
    ripen(x, y, gameState) {
        const game = gameState.farmingGame;
        // 如果已经被点掉了，不用管
        if (game.grid[y][x] !== 3) {
            return;
        }
        // 成熟了
        game.grid[y][x] = 4;
        this.renderCell(x, y, 4);
    },

    /**
     * 玩家点击格子
     */
    onClick(x, y, gameState, gameView) {
        const game = gameState.farmingGame;
        const cellType = game.grid[y][x];

        if (cellType === 0) {
            // 空地，什么都没有，不能点，不扣分
            return;
        }

        // 错点幼苗！扣分并且消失
        if (cellType === 3) {
            game.score = Math.max(0, game.score - 10);
            game.grid[y][x] = 0;
            this.renderCell(x, y, 0);
            this.updateUI(gameState);
            return;
        }

        // 根据类型加分
        switch (cellType) {
            case 1: // 杂草
                game.score += 10;
                game.weedsRemoved++;
                break;
            case 2: // 蝗虫
                game.score += 15;
                game.locustsRemoved++;
                break;
            case 4: // 成熟庄稼
                game.score += 25;
                game.harvested++;
                break;
        }

        // 处理完变成空地，等待下一次生长
        game.grid[y][x] = 0;
        this.renderCell(x, y, 0);
        this.updateUI(gameState);
    },

    /**
     * 随机长出新的东西
     */
    growSomething(gameState) {
        const game = gameState.farmingGame;
        const size = game.size;

        // 找一个空格子
        const emptyCells = [];
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (game.grid[y][x] === 0) {
                    emptyCells.push({x, y});
                }
            }
        }

        if (emptyCells.length === 0) {
            return; // 没空位了
        }

        // 随机选一个空位
        const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];

        // 随机类型：杂草概率最高，然后蝗虫，然后庄稼（新长出来是幼苗，需要等成熟
        const roll = Math.random();
        let type;
        if (roll < 0.40) {
            type = 1; // 40% 杂草
        } else if (roll < 0.65) {
            type = 2; // 25% 蝗虫
        } else {
            type = 3; // 35% 新幼苗（需要等成熟
        }

        // 自动消失时间：等级越高消失越快
        // Lv1: 5秒, Lv2: 3秒, Lv3: 1秒，每级减2秒
        const expireTime = (5 - (game.skillLevel - 1) * 2) * 1000;

        // 长出来
        game.grid[cell.y][cell.x] = type;
        this.renderCell(cell.x, cell.y, type);

        // 设置自动消失计时器：到时间没点就自动消失
        setTimeout(() => {
            // 如果还在，并且还是这个类型，就消失变成空地
            if (game.grid[cell.y][cell.x] === type) {
                game.grid[cell.y][cell.x] = 0;
                this.renderCell(cell.x, cell.y, 0);
            }
        }, expireTime);

        // 如果是幼苗，开始倒计时成熟，成熟后如果还在，变成熟，然后再设置自动消失
        if (type === 3) {
            const ripenTime = 3000 + Math.random() * 2000; // 3-5秒成熟
            setTimeout(() => {
                if (game.grid[cell.y][cell.x] === 3) { // 如果还在，没被点掉
                    this.ripen(cell.x, cell.y, gameState);
                    // 成熟后也设置自动消失，等级越高消失越快
                    setTimeout(() => {
                        if (game.grid[cell.y][cell.x] === 4) { // 如果还没收割
                            game.grid[cell.y][cell.x] = 0;
                            this.renderCell(cell.x, cell.y, 0);
                        }
                    }, expireTime);
                }
            }, ripenTime);
        }
    },

    /**
     * 开始自动生长计时器
     */
    startGrowTimer(gameState, gameView) {
        if (this.growTimer) {
            clearInterval(this.growTimer);
        }
        this.growTimer = setInterval(() => {
            this.growSomething(gameState);
        }, gameState.farmingGame.growInterval);
    },

    /**
     * 开始倒计时
     */
    startCountdown(gameState, gameView) {
        const game = gameState.farmingGame;
        const timer = setInterval(() => {
            game.remainingTime--;
            this.updateUI(gameState);
            if (game.remainingTime <= 0) {
                clearInterval(timer);
                clearInterval(this.growTimer);
                this.finish(gameState, gameView);
            }
        }, 1000);
    },

    /**
     * 游戏结束结算
     */
    finish(gameState, gameView) {
        const game = gameState.farmingGame;
        const task = gameState.currentTask;

        // 满分计算：最大可能得分 = 地块总数 * 25 (都是庄稼
        const maxPossible = game.size * game.size * 25;
        const ratio = Math.min(1, game.score / maxPossible);

        // 按比例给评价
        let resultText;
        if (ratio >= 0.7) {
            resultText = `🎉 农忙出色！${game.remainingTime}秒内得分${game.score}，收割${game.harvested}棵庄稼，田园丰收！`;
        } else if (ratio >= 0.4) {
            resultText = `✅ 农事合格！得分${game.score}，收割${game.harvested}棵庄稼，今年收成尚可。`;
        } else if (ratio >= 0.2) {
            resultText = `➖ 农事勉强！得分${game.score}，收割${game.harvested}棵庄稼，草荒比较严重。`;
        } else {
            resultText = `❌ 农事荒疏！得分${game.score}，只收割${game.harvested}棵庄稼，田地长满杂草。`;
        }

        if (game.isPractice) {
            // 农场练习 - 非任务，固定奖励农业经验，消耗5天
            const expGained = Math.round(10 * ratio);
            gameState.addSkillExp('farming', expGained);
            gameState.addLog(`劝课农桑练习完成：${resultText} 获得 ${expGained} 农业经验，消耗5天时间。`);
            gameState.advanceDays(5);
            gameState.farmingGame = null;
            // 返回设施场景
            gameState.currentScene = window.GameScene.FACILITY;
            gameView.renderAll();
        } else {
            // 正常任务结算 - 使用新主命系统
            const template = getMissionTemplateById(gameState.currentTask.templateId) || gameState.currentTask;
            // 实际进度 = 目标值 * 完成率
            const actualProgress = Math.round(gameState.currentTask.targetValue * ratio);
            const success = actualProgress > 0;

            // 使用新的主命系统结算
            const result = gameState.completeMission(success, actualProgress);

            gameState.addLog(`【${template.name}】${resultText}`);

            // 时间推进：按任务限时推进
            window.TimeSystem.advanceDays(gameState, template.timeLimitDays);

            gameState.farmingGame = null;
            gameState.currentScene = window.GameScene.CITY_VIEW;
            gameView.renderAll();
        }

        // 清理计时器
        if (this.growTimer) {
            clearInterval(this.growTimer);
            this.growTimer = null;
        }
    }
};
