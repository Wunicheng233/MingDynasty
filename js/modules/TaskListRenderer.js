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

        let html = `
            <div class="task-list-header">
                <h2>${isEvaluationDay ? '评定会' : '主命'}</h2>
                ${gameState.currentTask ? `
                    <div class="current-task-info">
                        当前任务: <strong>${gameState.currentTask.name}</strong>
                        <span class="remaining-days">剩余天数: ${gameState.getRemainingDaysForMission()} 天</span>
                    </div>
                ` : ''}
            </div>
        `;

        if (!isEvaluationDay) {
            html += `
                <div class="evaluation-notice">
                    📅 评定会每两个月召开一次，固定在奇数月1日。
                    ${!atMainCity ? '<p class="warning">你不在主城，无法参加评定会接取新任务。</p>' : ''}
                </div>
            `;
        }

        if (!isEvaluationDay && !gameState.currentTask) {
            html += `<p class="no-tasks">当前没有可接取的新任务，等待下次评定会吧。</p>`;
        } else if (isEvaluationDay && !atMainCity) {
            html += `<p class="no-tasks">你不在主城，必须返回主城${getCityTemplateById(1).name}才能参加评定会。</p>`;
        } else {
            const currentRoleId = gameState.currentRoleId;
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
            const skillNames = {
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
        }

        container.innerHTML = html;

        // 绑定事件
        document.querySelectorAll('.accept-task-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.dataset.taskId);
                gameView.acceptMission(taskId);
            });
        });
    }
};
