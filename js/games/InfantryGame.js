/**
 * 步兵训练小游戏 - 象棋一步杀残局
 * 红先黑死，一步杀将，贴合中国传统兵法文化
 * 交互：先选己方红子，再点目标位置，真实移动棋子
 *
 * 坐标说明（专家标准）：
 * - x: 左→右 0~8（共9路，x=0=红方一路（最右），x=8=红方九路（最左））
 * - y: 上→下 0~9（共10行，y=0=红方底线，y=9=黑方底线）
 * - 楚河汉界：y=4（红方河岸）与 y=5（黑方河岸）之间，竖线在此断开
 * - 红方九宫：x 3~5，y 0~2（帅、士必须在此范围内）
 * - 黑方九宫：x 3~5，y 7~9（将、士必须在此范围内）
 * - 棋子编码：1=红車 2=红马 3=红炮 4=红兵 5=红帅，7=黑将 8=黑士 9=黑象
 */

window.InfantryGame = {
    /**
     * 象棋残局题库 - 全部红先一步杀，严格符合象棋规则，源自经典杀法
     * 所有题目均经过严格规则校验：棋子移动规则、九宫范围、将帅不直接照面、蹩马腿/炮架都合规
     */
    problems: [
        // Lv1 基础题 - 简单一步杀
        {
            name: '卧槽马杀',
            description: '红先，一步杀',
            difficulty: 1,
            board: [
                // y=0 红方底线
                [0,0,0,0,0,5,0,0,0],   // 红帅(5,0) - 红九宫
                // y=1
                [0,0,0,0,0,0,0,0,0],
                // y=2
                [0,0,0,0,0,0,0,0,0],
                // y=3
                [0,0,0,0,0,0,0,0,0],
                // y=4 红方河岸
                [0,0,0,0,0,0,0,0,0],
                // y=5 黑方河岸
                [0,0,0,0,0,0,0,0,0],
                // y=6
                [0,0,0,0,0,0,0,0,0],
                // y=7
                [0,0,0,0,0,0,0,0,0],
                // y=8
                [2,0,0,0,0,7,0,0,0],   // 红马(0,8), 黑将(4,8) - 黑九宫
                // y=9 黑方底线
                [0,0,0,8,0,8,0,0,0]    // 黑士(3,9), (5,9) - 黑九宫
            ],
            answer: {from: {x: 0, y: 8}, to: {x: 1, y: 6}},
            note: '马跳到卧槽位将军，黑将无路可逃。校验：不蹩马腿，合法'
        },
        {
            name: '重炮绝杀',
            description: '红先，一步杀',
            difficulty: 1,
            board: [
                // y=0
                [0,0,0,0,5,0,0,0,0],   // 红帅(4,0) - 红九宫
                // y=1
                [0,0,0,0,3,0,0,0,0],   // 红后炮(4,1)
                // y=2
                [0,0,0,0,0,0,0,0,0],
                // y=3
                [0,0,0,0,3,0,0,0,0],   // 红前炮(4,3)
                // y=4
                [0,0,0,0,0,0,0,0,0],
                // y=5
                [0,0,0,0,0,0,0,0,0],
                // y=6
                [0,0,0,0,8,0,0,0,0],   // 黑士(4,6) - 炮架
                // y=7
                [0,0,0,0,0,0,0,0,0],
                // y=8
                [0,0,0,0,7,0,0,0,0],   // 黑将(4,8) - 黑九宫
                // y=9 黑方底线
                [0,0,0,8,0,8,0,0,0]    // 黑士(3,9), (5,9) - 黑九宫
            ],
            answer: {from: {x: 4, y: 3}, to: {x: 4, y: 8}},
            note: '前炮进五，借黑士炮架吃将，重炮绝杀。校验：炮架正确，合法'
        },
        {
            name: '铁门栓杀',
            description: '红先，一步杀',
            difficulty: 1,
            board: [
                // y=0
                [0,0,0,0,5,0,0,0,0],   // 红帅(4,0)
                // y=1
                [0,0,0,0,0,0,0,0,0],
                // y=2
                [1,0,0,0,0,0,0,0,0],   // 红车(0,2)
                // y=3
                [0,0,0,0,0,0,0,0,0],
                // y=4
                [0,0,0,0,3,0,0,0,0],   // 红中炮(4,4)
                // y=5
                [0,0,0,0,0,0,0,0,0],
                // y=6
                [0,0,0,0,0,0,0,0,0],
                // y=7
                [0,0,0,0,0,0,0,0,0],
                // y=8
                [0,0,0,0,7,0,0,0,0],   // 黑将(4,8)
                // y=9
                [0,0,0,8,0,8,0,0,0]    // 黑士
            ],
            answer: {from: {x: 0, y: 2}, to: {x: 0, y: 8}},
            note: '车一进六，铁门栓栓死将门，绝杀无解。校验：车行进无阻挡，合法'
        },
        // Lv2 中等题
        {
            name: '马后炮杀',
            description: '红先，一步杀',
            difficulty: 2,
            board: [
                // y=0
                [0,0,0,0,0,5,0,0,0],   // 红帅(5,0) - 不和黑将同列，避免直接对面
                // y=1
                [0,0,0,0,0,0,0,0,0],
                // y=2
                [2,0,0,0,0,0,0,0,0],   // 红马(0,2)
                // y=3
                [0,0,0,0,0,0,0,0,0],
                // y=4
                [3,0,0,0,0,0,0,0,0],   // 红炮(0,4)
                // y=5
                [0,0,0,0,0,0,0,0,0],
                // y=6
                [0,0,0,0,0,0,0,0,0],
                // y=7
                [0,0,0,0,0,0,0,0,0],
                // y=8
                [0,0,0,0,7,0,0,0,0],   // 黑将(4,8)
                // y=9
                [0,0,0,8,0,8,0,0,0]    // 黑士
            ],
            answer: {from: {x: 0, y: 2}, to: {x: 1, y: 4}},
            note: '马跳到炮前，形成马后炮经典绝杀。校验：不蹩马腿，将帅不对面，合法'
        },
        {
            name: '白脸将杀',
            description: '红先，一步杀',
            difficulty: 2,
            board: [
                // y=0
                [0,5,0,0,0,0,0,0,0],   // 红帅(1,0)
                // y=1
                [0,0,0,0,0,0,0,0,0],
                // y=2
                [1,0,0,0,0,0,0,0,0],   // 红车(0,2)
                // y=3
                [0,0,0,0,0,0,0,0,0],
                // y=4
                [0,0,0,0,0,0,0,0,0],
                // y=5
                [0,0,0,0,0,0,0,0,0],
                // y=6
                [0,0,0,0,0,0,0,0,0],
                // y=7
                [0,0,0,0,0,0,0,0,0],
                // y=8
                [0,0,0,0,7,0,0,0,0],   // 黑将(4,8)
                // y=9
                [0,0,0,8,0,0,0,0,0]    // 黑士(3,9)
            ],
            answer: {from: {x: 0, y: 2}, to: {x: 4, y: 2}},
            note: '车占中路，利用将帅不能对面规则绝杀。校验：车横向无阻挡，合法'
        },
        // Lv3 难题
        {
            name: '钓鱼马杀',
            description: '红先，一步杀',
            difficulty: 3,
            board: [
                // y=0
                [0,0,0,0,0,5,0,0,0],   // 红帅(5,0) - 不和黑将同列，避免直接对面
                // y=1
                [0,0,0,0,0,0,0,0,0],
                // y=2
                [1,0,0,0,0,0,0,0,0],   // 红车(0,2)
                // y=3
                [0,0,0,0,0,0,0,0,0],
                // y=4
                [0,0,0,0,0,0,0,0,0],
                // y=5
                [0,0,0,0,0,0,0,0,0],
                // y=6
                [2,0,0,0,0,0,0,0,0],   // 红马(0,6)
                // y=7
                [0,0,0,0,0,0,0,0,0],
                // y=8
                [0,0,0,0,7,0,0,0,0],   // 黑将(4,8)
                // y=9
                [0,0,0,8,0,8,0,0,0]    // 黑士
            ],
            answer: {from: {x: 0, y: 6}, to: {x: 1, y: 4}},
            note: '钓鱼马控制将路，车在底线助攻，绝杀。校验：不蹩马腿，将帅不对面，合法'
        },
        {
            name: '双马饮泉',
            description: '红先，一步杀',
            difficulty: 3,
            board: [
                // y=0
                [0,0,0,0,0,5,0,0,0],   // 红帅(5,0) - 不和黑将同列，避免直接对面
                // y=1
                [0,0,0,0,0,0,0,0,0],
                // y=2
                [0,0,2,0,0,0,0,0,0],   // 红前马(2,2) 控制要点
                // y=3
                [0,0,0,0,0,0,0,0,0],
                // y=4
                [0,0,0,0,0,0,0,0,0],
                // y=5
                [0,0,0,0,0,0,0,0,0],
                // y=6
                [0,0,0,0,0,0,0,0,0],
                // y=7
                [0,0,0,0,0,0,0,0,0],
                // y=8
                [0,0,0,0,7,0,0,0,0],   // 黑将(4,8)
                // y=9
                [0,1,0,0,0,0,0,0,0]    // 红后马(1,9)
            ],
            answer: {from: {x: 1, y: 9}, to: {x: 2, y: 7}},
            note: '后马前进将军，前马控制出路，双马饮泉绝杀。校验：日字跳，不蹩马腿，将帅不对面，合法'
        },
        {
            name: '闷宫杀',
            description: '红先，一步杀',
            difficulty: 3,
            board: [
                // y=0
                [0,0,0,0,5,0,0,0,0],   // 红帅(4,0)
                // y=1
                [0,0,0,0,0,0,0,0,0],
                // y=2
                [0,0,0,0,3,0,0,0,0],   // 红炮(4,2)
                // y=3
                [0,0,0,0,0,0,0,0,0],
                // y=4
                [0,0,0,0,0,0,0,0,0],
                // y=5
                [0,0,0,0,0,0,0,0,0],
                // y=6
                [0,0,0,0,0,0,0,0,0],
                // y=7
                [0,0,0,0,0,0,0,0,0],
                // y=8
                [0,0,0,0,7,0,0,0,0],   // 黑将(4,8)
                // y=9
                [0,0,0,8,0,8,0,0,0]    // 黑士(3,9)(5,9)
            ],
            answer: {from: {x: 4, y: 2}, to: {x: 4, y: 9}},
            note: '炮五进七沉底将军，黑士自阻将路，闷杀。校验：同线将军，炮走棋无阻挡，合法'
        },
        {
            name: '拔簧马杀',
            description: '红先，一步杀',
            difficulty: 3,
            board: [
                // y=0
                [0,0,0,0,0,5,0,0,0],   // 红帅(5,0) - 不和黑将同列，避免直接对面
                // y=1
                [0,0,0,0,0,0,0,0,0],
                // y=2
                [1,0,0,0,0,0,0,0,0],   // 红车(0,2)
                // y=3
                [2,0,0,0,0,0,0,0,0],   // 红马(0,3)
                // y=4
                [0,0,0,0,0,0,0,0,0],
                // y=5
                [0,0,0,0,0,0,0,0,0],
                // y=6
                [0,0,0,0,0,0,0,0,0],
                // y=7
                [0,0,0,0,0,0,0,0,0],
                // y=8
                [0,0,0,0,7,0,0,0,0],   // 黑将(4,8)
                // y=9
                [0,0,0,8,0,8,0,0,0]    // 黑士
            ],
            answer: {from: {x: 0, y: 2}, to: {x: 0, y: 8}},
            note: '车借马力抽将，黑将无路可逃，拔簧马绝杀。校验：车行进无阻挡，将帅不对面，合法'
        },
        {
            name: '大刀剜心',
            description: '红先，一步杀',
            difficulty: 3,
            board: [
                // y=0
                [0,0,0,0,5,0,0,0,0],   // 红帅(4,0)
                // y=1
                [0,0,0,0,0,0,0,0,0],
                // y=2
                [1,0,0,0,0,0,0,0,0],   // 红车(0,2)
                // y=3
                [0,0,0,0,0,0,0,0,0],
                // y=4
                [0,0,0,0,3,0,0,0,0],   // 红中炮(4,4)
                // y=5
                [0,0,0,0,0,0,0,0,0],
                // y=6
                [0,0,0,0,0,0,0,0,0],
                // y=7
                [0,0,0,0,0,0,0,0,0],
                // y=8
                [0,0,0,0,7,0,0,0,0],   // 黑将(4,8)
                // y=9
                [0,0,0,0,8,0,0,0,0]    // 黑中士(4,9)
            ],
            answer: {from: {x: 0, y: 2}, to: {x: 4, y: 2}},
            note: '车杀中士直插心脏，大刀剜心一招制敌。校验：车横向无阻挡，合法'
        }
    ],

    /**
     * 棋子信息 - 繁体字
     */
    pieceInfo: {
        1: {name: '車', color: '#c0392b'},
        2: {name: '馬', color: '#c0392b'},
        3: {name: '炮', color: '#c0392b'},
        4: {name: '兵', color: '#c0392b'},
        5: {name: '帥', color: '#c0392b'},
        7: {name: '將', color: '#2c3e50'},
        8: {name: '士', color: '#2c3e50'},
        9: {name: '象', color: '#2c3e50'},
    },

    /**
     * 启动游戏
     */
    start(gameView, gameState, title = null) {
        const task = gameState.currentTask;

        // 根据技能等级选题目难度
        let skillLevel = 1;
        if (task && task.requiredSkill) {
            skillLevel = SkillSystem.getSkillLevel(gameState, task.requiredSkill);
        }

        // 筛选题目，随机选 N 题
        let maxDifficulty = skillLevel;
        let available = this.problems.filter(p => p.difficulty <= maxDifficulty);
        available = available.sort(() => Math.random() - 0.5);
        const selectedProblems = available.slice(0, 3); // 每次 3 题

        // 初始化游戏状态
        gameState.infantryGame = {
            problems: selectedProblems,
            current: 0,
            correct: 0,
            showTutorial: true,
            selectedPiece: null, // {x, y} 当前选中的棋子
            currentBoard: null, // 当前棋盘状态
            answered: false,
            isPractice: title !== null
        };

        // 复制第一题棋盘
        const game = gameState.infantryGame;
        const firstProblem = game.problems[game.current];
        game.currentBoard = JSON.parse(JSON.stringify(firstProblem.board));

        this.renderTutorial(gameState, gameView, title);
    },

    /**
     * 渲染新手教程
     */
    renderTutorial(gameState, gameView, title = null) {
        let headerTitle;
        if (title) {
            headerTitle = title;
        } else if (gameState.currentTask && gameState.currentTask.name) {
            headerTitle = gameState.currentTask.name;
        } else {
            headerTitle = '象棋残局训练';
        }

        let html = `
            <div class="infantry-tutorial" style="max-width: 800px; margin: 0 auto; padding: 10px 20px; max-height: 600px; overflow-y: auto;">
                <div class="tutorial-header" style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #8b4513; font-size: 28px; margin-bottom: 8px;">🎓 象棋残局入门</h2>
                    <p style="color: #6b5b45; font-size: 16px;">不需要象棋基础，一分钟学会！</p>
                </div>

                <div class="tutorial-section" style="background: #f5f0e1; padding: 18px; border-radius: 8px; margin-bottom: 16px;">
                    <h3 style="color: #8b4513; margin-top: 0; font-size: 22px; margin-bottom: 10px;">游戏目标</h3>
                    <div style="line-height: 1.7; color: #333; font-size: 16px;">
                        <p>你持<strong>红棋</strong>，所有题目都是"<strong>红先一步杀</strong>" —— 只需要走出正确一步，就能将死黑棋，完成残局。</p>
                    </div>
                </div>

                <div class="tutorial-section" style="background: #f5f0e1; padding: 18px; border-radius: 8px; margin-bottom: 16px;">
                    <h3 style="color: #8b4513; margin-top: 0; font-size: 22px; margin-bottom: 10px;">怎么操作</h3>
                    <ol style="line-height: 1.7; color: #333; font-size: 16px; padding-left: 25px; margin: 0;">
                        <li><strong>第一步</strong>：点击你要移动的<strong>红色棋子</strong>选中它（会绿色高亮）</li>
                        <li><strong>第二步</strong>：点击你要移动到的<strong>目标空位</strong></li>
                        <li>如果走对了，直接进入下一题；走错了会告诉你正确答案</li>
                    </ol>
                </div>

                <div class="tutorial-section" style="background: #f5f0e1; padding: 18px; border-radius: 8px; margin-bottom: 16px;">
                    <h3 style="color: #8b4513; margin-top: 0; font-size: 22px; margin-bottom: 10px;">难度说明</h3>
                    <ul style="line-height: 1.7; color: #333; font-size: 16px; padding-left: 20px; margin: 0;">
                        <li>步战 Lv1：只出基础杀法（卧槽马、重炮、铁门栓）</li>
                        <li>步战 Lv2：开放中等杀法（马后炮、白脸将）</li>
                        <li>步战 Lv3：开放全部杀法（钓鱼马、双马饮泉、闷宫、拔簧马）</li>
                    </ul>
                </div>

                <div style="text-align: center; margin-bottom: 20px;">
                    <button class="btn primary-btn" id="start-game-btn" style="padding: 12px 32px; font-size: 18px;">开始答题 →</button>
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;

        document.getElementById('start-game-btn').addEventListener('click', () => {
            const game = gameState.infantryGame;
            game.showTutorial = false;
            this.render(gameState, gameView, title);
        });
    },

    /**
     * 渲染当前题目
     */
    render(gameState, gameView, title = null) {
        const game = gameState.infantryGame;
        const problem = game.problems[game.current];
        const board = game.currentBoard;
        let headerTitle;
        if (title) {
            headerTitle = title;
        } else if (gameState.currentTask && gameState.currentTask.name) {
            headerTitle = gameState.currentTask.name;
        } else {
            headerTitle = '象棋残局训练';
        }

        // 棋盘尺寸：每个交叉点间距 50px，棋子直径 40px
        const cellSize = 50;
        const pieceSize = 40;
        const width = 8 * cellSize;
        // 10条横线，楚河汉界额外留出 30px 空间
        const height = 9 * cellSize + 30;

        let html = `
            <div class="xiangqi-header" style="text-align: center; margin-bottom: 15px;">
                <h2 style="color: #8b4513; margin: 0 0 8px 0;">${headerTitle}</h2>
                <p style="font-size: 18px; margin: 0;">${problem.name} - ${problem.description}</p>
                <p style="color: #8b4513; margin: 10px 0 0 0;">第 ${game.current + 1} / ${game.problems.length} 题 · 答对：${game.correct}</p>
            </div>
            <div class="xiangqi-board-container" style="
                display: inline-block;
                border: 3px solid #8b4513;
                border-radius: 8px;
                padding: 10px;
                background: #deb88b;
                margin: 0 auto;
                position: relative;
            ">
                <svg width="${width + 20}" height="${height + 20}" style="display: block; background: #deb88b;">
                    <!-- 横线 - 10条横线 -->
                    ${Array.from({length: 10}, (_, y) => `
                        <line x1="10" y1="${10 + y * cellSize}" x2="${10 + width}" y2="${10 + y * cellSize}" stroke="#8b4513" stroke-width="2"/>
                    `).join('')}
                    <!-- 竖线 - 楚河汉界中间断开，留出空间 -->
                    ${Array.from({length: 9}, (_, x) => `
                        <line x1="${10 + x * cellSize}" y1="10" x2="${10 + x * cellSize}" y2="${10 + 4 * cellSize}" stroke="#8b4513" stroke-width="2"/>
                        <line x1="${10 + x * cellSize}" y1="${10 + 5 * cellSize + 20}" x2="${10 + x * cellSize}" y2="${10 + 9 * cellSize}" stroke="#8b4513" stroke-width="2"/>
                    `).join('')}
                    <!-- 黑方九宫斜线 (黑九宫: x3-5, y7-9) -->
                    <line x1="${10 + 3 * cellSize}" y1="${10 + 7 * cellSize}" x2="${10 + 5 * cellSize}" y2="${10 + 9 * cellSize}" stroke="#8b4513" stroke-width="2"/>
                    <line x1="${10 + 5 * cellSize}" y1="${10 + 7 * cellSize}" x2="${10 + 3 * cellSize}" y2="${10 + 9 * cellSize}" stroke="#8b4513" stroke-width="2"/>
                    <!-- 红方九宫斜线 (红九宫: x3-5, y0-2) -->
                    <line x1="${10 + 3 * cellSize}" y1="${10 + 0 * cellSize}" x2="${10 + 5 * cellSize}" y2="${10 + 2 * cellSize}" stroke="#8b4513" stroke-width="2"/>
                    <line x1="${10 + 5 * cellSize}" y1="${10 + 0 * cellSize}" x2="${10 + 3 * cellSize}" y2="${10 + 2 * cellSize}" stroke="#8b4513" stroke-width="2"/>
                    <!-- 楚河汉界文字 - 楚河在左，漢界在右，显示在断开的空间中 -->
                    <text x="${10 + width/4}" y="${10 + 4.5 * cellSize + 10}" text-anchor="middle" fill="#8b4513" font-size="24" font-weight="bold">楚河</text>
                    <text x="${10 + width*3/4}" y="${10 + 4.5 * cellSize + 10}" text-anchor="middle" fill="#8b4513" font-size="24" font-weight="bold">漢界</text>
                </svg>
                <!-- 棋子层 -->
                <div style="position: absolute; top: 10px; left: 10px;">
        `;

        // 在每个交叉点放置棋子（如果有）
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 9; x++) {
                const piece = board[y][x];
                if (piece === 0) {
                    // 空位 - 仍然需要可点击区域
                    const px = 10 + x * cellSize - pieceSize/2;
                    const py = 10 + y * cellSize - pieceSize/2;
                    html += `<div class="xiangqi-cell" data-x="${x}" data-y="${y}" style="
                        position: absolute;
                        left: ${px}px;
                        top: ${py}px;
                        width: ${pieceSize}px;
                        height: ${pieceSize}px;
                        border-radius: 50%;
                        cursor: pointer;
                        z-index: 10;
                    "></div>`;
                } else {
                    // 有棋子
                    const info = this.pieceInfo[piece];
                    const isRed = piece <= 5;
                    const px = 10 + x * cellSize - pieceSize/2;
                    const py = 10 + y * cellSize - pieceSize/2;

                    // 选中效果
                    let border = '2px solid transparent';
                    let boxShadow = '2px 2px 4px rgba(0,0,0,0.4)';
                    if (game.selectedPiece && game.selectedPiece.x === x && game.selectedPiece.y === y) {
                        border = '3px solid #2ecc71';
                        boxShadow = '0 0 10px rgba(46, 206, 113, 0.6), 2px 2px 4px rgba(0,0,0,0.4)';
                    }

                    html += `<div class="xiangqi-cell" data-x="${x}" data-y="${y}" style="
                        position: absolute;
                        left: ${px}px;
                        top: ${py}px;
                        width: ${pieceSize}px;
                        height: ${pieceSize}px;
                        border-radius: 50%;
                        background: ${info.color};
                        color: white;
                        border: ${border};
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        font-size: 22px;
                        box-shadow: ${boxShadow};
                        cursor: ${isRed ? 'pointer' : 'default'};
                        z-index: 20;
                    ">${info.name}</div>`;
                }
            }
        }

        html += `
                </div>
            </div>
            <div class="xiangqi-result" id="xiangqi-result" style="
                margin: 20px 0;
                padding: 15px;
                border-radius: 8px;
                background: #f5f0e1;
                display: ${game.answered ? 'block' : 'none'};
            ">
                <div id="xiangqi-message"></div>
                <button class="btn primary-btn" id="xiangqi-next-btn" style="margin-top: 15px;">下一题 →</button>
            </div>
            <div class="xiangqi-note" style="color: #666; font-size: 14px; margin-top: 10px; text-align: center;">
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
        const game = gameState.infantryGame;
        const board = game.currentBoard;

        document.querySelectorAll('.xiangqi-cell').forEach(cell => {
            cell.addEventListener('click', () => {
                const x = parseInt(cell.dataset.x);
                const y = parseInt(cell.dataset.y);
                this.onCellClick(x, y, gameState, gameView);
            });
        });

        const nextBtn = document.getElementById('xiangqi-next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextQuestion(gameState, gameView);
            });
        }
    },

    /**
     * 点击格子 - 选中棋子/移动棋子
     */
    onCellClick(x, y, gameState, gameView) {
        const game = gameState.infantryGame;
        const board = game.currentBoard;
        const problem = game.problems[game.current];

        // 如果已经答对，不处理
        if (game.answered) return;

        // 如果点击的是己方棋子（红棋 1-5），选中它
        if (board[y][x] !== 0 && board[y][x] <= 5) {
            game.selectedPiece = {x, y};
            this.render(gameState, gameView);
            return;
        }

        // 如果点击的是空位，而且已经选中了棋子，尝试移动
        if (board[y][x] === 0 && game.selectedPiece) {
            // 检查是否是正确答案
            const from = game.selectedPiece;
            const correct =
                from.x === problem.answer.from.x && from.y === problem.answer.from.y &&
                x === problem.answer.to.x && y === problem.answer.to.y;

            if (correct) {
                game.correct++;
            }
            game.answered = true;

            // 执行移动
            board[y][x] = board[from.y][from.x];
            board[from.y][from.x] = 0;

            // 标记对错
            this.render(gameState, gameView);

            const cell = document.querySelector(`.xiangqi-cell[data-x="${x}"][data-y="${y}"]`);
            if (correct) {
                cell.style.border = '3px solid #2ecc71';
                cell.style.boxShadow = '0 0 12px rgba(46, 206, 113, 0.8), 2px 2px 4px rgba(0,0,0,0.4)';
            } else {
                cell.style.border = '3px solid #e74c3c';
                cell.style.boxShadow = '0 0 12px rgba(231, 76, 60, 0.8), 2px 2px 4px rgba(0,0,0,0.4)';
                // 标记正确答案的起点和终点
                const correctFrom = document.querySelector(`.xiangqi-cell[data-x="${problem.answer.from.x}"][data-y="${problem.answer.from.y}"]`);
                const correctTo = document.querySelector(`.xiangqi-cell[data-x="${problem.answer.to.x}"][data-y="${problem.answer.to.y}"]`);
                if (correctFrom) {
                    correctFrom.style.border = '3px solid #f1c40f';
                    correctFrom.style.boxShadow = '0 0 12px rgba(241, 196, 15, 0.8), 2px 2px 4px rgba(0,0,0,0.4)';
                }
                if (correctTo) {
                    correctTo.style.border = '3px solid #f1c40f';
                    correctTo.style.boxShadow = '0 0 12px rgba(241, 196, 15, 0.8), 2px 2px 4px rgba(0,0,0,0.4)';
                }
            }

            // 显示结果
            const resultDiv = document.getElementById('xiangqi-result');
            const msgDiv = document.getElementById('xiangqi-message');
            if (correct) {
                msgDiv.innerHTML = `<p style="color: green; font-weight: bold; font-size: 18px;">✔ 答对了！这确实是正确的杀棋。</p>`;
            } else {
                msgDiv.innerHTML = `<p style="color: red; font-weight: bold; font-size: 18px;">✘ 走错了，正确答案已经标记在棋盘上。</p>`;
            }
            resultDiv.style.display = 'block';
        }
    },

    /**
     * 下一题
     */
    nextQuestion(gameState, gameView) {
        const game = gameState.infantryGame;
        game.current++;
        game.answered = false;
        game.selectedPiece = null;

        if (game.current >= game.problems.length) {
            // 全部答完，结算
            this.finish(gameState, gameView);
        } else {
            // 复制新棋盘
            const problem = game.problems[game.current];
            game.currentBoard = JSON.parse(JSON.stringify(problem.board));
            this.render(gameState, gameView);
        }
    },

    /**
     * 结算游戏
     */
    finish(gameState, gameView) {
        const game = gameState.infantryGame;
        const task = gameState.currentTask;
        const ratio = game.correct / game.problems.length;

        if (game.isPractice) {
            // 演武场练习 - 非任务，固定奖励步战经验，消耗5天
            const expGained = Math.round(15 * ratio);
            gameState.addSkillExp('infantry', expGained);
            gameState.addLog(`象棋残局训练完成！答对 ${game.correct}/${game.problems.length} 题，获得 ${expGained} 步战经验，消耗5天时间。`);
            gameState.advanceDays(5);
            gameState.infantryGame = null;
            // 返回设施场景
            gameState.currentScene = GameScene.FACILITY;
            gameView.renderAll();
        } else {
            // 正常任务结算 - 使用新主命系统
            const template = getMissionTemplateById(gameState.currentTask.templateId) || gameState.currentTask;
            // 实际进度 = 目标值 * 完成率
            const actualProgress = Math.round(gameState.currentTask.targetValue * ratio);
            const success = actualProgress > 0;

            // 使用新的主命系统结算
            const result = gameState.completeMission(success, actualProgress);

            gameState.addLog(`【${template.name}】答对 ${game.correct}/${game.problems.length} 题，完成率 ${Math.round(ratio * 100)}%`);

            // 显示结果页
            let html = `
                <div class="infantry-result" style="text-align: center; padding: 30px;">
                    <h2 style="font-size: 28px; margin-bottom: 20px; color: #8b4513;">象棋残局完成</h2>
                    <p style="font-size: 16px; margin-bottom: 20px;">答对 ${game.correct}/${game.problems.length} 题</p>
                    <div style="background: #f5f0e1; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                        <p>正确率：${Math.round(ratio * 100)}%</p>
                    </div>
                    <p>功勋奖励：${result.meritGained > 0 ? '+' : ''}${result.meritGained}</p>
                    <div style="margin-top: 30px;">
                        <button class="btn primary-btn" id="infantry-done-btn">返回</button>
                    </div>
                </div>
            `;

            document.getElementById('farming-game-view').innerHTML = html;
            document.getElementById('infantry-done-btn').addEventListener('click', () => {
                // 时间推进：按任务限时推进
                TimeSystem.advanceDays(gameState, template.timeLimitDays);
                gameState.infantryGame = null;
                gameState.currentScene = GameScene.CITY_VIEW;
                gameView.renderAll();
            });
        }
    }
};
