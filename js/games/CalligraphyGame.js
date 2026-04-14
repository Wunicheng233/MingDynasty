/**
 * 文墨填空小游戏（书法/文墨）
 * 选出正确的字填入古诗文/明代奏章名句
 * 典故：明代科举以文取士，平日需要练字背书，经典名句也要熟记
 */

window.CalligraphyGame = {
    /**
     * 题库：所有题目
     * 每个题目：
     * - sentence: 句子，___ 表示空缺
     * - options: 四个选项
     * - answer: 正确答案
     * - difficulty: 1-3 难度（1=简单常见，2=中等，3=生僻）
     */
    questionPool: [
        {sentence: "___横刀立马，誓诛元贼安天下", options: ["我", "吾", "俺", "余"], answer: "吾", difficulty: 1},
        {sentence: "广积___，缓称王", options: ["粮草", "粮食", "粮饷", "积谷"], answer: "粮草", difficulty: 1},
        {sentence: "濠州___起朱重八，十四年间定中华", options: ["城", "县", "乡", "野"], answer: "乡", difficulty: 1},
        {sentence: "大丈夫___能居人下哉", options: ["岂", "怎", "焉", "安"], answer: "岂", difficulty: 1},
        {sentence: "高筑墙，广积粮，___称王", options: ["缓", "慢", "不", "晚"], answer: "缓", difficulty: 1},
        {sentence: "___日依山尽，黄河入海流", options: ["白", "落", "夕", "红"], answer: "白", difficulty: 1},
        {sentence: "欲穷千里目，更___一层楼", options: ["上", "进", "登", "攀"], answer: "上", difficulty: 1},
        {sentence: "山重水复___无路，柳暗花明又一村", options: ["疑", "路", "皆", "尽"], answer: "疑", difficulty: 1},
        {sentence: "飞流直下___千尺，疑是银河落九天", options: ["三", "两", "九", "万"], answer: "三", difficulty: 1},
        {sentence: "天生我材必有用，千金散___还复来", options: ["尽", "去", "毕"], answer: "尽", difficulty: 1},
        {sentence: "会当___绝顶，一览众山小", options: ["登", "到", "临", "上"], answer: "临", difficulty: 2},
        {sentence: "黄沙百战穿金___，不破楼兰终不还", options: ["甲", "戈", "袍", "铠"], answer: "甲", difficulty: 1},
        {sentence: "苟利国家生___以，岂因祸福避趋之", options: ["死", "命", "之", "理"], answer: "死", difficulty: 2},
        {sentence: "海内存知己，天涯___比邻", options: ["若", "如", "似", "比"], answer: "若", difficulty: 1},
        {sentence: "欲把西湖比西___，淡妆浓抹总相宜", options: ["子", "施", "湖", "女"], answer: "子", difficulty: 1},
        {sentence: "问君能有几___愁，恰似一江春水向东流", options: ["多", "许", "番", "般"], answer: "多", difficulty: 1},
        {sentence: "春风又___江南岸，明月何时照我还", options: ["绿", "到", "入", "过"], answer: "绿", difficulty: 1},
        {sentence: "不识庐山真___目，只缘身在此山中", options: ["面", "全", "本", "真"], answer: "面", difficulty: 1},
        {sentence: "两岸猿声啼不___，轻舟已过万重山", options: ["停", "住", "尽", "断"], answer: "住", difficulty: 1},
        {sentence: "无边落木萧___下，不尽长江滚滚来", options: ["萧", "瑟", "风", "淅"], answer: "萧", difficulty: 2},
        {sentence: "万里悲秋常___客，百年多病独登台", options: ["作", "为", "客", "旅"], answer: "作", difficulty: 2},
        {sentence: "出师未___身先死，长使英雄泪满襟", options: ["捷", "成", "功", "胜"], answer: "捷", difficulty: 2},
        {sentence: "黄沙百战穿金甲，不破楼兰___不还", options: ["终", "誓", "也", "今"], answer: "终", difficulty: 1},
        {sentence: "但使龙城飞___在，不教胡马度阴山", options: ["将", "骑", "军", "箭"], answer: "将", difficulty: 1},
        {sentence: "醉卧沙场君___笑，古来征战几人回", options: ["莫", "休", "不", "请"], answer: "莫", difficulty: 1},
        {sentence: "青海长云暗雪___，孤城遥望玉门关", options: ["山", "城", "国"], answer: "山", difficulty: 1},
        {sentence: "大漠孤烟___，长河落日圆", options: ["直", "起", "升", "飞"], answer: "直", difficulty: 1},
        {sentence: "劝君更___一杯酒，西出阳关无故人", options: ["进", "饮", "干", "尽"], answer: "进", difficulty: 1},
        {sentence: "桃花潭水___千尺，不及汪伦送我情", options: ["深", "水", "潭", "花"], answer: "深", difficulty: 1},
        {sentence: "举头望明___，低头思故乡", options: ["月", "天", "光", "盘"], answer: "月", difficulty: 1},
        {sentence: "国破山河___，城春草木深", options: ["在", "破", "尽", "存"], answer: "在", difficulty: 2},
        {sentence: "烽火连三月，家书___万金", options: ["抵", "值", "换", "得"], answer: "抵", difficulty: 2},
        {sentence: "安得广厦千万___，大庇天下寒士俱欢颜", options: ["间", "所", "栋", "间"], answer: "间", difficulty: 2},
        {sentence: "___当凌云霄，直上数千尺", options: ["会当", "应当", "当须", "应为"], answer: "会当", difficulty: 3},
        {sentence: "___怕云崖暖，大渡桥横铁索寒", options: ["金沙", "金沙", "江水", "乌江"], answer: "金沙", difficulty: 2},
        {sentence: "寄意寒星荃不察___，我以我血荐轩辕", options: ["，", "。", "！", "?"], answer: "，", difficulty: 3},
        {sentence: "横看成岭___成峰，远近高低各不同", options: ["侧", "纵", "横", "变"], answer: "侧", difficulty: 2},
        {sentence: "不识庐山真面目，___缘身在此山中", options: ["只", "为", "因", "只缘"], answer: "只", difficulty: 2},
        {sentence: "欲把西湖比西子，___妆浓抹总相宜", options: ["淡", "淡抹", "淡妆", "轻"], answer: "淡", difficulty: 2},
        {sentence: "山重水复疑无路，柳暗花明___一村", options: ["又", "重", "得", "见"], answer: "又", difficulty: 2},
        {sentence: "春蚕到死丝方___，蜡炬成灰泪始干", options: ["尽", "完", "了", "干"], answer: "尽", difficulty: 3},
        {sentence: "___沉舟侧畔千帆过，病树前头万木春", options: ["沉舟", "今日", "沉舟畔", "怀旧"], answer: "沉舟", difficulty: 3}
    ],

    /**
     * 启动游戏 - 先显示说明
     */
    start(gameView, gameState, title = null) {
        const headerTitle = title || (gameState.currentTask ? gameState.currentTask.name : '文墨填空');

        let html = `
            <div style="max-height: 70vh; overflow-y: auto; padding: 0 5px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #8b4513; font-size: 28px; margin-bottom: 8px;">✍️ 文墨填空</h2>
                    <p style="color: #6b5b45; font-size: 16px;">补全经典古诗文，选出正确的字填入空缺！</p>
                </div>

                <div style="background: #f5f0e1; padding: 18px; border-radius: 8px; margin-bottom: 16px;">
                    <h3 style="color: #8b4513; margin-top: 0; font-size: 22px; margin-bottom: 10px;">游戏规则</h3>
                    <ul style="line-height: 1.7; color: #333; font-size: 18px; padding-left: 20px; margin: 0;">
                        <li>一共 <strong>5轮</strong>，每轮一句古诗文缺一个字</li>
                        <li>四个选项选出正确的字填入空缺</li>
                        <li>选对一分，选错不得分，五题结束结算</li>
                        <li>等级越高 → 题目越难，生僻字越多</li>
                    </ul>
                </div>

                <div style="text-align: center; margin-top: 20px;">
                    <button class="btn primary-btn" id="start-calligraphy-btn" style="padding: 12px 40px; font-size: 18px;">开始答题!</button>
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        document.getElementById('start-calligraphy-btn').addEventListener('click', () => {
            this.startActualGame(gameView, gameState, title);
        });
    },

    /**
     * 真正开始答题，按难度抽题
     */
    startActualGame(gameView, gameState, title = null) {
        const task = gameState.currentTask;

        // 根据技能等级调整抽题
        // Lv1: 全抽难度1; Lv2: 2题难度1 + 3题难度2; Lv3: 2题难度2 + 3题难度3
        let skillLevel = 1;
        if (task && task.requiredSkill) {
            skillLevel = window.SkillSystem.getSkillLevel(gameState, task.requiredSkill);
        }
        skillLevel = Math.max(1, Math.min(3, skillLevel));

        // 按难度分组
        const easyQuestions = this.questionPool.filter(q => q.difficulty === 1);
        const mediumQuestions = this.questionPool.filter(q => q.difficulty === 2);
        const hardQuestions = this.questionPool.filter(q => q.difficulty === 3);

        // 根据等级抽题
        let questions = [];
        if (skillLevel === 1) {
            // Lv1: 5题全简单
            const shuffled = [...easyQuestions].sort(() => Math.random() - 0.5);
            questions = shuffled.slice(0, 5);
        } else if (skillLevel === 2) {
            // Lv2: 2简单 + 3中等
            const shuffledEasy = [...easyQuestions].sort(() => Math.random() - 0.5);
            const shuffledMedium = [...mediumQuestions].sort(() => Math.random() - 0.5);
            questions = [...shuffledEasy.slice(0, 2), ...shuffledMedium.slice(0, 3)];
        } else {
            // Lv3: 2中等 + 3困难
            const shuffledMedium = [...mediumQuestions].sort(() => Math.random() - 0.5);
            const shuffledHard = [...hardQuestions].sort(() => Math.random() - 0.5);
            questions = [...shuffledMedium.slice(0, 2), ...shuffledHard.slice(0, 3)];
        }

        // 初始化游戏状态
        Object.assign(gameState.calligraphyGame, {
            currentRound: 0,
            totalRounds: 5,
            correctCount: 0,
            questions: questions,
            isPractice: title !== null
        });

        this.renderRound(gameState, gameView);
    },

    /**
     * 渲染当前题目
     */
    renderRound(gameState, gameView) {
        const game = gameState.calligraphyGame;
        const q = game.questions[game.currentRound];
        const headerTitle = game.isPractice ? '文墨填空练习' : (gameState.currentTask ? gameState.currentTask.name : '文墨填空');

        let html = `
            <div style="max-height: 70vh; overflow-y: auto; padding: 0 5px;">
                <div class="calligraphy-header" style="margin-bottom: 15px;">
                    <h2>${headerTitle}</h2>
                    <p>第 <strong>${game.currentRound + 1}</strong> / ${game.totalRounds} 题 &nbsp; 已答对: <strong>${game.correctCount}</strong></p>
                </div>
                <div class="calligraphy-question" style="background: #f5f0e1; padding: 20px; border-radius: 8px; margin: 15px 0;">
                    <div class="calligraphy-sentence" style="font-size: 24px; text-align: center; line-height: 2;">
                        ${q.sentence.replace('___', '<span style="display: inline-block; width: 80px; text-align: center; text-decoration: underline; color: #8b4513; font-weight: bold;">___</span>')}
                    </div>
                </div>
                <div class="calligraphy-options" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 15px 0;">
                    ${q.options.map(opt => `
                        <button class="btn calligraphy-option" style="
                            padding: 12px;
                            font-size: 18px;
                            background: #d2b48c;
                            border: 2px solid #8b4513;
                            border-radius: 6px;
                            color: #2c3e50;
                        ">${opt}</button>
                    `).join('')}
                </div>
                <div class="calligraphy-result" id="calligraphy-result" style="min-height: 40px; border-radius: 6px;"></div>
            </div>
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
        const q = game.questions[game.currentRound];
        const correct = answer === q.answer;
        if (correct) game.correctCount++;

        const resultEl = document.getElementById('calligraphy-result');
        resultEl.innerHTML = correct
            ? `<div style="background: #e8f5e8; color: #2e7d32; padding: 10px; border-radius: 5px;"><strong>✔ 正确！</strong></div>`
            : `<div style="background: #ffebee; color: #c62828; padding: 10px; border-radius: 5px;"><strong>✘ 错误，</strong> 正确答案是：${q.answer}</div>`;

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

        let resultTitle, resultDesc;
        if (game.correctCount === 5) {
            resultTitle = '🎉 全对！';
            resultDesc = '五题全对，饱读诗书，经典名句烂熟于心！';
        } else if (game.correctCount >= 3) {
            resultTitle = '✅ 不错！';
            resultDesc = `答对 ${game.correctCount}/${game.totalRounds} 题，诗书熟稔，尚可再战！`;
        } else if (game.correctCount >= 1) {
            resultTitle = '⚠ 有待提高';
            resultDesc = `只答对 ${game.correctCount}/${game.totalRounds} 题，还要多背书哦！`;
        } else {
            resultTitle = '✘ 全错';
            resultDesc = '一题没对，今天不在状态，改天再来吧！';
        }

        if (game.isPractice) {
            // 国子监练习 - 非任务，固定奖励文墨经验，消耗5天
            const expGained = Math.round(10 * ratio);
            gameState.addSkillExp('calligraphy', expGained);
            gameState.addLog(`文墨填空练习完成：${resultTitle} 答对 ${game.correctCount}/${game.totalRounds} 题，获得 ${expGained} 文墨经验，消耗5天时间。`);
            gameState.advanceDays(5);
            gameState.calligraphyGame = null;

            let html = `
                <div class="calligraphy-result" style="text-align: center; padding: 30px; max-height: 70vh; overflow-y: auto;">
                    <h2 style="font-size: 28px; margin-bottom: 20px; color: #8b4513;">${resultTitle}</h2>
                    <p style="font-size: 16px; margin-bottom: 30px;">${resultDesc}</p>
                    <div style="background: #f5f0e1; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                        <p>答对：${game.correctCount} / ${game.totalRounds} 题</p>
                    </div>
                    <p>获得：${expGained} 文墨经验</p>
                    <div style="margin-top: 30px;">
                        <button class="btn primary-btn" id="calligraphy-done-btn">返回国子监</button>
                    </div>
                </div>
            `;

            document.getElementById('farming-game-view').innerHTML = html;
            document.getElementById('calligraphy-done-btn').addEventListener('click', () => {
                // 返回设施场景
                gameState.currentScene = window.GameScene.FACILITY;
                gameView.renderAll();
            });
        } else {
            // 正常任务结算 - 使用新主命系统
            const template = getMissionTemplateById(gameState.currentTask.templateId) || gameState.currentTask;
            // 实际进度 = 目标值 * 完成率
            const actualProgress = Math.round(gameState.currentTask.targetValue * ratio);
            const success = actualProgress > 0;

            // 使用新的主命系统结算
            const result = gameState.completeMission(success, actualProgress);

            gameState.addLog(`【${template.name}】${resultTitle} 答对 ${game.correctCount}/${game.totalRounds} 题`);

            let html = `
                <div class="calligraphy-result" style="text-align: center; padding: 30px; max-height: 70vh; overflow-y: auto;">
                    <h2 style="font-size: 28px; margin-bottom: 20px; color: #8b4513;">${resultTitle}</h2>
                    <p style="font-size: 16px; margin-bottom: 30px;">${resultDesc}</p>
                    <div style="background: #f5f0e1; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                        <p>答对：${game.correctCount} / ${game.totalRounds} 题</p>
                    </div>
                    <p>功勋奖励：${result.meritGained > 0 ? '+' : ''}${result.meritGained}</p>
                    <div style="margin-top: 30px;">
                        <button class="btn primary-btn" id="calligraphy-done-btn">交卷返回</button>
                    </div>
                </div>
            `;

            document.getElementById('farming-game-view').innerHTML = html;
            document.getElementById('calligraphy-done-btn').addEventListener('click', () => {
                // 时间推进：按任务限时推进
                window.TimeSystem.advanceDays(gameState, template.timeLimitDays);
                gameState.calligraphyGame = null;
                gameState.currentScene = window.GameScene.CITY_VIEW;
                gameView.renderAll();
            });
        }
    }
};
