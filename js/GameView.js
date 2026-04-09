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
                CharacterViewRenderer.render(this.gameState);
                break;
            case GameScene.CITY_VIEW:
                this.showCityView();
                CityViewRenderer.render(this.gameState, this);
                break;
            case GameScene.MAP_VIEW:
                this.showMapView();
                MapRenderer.render(this.gameState);
                break;
            case GameScene.TASK_LIST:
                this.showTaskListView();
                TaskListRenderer.render(this.gameState, this);
                break;
            case GameScene.FARMING_GAME:
                this.showFarmingGameView();
                // 如果有currentTask（主命任务），自动根据gameType启动游戏
                // 如果没有currentTask（设施练习模式），游戏已经由FacilityScene手动启动，不重复启动
                if (this.gameState.currentTask) {
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
            case GameScene.MARKET:
                this.showMarketView();
                document.getElementById('market-view').innerHTML = MarketScene.render(this.gameState);
                break;
            case GameScene.EVENT:
                this.showEventView();
                document.getElementById('event-view').innerHTML = EventScene.render(this.gameState);
                break;
            case GameScene.FACILITY:
                this.showFacilityView();
                document.getElementById('event-view').innerHTML = FacilityScene.render(this.gameState);
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
        document.getElementById('market-view').style.display = 'none';
        document.getElementById('event-view').style.display = 'none';
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
        document.getElementById('market-view').style.display = 'none';
        document.getElementById('event-view').style.display = 'none';
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
        document.getElementById('market-view').style.display = 'none';
        document.getElementById('event-view').style.display = 'none';
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
        document.getElementById('market-view').style.display = 'none';
        document.getElementById('event-view').style.display = 'none';
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
        document.getElementById('market-view').style.display = 'none';
        document.getElementById('event-view').style.display = 'none';
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
        document.getElementById('market-view').style.display = 'none';
        document.getElementById('event-view').style.display = 'none';
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
        document.getElementById('market-view').style.display = 'none';
        document.getElementById('event-view').style.display = 'none';
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
        document.getElementById('market-view').style.display = 'none';
        document.getElementById('event-view').style.display = 'none';
    }

    /**
     * 切换显示 - 市集场景
     */
    showMarketView() {
        document.getElementById('character-view').style.display = 'none';
        document.getElementById('city-view').style.display = 'none';
        document.getElementById('map-view').style.display = 'none';
        document.getElementById('task-list-view').style.display = 'none';
        document.getElementById('farming-game-view').style.display = 'none';
        document.getElementById('card-collection-view').style.display = 'none';
        document.getElementById('character-list-view').style.display = 'none';
        document.getElementById('social-view').style.display = 'none';
        document.getElementById('market-view').style.display = 'block';
    }

    /**
     * 返回城镇视图（从市集返回）
     */
    goBackToCity() {
        this.gameState.currentScene = GameScene.CITY_VIEW;
        this.renderAll();
    }

    /**
     * 切换显示 - 剧情事件场景
     */
    showEventView() {
        document.getElementById('character-view').style.display = 'none';
        document.getElementById('city-view').style.display = 'none';
        document.getElementById('map-view').style.display = 'none';
        document.getElementById('task-list-view').style.display = 'none';
        document.getElementById('farming-game-view').style.display = 'none';
        document.getElementById('card-collection-view').style.display = 'none';
        document.getElementById('character-list-view').style.display = 'none';
        document.getElementById('social-view').style.display = 'none';
        document.getElementById('market-view').style.display = 'none';
        document.getElementById('event-view').style.display = 'block';
    }

    /**
     * 切换显示 - 城乡设施场景
     */
    showFacilityView() {
        document.getElementById('character-view').style.display = 'none';
        document.getElementById('city-view').style.display = 'none';
        document.getElementById('map-view').style.display = 'none';
        document.getElementById('task-list-view').style.display = 'none';
        document.getElementById('farming-game-view').style.display = 'none';
        document.getElementById('card-collection-view').style.display = 'none';
        document.getElementById('character-list-view').style.display = 'none';
        document.getElementById('social-view').style.display = 'none';
        document.getElementById('market-view').style.display = 'none';
        document.getElementById('event-view').style.display = 'block';
    }

    /**
     * 渲染日志
     */
    renderLog() {
        this.logAreaEl.innerHTML = '';
        const logs = this.gameState.logs;
        logs.forEach(log => {
            const div = document.createElement('div');
            div.className = 'log-entry';
            div.textContent = log;
            this.logAreaEl.appendChild(div);
        });
        this.logAreaEl.scrollTop = this.logAreaEl.scrollHeight;
    }
};
