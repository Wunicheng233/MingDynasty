/**
 * 个人战单挑小游戏（武术）
 * 卡牌对战，三张同类型触发必杀
 */

window.DuelGame = {
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
            isPractice: title !== null // 是否是武馆切磋（非主命任务）
        });

        const game = gameState.duelGame;
        const headerTitle = title || (task ? task.name : '个人切磋');

        let html = `
            <div class="duel-header">
                <h2>${headerTitle}</h2>
                <p>卡牌单挑，选一张打出，三张相同触发必杀</p>
            </div>
            <div class="duel-hp">
                <div class="hp-row">
                    <div class="troop-info">
                        <span>你</span>
                        <span><strong id="duel-player-hp">${game.playerHp}</strong> / 30</span>
                    </div>
                    <div class="hp-bar"><div class="hp-fill player" style="width: ${game.playerHp * 100 / 30}%"></div></div>
                </div>
                <div class="hp-row">
                    <div class="troop-info">
                        <span>对手</span>
                        <span><strong id="duel-enemy-hp">${game.enemyHp}</strong> / 30</span>
                    </div>
                    <div class="hp-bar"><div class="hp-fill enemy" style="width: ${game.enemyHp * 100 / 30}%"></div></div>
                </div>
            </div>
            <div class="duel-hand">
                <h3>你的手牌</h3>
                <div class="battle-cards" id="duel-cards">
                </div>
            </div>
            <div class="battle-log" id="duel-log"></div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        this.renderHand(gameState, gameView);
    },

    /**
     * 渲染手牌
     */
    renderHand(gameState, gameView) {
        const game = gameState.duelGame;
        const container = document.getElementById('duel-cards');
        container.innerHTML = '';

        game.playerHand.forEach(card => {
            const cardEl = document.createElement('div');
            cardEl.className = 'battle-card';
            cardEl.dataset.type = card.type;
            cardEl.innerHTML = `
                <div class="battle-card-header">
                    <span class="battle-card-name">${card.emoji} ${card.name}</span>
                    <span class="battle-card-damage">伤害: ${card.damage}</span>
                </div>
                <div class="battle-card-desc">${card.description}</div>
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
    }
};
