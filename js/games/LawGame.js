/**
 * 明律断案小游戏（律政）
 * 找出证词矛盾 + 选择正确法律条文定罪
 * 典故：明代《大明律》体系完整，县官需要审理地方案件，明察秋毫找出证词矛盾
 */

window.LawGame = {
    /**
     * 案件题库
     * 每个案件：
     * - title: 案件名称
     * - description: 案件描述
     * - plaintiff: 原告证词
     * - defendant: 被告证词
     * - witness: 证人证词
     * - statements: 所有证词列表（打乱顺序供选择）
     * - contradiction: [原始索引数组] 正确矛盾的证词索引（在原statements中）
     * - laws: 法律选项 [{text, correct: true/false}]
     * - difficulty: 1-3 难度（1=简单，2=中等，3=困难）
     */
    casePool: [
        // ========== 难度 1 (简单，6句证词) ==========
        {
            title: '财主失窃案',
            description: '财主王五报案称家中失窃，丢失白银百两。以下是各方证词，请找出矛盾之处，并选择合适的法律条文定罪。',
            plaintiff: '小人家中昨夜失窃，丢了白银一百两，门窗都被撬开，肯定是惯偷所为！',
            defendant: '小人昨晚路过王家，并没有偷东西，只是捡到了一块银子。',
            witness: '我昨晚起夜，看见一个黑衣人从王家后墙跳出来，身材胖胖的，和被告差不多。',
            statements: [
                '【原告】小人门窗都被撬开',
                '【被告】小人从不到王家后院',
                '【原告】小人丢失白银百两整',
                '【证人】昨晚月色朦朦看不清',
                '【原告】后墙没有攀爬痕迹',
                '【被告】捡到银子一两而已'
            ],
            contradiction: [0, 4],
            laws: [
                {text: '窃盗得财五十两以上，杖一百流三千里', correct: false},
                {text: '窃盗得财一百两以上，绞监候', correct: true},
                {text: '拾得遗失物不还者，笞四十', correct: false},
                {text: '诬告者反坐，加一等定罪', correct: false}
            ],
            difficulty: 1
        },
        {
            title: '杀人害命案',
            description: '张二狗被人杀死在郊外，嫌疑人李三被抓，各方证词如下，请断案。',
            plaintiff: '李三杀了我丈夫，他还抢走了我丈夫身上的铜钱，一定是他！',
            defendant: '我没杀人，我只是和他吵了一架，然后我就走了！',
            witness: '我看见李三拿着一把带血的刀，从东边跑来，身上有血。',
            statements: [
                '【仵作】死者身上刀伤为一刀致命',
                '【证人】凶手逃走时向东跑去',
                '【邻居】李三往西逃走了',
                '【妻子】死者钱袋还在身上',
                '【被告】我没带刀上山',
                '【证人】血迹溅满了凶手衣襟'
            ],
            contradiction: [1, 2],
            laws: [
                {text: '斗殴杀人者斩，故杀者绞', correct: true},
                {text: '过失杀者，依律收赎', correct: false},
                {text: '谋杀祖父母父母者，凌迟处死', correct: false},
                {text: '抢夺财物者，杖八十徒三年', correct: false}
            ],
            difficulty: 1
        },
        {
            title: '农田争讼案',
            description: '赵六声称邻居占了自己三亩地，双方各执一词，请断案。',
            plaintiff: '这三亩地本来就是我的，邻居去年犁地越界，占了我的田！',
            defendant: '这地本来就是我的，是他多年前占了我的，我只是收回来！',
            witness: '我在这里住五十年了，这块地一直就是赵六家的。',
            statements: [
                '【原告】小人有地契为凭',
                '【被告】这块地是祖传的',
                '【原告】地契四至写得分明',
                '【原告】邻居十年前买了我一亩',
                '【被告】边界本就不清不楚',
                '【被告】我从未占过他田地'
            ],
            contradiction: [2, 4],
            laws: [
                {text: '田土不清者，责令退还，笞二十', correct: true},
                {text: '欺隐田粮者，一亩至五亩，笞四十', correct: false},
                {text: '占耕他人田土，一亩笞十', correct: false},
                {text: '盗卖他人田宅者，杖八十', correct: false}
            ],
            difficulty: 1
        },
        {
            title: '诬告邻里案',
            description: '李甲告王乙偷盗自家耕牛，王乙否认，各方证词如下。',
            plaintiff: '我家的牛肯定是王乙偷的，我昨天看见他在我牛栏边转悠！',
            defendant: '我那是路过，我家自己有牛，为什么偷你的？',
            witness: '我听说李甲的牛是自己跑丢了，他就是想赖王乙。',
            statements: [
                '【原告】小人的牛昨天晚上丢的',
                '【原告】王乙昨夜在我牛栏边徘徊',
                '【原告】小人看见了就是他偷的',
                '【被告】我家有牛不需要偷',
                '【邻居】王乙昨天整夜在家织布',
                '【被告】李甲欠王乙银子一直不还'
            ],
            contradiction: [1, 4],
            laws: [
                {text: '诬告他人者，加所诬罪二等', correct: true},
                {text: '偷盗牛马者，杖八十徒二年', correct: false},
                {text: '欠债不还者，笞二十追债', correct: false},
                {text: '邻里不和，笞十', correct: false}
            ],
            difficulty: 1
        },

        // ========== 难度 2 (中等，8句证词) ==========
        {
            title: '伪造官印案',
            description: '商人张三被指伪造盐引官印，从中偷漏税款，各方证词如下，请断案。',
            plaintiff: '此人伪造官印，偷漏税银三千贯，请大人严惩！',
            defendant: '这官印是真是假小人不知，这盐引是从盐商那里买来的。',
            witness: '我见过真官印，这个印的字体不对，肯定是假的。',
            statements: [
                '【被告】被告说这盐引是从盐商那里买来',
                '【被告】被告说他不懂官印真假',
                '【证人】证人说印章字体不对',
                '【证人】证人说被告亲自盖的印',
                '【原告】税款三千贯分文未交',
                '【被告】被告说税款已经交过了',
                '【官府】盐引数量与货单不符',
                '【邻居】被告一向本分从未犯法'
            ],
            contradiction: [1, 3],
            laws: [
                {text: '伪造诸衙门印信者，斩', correct: true},
                {text: '私盐禁，杖一百徒三年', correct: false},
                {text: '偷税漏税者，笞五十罚倍', correct: false},
                {text: '知情不举者，同罪', correct: false}
            ],
            difficulty: 2
        },
        {
            title: '商船走私案',
            description: '一艘泉州商船被指走私香料，船长辩称是正常贸易，请断案。',
            plaintiff: '此船私带苏木胡椒，不报关纳税，请大人严查！',
            defendant: '我们都是正常贸易，所有货都在货单上，哪来的走私？',
            witness: '我上船检查过，货舱底下还有暗格。',
            statements: [
                '【船长】船长说全部货物都已报关',
                '【官兵】暗格里面搜出香料二十担',
                '【船长】船长说暗格是放淡水的',
                '【船长】船长说淡水早就用完了',
                '【船长】所有税银都已经交讫',
                '【官兵】税单上只有瓷器丝绸',
                '【船长】船长出海一向守法',
                '【船长】香料都是南洋进贡的'
            ],
            contradiction: [2, 3],
            laws: [
                {text: '私出外境货卖者，杖一百货物入官', correct: true},
                {text: '报关不实，笞五十货物一半入官', correct: false},
                {text: '水手走私，船长连坐', correct: false},
                {text: '允许民间贸易苏木胡椒', correct: false}
            ],
            difficulty: 2
        },
        {
            title: '婚姻强抢案',
            description: '民女刘氏被豪强张四强抢为妻，刘氏父亲告状，请断案。',
            plaintiff: '张四强抢小女为妻，小女不从，日夜囚禁，请大人做主！',
            defendant: '明媒正娶，彩礼已下，怎么说是强抢？',
            witness: '我亲眼看见张四带人深夜破门，把小姐抢走了。',
            statements: [
                '【被告】被告说已经下了聘礼',
                '【原告】原告说父女二人一直同居',
                '【邻居】小姐十天前还在家里织布',
                '【被告】被告说小姐自愿跟他走',
                '【邻居】邻居都看见抢人了',
                '【被告】我已经请了媒人说亲',
                '【被告】小民愿意退还所有彩礼',
                '【原告】抢婚之后小姐已经怀孕'
            ],
            contradiction: [0, 5],
            laws: [
                {text: '强夺良家妇女为妻者，绞', correct: true},
                {text: '婚娶不报官杖六十', correct: false},
                {text: '媒人说合不成不收礼', correct: false},
                {text: '民女私逃者，笞五十', correct: false}
            ],
            difficulty: 2
        },
        {
            title: '当铺失火案',
            description: '当铺夜晚失火，客人寄存的货物全部烧毁，客人要求赔偿，当铺店主不肯，请断案。',
            plaintiff: '我寄存在当铺的二十箱绸缎全部烧毁，当铺必须全额赔偿！',
            defendant: '这是天火，天降之灾，不是我故意的，不能赔这么多！',
            witness: '我看见起火是从当铺后院先烧起来的，好像有人半夜进出。',
            statements: [
                '【店主】店主说当铺一向防火严密',
                '【客人】客人说寄存单据完好无损',
                '【店主】店主说客人货物来路不正',
                '【店主】火是从隔壁店铺烧过来的',
                '【捕快】后院确有人进出痕迹',
                '【店主】店主已经投保了火险',
                '【客人】客人要求赔偿白银五百两',
                '【店主】店内伙计都睡着了没发现'
            ],
            contradiction: [4, 7],
            laws: [
                {text: '寄存物失火故意不救者，倍偿，无罪者减一半', correct: true},
                {text: '天火不可抗力，店主无需赔偿', correct: false},
                {text: '当铺着火店主全责，全额赔偿', correct: false},
                {text: '店主看守不力，笞五十', correct: false}
            ],
            difficulty: 2
        },
        {
            title: '盗挖祖坟案',
            description: '李家告赵家挖了自家祖坟，毁坏棺椁，盗走陪葬珠宝，赵家否认，请断案。',
            plaintiff: '赵家扩建田地，挖了我家祖坟，毁了棺椁，偷走陪葬，请大人严惩！',
            defendant: '我们挖地根本没挖到什么坟，这是李家诬告我们！',
            witness: '我看见了，挖出来有棺木碎片，还有金银饰品。',
            statements: [
                '【赵家】我们挖地是在自家地里',
                '【赵家】这块地几百年没人耕种',
                '【赵家】我们从来没见过什么坟',
                '【官府】挖出来确实有棺木碎片',
                '【官府】碎片上面还有李家标记',
                '【李家】李家说祖坟有金银百两',
                '【赵家】我们只是挖地不是故意挖',
                '【双方】这块地界本来就不清'
            ],
            contradiction: [2, 3],
            laws: [
                {text: '发掘他人坟冢者，杖一百徒三年', correct: true},
                {text: '无意发掘者，笞五十', correct: false},
                {text: '占地不清，各笞三十', correct: false},
                {text: '盗取陪葬财物，绞', correct: false}
            ],
            difficulty: 2
        },

        // ========== 难度 3 (困难，10句证词) ==========
        {
            title: '盐商漏税案',
            description: '两淮盐商被指漏税，盐商称已经全交，请断案。',
            plaintiff: '该盐商去年销盐三百万斤，只报了一半，漏税一半，请大人查核！',
            defendant: '我们去年只销了一百五十万斤，确实都交了税，原告诬告！',
            witness: '我在盐仓码头帮忙，看见每个月都有五六船盐出去，一年确实不止一百五十万斤。',
            statements: [
                '【盐商】去年旱灾盐减产一半',
                '【盐商】我们盐引都是按斤买的',
                '【盐商】原告是竞争对手故意陷害',
                '【证人】码头每个月出盐五六船',
                '【记账】每船装盐三万斤整',
                '【盐商】盐引税银都有税票',
                '【官府】税票数目确实一百五',
                '【盐商】盐引可以转卖他人',
                '【盐商】转卖出去的盐不算我们的',
                '【盐商】我们每年都按时查账'
            ],
            contradiction: [4, 8],
            laws: [
                {text: '盐税漏交，补税加倍，盐商杖一百', correct: true},
                {text: '转卖漏税，买者有罪，盐商无罪', correct: false},
                {text: '盐引不足额，没收余盐', correct: false},
                {text: '证人诬告，证人笞五十', correct: false}
            ],
            difficulty: 3
        },
        {
            title: '钱庄挤兑案',
            description: '钱庄老板卷款跑路，储户存的银子取不出来，告到官府，请断案。',
            plaintiff: '我们存在钱庄的银子总共十万两，老板跑了，现在锁了门，请大人做主！',
            defendant: '老板已经抓到了，老板说最近银子紧，不是不想给，只是一时周转不开。',
            witness: '我看见老板偷偷把银子运出去，连夜运去外地了，肯定想跑。',
            statements: [
                '【钱庄】钱庄账上还有储备银五万两',
                '【钱庄】最近大户提款都能兑',
                '【捕快】老板已经把资产都转移了',
                '【储户】账上储备银早空了',
                '【捕快】老板儿子还在本地买房',
                '【老板】老板说只是暂时周转',
                '【储户】储户们都恐慌挤兑',
                '【老板】如果允许延期半年肯定能兑',
                '【举报】老板已经给县官送了礼',
                '【储户】全城储户都在衙门外请愿'
            ],
            contradiction: [1, 3],
            laws: [
                {text: '私抽资本卷款跑路者，杖一百流三千里，资产查封赔给储户', correct: true},
                {text: '周转不开不算罪，延期半年慢慢还', correct: false},
                {text: '挤兑引发破产，储户自认倒霉', correct: false},
                {text: '钱庄老板笞五十，限期一年还清', correct: false}
            ],
            difficulty: 3
        },
        {
            title: '漕运沉船案',
            description: '漕运粮船沉了，损失粮食三千石，押运官说是风暴沉船，粮丁说是超载沉没，请问断案。',
            plaintiff: '押运官禀报遭风暴沉船，损失三千石，请豁免，请核销。',
            defendant: '这船本来就超载，风暴只是诱因，都是押运官为了捞私货超载！',
            witness: '我是另一船船主，那天风不大，根本掀不翻大船。',
            statements: [
                '【押运官】那天风暴很大，船被吹翻',
                '【押运官】我们按额定装载不超载',
                '【漕丁】私下装了私货一千石',
                '【押运官】私货是船老大自己拉的',
                '证人】河道水浅风浪不大',
                '【水衙】出发前检查过吃水正常',
                '【船家】船底本来就漏水',
                '【船家】出航前修补过船底',
                '【官府】捞起来只有八百石粮食',
                '【押运官】三千石都沉底了捞不上来'
            ],
            contradiction: [1, 2],
            laws: [
                {text: '漕运超载致沉，押运官杖一百追赔一半', correct: true},
                {text: '天灾沉船，豁免损失，不罪', correct: false},
                {text: '船老大私带货物，枭首示众', correct: false},
                {text: '河道官府督查不力，罚俸一年', correct: false}
            ],
            difficulty: 3
        },
        {
            title: '书院聚众案',
            description: '有人告发书院聚众讲学，诽谤朝政，书院山长否认，请断案。',
            plaintiff: '书院每天几百人聚集，批评朝政，意图不轨，请查封！',
            defendant: '我们只是讲经论道，讨论理学，从来不敢议论朝政，这是诬告。',
            witness: '我去听过课，确实有人讲当今赋税太重，官府办事不公。',
            statements: [
                '【山长】我们每月初一十五讲学一次',
                '【山长】讲的都是朱子四书五经',
                '【山长】课后从来没有人议论时政',
                '【原告】原告是被书院赶出去的学生',
                '【原告】原告怀恨在心诬告我们',
                '【山长】课堂墙上贴了禁议朝政规矩',
                '【学生】有人说当今宦官专权不好',
                '【山长】山长当场呵斥了他',
                '【山长】我们书院都是良家子弟',
                '【山长】从来没有结党聚会'
            ],
            contradiction: [6, 9],
            laws: [
                {text: '结党聚众诽谤朝政者，首犯绞，从犯发配', correct: true},
                {text: '讲学自由，诬告者反坐，原告发配', correct: false},
                {text: '山长约束不力，杖一百除名', correct: false},
                {text: '书院改建为官学，查封财产', correct: false}
            ],
            difficulty: 3
        },
        {
            title: '牙行侵吞案',
            description: '商人告牙行（中介）侵吞货款，牙行说商人欠钱不还，抵扣了，请断案。',
            plaintiff: '我把一百匹布放在牙行寄卖，卖完了牙行不给钱，侵吞了我的货款！',
            defendant: '他去年在我这里赊了一批绸缎，一直欠钱不还，我只是抵扣了欠款。',
            witness: '我是其他商人，牙行经常这么干，压着货款不给，我们都敢怒不敢言。',
            statements: [
                '【商人】布已经全部卖完三个月了',
                '【商人】货款总共三百五十贯',
                '【牙行】他确实欠我一百八十贯',
                '【牙行】有欠据为证签字画押',
                '【商人】欠据是伪造的我没签字',
                '【规矩】牙行每月都要抽成三分',
                '【商人】抽成已经扣过了',
                '【商人】牙行老板说有钱就是不给',
                '【伙计】有伙计可以作证他说过',
                '【牙行】商人确实经常欠钱不还'
            ],
            contradiction: [2, 5],
            laws: [
                {text: '牙行侵吞客商货款者，倍偿，杖六十', correct: true},
                {text: '双方债务相抵，互不追究', correct: false},
                {text: '牙行行业垄断，封闭牙行', correct: false},
                {text: '双方各打五十大板，按比例偿还', correct: false}
            ],
            difficulty: 3
        }
    ],

    /**
     * 启动游戏 - 先显示说明
     */
    start(gameView, gameState, title = null) {
        const headerTitle = title || (gameState.currentTask ? gameState.currentTask.name : '明律断案');

        let html = `
            <div style="max-height: 70vh; overflow-y: auto; padding: 0 5px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #8b4513; font-size: 28px; margin-bottom: 8px">⚖️ 明律断案</h2>
                    <p style="color: #6b5b45; font-size: 16px;">审理案件，找出证词矛盾，适用正确法律条文公正断案！</p>
                </div>

                <div style="background: #f5f0e1; padding: 18px; border-radius: 8px; margin-bottom: 16px;">
                    <h3 style="color: #8b4513; margin-top: 0; font-size: 22px; margin-bottom: 10px;">审理规则</h3>
                    <ul style="line-height: 1.7; color: #333; font-size: 18px; padding-left: 20px; margin: 0;">
                        <li>一桩命案官司摆在你面前，需要你<strong>找出两句互相矛盾的证词</strong></li>
                        <li>选出矛盾后，再从四个法律条文中选择<strong>正确的定罪条文</strong></li>
                        <li>两步全对 → 全额奖励；对一步 → 一半奖励；全错 → 少量奖励</li>
                        <li>等级越高 → 证词越多，干扰项越多，案件越复杂</li>
                    </ul>
                </div>

                <div style="text-align: center; margin-top: 20px;">
                    <button class="btn primary-btn" id="start-law-btn" style="padding: 12px 40px; font-size: 18px;">开始审理!</button>
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        document.getElementById('start-law-btn').addEventListener('click', () => {
            this.startActualGame(gameView, gameState, title);
        });
    },

    /**
     * 真正开始游戏 - 根据等级抽对应难度案件
     */
    startActualGame(gameView, gameState, title = null) {
        const task = gameState.currentTask;

        // 根据技能等级调整难度
        // Lv1: 抽难度 1，6-8句证词；Lv2: 抽难度 1-2；Lv3: 抽难度 2-3
        let skillLevel = 1;
        if (task && task.requiredSkill) {
            skillLevel = window.SkillSystem.getSkillLevel(gameState, task.requiredSkill);
        }
        // Clamp to 1-3
        skillLevel = Math.max(1, Math.min(3, skillLevel));

        // 根据等级筛选对应难度案件
        let minDifficulty = skillLevel === 1 ? 1 : skillLevel === 2 ? 1 : 2;
        let maxDifficulty = skillLevel === 1 ? 1 : skillLevel === 2 ? 2 : 3;
        let availableCases = this.casePool.filter(c => c.difficulty >= minDifficulty && c.difficulty <= maxDifficulty);

        // 如果不够就放宽
        if (availableCases.length < 3) {
            availableCases = this.casePool.filter(c => c.difficulty <= maxDifficulty);
        }

        // 随机选一个案件
        const randomCase = availableCases[Math.floor(Math.random() * availableCases.length)];

        // 打乱证词顺序
        const statements = [...randomCase.statements];
        statements.sort(() => Math.random() - 0.5);

        // 计算正确矛盾的陈述文本（因为打乱了索引，需要保存原始文本）
        const correctContradiction = randomCase.contradiction.map(idx => randomCase.statements[idx]);

        // 初始化游戏状态
        Object.assign(gameState.lawGame, {
            case: randomCase,
            statements: statements,
            selectedStatements: [],
            selectedLaw: null,
            correctContradiction: correctContradiction,
            step: 'select_contradiction', // select_contradiction -> select_law -> result
            skillLevel: skillLevel,
            isPractice: title !== null
        });

        this.renderContradictionStep(gameState, gameView);
    },

    /**
     * 渲染第一步：选择矛盾证词
     */
    renderContradictionStep(gameState, gameView, title = null) {
        const game = gameState.lawGame;
        const task = gameState.currentTask;
        const headerTitle = title ? `${title} - ${game.case.title}` : (task ? `${task.name} - ${game.case.title}` : `审理案件 - ${game.case.title}`);

        // 根据证词数量决定网格列数
        const columns = game.statements.length <= 6 ? 2 : 2;

        let html = `
            <div style="max-height: 70vh; overflow-y: auto; padding: 0 5px;">
                <div class="law-header" style="margin-bottom: 15px;">
                    <h2>${headerTitle}</h2>
                    <p>${game.case.description}</p>
                </div>
                <div class="law-case" style="background: #f5f0e1; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <div style="margin-bottom: 10px;">
                        <strong style="color: #8b4513;">原告说：</strong> ${game.case.plaintiff}
                    </div>
                    <div style="margin-bottom: 10px;">
                        <strong style="color: #8b4513;">被告说：</strong> ${game.case.defendant}
                    </div>
                    <div>
                        <strong style="color: #8b4513;">证人说：</strong> ${game.case.witness}
                    </div>
                </div>
                <div class="law-instructions" style="margin: 15px 0;">
                    <p><strong>第一步：找出两句话相互矛盾，请点击选择：</strong></p>
                    <p style="color: #666; font-size: 14px;">已选：<span id="selected-count">0</span>/2</p>
                </div>
                <div class="law-statements" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0;">
        `;

        game.statements.forEach((stmt, idx) => {
            html += `
                <button class="btn stmt-btn" data-idx="${idx}" style="text-align: left; white-space: normal; height: auto; padding: 12px;">${stmt}</button>
            `;
        });

        html += `
                </div>
                <div class="law-actions" style="margin-top: 20px;">
                    <button class="btn primary-btn" id="law-next-btn" disabled>下一步 →</button>
                </div>
            </div>
        `;

        document.getElementById('farming-game-view').innerHTML = html;
        this.bindContradictionEvents(gameState, gameView);
    },

    /**
     * 绑定事件
     */
    bindContradictionEvents(gameState, gameView) {
        const game = gameState.lawGame;
        document.querySelectorAll('.stmt-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (game.step === 'select_contradiction') {
                    this.onStatementClick(parseInt(btn.dataset.idx), gameState);
                }
            });
        });

        const nextBtn = document.getElementById('law-next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.goToStep('select_law', gameState, gameView);
            });
        }
    },

    /**
     * 点击证词
     */
    onStatementClick(idx, gameState) {
        const game = gameState.lawGame;
        const stmt = game.statements[idx];
        const btn = document.querySelector(`.stmt-btn[data-idx="${idx}"]`);

        // 已经选中，取消选择
        if (game.selectedStatements.includes(stmt)) {
            game.selectedStatements = game.selectedStatements.filter(s => s !== stmt);
            btn.style.background = '';
            btn.style.borderColor = '';
        } else {
            // 不超过两个
            if (game.selectedStatements.length >= 2) return;
            game.selectedStatements.push(stmt);
            btn.style.background = '#e8dcc8';
            btn.style.borderColor = '#8b4513';
        }

        // 更新计数
        document.getElementById('selected-count').textContent = game.selectedStatements.length;

        // 启用下一步按钮
        const nextBtn = document.getElementById('law-next-btn');
        if (nextBtn) {
            nextBtn.disabled = game.selectedStatements.length !== 2;
        }
    },

    /**
     * 进入下一步
     */
    goToStep(step, gameState, gameView) {
        const game = gameState.lawGame;
        game.step = step;

        if (step === 'select_law') {
            let headerTitle;
            if (game.isPractice) {
                headerTitle = `审理案件 - ${game.case.title}`;
            } else if (gameState.currentTask && gameState.currentTask.name) {
                headerTitle = `${gameState.currentTask.name} - ${game.case.title}`;
            } else {
                headerTitle = `审理案件 - ${game.case.title}`;
            }
            let html = `
                <div style="max-height: 70vh; overflow-y: auto; padding: 0 5px;">
                    <div class="law-header">
                        <h2>${headerTitle}</h2>
                        <p>你已选出矛盾证词，请选择应当适用的《大明律》条文：</p>
                    </div>
                    <div class="law-case" style="background: #f5f0e1; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <p><strong>你找到的矛盾：</strong></p>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            ${game.selectedStatements.map(s => `<li>${s}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="law-laws" style="display: flex; flex-direction: column; gap: 10px; margin: 15px 0;">
            `;

            game.case.laws.forEach((law, idx) => {
                html += `
                    <button class="btn law-btn" data-idx="${idx}" style="text-align: left; white-space: normal; height: auto; padding: 12px;">${law.text}</button>
                `;
            });

            html += `
                    </div>
                    <div class="law-actions" style="margin-top: 20px; display: flex; gap: 10px;">
                        <button class="btn secondary-btn" id="law-back-btn">← 返回上一步</button>
                        <button class="btn primary-btn" id="law-submit-btn" disabled>提交判决</button>
                    </div>
                </div>
            `;

            document.getElementById('farming-game-view').innerHTML = html;

            document.getElementById('law-back-btn').addEventListener('click', () => {
                this.renderContradictionStep(gameState, gameView);
            });

            document.querySelectorAll('.law-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.onLawSelect(parseInt(btn.dataset.idx), gameState);
                });
            });

            document.getElementById('law-submit-btn').addEventListener('click', () => {
                this.finish(gameState, gameView);
            });
        }
    },

    /**
     * 选择法律
     */
    onLawSelect(idx, gameState) {
        const game = gameState.lawGame;
        game.selectedLaw = idx;

        document.querySelectorAll('.law-btn').forEach(btn => {
            btn.style.background = '';
            btn.style.borderColor = '';
        });

        const selectedBtn = document.querySelector(`.law-btn[data-idx="${idx}"]`);
        selectedBtn.style.background = '#e8dcc8';
        selectedBtn.style.borderColor = '#8b4513';

        document.getElementById('law-submit-btn').disabled = false;
    },

    /**
     * 结算游戏
     */
    finish(gameState, gameView) {
        const game = gameState.lawGame;
        const task = gameState.currentTask;

        // 判分：两个矛盾都对 + 法律正确 = 100%，只对一个 = 50%，全错 = 20%
        let correctCount = 0;

        // 检查矛盾是否正确（两个都要对）
        const contradictionCorrect =
            game.selectedStatements.includes(game.correctContradiction[0]) &&
            game.selectedStatements.includes(game.correctContradiction[1]);

        if (contradictionCorrect) correctCount++;

        // 检查法律是否正确
        const lawCorrect = game.case.laws[game.selectedLaw]?.correct;
        if (lawCorrect) correctCount++;

        let ratio;
        if (correctCount === 2) ratio = 1.0;
        else if (correctCount === 1) ratio = 0.5;
        else ratio = 0.2;

        let resultTitle, resultDesc;
        if (correctCount === 2) {
            resultTitle = '✔ 断案正确！';
            resultDesc = '你成功找出了证词矛盾，并适用了正确的法律条文，断案公正严明！';
        } else if (correctCount === 1) {
            resultTitle = '⚠ 部分正确';
            resultDesc = '你找对了一部分，但仍有疏漏，虽不能全功，亦可圈可点。';
        } else {
            resultTitle = '✘ 断案有误';
            resultDesc = '你没有找出真正的矛盾，也选错了法律，此案恐成冤假错案。';
        }

        if (game.isPractice) {
            // 刑部司练习 - 非任务，固定奖励律政经验，消耗5天
            const expGained = Math.round(15 * ratio);
            gameState.addSkillExp('law', expGained);
            gameState.addLog(`审理案件练习完成！${resultTitle} 获得 ${expGained} 律政经验，消耗5天时间。`);
            gameState.advanceDays(5);
            gameState.lawGame = null;

            // 显示结果页
            let html = `
                <div class="law-result" style="text-align: center; padding: 30px; max-height: 70vh; overflow-y: auto;">
                    <h2 style="font-size: 28px; margin-bottom: 20px; color: #8b4513;">${resultTitle}</h2>
                    <p style="font-size: 16px; margin-bottom: 30px;">${resultDesc}</p>
                    <div style="background: #f5f0e1; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: left;">
                        <p><strong>正确答案：</strong></p>
                        <p style="color: #8b4513; margin: 10px 0;">▶ 矛盾证词：${game.correctContradiction[0]} 与 ${game.correctContradiction[1]}</p>
                        <p style="color: #8b4513; margin: 10px 0;">▶ 正确法律：${game.case.laws.find(l => l.correct).text}</p>
                    </div>
                    <p>获得：${expGained} 律政经验</p>
                    <div style="margin-top: 30px;">
                        <button class="btn primary-btn" id="law-done-btn">返回刑部司</button>
                    </div>
                </div>
            `;

            document.getElementById('farming-game-view').innerHTML = html;
            document.getElementById('law-done-btn').addEventListener('click', () => {
                // 返回设施场景
                gameState.currentScene = window.GameScene.FACILITY;
                gameView.renderAll();
            });
        } else {
            // 正常任务结算 - 使用新主命系统
            const template = getMissionTemplateById(gameState.currentTask.templateId) || gameState.currentTask;
            // 实际进度 = 目标值 * 完成率
            const actualProgress = Math.round(gameState.currentTask.targetValue * ratio);
            const success = actualProgress > 0;

            // 使用新的主命系统结算
            const result = gameState.completeMission(success, actualProgress);

            gameState.addLog(`【${template.name}】${resultTitle}`);

            // 显示结果页
            let html = `
                <div class="law-result" style="text-align: center; padding: 30px; max-height: 70vh; overflow-y: auto;">
                    <h2 style="font-size: 28px; margin-bottom: 20px; color: #8b4513;">${resultTitle}</h2>
                    <p style="font-size: 16px; margin-bottom: 30px;">${resultDesc}</p>
                    <div style="background: #f5f0e1; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: left;">
                        <p><strong>正确答案：</strong></p>
                        <p style="color: #8b4513; margin: 10px 0;">▶ 矛盾证词：${game.correctContradiction[0]} 与 ${game.correctContradiction[1]}</p>
                        <p style="color: #8b4513; margin: 10px 0;">▶ 正确法律：${game.case.laws.find(l => l.correct).text}</p>
                    </div>
                    <p style="margin: 10px 0;">功勋奖励：${result.meritGained > 0 ? '+' : ''}${result.meritGained}</p>
                    <div style="margin-top: 30px;">
                        <button class="btn primary-btn" id="law-done-btn">结案返回</button>
                    </div>
                </div>
            `;

            document.getElementById('farming-game-view').innerHTML = html;
            document.getElementById('law-done-btn').addEventListener('click', () => {
                // 时间推进：按任务限时推进
                window.TimeSystem.advanceDays(gameState, template.timeLimitDays);
                gameState.lawGame = null;
                gameState.currentScene = window.GameScene.CITY_VIEW;
                gameView.renderAll();
            });
        }
    }
};
