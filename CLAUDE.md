# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个**考试系统的产品设计与原型开发项目**，包含需求分析、功能设计和前端原型实现。

### 项目目标
构建一个高效、易用的考试系统，包含题库管理、试卷组卷、考试管理等核心模块。

### 当前状态
- **阶段**: 原型开发中
- **版本**: v0.7.0
- **进度**: 题库模块 98% 完成，AI助手模块 100% 完成，学生手机端原型 100% 完成，学生PC端原型 100% 完成
- **核心文档**: `考试系统功能清单.md`、`prototypes/IMPLEMENTATION_STATUS.md`

## 项目结构

```
考试系统设计/
├── 考试系统功能清单.md         # 主功能清单文档（完整需求）
├── progress.md                  # 进度跟踪文档
├── CLAUDE.md                    # 项目上下文（本文件）
├── docs/                        # 文档目录
│   ├── phase2-completion-report.md  # Phase 2 完成报告
│   └── user-preference-system-guide.md  # 用户偏好系统指南
├── prototypes/                  # 原型文件目录
│   ├── IMPLEMENTATION_STATUS.md # 实施状态文档（详细功能完成情况）
│   ├── design-guide.md          # 设计规范
│   ├── components.md            # 组件文档
│   ├── assets/                  # 静态资源
│   │   └── images/              # 图片资源
│   └── admin/                   # 管理端原型
│       ├── dashboard.html       # 首页 ✅
│       ├── ai-assistant.html    # AI助手 ✅
│       └── question-bank/       # 题库模块
│           ├── list.html        # 题目列表 ✅
│           ├── add.html         # 添加/编辑题目 ✅
│           ├── add-simple.html  # 简便录入 ✅
│           ├── detail.html      # 题目详情 ✅
│           ├── categories.html  # 知识点管理 ✅
│           ├── statistics.html  # 题库统计 ✅
│           ├── duplicate-check.html # 题目查重 ✅
│           ├── export.html      # 题目导出 ✅
│           ├── ai-generate.html # AI出题 ✅
│           └── import.html      # 题目导入 🚧
└── 参考资料/                    # 原始需求和参考文档
    ├── 功能清单.xlsx             # Excel 格式功能清单
    ├── 简便录入规则.docx         # 简便录入格式规范
    └── *.png                     # UI 参考截图
```

## 核心模块与完成状态

### 题库模块 ✅ 95%

#### 已完成功能
- ✅ **知识点目录管理**: 树形结构、增删改查、搜索
- ✅ **题目列表**: 筛选（题型/难度/知识点）、搜索、分页
- ✅ **题目录入（标准）**: 支持7种题型（单选、多选、判断、填空、简答、完形填空、复合题）
- ✅ **题目录入（简便）**: 文本解析录入、批量导入
- ✅ **题目编辑**: 复用录入页面，支持所有字段修改
- ✅ **题目删除**: 带确认提示，引用检查
- ✅ **题目预览**: 详情页完整展示
- ✅ **题型设置**: 内置题型重命名、自定义题型创建
- ✅ **题库统计**: 题型分布、难度分布（基础版）
- ✅ **题目查重**: 相似度检测、批量处理
- ✅ **题目导出**: 按知识点导出、答案配置
- ✅ **AI出题**: AI生成题目（模拟）

#### 进行中功能
- 🚧 **题目导入**: 页面框架已完成（20%）

#### 待开发功能
- ⏳ **批量操作**: 批量删除、修改（P1）

### 试卷模块 🟡 10%
- 仅列表页框架，核心功能未开发

### 考试模块 🟡 10%
- 仅列表页框架，核心功能未开发

### 刷题模块 🟡 10%
- 仅列表页框架，核心功能未开发

### AI助手模块 ✅ 100%

#### 已完成功能
- ✅ **自然语言理解**: 解析用户输入，识别意图和参数
- ✅ **智能对话**: 多轮对话，上下文理解
- ✅ **题目生成**: 基于参数生成题目（模拟）
- ✅ **用户偏好管理**: 记录和分析用户行为
- ✅ **智能推荐**: 基于历史数据的个性化推荐
- ✅ **行为分析**: 时间模式、知识点关注、常用组合分析
- ✅ **数据迁移**: 版本检查、数据验证、自动迁移

