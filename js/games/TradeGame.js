/**
 * 商政珠算小游戏
 * 珠算商贾 - 镖车估价：客商运来货物，快速心算选出正确价格
 * 典故：明代晋商徽商纵横天下，长途贩运镖车往来，掌柜需要快速估价算价
 */

window.TradeGame = {
    /**
     * 计时器ID
     */
    timerId: null,

    /**
     * 题库：所有题目
     * 每个题目：
     * - text: 题目描述（明代商贸场景）
     * - answer: 正确答案（单位：贯）
     * - options: [四个选项数字]
     * - difficulty: 1-3 难度等级
     */
    questionPool: [
        // ========== 难度 1 (Lv1 - 简单，整数为主) ==========
        {
            text: "上好丝绸一匹售价3贯，客官买4匹，需付多少钱？",
            answer: 12,
            options: [12, 7, 10, 15],
            difficulty: 1
        },
        {
            text: "徽州茶叶一箱进价15贯，售价22贯，一箱利润多少？",
            answer: 7,
            options: [7, 37, 15, 5],
            difficulty: 1
        },
        {
            text: "棉布三匹一共21贯，一匹棉布价格多少？",
            answer: 7,
            options: [7, 3, 63, 10],
            difficulty: 1
        },
        {
            text: "常州甘蔗三捆一共6贯，一捆甘蔗多少钱？",
            answer: 2,
            options: [2, 3, 9, 18],
            difficulty: 1
        },
        {
            text: "荔枝十斤一共5贯，一斤荔枝多少钱？",
            answer: 0.5,
            options: [0.5, 2, 5, 15],
            difficulty: 1
        },
        {
            text: "总价45贯，三个人平分，每人得多少？",
            answer: 15,
            options: [15, 5, 12, 48],
            difficulty: 1
        },
        {
            text: "商家进货二十匹布，每匹进价3贯，总共进价多少？",
            answer: 60,
            options: [60, 23, 25, 40],
            difficulty: 1
        },
        {
            text: "十两银子，一两折合一贯，总共多少贯？",
            answer: 10,
            options: [10, 1, 100, 0.1],
            difficulty: 1
        },
        {
            text: "一斤铁200文，买25斤铁需要多少贯？(1贯=1000文)",
            answer: 5,
            options: [5, 50, 500, 0.5],
            difficulty: 1
        },
        {
            text: "五斗米一共1贯500文，一斗米多少钱？",
            answer: 0.3,
            options: [0.3, 1.5, 3, 7.5],
            difficulty: 1
        },
        {
            text: "八百文就是多少贯？(1贯=1000文)",
            answer: 0.8,
            options: [0.8, 8, 80, 800],
            difficulty: 1
        },
        {
            text: "五贯五百文就是多少贯？",
            answer: 5.5,
            options: [5.5, 505, 50.5, 0.55],
            difficulty: 1
        },
        {
            text: "三两银子折合成贯，一两等于一贯五百文，三两是多少？",
            answer: 4.5,
            options: [4.5, 3, 1.5, 3.5],
            difficulty: 1
        },
        {
            text: "一斤茶叶售价2贯，买三斤需要多少贯？",
            answer: 6,
            options: [6, 5, 23, 2.3],
            difficulty: 1
        },
        {
            text: "一捆木材售价1贯200文，买五捆需要多少贯？",
            answer: 6,
            options: [6, 1.2, 5, 12],
            difficulty: 1
        },

        // ========== 难度 2 (Lv2 - 中等，含小数，百分比) ==========
        {
            text: "上好丝绸一匹售价3贯200文，客官买4匹，需付多少钱？",
            answer: 12.8,
            options: [12.8, 7.2, 12.2, 32],
            difficulty: 2
        },
        {
            text: "盐引一张可支盐300斤，若每斤盐售价80文，一张盐引值多少钱？",
            answer: 24,
            options: [24, 2.4, 240, 380],
            difficulty: 2
        },
        {
            text: "原本利润45两，因漕运延误被扣三成，还剩多少两？",
            answer: 31.5,
            options: [31.5, 13.5, 42, 48],
            difficulty: 2
        },
        {
            text: "稻米一石售价3贯500文，买两石多少钱？",
            answer: 7,
            options: [7, 3.5, 5, 6.5],
            difficulty: 2
        },
        {
            text: "一匹锦缎售价16贯，打八折出售，实际售价多少？",
            answer: 12.8,
            options: [12.8, 3.2, 8, 16.8],
            difficulty: 2
        },
        {
            text: "进价每匹布8贯，售价12贯，利润率百分之多少？",
            answer: 50,
            options: [50, 33, 40, 150],
            difficulty: 2
        },
        {
            text: "一斤茶叶售价2贯500文，买三斤需要多少贯？",
            answer: 7.5,
            options: [7.5, 2.5, 5, 25],
            difficulty: 2
        },
        {
            text: "售价每件4贯，进价每件2贯500文，卖出一件利润多少？",
            answer: 1.5,
            options: [1.5, 6.5, 4, 2.5],
            difficulty: 2
        },
        {
            text: "原有存粮120石，吃掉三成，还剩多少石？",
            answer: 84,
            options: [84, 36, 117, 123],
            difficulty: 2
        },
        {
            text: "一匹布售价2贯800文，买四匹需要多少钱？",
            answer: 11.2,
            options: [11.2, 6.8, 2.8, 42],
            difficulty: 2
        },
        {
            text: "店主把进价10贯的货物加价两成出售，售价多少？",
            answer: 12,
            options: [12, 10.2, 2, 8],
            difficulty: 2
        },
        {
            text: "一斤盐售价15文，买50斤需要多少贯？",
            answer: 0.75,
            options: [0.75, 7.5, 75, 750],
            difficulty: 2
        },
        {
            text: "一桶油进价3贯，售价4贯500文，利润多少？",
            answer: 1.5,
            options: [1.5, 7.5, 4.5, 3],
            difficulty: 2
        },
        {
            text: "原本房租每月5贯，涨价一成，新房租多少？",
            answer: 5.5,
            options: [5.5, 5.1, 1, 6],
            difficulty: 2
        },
        {
            text: "十斤棉花一共2贯500文，一斤棉花多少钱？",
            answer: 0.25,
            options: [0.25, 2.5, 25, 12.5],
            difficulty: 2
        },

        // ========== 难度 3 (Lv3 - 困难，多步计算) ==========
        {
            text: "一石米售价3贯，打九五折出售，实际售价多少？",
            answer: 2.85,
            options: [2.85, 3.95, 1.5, 0.15],
            difficulty: 3
        },
        {
            text: "进价每匹8贯500文，售价12贯300文，买6匹，总利润多少？",
            answer: 22.8,
            options: [22.8, 3.8, 20.8, 124.8],
            difficulty: 3
        },
        {
            text: "一斤盐15文5分，买48斤，总共需要多少贯？(1贯=1000文)",
            answer: 0.744,
            options: [0.744, 7.44, 74.4, 15.5],
            difficulty: 3
        },
        {
            text: "买四送一，原价每匹5贯，买五匹实际每匹合多少钱？",
            answer: 4,
            options: [4, 5, 20, 1],
            difficulty: 3
        },
        {
            text: "税率三十税一，营业额240贯，需交多少税？",
            answer: 8,
            options: [8, 30, 72, 210],
            difficulty: 3
        },
        {
            text: "一斤铜进价150文，售价210文，卖50斤总利润多少贯？",
            answer: 3,
            options: [3, 30, 105, 10.5],
            difficulty: 3
        },
        {
            text: "五斤茶叶进价一斤1贯800文，售价一斤2贯500文，总利润多少？",
            answer: 3.5,
            options: [3.5, 12.5, 9, 1.8],
            difficulty: 3
        },
        {
            text: "一两银子折1贯500文，八两银子折合多少贯？",
            answer: 12,
            options: [12, 8, 9.5, 15],
            difficulty: 3
        },
        {
            text: "进价每石米2贯400文，加价两成五出售，售价多少？",
            answer: 3,
            options: [3, 2.65, 2.425, 4.9],
            difficulty: 3
        },
        {
            text: "路程120里，每天走30里，走了两天半，还剩多少里？",
            answer: 45,
            options: [45, 75, 90, 87.5],
            difficulty: 3
        },
        {
            text: "100斤米售价3贯500文，买250斤需要多少贯？",
            answer: 8.75,
            options: [8.75, 3.5, 35, 25],
            difficulty: 3
        },
        {
            text: "一匹绸进价6贯800文，售价9贯500文，卖一匹利润多少？",
            answer: 2.7,
            options: [2.7, 16.3, 9.5, 6.8],
            difficulty: 3
        }
    ],

    /**
     * 启动游戏 - 先显示说明
     */
    start(gameView, gameState, title = null) {
        const headerTitle = title || (gameState.currentTask ? gameState.currentTask.name : '珠算商贾');

        let html = `
            <div style="max-height: 70vh; overflow-y: auto; padding: 0 5px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #8b4513; font-size: 28px; margin-bottom: 8px;">💰 珠算商贾</h2>
                    <p style="color: #6b5b45; font-size: 16px;">镖车来了！快速心算选出正确价格，完成估价！</p>
                </div>

                <div style="background: #f5f0e1; padding: 18px; border-radius: 8px; margin-bottom: 16px;">
                    <h3 style="color: #8b4513; margin-top: 0; font-size: 22px; margin-bottom: 10px;">游戏规则</h3>
                    <ul style="line-height: 1.7; color: #333; font-size: 18px; padding-left: 20px; margin: 0;">
                        <li>一共 <strong>5轮</strong>，每轮一道估价题，四个选项选一个</li>
                        <li>每道题有限时，选对得一分，选错/超时不得分</li>
                        <li>单位：题目价格单位为<strong>贯</strong>，1贯 = 1000文</li>
                        <li>等级越高 → 题目越难，时间越紧，挑战性越大</li>
                        <li>最终按答对题数给分，全对获得全额奖励</li>
                    </ul>
                </div>

                <div style="text-align: center; margin-top: 20px;">
                    <button class="btn primary-btn" id="start-trade-btn" style="padding: 12px 40px; font-size: 18px;">开始估价!</button>
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        document.getElementById('start-trade-btn').addEventListener('click', () => {
            this.startActualGame(gameView, gameState, title);
        });
    },

    /**
     * 真正开始游戏
     */
    startActualGame(gameView, gameState, title = null) {
        const task = gameState.currentTask;

        // 根据技能等级调整难度
        // Lv1: 16秒/题，抽难度1题；Lv2: 13秒/题，抽难度2；Lv3: 10秒/题，抽难度3
        let skillLevel = 1;
        if (task && task.requiredSkill) {
            skillLevel = window.SkillSystem.getSkillLevel(gameState, task.requiredSkill);
        }
        // Clamp 到 1-3 范围，防止越界
        skillLevel = Math.max(1, Math.min(3, skillLevel));

        const timeLimitPerQuestion = skillLevel === 1 ? 16 : skillLevel === 2 ? 13 : 10;
        const minDifficulty = skillLevel;
        const maxDifficulty = skillLevel;

        // 筛选符合难度的题目
        let availableQuestions = this.questionPool.filter(q => q.difficulty >= minDifficulty && q.difficulty <= maxDifficulty);
        // 如果筛选出来不够5题，放宽条件
        if (availableQuestions.length < 5) {
            availableQuestions = this.questionPool.filter(q => q.difficulty <= maxDifficulty);
        }

        // 随机抽5题
        const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
        const questions = shuffled.slice(0, 5);

        gameState.tradeGame = {
            skillLevel: skillLevel,
            timeLimitPerQuestion: timeLimitPerQuestion,
            totalQuestions: 5,
            currentQuestion: 0,
            correctCount: 0,
            questions: questions,
            remainingTime: timeLimitPerQuestion,
            isPractice: title !== null,
            currentTimerId: null
        };

        this.renderCurrentQuestion(gameState, gameView);
        this.startTimer(gameState, gameView);
    },

    /**
     * 渲染当前题目
     */
    renderCurrentQuestion(gameState, gameView) {
        const game = gameState.tradeGame;
        const currentQ = game.questions[game.currentQuestion];
        const template = getMissionTemplateById(gameState.currentTask ? gameState.currentTask.templateId : 0) || (gameState.currentTask || {name: '珠算估价'});

        const questionNumber = game.currentQuestion + 1;
        const timeColor = game.remainingTime < 4 ? '#e74c3c' : '#2c3e50';

        // 打乱选项顺序
        const shuffledOptions = [...currentQ.options].sort(() => Math.random() - 0.5);

        let html = `
            <div style="max-height: 70vh; overflow-y: auto; padding: 0 5px;">
                <div class="trade-header" style="margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                        <div>
                            <h3 style="margin: 0;">${template.name}</h3>
                            <p style="margin: 4px 0;">题数: <strong>${questionNumber}/${game.totalQuestions}</strong> &nbsp; 答对: <strong>${game.correctCount}</strong></p>
                        </div>
                        <div style="text-align: right;">
                            <p style="margin: 4px 0;">剩余时间: <strong id="remaining-time" style="color: ${timeColor}">${game.remainingTime}</strong> 秒</p>
                        </div>
                    </div>
                </div>

                <div class="trade-question" style="background: #f5f0e1; padding: 18px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="font-size: 18px; margin: 0;"><strong>${currentQ.text}</strong></p>
                </div>

                <div class="trade-options" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 15px;">
                    ${shuffledOptions.map(opt => `
                        <button class="btn trade-option" data-answer="${opt}" style="
                            padding: 12px;
                            font-size: 18px;
                            background: #d2b48c;
                            border: 2px solid #8b4513;
                            border-radius: 6px;
                            color: #2c3e50;
                            cursor: pointer;
                        ">${opt}</button>
                    `).join('')}
                </div>

                <div class="trade-feedback" id="trade-feedback" style="min-height: 40px; padding: 10px; border-radius: 6px;"></div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        this.bindEvents(gameState, gameView);
    },

    /**
     * 绑定事件
     */
    bindEvents(gameState, gameView) {
        document.querySelectorAll('.trade-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const answer = parseFloat(btn.dataset.answer);
                this.onSelect(answer, gameState, gameView);
            });
        });
    },

    /**
     * 启动计时器
     */
    startTimer(gameState, gameView) {
        if (this.timerId) {
            clearInterval(this.timerId);
        }
        this.timerId = setInterval(() => {
            const game = gameState.tradeGame;
            game.remainingTime--;

            // 更新显示
            const timeEl = document.getElementById('remaining-time');
            if (timeEl) {
                timeEl.textContent = game.remainingTime;
                if (game.remainingTime < 4) {
                    timeEl.style.color = '#e74c3c';
                }
            }

            if (game.remainingTime <= 0) {
                clearInterval(this.timerId);
                this.onTimeout(gameState, gameView);
            }
        }, 1000);
    },

    /**
     * 超时处理
     */
    onTimeout(gameState, gameView) {
        const game = gameState.tradeGame;
        const currentQ = game.questions[game.currentQuestion];

        // 显示超时反馈
        const feedbackEl = document.getElementById('trade-feedback');
        if (feedbackEl) {
            feedbackEl.innerHTML = `<div style="background: #ffebee; color: #c62828; padding: 10px; border-radius: 5px;"><strong>⏱ 超时了！</strong> 正确答案是 ${currentQ.answer} 贯</div>`;
        }

        // 进入下一题
        game.currentQuestion++;
        setTimeout(() => {
            if (game.currentQuestion >= game.totalQuestions) {
                this.finish(gameState, gameView);
            } else {
                game.remainingTime = game.timeLimitPerQuestion;
                this.renderCurrentQuestion(gameState, gameView);
                this.startTimer(gameState, gameView);
            }
        }, 1500);
    },

    /**
     * 用户选择答案
     */
    onSelect(selectedAnswer, gameState, gameView) {
        if (this.timerId) {
            clearInterval(this.timerId);
        }

        const game = gameState.tradeGame;
        if (!game) {
            console.warn('Trade game already finished, ignoring click');
            return;
        }
        const currentQ = game.questions[game.currentQuestion];
        if (!currentQ) {
            console.warn('Trade question not found, ignoring click');
            return;
        }
        const feedbackEl = document.getElementById('trade-feedback');

        const correct = Math.abs(selectedAnswer - currentQ.answer) < 0.001;

        if (correct) {
            game.correctCount++;
            feedbackEl.innerHTML = `<div style="background: #e8f5e8; color: #2e7d32; padding: 10px; border-radius: 5px;"><strong>✔ 答对了！</strong></div>`;
        } else {
            feedbackEl.innerHTML = `<div style="background: #ffebee; color: #c62828; padding: 10px; border-radius: 5px;"><strong>✘ 答错了！</strong> 正确答案是 ${currentQ.answer} 贯</div>`;
        }

        // 进入下一题
        game.currentQuestion++;
        setTimeout(() => {
            if (game.currentQuestion >= game.totalQuestions) {
                this.finish(gameState, gameView);
            } else {
                game.remainingTime = game.timeLimitPerQuestion;
                this.renderCurrentQuestion(gameState, gameView);
                this.startTimer(gameState, gameView);
            }
        }, 1500);
    },

    /**
     * 结算游戏
     */
    finish(gameState, gameView) {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }

        const game = gameState.tradeGame;
        if (!game) {
            console.warn('Trade game already finished, ignoring finish call');
            return;
        }
        const task = gameState.currentTask;

        // 计算完成率
        const ratio = game.correctCount / game.totalQuestions;

        let resultText;
        if (game.correctCount === 5) {
            resultText = `🎉 分毫不差！${game.correctCount}/${game.totalQuestions} 题全对，堪称神算手！`;
        } else if (game.correctCount >= 3) {
            resultText = `✅ 估价基本准确！答对 ${game.correctCount}/${game.totalQuestions} 题，尚可胜任。`;
        } else if (game.correctCount >= 1) {
            resultText = `❌ 估价错误较多！答对 ${game.correctCount}/${game.totalQuestions} 题，客商不太满意。`;
        } else {
            resultText = `❌ 估价全错！一题没对，买卖砸了，客商败兴而去。`;
        }

        if (game.isPractice) {
            // 练习模式 - 固定奖励商贾经验，消耗5天
            const expGained = Math.round(10 * ratio);
            gameState.addSkillExp('trade', expGained);
            gameState.addLog(`珠算商贾估价练习完成：${resultText} 获得 ${expGained} 商政经验，消耗5天时间。`);
            gameState.advanceDays(5);
            gameState.tradeGame = null;
            // 返回设施场景
            gameState.currentScene = window.GameScene.FACILITY;
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

            gameState.tradeGame = null;
            gameState.currentScene = window.GameScene.CITY_VIEW;
            gameView.renderAll();
        }
    }
};
