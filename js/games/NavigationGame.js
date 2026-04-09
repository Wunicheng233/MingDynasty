/**
 * 司南导航小游戏（航海）
 * 猜测方位，根据提示调整指针，找到正确度数
 */

window.NavigationGame = {
    /**
     * 启动游戏
     */
    start(gameView, gameState) {
        const task = gameState.currentTask;
        // 初始化游戏状态
        gameState.navigationGame = {
            targetDegree: Math.floor(Math.random() * 360),
            attempts: 0
        };

        let html = `
            <div class="navigation-header">
                <h2>${task.name}</h2>
                <p>目标方位：未知，请猜测方向，点击指针对齐</p>
                <p>提示会告诉你偏左还是偏右</p>
            </div>
            <div class="compass" id="compass" style="padding: 20px; text-align: center;">
                <div class="compass-circle" style="width: 200px; height: 200px; border: 3px solid #8b4513; border-radius: 50%; margin: 0 auto; position: relative;">
                    <div class="compass-needle" id="compass-needle" style="position: absolute; top: 50%; left: 50%; width: 90px; height: 3px; background: #c0392b; transform-origin: left center; transform: rotate(0deg);"></div>
                    <div style="position: absolute; top: 5px; left: 50%; transform: translateX(-50%); font-weight: bold;">北</div>
                    <div style="position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%); font-weight: bold;">南</div>
                    <div style="position: absolute; left: 5px; top: 50%; transform: translateY(-50%); font-weight: bold;">西</div>
                    <div style="position: absolute; right: 5px; top: 50%; transform: translateY(-50%); font-weight: bold;">东</div>
                </div>
            </div>
            <div class="navigation-guess" style="text-align: center; margin: 20px 0;">
                <input type="range" id="degree-slider" min="0" max="359" value="0" style="width: 300px;">
                <p>当前度数: <span id="degree-value">0</span>° (0°=北，顺时针增加)</p>
                <button class="btn primary-btn" id="check-degree-btn" style="margin-top: 10px;">确认方位</button>
                <div id="navigation-hint" style="margin-top: 15px; font-weight: bold; font-size: 16px;"></div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        this.bindEvents(gameState, gameView);
    },

    /**
     * 绑定事件
     */
    bindEvents(gameState, gameView) {
        document.getElementById('degree-slider').addEventListener('input', (e) => {
            const deg = e.target.value;
            document.getElementById('degree-value').textContent = deg;
            document.getElementById('compass-needle').style.transform = `rotate(${deg}deg)`;
        });

        document.getElementById('check-degree-btn').addEventListener('click', () => {
            this.checkDegree(gameState, gameView);
        });
    },

    /**
     * 检查方位
     */
    checkDegree(gameState, gameView) {
        const game = gameState.navigationGame;
        const currentDeg = parseInt(document.getElementById('degree-slider').value);
        game.attempts++;

        const diff = Math.abs(currentDeg - game.targetDegree);
        const diffMin = Math.min(diff, 360 - diff);

        if (diffMin <= 2) {
            // 猜对了
            this.finish(true, game.attempts, gameState, gameView);
        } else {
            let hint;
            const normalizedTarget = game.targetDegree;
            const normalizedCurrent = currentDeg;

            if ((normalizedCurrent < normalizedTarget && normalizedTarget - normalizedCurrent < 180) ||
                (normalizedCurrent > normalizedTarget && normalizedCurrent - normalizedTarget > 180)) {
                hint = '偏西（左）了，往東（右）调整';
            } else {
                hint = '偏东（右）了，往西（左）调整';
            }
            document.getElementById('navigation-hint').textContent = hint;
        }
    },

    /**
     * 结算游戏
     */
    finish(success, attempts, gameState, gameView) {
        const task = gameState.currentTask;

        let ratio;
        if (attempts <= 3) {
            ratio = 1.0;
        } else if (attempts <= 6) {
            ratio = 0.9 - (attempts - 3) * 0.1;
        } else {
            ratio = 0.5;
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
        gameState.addLog(`任务【${task.name}】完成！尝试 ${attempts} 次找到正确方位，获得 ${finalMerit} 功勋，${finalMoney} 金钱，${expGained} ${skillName}经验。`);

        gameView.advanceTwoMonths();
        gameState.currentTask = null;
        gameState.navigationGame = null;
        gameState.currentScene = GameScene.CITY_VIEW;
        gameView.renderAll();
    }
};
