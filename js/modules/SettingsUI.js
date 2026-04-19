/**
 * 《洪武立志传》设置界面
 * 按照UI/04-设置界面.md设计规范实现
 */

import StartScreen from './StartScreen.js';

const SettingsUI = {
    overlay: null,
    modal: null,
    isVisible: false,
    isDirty: false,

    // 默认设置
    defaultSettings: {
        masterVolume: 80,
        bgmVolume: 70,
        sfxVolume: 90,
        graphicsQuality: 'high',
        windowMode: 'windowed',
        resolution: '1920x1080',
        textSpeed: 3,
        autoSave: true,
        battleAnim: 'full'
    },

    // 当前临时设置（编辑中）
    tempSettings: {},

    // 已保存的设置
    savedSettings: {},

    // 分辨率选项
    resolutionOptions: [
        '1280x720',
        '1366x768',
        '1600x900',
        '1920x1080',
        '2560x1440',
        '3840x2160'
    ],

    // 画质选项
    qualityOptions: [
        { value: 'low', label: '低' },
        { value: 'medium', label: '中' },
        { value: 'high', label: '高' },
        { value: 'ultra', label: '极高' }
    ],

    // 窗口模式选项
    windowModeOptions: [
        { value: 'windowed', label: '窗口' },
        { value: 'fullscreen', label: '全屏' },
        { value: 'borderless', label: '无边框' }
    ],

    // 战斗动画选项
    battleAnimOptions: [
        { value: 'full', label: '完整' },
        { value: 'simplified', label: '简化' },
        { value: 'off', label: '关闭' }
    ],

    // 初始化
    init() {
        this.overlay = document.getElementById('settings-overlay');
        this.modal = document.getElementById('settings-modal');
        if (!this.overlay || !this.modal) {
            console.error('SettingsUI containers not found');
            return;
        }

        // 从localStorage加载设置
        this.loadSettings();
        this.tempSettings = { ...this.savedSettings };
        this.isDirty = false;

        this.bindEvents();
        this.addStyles();
    },

    // 从localStorage加载设置
    loadSettings() {
        try {
            const saved = localStorage.getItem('mingdynasty_settings');
            if (saved) {
                this.savedSettings = { ...this.defaultSettings, ...JSON.parse(saved) };
            } else {
                this.savedSettings = { ...this.defaultSettings };
            }
        } catch (e) {
            console.error('加载设置失败:', e);
            this.savedSettings = { ...this.defaultSettings };
        }
    },

    // 保存设置到localStorage
    saveSettingsToStorage() {
        try {
            localStorage.setItem('mingdynasty_settings', JSON.stringify(this.tempSettings));
            this.savedSettings = { ...this.tempSettings };
            this.isDirty = false;
            return true;
        } catch (e) {
            console.error('保存设置失败:', e);
            return false;
        }
    },

    // 显示设置界面（从启动界面进入 - 全屏模态框）
    showModal() {
        this.tempSettings = { ...this.savedSettings };
        this.isDirty = false;
        this.render();
        this.overlay.style.display = 'flex';
        this.isVisible = true;
    },

    // 隐藏设置界面
    hide() {
        this.overlay.style.display = 'none';
        this.isVisible = false;

        // 如果从启动界面打开，返回启动界面
        if (StartScreen && !StartScreen.isVisible() && !GameMain.gameState) {
            StartScreen.show();
        }
    },

    // 检查是否有修改，提示用户
    checkUnsavedChanges() {
        if (!this.isDirty) return true;
        return confirm('设置已修改，是否放弃更改？');
    },

    // 渲染界面
    render() {
        const s = this.tempSettings;

        let html = `
            <div class="settings-header">
                <button class="btn-text back-btn" id="settings-back">← 返回</button>
                <h2 class="modal-title">游戏设置</h2>
                <button class="btn-text close-btn" id="settings-close">✕</button>
            </div>

            <div class="settings-content">
                <!-- 声音设置 -->
                <div class="settings-group">
                    <h3 class="group-title">
                        <span class="stamp stamp-cinnabar">音</span>
                        声音设置
                    </h3>
                    <div class="setting-item">
                        <label class="setting-label">主音量</label>
                        <div class="setting-control-row">
                            <input type="range" min="0" max="100" value="${s.masterVolume}" class="volume-slider" data-key="masterVolume" id="slider-masterVolume">
                            <span class="value-label">${s.masterVolume}%</span>
                        </div>
                    </div>
                    <div class="setting-item">
                        <label class="setting-label">背景音乐</label>
                        <div class="setting-control-row">
                            <input type="range" min="0" max="100" value="${s.bgmVolume}" class="volume-slider" data-key="bgmVolume" id="slider-bgmVolume">
                            <span class="value-label">${s.bgmVolume}%</span>
                        </div>
                    </div>
                    <div class="setting-item">
                        <label class="setting-label">音效</label>
                        <div class="setting-control-row">
                            <input type="range" min="0" max="100" value="${s.sfxVolume}" class="volume-slider" data-key="sfxVolume" id="slider-sfxVolume">
                            <span class="value-label">${s.sfxVolume}%</span>
                        </div>
                    </div>
                </div>

                <!-- 显示设置 -->
                <div class="settings-group">
                    <h3 class="group-title">
                        <span class="stamp stamp-gold">画</span>
                        显示设置
                    </h3>
                    <div class="setting-item">
                        <label class="setting-label">画面质量</label>
                        <div class="segmented" id="segmented-graphicsQuality">
                            ${this.qualityOptions.map(opt => `
                                <div class="segmented-option ${opt.value === s.graphicsQuality ? 'active' : ''}" data-value="${opt.value}">${opt.label}</div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="setting-item">
                        <label class="setting-label">窗口模式</label>
                        <div class="segmented" id="segmented-windowMode">
                            ${this.windowModeOptions.map(opt => `
                                <div class="segmented-option ${opt.value === s.windowMode ? 'active' : ''}" data-value="${opt.value}">${opt.label}</div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="setting-item">
                        <label class="setting-label">分辨率</label>
                        <div class="dropdown" id="dropdown-resolution">
                            <div class="dropdown-trigger">
                                <span>${s.resolution}</span>
                                <span class="dropdown-arrow">▼</span>
                            </div>
                            <div class="dropdown-menu" style="display: none;">
                                ${this.resolutionOptions.map(res => `
                                    <div class="dropdown-item ${res === s.resolution ? 'active' : ''}" data-value="${res}">${res}</div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 游戏设置 -->
                <div class="settings-group">
                    <h3 class="group-title">
                        <span class="stamp">戏</span>
                        游戏设置
                    </h3>
                    <div class="setting-item">
                        <label class="setting-label">文本速度</label>
                        <div class="setting-control-row">
                            <input type="range" min="1" max="5" value="${s.textSpeed}" class="text-speed-slider" data-key="textSpeed" id="slider-textSpeed">
                            <span class="value-label">${this.getTextSpeedLabel(s.textSpeed)}</span>
                        </div>
                    </div>
                    <div class="setting-item">
                        <label class="setting-label">自动存档</label>
                        <div class="toggle ${s.autoSave ? 'active' : ''}" id="toggle-autoSave">
                            <div class="toggle-thumb"></div>
                        </div>
                    </div>
                    <div class="setting-item">
                        <label class="setting-label">战斗动画</label>
                        <div class="segmented" id="segmented-battleAnim">
                            ${this.battleAnimOptions.map(opt => `
                                <div class="segmented-option ${opt.value === s.battleAnim ? 'active' : ''}" data-value="${opt.value}">${opt.label}</div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <div class="settings-footer">
                <div class="footer-buttons">
                    <button class="btn-secondary" id="btn-reset-default">恢复默认</button>
                    <button class="btn-secondary" id="btn-cancel">取消</button>
                    <button class="btn-primary" id="btn-save" ${!this.isDirty ? 'disabled' : ''}>保存设置</button>
                </div>
                <div class="footer-info">
                    <div>版本：${StartScreen ? StartScreen.gameVersion : 'v1.0.0'}</div>
                    <div>${StartScreen ? StartScreen.studioName : '洪武工坊'}</div>
                </div>
            </div>
        `;

        this.modal.innerHTML = html;
        this.bindRenderedEvents();
    },

    // 获取文本速度标签
    getTextSpeedLabel(value) {
        const labels = ['很慢', '慢', '中等', '快', '很快'];
        return labels[value - 1] || '中等';
    },

    // 绑定全局事件
    bindEvents() {
        // 点击遮罩关闭
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                if (this.checkUnsavedChanges()) {
                    this.hide();
                }
            }
        });

        // ESC关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                if (this.checkUnsavedChanges()) {
                    this.hide();
                }
            }
        });
    },

    // 绑定渲染后的事件
    bindRenderedEvents() {
        // 返回/关闭按钮
        document.getElementById('settings-back').addEventListener('click', () => {
            if (this.checkUnsavedChanges()) {
                this.hide();
            }
        });

        document.getElementById('settings-close').addEventListener('click', () => {
            if (this.checkUnsavedChanges()) {
                this.hide();
            }
        });

        // 音量滑块
        document.querySelectorAll('.volume-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const key = e.target.dataset.key;
                const value = parseInt(e.target.value, 10);
                this.tempSettings[key] = value;
                // 更新标签
                e.target.nextElementSibling.textContent = `${value}%`;
                this.markDirty();
            });
        });

        // 文本速度滑块
        document.querySelector('.text-speed-slider')?.addEventListener('input', (e) => {
            const key = e.target.dataset.key;
            const value = parseInt(e.target.value, 10);
            this.tempSettings[key] = value;
            e.target.nextElementSibling.textContent = this.getTextSpeedLabel(value);
            this.markDirty();
        });

        // 分段选项
        this.bindSegmented('graphicsQuality');
        this.bindSegmented('windowMode');
        this.bindSegmented('battleAnim');

        // 下拉菜单
        this.bindDropdown();

        // 开关
        document.getElementById('toggle-autoSave')?.addEventListener('click', (e) => {
            const toggle = e.currentTarget;
            const newValue = !toggle.classList.contains('active');
            if (newValue) {
                toggle.classList.add('active');
            } else {
                toggle.classList.remove('active');
            }
            this.tempSettings.autoSave = newValue;
            this.markDirty();
        });

        // 按钮
        document.getElementById('btn-reset-default')?.addEventListener('click', () => {
            if (confirm('确定要恢复所有设置为默认值吗？')) {
                this.tempSettings = { ...this.defaultSettings };
                this.isDirty = true;
                this.render();
            }
        });

        document.getElementById('btn-cancel')?.addEventListener('click', () => {
            if (this.checkUnsavedChanges()) {
                this.hide();
            }
        });

        document.getElementById('btn-save')?.addEventListener('click', () => {
            this.saveAndApply();
        });
    },

    // 绑定分段选项
    bindSegmented(key) {
        const container = document.getElementById(`segmented-${key}`);
        if (!container) return;

        container.querySelectorAll('.segmented-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const value = e.target.dataset.value;
                // 移除所有active
                container.querySelectorAll('.segmented-option').forEach(opt => opt.classList.remove('active'));
                // 添加active到点击项
                e.target.classList.add('active');
                // 更新设置
                this.tempSettings[key] = value;
                this.markDirty();
            });
        });
    },

    // 绑定下拉菜单
    bindDropdown() {
        const dropdown = document.getElementById('dropdown-resolution');
        if (!dropdown) return;

        const trigger = dropdown.querySelector('.dropdown-trigger');
        const menu = dropdown.querySelector('.dropdown-menu');

        // 点击触发器切换菜单
        trigger.addEventListener('click', function(e) {
            e.stopPropagation();
            const isOpen = menu.style.display !== 'none';
            menu.style.display = isOpen ? 'none' : 'block';
        });

        // 点击菜单项
        menu.querySelectorAll('.dropdown-item').forEach(function(item) {
            item.addEventListener('click', function(e) {
                const value = e.target.dataset.value;
                this.tempSettings.resolution = value;
                trigger.querySelector('span').textContent = value;
                menu.querySelectorAll('.dropdown-item').forEach(function(i) {
                    i.classList.remove('active');
                });
                e.target.classList.add('active');
                menu.style.display = 'none';
                this.markDirty();
            }.bind(this));
        }.bind(this));

        // 点击外部关闭
        document.addEventListener('click', function() {
            menu.style.display = 'none';
        });
    },

    // 标记为已修改
    markDirty() {
        this.isDirty = true;
        const saveBtn = document.getElementById('btn-save');
        if (saveBtn) {
            saveBtn.disabled = false;
        }
    },

    // 保存并应用
    saveAndApply() {
        this.saveSettingsToStorage();
        this.applySettings();
        this.hide();
        console.log('设置已保存并应用');
    },

    // 应用设置（这里只持久化，实际应用由调用方根据需要读取）
    applySettings() {
        // 音量设置需要游戏音频系统实际应用
        // 如果游戏已初始化，可以触发事件通知
        if (window.dispatchEvent) {
            const event = new CustomEvent('settingsChanged', {
                detail: { ...this.savedSettings }
            });
            window.dispatchEvent(event);
        }
    },

    // 获取当前设置（供其他模块读取）
    getSettings() {
        return { ...this.savedSettings };
    },

    // 添加额外样式
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
.settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-xl);
}

