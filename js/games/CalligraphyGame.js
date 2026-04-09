/**
 * 文墨填空小游戏（书法）
 * 选出正确的字填入古诗文/奏章名句
 */

window.CalligraphyGame = {
    /**
     * 启动游戏
     */
    start(gameView, gameState, title = null) {
        const task = gameState.currentTask;
        // 初始化游戏状态
        gameState.calligraphyGame = {
            currentRound: 0,
            totalRounds: 5,
            correctCount: 0,
            isPractice: title !== null
        };
        // 题目题库
        this.questions = [
            {sentence: "___横刀立马，誓诛元贼安天下", options: ["我", "吾", "俺", "余"], answer: "吾"},
            {sentence: "广积___，缓称王", options: ["粮草", "粮食", "粮饷", "积谷"], answer: "粮草"},
            {sentence: "濠州___起朱重八，十四年间定中华", options: ["城", "县", "乡", "野"], answer: "乡"},
            {sentence: "大丈夫___能居人下哉", options: ["岂", "怎", "焉", "安"], answer: "岂"},
            {sentence: "高筑墙，广积粮，___称王", options: ["缓", "慢", "不", "晚"], answer: "缓"},
            {sentence: "___日依山尽，黄河入海流", options: ["白", "落", "夕", "红"], answer: "白"},
            {sentence: "欲穷千里目，更___一层楼", options: ["上", "进", "登", "攀"], answer: "上"},
            {sentence: "山重水复___无路，柳暗花明又一村", options: ["疑", "路", "皆", "尽"], answer: "疑"},
            {sentence: "飞流直下___千尺，疑是银河落九天", options: ["三", "两", "九", "万"], answer: "三"},
            {sentence: "飞流直下___千尺，疑是银河落九天", options: ["三", "两", "九", "万"], answer: "三"},
            {sentence: "天生我材必有用，千金散___还复来", options: ["尽", "去", "毕"], answer: "尽"},
            {sentence: "会当___绝顶，一览众山小", options: ["登", "到", "临", "上"], answer: "临"},
            {sentence: "黄沙百战穿金___，不破楼兰终不还", options: ["甲", "戈", "袍", "铠"], answer: "甲"},
            {sentence: "苟利国家生___以，岂因祸福避趋之", options: ["死", "命", "之", "理"], answer: "死"},
            {sentence: "海内存知己，天涯___比邻", options: ["若", "如", "似", "比"], answer: "若"},
            {sentence: "欲把西湖比西___，淡妆浓抹总相宜", options: ["子", "施", "湖", "女"], answer: "子"},
        ];

        // 洗牌
        this.questions = this.questions.sort(() => Math.random() - 0.5);
        this.renderRound(gameState, gameView, title);
    },

    /**
     * 渲染当前题目
     */
    renderRound(gameState, gameView, title = null) {
        const game = gameState.calligraphyGame;
        const q = this.questions[game.currentRound];
        const headerTitle = title || (gameState.currentTask ? gameState.currentTask.name : '听讲经义');

        let html = `
            <div class="calligraphy-header">
                <h2>${headerTitle}</h2>
                <p>第 ${game.currentRound + 1} / ${game.totalRounds} 题</p>
                <p>选出正确的字填入经文</p>
            </div>
            <div class="calligraphy-question">
                <div class="calligraphy-sentence">${q.sentence.replace('___', '<span class="blank">___</span>')}</div>
            </div>
            <div class="calligraphy-options">
                ${q.options.map(opt => `<button class="btn calligraphy-option">${opt}</button>`).join('')}
            </div>
            <div class="calligraphy-result" id="calligraphy-result"></div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        this.bindEvents(gameState, gameView);
    },

    /**
     * 绑定事件
     */
    bindEvents(gameState, gameView) {
        document.querySelectorAll('.calligraphy-option').forEach(btn => {
            btn.addEventListener('click', () => {
                this.onSelect(btn.textContent, gameState, gameView);
            });
        });
    },

    /**
     * 选择答案
     */
    onSelect(answer, gameState, gameView) {
        const game = gameState.calligraphyGame;
        const q = this.questions[game.currentRound];
        const correct = answer === q.answer;
        if (correct) game.correctCount++;

        const resultEl = document.getElementById('calligraphy-result');
        resultEl.innerHTML = correct
            ? `<div class="calligraphy-answer correct">✔ 正确！</div>`
            : `<div class="calligraphy-answer wrong">✘ 错误，正确答案是：${q.answer}</div>`;

        game.currentRound++;
        if (game.currentRound >= game.totalRounds) {
            setTimeout(() => this.finish(gameState, gameView), 1000);
        } else {
            setTimeout(() => this.renderRound(gameState, gameView), 1000);
        }
    },

    /**
     * 结算游戏
     */
    finish(gameState, gameView) {
        const game = gameState.calligraphyGame;
        const task = gameState.currentTask;
        const ratio = game.correctCount / game.totalRounds;

        if (game.isPractice) {
            // 国子监练习 - 非任务，固定奖励文墨经验，消耗5天
            const expGained = Math.round(10 * ratio);
            gameState.addSkillExp('calligraphy', expGained);
            gameState.addLog(`听讲经义完成！答对 ${game.correctCount}/${game.totalRounds} 题，获得 ${expGained} 文墨经验，消耗5天时间。`);
            gameState.advanceDays(5);
            gameState.calligraphyGame = null;
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
            gameState.addLog(`任务【${task.name}】完成！答对 ${game.correctCount}/${game.totalRounds} 题，获得 ${finalMerit} 功勋，${finalMoney} 金钱，${expGained} ${skillName}经验。`);

            gameView.advanceTwoMonths();
            gameState.currentTask = null;
            gameState.calligraphyGame = null;
            gameState.currentScene = GameScene.CITY_VIEW;
            gameView.renderAll();
        }
    }
};
