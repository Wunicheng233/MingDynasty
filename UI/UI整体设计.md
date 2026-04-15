# 《洪武立志传》整体 UI 设计规范

> 版本：1.0.0
> 适用范围：游戏全局视觉风格、设计令牌（Design Tokens）、基础组件库
> 关联文档：各界面详细设计文档将继承并扩展本规范

---

## 1. 设计理念与核心原则

### 1.1 设计理念
**“纸墨之间的王朝”** —— 游戏 UI 旨在将玩家带入一个由宣纸、墨迹、朱砂和古铜构筑的明朝世界。界面不是冷冰冰的数据面板，而是一幅幅可以交互的古籍画卷。

### 1.2 核心设计原则
| 原则 | 说明 |
|------|------|
| **古风沉浸优先** | 色彩、字体、质感均需服务于“明代书卷”氛围，避免现代感元素 |
| **信息清晰可读** | 在追求风格的同时，确保游戏数据（银两、兵力、属性）一目了然 |
| **克制装饰** | 装饰元素（印章、云纹、栏线）点到为止，不可干扰核心操作 |
| **一致性** | 所有界面遵循本规范定义的设计令牌，由 AI 生成时保持统一 |

### 1.3 视觉情绪板关键词
- 宣纸 · 墨色 · 朱砂 · 古铜
- 版刻 · 卷轴 · 印章 · 栏线
- 温润 · 庄重 · 书卷气 · 岁月感

---

## 2. 设计令牌

### 2.1 色彩系统

| 令牌名称 | 色值 | 用途 |
|----------|------|------|
| `--color-bg-primary` | `#F9F4E8` | 页面全局背景（宣纸底） |
| `--color-bg-secondary` | `#FDFBF7` | 卡片、面板背景（牙色） |
| `--color-bg-dark` | `#3E2C23` | 沉浸式弹窗背景（古籍深底） |
| `--color-text-primary` | `#2C1A14` | 主标题、正文（墨色） |
| `--color-text-secondary` | `#5A4A3E` | 辅助说明、次要文字（淡墨） |
| `--color-text-tertiary` | `#8A7A6A` | 占位符、禁用文字 |
| `--color-text-inverse` | `#FDFBF7` | 深色背景上的文字 |
| `--color-accent-primary` | `#9E2A2B` | 主品牌色（朱砂红）：主按钮、标题点缀、选中态 |
| `--color-accent-gold` | `#C5A059` | 辅品牌色（古铜金）：荣誉标识、高级边框 |
| `--color-accent-blue` | `#3A526B` | 黛蓝：次要文本、图标、链接 |
| `--color-accent-green` | `#2D6A4F` | 青碧：成功、增益、正向状态 |
| `--color-accent-orange` | `#A0522D` | 赭石：警告、负面状态 |
| `--color-border-default` | `#D9CDB8` | 默认边框、分割线（淡墨） |
| `--color-border-highlight` | `#9E2A2B` | 选中/聚焦边框 |
| `--color-border-gold` | `#C5A059` | 特殊荣誉边框 |

#### 阴影令牌
| 令牌名称 | 值 | 用途 |
|----------|-----|------|
| `--shadow-sm` | `0 2px 4px rgba(80,60,40,0.06)` | 轻微悬浮（卡片嵌入感） |
| `--shadow-md` | `0 4px 8px rgba(80,60,40,0.10)` | 标准卡片阴影 |
| `--shadow-lg` | `0 8px 16px rgba(40,25,10,0.15)` | 模态框、下拉菜单 |
| `--shadow-xl` | `0 12px 24px rgba(40,25,10,0.20)` | 全局提示、最高层级 |

### 2.2 字体系统

| 令牌名称 | 字体栈 | 用途 |
|----------|--------|------|
| `--font-serif` | `"Source Han Serif SC", "Noto Serif SC", "Songti SC", serif` | 正文、标题（默认） |
| `--font-calligraphy` | `"Aa润行体", "禹卫书法行书", "华文楷体", "KaiTi", cursive` | 主标题、印章文字（降级方案为楷体） |
| `--font-mono` | `"Courier New", "Source Han Serif SC", monospace` | 数值、银两、兵力等需要对齐的数据 |

