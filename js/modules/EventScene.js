/**
 * 事件场景渲染模块
 * 显示事件文本内容和玩家选项，处理选择交互
 */

import EventScheduler from '../utils/EventScheduler.js';
import NavigationManager from '../managers/NavigationManager.js';
import TextFormatter from '../utils/TextFormatter.js';
import { getCityTemplateById } from '../../data/cities.js';

const EventScene = {
    /**
     * 渲染事件场景
     * @param {Object} gameState - 游戏状态
     * @returns {string} HTML
     */
    render(gameState) {
        const currentEvent = gameState.currentEvent;
        if (!currentEvent) {
            return '<div class="event-scene"><p>没有正在进行的事件</p></div>';
        }

        const currentScene = this.getCurrentScene(currentEvent, gameState.currentEventScene);

        let html = `<div class="event-scene">\n`;
        html += `<div class="event-header">\n`;
        html += `<h2>${currentEvent.name}</h2>\n`;
        html += `<div class="event-location">${this.getLocationText(gameState)}</div>\n`;
        html += `</div>\n`;

        // 如果当前场景有插画，显示插画
        if (currentScene.image) {
            html += `<div class="event-illustration">
                <img src="${currentScene.image}" alt="${currentEvent.name}">
            </div>\n`;
        }

        // 如果整个事件有头图插画，也显示（比场景插画更大，放在最上面）
        if (currentEvent.image && !currentScene.image) {
            // 区分：事件级别的插画放在最前面
            // 代码结构已经处理了场景级，这里留空，数据结构支持两种方式
        }

        // 事件文本 - 替换换行符为<br>
        const textHtml = currentScene.text.replace(/\n/g, '<br>');
        html += `<div class="event-text">${textHtml}</div>\n`;

        // 选项
        if (currentScene.choices && currentScene.choices.length > 0) {
            html += `<div class="event-choices">\n`;
            html += `<h3>请选择：</h3>\n`;
            currentScene.choices.forEach((choice, index) => {
                html += `<button class="event-choice-btn" data-choice-index="${index}">${index + 1}. ${choice.text}</button>\n`;
            });
            html += `</div>\n`;
        } else {
            // 没有选项，说明是最后一个场景，显示完成按钮
            html += `<div class="event-choices">\n`;
            html += `<button class="event-choice-btn" onclick="EventScene.finishEvent()">完成</button>\n`;
            html += `</div>\n`;
        }

        html += `</div>\n`;

        // 绑定事件
        setTimeout(() => this.bindChoiceEvents(currentEvent, gameState), 0);

        return html;
    },

    /**
     * 获取当前场景对象
     */
    getCurrentScene(event, sceneId) {
        return event.scenes.find(s => s.sceneId === sceneId);
    },

    /**
     * 获取位置文本
     */
    getLocationText(gameState) {
        const city = getCityTemplateById(gameState.currentCityId);
        const yearNum = gameState.year >= 1368
            ? gameState.year - 1368
            : gameState.year - 1341 + 1;
        const dynasty = gameState.year >= 1368 ? '洪武' : '至正';
        const yearStr = `${dynasty} ${TextFormatter.numberToChinese(yearNum)}年`;
        return `${yearStr} ${TextFormatter.numberToChinese(gameState.month)}月 · ${city ? city.name : '行路'}`;
    },

    /**
     * 绑定选项点击事件
     */
    bindChoiceEvents(event, gameState) {
        document.querySelectorAll('.event-choice-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const choiceIndex = parseInt(btn.dataset.choiceIndex);
                this.chooseOption(event, gameState, choiceIndex);
            });
        });
    },

    /**
     * 处理玩家选择
     */
    chooseOption(event, gameState, choiceIndex) {
        const currentScene = this.getCurrentScene(event, gameState.currentEventScene);
        if (!currentScene || !currentScene.choices) {
            // 事件场景无效，关闭事件
            gameState.currentEvent = null;
            gameState.currentEventScene = null;
            // 返回城镇 - 使用新导航系统返回
            NavigationManager.popScreen('scroll-collapse');
            return;
        }
        const choice = currentScene.choices[choiceIndex];

        // 执行选择，得到下一个场景ID
        const nextSceneId = EventScheduler.executeChoice(event, currentScene, choice, gameState);

        if (nextSceneId === null) {
            // 事件结束，返回城市场景
            gameState.currentEvent = null;
            gameState.currentEventScene = null;
            window.game.gameView.goBackToCity();
        } else {
            // 跳转到下一个场景
            gameState.currentEventScene = nextSceneId;
            window.game.gameView.renderAll();
        }
    },

    /**
     * 从战斗返回后继续事件（预留接口）
     */
    continueAfterBattle(gameState, victory) {
        // 可以根据战斗结果继续事件分支
        window.game.gameView.renderAll();
    },

    /**
     * 完成事件，返回城镇
     */
    finishEvent() {
        const gameState = window.game.gameState;
        gameState.currentEvent = null;
        gameState.currentEventScene = null;
        // 返回城镇 - 使用新导航系统返回
        NavigationManager.popScreen('scroll-collapse');
    },

    // 注入样式，统一风格
    stylesInjected: false,
    ensureStylesInjected() {
        if (this.stylesInjected) return;
        this.stylesInjected = true;

        const style = document.createElement('style');
        style.textContent = `
.event-scene {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    padding: var(--space-md);
    background-color: var(--color-bg-primary);
}

.event-scene .event-content {
    max-width: 800px;
    margin: 0 auto;
    background-color: rgba(253, 251, 247, 0.9);
    backdrop-filter: blur(4px);
    border: var(--border-double);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    padding: var(--space-xl);
}

.event-header {
    text-align: center;
    margin-bottom: var(--space-lg);
    padding-bottom: var(--space-md);
    border-bottom: var(--border-default);
}

.event-header h2 {
    font-family: var(--font-serif);
    font-size: var(--text-heading-md);
    color: var(--color-text-primary);
    margin: 0;
}

.event-location {
    font-family: var(--font-serif);
    font-size: var(--text-body-sm);
    color: var(--color-text-tertiary);
    margin-top: var(--space-sm);
}

.event-illustration {
    text-align: center;
    margin-bottom: var(--space-lg);
}

.event-illustration img {
    max-width: 100%;
    max-height: 40vh;
    border-radius: var(--radius-md);
    border: var(--border-default);
}

.event-text {
    font-family: var(--font-serif);
    font-size: var(--text-body);
    line-height: 1.8;
    color: var(--color-text-primary);
    margin-bottom: var(--space-xl);
}

.event-choices {
    margin-top: var(--space-xl);
}

.event-choices h3 {
    font-family: var(--font-serif);
    font-size: var(--text-heading-sm);
    color: var(--color-text-primary);
    margin: 0 0 var(--space-md);
}

.event-choice-btn {
    display: block;
    width: 100%;
    text-align: left;
    margin-bottom: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    background-color: var(--color-bg-secondary);
    border: var(--border-default);
    border-radius: var(--radius-sm);
    font-family: var(--font-serif);
    font-size: var(--text-body);
    color: var(--color-text-primary);
    cursor: pointer;
    transition: all var(--transition-fast);
}

.event-choice-btn:hover {
    background-color: rgba(158, 42, 43, 0.05);
    border-color: var(--color-accent-primary);
    transform: translateX(4px);
}

/* 响应式 */
@media (max-width: 768px) {
    .event-scene {
        padding: var(--space-sm);
    }
    .event-scene .event-content {
        padding: var(--space-md);
    }
}
`;
        document.head.appendChild(style);
    }
    };

// 确保样式注入
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        EventScene.ensureStylesInjected();
    });
} else {
    EventScene.ensureStylesInjected();
}

export default EventScene;
window.EventScene = EventScene;