.settings-content {
    min-width: 700px;
}

.settings-group {
    background-color: var(--color-bg-secondary);
    border: var(--border-double);
    border-radius: var(--radius-md);
    padding: var(--space-xl);
    margin-bottom: var(--space-2xl);
    position: relative;
}

.settings-group::before,
.settings-group::after,
.settings-group .corner-tl::before,
.settings-group .corner-tr::before,
.settings-group .corner-bl::before,
.settings-group .corner-br::before {
    /* 四角云纹装饰 - 如果有图片可以启用，现在留空 */
}

.group-title {
    font-family: var(--font-serif);
    font-size: var(--text-heading-sm);
    color: var(--color-text-primary);
    margin: 0 0 var(--space-lg);
    padding-bottom: var(--space-sm);
    border-bottom: var(--border-default);
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.group-title .stamp {
    font-size: var(--text-caption);
    padding: 2px 8px;
}

.setting-item {
    margin-bottom: var(--space-lg);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-xl);
}

.setting-item:last-child {
    margin-bottom: 0;
}

.setting-label {
    font-family: var(--font-serif);
    font-size: var(--text-body);
    color: var(--color-text-secondary);
    min-width: 100px;
}

.setting-control-row {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    flex: 1;
}

.setting-control-row input[type="range"] {
    flex: 1;
}

