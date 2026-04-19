/**
 * 《洪武立志传》存档读档界面
 * 按照UI/03-存档读档界面.md设计规范实现
 */

import SaveManager from '../utils/SaveManager.js';
import StartScreen from './StartScreen.js';

const SaveLoadUI = {
    overlay: null,
    modal: null,
    currentMode: 'load', // 'save' or 'load'
    slotsPerPage: 9,
    currentPage: 0,

    // 初始化
    init() {
        this.overlay = document.getElementById('saveload-overlay');
        this.modal = document.getElementById('saveload-modal');
        if (!this.overlay || !this.modal) {
            console.error('SaveLoadUI containers not found');
            return;
        }
        this.bindEvents();
        this.addStyles();
    },

    // 显示界面
    show(mode = 'load') {
        this.currentMode = mode;
        this.render();
        this.overlay.style.display = 'flex';
    },

    // 隐藏界面
    hide() {
        this.overlay.style.display = 'none';
        // 返回启动界面如果是从启动界面打开的读档
        if (this.currentMode === 'load' && StartScreen && !StartScreen.isVisible() && !GameMain.gameState) {
            StartScreen.show();
        }
    },

    // 渲染
    render() {
        const slots = SaveManager.getAllSlots();
        const title = this.currentMode === 'save' ? '保存游戏' : '读取存档';

        let html = `
            <div class="saveload-header">
                <button class="btn-text back-btn" id="saveload-back">← 返回</button>
                <h2 class="modal-title">${title}</h2>
                <button class="btn-text close-btn" id="saveload-close">✕</button>
            </div>
            <div class="saveload-grid">
        `;

        // 渲染每个存档位
        for (let i = 0; i < SaveManager.TOTAL_SLOTS; i++) {
            const saveData = slots[i];
            html += this.renderSaveSlot(i, saveData);
        }

        html += `
            </div>
        `;

        this.modal.innerHTML = html;
        this.bindRenderedEvents();
    },

    // 渲染单个存档位卡片
    renderSaveSlot(slotId, saveData) {
        const isEmpty = !saveData;

        let contentHtml;
        if (isEmpty) {
            contentHtml = `
                <div class="save-slot empty">
                    <div class="screenshot-area">
                        <img src="images/ui/decor_empty_slot_200x120.png" alt="空位" class="empty-decor-img">
                    </div>
                    <div class="info-area">
                        <div class="empty-info">空</div>
                    </div>
                    <div class="actions-area">
                        ${this.currentMode === 'save' ? `<button class="btn-primary btn-save" data-slot="${slotId}">保存</button>` : ''}
                    </div>
                </div>
            `;
        } else {
            const year = saveData.year || '?';
            const month = saveData.month != null ? ` ${saveData.month}月` : '';
            const rank = saveData.rank || '无品级';
            const money = saveData.money || 0;

            const screenshotHtml = saveData.screenshot
                ? `<img src="${saveData.screenshot}" alt="存档截图" class="screenshot-img">`
                : `<div class="screenshot-placeholder"><span>暂无截图</span></div>`;

            let actionsHtml = '';
            if (this.currentMode === 'load') {
                actionsHtml = `
                    <button class="btn-primary btn-load" data-slot="${slotId}">载入</button>
                    <button class="btn-secondary btn-delete" data-slot="${slotId}">删除</button>
                `;
            } else {
                actionsHtml = `
                    <button class="btn-secondary btn-overwrite" data-slot="${slotId}">覆盖</button>
                    <button class="btn-secondary btn-delete" data-slot="${slotId}">删除</button>
                `;
            }

            contentHtml = `
                <div class="save-slot has-save">
                    <div class="screenshot-area">
                        ${screenshotHtml}
                    </div>
                    <div class="info-area">
                        <div class="save-year">洪武${year}年${month}</div>
                        <div class="save-rank" style="color: var(--color-accent-gold)">${rank}</div>
                        <div class="save-money"><span>银两 </span><span class="money-value">${money.toLocaleString()}</span></div>
                    </div>
                    <div class="actions-area">
                        ${actionsHtml}
                    </div>
                </div>
            `;
        }

        return contentHtml;
    },

    // 绑定全局事件
    bindEvents() {
        // 点击遮罩关闭
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hide();
            }
        });

        // ESC关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay.style.display !== 'none') {
                this.hide();
            }
        });
    },

    // 绑定渲染后的事件
    bindRenderedEvents() {
        // 返回/关闭按钮
        document.getElementById('saveload-back').addEventListener('click', () => {
            this.hide();
            if (this.currentMode === 'load') {
                StartScreen.show();
            }
        });

        document.getElementById('saveload-close').addEventListener('click', () => {
            this.hide();
        });

        // 保存按钮（空位）
        document.querySelectorAll('.btn-save').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const slotId = parseInt(e.target.dataset.slot, 10);
                this.doSave(slotId);
            });
        });

        // 覆盖按钮（已有存档）
        document.querySelectorAll('.btn-overwrite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const slotId = parseInt(e.target.dataset.slot, 10);
                this.confirmOverwrite(slotId);
            });
        });

        // 载入按钮
        document.querySelectorAll('.btn-load').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const slotId = parseInt(e.target.dataset.slot, 10);
                this.doLoad(slotId);
            });
        });

        // 删除按钮
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const slotId = parseInt(e.target.dataset.slot, 10);
                this.confirmDelete(slotId);
            });
        });
    },

    // 执行保存
    doSave(slotId) {
        if (!GameMain.gameState) {
            alert('没有可保存的游戏');
            return;
        }

        const success = SaveManager.saveToSlot(slotId, GameMain.gameState);
        if (success) {
            alert('保存成功');
            this.render();
        } else {
            alert('保存失败');
        }
    },

    // 确认覆盖
    confirmOverwrite(slotId) {
        if (confirm('确定要覆盖此存档吗？此操作不可恢复')) {
            this.doSave(slotId);
        }
    },

    // 确认删除
    confirmDelete(slotId) {
        if (confirm('确定要删除此存档吗？此操作不可恢复')) {
            SaveManager.deleteSlot(slotId);
            this.render();
        }
    },

    // 执行载入
    doLoad(slotId) {
        // 如果游戏未初始化，先初始化
        if (!GameMain.gameState) {
            document.getElementById('game-container').style.display = 'flex';
            GameMain.initGame();
        }

        const success = SaveManager.loadFromSlot(slotId, GameMain.gameState);
        if (success) {
            GameMain.gameView.renderAll();
            this.hide();
            console.log(`存档 ${slotId} 载入成功`);
        } else {
            alert('载入失败');
        }
    },

    // 添加样式
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
.modal-overlay {
    background-color: var(--color-bg-primary);
    background-image: url('images/backgrounds/bg_start_ink_mountain_1920x1080.jpg');
    background-size: cover;
    background-position: center;
    background-blend-mode: overlay;
}

