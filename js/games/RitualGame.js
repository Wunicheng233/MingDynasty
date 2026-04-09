/**
 * 礼制排序小游戏（礼仪）
 * 将礼器/官爵按尊卑顺序排列
 */

window.RitualGame = {
    /**
     * 启动游戏
     */
    start(gameView, gameState, title = null) {
        const task = gameState.currentTask;

        // 题目题库
        const questionPool = [
            {
                title: '将下列礼器按尊卑从高到低排列',
                items: ['玉玺', '玉圭', '玉璧', '铜爵']
            },
            {
                title: '将下列官阶从高到低排列',
                items: ['尚书', '侍郎', '郎中', '主事']
            },
            {
                title: '将以下册封大典按先后步骤排列',
                items: ['斋戒', '祭天', '宣诏', '受玺']
            },
            {
                title: '将下列爵位从高到低排列',
                items: ['国公', '郡公', '县侯', '亭侯']
            }
        ];

        // 随机选一题
        const question = questionPool[Math.floor(Math.random() * questionPool.length)];
        const shuffled = [...question.items].sort(() => Math.random() - 0.5);

        // 初始化游戏状态
        gameState.ritualGame = {
            question: question,
            correctOrder: question.items,
            shuffled: shuffled,
            selected: [],
            isPractice: title !== null
        };
        const game = gameState.ritualGame;

        const headerTitle = title || (task ? task.name : '演习礼乐');
        let html = `
            <div class="ritual-header">
                <h2>${headerTitle}</h2>
                <p><strong>${question.title}</strong></p>
                <p>点击下方选项，按顺序填入上方，从左到右排序</p>
            </div>
            <div class="ritual-target" style="margin: 20px 0;">
                <h4>排序结果：</h4>
                <div class="ritual-slots" id="ritual-slots" style="display: flex; gap: 10px; margin-top: 10px;">
                    ${game.correctOrder.map((_, i) => `<div class="ritual-slot" style="border: 2px solid #8b4513; border-radius: 5px; width: 100px; height: 50px; display: flex; align-items: center; justify-content: center; font-weight: bold;"></div>`).join('')}
                </div>
            </div>
            <div class="ritual-options" style="margin: 20px 0;">
                <h4>可选项目：</h4>
                <div class="ritual-items" style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px;">
                    ${game.shuffled.map(item => `<button class="btn primary-btn ritual-item" style="padding: 10px 15px;">${item}</button>`).join('')}
                </div>
            </div>
            <div class="ritual-actions" style="margin: 20px 0; display: flex; gap: 10px;">
                <button class="btn secondary-btn" id="ritual-clear-btn">清空重排</button>
                <button class="btn primary-btn" id="ritual-check-btn" disabled>检查顺序</button>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        this.bindEvents(gameState, gameView);
    },

    /**
     * 绑定事件
     */
    bindEvents(gameState, gameView) {
        document.querySelectorAll('.ritual-item').forEach(item => {
            item.addEventListener('click', () => {
                const name = item.textContent;
                const emptySlot = document.querySelector('.ritual-slot:empty');
                if (emptySlot) {
                    emptySlot.textContent = name;
                    item.style.display = 'none';
                    this.updateCheckButtonState();
                }
            });
        });

        document.getElementById('ritual-clear-btn').addEventListener('click', () => {
            document.querySelectorAll('.ritual-slot').forEach(slot => {
                slot.textContent = '';
            });
            document.querySelectorAll('.ritual-item').forEach(item => {
                item.style.display = 'inline-block';
            });
            this.updateCheckButtonState();
        });

        document.getElementById('ritual-check-btn').addEventListener('click', () => {
            this.checkOrder(gameState, gameView);
        });
    },

    /**
     * 更新检查按钮状态
     */
    updateCheckButtonState() {
        const filled = document.querySelectorAll('.ritual-slot:not(:empty)').length;
        const total = document.querySelectorAll('.ritual-slot').length;
        document.getElementById('ritual-check-btn').disabled = filled < total;
    },

    /**
     * 检查顺序
     */
    checkOrder(gameState, gameView) {
        const game = gameState.ritualGame;
        const slots = document.querySelectorAll('.ritual-slot');
        let correct = 0;

        slots.forEach((slot, i) => {
            if (slot.textContent === game.correctOrder[i]) {
                correct++;
            }
        });

        this.finish(correct, game.correctOrder.length, gameState, gameView);
    },

    /**
     * 结算游戏
     */
    finish(correct, total, gameState, gameView) {
        const game = gameState.ritualGame;
        const task = gameState.currentTask;
        const ratio = correct / total;

        if (game.isPractice) {
            // 国子监礼制练习 - 非任务，固定奖励礼制经验，消耗5天
            const expGained = Math.round(10 * ratio);
            gameState.addSkillExp('ritual', expGained);
            gameState.addLog(`演习礼乐完成！正确排序 ${correct}/${total} 项，获得 ${expGained} 礼制经验，消耗5天时间。`);
            gameState.advanceDays(5);
            gameState.ritualGame = null;
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
            gameState.addLog(`任务【${task.name}】完成！正确排序 ${correct}/${total} 项，获得 ${finalMerit} 功勋，${finalMoney} 金钱，${expGained} ${skillName}经验。`);

            gameView.advanceTwoMonths();
            gameState.currentTask = null;
            gameState.ritualGame = null;
            gameState.currentScene = GameScene.CITY_VIEW;
            gameView.renderAll();
        }
    }
};