#### 核心特性
- **自然语言处理**: 支持多种表达方式
- **参数识别**: 题型、难度、数量、知识点
- **智能补全**: 自动补全缺失参数
- **个性化推荐**: 基于用户历史行为
- **数据持久化**: LocalStorage 存储
- **版本管理**: 自动数据迁移

## 题型支持

### 基础题型（5种）
1. **单选题**: 多个选项选一个
2. **多选题**: 多个选项选多个
3. **判断题**: 对/错二选一
4. **填空题**: 空位填写答案
5. **简答题**: 文字作答

### 特殊题型
6. **完形填空**: 题干中标记空位，每个空位对应ABCDE选项
7. **复合题**: 材料 + 多个子题目（阅读理解、材料分析、综合应用）

## 技术栈

### 前端
- **HTML5**: 页面结构
- **Tailwind CSS 3.x**: 样式框架
- **Font Awesome 6.5.1**: 图标库
- **Vanilla JavaScript**: 交互逻辑
- **ECharts 5.x**: 图表库（统计页面）

### 数据存储（原型阶段）
- **LocalStorage**: 题目数据、题型配置、知识点结构
- **Mock Data**: JavaScript 对象模拟后端数据

### 设计规范
- **主色调**: #00B96B（绿色）
- **题型颜色**: info(青)、purple(紫)、indigo(靛)、warning(橙)、amber(琥珀)
- **响应式**: 移动端 < 768px，平板 768-1024px，桌面 > 1024px

## 优先级标记

| 标记 | 含义 |
|------|------|
| P0 | 核心功能，MVP 必须实现 |
| P1 | 重要功能，第二迭代 |
| P2 | 增强功能，后续迭代 |

## 工作流程

### Git 提交规范
- 使用语义化提交信息
- 格式: `feat: v版本号 - 简要描述`
- 示例: `feat: v0.1.5 - 补全题目列表功能`

### 版本管理
- **v0.0.x**: 基础版本
- **v0.1.x**: 题库模块开发
- **v0.2.x**: 题库模块完善
- **v0.3.x**: 试卷模块开发
- **v0.4.x+**: 其他模块开发

### 文档更新
更新功能时需同步更新：
1. `prototypes/IMPLEMENTATION_STATUS.md` - 实施状态
2. `progress.md` - 进度记录
3. Git 提交信息

## 数据结构示例

### 题目数据结构
```javascript
{
  id: 'Q001',
  type: 'single',              // 题型
  typeName: '单选题',
  content: '题干内容...',       // 题干
  options: [                   // 选项（选择题）
    {label: 'A', text: '选项A'},
    {label: 'B', text: '选项B'}
  ],
  correctAnswers: ['A'],       // 正确答案
  explanation: '解析内容...',   // 解析
  difficulty: 2,               // 难度（1-5）
  difficultyName: '二级',
  score: '2',                  // 分值
  knowledgeIds: ['kp001'],     // 知识点ID列表
  knowledgePath: '计算机基础 / 数据结构',
  tags: ['链表', '数组'],      // 标签
  createTime: '2026-01-20 10:00',
  author: '张老师',
  useCount: 5                  // 使用次数
}
```

### 知识点数据结构
```javascript
{
  id: 'kp001',
  name: '计算机基础',
  parentId: null,              // 父节点ID
  level: 1,                    // 层级
  children: [...],             // 子节点
  questionCount: 156           // 题目数量
}
```

### 题型配置数据结构
```javascript
{
  modifiedDefaultTypes: {      // 内置题型修改记录
    'single': {
      customName: '单项选择',
      description: '描述...'
    }
  },
  customQuestionTypes: [       // 自定义题型
    {
      id: 'custom_001',
      name: '情境选择题',
      baseType: 'single',
      description: '...',
      icon: 'fa-lightbulb',
      color: 'amber'
    }
  ]
}
```

