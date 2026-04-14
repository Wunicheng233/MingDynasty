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

        // 根据技能等级调整参数 - 等级越高血量越高
        let skillLevel = 1;
        if (task && task.requiredSkill) {
            skillLevel = window.SkillSystem.getSkillLevel(gameState, task.requiredSkill);
        }

        // 玩家血量随等级增加
        const maxHp = 30 + skillLevel * 5;

        // 玩家和对手各30血，每回合抽3张牌
        const playerDeck = drawNCards(15, getAllDuelCards());
        Object.assign(gameState.duelGame, {
            skillLevel: skillLevel,
            maxHp: maxHp,
            playerHp: maxHp,
            enemyHp: 30,
            enemyCombo: { attack: 0, defense: 0, skill: 0 }, // AI连击计数
            playerHand: playerDeck.slice(0, 3),
            drawPile: playerDeck.slice(3),
            typeCount: { attack: 0, defense: 0, skill: 0 }, // 累计同类型计数
            isPractice: title !== null // 是否是武馆切磋（非主命任务）
        });

        const game = gameState.duelGame;
        const headerTitle = title || (task ? task.name : '个人切磋');

        let html = `
            <div style="max-height: 70vh; overflow-y: auto; padding: 0 5px;">
                <div class="duel-header">
                    <h2>${headerTitle}</h2>
                    <p>🗡️ 卡牌单挑，选一张打出，累计三张同类型自动触发必杀！</p>
                    <p>武术Lv${game.skillLevel}: 你初始血量 <strong>${game.maxHp}</strong> (等级加成)</p>
                </div>
                <div class="duel-hp">
                    <div class="hp-row">
                        <div class="troop-info">
                            <span>你</span>
                            <span><strong id="duel-player-hp">${game.playerHp}</strong> / ${game.maxHp}</span>
                        </div>
                        <div class="hp-bar"><div class="hp-fill player" style="width: ${game.playerHp * 100 / game.maxHp}%"></div></div>
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
                <div class="battle-log" id="duel-log" style="max-height: 150px; overflow-y: auto; border: 1px solid #ddd; padding: 8px; margin-top: 10px;"></div>
            </div>
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

        // 玩家：累计同类型计数
        if (playerCard.type !== BattleCardTypes.DUEL_SPECIAL) {
            game.typeCount[playerCard.type]++;
        }

        // AI抽卡
        const allCards = getAllDuelCards();
        const aiCard = allCards[Math.floor(Math.random() * allCards.length)];
        // AI也累计计数
        if (aiCard.type !== BattleCardTypes.DUEL_SPECIAL) {
            game.enemyCombo[aiCard.type]++;
        }

        // 玩家伤害计算
        let playerDamage = playerCard.damage;
        let playerTriggeredSpecial = false;
        let specialName = '';

        // 检查是否触发必杀 - 累计三张同类型
        if (playerCard.type !== BattleCardTypes.DUEL_SPECIAL && game.typeCount[playerCard.type] >= 3) {
            // 触发必杀
            const specials = getAllDuelCards().filter(c => c.type === BattleCardTypes.DUEL_SPECIAL);
            const special = specials[Math.floor(Math.random() * specials.length)];
            playerDamage += special.damage;
            playerTriggeredSpecial = true;
            specialName = special.name;
            game.typeCount[playerCard.type] = 0; // 重置计数
        }

        // AI伤害计算
        let aiDamage = aiCard.damage;
        let aiTriggeredSpecial = false;
        let aiSpecialName = '';

        // AI也可能触发必杀
        if (aiCard.type !== BattleCardTypes.DUEL_SPECIAL && game.enemyCombo[aiCard.type] >= 3) {
            const specials = getAllDuelCards().filter(c => c.type === BattleCardTypes.DUEL_SPECIAL);
            const special = specials[Math.floor(Math.random() * specials.length)];
            aiDamage += special.damage;
            aiTriggeredSpecial = true;
            aiSpecialName = special.name;
            game.enemyCombo[aiCard.type] = 0;
        }

        // 防御减伤：玩家防御
        if (playerCard.type === BattleCardTypes.DUEL_DEFENSE) {
            playerDamage = 0;
            aiDamage = Math.round(aiDamage * 0.5);
        }

        // AI防御减伤
        if (aiCard.type === BattleCardTypes.DUEL_DEFENSE) {
            aiDamage = 0;
            playerDamage = Math.round(playerDamage * 0.5);
        }

        // 应用伤害
        game.enemyHp -= playerDamage;
        game.playerHp -= aiDamage;

        // 日志
        const log = document.getElementById('duel-log');
        let logText = `<div class="battle-log-entry">你打出【${playerCard.name}】`;
        if (playerTriggeredSpecial) logText += `，<strong>触发必杀【${specialName}】</strong>`;
        logText += `，对对手造成${playerDamage}伤害<br>`;
        logText += `对手打出【${aiCard.name}】`;
        if (aiTriggeredSpecial) logText += `，<strong>触发必杀【${aiSpecialName}】</strong>`;
        logText += `，对你造成${aiDamage}伤害</div>`;
        log.innerHTML += logText;
        log.scrollTop = log.scrollHeight;

        // 更新UI
        document.getElementById('duel-player-hp').textContent = game.playerHp;
        document.getElementById('duel-enemy-hp').textContent = game.enemyHp;
        document.querySelector('.hp-fill.player').style.width = `${Math.max(0, game.playerHp * 100 / game.maxHp)}%`;
        document.querySelector('.hp-fill.enemy').style.width = `${Math.max(0, game.enemyHp * 100 / 30)}%`;

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
        const ratio = playerWin ? 1 : Math.max(0.2, game.playerHp / game.maxHp);

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
            const template = getMissionTemplateById(gameState.currentTask.templateId) || gameState.currentTask;
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
