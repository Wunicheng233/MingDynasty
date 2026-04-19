/**
 * 《洪武立志传》导航管理器
 * 按照 UI/19-UI切换与导航.md 设计规范实现
 * 统一管理返回栈、界面切换、过渡动画
 */

// 界面类型枚举
const ScreenType = {
    FULLSCREEN: 'fullscreen',   // 全屏界面 - 压入返回栈
    MODAL: 'modal'             // 模态框 - 不压入返回栈
};

const NavigationManager = {
    // 返回栈 - 存储全屏界面历史
    stack: [],
    // 当前打开的模态框引用
    currentModal: null,
    // 动画正在进行中 - 防重复点击
    animating: false,

    /**
     * 初始化导航管理器
     * 绑定全局事件
     */
    init() {
        // 绑定ESC键全局返回
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscape();
            }
        });
    },

    /**
     * 进入新的全屏界面
     * @param {string} screenId - 界面ID
     * @param {Object} params - 传递给新界面的参数
     * @param {string} animation - 过渡动画名称 (scroll-expand/lens-zoom/fade-in/ink-burst)
     */
    pushScreen(screenId, params = {}, animation = 'scroll-expand') {
        if (this.animating) return;

        // 当前界面压栈
        if (this.stack.length > 0) {
            const current = this.getCurrentScreen();
            // 隐藏当前界面（保留在栈中）
            this.hideScreen(current.screenId);
        }

        // 新界面入栈
        this.stack.push({
            screenId: screenId,
            params: params,
            type: ScreenType.FULLSCREEN
        });

        // 显示新界面并播放动画
        this.showScreen(screenId, params);
        this.playEnterAnimation(screenId, animation);
    },

    /**
     * 替换当前界面（用于载入存档等场景）
     * @param {string} screenId - 新界面ID
     * @param {Object} params - 参数
     * @param {string} animation - 过渡动画
     */
    replaceScreen(screenId, params = {}, animation = 'scroll-expand') {
        if (this.animating) return;

        // 弹出当前界面
        if (this.stack.length > 0) {
            this.stack.pop();
            this.hideCurrentScreen();
        }

        // 压入新界面
        this.stack.push({
            screenId: screenId,
            params: params,
            type: ScreenType.FULLSCREEN
        });

        this.showScreen(screenId, params);
        this.playEnterAnimation(screenId, animation);
    },

    /**
     * 返回上一个界面
     * @param {string} animation - 退出动画名称
     * @returns {boolean} 是否成功返回（false表示已经在栈底）
     */
    popScreen(animation = 'scroll-collapse') {
        if (this.animating) return false;
        if (this.stack.length <= 1) {
            // 已经在最底层，返回启动界面
            this.clearAndReturnToLaunch();
            return false;
        }

        this.animating = true;
        const current = this.stack.pop();
        const prev = this.getCurrentScreen();

        // 播放退出动画
        this.playExitAnimation(current.screenId, animation, () => {
            this.hideScreen(current.screenId);
            this.showScreen(prev.screenId, prev.params);
            this.animating = false;
        });

        return true;
    },

    /**
     * 清空返回栈，回到启动界面
     */
    clearAndReturnToLaunch() {
        // 隐藏所有界面
        this.stack.forEach(screen => {
            this.hideScreen(screen.screenId);
        });
        // 清空栈
        this.stack = [];
        // 显示启动界面
        if (window.StartScreen) {
            StartScreen.show();
        }
    },

    /**
     * 清空整个栈，只保留当前界面（载入新游戏后）
     */
    clearStackKeepCurrent() {
        if (this.stack.length === 0) return;
        const current = this.stack[this.stack.length - 1];
        this.stack = [current];
    },

    /**
     * 获取当前栈顶界面
     */
    getCurrentScreen() {
        if (this.stack.length === 0) return null;
        return this.stack[this.stack.length - 1];
    },

    /**
     * 获取当前栈大小
     */
    getStackSize() {
        return this.stack.length;
    },

    /**
     * 检查是否在栈底
     */
    isAtRoot() {
        return this.stack.length <= 1;
    },

    /**
     * 打开模态框（不压栈）
     * @param {string} modalId - 模态框ID
     * @param {Object} params - 参数
     */
    openModal(modalId, params = {}) {
        if (this.currentModal) {
            this.closeModal();
        }
        this.currentModal = modalId;
        this.showModal(modalId, params);
        this.playModalEnterAnimation(modalId);
    },

    /**
     * 关闭当前模态框
     */
    closeModal() {
        if (!this.currentModal) return;
        this.playModalExitAnimation(this.currentModal, () => {
            this.hideModal(this.currentModal);
            this.currentModal = null;
        });
    },

    /**
     * 获取当前模态框
     */
    getCurrentModal() {
        return this.currentModal;
    },

    /**
     * 检查是否有打开的模态框
     */
    hasModal() {
        return this.currentModal !== null;
    },

    /**
     * 处理ESC键全局返回逻辑
     */
    handleEscape() {
        // 优先关闭模态框
        if (this.hasModal()) {
            this.closeModal();
            return;
        }

        // 检查是否在战斗中（只弹出认输确认）
        if (this.isInBattle()) {
            if (confirm('确定要认输退出战斗吗？')) {
                this.popScreen();
            }
            return;
        }

        // 弹出游戏内菜单
        this.openInGameMenu();
    },

    /**
     * 检查当前是否在战斗中
     */
    isInBattle() {
        const current = this.getCurrentScreen();
        if (!current) return false;
        return ['personal-battle', 'grand-battle'].includes(current.screenId);
    },

    /**
     * 打开游戏内菜单（ESC菜单）
     */
    openInGameMenu() {
        const html = `
            <div class="ingame-menu-overlay" id="ingame-menu-overlay">
                <div class="ingame-menu-modal">
                    <h3>游戏菜单</h3>
                    <div class="ingame-menu-buttons">
                        <button class="btn-primary" id="img-continue">继续游戏</button>
                        <button class="btn-secondary" id="img-save">保存游戏</button>
                        <button class="btn-secondary" id="img-load">读取存档</button>
                        <button class="btn-secondary" id="img-settings">游戏设置</button>
                        <button class="btn-text" id="img-back-to-title">返回标题</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);

        const overlay = document.getElementById('ingame-menu-overlay');
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeInGameMenu();
            }
        });

        document.getElementById('img-continue').addEventListener('click', () => {
            this.closeInGameMenu();
        });

        document.getElementById('img-save').addEventListener('click', () => {
            this.closeInGameMenu();
            if (window.SaveLoadUI) {
                SaveLoadUI.show('save');
            }
        });

        document.getElementById('img-load').addEventListener('click', () => {
            this.closeInGameMenu();
            if (window.SaveLoadUI) {
                SaveLoadUI.show('load');
            }
        });

        document.getElementById('img-settings').addEventListener('click', () => {
            this.closeInGameMenu();
            if (window.SettingsUI) {
                SettingsUI.showModal();
            }
        });

        document.getElementById('img-back-to-title').addEventListener('click', () => {
            if (confirm('确定要返回标题界面吗？未保存的进度将会丢失。')) {
                this.closeInGameMenu();
                this.clearAndReturnToLaunch();
            }
        });

        // 淡入动画
        setTimeout(() => overlay.classList.add('visible'), 10);
    },

    /**
     * 关闭游戏内菜单
     */
    closeInGameMenu() {
        const overlay = document.getElementById('ingame-menu-overlay');
        if (overlay) {
            overlay.remove();
        }
    },

    // === 下面是与具体渲染模块的桥梁方法 ===

    /**
     * 显示界面 - 调用对应渲染器
     */
    showScreen(screenId, params) {
        // 根据screenId调用对应渲染器
        // 渲染器已经存在于全局，直接调用render方法
        const renderMap = {
            'map': () => {
                if (window.MapRenderer) MapRenderer.render(window.game.gameState);
            },
            'city': () => {
                if (window.CityViewRenderer) CityViewRenderer.render(window.game.gameState, window.game.gameView);
            },
            'character': () => {
                if (window.CharacterViewRenderer) CharacterViewRenderer.render(window.game.gameState);
            },
            'task-list': () => {
                if (window.TaskListRenderer) TaskListRenderer.render(window.game.gameState, window.game.gameView);
            },
            'card-collection': () => {
                if (window.CardCollectionRenderer) CardCollectionRenderer.render(window.game.gameState);
            },
            'character-list': () => {
                if (window.CharacterListRenderer) CharacterListRenderer.render(window.game.gameState);
            },
            'social': () => {
                if (window.SocialRenderer) SocialRenderer.render(window.game.gameState);
            },
            'market': () => {
                if (window.MarketScene) {
                    const container = this.ensureContainer('market-view');
                    container.innerHTML = MarketScene.render(window.game.gameState);
                }
            },
            'event': () => {
                if (window.EventScene) {
                    const container = this.ensureContainer('event-view');
                    container.innerHTML = EventScene.render(window.game.gameState);
                }
            },
            'facility': () => {
                if (window.FacilityScene) {
                    const container = this.ensureContainer('event-view');
                    container.innerHTML = FacilityScene.render(window.game.gameState);
                }
            }
        };

        if (renderMap[screenId]) {
            renderMap[screenId]();
        }

        // 显示容器
        const container = document.getElementById(screenId === 'event' ? 'event-view' :
            screenId === 'market' ? 'market-view' :
            `${screenId}-view`);
        if (container) {
            container.style.display = 'block';
        }
    },

    /**
     * 隐藏界面
     */
    hideScreen(screenId) {
        const container = document.getElementById(screenId === 'event' ? 'event-view' :
            screenId === 'market' ? 'market-view' :
            `${screenId}-view`);
        if (container) {
            container.style.display = 'none';
        }
    },

    /**
     * 隐藏当前栈顶界面
     */
    hideCurrentScreen() {
        const current = this.getCurrentScreen();
        if (current) {
            this.hideScreen(current.screenId);
        }
    },

    /**
     * 确保DOM容器存在
     */
    ensureContainer(containerId) {
        let container = document.getElementById(containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            container.className = 'scene-view';
            document.getElementById('main-display').appendChild(container);
        }
        return container;
    },

    /**
     * 显示模态框
     */
    showModal(modalId, params) {
        const container = document.getElementById(modalId);
        if (container) {
            container.style.display = 'flex';
        }
    },

    /**
     * 隐藏模态框
     */
    hideModal(modalId) {
        const container = document.getElementById(modalId);
        if (container) {
            container.style.display = 'none';
        }
    },

    // === 动画播放 ===

    /**
     * 播放进入动画
     */
    playEnterAnimation(screenId, animationName) {
        this.animating = true;
        const container = this.getScreenContainer(screenId);
        if (!container) {
            this.animating = false;
            return;
        }

        container.classList.add('nav-animation-' + animationName);
        container.classList.add('nav-animation-enter');

        setTimeout(() => {
            container.classList.remove('nav-animation-' + animationName);
            container.classList.remove('nav-animation-enter');
            this.animating = false;
        }, this.getAnimationDuration(animationName));
    },

    /**
     * 播放退出动画
     */
    playExitAnimation(screenId, animationName, callback) {
        this.animating = true;
        const container = this.getScreenContainer(screenId);
        if (!container) {
            this.animating = false;
            callback();
            return;
        }

        container.classList.add('nav-animation-' + animationName);
        container.classList.add('nav-animation-exit');

        setTimeout(() => {
            container.classList.remove('nav-animation-' + animationName);
            container.classList.remove('nav-animation-exit');
            this.animating = false;
            callback();
        }, this.getAnimationDuration(animationName));
    },

    /**
     * 播放模态框进入动画
     */
    playModalEnterAnimation(modalId) {
        const container = document.getElementById(modalId);
        if (!container) return;
        container.classList.add('modal-animation-enter');
        setTimeout(() => {
            container.classList.remove('modal-animation-enter');
        }, 250);
    },

    /**
     * 播放模态框退出动画
     */
    playModalExitAnimation(modalId, callback) {
        const container = document.getElementById(modalId);
        if (!container) {
            callback();
            return;
        }
        container.classList.add('modal-animation-exit');
        setTimeout(() => {
            container.classList.remove('modal-animation-exit');
            callback();
        }, 200);
    },

    /**
     * 获取动画持续时间（ms）
     */
    getAnimationDuration(name) {
        const durations = {
            'scroll-expand': 400,
            'scroll-collapse': 350,
            'fade-in': 250,
            'fade-out': 250,
            'lens-zoom': 500,
            'lens-unzoom': 500,
            'ink-burst': 450,
            'ink-fade': 450
        };
        return durations[name] || 300;
    },

    /**
     * 获取界面容器
     */
    getScreenContainer(screenId) {
        return document.getElementById(screenId === 'event' ? 'event-view' :
            screenId === 'market' ? 'market-view' :
            `${screenId}-view`);
    }
};

// 注入导航动画CSS
(function injectNavigationStyles() {
    const style = document.createElement('style');
    style.textContent = `
/* ========== 导航切换动画 ========== */

/* 卷轴展开 - 从中心向上下打开 */
@keyframes nav-scroll-expand {
    from {
        clip-path: inset(50% 0 50% 0);
        opacity: 0;
    }
    to {
        clip-path: inset(0 0 0 0);
        opacity: 1;
    }
}

@keyframes nav-scroll-collapse {
    from {
        clip-path: inset(0 0 0 0);
        opacity: 1;
    }
    to {
        clip-path: inset(50% 0 50% 0);
        opacity: 0;
    }
}

/* 镜头推进/拉远 - 缩放配合透明度 */
@keyframes nav-lens-zoom {
    from {
        transform: scale(1.2);
        opacity: 0;
        filter: blur(4px);
    }
    to {
        transform: scale(1);
        opacity: 1;
        filter: blur(0);
    }
}

@keyframes nav-lens-unzoom {
    from {
        transform: scale(1);
        opacity: 1;
        filter: blur(0);
    }
    to {
        transform: scale(0.8);
        opacity: 0;
        filter: blur(4px);
    }
}

/* 水墨爆发 - 中心扩散 */
@keyframes nav-ink-burst {
    from {
        clip-path: circle(0% at center);
        opacity: 0;
    }
    to {
        clip-path: circle(100% at center);
        opacity: 1;
    }
}

@keyframes nav-ink-fade {
    from {
        clip-path: circle(100% at center);
        opacity: 1;
    }
    to {
        clip-path: circle(0% at center);
        opacity: 0;
    }
}

/* 淡入淡出 */
@keyframes nav-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes nav-fade-out {
    from { opacity: 1; }
    to { opacity: 0; }
}

/* 模态框弹出 - 从小变大上浮 */
@keyframes modal-pop-in {
    from {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.9);
    }
    to {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
    }
}

