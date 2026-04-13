/**
 * 火器射击小游戏（火器）
 * 准星自动移动，看准时机点击射击，越靠近红心得分越高
 */

window.FirearmGame = {
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
        const speed = 0.4 + skillLevel * 0.15;

        // 初始化游戏状态：子弹十字准星在xy方向移动
        gameState.firearmGame = {
            x: 50,
            y: 50,
            directionX: Math.random() > 0.5 ? 1 : -1,
            directionY: Math.random() > 0.5 ? 1 : -1,
            speed: speed,
            animationId: null,
            isPractice: title !== null
        };

        const headerTitle = title || (task ? task.name : '火器射击练习');
        let html = `
            <div class="firearm-header">
                <h2>${headerTitle}</h2>
                <p>准星会自动移动，在对准红心时点击射击</p>
                <p>越靠近红心，得分越高</p>
            </div>
            <div class="firearm-target" style="position: relative; width: 400px; height: 400px; border: 2px solid #8b4513; border-radius: 50%; margin: 20px auto; background: linear-gradient(45deg, #eee 0%, #fff 100%);">
                <div style="position: absolute; top: 10%; left: 10%; right: 10%; bottom: 10%; border: 3px solid #e74c3c; border-radius: 50%;"></div>
                <div style="position: absolute; top: 25%; left: 25%; right: 25%; bottom: 25%; border: 3px solid #f39c12; border-radius: 50%;"></div>
                <div style="position: absolute; top: 40%; left: 40%; right: 40%; bottom: 40%; border: 3px solid #f1c40f; border-radius: 50%;"></div>
                <div style="position: absolute; top: 45%; left: 45%; right: 45%; bottom: 45%; background: #e74c3c; border-radius: 50%;"></div>
                <div id="bullet-marker" style="position: absolute; width: 10px; height: 10px; background: #2c3e50; border-radius: 50%; transform: translate(-50%, -50%);"></div>
            </div>
            <div class="firearm-actions" style="text-align: center; margin: 20px 0;">
                <button class="btn primary-btn" id="fire-btn" style="padding: 12px 30px; font-size: 18px;">射击!</button>
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
            game.x += game.directionX * game.speed;
            game.y += game.directionY * game.speed;

            if (game.x >= 90) { game.x = 90; game.directionX = -1; }
            else if (game.x <= 10) { game.x = 10; game.directionX = 1; }
            if (game.y >= 90) { game.y = 90; game.directionY = -1; }
            else if (game.y <= 10) { game.y = 10; game.directionY = 1; }

            const marker = document.getElementById('bullet-marker');
            if (marker) {
                marker.style.left = `${game.x}%`;
                marker.style.top = `${game.y}%`;
            }
            game.animationId = requestAnimationFrame(animate);
        };

        game.animationId = requestAnimationFrame(animate);
    },

    /**
     * 绑定事件
     */
    bindEvents(gameState, gameView) {
        document.getElementById('fire-btn').addEventListener('click', () => {
            this.shoot(gameState, gameView);
        });
    },

    /**
     * 射击结算
     */
    shoot(gameState, gameView) {
        const game = gameState.firearmGame;
        const dx = game.x - 50;
        const dy = game.y - 50;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 距离中心越近分数越高
        const score = Math.max(0, 100 - distance * 2);
        const ratio = score / 100;

        cancelAnimationFrame(game.animationId);

        if (game.isPractice) {
            // 火器练习 - 非任务，固定奖励火器经验，消耗5天
            const expGained = Math.round(10 * ratio);
            gameState.addSkillExp('firearm', expGained);
            gameState.addLog(`火器射击练习完成！距离靶心${Math.round(distance)}单位，得分${Math.round(score)}，获得 ${expGained} 火器经验，消耗5天时间。`);
            gameState.advanceDays(5);
            gameState.firearmGame = null;
            // 返回设施场景
            gameState.currentScene = GameScene.FACILITY;
            gameView.renderAll();
        } else {
            // 正常任务结算 - 使用新主命系统
            const template = getMissionTemplateById(gameState.currentTask.templateId);
            // 实际进度 = 目标值 * 完成率
            const actualProgress = Math.round(gameState.currentTask.targetValue * ratio);
            const success = actualProgress > 0;

            // 使用新的主命系统结算
            const result = gameState.completeMission(success, actualProgress);

            gameState.addLog(`【${template.name}】距离靶心${Math.round(distance)}单位，得分${Math.round(score)}`);

            // 时间推进：按任务限时推进
            TimeSystem.advanceDays(gameState, template.timeLimitDays);

            gameState.firearmGame = null;
            gameState.currentScene = GameScene.CITY_VIEW;
            gameView.renderAll();
        }
    }
};
