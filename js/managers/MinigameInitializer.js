/**
 * 小游戏初始化器
 * 统一处理所有小游戏的状态初始化
 * 提取自GameView.initMinigame中的冗长if-else结构
 */

// 小游戏类型到初始化配置的映射
const MINIGAME_CONFIGS = {
    agriculture: {
        init: (gameState, template) => {
            gameState.farmingGame = {
                currentRound: 0,
                totalRounds: 5,
                scores: [],
                power: 0,
                direction: 1,
                speed: 2 + (6 - template.baseDifficulty),
                animationId: null
            };
        }
    },
    eloquence: {
        init: (gameState, template) => {
            gameState.eloquenceGame = {
                currentRound: 0,
                totalRounds: 5,
                correctCount: 0
            };
        }
    },
    infantry: {
        init: (gameState, template) => {
            gameState.infantryGame = {
                playerHp: 10,
                enemyHp: 10,
                gameOver: false
            };
        }
    },
    cavalry: {
        init: (gameState, template) => {
            gameState.cavalryGame = {
                playerPosition: 0,
                enemyPosition: 0,
                totalSteps: 10,
                flipped: Array(10).fill(false)
            };
        }
    },
    engineering: {
        init: (gameState, template) => {
            gameState.engineeringGame = {
                value: 0,
                direction: 1,
                speed: 2,
                targetStart: 40,
                targetEnd: 60,
                animationId: null
            };
        }
    },
    trade: {
        init: (gameState, template) => {
            gameState.tradeGame = {
                board: Array(9).fill(null),
                player: '1',
                computer: '2',
                gameOver: false
            };
        }
    },
    law: {
        init: (gameState, template) => {
            const pairs = [
                '死者手心有火药味',
                '凶手身上沾有火药',
                '证人说看到凶手',
                '证人作证看见凶手',
                '房门锁是坏的',
                '大门完好无损',
                '死者兜里有银两',
                '死者身上少了银两'
            ];
            const cards = [...pairs, ...pairs];
            cards.sort(() => Math.random() - 0.5);
            gameState.lawGame = {
                cards,
                flipped: Array(8).fill(false),
                matched: 0,
                firstPick: null,
                secondPick: null
            };
        }
    },
    navy: {
        init: (gameState, template) => {
            gameState.navyGame = {
                position: 50,
                direction: 1,
                speed: 3 + (6 - template.baseDifficulty),
                obstacles: [],
                score: 0,
                totalRounds: 5,
                currentRound: 0,
                animationId: null
            };
        }
    },
    strategy: {
        init: (gameState, template) => {
            gameState.strategyGame = {
                playerChoices: [],
                totalRounds: 5
            };
        }
    },
    spy: {
        init: (gameState, template) => {
            gameState.spyGame = {
                playerPos: {x: 0, y: 0},
                maze: [],
                foundExit: false
            };
        }
    },
    navigation: {
        init: (gameState, template) => {
            gameState.navigationGame = {
                targetDirection: 0,
                attempts: 0,
                maxAttempts: 5
            };
        }
    },
    medicine: {
        init: (gameState, template) => {
            gameState.medicineGame = {
                sequence: [],
                playerSequence: [],
                currentStep: 0,
                totalRounds: 5
            };
        }
    },
    calligraphy: {
        init: (gameState, template) => {
            gameState.calligraphyGame = {
                currentQuestion: null,
                questions: []
            };
        }
    },
    ritual: {
        init: (gameState, template) => {
            gameState.ritualGame = {
                items: [],
                correctOrder: ['玉玺', '编钟', '鼎', '爵', '豆'],
                shuffled: []
            };
        }
    },
    firearm: {
        init: (gameState, template) => {
            gameState.firearmGame = {
                x: 50,
                y: 50,
                directionX: 1,
                directionY: 1,
                speed: 2 + (6 - template.baseDifficulty),
                animationId: null
            };
        }
    },
    battle: {
        init: (gameState, template) => {
            gameState.battleGame = null;
        }
    },
    duel: {
        init: (gameState, template) => {
            // 由DuelGame自行初始化
        }
    },
    martial: {
        init: (gameState, template) => {
            // 由MartialGame自行初始化
        }
    }
};

// 需要启动动画的游戏类型
// Note: firearm 自己处理双坐标轴动画，不需要这里启动
const ANIMATED_GAMES = ['agriculture', 'engineering', 'navy'];

window.MinigameInitializer = {
    /**
     * 初始化小游戏状态
     * @param {Object} gameState - 游戏主状态
     * @param {Object} template - 任务模板
     */
    initMinigame(gameState, template) {
        const gameType = template.gameType;

        const config = MINIGAME_CONFIGS[gameType];
        if (config && config.init) {
            config.init(gameState, template);
        } else {
            console.warn('未知小游戏类型:', gameType);
        }
    },

    /**
     * 检查游戏类型是否需要启动动画
     * @param {string} gameType
     * @returns {boolean}
     */
    needsAnimation(gameType) {
        return ANIMATED_GAMES.includes(gameType);
    },

    /**
     * 获取所有支持的小游戏类型
     * @returns {string[]}
     */
    getSupportedGameTypes() {
        return Object.keys(MINIGAME_CONFIGS);
    }
};
