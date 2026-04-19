/**
 * 人物渲染工具模块
 * 提取各个渲染器共享的重复渲染逻辑，避免代码重复
 */

import { getAllSkills } from '../../data/skills.js';

const CharacterRendererUtils = {
    /**
     * 基础属性中文名称映射
     */
    attributeNames: {
        leadership: '统帅',
        strength: '武力',
        politics: '政治',
        intelligence: '智力',
        charm: '魅力'
    },

    /**
     * 获取属性中文名称
     * @param {string} key 属性key
     * @returns {string} 中文名称
     */
    getAttributeName(key) {
        return this.attributeNames[key] || key;
    },

    /**
     * 构建五维属性数组
     * @param {Object} baseStats 基础属性对象 {leadership, strength, ...}
     * @returns {Array<{key: string, value: number}>} 属性数组
     */
    getOrderedAttributes(baseStats) {
        return [
            { key: 'leadership', value: baseStats.leadership },
            { key: 'strength', value: baseStats.strength },
            { key: 'intelligence', value: baseStats.intelligence },
            { key: 'politics', value: baseStats.politics },
            { key: 'charm', value: baseStats.charm }
        ];
    },

    /**
     * 计算属性条百分比（最大100）
     * @param {number} value 属性值
     * @returns {number} 百分比
     */
    getAttributePercentage(value) {
        return Math.min(100, (value / 100) * 100);
    },

    /**
     * 生成技能等级星级显示
     * @param {number} level 当前等级
     * @param {number} maxLevel 最大等级
     * @returns {string} 星级HTML（⭐+☆）
     */
    getSkillStars(level, maxLevel) {
        const stars = '⭐'.repeat(level);
        const grayStars = '☆'.repeat(maxLevel - level);
        return stars + grayStars;
    },

    /**
     * 获取人物立绘路径
     * @param {string|null} portrait 立绘ID
     * @param {number} rarity 人物稀有度(1-5)，用于确定子目录
     * @param {boolean} isNpc 是否是NPC（武馆师傅等）
     * @returns {string|null} 完整路径
     */
    getPortraitPath(portrait, rarity = 5, isNpc = false) {
        if (!portrait) return null;

        let subDir;
        if (isNpc) {
            subDir = 'npc';
        } else if (rarity >= 5) {
            subDir = '5star';
        } else if (rarity >= 4) {
            subDir = '4star';
        } else if (rarity >= 3) {
            subDir = '3star';
        } else {
            subDir = '';
        }

        if (subDir) {
            return `images/characters/${subDir}/${portrait}.png`;
        }
        return `images/characters/${portrait}.png`;
    },

    /**
     * 生成属性区域HTML
     * @param {Object} baseStats 基础属性对象
     * @returns {string} HTML字符串
     */
    generateAttributesHtml(baseStats) {
        const attributes = this.getOrderedAttributes(baseStats);
        let html = `
            <div class="social-attributes">
                <h3>基础属性</h3>
                <div class="attributes-grid">
        `;

        attributes.forEach(attr => {
            const percentage = this.getAttributePercentage(attr.value);
            html += `
                <div class="attribute-item">
                    <div class="attribute-name">${this.getAttributeName(attr.key)}: ${attr.value}</div>
                    <div class="attribute-bar-container">
                        <div class="attribute-bar" style="width: ${percentage}%">
                            <span class="attribute-value">${attr.value}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `</div></div>`;
        return html;
    },

    /**
     * 生成技能区域HTML（只显示已学习的技能）
     * @param {Object} npcSkills NPC技能 {skillId: level}
     * @returns {string} HTML字符串
     */
    generateSkillsHtml(npcSkills) {
        const allSkills = getAllSkills();
        let hasSkills = false;
        let skillsHtml = '';

        for (const skill of allSkills) {
            const level = npcSkills[skill.id] || 0;
            if (level > 0) {
                hasSkills = true;
                const stars = this.getSkillStars(level, skill.maxLevel);
                skillsHtml += `
                    <div class="skill-item learned">
                        <div class="skill-info">
                            <span class="skill-name">${skill.name}</span>
                            <span class="skill-level">${stars}</span>
                        </div>
                    </div>
                `;
            }
        }

        if (!hasSkills) {
            return '';
        }

        return `
            <div class="social-skills">
                <h3>技能等级</h3>
                <div class="skills-grid">
            ${skillsHtml}
                </div>
            </div>
        `;
    }
};

export default CharacterRendererUtils;
window.CharacterRendererUtils = CharacterRendererUtils;
