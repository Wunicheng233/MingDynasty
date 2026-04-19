/**
 * 社交关系系统 - 拆分自GameState
 * 负责亲密度管理、送礼、茶会、宴饮、切磋、结义、婚姻
 */

import { getCharacterTemplateByNumId, getAllCharacterTemplates } from '../../data/characters.js';
import { getCardById } from '../../data/cards.js';
import { getMissionTemplateById } from '../../data/tasks.js';
import CardSystem from './CardSystem.js';

const SocialSystem = {
    /**
     * 获取关系key
     */
    getRelationshipKey(gameState, characterId) {
        return `${gameState.playerCharacterId}_${characterId}`;
    },

    /**
     * 获取玩家与某NPC的亲密度
     * @param {GameState} gameState
     * @param {number} characterId
     * @returns {number} 亲密度 -4 ~ +5
     */
    getIntimacy(gameState, characterId) {
        const key = this.getRelationshipKey(gameState, characterId);
        return gameState.relationships[key] || 0;
    },

    /**
     * 设置玩家与某NPC的亲密度
     * @param {GameState} gameState
     * @param {number} characterId
     * @param {number} value
     */
    setIntimacy(gameState, characterId, value) {
        // 限制范围 -4 ~ +5
        const clamped = Math.max(-4, Math.min(5, value));
        const key = this.getRelationshipKey(gameState, characterId);
        gameState.relationships[key] = clamped;

        // 检查是否达到3心，自动解锁人物卡
        if (clamped >= 3) {
            this.tryUnlockCharacterCard(gameState, characterId);
        }

        this.saveRelationships(gameState);
        return clamped;
    },

    /**
     * 增加亲密度
     * @param {GameState} gameState
     * @param {number} characterId
     * @param {number} delta
     */
    addIntimacy(gameState, characterId, delta) {
        const current = this.getIntimacy(gameState, characterId);
        return this.setIntimacy(gameState, characterId, current + delta);
    },

    /**
     * 尝试解锁人物卡（亲密度达到3心时）
     */
    tryUnlockCharacterCard(gameState, characterId) {
        const character = getCharacterTemplateByNumId(characterId);
        if (!character) return false;

        // 查找对应的人物卡
        const cardId = `CHAR_${character.templateId}`;
        const card = getCardById(cardId);

        if (card && !CardSystem.hasCard(gameState, cardId)) {
            CardSystem.acquireCard(gameState, cardId);
            gameState.addLog(`因为亲密度提升，${character.name}赠予了你他的人物卡！`);

            // 检查是否正在进行"人才探访"任务，如果解锁了新人物卡则完成任务
            if (gameState.currentTask && gameState.currentTask.completionType === 'explore') {
                gameState.addLog(`你找到了隐居民间的人才，人才探访任务完成！`);
                // 完成任务，进度=100%
                const actualProgress = gameState.currentTask.targetValue;
                gameState.completeMission(true, actualProgress);
                // 推进时间
                const template = getMissionTemplateById(gameState.currentTask.templateId);
                if (template) {
                    TimeSystem.advanceDays(gameState, template.timeLimitDays);
                }
                gameState.currentScene = GameScene.CITY_VIEW;
                if (window.game && window.game.gameView) {
                    window.game.gameView.renderAll();
                }
            }

            return true;
        }
        return false;
    },

    /**
     * 获取亲密度等级的文字描述
     * @param {number} intimacy
     */
    getIntimacyDescription(intimacy) {
        switch (intimacy) {
            case -4: return '不共戴天';
            case -3: return '仇敌';
            case -2: return '交恶';
            case -1: return '冷淡';
            case 0: return '中立';
            case 1: return '一面之缘';
            case 2: return '略有交情 - 可邀请修行';
            case 3: return '推心置腹 - 可获得人物卡/可结义';
            case 4: return '莫逆之交';
            case 5: return '生死相随 - 配偶/结义';
            default: return '中立';
        }
    },

    /**
     * 获取亲密度的心形图标表示
     * @param {number} intimacy
     */
    getIntimacyHearts(intimacy) {
        // 正数显示实心心，负数显示空心
        let hearts = '';
        if (intimacy > 0) {
            for (let i = 1; i <= 5; i++) {
                hearts += i <= intimacy ? '❤️' : '♡';
            }
        } else {
            for (let i = -4; i <= 0; i++) {
                if (i <= intimacy) {
                    hearts += '💔';
                } else {
                    hearts += '♡';
                }
            }
        }
        return hearts;
    },

    /**
     * 检查是否可以拜师（请求指导技能）
     * @param {GameState} gameState
     * @param {number} characterId
     */
    canInvitePractice(gameState, characterId) {
        // 需要亲密度 >= 2心
        return this.getIntimacy(gameState, characterId) >= 2;
    },

    /**
     * 检查是否可以劝诱加入己方势力
     * @param {GameState} gameState
     * @param {number} characterId
     */
    canPersuade(gameState, characterId) {
        // 需要亲密度 >= 2心，与拜师条件相同
        return this.canInvitePractice(gameState, characterId);
    },

    /**
     * 检查是否可以结义
     * @param {GameState} gameState
     * @param {number} characterId
     */
    canSwearBrotherhood(gameState, characterId) {
        // 需要亲密度 >= 4心，且同性，且不超过2个结义兄弟
        const character = getCharacterTemplateByNumId(characterId);
        const player = gameState.getPlayerCharacter();
        if (!character || !player) return false;

        // 性别判断简化：名字最后一个字不判断，假设朱元璋是男，马秀英是女
        // 实际：玩家和NPC性别不同不能结义（需要婚姻）
        // 这里简化：已结婚偶不影响，只要不同性别就是婚姻候选
        const isPlayerMale = player.name !== '马秀英';
        const isNpcMale = character.name !== '马秀英';

        if (isPlayerMale !== isNpcMale) {
            return false; // 不同性别应该结婚，不是结义
        }

        return this.getIntimacy(gameState, characterId) >= 4 && gameState.brothers.length < 2;
    },

    /**
     * 检查是否可以求婚
     * @param {GameState} gameState
     * @param {number} characterId
     */
    canProposeMarriage(gameState, characterId) {
        const character = getCharacterTemplateByNumId(characterId);
        const player = gameState.getPlayerCharacter();
        if (!character || !player) return false;

        // 已经有配偶了不能再求婚
        if (gameState.spouse !== null) return false;

        // 需要亲密度 >= 4心
        if (this.getIntimacy(gameState, characterId) < 4) return false;

        // 不同性别
        const isPlayerMale = player.name !== '马秀英';
        const isNpcMale = character.name !== '马秀英';

        return isPlayerMale !== isNpcMale;
    },

    /**
     * 执行送礼操作
     * @param {GameState} gameState
     * @param {number} characterId - NPC ID
     * @param {string} treasureCardId - 宝物卡ID
     * @returns {boolean} 是否成功
     */
    giftTreasure(gameState, characterId, treasureCardId) {
        if (!CardSystem.hasCard(gameState, treasureCardId)) {
            gameState.addLog('你没有这件宝物，无法赠送。');
            return false;
        }

        const character = getCharacterTemplateByNumId(characterId);
        if (!character) return false;

        // 移除玩家的宝物卡
        delete gameState.collectedCards[treasureCardId];

        // 根据宝物稀有度增加亲密度
        const card = getCardById(treasureCardId);
        let intimacyIncrease = 5;
        if (card && card.rarity) {
            intimacyIncrease = card.rarity * 5;
        }

        const newIntimacy = this.addIntimacy(gameState, characterId, intimacyIncrease);
        gameState.addLog(`你赠送给${character.name}一件宝物，亲密度增加了${intimacyIncrease}点。`);
        gameState.addLog(`现在你和${character.name}的关系：${this.getIntimacyDescription(newIntimacy)} ${this.getIntimacyHearts(newIntimacy)}`);

        this.saveRelationships(gameState);
        return true;
    },

    /**
     * 邀请茶会
     * @param {GameState} gameState
     * @param {number} characterId
     * @returns {boolean} 是否成功
     */
    inviteTea(gameState, characterId) {
        const cost = 5; // 5贯
        if (gameState.money < cost) {
            gameState.addLog('金钱不足，无法支付茶会费用。');
            return false;
        }

        const character = getCharacterTemplateByNumId(characterId);
        if (!character) return false;

        const currentIntimacy = this.getIntimacy(gameState, characterId);
        if (currentIntimacy < -1) {
            gameState.addLog(`${character.name}拒绝了你的茶会邀请。`);
            return false;
        }

        gameState.money -= cost;

        // 简单成功判定，根据口才技能提高成功率
        const eloquenceLevel = gameState.getSkillLevel('eloquence');
        const successChance = 0.5 + eloquenceLevel * 0.15;
        const success = Math.random() < successChance;

        if (success) {
            const increase = 10 + Math.floor(Math.random() * 6);
            const newIntimacy = this.addIntimacy(gameState, characterId, increase);
            gameState.addLog(`茶会愉快，你和${character.name}相谈甚欢，亲密度+${increase}。`);
            gameState.addLog(`现在关系：${this.getIntimacyDescription(newIntimacy)} ${this.getIntimacyHearts(newIntimacy)}`);
        } else {
            gameState.addLog(`谈话不太投机，${character.name}早早告辞，亲密度没有变化。`);
        }

        // 消耗1天时间
        gameState.advanceDays(1);
        this.saveRelationships(gameState);
        return true;
    },

    /**
     * 邀请宴饮
     * @param {GameState} gameState
     * @param {number} characterId
     * @returns {boolean} 是否成功
     */
    inviteFeast(gameState, characterId) {
        const cost = 15; // 15贯
        if (gameState.money < cost) {
            gameState.addLog('金钱不足，无法支付宴饮费用。');
            return false;
        }

        const character = getCharacterTemplateByNumId(characterId);
        if (!character) return false;

        const currentIntimacy = this.getIntimacy(gameState, characterId);
        if (currentIntimacy < 0) {
            gameState.addLog(`${character.name}拒绝了你的宴饮邀请。`);
            return false;
        }

        gameState.money -= cost;

        const eloquenceLevel = gameState.getSkillLevel('eloquence');
        const successChance = 0.6 + eloquenceLevel * 0.1;
        const success = Math.random() < successChance;

        if (success) {
            const increase = 15 + Math.floor(Math.random() * 11);
            const newIntimacy = this.addIntimacy(gameState, characterId, increase);
            gameState.addLog(`宴饮尽兴，你和${character.name}开怀畅饮，亲密度+${increase}。`);
            gameState.addLog(`现在关系：${this.getIntimacyDescription(newIntimacy)} ${this.getIntimacyHearts(newIntimacy)}`);
        } else {
            gameState.addLog(`${character.name}因有事提前离去，亲密度只增加了一点。`);
            this.addIntimacy(gameState, characterId, 5);
        }

        // 消耗1天时间
        gameState.advanceDays(1);
        this.saveRelationships(gameState);
        return true;
    },

    /**
     * 请求切磋武艺
     * @param {GameState} gameState
     * @param {number} characterId
     * @returns {boolean} 是否同意切磋
     */
    requestDuel(gameState, characterId) {
        const character = getCharacterTemplateByNumId(characterId);
        if (!character) return false;

        const intimacy = this.getIntimacy(gameState, characterId);
        if (intimacy < 1) {
            gameState.addLog(`${character.name}不愿意和你切磋。`);
            return false;
        }

        // 性格判断：豪勇性格更容易同意
        if (character.personality === '豪勇' || character.personality === '勇猛') {
            gameState.addLog(`${character.name}欣然同意了你的切磋邀请！`);
        } else if (character.personality === '慎重') {
            if (Math.random() > 0.5) {
                gameState.addLog(`${character.name}稍加犹豫后，同意了切磋。`);
            } else {
                gameState.addLog(`${character.name}今日无心比武，拒绝了你。`);
                return false;
            }
        }

        // 切磋会进入个人战，这里只记录状态，实际战斗由个人战系统处理
        gameState.addLog(`你准备和${character.name}切磋武艺。`);
        gameState.currentSocialTarget = characterId;

        // 不消耗时间，进入个人战界面后再计算
        return true;
    },

    /**
     * 切磋完成后处理亲密度
     */
    onDuelComplete(gameState, characterId, playerWon) {
        const character = getCharacterTemplateByNumId(characterId);
        if (!character) return;

        let increase = 2;
        if (playerWon) {
            increase = character.personality === '豪勇' ? 10 : 5;
            gameState.addLog(`你战胜了${character.name}，亲密度+${increase}。`);

            // 有几率习得对方的秘传卡
            this.tryLearnSecretFromCharacter(gameState, characterId);
        } else {
            gameState.addLog(`${character.name}战胜了你，但也指点了你几招，亲密度+${increase}。`);
        }

        this.addIntimacy(gameState, characterId, increase);
        gameState.advanceDays(1);
        this.saveRelationships(gameState);
    },

    /**
     * 尝试从NPC习得秘传卡
     */
    tryLearnSecretFromCharacter(gameState, characterId) {
        const character = getCharacterTemplateByNumId(characterId);
        if (!character || !character.exclusiveSecretCard) return false;

        // 需要拥有该人物卡
        const cardId = `CHAR_${character.templateId}`;
        if (!CardSystem.hasCard(gameState, cardId)) return false;

        // 需要武艺达到一定等级
        const martialLevel = gameState.getSkillLevel('martial');
        if (martialLevel < 3) return false;

        const secretCardId = character.exclusiveSecretCard;
        if (CardSystem.hasCard(gameState, secretCardId)) return false;

        // 50%几率习得
        if (Math.random() > 0.5) return false;

        CardSystem.acquireCard(gameState, secretCardId);
        gameState.addLog(`🎉 你在切磋中领悟了${character.name}的秘传【${getCardById(secretCardId).name}】！`);
        return true;
    },

    /**
     * 执行结义
     */
    doSwearBrotherhood(gameState, characterId) {
        if (!this.canSwearBrotherhood(gameState, characterId)) {
            gameState.addLog('无法结义，条件不满足。');
            return false;
        }

        const character = getCharacterTemplateByNumId(characterId);
        gameState.brothers.push(characterId);
        this.setIntimacy(gameState, characterId, 5); // 锁定为5心
        gameState.addLog(`🎯 你和${character.name}桃园结义，从此结为异姓兄弟！`);
        gameState.addLog('你们关系锁定为生死相随，永不背叛。');

        // 消耗50贯和1天
        gameState.money -= 50;
        gameState.advanceDays(1);
        this.saveRelationships(gameState);
        return true;
    },

    /**
     * 求婚
     */
    proposeMarriage(gameState, characterId) {
        if (!this.canProposeMarriage(gameState, characterId)) {
            gameState.addLog('无法求婚，条件不满足。');
            return false;
        }

        const character = getCharacterTemplateByNumId(characterId);
        // 需要聘礼
        const hasEnoughTreasure = CardSystem.countTreasures(gameState) >= 1;
        if (gameState.money < 100 || !hasEnoughTreasure) {
            gameState.addLog('你需要至少100贯和一件宝物作为聘礼。');
            return false;
        }

        // 扣除聘礼
        gameState.money -= 100;
        // TODO: 扣除一件宝物，这里简化

        gameState.spouse = characterId;
        this.setIntimacy(gameState, characterId, 5); // 锁定为5心
        gameState.addLog(`💍 你和${character.name}成婚了！婚礼举办了三天，宾主尽欢。`);
        gameState.addLog('你们关系锁定为生死相随，永不分离。');

        // 消耗3天
        gameState.advanceDays(3);
        this.saveRelationships(gameState);
        return true;
    },

    /**
     * 获取当前城市中的所有NPC
     * 根据人物模板的locationCityId匹配
     */
    getCharactersInCurrentCity(gameState) {
        const allCharacters = getAllCharacterTemplates();
        return allCharacters.filter(c => c.locationCityId === gameState.currentCityId);
    },

    /**
     * 自然衰减：每半年无互动亲密度-2
     * 应该在时间推进半年时调用
     * 配偶和结义兄弟锁定5心，不衰减
     */
    decayIntimacy(gameState) {
        // 每半年（6个月）衰减一次
        // 创建一个Set存储不衰减的NPC ID
        const lockedNpcs = new Set();
        if (gameState.spouse !== null) {
            lockedNpcs.add(gameState.spouse);
        }
        gameState.brothers.forEach(id => lockedNpcs.add(id));

        let hasDecay = false;
        for (const key in gameState.relationships) {
            // key格式: "playerId_npcId"，提取npcId
            const npcId = parseInt(key.split('_')[1]);
            // 配偶和结义兄弟不衰减
            if (lockedNpcs.has(npcId)) continue;

            if (gameState.relationships[key] > 0) {
                gameState.relationships[key] -= 2;
                if (gameState.relationships[key] < 0) {
                    gameState.relationships[key] = 0;
                }
                hasDecay = true;
            }
        }
        if (hasDecay) {
            gameState.addLog('长时间未互动的人际关系略有疏远。');
        }
        this.saveRelationships(gameState);
    },

    /**
     * 从localStorage加载亲密度关系
     */
    loadRelationships(gameState) {
        try {
            const saved = localStorage.getItem('hongwu_relationships');
            if (saved) {
                const data = JSON.parse(saved);
                if (data.relationships && typeof data.relationships === 'object') {
                    gameState.relationships = data.relationships;
                }
            }
            // 加载配偶和结义
            const savedMarriage = localStorage.getItem('hongwu_marriage_brothers');
            if (savedMarriage) {
                const data = JSON.parse(savedMarriage);
                if (data.spouse !== undefined) {
                    gameState.spouse = data.spouse;
                }
                if (data.brothers && Array.isArray(data.brothers)) {
                    gameState.brothers = data.brothers;
                }
            }
        } catch (e) {
            console.warn('加载人际关系失败', e);
        }
    },

    /**
     * 保存亲密度关系到localStorage
     */
    saveRelationships(gameState) {
        try {
            const data = {
                relationships: gameState.relationships,
                updated_at: new Date().toISOString()
            };
            localStorage.setItem('hongwu_relationships', JSON.stringify(data));

            const marriageData = {
                spouse: gameState.spouse,
                brothers: gameState.brothers
            };
            localStorage.setItem('hongwu_marriage_brothers', JSON.stringify(marriageData));
        } catch (e) {
            console.warn('保存人际关系失败', e);
        }
    },

    /**
     * 开始与某个NPC的社交互动
     */
    startSocialInteraction(gameState, characterId) {
        gameState.currentSocialTarget = characterId;
        // 记住从人物列表进来，退出返回人物列表
        gameState.previousSceneFromSocial = GameScene.CHARACTER_LIST_VIEW;
        gameState.currentScene = GameScene.SOCIAL_VIEW;
        const character = getCharacterTemplateByNumId(characterId);
        gameState.addLog(`你开始与${character.name}交谈。`);
    },

    /**
     * 淮西集团同乡加成 - 预设初始关系
     * 这个在游戏初始化时调用，给同乡们加好感
     */
    applyHuaixiGroupBonus(gameState) {
        // 淮西集团核心人物ID列表
        const huaixiIds = [
            1, // 朱元璋自己不算
            2, // 徐达
            3, // 常遇春
            4, // 汤和
            // ... 更多可以后续添加
        ];

        const playerId = gameState.playerCharacterId;
        // 如果玩家是朱元璋，给他的同乡加好感
        if (playerId === 1) {
            huaixiIds.forEach(id => {
                if (id !== playerId) {
                    this.addIntimacy(gameState, id, 20); // +20 = 2心
                }
            });
        }
    }
};

export default SocialSystem;
window.SocialSystem = SocialSystem;
