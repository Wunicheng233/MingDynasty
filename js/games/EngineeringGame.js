/**
 * 修筑城墙小游戏（工程）
 * 筑城考工 - 城砖砌筑拼图玩法
 * 玩法：城墙有多处空缺，选择合适大小的城砖，填补空缺完成修筑
 * - 不同大小城砖，大砖不能放进小空位
 * - 限定时间内，填补越多空隙得分越高
 * - 等级越高 → 城墙越大，空位越多，时间越紧
 * 典故：明代修筑长城、城池规模宏大，工程技术成熟，九边重镇皆有巨型砖石城墙
 */

window.EngineeringGame = {
    /**
     * 计时器ID
     */
    timerId: null,

    /**
     * 启动游戏 - 先显示说明
     */
    start(gameView, gameState, title = null) {
        const headerTitle = title || (gameState.currentTask ? gameState.currentTask.name : '筑城考工');

        let html = `
            <div style="max-height: 70vh; overflow-y: auto; padding: 0 5px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #8b4513; font-size: 28px; margin-bottom: 8px;">🧱 筑城考工</h2>
                    <p style="color: #6b5b45; font-size: 16px;">选择合适大小的城砖，填补城墙空缺，完成修筑！</p>
                </div>

                <div style="background: #f5f0e1; padding: 18px; border-radius: 8px; margin-bottom: 16px;">
                    <h3 style="color: #8b4513; margin-top: 0; font-size: 22px; margin-bottom: 10px;">游戏规则</h3>
                    <ul style="line-height: 1.7; color: #333; font-size: 18px; padding-left: 20px; margin: 0;">
                        <li>城墙上有多处空缺需要填补，选择<strong>合适大小的城砖</strong></li>
                        <li>先点选城砖，再点选城墙空位 → 放得下就成功填补</li>
                        <li><strong>大砖不能放进小空位</strong>，提前规划好摆放</li>
                        <li>限定时间内，填补越多空隙，得分越高</li>
                        <li>等级越高 → 城墙越大，空位越多，时间越紧</li>
                    </ul>
                </div>

                <div style="text-align: center; margin-top: 20px;">
                    <button class="btn primary-btn" id="start-engineering-btn" style="padding: 12px 40px; font-size: 18px;">开始修筑!</button>
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        document.getElementById('start-engineering-btn').addEventListener('click', () => {
            this.startActualGame(gameView, gameState, title);
        });
    },

    /**
     * 真正开始游戏
     */
    startActualGame(gameView, gameState, title = null) {
        const task = gameState.currentTask;

        // 根据技能等级调整难度 (符合策划难度曲线)
        // Lv1: 6x6网格, 10个空缺, 60秒; Lv2: 8x8网格, 16个空缺, 50秒; Lv3: 10x10网格, 25个空缺, 45秒
        let skillLevel = 1;
        if (task && task.requiredSkill) {
            skillLevel = window.SkillSystem.getSkillLevel(gameState, task.requiredSkill);
        }

        const gridSize = 4 + skillLevel * 2; // 6, 8, 10
        const totalHoles = skillLevel === 1 ? 10 : skillLevel === 2 ? 16 : 25;
        const timeLimit = skillLevel === 1 ? 60 : skillLevel === 2 ? 50 : 45;

        // 初始化游戏网格：true = 已有城砖，false = 空缺需要填补
        const grid = this.generateGrid(gridSize, totalHoles);

        // 可用城砖类型
        const brickTypes = [
            {w: 2, h: 2, name: '方整大砖', count: Math.ceil(totalHoles / 4)},
            {w: 2, h: 1, name: '长条形砖', count: Math.ceil(totalHoles / 3)},
            {w: 1, h: 2, name: '竖条砖', count: Math.ceil(totalHoles / 3)},
            {w: 1, h: 1, name: '小块填砖', count: Math.ceil(totalHoles / 2)},
        ];

        gameState.engineeringGame = {
            gridSize: gridSize,
            totalHoles: totalHoles,
            filledHoles: 0,
            timeLimit: timeLimit,
            remainingTime: timeLimit,
            skillLevel: skillLevel,
            grid: grid,
            brickTypes: brickTypes,
            selectedBrick: null,
            isPractice: title !== null
        };

        this.renderGame(gameState);
        this.startTimer(gameState, gameView);
    },

    /**
     * 生成随机空缺网格
     * 保证每个空缺都能被某种尺寸的砖填满（不会留下奇葩形状）
     */
    generateGrid(gridSize, totalHoles) {
        // 初始化：全部填满
        const grid = Array(gridSize).fill().map(() => Array(gridSize).fill(true));

        // 随机挖空缺，保证都是矩形区域方便填补
        let holesCreated = 0;
        let attempts = 0;
        while (holesCreated < totalHoles && attempts < 200) {
            attempts++;

            // 随机挖1-2大小的坑
            const w = Math.random() > 0.5 ? 1 : 2;
            const h = Math.random() > 0.5 ? 1 : 2;
            const x = Math.floor(Math.random() * (gridSize - w + 1));
            const y = Math.floor(Math.random() * (gridSize - h + 1));

            // 检查这块区域是不是都被填满了（可以挖）
            let canDig = true;
            for (let dy = 0; dy < h; dy++) {
                for (let dx = 0; dx < w; dx++) {
                    if (!grid[y + dy][x + dx]) {
                        canDig = false;
                        break;
                    }
                }
                if (!canDig) break;
            }

            if (canDig) {
                for (let dy = 0; dy < h; dy++) {
                    for (let dx = 0; dx < w; dx++) {
                        grid[y + dy][x + dx] = false;
                    }
                }
                holesCreated += w * h;
            }
        }

        return grid;
    },

    /**
     * 渲染游戏界面
     */
    renderGame(gameState) {
        const game = gameState.engineeringGame;
        const progress = (game.filledHoles / game.totalHoles * 100).toFixed(0);

        let html = `
            <div style="max-height: 70vh; overflow-y: auto; padding: 0 5px;">
                <div class="engineering-header" style="margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-bottom: 10px;">
                        <div>
                            <h3 style="margin: 0;">🧱 筑城考工</h3>
                            <p style="margin: 4px 0;">已填补: <strong>${game.filledHoles}/${game.totalHoles}</strong> (${progress}%)</p>
                        </div>
                        <div style="text-align: right;">
                            <p style="margin: 4px 0;">剩余时间: <strong id="remaining-time" style="color: ${game.remainingTime < 10 ? '#e74c3c' : '#2c3e50'}">${game.remainingTime}</strong> 秒</p>
                            <p style="margin: 4px 0;">选中: <span id="selected-brick-info">无</span></p>
                        </div>
                    </div>
                </div>

                <div style="display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; align-items: flex-start;">
                    <!-- 城墙网格 -->
                    <div class="engineering-wall" style="
                        display: grid;
                        grid-template-columns: repeat(${game.gridSize}, 30px);
                        grid-template-rows: repeat(${game.gridSize}, 30px);
                        gap: 2px;
                        background: #8b4513;
                        padding: 5px;
                        border: 3px solid #5a2e0a;
                        border-radius: 6px;
                    ">
                        ${this.renderGridCells(game)}
                    </div>

                    <!-- 城砖选择区 -->
                    <div class="engineering-bricks" style="
                        background: #f5f0e1;
                        padding: 15px;
                        border-radius: 8px;
                        min-width: 160px;
                    ">
                        <h4 style="margin-top: 0; margin-bottom: 10px; color: #8b4513;">选择城砖</h4>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            ${this.renderBrickOptions(game)}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        this.bindEvents(gameState, gameView);
    },

    /**
     * 渲染网格单元格
     */
    renderGridCells(game) {
        let html = '';
        for (let y = 0; y < game.gridSize; y++) {
            for (let x = 0; x < game.gridSize; x++) {
                const filled = game.grid[y][x];
                const bgColor = filled ? '#a0522d' : '#f5f0e1';
                const border = filled ? '1px solid #8b4513' : '1px dashed #cc9966';
                html += `
                    <div
                        class="engineering-cell ${filled ? 'filled' : 'empty'}"
                        data-x="${x}"
                        data-y="${y}"
                        style="
                            width: 30px;
                            height: 30px;
                            background: ${bgColor};
                            border: ${border};
                            border-radius: 3px;
                            cursor: ${filled ? 'default' : 'pointer'};
                        "
                    ></div>
                `;
            }
        }
        return html;
    },

    /**
     * 渲染城砖选项
     */
    renderBrickOptions(game) {
        let html = '';
        game.brickTypes.forEach((brick, idx) => {
            if (brick.count <= 0) return;
            const isSelected = game.selectedBrick && game.selectedBrick.index === idx;
            const bgColor = isSelected ? '#a0522d' : '#d2b48c';
            const textColor = isSelected ? '#fff' : '#2c3e50';

            // 绘制砖的预览
            let previewHtml = '';
            for (let y = 0; y < brick.h; y++) {
                previewHtml += '<div style="display: flex;">';
                for (let x = 0; x < brick.w; x++) {
                    previewHtml += `<div style="width: 16px; height: 16px; background: #a0522d; border: 1px solid #8b4513; margin: 1px;"></div>`;
                }
                previewHtml += '</div>';
            }

            html += `
                <button
                    class="btn engineering-brick ${isSelected ? 'selected' : ''}"
                    data-idx="${idx}"
                    style="
                        padding: 8px;
                        background: ${bgColor};
                        color: ${textColor};
                        border: 2px solid ${isSelected ? '#5a2e0a' : '#8b4513'};
                        border-radius: 6px;
                        cursor: pointer;
                    "
                >
                    <div style="display: inline-block; vertical-align: middle; margin-right: 8px;">
                        ${previewHtml}
                    </div>
                    <div style="display: inline-block; vertical-align: middle;">
                        <div style="font-weight: bold;">${brick.name}</div>
                        <div style="font-size: 12px;">剩余: ${brick.count}</div>
                    </div>
                </button>
            `;
        });
        if (html === '') {
            html = '<p style="color: #e74c3c; font-size: 14px;">城砖已用完</p>';
        }
        return html;
    },

    /**
     * 绑定事件
     */
    bindEvents(gameState, gameView) {
        // 城砖选择事件
        document.querySelectorAll('.engineering-brick').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                this.selectBrick(idx, gameState.engineeringGame);
                this.renderGame(gameState);
            });
        });

        // 网格空位点击事件
        document.querySelectorAll('.engineering-cell.empty').forEach(cell => {
            cell.addEventListener('click', () => {
                const x = parseInt(cell.dataset.x);
                const y = parseInt(cell.dataset.y);
                this.placeBrick(x, y, gameState, gameView);
            });
        });
    },

    /**
     * 选择城砖
     */
    selectBrick(idx, game) {
        const brickType = game.brickTypes[idx];
        if (brickType.count <= 0) return;

        game.selectedBrick = {
            index: idx,
            w: brickType.w,
            h: brickType.h
        };
    },

    /**
     * 放置城砖
     */
    placeBrick(x, y, gameState, gameView) {
        const game = gameState.engineeringGame;
        if (!game.selectedBrick) {
            // 没有选中城砖，提示选一个
            return;
        }

        const w = game.selectedBrick.w;
        const h = game.selectedBrick.h;

        // 检查是否超出边界
        if (x + w > game.gridSize || y + h > game.gridSize) {
            // 放超出边界了，不能放
            return;
        }

        // 检查区域是否全为空位（可以放）
        let canPlace = true;
        let emptyCount = 0;
        for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
                if (game.grid[y + dy][x + dx]) {
                    canPlace = false;
                    break;
                } else {
                    emptyCount++;
                }
            }
            if (!canPlace) break;
        }

        if (!canPlace) {
            // 这里已经有砖了，不能放
            return;
        }

        // 放置成功！
        for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
                game.grid[y + dy][x + dx] = true;
            }
        }

        // 减少城砖计数
        game.brickTypes[game.selectedBrick.index].count--;
        // 增加已填补计数
        game.filledHoles += emptyCount;

        // 清空选中
        game.selectedBrick = null;

        // 检查是否全部填满
        if (game.filledHoles >= game.totalHoles) {
            this.finish(gameState, gameView);
        } else {
            this.renderGame(gameState);
        }
    },

    /**
     * 启动计时器
     */
    startTimer(gameState, gameView) {
        this.timerId = setInterval(() => {
            const game = gameState.engineeringGame;
            game.remainingTime--;

            // 更新显示剩余时间
            const timeEl = document.getElementById('remaining-time');
            if (timeEl) {
                timeEl.textContent = game.remainingTime;
                if (game.remainingTime < 10) {
                    timeEl.style.color = '#e74c3c';
                }
            }

            if (game.remainingTime <= 0) {
                clearInterval(this.timerId);
                this.finish(gameState, gameView);
            }
        }, 1000);
    },

    /**
     * 结算游戏
     */
    finish(gameState, gameView) {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }

        const game = gameState.engineeringGame;
        const task = gameState.currentTask;

        // 计算完成率
        const ratio = Math.min(1, game.filledHoles / game.totalHoles);

        let resultText;
        if (ratio >= 0.95) {
            resultText = `🎉 固若金汤！成功填补 ${game.filledHoles}/${game.totalHoles} 空缺，城墙修筑得坚不可摧！`;
        } else if (ratio >= 0.7) {
            resultText = `✅ 修筑完成！成功填补 ${game.filledHoles}/${game.totalHoles} 空缺，城墙坚固可用。`;
        } else if (ratio >= 0.4) {
            resultText = `➖ 修筑过半！填补了 ${game.filledHoles}/${game.totalHoles} 空缺，仍有多处缺口。`;
        } else if (ratio > 0) {
            resultText = `❌ 修筑失败！只填补了 ${game.filledHoles}/${game.totalHoles} 空缺，城墙仍不完整。`;
        } else {
            resultText = `❌ 修筑失败！一块砖都没放上，时间就到了。`;
        }

        if (game.isPractice) {
            // 工部作坊练习 - 非任务，固定奖励工程经验，消耗5天
            const expGained = Math.round(10 * ratio);
            gameState.addSkillExp('engineering', expGained);
            gameState.addLog(`筑城考工练习完成：${resultText} 获得 ${expGained} 工政经验，消耗5天时间。`);
            gameState.advanceDays(5);
            gameState.engineeringGame = null;
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

            gameState.engineeringGame = null;
            gameState.currentScene = window.GameScene.CITY_VIEW;
            gameView.renderAll();
        }
    }
};
