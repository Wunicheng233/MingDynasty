/**
 * 本草配方小游戏（医术）
 * 记住药材顺序，然后按顺序点击抓取
 */

window.MedicineGame = {
    /**
     * 启动游戏
     */
    start(gameView, gameState, title = null) {
        const task = gameState.currentTask;
        const allHerbs = ['人参', '麻黄', '甘草', '芍药', '茯苓', '当归', '川芎', '大黄'];

        // 根据技能等级决定药材数量
        let skillLevel = 1;
        if (task && task.requiredSkill) {
            skillLevel = SkillSystem.getSkillLevel(gameState, task.requiredSkill);
        }
        // Lv1: 4味, Lv2: 5味, Lv3: 6味 (符合策划难度曲线)
        const herbCount = 3 + skillLevel;

        // 随机选N种药材并打乱顺序
        const selectedHerbs = allHerbs.sort(() => Math.random() - 0.5).slice(0, herbCount);

        // 初始化游戏状态
        gameState.medicineGame = {
            sequence: selectedHerbs,
            playerSequence: [],
            totalCount: herbCount,
            shown: false,
            isPractice: title !== null
        };
        const game = gameState.medicineGame;

        const headerTitle = title || (task ? task.name : '学习医术');
        let html = `
            <div class="medicine-header">
                <h2>${headerTitle}</h2>
                <p>神医需要你按配方顺序抓药，请仔细记住药材顺序</p>
                <div style="background: #f5f0e1; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p><strong>药方顺序（5秒后消失）：</strong></p>
                    <div class="medicine-sequence" id="medicine-sequence" style="margin-top: 10px;">
                        ${game.sequence.map(h => `<span style="display: inline-block; background: #e8dcc8; padding: 8px 12px; margin: 5px; border-radius: 4px; font-weight: bold;">${h}</span>`).join('')}
                    </div>
                </div>
                <p style="color: #8b4513;">药方即将消失，记住顺序！</p>
            </div>
            <div class="medicine-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 15px 0;">
                ${allHerbs.map(h => `<button class="btn primary-btn medicine-btn" data-herb="${h}" disabled>${h}</button>`).join('')}
            </div>
            <div class="medicine-player-sequence" id="medicine-player-sequence" style="margin-top: 15px;">
                <p><strong>你抓药的顺序：</strong></p>
                <div id="picked-sequence"></div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;

        // 5秒后消失并启用按钮
        setTimeout(() => {
            document.getElementById('medicine-sequence').style.opacity = '0';
            document.querySelectorAll('.medicine-btn').forEach(btn => {
                btn.disabled = false;
            });
            game.shown = true;
        }, 5000);

        this.bindEvents(gameState, gameView);
    },

    /**
     * 绑定事件
     */
    bindEvents(gameState, gameView) {
        document.querySelectorAll('.medicine-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.onClick(btn.dataset.herb, gameState, gameView);
            });
        });
    },

    /**
     * 点击药材
     */
    onClick(herb, gameState, gameView) {
        const game = gameState.medicineGame;
        if (!game.shown) return;

        game.playerSequence.push(herb);

        const container = document.getElementById('picked-sequence');
        container.innerHTML += `<span style="display: inline-block; background: #e8dcc8; padding: 6px 10px; margin: 3px; border-radius: 3px;">${herb}</span>`;

        if (game.playerSequence.length === game.sequence.length) {
            this.finish(gameState, gameView);
        }
    },

    /**
     * 结算游戏
     */
    finish(gameState, gameView) {
        const game = gameState.medicineGame;
        const task = gameState.currentTask;

        let correct = 0;
        for (let i = 0; i < game.sequence.length; i++) {
            if (game.sequence[i] === game.playerSequence[i]) {
                correct++;
            }
        }

        const ratio = correct / game.sequence.length;

        if (game.isPractice) {
            // 寺庙/医馆练习 - 非任务，固定奖励医术经验，消耗5天
            const expGained = Math.round(10 * ratio);
            gameState.addSkillExp('medicine', expGained);
            gameState.addLog(`学习医术完成！猜对 ${correct}/${game.sequence.length} 味药顺序，获得 ${expGained} 医术经验，消耗5天时间。`);
            gameState.advanceDays(5);
            gameState.medicineGame = null;
            // 返回设施场景
            gameState.currentScene = GameScene.FACILITY;
            gameView.renderAll();
        } else {
            // 正常任务结算
            const finalMerit = Math.round(task.rewardMerit * ratio);
            const finalMoney = Math.round(task.rewardMoney * ratio);
            const expGained = Math.round(10 * ratio);

            gameState.merit += finalMerit;
            gameState.money += finalMoney;
            if (task.requiredSkill) {
                gameState.addSkillExp(task.requiredSkill, expGained);
            }

            const skillName = getSkillById(task.requiredSkill)?.name || '';
            gameState.checkRolePromotion();
            gameState.addLog(`任务【${task.name}】完成！猜对 ${correct}/${game.sequence.length} 味药顺序，获得 ${finalMerit} 功勋，${finalMoney} 金钱，${expGained} ${skillName}经验。`);

            gameView.advanceTwoMonths();
            gameState.currentTask = null;
            gameState.medicineGame = null;
            gameState.currentScene = GameScene.CITY_VIEW;
            gameView.renderAll();
        }
    }
};
