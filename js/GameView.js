/**
 * 游戏视图渲染类
 */
window.GameView = class GameView {
    constructor(gameState) {
        this.gameState = gameState;
        this.cacheDOMElements();
        this.bindEvents();
    }

    /**
     * 缓存DOM元素引用
     */
    cacheDOMElements() {
        this.statusDateEl = document.getElementById('status-date');
        this.moneyEl = document.getElementById('money');
        this.meritEl = document.getElementById('merit');
        this.characterViewEl = document.getElementById('character-view');
        this.logAreaEl = document.getElementById('log-area');
        this.nextDayBtn = document.getElementById('next-day-btn');
        this.navCharacterBtn = document.getElementById('nav-character');
        this.navCityBtn = document.getElementById('nav-city');
        this.navMapBtn = document.getElementById('nav-map');
        this.navTaskBtn = document.getElementById('nav-task');
        this.navCardBtn = document.getElementById('nav-card');
        this.mapViewEl = document.getElementById('map-view');
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        this.nextDayBtn.addEventListener('click', () => {
            this.onNextDayClick();
        });
        this.navCharacterBtn.addEventListener('click', () => {
            this.onNavClick(GameScene.CHARACTER_VIEW);
        });
        this.navCityBtn.addEventListener('click', () => {
            this.onNavClick(GameScene.CITY_VIEW);
        });
        this.navMapBtn.addEventListener('click', () => {
            this.onNavClick(GameScene.MAP_VIEW);
        });
        this.navTaskBtn.addEventListener('click', () => {
            this.onNavClick(GameScene.TASK_LIST);
        });
        this.navCardBtn.addEventListener('click', () => {
            this.onNavClick(GameScene.CARD_COLLECTION);
        });
    }

    /**
     * 导航按钮点击 - 直接切到对应场景
     */
    onNavClick(targetScene) {
        // 如果切出小游戏，停止动画避免浪费
        if (targetScene !== GameScene.FARMING_GAME) {
            if (this.gameState.farmingGame && this.gameState.farmingGame.animationId) {
                cancelAnimationFrame(this.gameState.farmingGame.animationId);
                this.gameState.farmingGame.animationId = null;
            }
            if (this.gameState.engineeringGame && this.gameState.engineeringGame.animationId) {
                cancelAnimationFrame(this.gameState.engineeringGame.animationId);
                this.gameState.engineeringGame.animationId = null;
            }
            if (this.gameState.navyGame && this.gameState.navyGame.animationId) {
                cancelAnimationFrame(this.gameState.navyGame.animationId);
                this.gameState.navyGame.animationId = null;
            }
            if (this.gameState.firearmGame && this.gameState.firearmGame.animationId) {
                cancelAnimationFrame(this.gameState.firearmGame.animationId);
                this.gameState.firearmGame.animationId = null;
            }
        }
        this.gameState.currentScene = targetScene;
        this.renderAll();
    }

    /**
     * 次日按钮点击
     */
    onNextDayClick() {
        this.gameState.advanceDay();
        this.renderAll();
    }

    /**
     * 渲染所有视图
     */
    renderAll() {
        this.renderStatusBar();
        this.renderCurrentScene();
        this.renderLog();
        this.updateNavActive();
    }

    /**
     * 更新导航按钮激活状态
     */
    updateNavActive() {
        const buttons = {
            [GameScene.CHARACTER_VIEW]: this.navCharacterBtn,
            [GameScene.CITY_VIEW]: this.navCityBtn,
            [GameScene.MAP_VIEW]: this.navMapBtn,
            [GameScene.TASK_LIST]: this.navTaskBtn,
            [GameScene.CARD_COLLECTION]: this.navCardBtn,
        };
        // 移除所有active
        Object.values(buttons).forEach(btn => {
            if (btn) btn.classList.remove('active');
        });
        // 添加active给当前场景
        const currentBtn = buttons[this.gameState.currentScene];
        if (currentBtn) currentBtn.classList.add('active');
    }

    /**
     * 渲染顶部状态栏
     */
    renderStatusBar() {
        if (this.statusDateEl) {
            this.statusDateEl.textContent = this.gameState.getFormattedDate();
        }
        if (this.moneyEl) {
            this.moneyEl.textContent = this.gameState.money;
        }
        if (this.meritEl) {
            this.meritEl.textContent = this.gameState.merit;
        }
    }

    /**
     * 渲染角色属性视图
     */
    renderCharacterView() {
        const character = this.gameState.getPlayerCharacter();
        if (!character || !this.characterViewEl) return;

        const force = character.faction ? getForceTemplateByFactionId(character.faction) : null;
        const city = getCityTemplateById(character.locationCityId);

        // 基础属性中文名称映射
        const attributeNames = {
            leadership: '统帅',
            strength: '武力',
            intelligence: '智力',
            politics: '政治',
            charm: '魅力'
        };

        let html = `
            <div class="character-header">
                <div class="character-portrait" style="background-color: ${character.color}">
                    ${character.emoji}
                </div>
                <div class="character-info">
                    <h1 class="character-name">${character.name}</h1>
                    <div class="character-role">身份：${this.gameState.getCurrentRole().name}</div>
                    <div class="character-affiliation">
                        ${force ? `势力：${force.name}` : '暂无势力'}
                        ${city ? `| 所在地：${city.name}` : ''}
                    </div>
                </div>
            </div>

            <div class="attributes-section">
                <h3>基础属性</h3>
                <div class="attributes-grid">
        `;

        // 遍历所有五维基础属性
        const attributes = [
            { key: 'leadership', value: character.baseStats.leadership },
            { key: 'strength', value: character.baseStats.strength },
            { key: 'intelligence', value: character.baseStats.intelligence },
            { key: 'politics', value: character.baseStats.politics },
            { key: 'charm', value: character.baseStats.charm }
        ];

        attributes.forEach(attr => {
            const percentage = Math.min(100, (attr.value / 100) * 100);
            html += `
                <div class="attribute-item">
                    <div class="attribute-name">${attributeNames[attr.key]}: ${attr.value}</div>
                    <div class="attribute-bar-container">
                        <div class="attribute-bar" style="width: ${percentage}%">
                            <span class="attribute-value">${attr.value}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>

            <div class="skills-section">
                <h3>技能等级</h3>
                <div class="skills-grid">
        `;

        // 显示所有技能，只显示>=1级的技能在前，0级在后
        const allSkills = getAllSkills();
        const learnedSkills = allSkills.filter(s => (this.gameState.getSkillLevel(s.id) > 0));
        const unlearnedSkills = allSkills.filter(s => (this.gameState.getSkillLevel(s.id) === 0));

        [...learnedSkills, ...unlearnedSkills].forEach(skill => {
            const level = this.gameState.getSkillLevel(skill.id);
            const exp = this.gameState.skills[skill.id]?.exp || 0;
            const stars = '⭐'.repeat(level);
            const grayStars = '☆'.repeat(skill.maxLevel - level);
            const className = level > 0 ? 'skill-item learned' : 'skill-item unlearned';
            // 只要有经验并且未满级就显示经验条，0级也能看到进度
            const showExpBar = exp > 0 && level < skill.maxLevel;
            html += `
                <div class="${className}">
                    <div class="skill-info">
                        <span class="skill-name">${skill.name}</span>
                        <span class="skill-level">${stars}${grayStars}</span>
                    </div>
                    ${showExpBar ? `
                    <div class="skill-exp-bar">
                        <div class="skill-exp-fill" style="width: ${(exp / skill.expPerLevel) * 100}%"></div>
                    </div>
                    ` : ''}
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        this.characterViewEl.innerHTML = html;
    }

    /**
     * 渲染城市视图
     */
    renderCityView() {
        const city = this.gameState.getCurrentCity();
        const player = this.gameState.getPlayerCharacter();
        const force = player.faction ? getForceTemplateByFactionId(player.faction) : null;

        let html = `
            <div class="city-header">
                <h2>${city.name}</h2>
                <p>所属势力：${force ? force.name : '无主'} | 规模：${'■'.repeat(city.scale)}</p>
            </div>
            <div class="city-actions">
        `;

        // 仅当玩家有所属势力且不是君主时显示"进入评定厅"
        if (player.forceId && player.role !== '君主') {
            html += `<button class="btn primary-btn" id="enter-assessment-btn">进入评定厅</button>`;
        }

        // 添加查看城中人物按钮
        html += `<button class="btn primary-btn" id="view-characters-btn">城中人物</button>`;

        // 列出城市设施
        if (city.facilities && city.facilities.length > 0) {
            html += `<div class="city-facilities"><h3>设施</h3><div class="facility-list">`;
            city.facilities.forEach(facility => {
                html += `<span class="facility-tag">${facility}</span>`;
            });
            html += `</div></div>`;
        }

        html += `
            </div>
        `;

        document.getElementById('city-view').innerHTML = html;

        // 绑定事件
        if (player.forceId && player.role !== '君主') {
            document.getElementById('enter-assessment-btn').addEventListener('click', () => {
                this.gameState.currentScene = GameScene.TASK_LIST;
                this.renderAll();
            });
        }

        document.getElementById('view-characters-btn').addEventListener('click', () => {
            this.gameState.currentScene = GameScene.CHARACTER_LIST_VIEW;
            this.renderAll();
        });
    }

    /**
     * 渲染评定会任务列表（评定会）
     */
    renderTaskList() {
        // 检查是否是评定会日
        const isEvaluationDay = this.gameState.isEvaluationDay();
        const atMainCity = this.gameState.isAtMainCity();

        let html = `
            <div class="task-list-header">
                <h2>${isEvaluationDay ? '评定会' : '主命'}</h2>
                ${this.gameState.currentTask ? `
                    <div class="current-task-info">
                        当前任务: <strong>${this.gameState.currentTask.name}</strong>
                        <span class="remaining-days">剩余天数: ${this.gameState.getRemainingDaysForMission()} 天</span>
                    </div>
                ` : ''}
            </div>
        `;

        if (!isEvaluationDay) {
            html += `
                <div class="evaluation-notice">
                    📅 评定会每两个月召开一次，固定在奇数月1日。
                    ${!atMainCity ? '' : '<p class="warning">你不在主城，无法参加评定会接取新任务。</p>'}
                </div>
            `;
        }

        if (!isEvaluationDay && !this.gameState.currentTask) {
            html += `<p class="no-tasks">当前没有可接取的新任务，等待下次评定会吧。</p>`;
        } else if (isEvaluationDay && !atMainCity) {
            html += `<p class="no-tasks">你不在主城，必须返回主城${getCityTemplateById(1).name}才能参加评定会。</p>`;
        } else {
            const currentRoleId = this.gameState.currentRoleId;
            const availableTasks = this.gameState.getAvailableMissions();

            // 按分类分组
            const categories = {
                '军务': availableTasks.filter(t => t.category === '军务'),
                '政务': availableTasks.filter(t => t.category === '政务'),
                '外交': availableTasks.filter(t => t.category === '外交'),
                '调略': availableTasks.filter(t => t.category === '调略'),
                '特殊': availableTasks.filter(t => t.category === '特殊'),
            };

            // 技能中文名映射
            const skillNames = {
                leadership: '统帅',
                strength: '武力',
                intelligence: '智力',
                politics: '政治',
                charm: '魅力',
                agriculture: '农政',
                eloquence: '口才',
                infantry: '步战',
                cavalry: '骑战',
                engineering: '工政',
                trade: '商政',
                law: '律政',
                navy: '水战',
                strategy: '兵法',
                martial: '武艺',
                medicine: '医术',
                calligraphy: '文墨',
                spy: '密探',
                navigation: '航海',
                ritual: '礼制',
                firearm: '火器'
            };

            for (const [category, tasks] of Object.entries(categories)) {
                if (tasks.length === 0) continue;

                html += `
                    <div class="task-category">
                        <h3 class="category-title">${category}</h3>
                        <div class="task-list">
                `;

                tasks.forEach(task => {
                    const difficultyStars = '⭐'.repeat(task.baseDifficulty);
                    const requiredSkills = task.requiredSkills.map(sid => skillNames[sid]).join('、');
                    html += `
                        <div class="task-item">
                            <div class="task-info">
                                <h3>${task.name} ${difficultyStars}</h3>
                                <p class="task-desc">${task.description}</p>
                                <p class="task-reward">关联技能：${requiredSkills || '无'} | 基础功勋奖励：${task.baseReward} | 限时：${task.timeLimitDays}天</p>
                            </div>
                            <button class="btn primary-btn accept-task-btn" data-task-id="${task.id}">接取任务</button>
                        </div>
                    `;
                });

                html += `
                        </div>
                    </div>
                `;
            }

            if (availableTasks.length === 0) {
                html += `<p class="no-tasks">目前你的身份没有可接取的任务，提升功勋晋升后再来吧。</p>`;
            }
        }

        document.getElementById('task-list-view').innerHTML = html;

        // 绑定事件
        document.querySelectorAll('.accept-task-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.dataset.taskId);
                this.acceptMission(taskId);
            });
        });
    }

    /**
     * 接受并开始一个主命
     */
    acceptMission(taskId) {
        const template = getMissionTemplateById(taskId);
        if (!template) return;

        // GameState中开始任务
        this.gameState.startMission(template);

        // 根据任务的小游戏类型进入对应小游戏
        if (template.gameType && template.gameType !== 'none') {
            this.gameState.currentScene = GameScene.FARMING_GAME;
            this.initMinigame(template);
        } else {
            // 不需要小游戏的任务直接返回城市界面
            this.gameState.currentScene = GameScene.CITY_VIEW;
        }

        this.renderAll();
    }

    /**
     * 根据任务初始化对应小游戏
     */
    initMinigame(template) {
        const gameType = template.gameType;

        // 根据不同游戏类型初始化不同小游戏状态
        if (gameType === 'agriculture') {
            // 开垦荒地 - 力量条摆动小游戏
            this.gameState.farmingGame = {
                currentRound: 0,
                totalRounds: 5,
                scores: [],
                power: 0,
                direction: 1,
                speed: 2 + (6 - template.baseDifficulty),
                animationId: null
            };
        } else if (gameType === 'eloquence') {
            // 口才 - 找相同句子小游戏
            this.gameState.eloquenceGame = {
                currentRound: 0,
                totalRounds: 5,
                correctCount: 0
            };
        } else if (gameType === 'infantry') {
            // 步兵训练 - 方向对战
            this.gameState.infantryGame = {
                playerHp: 10,
                enemyHp: 10,
                gameOver: false
            };
        } else if (gameType === 'cavalry') {
            // 骑兵训练 - 赛马选壮
            this.gameState.cavalryGame = {
                playerPosition: 0,
                enemyPosition: 0,
                totalSteps: 10,
                flipped: Array(10).fill(false)
            };
        } else if (gameType === 'engineering') {
            // 修筑城墙/水利 - 重量停止小游戏
            this.gameState.engineeringGame = {
                value: 0,
                direction: 1,
                speed: 2,
                targetStart: 40,
                targetEnd: 60,
                animationId: null
            };
        } else if (gameType === 'trade') {
            // 采买/征税 - 九宫格对子游戏
            this.gameState.tradeGame = {
                board: Array(9).fill(null),
                player: '1',
                computer: '2',
                gameOver: false
            };
        } else if (gameType === 'law') {
            // 审理案件 - 记忆翻牌找相同
            const pairs = [
                '死者手心有火药味',
                '凶手身上沾有火药',
                '证人说看到凶手',
                '证人作证看见凶手',
                '房门锁是坏的',
                '大门完好无损',
                '死者兜里有银两',
                '死者身上少了银两'
            ];
            const cards = [...pairs, ...pairs];
            cards.sort(() => Math.random() - 0.5);
            this.gameState.lawGame = {
                cards,
                flipped: Array(8).fill(false),
                matched: 0,
                firstPick: null,
                secondPick: null
            };
        } else if (gameType === 'navy') {
            // 水军训练 - 避开暗礁
            this.gameState.navyGame = {
                position: 50,
                direction: 1,
                speed: 3 + (6 - template.baseDifficulty),
                obstacles: [],
                score: 0,
                totalRounds: 5,
                currentRound: 0
            };
        } else if (gameType === 'strategy') {
            // 兵法 - 排兵布阵
            this.gameState.strategyGame = {
                playerChoices: [],
                totalRounds: 5
            };
        } else if (gameType === 'spy') {
            // 密探 - 迷宫寻路
            this.gameState.spyGame = {
                playerPos: {x: 0, y: 0},
                maze: [],
                foundExit: false
            };
        } else if (gameType === 'navigation') {
            // 航海 - 罗盘导航
            this.gameState.navigationGame = {
                targetDirection: 0,
                attempts: 0,
                maxAttempts: 5
            };
        } else if (gameType === 'medicine') {
            // 医术 - 按顺序抓药
            this.gameState.medicineGame = {
                sequence: [],
                playerSequence: [],
                currentStep: 0,
                totalRounds: 5
            };
        } else if (gameType === 'calligraphy') {
            // 文墨 - 填空
            this.gameState.calligraphyGame = {
                currentQuestion: null,
                questions: []
            };
        } else if (gameType === 'martial') {
            // 武艺 - 个人战，render里初始化
        } else if (gameType === 'ritual') {
            // 礼制 - 排序
            this.gameState.ritualGame = {
                items: [],
                correctOrder: ['玉玺', '编钟', '鼎', '爵', '豆'],
                shuffled: []
            };
        } else if (gameType === 'firearm') {
            // 火器 - 瞄准射击
            this.gameState.firearmGame = {
                x: 50,
                y: 50,
                directionX: 1,
                directionY: 1,
                speed: 2 + (6 - template.baseDifficulty),
                animationId: null
            };
        } else if (gameType === 'battle') {
            // 合战 - 完整军团对战
            // 合战状态由BattleGame.start初始化
            this.gameState.battleGame = null;
        } else if (gameType === 'duel') {
            // 缉拿/护送 - 个人战决斗
            // 个人战状态由renderDuelGame初始化
        } else {
            console.warn('未知小游戏类型:', gameType);
        }

        this.renderAll();

        // 启动需要动画的游戏
        if (gameType === 'agriculture') {
            this.startFarmingAnimation();
        } else if (gameType === 'engineering') {
            this.startEngineeringAnimation();
        } else if (gameType === 'navy') {
            this.startNavyAnimation();
        }
    }

    /**
     * 启动耕地动画
     */
    startFarmingAnimation() {
        const game = this.gameState.farmingGame;

        const animate = () => {
            game.power += game.direction * game.speed;
            if (game.power >= 100) {
                game.power = 100;
                game.direction = -1;
            } else if (game.power <= 0) {
                game.power = 0;
                game.direction = 1;
            }
            this.updateFarmingDisplay();
            game.animationId = requestAnimationFrame(animate);
        };

        if (game.animationId) {
            cancelAnimationFrame(game.animationId);
        }
        game.animationId = requestAnimationFrame(animate);
    }

    /**
     * 启动筑城动画
     */
    startEngineeringAnimation() {
        const game = this.gameState.engineeringGame;

        const animate = () => {
            game.value += game.direction * game.speed;
            if (game.value >= 100) {
                game.value = 100;
                game.direction = -1;
            } else if (game.value <= 0) {
                game.value = 0;
                game.direction = 1;
            }
            this.updateEngineeringDisplay();
            game.animationId = requestAnimationFrame(animate);
        };

        if (game.animationId) {
            cancelAnimationFrame(game.animationId);
        }
        game.animationId = requestAnimationFrame(animate);
    }

    /**
     * 更新筑城小游戏显示
     */
    updateEngineeringDisplay() {
        const valueBar = document.getElementById('engineering-value-bar');
        const indicator = document.getElementById('engineering-indicator');
        if (valueBar && indicator) {
            indicator.style.left = `${this.gameState.engineeringGame.value}%`;
        }
    }

    /**
     * 启动水军游戏动画
     */
    startNavyAnimation() {
        const game = this.gameState.navyGame;

        const animate = () => {
            game.position += game.direction * game.speed;
            if (game.position >= 100) {
                game.position = 100;
                game.direction = -1;
            } else if (game.position <= 0) {
                game.position = 0;
                game.direction = 1;
            }
            this.updateNavyDisplay();
            game.animationId = requestAnimationFrame(animate);
        };

        if (game.animationId) {
            cancelAnimationFrame(game.animationId);
        }
        game.animationId = requestAnimationFrame(animate);
    }

    /**
     * 更新水军小游戏显示
     */
    updateNavyDisplay() {
        const positionBar = document.getElementById('navy-position-bar');
        const indicator = document.getElementById('navy-indicator');
        if (positionBar && indicator) {
            indicator.style.left = `${this.gameState.navyGame.position}%`;
        }
    }

    /**
     * 更新耕地小游戏显示
     */
    updateFarmingDisplay() {
        const powerBar = document.getElementById('farming-power-bar');
        const indicator = document.getElementById('farming-indicator');
        if (powerBar && indicator) {
            indicator.style.left = `${this.gameState.farmingGame.power}%`;
        }
        const roundEl = document.getElementById('farming-round');
        if (roundEl) {
            roundEl.textContent = `${this.gameState.farmingGame.currentRound + 1}/${this.gameState.farmingGame.totalRounds}`;
        }
    }

    /**
     * 渲染耕地小游戏
     */
    /**
    /**
     * 推进两个月（符合评定会周期）
     */
    advanceTwoMonths() {
        for (let i = 0; i < 60; i++) { // 按每月30天算
            this.gameState.advanceDay();
        }
    }

    /**
     * 根据当前场景渲染
     */
    renderCurrentScene() {
        switch (this.gameState.currentScene) {
            case GameScene.CHARACTER_VIEW:
                this.showCharacterView();
                this.renderCharacterView();
                break;
            case GameScene.CITY_VIEW:
                this.showCityView();
                this.renderCityView();
                break;
            case GameScene.MAP_VIEW:
                this.showMapView();
                MapRenderer.render(this.gameState);
                break;
            case GameScene.TASK_LIST:
                this.showTaskListView();
                this.renderTaskList();
                break;
            case GameScene.FARMING_GAME:
                this.showFarmingGameView();
                const gameType = this.gameState.currentTask.gameType;
                if (gameType === 'agriculture') {
                    FarmingGame.start(this, this.gameState);
                    this.startFarmingAnimation();
                } else if (gameType === 'eloquence') {
                    EloquenceGame.start(this, this.gameState);
                } else if (gameType === 'infantry') {
                    InfantryGame.start(this, this.gameState);
                } else if (gameType === 'cavalry') {
                    CavalryGame.start(this, this.gameState);
                } else if (gameType === 'engineering') {
                    EngineeringGame.start(this, this.gameState);
                } else if (gameType === 'trade') {
                    TradeGame.start(this, this.gameState);
                } else if (gameType === 'law') {
                    LawGame.start(this, this.gameState);
                } else if (gameType === 'navy') {
                    NavyGame.start(this, this.gameState);
                } else if (gameType === 'strategy') {
                    const taskId = this.gameState.currentTask.templateId;
                    if (taskId === 17) {
                        BattleGame.start(this, this.gameState);
                    } else {
                        StrategyGame.start(this, this.gameState);
                    }
                } else if (gameType === 'martial') {
                    const taskId = this.gameState.currentTask.templateId;
                    if (taskId === 10) {
                        DuelGame.start(this, this.gameState);
                    } else {
                        MartialGame.start(this, this.gameState);
                    }
                } else if (gameType === 'medicine') {
                    MedicineGame.start(this, this.gameState);
                } else if (gameType === 'calligraphy') {
                    CalligraphyGame.start(this, this.gameState);
                } else if (gameType === 'spy') {
                    SpyGame.start(this, this.gameState);
                } else if (gameType === 'navigation') {
                    NavigationGame.start(this, this.gameState);
                } else if (gameType === 'ritual') {
                    RitualGame.start(this, this.gameState);
                } else if (gameType === 'firearm') {
                    FirearmGame.start(this, this.gameState);
                } else if (gameType === 'duel') {
                    DuelGame.start(this, this.gameState);
                } else if (gameType === 'battle') {
                    BattleGame.start(this, this.gameState);
                }
                break;
            case GameScene.CARD_COLLECTION:
                this.showCardCollectionView();
                CardCollectionRenderer.render(this.gameState);
                break;
            case GameScene.CHARACTER_LIST_VIEW:
                this.showCharacterListView();
                CharacterListRenderer.render(this.gameState);
                break;
            case GameScene.SOCIAL_VIEW:
                this.showSocialView();
                SocialRenderer.render(this.gameState);
                break;
        }
    }

    /**
     * 切换显示
     */
    showCharacterView() {
        document.getElementById('character-view').style.display = 'flex';
        document.getElementById('city-view').style.display = 'none';
        document.getElementById('map-view').style.display = 'none';
        document.getElementById('task-list-view').style.display = 'none';
        document.getElementById('farming-game-view').style.display = 'none';
        document.getElementById('card-collection-view').style.display = 'none';
        document.getElementById('character-list-view').style.display = 'none';
        document.getElementById('social-view').style.display = 'none';
    }

    /**
     * 切换显示
     */
    showCityView() {
        document.getElementById('character-view').style.display = 'none';
        document.getElementById('city-view').style.display = 'block';
        document.getElementById('map-view').style.display = 'none';
        document.getElementById('task-list-view').style.display = 'none';
        document.getElementById('farming-game-view').style.display = 'none';
        document.getElementById('card-collection-view').style.display = 'none';
        document.getElementById('character-list-view').style.display = 'none';
        document.getElementById('social-view').style.display = 'none';
    }

    /**
     * 切换显示
     */
    showTaskListView() {
        document.getElementById('character-view').style.display = 'none';
        document.getElementById('city-view').style.display = 'none';
        document.getElementById('map-view').style.display = 'none';
        document.getElementById('task-list-view').style.display = 'block';
        document.getElementById('farming-game-view').style.display = 'none';
        document.getElementById('card-collection-view').style.display = 'none';
        document.getElementById('character-list-view').style.display = 'none';
        document.getElementById('social-view').style.display = 'none';
    }

    /**
     * 切换显示
     */
    showFarmingGameView() {
        document.getElementById('character-view').style.display = 'none';
        document.getElementById('city-view').style.display = 'none';
        document.getElementById('map-view').style.display = 'none';
        document.getElementById('task-list-view').style.display = 'none';
        document.getElementById('farming-game-view').style.display = 'block';
        document.getElementById('card-collection-view').style.display = 'none';
        document.getElementById('character-list-view').style.display = 'none';
        document.getElementById('social-view').style.display = 'none';
    }

    /**
     * 切换显示
     */
    showCardCollectionView() {
        document.getElementById('character-view').style.display = 'none';
        document.getElementById('city-view').style.display = 'none';
        document.getElementById('map-view').style.display = 'none';
        document.getElementById('task-list-view').style.display = 'none';
        document.getElementById('farming-game-view').style.display = 'none';
        document.getElementById('card-collection-view').style.display = 'block';
        document.getElementById('character-list-view').style.display = 'none';
        document.getElementById('social-view').style.display = 'none';
    }

    /**
     * 切换显示 - 大地图
     */
    showMapView() {
        document.getElementById('character-view').style.display = 'none';
        document.getElementById('city-view').style.display = 'none';
        document.getElementById('task-list-view').style.display = 'none';
        document.getElementById('farming-game-view').style.display = 'none';
        document.getElementById('card-collection-view').style.display = 'none';
        document.getElementById('map-view').style.display = 'block';
        document.getElementById('character-list-view').style.display = 'none';
        document.getElementById('social-view').style.display = 'none';
    }

    /**
     * 切换显示 - 城中人物列表
     */
    showCharacterListView() {
        document.getElementById('character-view').style.display = 'none';
        document.getElementById('city-view').style.display = 'none';
        document.getElementById('map-view').style.display = 'none';
        document.getElementById('task-list-view').style.display = 'none';
        document.getElementById('farming-game-view').style.display = 'none';
        document.getElementById('card-collection-view').style.display = 'none';
        document.getElementById('social-view').style.display = 'none';
        document.getElementById('character-list-view').style.display = 'block';
    }

    /**
     * 切换显示 - 社交互动
     */
    showSocialView() {
        document.getElementById('character-view').style.display = 'none';
        document.getElementById('city-view').style.display = 'none';
        document.getElementById('map-view').style.display = 'none';
        document.getElementById('task-list-view').style.display = 'none';
        document.getElementById('farming-game-view').style.display = 'none';
        document.getElementById('card-collection-view').style.display = 'none';
        document.getElementById('character-list-view').style.display = 'none';
        document.getElementById('social-view').style.display = 'block';
    }

    // ========== 步兵训练小游戏 ==========

    /**
     * 渲染步兵训练小游戏
     * 规则：双方各有10点血量，你选择进攻方向，对方也进攻，先打完对方血量获胜
     */
    renderInfantryGame() {
        const task = this.gameState.currentTask;
        this.gameState.infantryGame = {
            playerHp: 10,
            enemyHp: 10,
            gameOver: false
        };

        const html = `
            <div class="infantry-header">
                <h2>${task.name}</h2>
                <p>双方各10点血量，5回合内击溃敌军获胜</p>
                <div class="infantry-clues" style="background: #f5f0e1; padding: 10px; border-radius: 5px; margin: 10px 0;">
                    <p><strong>战术克制关系：</strong></p>
                    <p style="color: #8b4513; margin: 5px 0;">▶ 冲锋 → 克制【坚守】，冲破防线造成大量伤害</p>
                    <p style="color: #8b4513; margin: 5px 0;">▶ 坚守 → 克制【侧击】，稳住阵脚反击侧翼</p>
                    <p style="color: #8b4513; margin: 5px 0;">▶ 侧击 → 克制【冲锋】，绕开正面从侧翼打击</p>
                </div>
            </div>
            <div class="infantry-hp">
                <div class="hp-row">
                    <span>我方血量: <strong id="player-hp">${this.gameState.infantryGame.playerHp}</strong></span>
                    <div class="hp-bar"><div class="hp-fill player" style="width: ${this.gameState.infantryGame.playerHp * 10}%"></div></div>
                </div>
                <div class="hp-row">
                    <span>敌方血量: <strong id="enemy-hp">${this.gameState.infantryGame.enemyHp}</strong></span>
                    <div class="hp-bar"><div class="hp-fill enemy" style="width: ${this.gameState.infantryGame.enemyHp * 10}%"></div></div>
                </div>
            </div>
            <div class="infantry-directions">
                <p>请选择本回合战术：</p>
                <div class="direction-buttons">
                    <button class="btn primary-btn direction-btn" data-tactic="charge">1. 冲锋<br><small style="color: #ffd700;">克坚守，被侧击克</small></button>
                    <button class="btn primary-btn direction-btn" data-tactic="hold">2. 坚守<br><small style="color: #ffd700;">克侧击，被冲锋克</small></button>
                    <button class="btn primary-btn direction-btn" data-tactic="flank">3. 侧击<br><small style="color: #ffd700;">克冲锋，被坚守克</small></button>
                </div>
            </div>
            <div class="infantry-log" id="infantry-log"></div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        this.bindInfantryEvents();
    }

    bindInfantryEvents() {
        document.querySelectorAll('.direction-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.onInfantryAttack(e.target.dataset.tactic);
            });
        });
    }

    onInfantryAttack(playerTactic) {
        const game = this.gameState.infantryGame;
        // 敌方随机战术
        const tactics = ['charge', 'hold', 'flank'];
        const enemyTactic = tactics[Math.floor(Math.random() * 3)];

        let damageDealt = 0;
        let damageTaken = 0;

        // 检查克制关系 - 克制对方则造成双倍伤害
        let playerMultiplier = 1;
        let enemyMultiplier = 1;

        if (playerTactic === 'charge' && enemyTactic === 'hold') {
            playerMultiplier = 2; // 冲锋克坚守
        } else if (playerTactic === 'hold' && enemyTactic === 'flank') {
            playerMultiplier = 2; // 坚守克侧击
        } else if (playerTactic === 'flank' && enemyTactic === 'charge') {
            playerMultiplier = 2; // 侧击克冲锋
        }

        if (enemyTactic === 'charge' && playerTactic === 'hold') {
            enemyMultiplier = 2;
        } else if (enemyTactic === 'hold' && playerTactic === 'flank') {
            enemyMultiplier = 2;
        } else if (enemyTactic === 'flank' && playerTactic === 'charge') {
            enemyMultiplier = 2;
        }

        // 基础伤害 1-3点
        const basePlayerDamage = Math.floor(1 + Math.random() * 3);
        const baseEnemyDamage = Math.floor(1 + Math.random() * 3);
        damageDealt = Math.floor(basePlayerDamage * playerMultiplier);
        damageTaken = Math.floor(baseEnemyDamage * enemyMultiplier);

        game.enemyHp -= damageDealt;
        game.playerHp -= damageTaken;

        // 限制下限
        game.enemyHp = Math.max(0, game.enemyHp);
        game.playerHp = Math.max(0, game.playerHp);

        const tacticNames = {charge: '冲锋', hold: '坚守', flank: '侧击'};
        const log = document.getElementById('infantry-log');
        log.innerHTML += `<div class="infantry-log-entry">你出【${tacticNames[playerTactic]}】，敌军出【${tacticNames[enemyTactic]}】→ 你对敌军造成${damageDealt}伤害，你受到${damageTaken}伤害</div>`;
        log.scrollTop = log.scrollHeight;

        // 更新血量显示
        document.getElementById('player-hp').textContent = game.playerHp;
        document.getElementById('enemy-hp').textContent = game.enemyHp;
        document.querySelector('.hp-fill.player').style.width = `${game.playerHp * 10}%`;
        document.querySelector('.hp-fill.enemy').style.width = `${game.enemyHp * 10}%`;

        if (game.enemyHp <= 0 || game.playerHp <= 0) {
            game.gameOver = true;
            this.finishInfantryGame();
        }
    }

    finishInfantryGame() {
        const game = this.gameState.infantryGame;
        const task = this.gameState.currentTask;
        const won = game.enemyHp <= 0;
        const ratio = won ? 1 : game.enemyHp / (game.enemyHp + game.playerHp);

        const finalMerit = Math.round(task.rewardMerit * ratio);
        const finalMoney = Math.round(task.rewardMoney * ratio);
        const expGained = Math.round(10 * ratio);

        // 更新状态
        this.gameState.merit += finalMerit;
        this.gameState.money += finalMoney;
        if (task.requiredSkill) {
            this.gameState.addSkillExp(task.requiredSkill, expGained);
        }

        this.gameState.checkRolePromotion();
        this.gameState.addLog(`任务【${task.name}】完成！你${won ? '获胜' : '战败'}，获得 ${finalMerit} 功勋，${finalMoney} 金钱，${expGained} ${getSkillById(task.requiredSkill)?.name || ''}经验。`);

        this.advanceTwoMonths();
        this.gameState.currentTask = null;
        this.gameState.infantryGame = null;
        this.gameState.currentScene = GameScene.CITY_VIEW;
        this.renderAll();
    }

    // ========== 赛马小游戏 ==========

    /**
     * 赛马小游戏 - 骰子驱动竞速 (按照策划设计)
     * 从起点到终点共15点进度，每回合选择策马方式掷骰前进
     */
    renderCavalryGame() {
        const task = this.gameState.currentTask;
        // 初始化游戏状态 - 按照策划设计
        this.gameState.cavalryGame = {
            playerProgress: 0,
            enemyProgress: 0,
            targetProgress: 15,  // 需要累积15点到达终点
            playerStunned: false  // 下一回合是否不能行动（受惊）
        };

        const playerBar = '■'.repeat(Math.floor(this.gameState.cavalryGame.playerProgress / 2)) + '□'.repeat(8 - Math.floor(this.gameState.cavalryGame.playerProgress / 2));
        const enemyBar = '■'.repeat(Math.floor(this.gameState.cavalryGame.enemyProgress / 2)) + '□'.repeat(8 - Math.floor(this.gameState.cavalryGame.enemyProgress / 2));

        let html = `
            <div class="cavalry-header">
                <h2>${task.name}</h2>
                <p>从起点到终点共需累积15点进度，先到终点获胜</p>
                <div class="cavalry-progress">
                    <p>你的进度: ${playerBar} <strong>${this.gameState.cavalryGame.playerProgress}</strong> / ${this.gameState.cavalryGame.targetProgress}</p>
                    <p>对手进度: ${enemyBar} <strong>${this.gameState.cavalryGame.enemyProgress}</strong> / ${this.gameState.cavalryGame.targetProgress}</p>
                </div>
            </div>
            <div class="cavalry-actions">
                <p>请选择策马方式：</p>
                <div class="cavalry-buttons">
                    <button class="btn primary-btn cavalry-btn" data-choice="steady">
                        1. 稳扎稳打<br>
                        <small style="color: #ffd700;">正常掷骰，无加成无惩罚</small>
                    </button>
                    <button class="btn primary-btn cavalry-btn" data-choice="dash">
                        2. 策马加鞭<br>
                        <small style="color: #ffd700;">掷骰+1（上限6），但若掷出1则马匹受惊，下一回合无法行动</small>
                    </button>
                    <button class="btn primary-btn cavalry-btn" data-choice="block">
                        3. 以身挡道<br>
                        <small style="color: #ffd700;">不增加进度，但对手本回合掷骰-2（下限1）</small>
                    </button>
                </div>
            </div>
            <div class="cavalry-log" id="cavalry-log"></div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        this.bindCavalryEvents();
    }

    bindCavalryEvents() {
        document.querySelectorAll('.cavalry-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.onCavalryChoice(btn.dataset.choice);
            });
        });
    }

    /**
     * 玩家选择了策马方式
     */
    onCavalryChoice(choice) {
        const game = this.gameState.cavalryGame;
        let playerRoll = Math.floor(Math.random() * 6) + 1; // 1d6

        // 根据选择应用修改
        if (choice === 'steady') {
            // 稳扎稳打：不修改
            game.playerProgress += playerRoll;
            this.addCavalryLog(`你选择稳扎稳打，掷出${playerRoll}，进度+${playerRoll}`);
        } else if (choice === 'dash') {
            // 策马加鞭：+1，但若掷出1则受惊下一回合不能动
            playerRoll = Math.min(6, playerRoll + 1);
            game.playerProgress += playerRoll;
            if (playerRoll === 1) {
                game.playerStunned = true;
                this.addCavalryLog(`你选择策马加鞭，掷出${playerRoll}，马匹受惊！下一回合无法行动，进度+${playerRoll}`);
            } else {
                game.playerStunned = false;
                this.addCavalryLog(`你选择策马加鞭，掷出${playerRoll}，进度+${playerRoll}`);
            }
        } else if (choice === 'block') {
            // 以身挡道：自己不前进，对手减2
            this.addCavalryLog(`你选择以身挡道，自己不前进，阻碍对手`);
            playerRoll = 0;
            game.playerStunned = false;
        }

        // 检查玩家是否已经到达终点
        if (game.playerProgress >= game.targetProgress) {
            this.finishCavalryGame();
            return;
        }

        // 对手回合 - AI也随机选择策略（简单AI）
        let enemyChoice = ['steady', 'dash', 'block'][Math.floor(Math.random() * 3)];
        let enemyRoll = Math.floor(Math.random() * 6) + 1;
        let enemyStunned = false;

        if (game.playerStunned) {
            this.addCavalryLog(`你马匹受惊，本回合无法行动`);
        } else {
            // 玩家没被惊到，正常对手回合
            if (enemyChoice === 'steady') {
                game.enemyProgress += enemyRoll;
                this.addCavalryLog(`对手选择稳扎稳打，掷出${enemyRoll}，进度+${enemyRoll}`);
            } else if (enemyChoice === 'dash') {
                enemyRoll = Math.min(6, enemyRoll + 1);
                game.enemyProgress += enemyRoll;
                if (enemyRoll === 1) {
                    enemyStunned = true;
                    this.addCavalryLog(`对手选择策马加鞭，掷出${enemyRoll}，马匹受惊，下一回合无法行动，进度+${enemyRoll}`);
                } else {
                    this.addCavalryLog(`对手选择策马加鞭，掷出${enemyRoll}，进度+${enemyRoll}`);
                }
            } else if (enemyChoice === 'block') {
                // 对手挡道，玩家如果已经掷了骰，不影响了，记录日志
                this.addCavalryLog(`对手选择以身挡道，阻碍你前进`);
            }
        }

        // 更新受惊状态给下一回合
        game.playerStunned = game.playerStunned ? false : enemyStunned;

        // 检查对手是否到达终点
        if (game.enemyProgress >= game.targetProgress) {
            this.finishCavalryGame();
            return;
        }

        // 重新绑定事件等待下一回合
        this.bindCavalryEvents();

        // 滚动到最新日志
        const logEl = document.getElementById('cavalry-log');
        logEl.scrollTop = logEl.scrollHeight;
    }

    /**
     * 添加日志
     */
    addCavalryLog(text) {
        const logEl = document.getElementById('cavalry-log');
        logEl.innerHTML += `<div class="cavalry-log-entry">${text}</div>`;
    }

    /**
     * 结算游戏
     */
    finishCavalryGame() {
        const game = this.gameState.cavalryGame;
        const task = this.gameState.currentTask;
        const won = game.playerProgress >= game.targetProgress && game.enemyProgress < game.targetProgress;
        // 完胜条件：领先对手至少3点进度（策划要求）
        const perfectWin = won && (game.playerProgress - game.enemyProgress >= 3);
        const ratio = won ? (perfectWin ? 1.0 : 0.8) : (game.playerProgress / game.targetProgress);

        const finalMerit = Math.round(task.rewardMerit * ratio);
        const finalMoney = Math.round(task.rewardMoney * ratio);
        const expGained = Math.round(10 * ratio);

        let resultText;
        if (perfectWin) {
            resultText = `🎉 完胜！你率先到达终点且领先对手至少3点进度，获得全额奖励。`;
        } else if (won) {
            resultText = `✅ 获胜！你率先到达终点。`;
        } else {
            resultText = `❌ 失败！对手先到达终点。`;
        }

        this.gameState.merit += finalMerit;
        this.gameState.money += finalMoney;
        if (task.requiredSkill) {
            this.gameState.addSkillExp(task.requiredSkill, expGained);
        }

        this.gameState.checkRolePromotion();
        this.gameState.addLog(`任务【${task.name}】完成：${resultText} 获得 ${finalMerit} 功勋，${finalMoney} 金钱，${expGained} 骑战经验。`);

        this.advanceTwoMonths();
        this.gameState.currentTask = null;
        this.gameState.cavalryGame = null;
        this.gameState.currentScene = GameScene.CITY_VIEW;
        this.renderAll();
    }

    // ========== 修筑城墙小游戏 ==========

    /**
     * 修筑城墙 - 调整石块重量，停止在目标区间
     */
    /**
     * 筑城考工 - 目标重量趋近 (按照策划设计)
     * 使用不同大小石块堆砌，让总重量尽可能接近目标
     */
    renderEngineeringGame() {
        const task = this.gameState.currentTask;
        // 随机目标重量在 1400-1800 之间
        const targetWeight = Math.floor(Math.random() * 400) + 1400;

        this.gameState.engineeringGame = {
            targetWeight: targetWeight,
            currentWeight: 0,
            // 可用石块: 大块500，中块250，小块50，等级够了解锁特小块20
            availableStones: [
                {name: '大块青石', weight: 500},
                {name: '中块条石', weight: 250},
                {name: '小块碎石', weight: 50}
            ]
        };
        const game = this.gameState.engineeringGame;

        let html = `
            <div class="engineering-header">
                <h2>${task.name}</h2>
                <p>用不同大小石块堆砌城墙，让总重量尽可能接近目标重量</p>
                <p>目标重量: <strong>${targetWeight}</strong> 贯</p>
                <p>当前重量: <strong id="current-weight">${game.currentWeight}</strong> 贯</p>
            </div>
            <div class="engineering-actions">
                <p>请选择添加的石块：</p>
                <div style="display: flex; flex-direction: column; gap: 10px; max-width: 500px; margin: 0 auto;">
                    <button class="btn primary-btn engineering-stone" data-weight="500">1. 大块青石 (500贯)</button>
                    <button class="btn primary-btn engineering-stone" data-weight="250">2. 中块条石 (250贯)</button>
                    <button class="btn primary-btn engineering-stone" data-weight="50">3. 小块碎石 (50贯)</button>
                </div>
            </div>
            <div class="engineering-log" id="engineering-log"></div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        this.bindEngineeringEvents();
    }

    bindEngineeringEvents() {
        document.querySelectorAll('.engineering-stone').forEach(btn => {
            btn.addEventListener('click', () => {
                this.addEngineeringStone(parseInt(btn.dataset.weight));
            });
        });
    }

    addEngineeringStone(weight) {
        const game = this.gameState.engineeringGame;
        game.currentWeight += weight;
        const stone = game.availableStones.find(s => s.weight === weight);
        this.addEngineeringLog(`添加了${stone.name}，重量+${weight}，当前${game.currentWeight}贯`);

        document.getElementById('current-weight').textContent = game.currentWeight;

        // 检查是否达到或超过目标
        if (game.currentWeight >= game.targetWeight) {
            this.finishEngineeringGame();
        }
    }

    addEngineeringLog(text) {
        const logEl = document.getElementById('engineering-log');
        logEl.innerHTML += `<div class="engineering-log-entry">${text}</div>`;
        logEl.scrollTop = logEl.scrollHeight;
    }

    finishEngineeringGame() {
        const game = this.gameState.engineeringGame;
        const task = this.gameState.currentTask;

        const error = Math.abs(game.currentWeight - game.targetWeight);
        let ratio;
        let resultText;

        if (error <= 20) {
            ratio = 1.0;
            resultText = `🎉 完胜！总重量${game.currentWeight}，目标${game.targetWeight}，误差${error}贯 ≤ 20，完美符合要求。`;
        } else if (error <= 50) {
            ratio = 0.7;
            resultText = `✅ 合格！总重量${game.currentWeight}，目标${game.targetWeight}，误差${error}贯 ≤ 50，合格。`;
        } else {
            ratio = Math.max(0.2, 1 - error / 100);
            resultText = `❌ 不合格，总重量${game.currentWeight}，目标${game.targetWeight}，误差${error}贯 > 50，误差太大。`;
        }

        const finalMerit = Math.round(task.rewardMerit * ratio);
        const finalMoney = Math.round(task.rewardMoney * ratio);
        const expGained = Math.round(10 * ratio);

        this.gameState.merit += finalMerit;
        this.gameState.money += finalMoney;
        if (task.requiredSkill) {
            this.gameState.addSkillExp(task.requiredSkill, expGained);
        }

        this.gameState.checkRolePromotion();
        this.gameState.addLog(`任务【${task.name}】完成：${resultText} 获得 ${finalMerit} 功勋，${finalMoney} 金钱，${expGained} 工政经验。`);

        this.advanceTwoMonths();
        this.gameState.currentTask = null;
        this.gameState.engineeringGame = null;
        this.gameState.currentScene = GameScene.CITY_VIEW;
        this.renderAll();
    }

    // ========== 商政珠算小游戏 ==========

    /**
     * 珠算商贾 - 快速心算答题 (按照策划设计)
     * 连续回答6道商业算术题，计算价格利润
     */
    renderTradeGame() {
        const task = this.gameState.currentTask;
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
        this.gameState.tradeGame = {
            questions: [],
            current: 0,
            correct: 0
        };
        const game = this.gameState.tradeGame;

        // 随机打乱选6题
        const shuffled = questionPool.sort(() => Math.random() - 0.5);
        game.questions = shuffled.slice(0, 6);

        this.renderTradeRound();
    }

    /**
     * 渲染当前题目
     */
    renderTradeRound() {
        const game = this.gameState.tradeGame;
        const q = game.questions[game.current];

        let html = `
            <div class="trade-header">
                <h2>${this.gameState.currentTask.name}</h2>
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
            this.checkTradeAnswer(userAnswer);
        });
    }

    /**
     * 检查答案
     */
    checkTradeAnswer(userAnswer) {
        const game = this.gameState.tradeGame;
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
            setTimeout(() => this.finishTradeGame(), 1500);
        } else {
            // 下一题
            setTimeout(() => this.renderTradeRound(), 1500);
        }
    }

    /**
     * 结算
     */
    finishTradeGame() {
        const game = this.gameState.tradeGame;
        const task = this.gameState.currentTask;

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

        this.gameState.merit += finalMerit;
        this.gameState.money += finalMoney;
        if (task.requiredSkill) {
            this.gameState.addSkillExp(task.requiredSkill, expGained);
        }

        this.gameState.checkRolePromotion();
        this.gameState.addLog(`任务【${task.name}】完成：${resultText} 获得 ${finalMerit} 功勋，${finalMoney} 金钱，${expGained} 商政经验。`);

        this.advanceTwoMonths();
        this.gameState.currentTask = null;
        this.gameState.tradeGame = null;
        this.gameState.currentScene = GameScene.CITY_VIEW;
        this.renderAll();
    }

    // ========== 律政找证据小游戏 ==========

    /**
     * 找证据 - 翻牌配对，找出相同的两份证据
     */
    /**
     * 明律断案 - 律政小游戏
     * 找出证词矛盾 + 选择正确法律条文
     */
    renderLawGame() {
        const task = this.gameState.currentTask;

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
                    {text: '抢夺财物者，杖一百徒三年', correct: false}
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
        this.gameState.lawGame = {
            case: randomCase,
            statements: statements,
            selectedStatements: [],
            selectedLaw: null,
            correctContradiction: randomCase.contradiction.map(idx => randomCase.statements[idx]),
            step: 'select_contradiction' // select_contradiction -> select_law -> result
        };

        const game = this.gameState.lawGame;

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
        this.bindLawEvents();
    }

    bindLawEvents() {
        const game = this.gameState.lawGame;
        document.querySelectorAll('.stmt-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (game.step === 'select_contradiction') {
                    this.onStatementClick(parseInt(btn.dataset.idx));
                }
            });
        });

        const nextBtn = document.getElementById('law-next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.goToLawStep('select_law');
            });
        }
    }

    onStatementClick(idx) {
        const game = this.gameState.lawGame;
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
    }

    goToLawStep(step) {
        const game = this.gameState.lawGame;
        game.step = step;

        if (step === 'select_law') {
            let html = `
                <div class="law-header">
                    <h2>${this.gameState.currentTask.name} - ${game.case.title}</h2>
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
                this.renderLawGame();
            });

            document.querySelectorAll('.law-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.onLawSelect(parseInt(btn.dataset.idx));
                });
            });

            document.getElementById('law-submit-btn').addEventListener('click', () => {
                this.finishLawGame();
            });
        }
    }

    onLawSelect(idx) {
        const game = this.gameState.lawGame;
        game.selectedLaw = idx;

        document.querySelectorAll('.law-btn').forEach(btn => {
            btn.style.background = '';
            btn.style.borderColor = '';
        });

        const selectedBtn = document.querySelector(`.law-btn[data-idx="${idx}"]`);
        selectedBtn.style.background = '#e8dcc8';
        selectedBtn.style.borderColor = '#8b4513';

        document.getElementById('law-submit-btn').disabled = false;
    }

    finishLawGame() {
        const game = this.gameState.lawGame;
        const task = this.gameState.currentTask;

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

        this.gameState.merit += finalMerit;
        this.gameState.money += finalMoney;
        if (task.requiredSkill) {
            this.gameState.addSkillExp(task.requiredSkill, expGained);
        }

        this.gameState.checkRolePromotion();
        this.gameState.addLog(`任务【${task.name}】完成！${resultTitle} 获得 ${finalMerit} 功勋，${finalMoney} 金钱，${expGained} ${getSkillById(task.requiredSkill)?.name || ''}经验。`);

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
            this.advanceTwoMonths();
            this.gameState.currentTask = null;
            this.gameState.lawGame = null;
            this.gameState.currentScene = GameScene.CITY_VIEW;
            this.renderAll();
        });
    }

    // ========== 水战小游戏 ==========

    /**
     * 水战 - 船队左右移动躲开暗礁
     */
    /**
     * 楼船破浪 - 水战小游戏
     * 资源分配航行，总航程15段，合理分配体力和士气
     */
    renderNavyGame() {
        const task = this.gameState.currentTask;

        // 初始化游戏状态 - 按照策划
        this.gameState.navyGame = {
            progress: 0,          // 当前航程段
            total: 15,           // 总航程
            stamina: 10,         // 体力
            morale: 10,         // 士气
            lastEvent: null,    // 最后事件
            gameOver: false
        };

        const game = this.gameState.navyGame;

        // 计算进度条百分比
        const progressPercent = (game.progress / game.total) * 100;

        let html = `
            <div class="navy-header">
                <h2>${task.name}</h2>
                <p>指挥楼船航行至目的地，总航程 ${game.total} 段，合理分配体力与士气</p>
            </div>
            <div class="navy-stats" style="background: #f5f0e1; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <div style="margin-bottom: 10px;">
                    <strong>航程：</strong> ${game.progress} / ${game.total} 段
                    <div style="background: #ddd; height: 20px; border-radius: 10px; margin-top: 5px;">
                        <div style="background: #4a90e2; height: 100%; width: ${progressPercent}%; border-radius: 10px; transition: width 0.3s;"></div>
                    </div>
                </div>
                <div style="display: flex; gap: 20px;">
                    <div><strong>体力：</strong> ${game.stamina}</div>
                    <div><strong>士气：</strong> ${game.morale}</div>
                </div>
                ${game.lastEvent ? `<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ccc; color: #8b4513;"><strong>最近海况：</strong> ${game.lastEvent}</div>` : ''}
            </div>
            <div class="navy-actions" style="display: flex; flex-direction: column; gap: 10px; margin: 15px 0;">
                <div style="background: #fff8e1; padding: 12px; border-radius: 6px;">
                    <button class="btn primary-btn" id="action-full" style="width: 100%; margin-bottom: 8px;">全速前进</button>
                    <p style="margin: 0; font-size: 14px; color: #666;">前进 +2 段 • 消耗 士气-2</p>
                </div>
                <div style="background: #f0f9eb; padding: 12px; border-radius: 6px;">
                    <button class="btn primary-btn" id="action-half" style="width: 100%; margin-bottom: 8px;">中速巡航</button>
                    <p style="margin: 0; font-size: 14px; color: #666;">前进 +1 段 • 消耗 体力-1</p>
                </div>
                <div style="background: #e3f2fd; padding: 12px; border-radius: 6px;">
                    <button class="btn primary-btn" id="action-rest" style="width: 100%; margin-bottom: 8px;">停船休整</button>
                    <p style="margin: 0; font-size: 14px; color: #666;">不前进 • 恢复 体力+2 或 士气+2</p>
                </div>
            </div>
            <div class="navy-desc" style="color: #666; font-size: 14px; margin-top: 20px;">
                <p><strong>规则说明：</strong>每前进3段遭遇一次随机海况，体力或士气任意一项归零则航行失败。到达终点即胜利。</p>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;

        document.getElementById('action-full').addEventListener('click', () => {
            this.onNavyAction('full');
        });
        document.getElementById('action-half').addEventListener('click', () => {
            this.onNavyAction('half');
        });
        document.getElementById('action-rest').addEventListener('click', () => {
            this.onNavyAction('rest');
        });
    }

    onNavyAction(action) {
        const game = this.gameState.navyGame;

        if (action === 'full') {
            if (game.morale < 2) {
                alert('士气不足，无法全速前进！');
                return;
            }
            game.morale -= 2;
            game.progress += 2;
        } else if (action === 'half') {
            if (game.stamina < 1) {
                alert('体力不足，无法巡航！');
                return;
            }
            game.stamina -= 1;
            game.progress += 1;
        } else if (action === 'rest') {
            // 询问恢复什么
            const choice = confirm('点击确定恢复【体力+2】，点击取消恢复【士气+2】');
            if (choice) {
                game.stamina = Math.min(10, game.stamina + 2);
                game.lastEvent = '停船休整，恢复了2点体力';
            } else {
                game.morale = Math.min(10, game.morale + 2);
                game.lastEvent = '停船休整，恢复了2点士气';
            }
            // 不前进
        }

        // 检查是否失败
        if (game.stamina <= 0 || game.morale <= 0) {
            this.finishNavyGame(false);
            return;
        }

        // 检查是否到达终点
        if (game.progress >= game.total) {
            this.finishNavyGame(true);
            return;
        }

        // 每前进3段触发一次事件
        const prevEventTrigger = Math.floor((game.progress - (action === 'full' ? 2 : action === 'half' ? 1 : 0)) / 3);
        const currEventTrigger = Math.floor(game.progress / 3);
        if (currEventTrigger > prevEventTrigger) {
            // 触发随机事件
            const events = [
                {text: '遭遇海风，船帆受损，士气-2', effect: (g) => { g.morale -= 2; }},
                {text: '顺风顺水，航速加快，额外前进1段', effect: (g) => { g.progress += 1; }},
                {text: '捕获大鱼，水手士气大振，士气+2', effect: (g) => { g.morale += 2; }},
                {text: '发现淡水补给，体力恢复+2', effect: (g) => { g.stamina += 2; }},
                {text: '水中暗流，船身颠簸，体力-2', effect: (g) => { g.stamina -= 2; }},
                {text: '晴空万里，水手心情愉悦，体力士气+1', effect: (g) => { g.stamina += 1; g.morale += 1; }},
                {text: '遭遇海盗，一番周旋，体力-3士气-2', effect: (g) => { g.stamina -= 3; g.morale -= 2; }},
                {text: '发现无人小岛，补充补给，体力+2', effect: (g) => { g.stamina += 2; }}
            ];
            const event = events[Math.floor(Math.random() * events.length)];
            event.effect(game);
            game.lastEvent = event.text;

            // 再次检查失败
            if (game.stamina <= 0 || game.morale <= 0) {
                this.finishNavyGame(false);
                return;
            }

            // 再次检查终点
            if (game.progress >= game.total) {
                this.finishNavyGame(true);
                return;
            }
        }

        // 重新渲染
        this.renderNavyGame();
    }

    finishNavyGame(success) {
        const game = this.gameState.navyGame;
        const task = this.gameState.currentTask;

        let ratio;
        let resultTitle, resultDesc;

        if (success && game.progress >= game.total) {
            // 成功，根据剩余资源计算奖励倍率
            const remaining = game.stamina + game.morale;
            ratio = 0.7 + (remaining / 20) * 0.3; // 0.7 ~ 1.0
            resultTitle = '✔ 航行成功！';
            resultDesc = `你指挥楼船成功抵达目的地，剩余体力 ${game.stamina} 士气 ${game.morale}，航行圆满成功！`;
        } else {
            // 失败，按进度给部分奖励
            ratio = Math.max(0.2, game.progress / game.total * 0.5);
            resultTitle = '✘ 航行失败';
            if (game.stamina <= 0) {
                resultDesc = '水手体力耗尽，不得不漂流返航，只前进了' + game.progress + '段。';
            } else {
                resultDesc = '全军士气低落，无心航行，不得不漂流返航，只前进了' + game.progress + '段。';
            }
        }

        const finalMerit = Math.round(task.rewardMerit * ratio);
        const finalMoney = Math.round(task.rewardMoney * ratio);
        const expGained = Math.round(15 * ratio);

        this.gameState.merit += finalMerit;
        this.gameState.money += finalMoney;
        if (task.requiredSkill) {
            this.gameState.addSkillExp(task.requiredSkill, expGained);
        }

        this.gameState.checkRolePromotion();
        this.gameState.addLog(`任务【${task.name}】${resultTitle} 前进 ${game.progress}/${game.total} 段，获得 ${finalMerit} 功勋，${finalMoney} 金钱，${expGained} ${getSkillById(task.requiredSkill)?.name || ''}经验。`);

        // 显示结果
        let html = `
            <div class="navy-result" style="text-align: center; padding: 30px;">
                <h2 style="font-size: 28px; margin-bottom: 20px; color: #8b4513;">${resultTitle}</h2>
                <p style="font-size: 16px; margin-bottom: 20px;">${resultDesc}</p>
                <div style="background: #f5f0e1; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                    <p>最终航程：${game.progress} / ${game.total} 段</p>
                    <p>剩余体力：${game.stamina} | 剩余士气：${game.morale}</p>
                </div>
                <p>获得：${finalMerit} 功勋，${finalMoney} 金钱</p>
                <div style="margin-top: 30px;">
                    <button class="btn primary-btn" id="navy-done-btn">返回</button>
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        document.getElementById('navy-done-btn').addEventListener('click', () => {
            this.advanceTwoMonths();
            this.gameState.currentTask = null;
            this.gameState.navyGame = null;
            this.gameState.currentScene = GameScene.CITY_VIEW;
            this.renderAll();
        });
    }

    // ========== 兵法排布阵型小游戏 ==========

    /**
     * 排兵布阵 - 兵法小游戏
     * 选择克制对方的阵型，一步步推进战线
     * 鱼鳞克鹤翼，鹤翼克方圆，方圆克鱼鳞
     */
    renderStrategyGame() {
        const task = this.gameState.currentTask;

        // 阵型定义和克制关系
        // 鱼鳞 ↗ 克 鹤翼 | 鹤翼 ↗ 克 方圆 | 方圆 ↗ 克 鱼鳞
        const formations = {
            '鱼鳞': {beats: ['鹤翼'], description: '密集阵形，冲击力强，克制鹤翼'},
            '鹤翼': {beats: ['方圆'], description: '散开阵形，包抄迂回，克制方圆'},
            '方圆': {beats: ['鱼鳞'], description: '坚固阵形，稳如泰山，克制鱼鳞'}
        };

        // 初始化游戏状态
        this.gameState.strategyGame = {
            playerProgress: 0,    // 我方推进进度
            enemyProgress: 0,    // 敌方推进进度
            maxProgress: 5,      // 先到5格获胜
            history: [],         // 对战历史
            currentEnemy: null   // 敌方这回合出什么
        };

        // 敌方第一回合随机出阵
        const game = this.gameState.strategyGame;
        game.currentEnemy = Object.keys(formations)[Math.floor(Math.random() * 3)];

        let html = `
            <div class="strategy-header">
                <h2>${task.name}</h2>
                <p>选择阵型克制对方，先推进 5 格到敌营获胜</p>
            </div>
            <div class="strategy-clues" style="background: #f5f0e1; padding: 12px; border-radius: 8px; margin: 15px 0;">
                <p><strong>克制关系：</strong></p>
                <p style="color: #8b4513; margin: 5px 0;">▶ 鱼鳞 → 克制 鹤翼</p>
                <p style="color: #8b4513; margin: 5px 0;">▶ 鹤翼 → 克制 方圆</p>
                <p style="color: #8b4513; margin: 5px 0;">▶ 方圆 → 克制 鱼鳞</p>
            </div>
            <div class="strategy-progress" style="display: flex; justify-content: space-between; margin: 15px 0;">
                <div style="text-align: center;">
                    <p><strong>我军推进</strong></p>
                    <div style="background: #ddd; width: 150px; height: 20px; border-radius: 10px;">
                        <div style="background: #2ecc71; height: 100%; width: ${(game.playerProgress / game.maxProgress) * 100}%; border-radius: 10px;"></div>
                    </div>
                    <p>${game.playerProgress} / ${game.maxProgress}</p>
                </div>
                <div style="text-align: center;">
                    <p><strong>敌军推进</strong></p>
                    <div style="background: #ddd; width: 150px; height: 20px; border-radius: 10px;">
                        <div style="background: #e74c3c; height: 100%; width: ${(game.enemyProgress / game.maxProgress) * 100}%; border-radius: 10px;"></div>
                    </div>
                    <p>${game.enemyProgress} / ${game.maxProgress}</p>
                </div>
            </div>
            <div class="strategy-enemy" style="background: #ffebee; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p><strong>敌方这回合排出：</strong> <span style="font-size: 20px; color: #c0392b;">${game.currentEnemy}</span></p>
                <p style="color: #666; margin: 5px 0 0 0;">请选择你的阵型应对：</p>
            </div>
            <div class="strategy-actions" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin: 15px 0;">
        `;

        for (const [name, info] of Object.entries(formations)) {
            html += `
                <button class="btn primary-btn formation-btn" data-formation="${name}" style="height: auto; padding: 15px;">
                    <strong style="font-size: 18px;">${name}</strong><br>
                    <span style="font-size: 12px; color: #666;">${info.description}</span>
                </button>
            `;
        }

        html += `
            </div>
            <div class="strategy-history" style="margin-top: 20px;">
                <p><strong>对战记录：</strong></p>
                <div id="history-list"></div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;

        document.querySelectorAll('.formation-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.onStrategySelect(btn.dataset.formation);
            });
        });
    }

    onStrategySelect(playerFormation) {
        const game = this.gameState.strategyGame;
        const enemyFormation = game.currentEnemy;

        // 判定是否克制
        const formations = {
            '鱼鳞': {beats: ['鹤翼']},
            '鹤翼': {beats: ['方圆']},
            '方圆': {beats: ['鱼鳞']}
        };

        let resultText;

        if (formations[playerFormation].beats.includes(enemyFormation)) {
            // 我方克制，我方推进
            game.playerProgress++;
            resultText = `<span style="color: green;">✔ 你克制了敌军，我方前进一格！</span>`;
        } else if (formations[enemyFormation].beats.includes(playerFormation)) {
            // 敌方克制，敌方推进
            game.enemyProgress++;
            resultText = `<span style="color: red;">✘ 敌军克制了你，敌军前进一格！</span>`;
        } else {
            // 同阵型，都不推进
            resultText = `<span style="color: #666;">⚔ 双方同阵型，相持不下，互不前进。</span>`;
        }

        // 记录历史
        game.history.push({
            player: playerFormation,
            enemy: enemyFormation,
            result: resultText
        });

        // 检查是否游戏结束
        if (game.playerProgress >= game.maxProgress) {
            // 我方获胜
            this.finishStrategyGame(true);
            return;
        }
        if (game.enemyProgress >= game.maxProgress) {
            // 敌方获胜
            this.finishStrategyGame(false);
            return;
        }

        // 敌方下一回合随机出阵
        game.currentEnemy = Object.keys(formations)[Math.floor(Math.random() * 3)];

        // 重新渲染
        this.renderStrategyGame();

        // 重新渲染历史记录
        let historyHtml = '';
        game.history.forEach((h, i) => {
            historyHtml += `
                <div style="padding: 8px; border-bottom: 1px solid #eee;">
                    回合 ${i+1}: 你出【${h.player}】敌军出【${h.enemy}】→ ${h.result}
                </div>
            `;
        });
        document.getElementById('history-list').innerHTML = historyHtml;
    }

    finishStrategyGame(playerWin) {
        const game = this.gameState.strategyGame;
        const task = this.gameState.currentTask;

        let ratio;
        let resultTitle, resultDesc;

        if (playerWin) {
            // 获胜，根据我方战败对方多少格计算奖励
            const remaining = game.maxProgress - game.enemyProgress;
            ratio = 0.8 + (remaining / game.maxProgress) * 0.2; // 0.8 ~ 1.0
            resultTitle = '✔ 推演胜利！';
            resultDesc = '你成功击破敌军阵型，推进到敌营，推演大获全胜！';
        } else {
            // 失败，按我方推进多少给奖励
            ratio = Math.max(0.2, (game.playerProgress / game.maxProgress) * 0.6);
            resultTitle = '✘ 推演失败';
            resultDesc = `你的阵型被敌军层层克制，我方只推进了 ${game.playerProgress} 格，不得不收兵回营。`;
        }

        const finalMerit = Math.round(task.rewardMerit * ratio);
        const finalMoney = Math.round(task.rewardMoney * ratio);
        const expGained = Math.round(15 * ratio);

        this.gameState.merit += finalMerit;
        this.gameState.money += finalMoney;
        if (task.requiredSkill) {
            this.gameState.addSkillExp(task.requiredSkill, expGained);
        }

        this.gameState.checkRolePromotion();
        this.gameState.addLog(`任务【${task.name}】${resultTitle} 我军推进${game.playerProgress}格，获得 ${finalMerit} 功勋，${finalMoney} 金钱，${expGained} ${getSkillById(task.requiredSkill)?.name || ''}经验。`);

        // 显示结果页
        let html = `
            <div class="strategy-result" style="text-align: center; padding: 30px;">
                <h2 style="font-size: 28px; margin-bottom: 20px; color: #8b4513;">${resultTitle}</h2>
                <p style="font-size: 16px; margin-bottom: 20px;">${resultDesc}</p>
                <div style="background: #f5f0e1; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                    <p>最终推进：我军 ${game.playerProgress} - 敌军 ${game.enemyProgress}</p>
                </div>
                <p>获得：${finalMerit} 功勋，${finalMoney} 金钱</p>
                <div style="margin-top: 30px;">
                    <button class="btn primary-btn" id="strategy-done-btn">返回</button>
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        document.getElementById('strategy-done-btn').addEventListener('click', () => {
            this.advanceTwoMonths();
            this.gameState.currentTask = null;
            this.gameState.strategyGame = null;
            this.gameState.currentScene = GameScene.CITY_VIEW;
            this.renderAll();
        });
    }

    // ========== 个人战系统 - 武馆切磋 ==========

    /**
     * 武馆切磋 - 个人战小游戏
     * 完整实现太阁立志传风格个人战系统
     */
    renderMartialGame() {
        const task = this.gameState.currentTask;

        // 获取玩家属性
        const player = this.gameState.getPlayerCharacter();
        const strength = player.strength || 50;
        const martialLevel = this.gameState.getSkillLevel('martial') || 0;

        // 计算初始属性
        const maxHp = strength * 2 + 50;
        const handSize = 4 + martialLevel; // 武艺LV0=4, LV3=7

        // 对手 - 馆主，中等属性
        const enemy = {
            name: '武馆师傅',
            maxHp: (strength - 10) * 2 + 50,
            hp: (strength - 10) * 2 + 50,
            handSize: 4 + Math.max(0, martialLevel - 1),
            skillLevel: {martial: Math.max(0, martialLevel - 1)}
        };

        // 初始化牌堆 - 数字卡 1-9 + 已学会的特殊技
        let playerDeck = [];
        // 数字卡 1-9 各一张
        for (let i = 1; i <= 9; i++) {
            playerDeck.push({type: 'number', value: i});
        }
        // 添加默认特殊技太祖长拳
        playerDeck.push({type: 'special', cardId: 'taizu_boxing'});

        // 洗牌
        playerDeck.sort(() => Math.random() - 0.5);

        // 敌人牌堆
        const enemyDeck = this.buildEnemyDeck(enemy);

        // 初始化游戏状态 - 敌人和玩家结构统一
        this.gameState.martialGame = {
            player: {
                hp: maxHp,
                maxHp: maxHp,
                hand: [],
                deck: playerDeck,
                discard: [],
                handSize: handSize,
                skillLevel: {martial: martialLevel}
            },
            enemy: {
                hp: enemy.maxHp,
                maxHp: enemy.maxHp,
                hand: [],
                deck: enemyDeck,
                discard: [],
                handSize: enemy.handSize,
                skillLevel: enemy.skillLevel
            },
            round: 1,
            phase: 'select', // select -> playing -> result -> next
            playerMove: null,
            enemyMove: null,
            enemyCombo: null,
            comboActivated: null,
            dodgeNext: false,
            gameOver: false
        };

        // 抽初始手牌
        this.drawCardsToHand(this.gameState.martialGame.player, handSize);
        this.drawCardsToHand(this.gameState.martialGame.enemy, enemy.handSize);

        this.renderMartialRound();
    }

    /**
     * 构建对手牌堆
     */
    buildEnemyDeck(enemy) {
        let deck = [];
        // 数字卡
        for (let i = 1; i <= 9; i++) {
            deck.push({type: 'number', value: i});
        }
        // 添加基础特殊技
        deck.push({type: 'special', cardId: 'taizu_boxing'});
        deck.push({type: 'special', cardId: 'jin-gang_li'});
        deck.sort(() => Math.random() - 0.5);
        return deck;
    }

    /**
     * 抽牌到手牌
     */
    drawCardsToHand(fighter, handSize) {
        while (fighter.hand.length < handSize && fighter.deck.length > 0) {
            const card = fighter.deck.shift();
            fighter.hand.push(card);
        }
        // 如果牌堆空了，洗牌弃牌堆
        if (fighter.deck.length === 0 && fighter.discard.length > 0) {
            fighter.deck = [...fighter.discard];
            fighter.discard = [];
            fighter.deck.sort(() => Math.random() - 0.5);
            // 继续抽
            while (fighter.hand.length < handSize && fighter.deck.length > 0) {
                fighter.hand.push(fighter.deck.shift());
            }
        }
    }

    /**
     * 渲染当前回合
     */
    renderMartialRound() {
        const game = this.gameState.martialGame;
        const player = game.player;
        const enemy = game.enemy;

        const playerHpPercent = (player.hp / player.maxHp) * 100;
        const enemyHpPercent = (enemy.hp / enemy.maxHp) * 100;

        // 分出类型：数字卡和特殊卡
        const numberCards = player.hand.filter(c => c.type === 'number');
        const specialCards = player.hand.filter(c => c.type === 'special');

        let html = `
            <div class="personal-battle-header">
                <h2>个人战 · ${this.gameState.currentTask.name}</h2>
                <div class="battle-status" style="display: flex; justify-content: space-between; margin: 10px 0;">
                    <div class="player-status">
                        <p><strong>你</strong> (武艺Lv${player.skillLevel.martial})</p>
                        <p>体力: ${player.hp}/${player.maxHp}</p>
                        <div style="background: #ddd; height: 15px; border-radius: 8px; width: 150px;">
                            <div style="background: #2ecc71; height: 100%; width: ${playerHpPercent}%; border-radius: 8px;"></div>
                        </div>
                    </div>
                    <div class="enemy-status">
                        <p><strong>${enemy.name}</strong></p>
                        <p>体力: ${enemy.hp}/${enemy.maxHp}</p>
                        <div style="background: #ddd; height: 15px; border-radius: 8px; width: 150px;">
                            <div style="background: #e74c3c; height: 100%; width: ${enemyHpPercent}%; border-radius: 8px;"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="battle-rules" style="background: #f5f0e1; padding: 10px; border-radius: 8px; margin: 10px 0;">
                <p><strong>回合 ${game.round}</strong> | 手牌：${player.hand.length} 张</p>
                <p style="font-size: 14px; color: #666;">请选择：最多出 1 张特殊技 + 最多 3 张数字卡</p>
            </div>
            <div class="player-hand" style="margin: 15px 0;">
                <div class="special-cards" style="margin-bottom: 15px;">
                    <p><strong>特殊技卡片（最多选1张）：</strong></p>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
                        <button class="btn special-card-btn" data-action="none" style="background: ${game.playerMove && game.playerMove.special === null ? '#e8dcc8' : ''};">不选</button>
                        ${specialCards.map(c => {
                            const spec = PERSONAL_SPECIALS.find(s => s.id === c.cardId);
                            const selected = game.playerMove && game.playerMove.special === c.cardId;
                            return `<button class="btn special-card-btn" data-card="${c.cardId}" style="background: ${selected ? '#e8dcc8' : '#fff'}; color: #333; border: 2px solid #c0392b;">${spec.name}</button>`;
                        }).join('')}
                    </div>
                </div>
                <div class="number-cards">
                    <p><strong>数字卡片（最多选3张，点击选择/取消）：</strong></p>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
                        ${numberCards.map(c => {
                            const selected = game.playerMove && game.playerMove.numbers.includes(c.value);
                            return `<button class="btn number-card-btn" data-value="${c.value}" style="background: ${selected ? '#e8dcc8' : '#fff'}; color: #333; border: 2px solid #2c3e50; width: 50px;">${c.value}</button>`;
                        }).join('')}
                    </div>
                </div>
            </div>
            <div class="battle-actions" style="margin: 20px 0;">
                <button class="btn secondary-btn" id="clear-selection-btn">清空选择</button>
                <button class="btn primary-btn" id="confirm-play-btn" disabled style="margin-left: 10px;">出牌确认</button>
            </div>
            <div class="battle-log" id="battle-log" style="max-height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; border-radius: 5px; margin-top: 15px;">
                ${game.round === 1 ? '对局开始，请出牌...' : ''}
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        this.bindMartialBattleEvents();
    }

    /**
     * 绑定事件
     */
    bindMartialBattleEvents() {
        // 特殊卡选择
        document.querySelectorAll('.special-card-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const game = this.gameState.martialGame;
                if (!game.playerMove) game.playerMove = {special: null, numbers: []};

                if (btn.dataset.action === 'none') {
                    game.playerMove.special = null;
                    document.querySelectorAll('.special-card-btn').forEach(b => {
                        b.style.background = '';
                    });
                    btn.style.background = '#e8dcc8';
                } else {
                    game.playerMove.special = btn.dataset.card;
                    document.querySelectorAll('.special-card-btn').forEach(b => {
                        b.style.background = b.dataset.action === 'none' ? '#e8dcc8' : '#fff';
                    });
                    btn.style.background = '#e8dcc8';
                }
                this.updateConfirmButton();
            });
        });

        // 数字卡选择
        document.querySelectorAll('.number-card-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const game = this.gameState.martialGame;
                if (!game.playerMove) game.playerMove = {special: null, numbers: []};

                const value = parseInt(btn.dataset.value);
                const idx = game.playerMove.numbers.indexOf(value);
                if (idx >= 0) {
                    // 取消选择
                    game.playerMove.numbers.splice(idx, 1);
                    btn.style.background = '#fff';
                } else {
                    // 超过3张不能选
                    if (game.playerMove.numbers.length >= 3) {
                        return;
                    }
                    game.playerMove.numbers.push(value);
                    btn.style.background = '#e8dcc8';
                }
                this.updateConfirmButton();
            });
        });

        // 清空选择
        document.getElementById('clear-selection-btn').addEventListener('click', () => {
            const game = this.gameState.martialGame;
            game.playerMove = {special: null, numbers: []};
            this.renderMartialRound();
        });

        // 确认出牌
        document.getElementById('confirm-play-btn').addEventListener('click', () => {
            this.resolveMartialRound();
        });
    }

    /**
     * 更新确认按钮状态
     */
    updateConfirmButton() {
        const game = this.gameState.martialGame;
        const btn = document.getElementById('confirm-play-btn');
        // 至少要有一张牌
        const hasCard = (game.playerMove.special !== null) || (game.playerMove.numbers.length > 0);
        btn.disabled = !hasCard;
    }

    /**
     * 结算当前回合
     */
    resolveMartialRound() {
        const game = this.gameState.martialGame;
        const player = game.player;
        const enemy = game.enemy;

        // AI随机出牌
        this.aiEnemyPlay();

        // 识别玩家数字组合
        const playerCombo = this.identifyCombo(game.playerMove.numbers);
        if (playerCombo) {
            game.comboActivated = playerCombo;
        }
        // 识别敌人数字组合
        const enemyCombo = this.identifyCombo(game.enemyMove.numbers);
        if (enemyCombo) {
            game.enemyCombo = enemyCombo;
        }

        // 计算双方优先度
        const playerPriority = this.calculatePriority(game.playerMove, playerCombo, true);
        const enemyPriority = this.calculatePriority(game.enemyMove, game.enemyCombo, false);

        let firstFighter, secondFighter;
        let firstMove, secondMove;
        let firstCombo, secondCombo;
        let firstIsPlayer = true;

        // 后发先至交换顺序
        if (playerCombo && playerCombo.swapPriority) {
            if (playerPriority < enemyPriority) {
                // 交换
                firstFighter = player;
                secondFighter = enemy;
                firstMove = game.playerMove;
                secondMove = game.enemyMove;
                firstCombo = playerCombo;
                secondCombo = game.enemyCombo;
            }
        } else if (enemyCombo && enemyCombo.swapPriority) {
            if (enemyPriority < playerPriority) {
                firstFighter = enemy;
                secondFighter = player;
                firstMove = game.enemyMove;
                secondMove = game.playerMove;
                firstCombo = game.enemyCombo;
                secondCombo = playerCombo;
                firstIsPlayer = false;
            }
        } else {
            if (playerPriority >= enemyPriority) {
                firstFighter = player;
                secondFighter = enemy;
                firstMove = game.playerMove;
                secondMove = game.enemyMove;
                firstCombo = playerCombo;
                secondCombo = game.enemyCombo;
                firstIsPlayer = true;
            } else {
                firstFighter = enemy;
                secondFighter = player;
                firstMove = game.enemyMove;
                secondMove = game.playerMove;
                firstCombo = game.enemyCombo;
                secondCombo = playerCombo;
                firstIsPlayer = false;
            }
        }

        // 记录日志
        let log = this.getRoundStartLog(playerPriority, enemyPriority, firstIsPlayer);
        game.log = log;

        // 第一人攻击第二人
        this.performAttack(firstFighter, secondFighter, firstMove, firstCombo, game, firstIsPlayer);

        if (secondFighter.hp <= 0) {
            this.finishMartialBattle();
            return;
        }

        // 检查第二人是否完全防御
        let secondCanAttack = true;
        if (game.dodgeNext && firstIsPlayer) {
            // 玩家八卦游身闪避了
            game.log += '\n你施展八卦游身，闪避了对手攻击！';
            game.dodgeNext = false;
            secondCanAttack = false;
        }

        // 检查铁门闩完全防御
        if (firstMove.special) {
            const spec = PERSONAL_SPECIALS.find(s => s.id === firstMove.special);
            if (spec && spec.fullDefense && firstIsPlayer) {
                game.log += '\n你施展铁门闩，完全防御对手攻击！';
                secondCanAttack = false;
            }
        }
        if (firstMove.special && firstIsPlayer === false) {
            const spec = PERSONAL_SPECIALS.find(s => s.id === firstMove.special);
            if (spec && spec.fullDefense) {
                game.log += '\n对手施展铁门闩，完全防御你的攻击！';
                secondCanAttack = false;
            }
        }

        if (secondCanAttack) {
            this.performAttack(secondFighter, firstFighter, secondMove, secondCombo, game, !firstIsPlayer);
        }

        if (firstFighter.hp <= 0 || secondFighter.hp <= 0) {
            this.finishMartialBattle();
            return;
        }

        // 弃牌抽新牌
        this.discardAndDraw(player);
        this.discardAndDraw(enemy);

        game.round++;
        game.playerMove = null;
        game.enemyMove = null;
        game.enemyCombo = null;
        game.comboActivated = null;

        // 渲染下一回合
        this.renderMartialRound();
        // 添加历史日志
        document.getElementById('battle-log').innerHTML = game.log.replace(/\n/g, '<br>');
    }

    /**
     * AI出牌
     */
    aiEnemyPlay() {
        const game = this.gameState.martialGame;
        const enemy = game.enemy;

        // AI简单策略：如果有特殊技就出，然后选1-3个数字卡
        let special = null;
        const specialCards = enemy.hand.filter(c => c.type === 'special');
        if (specialCards.length > 0 && Math.random() > 0.3) {
            // 随机出一张
            special = specialCards[Math.floor(Math.random() * specialCards.length)].cardId;
        }

        // 选数字卡 - 随机选1-3张
        const numberCards = enemy.hand.filter(c => c.type === 'number').map(c => c.value);
        const count = Math.min(numberCards.length, Math.floor(Math.random() * 3) + 1);
        const selectedNumbers = [];
        for (let i = 0; i < count && numberCards.length > 0; i++) {
            const idx = Math.floor(Math.random() * numberCards.length);
            selectedNumbers.push(numberCards[idx]);
            numberCards.splice(idx, 1);
        }

        game.enemyMove = {special, numbers: selectedNumbers};
        game.enemyCombo = this.identifyCombo(selectedNumbers);
    }

    /**
     * 识别数字组合
     */
    identifyCombo(numbers) {
        if (numbers.length === 0) return null;
        // 排序便于匹配
        const sorted = [...numbers].sort((a, b) => a - b);

        // 先检查4连
        for (const combo of PERSONAL_COMBOS) {
            const cSorted = [...combo.numbers].sort((a, b) => a - b);
            if (cSorted.length === sorted.length && cSorted.every((v, i) => v === sorted[i])) {
                return combo;
            }
        }
        return null;
    }

    /**
     * 计算优先度
     */
    calculatePriority(move, combo, isPlayer) {
        let priority = 0;

        // 秘传 > 特殊 > 组合
        // 这里简化：特殊卡基础15，组合看组合优先级
        if (move.special) {
            const spec = PERSONAL_SPECIALS.find(s => s.id === move.special);
            priority += spec.priority;
            if (spec.priorityBonus) {
                priority += spec.priorityBonus;
            }
        }
        if (combo) {
            priority += combo.priority;
        }
        // 数字卡总和加分
        const sum = move.numbers.reduce((a, b) => a + b, 0);
        priority += sum / 3;

        return priority;
    }

    /**
     * 执行攻击
     */
    performAttack(attacker, defender, move, combo, game, attackerIsPlayer) {
        const baseDamage = Math.ceil((attacker.maxHp / 10) / 2);

        let damageList = [];
        let totalDamage = 0;
        let hasHeal = false;

        // 特殊技加成
        let damageBonus = 0;
        let fullDefense = false;
        let counterAttack = false;

        if (move.special) {
            const spec = PERSONAL_SPECIALS.find(s => s.id === move.special);
            damageBonus += spec.damageBonus || 0;
            if (spec.fullDefense) fullDefense = true;
            if (spec.counterAttack) counterAttack = true;
            if (spec.heal) {
                attacker.hp = Math.min(attacker.maxHp, attacker.hp + spec.heal);
                game.log += `\n${attackerIsPlayer ? '你' : '对手'}使用${spec.name}，恢复 ${spec.heal} 点体力`;
            }
        }

        // 组合效果处理
        if (combo) {
            if (combo.name === '调息回元') {
                // 特殊处理恢复
                combo.effect(combo, attacker.hp, 0, attacker.maxHp, attacker, game);
                hasHeal = true;
            } else if (combo.dodgeNext) {
                game.dodgeNext = true;
                game.log += `\n${attackerIsPlayer ? '你' : '对手'}施展${combo.name}，下一回合闪避对手攻击！`;
            }
        }

        // 计算各次伤害
        if (combo && combo.effect && !hasHeal) {
            damageList = combo.effect(combo, attacker.hp, baseDamage, attacker.maxHp);
        } else if (move.numbers.length > 0) {
            // 没有组合就是每一下正常伤害
            move.numbers.forEach(() => {
                const dmg = baseDamage * (1 + damageBonus);
                damageList.push(dmg);
            });
        } else if (move.special && damageBonus > 0) {
            // 只有特殊技，打一下
            damageList.push(baseDamage * (1 + damageBonus));
        }

        // 应用伤害
        let totalApplied = 0;
        damageList.forEach(dmg => {
            if (fullDefense) {
                game.log += `\n防御成功，不受伤害`;
                return;
            }
            defender.hp -= Math.round(dmg);
            totalApplied += Math.round(dmg);
        });

        if (totalApplied > 0) {
            game.log += `\n${attackerIsPlayer ? '你' : '对手'}击中，${defender === game.player ? '你' : '对手'}总共受到 ${totalApplied} 点伤害`;
        }

        // 反击
        if (counterAttack && defender.hp > 0) {
            const counterDmg = Math.round(baseDamage * 0.5);
            attacker.hp -= counterDmg;
            game.log += `\n${attackerIsPlayer ? '对手' : '你'}四两拨千斤，反击造成 ${counterDmg} 点伤害`;
        }

        defender.hp = Math.max(0, defender.hp);
    }

    /**
     * 弃牌并抽新牌
     */
    discardAndDraw(fighter) {
        // 所有打出的牌进入弃牌堆
        // 这里简化：全部手牌弃掉，然后抽至上限
        fighter.discard.push(...fighter.hand);
        fighter.hand = [];
        this.drawCardsToHand(fighter, fighter.hand.length < fighter.handSize ? fighter.handSize : fighter.hand.length);
    }

    /**
     * 获取回合开始日志
     */
    getRoundStartLog(p1prio, p2prio, firstIsPlayer) {
        const game = this.gameState.martialGame;
        const existing = document.getElementById('battle-log') ? document.getElementById('battle-log').innerHTML : '';
        let log = existing ? existing + '\n\n' : '';
        log += `===== 回合 ${game.round} =====`;
        log += `\n你的优先度 ${p1prio.toFixed(1)}，对手优先度 ${p2prio.toFixed(1)}`;
        if (firstIsPlayer) {
            log += '\n你抢先出手！';
        } else {
            log += '\n对手抢先出手！';
        }
        return log;
    }

    /**
     * 战斗结束
     */
    finishMartialBattle() {
        const game = this.gameState.martialGame;
        const playerWon = game.enemy.hp <= 0;
        const task = this.gameState.currentTask;

        let ratio;
        if (playerWon) {
            ratio = 1.0;
        } else {
            ratio = Math.max(0.2, game.player.hp / (game.player.hp + game.enemy.hp));
        }

        const finalMerit = Math.round(task.rewardMerit * ratio);
        const finalMoney = Math.round(task.rewardMoney * ratio);
        const expGained = Math.round(15 * ratio);

        this.gameState.merit += finalMerit;
        this.gameState.money += finalMoney;
        if (task.requiredSkill) {
            this.gameState.addSkillExp(task.requiredSkill, expGained);
        }

        this.gameState.checkRolePromotion();

        let resultLog = playerWon
            ? `任务【${task.name}】完成！你击败武馆师傅获胜，获得 ${finalMerit} 功勋，${finalMoney} 金钱，${expGained} ${getSkillById(task.requiredSkill)?.name || ''}经验。`
            : `任务【${task.name}】你不敌武馆师傅，获得部分奖励：${finalMerit} 功勋，${finalMoney} 金钱。`;

        this.gameState.addLog(resultLog);

        // 显示结果页
        let html = `
            <div class="personal-result" style="text-align: center; padding: 30px;">
                <h2 style="font-size: 28px; margin-bottom: 20px; color: #8b4513;">${playerWon ? '✔ 比武获胜' : '✘ 比试落败'}</h2>
                <p style="font-size: 16px; margin-bottom: 20px;">${playerWon ? '你拳法进步，赢得师傅赞赏！' : '师傅武艺高超，你虽败犹荣。'}</p>
                <div style="background: #f5f0e1; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                    <p>你的剩余体力：${game.player.hp} / ${game.player.maxHp}</p>
                    <p>师傅剩余体力：${game.enemy.hp} / ${game.enemy.maxHp}</p>
                </div>
                <p>获得：${finalMerit} 功勋，${finalMoney} 金钱</p>
                <div style="margin-top: 30px;">
                    <button class="btn primary-btn" id="personal-done-btn">返回</button>
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        document.getElementById('personal-done-btn').addEventListener('click', () => {
            this.advanceTwoMonths();
            this.gameState.currentTask = null;
            this.gameState.martialGame = null;
            this.gameState.currentScene = GameScene.CITY_VIEW;
            this.renderAll();
        });
    }

    // ========== 医术配药小游戏 ==========

    /**
     * 医术 - 按示范顺序抓药
     */
    /**
     * 本草配方 - 医术小游戏
     * 记住药材出现顺序，然后按顺序点击抓取
     */
    renderMedicineGame() {
        const task = this.gameState.currentTask;
        const allHerbs = ['人参', '麻黄', '甘草', '芍药', '茯苓', '当归', '川芎', '大黄'];

        // 根据难度决定药材数量，难度越大越多
        const difficulty = task.baseDifficulty || 2;
        const herbCount = 3 + difficulty; // 3 ~ 5种

        // 随机选N种药材并打乱顺序
        const selectedHerbs = allHerbs.sort(() => Math.random() - 0.5).slice(0, herbCount);

        // 初始化游戏状态
        this.gameState.medicineGame = {
            sequence: selectedHerbs,
            playerSequence: [],
            totalCount: herbCount,
            shown: false
        };
        const game = this.gameState.medicineGame;

        let html = `
            <div class="medicine-header">
                <h2>${task.name}</h2>
                <p>神医需要你按配方顺序抓药，请仔细记住药材顺序</p>
                <div style="background: #f5f0e1; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p><strong>药方顺序（5秒后消失）：</strong></p>
                    <div class="medicine-sequence" id="medicine-sequence" style="margin-top: 10px;">
                        ${game.sequence.map(h => `<span style="display: inline-block; background: #e8dcc8; padding: 8px 12px; margin: 5px; border-radius: 4px; font-weight: bold;">${h}</span>`).join('')}
                    </div>
                </div>
                <p style="color: #8b4513;">药方即将消失，记住顺序！</p>
            </div>
            <div class="medicine-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 15px 0;">
                ${allHerbs.map(h => `<button class="btn primary-btn medicine-btn" data-herb="${h}" disabled>${h}</button>`).join('')}
            </div>
            <div class="medicine-player-sequence" id="medicine-player-sequence" style="margin-top: 15px;">
                <p><strong>你抓药的顺序：</strong></p>
                <div id="picked-sequence"></div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;

        // 5秒后消失并启用按钮
        setTimeout(() => {
            document.getElementById('medicine-sequence').style.opacity = '0';
            document.querySelectorAll('.medicine-btn').forEach(btn => {
                btn.disabled = false;
            });
            game.shown = true;
        }, 5000);

        this.bindMedicineEvents();
    }

    bindMedicineEvents() {
        document.querySelectorAll('.medicine-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.onMedicineClick(btn.dataset.herb);
            });
        });
    }

    onMedicineClick(herb) {
        const game = this.gameState.medicineGame;
        if (!game.shown) return;

        game.playerSequence.push(herb);

        const container = document.getElementById('picked-sequence');
        container.innerHTML += `<span style="display: inline-block; background: #e8dcc8; padding: 6px 10px; margin: 3px; border-radius: 3px;">${herb}</span>`;

        if (game.playerSequence.length === game.sequence.length) {
            this.finishMedicineGame();
        }
    }

    finishMedicineGame() {
        const game = this.gameState.medicineGame;
        const task = this.gameState.currentTask;

        let correct = 0;
        for (let i = 0; i < game.sequence.length; i++) {
            if (game.sequence[i] === game.playerSequence[i]) {
                correct++;
            }
        }

        const ratio = correct / game.sequence.length;
        const finalMerit = Math.round(task.rewardMerit * ratio);
        const finalMoney = Math.round(task.rewardMoney * ratio);
        const expGained = Math.round(10 * ratio);

        this.gameState.merit += finalMerit;
        this.gameState.money += finalMoney;
        if (task.requiredSkill) {
            this.gameState.addSkillExp(task.requiredSkill, expGained);
        }

        this.gameState.checkRolePromotion();
        this.gameState.addLog(`任务【${task.name}】完成！猜对 ${correct}/${game.sequence.length} 味药顺序，获得 ${finalMerit} 功勋，${finalMoney} 金钱，${expGained} ${getSkillById(task.requiredSkill)?.name || ''}经验。`);

        this.advanceTwoMonths();
        this.gameState.currentTask = null;
        this.gameState.medicineGame = null;
        this.gameState.currentScene = GameScene.CITY_VIEW;
        this.renderAll();
    }

    // ========== 文墨填空小游戏 ==========

    /**
     * 文墨填空 - 文墨小游戏
     * 选出正确的字填入古诗文/奏章名句
     */
    renderCalligraphyGame() {
        const task = this.gameState.currentTask;
        // 初始化游戏状态
        this.gameState.calligraphyGame = {
            currentRound: 0,
            totalRounds: 5,
            correctCount: 0
        };
        // 题目题库
        this.calligraphyQuestions = [
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
            {sentence: "天生我材必有用，千金散___还复来", options: ["尽", "去", "了", "毕"], answer: "尽"},
            {sentence: "会当___绝顶，一览众山小", options: ["登", "到", "临", "上"], answer: "临"},
            {sentence: "黄沙百战穿金___，不破楼兰终不还", options: ["甲", "戈", "袍", "铠"], answer: "甲"},
            {sentence: "苟利国家生___以，岂因祸福避趋之", options: ["死", "命", "之", "理"], answer: "死"},
            {sentence: "海内存知己，天涯___比邻", options: ["若", "如", "似", "比"], answer: "若"},
            {sentence: "欲把西湖比西___，淡妆浓抹总相宜", options: ["子", "施", "湖", "女"], answer: "子"},
        ];

        // 洗牌
        this.calligraphyQuestions = this.calligraphyQuestions.sort(() => Math.random() - 0.5);
        this.renderCalligraphyRound();
    }

    renderCalligraphyRound() {
        const game = this.gameState.calligraphyGame;
        const q = this.calligraphyQuestions[game.currentRound];

        let html = `
            <div class="calligraphy-header">
                <h2>${this.gameState.currentTask.name}</h2>
                <p>第 ${game.currentRound + 1} / ${game.totalRounds} 题</p>
                <p>选出正确的字填入奏章</p>
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
        this.bindCalligraphyEvents();
    }

    bindCalligraphyEvents() {
        document.querySelectorAll('.calligraphy-option').forEach(btn => {
            btn.addEventListener('click', () => {
                this.onCalligraphySelect(btn.textContent);
            });
        });
    }

    onCalligraphySelect(answer) {
        const game = this.gameState.calligraphyGame;
        const q = this.calligraphyQuestions[game.currentRound];
        const correct = answer === q.answer;
        if (correct) game.correctCount++;

        const resultEl = document.getElementById('calligraphy-result');
        resultEl.innerHTML = correct
            ? `<div class="eloquence-answer correct">✔ 正确！</div>`
            : `<div class="eloquence-answer wrong">✘ 错误，正确答案是：${q.answer}</div>`;

        game.currentRound++;
        if (game.currentRound >= game.totalRounds) {
            setTimeout(() => this.finishCalligraphyGame(), 1000);
        } else {
            setTimeout(() => this.renderCalligraphyRound(), 1000);
        }
    }

    finishCalligraphyGame() {
        const game = this.gameState.calligraphyGame;
        const task = this.gameState.currentTask;
        const ratio = game.correctCount / game.totalRounds;

        const finalMerit = Math.round(task.rewardMerit * ratio);
        const finalMoney = Math.round(task.rewardMoney * ratio);
        const expGained = Math.round(10 * ratio);

        this.gameState.merit += finalMerit;
        this.gameState.money += finalMoney;
        if (task.requiredSkill) {
            this.gameState.addSkillExp(task.requiredSkill, expGained);
        }

        this.gameState.checkRolePromotion();
        this.gameState.addLog(`任务【${task.name}】完成！答对 ${game.correctCount}/${game.totalRounds} 题，获得 ${finalMerit} 功勋，${finalMoney} 金钱，${expGained} ${getSkillById(task.requiredSkill)?.name || ''}经验。`);

        this.advanceTwoMonths();
        this.gameState.currentTask = null;
        this.gameState.calligraphyGame = null;
        this.gameState.currentScene = GameScene.CITY_VIEW;
        this.renderAll();
    }

    // ========== 密探迷宫寻路 ==========

    /**
     * 密探 - 简单迷宫寻路找到出口
     */
    /**
     * 潜龙谍影 - 密探小游戏
     * 潜入敌营，从起点走到终点，每次移动增加警报值，警报满了就被发现
     */
    renderSpyGame() {
        const task = this.gameState.currentTask;
        // 初始化游戏状态
        this.gameState.spyGame = {
            playerPos: {x: 0, y: 0},
            alarm: 0,       // 警报值 0-100
            maxAlarm: 60    // 超过就失败
        };
        // 生成 5x5 简单迷宫
        // 0: 路, 1: 墙, 2: 出口
        const maze = [
            [0, 1, 0, 0, 0],
            [0, 1, 0, 1, 0],
            [0, 0, 0, 1, 0],
            [0, 1, 1, 1, 0],
            [0, 0, 0, 0, 2]
        ];
        // 随机打乱一下墙，每次游戏不一样
        for (let i = 0; i < 3; i++) {
            const x = Math.floor(Math.random() * 3) + 1;
            const y = Math.floor(Math.random() * 3) + 1;
            maze[y][x] = maze[y][x] === 1 ? 0 : 1;
        }

        this.gameState.spyGame.maze = maze;
        const game = this.gameState.spyGame;

        const alarmPercent = (game.alarm / game.maxAlarm) * 100;

        let html = `
            <div class="spy-header">
                <h2>${task.name}</h2>
                <p>你是密探，潜入敌营找到右下角出口 🎯</p>
                <div style="background: #f5f0e1; padding: 10px; border-radius: 5px; margin: 10px 0;">
                    <p>警报值：${game.alarm} / ${game.maxAlarm}</p>
                    <div style="background: #ddd; height: 20px; border-radius: 10px; margin-top: 5px;">
                        <div style="background: #e74c3c; height: 100%; width: ${alarmPercent}%; border-radius: 10px;"></div>
                    </div>
                    <p style="font-size: 14px; color: #666; margin: 5px 0 0 0;">每次移动有概率增加警报，警报满了你会被发现！</p>
                </div>
                <p>点击相邻格子移动你（🔴）</p>
            </div>
            <div class="spy-maze" id="spy-maze" style="display: inline-block; border: 2px solid #8b4513; border-radius: 5px;">
                ${maze.map((row, y) => `
                    <div class="spy-row" style="display: flex;">
                        ${row.map((cell, x) => {
                            const className = cell === 1 ? 'spy-wall' : (cell === 2 ? 'spy-exit' : 'spy-path');
                            let content = '';
                            let bg = cell === 1 ? '#2c3e50' : cell === 2 ? '#2ecc71' : '#ecf0f1';
                            if (x === 0 && y === 0) content = '🔴';
                            else if (cell === 2) content = '🎯';
                            return `<div class="spy-cell ${className}" data-x="${x}" data-y="${y}" style="width: 40px; height: 40px; border: 1px solid #bdc3c7; display: flex; align-items: center; justify-content: center; background: ${bg};">${content}</div>`;
                        }).join('')}
                    </div>
                `).join('')}
            </div>
            <div class="spy-log" id="spy-log" style="margin-top: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; min-height: 50px;">
                你从左上角出发了，悄悄向敌营深处前进...
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        this.bindSpyEvents();
    }

    bindSpyEvents() {
        document.querySelectorAll('.spy-cell.spy-path, .spy-cell.spy-exit').forEach(cell => {
            cell.addEventListener('click', () => {
                const x = parseInt(cell.dataset.x);
                const y = parseInt(cell.dataset.y);
                this.onSpyMove(x, y);
            });
        });
    }

    onSpyMove(x, y) {
        const game = this.gameState.spyGame;
        const player = game.playerPos;

        // 只能走相邻一格
        if (Math.abs(x - player.x) + Math.abs(y - player.y) !== 1) {
            return;
        }
        // 不能走墙
        if (game.maze[y][x] === 1) {
            return;
        }

        // 20%概率增加警报
        if (Math.random() < 0.2) {
            const add = Math.floor(Math.random() * 15) + 5;
            game.alarm += add;
            document.getElementById('spy-log').innerHTML = `⚠ 被巡逻哨兵发现踪迹！警报 +${add}`;
        } else {
            document.getElementById('spy-log').innerHTML = `✓ 悄悄移动，没有被发现`;
        }

        // 移动玩家
        const oldCell = document.querySelector(`.spy-cell[data-x="${player.x}"][data-y="${player.y}"]`);
        oldCell.textContent = '';
        oldCell.style.background = '#ecf0f1';

        game.playerPos = {x, y};
        const newCell = document.querySelector(`.spy-cell[data-x="${x}"][data-y="${y}"]`);
        newCell.textContent = '🔴';
        newCell.style.background = '#e74c3c';

        // 检查警报是否满了
        if (game.alarm >= game.maxAlarm) {
            this.finishSpyGame(false);
            return;
        }

        // 检查是否到出口
        if (game.maze[y][x] === 2) {
            this.finishSpyGame(true);
            return;
        }

        // 重新渲染警报条
        this.renderSpyGame();
    }

    finishSpyGame(success) {
        const game = this.gameState.spyGame;
        const task = this.gameState.currentTask;

        let ratio;
        let resultTitle, resultDesc;

        if (success && game.maze[game.playerPos.y][game.playerPos.x] === 2) {
            // 根据剩余警报计算奖励
            const remainingAlarm = game.maxAlarm - game.alarm;
            ratio = 0.7 + (remainingAlarm / game.maxAlarm) * 0.3; // 0.7 ~ 1.0
            resultTitle = '✔ 潜入成功！';
            resultDesc = '你成功摸到敌营主将营帐，完成任务全身而退！';
        } else {
            // 被发现，失败，给少量奖励
            const distanceToExit = Math.abs(4 - game.playerPos.x) + Math.abs(4 - game.playerPos.y);
            const totalDistance = 8; // max distance in 5x5
            ratio = Math.max(0.2, (1 - distanceToExit / totalDistance) * 0.5);
            resultTitle = '✘ 潜入失败';
            resultDesc = '你的行踪被敌人发现，不得不撤退，只走到了离出口还有 ' + distanceToExit + ' 格的位置。';
        }

        const finalMerit = Math.round(task.rewardMerit * ratio);
        const finalMoney = Math.round(task.rewardMoney * ratio);
        const expGained = Math.round(15 * ratio);

        this.gameState.merit += finalMerit;
        this.gameState.money += finalMoney;
        if (task.requiredSkill) {
            this.gameState.addSkillExp(task.requiredSkill, expGained);
        }

        this.gameState.checkRolePromotion();
        this.gameState.addLog(`任务【${task.name}】${resultTitle} 最终警报值${game.alarm}，获得 ${finalMerit} 功勋，${finalMoney} 金钱，${expGained} ${getSkillById(task.requiredSkill)?.name || ''}经验。`);

        // 显示结果页
        let html = `
            <div class="spy-result" style="text-align: center; padding: 30px;">
                <h2 style="font-size: 28px; margin-bottom: 20px; color: #8b4513;">${resultTitle}</h2>
                <p style="font-size: 16px; margin-bottom: 20px;">${resultDesc}</p>
                <div style="background: #f5f0e1; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                    <p>最终警报值：${game.alarm} / ${game.maxAlarm}</p>
                </div>
                <p>获得：${finalMerit} 功勋，${finalMoney} 金钱</p>
                <div style="margin-top: 30px;">
                    <button class="btn primary-btn" id="spy-done-btn">返回</button>
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        document.getElementById('spy-done-btn').addEventListener('click', () => {
            this.advanceTwoMonths();
            this.gameState.currentTask = null;
            this.gameState.spyGame = null;
            this.gameState.currentScene = GameScene.CITY_VIEW;
            this.renderAll();
        });
    }


    /**
     * 神机校射 - 火器小游戏
     * XY坐标自动移动准星，点击射击，越靠近中心得分越高
     */


    /**
     * 渲染日志区域
     */
    renderLog() {
        if (!this.logAreaEl) return;

        if (this.gameState.logs.length === 0) {
            this.gameState.addLog('游戏开始了，朱元璋，你现在已经加入郭子兴义军，身为一名普通士兵...');
        }

        let html = '';
        this.gameState.logs.forEach(log => {
            html += `<div class="log-entry">${log}</div>`;
        });

        this.logAreaEl.innerHTML = html;
        // 滚动到底部
        this.logAreaEl.scrollTop = this.logAreaEl.scrollHeight;
    }

    // ========== 社交系统 - 视图渲染 ==========

    /**
     * 渲染当前城市中的人物列表
     */
    renderCharacterListView() {
        const container = document.getElementById('character-list-view');
        if (!container) return;

        const characters = this.gameState.getCharactersInCurrentCity();
        const playerId = this.gameState.playerCharacterId;
        // 过滤掉玩家自己
        const npcs = characters.filter(c => c.id !== playerId);

        if (npcs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>当前城中没有可互动的人物。</p>
                </div>
            `;
            return;
        }

        let html = `
            <div class="character-list-container">
                <h2 class="view-title">城中人物</h2>
                <div class="character-list">
        `;

        npcs.forEach(npc => {
            const intimacy = this.gameState.getIntimacy(npc.id);
            const intimacyText = this.gameState.getIntimacyDescription(intimacy);
            const intimacyHearts = this.gameState.getIntimacyHearts(intimacy);
            const card = getCardById(`CHAR_${npc.templateId}`);
            const unlocked = card ? this.gameState.hasCard(`CHAR_${npc.templateId}`) : false;

            html += `
                <div class="character-item">
                    <div class="character-info">
                        <div class="character-header">
                            <span class="character-emoji">${npc.emoji || '👤'}</span>
                            <span class="character-name">${npc.name}</span>
                            <span class="character-rank">${npc.initialRank}</span>
                        </div>
                        <p class="character-desc">${npc.description}</p>
                        <p class="character-relationship">关系：${intimacyHearts} ${intimacyText} ${unlocked ? '✓ 已获得人物卡' : ''}</p>
                    </div>
                    <button class="btn primary-btn interact-btn" data-char-id="${npc.id}">交谈</button>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        container.innerHTML = html;
        container.style.display = 'block';

        // 绑定事件
        container.querySelectorAll('.interact-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const charId = parseInt(e.target.dataset.charId);
                this.gameState.startSocialInteraction(charId);
                this.renderAll();
            });
        });
    }

    /**
     * 渲染社交互动视图
     */
    renderSocialView() {
        const container = document.getElementById('social-view');
        if (!container) {
            // 如果容器不存在，先创建
            const mainDisplay = document.getElementById('main-display');
            const div = document.createElement('div');
            div.id = 'social-view';
            div.className = 'scene-view';
            div.style.display = 'block';
            mainDisplay.appendChild(div);
        }

        const targetId = this.gameState.currentSocialTarget;
        if (targetId === null) {
            container.innerHTML = '<p class="error">没有选中的人物，返回上一页。</p>';
            return;
        }

        const npc = getCharacterTemplateByNumId(targetId);
        if (!npc) {
            container.innerHTML = '<p class="error">人物不存在。</p>';
            return;
        }

        const intimacy = this.gameState.getIntimacy(targetId);
        const intimacyText = this.gameState.getIntimacyDescription(intimacy);
        const intimacyHearts = this.gameState.getIntimacyHearts(intimacy);

        // 获取玩家的宝物卡列表
        const treasureCards = [];
        for (const cardId in this.gameState.collectedCards) {
            const card = getCardById(cardId);
            if (card && card.type === CardTypes.TREASURE) {
                treasureCards.push(card);
            }
        }

        let html = `
            <div class="social-container">
                <div class="social-header">
                    <div class="npc-info">
                        <span class="npc-emoji">${npc.emoji || '👤'}</span>
                        <div class="npc-basic">
                            <h2>${npc.name}</h2>
                            <p>${npc.initialRank} · ${npc.personality} · ${intimacyHearts} ${intimacyText}</p>
                        </div>
                    </div>
                </div>
                <div class="social-description">
                    <p>${npc.description}</p>
                </div>
                <div class="social-actions">
                    <h3>可进行的互动</h3>
                    <div class="action-list">
        `;

        // 送礼 - 需要有宝物
        if (treasureCards.length > 0) {
            html += `
                <div class="action-group">
                    <h4>赠送宝物</h4>
                    <div class="gift-list">
            `;
            treasureCards.forEach(card => {
                html += `
                    <button class="btn secondary-btn gift-btn" data-card-id="${card.card_id}">
                        ${card.name} <span class="rarity">${'⭐'.repeat(card.rarity)}</span>
                    </button>
                `;
            });
            html += `
                    </div>
                </div>
            `;
        }

        // 茶会
        const canTea = intimacy >= -1 && this.gameState.money >= 5;
        html += `
            <div class="action-item">
                <button class="btn secondary-btn tea-btn" ${!canTea ? 'disabled' : ''}>
                    🍵 邀请茶会 (5贯)
                </button>
                <p class="action-desc">一起喝茶聊天，提升亲密度。</p>
            </div>
        `;

        // 宴饮
        const canFeast = intimacy >= 0 && this.gameState.money >= 15;
        html += `
            <div class="action-item">
                <button class="btn secondary-btn feast-btn" ${!canFeast ? 'disabled' : ''}>
                    🍲 邀请宴饮 (15贯)
                </button>
                <p class="action-desc">设宴饮酒，提升更多亲密度。</p>
            </div>
        `;

        // 切磋武艺
        const canDuel = intimacy >= 1;
        html += `
            <div class="action-item">
                <button class="btn secondary-btn duel-btn" ${!canDuel ? 'disabled' : ''}>
                    ⚔️ 请求切磋
                </button>
                <p class="action-desc">切磋武艺，胜利增加亲密度，可能习得秘传。</p>
            </div>
        `;

        // 结义
        const canBrother = this.gameState.canSwearBrotherhood(targetId);
        if (canBrother) {
            html += `
                <div class="action-item special-action">
                    <button class="btn primary-btn brother-btn">
                        🎯 结为异姓兄弟
                    </button>
                    <p class="action-desc">亲密度达到4心可以结义，结义后关系锁定永不背叛。</p>
                </div>
            `;
        }

        // 求婚
        const canMarry = this.gameState.canProposeMarriage(targetId);
        if (canMarry) {
            html += `
                <div class="action-item special-action">
                    <button class="btn primary-btn marry-btn">
                        💍 求婚
                    </button>
                    <p class="action-desc">亲密度达到4心可以求婚，婚后关系锁定永不分离。</p>
                </div>
            `;
        }

        // 请求指导技能 - 需要亲密度 >= 2
        if (intimacy >= 2) {
            html += `
                <div class="action-item">
                    <button class="btn secondary-btn practice-btn">
                        📖 请求指导
                    </button>
                    <p class="action-desc">请对方指导你的某项技能，提升技能经验。</p>
                </div>
            `;
        }

        html += `
                    </div>
                </div>
                <div class="social-footer">
                    <button class="btn secondary-btn back-btn">返回人物列表</button>
                </div>
            </div>
        `;

        container.innerHTML = html;
        container.style.display = 'block';

        // 绑定事件
        container.querySelector('.back-btn')?.addEventListener('click', () => {
            this.gameState.currentSocialTarget = null;
            this.gameState.currentScene = GameScene.CHARACTER_LIST_VIEW;
            this.renderAll();
        });

        container.querySelector('.tea-btn')?.addEventListener('click', () => {
            this.gameState.inviteTea(targetId);
            this.renderAll();
        });

        container.querySelector('.feast-btn')?.addEventListener('click', () => {
            this.gameState.inviteFeast(targetId);
            this.renderAll();
        });

        container.querySelector('.duel-btn')?.addEventListener('click', () => {
            if (this.gameState.requestDuel(targetId)) {
                // 这里应该进入个人战，现在先简单处理
                // TODO: 启动个人战
                this.gameState.addLog(`个人战系统尚未完成，敬请期待。`);
                this.renderAll();
            }
        });

        container.querySelector('.brother-btn')?.addEventListener('click', () => {
            if (confirm(`确定要与${npc.name}结为异姓兄弟吗？`)) {
                this.gameState.doSwearBrotherhood(targetId);
                this.renderAll();
            }
        });

        container.querySelector('.marry-btn')?.addEventListener('click', () => {
            if (confirm(`确定要向${npc.name}求婚吗？需要100贯聘礼和一件宝物。`)) {
                this.gameState.proposeMarriage(targetId);
                this.renderAll();
            }
        });

        container.querySelectorAll('.gift-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cardId = e.target.dataset.cardId;
                this.gameState.giftTreasure(targetId, cardId);
                this.renderAll();
            });
        });
    }
};
