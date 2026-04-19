/**
 * 修筑城墙小游戏（工程）
 * 筑城考工 - 使用不同大小石块堆砌，让总重量尽可能接近目标
 */

import SkillSystem from '../systems/SkillSystem.js';
import TimeSystem from '../systems/TimeSystem.js';
import { GameScene } from '../GameState.js';
import GameResultManager from '../managers/GameResultManager.js';
import AnimationManager from '../managers/AnimationManager.js';
import { getMissionTemplateById } from '../../data/tasks.js';

const EngineeringGame = {
    /**
     * 启动游戏
     */
    start(gameView, gameState, title = null) {
        const task = gameState.currentTask;
        // 随机目标重量在 1400-1800 之间
        const targetWeight = Math.floor(Math.random() * 400) + 1400;

        // 合并游戏数据到已经初始化的对象（保留MinigameInitializer设置的动画属性）
        Object.assign(gameState.engineeringGame, {
            targetWeight: targetWeight,
            currentWeight: 0,
            // 可用石块: 大块500，中块250，小块50
            availableStones: [
                {name: '大块青石', weight: 500},
                {name: '中块条石', weight: 250},
                {name: '小块碎石', weight: 50}
            ],
            isPractice: title !== null
        });

        this.render(gameState, title);
    },

    /**
     * 渲染当前状态
     */
    render(gameState, title = null) {
        const game = gameState.engineeringGame;
        let headerTitle;
        if (title) {
            headerTitle = title;
        } else if (gameState.currentTask) {
            const template = getMissionTemplateById(gameState.currentTask.templateId);
            headerTitle = template.name;
        } else {
            headerTitle = '修筑城防';
        }
        let html = `
            <div class="engineering-header">
                <h2>${headerTitle}</h2>
                <p>用不同大小石块堆砌城墙，让总重量尽可能接近目标重量</p>
                <p>目标重量: <strong>${game.targetWeight}</strong> 贯</p>
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

        const farmingView = document.getElementById('farming-game-view');
        if (farmingView) {
            farmingView.innerHTML = html;
        }
        this.bindEvents(gameState, gameView);
    },

    /**
     * 绑定事件
     */
    bindEvents(gameState, gameView) {
        document.querySelectorAll('.engineering-stone').forEach(btn => {
            btn.addEventListener('click', () => {
                this.addStone(parseInt(btn.dataset.weight), gameState, gameView);
            });
        });
    },

    /**
     * 添加石块
     */
    addStone(weight, gameState, gameView) {
        const game = gameState.engineeringGame;
        game.currentWeight += weight;
        const stone = game.availableStones.find(s => s.weight === weight);
        this.addLog(`添加了${stone.name}，重量+${weight}，当前${game.currentWeight}贯`, gameState);

        document.getElementById('current-weight').textContent = game.currentWeight;

        // 检查是否达到或超过目标
        if (game.currentWeight >= game.targetWeight) {
            this.finish(gameState, gameView);
        }
    },

    /**
     * 添加日志
     */
    addLog(text, gameState) {
        const logEl = document.getElementById('engineering-log');
        logEl.innerHTML += `<div class="engineering-log-entry">${text}</div>`;
        logEl.scrollTop = logEl.scrollHeight;
    },

    /**
     * 结算游戏
     */
    finish(gameState, gameView) {
        const game = gameState.engineeringGame;
        const task = gameState.currentTask;

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

        if (game.isPractice) {
            // 工部作坊练习 - 非任务，固定奖励工政经验，消耗5天
            const expGained = Math.round(10 * ratio);
            gameState.addSkillExp('engineering', expGained);
            gameState.addLog(`修筑城防练习完成：${resultText} 获得 ${expGained} 工政经验，消耗5天时间。`);
            gameState.advanceDays(5);
            gameState.engineeringGame = null;
            // 返回设施场景
            gameState.currentScene = GameScene.FACILITY;
            gameView.renderAll();
        } else {
            // 正常任务结算 - 使用新主命系统
            const template = getMissionTemplateById(gameState.currentTask.templateId);
            // 实际进度 = 目标值 * 完成率
            const actualProgress = Math.round(gameState.currentTask.targetValue * ratio);
            const success = actualProgress > 0;

            // 使用新的主命系统结算
            const result = gameState.completeMission(success, actualProgress);

            gameState.addLog(`【${template.name}】${resultText}`);

            // 时间推进：按任务限时推进
            TimeSystem.advanceDays(gameState, template.timeLimitDays);

            gameState.engineeringGame = null;
            gameState.currentScene = GameScene.CITY_VIEW;
            gameView.renderAll();
        }
    }
};

export default EngineeringGame;
window.EngineeringGame = EngineeringGame;
