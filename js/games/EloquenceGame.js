/**
 * 游说口才小游戏
 * 6回合内将对方情绪值提升到100即可成功
 */

window.EloquenceGame = {
    /**
     * 启动游戏
     */
    start(gameView, gameState) {
        const task = gameState.currentTask;
        // 初始化游戏状态 - 按照策划设计
        const targets = [
            {name: '劝降陈友谅部将张定边', desc: '目标：劝降对方将领'},
            {name: '说服濠州财主捐粮赈灾', desc: '目标：说服地主拿出粮食赈济灾民'},
            {name: '劝说郭子兴重用朱元璋', desc: '目标：劝说主帅让出兵攻打元军'},
            {name: '游说地方乡绅归顺吴王', desc: '目标：劝说地方势力投降'}
        ];
        const target = targets[Math.floor(Math.random() * targets.length)];

        // 根据技能等级调整初始情绪 (符合策划难度曲线)
        // Lv1: 初始情绪 0, Lv2: 初始情绪 20, Lv3: 初始情绪 40
        let skillLevel = 1;
        if (task && task.requiredSkill) {
            skillLevel = SkillSystem.getSkillLevel(gameState, task.requiredSkill);
        }
        let initialEmotion = (skillLevel - 1) * 20;

        gameState.eloquenceGame = {
            emotion: initialEmotion,
            remainingRounds: 6,
            lastFeedback: '对方平静地看着你...',
            target: target
        };

        this.renderRound(gameState);
    },

    /**
     * 渲染当前回合
     */
    renderRound(gameState) {
        const game = gameState.eloquenceGame;
        const emotionBar = '■'.repeat(Math.floor(game.emotion / 10)) + '□'.repeat(10 - Math.floor(game.emotion / 10));

        let html = `
            <div class="eloquence-header">
                <h2>${gameState.currentTask.name}</h2>
                <p>${game.target.desc}</p>
                <p>当前情绪值：${emotionBar} ${game.emotion}/100 &nbsp; 剩余回合：${game.remainingRounds}</p>
            </div>
            <div class="eloquence-feedback">
                <p>上一回合：${game.lastFeedback}</p>
            </div>
            <div class="eloquence-actions">
                <p>请选择本轮话术：</p>
                <button class="btn primary-btn eloquence-action" data-action="reason">
                    1. 晓之以理<br>
                    <span class="eloquence-desc" style="color: #ffd700;">讲道理，情绪平稳时效果好 (+10~15)<br>对方激动时可能激怒 (-5~10)</span>
                </button>
                <button class="btn primary-btn eloquence-action" data-action="emotion">
                    2. 动之以情<br>
                    <span class="eloquence-desc" style="color: #ffd700;">打感情牌，对方情绪低落时效果好 (+15~20)<br>对方得意时可能被视为软弱 (-10)</span>
                </button>
                <button class="btn primary-btn eloquence-action" data-action="bribe">
                    3. 诱之以利<br>
                    <span class="eloquence-desc" style="color: #ffd700;">许诺好处，对方摇摆时效果好 (+20~25)<br>对方警觉时可能起疑心 (-15)</span>
                </button>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        this.bindEvents(gameState, gameView);
    },

    /**
     * 绑定点击事件
     */
    bindEvents(gameState, gameView) {
        document.querySelectorAll('.eloquence-action').forEach(btn => {
            btn.addEventListener('click', () => {
                this.onAction(btn.dataset.action, gameState, gameView);
            });
        });
    },

    /**
     * 处理玩家选择话术
     */
    onAction(action, gameState, gameView) {
        const game = gameState.eloquenceGame;

        // 根据情绪状态判断加成
        let change;
        let feedbackTpl;

        // 根据话术+情绪随机给分
        if (action === 'reason') {
            // 晓之以理 - 情绪平稳 (30-70) 效果好
            if (game.emotion >= 30 && game.emotion <= 70) {
                change = Math.floor(Math.random() * 6) + 10; // 10-15
                feedbackTpl = "对方若有所思地点点头，对你的话表示认同。";
            } else if (game.emotion > 70) {
                // 激动
                change = - (Math.floor(Math.random() * 6) + 5); // -5 ~ -10
                feedbackTpl = "对方眉头紧皱，冷哼一声，对你的说教很不耐烦。";
            } else {
                change = Math.floor(Math.random() * 6) + 5; // 5-10
                feedbackTpl = "对方静静地听你说完，不置可否。";
            }
        } else if (action === 'emotion') {
            // 动之以情 - 情绪低落 (<30) 效果好
            if (game.emotion < 30) {
                change = Math.floor(Math.random() * 6) + 15; // 15-20
                feedbackTpl = "对方面露难色，长叹一声，被你的话触动了。";
            } else if (game.emotion > 70) {
                change = -10;
                feedbackTpl = "对方觉得你在惺惺作态，内心更加戒备。";
            } else {
                change = Math.floor(Math.random() * 6) + 10; // 10-15
                feedbackTpl = "对方神色有些触动，微微点头。";
            }
        } else { // bribe
            // 诱之以利 - 摇摆 (30-70) 效果更好，但是风险也大
            if (game.emotion >= 30 && game.emotion <= 70) {
                change = Math.floor(Math.random() * 6) + 20; // 20-25
                feedbackTpl = "对方目光闪烁，正在权衡利益，似乎有些心动。";
            } else if (game.emotion > 70) {
                change = -15;
                feedbackTpl = "对方对你的诱惑很警觉，认为其中必有阴谋。";
            } else {
                change = Math.floor(Math.random() * 6) + 10; // 10-15
                feedbackTpl = "对方对你的许诺将信将疑。";
            }
        }

        game.emotion += change;
        game.emotion = Math.max(0, Math.min(100, game.emotion));
        game.lastFeedback = feedbackTpl;
        game.remainingRounds--;

        // 检查是否结束
        if (game.emotion >= 100 || game.remainingRounds <= 0) {
            this.finish(gameState, gameView);
        } else {
            this.renderRound(gameState);
        }
    },

    /**
     * 结算游戏
     */
    finish(gameState, gameView) {
        const game = gameState.eloquenceGame;
        const task = gameState.currentTask;

        let ratio;
        let resultText;

        if (game.emotion >= 100) {
            ratio = 1.0;
            resultText = '🎉 成功说服对方！情绪值达到100，完胜！';
        } else if (game.emotion >= 60) {
            ratio = 0.7;
            resultText = `✅ 游说基本成功，情绪值${game.emotion}，小胜。`;
        } else {
            ratio = 0.3;
            resultText = `❌ 游说失败，对方不为所动，情绪值仅${game.emotion}。`;
        }

        const template = getMissionTemplateById(gameState.currentTask.templateId);
        // 实际进度 = 目标值 * 完成率
        const actualProgress = Math.round(gameState.currentTask.targetValue * ratio);
        const success = actualProgress > 0;

        // 使用新的主命系统结算
        const result = gameState.completeMission(success, actualProgress);

        gameState.addLog(`【${template.name}】${resultText}`);

        // 时间推进：按任务限时推进
        TimeSystem.advanceDays(gameState, template.timeLimitDays);

        gameState.eloquenceGame = null;
        gameState.currentScene = GameScene.CITY_VIEW;
        gameView.renderAll();
    }
};
