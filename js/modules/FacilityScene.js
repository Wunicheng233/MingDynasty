/**
 * 城乡设施交互场景模块
 * 渲染设施描述、交互选项，处理设施入口跳转
 */

window.FacilityScene = {
    /**
     * 设施描述与选项配置
     * 每个设施定义描述文本和可选操作
     */
    facilityConfig: {
        '武馆': {
            title: '武馆',
            description: '武馆大厅内，几名弟子正在练拳，师父正坐于堂上。\n\n木人桩立在墙角，沙袋悬挂梁上，处处透着一股练武人的刚猛气息。',
            options: [
                { text: '拜师学艺（消耗5天，修炼武艺）', action: 'practice_martial' },
                { text: '与人切磋（挑战武馆高手）', action: 'duel_master' },
                { text: '离开', action: 'leave' }
            ]
        },
        '市集': {
            title: '市集',
            description: '市井之间，人声鼎沸。\n\n卖米的、卖布的、开茶馆的、打卦的，三教九流各色人等在这里来来往往，吆喝声不绝于耳。',
            options: [
                { text: '进入集市交易', action: 'enter_market' },
                { text: '离开', action: 'leave' }
            ]
        },
        '商帮会馆': {
            title: '商帮会馆',
            description: '各地商人聚会交易的场所，墙上挂着各地商帮的旗帜。\n\n会馆大厅里，商人们正围坐讨论着各地物价行情。',
            options: [
                { text: '查看大宗商机', action: 'trade_bulk' },
                { text: '投资城镇', action: 'invest_city' },
                { text: '离开', action: 'leave' }
            ]
        },
        '官衙': {
            title: '官衙',
            description: '一入官衙深似海，案上堆满了公文，差役随时听候调遣。',
            options: [
                { text: '进入评定厅接取主命', action: 'assessment' },
                { text: '离开', action: 'leave' }
            ]
        },
        '校场': {
            title: '校场',
            description: '校场开阔，旌旗招展。\n\n士兵们正在操练，喊声震天。校场尽头点将台高耸，等候主将检阅。',
            options: [
                { text: '参加练兵', action: 'train_troops' },
                { text: '离开', action: 'leave' }
            ]
        },
        '工部作坊': {
            title: '工部作坊',
            description: '工匠们在这里修筑城墙、制造兵器。\n\n铁锤敲打声、拉锯声不绝于耳，火星四处飞溅。',
            options: [
                { text: '修筑城防（练习工政）', action: 'practice_engineering' },
                { text: '制造火器（练习火器）', action: 'practice_firearm' },
                { text: '离开', action: 'leave' }
            ]
        },
        '刑部司': {
            title: '刑部司',
            description: '刑部门前，观者寥寥。\n\n堂前威武，皂隶分立，令人不寒而栗。',
            options: [
                { text: '审理案件（练习律政）', action: 'practice_law' },
                { text: '离开', action: 'leave' }
            ]
        },
        '国子监': {
            title: '国子监',
            description: '天下文风荟萃于此，厢房里书生们正在诵读经义。\n\n大成至圣先师孔子牌位供奉于大堂之上，香烟袅袅。',
            options: [
                { text: '听讲经义（练习文墨）', action: 'practice_calligraphy' },
                { text: '练习礼制（演习礼乐）', action: 'practice_ritual' },
                { text: '离开', action: 'leave' }
            ]
        },
        '书院': {
            title: '书院',
            description: '山不在高，有仙则名。水不在深，有龙则灵。\n\n书院幽静，先生正在草堂讲学，弟子们围坐聆听。',
            options: [
                { text: '听讲兵法', action: 'practice_strategy' },
                { text: '离开', action: 'leave' }
            ]
        },
        '寺庙': {
            title: '寺庙',
            description: '香烟缭绕，钟声悠扬。\n\n佛祖端坐莲台，僧人正在诵经。院中古柏苍苍，静谧安详。',
            options: [
                { text: '学习医术', action: 'practice_medicine' },
                { text: '布施香火', action: 'donate' },
                { text: '离开', action: 'leave' }
            ]
        },
        '酒馆': {
            title: '酒馆',
            description: '酒香不怕巷子深，还没进门就能闻到醇厚的酒香。\n\n堂内座上客常满，杯中酒不空，说话声、猜拳声混杂在一起。',
            options: [
                { text: '请客饮酒（结交人物）', action: 'invite_talk' },
                { text: '打听情报', action: 'gather_info' },
                { text: '离开', action: 'leave' }
            ]
        },
        '铁匠铺': {
            title: '铁匠铺',
            description: '铁锤有声，火光映红了半边天。\n\n老铁匠光着膀子，正在砧上锻炼一块烧红的精铁。',
            options: [
                { text: '购买武器', action: 'buy_weapon' },
                { text: '学习火器制作', action: 'practice_firearm_craft' },
                { text: '离开', action: 'leave' }
            ]
        },
        '医馆': {
            title: '医馆',
            description: '药香扑鼻，郎中坐在柜台后静待病人上门。\n\n墙上挂着"但愿世间人无病，何愁架上药生尘"的对联。',
            options: [
                { text: '疗伤治病', action: 'heal' },
                { text: '学习医术', action: 'practice_medicine' },
                { text: '离开', action: 'leave' }
            ]
        },
        '锦衣卫所': {
            title: '锦衣卫所',
            description: '门禁森严，飞鱼服锦衣卫不时巡逻而过。\n\n肃杀之气扑面而来，这里是天子耳目，特务巢穴。',
            options: [
                { text: '接受密令', action: 'accept_spy_mission' },
                { text: '离开', action: 'leave' }
            ]
        }
    },

    /**
     * 渲染设施场景
     * @param {Object} gameState - 游戏状态
     * @returns {string} HTML
     */
    render(gameState) {
        const facilityName = gameState.currentFacility;
        const config = this.facilityConfig[facilityName];
        const city = gameState.getCurrentCity();

        // 获取当前城市中所有在城的人物
        const cityNpcs = gameState.npcs ? gameState.npcs.filter(npc => npc.locationCityId === city.id) : [];

        if (!config) {
            return `<div class="facility-scene">
                <div class="facility-header">
                    <h2>${facilityName}</h2>
                </div>
                <div class="facility-text">该设施尚未开放</div>
                <div class="facility-actions">
                    <button class="event-choice-btn" onclick="FacilityScene.leave()">返回</button>
                </div>
            </div>`;
        }

        let html = `<div class="facility-scene">
            <div class="facility-header">
                <h2>${gameState.getCurrentCity().name} · ${config.title}</h2>
            </div>
        `;

        // 描述文本 - 替换换行
        const descHtml = config.description.replace(/\n/g, '<br>');
        html += `<div class="facility-text">${descHtml}</div>`;

        // 如果设施内有人，显示人物列表
        if (cityNpcs.length > 0) {
            html += `
                <div class="facility-npcs">
                    <h3 class="section-title">在场人物</h3>
                    <div class="facility-npcs-list">
            `;
            cityNpcs.forEach(npc => {
                const template = CHARACTER_TEMPLATES.find(t => t.id === npc.templateId);
                const name = template ? template.name : npc.name;
                const emoji = template ? template.emoji : '👤';
                html += `
                    <button class="npc-in-facility-btn" data-npc-id="${npc.id}">
                        <span class="npc-emoji">${emoji}</span>
                        <span class="npc-name">${name}</span>
                    </button>
                `;
            });
            html += `
                    </div>
                </div>
            `;
        }

        // 设施交互选项
        html += `
        <div class="facility-choices">
            <h3>设施交互</h3>
        `;

        // 选项
        config.options.forEach((option, index) => {
            html += `<button class="event-choice-btn" data-action="${option.action}">${index + 1}. ${option.text}</button>`;
        });

        html += `</div></div>`;

        // 绑定事件
        setTimeout(() => this.bindEvents(gameState), 0);

        return html;
    },

    /**
     * 绑定选项点击事件
     */
    bindEvents(gameState) {
        document.querySelectorAll('.event-choice-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleAction(action, gameState);
            });
        });
        // 绑定NPC点击事件
        document.querySelectorAll('.npc-in-facility-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const npcId = parseInt(btn.dataset.npcId);
                // 进入社交互动场景
                gameState.currentNpc = gameState.npcs.find(n => n.id === npcId);
                gameState.currentScene = GameScene.SOCIAL_INTERACTION;
                window.game.gameView.renderAll();
            });
        });
    },

    /**
     * 处理玩家选择的动作
     */
    handleAction(action, gameState) {
        switch (action) {
            case 'leave':
                this.leave();
                break;
            case 'enter_market':
                // 进入市集
                MarketScene.init();
                gameState.currentScene = GameScene.MARKET;
                window.game.gameView.renderAll();
                break;
            case 'assessment':
                // 进入评定厅
                gameState.currentScene = GameScene.TASK_LIST;
                window.game.gameView.renderAll();
                break;
            case 'practice_martial':
                // 武艺修炼 - 启动武艺小游戏
                gameState.currentScene = GameScene.FARMING_GAME;
                window.game.gameView.renderAll();
                MartialGame.start(window.game.gameView, gameState, '拜师学艺');
                break;
            case 'duel_master':
                // 切磋 - 启动个人战
                gameState.currentScene = GameScene.FARMING_GAME;
                window.game.gameView.renderAll();
                DuelGame.start(window.game.gameView, gameState, '武馆切磋');
                break;
            case 'practice_engineering':
                // 工政练习 - 启动工程小游戏
                gameState.currentScene = GameScene.FARMING_GAME;
                window.game.gameView.renderAll();
                EngineeringGame.start(window.game.gameView, gameState, '修筑城防');
                break;
            case 'practice_firearm':
            case 'practice_firearm_craft':
                // 火器练习 - 启动火器小游戏
                gameState.currentScene = GameScene.FARMING_GAME;
                window.game.gameView.renderAll();
                FirearmGame.start(window.game.gameView, gameState, '火器练习');
                break;
            case 'practice_law':
                // 律政练习 - 启动律法小游戏
                gameState.currentScene = GameScene.FARMING_GAME;
                window.game.gameView.renderAll();
                LawGame.start(window.game.gameView, gameState, '审理案件');
                break;
            case 'practice_calligraphy':
                // 文墨练习 - 启动文墨小游戏
                gameState.currentScene = GameScene.FARMING_GAME;
                window.game.gameView.renderAll();
                CalligraphyGame.start(window.game.gameView, gameState, '听讲经义');
                break;
            case 'practice_ritual':
                // 礼制练习 - 启动礼制小游戏
                gameState.currentScene = GameScene.FARMING_GAME;
                window.game.gameView.renderAll();
                RitualGame.start(window.game.gameView, gameState, '演习礼乐');
                break;
            case 'practice_strategy':
                // 兵法练习 - 启动兵法小游戏
                gameState.currentScene = GameScene.FARMING_GAME;
                window.game.gameView.renderAll();
                StrategyGame.start(window.game.gameView, gameState, '听讲兵法');
                break;
            case 'practice_medicine':
                // 医术练习 - 启动医术小游戏
                gameState.currentScene = GameScene.FARMING_GAME;
                window.game.gameView.renderAll();
                MedicineGame.start(window.game.gameView, gameState, '学习医术');
                break;
            case 'donate':
                // 布施 - 花钱加少量属性经验
                if (gameState.money >= 10) {
                    gameState.money -= 10;
                    gameState.addLog(`你向寺庙布施了10贯香火钱，心中感到一阵安宁。`);
                    // 给医术加少量经验
                    gameState.addSkillExp('medicine', 5);
                    this.leave();
                } else {
                    alert('金钱不足，无法布施');
                }
                break;
            case 'train_troops':
                // 练兵 - 调用合战训练？
                gameState.addLog('校场操练完成，提升了士兵士气。');
                gameState.advanceDays(3);
                this.leave();
                break;
            default:
                // 未实现的功能，先返回
                console.warn('设施动作未实现:', action);
                alert(`【${action}】功能尚未实现，先返回城市`);
                this.leave();
                break;
        }
    },

    /**
     * 离开设施返回城市
     */
    leave() {
        const gameState = window.game.gameState;
        gameState.currentFacility = null;
        gameState.currentScene = GameScene.CITY_VIEW;
        window.game.gameView.renderAll();
    }
};
