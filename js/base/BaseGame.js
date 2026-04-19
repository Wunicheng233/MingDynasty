/**
 * 小游戏基类
 * 所有小游戏继承自此基类，提供通用功能，减少重复代码
 *
 * 每个小游戏只需要实现差异化逻辑，通用逻辑由基类提供
 */

import GameResultManager from '../managers/GameResultManager.js';

export default class BaseGame {
    /**
     * 构造函数
     * @param {GameView} gameView - 游戏视图实例
     * @param {GameState} gameState - 游戏主状态
     * @param {string} title - 游戏标题（可选，练习模式使用）
     */
    constructor(gameView, gameState, title = null) {
        this.gameView = gameView;
        this.gameState = gameState;
        this.title = title || this.getDefaultTitle();
        this.isPractice = title !== null; // 是否是练习模式（设施中练习）
    }

    /**
     * 获取默认标题（子类可以覆盖）
     * @returns {string}
     */
    getDefaultTitle() {
        const task = this.gameState.currentTask;
        return task ? task.name : '小游戏';
    }

    /**
     * 启动游戏 - 模板方法
     * 子类不需要覆盖这个方法，覆盖onStart即可
     */
    start() {
        this.onStart();
        this.render();
        this.bindEvents();
    }

    /**
     * 游戏启动时初始化（子类覆盖）
     */
    onStart() {
        // 默认空实现，子类覆盖
    }

    /**
     * 渲染游戏界面（子类必须覆盖）
     */
    render() {
        throw new Error('子类必须实现render方法');
    }

    /**
     * 绑定事件（子类覆盖，基类提供通用绑定）
     */
    bindEvents() {
        // 通用按钮事件绑定 - 给所有带data-action的按钮绑定
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.onAction(action);
            });
        });
    }

    /**
     * 处理玩家动作（子类覆盖）
     * @param {string} action - 动作名称
     */
    onAction(action) {
        console.warn('onAction not implemented:', action);
    }

    /**
     * 添加日志到游戏日志区域
     * @param {string} text - 日志文本
     * @param {string} logId - 日志区域ID，默认为 'game-log'
     */
    addLog(text, logId = 'game-log') {
        GameResultManager.addLog(logId, text);
    }

    /**
     * 滚动日志到底部
     * @param {string} logId
     */
    scrollLogToBottom(logId = 'game-log') {
        const logEl = document.getElementById(logId);
        if (logEl) {
            logEl.scrollTop = logEl.scrollHeight;
        }
    }

    /**
     * 检查游戏是否结束（子类覆盖）
     * @returns {boolean} 是否结束
     */
    checkGameOver() {
        return false;
    }

    /**
     * 完成游戏并结算
     * @param {number} ratio - 完成率 0-1
     * @param {string} resultText - 结果文本
     */
    finish(ratio, resultText) {
        const task = this.gameState.currentTask;
        const skillType = this.getSkillType();

        if (this.isPractice) {
            // 练习模式
            GameResultManager.settlePractice(
                this.gameState,
                this.gameView,
                skillType,
                ratio,
                resultText
            );
        } else if (task) {
            // 任务模式
            GameResultManager.settleMission(
                this.gameState,
                this.gameView,
                task,
                ratio,
                resultText
            );
        }
    }

    /**
     * 获取当前技能类型（子类覆盖，用于练习模式）
     * @returns {string} 技能类型
     */
    getSkillType() {
        const task = this.gameState.currentTask;
        return task ? task.requiredSkill : null;
    }

    /**
     * 渲染HTML到小游戏容器
     * @param {string} html
     */
    renderToContainer(html) {
        // 确保容器存在
        let container = document.getElementById('farming-game-view');
        if (!container) {
            container = document.createElement('div');
            container.id = 'farming-game-view';
            container.className = 'scene-view';
            document.getElementById('main-display').appendChild(container);
        }
        container.innerHTML = html;
    }
};

// 全局暴露用于兼容调试
window.BaseGame = BaseGame;
