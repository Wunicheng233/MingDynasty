/**
 * 楼船破浪小游戏（水战/航海）
 * 新玩法：楼船在大海上自动航行，左右移动躲避礁石，坚持越远得分越高
 * 典故：明代郑和下西洋，宝船船队七下西洋，乘风破浪开辟航路
 */

window.NavyGame = {
    /**
     * 动画ID
     */
    animationId: null,
    /**
     * 最后更新时间
     */
    lastTime: 0,

    /**
     * 启动游戏 - 先显示说明
     */
    start(gameView, gameState, title = null) {
        const headerTitle = title || (gameState.currentTask ? gameState.currentTask.name : '楼船破浪');

        let html = `
            <div style="max-height: 70vh; overflow-y: auto; padding: 0 5px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #8b4513; font-size: 28px; margin-bottom: 8px;">🚢 楼船破浪</h2>
                    <p style="color: #6b5b45; font-size: 16px;">指挥楼船在大海上航行，左右移动躲避礁石，航行越远得分越高！</p>
                </div>

                <div style="background: #f5f0e1; padding: 18px; border-radius: 8px; margin-bottom: 16px;">
                    <h3 style="color: #8b4513; margin-top: 0; font-size: 22px; margin-bottom: 10px;">游戏规则</h3>
                    <ul style="line-height: 1.7; color: #333; font-size: 18px; padding-left: 20px; margin: 0;">
                        <li>楼船自动向前航行，<strong>点击/拖动左右移动</strong>躲开礁石</li>
                        <li>共有 <strong>3点生命值</strong>，撞到礁石扣除一点，扣完游戏结束</li>
                        <li>航行越远，得分越高，奖励越多</li>
                        <li>等级越高 → 船速越快，礁石越多，难度越大</li>
                        <li>也可以用键盘 ← → 方向键控制移动</li>
                    </ul>
                </div>

                <div style="text-align: center; margin-top: 20px;">
                    <button class="btn primary-btn" id="start-navy-btn" style="padding: 12px 40px; font-size: 18px;">开始航行!</button>
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        document.getElementById('start-navy-btn').addEventListener('click', () => {
            this.startActualGame(gameView, gameState, title);
        });
    },

    /**
     * 真正开始游戏
     */
    startActualGame(gameView, gameState, title = null) {
        const task = gameState.currentTask;

        // 根据技能等级调整难度
        // Lv1: 船速慢，礁石少; Lv2: 中等; Lv3: 船速快，礁石多
        let skillLevel = 1;
        if (task && task.requiredSkill) {
            skillLevel = window.SkillSystem.getSkillLevel(gameState, task.requiredSkill);
        }
        skillLevel = Math.max(1, Math.min(3, skillLevel));

        // 难度参数
        // baseSpeed: 礁石下落速度，spawnInterval: 生成新礁石间隔
        const baseSpeed = 1 + skillLevel * 0.8; // 1.8, 2.6, 3.4
        const spawnInterval = skillLevel === 1 ? 60 : skillLevel === 2 ? 45 : 35;

        // 初始化游戏状态
        gameState.navyGame = {
            skillLevel: skillLevel,
            shipX: 50, // 百分比，船在水平位置
            shipY: 85, // 百分比，船在垂直位置（底部）
            shipWidth: 15, // 船宽度百分比
            shipHeight: 12, // 船高度百分比
            hp: 3, // 生命值
            distance: 0, // 已航行距离
            baseSpeed: baseSpeed,
            spawnInterval: spawnInterval,
            obstacles: [], // 障碍物 [{x, y, width, height}]
            frameCount: 0,
            isPractice: title !== null
        };

        this.renderGame(gameState);
        this.bindEvents(gameState, gameView);
        this.lastTime = performance.now();
        this.gameLoop(gameState, gameView);
    },

    /**
     * 渲染游戏界面
     */
    renderGame(gameState) {
        const game = gameState.navyGame;
        const headerTitle = game.isPractice ? '楼船破浪练习' : (gameState.currentTask ? gameState.currentTask.name : '楼船破浪');

        // 绘制生命值
        const hpHtml = '❤️'.repeat(game.hp);

        let html = `
            <div style="max-height: 70vh; overflow-y: auto; padding: 0 5px;">
                <div class="navy-header" style="margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="margin: 0;">${headerTitle}</h3>
                        <div class="hp-display" style="font-size: 18px;">${hpHtml}</div>
                    </div>
                    <p style="margin: 5px 0;">航行距离: <strong>${Math.floor(game.distance)}</strong> 海里</p>
                </div>
                <div
                    id="navy-canvas-container"
                    style="
                        position: relative;
                        width: 100%;
                        height: 400px;
                        background: linear-gradient(to bottom, #87ceeb 0%, #4a90e2 100%);
                        border: 3px solid #8b4513;
                        border-radius: 8px;
                        overflow: hidden;
                        touch-action: none;
                    "
                >
                    ${this.renderObstacles(game)}
                    <!-- 楼船 - 船头朝上（航行方向向上，礁石从上方来） -->
                    <div
                        id="navy-ship"
                        style="
                            position: absolute;
                            bottom: ${100 - game.shipY - game.shipHeight}%;
                            left: ${game.shipX - game.shipWidth / 2}%;
                            width: ${game.shipWidth}%;
                            height: ${game.shipHeight}%;
                            z-index: 10;
                        "
                    >
                        <!-- 船身 -->
                        <div style="
                            position: absolute;
                            bottom: 0;
                            left: 10%;
                            top: 10%;
                            right: 0;
                            width: 60%;
                            background: #a0522d;
                            border: 2px solid #5a2e0a;
                            border-radius: 10% 60% 10% 60%;
                        "></div>
                        <!-- 船头 - 朝上 -->
                        <div style="
                            position: absolute;
                            top: 0;
                            left: 10%;
                            width: 40%;
                            height: 25%;
                            background: #8b4513;
                            border: 2px solid #5a2e0a;
                            border-radius: 80% 80% 10% 10%;
                        "></div>
                        <!-- 桅杆 -->
                        <div style="
                            position: absolute;
                            top: 25%;
                            left: 25%;
                            width: 8%;
                            height: 60%;
                            background: #5a2e0a;
                            border-radius: 2px;
                        "></div>
                        <!-- 帆 -->
                        <div style="
                            position: absolute;
                            top: 25%;
                            left: 35%;
                            bottom: 10%;
                            width: 55%;
                            background: #f5f0e1;
                            border: 1px solid #8b4513;
                            border-radius: 10% 50% 10% 50%;
                        "></div>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 10px; color: #666; font-size: 14px;">
                    <p>点击大海左右区域移动，或用方向键 ← → 控制</p>
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
    },

    /**
     * 渲染所有障碍物
     */
    renderObstacles(game) {
        return game.obstacles.map((obs, idx) => `
            <div
                class="navy-obstacle"
                data-idx="${idx}"
                style="
                    position: absolute;
                    top: ${obs.y}%;
                    left: ${obs.x}%;
                    width: ${obs.width}%;
                    height: ${obs.height}%;
                    background: #5a4632;
                    border: 2px solid #3a2c1e;
                    border-radius: 50%;
                    opacity: 0.9;
                "
            ></div>
        `).join('');
    },

    /**
     * 绑定事件
     */
    bindEvents(gameState, gameView) {
        const container = document.getElementById('navy-canvas-container');
        if (!container) return;

        // 点击移动
        container.addEventListener('click', (e) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const ratio = x / rect.width * 100;
            this.moveShipTo(ratio, gameState);
        });

        // 拖拽移动
        let dragging = false;
        container.addEventListener('mousedown', () => {
            dragging = true;
        });
        container.addEventListener('mousemove', (e) => {
            if (!dragging) return;
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const ratio = x / rect.width * 100;
            this.moveShipTo(ratio, gameState);
        });
        container.addEventListener('mouseup', () => {
            dragging = false;
        });
        container.addEventListener('mouseleave', () => {
            dragging = false;
        });

        // 触摸移动（移动端支持）
        container.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = container.getBoundingClientRect();
            const x = e.touches[0].clientX - rect.left;
            const ratio = x / rect.width * 100;
            this.moveShipTo(ratio, gameState);
        }, {passive: false});

        // 键盘方向键
        document.addEventListener('keydown', (e) => {
            const game = gameState.navyGame;
            if (!game || this.animationId === null) return;

            if (e.key === 'ArrowLeft') {
                this.moveShipBy(-5, game, gameState);
            } else if (e.key === 'ArrowRight') {
                this.moveShipBy(5, game, gameState);
            }
        });
    },

    /**
     * 移动船到指定X位置（百分比）
     */
    moveShipTo(x, gameState) {
        const game = gameState.navyGame;
        // 保持船在屏幕内
        const halfWidth = game.shipWidth / 2;
        game.shipX = Math.max(halfWidth, Math.min(100 - halfWidth, x));
        this.updateShipPosition(gameState);
    },

    /**
     * 相对移动船
     */
    moveShipBy(delta, game, gameState) {
        const halfWidth = game.shipWidth / 2;
        game.shipX = Math.max(halfWidth, Math.min(100 - halfWidth, game.shipX + delta));
        this.updateShipPosition(gameState);
    },

    /**
     * 更新船的DOM位置
     */
    updateShipPosition(gameState) {
        const ship = document.getElementById('navy-ship');
        if (ship) {
            const game = gameState.navyGame;
            if (!game) return;
            ship.style.left = `${game.shipX - game.shipWidth / 2}%`;
        }
    },

    /**
     * 生成新障碍物
     */
    spawnObstacle(game) {
        // 随机宽度 10%-20%
        const width = 10 + Math.random() * 10;
        const height = width * 0.8;
        // 随机X位置
        const x = width/2 + Math.random() * (100 - width);
        // 从顶部出来
        const y = -height;

        game.obstacles.push({
            x: x,
            y: y,
            width: width,
            height: height
        });
    },

    /**
     * 更新障碍物位置，检测碰撞
     */
    updateObstacles(gameState) {
        const game = gameState.navyGame;
        const speed = game.baseSpeed;

        // 下移所有障碍物
        let collided = false;
        game.obstacles = game.obstacles.filter(obs => {
            obs.y += speed;
            // 去掉已经移出屏幕的
            if (obs.y > 100) {
                game.distance += 1; // 成功躲过，加航行距离
                return false;
            }
            // 检测碰撞
            if (this.checkCollision(obs, game)) {
                collided = true;
                return false;
            }
            return true;
        });

        // 检查是否已经达到目标航程，提前结束
        const targetDistance = game.skillLevel === 1 ? 50 : game.skillLevel === 2 ? 75 : 100;
        if (game.distance >= targetDistance) {
            // 已经达到目标，提前成功结束
            this.finish(gameState, gameView);
            return false;
        }

        // 碰撞了扣血
        if (collided) {
            game.hp--;
            this.updateHpDisplay(game);
            if (game.hp <= 0) {
                this.finish(gameState, gameView);
                return false;
            }
        }

        // 重新渲染障碍物DOM
        this.reRenderObstacles(game);
        // 更新航行距离显示
        this.updateDistanceDisplay(game);

        return true;
    },

    /**
     * 更新生命值显示
     */
    updateHpDisplay(game) {
        const hpContainer = document.querySelector('.navy-header .hp-display');
        if (hpContainer) {
            const hpHtml = '❤️'.repeat(game.hp);
            hpContainer.innerHTML = hpHtml;
        }
    },

    /**
     * 碰撞检测
     */
    checkCollision(obs, game) {
        // 船的边界
        const shipLeft = game.shipX - game.shipWidth / 2;
        const shipRight = game.shipX + game.shipWidth / 2;
        const shipTop = game.shipY - game.shipHeight / 2;
        const shipBottom = game.shipY + game.shipHeight / 2;

        // 障碍物边界
        const obsLeft = obs.x - obs.width / 2;
        const obsRight = obs.x + obs.width / 2;
        const obsTop = obs.y - obs.height / 2;
        const obsBottom = obs.y + obs.height / 2;

        // AABB碰撞检测
        return !(
            shipRight < obsLeft ||
            shipLeft > obsRight ||
            shipBottom < obsTop ||
            shipTop > obsBottom
        );
    },

    /**
     * 重新渲染障碍物
     */
    reRenderObstacles(game) {
        const container = document.getElementById('navy-canvas-container');
        if (!container) return;

        // 移除旧障碍物
        document.querySelectorAll('.navy-obstacle').forEach(el => el.remove());
        // 添加新障碍物
        const ship = document.getElementById('navy-ship');
        if (!ship) return;

        game.obstacles.forEach((obs, idx) => {
            const div = document.createElement('div');
            div.className = 'navy-obstacle';
            div.dataset.idx = idx;
            div.style.position = 'absolute';
            div.style.top = `${obs.y}%`;
            div.style.left = `${obs.x}%`;
            div.style.width = `${obs.width}%`;
            div.style.height = `${obs.height}%`;
            div.style.background = '#5a4632';
            div.style.border = '2px solid #3a2c1e';
            div.style.borderRadius = '50%';
            div.style.opacity = '0.9';
            container.insertBefore(div, ship);
        });
    },

    /**
     * 更新距离显示
     */
    updateDistanceDisplay(game) {
        const header = document.querySelector('.navy-header p');
        if (header) {
            header.innerHTML = `航行距离: <strong>${Math.floor(game.distance)}</strong> 海里`;
        }
    },

    /**
     * 游戏主循环
     */
    gameLoop(gameState, gameView) {
        if (!gameState.navyGame) return; // 游戏已经结束

        const game = gameState.navyGame;

        // 生成新障碍物
        game.frameCount++;
        if (game.frameCount % game.spawnInterval === 0) {
            this.spawnObstacle(game);
        }

        // 更新
        const gameRunning = this.updateObstacles(gameState);
        if (!gameRunning) return;

        this.animationId = requestAnimationFrame((time) => {
            this.lastTime = time;
            this.gameLoop(gameState, gameView);
        });
    },

    /**
     * 结算游戏
     */
    finish(gameState, gameView) {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        const game = gameState.navyGame;
        const task = gameState.currentTask;

        // 计算完成率：目标距离，Lv1目标50，Lv2目标75，Lv3目标100（减半，游戏时间更紧凑）
        const targetDistance = game.skillLevel === 1 ? 50 : game.skillLevel === 2 ? 75 : 100;
        const ratio = Math.min(1, game.distance / targetDistance);

        let resultTitle, resultDesc;
        if (ratio >= 1.0) {
            resultTitle = '🎉 航行圆满！';
            resultDesc = `你指挥楼船成功航行 ${Math.floor(game.distance)} 海里，冲破重重礁石，顺利到达目的地！`;
        } else if (ratio >= 0.6) {
            resultTitle = '✅ 航行成功';
            resultDesc = `你指挥楼船航行 ${Math.floor(game.distance)} 海里，已经非常接近目的地！`;
        } else if (ratio >= 0.3) {
            resultTitle = '⚠ 航行半途';
            resultDesc = `你指挥楼船航行 ${Math.floor(game.distance)} 海里，触礁沉没，未能到达目的地。`;
        } else {
            resultTitle = '✘ 航行失败';
            resultDesc = `只航行了 ${Math.floor(game.distance)} 海里就触礁，早早被迫返航。`;
        }

        if (game.isPractice) {
            // 练习模式 - 固定奖励水战经验，消耗5天
            const expGained = Math.round(10 * ratio);
            gameState.addSkillExp('navy', expGained);
            gameState.addLog(`楼船破浪练习完成：${resultTitle} 航行 ${Math.floor(game.distance)} 海里，获得 ${expGained} 水战经验，消耗5天时间。`);
            gameState.advanceDays(5);
            gameState.navyGame = null;

            let html = `
                <div class="navy-result" style="text-align: center; padding: 30px; max-height: 70vh; overflow-y: auto;">
                    <h2 style="font-size: 28px; margin-bottom: 20px; color: #8b4513;">${resultTitle}</h2>
                    <p style="font-size: 16px; margin-bottom: 30px;">${resultDesc}</p>
                    <div style="background: #f5f0e1; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                        <p>最终航行：${Math.floor(game.distance)} / ${targetDistance} 海里</p>
                        <p>剩余生命值：${'❤️'.repeat(game.hp)}</p>
                    </div>
                    <p>获得：${expGained} 水战经验</p>
                    <div style="margin-top: 30px;">
                        <button class="btn primary-btn" id="navy-done-btn">返回市舶司</button>
                    </div>
                </div>
            `;

            document.getElementById('farming-game-view').innerHTML = html;
            document.getElementById('navy-done-btn').addEventListener('click', () => {
                // 返回设施场景
                gameState.currentScene = window.GameScene.FACILITY;
                gameView.renderAll();
            });
        } else {
            // 正常任务结算 - 使用新主命系统
            const template = getMissionTemplateById(gameState.currentTask.templateId) || gameState.currentTask;
            // 实际进度 = 目标值 * 完成率
            const actualProgress = Math.round(gameState.currentTask.targetValue * ratio);
            const success = actualProgress > 0;

            // 使用新的主命系统结算
            const result = gameState.completeMission(success, actualProgress);

            gameState.addLog(`【${template.name}】${resultTitle} 航行 ${Math.floor(game.distance)}海里`);

            let html = `
                <div class="navy-result" style="text-align: center; padding: 30px; max-height: 70vh; overflow-y: auto;">
                    <h2 style="font-size: 28px; margin-bottom: 20px; color: #8b4513;">${resultTitle}</h2>
                    <p style="font-size: 16px; margin-bottom: 30px;">${resultDesc}</p>
                    <div style="background: #f5f0e1; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                        <p>最终航行：${Math.floor(game.distance)} / ${targetDistance} 海里</p>
                        <p>剩余生命值：${'❤️'.repeat(game.hp)}</p>
                    </div>
                    <p>功勋奖励：${result.meritGained > 0 ? '+' : ''}${result.meritGained}</p>
                    <div style="margin-top: 30px;">
                        <button class="btn primary-btn" id="navy-done-btn">返航返回</button>
                    </div>
                </div>
            `;

            document.getElementById('farming-game-view').innerHTML = html;
            document.getElementById('navy-done-btn').addEventListener('click', () => {
                // 时间推进：按任务限时推进
                window.TimeSystem.advanceDays(gameState, template.timeLimitDays);
                gameState.navyGame = null;
                gameState.currentScene = window.GameScene.CITY_VIEW;
                gameView.renderAll();
            });
        }
    }
};
