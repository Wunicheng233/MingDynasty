/**
 * 武馆切磋小游戏（武学）
 * 重构后：入口模块，协调渲染和控制
 * 卡片对决个人战，使用数字卡组合和特殊技击败对手
 */

window.MartialGame = {
    /**
     * 启动游戏
     */
    start(gameView, gameState, title = null) {
        // 获取玩家属性
        const player = gameState.getPlayerCharacter();
        const strength = player.baseStats ? player.baseStats.strength : 50;
        const martialLevel = gameState.getSkillLevel('martial') || 0;

        // 计算初始属性 - 体力 = 力量 * 2 + 50
        const maxHp = strength * 2 + 50;

        // 获取对手 - 武馆师傅，从人物模板读取
        const enemyTemplate = CHARACTER_TEMPLATES.find(t => t.templateId === 'WUGUAN_SHIFU');
        const enemyMartialLevel = enemyTemplate?.initialSkills?.martial || 4;
        const enemyStrength = enemyTemplate?.baseStats?.strength || 70;
        const enemyMaxHp = enemyStrength * 2 + 50;

        const enemy = {
            name: enemyTemplate?.name || '武馆师傅',
            maxHp: enemyMaxHp,
            skillLevel: {martial: enemyMartialLevel}
        };

        // 初始化牌堆 - 数字卡 1-9 各 3 张 + 玩家已学会的特殊技
        let playerDeck = [];
        // 数字卡 1-9 各三张
        for (let i = 1; i <= 9; i++) {
            for (let j = 0; j < 3; j++) {
                playerDeck.push({type: 'number', value: i});
            }
        }
        // 添加默认特殊技太祖长拳（一张）
        playerDeck.push({type: 'special', cardId: 'taizu_boxing'});
        // TODO: 未来可以添加玩家已学会的其他特殊技

        // 洗牌
        playerDeck.sort(() => Math.random() - 0.5);

        // 敌人牌堆 - 基于敌人模板添加特殊技
        const enemyDeck = MartialCalculator.buildEnemyDeck(enemyTemplate);

        // 初始化游戏状态 - 敌人和玩家结构统一
        gameState.martialGame = {
            player: {
                name: '你',
                hp: maxHp,
                maxHp: maxHp,
                hand: [],
                deck: playerDeck,
                discard: [],
                skillLevel: {martial: martialLevel}
            },
            enemy: {
                name: enemy.name,
                hp: enemyMaxHp,
                maxHp: enemyMaxHp,
                hand: [],
                deck: enemyDeck,
                discard: [],
                skillLevel: enemy.skillLevel
            },
            round: 1,
            playerMove: null,
            enemyMove: null,
            enemyCombo: null,
            comboActivated: null,
            playerDodgeNext: false,
            enemyDodgeNext: false,
            playerNextPriorityBonus: 0,
            enemyNextPriorityBonus: 0,
            isPractice: title !== null // 是否是武馆拜师学艺（非主命任务）
        };

        // 抽初始手牌 - 用户要求：双方初始都是5张
        MartialCalculator.drawCardsToHand(gameState.martialGame.player, 5);
        MartialCalculator.drawCardsToHand(gameState.martialGame.enemy, 5);

        MartialRenderer.renderRound(gameState, gameView, title);
    }
};
