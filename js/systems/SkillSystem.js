/**
 * 技能经验系统 - 拆分自GameState
 * 负责技能经验加成、升级、身份晋升
 */
window.SkillSystem = {
    /**
     * 添加技能经验，处理升级
     * @param {GameState} gameState
     * @param {string} skillId
     * @param {number} exp
     * @returns {boolean} 是否升级成功
     */
    addSkillExp(gameState, skillId, exp) {
        const skillData = gameState.skills[skillId];
        const skillConfig = getSkillById(skillId);
        if (!skillData || !skillConfig || skillData.level >= skillConfig.maxLevel) {
            return false;
        }

        skillData.exp += exp;
        let leveledUp = false;

        // 检查是否升级
        while (skillData.level < skillConfig.maxLevel && skillData.exp >= skillConfig.expPerLevel) {
            skillData.exp -= skillConfig.expPerLevel;
            skillData.level++;
            leveledUp = true;
            const skillName = skillConfig.name;
            gameState.addLog(`${skillName} 升级了！当前等级：${skillData.level}`);
        }

        return leveledUp;
    },

    /**
     * 获取玩家技能等级
     */
    getSkillLevel(gameState, skillId) {
        return gameState.skills[skillId]?.level || 0;
    },

    /**
     * 检查身份晋升，如果功勋够了自动晋升
     * @param {GameState} gameState
     * @returns {Role|null} 新身份，如果没晋升返回null
     */
    checkRolePromotion(gameState) {
        const currentRole = getRoleById(gameState.currentRoleId);
        const newRole = getCurrentRoleByMerit(gameState.merit);
        if (newRole && newRole.order > currentRole.order) {
            // 晋升了
            gameState.currentRoleId = newRole.id;
            // 更新人物数据里的身份
            const player = gameState.getPlayerCharacter();
            if (player) {
                player.role = newRole.name;
            }
            gameState.addLog(`身份晋升！现在你是：${newRole.name}`);
            return newRole;
        }
        return null;
    },

    /**
     * 获取当前身份
     */
    getCurrentRole(gameState) {
        return getRoleById(gameState.currentRoleId);
    },

    /**
     * 检查今天是否是评定会日
     * 评定会规则：每隔两个月召开一次，固定在奇数月一日
     * @returns {boolean}
     */
    isEvaluationDay(gameState) {
        return gameState.day === 1 && (gameState.month % 2) === 1;
    },

    /**
     * 检查玩家是否在主公居城（评定会需要身处居城才能参加）
     * @returns {boolean}
     */
    isAtMainCity(gameState) {
        // 开局玩家在濠州，这是郭子兴军的本城
        // 后续可以根据玩家势力动态判断
        const player = gameState.getPlayerCharacter();
        if (player && player.faction) {
            const faction = getForceTemplateByFactionId(player.faction);
            if (faction && faction.initialCities.length > 0) {
                return gameState.currentCityId === faction.initialCities[0];
            }
        }
        // 默认判断：初始在濠州就是本城
        return gameState.currentCityId === 1;
    },

    /**
     * 根据任务模板和玩家技能计算目标值
     * @param {GameState} gameState
     * @param {MissionTemplate} missionTemplate
     * @returns {number}
     */
    calculateMissionTarget(gameState, missionTemplate) {
        // 基础目标 = 基础难度 * (1 + 技能加成)
        let baseTarget = missionTemplate.baseDifficulty * 10;

        // 根据关联技能等级加成目标
        if (missionTemplate.requiredSkills && missionTemplate.requiredSkills.length > 0) {
            let totalSkillLevel = 0;
            missionTemplate.requiredSkills.forEach(skillId => {
                totalSkillLevel += this.getSkillLevel(gameState, skillId);
            });
            // 每级技能增加5%目标（也增加完成后的经验奖励）
            baseTarget = Math.round(baseTarget * (1 + totalSkillLevel * 0.05));
        }

        return baseTarget;
    }
};