.value-label {
    font-family: var(--font-mono);
    font-size: var(--text-body-sm);
    color: var(--color-text-tertiary);
    min-width: 60px;
    text-align: right;
}

.dropdown {
    position: relative;
    min-width: 180px;
}

.dropdown-arrow {
    color: var(--color-text-tertiary);
    font-size: 12px;
}

.settings-footer {
    margin-top: var(--space-xl);
}

.settings-footer .footer-buttons {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-md);
    margin-bottom: var(--space-lg);
}

.settings-footer .footer-info {
    display: flex;
    justify-content: space-between;
    color: var(--color-text-tertiary);
    font-size: var(--text-body-sm);
}

/* 开关设置项对齐 */
.setting-item .toggle {
    margin-left: auto;
}

/* 响应式适配 */
@media (max-width: 768px) {
    .settings-content {
        min-width: auto;
    }

    .settings-group {
        padding: var(--space-lg);
    }

    .setting-item {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-sm);
    }

    .setting-control-row {
        width: 100%;
    }

    .settings-footer .footer-buttons {
        flex-direction: column-reverse;
    }

    .settings-footer .footer-buttons button {
        width: 100%;
    }

    .segmented {
        flex-wrap: wrap;
    }
}

@media (max-width: 640px) {
    .modal {
        padding: var(--space-lg);
    }

    .settings-group {
        padding: var(--space-md);
    }
}
`;
        document.head.appendChild(style);
    }
};

// DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        SettingsUI.init();
    });
} else {
    SettingsUI.init();
}

export default SettingsUI;
window.SettingsUI = SettingsUI;
