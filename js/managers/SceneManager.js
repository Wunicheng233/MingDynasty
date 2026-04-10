/**
 * 场景管理器
 * 统一处理所有场景的切换显示
 * 提取自GameView中重复的showXxxView方法
 */

// 场景ID与DOM元素ID的映射表
const SCENE_DOM_MAP = {
    [GameScene.CHARACTER_VIEW]: 'character-view',
    [GameScene.CITY_VIEW]: 'city-view',
    [GameScene.MAP_VIEW]: 'map-view',
    [GameScene.TASK_LIST]: 'task-list-view',
    [GameScene.FARMING_GAME]: 'farming-game-view',
    [GameScene.CARD_COLLECTION]: 'card-collection-view',
    [GameScene.CHARACTER_LIST_VIEW]: 'character-list-view',
    [GameScene.SOCIAL_VIEW]: 'social-view',
    [GameScene.MARKET]: 'market-view',
    [GameScene.EVENT]: 'event-view',
    [GameScene.FACILITY]: 'event-view'
};

window.SceneManager = {
    /**
     * 切换到指定场景
     * @param {GameScene} targetScene - 目标场景
     * @description 统一隐藏所有场景，只显示目标场景
     */
    switchToScene(targetScene) {
        // 隐藏所有场景
        Object.values(SCENE_DOM_MAP).forEach(domId => {
            const el = document.getElementById(domId);
            if (el) {
                el.style.display = 'none';
            }
        });

        // 显示目标场景
        const targetDomId = SCENE_DOM_MAP[targetScene];
        if (targetDomId) {
            const targetEl = document.getElementById(targetDomId);
            if (targetEl) {
                if (targetScene === GameScene.CHARACTER_VIEW) {
                    targetEl.style.display = 'flex';
                } else {
                    targetEl.style.display = 'block';
                }
            }
        }
    },

    /**
     * 获取场景对应的DOM元素ID
     * @param {GameScene} scene
     * @returns {string} DOM ID
     */
    getSceneDomId(scene) {
        return SCENE_DOM_MAP[scene];
    },

    /**
     * 检查当前是否在小游戏场景
     * @param {GameScene} scene
     * @returns {boolean}
     */
    isMinigameScene(scene) {
        return scene === GameScene.FARMING_GAME;
    }
};
