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
                items: ['玉玺', '玉圭', '玉璧', '铜爵'],
                count: 4
            },
            {
                title: '将下列官阶从高到低排列',
                items: ['尚书', '侍郎', '郎中', '主事'],
                count: 4
            },
            {
                title: '将以下册封大典按先后步骤排列',
                items: ['斋戒', '祭天', '宣诏', '受玺'],
                count: 4
            },
            {
                title: '将下列爵位从高到低排列',
                items: ['国公', '郡公', '县侯', '亭侯'],
                count: 4
            },
            {
                title: '将下列祭祀天地环节按先后排列',
                items: ['迎神', '奠玉帛', '进俎', '初献', '亚献'],
                count: 5
            },
            {
                title: '将下列科举考试层级从低到高排列',
                items: ['童生', '秀才', '举人', '进士', '状元'],
                count: 5
            },
            {
                title: '将下列九卿官职从高到低排列',
                items: ['太常卿', '光禄卿', '卫尉卿', '太仆卿', '大理卿'],
                count: 5
            },
            {
                title: '将下列五服亲疏关系从近到远排列',
                items: ['斩衰', '齐衰', '大功', '小功', '缌麻'],
                count: 5
            },
            {
                title: '将下列明朝省份按布政使司建立顺序排列',
                items: ['北平', '山东', '河南', '陕西', '浙江', '福建'],
                count: 6
            }
        ];

        // 根据技能等级选择题目长度 (符合策划难度曲线: Lv1=4步, Lv2=5步, Lv3=6步)
        let skillLevel = 1;
        if (task && task.requiredSkill) {
            skillLevel = SkillSystem.getSkillLevel(gameState, task.requiredSkill);
        }
        const targetCount = 3 + skillLevel;

        // 随机选一题，长度匹配当前等级难度
        let filteredQuestions = questionPool.filter(q => q.items.length === targetCount);
        if (filteredQuestions.length === 0) {
            filteredQuestions = questionPool;
        }
        const question = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
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
            // 正常任务结算 - 使用新主命系统
            const template = getMissionTemplateById(gameState.currentTask.templateId);
            // 实际进度 = 目标值 * 完成率
            const actualProgress = Math.round(gameState.currentTask.targetValue * ratio);
            const success = actualProgress > 0;

            // 使用新的主命系统结算
            const result = gameState.completeMission(success, actualProgress);

            gameState.addLog(`【${template.name}】正确排序 ${correct}/${total} 项`);

            // 时间推进：按任务限时推进
            TimeSystem.advanceDays(gameState, template.timeLimitDays);

            gameState.ritualGame = null;
            gameState.currentScene = GameScene.CITY_VIEW;
            gameView.renderAll();
        }
    }
};
