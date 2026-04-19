/**
 * 存档管理器
 * 处理游戏状态的保存和加载到localStorage
 * 支持多存档位（共9个槽位）
 */

const SaveManager = {
    // 总存档位数
    TOTAL_SLOTS: 9,

    // 存档键名前缀
    KEY_PREFIX: 'mingdynasty_save_slot_',

    // 旧版单存档键名
    OLD_KEY: 'mingdynasty_save',

    /**
     * 获取所有存档位数据
     * 返回数组，每个元素对应一个存档位，null表示空位
     */
    getAllSlots() {
        const slots = [];
        for (let i = 0; i < this.TOTAL_SLOTS; i++) {
            slots.push(this.getSlot(i));
        }

        // 自动迁移旧版单存档到第0槽位
        this.migrateOldSave(slots);

        return slots;
    },

    /**
     * 获取指定存档位的数据
     */
    getSlot(slotId) {
        try {
            const key = this.KEY_PREFIX + slotId;
            const dataStr = localStorage.getItem(key);
            if (!dataStr) return null;
            return JSON.parse(dataStr);
        } catch (e) {
            console.error(`读取存档位 ${slotId} 失败:`, e);
            return null;
        }
    },

    /**
     * 保存到指定存档位
     */
    saveToSlot(slotId, gameState) {
        try {
            const saveData = {
                timestamp: Date.now(),
                year: gameState.year,
                month: gameState.month,
                day: gameState.day,
                money: gameState.money,
                merit: gameState.merit,
                currentRoleId: gameState.currentRoleId,
                currentRoleName: gameState.currentRole ? gameState.currentRole.name : '',
                rank: gameState.currentRole ? gameState.currentRole.rank : '',
                skills: gameState.skills,
                collectedCards: gameState.collectedCards,
                currentTitle: gameState.currentTitle,
                battleWins: gameState.battleWins,
                relationships: gameState.relationships,
                eventFlags: gameState.eventFlags,
                triggeredEvents: gameState.triggeredEvents,
                currentTask: gameState.currentTask,
                currentScene: gameState.currentScene,
                logs: gameState.logs,
                // 可以添加截图缩略图base64
                screenshot: null
            };
            const key = this.KEY_PREFIX + slotId;
            localStorage.setItem(key, JSON.stringify(saveData));
            return true;
        } catch (e) {
            console.error(`保存存档位 ${slotId} 失败:`, e);
            return false;
        }
    },

    /**
     * 从指定存档位加载到gameState
     */
    loadFromSlot(slotId, gameState) {
        try {
            const saveData = this.getSlot(slotId);
            if (!saveData) return false;

            // 加载所有保存的数据
            Object.keys(saveData).forEach(key => {
                if (key !== 'timestamp' && key !== 'screenshot') {
                    gameState[key] = saveData[key];
                }
            });

            return true;
        } catch (e) {
            console.error(`加载存档位 ${slotId} 失败:`, e);
            return false;
        }
    },

    /**
     * 删除指定存档位
     */
    deleteSlot(slotId) {
        try {
            const key = this.KEY_PREFIX + slotId;
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error(`删除存档位 ${slotId} 失败:`, e);
            return false;
        }
    },

    /**
     * 检查指定存档位是否有存档
     */
    hasSlot(slotId) {
        return this.getSlot(slotId) !== null;
    },

    /**
     * 检查是否存在任何存档
     */
    hasAnySave() {
        // 检查多存档
        for (let i = 0; i < this.TOTAL_SLOTS; i++) {
            if (this.hasSlot(i)) return true;
        }
        // 检查旧存档
        return localStorage.getItem(this.OLD_KEY) !== null;
    },

    /**
     * 迁移旧版单存档到第0槽位
     */
    migrateOldSave(slots) {
        try {
            const oldDataStr = localStorage.getItem(this.OLD_KEY);
            if (!oldDataStr) return;

            // 如果第0槽已经有数据，不覆盖
            if (slots[0] !== null) return;

            // 迁移
            const oldData = JSON.parse(oldDataStr);
            oldData.timestamp = Date.now();
            oldData.rank = oldData.rank || '';
            oldData.currentRoleName = '';
            localStorage.setItem(this.KEY_PREFIX + '0', JSON.stringify(oldData));

            // 保留旧存档不删除，供回退
            console.log('已迁移旧版单存档到存档位 0');
        } catch (e) {
            console.error('迁移旧存档失败:', e);
        }
    },

    /**
     * 格式化日期显示
     */
    formatSaveDate(timestamp) {
        return new Date(timestamp).toLocaleString('zh-CN');
    },

    // ========== 向后兼容：保留原有单存档API ==========

    /**
     * 保存游戏状态到localStorage（兼容旧API）
     */
    save(gameState) {
        return this.saveToSlot(0, gameState);
    },

    /**
     * 从localStorage加载游戏状态（兼容旧API）
     */
    load(gameState) {
        return this.loadFromSlot(0, gameState);
    },

    /**
     * 清除存档（兼容旧API）
     */
    clear() {
        this.deleteSlot(0);
        localStorage.removeItem(this.OLD_KEY);
    },

    /**
     * 检查是否有存档（兼容旧API）
     */
    hasSave() {
        return this.hasAnySave();
    }
};

export default SaveManager;
window.SaveManager = SaveManager;
