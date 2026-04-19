/**
 * 任务列表/评定会视图渲染模块
 * 按照UI/13-任务与评定界面.md设计规范重构
 * 渲染评定会任务列表、当前任务信息、功勋晋升进度
 */

import { getAvailableMissionsForRole, getMissionTemplateById } from '../../data/tasks.js';
import { getRoleById } from '../../data/roles.js';
import TaskSystem from '../systems/TaskSystem.js';
import SkillSystem from '../systems/SkillSystem.js';
import TextFormatter from '../utils/TextFormatter.js';
import NavigationManager from '../managers/NavigationManager.js';

const TaskListRenderer = {
    // 任务类型图标映射
    typeIcons: {
        agriculture: '🌾',
        military: '⚔️',
        diplomacy: '🤝',
        construction: '🏯',
        war: '🏇',
        finance: '💰',
        spy: '🔍',
        special: '✨'
    },

    /**
     * 渲染任务列表视图
     */
    render(gameState, gameView) {
        // 确保容器存在
        let container = document.getElementById('task-list-view');
        if (!container) {
            container = document.createElement('div');
            container.id = 'task-list-view';
            container.className = 'scene-view';
            document.getElementById('main-display').appendChild(container);
        }

        // 检查是否是评定会日
        const isEvaluationDay = gameState.isEvaluationDay();
        const atMainCity = gameState.isAtMainCity();

        // 获取功勋和官品信息
        const merit = gameState.merit || 0;
        const currentRank = gameState.getCurrentRank() || '从九品';
        const nextRank = gameState.getNextRank() || '正九品';
        const nextRankMerit = gameState.getNextRankRequiredMerit() || 100;
        const meritPercent = Math.min(100, Math.round((merit / nextRankMerit) * 100));

        let html = `
            <div class="assessment-container">
                <!-- 背景层 -->
                <div class="assessment-bg"></div>
        `;

        // 如果是评定会，显示君主发言
        if (isEvaluationDay && atMainCity) {
            const lord = gameState.getCurrentLord() || { name: '主君', dialogue: '诸卿，今有要务，择一而行吧。' };
            html += `
                <!-- 主君发言区 -->
                <div class="lord-speech-section">
                    <div class="lord-avatar">
                        <img src="images/lords/${lord.id}_portrait.png" alt="${lord.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="avatar-placeholder">${lord.name.charAt(0)}</div>
                    </div>
                    <div class="speech-bubble">
                        ${lord.dialogue || '诸卿，今有要务，择一而行吧。'}
                    </div>
                </div>
            `;
        }

        // 当前任务条
        if (gameState.currentTask) {
            const task = getMissionTemplateById(gameState.currentTask.templateId);
            const remaining = gameState.getRemainingDaysForMission();
            const progress = gameState.getMissionProgress() || 0;
            const progressPercent = Math.round(progress * 100);

            html += `
                <!-- 当前任务 -->
                <div class="current-quest-bar">
                    <div class="current-quest-info">
                        <span class="quest-label">当前任务</span>
                        <span class="quest-name">${task.name}</span>
                        <span class="quest-deadline">⌛ 剩余 ${TextFormatter.numberToChinese(remaining)} 天</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                </div>
            `;
        }

        // 功勋晋升条
        html += `
            <!-- 功勋与官品晋升 -->
            <div class="rank-progress-bar">
                <div class="rank-info">
                    <span class="current-rank">${currentRank}</span>
                    <span class="merit-text">${TextFormatter.numberToChinese(merit)} / ${TextFormatter.numberToChinese(nextRankMerit)} 功勋</span>
                    <span class="next-rank">→ ${nextRank}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill gold" style="width: ${meritPercent}%; background-color: var(--color-accent-gold);"></div>
                </div>
            </div>
        `;

        if (!isEvaluationDay) {
            html += `
                <div class="notice-card">
                    📅 评定会每两个月召开一次，固定在奇数月1日。
                    ${!atMainCity ? '<p class="warning">你不在主城，无法参加评定会接取新任务。</p>' : ''}
                </div>
            `;
        }

        if (isEvaluationDay && atMainCity) {
            const availableTasks = gameState.getAvailableMissions();

            // 分类分组
            const categories = {
                '军务': availableTasks.filter(t => t.category === '军务'),
                '政务': availableTasks.filter(t => t.category === '政务'),
                '外交': availableTasks.filter(t => t.category === '外交'),
                '调略': availableTasks.filter(t => t.category === '调略'),
                '特殊': availableTasks.filter(t => t.category === '特殊'),
            };

            let hasAnyTask = false;
            for (const [category, tasks] of Object.entries(categories)) {
                if (tasks.length > 0) {
                    hasAnyTask = true;
                    break;
                }
            }

            if (hasAnyTask) {
                html += `
                    <!-- 任务卡片区域 -->
                    <div class="quest-cards-container">
                `;

                for (const [category, tasks] of Object.entries(categories)) {
                    if (tasks.length === 0) continue;

                    tasks.forEach(task => {
                        const icon = this.getTypeIcon(category);
                        const deadline = task.timeLimitDays;
                        const reward = task.baseReward;

                        // 如果已有任务，按钮禁用
                        const disabled = gameState.currentTask ? 'disabled' : '';
                        const buttonText = gameState.currentTask ? '已有任务' : '接取任务';

                        html += `
                            <div class="quest-card">
                                <div class="quest-header">
                                    <span class="quest-icon">${icon}</span>
                                    <h3 class="quest-name">${task.name}</h3>
                                </div>
                                <p class="quest-description">${task.description}</p>
                                <div class="quest-stats">
                                    <span class="stat merit">🏅 ${reward} 功勋</span>
                                    <span class="stat deadline ${deadline < 30 ? 'urgent' : ''}">⌛ ${deadline} 天</span>
                                </div>
                                <button class="btn-primary accept-btn" ${disabled} data-task-id="${task.id}">${buttonText}</button>
                            </div>
                        `;
                    });
                }

                html += `</div>`;
            } else {
                html += `<div class="empty-state"><p>目前你的身份没有可接取的任务，提升功勋晋升后再来吧。</p></div>`;
            }
        } else if (!gameState.currentTask) {
            html += `<div class="empty-state"><p>当前没有进行中的任务，等待评定会开放再接取新任务吧。</p></div>`;
        }

        html += `
                <div class="footer-action">
                    <button class="btn-secondary" id="btn-leave-assessment">告辞</button>
                </div>
            </div>
        `;

        container.innerHTML = html;
        container.style.display = 'block';

        // 绑定事件
        this.bindEvents(gameState, gameView, container);
        this.ensureStylesInjected();
    },

    // 获取任务类型图标
    getTypeIcon(category) {
        const iconMap = {
            '军务': '⚔️',
            '政务': '📜',
            '外交': '🤝',
            '调略': '🔍',
            '特殊': '✨',
            '农业': '🌾',
            '筑城': '🏯',
            '讨伐': '🏇'
        };
        return iconMap[category] || this.typeIcons[category] || '📜';
    },

    // 绑定事件
    bindEvents(gameState, gameView, container) {
        // 接取任务
        container.querySelectorAll('.accept-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.dataset.taskId, 10);
                if (gameState.currentTask) {
                    if (confirm('当前已有未完成任务，是否放弃并接受新任务？')) {
                        gameView.acceptMission(taskId);
                    }
                } else {
                    gameView.acceptMission(taskId);
                }
            });
        });

        // 告辞离开
        container.querySelector('#btn-leave-assessment')?.addEventListener('click', () => {
            // 返回城镇 - 使用新导航系统返回
            NavigationManager.popScreen('scroll-collapse');
        });
    },

    // 注入样式
    stylesInjected: false,
    ensureStylesInjected() {
        if (this.stylesInjected) return;
        this.stylesInjected = true;

        const style = document.createElement('style');
        style.textContent = `
#task-list-view {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow-y: auto;
    padding: var(--space-md);
}

.assessment-container {
    max-width: 900px;
    margin: 0 auto;
    position: relative;
    min-height: 100%;
}

.assessment-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--color-bg-primary);
    background-image: url('images/backgrounds/bg_assessment_court_1920x1080.jpg');
    background-size: cover;
    background-position: center;
    background-blend-mode: multiply;
    opacity: 0.8;
    z-index: -1;
    border-radius: var(--radius-lg);
}

/* 主君发言区 */
.lord-speech-section {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    background-color: rgba(253, 251, 247, 0.85);
    backdrop-filter: blur(4px);
    border: var(--border-double);
    border-radius: var(--radius-md);
    padding: var(--space-md);
    margin-bottom: var(--space-lg);
    box-shadow: var(--shadow-md);
}

.lord-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid var(--color-border-gold);
    background-color: var(--color-bg-secondary);
}

.lord-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.lord-avatar .avatar-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-serif);
    font-size: 32px;
    color: var(--color-text-inverse);
    background-color: var(--color-accent-gold);
}

.speech-bubble {
    flex: 1;
    font-family: var(--font-serif);
    font-size: var(--text-body);
    line-height: 1.6;
    color: var(--color-text-primary);
}

/* 当前任务条 */
.current-quest-bar {
    background-color: rgba(253, 251, 247, 0.85);
    backdrop-filter: blur(4px);
    border: var(--border-default);
    border-radius: var(--radius-md);
    padding: 12px 16px;
    margin-bottom: var(--space-md);
    box-shadow: var(--shadow-md);
}

.current-quest-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    flex-wrap: wrap;
    gap: 8px;
}

.quest-label {
    font-family: var(--font-serif);
    font-size: var(--text-body-sm);
    color: var(--color-text-secondary);
}

.quest-name {
    font-family: var(--font-serif);
    font-size: var(--text-body);
    color: var(--color-text-primary);
    font-weight: bold;
}

.quest-deadline {
    font-family: var(--font-mono);
    font-size: var(--text-caption);
    color: var(--color-text-secondary);
}

.progress-bar {
    height: 8px;
    background-color: var(--color-border-default);
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background-color: var(--color-accent-primary);
    transition: width var(--transition-base);
}

.progress-fill.gold {
    background-color: var(--color-accent-gold);
}

/* 功勋晋升条 */
.rank-progress-bar {
    background-color: rgba(253, 251, 247, 0.85);
    backdrop-filter: blur(4px);
    border: var(--border-default);
    border-radius: var(--radius-md);
    padding: 12px 16px;
    margin-bottom: var(--space-lg);
    box-shadow: var(--shadow-md);
}

.rank-info {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    margin-bottom: 6px;
    flex-wrap: wrap;
}

.current-rank {
    font-family: var(--font-serif);
    font-size: var(--text-body);
    color: var(--color-text-primary);
}

.merit-text {
    font-family: var(--font-mono);
    font-size: var(--text-body-sm);
    color: var(--color-text-secondary);
    flex: 1;
}

.next-rank {
    font-family: var(--font-serif);
    font-size: var(--text-body-sm);
    color: var(--color-accent-gold);
}

/* 通知卡片 */
.notice-card {
    background-color: rgba(253, 251, 247, 0.85);
    backdrop-filter: blur(4px);
    border: var(--border-default);
    border-radius: var(--radius-md);
    padding: var(--space-md);
    margin-bottom: var(--space-lg);
    font-family: var(--font-serif);
    font-size: var(--text-body);
    color: var(--color-text-primary);
}

.notice-card .warning {
    color: var(--color-accent-orange);
    margin: 8px 0 0;
}

/* 任务卡片容器 */
.quest-cards-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: var(--space-md);
    margin-bottom: var(--space-lg);
}

/* 任务卡片 */
.quest-card {
    background-color: rgba(253, 251, 247, 0.9);
    border: var(--border-default);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    padding: 16px;
    transition: all var(--transition-fast);
}

.quest-card:hover {
    border-color: var(--color-accent-primary);
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
}

.quest-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.quest-icon {
    font-size: 28px;
}

.quest-name {
    font-family: var(--font-serif);
    font-size: var(--text-heading-sm);
    color: var(--color-text-primary);
    margin: 0;
}

.quest-description {
    font-family: var(--font-serif);
    font-size: var(--text-body-sm);
    color: var(--color-text-secondary);
    line-height: 1.5;
    margin-bottom: 12px;
}

.quest-stats {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
}

.quest-stats .stat {
    font-family: var(--font-serif);
    font-size: var(--text-body-sm);
}

.quest-stats .stat.merit {
    color: var(--color-accent-gold);
}

.quest-stats .stat.deadline.urgent {
    color: var(--color-accent-primary);
}

.quest-card .accept-btn {
    width: 100%;
}

.quest-card .accept-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* 空状态 */
.empty-state {
    background-color: rgba(253, 251, 247, 0.85);
    backdrop-filter: blur(4px);
    border: var(--border-default);
    border-radius: var(--radius-md);
    padding: var(--space-xl);
    margin-bottom: var(--space-lg);
    text-align: center;
}

.empty-state p {
    font-family: var(--font-serif);
    font-size: var(--text-body);
    color: var(--color-text-tertiary);
    margin: 0;
}

/* 底部操作 */
.footer-action {
    display: flex;
    justify-content: flex-end;
    padding-bottom: var(--space-md);
}

/* 响应式 */
@media (max-width: 768px) {
    #task-list-view {
        padding: var(--space-sm);
    }

    .quest-cards-container {
        grid-template-columns: repeat(2, 1fr);
    }

    .lord-speech-section {
        flex-direction: column;
        align-items: flex-start;
    }

    .rank-info {
        flex-wrap: wrap;
    }
}

@media (max-width: 480px) {
    .quest-cards-container {
        grid-template-columns: 1fr;
    }
}
`;
        document.head.appendChild(style);
    }
};

export default TaskListRenderer;
window.TaskListRenderer = TaskListRenderer;