@keyframes modal-pop-out {
    from {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
    }
    to {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.9);
    }
}

/* 应用动画类 */
.nav-animation-enter {
    animation-fill-mode: forwards;
    animation-duration: var(--duration);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-animation-exit {
    animation-fill-mode: forwards;
    animation-duration: var(--duration);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-animation-scroll-expand.nav-animation-enter {
    animation-name: nav-scroll-expand;
    --duration: 400ms;
}

.nav-animation-scroll-collapse.nav-animation-exit {
    animation-name: nav-scroll-collapse;
    --duration: 350ms;
}

.nav-animation-lens-zoom.nav-animation-enter {
    animation-name: nav-lens-zoom;
    --duration: 500ms;
}

.nav-animation-lens-unzoom.nav-animation-exit {
    animation-name: nav-lens-unzoom;
    --duration: 500ms;
}

.nav-animation-ink-burst.nav-animation-enter {
    animation-name: nav-ink-burst;
    --duration: 450ms;
}

.nav-animation-ink-fade.nav-animation-exit {
    animation-name: nav-ink-fade;
    --duration: 450ms;
}

/* 游戏内菜单遮罩 */
.ingame-menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 4000;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 250ms ease;
}

.ingame-menu-overlay.visible {
    opacity: 1;
}

.ingame-menu-modal {
    background-color: var(--color-bg-secondary);
    border: var(--border-double);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
    padding: var(--space-2xl);
    min-width: 320px;
}

.ingame-menu-modal h3 {
    font-family: var(--font-serif);
    font-size: var(--text-heading-md);
    color: var(--color-text-primary);
    margin: 0 0 var(--space-lg);
    text-align: center;
}

.ingame-menu-buttons {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.ingame-menu-buttons button {
    width: 100%;
}

/* 返回按钮通用样式 */
.nav-back-btn {
    position: absolute;
    top: var(--space-md);
    left: var(--space-md);
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-sm) var(--space-md);
    background-color: rgba(253, 251, 247, 0.85);
    backdrop-filter: blur(4px);
    border: var(--border-default);
    border-radius: var(--radius-sm);
    font-family: var(--font-serif);
    font-size: var(--text-body);
    color: var(--color-text-primary);
    cursor: pointer;
    z-index: 100;
    transition: all var(--transition-fast);
}

.nav-back-btn:hover {
    background-color: rgba(158, 42, 43, 0.05);
    border-color: var(--color-accent-primary);
    transform: translateX(-2px);
}

.nav-close-btn {
    position: absolute;
    top: var(--space-md);
    right: var(--space-md);
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(253, 251, 247, 0.85);
    backdrop-filter: blur(4px);
    border: var(--border-default);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
}

.nav-close-btn:hover {
    background-color: rgba(158, 42, 43, 0.05);
    border-color: var(--color-accent-primary);
}

/* 为每个全屏界面提供定位上下文 */
.fullscreen-screen {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
}
`;
    document.head.appendChild(style);
})();

// DOM加载完成后自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        NavigationManager.init();
    });
} else {
    NavigationManager.init();
}

export default NavigationManager;
window.NavigationManager = NavigationManager;
