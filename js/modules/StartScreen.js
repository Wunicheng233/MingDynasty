/**
 * 《洪武立志传》启动界面
 * 按照UI/02-启动界面.md设计规范实现
 */

import SaveManager from '../utils/SaveManager.js';

const StartScreen = {
    container: null,
    gameVersion: 'v1.0.0',
    studioName: '洪武工坊',

    // 初始化
    init() {
        this.container = document.getElementById('start-screen');
        if (!this.container) {
            console.error('StartScreen container not found');
            return;
        }
        this.render();
        this.bindEvents();
    },

    // 渲染界面
    render() {
        const hasSave = SaveManager.hasAnySave();

        const html = `
            <div class="start-screen-content">
                <div class="title-area">
                    <div class="game-title-image">
                        <img src="images/ui/title_hongwu_ligend_800x200.png" alt="洪武立志传" class="title-img" />
                        <img src="images/ui/stamp_chizao_80x80.png" alt="敕造" class="stamp-img stamp-imperial" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';" />
                        <span class="stamp stamp-imperial-fallback">敕造</span>
                    </div>
                </div>

                <div class="scroll-container">
                    <div class="scroll-inner">
                        <button class="btn-primary start-btn" id="btn-new-game">
                            开启新档
                        </button>
                        <button class="btn-secondary continue-btn" id="btn-continue">
                            继续旧档
                        </button>
                        <button class="btn-text settings-btn" id="btn-settings">
                            游戏设置
                        </button>
                    </div>
                </div>

                <div class="footer-info">
                    <img src="images/ui/stamp_studio_120x40.png" alt="${this.studioName}" class="stamp-img stamp-studio" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';" />
                    <div class="stamp stamp-studio stamp-gold stamp-fallback">${this.studioName}</div>
                    <div class="version">${this.gameVersion}</div>
                </div>
            </div>
        `;

        this.container.innerHTML = html;
    },

    // 绑定事件
    bindEvents() {
        const newGameBtn = document.getElementById('btn-new-game');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                this.startNewGame();
            });
        }

        const continueBtn = document.getElementById('btn-continue');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                this.openLoadGame();
            });
        }

        const settingsBtn = document.getElementById('btn-settings');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.openSettings();
            });
        }

        // ESC键退出确认（桌面端）
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible()) {
                this.confirmExit();
            }
        });
    },

    // 显示启动界面
    show() {
        this.container.style.display = 'block';
        // 添加入场动画类，CSS触发动画
        this.container.classList.add('animate-in');
    },

    // 隐藏启动界面
    hide() {
        this.container.style.display = 'none';
    },

    // 判断是否可见
    isVisible() {
        return this.container.style.display !== 'none';
    },

    // 开启新游戏
    startNewGame() {
        this.hide();
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.style.display = 'flex';
        }
        // 通知主游戏开始新游戏
        if (window.GameMain && typeof window.GameMain.startNewGame === 'function') {
            window.GameMain.startNewGame();
        } else if (window.main && typeof window.main === 'function') {
            window.main();
        }
    },

    // 打开读档界面
    openLoadGame() {
        this.hide();
        if (window.SaveLoadUI) {
            SaveLoadUI.show('load');
        }
    },

    // 打开设置
    openSettings() {
        this.hide();
        if (window.SettingsUI) {
            SettingsUI.showModal();
        }
    },

    // 确认退出
    confirmExit() {
        if (confirm('确定要退出游戏吗？')) {
            // 在浏览器环境下，关闭窗口
            window.close();
        }
    }
};

// 添加启动界面样式
(function addStartScreenStyles() {
    const style = document.createElement('style');
    style.textContent = `
.start-screen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2000;
    background-color: var(--color-bg-primary);
    /* 如果背景图存在就叠加，否则只使用纯色宣纸底 */
    background-image: url('images/backgrounds/bg_start_ink_mountain_1920x1080.jpg');
    background-blend-mode: overlay;
    background-size: cover;
    background-position: center;
    display: none;
}

.start-screen-content {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
}

.title-area {
    text-align: center;
    margin-bottom: 80px;
    animation: fadeInDown 800ms ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
}

.game-title-image {
    position: relative;
    display: inline-block;
    margin-bottom: 24px;
}

.title-img {
    display: block;
    width: 800px;
    max-width: 90vw;
    height: auto;
}

.game-title-image .stamp-imperial,
.game-title-image .stamp-img.stamp-imperial {
    position: absolute;
    bottom: -15px;
    right: -80px;
}

.game-title-image .stamp-img.stamp-imperial {
    width: 80px;
    height: 80px;
}

.game-title-image .stamp-imperial-fallback {
    position: absolute;
    bottom: -15px;
    right: -80px;
    font-size: var(--text-caption);
    padding: 8px 12px;
    display: none;
}

.title-area {
    text-align: center;
    margin-bottom: 40px;
    animation: fadeInDown 800ms ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
}

.scroll-container {
    background: rgba(253, 251, 247, 0.7);
    backdrop-filter: blur(4px);
    border: var(--border-double);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    padding: 56px 96px;
    animation: scrollReveal 600ms ease-out forwards;
    clip-path: inset(0 0 100% 0);
    animation-delay: 400ms;
}

.scroll-inner {
    display: flex;
    flex-direction: column;
    gap: var(--space-xl);
    align-items: center;
}

.scroll-inner .btn-primary,
.scroll-inner .btn-secondary {
    width: 320px;
    padding: 18px 36px;
    font-size: 22px;
}

.scroll-inner .btn-text {
    font-size: 20px;
}

.footer-info {
    position: absolute;
    bottom: 40px;
    left: 40px;
    right: 40px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    opacity: 0;
    animation: fadeIn 500ms ease-out forwards;
    animation-delay: 800ms;
}

.footer-info .version {
    font-family: var(--font-mono);
    font-size: var(--text-body-sm);
    color: var(--color-text-tertiary);
}

.stamp-studio.stamp-img {
    height: 40px;
    width: auto;
    opacity: 0.6;
}

.stamp-studio.stamp-fallback {
    opacity: 0.6;
    padding: 6px 12px;
    font-size: var(--text-body-sm);
    display: none;
}

/* 响应式适配 */
@media (max-width: 768px) {
    .game-title {
        font-size: 48px;
        letter-spacing: 8px;
    }

    .game-title .stamp-imperial {
        display: none;
    }

    .title-subtitle {
        font-size: 20px;
    }

    .scroll-container {
        padding: 32px 40px;
        width: 90%;
    }

    .scroll-inner .btn-primary,
    .scroll-inner .btn-secondary {
        width: 260px;
        padding: 12px 24px;
        font-size: 18px;
    }

    .title-area {
        margin-bottom: 50px;
    }
}

@media (max-width: 640px) {
    .game-title {
        font-size: 36px;
        letter-spacing: 4px;
    }

    .scroll-container {
        padding: 24px 28px;
    }

    .scroll-inner .btn-primary,
    .scroll-inner .btn-secondary {
        width: 220px;
    }
}

.animate-in .title-area {
    opacity: 0;
}
`;
    document.head.appendChild(style);
})();

// DOM加载完成后自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        StartScreen.init();
    });
} else {
    StartScreen.init();
}

export default StartScreen;
window.StartScreen = StartScreen;
