/**
 * 司南导航小游戏（航海）
 * 全新玩法：探索找方位 - 目标方位未知，根据提示逐步摸索找到正确角度
 * 典故：明代郑和下西洋，水手靠司南导航定位，需要不断修正航向
 */

window.NavigationGame = {
    /**
     * 基准方位库，按难度分组
     * 生成目标会在基准方位附近随机波动
     */
    baseDegrees: {
        easy: [0, 45, 90, 135, 180, 225, 270, 315],   // 八个基本方位
        medium: [30, 60, 120, 150, 210, 240, 300, 330], // 偏方向
        hard: []  // 完全随机，不需要基准
    },

    /**
     * 启动游戏 - 先显示说明
     */
    start(gameView, gameState, title = null) {
        const headerTitle = title || (gameState.currentTask ? gameState.currentTask.name : '司南导航');

        let html = `
            <div style="max-height: 70vh; overflow-y: auto; padding: 0 5px; padding-bottom: 30px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #8b4513; font-size: 28px; margin-bottom: 8px;">🧭 司南导航</h2>
                    <p style="color: #6b5b45; font-size: 16px;">目标方位未知，摸索着找到它，根据提示一步步修正航向！</p>
                </div>

                <div style="background: #f5f0e1; padding: 18px; border-radius: 8px; margin-bottom: 16px;">
                    <h3 style="color: #8b4513; margin-top: 0; font-size: 22px; margin-bottom: 10px;">游戏规则</h3>
                    <ul style="line-height: 1.7; color: #333; font-size: 18px; padding-left: 20px; margin: 0;">
                        <li>一共 <strong>5轮</strong>，每轮一个随机目标方位</li>
                        <li>拖动滑块<strong>转动罗盘指针</strong>，猜测目标方位</li>
                        <li>点击确认，会提示你<strong>偏顺时针还是偏逆时针</strong></li>
                        <li>根据提示继续调整，直到找到正确方位</li>
                        <li><strong>尝试越少，得分越高</strong>，等级越高中误差要求越严格</li>
                    </ul>
                    <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">💡 度数规则：0° = 正北，顺时针转动 → 90° = 正东，180° = 正南，270° = 正西</p>
                </div>

                <div style="text-align: center; margin-top: 20px;">
                    <button class="btn primary-btn" id="start-navigation-btn" style="padding: 12px 40px; font-size: 18px;">开始探索!</button>
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        document.getElementById('start-navigation-btn').addEventListener('click', () => {
            this.startActualGame(gameView, gameState, title);
        });
    },

    /**
     * 真正开始游戏 - 生成随机目标
     */
    startActualGame(gameView, gameState, title = null) {
        const task = gameState.currentTask;

        // 根据技能等级设置难度
        let skillLevel = 1;
        if (task && task.requiredSkill) {
            skillLevel = window.SkillSystem.getSkillLevel(gameState, task.requiredSkill);
        }
        skillLevel = Math.max(1, Math.min(3, skillLevel));

        // 允许误差：Lv1 ≤8°, Lv2 ≤4°, Lv3 ≤2°
        const tolerance = skillLevel === 1 ? 8 : skillLevel === 2 ? 4 : 2;

        // 按难度生成5个目标
        let targets = [];
        if (skillLevel === 1) {
            // Lv1: 5个简单
            for (let i = 0; i < 5; i++) {
                targets.push(this.generateTarget('easy'));
            }
        } else if (skillLevel === 2) {
            // Lv2: 2简单 + 3中等
            for (let i = 0; i < 2; i++) {
                targets.push(this.generateTarget('easy'));
            }
            for (let i = 0; i < 3; i++) {
                targets.push(this.generateTarget('medium'));
            }
        } else {
            // Lv3: 2中等 + 3困难
            for (let i = 0; i < 2; i++) {
                targets.push(this.generateTarget('medium'));
            }
            for (let i = 0; i < 3; i++) {
                targets.push(this.generateTarget('hard'));
            }
        }

        // 初始化游戏状态
        gameState.navigationGame = {
            skillLevel: skillLevel,
            tolerance: tolerance,
            currentRound: 0,
            totalRounds: 5,
            totalScore: 0,
            targets: targets,
            currentTarget: targets[0],
            guesses: [], // 本次尝试历史
            isPractice: title !== null
        };

        this.renderCurrentRound(gameState, gameView);
    },

    /**
     * 生成一个目标方位
     */
    generateTarget(difficulty) {
        if (difficulty === 'easy') {
            const base = this.baseDegrees.easy[Math.floor(Math.random() * this.baseDegrees.easy.length)];
            // 在基准附近 ±10° 随机
            const offset = Math.floor(Math.random() * 21) - 10;
            return (base + offset + 360) % 360;
        } else if (difficulty === 'medium') {
            const base = this.baseDegrees.medium[Math.floor(Math.random() * this.baseDegrees.medium.length)];
            const offset = Math.floor(Math.random() * 21) - 10;
            return (base + offset + 360) % 360;
        } else {
            // 困难：完全随机
            return Math.floor(Math.random() * 360);
        }
    },

    /**
     * 渲染当前轮
     */
    renderCurrentRound(gameState, gameView) {
        const game = gameState.navigationGame;
        const headerTitle = game.isPractice ? '司南导航练习' : (gameState.currentTask ? gameState.currentTask.name : '司南导航');

        let html = `
            <div style="max-height: 70vh; overflow-y: auto; padding: 0 5px;">
                <div class="navigation-header" style="margin-bottom: 15px;">
                    <h2>${headerTitle}</h2>
                    <p>第 <strong>${game.currentRound + 1}</strong> / ${game.totalRounds} 轮 &nbsp; 累计得分: <strong>${Math.round(game.totalScore)}</strong></p>
                </div>

                <!-- 滑块放在最上方，永远不被遮挡 -->
                <div class="navigation-slider" style="text-align: center; margin: 15px 0;">
                    <input type="range" id="degree-slider" min="0" max="359" value="0" style="width: 320px;">
                    <p style="margin: 8px 0; font-size: 18px;">当前角度: <span id="degree-value">0</span>°</p>
                </div>

                <!-- 罗盘居中 -->
                <div class="compass" id="compass" style="padding: 10px 20px 20px 20px; text-align: center; margin-bottom: 15px;">
                    <div class="compass-circle" style="
                        width: 260px;
                        height: 260px;
                        border: 3px solid #8b4513;
                        background: #f5f0e1;
                        border-radius: 50%;
                        margin: 0 auto;
                        position: relative;
                    ">
                        <!-- 刻度标记 -->
                        <div style="position: absolute; top: 5px; left: 50%; transform: translateX(-50%); font-weight: bold; font-size: 24px; color: #2c3e50;">北</div>
                        <div style="position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%); font-weight: bold; font-size: 24px; color: #2c3e50;">南</div>
                        <div style="position: absolute; left: 5px; top: 50%; transform: translateY(-50%); font-weight: bold; font-size: 24px; color: #2c3e50;">西</div>
                        <div style="position: absolute; right: 5px; top: 50%; transform: translateY(-50%); font-weight: bold; font-size: 24px; color: #2c3e50;">东</div>

                        <!-- 45度刻度 -->
                        <!-- 0°正北 → 顺时针增加 → 45°东北（右上）, 135°东南（右下）, 225°西南（左下）, 315°西北（左上） -->
                        <div style="position: absolute; top: 45px; right: 45px; font-weight: bold; font-size: 20px; color: #8b4513;">45°</div>
                        <div style="position: absolute; bottom: 45px; right: 45px; font-weight: bold; font-size: 20px; color: #8b4513;">135°</div>
                        <div style="position: absolute; top: 45px; left: 45px; font-weight: bold; font-size: 20px; color: #8b4513;">315°</div>
                        <div style="position: absolute; bottom: 45px; left: 45px; font-weight: bold; font-size: 20px; color: #8b4513;">225°</div>

                        <!-- 指针 -->
                        <div id="compass-needle" style="
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            width: 110px;
                            height: 6px;
                            background: #c0392b;
                            border: 1px solid #900;
                            transform-origin: left center;
                            transform: rotate(-90deg); /* CSS 0deg 朝右，需要减90度才朝上 */
                            z-index: 10;
                            border-radius: 3px;
                        "></div>
                        <!-- 圆心 -->
                        <div style="
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            width: 16px;
                            height: 16px;
                            background: #8b4513;
                            border-radius: 50%;
                            z-index: 11;
                        "></div>
                    </div>
                </div>

                <!-- 尝试历史记录 -->
                <div class="navigation-history" style="
                    background: #f5f0e1;
                    padding: 12px 15px;
                    border-radius: 8px;
                    margin: 0 10px 15px 10px;">
                    <h4 style="margin: 0 0 8px 0; font-size: 16px;">尝试记录：</h4>
                    <div id="history-list" style="line-height: 1.6;">
                        ${this.renderHistory(game.guesses)}
                    </div>
                </div>

                <!-- 确认按钮放在最底部 -->
                <div class="navigation-confirm" style="text-align: center; padding-bottom: 30px; margin-top: 5px;">
                    <button class="btn primary-btn" id="confirm-degree-btn" style="padding: 10px 40px; font-size: 18px;">确认方位</button>
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        this.bindEvents(gameState, gameView);
    },

    /**
     * 渲染尝试历史
     */
    renderHistory(guesses) {
        if (guesses.length === 0) {
            return '<em style="color: #666;">尚未尝试</em>';
        }
        return guesses.map((g, i) => {
            const hint = g.result === 'too_small' ? '<strong>度数小了 → 请增大度数</strong>' : '<strong>度数大了 → 请减小度数</strong>';
            return `<div>${i+1}. ${g.deg}° → ${hint}</div>`;
        }).join('');
    },

    /**
     * 绑定事件
     */
    bindEvents(gameState, gameView) {
        // 滑块改变更新指针
        document.getElementById('degree-slider').addEventListener('input', (e) => {
            const deg = e.target.value;
            document.getElementById('degree-value').textContent = deg;
            document.getElementById('compass-needle').style.transform = `rotate(${deg - 90}deg)`; /* CSS 0deg 朝右，减90度让0度朝上 */
        });

        // 确认
        document.getElementById('confirm-degree-btn').addEventListener('click', () => {
            this.confirmDegree(gameState, gameView);
        });
    },

    /**
     * 计算最小误差（考虑360度循环）
     */
    calculateError(currentDeg, targetDeg) {
        const diff = Math.abs(currentDeg - targetDeg);
        return Math.min(diff, 360 - diff);
    },

    /**
     * 确认当前方位，判断
     */
    confirmDegree(gameState, gameView) {
        const game = gameState.navigationGame;
        const currentDeg = parseInt(document.getElementById('degree-slider').value);
        const error = this.calculateError(currentDeg, game.currentTarget);

        if (error < game.tolerance) {
            // 猜对了！计分
            const numGuesses = game.guesses.length + 1;
            const score = Math.max(0, 100 - (numGuesses - 1) * 15);
            game.totalScore += score;

            game.currentRound++;

            if (game.currentRound >= game.totalRounds) {
                // 全部完成，结算
                this.finish(gameState, gameView);
            } else {
                // 下一轮
                game.currentTarget = game.targets[game.currentRound];
                game.guesses = [];
                this.renderCurrentRound(gameState, gameView);
            }
        } else {
            // 猜错了，给提示
            // 判断应该往哪个方向走 - 最短路径方向
            let diff = currentDeg - game.currentTarget;
            let result;
            if (diff < 0) {
                if (diff > -180) {
                    // current < target，需要增大角度
                    result = 'too_small'; // 度数太小了
                } else {
                    // current 比如 350，target 10，diff=-340，最短路径其实是减小
                    result = 'too_small'; // 不对，这种情况 current 350，target 10，diff=-340 → 其实350 > 10，度数太大了
                    result = 'too_big'; // 度数太大了
                }
            } else {
                // diff > 0
                if (diff < 180) {
                    // current > target，需要减小角度
                    result = 'too_big'; // 度数太大了
                } else {
                    // diff > 180，最短路径反向 → 需要增大角度
                    result = 'too_small'; // 度数太小了
                }
            }
            game.guesses.push({deg: currentDeg, result: result});
            // 更新历史记录，不重新渲染整个界面
            document.getElementById('history-list').innerHTML = this.renderHistory(game.guesses);
        }
    },

    /**
     * 结算游戏
     */
    finish(gameState, gameView) {
        const game = gameState.navigationGame;
        const task = gameState.currentTask;

        // 总分满分 5 * 100 = 500，比例 = 总分 / 500
        const totalPossible = game.totalRounds * 100;
        const ratio = Math.min(1, game.totalScore / totalPossible);

        let resultTitle, resultDesc;
        if (ratio >= 0.9) {
            resultTitle = '🎉 定位精准！';
            resultDesc = `总分 ${Math.round(game.totalScore)}/${totalPossible}，你天生就是航海家！`;
        } else if (ratio >= 0.7) {
            resultTitle = '✅ 定位良好';
            resultDesc = `总分 ${Math.round(game.totalScore)}/${totalPossible}，可以顺利启航！`;
        } else if (ratio >= 0.4) {
            resultTitle = '⚠ 定位不准';
            resultDesc = `总分 ${Math.round(game.totalScore)}/${totalPossible}，偏航有点远，小心礁石！`;
        } else {
            resultTitle = '✘ 定位失败';
            resultDesc = `总分 ${Math.round(game.totalScore)}/${totalPossible}，偏航太厉害，找不到目的地！`;
        }

        if (game.isPractice) {
            // 练习模式 - 固定奖励航海经验，消耗5天
            const expGained = Math.round(10 * ratio);
            gameState.addSkillExp('navigation', expGained);
            gameState.addLog(`司南导航练习完成：${resultTitle} 总分 ${Math.round(game.totalScore)}/${totalPossible}，获得 ${expGained} 航海经验，消耗5天时间。`);
            gameState.advanceDays(5);
            gameState.navigationGame = null;

            let html = `
                <div class="navigation-result" style="text-align: center; padding: 30px; max-height: 70vh; overflow-y: auto;">
                    <h2 style="font-size: 28px; margin-bottom: 20px; color: #8b4513;">${resultTitle}</h2>
                    <p style="font-size: 16px; margin-bottom: 30px;">${resultDesc}</p>
                    <div style="background: #f5f0e1; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                        <p>总分: ${Math.round(game.totalScore)} / ${totalPossible}</p>
                    </div>
                    <p>获得：${expGained} 航海经验</p>
                    <div style="margin-top: 30px;">
                        <button class="btn primary-btn" id="navigation-done-btn">返回市舶司</button>
                    </div>
                </div>
            `;

            document.getElementById('farming-game-view').innerHTML = html;
            document.getElementById('navigation-done-btn').addEventListener('click', () => {
                gameState.currentScene = window.GameScene.FACILITY;
                gameView.renderAll();
            });
        } else {
            // 正常任务结算
            const template = getMissionTemplateById(gameState.currentTask.templateId) || gameState.currentTask;
            const actualProgress = Math.round(gameState.currentTask.targetValue * ratio);
            const success = actualProgress > 0;

            const result = gameState.completeMission(success, actualProgress);

            gameState.addLog(`【${template.name}】${resultTitle} 总分 ${Math.round(game.totalScore)}/${totalPossible}`);

            let html = `
                <div class="navigation-result" style="text-align: center; padding: 30px; max-height: 70vh; overflow-y: auto;">
                    <h2 style="font-size: 28px; margin-bottom: 20px; color: #8b4513;">${resultTitle}</h2>
                    <p style="font-size: 16px; margin-bottom: 30px;">${resultDesc}</p>
                    <div style="background: #f5f0e1; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                        <p>总分: ${Math.round(game.totalScore)} / ${totalPossible}</p>
                    </div>
                    <p>功勋奖励：${result.meritGained > 0 ? '+' : ''}${result.meritGained}</p>
                    <div style="margin-top: 30px;">
                        <button class="btn primary-btn" id="navigation-done-btn">完成返回</button>
                    </div>
                </div>
            `;

            document.getElementById('farming-game-view').innerHTML = html;
            document.getElementById('navigation-done-btn').addEventListener('click', () => {
                window.TimeSystem.advanceDays(gameState, template.timeLimitDays);
                gameState.navigationGame = null;
                gameState.currentScene = window.GameScene.CITY_VIEW;
                gameView.renderAll();
            });
        }
    }
};
