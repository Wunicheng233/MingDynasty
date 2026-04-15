/**
 * 楼船破浪小游戏（水战）
 * 资源分配航行，总航程15段，合理分配体力与士气
 */

window.NavyGame = {
    /**
     * 启动游戏
     */
    start(gameView, gameState) {
        const task = gameState.currentTask;

        // 根据技能等级调整难度 (符合策划难度曲线)
        // Lv1: 航程10段, Lv2: 航程15段, Lv3: 航程20段
        let skillLevel = 1;
        if (task && task.requiredSkill) {
            skillLevel = SkillSystem.getSkillLevel(gameState, task.requiredSkill);
        }
        let total;
        if (skillLevel >= 3) {
            total = 20;
        } else if (skillLevel === 2) {
            total = 15;
        } else {
            total = 10;
        }

        // 合并游戏数据到已经初始化的对象（保留MinigameInitializer设置的动画属性）
        Object.assign(gameState.navyGame, {
            progress: 0,
            total: total,
            stamina: 10,
            morale: 10,
            lastEvent: null,
            gameOver: false
        });

        this.render(gameState, gameView);
    },

    /**
     * 渲染当前状态
     */
    render(gameState, gameView) {
        const game = gameState.navyGame;
        const template = getMissionTemplateById(gameState.currentTask.templateId);

        // 计算进度条百分比
        const progressPercent = (game.progress / game.total) * 100;

        let html = `
            <div class="navy-header">
                <h2>${template.name}</h2>
                <p>指挥楼船航行至目的地，总航程 ${game.total} 段，合理分配体力与士气</p>
            </div>
            <div class="navy-stats" style="background: #f5f0e1; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <div style="margin-bottom: 10px;">
                    <strong>航程：</strong> ${game.progress} / ${game.total} 段
                    <div style="background: #ddd; height: 20px; border-radius: 10px; margin-top: 5px;">
                        <div style="background: #4a90e2; height: 100%; width: ${progressPercent}%; border-radius: 10px; transition: width 0.3s;"></div>
                    </div>
                </div>
                <div style="display: flex; gap: 20px;">
                    <div><strong>体力：</strong> ${game.stamina}</div>
                    <div><strong>士气：</strong> ${game.morale}</div>
                </div>
                ${game.lastEvent ? `<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ccc; color: #8b4513;"><strong>最近海况：</strong> ${game.lastEvent}</div>` : ''}
            </div>
            <div class="navy-actions" style="display: flex; flex-direction: column; gap: 10px; margin: 15px 0;">
                <div style="background: #fff8e1; padding: 12px; border-radius: 6px;">
                    <button class="btn primary-btn" id="action-full" style="width: 100%; margin-bottom: 8px;">全速前进</button>
                    <p style="margin: 0; font-size: 14px; color: #666;">前进 +2 段 • 消耗 士气-2</p>
                </div>
                <div style="background: #f0f9eb; padding: 12px; border-radius: 6px;">
                    <button class="btn primary-btn" id="action-half" style="width: 100%; margin-bottom: 8px;">中速巡航</button>
                    <p style="margin: 0; font-size: 14px; color: #666;">前进 +1 段 • 消耗 体力-1</p>
                </div>
                <div style="background: #e3f2fd; padding: 12px; border-radius: 6px;">
                    <button class="btn primary-btn" id="action-rest" style="width: 100%; margin-bottom: 8px;">停船休整</button>
                    <p style="margin: 0; font-size: 14px; color: #666;">不前进 • 恢复 体力+2 或 士气+2</p>
                </div>
            </div>
            <div class="navy-desc" style="color: #666; font-size: 14px; margin-top: 20px;">
                <p><strong>规则说明：</strong>每前进3段遭遇一次随机海况，体力或士气任意一项归零则航行失败。到达终点即胜利。</p>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;

        document.getElementById('action-full').addEventListener('click', () => {
            this.onAction('full', gameState, gameView);
        });
        document.getElementById('action-half').addEventListener('click', () => {
            this.onAction('half', gameState, gameView);
        });
        document.getElementById('action-rest').addEventListener('click', () => {
            this.onAction('rest', gameState, gameView);
        });
    },

    /**
     * 处理玩家行动
     */
    onAction(action, gameState, gameView) {
        const game = gameState.navyGame;

        if (action === 'full') {
            if (game.morale < 2) {
                alert('士气不足，无法全速前进！');
                return;
            }
            game.morale -= 2;
            game.progress += 2;
        } else if (action === 'half') {
            if (game.stamina < 1) {
                alert('体力不足，无法巡航！');
                return;
            }
            game.stamina -= 1;
            game.progress += 1;
        } else if (action === 'rest') {
            // 询问恢复什么
            const choice = confirm('点击确定恢复【体力+2】，点击取消恢复【士气+2】');
            if (choice) {
                game.stamina = Math.min(10, game.stamina + 2);
                game.lastEvent = '停船休整，恢复了2点体力';
            } else {
                game.morale = Math.min(10, game.morale + 2);
                game.lastEvent = '停船休整，恢复了2点士气';
            }
            // 不前进
        }

        // 检查是否失败
        if (game.stamina <= 0 || game.morale <= 0) {
            this.finish(false, gameState, gameView);
            return;
        }

        // 检查是否到达终点
        if (game.progress >= game.total) {
            this.finish(true, gameState, gameView);
            return;
        }

        // 每前进3段触发一次事件
        const prevEventTrigger = Math.floor((game.progress - (action === 'full' ? 2 : action === 'half' ? 1 : 0)) / 3);
        const currEventTrigger = Math.floor(game.progress / 3);
        if (currEventTrigger > prevEventTrigger) {
            // 触发随机事件
            const events = [
                {text: '遭遇海风，船帆受损，士气-2', effect: (g) => { g.morale -= 2; }},
                {text: '顺风顺水，航速加快，额外前进1段', effect: (g) => { g.progress += 1; }},
                {text: '捕获大鱼，水手士气大振，士气+2', effect: (g) => { g.morale += 2; }},
                {text: '发现淡水补给，体力恢复+2', effect: (g) => { g.stamina += 2; }},
                {text: '水中暗流，船身颠簸，体力-2', effect: (g) => { g.stamina -= 2; }},
                {text: '晴空万里，水手心情愉悦，体力士气+1', effect: (g) => { g.stamina += 1; g.morale += 1; }},
                {text: '遭遇海盗，一番周旋，体力-3士气-2', effect: (g) => { g.stamina -= 3; g.morale -= 2; }},
                {text: '发现无人小岛，补充补给，体力+2', effect: (g) => { g.stamina += 2; }}
            ];
            const event = events[Math.floor(Math.random() * events.length)];
            event.effect(game);
            game.lastEvent = event.text;

            // 再次检查失败
            if (game.stamina <= 0 || game.morale <= 0) {
                this.finish(false, gameState, gameView);
                return;
            }

            // 再次检查终点
            if (game.progress >= game.total) {
                this.finish(true, gameState, gameView);
                return;
            }
        }

        // 重新渲染
        this.render(gameState, gameView);
    },

    /**
     * 结算游戏
     */
    finish(success, gameState, gameView) {
        const game = gameState.navyGame;
        const task = gameState.currentTask;

        let ratio;
        let resultTitle, resultDesc;

        if (success && game.progress >= game.total) {
            // 成功，根据剩余资源计算奖励倍率
            const remaining = game.stamina + game.morale;
            ratio = 0.7 + (remaining / 20) * 0.3; // 0.7 ~ 1.0
            resultTitle = '✔ 航行成功！';
            resultDesc = `你指挥楼船成功抵达目的地，剩余体力 ${game.stamina} 士气 ${game.morale}，航行圆满成功！`;
        } else {
            // 失败，按进度给部分奖励
            ratio = Math.max(0.2, game.progress / game.total * 0.5);
            resultTitle = '✘ 航行失败';
            if (game.stamina <= 0) {
                resultDesc = '水手体力耗尽，不得不漂流返航，只前进了' + game.progress + '段。';
            } else {
                resultDesc = '全军士气低落，无心航行，不得不漂流返航，只前进了' + game.progress + '段。';
            }
        }

        const template = getMissionTemplateById(gameState.currentTask.templateId);
        // 实际进度 = 目标值 * 完成率
        const actualProgress = Math.round(gameState.currentTask.targetValue * ratio);
        const success = actualProgress > 0;

        // 使用新的主命系统结算
        const result = gameState.completeMission(success, actualProgress);

        gameState.addLog(`【${template.name}】${resultTitle} 前进 ${game.progress}/${game.total} 段`);

        // 显示结果
        let html = `
            <div class="navy-result" style="text-align: center; padding: 30px;">
                <h2 style="font-size: 28px; margin-bottom: 20px; color: #8b4513;">${resultTitle}</h2>
                <p style="font-size: 16px; margin-bottom: 20px;">${resultDesc}</p>
                <div style="background: #f5f0e1; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                    <p>最终航程：${game.progress} / ${game.total} 段</p>
                    <p>剩余体力：${game.stamina} | 剩余士气：${game.morale}</p>
                </div>
                <p>功勋奖励：${result.meritGained > 0 ? '+' : ''}${result.meritGained}</p>
                <div style="margin-top: 30px;">
                    <button class="btn primary-btn" id="navy-done-btn">返回</button>
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        document.getElementById('navy-done-btn').addEventListener('click', () => {
            // 时间推进：按任务限时推进
            TimeSystem.advanceDays(gameState, template.timeLimitDays);
            gameState.navyGame = null;
            gameState.currentScene = GameScene.CITY_VIEW;
            gameView.renderAll();
        });
    }
};