### 用户偏好数据结构
```javascript
{
  userId: 'default_user',
  version: '1.0',

  // 基础偏好统计
  basicPreferences: {
    questionType: {
      'single': { count: 45, percentage: 0.45 },
      'multiple': { count: 20, percentage: 0.20 },
      // ... 其他题型
    },
    difficulty: {
      '1': { count: 5, percentage: 0.05 },
      '2': { count: 15, percentage: 0.15 },
      '3': { count: 50, percentage: 0.50 },
      // ... 其他难度
    },
    quantity: {
      total: 1000,
      average: 10,
      mostCommon: 10,
      distribution: { '5': 10, '10': 70, '15': 15, '20': 5 }
    },
    knowledgePoints: {
      '数据结构': { count: 40, percentage: 0.40 },
      // ... 其他知识点
    }
  },

  // 场景偏好
  scenarioPreferences: {
    'generate_questions': {
      lastUsed: '2026-02-03T10:30:00',
      frequency: 100,
      lastParams: { type: 'single', count: 10, difficulty: 3 },
      commonConfig: { type: 'single', difficulty: 3, count: 10 }
    }
  },

  // 行为模式
  behaviorPatterns: {
    timePatterns: {
      weekday: { samples: 80, avgDifficulty: 3.2, avgCount: 10, commonType: 'single' },
      weekend: { samples: 20, avgDifficulty: 2.8, avgCount: 15, commonType: 'multiple' }
    },
    knowledgePointFocus: {
      recent: ['数据结构', '算法', '数据库'],
      trending: '数据结构'
    },
    commonCombinations: [
      { type: 'single', difficulty: 3, knowledgePoint: '数据结构', frequency: 30 }
    ]
  },

  // 对话风格偏好
  conversationStyle: {
    verbosity: 'normal',
    confirmationNeeded: true,
    preferQuickActions: false
  },

  // 元数据
  metadata: {
    totalActions: 100,
    firstActionDate: '2026-01-01T00:00:00',
    lastActionDate: '2026-02-03T10:30:00',
    totalQuestionsGenerated: 1000
  }
}
```

## 注意事项

### 开发规范
- 所有文档使用中文
- 功能清单遵循现有的表格格式和章节结构
- 数据模型使用树形结构表示实体关系
- 业务流程使用 Mermaid flowchart 语法

### 数据持久化限制
- 原型阶段使用 LocalStorage
- 数据仅在同一浏览器有效
- 跨浏览器/设备数据不同步
- 清除浏览器数据会丢失所有数据

### 已知问题
1. **图片上传**: 仅为模拟功能，未实现真实上传
2. **权限控制**: 无权限验证，所有功能均可访问
3. **富文本编辑器**: 使用基础 contenteditable，功能有限
4. **性能优化**: 大数据量时可能有性能问题

## 常用命令

### 查看文件列表
```bash
find prototypes/admin -type f -name "*.html" | sort
```

### 查看 Git 状态
```bash
git status
git log --oneline -5
```

### 查看代码行数
```bash
wc -l prototypes/admin/question-bank/*.html
```

## 相关文档

- **[功能清单](./考试系统功能清单.md)** - 完整的功能需求文档
- **[实施状态](./prototypes/IMPLEMENTATION_STATUS.md)** - 详细的功能完成状态
- **[进度跟踪](./progress.md)** - 开发进度和操作日志
- **[设计规范](./prototypes/design-guide.md)** - UI/UX 设计指南
- **[组件文档](./prototypes/components.md)** - 组件使用说明
- **[Phase 2 完成报告](./docs/phase2-completion-report.md)** - AI助手智能化升级 Phase 2 完成报告
- **[用户偏好系统指南](./docs/user-preference-system-guide.md)** - 用户偏好管理系统使用指南

## 快速定位

### 题目列表相关
- 主页面: `prototypes/admin/question-bank/list.html`
- 题型设置: list.html 中的 Modal（行 ~500-700）
- 筛选功能: list.html 中的 Filter（行 ~200-400）
- 分页控件: list.html 底部（行 ~370-400）

### 题目录入相关
- 录入页面: `prototypes/admin/question-bank/add.html`
- 题型列表: add.html 左侧 aside（行 ~216-247）
- 表单区域: add.html 主内容区（行 ~268+）
- 复合题处理: add.html 中的 compositeQuestionContainer

### 知识点管理
- 管理页面: `prototypes/admin/question-bank/categories.html`
- 树形结构渲染: categories.html 中的 renderKnowledgeTree 函数

### AI助手相关
- 主页面: `prototypes/admin/ai-assistant.html`
- 自然语言处理: NLPProcessor 类（行 ~400-800）
- 用户偏好管理: UserPreferenceManager 类（行 ~800-1500）
- 对话管理: ConversationManager 类（行 ~1500-2000）
- 偏好数据结构: getDefaultPreferences 方法（行 ~810-880）
- 智能推荐: getSmartRecommendations 方法（行 ~1200-1400）

## 最近更新

### v0.7.0 - 学生PC端原型完整版 (2026-03-16)

