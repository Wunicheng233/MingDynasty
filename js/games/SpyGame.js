/**
 * 潜龙谍影小游戏（密探）
 * 潜入敌营，从起点走到终点，躲避巡逻岗哨的视线
 * 改进玩法：
 * - 地图更大 (Lv1:8x8, Lv2:10x10, Lv3:12x12
 * - 敌岗哨会自动巡逻，顺时针旋转方向
 * - 每个岗哨有扇形视野，被看见直接失败
 * - 玩家需要趁视线盲区悄悄通过
 * 典故：明朝锦衣卫东厂情报网严密，密探潜入敌营刺探情报
 */

window.SpyGame = {
    /**
     * 计时器ID
     */
    rotateTimer: null,

    /**
     * 启动游戏 - 先显示说明界面
     */
    start(gameView, gameState, title = null) {
        const headerTitle = title || (gameState.currentTask ? gameState.currentTask.name : '潜龙谍影');

        let html = `
            <div style="max-height: 70vh; overflow-y: auto; padding: 0 5px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #8b4513; font-size: 28px; margin-bottom: 8px;">🕵️ 潜龙谍影</h2>
                    <p style="color: #6b5b45; font-size: 16px;">潜行躲避巡逻岗哨，找到右下角出口！</p>
                </div>

                <div style="background: #f5f0e1; padding: 18px; border-radius: 8px; margin-bottom: 16px;">
                    <h3 style="color: #8b4513; margin-top: 0; font-size: 22px; margin-bottom: 10px;">游戏规则</h3>
                    <ul style="line-height: 1.7; color: #333; font-size: 18px; padding-left: 20px; margin: 0;">
                        <li>你从左上角出发，目标👉<strong>右下角绿色出口</strong></li>
                        <li>地图上有<strong>👀巡逻岗哨</strong>，<strong>黄色区域=当前视野</strong></li>
                        <li>站在视野里👉<strong>直接被发现，任务失败</strong></li>
                        <li>岗哨每 <strong>2秒顺时针换一次方向</strong>，抓准盲区移动！</li>
                        <li>墙会挡住视线，躲在墙后面安全</li>
                        <li>等级越高 → 地图越大，岗哨越多，难度越大</li>
                    </ul>
                </div>

                <div style="text-align: center; margin-top: 20px;">
                    <button class="btn primary-btn" id="start-spy-btn" style="padding: 12px 40px; font-size: 18px;">开始潜行!</button>
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        document.getElementById('start-spy-btn').addEventListener('click', () => {
            this.startActualGame(gameView, gameState, title);
        });
    },

    /**
     * 真正开始游戏
     */
    startActualGame(gameView, gameState, title = null) {
        const task = gameState.currentTask;

        // 根据技能等级调整迷宫大小和敌人数量（难度自适应）
        let skillLevel = 1;
        if (task && task.requiredSkill) {
            skillLevel = window.SkillSystem.getSkillLevel(gameState, task.requiredSkill);
        }

        // 难度递增：等级越高，地图越大，敌人越多
        let size, guardCount;
        if (skillLevel <= 1) {
            size = 8;
            guardCount = 3;
        } else if (skillLevel === 2) {
            size = 10;
            guardCount = 5;
        } else {
            size = 12;
            guardCount = 7;
        }

        // 初始化游戏状态
        Object.assign(gameState.spyGame, {
            playerPos: {x: 0, y: 0},
            size: size,
            skillLevel: skillLevel,
            guards: [],
            rotationInterval: 2000, // 每2秒换一次方向
            isPractice: title !== null
        });

        // 生成迷宫：起点(0,0)，终点(size-1,size-1)，DFS生成保证通路
        const maze = this.generateMaze(size);
        gameState.spyGame.maze = maze;

        // 随机放置岗哨（避开起点终点和出口附近
        this.placeGuards(gameState.spyGame);

        this.render(gameState);
        this.bindEvents(gameState, gameView);
        this.startRotationTimer(gameState, gameView);
    },

    /**
     * 生成迷宫 - 深度优先搜索算法，保证从起点到终点一定有通路
     */
    generateMaze(size) {
        // 初始化全墙，然后挖通路
        const maze = Array(size).fill().map(() => Array(size).fill(1));
        // 方向：上下左右
        const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];

        // DFS挖路
        const carve = (x, y, visited) => {
            maze[y][x] = 0; // 挖开这格
            visited.add(`${x},${y}`);

            // 随机打乱方向
            const shuffled = [...dirs].sort(() => Math.random() - 0.5);

            for (const [dx, dy] of shuffled) {
                const nx = x + dx * 2;
                const ny = y + dy * 2;
                if (nx >= 0 && nx < size && ny >= 0 && ny < size && !visited.has(`${nx},${ny}`)) {
                    // 挖开中间墙
                    maze[y + dy][x + dx] = 0;
                    carve(nx, ny, visited);
                }
            }
        };

        carve(0, 0, new Set());
        // 设置出口
        maze[size - 1][size - 1] = 2;

        // 🔧 关键修复：确保起点至少有一个相邻格子是通路（不能被墙围住
        const startDirs = [[1, 0], [0, 1]]; // 右和下
        for (const [dx, dy] of startDirs) {
            const x = dx;
            const y = dy;
            if (x < size && y < size) {
                maze[y][x] = 0; // 强制打通
            }
        }

        // 🔧 关键修复：确保终点至少有一个相邻格子是通路（不能被墙围住
        const ex = size - 1;
        const ey = size - 1;
        const endDirs = [[0, -1], [-1, 0]]; // 上和左
        for (const [dx, dy] of endDirs) {
            const x = ex + dx;
            const y = ey + dy;
            if (x >= 0 && y >= 0) {
                maze[y][x] = 0; // 强制打通
            }
        }

        return maze;
    },

    /**
     * 随机放置岗哨
     */
    placeGuards(game) {
        const size = game.size;
        const needed = this.getGuardCount(game.skillLevel);

        // 尝试放置，避开起点、终点、墙
        let attempts = 0;
        while (game.guards.length < needed && attempts < 100) {
            attempts++;
            const x = Math.floor(Math.random() * size);
            const y = Math.floor(Math.random() * size);

            // 不能放：起点、终点、离起点太近、墙
            if ((x === 0 && y === 0) || (x === size-1 && y === size-1)) continue;
            if (game.maze[y][x] === 1) continue;
            if (Math.abs(x - 0) + Math.abs(y - 0) <= 2) continue;
            if (Math.abs(x - (size-1)) + Math.abs(y - (size-1)) <= 2) continue;
            // 不和其他岗哨重叠
            if (game.guards.some(g => g.x === x && g.y === y)) continue;

            // 放上去，初始方向随机
            game.guards.push({
                x: x,
                y: y,
                dir: Math.floor(Math.random() * 4) // 0:上, 1:右, 2:下, 3:左
            });
        }
    },

    /**
     * 获取岗哨数量
     */
    getGuardCount(skillLevel) {
        if (skillLevel <= 1) return 3;
        if (skillLevel === 2) return 5;
        return 7;
    },

    /**
     * 获取方向的箭头符号
     */
    getDirArrow(dir) {
        const arrows = ['↑', '→', '↓', '←'];
        return arrows[dir];
    },

    /**
     * 获取方向的dx dy增量
     */
    getDirDelta(dir) {
        // 0:上(y-), 1:右(x+), 2:下(y+), 3:左(x-)
        switch (dir) {
            case 0: return {dx: 0, dy: -1};
            case 1: return {dx: 1, dy: 0};
            case 2: return {dx: 0, dy: 1};
            case 3: return {dx: -1, dy: 0};
        }
    },

    /**
     * 获取一个格子是否在某个岗哨视野内
     */
    isInVision(guard, px, py, size, maze) {
        const dirDelta = this.getDirDelta(guard.dir);
        const dx = dirDelta.dx;
        const dy = dirDelta.dy;

        // 视野扇形范围：向前3格，左右扩散
        // 以岗哨位置(guard.x, guard.y)开始，沿着方向走3格
        // 每一格，当前格算入视野
        // 遇到墙就停止，不能看穿墙
        for (let step = 1; step <= 3; step++) {
            const vx = guard.x + dx * step;
            const vy = guard.y + dy * step;

            // 出界
            if (vx < 0 || vx >= size || vy < 0 || vy >= size) break;
            // 墙挡住视线，停止
            if (maze[vy][vx] === 1) break;

            // 如果玩家在这里，就是看见了
            if (vx === px && vy === py) {
                return true;
            }

            // 左右相邻也在扇形视野（从第二步开始展开
            if (step >= 2) {
                const lx = vx - dy;
                const ly = vy + dx;
                if (lx >= 0 && lx < size && ly >= 0 && ly < size && maze[ly][lx] !== 1 && lx === px && ly === py) {
                    return true;
                }
                const rx = vx + dy;
                const ry = vy - dx;
                if (rx >= 0 && rx < size && ry >= 0 && ry < size && maze[ry][rx] !== 1 && rx === px && ry === py) {
                    return true;
                }
            }
        }
        return false;
    },

    /**
     * 渲染整个地图
     */
    render(gameState) {
        const game = gameState.spyGame;
        const size = game.size;

        let html = `
            <div style="max-height: 70vh; overflow-y: auto; padding: 0 5px;">
                <div style="text-align: center;">
                    <div class="spy-maze" id="spy-maze" style="display: inline-block; border: 3px solid #8b4513; border-radius: 8px; padding: 5px; background: #f5deb3;">
                        ${game.maze.map((row, y) => `
                            <div class="spy-row" style="display: flex; gap: 4px; margin-bottom: 4px;">
                                ${row.map((cell, x) => {
                                    const info = this.getCellInfo(cell, x, y, game);
                                    return `<div class="spy-cell" data-x="${x}" data-y="${y}" ${info.disabled}
                                        style="width: 32px; height: 32px; border: 1px solid #bdc3c7; opacity: ${info.opacity};
                                        display: flex; align-items: center; justify-content: center; background: ${info.bg};">${info.emoji}</div>`;
                                }).join('')}
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="spy-log" id="spy-log" style="margin-top: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; max-height: 80px; overflow-y: auto;">
                    <div>你从左上角出发了，岗哨每2秒换一次方向，小心视野！</div>
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        this.renderVision(gameState);
    },

    /**
     * 获取格子基本信息
     */
    getCellInfo(cell, x, y, game) {
        // 先检查是不是岗哨
        const guard = game.guards.find(g => g.x === x && g.y === y);
        if (guard) {
            return {
                bg: '#34495e',
                emoji: `👀${this.getDirArrow(guard.dir)}`,
                disabled: '',
                opacity: 1
            };
        }

        switch (cell) {
            case 0: return { bg: '#ecf0f1', emoji: '', disabled: '', opacity: 1 }; // 空通路 - 浅灰
            case 1: return { bg: '#2c3e50', emoji: '', disabled: 'disabled', opacity: 0.8 }; // 墙 - 深色
            case 2: return { bg: '#2ecc71', emoji: '🎯', disabled: '', opacity: 1 }; // 出口 - 绿色
            default: return { bg: '#ecf0f1', emoji: '', disabled: '', opacity: 1 };
        }
    },

    /**
     * 渲染所有视野（标黄色
     */
    renderVision(gameState) {
        const game = gameState.spyGame;
        const size = game.size;

        // 先重置所有格子背景
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const cell = document.querySelector(`.spy-cell[data-x="${x}"][data-y="${y}"]`);
                if (!cell) continue;

                // 恢复原有颜色，除非这是岗哨或者玩家
                const cellType = game.maze[y][x];
                const guard = game.guards.find(g => g.x === x && g.y === y);
                if (guard) {
                    cell.style.background = '#34495e';
                } else if (cellType === 0) {
                    cell.style.background = '#ecf0f1';
                } else if (cellType === 1) {
                    cell.style.background = '#2c3e50';
                } else if (cellType === 2) {
                    cell.style.background = '#2ecc71';
                }
            }
        }

        // 标记所有视野为黄色
        game.guards.forEach(guard => {
            const dirDelta = this.getDirDelta(guard.dir);
            const dx = dirDelta.dx;
            const dy = dirDelta.dy;

            for (let step = 1; step <= 3; step++) {
                const vx = guard.x + dx * step;
                const vy = guard.y + dy * step;
                if (vx < 0 || vx >= size || vy < 0 || vy >= size) break;
                if (game.maze[vy][vx] === 1) break; // 墙挡住视线

                // 这一格在视野里
                const vCell = document.querySelector(`.spy-cell[data-x="${vx}"][data-y="${vy}"]`);
                if (vCell && game.maze[vy][vx] !== 1 && !game.guards.some(g => g.x === vx && g.y === vy)) {
                    vCell.style.background = '#fff2cc'; // 浅黄色视野
                }

                // 扇形展开
                if (step >= 2) {
                    const lx = vx - dy;
                    const ly = vy + dx;
                    if (lx >= 0 && lx < size && ly >= 0 && ly < size && game.maze[ly][lx] !== 1 && !game.guards.find(g => g.x === lx && g.y === ly)) {
                        const lCell = document.querySelector(`.spy-cell[data-x="${lx}"][data-y="${ly}"]`);
                        if (lCell) lCell.style.background = '#fff2cc';
                    }
                    const rx = vx + dy;
                    const ry = vy - dx;
                    if (rx >= 0 && rx < size && ry >= 0 && ry < size && game.maze[ry][rx] !== 1 && !game.guards.find(g => g.x === rx && g.y === ry)) {
                        const rCell = document.querySelector(`.spy-cell[data-x="${rx}"][data-y="${ry}"]`);
                        if (rCell) rCell.style.background = '#fff2cc';
                    }
                }
            }
        });

        // 确保玩家位置保持红色
        const pCell = document.querySelector(`.spy-cell[data-x="${game.playerPos.x}"][data-y="${game.playerPos.y}"]`);
        if (pCell) {
            pCell.style.background = '#e74c3c';
            pCell.textContent = '🔴';
        }
    },

    /**
     * 绑定点击事件
     */
    bindEvents(gameState, gameView) {
        const self = this;
        document.querySelectorAll('.spy-cell.spy-path, .spy-cell.spy-exit').forEach(cell => {
            cell.addEventListener('click', function() {
                const x = parseInt(cell.dataset.x);
                const y = parseInt(cell.dataset.y);
                self.onClick(x, y, gameState, gameView);
            });
        });
    },

    /**
     * 所有岗哨顺时针转一次
     */
    rotateGuards(gameState, gameView) {
        const game = gameState.spyGame;
        if (!game || !game.guards) return;

        // 每个顺时针转
        game.guards.forEach(guard => {
            guard.dir = (guard.dir + 1) % 4;
        });

        // 重新渲染视野并检查
        this.renderVision(gameState);
        this.checkDetection(gameState, gameView);
    },

    /**
     * 开始方向旋转计时器
     */
    startRotationTimer(gameState, gameView) {
        // 清除旧计时器
        if (this.rotateTimer) {
            clearInterval(this.rotateTimer);
        }
        // 每N秒转一次
        this.rotateTimer = setInterval(() => {
            this.rotateGuards(gameState, gameView);
        }, gameState.spyGame.rotationInterval);
    },

    /**
     * 检查玩家是否被发现
     */
    checkDetection(gameState, gameView) {
        const game = gameState.spyGame;
        const px = game.playerPos.x;
        const py = game.playerPos.y;
        const size = game.size;

        for (const guard of game.guards) {
            if (this.isInVision(guard, px, py, size, game.maze)) {
                // 被发现了！
                this.finish(false, gameState, gameView);
                return;
            }
        }
    },

    /**
     * 玩家点击移动
     */
    onClick(x, y, gameState, gameView) {
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
        // 不能走岗哨位置
        if (game.guards.some(g => g.x === x && g.y === y)) {
            return;
        }

        // 移动玩家：清除旧位置
        const oldCell = document.querySelector(`.spy-cell[data-x="${player.x}"][data-y="${player.y}"]`);
        if (oldCell) {
            const cellType = game.maze[player.y][player.x];
            if (cellType === 0) {
                oldCell.style.background = '#ecf0f1';
                oldCell.textContent = '';
            } else if (cellType === 2) {
                oldCell.style.background = '#2ecc71';
                oldCell.textContent = '🎯';
            }
        }

        // 更新玩家位置
        game.playerPos = {x, y};
        const newCell = document.querySelector(`.spy-cell[data-x="${x}"][data-y="${y}"]`);
        if (newCell) {
            newCell.textContent = '🔴';
            newCell.style.background = '#e74c3c';
        }

        // 重新渲染视野（因为玩家移动了，可能颜色被覆盖
        this.renderVision(gameState);

        // 检查是否被发现
        this.checkDetection(gameState, gameView);

        // 检查是否到出口
        if (game.maze[y][x] === 2) {
            // 已经到出口，直接成功
            this.finish(true, gameState, gameView);
            return;
        }
    },

    /**
     * 游戏结算
     */
    finish(success, gameState, gameView) {
        // 停止旋转计时器
        if (this.rotateTimer) {
            clearInterval(this.rotateTimer);
            this.rotateTimer = null;
        }

        const game = gameState.spyGame;
        const task = gameState.currentTask;

        let ratio;
        let resultTitle, resultDesc;

        if (success && game.maze[game.playerPos.y][game.playerPos.x] === 2) {
            // 成功到达出口
            ratio = 1.0;
            resultTitle = '✔ 潜入成功！';
            resultDesc = '你躲过了所有岗哨，悄悄摸到敌营情报点，完成任务全身而退！';
        } else {
            // 被发现，根据离终点距离计算完成率
            const endX = game.size - 1;
            const endY = game.size - 1;
            const distanceToExit = Math.abs(endX - game.playerPos.x) + Math.abs(endY - game.playerPos.y);
            const maxDistance = endX + endY;
            ratio = Math.max(0.2, (1 - distanceToExit / maxDistance) * 0.6);
            resultTitle = '✘ 被发现了';
            resultDesc = `你在离出口还有 ${distanceToExit} 格时被岗哨发现，不得不撤退。`;
        }

        const template = getMissionTemplateById(gameState.currentTask.templateId) || gameState.currentTask;
        // 实际进度 = 目标值 * 完成率
        const actualProgress = Math.round(gameState.currentTask.targetValue * ratio);
        const isSuccess = actualProgress > 0;

        // 使用新的主命系统结算
        const result = gameState.completeMission(isSuccess, actualProgress);

        gameState.addLog(`【${template.name}】${resultTitle}`);

        // 显示结果页
        let html = `
            <div style="max-height: 70vh; overflow-y: auto; padding: 0 5px;">
                <div class="spy-result" style="text-align: center; padding: 30px;">
                    <h2 style="font-size: 28px; margin-bottom: 20px; color: #8b4513;">${resultTitle}</h2>
                    <p style="font-size: 16px; margin-bottom: 20px;">${resultDesc}</p>
                    <div style="margin-top: 30px;">
                        <button class="btn primary-btn" id="spy-done-btn">返回</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        document.getElementById('spy-done-btn').addEventListener('click', () => {
            // 时间推进：按任务限时推进
            window.TimeSystem.advanceDays(gameState, template.timeLimitDays);
            gameState.spyGame = null;
            gameState.currentScene = window.GameScene.CITY_VIEW;
            gameView.renderAll();
        });
    }
};
