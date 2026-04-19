/**
 * 主命任务系统 - 拆分自GameState
 * 负责任务接受、超时检查、完成结算
 */

import { getMissionTemplateById, getAvailableMissionsForRole } from '../../data/tasks.js';
import { getAllCards } from '../../data/cards.js';
import SkillSystem from './SkillSystem.js';

const MissionSystem = {
    /**
     * 接受一个新任务
     * @param {GameState} gameState
     * @param {string} missionId
     */
    acceptMission(gameState, missionId) {
        const missionTemplate = getMissionTemplateById(missionId);
        if (!missionTemplate) return false;

        // 如果已有任务，不接受新的
        if (gameState.currentTask) {
            gameState.addLog('你已经有一个未完成的主命，请先完成再接受新的。');
            return false;
        }

        gameState.currentTask = {
            templateId: missionId,
            progress: 0,
            startedAtDay: gameState.day,
            deadlineDay: gameState.day + missionTemplate.timeLimitDays,
            timeLimitDays: missionTemplate.timeLimitDays,
            targetParam: missionTemplate.targetParam,
            completionType: missionTemplate.completionType,
            gameType: missionTemplate.gameType,
            targetValue: SkillSystem.calculateMissionTarget(gameState, missionTemplate),
            startedAt: `${gameState.year}-${gameState.month}-${gameState.day}`
        };

        gameState.addLog(`接受主命：${missionTemplate.name}，限时${missionTemplate.timeLimitDays}天完成`);
        gameState.currentScene = GameScene.TASK_LIST;
        return true;
    },

    /**
     * 检查当前主命是否超时
     * @param {GameState} gameState
     * @returns {boolean} true表示已超时
     */
    checkMissionTimeout(gameState) {
        if (!gameState.currentTask) {
            return false;
        }
        return gameState.day > gameState.currentTask.deadlineDay;
    },

    /**
     * 获取当前主命剩余天数
     * @param {GameState} gameState
     * @returns {number}
     */
    getRemainingDays(gameState) {
        if (!gameState.currentTask) {
            return 0;
        }
        return Math.max(0, gameState.currentTask.deadlineDay - gameState.day);
    },

    /**
     * 完成当前主命，进行结算
     * @param {GameState} gameState
     * @param {boolean} success - 是否成功完成
     * @param {number} actualProgress - 实际完成进度
     * @param {string} gameType - 调用的小游戏类型，用于验证任务匹配
     * @returns {Object} 结算结果 {meritGained: number, skillsExp: Object}
     */
    completeMission(gameState, success, actualProgress = 0, gameType = null) {
        if (!gameState.currentTask) {
            return { success: false, meritGained: 0 };
        }

        const template = getMissionTemplateById(gameState.currentTask.templateId);
        if (!template) {
            gameState.currentTask = null;
            return { success: false, meritGained: 0 };
        }

        // 检查任务是否匹配小游戏类型
        if (template.completionType === 'external' && gameType && template.gameType !== gameType) {
            // 任务不匹配当前小游戏，不完成
            return { success: false, meritGained: 0, message: '任务类型不匹配' };
        }

        let result = {
            success: success,
            meritGained: 0,
            skillsExp: {},
            newCard: null
        };

        if (success) {
            // 计算功勋奖励
            let merit = template.baseReward;

            // 根据完成度倍率奖励
            if (actualProgress >= gameState.currentTask.targetValue * 2) {
                merit = merit * 2;
                gameState.addLog(`超额完成目标！获得双倍功勋：${merit}`);
            } else if (actualProgress >= gameState.currentTask.targetValue) {
                gameState.addLog(`完成目标！获得功勋：${merit}`);
            } else {
                // 未达标但仍算部分完成，按比例给功勋
                merit = Math.round(merit * (actualProgress / gameState.currentTask.targetValue));
                gameState.addLog(`未完全达成目标，获得部分功勋：${merit}`);
            }

            gameState.merit += merit;
            result.meritGained = merit;

            // 给关联技能增加经验
            if (template.requiredSkills && template.requiredSkills.length > 0) {
                template.requiredSkills.forEach(skillId => {
                    // 基础经验奖励 = 难度 * 5
                    const exp = template.baseDifficulty * 5;
                    SkillSystem.addSkillExp(gameState, skillId, exp);
                    result.skillsExp[skillId] = exp;
                });
            }

            // 检查是否有卡片奖励（某些任务完成后给卡片）
            // 高难度任务有概率奖励技能卡或称号卡
            let cardReward = null;
            if (template.baseDifficulty >= 3 && Math.random() < 0.15) {
                // 15%概率给技能卡（难度>=3）
                const allCards = getAllCards();
                const possibleCards = allCards.filter(c =>
                    c.type === 'skill' &&
                    template.requiredSkills.includes(c.skillId) &&
                    !gameState.hasCard(c.cardId)
                );
                if (possibleCards.length > 0) {
                    const randomCard = possibleCards[Math.floor(Math.random() * possibleCards.length)];
                    gameState.acquireCard(randomCard.cardId);
                    cardReward = randomCard;
                    result.newCard = randomCard;
                    gameState.addLog(`完成任务获得技能卡：${randomCard.name}`);
                }
            }
            // 难度4以上有5%概率获得称号卡
            if (template.baseDifficulty >= 4 && Math.random() < 0.05) {
                const allCards = getAllCards();
                const titleCards = allCards.filter(c => c.type === 'title' && !gameState.hasCard(c.cardId));
                if (titleCards.length > 0) {
                    const randomCard = titleCards[Math.floor(Math.random() * titleCards.length)];
                    gameState.acquireCard(randomCard.cardId);
                    cardReward = randomCard;
                    result.newCard = randomCard;
                    gameState.addLog(`完成任务获得称号卡：${randomCard.name}`);
                }
            }

            // 额外功勋奖励（来自主公亲密度和重臣好感）
            const player = gameState.getPlayerCharacter();
            if (player && player.faction) {
                const extraBonus = SkillSystem.calculateBonusMeritFromRelationship(gameState, player.faction);
                if (extraBonus > 0) {
                    gameState.merit += extraBonus;
                    result.meritGained += extraBonus;
                    gameState.addLog(`主公器重，额外获得功勋：+${extraBonus}`);
                }
            }

            gameState.addLog(`主命【${template.name}】完成，功勋+${result.meritGained}`);

            // 检查身份晋升
            const newRole = SkillSystem.checkRolePromotion(gameState);
            if (newRole) {
                result.promotion = newRole;
            }
        } else {
            // 任务失败，扣除部分功勋
            const penalty = Math.round(template.baseReward * 0.3);
            gameState.merit = Math.max(0, gameState.merit - penalty);
            gameState.addLog(`主命【${template.name}】失败，扣除功勋${penalty}`);
            result.meritGained = -penalty;
        }

        // 清空当前任务
        gameState.currentTask = null;

        return result;
    },

    /**
     * 获取可接的主命列表（根据当前身份筛选）
     * @param {GameState} gameState
     * @returns {MissionTemplate[]}
     */
    getAvailableMissions(gameState) {
        return getAvailableMissionsForRole(gameState.currentRoleId);
    },

    /**
     * 按分类获取可接主命
     * @param {GameState} gameState
     * @param {string} category
     * @returns {MissionTemplate[]}
     */
    getAvailableMissionsByCategory(gameState, category) {
        const allAvailable = this.getAvailableMissions(gameState);
        return allAvailable.filter(m => m.category === category);
    }
};

export default MissionSystem;
window.MissionSystem = MissionSystem;