#### 字号与字重令牌
| 令牌名称 | 字号 | 字重 | 行高 | 用途 |
|----------|------|------|------|------|
| `--text-display` | 36px | 700 | 1.3 | 界面主标题（如“洪武立志传”） |
| `--text-heading-lg` | 28px | 600 | 1.3 | 章节大标题 |
| `--text-heading-md` | 22px | 600 | 1.4 | 卡片内主标题（如人物姓名） |
| `--text-heading-sm` | 18px | 600 | 1.4 | 小标题 |
| `--text-body` | 16px | 400 | 1.5 | 正文、描述 |
| `--text-body-sm` | 14px | 400 | 1.4 | 辅助信息、数值 |
| `--text-button` | 16px | 500 | 1.2 | 按钮文字 |
| `--text-caption` | 12px | 500 | 1.2 | 标签、角标 |
| `--text-stamp` | 10px | 400 | 1.0 | 印章文字 |

### 2.3 间距系统
基础单位：8px

| 令牌名称 | 值 | 用途 |
|----------|-----|------|
| `--space-xs` | 4px | 极小间距（图标与文字） |
| `--space-sm` | 8px | 小间距（同类元素间隙） |
| `--space-md` | 12px | 中等间距（组内间隙） |
| `--space-lg` | 16px | 大间距（卡片内边距） |
| `--space-xl` | 20px | 特大间距（卡片外边距） |
| `--space-2xl` | 24px | 区块间距 |
| `--space-3xl` | 32px | 章节间距 |
| `--space-4xl` | 40px | 页面级大留白 |

### 2.4 圆角系统
| 令牌名称 | 值 | 用途 |
|----------|-----|------|
| `--radius-none` | 0 | 分隔线、表格 |
| `--radius-xs` | 2px | 印章、极小标签 |
| `--radius-sm` | 4px | 按钮、输入框、标签 |
| `--radius-md` | 6px | 标准卡片 |
| `--radius-lg` | 8px | 大卡片、模态框 |

### 2.5 边框系统
| 令牌名称 | 样式 | 用途 |
|----------|------|------|
| `--border-default` | `1px solid var(--color-border-default)` | 标准边框 |
| `--border-highlight` | `1px solid var(--color-border-highlight)` | 高亮边框 |
| `--border-gold` | `1px solid var(--color-border-gold)` | 荣誉边框 |
| `--border-double` | `1px solid var(--color-border-default) + inset 0 0 0 1px rgba(255,255,240,0.8)` | 双层边框（仿版刻） |
| `--border-dashed` | `1px dashed var(--color-border-default)` | 占位区域边框 |

### 2.6 过渡与动画
| 令牌名称 | 值 | 用途 |
|----------|-----|------|
| `--transition-fast` | `150ms ease` | 悬停、焦点切换 |
| `--transition-base` | `250ms ease` | 卡片展开、弹窗出现 |
| `--transition-slow` | `350ms ease` | 页面切换、卷轴展开 |

---

## 3. 基础组件库

> 以下为全局可复用的基础组件样式定义，各界面设计文档应直接引用或在此基础扩展。

### 3.1 按钮

#### 主要按钮（朱砂）
- 类名参考：`.btn-primary`
- 背景：`var(--color-accent-primary)`
- 文字：`var(--color-text-inverse)`
- 内边距：`10px 24px`
- 圆角：`var(--radius-sm)`
- 边框：`1px solid #7A1F20`（加深边缘）
- 阴影：`var(--shadow-sm)`
- 悬停：背景 `#7A1F20`，阴影 `var(--shadow-md)`
- 禁用：透明度 0.5

#### 次要按钮（墨色描边）
- 类名参考：`.btn-secondary`
- 背景：透明
- 文字：`var(--color-text-primary)`
- 边框：`var(--border-default)`
- 悬停：背景 `rgba(158,42,43,0.05)`，边框 `var(--color-accent-primary)`

#### 文字按钮
- 类名参考：`.btn-text`
- 文字：`var(--color-accent-primary)`
- 内边距：`4px 8px`
- 悬停：下划线 `1px solid var(--color-accent-gold)`

#### 按钮尺寸变体
| 尺寸 | 内边距 | 字号 |
|------|--------|------|
| 小 `sm` | `6px 16px` | `--text-body-sm` |
| 中 `md`（默认） | `10px 24px` | `--text-button` |
| 大 `lg` | `12px 32px` | `--text-heading-sm` |

### 3.2 卡片

