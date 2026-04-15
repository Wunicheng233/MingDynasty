/**
 * 兵法小游戏 - 围棋死活题
 * 五道死活题，找出正确杀棋/活棋要点
 */

window.StrategyGame = {
    /**
     * 题库 - 死活题集合
     * 0=空, 1=黑, 2=白
     * 坐标: (x, y) x从左到右 0-8, y从上到下 0-8
     */
    problems: [
        // Lv1 基础题
        {
            name: '黑先杀白',
            description: '黑棋如何杀死角上白棋',
            difficulty: 1,
            board: [
                [1,1,1,1,1,0,0,0,0],
                [1,2,2,1,1,0,0,0,0],
                [1,2,0,2,1,0,0,0,0],
                [1,1,2,1,1,1,0,0,0],
                [1,1,2,2,1,1,0,0,0],
                [1,1,1,1,1,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0]
            ],
            answer: {x: 2, y: 2},
            note: '点在这里，缩小眼位即可杀白'
        },
        {
            name: '白先活棋',
            description: '白棋如何在黑角做出两眼',
            difficulty: 1,
            board: [
                [0,0,0,0,0,0,0,0,0],
                [0,1,1,1,0,0,0,0,0],
                [0,1,0,0,1,0,0,0,0],
                [0,1,2,2,1,0,0,0,0],
                [0,1,2,2,1,0,0,0,0],
                [0,0,1,1,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0]
            ],
            answer: {x: 2, y: 2},
            note: '走在这里做眼，简单活棋'
        },
        {
            name: '黑先杀白',
            description: '扳了之后，黑如何杀',
            difficulty: 1,
            board: [
                [0,1,1,1,1,1,0,0,0],
                [0,1,0,0,2,2,1,0,0],
                [0,1,1,1,2,2,1,0,0],
                [0,0,1,0,0,1,1,0,0],
                [0,0,0,1,1,1,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0]
            ],
            answer: {x: 3, y: 3},
            note: '点在中心点，白无法活'
        },
        {
            name: '白先活棋',
            description: '断头板六，怎么活',
            difficulty: 1,
            board: [
                [0,0,0,0,0,0,0,0,0],
                [0,1,1,1,0,0,0,0,0],
                [0,1,0,2,1,0,0,0,0],
                [0,1,2,2,1,0,0,0,0],
                [0,0,1,1,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0]
            ],
            answer: {x: 2, y: 2},
            note: '走在这里，断头板六活'
        },
        // Lv2 中等题
        {
            name: '黑先杀白',
            description: '黑棋如何杀死边上白棋',
            difficulty: 2,
            board: [
                [0,0,0,0,0,0,0,0,0],
                [0,1,1,1,1,0,0,0,0],
                [0,1,2,2,2,1,0,0,0],
                [0,1,2,0,2,1,0,0,0],
                [0,1,2,2,2,1,0,0,0],
                [0,0,1,1,1,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0]
            ],
            answer: {x: 3, y: 3},
            note: '点在中心点，破眼'
        },
        {
            name: '黑先杀白',
            description: '大猪嘴，扳点杀',
            difficulty: 2,
            board: [
                [0,0,0,0,0,0,0,0,0],
                [0,2,2,2,2,0,0,0,0],
                [0,1,1,1,1,2,0,0,0],
                [0,1,0,0,0,1,0,0,0],
                [0,1,0,0,0,1,0,0,0],
                [0,0,1,1,1,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0]
            ],
            answer: {x: 2, y: 3},
            note: '大猪嘴，扳点杀，点在这里。黑点后，白挡黑立，白无法做出两眼'
        },
        // Lv3 难题
        {
            name: '白先活棋',
            description: '三角板，找出活棋要点',
            difficulty: 3,
            board: [
                [0,0,0,0,0,0,0,0,0],
                [0,1,1,1,0,0,0,0,0],
                [0,1,2,2,2,0,0,0,0],
                [0,0,1,2,2,1,0,0,0],
                [0,0,0,1,2,1,0,0,0],
                [0,0,0,0,1,1,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0]
            ],
            answer: {x: 1, y: 3},
            note: '立在这里，形成直四活棋。此点确保两边必得其一，错走中间会被点杀'
        },
        {
            name: '黑先杀白',
            description: '刀五五，一刀下去',
            difficulty: 3,
            board: [
                [0,0,0,0,0,0,0,0,0],
                [0,0,1,1,1,0,0,0,0],
                [0,1,2,2,2,1,0,0,0],
                [0,1,2,2,2,2,1,0,0],
                [0,1,2,2,0,2,1,0,0],
                [0,0,1,1,1,1,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0]
            ],
            answer: {x: 3, y: 4},
            note: '中心点是要点'
        }
    ],

    /**
     * 启动游戏
     */
    start(gameView, gameState, title = null) {
        // 根据技能等级选题目难度
        let skillLevel = 1;
        if (gameState.currentTask && gameState.currentTask.requiredSkill) {
            skillLevel = SkillSystem.getSkillLevel(gameState, gameState.currentTask.requiredSkill);
        }

        // 随机选 3 道题，难度匹配技能等级（降低整体难度，更容易完成）
        Object.assign(gameState.strategyGame, {
            problems: this.selectProblems(this.problems, skillLevel, 3),
            current: 0,
            correct: 0,
            answered: false,
            showTutorial: true,
            isPractice: title !== null
        });

        this.renderTutorial(gameState, gameView, title);
    },

    /**
     * 渲染新手教程/入门说明
     */
    renderTutorial(gameState, gameView, title = null) {
        let headerTitle;
        if (title) {
            headerTitle = title;
        } else if (gameState.currentTask) {
            const template = getMissionTemplateById(gameState.currentTask.templateId);
            headerTitle = template.name;
        } else {
            headerTitle = '围棋死活练习';
        }

        let html = `
            <div class="strategy-tutorial" style="max-width: 800px; margin: 0 auto; padding: 10px 20px; max-height: 600px; overflow-y: auto;">
                <div class="tutorial-header" style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #8b4513; font-size: 28px; margin-bottom: 8px;">📖 围棋死活入门</h2>
                    <p style="color: #6b5b45; font-size: 16px;">不需要围棋基础，一分钟就能学会！</p>
                </div>

                <div class="tutorial-section" style="background: #f5f0e1; padding: 18px; border-radius: 8px; margin-bottom: 16px;">
                    <h3 style="color: #8b4513; margin-top: 0; font-size: 22px; margin-bottom: 10px;">什么是死活题？</h3>
                    <ul style="line-height: 1.7; color: #333; font-size: 18px; padding-left: 20px; margin: 0;">
                        <li><strong>黑先杀白</strong>：你下黑棋，想办法把整块白棋杀死</li>
                        <li><strong>白先活棋</strong>：你下白棋，想办法让整块白棋活下来</li>
                    </ul>
                </div>

                <div class="tutorial-section" style="background: #f5f0e1; padding: 18px; border-radius: 8px; margin-bottom: 16px;">
                    <h3 style="color: #8b4513; margin-top: 0; font-size: 22px; margin-bottom: 10px;">两个关键名词</h3>
                    <div style="line-height: 1.7; color: #333; font-size: 18px;">
                        <p style="margin: 0 0 8px 0;"><strong>「眼」</strong>：被围住的空白交叉点就是"眼"，是棋子的"气"</p>
                        <p style="margin: 0;"><strong>「两眼活棋」</strong>：一块棋必须要有两个分开的真眼才能活下来，这是围棋最基本的规则</p>
                    </div>
                </div>

                <div class="tutorial-section" style="background: #f5f0e1; padding: 18px; border-radius: 8px; margin-bottom: 16px;">
                    <h3 style="color: #8b4513; margin-top: 0; font-size: 22px; margin-bottom: 10px;">基本规则</h3>
                    <div style="line-height: 1.7; color: #333; font-size: 18px;">
                        <p>这不是完整的围棋对局，只需要你找出一步关键要点：</p>
                        <ul style="padding-left: 20px; margin: 8px 0;">
                            <li>黑棋 = 黑色圆形棋子，白棋 = 白色圆形棋子</li>
                            <li>你只需要点击棋盘下<strong>这一步</strong>，不需要继续往下走</li>
                            <li>答对了直接进入下一题，答错了会告诉你正确答案</li>
                        </ul>
                    </div>
                </div>

                <div class="tutorial-section" style="background: #f5f0e1; padding: 18px; border-radius: 8px; margin-bottom: 16px;">
                    <h3 style="color: #8b4513; margin-top: 0; font-size: 22px; margin-bottom: 10px;">怎么玩？</h3>
                    <ol style="line-height: 1.7; color: #333; font-size: 18px; padding-left: 25px; margin: 0;">
                        <li>题目会告诉你"黑先杀白"还是"白先活棋"</li>
                        <li>点击棋盘找出正确的下子位置</li>
                        <li>一共回答 <strong>3 道题</strong>，正确率越高奖励越好</li>
                    </ol>
                </div>

                <div class="tutorial-section" style="background: #f5f0e1; padding: 18px; border-radius: 8px; margin-bottom: 24px;">
                    <h3 style="color: #8b4513; margin-top: 0; font-size: 22px; margin-bottom: 10px;">小提示</h3>
                    <p style="line-height: 1.7; color: #333; font-size: 16px; margin: 0;">
                        每道题都给你提示了大致方向，就算不懂围棋，也可以试试猜猜看！
                    </p>
                </div>

                <div style="text-align: center; margin-bottom: 20px;">
                    <button class="btn primary-btn" id="start-btn" style="padding: 12px 32px; font-size: 18px; display: inline-block;">开始答题 →</button>
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;

        const startBtn = document.getElementById('start-btn');
        startBtn.addEventListener('click', () => {
            const game = gameState.strategyGame;
            game.showTutorial = false;
            this.render(gameState, gameView, title);
        });
    },

    /**
     * 按难度筛选并随机选题
     */
    selectProblems(allProblems, skillLevel, count) {
        // 根据等级调整难度范围，更友好的难度曲线
        let minDifficulty = 1;
        let maxDifficulty;
        if (skillLevel <= 1) {
            // Lv1 只出基础题，新手友好
            maxDifficulty = 1;
        } else if (skillLevel === 2) {
            // Lv2 可以出到中等题
            maxDifficulty = 2;
        } else {
            // Lv3 开放所有难度
            maxDifficulty = 3;
        }
        // 难度匹配技能等级
        let available = allProblems.filter(p => p.difficulty >= minDifficulty && p.difficulty <= maxDifficulty);
        // 如果不够，放宽限制
        if (available.length < count) {
            available = allProblems;
        }
        // 洗牌
        available = available.sort(() => Math.random() - 0.5);
        // 取前 count 题
        return available.slice(0, count);
    },

    /**
     * 渲染当前题目
     */
    render(gameState, gameView, title = null) {
        const game = gameState.strategyGame;
        const problem = game.problems[game.current];
        let headerTitle;
        if (title) {
            headerTitle = title;
        } else if (gameState.currentTask) {
            const template = getMissionTemplateById(gameState.currentTask.templateId);
            headerTitle = template.name;
        } else {
            headerTitle = '围棋死活练习';
        }

        let html = `
            <div class="strategy-go-header">
                <h2>${headerTitle}</h2>
                <p>${problem.name}：${problem.description}</p>
                <p style="color: #8b4513; margin: 10px 0;">第 ${game.current + 1} 题 / 共 ${game.problems.length} 题 · 答对：${game.correct}</p>
            </div>
            <div class="strategy-go-board" id="go-board" style="
                display: inline-block;
                border: 3px solid #8b4513;
                border-radius: 8px;
                padding: 5px;
                background: #deb88b;
                margin: 20px auto;
                text-align: center;
            ">
        `;

        // 绘制 9x9 棋盘
        // 棋盘格子是方形（地方），棋子是圆形（天圆），符合中国传统围棋文化
        for (let y = 0; y < 9; y++) {
            html += `<div style="display: flex;">`;
            for (let x = 0; x < 9; x++) {
                const cell = problem.board[y][x];
                const gridBg = '#deb88b';
                if (cell === 1) {
                    // 黑棋 - 圆形棋子
                    html += `<div class="go-cell" data-x="${x}" data-y="${y}" style="
                        width: 35px;
                        height: 35px;
                        border: 1px solid #8b4513;
                        background: ${gridBg};
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                    "><div style="
                        width: 28px;
                        height: 28px;
                        border-radius: 50%;
                        background: #2c2c2c;
                        box-shadow: 2px 2px 3px rgba(0,0,0,0.4);
                    "></div></div>`;
                } else if (cell === 2) {
                    // 白棋 - 圆形棋子
                    html += `<div class="go-cell" data-x="${x}" data-y="${y}" style="
                        width: 35px;
                        height: 35px;
                        border: 1px solid #8b4513;
                        background: ${gridBg};
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                    "><div style="
                        width: 28px;
                        height: 28px;
                        border-radius: 50%;
                        background: #ffffff;
                        box-shadow: 2px 2px 3px rgba(0,0,0,0.3);
                    "></div></div>`;
                } else {
                    // 空格子
                    html += `<div class="go-cell" data-x="${x}" data-y="${y}" style="
                        width: 35px;
                        height: 35px;
                        border: 1px solid #8b4513;
                        background: ${gridBg};
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                    "></div>`;
                }
            }
            html += `</div>`;
        }

        html += `
            </div>
            <div class="strategy-result" id="go-result" style="
                margin: 20px 0;
                padding: 15px;
                border-radius: 8px;
                background: #f5f0e1;
                display: ${game.answered ? 'block' : 'none'};
            ">
                <div id="go-message"></div>
                <button class="btn primary-btn" id="go-next-btn" style="margin-top: 15px;">下一题 →</button>
            </div>
            <div class="strategy-note" style="color: #666; font-size: 14px; margin-top: 10px;">
                提示：${problem.note}
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        this.bindEvents(gameState, gameView);
    },

    /**
     * 绑定点击事件
     */
    bindEvents(gameState, gameView) {
        document.querySelectorAll('.go-cell').forEach(cell => {
            cell.addEventListener('click', () => {
                const x = parseInt(cell.dataset.x);
                const y = parseInt(cell.dataset.y);
                this.onCellClick(x, y, gameState, gameView);
            });
        });

        const nextBtn = document.getElementById('go-next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextQuestion(gameState, gameView);
            });
        }
    },

    /**
     * 点击格子
     */
    onCellClick(x, y, gameState, gameView) {
        const game = gameState.strategyGame;
        const problem = game.problems[game.current];
        const correct = x === problem.answer.x && y === problem.answer.y;

        if (correct) {
            game.correct++;
        }
        game.answered = true;

        // 标记棋子
        const cell = document.querySelector(`.go-cell[data-x="${x}"][data-y="${y}"]`);
        if (correct) {
            cell.style.border = '3px solid #2ecc71';
            cell.style.backgroundColor = '#d4edda';
        } else {
            cell.style.border = '3px solid #e74c3c';
            cell.style.backgroundColor = '#f8d7da';
        }

        // 显示结果提示
        const resultDiv = document.getElementById('go-result');
        const msgDiv = document.getElementById('go-message');
        if (correct) {
            msgDiv.innerHTML = `<p style="color: green; font-weight: bold;">✔ 答对了！这确实是正确要点。</p>`;
        } else {
            msgDiv.innerHTML = `<p style="color: red; font-weight: bold;">✘ 答错了，正确答案已经标记在棋盘上。</p>`;
            // 标记正确答案 - 金色边框
            const correctCell = document.querySelector(`.go-cell[data-x="${problem.answer.x}"][data-y="${problem.answer.y}"]`);
            correctCell.style.border = '3px solid #f1c40f';
            correctCell.style.backgroundColor = '#fff3cd';
        }
        resultDiv.style.display = 'block';
    },

    /**
     * 下一题
     */
    nextQuestion(gameState, gameView) {
        const game = gameState.strategyGame;
        game.current++;
        game.answered = false;

        if (game.current >= game.problems.length) {
            // 全部答完，结算
            this.finish(gameState, gameView);
        } else {
            this.render(gameState, gameView);
        }
    },

    /**
     * 结算游戏
     */
    finish(gameState, gameView) {
        const game = gameState.strategyGame;
        const task = gameState.currentTask;
        const ratio = game.correct / game.problems.length;

        if (game.isPractice) {
            // 书院兵法练习 - 非任务，固定奖励兵法经验，消耗5天
            const expGained = Math.round(15 * ratio);
            gameState.addSkillExp('strategy', expGained);
            gameState.addLog(`围棋死活练习完成！答对 ${game.correct}/${game.problems.length} 题，获得 ${expGained} 兵法经验，消耗5天时间。`);
            gameState.advanceDays(5);
            gameState.strategyGame = null;

            // 显示结果页
            let html = `
                <div class="strategy-result" style="text-align: center; padding: 30px;">
                    <h2 style="font-size: 28px; margin-bottom: 20px; color: #8b4513;">围棋死活练习完成</h2>
                    <p style="font-size: 16px; margin-bottom: 20px;">答对 ${game.correct}/${game.problems.length} 题</p>
                    <div style="background: #f5f0e1; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                        <p>正确率：${Math.round(ratio * 100)}%</p>
                    </div>
                    <p>获得：${expGained} 兵法经验</p>
                    <div style="margin-top: 30px;">
                        <button class="btn primary-btn" id="strategy-done-btn">返回书院</button>
                    </div>
                </div>
            `;

            document.getElementById('farming-game-view').innerHTML = html;
            document.getElementById('strategy-done-btn').addEventListener('click', () => {
                // 返回设施场景
                gameState.currentScene = GameScene.FACILITY;
                gameView.renderAll();
            });
        } else {
            // 正常任务结算 - 使用新主命系统
            const template = getMissionTemplateById(gameState.currentTask.templateId);
            // 实际进度 = 目标值 * 完成率
            const actualProgress = Math.round(gameState.currentTask.targetValue * ratio);
            const success = actualProgress > 0;

            // 使用新的主命系统结算
            const result = gameState.completeMission(success, actualProgress);

            gameState.addLog(`【${template.name}】答对 ${game.correct}/${game.problems.length} 题`);

            // 显示结果页
            let html = `
                <div class="strategy-result" style="text-align: center; padding: 30px;">
                    <h2 style="font-size: 28px; margin-bottom: 20px; color: #8b4513;">围棋死活完成</h2>
                    <p style="font-size: 16px; margin-bottom: 20px;">答对 ${game.correct}/${game.problems.length} 题</p>
                    <div style="background: #f5f0e1; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                        <p>正确率：${Math.round(ratio * 100)}%</p>
                    </div>
                    <p>功勋奖励：${result.meritGained > 0 ? '+' : ''}${result.meritGained}</p>
                    <div style="margin-top: 30px;">
                        <button class="btn primary-btn" id="strategy-done-btn">返回</button>
                    </div>
                </div>
            `;

            document.getElementById('farming-game-view').innerHTML = html;
            document.getElementById('strategy-done-btn').addEventListener('click', () => {
                // 时间推进：按任务限时推进
                TimeSystem.advanceDays(gameState, template.timeLimitDays);
                gameState.strategyGame = null;
                gameState.currentScene = GameScene.CITY_VIEW;
                gameView.renderAll();
            });
        }
    }
};
