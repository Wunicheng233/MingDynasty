/**
 * 朝仪习礼小游戏（礼制）
 * 全新玩法：辨礼纠错 - 朝会大典进行中，你作为礼官要及时发现礼仪错误并纠正
 * 典故：明代朝仪制度严格，礼官负责纠正礼仪失当，分毫之差都算失礼
 */

window.RitualGame = {
    /**
     * 题库：所有礼仪判断题
     * 每个题目：
     * - ceremony: 当前大典环节描述
     * - current: 当前实际进行的操作
     * - isCorrect: 是否正确
     * - explanation: 解释（如果错误，说明正确应该是什么）
     */
    questionPool: [
        // 顺序错误
        {
            ceremony: '皇帝登基大典',
            current: '流程顺序：斋戒 → 祭天 → 受玺 → 宣诏',
            isCorrect: false,
            explanation: '顺序错误，正确顺序：斋戒 → 祭天 → 宣诏 → 受玺'
        },
        {
            ceremony: '册封皇太子',
            current: '流程顺序：遣使 → 斋戒 → 告庙 → 受册',
            isCorrect: true,
            explanation: '流程正确，符合明代册封礼仪'
        },
        {
            ceremony: '郊祀祭天',
            current: '祭祀顺序：迎神 → 进俎 → 奠玉帛 → 初献 → 亚献',
            isCorrect: false,
            explanation: '顺序错误，正确顺序：迎神 → 奠玉帛 → 进俎 → 初献 → 亚献'
        },
        {
            ceremony: '经筵讲读完',
            current: '顺序：讲官退 → 皇帝起驾 → 百官退',
            isCorrect: true,
            explanation: '顺序正确，符合经筵礼仪'
        },
        // 物品错误
        {
            ceremony: '皇帝祭太庙',
            current: '主祭礼器：铜爵',
            isCorrect: false,
            explanation: '礼器错误，太庙祭祀主器应当是玉玺'
        },
        {
            ceremony: '皇帝祭天地',
            current: '玉质礼器：苍璧',
            isCorrect: true,
            explanation: '礼器正确，祭天用苍璧符合礼制'
        },
        {
            ceremony: '皇帝颁诏',
            current: '诏书捧出：由礼部尚书捧诏书',
            isCorrect: false,
            explanation: '官职错误，诏书应当由翰林院掌院学士捧出'
        },
        {
            ceremony: '殿试传胪',
            current: '一甲第一名：状元，接受赐宴',
            isCorrect: true,
            explanation: '正确，一甲三名状元、榜眼、探花都赐宴'
        },
        // 排班/品级错误
        {
            ceremony: '常朝百官排班',
            current: '品级顺序：太师 → 太傅 → 太保 → 少师',
            isCorrect: true,
            explanation: '正确，三公三孤顺序无误'
        },
        {
            ceremony: '常朝百官排班',
            current: '六部顺序：吏部 → 户部 → 礼部 → 工部 → 兵部 → 刑部',
            isCorrect: false,
            explanation: '顺序错误，正确六部顺序：吏部 → 户部 → 礼部 → 兵部 → 刑部 → 工部'
        },
        {
            ceremony: '爵位排序',
            current: '从高到低：郡王 → 亲王 → 国公 → 郡公',
            isCorrect: false,
            explanation: '爵位错误，正确顺序：亲王 → 郡王 → 国公 → 郡公'
        },
        {
            ceremony: '五服亲疏排序',
            current: '从近到远：斩衰 → 齐衰 → 大功 → 小功 → 缌麻',
            isCorrect: true,
            explanation: '正确，五服亲疏顺序无误'
        },
        // 称谓错误
        {
            ceremony: '朝会称呼皇帝',
            current: '群臣称呼："皇上"',
            isCorrect: true,
            explanation: '正确，明代朝臣称呼皇帝为皇上'
        },
        {
            ceremony: '奏章称呼陛下',
            current: '文官自称："臣某某"',
            isCorrect: true,
            explanation: '正确，明代文官奏章自称臣无误'
        },
        {
            ceremony: '皇帝称呼皇太子',
            current: '直接称呼名字',
            isCorrect: false,
            explanation: '礼仪错误，皇帝称呼皇太子应当称"皇长子"或封号，不直接称名'
        },
        {
            ceremony: '藩王进京朝见',
            current: '皇帝称藩王："某王"',
            isCorrect: true,
            explanation: '正确，皇帝称呼藩王直呼王位'
        },
        // 更多题目
        {
            ceremony: '皇后册封',
            current: '金册金宝：皇后授金册金宝',
            isCorrect: true,
            explanation: '正确，明代皇后册封赐金册金宝'
        },
        {
            ceremony: '皇妃册封',
            current: '皇妃也授金册金宝',
            isCorrect: false,
            explanation: '错误，皇妃只有金册没有金宝，金宝只有皇后和贵妃才有'
        },
        {
            ceremony: '大朝会站位',
            current: '文东武西：文臣站东侧，武将站西侧',
            isCorrect: true,
            explanation: '正确，明代大朝会一贯文东武西'
        },
        {
            ceremony: '大朝会排班',
            current: '驸马都尉排班在宗室之后',
            isCorrect: false,
            explanation: '站位错误，驸马都尉应当在文官最后一班'
        },
        {
            ceremony: '进士传胪',
            current: '唱名顺序：一甲 → 二甲 → 三甲',
            isCorrect: true,
            explanation: '正确，传胪唱名顺序无误'
        },
        {
            ceremony: '国子监祭酒就职',
            current: '祭酒面向孔子像行四拜礼',
            isCorrect: true,
            explanation: '正确，国子监祭孔礼仪无误'
        }
    ],

    /**
     * 启动游戏 - 先显示说明
     */
    start(gameView, gameState, title = null) {
        const headerTitle = title || (gameState.currentTask ? gameState.currentTask.name : '朝仪习礼');

        let html = `
            <div style="max-height: 70vh; overflow-y: auto; padding: 0 5px; padding-bottom: 30px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #8b4513; font-size: 28px; margin-bottom: 8px;">⚜️ 朝仪习礼</h2>
                    <p style="color: #6b5b45; font-size: 16px;">你是当朝礼官，大典进行中要及时发现礼仪错误，纠正失当！</p>
                </div>

                <div style="background: #f5f0e1; padding: 18px; border-radius: 8px; margin-bottom: 16px;">
                    <h3 style="color: #8b4513; margin-top: 0; font-size: 22px; margin-bottom: 10px;">游戏规则</h3>
                    <ul style="line-height: 1.7; color: #333; font-size: 18px; padding-left: 20px; margin: 0;">
                        <li>一道道礼仪环节依次展示，<strong>判断正误</strong></li>
                        <li>正确点「✅ 正确」，错了点「❌ 纠错」</li>
                        <li>判断对了加分，错了扣分，<strong>超时不得分</strong></li>
                        <li>等级越高 → 题越多，错越多，时间越短</li>
                    </ul>
                    <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">💡 一丝之差便是失礼，礼官可要明察秋毫！</p>
                </div>

                <div style="text-align: center; margin-top: 20px;">
                    <button class="btn primary-btn" id="start-ritual-btn" style="padding: 12px 40px; font-size: 18px;">开始辨礼!</button>
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        document.getElementById('start-ritual-btn').addEventListener('click', () => {
            this.startActualGame(gameView, gameState, title);
        });
    },

    /**
     * 真正开始游戏 - 随机抽题
     */
    startActualGame(gameView, gameState, title = null) {
        const task = gameState.currentTask;

        // 根据技能等级设置难度
        let skillLevel = 1;
        if (task && task.requiredSkill) {
            skillLevel = window.SkillSystem.getSkillLevel(gameState, task.requiredSkill);
        }
        skillLevel = Math.max(1, Math.min(3, skillLevel));

        // 难度参数
        let totalQuestions, errorRate, timePerQuestion;
        if (skillLevel === 1) {
            totalQuestions = 8;
            errorRate = 0.3;
            timePerQuestion = 15;
        } else if (skillLevel === 2) {
            totalQuestions = 10;
            errorRate = 0.4;
            timePerQuestion = 12;
        } else {
            totalQuestions = 12;
            errorRate = 0.5;
            timePerQuestion = 10;
        }

        // 随机抽题
        const shuffled = [...this.questionPool].sort(() => Math.random() - 0.5);
        const questions = shuffled.slice(0, totalQuestions);

        // 随机决定每道题是否错误（按errorRate概率）
        // 保持原题目isCorrect不变，只是抽题

        // 初始化游戏状态
        gameState.ritualGame = {
            skillLevel: skillLevel,
            totalQuestions: totalQuestions,
            timePerQuestion: timePerQuestion,
            currentQuestion: 0,
            score: 0,
            questions: questions,
            history: [],
            timerId: null,
            timeRemaining: timePerQuestion,
            isPractice: title !== null
        };

        this.renderCurrentQuestion(gameState, gameView);
    },

    /**
     * 渲染当前题目
     */
    renderCurrentQuestion(gameState, gameView) {
        const game = gameState.ritualGame;
        const q = game.questions[game.currentQuestion];
        const headerTitle = game.isPractice ? '朝仪习礼练习' : (gameState.currentTask ? gameState.currentTask.name : '朝仪习礼');

        let html = `
            <div style="max-height: 70vh; overflow-y: auto; padding: 0 5px;">
                <div class="ritual-header" style="margin-bottom: 15px;">
                    <h2>${headerTitle}</h2>
                    <p>第 <strong>${game.currentQuestion + 1}</strong> / ${game.totalQuestions} 题 &nbsp; 当前得分: <strong>${game.score}</strong></p>
                </div>

                <!-- 题目区域 -->
                <div class="ritual-question" style="background: #f5f0e1; padding: 20px; border-radius: 8px; margin: 15px 0; text-align: center;">
                    <h3 style="margin-top: 0; margin-bottom: 15px;">大典环节：${q.ceremony}</h3>
                    <p style="font-size: 24px; font-weight: bold; margin: 10px 0; background: #fff; padding: 15px; border-radius: 6px;">
                        ${q.current}
                    </p>
                </div>

                <!-- 倒计时 -->
                <div class="ritual-timer" style="margin: 15px 10px;">
                    <p style="margin-bottom: 8px;">剩余判断时间: <strong id="time-remaining">${game.timeRemaining}</strong> 秒</p>
                    <div style="width: 100%; height: 20px; background: #eee; border-radius: 10px; overflow: hidden;">
                        <div id="time-bar" style="height: 100%; width: ${(game.timeRemaining / game.timePerQuestion) * 100}%; background: ${game.timeRemaining > 3 ? '#27ae60' : '#e74c3c'}; transition: width 0.3s;"></div>
                    </div>
                </div>

                <!-- 判断按钮 -->
                <div class="ritual-buttons" style="display: flex; gap: 20px; margin: 20px 10px; justify-content: center;">
                    <button class="btn primary-btn" id="btn-correct" style="padding: 12px 40px; font-size: 20px; background: #27ae60;">✅ 正确</button>
                    <button class="btn primary-btn" id="btn-incorrect" style="padding: 12px 40px; font-size: 20px; background: #e67e22;">❌ 纠错</button>
                </div>

                <!-- 历史记录 -->
                <div class="ritual-history" style="
                    background: #f5f0e1;
                    padding: 12px 15px;
                    border-radius: 8px;
                    margin: 15px 10px 30px 10px;">
                    <h4 style="margin: 0 0 8px 0; font-size: 16px;">历史判断：</h4>
                    <div id="history-list" style="line-height: 1.6; max-height: 120px; overflow-y: auto;">
                        ${this.renderHistory(game.history)}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        this.bindEvents(gameState, gameView);
        this.startTimer(gameState, gameView);
    },

    /**
     * 渲染历史记录
     */
    renderHistory(history) {
        if (history.length === 0) {
            return '<em style="color: #666;">尚未判断</em>';
        }
        return history.map((item, i) => {
            const icon = item.correct ? '✅' : '❌';
            const result = item.playerGotIt ? '<span style="color: green;">判断正确</span>' : '<span style="color: red;">判断错误</span>';
            return `<div>${i+1}. ${item.ceremony} → ${icon} ${result}</div>`;
        }).join('');
    },

    /**
     * 绑定事件
     */
    bindEvents(gameState, gameView) {
        document.getElementById('btn-correct').addEventListener('click', () => {
            this.answer(gameState, gameView, true);
        });
        document.getElementById('btn-incorrect').addEventListener('click', () => {
            this.answer(gameState, gameView, false);
        });
    },

    /**
     * 启动倒计时
     */
    startTimer(gameState, gameView) {
        const game = gameState.ritualGame;
        game.timerId = setInterval(() => {
            game.timeRemaining--;
            const textEl = document.getElementById('time-remaining');
            const barEl = document.getElementById('time-bar');
            if (textEl) {
                textEl.textContent = game.timeRemaining;
            }
            if (barEl) {
                const percent = (game.timeRemaining / game.timePerQuestion) * 100;
                barEl.style.width = `${percent}%`;
                if (game.timeRemaining <= 3) {
                    barEl.style.background = '#e74c3c';
                }
            }
            if (game.timeRemaining <= 0) {
                clearInterval(game.timerId);
                this.timeout(gameState, gameView);
            }
        }, 1000);
    },

    /**
     * 超时未答
     */
    timeout(gameState, gameView) {
        const game = gameState.ritualGame;
        const q = game.questions[game.currentQuestion];

        // 超时不得分，记录历史，进入下一题
        game.history.push({
            ceremony: q.ceremony,
            correct: q.isCorrect,
            playerAnswer: null,
            playerGotIt: false
        });

        this.nextQuestion(gameState, gameView);
    },

    /**
     * 玩家回答
     */
    answer(gameState, gameView, playerAnswer) {
        const game = gameState.ritualGame;
        const q = game.questions[game.currentQuestion];

        clearInterval(game.timerId);

        // 判断是否答对
        const correct = (playerAnswer === q.isCorrect);
        if (correct) {
            game.score += 10;
        } else {
            game.score -= 5;
        }
        // 得分不负数
        game.score = Math.max(0, game.score);

        // 记录历史
        game.history.push({
            ceremony: q.ceremony,
            correct: q.isCorrect,
            playerAnswer: playerAnswer,
            playerGotIt: correct
        });

        // 显示本题结果和解释，然后继续
        this.renderResultExplanation(gameState, gameView, q, correct);
    },

    /**
     * 显示本题结果和解释，让玩家看完再继续
     */
    renderResultExplanation(gameState, gameView, question, correct) {
        const game = gameState.ritualGame;
        const headerTitle = game.isPractice ? '朝仪习礼练习' : (gameState.currentTask ? gameState.currentTask.name : '朝仪习礼');

        const resultColor = correct ? '#27ae60' : '#c0392b';
        const resultText = correct ? '✅ 判断正确' : '❌ 判断错误';

        let html = `
            <div style="max-height: 70vh; overflow-y: auto; padding: 0 5px;">
                <div class="ritual-header" style="margin-bottom: 15px;">
                    <h2>${headerTitle}</h2>
                    <p>第 <strong>${game.currentQuestion + 1}</strong> / ${game.totalQuestions} 题 &nbsp; 当前得分: <strong>${game.score}</strong></p>
                </div>

                <div class="question-result" style="text-align: center; padding: 20px; border-radius: 8px; background: #f5f0e1; margin: 15px 0;">
                    <h3 style="margin-top: 0; color: ${resultColor}; font-size: 24px;">${resultText}</h3>
                    <div style="margin-top: 15px; font-size: 18px; line-height: 1.6;">
                        <p><strong>${question.ceremony}</strong></p>
                        <p>${question.current}</p>
                        <hr>
                        <p style="background: #fff; padding: 10px; border-radius: 5px; margin-top: 10px;">
                            ${question.explanation}
                        </p>
                    </div>
                </div>

                <div class="history-block" style="
                    background: #f5f0e1;
                    padding: 12px 15px;
                    border-radius: 8px;
                    margin: 15px 10px 30px 10px;">
                    <h4 style="margin: 0 0 8px 0; font-size: 16px;">历史判断：</h4>
                    <div id="history-list" style="line-height: 1.6; max-height: 100px; overflow-y: auto;">
                        ${this.renderHistory(game.history)}
                    </div>
                </div>

                <div class="next-button" style="text-align: center; padding-bottom: 30px;">
                    <button class="btn primary-btn" id="next-question-btn" style="padding: 12px 40px; font-size: 18px;">下一题</button>
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        document.getElementById('next-question-btn').addEventListener('click', () => {
            this.goToNextQuestion(gameState, gameView);
        });
    },

    /**
     * 进入下一题
     */
    goToNextQuestion(gameState, gameView) {
        const game = gameState.ritualGame;

        if (game.currentQuestion >= game.totalQuestions - 1) {
            // 全部完成，结算
            this.finish(gameState, gameView);
        } else {
            // 下一题
            game.currentQuestion++;
            game.timeRemaining = game.timePerQuestion;
            this.renderCurrentQuestion(gameState, gameView);
        }
    },

    /**
     * 下一题
     */
    nextQuestion(gameState, gameView) {
        const game = gameState.ritualGame;

        if (game.currentQuestion >= game.totalQuestions - 1) {
            this.finish(gameState, gameView);
        } else {
            game.currentQuestion++;
            game.timeRemaining = game.timePerQuestion;
            this.renderCurrentQuestion(gameState, gameView);
        }
    },

    /**
     * 结算游戏
     */
    finish(gameState, gameView) {
        const game = gameState.ritualGame;
        const task = gameState.currentTask;

        // 满分 = 题数 * 10，比例 = 得分 / 满分
        const totalPossible = game.totalQuestions * 10;
        const ratio = Math.min(1, game.score / totalPossible);

        let resultTitle, resultDesc;
        if (ratio >= 0.9) {
            resultTitle = '🎉 礼仪娴熟！';
            resultDesc = `得分 ${game.score}/${totalPossible}，丝毫不差，真不愧是当朝礼官！`;
        } else if (ratio >= 0.7) {
            resultTitle = '✅ 礼仪合格';
            resultDesc = `得分 ${game.score}/${totalPossible}，小有错漏，但大体不失，可以继续！`;
        } else if (ratio >= 0.4) {
            resultTitle = '⚠ 错漏颇多';
            resultDesc = `得分 ${game.score}/${totalPossible}，失礼之处不少，还要多加练习！`;
        } else {
            resultTitle = '✘ 礼仪大乱';
            resultDesc = `得分 ${game.score}/${totalPossible}，错误百出，大典要被你搞砸了！`;
        }

        if (game.isPractice) {
            // 练习模式 - 固定奖励礼制经验，消耗5天
            const expGained = Math.round(10 * ratio);
            gameState.addSkillExp('ritual', expGained);
            gameState.addLog(`朝仪习礼练习完成：${resultTitle} 得分 ${game.score}/${totalPossible}，获得 ${expGained} 礼制经验，消耗5天时间。`);
            gameState.advanceDays(5);
            gameState.ritualGame = null;

            let html = `
                <div class="ritual-result" style="text-align: center; padding: 30px; max-height: 70vh; overflow-y: auto;">
                    <h2 style="font-size: 28px; margin-bottom: 20px; color: #8b4513;">${resultTitle}</h2>
                    <p style="font-size: 16px; margin-bottom: 30px;">${resultDesc}</p>
                    <div style="background: #f5f0e1; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                        <p>得分: ${game.score} / ${totalPossible}</p>
                        <p>答对题数: ${game.history.filter(h => h.playerGotIt).length} / ${game.totalQuestions}</p>
                    </div>
                    <p>获得：${expGained} 礼制经验</p>
                    <div style="margin-top: 30px;">
                        <button class="btn primary-btn" id="ritual-done-btn">返回国子监</button>
                    </div>
                </div>
            `;

            document.getElementById('farming-game-view').innerHTML = html;
            document.getElementById('ritual-done-btn').addEventListener('click', () => {
                gameState.currentScene = window.GameScene.FACILITY;
                gameView.renderAll();
            });
        } else {
            // 正常任务结算
            const template = getMissionTemplateById(gameState.currentTask.templateId) || gameState.currentTask;
            const actualProgress = Math.round(gameState.currentTask.targetValue * ratio);
            const success = actualProgress > 0;

            const result = gameState.completeMission(success, actualProgress);

            gameState.addLog(`【${template.name}】${resultTitle} 得分 ${game.score}/${totalPossible}`);

            let html = `
                <div class="ritual-result" style="text-align: center; padding: 30px; max-height: 70vh; overflow-y: auto;">
                    <h2 style="font-size: 28px; margin-bottom: 20px; color: #8b4513;">${resultTitle}</h2>
                    <p style="font-size: 16px; margin-bottom: 30px;">${resultDesc}</p>
                    <div style="background: #f5f0e1; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                        <p>得分: ${game.score} / ${totalPossible}</p>
                        <p>答对题数: ${game.history.filter(h => h.playerGotIt).length} / ${game.totalQuestions}</p>
                    </div>
                    <p>功勋奖励：${result.meritGained > 0 ? '+' : ''}${result.meritGained}</p>
                    <div style="margin-top: 30px;">
                        <button class="btn primary-btn" id="ritual-done-btn">完成返回</button>
                    </div>
                </div>
            `;

            document.getElementById('farming-game-view').innerHTML = html;
            document.getElementById('ritual-done-btn').addEventListener('click', () => {
                window.TimeSystem.advanceDays(gameState, template.timeLimitDays);
                gameState.ritualGame = null;
                gameState.currentScene = window.GameScene.CITY_VIEW;
                gameView.renderAll();
            });
        }
    }
};