.saveload-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-xl);
}

.saveload-header .modal-title {
    margin: 0;
}

.saveload-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-lg);
}

.save-slot {
    composes: card;
    background-color: var(--color-bg-secondary);
    border: var(--border-default);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    height: 340px;
    transition: all var(--transition-fast);
}

.save-slot:hover {
    box-shadow: var(--shadow-lg);
}

.save-slot.has-save:hover {
    border-color: var(--color-border-highlight);
}

.save-slot.empty {
    background-color: rgba(253, 251, 247, 0.6);
}

.screenshot-area {
    height: 200px;
    border-radius: var(--radius-sm);
    overflow: hidden;
    background-color: var(--color-bg-dark);
    position: relative;
}

.empty-decor-img {
    position: absolute;
    top: 60%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.9);
    max-width: 90%;
    max-height: 90%;
    opacity: 0.6;
    z-index: 0;
}

.empty-placeholder-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.5;
}

.screenshot-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.screenshot-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-tertiary);
}

.save-slot.empty .screenshot-area {
    background-color: rgba(253, 251, 247, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
}

.empty-text .empty-title {
    font-family: var(--font-calligraphy);
    font-size: var(--text-heading-md);
    color: var(--color-text-tertiary);
}

.empty-info {
    text-align: center;
    color: var(--color-text-tertiary);
    font-family: var(--font-calligraphy);
    font-size: calc(var(--text-heading-md) * 1.5);
}

.info-area {
    flex: 1;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: var(--space-md);
}

.save-year {
    font-family: var(--font-serif);
    font-size: var(--text-heading-sm);
    color: var(--color-text-primary);
    margin-bottom: 4px;
}

.save-rank {
    font-size: var(--text-body-sm);
    margin-bottom: 4px;
}

.save-money {
    font-size: var(--text-body-sm);
    color: var(--color-text-secondary);
}

.save-money .money-value {
    font-family: var(--font-mono);
    font-weight: bold;
}

.actions-area {
    display: flex;
    gap: var(--space-sm);
}

.actions-area .btn {
    flex: 1;
    padding: 6px 12px;
    font-size: var(--text-body-sm);
}

/* 响应式 */
@media (max-width: 640px) {
    .saveload-grid {
        grid-template-columns: 1fr;
    }

    .save-slot {
        height: auto;
        min-height: 240px;
    }

    .saveload-header {
        gap: var(--space-sm);
    }

    .saveload-header .modal-title {
        font-size: var(--text-heading-sm);
    }
}

@media (min-width: 641px) and (max-width: 900px) {
    .saveload-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
`;
        document.head.appendChild(style);
    }
};

// DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        SaveLoadUI.init();
    });
} else {
    SaveLoadUI.init();
}

export default SaveLoadUI;
window.SaveLoadUI = SaveLoadUI;
