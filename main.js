/**
 * 大明王朝 - MingDynasty
 * 主游戏入口
 *
 * UI重构后：先显示启动界面，用户选择后再初始化游戏
 *
 * ES6 Modules entry point
 */

// Import all required modules
import GameState, { GameScene } from './js/GameState.js';
import GameView from './js/GameView.js';
import NavigationManager from './js/managers/NavigationManager.js';
import StartScreen from './js/modules/StartScreen.js';

// 导入所有界面渲染器（确保它们挂载到window全局对象供NavigationManager使用）
import './js/modules/MapRenderer.js';
import './js/modules/CityViewRenderer.js';
import './js/modules/CharacterViewRenderer.js';
import './js/modules/TaskListRenderer.js';
import './js/modules/CardCollectionRenderer.js';
import './js/modules/CharacterListRenderer.js';
import './js/modules/SocialRenderer.js';
import './js/modules/MarketScene.js';
import './js/modules/EventScene.js';
import './js/modules/FacilityScene.js';
import './js/modules/SaveLoadUI.js';
import './js/modules/SettingsUI.js';

// Global exposure for debugging and startup screen
window.GameMain = {
    gameState: null,
    gameView: null,

    // 开始新游戏
    startNewGame() {
        this.initGame();
        console.log('大明王朝新游戏初始化完成');
    },

    // 初始化游戏
    initGame() {
        // 创建游戏状态
        this.gameState = new GameState();

        // 创建视图
        this.gameView = new GameView(this.gameState);

        // 初始渲染
        this.gameView.renderAll();

        // 挂载到window方便调试
        window.game = { gameState: this.gameState, gameView: this.gameView };

        // 新导航系统：压入大地图作为根界面（主枢纽）
        if (this.gameState.currentScene === GameScene.MAP_VIEW) {
            NavigationManager.replaceScreen('map', {}, 'fade-in');
        } else {
            // 如果开局直接在城市（比如序章之后），压入城市
            NavigationManager.replaceScreen('city', {}, 'fade-in');
        }
    }
};

// ========== 启动：显示启动界面 ==========
// 等待DOM加载完成后显示启动界面
document.addEventListener('DOMContentLoaded', () => {
    // 隐藏主游戏容器
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.style.display = 'none';
    }
    // 显示启动界面
    if (window.StartScreen) {
        StartScreen.show();
    } else {
        // 降级：如果启动界面未加载，直接初始化
        GameMain.startNewGame();
    }

    console.log('洪武立志传启动界面已加载');
});

export default GameMain;
