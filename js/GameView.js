/**
 * 游戏视图渲染类
 *
 * 重构说明：
 * - 提取动画逻辑到 AnimationManager
 * - 提取场景切换到 SceneManager
 * - 提取小游戏初始化到 MinigameInitializer
 * - 文件从 743行 减少到 约 300行，职责更清晰
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
     * 导航按钮点击 - 切到对应场景
     */
    onNavClick(targetScene) {
        // 如果有未完成的剧情事件，禁止切换场景
        // 必须完成事件选择才能离开
        if (this.gameState.currentEvent) {
            alert('⚠️ 当前有未完成的剧情事件，请先完成选择才能切换页面');
            return;
        }
        // 如果评定会未做出选择，禁止离开
        // 必须接取任务或选择跳过才能离开
        // 例外：如果目标就是主命界面，则允许跳转（这正是自动跳转要去的地方）
        if (this.gameState.evaluationPendingSelection && targetScene !== GameScene.TASK_LIST) {
            alert('⚠️ 本次评定会尚未做出选择，请接取任务或选择"暂无合适任务"才能离开');
            return;
        }

        // 如果切出小游戏，停止所有动画避免浪费
        if (!SceneManager.isMinigameScene(targetScene)) {
            AnimationManager.stopAllAnimations(this.gameState);
        }
        this.gameState.currentScene = targetScene;
        this.renderAll();
    }

    /**
     * 次日按钮点击
     */
    onNextDayClick() {
        // 如果有未完成的剧情事件，禁止推进时间
        if (this.gameState.currentEvent) {
            alert('⚠️ 当前有未完成的剧情事件，请先完成选择才能继续');
            return;
        }
        // 如果评定会未做出选择，禁止推进时间
        if (this.gameState.evaluationPendingSelection) {
            alert('⚠️ 本次评定会尚未做出选择，请接取任务或选择"暂无合适任务"才能继续');
            return;
        }
        this.gameState.advanceDay();
        this.renderAll();
    }

    /**
     * 渲染所有视图
     */
    renderAll() {
        // 检查是否需要自动跳转到评定会
        if (this.gameState._shouldAutoGoToEvaluation) {
            this.gameState._shouldAutoGoToEvaluation = false;
            // 延迟一帧让日志先渲染，再跳转
            setTimeout(() => {
                this.onNavClick(GameScene.TASK_LIST);
            }, 100);
        }

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
     * 接受并开始一个主命（家臣模式）
     */
    acceptMission(taskId) {
        const template = getMissionTemplateById(taskId);
        if (!template) return;

        // GameState中开始任务
        this.gameState.startMission(template.id);

        // 任务现在通过外部小游戏或其他系统完成，不自动进入小游戏
        this.gameState.currentScene = GameScene.CITY_VIEW;

        this.renderAll();
    }

    /**
     * 发布任务给家臣（君主模式）
     */
    publishMissionToVassal(taskId) {
        const template = getMissionTemplateById(taskId);
        if (!template) return;

        // 检查军资金是否足够（发布任务需要消耗预算）
        const requiredCost = Math.round(template.baseReward * 0.5);
        if (this.gameState.money < requiredCost) {
            alert(`军资金不足，发布此任务需要 ${requiredCost} 贯，你只有 ${this.gameState.money} 贯`);
            return;
        }

        // 扣除军资金预算
        this.gameState.money -= requiredCost;
        this.gameState.addLog(`发布主命【${template.name}】，花费军资金 ${requiredCost} 贯`);

        // 这里预留完整的家臣任务分配逻辑
        // 当前版本：玩家君主仍然亲自执行任务，保持兼容性
        this.gameState.startMission(template.id);

        // 任务现在通过外部小游戏或其他系统完成，不自动进入小游戏
        this.gameState.currentScene = GameScene.CITY_VIEW;

        this.renderAll();
    }

    /**
     * 启动摆动动画（供小游戏调用）
     * 使用统一的AnimationManager
     */
    startSwingAnimation(gameState, config, updateCallback) {
        AnimationManager.startSwingAnimation(gameState, config, updateCallback, this);
    }

    /**
     * 更新指示器位置（通用方法）
     */
    updateIndicator(indicatorId, value) {
        AnimationManager.updateIndicator(indicatorId, value);
    }

    /**
     * 快捷方法：更新耕地指示器
     */
    updateFarmingDisplay() {
        this.updateIndicator('farming-indicator', this.gameState.farmingGame.power);
        const roundEl = document.getElementById('farming-round');
        if (roundEl) {
            roundEl.textContent = `${this.gameState.farmingGame.currentRound + 1}/${this.gameState.farmingGame.totalRounds}`;
        }
    }

    /**
     * 快捷方法：更新筑城指示器
     */
    updateEngineeringDisplay() {
        this.updateIndicator('engineering-indicator', this.gameState.engineeringGame.value);
    }

    /**
     * 快捷方法：更新水军指示器
     */
    updateNavyDisplay() {
        this.updateIndicator('navy-indicator', this.gameState.navyGame.position);
    }

    /**
     * 快捷方法：更新火器指示器
     */
    updateFirearmDisplay() {
        this.updateIndicator('firearm-x-indicator', this.gameState.firearmGame.x);
        this.updateIndicator('firearm-y-indicator', this.gameState.firearmGame.y);
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
        // 使用SceneManager统一切换场景显示
        SceneManager.switchToScene(this.gameState.currentScene);

        // 调用对应渲染器
        switch (this.gameState.currentScene) {
            case GameScene.CHARACTER_VIEW:
                CharacterViewRenderer.render(this.gameState);
                break;
            case GameScene.CITY_VIEW:
                CityViewRenderer.render(this.gameState, this);
                break;
            case GameScene.MAP_VIEW:
                MapRenderer.render(this.gameState);
                break;
            case GameScene.TASK_LIST:
                TaskListRenderer.render(this.gameState, this);
                break;
            case GameScene.FARMING_GAME:
                // 如果有currentTask（主命任务），自动根据gameType启动游戏
                // 如果没有currentTask（设施练习模式），游戏已经由FacilityScene手动启动，不重复启动
                if (this.gameState.currentTask) {
                    this.startMinigameByType();
                }
                break;
            case GameScene.CARD_COLLECTION:
                CardCollectionRenderer.render(this.gameState);
                break;
            case GameScene.CHARACTER_LIST_VIEW:
                CharacterListRenderer.render(this.gameState);
                break;
            case GameScene.SOCIAL_VIEW:
                SocialRenderer.render(this.gameState);
                break;
            case GameScene.MARKET:
                document.getElementById('market-view').innerHTML = MarketScene.render(this.gameState);
                break;
            case GameScene.EVENT:
                document.getElementById('event-view').innerHTML = EventScene.render(this.gameState);
                break;
            case GameScene.FACILITY:
                document.getElementById('event-view').innerHTML = FacilityScene.render(this.gameState);
                break;
        }
    }

    /**
     * 根据gameType启动小游戏
     */
    startMinigameByType() {
        const gameType = this.gameState.currentTask.gameType;
        const taskId = this.gameState.currentTask.templateId;

        const animatedStart = (startFn, gameKey) => {
            startFn(this, this.gameState);
            if (MinigameInitializer.needsAnimation(gameType)) {
                this.startAnimatedGame(gameKey);
            }
        };

        // 这里只做分发，具体游戏逻辑在各个游戏模块中
        // 状态初始化已经在MinigameInitializer完成
        switch (gameType) {
            case 'agriculture':
                animatedStart(FarmingGame.start, 'farmingGame');
                break;
            case 'eloquence':
                EloquenceGame.start(this, this.gameState);
                break;
            case 'infantry':
                InfantryGame.start(this, this.gameState);
                break;
            case 'cavalry':
                CavalryGame.start(this, this.gameState);
                break;
            case 'engineering':
                animatedStart(EngineeringGame.start, 'engineeringGame');
                break;
            case 'trade':
                TradeGame.start(this, this.gameState);
                break;
            case 'law':
                LawGame.start(this, this.gameState);
                break;
            case 'navy':
                animatedStart(NavyGame.start, 'navyGame');
                break;
            case 'strategy':
                if (taskId === 17) {
                    BattleGame.start(this, this.gameState);
                } else {
                    StrategyGame.start(this, this.gameState);
                }
                break;
            case 'martial':
                if (taskId === 10) {
                    DuelGame.start(this, this.gameState);
                } else {
                    MartialGame.start(this, this.gameState);
                }
                break;
            case 'medicine':
                MedicineGame.start(this, this.gameState);
                break;
            case 'calligraphy':
                CalligraphyGame.start(this, this.gameState);
                break;
            case 'spy':
                SpyGame.start(this, this.gameState);
                break;
            case 'navigation':
                NavigationGame.start(this, this.gameState);
                break;
            case 'dialog':
                // 对话选择类任务使用口才游戏框架
                EloquenceGame.start(this, this.gameState);
                break;
            case 'ritual':
                RitualGame.start(this, this.gameState);
                break;
            case 'firearm':
                animatedStart(FirearmGame.start, 'firearmGame');
                break;
            case 'duel':
                DuelGame.start(this, this.gameState);
                break;
            case 'battle':
                BattleGame.start(this, this.gameState);
                break;
            case 'explore':
                // 人才探访 - 跳转到城中人物列表进行探访
                this.gameState.currentScene = GameScene.CHARACTER_LIST_VIEW;
                this.renderAll();
                break;
            default:
                console.warn('未知小游戏类型:', gameType);
        }
    }

    /**
     * 启动带动画的游戏
     */
    startAnimatedGame(gameKey) {
        const game = this.gameState[gameKey];
        if (!game) return;

        // 根据不同游戏类型选择不同的更新回调
        let updateCallback;
        if (gameKey === 'farmingGame') {
            updateCallback = this.updateFarmingDisplay;
        } else if (gameKey === 'engineeringGame') {
            updateCallback = this.updateEngineeringDisplay;
        } else if (gameKey === 'navyGame') {
            updateCallback = this.updateNavyDisplay;
        } else if (gameKey === 'firearmGame') {
            updateCallback = this.updateFirearmDisplay;
        }

        AnimationManager.startSwingAnimation(game, {
            property: gameKey === 'farmingGame' ? 'power' :
                      gameKey === 'firearmGame' ? 'x' : 'value',
            speedProperty: 'speed',
            directionProperty: 'direction',
            min: 0,
            max: 100
        }, updateCallback, this);
    }

    /**
     * 返回城镇视图（从市集返回）
     */
    goBackToCity() {
        this.gameState.currentScene = GameScene.CITY_VIEW;
        this.renderAll();
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
