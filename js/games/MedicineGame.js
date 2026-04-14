/**
 * 本草配方小游戏（医术）
 * 记住药材顺序，然后按顺序点击抓取
 * 改进：
 * - 药香委婉反馈，不直接说对错
 * - 限制错误次数，最多错1次
 * - 三关累计挑战，更有成就感
 * - 药柜顺序固定，药方随机选择
 * 典故：明代李时珍著《本草纲目》，集古代医药之大成
 */

window.MedicineGame = {
    /**
     * 所有药材库 - 药柜顺序固定不变
     * 增加到24味，多样性更丰富
     */
    allHerbs: [
        '人参', '麻黄', '甘草', '芍药', '茯苓', '当归', '川芎', '大黄',
        '黄芪', '黄连', '白术', '地黄', '阿胶', '枸杞', '肉桂', '附子',
        '半夏', '柴胡', '防风', '知母', '百合', '连翘', '丹参', '山楂'
    ],

    /**
     * 启动游戏
     */
    start(gameView, gameState, title = null) {
        const task = gameState.currentTask;

        // 根据技能等级决定药材数量和记忆时间
        let skillLevel = 1;
        if (task && task.requiredSkill) {
            skillLevel = SkillSystem.getSkillLevel(gameState, task.requiredSkill);
        }
        // 难度递增：每级+2味药，记忆时间减少
        // Lv1: 4味 / 3000ms
        // Lv2: 6味 / 2500ms
        // Lv3: 8味 / 2000ms
        const herbCount = 2 + skillLevel * 2;
        const memoryTime = 3000 - (skillLevel - 1) * 500;

        // 抓药时间限制：Lv1=8秒，每升一级+2秒
        const timeLimit = 6 + 2 * skillLevel; // Lv1=8, Lv2=10, Lv3=12

        // 初始化游戏状态 - 三关
        Object.assign(gameState.medicineGame, {
            skillLevel: skillLevel,
            herbCount: herbCount,
            memoryTime: memoryTime,
            timeLimit: timeLimit,
            currentRound: 1,
            totalRounds: 3,
            correctRounds: 0,
            timeRemaining: timeLimit,
            timerId: null,
            currentSequence: [],
            playerSequence: [],
            retriesLeft: 1, // 最多1次抓错重抓机会
            shown: false,
            isPractice: title !== null,
            currentStep: 0
        });

        this.renderTutorial(gameView, gameState, title);
    },

    /**
     * 渲染游戏说明（单独一页，像围棋死活一样）
     */
    renderTutorial(gameView, gameState, title = null) {
        const headerTitle = gameState.medicineGame.isPractice ? (title || '本草配方') : (gameState.currentTask ? gameState.currentTask.name : '本草配方');

        let html = `
            <div style="max-width: 800px; margin: 0 auto; padding: 10px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #8b4513; font-size: 28px; margin-bottom: 8px;">📖 本草配方</h2>
                    <p style="color: #6b5b45; font-size: 16px;">古代中医抓药，按方抓药全靠记忆！</p>
                </div>

                <div style="background: #f5f0e1; padding: 18px; border-radius: 8px; margin-bottom: 16px;">
                    <h3 style="color: #8b4513; margin-top: 0; font-size: 22px; margin-bottom: 10px;">游戏规则</h3>
                    <ul style="line-height: 1.7; color: #333; font-size: 18px; padding-left: 20px; margin: 0;">
                        <li>神医开好药方，<strong>${gameState.medicineGame.memoryTime/1000}秒展示</strong>药材顺序，然后消失</li>
                        <li>你需要<strong>按顺序从药柜抓药</strong>，顺序错了药效就错了</li>
                        <li>允许<strong>1次抓错重抓</strong>，超时或两次错误则本关失败</li>
                        <li>一共<strong>三关</strong>，按通关数计算成绩</li>
                    </ul>
                </div>

                <div style="background: #f5f0e1; padding: 18px; border-radius: 8px; margin-bottom: 16px;">
                    <h3 style="color: #8b4513; margin-top: 0; font-size: 22px; margin-bottom: 10px;">中医小知识</h3>
                    <div style="line-height: 1.7; color: #333; font-size: 18px;">
                        <p><strong>君臣佐使</strong> 是中医开方的基本原则：</p>
                        <ul style="padding-left: 20px; margin: 8px 0;">
                            <li><strong>君</strong>：主药，治疗主要病症</li>
                            <li><strong>臣</strong>：辅助君药加强疗效</li>
                            <li><strong>佐</strong>：佐制药，减少君药毒性</li>
                            <li><strong>使</strong>：引药，引药力直达病灶</li>
                        </ul>
                        <p style="margin: 8px 0 0 0;">顺序错了，药性就错了，所以抓药顺序至关重要！</p>
                    </div>
                </div>

                <div style="text-align: center; margin-top: 20px;">
                    <button class="btn primary-btn" id="start-game-btn" style="padding: 12px 40px; font-size: 18px;">开始第一关</button>
                </div>
            </div>
        `;

        html = `<div style="max-height: 70vh; overflow-y: auto; padding: 0 5px;">${html}</div>`;
        document.getElementById('farming-game-view').innerHTML = html;

        document.getElementById('start-game-btn').addEventListener('click', () => {
            this.startRound(gameView, gameState);
        });
    },

    /**
     * 开始当前关
     */
    startRound(gameView, gameState) {
        const game = gameState.medicineGame;

        // 随机选N种不重复的药材作为本关药方（顺序随机）
        // 从固定allHerbs中随机选，药柜始终显示全部固定顺序
        const shuffled = [...this.allHerbs].sort(() => Math.random() - 0.5);
        game.currentSequence = shuffled.slice(0, game.herbCount);

        const headerTitle = game.isPractice ? (title || '本草配方') : (gameState.currentTask ? gameState.currentTask.name : '本草配方');
        const skillLevel = SkillSystem.getSkillLevel(gameState, gameState.currentTask.requiredSkill);
        let html = `
            <div class="medicine-header">
                <h2>${headerTitle}</h2>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 15px; font-size: 14px;">
                    <p style="margin: 0 0 8px 0;"><strong>游戏规则：</strong></p>
                    <ul style="margin: 0; padding-left: 20px;">
                        <li>记住药方顺序，然后按顺序从药柜抓药</li>
                        <li><strong>君臣佐使：</strong>君为主药，臣辅助，佐制药，使引药 → 顺序错了药效就错了</li>
                        <li>允许<strong>1次抓错重抓</strong>，超时或两次错误则本关失败</li>
                        <li>共三关，按通关数计分</li>
                    </ul>
                </div>
                <p>
                    第 ${game.currentRound} / ${game.totalRounds} 关
                    &nbsp;|&nbsp; 剩余重抓机会: <strong>${game.retriesLeft}</strong> 次
                </p>
                <div style="margin: 10px 0;">
                    <p style="margin-bottom: 5px;">剩余抓药时间: <strong id="time-remaining">${game.timeRemaining}</strong> 秒</p>
                    <div style="width: 100%; height: 20px; background: #eee; border-radius: 10px; overflow: hidden;">
                        <div id="time-bar" style="height: 100%; width: ${(game.timeRemaining / game.timeLimit) * 100}%; background: ${game.timeRemaining > 3 ? '#27ae60' : '#e74c3c'}; transition: width 0.3s;"></div>
                    </div>
                </div>
                <div style="background: #f5f0e1; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p><strong>药方顺序（${game.memoryTime/1000}秒后消失）：</strong></p>
                    <div class="medicine-sequence" id="medicine-sequence" style="margin-top: 10px;">
                        ${game.currentSequence.map(h => `<span style="display: inline-block; background: #d4a76a; padding: 8px 12px; margin: 5px; border-radius: 4px; font-weight: bold; color: #fff;">${h}</span>`).join('')}
                    </div>
                </div>
                <div id="feedback-area" style="min-height: 50px; margin: 10px 0;"></div>
            </div>
            <div class="medicine-cabinet" style="background: #8b4513; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p style="color: #fff; margin-top: 0;"><strong>药柜（顺序固定）</strong> 点击抓药</p>
                <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px;">
                    ${this.allHerbs.map(h => `
                        <button class="btn medicine-drawer" data-herb="${h}" disabled
                            style="background: #f5deb3; color: #8b4513; border: 2px solid #d2b48c; padding: 8px; font-weight: bold; font-size: 14px;">${h}</button>
                    `).join('')}
                </div>
            </div>
            <div class="medicine-player-sequence" style="margin-top: 15px;">
                <p><strong>你抓药的顺序：</strong></p>
                <div id="picked-sequence" style="min-height: 40px;"></div>
            </div>
            <div id="action-area" style="margin-top: 15px;"></div>
        `;

        // 外层包可滚动容器
        html = `<div style="max-height: 70vh; overflow-y: auto; padding: 0 5px;">${html}</div>`;
        document.getElementById('farming-game-view').innerHTML = html;

        // N秒后消失并启用按钮
        setTimeout(() => {
            document.getElementById('medicine-sequence').style.opacity = '0';
            document.querySelectorAll('.medicine-drawer').forEach(btn => {
                btn.disabled = false;
            });
            game.shown = true;
            // 开始抓药倒计时
            this.startTimer(gameState, gameView);
        }, game.memoryTime);

        this.bindEvents(gameState, gameView);
    },

    /**
     * 绑定事件
     */
    bindEvents(gameState, gameView) {
        document.querySelectorAll('.medicine-drawer').forEach(btn => {
            btn.addEventListener('click', () => {
                this.onPick(btn.dataset.herb, gameState, gameView);
            });
        });
    },

    /**
     * 点击抓药
     */
    onPick(herb, gameState, gameView) {
        const game = gameState.medicineGame;
        if (!game.shown) return;

        const expected = game.currentSequence[game.currentStep];
        game.playerSequence.push(herb);

        // 添加到显示 - 现在不标颜色，只显示
        const container = document.getElementById('picked-sequence');
        container.innerHTML += `<span style="display: inline-block; background: #e8dcc8; padding: 6px 10px; margin: 3px; border-radius: 3px; font-weight: bold;">${herb}</span>`;

        // 委婉反馈 - 用药香描述，不直接说对错
        if (herb === expected) {
            // 正确 - 药香浓郁
            this.showFeedback(`你抓了<strong>${herb}</strong>，药香浓郁沁鼻，看来这味对了...`, 'success');
            game.currentStep++;
        } else {
            // 错误 - 药香寡淡
            this.showFeedback(`你抓了<strong>${herb}</strong>，药香清淡寡味，似乎不是这味...`, 'error');

            if (game.retriesLeft <= 0) {
                // 重抓机会用完，本关失败，直接结束
                this.failRound(gameState, gameView);
            } else {
                // 还有重抓机会，消耗一次机会，添加撤回让玩家重抓
                game.retriesLeft--;
                this.addUndoButton(gameState, gameView);
            }
        }

        // 灰掉已经抓过的药，防止重复抓
        document.querySelector(`[data-herb="${herb}"]`).disabled = true;

        // 检查本关是否完成
        if (game.playerSequence.length === game.currentSequence.length) {
            this.finishRound(gameState, gameView);
        }
    },

    /**
     * 显示反馈信息
     */
    showFeedback(text, type) {
        const fb = document.getElementById('feedback-area');
        const color = type === 'success' ? '#27ae60' : '#e67e22'; // 错误用橙色，因为不直接说错
        fb.innerHTML = `<p style="color: ${color}; margin: 5px 0;">${text}</p>`;
    },

    /**
     * 添加撤回按钮
     */
    addUndoButton(gameState, gameView) {
        const area = document.getElementById('action-area');
        area.innerHTML = `<button class="btn secondary-btn" id="undo-btn" style="margin-top: 10px;">撤回上一步</button>`;
        document.getElementById('undo-btn').addEventListener('click', () => {
            this.undo(gameState, gameView);
        });
    },

    /**
     * 撤回上一步
     */
    undo(gameState, gameView) {
        const game = gameState.medicineGame;
        if (game.playerSequence.length === 0) return;

        const lastHerb = game.playerSequence.pop();
        game.currentStep = game.playerSequence.length;

        // 重新启用这个药材按钮
        const btn = document.querySelector(`[data-herb="${lastHerb}"]`);
        if (btn) btn.disabled = false;

        // 更新显示
        this.refreshPickedSequence(gameState);
        // 清空反馈
        this.showFeedback('', 'success');
        // 移除撤回按钮
        document.getElementById('action-area').innerHTML = '';
    },

    /**
     * 刷新已抓序列显示
     */
    refreshPickedSequence(gameState) {
        const game = gameState.medicineGame;
        const container = document.getElementById('picked-sequence');
        container.innerHTML = game.playerSequence.map(h => {
            return `<span style="display: inline-block; background: #e8dcc8; padding: 6px 10px; margin: 3px; border-radius: 3px; font-weight: bold;">${h}</span>`;
        }).join('');
    },

    /**
     * 启动抓药倒计时
     */
    startTimer(gameState, gameView) {
        const game = gameState.medicineGame;
        game.timerId = setInterval(() => {
            game.timeRemaining--;
            const textEl = document.getElementById('time-remaining');
            const barEl = document.getElementById('time-bar');
            if (textEl) {
                textEl.textContent = game.timeRemaining;
            }
            if (barEl) {
                const percent = (game.timeRemaining / game.timeLimit) * 100;
                barEl.style.width = `${percent}%`;
                // 时间少于3秒变红提醒
                if (game.timeRemaining <= 3) {
                    barEl.style.background = '#e74c3c';
                }
            }
            if (game.timeRemaining <= 0) {
                clearInterval(game.timerId);
                this.timeoutFail(gameState, gameView);
            }
        }, 1000);
    },

    /**
     * 超时失败
     */
    timeoutFail(gameState, gameView) {
        const game = gameState.medicineGame;
        this.showFeedback('⏰ 时间到！未能在限时内抓完药，本关失败', 'error');
        this.failRound(gameState, gameView);
    },

    /**
     * 本关失败（错误次数用完）
     */
    failRound(gameState, gameView) {
        const game = gameState.medicineGame;
        clearInterval(game.timerId);
        this.finishAll(gameState, gameView);
    },

    /**
     * 完成本关
     */
    finishRound(gameState, gameView) {
        const game = gameState.medicineGame;

        // 计算本关对了多少
        let correct = 0;
        for (let i = 0; i < game.currentSequence.length; i++) {
            if (game.currentSequence[i] === game.playerSequence[i]) {
                correct++;
            }
        }

        // 如果全对，计入正确关卡
        if (correct === game.currentSequence.length) {
            game.correctRounds++;
        }

        // 检查是否全部三关完成
        if (game.currentRound >= game.totalRounds) {
            clearInterval(game.timerId);
            this.finishAll(gameState, gameView);
        } else {
            // 清除当前计时器
            clearInterval(game.timerId);
            // 下一关
            game.currentRound++;
            game.playerSequence = [];
            game.currentStep = 0;
            game.shown = false;
            // 每关重新给一次重抓机会
            game.retriesLeft = 1;
            // 重置时间
            game.timeRemaining = game.timeLimit;
            this.startRound(gameView, gameState);
        }
    },

    /**
     * 全部三关完成，最终结算
     */
    finishAll(gameState, gameView) {
        const game = gameState.medicineGame;
        const task = gameState.currentTask;

        const totalCorrect = game.correctRounds;
        const totalRounds = game.totalRounds;
        const ratio = totalCorrect / totalRounds;

        let resultText;
        if (ratio === 1) {
            resultText = `🎉 完美！三关${totalRounds}关全对，三副药方全部正确，药到病除，真神医也！`;
        } else if (ratio >= 0.66) {
            resultText = `✅ 合格！三对${totalCorrect}，大部分药方正确，药效尚可。`;
        } else if (ratio >= 0.33) {
            resultText = `❌ 不合格！仅对${totalCorrect}关，药性偏差，疗效不佳。`;
        } else {
            resultText = `❌ 失败！一关未对，抓错药方，病症难愈。`;
        }

        if (game.isPractice) {
            // 医馆练习 - 非任务，固定奖励医术经验，消耗5天
            const expGained = Math.round(10 * ratio);
            gameState.addSkillExp('medicine', expGained);
            gameState.addLog(`本草配方练习完成：${resultText} 获得 ${expGained} 医术经验，消耗5天时间。`);
            gameState.advanceDays(5);
            gameState.medicineGame = null;
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

            gameState.medicineGame = null;
            gameState.currentScene = GameScene.CITY_VIEW;
            gameView.renderAll();
        }
    }
};
