/**
 * 游戏视图渲染类
 *
 * 重构说明：
 * - 提取动画逻辑到 AnimationManager
 * - 提取场景切换到 NavigationManager（新导航系统带返回栈）
 * - 提取小游戏初始化到 MinigameInitializer
 * - 文件精简后职责更清晰
 */

import { GameScene } from './GameState.js';
import { getMissionTemplateById } from '../data/tasks.js';
import NavigationManager from './managers/NavigationManager.js';
import AnimationManager from './managers/AnimationManager.js';
import MinigameInitializer from './managers/MinigameInitializer.js';

// 小游戏模块导入
import FarmingGame from './games/FarmingGame.js';
import EloquenceGame from './games/EloquenceGame.js';
import InfantryGame from './games/InfantryGame.js';
import CavalryGame from './games/CavalryGame.js';
import EngineeringGame from './games/EngineeringGame.js';
import TradeGame from './games/TradeGame.js';
import LawGame from './games/LawGame.js';
import NavyGame from './games/NavyGame.js';
import StrategyGame from './games/StrategyGame.js';
import BattleGame from './games/BattleGame.js';
import MartialGame from './games/MartialGame.js';
import DuelGame from './games/DuelGame.js';
import MedicineGame from './games/MedicineGame.js';
import CalligraphyGame from './games/CalligraphyGame.js';
import SpyGame from './games/SpyGame.js';
import NavigationGame from './games/NavigationGame.js';
import RitualGame from './games/RitualGame.js';
import FirearmGame from './games/FirearmGame.js';

export default class GameView {
    constructor(gameState) {
        this.gameState = gameState;
        this.cacheDOMElements();
        this.bindEvents();
    }

    /**
     * 缓存DOM元素引用
     */
    cacheDOMElements() {
        this.characterViewEl = document.getElementById('character-view');
        // 状态栏/导航栏/日志已删除 - 全屏新模式下每个界面自行显示状态
        this.mapViewEl = document.getElementById('map-view');
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 底部导航已删除 - 全屏新模式使用导航管理器返回栈
        // 底部导航仅在旧布局保留，新布局由界面内导航控制
    }

    /**
     * 导航按钮点击 - 切到对应场景（旧底部导航保留，新导航用NavigationManager）
     */
    onNavClick(targetScene) {
        // 已迁移到NavigationManager，保留这个方法供兼容性调用
        const screenIdMap = {
            [GameScene.CHARACTER_VIEW]: 'character',
            [GameScene.CITY_VIEW]: 'city',
            [GameScene.MAP_VIEW]: 'map',
            [GameScene.TASK_LIST]: 'task-list',
            [GameScene.CARD_COLLECTION]: 'card-collection',
        };
        const screenId = screenIdMap[targetScene];
        if (screenId) {
            NavigationManager.pushScreen(screenId, {}, 'scroll-expand');
        }
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
                NavigationManager.pushScreen('task-list', {}, 'scroll-expand');
            }, 100);
        }

        this.renderCurrentScene();
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
     * 注意：主场景切换已经交给 NavigationManager 处理
     * 这里只处理小游戏启动
     */
    renderCurrentScene() {
        // 只有小游戏需要在这里启动，其他主场景都由NavigationManager处理
        switch (this.gameState.currentScene) {
            case GameScene.FARMING_GAME:
                // 如果有currentTask（主命任务），自动根据gameType启动游戏
                // 如果没有currentTask（设施练习模式），游戏已经由FacilityScene手动启动，不重复启动
                if (this.gameState.currentTask) {
                    this.startMinigameByType();
                }
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
        // 使用导航返回
        NavigationManager.popScreen('scroll-collapse');
    }
};

// 全局暴露用于兼容调试
window.GameView = GameView;
