/**
 * 人物详情/角色属性视图渲染模块
 * 按照UI/07-人物详情界面.md设计规范重构
 * 渲染玩家角色（或NPC）的立绘、五维属性、技能列表、列传
 */

import { getAllSkills } from '../../data/skills.js';
import { getForceByLeader, getFactionById } from '../../data/forces.js';
import CharacterRendererUtils from '../utils/CharacterRendererUtils.js';

const CharacterViewRenderer = {
    // 属性颜色映射 - 根据设计文档
    attributeColors: {
        lead: 'var(--color-accent-blue)',      // 统率 - 黛蓝
        might: 'var(--color-accent-primary)',  // 武力 - 朱砂
        intl: 'var(--color-accent-green)',     // 智力 - 青碧
        poli: 'var(--color-accent-gold)',      // 政治 - 古铜金
        char: 'var(--color-accent-orange)'     // 魅力 - 赭石
    },

    // 属性名称映射
    attributeNames: {
        lead: '统率',
        might: '武力',
        intl: '智力',
        poli: '政治',
        char: '魅力'
    },

    /**
     * 渲染角色属性视图（主界面左侧，玩家自己）
     */
    render(gameState) {
        // 确保容器存在
        let container = document.getElementById('character-view');
        if (!container) {
            container = document.createElement('div');
            container.id = 'character-view';
            container.className = 'character-view';
            document.getElementById('main-display').appendChild(container);
        }

        const character = gameState.getPlayerCharacter();
        if (!character) return;

        const force = character.factionId ? getFactionById(character.factionId) : null;
        const city = character.locationCityId ? gameState.getCityById(character.locationCityId) : null;
        const role = gameState.getCurrentRole();

        // 获取五维属性
        const attrs = this.getOrderedAttributes(character.baseStats);

        // 获取技能
        const allSkills = getAllSkills();
        const learnedSkills = allSkills.filter(s => gameState.getSkillLevel(s.id) > 0);
        const unlearnedSkills = allSkills.filter(s => gameState.getSkillLevel(s.id) === 0);

        // 获取列传
        const biography = character.biography || this.getDefaultBiography(character);

        let html = `
            <div class="character-detail-container">
                <div class="character-top-section">
                    <!-- 左侧立绘区 -->
                    <div class="portrait-col">
                        <div class="portrait-container">
                            ${this.renderPortrait(character)}
                        </div>
                    </div>

                    <!-- 右侧信息区 -->
                    <div class="info-col">
                        <div class="basic-info">
                            <div class="name-row">
                                <h1 class="character-name">${character.name}</h1>
                                ${character.courtesyName ? `<span class="courtesy-name">字 ${character.courtesyName}</span>` : ''}
                            </div>
                            <div class="position-row">
                                ${role ? `<span class="badge-cinnabar">${role.rank} · ${role.name}</span>` : ''}
                            </div>
                            <div class="affiliation-row">
                                ${force ? `<span>🏯 ${force.name}</span>` : ''}
                                ${city ? `<span>📍 ${city.name}</span>` : ''}
                            </div>
                        </div>

                        <!-- 五维属性 -->
                        <div class="attributes-section">
                            <h3 class="section-title">五维能力</h3>
                            <div class="attributes-list">
        `;

        attrs.forEach(attr => {
            const percentage = Math.min(100, Math.round((attr.value / 100) * 100));
            const color = this.attributeColors[attr.key];
            html += `
                <div class="attribute-row">
                    <span class="attribute-name" style="color: ${color}">${this.attributeNames[attr.key]}</span>
                    <div class="attribute-bar-container">
                        <div class="attribute-bar-fill" style="width: ${percentage}%; background-color: ${color}"></div>
                    </div>
                    <span class="attribute-value">${attr.value}</span>
                </div>
            `;
        });

        html += `
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 列传区 -->
                <div class="biography-section">
                    <h3 class="section-title">
                        <span class="stamp">传</span>
                        列传
                    </h3>
                    <div class="biography-content">${biography}</div>
                </div>

                <!-- 技能区 -->
                <div class="skills-section">
                    <h3 class="section-title">
                        <span class="stamp stamp-cinnabar">艺</span>
                        习得技能
                    </h3>
                    <div class="skills-grid">
        `;

        // 显示学会的技能
        learnedSkills.forEach(skill => {
            const level = gameState.getSkillLevel(skill.id);
            const exp = gameState.skills[skill.id]?.exp || 0;
            const stars = CharacterRendererUtils.getSkillStars(level, skill.maxLevel);
            const showExpBar = exp > 0 && level < skill.maxLevel;

            html += `
                <div class="skill-item learned">
                    <div class="skill-info">
                        <span class="skill-name">${skill.name}</span>
                        <span class="skill-level">${stars}</span>
                    </div>
                    ${showExpBar ? `
                    <div class="skill-exp-bar">
                        <div class="skill-exp-fill" style="width: ${(exp / skill.expPerLevel) * 100}%"></div>
                    </div>
                    ` : ''}
                </div>
            `;
        });

        // 如果没学到什么技能，提示
        if (learnedSkills.length === 0) {
            html += `<div class="no-skills-hint">尚未习得任何技能</div>`;
        }

        // 未学会的技能折叠或只显示几个
        if (unlearnedSkills.length > 0) {
            html += `
                <div class="unlearned-skills-section">
                    <h4 class="unlearned-title">未习得技能</h4>
                    <div class="skills-grid unlearned">
            `;
            unlearnedSkills.slice(0, 8).forEach(skill => {
                html += `
                    <div class="skill-item unlearned">
                        <div class="skill-info">
                            <span class="skill-name">${skill.name}</span>
                            <span class="skill-level">${CharacterRendererUtils.getSkillStars(0, skill.maxLevel)}</span>
                        </div>
                    </div>
                `;
            });
            html += `</div></div>`;
        }

        html += `
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
        container.style.display = 'block';

        this.ensureStylesInjected();
    },

    // 获取排序后的属性
    getOrderedAttributes(stats) {
        const order = ['lead', 'might', 'intl', 'poli', 'char'];
        return order.map(key => ({
            key,
            value: stats[key] || 0
        }));
    },

    // 渲染立绘
    renderPortrait(character) {
        if (character.portrait || character.image) {
            const src = character.portrait || character.image;
            return `<img src="${src}" alt="${character.name}" class="portrait-img">`;
        }
        // 占位
        const color = character.color || 'var(--color-accent-primary)';
        const emoji = character.emoji || '👤';
        return `
            <div class="portrait-placeholder" style="background-color: ${color}">
                <span class="placeholder-emoji">${emoji}</span>
            </div>
        `;
    },

    // 获取默认传记
    getDefaultBiography(character) {
        return `${character.name}，是大明王朝初年一位冉冉升起的新星，心怀大志，正欲在这乱世中闯出一番事业。`;
    },

    // 注入样式
    stylesInjected: false,
    ensureStylesInjected() {
        if (this.stylesInjected) return;
        this.stylesInjected = true;

        const style = document.createElement('style');
        style.textContent = `
#character-view {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 130px;
    overflow-y: auto;
    padding: var(--space-md);
}

.character-detail-container {
    max-width: 900px;
    margin: 0 auto;
}

.character-top-section {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: var(--space-xl);
    margin-bottom: var(--space-xl);
}

.portrait-col {
    display: flex;
    align-items: center;
    justify-content: center;
}

.portrait-container {
    position: relative;
    background: radial-gradient(circle, rgba(158, 42, 43, 0.15) 0%, rgba(158, 42, 43, 0) 70%);
    padding: var(--space-lg);
    border-radius: var(--radius-lg);
}

.portrait-img {
    max-width: 280px;
    max-height: 400px;
    object-fit: contain;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
}

.portrait-placeholder {
    width: 200px;
    height: 280px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
}

.placeholder-emoji {
    font-size: 80px;
}

.info-col {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
}

.basic-info {
    background-color: var(--color-bg-secondary);
    border: var(--border-default);
    border-radius: var(--radius-md);
    padding: var(--space-lg);
    box-shadow: var(--shadow-md);
}

.name-row {
    display: flex;
    align-items: baseline;
    gap: var(--space-md);
    margin-bottom: var(--space-sm);
}

.character-name {
    font-family: var(--font-serif);
    font-size: var(--text-heading-lg);
    color: var(--color-text-primary);
    margin: 0;
}

.courtesy-name {
    font-family: var(--font-serif);
    font-size: var(--text-body);
    color: var(--color-accent-blue);
}

.position-row {
    margin-bottom: var(--space-sm);
}

.affiliation-row {
    display: flex;
    gap: var(--space-md);
    font-family: var(--font-serif);
    font-size: var(--text-body-sm);
    color: var(--color-text-secondary);
}

.attributes-section {
    background-color: var(--color-bg-secondary);
    border: var(--border-default);
    border-radius: var(--radius-md);
    padding: var(--space-lg);
    box-shadow: var(--shadow-md);
}

.section-title {
    font-family: var(--font-serif);
    font-size: var(--text-heading-sm);
    color: var(--color-text-primary);
    margin: 0 0 var(--space-md);
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.attributes-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
}

.attribute-row {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.attribute-name {
    font-family: var(--font-serif);
    font-size: var(--text-body);
    width: 48px;
    text-align: left;
    font-weight: bold;
}

.attribute-bar-container {
    flex: 1;
    height: 8px;
    background-color: var(--color-border-default);
    border-radius: 4px;
    overflow: hidden;
}

.attribute-bar-fill {
    height: 100%;
    border-radius: 4px;
    transition: width var(--transition-fast);
}

.attribute-value {
    font-family: var(--font-mono);
    font-size: var(--text-body-sm);
    color: var(--color-text-primary);
    width: 28px;
    text-align: right;
}

.biography-section {
    background-color: var(--color-bg-secondary);
    border: var(--border-double);
    border-radius: var(--radius-md);
    padding: var(--space-lg);
    box-shadow: var(--shadow-md);
    margin-bottom: var(--space-xl);
}

.biography-content {
    font-family: var(--font-serif);
    font-size: var(--text-body);
    line-height: 1.8;
    color: var(--color-text-primary);
}

.biography-content::first-letter {
    font-size: 3em;
    font-weight: bold;
    color: var(--color-accent-primary);
    float: left;
    line-height: 1;
    margin-right: 8px;
    margin-top: -4px;
}

.skills-section {
    background-color: var(--color-bg-secondary);
    border: var(--border-default);
    border-radius: var(--radius-md);
    padding: var(--space-lg);
    box-shadow: var(--shadow-md);
}

.skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: var(--space-sm);
}

.skill-item {
    background-color: rgba(253, 251, 247, 0.5);
    border: var(--border-default);
    border-radius: var(--radius-sm);
    padding: 6px 10px;
    transition: all var(--transition-fast);
}

.skill-item.learned {
    background-color: rgba(58, 82, 107, 0.1);
    border-color: rgba(58, 82, 107, 0.3);
}

.skill-item.learned:hover {
    background-color: rgba(58, 82, 107, 0.15);
    border-color: var(--color-accent-blue);
}

.skill-item.unlearned {
    opacity: 0.5;
}

.skill-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.skill-name {
    font-family: var(--font-serif);
    font-size: var(--text-body-sm);
    color: var(--color-text-primary);
}

.skill-level {
    font-family: var(--font-mono);
    color: var(--color-text-secondary);
}

.skill-exp-bar {
    height: 4px;
    background-color: var(--color-border-default);
    border-radius: 2px;
    margin-top: 4px;
    overflow: hidden;
}

.skill-exp-fill {
    height: 100%;
    background-color: var(--color-accent-blue);
}

.unlearned-skills-section {
    margin-top: var(--space-md);
    padding-top: var(--space-md);
    border-top: var(--border-default);
}

.unlearned-title {
    font-family: var(--font-serif);
    font-size: var(--text-body-sm);
    color: var(--color-text-secondary);
    margin: 0 0 var(--space-sm);
}

.no-skills-hint {
    grid-column: 1 / -1;
    text-align: center;
    padding: var(--space-xl);
    color: var(--color-text-tertiary);
    font-family: var(--font-serif);
}

.stamp {
    font-size: var(--text-caption);
    padding: 2px 6px;
}

/* 响应式适配 */
@media (max-width: 768px) {
    .character-top-section {
        grid-template-columns: 1fr;
    }

    .portrait-container {
        padding: var(--space-md);
    }

    .portrait-img {
        max-width: 200px;
        max-height: 280px;
    }

    .skills-grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    }

    #character-view {
        padding: var(--space-sm);
    }
}

@media (max-width: 480px) {
    .skills-grid {
        grid-template-columns: 1fr 1fr;
    }
}
`;
        document.head.appendChild(style);
    }
};

export default CharacterViewRenderer;
window.CharacterViewRenderer = CharacterViewRenderer;
