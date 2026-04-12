/**
 * 任务列表/评定会视图渲染模块
 * 渲染评定会任务列表、当前任务信息
 */

window.TaskListRenderer = {
    /**
     * 渲染任务列表视图
     */
    render(gameState, gameView) {
        const container = document.getElementById('task-list-view');
        if (!container) return;

        // 检查是否是评定会日
        const isEvaluationDay = gameState.isEvaluationDay();
        const atMainCity = gameState.isAtMainCity();
        const isRuler = gameState.isPlayerRuler();

        let headerTitle = isRuler ? (isEvaluationDay ? '朝会' : '主命') : (isEvaluationDay ? '评定会' : '主命');
        let html = `
            <div class="task-list-header">
                <h2>${headerTitle}</h2>
                ${gameState.currentTask ? `
                    <div class="current-task-info">
                        当前任务: <strong>${gameState.currentTask.name}</strong>
                        <span class="remaining-days">剩余天数: ${gameState.getRemainingDaysForMission()} 天</span>
                        <button class="btn cancel-task-btn" id="cancel-current-task">取消当前任务</button>
                    </div>
                ` : ''}
            </div>
        `;

        // 添加功勋说明提示 - 在评定会且没有当前任务时显示
        if (!gameState.currentTask && isEvaluationDay && atMainCity) {
            html += `
                <div class="merit-info-box">
                    <h4>🎖️ 功勋与晋升</h4>
                    <p>• 完成主命获得 <strong>功勋</strong>，功勋积累足够后 <strong>自动晋升身份</strong></p>
                    <p>• 身份越高，可以接取更高级的主命，解锁更多玩法</p>
                    <p>• 当前你的功勋：<strong>${gameState.merit}</strong></p>
                    ${!isRuler ? `<p>• 成为城主后，你可以向家臣发布主命，统一天下</p>` : ''}
                </div>
            `;
        }

        if (!isEvaluationDay) {
            html += `
                <div class="evaluation-notice">
                    📅 ${isRuler ? '朝会' : '评定会'}每两个月召开一次，固定在奇数月1日。
                    ${!atMainCity ? `<p class="warning">⚠️ 你不在${isRuler ? '都城' : '主城'}，无法参加${isRuler ? '朝会' : '评定会'}接取新任务。</p>` : ''}
                </div>
            `;
        }

        if (!isEvaluationDay && !gameState.currentTask) {
            html += `<p class="no-tasks">当前没有可执行的任务，等待下次${isRuler ? '朝会' : '评定会'}吧。</p>`;
        } else if (isEvaluationDay && !atMainCity) {
            html += `<p class="no-tasks">你不在${isRuler ? '都城' : '主城'}，必须返回才能参加${isRuler ? '朝会' : '评定会'}。</p>`;
        } else if (isEvaluationDay && atMainCity) {
            // 根据身份渲染不同界面
            if (isRuler) {
                // 君主/城主模式：发布任务给属下
                html += this.renderRulerMissionList(gameState);
            } else {
                // 家臣模式：接受任务
                html += this.renderVassalMissionList(gameState);
            }
        }

        container.innerHTML = html;

        // 绑定事件
        document.querySelectorAll('.accept-task-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.dataset.taskId);
                // 选择了任务，清除待选标记，可以离开
                gameState.evaluationPendingSelection = false;
                gameView.acceptMission(taskId);
            });
        });

        // 绑定发布任务事件（君主模式）
        document.querySelectorAll('.publish-task-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.dataset.taskId);
                // 选择了任务，清除待选标记，可以离开
               gameState.evaluationPendingSelection = false;
                gameView.publishMissionToVassal(taskId);
            });
        });

        // 绑定取消任务事件
        const cancelBtn = document.getElementById('cancel-current-task');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (confirm('确定要取消当前任务吗？会扣除部分功勋。')) {
                    gameState.cancelCurrentMission();
                    gameView.renderAll();
                }
            });
        }

        // 绑定"暂无合适任务，跳过评定会"按钮
        const skipBtn = document.getElementById('btn-skip-evaluation');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                gameState.evaluationPendingSelection = false;
                gameState.addLog(`本次${gameState.isPlayerRuler() ? '朝会' : '评定会'}没有接取新任务，等待下次吧。`);
                gameView.goBackToCity();
            });
        }
    },

    /**
     * 渲染家臣模式的任务列表（接受主公任务）
     */
    renderVassalMissionList(gameState) {
        const availableTasks = gameState.getAvailableMissions();

        // 按分类分组
        const categories = {
            '军务': availableTasks.filter(t => t.category === '军务'),
            '政务': availableTasks.filter(t => t.category === '政务'),
            '外交': availableTasks.filter(t => t.category === '外交'),
            '调略': availableTasks.filter(t => t.category === '调略'),
            '特殊': availableTasks.filter(t => t.category === '特殊'),
        };

        // 技能中文名映射
        const skillNames = this.getSkillNameMap();
        let html = '';

        for (const [category, tasks] of Object.entries(categories)) {
            if (tasks.length === 0) continue;

            html += `
                <div class="task-category">
                    <h3 class="category-title">${category}</h3>
                    <div class="task-list">
            `;

            tasks.forEach(task => {
                const difficultyStars = '⭐'.repeat(task.baseDifficulty);
                const requiredSkills = task.requiredSkills.map(sid => skillNames[sid]).join('、');
                html += `
                    <div class="task-item">
                        <div class="task-info">
                            <h3>${task.name} ${difficultyStars}</h3>
                            <p class="task-desc">${task.description}</p>
                            <p class="task-reward">关联技能：${requiredSkills || '无'} | 基础功勋奖励：${task.baseReward} | 限时：${task.timeLimitDays}天</p>
                        </div>
                        <button class="btn primary-btn accept-task-btn" data-task-id="${task.id}">接取任务</button>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        }

        if (availableTasks.length === 0) {
            html += `<p class="no-tasks">目前你的身份没有可接取的任务，提升功勋晋升后再来吧。</p>`;
        }

        // 如果是评定会等待选择，添加"暂无合适任务"按钮
        if (gameState.evaluationPendingSelection) {
            html += `
                <div class="evaluation-selection-footer">
                    <button class="btn secondary-btn" id="btn-skip-evaluation">暂无合适任务，本次跳过</button>
                </div>
            `;
        }

        return html;
    },

    /**
     * 渲染君主模式的任务列表（向家臣发布任务）
     */
    renderRulerMissionList(gameState) {
        const publishableTasks = gameState.getRulerPublishableMissions();

        // 按分类分组
        const categories = {
            '国策': publishableTasks.filter(t => t.category === '国策'),
            '内政': publishableTasks.filter(t => t.category === '内政'),
            '军备': publishableTasks.filter(t => t.category === '军备'),
            '外交': publishableTasks.filter(t => t.category === '外交'),
            '调略': publishableTasks.filter(t => t.category === '调略'),
            '特殊': publishableTasks.filter(t => t.category === '特殊'),
        };

        // 技能中文名映射
        const skillNames = this.getSkillNameMap();
        let html = `
            <div class="ruler-notice">
                🏰 作为君主，你可以向家臣发布主命，经营势力，统一天下。
            </div>
        `;

        for (const [category, tasks] of Object.entries(categories)) {
            if (tasks.length === 0) continue;

            html += `
                <div class="task-category">
                    <h3 class="category-title">${category}</h3>
                    <div class="task-list">
            `;

            tasks.forEach(task => {
                const difficultyStars = '⭐'.repeat(task.baseDifficulty);
                const requiredSkills = task.requiredSkills.map(sid => skillNames[sid]).join('、');
                const cost = Math.round(task.baseReward * 0.5); // 发布任务需要消耗军资金 = 一半基础功勋
                html += `
                    <div class="task-item">
                        <div class="task-info">
                            <h3>${task.name} ${difficultyStars}</h3>
                            <p class="task-desc">${task.description}</p>
                            <p class="task-reward">关联技能：${requiredSkills || '无'} | 预算消耗：${cost} 贯 | 限时：${task.timeLimitDays}天</p>
                        </div>
                        <button class="btn primary-btn publish-task-btn" data-task-id="${task.id}">发布任务</button>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        }

        if (publishableTasks.length === 0) {
            html += `<p class="no-tasks">目前没有可发布的任务。</p>`;
        }

        // 如果是评定会等待选择，添加"暂无合适任务"按钮
        if (gameState.evaluationPendingSelection) {
            html += `
                <div class="evaluation-selection-footer">
                    <button class="btn secondary-btn" id="btn-skip-evaluation">暂无合适任务，本次跳过</button>
                </div>
            `;
        }

        return html;
    },

    /**
     * 获取技能中文名映射
     */
    getSkillNameMap() {
        return {
            leadership: '统帅',
            strength: '武力',
            intelligence: '智力',
            politics: '政治',
            charm: '魅力',
            agriculture: '农政',
            eloquence: '口才',
            infantry: '步战',
            cavalry: '骑战',
            engineering: '工政',
            trade: '商政',
            law: '律政',
            navy: '水战',
            strategy: '兵法',
            martial: '武艺',
            medicine: '医术',
            calligraphy: '文墨',
            spy: '密探',
            navigation: '航海',
            ritual: '礼制',
            firearm: '火器'
        };
    }
};
