/**
 * 文本格式化工具
 * 提供阿拉伯数字转繁体中文数字、银两格式化等功能
 */

const TextFormatter = {
    // 中文数字映射
    chineseNumbers: [
        '零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖',
        '拾', '佰', '仟', '萬', '亿'
    ],

    /**
     * 阿拉伯数字转繁体中文数字（支持整数）
     * @param {number} num - 阿拉伯数字
     * @returns {string} 繁体中文数字
     */
    numberToChinese(num) {
        num = Math.floor(num);

        // 特殊处理：洪武元年
        if (num === 0) return '元';
        // 零
        if (num === 0) return this.chineseNumbers[0];

        // 特殊处理 1-99 让更符合文言习惯
        if (num > 0 && num < 100) {
            if (num === 10) return '拾'; // 十年直接说拾，不说壹拾
            const ten = Math.floor(num / 10);
            const one = num % 10;
            let result = '';
            if (ten > 0) {
                result += ten === 1 ? '拾' : this.chineseNumbers[ten] + '拾';
            }
            if (one > 0) {
                result += this.chineseNumbers[one];
            }
            return result;
        }

        const units = ['', '拾', '佰', '仟', '萬', '拾', '佰', '仟', '亿'];
        let result = '';
        let str = num.toString();
        let len = str.length;

        for (let i = 0; i < len; i++) {
            let digit = parseInt(str[i]);
            let unitIndex = len - i - 1;
            if (digit !== 0) {
                result += this.chineseNumbers[digit] + units[unitIndex];
            } else {
                // 避免连续多个零，简化处理直接保留一个零
                if (result.slice(-1) !== this.chineseNumbers[0]) {
                    result += this.chineseNumbers[0];
                }
            }
        }

        // 去掉末尾多余的零
        while (result.slice(-1) === this.chineseNumbers[0] && result.length > 1) {
            result = result.slice(0, -1);
        }

        return result;
    },

    /**
     * 格式化银两显示
     * 进位规则：1两 = 1000贯，1贯 = 1000钱
     * @param {number} totalMoney - 总钱数（底层单位：钱）
     * @returns {string} 格式化后的 "xx两xx贯xx钱"
     */
    formatMoney(totalMoney) {
        if (totalMoney === 0) return '零钱';

        const liang = Math.floor(totalMoney / (1000 * 1000));
        const remainingAfterLiang = totalMoney % (1000 * 1000);
        const guan = Math.floor(remainingAfterLiang / 1000);
        const qian = remainingAfterLiang % 1000;

        let parts = [];
        if (liang > 0) {
            parts.push(`${this.numberToChinese(liang)}两`);
        }
        if (guan > 0) {
            parts.push(`${this.numberToChinese(guan)}贯`);
        }
        if (qian > 0 || (liang === 0 && guan === 0)) {
            parts.push(`${this.numberToChinese(qian)}钱`);
        }

        return parts.join('');
    }
};

export default TextFormatter;
window.TextFormatter = TextFormatter;
