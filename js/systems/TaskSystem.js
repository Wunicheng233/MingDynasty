/**
 * 主命系统 - 核心管理模块
 * Task System - Core management module
 *
 * 主命系统是游戏的核心推进器：
 * - 家臣阶段：接受主命 → 执行 → 结算功勋 → 晋升
 * - 君主阶段：发布主命 → 管理家臣 → 经营扩张 → 统一天下
 */

import SkillSystem from './SkillSystem.js';
import { getRoleById } from '../../data/roles.js';
import { getAllCards } from '../../data/cards.js';

const TaskSystem = {
    /**
     * 检查并处理评定会/朝会
     * @param {GameState} gameState
     * @returns {boolean} 是否触发了评定会
     */
    checkEvaluationAssembly(gameState) {
        if (!gameState.isEvaluationDay()) {
            return false;
        }

        const atMainCity = gameState.isAtMainCity();
        const isRuler = gameState.isPlayerRuler();

        if (!atMainCity) {
            // 不在主城已经在advanceDay中处理了惩罚
            return false;
        }

        // 触发评定会事件
        gameState.addLog(isRuler ? '今日召开朝会，商议军国大事。' : '今日召开评定会，主公发布新的主命。');

        // 如果有预定义的评定会剧情事件，会自动触发
        return true;
    },

    /**
     * 计算任务完成奖励
     * @param {GameState} gameState
     * @param {MissionTemplate} template
     * @param {number} actualProgress
     * @param {number} targetValue
     * @returns {Object} 奖励信息
     */
    calculateReward(gameState, template, actualProgress, targetValue) {
        let merit = template.baseReward;
        let success = actualProgress > 0;

        if (actualProgress >= targetValue * 2) {
            merit = merit * 2;
        } else if (actualProgress >= targetValue) {
            // 正常完成
        } else if (actualProgress > 0) {
            // 部分完成
            merit = Math.round(merit * (actualProgress / targetValue));
        } else {
            success = false;
            merit = -Math.round(template.baseReward * 0.3);
        }

        // 额外奖励来自关系
        const player = gameState.getPlayerCharacter();
        if (player && player.faction && success) {
            const extra = SkillSystem.calculateBonusMeritFromRelationship(gameState, player.faction);
            merit += extra;
        }

        return {
            success: success,
            merit: merit
        };
    },

    /**
     * 随机奖励卡片检查
     * @param {GameState} gameState
     * @param {MissionTemplate} template
     * @returns {Card|null} 奖励的卡片，如果没有返回null
     */
    checkCardReward(gameState, template) {
        // 高难度任务才有卡片奖励
        if (template.baseDifficulty < 3) {
            return null;
        }

        let cardReward = null;

        // 15%概率给技能卡
        if (Math.random() < 0.15) {
            const allCards = getAllCards();
            const possibleCards = allCards.filter(c =>
                c.type === 'skill' &&
                template.requiredSkills.includes(c.skillId) &&
                !gameState.hasCard(c.card_id)
            );
            if (possibleCards.length > 0) {
                cardReward = possibleCards[Math.floor(Math.random() * possibleCards.length)];
                gameState.acquireCard(cardReward.card_id);
                gameState.addLog(`完成任务获得技能卡：${cardReward.name}`);
            }
        }

        // 难度4+额外5%称号卡概率
        if (!cardReward && template.baseDifficulty >= 4 && Math.random() < 0.05) {
            const allCards = getAllCards();
            const titleCards = allCards.filter(c => c.type === 'title' && !gameState.hasCard(c.card_id));
            if (titleCards.length > 0) {
                cardReward = titleCards[Math.floor(Math.random() * titleCards.length)];
                gameState.acquireCard(cardReward.card_id);
                gameState.addLog(`完成任务获得称号卡：${cardReward.name}`);
            }
        }

        return cardReward;
    },

    /**
     * 获取任务完成后的技能经验奖励
     * @param {MissionTemplate} template
     * @returns {Object} {skillId: exp}
     */
    getSkillExpReward(template) {
        const expReward = {};
        if (template.requiredSkills && template.requiredSkills.length > 0) {
            template.requiredSkills.forEach(skillId => {
                const exp = template.baseDifficulty * 5;
                expReward[skillId] = exp;
            });
        }
        return expReward;
    },

    /**
     * 验证玩家是否可以接取此任务
     * @param {GameState} gameState
     * @param {MissionTemplate} template
     * @returns {boolean}
     */
    canAcceptMission(gameState, template) {
        const currentRole = getRoleById(gameState.currentRoleId);
        const minRank = getRoleById(template.minRank);

        if (!minRank) {
            return true;
        }

        return currentRole.order >= minRank.order;
    },

    /**
     * 获取任务分类中文名称
     * @param {string} category
     * @returns {string}
     */
    getCategoryName(category) {
        const names = {
            '军务': '军务',
            '政务': '政务',
            '外交': '外交',
            '调略': '调略',
            '特殊': '特殊',
            '内政': '内政',
            '军备': '军备',
            '国策': '国策'
        };
        return names[category] || category;
    },

    /**
     * 计算发布任务所需预算（君主模式）
     * @param {MissionTemplate} template
     * @returns {number}
     */
    calculatePublishCost(template) {
        return Math.round(template.baseReward * 0.5);
    },

    /**
     * 统计已完成任务数量
     * @param {GameState} gameState
     * @returns {Object} 按分类统计
     */
    getCompletedStats(gameState) {
        // 这里可以从存档中读取统计数据
        // 预留接口，后续实现
        return {
            total: 0,
            byCategory: {}
        };
    },

    /**
     * 考成法考核：检查任务完成情况，奖惩官员
     * 明朝张居正考成法特色机制
     * @param {GameState} gameState
     * @returns {Object} 考核结果
     */
    kaochengAssessment(gameState) {
        // 预留完整考成法实现
        // 君主模式下，定期考核发布给家臣的任务完成情况
        // 政绩优异者晋升，不作为者降职罢免
        const result = {
            promoted: [],
            demoted: [],
            dismissed: []
        };
        return result;
    }
};

export default TaskSystem;
window.TaskSystem = TaskSystem;
