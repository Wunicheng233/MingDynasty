/**
 * 合战军团对战小游戏（兵法）
 * 重构后：入口模块，协调渲染和控制
 * 完整机制：卡片组合 + 兵种相克 + 阵型相克 + 秘策系统 + 水战规则
 * 遵循策划《合战完整机制·本土化方案》
 */

window.BattleGame = {
    /**
     * 启动游戏
     */
    start(gameView, gameState) {
        const task = gameState.currentTask;
        const player = gameState.getPlayerCharacter();

        // 初始化战斗状态
        // 简化：玩家使用当前技能对应的兵种，这里默认根据任务类型
        let battleType = 'field';
        if (task && task.category === 'military') {
            if (task.missionType === 'siege') battleType = 'siege';
            if (task.missionType === 'naval') battleType = 'naval';
        }

        // 玩家兵种选择简化：根据技能等级选最高的
        const availableTroops = getAvailableTroopsForBattle(battleType);
        let playerTroop = availableTroops[0]; // 默认步兵
        let maxLevel = 0;
        for (const t of availableTroops) {
            const level = gameState.getSkillLevel(t.skillBonus);
            if (level > maxLevel) {
                maxLevel = level;
                playerTroop = t;
            }
        }

        // 获取玩家兵法等级决定秘策次数
        const strategyLevel = gameState.getSkillLevel('strategy');
        const secretUses = 1 + strategyLevel; // Lv1=2, Lv2=3, Lv3=4, Lv4=5

        // 敌方信息简化：根据任务难度设定
        const enemyTroopsCount = 100 + task.baseDifficulty * 10;
        const enemyMorale = 70 + task.baseDifficulty;

        // 发牌：牌堆由所有绿色基础卡 + 玩家已收集的战术卡组成
        let deck = [];
        // 加入所有绿色基础卡各一张（共9张）
        deck = deck.concat(getAllNormalBattleCards());
        // 加入玩家已收集的战术卡
        const playerTactics = getPlayerCollectedTactics(gameState.collectedCards);
        deck = deck.concat(playerTactics);
        // 洗牌
        deck = deck.sort(() => Math.random() - 0.5);

        // 计算玩家攻防
        const pAttack = calculateTroopAttack(
            player.command || 70,
            player.martial || 70,
            playerTroop,
            gameState.getSkillLevel(playerTroop.skillBonus)
        );
        const pDefense = calculateTroopDefense(
            player.command || 70,
            playerTroop,
            gameState.getSkillLevel(playerTroop.skillBonus)
        );

        // 敌方AI默认阵型
        const enemyFormation = getFormationById('none');

        // 随机风向（水战）
        let wind = 'none';
        if (battleType === 'naval') {
            const rand = Math.random();
            if (rand < 0.33) wind = 'player';
            else if (rand < 0.66) wind = 'enemy';
            else wind = 'none';
        }

        // 初始化完整战斗状态
        gameState.battleGame = {
            battleId: task.missionId,
            battleType: battleType,
            phase: 'preBattle', // preBattle → discard → secret → play → result
            currentTurn: 1,
            maxTurns: 5,

            player: {
                general: player,
                troops: 100,
                maxTroops: 100,
                morale: 80,
                formation: null, // 待选择
                unitType: playerTroop,
                attack: pAttack,
                defense: pDefense,
                handCards: [], // 待发牌
                drawPile: deck,
                selectedNormal: [],
                selectedTactic: null,
                playedNormal: null,
                playedTactic: null,
                permanentCard: null,
                secretStrategyUsesLeft: secretUses
            },

            enemy: {
                general: { name: task.name || '敌军' },
                troops: enemyTroopsCount,
                maxTroops: enemyTroopsCount,
                morale: enemyMorale,
                formation: enemyFormation,
                unitType: availableTroops[Math.floor(Math.random() * availableTroops.length)],
                attack: Math.round(10 + task.baseDifficulty * 2),
                defense: Math.round(8 + task.baseDifficulty),
                handCards: [],
                drawPile: [],
                selectedNormal: [],
                selectedTactic: null,
                permanentCard: null
            },

            environment: {
                wind: wind,
                weather: 'clear', // 暂时简化，只支持clear/rain
                currentTurn: 1
            },

            fortification: battleType === 'siege' ? 30 : 0, // 城防
            battleLog: []
        };

        // AI发初始牌
        BattleController.aiInitDraw(gameState.battleGame);

        // 渲染战前阵型选择
        BattleRenderer.renderPreBattle(gameState, gameView);
    }
};
