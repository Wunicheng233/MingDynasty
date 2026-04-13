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
            {sentence: "天生我材必有用，千金散___还复来", options: ["尽", "去", "毕"], answer: "尽"},
            {sentence: "会当___绝顶，一览众山小", options: ["登", "到", "临", "上"], answer: "临"},
            {sentence: "黄沙百战穿金___，不破楼兰终不还", options: ["甲", "戈", "袍", "铠"], answer: "甲"},
            {sentence: "苟利国家生___以，岂因祸福避趋之", options: ["死", "命", "之", "理"], answer: "死"},
            {sentence: "海内存知己，天涯___比邻", options: ["若", "如", "似", "比"], answer: "若"},
            {sentence: "欲把西湖比西___，淡妆浓抹总相宜", options: ["子", "施", "湖", "女"], answer: "子"},
            {sentence: "问君能有几___愁，恰似一江春水向东流", options: ["多", "许", "番", "般"], answer: "多"},
            {sentence: "春风又___江南岸，明月何时照我还", options: ["绿", "到", "入", "过"], answer: "绿"},
            {sentence: "不识庐山真___目，只缘身在此山中", options: ["面", "全", "本", "真"], answer: "面"},
            {sentence: "两岸猿声啼不___，轻舟已过万重山", options: ["停", "住", "尽", "断"], answer: "住"},
            {sentence: "无边落木萧___下，不尽长江滚滚来", options: ["萧", "瑟", "风", "淅"], answer: "萧"},
            {sentence: "万里悲秋常___客，百年多病独登台", options: ["作", "为", "客", "旅"], answer: "作"},
            {sentence: "出师未___身先死，长使英雄泪满襟", options: ["捷", "成", "功", "胜"], answer: "捷"},
            {sentence: "黄沙百战穿金甲，不破楼兰___不还", options: ["终", "誓", "也", "今"], answer: "终"},
            {sentence: "但使龙城飞___在，不教胡马度阴山", options: ["将", "骑", "军", "箭"], answer: "将"},
            {sentence: "醉卧沙场君___笑，古来征战几人回", options: ["莫", "休", "不", "请"], answer: "莫"},
            {sentence: "青海长云暗雪___，孤城遥望玉门关", options: ["山", "城", "国"], answer: "山"},
            {sentence: "大漠孤烟___，长河落日圆", options: ["直", "起", "升", "飞"], answer: "直"},
            {sentence: "劝君更___一杯酒，西出阳关无故人", options: ["进", "饮", "干", "尽"], answer: "进"},
            {sentence: "桃花潭水___千尺，不及汪伦送我情", options: ["深", "水", "潭", "花"], answer: "深"},
            {sentence: "举头望明___，低头思故乡", options: ["月", "天", "光", "盘"], answer: "月"}
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
            // 正常任务结算 - 使用新主命系统
            const template = getMissionTemplateById(gameState.currentTask.templateId);
            // 实际进度 = 目标值 * 完成率
            const actualProgress = Math.round(gameState.currentTask.targetValue * ratio);
            const success = actualProgress > 0;

            // 使用新的主命系统结算
            const result = gameState.completeMission(success, actualProgress);

            gameState.addLog(`【${template.name}】答对 ${game.correctCount}/${game.totalRounds} 题`);

            // 时间推进：按任务限时推进
            TimeSystem.advanceDays(gameState, template.timeLimitDays);

            gameState.calligraphyGame = null;
            gameState.currentScene = GameScene.CITY_VIEW;
            gameView.renderAll();
        }
    }
};
