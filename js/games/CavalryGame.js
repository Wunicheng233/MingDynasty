/**
 * 赛马争先小游戏（骑战）
 * 改进为横版跑酷：类似谷歌小恐龙，自动奔跑点击跳跃，躲避障碍物，先到终点获胜
 * 典故：常遇春单骑突阵，模拟骑兵训练
 */

window.CavalryGame = {
    /**
     * 游戏状态
     */
    game: null,

    /**
     * canvas 上下文
     */
    ctx: null,

    /**
     * 动画ID
     */
    animationId: null,

    /**
     * 启动游戏 - 先显示说明界面
     */
    start(gameView, gameState, title = null) {
        const headerTitle = title || (gameState.currentTask ? gameState.currentTask.name : '赛马争先');

        let html = `
            <div style="max-height: 70vh; overflow-y: auto; padding: 0 5px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #8b4513; font-size: 28px; margin-bottom: 8px;">🏇 赛马争先</h2>
                    <p style="color: #6b5b45; font-size: 16px;">横版跑酷，点击跳跃躲避障碍物！</p>
                </div>

                <div style="background: #f5f0e1; padding: 18px; border-radius: 8px; margin-bottom: 16px;">
                    <h3 style="color: #8b4513; margin-top: 0; font-size: 22px; margin-bottom: 10px;">游戏规则</h3>
                    <ul style="line-height: 1.7; color: #333; font-size: 18px; padding-left: 20px; margin: 0;">
                        <li>固定跑 <strong>15秒</strong>，你需要躲避各种障碍物</li>
                        <li><strong>点击任意位置 / 按空格键</strong>跳跃</li>
                        <li>撞到障碍物 → 屏幕抖动 + 碰撞计数+1</li>
                        <li>等级越高 → 速度越快，难度越大</li>
                        <li>最终成绩按碰撞次数计算：<strong>0碰撞 = 满分</strong></li>
                    </ul>
                </div>

                <div style="text-align: center; margin-top: 20px;">
                    <button class="btn primary-btn" id="start-cavalry-btn" style="padding: 12px 40px; font-size: 18px;">开始跑!</button>
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        document.getElementById('start-cavalry-btn').addEventListener('click', () => {
            this.startActualGame(gameView, gameState, title);
        });
    },

    /**
     * 真正开始游戏
     */
    startActualGame(gameView, gameState, title = null) {
        const task = gameState.currentTask;

        // 根据技能等级调整参数
        let skillLevel = 1;
        if (task && task.requiredSkill) {
            skillLevel = window.SkillSystem.getSkillLevel(gameState, task.requiredSkill);
        }

        // 规则修改：固定游戏时间15秒，按碰撞次数算分
        // 等级越高 → 速度越快
        // Lv1: 速度 1.2, Lv2: 1.6, Lv3: 2.0
        const baseSpeed = 1.2 + (skillLevel - 1) * 0.4;

        // 跳跃冷却 - 等级越高冷却越短
        // Lv1: 900ms, Lv2: 600ms, Lv3: 400ms
        const jumpCooldown = 900 - skillLevel * 250;

        // 障碍物间距 - 等级越高速度越快，但间距也增大，保证可玩性
        // 速度提升后间距也要相应加大，保证能跳过
        const minGapBase = 85 + skillLevel * 15;
        const maxGapBase = 160 + skillLevel * 20;

        // 初始化游戏状态
        this.game = {
            gameView: gameView,
            gameState: gameState,
            skillLevel: skillLevel,
            baseSpeed: baseSpeed,
            gameTime: 15, // 固定15秒
            remainingTime: 15,
            jumpCooldown: jumpCooldown,
            minGapBase: minGapBase,
            maxGapBase: maxGapBase,
            playerX: 80,  // 固定在屏幕左侧
            playerY: 0,
            playerVY: 0,
            playerDistance: 0, // 玩家累计前进距离，用于障碍物相对移动
            collisionCount: 0, // 撞到障碍物次数，越少分数越高
            shakeTime: 0, // 碰撞抖动时间，用于反馈效果
            lastJumpTime: 0,
            gravity: 0.4,  // 减小重力 = 更长滞空，更容易跳跃
            groundY: 0,
            obstacles: [],
            clouds: [  // 背景云彩，用于滚动动画
                {x: Math.random() * 600, y: Math.random() * 80, speed: 0.2 + Math.random() * 0.3},
                {x: Math.random() * 600 + 300, y: Math.random() * 80, speed: 0.15 + Math.random() * 0.2},
                {x: Math.random() * 600 + 600, y: Math.random() * 80, speed: 0.1 + Math.random() * 0.25}
            ],
            isRunning: true,
            isPractice: title !== null,
            startTime: Date.now()  // 记录开始时间，防误触进入时的点击
        };

        this.renderContainer(title);
        this.initCanvas();
        this.startAnimation();
        this.bindEvents();
    },

    /**
     * 渲染HTML容器
     */
    renderContainer(title) {
        const game = this.game;
        let headerTitle;

        if (title) {
            headerTitle = title;
        } else if (game.gameState.currentTask && game.gameState.currentTask.name) {
            headerTitle = game.gameState.currentTask.name;
        } else {
            headerTitle = '赛马争先';
        }

        const html = `
            <div style="max-height: 70vh; overflow-y: auto; padding: 0 5px;">
                <div class="cavalry-header">
                    <h2>${headerTitle}</h2>
                    <p>🏇 横版赛马跑酷，<strong>点击任意位置/按空格</strong>跳跃躲避障碍物</p>
                    <p>等级Lv${game.skillLevel}: 速度 <strong>${game.baseSpeed.toFixed(1)}x</strong> | 时间 <strong>15秒</strong> | 碰撞: <strong id="collision-count">0</strong> 次</p>
                    <div style="padding: 8px 0;">
                        <div style="background: #eee; border-radius: 10px; height: 20px; overflow: hidden; border: 1px solid #ddd;">
                            <div id="time-bar" style="background: linear-gradient(90deg, #e74c3c 0%, #f39c12 100%); height: 100%; width: 100%; transition: width 0.1s;"></div>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 4px; color: #666;">
                            <span>剩余时间: <strong id="time-text">15.0</strong> 秒</span>
                            <span>规则: 0次碰撞 = 满分</span>
                        </div>
                    </div>
                </div>
                <canvas id="cavalry-canvas" width="600" height="200" style="border: 2px solid #8b4513; border-radius: 8px; background: linear-gradient(to bottom, #b3e5fc 0%, #e1f5fe 100%); display: block; margin: 10px auto; cursor: pointer;"></canvas>
                <p style="text-align: center; color: #666; font-size: 12px; margin: 0;">💡 点击任意位置 / 按空格键跳跃</p>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
    },

    /**
     * 初始化canvas
     */
    initCanvas() {
        // 确保DOM已经渲染完成后再获取canvas
        const canvas = document.getElementById('cavalry-canvas');
        this.ctx = canvas.getContext('2d');

        const canvasHeight = canvas.height;
        this.game.groundY = canvasHeight - 30; // 地面Y坐标

        // 玩家初始位置就在地面 - 强制设置，确保一定在地面
        this.game.playerY = this.game.groundY;

        // 最后一次确认，确保playerY正确（防御性编程）
        if (this.game.playerY !== this.game.groundY) {
            this.game.playerY = this.game.groundY;
        }

        // 额外：canvas本身也绑定点击，确保任何情况下点击都能跳
        const self = this;
        canvas.addEventListener('click', function(e) {
            e.stopPropagation();
            self.tryJump();
        });

        // 生成初始障碍物
        this.generateObstacle();
    },

    /**
     * 生成新障碍物
     * 多种障碍物类型，保证永远不会出现必死局面
     */
    generateObstacle() {
        const game = this.game;
        const last = game.obstacles.length > 0 ? game.obstacles[game.obstacles.length - 1] : null;

        // 最小间距 - 等级越高间距越大（越容易）
        // 保证最小间距一定大于跳跃距离，玩家绝对能跳过去
        // 速度加快后，间距也需要相应加大
        const minGap = game.minGapBase + game.skillLevel * 12;
        const maxGap = game.maxGapBase + game.skillLevel * 20;
        let gap = last ? (minGap + Math.random() * (maxGap - minGap)) : 180;

        // 第一个障碍物一定要更远，给玩家足够反应时间
        // 开局绝对不会必死，速度加快后需要更远
        const firstStartX = 320;

        // 障碍物X位置 = 上个障碍物结束 + 最小保证间距
        let startX = last ? (last.x + last.width + Math.max(minGap, gap)) : firstStartX;

        // 多种障碍物类型随机
        const typeRoll = Math.random();
        let height, width;
        if (typeRoll < 0.3) {
            // 1. 小矮桩 - 矮，窄
            height = 10 + Math.floor(Math.random() * 8);
            width = 8 + Math.floor(Math.random() * 10);
        } else if (typeRoll < 0.6) {
            // 2. 中等障碍 - 中等大小
            height = 18 + Math.floor(Math.random() * 10);
            width = 12 + Math.floor(Math.random() * 15);
        } else if (typeRoll < 0.85) {
            // 3. 高障碍 - 高，需要提前跳
            height = 28 + Math.floor(Math.random() * 10);
            width = 15 + Math.floor(Math.random() * 12);
        } else {
            // 4. 宽障碍 - 宽，需要跳更远
            height = 16 + Math.floor(Math.random() * 10);
            width = 28 + Math.floor(Math.random() * 15);
        }

        // 添加障碍物
        game.obstacles.push({
            x: startX,
            y: this.game.groundY - height,
            width: width,
            height: height,
            type: typeRoll < 0.85 ? 'normal' : 'wide'
        });

        // 12%概率生成双连障碍物（两个小障碍挨在一起）
        // 保证双连障碍物整体和下一个障碍物仍有足够间距
        if (Math.random() < 0.12 && game.obstacles.length < 20) {
            // 双连之间间距保证能落地
            const gap2 = 30 + Math.floor(Math.random() * 25);
            const height2 = 10 + Math.floor(Math.random() * 8);
            const width2 = 8 + Math.floor(Math.random() * 8);
            game.obstacles.push({
                x: startX + width + gap2,
                y: this.game.groundY - height2,
                width: width2,
                height: height2,
                type: 'double'
            });
        }
    },

    /**
     * 绑定事件 - 任何点击空格都能跳，方便玩家
     */
    bindEvents: function() {
        const self = this;

        // 先移除可能存在的旧事件监听器，避免重复绑定
        if (this._clickHandler) {
            document.removeEventListener('click', this._clickHandler);
        }
        if (this._keydownHandler) {
            document.removeEventListener('keydown', this._keydownHandler);
        }

        // 保存处理器引用以便移除
        this._clickHandler = function() {
            self.tryJump();
        };
        this._keydownHandler = function(e) {
            if (e.code === 'Space') {
                e.preventDefault();
                self.tryJump();
            }
        };

        // 1. document级别的点击 - 任何位置都能跳
        document.addEventListener('click', this._clickHandler);
        // 2. 空格也能跳
        document.addEventListener('keydown', this._keydownHandler);
        // 3. 直接给canvas绑定点击，保险
        const canvas = document.getElementById('cavalry-canvas');
        if (canvas) {
            canvas.addEventListener('click', function() {
                self.tryJump();
            });
        }
        // 4. 直接给外层容器绑定点击，保险
        const container = document.getElementById('farming-game-view');
        if (container) {
            container.addEventListener('click', function() {
                self.tryJump();
            });
        }
    },

    /**
     * 移除事件监听器（游戏结束时调用）
     */
    unbindEvents: function() {
        if (this._clickHandler) {
            document.removeEventListener('click', this._clickHandler);
        }
        if (this._keydownHandler) {
            document.removeEventListener('keydown', this._keydownHandler);
        }
    },

    /**
     * 尝试跳跃 - 公共方法，任何点击都会调用
     */
    tryJump() {
        const game = this.game;
        if (!game || !game.isRunning) {
            return;
        }

        const now = Date.now();
        // 修复：刚进入游戏100ms内不接受点击，防止误触发进入点击
        if (now - game.startTime < 100) {
            return;
        }
        if (now - game.lastJumpTime < game.jumpCooldown) {
            return; // 冷却中
        }

        // 非常宽松的条件：只要在地面下方15像素内都能跳，保证一定能跳
        if (game.playerY >= game.groundY - 15) {
            game.playerVY = -10; // 适中跳跃高度，不会跳出画布，不鬼畜
            game.lastJumpTime = now;
            // 强制校正位置，确保起跳点正确
            if (game.playerY > game.groundY) {
                game.playerY = game.groundY;
            }
            return;
        }

        // 如果玩家实在想跳，即使在空中也给你一次机会（防止卡住
        if (game.playerVY >= 0) { // 正在下落
            game.playerVY = -7;
            game.lastJumpTime = now;
        }
    },

    /**
     * 动画帧更新
     */
    update() {
        const game = this.game;
        if (!game || !game.isRunning) return;

        // 更新剩余时间
        const elapsed = (Date.now() - game.startTime) / 1000;
        game.remainingTime = Math.max(0, 15 - elapsed);

        // 更新剩余时间显示
        const timeBar = document.getElementById('time-bar');
        const timeText = document.getElementById('time-text');
        const collisionCount = document.getElementById('collision-count');
        if (timeBar) {
            timeBar.style.width = (game.remainingTime / 15 * 100) + '%';
        }
        if (timeText) {
            timeText.textContent = game.remainingTime.toFixed(1);
        }
        if (collisionCount) {
            collisionCount.textContent = game.collisionCount;
        }

        // 玩家前进 - 等级越高速度越快
        game.playerDistance += game.baseSpeed * 1.5;
        // 玩家X固定在左侧，保持人物在视野内，只有障碍物相对左移
        game.playerX = 80;

        // 处理碰撞抖动反馈 - 如果刚碰撞，屏幕抖动
        let shakeX = 0;
        if (game.shakeTime > 0) {
            shakeX = (Math.random() - 0.5) * 4;
            game.shakeTime--;
        }

        // 重力 - 速度变化，位置变化
        if (game.playerY <= game.groundY) {
            game.playerVY += game.gravity;
            game.playerY += game.playerVY;
            // 落地
            if (game.playerY >= game.groundY) {
                game.playerY = game.groundY;
                game.playerVY = 0;
            }
        }

        // 更新云彩滚动动画 - 增加背景动感
        game.clouds.forEach(cloud => {
            cloud.x -= cloud.speed * game.baseSpeed;
            if (cloud.x < -100) {
                cloud.x = 600 + Math.random() * 200;
                cloud.y = Math.random() * 80;
            }
        });

        // 更新障碍物位置 - 向左移动（相对玩家左移），速度随等级
        game.obstacles.forEach(obs => {
            obs.x -= game.baseSpeed * 1.5;
        });

        // 移除移出屏幕的障碍物
        game.obstacles = game.obstacles.filter(obs => obs.x + obs.width > 0);

        // 生成新障碍物
        const last = game.obstacles[game.obstacles.length - 1];
        if (last.x < 600 - 100) {
            this.generateObstacle();
        }

        // 碰撞检测 - 碰到障碍物减速，增加碰撞计数，触发抖动反馈
        let collided = false;
        const self = this;
        game.obstacles.forEach(obs => {
            if (self.checkCollision(game.playerX, game.playerY, 15, obs)) {
                // 避免同一障碍物连续碰撞多次
                if (!obs.hit) {
                    collided = true;
                    obs.hit = true;
                    game.collisionCount++;
                    game.shakeTime = 8; // 8帧抖动
                }
            }
        });
        if (collided) {
            game.playerDistance -= 10 * game.baseSpeed; // 碰撞减速，惩罚
            // 障碍物变红色表示被撞坏
        }

        // 绘制，带抖动
        this.draw(shakeX);

        // 检查时间到
        if (game.remainingTime <= 0) {
            this.gameOver();
            return;
        }

        this.animationId = requestAnimationFrame(() => this.update());
    },

    /**
     * 碰撞检测 - AABB
     * playerX 是屏幕坐标，需要把障碍物世界坐标转屏幕坐标
     * 和绘制使用相同偏移，保证完全一致
     */
    checkCollision(playerX, playerY, playerSize, obs) {
        // 玩家包围盒（屏幕坐标）
        const px1 = playerX - playerSize/2;
        const px2 = playerX + playerSize/2;
        const py1 = playerY - playerSize;
        const py2 = playerY;

        // 障碍物世界坐标 → 屏幕坐标，和绘制使用完全相同的偏移
        const screenObsX = obs.x - (playerX - 30);
        const ox1 = screenObsX;
        const ox2 = screenObsX + obs.width;
        const oy1 = obs.y;
        const oy2 = obs.y + obs.height;

        // AABB 碰撞检测
        return !(px2 < ox1 || px1 > ox2 || py2 < oy1 || py1 > oy2);
    },

    /**
     * 开始动画
     */
    startAnimation() {
        this.animationId = requestAnimationFrame(() => this.update());
    },

    /**
     * 绘制游戏
     * shakeX: 碰撞抖动偏移
     */
    draw(shakeX = 0) {
        const ctx = this.ctx;
        const game = this.game;
        const canvas = ctx.canvas;

        // 清空画布（背景已经是css渐变，不用再画
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 画布整体偏移，实现碰撞抖动效果
        ctx.save();
        ctx.translate(shakeX, 0);

        // 画飘动的云彩（背景动画
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        game.clouds.forEach(cloud => {
            ctx.beginPath();
            ctx.arc(cloud.x, cloud.y, 15 + Math.random() * 15, 0, Math.PI * 2);
            ctx.fill();
        });

        // 画地面线
        ctx.beginPath();
        ctx.moveTo(0, game.groundY + 5);
        ctx.lineTo(canvas.width, game.groundY + 5);
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 4;
        ctx.stroke();

        // 画障碍物 - 不同类型不同深浅颜色，撞到变红
        game.obstacles.forEach(obs => {
            const screenX = obs.x - (game.playerX - 30);
            if (obs.hit) {
                // 撞到了变红，表示损坏
                ctx.fillStyle = '#c0392b';
            } else {
                // 障碍物越深颜色越大
                const gray = Math.floor(80 - obs.height * 0.8);
                ctx.fillStyle = `rgb(${gray}, ${gray - 10}, ${gray - 20})`;
            }
            ctx.fillRect(screenX, obs.y, obs.width, obs.height);
            // 加边框更清晰
            ctx.strokeStyle = obs.hit ? '#e74c3c' : '#3e2723';
            ctx.lineWidth = obs.hit ? 2 : 1;
            ctx.strokeRect(screenX, obs.y, obs.width, obs.height);
        });

        // 画玩家马（深棕色）
        ctx.fillStyle = '#5d4037';
        this.drawHorse(ctx, game.playerX, game.playerY, 16);

        ctx.restore();
    },

    /**
     * 画马简化为方块加圆形头
     */
    drawHorse(ctx, x, y, size) {
        // 身体
        ctx.fillRect(x - size/2, y - size, size, size);
        // 头
        ctx.beginPath();
        ctx.arc(x + size/2, y - size - size/2, size/2, 0, Math.PI * 2);
        ctx.fill();
    },

    /**
     * 游戏结束
     */
    gameOver() {
        const game = this.game;
        cancelAnimationFrame(this.animationId);
        this.unbindEvents();
        game.isRunning = false;

        // 新规则：固定15秒，按碰撞次数算分，0碰撞满分
        // 0次碰撞 = 100%，每次碰撞减20%，最低20%
        let ratio = Math.max(0.2, 1.0 - game.collisionCount * 0.2);

        let resultText;
        if (game.collisionCount === 0) {
            resultText = `🎉 完美！15秒内${game.collisionCount}次碰撞，零碰撞完美通关，骑术高超！`;
        } else if (game.collisionCount <= 2) {
            resultText = `✅ 出色！15秒内${game.collisionCount}次碰撞，完成出色！`;
        } else if (game.collisionCount <= 4) {
            resultText = `➖ 完成！15秒内${game.collisionCount}次碰撞，勉强完成。`;
        } else {
            resultText = `❌ 失败！15秒内${game.collisionCount}次碰撞，碰撞太多，成绩不佳。`;
        }

        if (game.isPractice) {
            // 校场练习 - 非任务，固定奖励骑战经验，消耗5天
            const expGained = Math.round(15 * ratio);
            game.gameState.addSkillExp('cavalry', expGained);
            game.gameState.addLog(`赛马练习完成：${resultText} 获得 ${expGained} 骑战经验，消耗5天时间。`);
            game.gameState.advanceDays(5);
            game.gameState.cavalryGame = null;
            // 返回设施场景
            game.gameState.currentScene = window.GameScene.FACILITY;
            game.gameView.renderAll();
        } else {
            // 正常任务结算 - 使用新主命系统
            const template = getMissionTemplateById(game.gameState.currentTask.templateId) || game.gameState.currentTask;
            // 实际进度 = 目标值 * 完成率
            const actualProgress = Math.round(game.gameState.currentTask.targetValue * ratio);
            const success = actualProgress > 0;

            // 使用新的主命系统结算
            const result = game.gameState.completeMission(success, actualProgress);

            game.gameState.addLog(`【${template.name}】${resultText}`);

            // 时间推进：按任务限时推进
            window.TimeSystem.advanceDays(game.gameState, template.timeLimitDays);

            game.gameState.cavalryGame = null;
            game.gameState.currentScene = window.GameScene.CITY_VIEW;
            game.gameView.renderAll();
        }

        this.game = null;
    }
};