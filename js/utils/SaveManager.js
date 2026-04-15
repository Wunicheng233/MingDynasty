/**
 * 存档管理器
 * 处理游戏状态的保存和加载到localStorage
 */

window.SaveManager = {
    /**
     * 保存游戏状态到localStorage
     */
    save(gameState) {
        try {
            const saveData = {
                year: gameState.year,
                month: gameState.month,
                day: gameState.day,
                money: gameState.money,
                merit: gameState.merit,
                currentRoleId: gameState.currentRoleId,
                skills: gameState.skills,
                collectedCards: gameState.collectedCards,
                currentTitle: gameState.currentTitle,
                battleWins: gameState.battleWins,
                relationships: gameState.relationships,
                eventFlags: gameState.eventFlags,
                triggeredEvents: gameState.triggeredEvents,
                currentTask: gameState.currentTask,
                currentScene: gameState.currentScene,
                logs: gameState.logs
            };
            localStorage.setItem('mingdynasty_save', JSON.stringify(saveData));
            return true;
        } catch (e) {
            console.error('保存存档失败:', e);
            return false;
        }
    },

    /**
     * 从localStorage加载游戏状态
     */
    load(gameState) {
        try {
            const saveDataStr = localStorage.getItem('mingdynasty_save');
            if (!saveDataStr) return false;

            const saveData = JSON.parse(saveDataStr);

            // 加载所有保存的数据
            Object.keys(saveData).forEach(key => {
                gameState[key] = saveData[key];
            });

            return true;
        } catch (e) {
            console.error('加载存档失败:', e);
            return false;
        }
    },

    /**
     * 清除存档
     */
    clear() {
        localStorage.removeItem('mingdynasty_save');
    },

    /**
     * 检查是否有存档
     */
    hasSave() {
        return localStorage.getItem('mingdynasty_save') !== null;
    }
};
