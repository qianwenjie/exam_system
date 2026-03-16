# 教师端系统设计方案

> **版本**: v1.0
> **创建日期**: 2026-02-03
> **状态**: 设计完成，待实施
> **设计者**: Claude Code

---

## 📋 目录

1. [需求概述](#需求概述)
2. [系统定位](#系统定位)
3. [整体架构](#整体架构)
4. [数据结构设计](#数据结构设计)
5. [页面设计](#页面设计)
6. [技术实现要点](#技术实现要点)
7. [实施计划](#实施计划)

---

## 需求概述

### 功能范围

教师端是一个独立的Web应用，面向任课教师，提供批阅和统计分析功能。

**核心功能**：
- **批阅管理**：待批阅列表、在线批阅、批注功能、评分标准、批量评分、批阅进度、AI辅助批阅
- **成绩统计**：成绩统计、成绩导出、题目分析、知识点分析、学生排名

### 用户场景

1. **批阅场景**：
   - 教师登录后查看分配给自己的批阅任务
   - 按考试批阅（逐个学生的完整试卷）
   - 客观题自动批阅，简答题手动批阅或AI批阅
   - 批阅完成后查看成绩统计

2. **统计场景**：
   - 查看已完成批阅的考试成绩
   - 分析题目正确率和区分度
   - 分析知识点掌握情况
   - 导出成绩为Excel格式

### 设计原则

- **独立系统**：与管理端物理隔离，教师专属工作台
- **任务驱动**：基于分配任务的批阅流程
- **智能批阅**：支持AI自动批阅和手动批阅两种模式
- **数据可视化**：丰富的图表展示成绩统计和分析

---

## 系统定位

### 与管理端的关系

- **物理隔离**：独立的目录结构和入口
- **数据共享**：共享后端数据（题库、试卷、考试、答卷）
- **权限隔离**：教师只能访问分配给自己的任务和数据

### 技术栈

- **前端**：HTML5 + Tailwind CSS 3.x + Vanilla JavaScript
- **数据存储**：原型阶段使用 LocalStorage，生产环境对接后端API
- **图表库**：ECharts 5.x（用于成绩统计的数据可视化）
- **图标库**：Font Awesome 6.5.1

### 目录结构

```
prototypes/
└── teacher/                    # 教师端目录
    ├── login.html             # 登录页
    ├── dashboard.html         # 首页/工作台
    ├── grading/               # 批阅模块
    │   ├── list.html         # 待批阅列表
    │   ├── in-progress.html  # 批阅中
    │   ├── completed.html    # 已完成
    │   └── grade.html        # 批阅页面
    ├── statistics/            # 成绩统计模块
    │   ├── list.html         # 考试列表
    │   ├── overview.html     # 成绩总览
    │   ├── question-analysis.html  # 题目分析
    │   └── knowledge-analysis.html # 知识点分析
    └── profile/               # 个人中心
        └── index.html
```

---
## 整体架构

### 页面结构

```
教师端
├── 首页/工作台（待办事项、快捷入口）
├── 批阅管理
│   ├── 待批阅列表
│   ├── 批阅中
│   ├── 已完成
│   └── 批阅历史
├── 成绩统计
│   ├── 考试列表
│   ├── 成绩总览
│   ├── 题目分析
│   └── 知识点分析
└── 个人中心
    ├── 个人信息
    └── 批阅设置
```

### 批阅流程

1. **任务分配模式**：系统自动将试卷分配给教师
2. **按考试批阅**：教师批阅整场考试的所有学生试卷
3. **自动批阅规则**：
   - 客观题（单选、多选、判断、填空）→ 系统自动判分
   - 简答题 → 教师手动批阅 或 AI自动批阅
4. **AI批阅模式**：完全自动模式（管理端配置，教师只读查看）

---

## 数据结构设计

### 批阅任务数据结构

```javascript
{
  id: 'task_001',
  examId: 'exam_001',              // 考试ID
  examName: '数据结构期末考试',
  paperId: 'paper_001',            // 试卷ID
  teacherId: 'teacher_001',        // 教师ID（分配的教师）
  teacherName: '王老师',
  
  // 批阅范围
  studentIds: ['stu_001', 'stu_002', ...],  // 需要批阅的学生ID列表
  totalStudents: 120,              // 总学生数
  
  // 批阅进度
  status: 'pending',               // pending/in_progress/completed
  gradedCount: 0,                  // 已批阅数量
  progress: 0,                     // 进度百分比
  
  // 时间信息
  assignTime: '2026-02-03 10:00',  // 分配时间
  deadline: '2026-02-05 18:00',    // 截止时间
  startTime: null,                 // 开始批阅时间
  completeTime: null,              // 完成时间
  
  // AI批阅配置（从考试配置继承）
  aiGradingEnabled: false,         // 是否启用AI批阅
  aiCommentEnabled: false          // 是否启用AI评语
}
```

### 学生答卷数据结构

```javascript
{
  id: 'answer_001',
  examId: 'exam_001',
  studentId: 'stu_001',
  studentName: '张三',
  studentNo: '2024001',
  
  // 答题信息
  answers: [
    {
      questionId: 'q_001',
      questionType: 'single',      // 题型
      questionContent: '题干...',
      studentAnswer: 'A',          // 学生答案
      correctAnswer: 'A',          // 正确答案
      score: 2,                    // 题目分值
      earnedScore: 2,              // 得分（自动批阅）
      isCorrect: true,             // 是否正确
      autoGraded: true             // 是否自动批阅
    },
    {
      questionId: 'q_005',
      questionType: 'essay',       // 简答题
      questionContent: '请简述...',
      standardAnswer: '参考答案...',
      scoringPoints: ['要点1', '要点2'],  // 评分要点
      studentAnswer: '学生的回答...',
      score: 10,                   // 题目分值
      earnedScore: null,           // 得分（待批阅）
      comment: null,               // 批注
      aiScore: 8,                  // AI建议分数（如果启用）
      aiComment: 'AI评语...',      // AI评语（如果启用）
      aiMatchRate: 70,             // AI匹配度（如果启用）
      autoGraded: false,           // 需要人工批阅
      gradedBy: null,              // 批阅教师ID
      gradedAt: null               // 批阅时间
    }
  ],
  
  // 成绩信息
  totalScore: 100,                 // 试卷总分
  earnedScore: null,               // 总得分（批阅完成后计算）
  objectiveScore: 60,              // 客观题得分（自动计算）
  subjectiveScore: null,           // 主观题得分（待批阅）
  
  // 状态
  gradingStatus: 'pending',        // pending/grading/completed
  submitTime: '2026-02-03 15:30'   // 交卷时间
}
```

---

## 页面设计

### 1. 首页/工作台（dashboard.html）

**设计类型**：数据概览型

**布局结构**：
- 顶部导航栏：系统名称、主菜单、用户信息
- 统计卡片（4个横排）：待批阅、已批阅、本月批阅、平均时长
- 待批阅任务列表：按截止时间排序，显示紧急/进行中状态
- 最近考试成绩：最近3场考试的成绩概览

**关键功能**：
- 任务状态标识：🔴紧急（24小时内截止）、🟡进行中、🟢待开始
- 进度显示：进度条 + 数字（35/80）
- 快捷操作：每个任务卡片都有操作按钮，一键进入批阅

---

### 2. 批阅管理模块

#### 2.1 待批阅列表（grading/list.html）

**功能**：
- 显示所有分配给教师的待批阅任务
- 筛选：按状态筛选、搜索考试名称
- 任务信息：考试名称、试卷、学生数、进度、截止时间、AI批阅状态

**操作**：
- [开始批阅] 按钮：进入批阅页面

#### 2.2 批阅中列表（grading/in-progress.html）

**功能**：
- 显示正在批阅的任务
- 进度条显示批阅进度
- 显示当前批阅到哪位学生

**操作**：
- [继续批阅] 按钮：继续批阅

#### 2.3 已完成列表（grading/completed.html）

**功能**：
- 显示已完成批阅的任务
- 筛选：按时间范围筛选
- 显示完成时间、批阅用时、平均分、及格率

**操作**：
- [查看成绩] 按钮：跳转到成绩统计页面

---

#### 2.4 批阅页面（grading/grade.html）

**核心页面**，支持两种模式：

##### 模式1：手动批阅模式（AI批阅未启用）

**布局**：
- 左侧（20%）：题目导航
  - 按题型分组显示所有题目
  - 显示每题的批阅状态和得分
  - 点击题目快速跳转
- 右侧（80%）：主体内容区
  - 学生信息：姓名、学号、进度
  - 题目内容：题干、选项、标准答案、评分要点
  - 学生答案：高亮显示
  - 评分区：得分输入、批注输入、快捷评语

**客观题显示**：
- 显示学生答案和正确答案
- 显示得分（自动批阅）
- 标记正确/错误

**简答题批阅**：
- 显示标准答案和评分要点
- 显示学生答案
- 评分区：
  - 得分输入框（满分提示）
  - 批注输入框（富文本）
  - 快捷评语按钮（常用批注模板）

**操作按钮**：
- [上一题] [下一题]：题目导航
- [上一位学生] [下一位学生]：学生导航
- [保存]：保存当前批阅进度
- [提交批阅]：完成当前学生的批阅

##### 模式2：AI批阅查看模式（AI批阅已启用）

**布局**：三栏对比布局
- 左侧（40%）：学生答案
- 中间（20%）：AI评分区
  - AI评分图标
  - 匹配度（百分比）
  - 推荐得分（大字号）
- 右侧（40%）：参考答案

**AI评语区域**：
- 独立区域显示AI的批阅意见
- 完整展示AI的评价和建议

**附件支持**：
- 如果学生上传了附件，显示附件信息
- 提供预览和下载功能

**最终得分**：
- 显示AI推荐分数（只读，教师无法修改）

**操作按钮**：
- [上一题] [下一题]：题目导航
- [上一位学生] [下一位学生]：学生导航
- [返回列表]：返回批阅列表

---

### 3. 成绩统计模块

#### 3.1 考试列表（statistics/list.html）

**功能**：
- 显示已完成批阅的考试列表
- 筛选：按状态、时间范围、关键词搜索
- 显示：考试名称、试卷、考试时间、参与学生、平均分、及格率、最高分、最低分

**操作**：
- [查看统计] 按钮：进入成绩总览页面

#### 3.2 成绩总览（statistics/overview.html）

**Tab导航**：[成绩总览] [题目分析] [知识点分析]

**统计卡片**（4个横排）：
- 平均分
- 最高分
- 最低分
- 及格率

**成绩分布图表**（ECharts柱状图）：
- X轴：分数段（0-59、60-69、70-79、80-89、90-100）
- Y轴：人数
- 显示每个分数段的人数

**学生成绩列表**：
- 表格显示：排名、学号、姓名、总分、客观题得分、主观题得分
- 分页显示
- [导出Excel] 按钮：导出成绩表

#### 3.3 题目分析（statistics/question-analysis.html）

**筛选**：
- 按题型筛选
- 按难度筛选

**题目分析列表**：
- 表格显示：题号、题型、难度、正确率、平均分、区分度
- 区分度说明：
  - 0.4以上：区分度好
  - 0.3-0.4：区分度较好
  - 0.2-0.3：区分度一般，建议优化
  - 0.2以下：区分度差，建议替换

**题目正确率分布图**（ECharts柱状图）：
- X轴：题目分组（1-10、11-20、21-30...）
- Y轴：正确率
- 直观展示各题目的正确率分布

#### 3.4 知识点分析（statistics/knowledge-analysis.html）

**知识点掌握情况雷达图**（ECharts雷达图）：
- 多维度展示各知识点的掌握情况
- 每个维度代表一个知识点
- 数值为该知识点的平均正确率

**知识点详细分析表**：
- 表格显示：知识点、题目数、平均正确率、平均分、掌握情况
- 掌握情况分类：
  - ✅ 掌握：正确率 ≥ 80%（绿色）
  - ⚠️ 一般：正确率 60%-79%（橙色）
  - ❌ 薄弱：正确率 < 60%（红色）

**教学建议**：
- 根据数据自动生成教学建议
- 突出薄弱知识点，建议加强讲解
- 突出掌握良好的知识点，可作为教学案例

---

### 4. 个人中心（profile/index.html）

**基本信息**：
- 头像、姓名、工号、手机、邮箱
- [更换头像] 功能

**批阅设置**：
- 快捷评语管理：添加、编辑、删除常用评语
- 批阅偏好：
  - ☑️ 自动保存批阅进度（每5分钟）
  - ☑️ 批阅完成后发送通知
  - ☐ 显示其他教师的批阅参考

**我的统计**：
- 本月批阅场次
- 累计批阅场次
- 平均批阅时长
- 批阅效率对比

**安全设置**：
- [修改密码]
- [退出登录]

---

## 技术实现要点

### 1. 批阅状态管理

```javascript
// 批阅任务状态
const GRADING_STATUS = {
  PENDING: 'pending',          // 待批阅
  IN_PROGRESS: 'in_progress',  // 批阅中
  COMPLETED: 'completed'       // 已完成
};

// 自动保存机制
let autoSaveTimer = null;
function enableAutoSave() {
  autoSaveTimer = setInterval(() => {
    saveGradingProgress();
  }, 5 * 60 * 1000); // 每5分钟自动保存
}
```

### 2. AI批阅模式判断

```javascript
// 根据考试配置决定显示模式
function renderGradingPage(exam, studentAnswer) {
  if (exam.aiGradingEnabled) {
    // 显示AI批阅查看模式（只读）
    renderAIGradingView(studentAnswer);
  } else {
    // 显示手动批阅模式（可编辑）
    renderManualGradingView(studentAnswer);
  }
}
```

### 3. 成绩统计图表

```javascript
// 使用 ECharts 渲染图表
function renderScoreDistribution(scores) {
  const chart = echarts.init(document.getElementById('chart'));
  const option = {
    xAxis: { data: ['0-59', '60-69', '70-79', '80-89', '90-100'] },
    yAxis: {},
    series: [{ type: 'bar', data: calculateDistribution(scores) }]
  };
  chart.setOption(option);
}
```

---

### 4. 错误处理

```javascript
// 保存失败处理
function saveGrading(data) {
  try {
    localStorage.setItem('grading_draft', JSON.stringify(data));
    showMessage('保存成功', 'success');
  } catch (error) {
    showMessage('保存失败，请检查浏览器存储空间', 'error');
    offerDataExport(data);
  }
}

// 数据加载失败处理
function loadGradingTask(taskId) {
  const task = getTaskById(taskId);
  if (!task) {
    showMessage('批阅任务不存在或已被删除', 'error');
    redirectTo('/teacher/grading/list.html');
    return;
  }
  // 继续加载...
}
```

### 5. 性能优化

**分页加载**：
```javascript
// 学生列表分页加载，避免一次性渲染大量数据
const PAGE_SIZE = 20;
function loadStudentList(page = 1) {
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const students = allStudents.slice(start, end);
  renderStudentList(students);
}
```

**图表懒加载**：
```javascript
// 仅在切换到统计Tab时才渲染图表
function onTabChange(tabName) {
  if (tabName === 'statistics' && !chartRendered) {
    renderCharts();
    chartRendered = true;
  }
}
```

**LocalStorage 优化**：
```javascript
// 定期清理过期的草稿数据
function cleanupOldDrafts() {
  const drafts = JSON.parse(localStorage.getItem('grading_drafts') || '{}');
  const now = Date.now();
  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
  
  Object.keys(drafts).forEach(key => {
    if (now - drafts[key].timestamp > ONE_WEEK) {
      delete drafts[key];
    }
  });
  
  localStorage.setItem('grading_drafts', JSON.stringify(drafts));
}
```

### 6. 用户体验优化

**批阅进度提示**：
```javascript
// 离开页面前提示保存
window.addEventListener('beforeunload', (e) => {
  if (hasUnsavedChanges()) {
    e.preventDefault();
    e.returnValue = '您有未保存的批阅内容，确定要离开吗？';
  }
});
```

**快捷键支持**：
```javascript
// 批阅页面快捷键
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey) {
    switch(e.key) {
      case 's': // Ctrl+S 保存
        e.preventDefault();
        saveGrading();
        break;
      case 'ArrowLeft': // Ctrl+← 上一题
        e.preventDefault();
        gotoPreviousQuestion();
        break;
      case 'ArrowRight': // Ctrl+→ 下一题
        e.preventDefault();
        gotoNextQuestion();
        break;
    }
  }
});
```

---

### 7. 响应式设计

**断点设置**：
```css
/* 移动端 < 768px */
@media (max-width: 767px) {
  /* 批阅页面：题目导航折叠为顶部Tab */
  /* 统计卡片：4个卡片改为2x2布局 */
  /* 表格：横向滚动 */
}

/* 平板端 768px - 1024px */
@media (min-width: 768px) and (max-width: 1024px) {
  /* 批阅页面：题目导航宽度调整为15% */
  /* AI批阅对比：三栏改为上下布局 */
}

/* 桌面端 > 1024px */
@media (min-width: 1025px) {
  /* 批阅页面：题目导航20%，内容区80% */
  /* AI批阅对比：左中右三栏布局 */
  /* 统计卡片：4个卡片横排 */
}
```

---

## 实施计划

### 核心页面清单（共11个页面）

| 模块 | 页面 | 文件路径 | 优先级 |
|------|------|----------|--------|
| 登录 | 登录页 | teacher/login.html | P0 |
| 首页 | 工作台 | teacher/dashboard.html | P0 |
| 批阅管理 | 待批阅列表 | teacher/grading/list.html | P0 |
| 批阅管理 | 批阅中列表 | teacher/grading/in-progress.html | P0 |
| 批阅管理 | 已完成列表 | teacher/grading/completed.html | P0 |
| 批阅管理 | 批阅页面 | teacher/grading/grade.html | P0 |
| 成绩统计 | 考试列表 | teacher/statistics/list.html | P0 |
| 成绩统计 | 成绩总览 | teacher/statistics/overview.html | P0 |
| 成绩统计 | 题目分析 | teacher/statistics/question-analysis.html | P1 |
| 成绩统计 | 知识点分析 | teacher/statistics/knowledge-analysis.html | P1 |
| 个人中心 | 个人中心 | teacher/profile/index.html | P1 |

### 开发阶段

**阶段1：基础框架（P0）**
- 登录页
- 首页/工作台
- 批阅管理列表页（待批阅、批阅中、已完成）

**阶段2：核心功能（P0）**
- 批阅页面（手动批阅模式）
- 批阅页面（AI批阅查看模式）
- 成绩统计（考试列表、成绩总览）

**阶段3：分析功能（P1）**
- 题目分析页面
- 知识点分析页面
- 个人中心页面

**阶段4：优化完善**
- 响应式适配
- 性能优化
- 用户体验优化

### 预计工作量

- **阶段1**：2-3天
- **阶段2**：3-4天
- **阶段3**：2-3天
- **阶段4**：1-2天
- **总计**：8-12天

---

## 附录

### 数据流图

```
教师登录
  ↓
查看待批阅任务（从管理端分配）
  ↓
选择任务，进入批阅页面
  ↓
加载学生答卷数据
  ├─ 客观题：已自动批阅，显示得分
  └─ 简答题：
     ├─ AI批阅已启用 → 显示AI评分和评语（只读）
     └─ AI批阅未启用 → 显示批阅界面（可打分）
  ↓
批阅简答题（如果需要）
  ├─ 输入得分
  ├─ 输入批注
  └─ 保存（自动保存 + 手动保存）
  ↓
完成批阅
  ├─ 计算总分
  ├─ 更新批阅状态
  └─ 通知学生（如果配置了）
  ↓
查看成绩统计
  ├─ 成绩总览
  ├─ 题目分析
  └─ 知识点分析
```

### 数据权限控制

- 教师只能看到分配给自己的批阅任务
- 教师只能查看已完成批阅的考试成绩
- 教师无法修改考试配置和试卷内容
- 教师无法访问题库管理功能

---

**文档结束**

