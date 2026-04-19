/**
 * 卡片收集系统 - 拆分自GameState
 * 负责卡片收集、称号管理、全局收集持久化
 */

import { CardTypes, getCardById, getAllCards, getCardTypeName } from '../../data/cards.js';

const CardSystem = {
    /**
     * 检查并收集新卡片 - 统一入口
     * @param {GameState} gameState - 游戏状态实例
     * @param {string} cardId
     * @returns {boolean} true表示是新收集的，false表示已经有了
     */
    acquireCard(gameState, cardId) {
        if (gameState.collectedCards[cardId]) {
            return false;
        }

        gameState.collectedCards[cardId] = true;
        const card = getCardById(cardId);

        if (card) {
            gameState.addLog(`获得新卡片：${getCardTypeName(card.type)}【${card.name}】`);

            // 根据卡片类型执行附加效果
            this.processCardAcquired(gameState, card);
        }

        // 保存到全局收集（跨存档继承）
        this.saveGlobalCollection(gameState);

        return true;
    },

    /**
     * 别名兼容
     */
    collectCard(gameState, cardId) {
        return this.acquireCard(gameState, cardId);
    },

    /**
     * 卡片获取后的附加处理
     * @param {GameState} gameState
     * @param {Card} card
     */
    processCardAcquired(gameState, card) {
        switch (card.type) {
            case CardTypes.TITLE:
                // 称号卡，如果玩家当前没有佩戴主称号，可以自动佩戴
                if (!gameState.currentTitle && card.effect) {
                    gameState.currentTitle = card.card_id;
                }
                break;
            case CardTypes.CHARACTER:
                // 人物卡，解锁可扮演，不需要即时处理，新游戏时读取即可
                break;
            case CardTypes.TACTIC_BATTLE:
            case CardTypes.MARTIAL_DUEL:
            case CardTypes.SECRET:
                // 战术/武技/秘传，玩家已经收集，战斗时会自动读取可用列表
                break;
            default:
                break;
        }
    },

    /**
     * 从localStorage加载全局卡片收集（跨存档继承）
     */
    loadGlobalCollection(gameState) {
        try {
            const saved = localStorage.getItem('hongwu_card_collection');
            if (saved) {
                const data = JSON.parse(saved);
                if (data.collectedCards && typeof data.collectedCards === 'object') {
                    // 合并到当前收集 - 当前存档已收集的保留，全局收集的也添加
                    for (const cardId in data.collectedCards) {
                        if (!gameState.collectedCards[cardId]) {
                            gameState.collectedCards[cardId] = data.collectedCards[cardId];
                        }
                    }
                }
            }
        } catch (e) {
            console.warn('加载全局卡片收集失败', e);
        }
    },

    /**
     * 保存全局卡片收集到localStorage（跨存档继承）
     */
    saveGlobalCollection(gameState) {
        try {
            // 统计收集信息
            const stats = {
                total_collected: Object.keys(gameState.collectedCards).length,
                by_type: {}
            };
            for (const cardId in gameState.collectedCards) {
                const card = getCardById(cardId);
                if (card) {
                    const typeName = getCardTypeName(card.type);
                    stats.by_type[typeName] = (stats.by_type[typeName] || 0) + 1;
                }
            }

            const data = {
                collectedCards: gameState.collectedCards,
                collection_stats: stats,
                updated_at: new Date().toISOString()
            };

            localStorage.setItem('hongwu_card_collection', JSON.stringify(data));
        } catch (e) {
            console.warn('保存全局卡片收集失败', e);
        }
    },

    /**
     * 获取当前所有已收集卡片按类型分组
     * @returns {Object} {type: cards[]}
     */
    getCollectedCardsByType(gameState) {
        const result = {};
        for (const cardId in gameState.collectedCards) {
            const card = getCardById(cardId);
            if (card) {
                if (!result[card.type]) {
                    result[card.type] = [];
                }
                result[card.type].push(card);
            }
        }
        return result;
    },

    /**
     * 获取收集统计
     * @returns {Object} {total: number, totalPossible: number, byType: {type: {collected: number, total: number}}}
     */
    getCollectionStats(gameState) {
        const allCards = getAllCards();
        const collectedByType = this.getCollectedCardsByType(gameState);

        const stats = {
            total: Object.keys(gameState.collectedCards).length,
            totalPossible: allCards.length,
            byType: {}
        };

        const allByType = {};
        allCards.forEach(card => {
            if (!allByType[card.type]) {
                allByType[card.type] = 0;
            }
            allByType[card.type]++;
        });

        for (const type in allByType) {
            stats.byType[type] = {
                collected: (collectedByType[type] || []).length,
                total: allByType[type]
            };
        }

        return stats;
    },

    /**
     * 检查玩家是否拥有某张卡片
     * @param {GameState} gameState
     * @param {string} cardId
     * @returns {boolean}
     */
    hasCard(gameState, cardId) {
        return !!gameState.collectedCards[cardId];
    },

    /**
     * 获取当前称号提供的属性加成
     * @returns {Object} {attribute: bonusValue}
     */
    getCurrentTitleBonus(gameState) {
        if (!gameState.currentTitle) {
            return {};
        }
        const titleCard = getCardById(gameState.currentTitle);
        if (titleCard && titleCard.type === CardTypes.TITLE && titleCard.effect) {
            return titleCard.effect;
        }
        return {};
    },

    /**
     * 从localStorage加载合战胜利次数
     */
    loadBattleWins(gameState) {
        try {
            const saved = localStorage.getItem('hongwu_battle_wins');
            if (saved) {
                const data = JSON.parse(saved);
                gameState.battleWins.total = data.total || 0;
                gameState.battleWins.naval = data.naval || 0;
                gameState.battleWins.field = data.field || 0;
                gameState.battleWins.siege = data.siege || 0;
                gameState.battleWins.firearm = data.firearm || 0;
            }
        } catch (e) {
            console.warn('加载合战胜利次数失败', e);
        }
    },

    /**
     * 保存合战胜利次数到localStorage
     */
    saveBattleWins(gameState) {
        try {
            localStorage.setItem('hongwu_battle_wins', JSON.stringify(gameState.battleWins));
        } catch (e) {
            console.warn('保存合战胜利次数失败', e);
        }
    },

    /**
     * 增加合战胜利次数
     * @param {GameState} gameState
     * @param {string} battleType - 'field'|'siege'|'naval'
     */
    incrementBattleWinCount(gameState, battleType) {
        gameState.battleWins.total++;
        if (typeof gameState.battleWins[battleType] !== 'undefined') {
            gameState.battleWins[battleType]++;
        }
        this.saveBattleWins(gameState);

        // 检查是否解锁称号
        this.checkBattleTitles(gameState);
    },

    /**
     * 检查是否解锁合战相关称号
     */
    checkBattleTitles(gameState) {
        // 策士 - 合战胜利10次
        if (gameState.battleWins.total >= 10 && !this.hasCard(gameState, 'TITLE_BATTLE_1')) {
            this.acquireCard(gameState, 'TITLE_BATTLE_1');
        }
        // 军师 - 合战胜利20次
        if (gameState.battleWins.total >= 20 && !this.hasCard(gameState, 'TITLE_BATTLE_2')) {
            this.acquireCard(gameState, 'TITLE_BATTLE_2');
        }
        // 智将 - 合战胜利40次
        if (gameState.battleWins.total >= 40 && !this.hasCard(gameState, 'TITLE_BATTLE_3')) {
            this.acquireCard(gameState, 'TITLE_BATTLE_3');
        }
        // 军神 - 合战胜利80次
        if (gameState.battleWins.total >= 80 && !this.hasCard(gameState, 'TITLE_BATTLE_4')) {
            this.acquireCard(gameState, 'TITLE_BATTLE_4');
        }
        // 水战都督 - 水战胜利20次
        if (gameState.battleWins.naval >= 20 && !this.hasCard(gameState, 'TITLE_BATTLE_NAVAL')) {
            this.acquireCard(gameState, 'TITLE_BATTLE_NAVAL');
        }
        // 火器专家 - 使用火器胜利30次
        if (gameState.battleWins.firearm >= 30 && !this.hasCard(gameState, 'TITLE_BATTLE_FIREARM')) {
            this.acquireCard(gameState, 'TITLE_BATTLE_FIREARM');
        }
    },

    /**
     * 统计玩家持有的宝物卡数量
     */
    countTreasures(gameState) {
        let count = 0;
        for (const cardId in gameState.collectedCards) {
            const card = getCardById(cardId);
            if (card && card.type === CardTypes.TREASURE) {
                count++;
            }
        }
        return count;
    }
};

export default CardSystem;
window.CardSystem = CardSystem;
