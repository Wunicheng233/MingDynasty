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
        // 题库：题目文本，正确答案（数字单位贯，1贯=1000文）
        const questionPool = [
            {
                text: "上好丝绸一匹售价3贯200文，客官买4匹，需付多少钱？",
                answer: 12.8 // 12贯800文 = 12.8贯
            },
            {
                text: "盐引一张可支盐300斤，若每斤盐售价80文，一张盐引值多少钱？",
                answer: 24 // 24000文 = 24贯
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
            },
            {
                text: "常州甘蔗三捆一共6贯，一捆甘蔗多少钱？",
                answer: 2 // 6 / 3 = 2
            },
            {
                text: "荔枝十斤一共5贯，一斤荔枝多少钱？",
                answer: 0.5 // 5 / 10 = 0.5贯 = 500文
            },
            {
                text: "一斤茶叶售价2贯500文，买三斤需要多少贯？",
                answer: 7.5 // 2.5 * 3 = 7.5
            },
            {
                text: "一捆木材售价1贯200文，买五捆需要多少贯？",
                answer: 6 // 1.2 * 5 = 6
            },
            {
                text: "售价每件4贯，进价每件2贯500文，卖出一件利润多少？",
                answer: 1.5 // 4 - 2.5 = 1.5
            },
            {
                text: "原有存粮120石，吃掉三成，还剩多少石？",
                answer: 84 // 120 * 0.7 = 84
            },
            {
                text: "一匹布售价2贯800文，买四匹需要多少钱？",
                answer: 11.2 // 2.8 * 4 = 11.2
            },
            {
                text: "一担大米150斤，一斤5文钱，一担总共多少文？",
                answer: 750 // 150 * 5 = 750文 = 0.75贯
            },
            {
                text: "店主把进价10贯的货物加价两成出售，售价多少？",
                answer: 12 // 10 * 1.2 = 12
            },
            {
                text: "一斤盐售价15文，买50斤需要多少贯？",
                answer: 0.75 // 15 * 50 = 750文 = 0.75贯
            },
            {
                text: "一桶油进价3贯，售价4贯500文，利润多少？",
                answer: 1.5 // 4.5 - 3 = 1.5
            },
            {
                text: "总价45贯，分给三个人平分，每人得多少？",
                answer: 15 // 45 / 3 = 15
            },
            {
                text: "原本房租每月5贯，涨价一成，新房租多少？",
                answer: 5.5 // 5 * 1.1 = 5.5
            },
            {
                text: "一石米售价3贯，打九五折出售，实际售价多少？",
                answer: 2.85 // 3 * 0.95 = 2.85
            },
            {
                text: "十斤棉花一共2贯500文，一斤棉花多少钱？",
                answer: 0.25 // 2.5 / 10 = 0.25贯 = 250文
            },
            {
                text: "八百文就是多少贯？",
                answer: 0.8 // 800文 = 0.8贯
            },
            {
                text: "五贯五百文就是多少贯（填小数）？",
                answer: 5.5 // 5贯500文 = 5.5贯
            },
            {
                text: "三两银子折合成贯，一两等于一贯五百文，三两是多少？",
                answer: 4.5 // 1.5 * 3 = 4.5
            },
            {
                text: "十两银子，一两折合一贯，总共多少贯？",
                answer: 10 // 10 * 1 = 10
            },
            {
                text: "商家进货二十匹布，每匹进价三贯，总共进价多少？",
                answer: 60 // 20 * 3 = 60
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
