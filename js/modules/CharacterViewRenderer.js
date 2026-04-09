/**
 * 角色属性视图渲染模块
 * 渲染玩家角色的立绘、基础属性、技能列表
 */

window.CharacterViewRenderer = {
    /**
     * 渲染角色属性视图
     */
    render(gameState) {
        const container = document.getElementById('character-view');
        if (!container) return;

        const character = gameState.getPlayerCharacter();
        if (!character) return;

        const force = character.faction ? getForceTemplateByFactionId(character.faction) : null;
        const city = getCityTemplateById(character.locationCityId);

        // 基础属性中文名称映射
        const attributeNames = {
            leadership: '统帅',
            strength: '武力',
            intelligence: '智力',
            politics: '政治',
            charm: '魅力'
        };

        let html = `
            <div class="character-header">
        `;

        // 如果角色有立绘图片，显示图片
        if (character.image) {
            html += `<div class="character-portrait">
                <img src="${character.image}" alt="${character.name}">
            </div>`;
        } else {
            // 没有图片，继续用emoji
            html += `<div class="character-portrait" style="background-color: ${character.color}">
                ${character.emoji}
            </div>`;
        }

        html += `
                <div class="character-info">
                    <h1 class="character-name">${character.name}</h1>
                    <div class="character-role">身份：${gameState.getCurrentRole().name}</div>
                    <div class="character-affiliation">
                        ${force ? `势力：${force.name}` : '暂无势力'}
                        ${city ? `| 所在地：${city.name}` : ''}
                    </div>
                    <div class="attributes-section-inline">
                        <h3>属性</h3>
                        <div class="attributes-grid-inline">
        `;

        // 遍历所有五维基础属性
        const attributes = [
            { key: 'leadership', value: character.baseStats.leadership },
            { key: 'strength', value: character.baseStats.strength },
            { key: 'intelligence', value: character.baseStats.intelligence },
            { key: 'politics', value: character.baseStats.politics },
            { key: 'charm', value: character.baseStats.charm }
        ];

        attributes.forEach(attr => {
            const percentage = Math.min(100, (attr.value / 100) * 100);
            html += `
                <div class="attribute-item-inline">
                    <div class="attribute-name">${attributeNames[attr.key]}: ${attr.value}</div>
                    <div class="attribute-bar-container-inline">
                        <div class="attribute-bar" style="width: ${percentage}%">
                            <span class="attribute-value">${attr.value}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `
                        </div>
                    </div>
                </div>
            </div>

            <div class="skills-section">
                <h3>技能</h3>
                <div class="skills-grid">
        `;

        // 显示所有技能，只显示>=1级的技能在前，0级在后
        const allSkills = getAllSkills();
        const learnedSkills = allSkills.filter(s => (gameState.getSkillLevel(s.id) > 0));
        const unlearnedSkills = allSkills.filter(s => (gameState.getSkillLevel(s.id) === 0));

        [...learnedSkills, ...unlearnedSkills].forEach(skill => {
            const level = gameState.getSkillLevel(skill.id);
            const exp = gameState.skills[skill.id]?.exp || 0;
            const stars = '⭐'.repeat(level);
            const grayStars = '☆'.repeat(skill.maxLevel - level);
            const className = level > 0 ? 'skill-item learned' : 'skill-item unlearned';
            // 只要有经验并且未满级就显示经验条，0级也能看到进度
            const showExpBar = exp > 0 && level < skill.maxLevel;
            html += `
                <div class="${className}">
                    <div class="skill-info">
                        <span class="skill-name">${skill.name}</span>
                        <span class="skill-level">${stars}${grayStars}</span>
                    </div>
                    ${showExpBar ? `
                    <div class="skill-exp-bar">
                        <div class="skill-exp-fill" style="width: ${(exp / skill.expPerLevel) * 100}%"></div>
                    </div>
                    ` : ''}
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        container.innerHTML = html;
    }
};
