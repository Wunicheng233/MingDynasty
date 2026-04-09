/**
 * 大明王朝 - MingDynasty
 * 主游戏入口
 */

// ========== 游戏初始化 ==========

// 等待DOM加载完成后再初始化
document.addEventListener('DOMContentLoaded', () => {
    // 创建游戏状态
    const gameState = new GameState();

    // 创建视图
    const gameView = new GameView(gameState);

    // 初始渲染
    gameView.renderAll();

    // 挂载到window方便调试
    window.game = { gameState, gameView };

    console.log('大明王朝游戏初始化完成');
});
