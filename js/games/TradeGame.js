/**
 * 商政珠算小游戏
 * 珠算商贾 - 连续回答6道商业算术题，计算价格利润
 */

window.TradeGame = {
    /**
     * 启动游戏
     */
    start(gameView, gameState) {
        const task = gameState.currentTask;
        // 题库：题目文本，正确答案（数字单位贯）
        const questionPool = [
            {
                text: "上好丝绸一匹售价3贯200文，客官买4匹，需付多少钱？",
                answer: 12.8 // 12贯800文 = 12.8贯
            },
            {
                text: "盐引一张可支盐300斤，若每斤盐售价80文，一张盐引值多少钱？",
                answer: 24 // 24000文 = 24贯 (1贯=1000文)
            },
            {
                text: "原本利润45两，因漕运延误被扣三成，还剩多少两？",
                answer: 31.5 // 45 * 0.7 = 31.5
            },
            {
                text: "徽州茶叶一箱进价15贯，售价22贯，一箱利润多少？",
                answer: 7 // 22-15=7
            },
            {
                text: "棉布三匹一共21贯，一匹棉布价格多少？",
                answer: 7 // 21/3=7
            },
            {
                text: "稻米一石售价3贯500文，买两石多少钱？",
                answer: 7 // (3.5 * 2) = 7
            },
            {
                text: "一匹锦缎售价16贯，打八折出售，实际售价多少？",
                answer: 12.8 // 16 * 0.8 = 12.8
            },
            {
                text: "一斤铁200文，买25斤铁需要多少贯？",
                answer: 5 // 200*25 = 5000文 = 5贯
            },
            {
                text: "五斗米一共1贯500文，一斗米多少钱？",
                answer: 0.3 // 1.5 / 5 = 0.3贯 = 300文
            },
            {
                text: "进价每匹布8贯，售价12贯，利润率百分之多少？",
                answer: 50 // (12-8)/8 = 50%
            }
        ];

        // 随机选6题
        gameState.tradeGame = {
            questions: [],
            current: 0,
            correct: 0
        };
        const game = gameState.tradeGame;

        // 随机打乱选6题
        const shuffled = questionPool.sort(() => Math.random() - 0.5);
        game.questions = shuffled.slice(0, 6);

        this.renderRound(gameState);
    },

    /**
     * 渲染当前题目
     */
    renderRound(gameState) {
        const game = gameState.tradeGame;
        const q = game.questions[game.current];

        let html = `
            <div class="trade-header">
                <h2>${gameState.currentTask.name}</h2>
                <p>已答: ${game.current}/${game.questions.length} &nbsp; 答对: ${game.correct}</p>
            </div>
            <div class="trade-question">
                <p><strong>【第${game.current + 1}题】</strong> ${q.text}</p>
                <p>请输入答案 (单位：贯，可填小数，比如 12.8):</p>
                <div class="trade-input">
                    <input type="number" step="0.1" id="trade-answer" placeholder="输入答案">
                    <button class="btn primary-btn" id="trade-submit">提交答案</button>
                </div>
                <div class="trade-result" id="trade-result"></div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        document.getElementById('trade-submit').addEventListener('click', () => {
            const input = document.getElementById('trade-answer');
            const userAnswer = parseFloat(input.value);
            if (isNaN(userAnswer)) {
                alert('请输入有效的数字！');
                return;
            }
            this.checkAnswer(userAnswer, gameState, gameView);
        });
    },

    /**
     * 检查答案
     */
    checkAnswer(userAnswer, gameState, gameView) {
        const game = gameState.tradeGame;
        const q = game.questions[game.current];
        const resultEl = document.getElementById('trade-result');

        // 允许0.1误差
        const correct = Math.abs(userAnswer - q.answer) < 0.15;
        if (correct) {
            game.correct++;
            resultEl.innerHTML = `<div class="trade-correct">✔ 答对了！</div>`;
        } else {
            resultEl.innerHTML = `<div class="trade-wrong">✘ 答错了，正确答案是 ${q.answer} 贯</div>`;
        }

        game.current++;

        if (game.current >= game.questions.length) {
            // 全部答完，结算
            setTimeout(() => this.finish(gameState, gameView), 1500);
        } else {
            // 下一题
            setTimeout(() => this.renderRound(gameState), 1500);
        }
    },

    /**
     * 结算
     */
    finish(gameState, gameView) {
        const game = gameState.tradeGame;
        const task = gameState.currentTask;

        let ratio;
        let resultText;

        if (game.correct === 6) {
            ratio = 1.0;
            resultText = `🎉 完胜！${game.correct}题全对，获得全额奖励。`;
        } else if (game.correct >= 4) {
            ratio = 0.7;
            resultText = `✅ 合格！答对${game.correct}题，获得七成奖励。`;
        } else {
            ratio = game.correct * 0.1;
            resultText = `❌ 不合格！只答对${game.correct}题，奖励减半。`;
        }

        const finalMerit = Math.round(task.rewardMerit * ratio);
        const finalMoney = Math.round(task.rewardMoney * ratio);
        const expGained = Math.round(10 * ratio);

        gameState.merit += finalMerit;
        gameState.money += finalMoney;
        if (task.requiredSkill) {
            gameState.addSkillExp(task.requiredSkill, expGained);
        }

        gameState.checkRolePromotion();
        gameState.addLog(`任务【${task.name}】完成：${resultText} 获得 ${finalMerit} 功勋，${finalMoney} 金钱，${expGained} 商政经验。`);

        gameView.advanceTwoMonths();
        gameState.currentTask = null;
        gameState.tradeGame = null;
        gameState.currentScene = GameScene.CITY_VIEW;
        gameView.renderAll();
    }
};
