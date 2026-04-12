/**
 * 个人战控制模块 - 拆分自MartialGame
 * 负责事件绑定、回合处理
 */
window.MartialController = {
    /**
     * 绑定事件
     */
    bindEvents(gameState, gameView) {
        const game = gameState.martialGame;

        // 特殊卡选择
        document.querySelectorAll('.special-card-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!game.playerMove) game.playerMove = {special: null, numbers: []};

                if (btn.dataset.action === 'none') {
                    game.playerMove.special = null;
                    document.querySelectorAll('.special-card-btn').forEach(b => {
                        b.style.background = '';
                    });
                    btn.style.background = '#e8dcc8';
                } else {
                    // 选择了特殊卡，清空所有数字选择
                    game.playerMove.special = btn.dataset.card;
                    game.playerMove.numbers = [];
                    document.querySelectorAll('.special-card-btn').forEach(b => {
                        b.style.background = b.dataset.action === 'none' ? '#e8dcc8' : '#fff';
                    });
                    btn.style.background = '#e8dcc8';
                    // 取消数字卡样式
                    document.querySelectorAll('.number-card-btn').forEach(b => {
                        b.style.background = '';
                    });
                }
                MartialRenderer.updateConfirmButton(game);
            });
        });

        // 数字卡选择
        document.querySelectorAll('.number-card-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const game = gameState.martialGame;
                if (!game.playerMove) game.playerMove = {special: null, numbers: []};

                // 选择了数字卡，清空特殊卡选择
                game.playerMove.special = null;
                document.querySelectorAll('.special-card-btn').forEach(b => {
                    b.style.background = '';
                });
                document.querySelector('.special-card-btn[data-action="none"]').style.background = '#e8dcc8';

                const value = parseInt(btn.dataset.value);
                const idx = game.playerMove.numbers.indexOf(value);
                if (idx >= 0) {
                    // 取消选择
                    game.playerMove.numbers.splice(idx, 1);
                    btn.style.background = '#fff';
                } else {
                    // 超过3张不能选
                    if (game.playerMove.numbers.length >= 3) {
                        return;
                    }
                    game.playerMove.numbers.push(value);
                    btn.style.background = '#e8dcc8';
                }
                MartialRenderer.updateConfirmButton(game);
            });
        });

        // 清空选择
        document.getElementById('clear-selection-btn').addEventListener('click', () => {
            const game = gameState.martialGame;
            game.playerMove = {special: null, numbers: []};
            MartialRenderer.renderRound(gameState, gameView);
        });

        // 确认出牌
        document.getElementById('confirm-play-btn').addEventListener('click', () => {
            this.resolveRound(gameState, gameView);
        });
    },

    /**
     * 结算当前回合
     */
    resolveRound(gameState, gameView) {
        const game = gameState.martialGame;
        const player = game.player;
        const enemy = game.enemy;

        // AI随机出牌
        MartialCalculator.aiEnemyPlay(game);

        // 识别玩家数字组合
        const playerCombo = MartialCalculator.identifyCombo(game.playerMove.numbers);
        if (playerCombo) {
            game.comboActivated = playerCombo;
            // 处理特殊组合效果
            if (playerCombo.dodgeNext) {
                game.playerDodgeNext = true;
            }
        }
        // 识别敌人数字组合
        const enemyCombo = MartialCalculator.identifyCombo(game.enemyMove.numbers);
        if (enemyCombo) {
            game.enemyCombo = enemyCombo;
            // 处理特殊组合效果
            if (enemyCombo.dodgeNext) {
                game.enemyDodgeNext = true;
            }
        }

        // 计算双方优先度（加上回合优先级奖励）
        let playerPriority = MartialCalculator.calculatePriority(game.playerMove, playerCombo);
        let enemyPriority = MartialCalculator.calculatePriority(game.enemyMove, enemyCombo);
        if (game.playerNextPriorityBonus) {
            playerPriority *= (1 + game.playerNextPriorityBonus);
        }
        if (game.enemyNextPriorityBonus) {
            enemyPriority *= (1 + game.enemyNextPriorityBonus);
        }
        // 清除奖励，只生效一回合
        game.playerNextPriorityBonus = 0;
        game.enemyNextPriorityBonus = 0;

        let firstFighter, secondFighter;
        let firstMove, secondMove;
        let firstCombo, secondCombo;
        let firstIsPlayer = true;

        // 后发先至交换顺序
        if (playerCombo && playerCombo.swapPriority) {
            if (playerPriority < enemyPriority) {
                // 交换
                firstFighter = player;
                secondFighter = enemy;
                firstMove = game.playerMove;
                secondMove = game.enemyMove;
                firstCombo = playerCombo;
                secondCombo = enemyCombo;
            }
        } else if (enemyCombo && enemyCombo.swapPriority) {
            if (enemyPriority < playerPriority) {
                firstFighter = enemy;
                secondFighter = player;
                firstMove = game.enemyMove;
                secondMove = game.playerMove;
                firstCombo = enemyCombo;
                secondCombo = playerCombo;
                firstIsPlayer = false;
            }
        } else {
            if (playerPriority >= enemyPriority) {
                firstFighter = player;
                secondFighter = enemy;
                firstMove = game.playerMove;
                secondMove = game.enemyMove;
                firstCombo = playerCombo;
                secondCombo = enemyCombo;
                firstIsPlayer = true;
            } else {
                firstFighter = enemy;
                secondFighter = player;
                firstMove = game.enemyMove;
                secondMove = game.playerMove;
                firstCombo = enemyCombo;
                secondCombo = playerCombo;
                firstIsPlayer = false;
            }
        }

        // 记录日志 - 添加对手出牌信息，不显示优先度
        let log = MartialCalculator.getRoundStartLog(firstIsPlayer, game);
        // 显示对手出了什么牌
        log += MartialCalculator.getMoveDescription(game.enemyMove, game.enemyCombo);
        // 如果有组合，添加组合说明
        if (playerCombo && firstIsPlayer) {
            log += `\n你触发组合技：${playerCombo.name} - ${playerCombo.description}`;
        }
        if (enemyCombo && !firstIsPlayer) {
            log += `\n对手触发组合技：${enemyCombo.name} - ${enemyCombo.description}`;
        }
        game.log = log;

        // 只有优先度高的一方行动，低的一方本回合不能行动
        if (firstIsPlayer) {
            // 玩家优先度更高，玩家攻击对手
            MartialCalculator.performAttack(player, enemy, firstMove, firstCombo, game, true);
        } else {
            // 对手优先度更高，对手攻击玩家
            MartialCalculator.performAttack(enemy, player, firstMove, firstCombo, game, false);
        }

        // 检查是否有人战败
        if (game.player.hp <= 0 || game.enemy.hp <= 0) {
            this.finish(gameState, gameView);
            return;
        }

        // 弃牌抽新牌 - 只丢弃打出的牌，保留未打出的
        MartialCalculator.discardAndDraw(player, game.playerMove);
        MartialCalculator.discardAndDraw(enemy, game.enemyMove);

        game.round++;
        game.playerMove = null;
        game.enemyMove = null;
        game.enemyCombo = null;
        game.comboActivated = null;

        // 渲染下一回合
        MartialRenderer.renderRound(gameState, gameView);
        // 添加历史日志
        document.getElementById('battle-log').innerHTML = game.log.replace(/\n/g, '<br>');
    },

    /**
     * 战斗结束
     */
    finish(gameState, gameView) {
        const game = gameState.martialGame;
        const playerWon = game.enemy.hp <= 0;
        const task = gameState.currentTask;
        const ratio = playerWon ? 1 : Math.max(0.2, game.player.hp / (game.player.hp + game.enemy.hp));

        if (game.isPractice) {
            // 武馆拜师学艺 - 非任务，固定奖励武艺经验，消耗5天
            const expGained = Math.round(15 * ratio);
            gameState.addSkillExp('martial', expGained);
            gameState.addLog(`拜师学艺完成！你${playerWon ? '获胜' : '战败'}，获得 ${expGained} 武艺经验，消耗5天时间。`);
            gameState.advanceDays(5);
            gameState.martialGame = null;

            // 显示结果页
            let html = `
                <div class="personal-result" style="text-align: center; padding: 30px;">
                    <h2 style="font-size: 28px; margin-bottom: 20px; color: #8b4513;">${playerWon ? '✔ 比武获胜' : '✘ 比试落败'}</h2>
                    <p style="font-size: 16px; margin-bottom: 20px;">${playerWon ? '你拳法进步，赢得师傅赞赏！' : '师傅武艺高超，你虽败犹荣。'}</p>
                    <div style="background: #f5f0e1; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                        <p>你的剩余体力：${game.player.hp} / ${game.player.maxHp}</p>
                        <p>师傅剩余体力：${game.enemy.hp} / ${game.enemy.maxHp}</p>
                    </div>
                    <p>获得：${expGained} 武艺经验</p>
                    <div style="margin-top: 30px;">
                        <button class="btn primary-btn" id="personal-done-btn">返回武馆</button>
                    </div>
                </div>
            `;

            document.getElementById('farming-game-view').innerHTML = html;
            document.getElementById('personal-done-btn').addEventListener('click', () => {
                // 返回设施场景
                gameState.currentScene = GameScene.FACILITY;
                gameView.renderAll();
            });
        } else {
            // 正常任务结算
            const finalMerit = Math.round(task.rewardMerit * ratio);
            const finalMoney = Math.round(task.rewardMoney * ratio);
            const expGained = Math.round(15 * ratio);

            gameState.merit += finalMerit;
            gameState.money += finalMoney;
            if (task.requiredSkill) {
                gameState.addSkillExp(task.requiredSkill, expGained);
            }

            gameState.checkRolePromotion();

            let resultLog = playerWon
                ? `任务【${task.name}】完成！你击败武馆师傅获胜，获得 ${finalMerit} 功勋，${finalMoney} 金钱，${expGained} ${getSkillById(task.requiredSkill)?.name || ''}经验。`
                : `任务【${task.name}】你不敌武馆师傅，获得部分奖励：${finalMerit} 功勋，${finalMoney} 金钱。`;

            gameState.addLog(resultLog);

            // 显示结果页
            let html = `
                <div class="personal-result" style="text-align: center; padding: 30px;">
                    <h2 style="font-size: 28px; margin-bottom: 20px; color: #8b4513;">${playerWon ? '✔ 比武获胜' : '✘ 比试落败'}</h2>
                    <p style="font-size: 16px; margin-bottom: 20px;">${playerWon ? '你拳法进步，赢得师傅赞赏！' : '师傅武艺高超，你虽败犹荣。'}</p>
                    <div style="background: #f5f0e1; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                        <p>你的剩余体力：${game.player.hp} / ${game.player.maxHp}</p>
                        <p>师傅剩余体力：${game.enemy.hp} / ${game.enemy.maxHp}</p>
                    </div>
                    <p>获得：${finalMerit} 功勋，${finalMoney} 金钱</p>
                    <div style="margin-top: 30px;">
                        <button class="btn primary-btn" id="personal-done-btn">返回</button>
                    </div>
                </div>
            `;

            document.getElementById('farming-game-view').innerHTML = html;
            document.getElementById('personal-done-btn').addEventListener('click', () => {
                gameView.advanceTwoMonths();
                gameState.currentTask = null;
                gameState.martialGame = null;
                gameState.currentScene = GameScene.CITY_VIEW;
                gameView.renderAll();
            });
        }
    }
};
