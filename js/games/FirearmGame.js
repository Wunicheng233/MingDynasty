/**
 * 火器射击小游戏（火器）
 * 准星自动移动，看准时机点击射击，越靠近红心得分越高
 * 改进：6发子弹连续射击，记录所有弹着点，最后总分结算
 * 典故：明朝火器已广泛使用，有神机营建制，鸟铳火炮技术成熟
 */

window.FirearmGame = {
    /**
     * 动画ID
     */
    animationId: null,

    /**
     * 启动游戏
     */
    start(gameView, gameState, title = null) {
        const task = gameState.currentTask;

        // 根据技能等级调整速度 (符合策划难度曲线)
        // Lv1: 速度较慢, Lv2: 中等速度, Lv3: 速度较快
        let skillLevel = 1;
        if (task && task.requiredSkill) {
            skillLevel = SkillSystem.getSkillLevel(gameState, task.requiredSkill);
        }
        // 速度随等级增加，更高等级意味着更难，但玩家也更熟练了
        // Lv1: 0.5, Lv2: 0.8, Lv3: 1.1 → 提升幅度更大，更有挑战性
        const speed = 0.5 + skillLevel * 0.3;

        // 初始化游戏状态：子弹十字准星在xy方向移动
        Object.assign(gameState.firearmGame, {
            x: 50,
            y: 50,
            directionX: Math.random() > 0.5 ? 1 : -1,
            directionY: Math.random() > 0.5 ? 1 : -1,
            speed: speed,
            skillLevel: skillLevel,
            totalShots: 6,
            remainingShots: 6,
            shots: [], // 记录所有射击落点 {x, y, distance, score}
            isPractice: title !== null
        });

        const headerTitle = title || (task ? task.name : '火器射击练习');
        let html = `
            <div style="max-height: 70vh; overflow-y: auto; padding: 0 5px;">
                <div class="firearm-header">
                    <h2>${headerTitle}</h2>
                    <p>🔫 准星会自动移动，在对准红心时<strong>点击射击</strong></p>
                    <p>等级Lv${skillLevel}: 准星速度 <strong>${speed.toFixed(1)}x</strong> | 剩余子弹: <strong id="remaining-shots">6</strong> 发</p>
                </div>
                <div class="firearm-target" style="position: relative; width: 400px; height: 400px; border: 2px solid #8b4513; border-radius: 50%; margin: 20px auto; background: linear-gradient(45deg, #eee 0%, #fff 100%);">
                    <div style="position: absolute; top: 10%; left: 10%; right: 10%; bottom: 10%; border: 3px solid #e74c3c; border-radius: 50%;"></div>
                    <div style="position: absolute; top: 25%; left: 25%; right: 25%; bottom: 25%; border: 3px solid #f39c12; border-radius: 50%;"></div>
                    <div style="position: absolute; top: 40%; left: 40%; right: 40%; bottom: 40%; border: 3px solid #f1c40f; border-radius: 50%;"></div>
                    <div style="position: absolute; top: 40%; left: 40%; right: 40%; bottom: 40%; border: 3px solid #f1c40f; border-radius: 50%;"></div>
                    <div style="position: absolute; top: 45%; left: 45%; right: 45%; bottom: 45%; background: #e74c3c; border-radius: 50%;"></div>
                    <!-- 已射击弹着点将在这里动态添加 -->
                    <div id="bullet-marker" style="position: absolute; width: 10px; height: 10px; background: #2c3e50; border-radius: 50%; transform: translate(-50%, -50%);"></div>
                </div>
                <div class="firearm-actions" style="text-align: center; margin: 10px 0 20px 0;">
                    <button class="btn primary-btn" id="fire-btn" style="padding: 12px 30px; font-size: 18px;">射击!</button>
                </div>
                <div class="firearm-log" style="max-height: 120px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; margin-top: 10px;">
                    <h4 style="margin-top: 0;">射击记录</h4>
                    <div id="firearm-log-content">
                    </div>
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        this.startAnimation(gameState);
        this.bindEvents(gameState, gameView);
    },

    /**
     * 开始动画
     */
    startAnimation(gameState) {
        const game = gameState.firearmGame;

        const animate = () => {
            if (!game || game.remainingShots <= 0) return;

            game.x += game.directionX * game.speed;
            game.y += game.directionY * game.speed;

            // 碰到边缘反弹
            if (game.x >= 90) { game.x = 90; game.directionX = -1; }
            else if (game.x <= 10) { game.x = 10; game.directionX = 1; }
            if (game.y >= 90) { game.y = 90; game.directionY = -1; }
            else if (game.y <= 10) { game.y = 10; game.directionY = 1; }

            // 更新准星位置
            const marker = document.getElementById('bullet-marker');
            if (marker) {
                marker.style.left = `${game.x}%`;
                marker.style.top = `${game.y}%`;
            }
            this.animationId = requestAnimationFrame(animate);
        };

        this.animationId = requestAnimationFrame(animate);
    },

    /**
     * 绑定事件
     */
    bindEvents(gameState, gameView) {
        document.getElementById('fire-btn').addEventListener('click', () => {
            this.shoot(gameState, gameView);
        });
        // 也允许点击靶子直接射击，更方便
        const target = document.querySelector('.firearm-target');
        if (target) {
            target.addEventListener('click', () => {
                this.shoot(gameState, gameView);
            });
        }
    },

    /**
     * 绘制所有已射击的弹着点
     */
    renderBulletHoles(game) {
        // 先清除旧的弹着点
        const oldHoles = document.querySelectorAll('.bullet-hole');
        oldHoles.forEach(hole => hole.remove());

        const target = document.querySelector('.firearm-target');
        if (!target) return;

        // 重新添加所有弹着点
        game.shots.forEach(shot => {
            const hole = document.createElement('div');
            hole.className = 'bullet-hole';
            hole.style.position = 'absolute';
            hole.style.width = '8px';
            hole.style.height = '8px';
            // 根据得分不同颜色，高分红色弹孔，低分黑色
            const color = shot.score >= 80 ? '#c0392b' : shot.score >= 50 ? '#2c3e50' : '#7f8c8d';
            hole.style.background = color;
            hole.style.border = '1px solid #fff';
            hole.style.borderRadius = '50%';
            hole.style.left = `${shot.x}%`;
            hole.style.top = `${shot.y}%`;
            hole.style.transform = 'translate(-50%, -50%)';
            hole.title = `得分: ${Math.round(shot.score)}`;
            target.appendChild(hole);
        });
    },

    /**
     * 添加日志记录
     */
    addLogEntry(shot, shotNumber) {
        const logEl = document.getElementById('firearm-log-content');
        const hitClass = shot.score >= 80 ? '🎉' : shot.score >= 50 ? '✅' : shot.score >= 25 ? '➖' : '❌';
        logEl.innerHTML += `<div>${hitClass} 第${shotNumber}发 - 离靶心${shot.distance.toFixed(1)} 得分${Math.round(shot.score)}</div>`;
        logEl.scrollTop = logEl.scrollHeight;
    },

    /**
     * 射击
     */
    shoot(gameState, gameView) {
        const game = gameState.firearmGame;
        const dx = game.x - 50;
        const dy = game.y - 50;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 距离中心越近分数越高，满分100
        // 0距离 = 100分，距离50+ = 0分
        const score = Math.max(0, 100 - distance * 2);

        // 记录这一发
        game.shots.push({
            x: game.x,
            y: game.y,
            distance: distance,
            score: score
        });

        // 更新剩余子弹
        game.remainingShots--;
        document.getElementById('remaining-shots').textContent = game.remainingShots;

        // 重绘弹着点
        this.renderBulletHoles(game);

        // 添加日志
        this.addLogEntry(game.shots[game.shots.length - 1], game.shots.length);

        // 检查是否全部射完
        if (game.remainingShots <= 0) {
            // 全部打完，结算
            cancelAnimationFrame(this.animationId);
            this.finish(gameState, gameView);
        }
    },

    /**
     * 游戏结算
     */
    finish(gameState, gameView) {
        const game = gameState.firearmGame;
        const task = gameState.currentTask;

        // 计算总分
        const totalScore = game.shots.reduce((sum, s) => sum + s.score, 0);
        const maxScore = game.totalShots * 100;
        const ratio = Math.min(1, totalScore / maxScore);

        let resultText;
        if (ratio >= 0.8) {
            resultText = `🎉 枪神！${game.totalShots}发得分${Math.round(totalScore)}/${maxScore}，弹无虚发，百发百中！`;
        } else if (ratio >= 0.6) {
            resultText = `✅ 优秀！${game.totalShots}发得分${Math.round(totalScore)}/${maxScore}，枪法精湛，命中良好。`;
        } else if (ratio >= 0.4) {
            resultText = `➖ 合格！${game.totalShots}发得分${Math.round(totalScore)}/${maxScore}，基本命中，尚可使用。`;
        } else if (ratio >= 0.2) {
            resultText = `❌ 不合格！${game.totalShots}发得分${Math.round(totalScore)}/${maxScore}，命中偏低，仍需练习。`;
        } else {
            resultText = `❌ 脱靶！${game.totalShots}发得分${Math.round(totalScore)}/${maxScore}，准星乱飞，不中红心。`;
        }

        if (game.isPractice) {
            // 演武场练习 - 非任务，固定奖励火器经验，消耗5天
            const expGained = Math.round(10 * ratio);
            gameState.addSkillExp('firearm', expGained);
            gameState.addLog(`火器射击练习完成：${resultText} 获得 ${expGained} 火器经验，消耗5天时间。`);
            gameState.advanceDays(5);
            gameState.firearmGame = null;
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
            TimeSystem.advanceDays(gameState, template.timeLimitDays);

            gameState.firearmGame = null;
            gameState.currentScene = GameScene.CITY_VIEW;
            gameView.renderAll();
        }
    }
};
