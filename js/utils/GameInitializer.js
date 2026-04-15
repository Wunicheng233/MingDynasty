/**
 * 游戏初始化器
 * 处理游戏初始数据的创建：默认技能、初始卡片、默认亲密度关系
 */

window.GameInitializer = {
    /**
     * 初始化默认技能数据结构
     * 从玩家角色模板的初始技能复制过来
     */
    initDefaultSkills(playerCharacter) {
        const skills = {};
        if (!playerCharacter || !playerCharacter.initialSkills) {
            return skills;
        }

        for (const [skillId, level] of Object.entries(playerCharacter.initialSkills)) {
            skills[skillId] = {
                level: level,
                exp: 0
            };
        }
        return skills;
    },

    /**
     * 初始化已收集卡片集合
     * 从玩家角色模板的初始卡片复制过来
     */
    initCollectedCards(playerCharacter) {
        const collected = {};
        if (!playerCharacter || !playerCharacter.initialCards) {
            return collected;
        }

        playerCharacter.initialCards.forEach(cardId => {
            collected[cardId] = true;
        });

        // 如果有专属秘传卡，也加上
        if (playerCharacter.exclusiveSecretCard) {
            collected[playerCharacter.exclusiveSecretCard] = true;
        }

        return collected;
    },

    /**
     * 初始化默认亲密度关系网
     * 所有NPC初始亲密度为0（中立）
     */
    initDefaultRelationships() {
        const relationships = {};
        const allTemplates = getAllCharacterTemplates();

        allTemplates.forEach(template => {
            if (template.id === 1) return; // 跳过玩家自己

            const key = `1_${template.id}`;
            // 朱元璋和马秀英初始亲密
            if (template.id === 6) { // 马秀英
                relationships[key] = 3;
            } else if (template.faction === '郭子兴军' || template.faction === 'GUO') {
                relationships[key] = 1;
            } else {
                relationships[key] = 0;
            }
        });

        return relationships;
    },

    /**
     * 加载战斗胜利统计
     */
    initBattleWins() {
        return {
            total: 0,
            naval: 0,
            field: 0,
            siege: 0,
            firearm: 0
        };
    },

    /**
     * 初始化事件系统数据
     */
    initEventData() {
        return {
            eventFlags: {},                 // 事件标记（已经触发过的事件选项）
            triggeredEvents: new Set()      // 已经触发过的事件ID集合
        };
    }
};
