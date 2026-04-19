/**
 * 个人战单挑小游戏（武术）
 * 按照UI/10-个人战界面.md设计规范重构
 * 卡牌对战，三张同类型触发必杀
 */

import { drawNCards, getAllDuelCards, BattleCardTypes } from '../../data/battle-cards.js';
import { getCharacterTemplateByNumId } from '../../data/characters.js';
import { GameScene } from '../GameState.js';
import TimeSystem from '../systems/TimeSystem.js';
import GameResultManager from '../managers/GameResultManager.js';
import SocialSystem from '../systems/SocialSystem.js';
import { getMissionTemplateById } from '../../data/tasks.js';

const DuelGame = {
    // 默认配置
    maxHp: 30,

    /**
     * 启动游戏
     */
    start(gameView, gameState, title = null) {
        const task = gameState.currentTask;
        // 玩家和对手各30血，每回合抽3张牌
        const playerDeck = drawNCards(15, getAllDuelCards());
        Object.assign(gameState.duelGame, {
            playerHp: 30,
            enemyHp: 30,
            playerHand: playerDeck.slice(0, 3),
            drawPile: playerDeck.slice(3),
            combo: 0,
            isPractice: title !== null, // 是否是武馆切磋（非主命任务）
            autoBattle: false,
            battleSpeed: 1
        });

        const game = gameState.duelGame;
        const headerTitle = title || (task ? task.name : '个人切磋');

        // 获取对手信息
        let enemyName = '对手';
        if (gameState.currentSocialTarget) {
            const npc = getCharacterTemplateByNumId(gameState.currentSocialTarget);
            enemyName = npc ? npc.name : enemyName;
        }

        let html = `
            <div class="duel-container">
                <!-- 背景层 -->
                <div class="duel-bg duel-bg-arena"></div>

                <!-- 双方状态栏 -->
                <div class="combatant-panel player-panel">
                    <div class="combatant-info">
                        <div class="combatant-name">你</div>
                        <div class="hp-row">
                            <span class="hp-label">❤️ 体力</span>
                            <div class="hp-bar">
                                <div class="hp-fill" style="width: ${game.playerHp * 100 / this.maxHp}%"></div>
                            </div>
                            <span class="hp-value" id="duel-player-hp">${game.playerHp}/${this.maxHp}</span>
                        </div>
                    </div>
                </div>

                <div class="vs-mark">VS</div>

                <div class="combatant-panel enemy-panel">
                    <div class="combatant-info">
                        <div class="combatant-name">${enemyName}</div>
                        <div class="hp-row">
                            <span class="hp-label">❤️ 体力</span>
                            <div class="hp-bar">
                                <div class="hp-fill" style="width: ${game.enemyHp * 100 / this.maxHp}%"></div>
                            </div>
                            <span class="hp-value" id="duel-enemy-hp">${game.enemyHp}/${this.maxHp}</span>
                        </div>
                    </div>
                </div>

                <!-- 战斗日志区 -->
                <div class="battle-log" id="duel-log">
                </div>

                <!-- 手牌区 -->
                <div class="hand-area">
                    <div class="hand-title">你的手牌</div>
                    <div class="skill-cards" id="duel-cards">
                    </div>
                </div>

                <!-- 辅助按钮区 -->
                <div class="control-buttons">
                    <button class="btn-text" id="btn-toggle-auto">${game.autoBattle ? '手动' : '自动'}</button>
                    <button class="btn-text" id="btn-toggle-speed">${game.battleSpeed > 1 ? '正常速' : '加速'}</button>
                    <button class="btn-secondary btn-sm" id="btn-surrender">认输</button>
                </div>
            </div>
        `;

        const farmingView = document.getElementById('farming-game-view');
        if (farmingView) {
            farmingView.innerHTML = html;
        }
        this.renderHand(gameState, gameView);
        this.bindControlEvents(gameState, gameView);
        this.ensureStylesInjected();
    },

    /**
     * 渲染手牌（武技卡片）
     */
    renderHand(gameState, gameView) {
        const game = gameState.duelGame;
        const container = document.getElementById('duel-cards');
        if (!container) return;
        container.innerHTML = '';

        game.playerHand.forEach(card => {
            // 根据类型获取图标emoji（降级方案，有图片时替换）
            const iconMap = {
                [BattleCardTypes.DUEL_ATTACK]: '⚔️',
                [BattleCardTypes.DUEL_DEFENSE]: '🛡️',
                [BattleCardTypes.DUEL_SPECIAL]: '✨',
                default: '🗡️'
            };
            const icon = iconMap[card.type] || iconMap.default;
            // 气势消耗（简化版本，这里使用伤害值近似）
            const cost = Math.ceil(card.damage / 5);

            const cardEl = document.createElement('button');
            cardEl.className = 'skill-card';
            cardEl.disabled = false; // 当前简化版本无气势系统，总是可用

            cardEl.innerHTML = `
                <div class="skill-icon">${icon}</div>
                <div class="skill-name">${card.name}</div>
                <div class="skill-damage">伤害 ${card.damage}</div>
            `;

            cardEl.addEventListener('click', () => {
                this.playCard(card, gameState, gameView);
            });
            container.appendChild(cardEl);
        });
    },

    /**
     * 打出卡牌
     */
    playCard(playerCard, gameState, gameView) {
        const game = gameState.duelGame;
        const task = gameState.currentTask;

        // AI抽卡
        const allCards = getAllDuelCards();
        const aiCard = allCards[Math.floor(Math.random() * allCards.length)];

        // 检查是否触发必杀 - 三张同类型
        const typeCount = game.playerHand.filter(c => c.type === playerCard.type).length;
        let playerDamage = playerCard.damage;
        let isSpecial = false;
        let special = null;
        if (typeCount >= 3 && playerCard.type !== BattleCardTypes.DUEL_SPECIAL) {
            // 触发必杀
            const specials = getAllDuelCards().filter(c => c.type === BattleCardTypes.DUEL_SPECIAL);
            // 根据类型找对应必杀
            if (playerCard.type === BattleCardTypes.DUEL_ATTACK) {
                // 随机一个攻击必杀
                special = specials[Math.floor(Math.random() * specials.length)];
            }
            if (special) {
                playerDamage += special.damage;
                isSpecial = true;
            }
        }

        // AI伤害计算
        let aiDamage = aiCard.damage;

        // 防御减伤
        if (playerCard.type === BattleCardTypes.DUEL_DEFENSE) {
            playerDamage = 0;
            aiDamage = Math.round(aiDamage * 0.5);
        }

        game.enemyHp -= playerDamage;
        game.playerHp -= aiDamage;

        // 日志
        const log = document.getElementById('duel-log');
        let logText = `<div class="battle-log-entry">你打出【${playerCard.name}】`;
        if (isSpecial && special) logText += `，触发必杀【${special.name}】`;
        logText += `，对对手造成${playerDamage}伤害<br>对手打出【${aiCard.name}】，对你造成${aiDamage}伤害</div>`;
        log.innerHTML += logText;
        log.scrollTop = log.scrollHeight;

        // 更新UI
        document.getElementById('duel-player-hp').textContent = game.playerHp;
        document.getElementById('duel-enemy-hp').textContent = game.enemyHp;
        document.querySelector('.hp-fill.player').style.width = `${game.playerHp * 100 / 30}%`;
        document.querySelector('.hp-fill.enemy').style.width = `${game.enemyHp * 100 / 30}%`;

        // 检查结束
        if (game.playerHp <= 0 || game.enemyHp <= 0) {
            this.finish(gameState, gameView);
            return;
        }

        // 抽新卡
        if (game.drawPile.length > 0) {
            const newCard = game.drawPile.shift();
            game.playerHand = game.playerHand.filter(c => c.id !== playerCard.id);
            game.playerHand.push(newCard);
        }

        this.renderHand(gameState, gameView);
    },

    /**
     * 结算游戏
     */
    finish(gameState, gameView) {
        const game = gameState.duelGame;
        const task = gameState.currentTask;
        const playerWin = game.enemyHp <= 0;
        const ratio = playerWin ? 1 : Math.max(0.3, game.playerHp / 30);

        if (game.isPractice) {
            // 武馆切磋 - 非任务，固定奖励武艺经验
            const expGained = Math.round(10 * ratio);
            gameState.addSkillExp('martial', expGained);
            gameState.addLog(`武馆切磋完成！你${playerWin ? '获胜' : '战败'}，获得 ${expGained} 武艺经验。`);
            gameState.duelGame = null;
            // 返回设施场景
            gameState.currentScene = GameScene.FACILITY;
            gameView.renderAll();
        } else {
            // 正常任务结算 - 使用新主命系统
            const template = getMissionTemplateById(gameState.currentTask.templateId);
            // 实际进度 = 目标值 * 完成率
            const actualProgress = Math.round(gameState.currentTask.targetValue * ratio);
            const success = actualProgress > 0;

            // 使用新的主命系统结算
            const result = gameState.completeMission(success, actualProgress);

            gameState.addLog(`【${template.name}】单挑完成！你${playerWin ? '获胜' : '战败'}`);

            // 时间推进：按任务限时推进
            TimeSystem.advanceDays(gameState, template.timeLimitDays);

            gameState.duelGame = null;
            gameState.currentScene = GameScene.CITY_VIEW;
            gameView.renderAll();
        }
    },

    // 绑定控制按钮事件
    bindControlEvents(gameState, gameView) {
        document.getElementById('btn-toggle-auto')?.addEventListener('click', () => {
            gameState.duelGame.autoBattle = !gameState.duelGame.autoBattle;
            this.renderHand(gameState, gameView);
            // 如果开启自动，自动出牌
            if (gameState.duelGame.autoBattle) {
                this.autoPlay(gameState, gameView);
            }
        });

        document.getElementById('btn-toggle-speed')?.addEventListener('click', () => {
            gameState.duelGame.battleSpeed = gameState.duelGame.battleSpeed > 1 ? 1 : 2;
            document.getElementById('btn-toggle-speed').textContent =
                gameState.duelGame.battleSpeed > 1 ? '正常速' : '加速';
        });

        document.getElementById('btn-surrender')?.addEventListener('click', () => {
            if (confirm('确定要认输吗？')) {
                gameState.duelGame.playerHp = 0;
                this.finish(gameState, gameView);
            }
        });
    },

    // 自动出牌
    autoPlay(gameState, gameView) {
        if (!gameState.duelGame.autoBattle || gameState.duelGame.playerHp <= 0 || gameState.duelGame.enemyHp <= 0) {
            return;
        }
        // 延迟出牌
        const delay = gameState.duelGame.battleSpeed > 1 ? 300 : 800;
        setTimeout(() => {
            // 选择伤害最高的牌
            let bestCard = null;
            let maxDamage = 0;
            gameState.duelGame.playerHand.forEach(card => {
                if (card.damage > maxDamage) {
                    maxDamage = card.damage;
                    bestCard = card;
                }
            });
            if (bestCard) {
                this.playCard(bestCard, gameState, gameView);
            }
        }, delay);
    },

    // 注入样式
    stylesInjected: false,
    ensureStylesInjected() {
        if (this.stylesInjected) return;
        this.stylesInjected = true;

        const style = document.createElement('style');
        style.textContent = `
#farming-game-view {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.duel-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

/* 背景层 */
.duel-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #2a3d2a;
    background-image: url('images/battle/bg_duel_arena_1920x1080.jpg');
    background-size: cover;
    background-position: center;
    background-blend-mode: multiply;
}

.duel-bg-bamboo {
    background-image: url('images/battle/bg_duel_bamboo_1920x1080.jpg');
}

.duel-bg-street {
    background-image: url('images/battle/bg_duel_street_1920x1080.jpg');
}

/* 双方状态栏 */
.combatant-panel {
    position: absolute;
    top: 16px;
    width: 260px;
    background-color: rgba(253, 251, 247, 0.85);
    backdrop-filter: blur(4px);
    border: var(--border-default);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    padding: 12px;
}

.player-panel {
    left: 16px;
}

.enemy-panel {
    right: 16px;
}

.vs-mark {
    position: absolute;
    top: 60px;
    left: 50%;
    transform: translateX(-50%);
    font-family: var(--font-serif);
    font-size: 32px;
    color: rgba(253, 251, 247, 0.8);
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.combatant-info {
}

.combatant-name {
    font-family: var(--font-serif);
    font-size: var(--text-heading-sm);
    color: var(--color-text-primary);
    margin-bottom: 8px;
}

.hp-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.hp-label {
    font-family: var(--font-serif);
    font-size: var(--text-body-sm);
    color: var(--color-text-secondary);
}

.hp-bar {
    flex: 1;
    height: 10px;
    background-color: var(--color-border-default);
    border-radius: 5px;
    overflow: hidden;
}

.hp-fill {
    height: 100%;
    background-color: var(--color-accent-green);
    transition: width var(--transition-fast);
}

.hp-value {
    font-family: var(--font-mono);
    font-size: var(--text-body-sm);
    color: var(--color-text-primary);
    min-width: 50px;
    text-align: right;
}

/* 战斗日志 */
.battle-log {
    position: absolute;
    top: 120px;
    left: 50%;
    transform: translateX(-50%);
    max-width: 400px;
    width: 90%;
    max-height: 160px;
    background-color: rgba(253, 251, 247, 0.9);
    border: var(--border-double);
    border-radius: var(--radius-sm);
    padding: 8px 16px;
    overflow-y: auto;
}

.battle-log-entry {
    font-family: var(--font-serif);
    font-size: var(--text-body);
    color: var(--color-text-primary);
    margin-bottom: 4px;
    line-height: 1.5;
}

/* 手牌区 */
.hand-area {
    position: absolute;
    bottom: 60px;
    left: 16px;
    right: 16px;
    background-color: rgba(253, 251, 247, 0.85);
    backdrop-filter: blur(4px);
    border: var(--border-default);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    padding: 12px;
}

.hand-title {
    font-family: var(--font-serif);
    font-size: var(--text-heading-sm);
    color: var(--color-text-primary);
    margin-bottom: 12px;
}

.skill-cards {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding-bottom: 4px;
}

.skill-card {
    flex: 0 0 100px;
    background-color: var(--color-bg-secondary);
    border: var(--border-default);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    padding: 8px;
    cursor: pointer;
    transition: all var(--transition-fast);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.skill-card:hover:not(:disabled) {
    border-color: var(--color-accent-primary);
    box-shadow: var(--shadow-md);
    transform: translateY(-4px);
}

.skill-card:disabled {
    opacity: 0.5;
    filter: grayscale(0.5);
    cursor: not-allowed;
}

.skill-icon {
    font-size: 40px;
    line-height: 40px;
}

.skill-name {
    font-family: var(--font-serif);
    font-size: var(--text-body-sm);
    color: var(--color-text-primary);
    text-align: center;
}

.skill-damage {
    font-family: var(--font-mono);
    font-size: var(--text-caption);
    color: var(--color-accent-primary);
}

/* 控制按钮 */
.control-buttons {
    position: absolute;
    bottom: 16px;
    right: 16px;
    display: flex;
    gap: var(--space-md);
    align-items: center;
}

/* 响应式 */
@media (max-width: 768px) {
    .combatant-panel {
        width: 200px;
        padding: 8px;
    }

    .skill-card {
        flex: 0 0 80px;
    }

    .skill-icon {
        font-size: 32px;
        line-height: 32px;
    }

    .battle-log {
        top: 100px;
        max-height: 120px;
    }
}

@media (max-width: 480px) {
    .combatant-panel {
        width: 140px;
    }

    .hp-value {
        display: none;
    }
}
`;
        document.head.appendChild(style);
    }
};

export default DuelGame;
window.DuelGame = DuelGame;
