/**
 * 明律断案小游戏（律政）
 * 找出证词矛盾 + 选择正确法律条文定罪
 */

window.LawGame = {
    /**
     * 启动游戏
     */
    start(gameView, gameState) {
        const task = gameState.currentTask;

        // 案件题库
        const casePool = [
            {
                title: '财主失窃案',
                description: '财主王五报案称家中失窃，丢失白银百两。以下是各方证词，请找出矛盾之处，并选择合适的法律条文定罪。',
                plaintiff: '小人家中昨夜失窃，丢了白银一百两，门窗都被撬开，肯定是惯偷所为！',
                defendant: '小人昨晚路过王家，并没有偷东西，只是捡到了一块银子。',
                witness: '我昨晚起夜，看见一个黑衣人从王家后墙跳出来，身材胖胖的，和被告差不多。',
                statements: [
                    '小人门窗都被撬开',
                    '小人从不到王家后院',
                    '小人丢失白银百两整',
                    '昨晚月色朦朦看不清',
                    '后墙没有攀爬痕迹',
                    '捡到银子一两而已'
                ],
                contradiction: [0, 4], // 门窗被撬开 vs 后墙没痕迹
                laws: [
                    {text: '窃盗得财五十两以上，杖一百流三千里', correct: false},
                    {text: '窃盗得财一百两以上，绞监候', correct: true},
                    {text: '拾得遗失物不还者，笞四十', correct: false},
                    {text: '诬告者反坐，加一等定罪', correct: false}
                ]
            },
            {
                title: '杀人害命案',
                description: '张二狗被人杀死在郊外，嫌疑人李三被抓，各方证词如下，请断案。',
                plaintiff: '李三杀了我丈夫，他还抢走了我丈夫身上的铜钱，一定是他！',
                defendant: '我没杀人，我只是和他吵了一架，然后我就走了！',
                witness: '我看见李三拿着一把带血的刀，从东边跑来，身上有血。',
                statements: [
                    '死者身上刀伤为一刀致命',
                    '凶手逃走时向东跑去',
                    '李三往西逃走了',
                    '死者钱袋还在身上',
                    '我没带刀上山',
                    '血迹溅满了凶手衣襟'
                ],
                contradiction: [1, 2], // 向东跑 vs 向西跑
                laws: [
                    {text: '斗殴杀人者斩，故杀者绞', correct: true},
                    {text: '过失杀者，依律收赎', correct: false},
                    {text: '谋杀祖父母父母者，凌迟处死', correct: false},
                    {text: '抢夺财物者，杖八十徒三年', correct: false}
                ]
            },
            {
                title: '农田争讼案',
                description: '赵六声称邻居占了自己三亩地，双方各执一词，请断案。',
                plaintiff: '这三亩地本来就是我的，邻居去年犁地越界，占了我的田！',
                defendant: '这地本来就是我的，是他多年前占了我的，我只是收回来！',
                witness: '我在这里住五十年了，这块地一直就是赵六家的。',
                statements: [
                    '小人有地契为凭',
                    '这块地是祖传的',
                    '地契四至写得分明',
                    '邻居十年前买了我一亩',
                    '边界本就不清不楚',
                    '我从未占过他田地'
                ],
                contradiction: [2, 4], // 四至分明 vs 边界不清
                laws: [
                    {text: '田土不清者，责令退还，笞二十', correct: true},
                    {text: '欺隐田粮者，一亩至五亩，笞四十', correct: false},
                    {text: '占耕他人田土，一亩笞十', correct: false},
                    {text: '盗卖他人田宅者，杖八十', correct: false}
                ]
            }
        ];

        // 随机选一个案件
        const randomCase = casePool[Math.floor(Math.random() * casePool.length)];

        // 打乱证词顺序
        const statements = [...randomCase.statements];
        statements.sort(() => Math.random() - 0.5);

        // 初始化游戏状态
        gameState.lawGame = {
            case: randomCase,
            statements: statements,
            selectedStatements: [],
            selectedLaw: null,
            correctContradiction: randomCase.contradiction.map(idx => randomCase.statements[idx]),
            step: 'select_contradiction' // select_contradiction -> select_law -> result
        };

        this.renderContradictionStep(gameState, gameView);
    },

    /**
     * 渲染第一步：选择矛盾证词
     */
    renderContradictionStep(gameState, gameView) {
        const game = gameState.lawGame;
        const task = gameState.currentTask;

        let html = `
            <div class="law-header">
                <h2>${task.name} - ${game.case.title}</h2>
                <p>${game.case.description}</p>
            </div>
            <div class="law-case" style="background: #f5f0e1; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <div style="margin-bottom: 10px;">
                    <strong style="color: #8b4513;">原告说：</strong> ${game.case.plaintiff}
                </div>
                <div style="margin-bottom: 10px;">
                    <strong style="color: #8b4513;">被告说：</strong> ${game.case.defendant}
                </div>
                <div>
                    <strong style="color: #8b4513;">证人说：</strong> ${game.case.witness}
                </div>
            </div>
            <div class="law-instructions" style="margin: 15px 0;">
                <p><strong>第一步：找出两句话相互矛盾，请点击选择：</strong></p>
                <p style="color: #666; font-size: 14px;">已选：<span id="selected-count">0</span>/2</p>
            </div>
            <div class="law-statements" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0;">
        `;

        game.statements.forEach((stmt, idx) => {
            html += `
                <button class="btn stmt-btn" data-idx="${idx}" style="text-align: left; white-space: normal; height: auto; padding: 12px;">${stmt}</button>
            `;
        });

        html += `
            </div>
            <div class="law-actions" style="margin-top: 20px;">
                <button class="btn primary-btn" id="law-next-btn" disabled>下一步 →</button>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        this.bindContradictionEvents(gameState, gameView);
    },

    /**
     * 绑定事件
     */
    bindContradictionEvents(gameState, gameView) {
        const game = gameState.lawGame;
        document.querySelectorAll('.stmt-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (game.step === 'select_contradiction') {
                    this.onStatementClick(parseInt(btn.dataset.idx), gameState);
                }
            });
        });

        const nextBtn = document.getElementById('law-next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.goToStep('select_law', gameState, gameView);
            });
        }
    },

    /**
     * 点击证词
     */
    onStatementClick(idx, gameState) {
        const game = gameState.lawGame;
        const stmt = game.statements[idx];
        const btn = document.querySelector(`.stmt-btn[data-idx="${idx}"]`);

        // 已经选中，取消选择
        if (game.selectedStatements.includes(stmt)) {
            game.selectedStatements = game.selectedStatements.filter(s => s !== stmt);
            btn.style.background = '';
            btn.style.borderColor = '';
        } else {
            // 不超过两个
            if (game.selectedStatements.length >= 2) return;
            game.selectedStatements.push(stmt);
            btn.style.background = '#e8dcc8';
            btn.style.borderColor = '#8b4513';
        }

        // 更新计数
        document.getElementById('selected-count').textContent = game.selectedStatements.length;

        // 启用下一步按钮
        const nextBtn = document.getElementById('law-next-btn');
        if (nextBtn) {
            nextBtn.disabled = game.selectedStatements.length !== 2;
        }
    },

    /**
     * 进入下一步
     */
    goToStep(step, gameState, gameView) {
        const game = gameState.lawGame;
        game.step = step;

        if (step === 'select_law') {
            let html = `
                <div class="law-header">
                    <h2>${gameState.currentTask.name} - ${game.case.title}</h2>
                    <p>你已选出矛盾证词，请选择应当适用的《大明律》条文：</p>
                </div>
                <div class="law-case" style="background: #f5f0e1; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p><strong>你找到的矛盾：</strong></p>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        ${game.selectedStatements.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                </div>
                <div class="law-laws" style="display: flex; flex-direction: column; gap: 10px; margin: 15px 0;">
            `;

            game.case.laws.forEach((law, idx) => {
                html += `
                    <button class="btn law-btn" data-idx="${idx}" style="text-align: left; white-space: normal; height: auto; padding: 12px;">${law.text}</button>
                `;
            });

            html += `
                </div>
                <div class="law-actions" style="margin-top: 20px;">
                    <button class="btn secondary-btn" id="law-back-btn">← 返回上一步</button>
                    <button class="btn primary-btn" id="law-submit-btn" disabled>提交判决</button>
                </div>
            `;

            document.getElementById('farming-game-view').innerHTML = html;

            document.getElementById('law-back-btn').addEventListener('click', () => {
                this.start(gameView, gameState);
            });

            document.querySelectorAll('.law-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.onLawSelect(parseInt(btn.dataset.idx), gameState);
                });
            });

            document.getElementById('law-submit-btn').addEventListener('click', () => {
                this.finish(gameState, gameView);
            });
        }
    },

    /**
     * 选择法律
     */
    onLawSelect(idx, gameState) {
        const game = gameState.lawGame;
        game.selectedLaw = idx;

        document.querySelectorAll('.law-btn').forEach(btn => {
            btn.style.background = '';
            btn.style.borderColor = '';
        });

        const selectedBtn = document.querySelector(`.law-btn[data-idx="${idx}"]`);
        selectedBtn.style.background = '#e8dcc8';
        selectedBtn.style.borderColor = '#8b4513';

        document.getElementById('law-submit-btn').disabled = false;
    },

    /**
     * 结算游戏
     */
    finish(gameState, gameView) {
        const game = gameState.lawGame;
        const task = gameState.currentTask;

        // 判分：两个矛盾都对 + 法律正确 = 100%，只对一个 = 50%，全错 = 20%
        let correctCount = 0;

        // 检查矛盾是否正确（两个都要对）
        const contradictionCorrect =
            game.selectedStatements.includes(game.correctContradiction[0]) &&
            game.selectedStatements.includes(game.correctContradiction[1]);

        if (contradictionCorrect) correctCount++;

        // 检查法律是否正确
        const lawCorrect = game.case.laws[game.selectedLaw]?.correct;
        if (lawCorrect) correctCount++;

        let ratio;
        if (correctCount === 2) ratio = 1.0;
        else if (correctCount === 1) ratio = 0.5;
        else ratio = 0.2;

        const finalMerit = Math.round(task.rewardMerit * ratio);
        const finalMoney = Math.round(task.rewardMoney * ratio);
        const expGained = Math.round(15 * ratio);

        let resultTitle, resultDesc;
        if (correctCount === 2) {
            resultTitle = '✔ 断案正确！';
            resultDesc = '你成功找出了证词矛盾，并适用了正确的法律条文，断案公正严明！';
        } else if (correctCount === 1) {
            resultTitle = '⚠ 部分正确';
            resultDesc = '你找对了一部分，但仍有疏漏，虽不能全功，亦可圈可点。';
        } else {
            resultTitle = '✘ 断案有误';
            resultDesc = '你没有找出真正的矛盾，也选错了法律，此案恐成冤假错案。';
        }

        gameState.merit += finalMerit;
        gameState.money += finalMoney;
        if (task.requiredSkill) {
            gameState.addSkillExp(task.requiredSkill, expGained);
        }

        gameState.checkRolePromotion();
        const skillName = getSkillById(task.requiredSkill)?.name || '';
        gameState.addLog(`任务【${task.name}】完成！${resultTitle} 获得 ${finalMerit} 功勋，${finalMoney} 金钱，${expGained} ${skillName}经验。`);

        // 显示结果页
        let html = `
            <div class="law-result" style="text-align: center; padding: 30px;">
                <h2 style="font-size: 28px; margin-bottom: 20px; color: #8b4513;">${resultTitle}</h2>
                <p style="font-size: 16px; margin-bottom: 30px;">${resultDesc}</p>
                <div style="background: #f5f0e1; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: left;">
                    <p><strong>正确答案：</strong></p>
                    <p style="color: #8b4513; margin: 10px 0;">▶ 矛盾证词：${game.correctContradiction[0]} 与 ${game.correctContradiction[1]}</p>
                    <p style="color: #8b4513; margin: 10px 0;">▶ 正确法律：${game.case.laws.find(l => l.correct).text}</p>
                </div>
                <p style="margin: 10px 0;">获得：${finalMerit} 功勋，${finalMoney} 金钱</p>
                <div style="margin-top: 30px;">
                    <button class="btn primary-btn" id="law-done-btn">结案返回</button>
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        document.getElementById('law-done-btn').addEventListener('click', () => {
            gameView.advanceTwoMonths();
            gameState.currentTask = null;
            gameState.lawGame = null;
            gameState.currentScene = GameScene.CITY_VIEW;
            gameView.renderAll();
        });
    }
};
