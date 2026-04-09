/**
 * 步兵训练小游戏
 * 规则：双方各有10点血量，你选择进攻方向，对方也进攻，先打完对方血量获胜
 */

window.InfantryGame = {
    /**
     * 启动游戏
     */
    start(gameView, gameState) {
        const task = gameState.currentTask;
        gameState.infantryGame = {
            playerHp: 10,
            enemyHp: 10,
            gameOver: false
        };

        const html = `
            <div class="infantry-header">
                <h2>${task.name}</h2>
                <p>双方各10点血量，5回合内击溃敌军获胜</p>
                <div class="infantry-clues" style="background: #f5f0e1; padding: 10px; border-radius: 5px; margin: 10px 0;">
                    <p><strong>战术克制关系：</strong></p>
                    <p style="color: #8b4513; margin: 5px 0;">▶ 冲锋 → 克制【坚守】，冲破防线造成大量伤害</p>
                    <p style="color: #8b4513; margin: 5px 0;">▶ 坚守 → 克制【侧击】，稳住阵脚反击侧翼</p>
                    <p style="color: #8b4513; margin: 5px 0;">▶ 侧击 → 克制【冲锋】，绕开正面从侧翼打击</p>
                </div>
            </div>
            <div class="infantry-hp">
                <div class="hp-row">
                    <span>我方血量: <strong id="player-hp">${gameState.infantryGame.playerHp}</strong></span>
                    <div class="hp-bar"><div class="hp-fill player" style="width: ${gameState.infantryGame.playerHp * 10}%"></div></div>
                </div>
                <div class="hp-row">
                    <span>敌方血量: <strong id="enemy-hp">${gameState.infantryGame.enemyHp}</strong></span>
                    <div class="hp-bar"><div class="hp-fill enemy" style="width: ${gameState.infantryGame.enemyHp * 10}%"></div></div>
                </div>
            </div>
            <div class="infantry-directions">
                <p>请选择本回合战术：</p>
                <div class="direction-buttons">
                    <button class="btn primary-btn direction-btn" data-tactic="charge">1. 冲锋<br><small style="color: #ffd700;">克坚守，被侧击克</small></button>
                    <button class="btn primary-btn direction-btn" data-tactic="hold">2. 坚守<br><small style="color: #ffd700;">克侧击，被冲锋克</small></button>
                    <button class="btn primary-btn direction-btn" data-tactic="flank">3. 侧击<br><small style="color: #ffd700;">克冲锋，被坚守克</small></button>
                </div>
            </div>
            <div class="infantry-log" id="infantry-log"></div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        this.bindEvents(gameState, gameView);
    },

    /**
     * 绑定事件
     */
    bindEvents(gameState, gameView) {
        document.querySelectorAll('.direction-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.onAttack(e.target.dataset.tactic, gameState, gameView);
            });
        });
    },

    /**
     * 处理玩家进攻选择
     */
    onAttack(playerTactic, gameState, gameView) {
        const game = gameState.infantryGame;
        // 敌方随机战术
        const tactics = ['charge', 'hold', 'flank'];
        const enemyTactic = tactics[Math.floor(Math.random() * 3)];

        let damageDealt = 0;
        let damageTaken = 0;

        // 检查克制关系 - 克制对方则造成双倍伤害
        let playerMultiplier = 1;
        let enemyMultiplier = 1;

        if (playerTactic === 'charge' && enemyTactic === 'hold') {
            playerMultiplier = 2; // 冲锋克坚守
        } else if (playerTactic === 'hold' && enemyTactic === 'flank') {
            playerMultiplier = 2; // 坚守克侧击
        } else if (playerTactic === 'flank' && enemyTactic === 'charge') {
            playerMultiplier = 2; // 侧击克冲锋
        }

        if (enemyTactic === 'charge' && playerTactic === 'hold') {
            enemyMultiplier = 2;
        } else if (enemyTactic === 'hold' && playerTactic === 'flank') {
            enemyMultiplier = 2;
        } else if (enemyTactic === 'flank' && playerTactic === 'charge') {
            enemyMultiplier = 2;
        }

        // 基础伤害 1-3点
        const basePlayerDamage = Math.floor(1 + Math.random() * 3);
        const baseEnemyDamage = Math.floor(1 + Math.random() * 3);
        damageDealt = Math.floor(basePlayerDamage * playerMultiplier);
        damageTaken = Math.floor(baseEnemyDamage * enemyMultiplier);

        game.enemyHp -= damageDealt;
        game.playerHp -= damageTaken;

        // 限制下限
        game.enemyHp = Math.max(0, game.enemyHp);
        game.playerHp = Math.max(0, game.playerHp);

        const tacticNames = {charge: '冲锋', hold: '坚守', flank: '侧击'};
        const log = document.getElementById('infantry-log');
        log.innerHTML += `<div class="infantry-log-entry">你出【${tacticNames[playerTactic]}】，敌军出【${tacticNames[enemyTactic]}】→ 你对敌军造成${damageDealt}伤害，你受到${damageTaken}伤害</div>`;
        log.scrollTop = log.scrollHeight;

        // 更新血量显示
        document.getElementById('player-hp').textContent = game.playerHp;
        document.getElementById('enemy-hp').textContent = game.enemyHp;
        document.querySelector('.hp-fill.player').style.width = `${game.playerHp * 10}%`;
        document.querySelector('.hp-fill.enemy').style.width = `${game.enemyHp * 10}%`;

        if (game.enemyHp <= 0 || game.playerHp <= 0) {
            game.gameOver = true;
            this.finish(gameState, gameView);
        }
    },

    /**
     * 结算游戏
     */
    finish(gameState, gameView) {
        const game = gameState.infantryGame;
        const task = gameState.currentTask;
        const won = game.enemyHp <= 0;
        const ratio = won ? 1 : game.enemyHp / (game.enemyHp + game.playerHp);

        const finalMerit = Math.round(task.rewardMerit * ratio);
        const finalMoney = Math.round(task.rewardMoney * ratio);
        const expGained = Math.round(10 * ratio);

        // 更新状态
        gameState.merit += finalMerit;
        gameState.money += finalMoney;
        if (task.requiredSkill) {
            gameState.addSkillExp(task.requiredSkill, expGained);
        }

        gameState.checkRolePromotion();
        const skillName = getSkillById(task.requiredSkill)?.name || '';
        gameState.addLog(`任务【${task.name}】完成！你${won ? '获胜' : '战败'}，获得 ${finalMerit} 功勋，${finalMoney} 金钱，${expGained} ${skillName}经验。`);

        gameView.advanceTwoMonths();
        gameState.currentTask = null;
        gameState.infantryGame = null;
        gameState.currentScene = GameScene.CITY_VIEW;
        gameView.renderAll();
    }
};
