/**
 * 事件场景渲染模块
 * 显示事件文本内容和玩家选项，处理选择交互
 */

window.EventScene = {
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
        const yearStr = gameState.year >= 1368
            ? `洪武 ${gameState.year - 1368}年`
            : `至正 ${gameState.year - 1341 + 1}年`;
        return `${yearStr} ${gameState.month}月 · ${city ? city.name : '行路'}`;
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
            gameState.currentScene = GameScene.CITY_VIEW;
            gameView.renderAll();
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
        gameState.currentScene = GameScene.CITY_VIEW;
        window.game.gameView.renderAll();
    }
};
