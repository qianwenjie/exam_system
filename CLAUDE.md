# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个**考试系统的产品设计与原型开发项目**，包含需求分析、功能设计和前端原型实现。

### 项目目标
构建一个高效、易用的考试系统，包含题库管理、试卷组卷、考试管理等核心模块。

### 当前状态
- **阶段**: 原型开发中
- **版本**: v0.8.0
- **进度**: 管理端 85% 完成，教师端 100% 完成，学生手机端 100% 完成，学生PC端 100% 完成
- **核心文档**: `考试系统功能清单.md`（v2.0，按端整理）

## 项目结构

```
考试系统设计/
├── 考试系统功能清单.md         # 主功能清单（v2.0，按端整理）
├── progress.md                  # 进度跟踪文档
├── CLAUDE.md                    # 项目上下文（本文件）
├── docs/
│   ├── design/                  # 设计文档
│   └── reports/                 # 完成报告
│       ├── phase1-completion-report.md
│       └── phase2-completion-report.md
├── prototypes/
│   ├── IMPLEMENTATION_STATUS.md # 实施状态文档
│   ├── design-guide.md          # 设计规范
│   ├── components.md            # 组件文档
│   ├── admin/                   # 管理端（HTML + Tailwind）
│   │   ├── dashboard.html       # 首页
│   │   ├── cockpit.html         # 领导驾驶舱
│   │   ├── ai-assistant.html    # AI助手
│   │   ├── question-bank/       # 题库模块
│   │   ├── paper/               # 试卷模块
│   │   ├── exam/                # 考试模块
│   │   └── practice/            # 刷题模块（管理端）
│   ├── teacher/                 # 教师端（HTML + Tailwind）
│   │   ├── login.html
│   │   ├── dashboard.html
│   │   ├── grading.html         # 阅卷（在线）
│   │   ├── grading-doc.html     # 阅卷（文档）
│   │   └── grade.html           # 成绩查看
│   ├── student-mobile/          # 学生手机端（Vue 3 + Vant）
│   └── student-pc/              # 学生PC端（Vue 3 + Element Plus）
└── 参考资料/                    # 原始需求和参考文档
```

## 核心模块与完成状态

### 管理端

| 模块 | 状态 | 说明 |
|------|------|------|
| 首页 Dashboard | ✅ | 数据概览、AI对话框、主题切换 |
| 领导驾驶舱 | ✅ | 数据大屏、动态动画 |
| AI 助手 | ✅ | 自然语言、智能推荐、偏好管理 |
| 题库模块 | ✅ 95% | 列表/录入/编辑/查重/导出/AI出题；导入🚧 |
| 试卷模块 | ✅ | 列表/新建/手动组卷/文档模式/随机抽题/预览 |
| 考试模块 | ✅ | 列表/创建/监控/考生管理/阅卷/成绩 |
| 刷题模块 | ✅ | 任务列表/新建/统计/学生管理 |

### 教师端

| 模块 | 状态 | 说明 |
|------|------|------|
| 登录 | ✅ | |
| 首页 | ✅ | 待阅卷任务、数据概览 |
| 阅卷（在线） | ✅ | 主观题评分 |
| 阅卷（文档） | ✅ | 文档模式评分 |
| 成绩查看 | ✅ | |

### 学生手机端 / 学生PC端

两端功能基本对齐，详见 `考试系统功能清单.md`。

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

### 管理端 / 教师端
- **HTML5 + Tailwind CSS 3.x + Vanilla JS**
- **ECharts 5.x**（统计图表）
- **Font Awesome 6.5.1**（图标）

### 学生手机端
- **Vue 3 + Vite + Pinia + Vue Router**
- **Vant 4.9**（移动端 UI）

### 学生PC端
- **Vue 3 + Vite + Pinia + Vue Router**
- **Element Plus**（PC端 UI）

### 数据存储（原型阶段）
- **LocalStorage** + **Mock Data**

### 设计规范
- **主色调**: #00B96B（绿色）
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

- **[功能清单](./考试系统功能清单.md)** - 完整功能清单（v2.0，按端整理）
- **[实施状态](./prototypes/IMPLEMENTATION_STATUS.md)** - 详细功能完成状态
- **[进度跟踪](./progress.md)** - 开发进度和操作日志
- **[设计规范](./prototypes/design-guide.md)** - UI/UX 设计指南
- **[Phase 1 完成报告](./docs/reports/phase1-completion-report.md)**
- **[Phase 2 完成报告](./docs/reports/phase2-completion-report.md)**
- **[用户偏好系统指南](./docs/design/user-preference-system-guide.md)**

## 快速定位

### 管理端
- 题目列表: `prototypes/admin/question-bank/list.html`
- 题目录入: `prototypes/admin/question-bank/add.html`
- 知识点管理: `prototypes/admin/question-bank/categories.html`
- AI助手: `prototypes/admin/ai-assistant.html`（NLPProcessor / UserPreferenceManager / ConversationManager）
- 试卷管理: `prototypes/admin/paper/`
- 考试管理: `prototypes/admin/exam/`

### 学生PC端
- 路由配置: `prototypes/student-pc/src/router/index.js`
- 主布局: `prototypes/student-pc/src/layouts/MainLayout.vue`
- 统计布局: `prototypes/student-pc/src/layouts/StatsLayout.vue`

### 学生手机端
- 路由配置: `prototypes/student-mobile/src/router/index.js`
- 主布局: `prototypes/student-mobile/src/layouts/`

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
