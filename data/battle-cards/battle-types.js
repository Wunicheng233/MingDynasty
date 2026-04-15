/**
 * 合战卡片类型定义 - 抽离出来让数据文件可以引用
 * Battle card types definition extracted for proper dependency order
 */

/**
 * 合战卡片颜色类型
 * green - 绿色基础卡（数字1-9，组成组合）
 * red - 红色战术卡（特殊效果）
 */
const BattleCardColor = {
    GREEN: 'green',
    RED: 'red'
};

/**
 * 合战卡片类型枚举
 */
const BattleCardTypes = {
    // 合战卡片
    BATTLE_NORMAL: 'battle_normal',       // 绿色基础数字卡
    BATTLE_TACTIC: 'battle_tactic',       // 红色战术卡
    BATTLE_ATTACK: 'battle_attack',      // 攻击（旧兼容）
    BATTLE_STRATEGY: 'battle_strategy',  // 计策（旧兼容）
    BATTLE_FORMATION: 'battle_formation', // 阵法（旧兼容）
    BATTLE_SPECIAL: 'battle_special',    // 特殊（旧兼容）
    // 个人战卡片
    DUEL_ATTACK: 'duel_attack',    // 攻击招式
    DUEL_DEFENSE: 'duel_defense',  // 防御格挡
    DUEL_SPECIAL: 'duel_special',  // 特殊必杀
};

window.BattleCardTypes = BattleCardTypes;
window.BattleCardColor = BattleCardColor;