#### 标准卡片
- 类名参考：`.card`
- 背景：`var(--color-bg-secondary)`
- 边框：`var(--border-default)`
- 圆角：`var(--radius-md)`
- 阴影：`var(--shadow-md)`
- 内边距：`var(--space-lg)`（16px）

#### 荣誉卡片（金边）
- 类名参考：`.card-gold`
- 扩展自 `.card`
- 边框：`var(--border-gold)`
- 背景：`linear-gradient(135deg, #FDFBF7 0%, #FFF9ED 100%)`

#### 深色沉浸卡片
- 类名参考：`.card-dark`
- 背景：`var(--color-bg-dark)`
- 文字：`var(--color-text-inverse)`
- 边框：`1px solid rgba(197,160,89,0.3)`

### 3.3 表单元素

#### 输入框
- 类名参考：`.input`
- 背景：`var(--color-bg-secondary)`
- 边框：`var(--border-default)`
- 圆角：`var(--radius-sm)`
- 内边距：`8px 12px`
- 聚焦：边框 `var(--color-accent-primary)`，外发光 `0 0 0 3px rgba(158,42,43,0.15)`
- 占位符：`var(--color-text-tertiary)`

#### 下拉选择
- 继承 `.input` 样式
- 右侧自定义箭头图标（墨色）

#### 复选框 / 单选框
- 未选中：`var(--border-default)` 背景 `var(--color-bg-secondary)`
- 选中：背景 `var(--color-accent-primary)`，内部白色对勾

### 3.4 标签与徽章

#### 基础标签
- 类名参考：`.badge`
- 内边距：`2px 8px`
- 圆角：`var(--radius-sm)`
- 字号：`var(--text-caption)`
- 字重：500

#### 标签变体
| 变体 | 背景 | 文字 | 边框 |
|------|------|------|------|
| 默认 | `var(--color-bg-secondary)` | `var(--color-text-primary)` | `var(--border-default)` |
| 朱砂 | `rgba(158,42,43,0.15)` | `var(--color-accent-primary)` | `1px solid rgba(158,42,43,0.3)` |
| 古铜 | `rgba(197,160,89,0.15)` | `var(--color-accent-gold)` | `1px solid rgba(197,160,89,0.3)` |
| 青碧（成功） | `rgba(45,106,79,0.15)` | `var(--color-accent-green)` | `1px solid rgba(45,106,79,0.3)` |
| 赭石（警告） | `rgba(160,82,45,0.15)` | `var(--color-accent-orange)` | `1px solid rgba(160,82,45,0.3)` |

### 3.5 导航栏

#### 顶部导航栏
- 类名参考：`.navbar`
- 背景：`rgba(249,244,232,0.85)` + `backdrop-filter: blur(8px)`
- 底部边框：`var(--border-default)`
- 高度：64px
- 内边距：0 `var(--space-xl)`

#### 导航项
- 类名参考：`.nav-item`
- 文字：`var(--text-body)`，颜色 `var(--color-text-primary)`
- 内边距：`8px 16px`
- 悬停：文字 `var(--color-accent-primary)`
- 激活态：文字 `var(--color-accent-primary)`，底部 `2px solid var(--color-accent-primary)` 下划线

### 3.6 模态框
- 类名参考：`.modal`
- 背景：`var(--color-bg-secondary)`
- 圆角：`var(--radius-lg)`
- 阴影：`var(--shadow-lg)`
- 内边距：`var(--space-xl)`（20px）
- 标题：`--text-heading-md`，颜色 `var(--color-text-primary)`
- 遮罩层：`rgba(0,0,0,0.4)` + `backdrop-filter: blur(2px)`

### 3.7 工具提示
- 类名参考：`.tooltip`
- 背景：`var(--color-bg-dark)`
- 文字：`var(--color-text-inverse)`
- 圆角：`var(--radius-sm)`
- 内边距：`4px 8px`
- 字号：`var(--text-body-sm)`
- 箭头：使用伪元素实现小三角，颜色同背景

---

## 4. 装饰元素规范

### 4.1 印章效果
- 类名参考：`.stamp`
- 背景：`var(--color-accent-primary)`
- 文字：`var(--color-text-inverse)`，字体 `--font-calligraphy`，字号 `--text-stamp`
- 内边距：`4px 8px`
- 圆角：`var(--radius-xs)`
- 可选旋转：`transform: rotate(-5deg)`
- 典型文字内容：“敕令”、“已阅”、“御批”等