**更新内容**:
1. ✅ 考试模块：考试列表、详情、答题、文档答题、成绩、试卷回顾
2. ✅ 刷题模块：刷题列表、答题、错题本、收藏夹、刷题统计
3. ✅ 统计模块：成绩统计（左侧列表+右侧分析面板）、刷题统计
4. ✅ 消息中心：考试/成绩/刷题通知，未读角标
5. ✅ 个人中心：姓名、用户名、手机号展示
6. ✅ 人脸识别、反作弊支持

**技术栈**:
- Vue 3 + Vite + Pinia + Element Plus
- 路径: `prototypes/student-pc/`

---

### v0.6.0 - 学生手机端原型完整版 (2026-02-27)

**更新内容**:
1. ✅ 考试模块：考试列表、详情、抽题答题、文档模式答题、成绩统计、试卷回顾
2. ✅ 刷题模块：刷题列表、答题、错题本、错题复习、错题回顾、收藏夹、刷题统计
3. ✅ 消息中心：全部/考试/成绩/刷题通知分类，tab横向滚动修复
4. ✅ 个人中心：个人信息、设置页面
5. ✅ 反作弊：随机抓拍、最短答题时间、倒计时自动交卷
6. ✅ UI优化：考试列表移除状态竖条、倒计时左置、个人中心移除顶部标题栏

**技术栈**:
- Vue 3 + Vite + Pinia + Vue Router
- Vant 4.9（移动端 UI 组件库）
- 路径: `prototypes/student-mobile/`

**统计**:
- 新增文件: 70个
- 代码行数: +29,354
- Git 提交: `168b879` (合并提交)

---

### v0.5.0 - AI助手智能化升级完整版 (2026-02-04)

**更新内容**:
1. ✅ 完成用户偏好管理系统（UserPreferenceManager）
2. ✅ 实现智能推荐引擎
3. ✅ 实现行为模式分析（时间模式、知识点关注、常用组合）
4. ✅ 实现数据验证和版本迁移机制
5. ✅ 完成综合测试（15+ 测试用例）
6. ✅ 创建完整技术文档
7. ✅ Dashboard UI增强（AI对话框、动画效果）
8. ✅ 深色主题支持
9. ✅ 混合题型识别功能

**AI助手新增功能**:
- 偏好记录: 自动追踪用户操作习惯
- 行为分析: 识别使用模式和规律
- 智能推荐: 基于历史数据的个性化建议
- 数据迁移: 版本检查和自动迁移
- 数据验证: 完整性和正确性检查
- 混合题型: 一次生成多种题型

**Dashboard新增功能**:
- AI对话框: 快捷输入和建议chips
- 重新设计的AI助手按钮: 渐变图标+动画
- 功能卡片动画: 入场、悬停、脉冲、闪烁
- 领导驾驶舱动画: 扫描线、数据流动、光晕
- 科技风动态背景: 网格、光效、粒子
- 主题切换: 完整的深色/浅色主题

**技术亮点**:
- 多维度推荐算法（基础偏好 40% + 时间模式 30% + 知识点关注 20% + 常用组合 10%）
- 置信度评分系统
- 健壮的错误处理和数据恢复
- 自动备份损坏数据
- GPU加速的动画效果
- 响应式设计和性能优化

**文档**:
- Phase 1 完成报告: `docs/phase1-completion-report.md`
- Phase 2 完成报告: `docs/phase2-completion-report.md`
- 用户偏好系统指南: `docs/user-preference-system-guide.md`
- 混合题型功能文档: `docs/mixed-type-feature.md`

**统计**:
- 新增文件: 23个
- 代码行数: +14,157 / -1,389
- 提交数: 101个

**Git 提交**: `075b52b` (合并提交)
**Git 标签**: `v0.5.0`

### v0.1.6 (2026-01-22)

**更新日期**: 2026-01-22

1. ✅ 修复复合题预览错误（增强子题类型处理）
2. ✅ 修复完形填空预览错误（排除 cloze 类型的复合题路由）
3. ✅ 完善完形填空预览功能（显示选项和正确答案）
4. ✅ 修复简答题无法编辑的问题（统一 essay → shortAnswer 类型）
5. ✅ 移除简便录入页面的"检查刷新"按钮和返回箭头

**Git 提交**: `a3b5c2c`

---

IMPORTANT: this context may or may not be relevant to your tasks. You should not respond to this context unless it is highly relevant to your task.
