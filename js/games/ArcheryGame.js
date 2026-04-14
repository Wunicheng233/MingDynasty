/**
 * 百步穿杨小游戏（弓术）
 * 改进版：物理模拟射箭，连续拉力选择，风向重力影响落点
 * 典故：明朝武举射箭必考，名将花云善射
 *
 * 设计改进：
 * - 连续拉力选择（拖拽进度条）而非三选一
 * - 8方向风向 + 3档强度，真实影响落点
 * - 稳定性机制：拉力越大稳定性越差（落点范围大），等级越高稳定性越好（范围小）
 * - 重力影响：拉力越小，箭矢下坠越明显
 */

window.ArcheryGame = {
    /**
     * 游戏状态
     */
    game: null,

    /**
     * 画布上下文
     */
    ctx: null,

    /**
     * 启动游戏
     */
    start(gameView, gameState, title = null) {
        const task = gameState.currentTask;

        // 获取弓术等级
        let skillLevel = 1;
        if (task && task.requiredSkill) {
            skillLevel = window.SkillSystem.getSkillLevel(gameState, task.requiredSkill);
        }

        // 随机生成风向：8个方向，3种强度
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const windDirection = directions[Math.floor(Math.random() * directions.length)];
        const strengthRoll = Math.random();
        let windStrength;
        if (strengthRoll < 0.33) windStrength = 'weak';
        else if (strengthRoll < 0.66) windStrength = 'medium';
        else windStrength = 'strong';

        // 初始化游戏状态
        this.game = {
            gameView: gameView,
            gameState: gameState,
            skillLevel: skillLevel,
            totalArrows: 6,
            remainingArrows: 6,
            hits: 0,
            currentArrow: 0,
            windDirection: windDirection,
            windStrength: windStrength,
            pullPower: 50, // 初始拉力 0-100
            aimX: 50, // 瞄准点 X 百分比
            aimY: 50, // 瞄准点 Y 百分比
            animationId: null, // 抖动预览动画ID
            previewPoints: [], // 预览抖动点
            isDraggingPull: false,
            isAiming: false,
            isPractice: title !== null,
            history: []
        };

        this.render(title);
        this.bindEvents();
        this.drawTarget();
        this.startPreviewAnimation();
    },

    /**
     * 获取风向强度数值
     */
    getWindStrengthValue() {
        const map = { weak: 1, medium: 3, strong: 6 };
        return map[this.game.windStrength] || 0;
    },

    /**
     * 获取风向偏移向量
     */
    getWindOffset() {
        const strength = this.getWindStrengthValue();
        const dir = this.game.windDirection;
        let dx = 0, dy = 0;

        switch (dir) {
            case 'N': dy = -strength; break;
            case 'S': dy = strength; break;
            case 'E': dx = strength; break;
            case 'W': dx = -strength; break;
            case 'NE': dx = strength * 0.707; dy = -strength * 0.707; break;
            case 'NW': dx = -strength * 0.707; dy = -strength * 0.707; break;
            case 'SE': dx = strength * 0.707; dy = strength * 0.707; break;
            case 'SW': dx = -strength * 0.707; dy = strength * 0.707; break;
        }

        return { dx, dy };
    },

    /**
     * 获取风向中文描述
     */
    getWindDescription() {
        const dirMap = {
            'N': '北', 'NE': '东北', 'E': '东', 'SE': '东南',
            'S': '南', 'SW': '西南', 'W': '西', 'NW': '西北'
        };
        const strengthMap = { 'weak': '弱', 'medium': '中', 'strong': '强' };
        return `${dirMap[this.game.windDirection]}风 ${strengthMap[this.game.windStrength]}`;
    },

    /**
     * 生成预览抖动点
     */
    generatePreviewPoints() {
        const game = this.game;
        const { pullPower, aimX, aimY, skillLevel } = game;

        // 计算当前稳定性半径
        const baseRadius = 5 + (pullPower / 100) * 10;
        const radius = baseRadius * (1 - (skillLevel - 1) * 0.2);

        // 生成3个随机预览点
        const points = [];
        for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.sqrt(Math.random()) * radius;
            const x = aimX + r * Math.cos(angle);
            const y = aimY + r * Math.sin(angle);
            points.push({x, y});
        }

        game.previewPoints = points;
    },

    /**
     * 启动预览抖动动画
     */
    startPreviewAnimation() {
        const animate = () => {
            this.generatePreviewPoints();
            this.drawTarget();
            this.game.animationId = requestAnimationFrame(animate);
        };
        this.game.animationId = requestAnimationFrame(animate);
    },

    /**
     * 停止预览抖动动画
     */
    stopPreviewAnimation() {
        if (this.game && this.game.animationId) {
            cancelAnimationFrame(this.game.animationId);
            this.game.animationId = null;
        }
    },

    /**
     * 生成风向箭头HTML
     */
    getWindArrowHTML() {
        const dir = this.game.windDirection;
        const strength = this.game.windStrength;

        // 箭头旋转角度：箭头指向风推动箭矢的方向
        // 默认字符 ▶ 指向右 (0度)，顺时针旋转
        // 西风从西来 → 推向东 → 箭头向右 = 0deg
        const rotationMap = {
            'N': 90,     // 北风 → 推向南 → 箭头向下 ↓ = 90度
            'S': 270,    // 南风 → 推向北 → 箭头向上 ↑ = 270度
            'E': 180,    // 东风 → 推向西 → 箭头向左 ← = 180度
            'W': 0,      // 西风 → 推向东 → 箭头向右 → = 0度
            'NE': 135,   // 东北风 → 推向西南 ↘ = 135度 (右下)
            'NW': 45,    // 西北风 → 推向东南 ↘ = 45度 (右下？不对，西北风从西北来推东南，箭头指向东南就是右下 → 45度 ✓
            'SE': 315,   // 东南风 → 推向西北 ↖ = 315度
            'SW': 225    // 西南风 → 推向东北 ↗ = 225度
        };

        // 颜色和箭头数量
        const configMap = {
            'weak': { count: 1, color: '#3498db' },   // 蓝色单箭头
            'medium': { count: 2, color: '#f39c12' }, // 黄色双箭头
            'strong': { count: 3, color: '#e74c3c' }  // 红色三箭头
        };

        const angle = rotationMap[dir];
        const config = configMap[strength];

        let html = `<div style="display: inline-block; transform: rotate(${angle}deg); transform-origin: center;">`;
        for (let i = 0; i < config.count; i++) {
            html += `<span style="color: ${config.color}; font-size: 16px; font-weight: bold; line-height: 0.8; margin-right: 1px;">▶</span>`;
        }
        html += `</div>`;

        return `
            <div style="text-align: left; padding: 2px 0 8px 28px;">
                ${html}
            </div>
        `;
    },

    /**
     * 计算落点偏差（考虑拉力、重力、风向）
     */
    calculateImpact() {
        const { pullPower, aimX, aimY, skillLevel } = this.game;
        const wind = this.getWindOffset();

        // 1. 重力影响：拉力越小，下坠越明显
        // 拉力100 → 下坠 3 单位，拉力 0 → 下坠 15 单位
        const gravityOffsetY = 3 + (100 - pullPower) * 0.12;

        // 2. 风向影响已经算出
        const windDx = wind.dx;
        const windDy = wind.dy + gravityOffsetY;

        // 3. 稳定性计算：
        // - 拉力越大 → 稳定性越差 → 偏差范围越大
        // - 技能等级越高 → 稳定性越好 → 偏差范围越小
        // 基础半径：拉力越大半径越大 (5 ~ 15)
        const baseRadius = 5 + (pullPower / 100) * 10;
        // 等级修正：每级减 20% 半径
        const radius = baseRadius * (1 - (skillLevel - 1) * 0.2);

        // 4. 随机落点：在半径范围内均匀随机
        // 使用极坐标生成随机点
        const angle = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * radius; // sqrt让分布均匀
        const randomDx = r * Math.cos(angle);
        const randomDy = r * Math.sin(angle);

        // 5. 计算最终落点（相对于靶心50,50）
        const centerX = 50;
        const centerY = 50;
        const impactX = aimX + windDx + randomDx;
        const impactY = aimY + windDy + randomDy;

        return { impactX, impactY, radius };
    },

    /**
     * 计算得分（根据离靶心距离）
     */
    calculateScore(impactX, impactY) {
        // 靶心在(50,50)，整个靶子是0-100范围
        const dx = impactX - 50;
        const dy = impactY - 50;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 距离0 → 10分，距离 > 40 → 0分
        const score = Math.max(0, 10 - distance / 4);
        return { distance, score };
    },

    /**
     * 渲染游戏界面
     */
    render(title = null) {
        const game = this.game;
        let headerTitle;

        if (title) {
            headerTitle = title;
        } else if (game.gameState.currentTask && game.gameState.currentTask.name) {
            headerTitle = game.gameState.currentTask.name;
        } else {
            headerTitle = '百步穿杨';
        }

        let html = `
            <div style="max-height: 70vh; overflow-y: auto; padding: 0 5px;">
                <div class="archery-header">
                    <h2>${headerTitle}</h2>
                    <p>🎯 拖拽滑块选择拉力，点击靶子选择瞄准点，然后射！</p>
                    <p>已命中: <strong>${game.hits}</strong> / ${game.totalArrows} 轮</p>
                    <p>剩余箭矢: <strong>${game.remainingArrows}</strong> 支</p>
                    <p>🌬️ 当前风向: <strong>${this.getWindDescription()}</strong></p>
                    <div style="margin-top: 5px; margin-bottom: 8px;">${this.getWindArrowHTML()}</div>
                </div>

                <div class="archery-target-container" style="text-align: center; margin: 10px auto; max-width: 500px;">
                    <canvas id="archery-canvas" width="400" height="400" style="border: 2px solid #8b4513; border-radius: 50%; cursor: crosshair; background: linear-gradient(45deg, #eee 0%, #fff 100%);"></canvas>
                </div>

                <div class="archery-controls" style="max-width: 500px; margin: 10px auto; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <div class="pull-control">
                        <p><strong>拉力控制:</strong> 当前 <span id="pull-value">${Math.round(game.pullPower)}</span>%</p>
                        <p style="font-size: 12px; color: #666;">💡 拉力越大：受风阻小，下坠小，但稳定性差（落点分散）</p>
                        <p style="font-size: 12px; color: #666;">   拉力越小：稳定性好，但下坠受风影响大</p>
                        <input type="range" id="pull-slider" min="0" max="100" value="${game.pullPower}" style="width: 100%;">
                    </div>

                    <div class="aim-info" style="margin-top: 10px;">
                        <p><strong>瞄准点:</strong> X: <span id="aim-x">${Math.round(game.aimX)}</span>% Y: <span id="aim-y">${Math.round(game.aimY)}</span>%</p>
                        <p style="font-size: 12px; color: #666;">💡 点击靶子任意位置即可设置瞄准点（蓝点）</p>
                    </div>

                    <div style="margin-top: 15px; text-align: center;">
                        <button class="btn primary-btn" id="fire-btn" style="padding: 10px 30px; font-size: 16px;">射箭!</button>
                    </div>
                </div>

                <div class="archery-log" style="max-height: 120px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; margin-top: 10px; margin-bottom: 10px;">
                    <h4 style="margin-top: 0;">射击记录</h4>
                    <div id="archery-log-content">
        `;

        game.history.forEach(entry => {
            const hitClass = entry.score >= 7 ? '✅' : entry.score >= 3 ? '➖' : '❌';
            html += `<div>${hitClass} 第${entry.arrow}箭 - 离靶心${entry.distance.toFixed(1)} 得分${entry.score.toFixed(1)}</div>`;
        });

        html += `
                    </div>
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
    },

    /**
     * 绑定事件
     */
    bindEvents() {
        const canvas = document.getElementById('archery-canvas');
        const pullSlider = document.getElementById('pull-slider');
        const fireBtn = document.getElementById('fire-btn');

        // 拉力滑块
        pullSlider.addEventListener('input', (e) => {
            this.game.pullPower = parseInt(e.target.value);
            document.getElementById('pull-value').textContent = Math.round(this.game.pullPower);
            // 拉力改变，稳定性半径改变，重绘
            this.drawTarget();
        });

        // 画布点击瞄准
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            // 转换为百分比 (0-100)
            this.game.aimX = (x / rect.width) * 100;
            this.game.aimY = (y / rect.height) * 100;
            document.getElementById('aim-x').textContent = this.game.aimX.toFixed(1);
            document.getElementById('aim-y').textContent = this.game.aimY.toFixed(1);
            this.drawTarget();
        });

        // 射箭按钮
        fireBtn.addEventListener('click', () => {
            this.shoot();
        });
    },

    /**
     * 绘制靶子
     */
    drawTarget() {
        const canvas = document.getElementById('archery-canvas');
        if (!canvas) return;

        this.ctx = canvas.getContext('2d');
        const ctx = this.ctx;
        const size = 400;
        const centerX = size / 2;
        const centerY = size / 2;

        // 清空画布
        ctx.clearRect(0, 0, size, size);

        // 绘制靶环
        const rings = [
            { radius: 180, color: '#eee' },
            { radius: 140, color: '#fff' },
            { radius: 100, color: '#e74c3c' },
            { radius: 60, color: '#f39c12' },
            { radius: 30, color: '#f1c40f' },
            { radius: 15, color: '#e74c3c' }
        ];

        rings.forEach(ring => {
            ctx.beginPath();
            ctx.arc(centerX, centerY, ring.radius, 0, Math.PI * 2);
            ctx.fillStyle = ring.color;
            ctx.fill();
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // 计算当前稳定性半径（像素）
        const { pullPower, aimX, aimY, skillLevel, previewPoints } = this.game;
        const baseRadius = 5 + (pullPower / 100) * 10;
        const radiusPercent = baseRadius * (1 - (skillLevel - 1) * 0.2);
        const radiusPx = (radiusPercent / 100) * size;

        // 绘制稳定性范围圆（半透明）
        const aimXPx = (aimX / 100) * size;
        const aimYPx = (aimY / 100) * size;
        ctx.beginPath();
        ctx.arc(aimXPx, aimYPx, radiusPx, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(52, 152, 219, 0.15)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(52, 152, 219, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 绘制瞄准点中心点（蓝点）
        ctx.beginPath();
        ctx.arc(aimXPx, aimYPx, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#3498db';
        ctx.fill();
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 绘制预览抖动点（半透明小灰点）
        if (previewPoints && previewPoints.length > 0) {
            previewPoints.forEach(point => {
                const px = (point.x / 100) * size;
                const py = (point.y / 100) * size;
                ctx.beginPath();
                ctx.arc(px, py, 2, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(44, 62, 80, 0.4)';
                ctx.fill();
            });
        }

        // 绘制所有已射箭支落点
        if (this.game && this.game.history) {
            this.game.history.forEach((entry, index) => {
                const ix = (entry.impactX / 100) * size;
                const iy = (entry.impactY / 100) * size;
                ctx.beginPath();
                ctx.arc(ix, iy, 3, 0, Math.PI * 2);
                ctx.fillStyle = '#2c3e50';
                ctx.fill();
            });
        }
    },

    /**
     * 射箭！
     */
    shoot() {
        const { impactX, impactY, radius } = this.calculateImpact();
        const { distance, score } = this.calculateScore(impactX, impactY);

        // 记录命中
        if (score >= 5) {
            this.game.hits++;
        }

        // 记录历史
        this.game.history.push({
            arrow: this.game.currentArrow + 1,
            impactX, impactY,
            distance, score
        });

        // 更新状态
        this.game.remainingArrows--;
        this.game.currentArrow++;

        // 重绘（包括新落点）
        this.render();
        this.drawTarget();
        this.bindEvents();

        // 滚动日志到底部
        const logEl = document.getElementById('archery-log-content');
        if (logEl) {
            logEl.scrollTop = logEl.scrollHeight;
        }

        // 检查游戏结束
        if (this.game.remainingArrows <= 0) {
            this.stopPreviewAnimation();
            this.finish();
        } else {
            // 继续下一箭，重启预览动画
            this.startPreviewAnimation();
        }
    },

    /**
     * 添加日志
     */
    addLog(entry) {
        const logEl = document.getElementById('archery-log-content');
        const hitClass = entry.score >= 7 ? '✅' : entry.score >= 3 ? '➖' : '❌';
        logEl.innerHTML += `<div>${hitClass} 第${entry.arrow}箭 - 离靶心${entry.distance.toFixed(1)} 得分${entry.score.toFixed(1)}</div>`;
        logEl.scrollTop = logEl.scrollHeight;
    },

    /**
     * 游戏结算
     */
    finish() {
        const game = this.game;
        const gameState = game.gameState;
        const gameView = game.gameView;
        const task = gameState.currentTask;

        const hits = game.hits;
        // 6箭满分60，计算完成率
        const totalScore = game.history.reduce((sum, h) => sum + h.score, 0);
        const ratio = Math.min(1, totalScore / 60);

        let resultText;
        if (ratio >= 0.8) {
            resultText = `🎉 完胜！6箭得分${totalScore.toFixed(1)}/60，弓马娴熟，百步穿杨！`;
        } else if (ratio >= 0.5) {
            resultText = `✅ 合格！6箭得分${totalScore.toFixed(1)}/60，成绩优良，尚可造旨。`;
        } else if (ratio >= 0.25) {
            resultText = `❌ 不合格！6箭得分${totalScore.toFixed(1)}/60，命中偏低，仍需练习。`;
        } else {
            resultText = `❌ 失败！6箭得分${totalScore.toFixed(1)}/60，脱靶严重，下榜。`;
        }

        if (game.isPractice) {
            // 演武场练习 - 非任务，固定奖励弓术经验，消耗5天
            const expGained = Math.round(10 * ratio);
            gameState.addSkillExp('archery', expGained);
            gameState.addLog(`百步穿杨练习完成：${resultText} 获得 ${expGained} 弓术经验，消耗5天时间。`);
            gameState.advanceDays(5);
            gameState.archeryGame = null;
            // 返回设施场景
            gameState.currentScene = GameScene.FACILITY;
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

            gameState.archeryGame = null;
            gameState.currentScene = GameScene.CITY_VIEW;
            gameView.renderAll();
        }

        this.stopPreviewAnimation();
        this.game = null;
    }
};