### 4.2 古籍栏线（分隔线）
- 类名参考：`.divider`
- 基础样式：`border-top: var(--border-default)`
- 双栏线：`.divider-double` 添加 `border-bottom: 1px solid rgba(255,255,240,0.8)`
- 带装饰分隔线：中间可加入小菱形或云纹图标

### 4.3 卷轴展开效果
- 用于界面切换或重要内容展示
- 使用 `clip-path` 或高度动画模拟卷轴由上而下展开
- 过渡时长：`var(--transition-slow)`

---

## 5. 布局规范

### 5.1 画轴式居中布局
- 内容容器最大宽度：`1200px`
- 水平居中，左右自动边距
- 背景为宣纸底，两侧留白逐渐增加（移动端 `16px`，桌面端 `auto`）

### 5.2 网格系统
- 采用 12 列网格，列间距 `--space-lg`（16px）
- 常用布局：
  - 单列：人物详情、设置页
  - 双列：人物对比、卡牌详情+列表
  - 三列：人物收集网格、社交界面
  - 四列：宽屏下的图鉴展示

### 5.3 响应式断点
| 断点名称 | 宽度范围 | 网格列数 | 容器内边距 |
|----------|----------|----------|------------|
| 手机 | < 640px | 4 列 | `16px` |
| 平板 | 640px - 1024px | 8 列 | `24px` |
| 桌面 | ≥ 1024px | 12 列 | `32px` |

---

## 6. 图标规范

### 6.1 风格
- 采用**线性图标**，描边宽度 2px
- 默认颜色：`var(--color-text-primary)`（墨色）
- 选中/悬停色：`var(--color-accent-primary)`（朱砂）
- 图标造型应简化，避免过于复杂的细节，可融入云纹、回纹等传统纹样元素

### 6.2 常用图标尺寸
| 场景 | 尺寸 |
|------|------|
| 行内图标 | 16x16px |
| 按钮内图标 | 20x20px |
| 导航图标 | 24x24px |
| 功能入口图标 | 32x32px |
| 空状态插画 | 80x80px 以上 |

---

## 7. 动效规范

| 动效类型 | 描述 | 时长 | 缓动函数 |
|----------|------|------|----------|
| 悬停反馈 | 卡片阴影增强、按钮颜色变化 | `--transition-fast` | ease |
| 弹窗出现 | 透明度 0→1，轻微上浮 | `--transition-base` | ease-out |
| 弹窗消失 | 透明度 1→0，轻微下沉 | `--transition-base` | ease-in |
| 页面切换 | 卷轴展开/收起效果 | `--transition-slow` | ease-in-out |
| 列表项进入 | 交错淡入上浮（stagger） | `300ms` 延迟递增 | ease-out |

---

## 8. 写作与语气规范

- **界面文案**：采用半文言或古风白话，如“招募贤才”、“传唤”、“批阅奏折”，避免现代网络用语。
- **按钮文字**：动词为主，简洁有力（如“出征”、“任命”、“赏赐”）。
- **提示信息**：正式、有礼，如“陛下，暂无新的奏折”。
- **数字与单位**：银两使用“两”，兵力使用“人”，后不加空格。

---

## 9. 对于 AI 编程助手的指引

当基于本规范生成界面代码时，请遵循以下规则：

1. **优先使用设计令牌变量**：颜色、间距、字体等应使用 `var(--token-name)` 形式，便于全局切换。
2. **组件化思维**：优先复用基础组件库中的样式，如需定制，请在界面设计文档中明确说明差异。
3. **语义化 HTML**：使用恰当的标签（`<header>`, `<main>`, `<section>`, `<article>`），并添加合适的 `aria-label`。
4. **移动优先**：先实现移动端布局，再通过媒体查询增强桌面端。
5. **保留古风细节**：在条件允许的情况下，为卡片添加双层边框、为特定标题使用书法字体、在角落添加印章装饰。
6. **测试深色模式**：深色背景区域（如 `.card-dark`）需确保文字对比度符合 WCAG AA 标准。

---

## 10. 版本记录

| 版本 | 日期 | 修改内容 | 作者 |
|------|------|----------|------|
| 1.0.0 | 2026-04-15 | 初始版本，定义整体视觉风格和设计令牌 | UI 设计师 |