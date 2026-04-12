/**
 * 动画管理器
 * 统一处理所有小游戏的动画逻辑
 * 提取自GameView中的重复动画代码
 */
window.AnimationManager = {
    /**
     * 启动一个通用的摆动动画
     * @param {Object} gameState - 游戏状态对象
     * @param {string} property - 动画属性名（power/value/position/x/y等）
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @param {string} updateCallback - 更新显示的回调函数名
     * @param {Object} context - 回调函数上下文
     * @description 所有摆动动画逻辑都相同，只是属性名不同，统一提取复用
     */
    startSwingAnimation(gameState, gameConfig, updateCallback, context) {
        const { property, speedProperty = 'speed', directionProperty = 'direction', min = 0, max = 100 } = gameConfig;

        const game = gameState;

        const animate = () => {
            game[property] += game[directionProperty] * game[speedProperty];
            if (game[property] >= max) {
                game[property] = max;
                game[directionProperty] = -1;
            } else if (game[property] <= min) {
                game[property] = min;
                game[directionProperty] = 1;
            }
            if (updateCallback && context) {
                updateCallback.call(context, gameState);
            }
            game.animationId = requestAnimationFrame(animate);
        };

        if (game.animationId) {
            cancelAnimationFrame(game.animationId);
        }
        game.animationId = requestAnimationFrame(animate);
    },

    /**
     * 停止所有正在运行的小游戏动画
     * @param {Object} gameState - 游戏主状态
     */
    stopAllAnimations(gameState) {
        const animatedGames = ['farmingGame', 'engineeringGame', 'navyGame', 'firearmGame'];
        animatedGames.forEach(gameKey => {
            if (gameState[gameKey] && gameState[gameKey].animationId) {
                cancelAnimationFrame(gameState[gameKey].animationId);
                gameState[gameKey].animationId = null;
            }
        });
    },

    /**
     * 停止指定游戏的动画
     * @param {Object} game - 游戏状态对象
     */
    stopAnimation(game) {
        if (game.animationId) {
            cancelAnimationFrame(game.animationId);
            game.animationId = null;
        }
    },

    /**
     * 更新指示器位置（通用方法）
     * @param {string} barId - 进度条DOM ID
     * @param {string} indicatorId - 指示器DOM ID
     * @param {number} value - 当前值 (0-100)
     */
    updateIndicator(indicatorId, value) {
        const indicator = document.getElementById(indicatorId);
        if (indicator) {
            indicator.style.left = `${value}%`;
        }
    }
};
