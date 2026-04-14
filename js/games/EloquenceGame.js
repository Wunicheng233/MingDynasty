/**
 * 游说纵横小游戏（口才）
 * 改进玩法：对方抛出观点，选择正确的反驳，成功说服对方
 * - 共6轮，每轮对方一个观点，三选一反驳
 * - 选对大幅涨情绪，选错涨少或掉情绪
 * - 6轮结束情绪到100就算成功
 * 典故：明太祖朱元璋开国前后，多次派使者游说地方势力归顺，纵横捭阖
 */

window.EloquenceGame = {
    /**
     * 题库：所有辩题
     * 每个辩题：
     * - question: 对方的观点/问题
     * - options: 三个选项 [{text: "...", correct: true/false, change: +/-number}]
     * - feedback: {correct: "...", wrong: "..."}
     */
    questionsPool: [
        {
            question: "对方：「元朝气数未尽，大帅不如暂退淮西，再观时势」",
            options: [
                {
                    text: "元廷腐败已深，天下苦元久矣，大丈夫岂能久居昏君之下！",
                    correct: true,
                    change: 25,
                    feedback: "对方闻言沉默良久，站起身拱手道：先生所言有理，我等愿从大帅号令！"
                },
                {
                    text: "先生说得对，我们确实该再等等",
                    correct: false,
                    change: 5,
                    feedback: "对方微微一笑，心中不以为意，依旧迟疑不决。"
                },
                {
                    text: "敢说这种话，拖出去砍了！",
                    correct: false,
                    change: -15,
                    feedback: "对方卫士哗变，你激化了矛盾，对方索性闭门不见。"
                }
            ]
        },
        {
            question: "对方财主：「连年灾荒，我家粮食也不多，实在拿不出余粮赈灾」",
            options: [
                {
                    text: "财主您千仓万箱，救一救流民不过举手之劳，流民得救您也落得善名",
                    correct: true,
                    change: 22,
                    feedback: "财主捋髯笑道：先生说得是，遂开仓放粮，灾民欢呼。"
                },
                {
                    text: "那我们就先走了，改日再来",
                    correct: false,
                    change: 3,
                    feedback: "对方拱手相送，此事也就不了了之。"
                },
                {
                    text: "今天你拿也得拿，不拿也得拿！",
                    correct: false,
                    change: -10,
                    feedback: "对方硬起心肠闭城自守，你强攻死伤惨重，功亏一篑。"
                }
            ]
        },
        {
            question: "对方将领：「我追随脱脱丞相多年，丞相待我不薄，怎能降你」",
            options: [
                {
                    text: "脱脱丞相被昏君赐死，你还为昏君卖命，岂不是愚忠？",
                    correct: true,
                    change: 24,
                    feedback: "对方哑口无言，解甲投降。"
                },
                {
                    text: "脱脱确实是好丞相，降了我们照样有官做",
                    correct: false,
                    change: 8,
                    feedback: "对方犹豫不决，依旧首鼠两端。"
                },
                {
                    text: "不降则死，你降不降！",
                    correct: false,
                    change: -12,
                    feedback: "对方坚守城池，久攻不下，只得退走。"
                }
            ]
        },
        {
            question: "对方乡绅：「大王义军来了，我们交税交多少？」",
            options: [
                {
                    text: "轻徭薄赋，与民休息，十税一足矣，比起元廷减半",
                    correct: true,
                    change: 20,
                    feedback: "众乡绅欢呼，开城迎接义军。"
                },
                {
                    text: "全部家产都要登记，按户抽税",
                    correct: false,
                    change: 5,
                    feedback: "乡绅们心怀恐惧，纷纷闭门坚守。"
                },
                {
                    text: "顺我者昌逆我者亡，不交税就派兵",
                    correct:false,
                    change: -18,
                    feedback: "地方豪强联合起来抵抗，义军伤亡惨重。"
                }
            ]
        },
        {
            question: "对方海盗头子：「我等在海上逍遥惯了，为什么要归顺你？」",
            options: [
                {
                    text: "归顺朝廷，封你为水师千户，子孙后代都有官做，不比在海上刀口舔血好？",
                    correct: true,
                    change: 21,
                    feedback: "海盗头子点头，率众归降，沿海安宁。"
                },
                {
                    text: "不来归顺我们就来剿你",
                    correct: false,
                    change: -8,
                    feedback: "对方扬帆远遁，依旧为祸沿海。"
                },
                {
                    text: "你若归顺，金银女人都少不了你的",
                    correct: false,
                    change: 10,
                    feedback: "对方笑道：金银我已有了，遂收下好处依旧游击海上。"
                }
            ]
        },
        {
            question: "对方县令：「我本元朝命官，降了你我就是叛臣，史书留骂名啊」",
            options: [
                {
                    text: "元廷无道，百姓流离，你为民而降，这是顺天应人，何来骂名？",
                    correct: true,
                    change: 23,
                    feedback: "县令豁然开朗，开城投降。"
                },
                {
                    text: "那你继续当元朝官吧，我们走",
                    correct: false,
                    change: 0,
                    feedback: "你撤军而去，对方依旧为元廷守城。"
                },
                {
                    text: "不降就破城砍头，你看着办",
                    correct: false,
                    change: -10,
                    feedback: "对方拼死抵抗，城破了你也死伤不少。"
                }
            ]
        },
        {
            question: "对方国师：「明王出世，弥勒降生，你才是伪王，滚出去！」",
            options: [
                {
                    text: "弥勒救世是救民，你占着寺院圈地害民，才是真伪！",
                    correct: true,
                    change: 20,
                    feedback: "信众哄然，国师控制不住局面，只得退走。"
                },
                {
                    text: "一派胡言，给我拿下",
                    correct: false,
                    change: 5,
                    feedback: "你强行抓人，信众反而更加拥护国师。"
                },
                {
                    text: "烧了你的寺院，看你还怎么骗人",
                    correct: false,
                    change: -12,
                    feedback: "你激起民变，死伤惨重，只得退兵。"
                }
            ]
        },
        {
            question: "对方郡守：「黄河决口多年，朝廷都修不好，你们能？」",
            options: [
                {
                    text: "我们组织流民屯田修河，以工代赈，既救流民又修河道",
                    correct: true,
                    change: 25,
                    feedback: "郡守拱手笑道：先生说得是，沿河百姓都愿意出力。"
                },
                {
                    text: "修河那是官府的事，我们打了天下再说",
                    correct: false,
                    change: 5,
                    feedback: "河水依旧泛滥，流民四散，对方对我们很失望。"
                },
                {
                    text: "不修了，先打了元廷再说",
                    correct: false,
                    change: -8,
                    feedback: "流民看不到希望，纷纷散去，你兵力也少了。"
                }
            ]
        },
        {
            question: "对方盐商：「官家食盐卖那么贵，你们来了能便宜多少？」",
            options: [
                {
                    text: "我们改盐法，放开民间贩运，税收减半，盐价自然就下来了",
                    correct: true,
                    change: 22,
                    feedback: "盐商大喜，愿意归顺，食盐销路立刻通畅。"
                },
                {
                    text: "我们来了价格自然就低了",
                    correct: false,
                    change: 8,
                    feedback: "说得含糊，盐商依旧将信将疑。"
                },
                {
                    text: "你私卖食盐就是违法，归顺了才能卖",
                    correct: false,
                    change: -5,
                    feedback: "盐商恐惧，干脆投靠了元廷。"
                }
            ]
        },
        {
            question: "对方蒙古王公：「这天下本来就是我们蒙古人的，你们汉人要回去？」",
            options: [
                {
                    text: "天下是天下人的天下，不是你一家一姓的，贤者居之，百姓说了算",
                    correct: true,
                    change: 24,
                    feedback: "王公无言以对，率部退出长城。"
                },
                {
                    text: "你在这里住久了，留在这里照样做官",
                    correct: false,
                    change: 10,
                    feedback: "王公半信半疑，依旧割据一方。"
                },
                {
                    text: "不走就杀了，你打不过我",
                    correct: false,
                    change: -15,
                    feedback: "对方拼死抵抗，你伤亡惨重，一时不能取胜。"
                }
            ]
        },
        {
            question: "对方将领：「郭子兴待你不薄，为何要夺他兵权？」",
            options: [
                {
                    text: "郭子兴老了，元军打来不敢打，我只是救兄弟们的命，不是为我自己",
                    correct: true,
                    change: 20,
                    feedback: "众将点头，都愿意跟着你干。"
                },
                {
                    text: "这就是我的事，不用你管",
                    correct: false,
                    change: -5,
                    feedback: "将领们背后议论你猜忌旧主，人心不稳。"
                },
                {
                    text: "郭子兴老糊涂了，该当退位了",
                    correct: false,
                    change: -10,
                    feedback: "郭部旧将不满，暗地里不服你调度。"
                }
            ]
        },
        {
            question: "对方儒生：「夫子说仁义不言利，你开口就说利益，不是圣王之道」",
            options: [
                {
                    text: "百姓吃不饱穿不暖，空谈仁义能吃饭吗？先富民再教化",
                    correct: true,
                    change: 18,
                    feedback: "儒生低头沉思，点头道你说得有理，愿意出山相助。"
                },
                {
                    text: "就是要讲利益，你懂什么",
                    correct: false,
                    change: 5,
                    feedback: "儒生拂袖而去，不肯相助。"
                },
                {
                    text: "圣人早死了，现在说圣人没用",
                    correct: false,
                    change: -10,
                    feedback: "士林哗然，都说你是粗鄙武夫，不来相助。"
                }
            ]
        }
    ],

    /**
     * 启动游戏 - 先显示说明
     */
    start(gameView, gameState, title = null) {
        const headerTitle = title || (gameState.currentTask ? gameState.currentTask.name : '游说纵横');

        let html = `
            <div style="max-height: 70vh; overflow-y: auto; padding: 0 5px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #8b4513; font-size: 28px; margin-bottom: 8px;">💬 游说纵横</h2>
                    <p style="color: #6b5b45; font-size: 16px;">对方抛出观点，选出最有力的反驳说服对方！</p>
                </div>

                <div style="background: #f5f0e1; padding: 18px; border-radius: 8px; margin-bottom: 16px;">
                    <h3 style="color: #8b4513; margin-top: 0; font-size: 22px; margin-bottom: 10px;">游戏规则</h3>
                    <ul style="line-height: 1.7; color: #333; font-size: 18px; padding-left: 20px; margin: 0;">
                        <li>一共 <strong>6轮</strong>，每轮对方一个观点，三个选项选一个反驳</li>
                        <li>选对了 → 大幅涨情绪，选错了涨很少甚至掉情绪</li>
                        <li>6轮结束情绪到<strong>100分</strong>就算说服成功</li>
                        <li>等级越高 → 初始情绪越低，难度越大</li>
                    </ul>
                </div>

                <div style="text-align: center; margin-top: 20px;">
                    <button class="btn primary-btn" id="start-eloquence-btn" style="padding: 12px 40px; font-size: 18px;">开始辩论!</button>
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        document.getElementById('start-eloquence-btn').addEventListener('click', () => {
            this.startActualGame(gameView, gameState, title);
        });
    },

    /**
     * 真正开始游戏
     */
    startActualGame(gameView, gameState, title = null) {
        const task = gameState.currentTask;

        // 根据技能等级调整初始情绪 (难度曲线)
        // Lv1: 初始情绪 20, Lv2: 初始情绪 10, Lv3: 初始情绪 0
        let skillLevel = 1;
        if (task && task.requiredSkill) {
            skillLevel = window.SkillSystem.getSkillLevel(gameState, task.requiredSkill);
        }
        let initialEmotion = 20 - (skillLevel - 1) * 10;

        // 随机选6个不同的问题
        const shuffled = [...this.questionsPool].sort(() => Math.random() - 0.5);
        const questions = shuffled.slice(0, 6);

        gameState.eloquenceGame = {
            emotion: initialEmotion,
            remainingRounds: 6,
            currentQuestion: 0,
            questions: questions,
            lastFeedback: '对方等着你的发言...'
        };

        this.renderRound(gameState);
    },

    /**
     * 渲染当前回合
     */
    renderRound(gameState) {
        const game = gameState.eloquenceGame;
        const task = gameState.currentTask;
        const template = getMissionTemplateById(task.templateId) || task;
        const currentQ = game.questions[game.currentQuestion];

        const emotionBar = '■'.repeat(Math.floor(game.emotion / 10)) + '□'.repeat(10 - Math.floor(game.emotion / 10));

        let html = `
            <div style="max-height: 70vh; overflow-y: auto; padding: 0 5px;">
                <div class="eloquence-header">
                    <h2>${template.name}</h2>
                    <p>当前情绪值：${emotionBar} <strong>${game.emotion}</strong>/100 &nbsp; 剩余回合：${game.remainingRounds}</p>
                    ${game.lastFeedback ? `<div style="background: #f5f0e1; padding: 10px; border-radius: 5px; margin-top: 8px;"><p>${game.lastFeedback}</p></div>` : ''}
                </div>
                <div class="eloquence-question" style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p><strong>${currentQ.question}</strong></p>
                </div>
                <div class="eloquence-options" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 15px;">
                    ${currentQ.options.map((opt, idx) => {
                        // 深色文字浅色背景，看得清
                        return `
                        <button class="btn eloquence-option" data-idx="${idx}" style="padding: 12px; text-align: left; white-space: normal; height: auto; background: #f8f9fa; border: 2px solid #ccc; color: #222;">
                            <strong>${String.fromCharCode(65 + idx)}.</strong> ${opt.text}
                        </button>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        this.bindEvents(gameState, gameView);
    },

    /**
     * 绑定点击事件
     */
    bindEvents(gameState, gameView) {
        document.querySelectorAll('.eloquence-option').forEach(btn => {
            btn.addEventListener('click', () => {
                this.onSelect(parseInt(btn.dataset.idx), gameState, gameView);
            });
        });
    },

    /**
     * 用户选择选项
     */
    onSelect(idx, gameState, gameView) {
        const game = gameState.eloquenceGame;
        const currentQ = game.questions[game.currentQuestion];
        const option = currentQ.options[idx];

        // 更新情绪
        game.emotion += option.change;
        game.emotion = Math.max(0, Math.min(100, game.emotion));
        game.lastFeedback = option.feedback;
        game.currentQuestion++;
        game.remainingRounds--;

        // 检查是否结束
        if (game.remainingRounds <= 0 || game.emotion >= 100) {
            this.finish(gameState, gameView);
        } else {
            this.renderRound(gameState);
        }
    },

    /**
     * 结算游戏
     */
    finish(gameState, gameView) {
        const game = gameState.eloquenceGame;
        const task = gameState.currentTask;

        let ratio;
        let resultText;

        if (game.emotion >= 100) {
            ratio = 1.0;
            resultText = `🎉 成功说服对方！情绪值达到${game.emotion}，完胜！`;
        } else if (game.emotion >= 60) {
            ratio = 0.7;
            resultText = `✅ 游说基本成功，情绪值${game.emotion}，对方基本被说服。`;
        } else if (game.emotion >= 30) {
            ratio = 0.4;
            resultText = `❌ 游说不够成功，情绪值仅${game.emotion}，对方依旧不服。`;
        } else {
            ratio = 0.2;
            resultText = `❌ 游说失败，情绪值仅${game.emotion}，对方完全不服。`;
        }

        const template = getMissionTemplateById(gameState.currentTask.templateId) || gameState.currentTask;
        // 实际进度 = 目标值 * 完成率
        const actualProgress = Math.round(gameState.currentTask.targetValue * ratio);
        const success = actualProgress > 0;

        // 使用新的主命系统结算
        const result = gameState.completeMission(success, actualProgress);

        gameState.addLog(`【${template.name}】${resultText}`);

        // 时间推进：按任务限时推进
        window.TimeSystem.advanceDays(gameState, template.timeLimitDays);

        gameState.eloquenceGame = null;
        gameState.currentScene = window.GameScene.CITY_VIEW;
        gameView.renderAll();
    }
};
