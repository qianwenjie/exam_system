# 学生端手机端考试功能设计方案

> **文档版本**: v1.0
> **创建日期**: 2026-02-03
> **设计范围**: 学生端考试功能（完整流程）
> **技术栈**: Vue 3 + Vite + Vant 4 + Pinia

---

## 📋 目录

1. [项目概述](#项目概述)
2. [技术架构](#技术架构)
3. [项目结构](#项目结构)
4. [页面流程设计](#页面流程设计)
5. [核心功能详解](#核心功能详解)
6. [数据结构设计](#数据结构设计)
7. [API接口设计](#api接口设计)
8. [状态管理设计](#状态管理设计)
9. [技术实现要点](#技术实现要点)
10. [下一步计划](#下一步计划)

---

## 项目概述

### 1.1 设计目标

为考试系统开发**学生端手机端应用**，实现完整的考试功能，包括：
- 考试列表查看
- 人脸识别验证
- 在线答题（支持7种题型）
- 答题卡导航
- 倒计时提醒
- 交卷确认
- 成绩查看
- 批阅详情查看

### 1.2 用户场景

**目标用户**: 学生/考生
**使用设备**: 手机（iOS/Android）
**核心诉求**:
- 便捷参加考试
- 流畅的答题体验
- 清晰的成绩反馈
- 详细的错题解析

### 1.3 设计原则

- ✅ **移动优先**: 专为手机端优化的UI和交互
- ✅ **流程清晰**: 引导式的考试流程，降低操作门槛
- ✅ **数据安全**: 答题数据本地缓存 + 自动同步
- ✅ **离线容错**: 网络断开时保存答案，恢复后同步
- ✅ **性能优化**: 大题量试卷的流畅加载和切换

---

## 技术架构

### 2.1 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.4+ | 前端框架 |
| Vite | 5.0+ | 构建工具 |
| Vant | 4.8+ | 移动端UI组件库 |
| Pinia | 2.1+ | 状态管理 |
| Vue Router | 4.2+ | 路由管理 |
| Axios | 1.6+ | HTTP请求 |

### 2.2 核心依赖

```json
{
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",
    "vant": "^4.8.0",
    "axios": "^1.6.0",
    "@vant/touch-emulator": "^1.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "vite": "^5.0.0",
    "unplugin-vue-components": "^0.26.0",
    "unplugin-auto-import": "^0.17.0"
  }
}
```

### 2.3 项目位置

```
考试系统设计/
└── prototypes/
    ├── admin/              # 管理端（已有）
    └── student-mobile/     # 学生端手机端（新建）
```

**说明**: 学生端作为独立子项目，与管理端并列，便于独立开发和部署。

---
## 项目结构

### 3.1 目录结构

```
student-mobile/
├── public/
│   └── favicon.ico
├── src/
│   ├── api/                    # API 接口
│   │   ├── exam.js             # 考试相关接口
│   │   ├── answer.js           # 答题相关接口
│   │   └── face.js             # 人脸识别接口
│   ├── assets/                 # 静态资源
│   │   ├── images/
│   │   └── styles/
│   │       └── global.css      # 全局样式
│   ├── components/             # 公共组件
│   │   ├── QuestionCard/       # 题目卡片组件
│   │   │   ├── SingleChoice.vue    # 单选题
│   │   │   ├── MultipleChoice.vue  # 多选题
│   │   │   ├── TrueFalse.vue       # 判断题
│   │   │   ├── FillBlank.vue       # 填空题
│   │   │   ├── ShortAnswer.vue     # 简答题
│   │   │   ├── Cloze.vue           # 完形填空
│   │   │   └── Composite.vue       # 复合题
│   │   ├── AnswerSheet/        # 答题卡组件
│   │   │   └── index.vue
│   │   ├── Timer/              # 倒计时组件
│   │   │   └── index.vue
│   │   └── FaceCapture/        # 人脸拍照组件
│   │       └── index.vue
│   ├── router/                 # 路由配置
│   │   └── index.js
│   ├── stores/                 # Pinia 状态管理
│   │   ├── exam.js             # 考试状态
│   │   ├── answer.js           # 答题状态
│   │   └── user.js             # 用户状态
│   ├── utils/                  # 工具函数
│   │   ├── storage.js          # LocalStorage 封装
│   │   ├── time.js             # 时间处理
│   │   ├── validator.js        # 答案校验
│   │   └── request.js          # Axios 封装
│   ├── views/                  # 页面组件
│   │   ├── exam/
│   │   │   ├── ExamList.vue        # 考试列表
│   │   │   ├── ExamDetail.vue      # 考试详情
│   │   │   ├── FaceVerify.vue      # 人脸识别
│   │   │   ├── ExamPaper.vue       # 答题页面
│   │   │   ├── ExamResult.vue      # 考试成绩
│   │   │   └── ExamReview.vue      # 查看批阅
│   │   └── Home.vue                # 首页
│   ├── App.vue
│   └── main.js
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

### 3.2 核心文件说明

| 文件/目录 | 说明 |
|----------|------|
| `api/` | API 接口封装，统一管理后端请求 |
| `components/QuestionCard/` | 7种题型的答题组件，支持展示和作答 |
| `components/AnswerSheet/` | 答题卡弹窗，显示答题进度和快速跳转 |
| `components/Timer/` | 倒计时组件，支持时间到自动交卷 |
| `stores/exam.js` | 考试状态管理（考试信息、试卷数据） |
| `stores/answer.js` | 答题状态管理（答案数据、答题进度） |
| `utils/storage.js` | LocalStorage 封装，支持答案持久化 |
| `views/exam/` | 考试相关的所有页面组件 |

---
## 页面流程设计

### 4.1 完整业务流程图

```
考试列表 → 考试详情 → 人脸识别 → 答题页面 → 交卷确认 → 提交成功 → 查看成绩 → 批阅详情
   ↓          ↓          ↓          ↓          ↓          ↓          ↓          ↓
 筛选Tab    状态检查    验证3次    答题卡      未答提示    等待批阅    排名信息    答案解析
 搜索       倒计时      重试机制    倒计时      时间检查    成绩公布    得分详情    教师批注
```

### 4.2 页面路由设计

| 路由路径 | 页面组件 | 页面名称 | 说明 |
|---------|---------|---------|------|
| `/` | Home.vue | 首页 | 入口页面 |
| `/exam/list` | ExamList.vue | 考试列表 | 展示所有可参加的考试 |
| `/exam/detail/:id` | ExamDetail.vue | 考试详情 | 显示考试完整信息 |
| `/exam/face-verify/:id` | FaceVerify.vue | 人脸识别 | 进入考试前的身份验证 |
| `/exam/paper/:id` | ExamPaper.vue | 答题页面 | 在线答题主页面 |
| `/exam/result/:id` | ExamResult.vue | 考试成绩 | 显示考试成绩和统计 |
| `/exam/review/:id` | ExamReview.vue | 批阅详情 | 查看每道题的批阅情况 |

### 4.3 页面跳转逻辑

**考试列表 → 考试详情**
- 触发：点击考试卡片
- 参数：考试ID
- 逻辑：无条件跳转

**考试详情 → 人脸识别**
- 触发：点击"开始考试"按钮
- 条件：
  - 考试状态为"进行中"
  - 学生未参加过该考试
  - 考试配置开启了人脸识别
- 逻辑：检查条件后跳转

**人脸识别 → 答题页面**
- 触发：人脸识别验证成功
- 条件：识别通过
- 逻辑：自动跳转，加载试卷数据

**答题页面 → 交卷确认**
- 触发：点击"交卷"按钮 或 时间到
- 条件：无（弹窗确认）
- 逻辑：显示确认弹窗

**交卷确认 → 提交成功**
- 触发：确认交卷
- 条件：达到最短交卷时间
- 逻辑：提交答案，显示成功页面

**提交成功 → 考试成绩**
- 触发：点击"查看成绩"或成绩公布后
- 条件：成绩已公布
- 逻辑：跳转到成绩页面

**考试成绩 → 批阅详情**
- 触发：点击"查看批阅详情"
- 条件：试卷已批阅完成
- 逻辑：跳转到详情页面

---
## 核心功能详解

### 5.1 考试列表（ExamList.vue）

**功能描述**:
- 展示学生可参加的所有考试
- 按状态分类（未开始/进行中/已结束）
- 显示考试基本信息和个人参与状态

**UI组件**:
- `van-tabs`: Tab切换（全部/未开始/进行中/已结束）
- `van-list`: 列表展示，支持下拉刷新
- `van-card`: 考试卡片
- `van-count-down`: 倒计时组件（未开始的考试）

**数据字段**:
```javascript
{
  id: 'E001',
  name: '数据结构期末考试',
  startTime: '2026-02-03 14:00',
  endTime: '2026-02-03 16:00',
  duration: 120,  // 作答时长（分钟）
  status: 'in_progress',  // not_started | in_progress | ended
  myStatus: 'not_started',  // not_started | in_progress | submitted
  score: null,  // 成绩（已结束且已批阅）
  totalScore: 100
}
```

**交互逻辑**:
1. 页面加载时请求考试列表
2. 根据 Tab 筛选不同状态的考试
3. 点击考试卡片跳转到详情页
4. 下拉刷新更新列表数据

---

### 5.2 考试详情（ExamDetail.vue）

**功能描述**:
- 显示考试完整信息（时间、时长、试卷、规则）
- 根据考试状态显示不同操作按钮
- 考试须知和注意事项

**UI组件**:
- `van-cell-group`: 信息展示
- `van-button`: 操作按钮
- `van-notice-bar`: 考试须知
- `van-count-down`: 开考倒计时

**数据字段**:
```javascript
{
  // 基础信息
  id: 'E001',
  name: '数据结构期末考试',
  startTime: '2026-02-03 14:00',
  endTime: '2026-02-03 16:00',
  duration: 120,
  
  // 试卷信息
  paper: {
    name: '数据结构期末试卷A卷',
    totalScore: 100,
    questionCount: 50,
    questionTypes: [
      { type: 'single', count: 20, score: 40 },
      { type: 'multiple', count: 10, score: 30 },
      { type: 'shortAnswer', count: 5, score: 30 }
    ]
  },
  
  // 考试设置
  config: {
    lateLimit: 15,  // 允许迟到分钟数
    minSubmitTime: 30,  // 最短交卷时间
    faceRecognition: true,  // 是否开启人脸识别
    randomCapture: true,  // 是否随机抓拍
    captureInterval: 5  // 抓拍间隔（分钟）
  }
}
```

**交互逻辑**:
1. 根据考试状态显示不同按钮：
   - 未开始：显示倒计时
   - 进行中：显示"开始考试"按钮
   - 已结束：显示"查看成绩"按钮
2. 点击"开始考试"检查是否需要人脸识别
3. 如需人脸识别，跳转到人脸识别页面
4. 如不需要，直接跳转到答题页面

---
### 5.3 人脸识别（FaceVerify.vue）

**功能描述**:
- 调用手机摄像头拍照
- 模拟人脸识别验证（原型阶段）
- 失败重试机制（最多3次）

**UI组件**:
- `video`: HTML5 视频流（摄像头预览）
- `canvas`: 拍照截图
- `van-button`: 开始识别按钮
- `van-dialog`: 识别结果提示

**实现逻辑**:
```javascript
// 1. 调用摄像头
navigator.mediaDevices.getUserMedia({ video: true })

// 2. 拍照
canvas.getContext('2d').drawImage(video, 0, 0)

// 3. 模拟识别（原型阶段）
const mockVerify = () => {
  return Math.random() > 0.3  // 70%成功率
}

// 4. 重试机制
let retryCount = 0
const maxRetry = 3
```

**交互逻辑**:
1. 页面加载时请求摄像头权限
2. 显示实时视频流预览
3. 点击"开始识别"按钮拍照
4. 显示识别中动画（1-2秒）
5. 返回识别结果：
   - 成功：跳转到答题页面
   - 失败：显示失败原因，允许重试
   - 超过3次：提示联系监考老师

---

### 5.4 答题页面（ExamPaper.vue）

**功能描述**:
- 展示题目并支持作答
- 支持7种题型的答题交互
- 答题卡快速导航
- 倒计时提醒
- 自动保存答案

**UI组件**:
- `van-nav-bar`: 顶部导航（考试名称 + 倒计时）
- `QuestionCard`: 题目卡片组件（动态加载不同题型）
- `van-button`: 上一题/下一题/标记按钮
- `van-action-sheet`: 答题卡弹窗
- `van-dialog`: 交卷确认弹窗

**数据结构**:
```javascript
{
  examId: 'E001',
  paperId: 'P001',
  questions: [
    {
      id: 'Q001',
      type: 'single',  // 题型
      order: 1,  // 题号
      content: '题干内容',
      options: [
        { label: 'A', text: '选项A' },
        { label: 'B', text: '选项B' }
      ],
      score: 2
    }
  ],
  answers: {
    'Q001': 'A',  // 单选题答案
    'Q002': ['A', 'B'],  // 多选题答案
    'Q003': true,  // 判断题答案
    'Q004': ['答案1', '答案2'],  // 填空题答案
    'Q005': '简答题答案文本'  // 简答题答案
  },
  marked: ['Q001', 'Q005'],  // 标记的题目ID
  startTime: '2026-02-03 14:05:00',  // 开始答题时间
  remainingTime: 7200  // 剩余秒数
}
```

**核心功能**:

**1. 题目切换**:
- 上一题/下一题按钮
- 答题卡点击跳转
- 支持手势滑动切换（可选）

**2. 答案保存**:
```javascript
// 自动保存到 LocalStorage
const saveAnswer = (questionId, answer) => {
  answers[questionId] = answer
  localStorage.setItem(`exam_${examId}_answers`, JSON.stringify(answers))
}

// 定时同步到服务器（每30秒）
setInterval(() => {
  syncAnswersToServer()
}, 30000)
```

**3. 倒计时**:
```javascript
// 倒计时逻辑
const countdown = () => {
  remainingTime--
  if (remainingTime <= 0) {
    autoSubmit()  // 时间到自动交卷
  } else if (remainingTime <= 300) {
    showWarning()  // 剩余5分钟提醒
  }
}
```

**4. 网络断开处理**:
```javascript
// 监听网络状态
window.addEventListener('offline', () => {
  showToast('网络已断开，答案将保存在本地')
})

window.addEventListener('online', () => {
  showToast('网络已恢复，正在同步答案...')
  syncAnswersToServer()
})
```

---
### 5.5 题型组件详解

**5.5.1 单选题（SingleChoice.vue）**
```vue
<template>
  <van-radio-group v-model="answer">
    <van-radio
      v-for="option in question.options"
      :key="option.label"
      :name="option.label"
    >
      {{ option.label }}. {{ option.text }}
    </van-radio>
  </van-radio-group>
</template>
```

**5.5.2 多选题（MultipleChoice.vue）**
```vue
<template>
  <van-checkbox-group v-model="answer">
    <van-checkbox
      v-for="option in question.options"
      :key="option.label"
      :name="option.label"
    >
      {{ option.label }}. {{ option.text }}
    </van-checkbox>
  </van-checkbox-group>
</template>
```

**5.5.3 判断题（TrueFalse.vue）**
```vue
<template>
  <van-radio-group v-model="answer">
    <van-radio :name="true">正确</van-radio>
    <van-radio :name="false">错误</van-radio>
  </van-radio-group>
</template>
```

**5.5.4 填空题（FillBlank.vue）**
```vue
<template>
  <div v-for="(blank, index) in blanks" :key="index">
    <p>第 {{ index + 1 }} 空：</p>
    <van-field
      v-model="answer[index]"
      placeholder="请输入答案"
    />
  </div>
</template>
```

**5.5.5 简答题（ShortAnswer.vue）**
```vue
<template>
  <div>
    <van-field
      v-model="answer.text"
      type="textarea"
      rows="6"
      placeholder="请输入答案"
    />
    <van-uploader
      v-model="answer.files"
      :max-count="3"
      :after-read="afterRead"
    >
      <van-button icon="plus" type="primary">上传附件</van-button>
    </van-uploader>
  </div>
</template>
```

**5.5.6 完形填空（Cloze.vue）**
```vue
<template>
  <div>
    <p>{{ question.content }}</p>
    <div v-for="(blank, index) in question.blanks" :key="index">
      <p>第 {{ index + 1 }} 空：</p>
      <van-radio-group v-model="answer[index]">
        <van-radio
          v-for="option in blank.options"
          :key="option.label"
          :name="option.label"
        >
          {{ option.label }}. {{ option.text }}
        </van-radio>
      </van-radio-group>
    </div>
  </div>
</template>
```

**5.5.7 复合题（Composite.vue）**
```vue
<template>
  <div>
    <!-- 材料 -->
    <div class="material">
      <h4>【材料】</h4>
      <p>{{ question.material }}</p>
    </div>
    
    <!-- 子题目 -->
    <div
      v-for="(subQuestion, index) in question.subQuestions"
      :key="subQuestion.id"
      class="sub-question"
    >
      <h5>{{ question.order }}-{{ index + 1 }}. {{ subQuestion.content }}</h5>
      <component
        :is="getQuestionComponent(subQuestion.type)"
        :question="subQuestion"
        v-model="answer[subQuestion.id]"
      />
    </div>
  </div>
</template>
```

---

### 5.6 答题卡组件（AnswerSheet）

**功能描述**:
- 显示所有题目的答题状态
- 快速跳转到指定题目
- 统计答题进度

**UI布局**:
```vue
<template>
  <van-action-sheet v-model:show="show" title="答题卡">
    <!-- 进度条 -->
    <div class="progress">
      <p>进度：{{ answeredCount }}/{{ totalCount }} ({{ progress }}%)</p>
      <van-progress :percentage="progress" />
    </div>
    
    <!-- 题型分组 -->
    <div v-for="group in questionGroups" :key="group.type">
      <h4>{{ group.typeName }} ({{ group.count }}题)</h4>
      <div class="question-grid">
        <div
          v-for="q in group.questions"
          :key="q.id"
          :class="getQuestionClass(q)"
          @click="jumpToQuestion(q.order)"
        >
          {{ q.order }}
        </div>
      </div>
    </div>
    
    <!-- 图例 -->
    <div class="legend">
      <span class="answered">■ 已答</span>
      <span class="unanswered">□ 未答</span>
      <span class="marked">■ 标记</span>
    </div>
  </van-action-sheet>
</template>
```

**状态样式**:
```javascript
const getQuestionClass = (question) => {
  if (question.marked) return 'marked'  // 橙色
  if (question.answered) return 'answered'  // 绿色
  return 'unanswered'  // 灰色
}
```

---
### 5.7 考试成绩（ExamResult.vue）

**功能描述**:
- 显示考试成绩和排名
- 成绩统计分析
- 跳转到批阅详情

**UI组件**:
- `van-circle`: 环形进度条（显示分数）
- `van-progress`: 进度条（客观题/主观题得分）
- `van-cell-group`: 排名信息
- `van-button`: 查看详情按钮

**数据结构**:
```javascript
{
  examId: 'E001',
  studentId: 'S001',
  totalScore: 85,
  fullScore: 100,
  objectiveScore: 40,  // 客观题得分
  objectiveFullScore: 40,
  subjectiveScore: 45,  // 主观题得分
  subjectiveFullScore: 60,
  rank: {
    class: { rank: 5, total: 120 },
    grade: { rank: 28, total: 500 }
  },
  duration: 85,  // 答题用时（分钟）
  avgDuration: 90,  // 平均用时
  publishTime: '2026-02-03 16:00'
}
```

**交互逻辑**:
1. 检查成绩是否已公布
2. 如未公布，显示等待状态和预计公布时间
3. 如已公布，显示完整成绩信息
4. 点击"查看批阅详情"跳转到详情页

---

### 5.8 批阅详情（ExamReview.vue）

**功能描述**:
- 查看每道题的得分和批阅情况
- 查看正确答案和解析
- 查看教师批注（主观题）

**UI组件**:
- `van-tabs`: Tab筛选（全部/答对/答错/未答）
- `van-collapse`: 折叠面板（题目列表）
- `van-tag`: 标签（得分、正确/错误）
- `van-image`: 图片预览（附件）

**数据结构**:
```javascript
{
  examId: 'E001',
  questions: [
    {
      id: 'Q001',
      type: 'single',
      order: 1,
      content: '题干内容',
      options: [...],
      correctAnswer: 'B',
      myAnswer: 'A',
      isCorrect: false,
      score: 0,
      fullScore: 2,
      explanation: '答案解析内容',
      teacherComment: null  // 主观题才有
    },
    {
      id: 'Q005',
      type: 'shortAnswer',
      order: 39,
      content: '简答题题干',
      myAnswer: {
        text: '学生答案文本',
        files: ['file1.jpg']
      },
      correctAnswer: '参考答案',
      isCorrect: false,
      score: 5,
      fullScore: 6,
      explanation: '答案解析',
      teacherComment: '回答基本正确，但缺少具体实现细节。-1分'
    }
  ],
  statistics: {
    total: 50,
    correct: 40,
    wrong: 8,
    unanswered: 2
  }
}
```

**交互逻辑**:
1. 顶部显示答题统计卡片（可折叠）
2. Tab筛选不同状态的题目
3. 题目列表展示：
   - 题号、题型、得分
   - 学生答案（标记正确/错误）
   - 正确答案
   - 答案解析
   - 教师批注（主观题）
4. 支持上一题/下一题切换
5. 附件支持点击预览

---
## 数据结构设计

### 6.1 考试数据（Exam）

```typescript
interface Exam {
  id: string
  name: string
  startTime: string  // ISO 8601 格式
  endTime: string
  duration: number  // 分钟
  status: 'not_started' | 'in_progress' | 'ended'
  myStatus: 'not_started' | 'in_progress' | 'submitted'
  score: number | null
  totalScore: number
  paper: Paper
  config: ExamConfig
}

interface ExamConfig {
  lateLimit: number  // 允许迟到分钟数
  minSubmitTime: number  // 最短交卷时间
  faceRecognition: boolean
  randomCapture: boolean
  captureInterval: number
  scorePublishTime: 'immediate' | 'after_exam' | 'delayed'
  scorePublishContent: 'score_only' | 'score_and_correct' | 'full'
}
```

### 6.2 试卷数据（Paper）

```typescript
interface Paper {
  id: string
  name: string
  totalScore: number
  questionCount: number
  questions: Question[]
  questionTypes: QuestionTypeSummary[]
}

interface QuestionTypeSummary {
  type: QuestionType
  typeName: string
  count: number
  totalScore: number
}
```

### 6.3 题目数据（Question）

```typescript
type QuestionType = 'single' | 'multiple' | 'trueFalse' | 'fillBlank' | 'shortAnswer' | 'cloze' | 'composite'

interface BaseQuestion {
  id: string
  type: QuestionType
  order: number
  content: string
  score: number
  explanation?: string
}

// 单选题
interface SingleChoiceQuestion extends BaseQuestion {
  type: 'single'
  options: Option[]
  correctAnswer: string
}

// 多选题
interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple'
  options: Option[]
  correctAnswer: string[]
}

// 判断题
interface TrueFalseQuestion extends BaseQuestion {
  type: 'trueFalse'
  correctAnswer: boolean
}

// 填空题
interface FillBlankQuestion extends BaseQuestion {
  type: 'fillBlank'
  blanks: number
  correctAnswer: string[]
}

// 简答题
interface ShortAnswerQuestion extends BaseQuestion {
  type: 'shortAnswer'
  correctAnswer?: string
}

// 完形填空
interface ClozeQuestion extends BaseQuestion {
  type: 'cloze'
  blanks: ClozeBlank[]
}

interface ClozeBlank {
  order: number
  options: Option[]
  correctAnswer: string
}

// 复合题
interface CompositeQuestion extends BaseQuestion {
  type: 'composite'
  material: string
  subQuestions: Question[]
}

interface Option {
  label: string
  text: string
}
```

### 6.4 答案数据（Answer）

```typescript
interface AnswerData {
  examId: string
  paperId: string
  studentId: string
  answers: Record<string, any>  // questionId -> answer
  marked: string[]  // 标记的题目ID列表
  startTime: string
  submitTime?: string
  duration?: number  // 答题用时（分钟）
}

// 不同题型的答案格式
type SingleAnswer = string  // 'A'
type MultipleAnswer = string[]  // ['A', 'B', 'D']
type TrueFalseAnswer = boolean  // true | false
type FillBlankAnswer = string[]  // ['答案1', '答案2']
type ShortAnswer = {
  text: string
  files?: string[]  // 附件URL列表
}
type ClozeAnswer = string[]  // ['A', 'C', 'B']
type CompositeAnswer = Record<string, any>  // subQuestionId -> answer
```

---

## API接口设计

### 7.1 考试相关接口

**获取考试列表**
```
GET /api/student/exams
Query: status (可选)

Response:
{
  code: 0,
  data: {
    exams: Exam[]
  }
}
```

**获取考试详情**
```
GET /api/student/exams/:id

Response:
{
  code: 0,
  data: {
    exam: Exam
  }
}
```

**获取试卷数据**
```
GET /api/student/exams/:examId/paper

Response:
{
  code: 0,
  data: {
    paper: Paper,
    myAnswers: AnswerData | null  // 如果已开始答题
  }
}
```

### 7.2 答题相关接口

**开始答题**
```
POST /api/student/exams/:examId/start

Response:
{
  code: 0,
  data: {
    answerId: string,
    startTime: string
  }
}
```

**保存答案（自动保存）**
```
POST /api/student/exams/:examId/save-answer
Body: {
  questionId: string,
  answer: any
}

Response:
{
  code: 0,
  message: 'success'
}
```

**批量同步答案**
```
POST /api/student/exams/:examId/sync-answers
Body: {
  answers: Record<string, any>,
  marked: string[]
}

Response:
{
  code: 0,
  message: 'success'
}
```

**提交试卷**
```
POST /api/student/exams/:examId/submit
Body: {
  answers: Record<string, any>,
  duration: number
}

Response:
{
  code: 0,
  data: {
    submitTime: string,
    objectiveScore: number  // 客观题得分（立即判分）
  }
}
```

### 7.3 成绩相关接口

**获取考试成绩**
```
GET /api/student/exams/:examId/result

Response:
{
  code: 0,
  data: {
    totalScore: number,
    fullScore: number,
    objectiveScore: number,
    subjectiveScore: number,
    rank: {
      class: { rank: number, total: number },
      grade: { rank: number, total: number }
    },
    duration: number,
    publishTime: string
  }
}
```

**获取批阅详情**
```
GET /api/student/exams/:examId/review

Response:
{
  code: 0,
  data: {
    questions: ReviewQuestion[],
    statistics: {
      total: number,
      correct: number,
      wrong: number,
      unanswered: number
    }
  }
}
```

### 7.4 人脸识别接口

**上传人脸照片**
```
POST /api/student/exams/:examId/face-verify
Body: FormData {
  image: File
}

Response:
{
  code: 0,
  data: {
    success: boolean,
    similarity: number,  // 相似度
    message: string
  }
}
```

---
## 状态管理设计

### 8.1 Exam Store（stores/exam.js）

**职责**: 管理考试列表和当前考试信息

```javascript
import { defineStore } from 'pinia'
import { getExamList, getExamDetail, getPaper } from '@/api/exam'

export const useExamStore = defineStore('exam', {
  state: () => ({
    examList: [],  // 考试列表
    currentExam: null,  // 当前考试
    currentPaper: null,  // 当前试卷
    loading: false
  }),
  
  getters: {
    // 按状态筛选考试
    examsByStatus: (state) => (status) => {
      if (!status) return state.examList
      return state.examList.filter(exam => exam.status === status)
    },
    
    // 当前考试是否可以开始
    canStartExam: (state) => {
      if (!state.currentExam) return false
      return state.currentExam.status === 'in_progress' &&
             state.currentExam.myStatus === 'not_started'
    }
  },
  
  actions: {
    // 获取考试列表
    async fetchExamList() {
      this.loading = true
      try {
        const res = await getExamList()
        this.examList = res.data.exams
      } finally {
        this.loading = false
      }
    },
    
    // 获取考试详情
    async fetchExamDetail(examId) {
      this.loading = true
      try {
        const res = await getExamDetail(examId)
        this.currentExam = res.data.exam
      } finally {
        this.loading = false
      }
    },
    
    // 获取试卷数据
    async fetchPaper(examId) {
      this.loading = true
      try {
        const res = await getPaper(examId)
        this.currentPaper = res.data.paper
        return res.data.myAnswers  // 返回已有答案（如果有）
      } finally {
        this.loading = false
      }
    }
  }
})
```

### 8.2 Answer Store（stores/answer.js）

**职责**: 管理答题状态和答案数据

```javascript
import { defineStore } from 'pinia'
import { saveAnswer, syncAnswers, submitPaper } from '@/api/answer'
import { saveToLocal, loadFromLocal } from '@/utils/storage'

export const useAnswerStore = defineStore('answer', {
  state: () => ({
    examId: null,
    paperId: null,
    answers: {},  // questionId -> answer
    marked: [],  // 标记的题目ID
    currentQuestionIndex: 0,  // 当前题目索引
    startTime: null,
    remainingTime: 0,  // 剩余秒数
    autoSaveTimer: null,
    countdownTimer: null
  }),
  
  getters: {
    // 已答题目数量
    answeredCount: (state) => {
      return Object.keys(state.answers).length
    },
    
    // 答题进度百分比
    progress: (state) => {
      const total = state.questions?.length || 0
      if (total === 0) return 0
      return Math.round((this.answeredCount / total) * 100)
    },
    
    // 当前题目是否已答
    isCurrentAnswered: (state) => {
      const questionId = state.questions?.[state.currentQuestionIndex]?.id
      return questionId && state.answers[questionId] !== undefined
    },
    
    // 当前题目是否已标记
    isCurrentMarked: (state) => {
      const questionId = state.questions?.[state.currentQuestionIndex]?.id
      return questionId && state.marked.includes(questionId)
    }
  },
  
  actions: {
    // 初始化答题
    initAnswer(examId, paperId, questions, existingAnswers = null) {
      this.examId = examId
      this.paperId = paperId
      this.questions = questions
      this.startTime = new Date().toISOString()
      
      // 加载已有答案（从服务器或本地）
      if (existingAnswers) {
        this.answers = existingAnswers.answers || {}
        this.marked = existingAnswers.marked || []
        this.startTime = existingAnswers.startTime
      } else {
        // 尝试从本地加载
        const localData = loadFromLocal(`exam_${examId}`)
        if (localData) {
          this.answers = localData.answers || {}
          this.marked = localData.marked || []
        }
      }
      
      // 启动自动保存
      this.startAutoSave()
      
      // 启动倒计时
      this.startCountdown()
    },
    
    // 保存答案
    saveAnswer(questionId, answer) {
      this.answers[questionId] = answer
      
      // 保存到本地
      this.saveToLocal()
      
      // 立即同步到服务器
      saveAnswer(this.examId, questionId, answer)
    },
    
    // 标记/取消标记题目
    toggleMark(questionId) {
      const index = this.marked.indexOf(questionId)
      if (index > -1) {
        this.marked.splice(index, 1)
      } else {
        this.marked.push(questionId)
      }
      this.saveToLocal()
    },
    
    // 保存到本地
    saveToLocal() {
      saveToLocal(`exam_${this.examId}`, {
        answers: this.answers,
        marked: this.marked,
        startTime: this.startTime,
        lastSaveTime: new Date().toISOString()
      })
    },
    
    // 启动自动保存（每30秒同步到服务器）
    startAutoSave() {
      this.autoSaveTimer = setInterval(() => {
        syncAnswers(this.examId, {
          answers: this.answers,
          marked: this.marked
        })
      }, 30000)
    },
    
    // 启动倒计时
    startCountdown() {
      this.countdownTimer = setInterval(() => {
        this.remainingTime--
        
        if (this.remainingTime <= 0) {
          this.autoSubmit()  // 时间到自动交卷
        } else if (this.remainingTime === 300) {
          // 剩余5分钟提醒
          showNotify({ type: 'warning', message: '剩余5分钟，请抓紧时间！' })
        }
      }, 1000)
    },
    
    // 提交试卷
    async submit() {
      // 停止定时器
      clearInterval(this.autoSaveTimer)
      clearInterval(this.countdownTimer)
      
      // 计算答题时长
      const duration = Math.floor((Date.now() - new Date(this.startTime)) / 60000)
      
      // 提交到服务器
      const res = await submitPaper(this.examId, {
        answers: this.answers,
        duration
      })
      
      // 清除本地数据
      localStorage.removeItem(`exam_${this.examId}`)
      
      return res.data
    },
    
    // 自动交卷
    async autoSubmit() {
      showDialog({
        title: '考试时间已到',
        message: '系统正在自动提交您的答卷...',
        showConfirmButton: false
      })
      
      await this.submit()
      
      // 跳转到成绩页面
      router.push(`/exam/result/${this.examId}`)
    }
  }
})
```

### 8.3 User Store（stores/user.js）

**职责**: 管理用户信息和登录状态

```javascript
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    token: null
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.token
  },
  
  actions: {
    setUserInfo(userInfo) {
      this.userInfo = userInfo
    },
    
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
    },
    
    logout() {
      this.userInfo = null
      this.token = null
      localStorage.removeItem('token')
    }
  }
})
```

---
## 技术实现要点

### 9.1 移动端适配

**Viewport 配置**:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

**Rem 适配**:
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [VantResolver()]
    })
  ],
  css: {
    postcss: {
      plugins: [
        require('postcss-pxtorem')({
          rootValue: 37.5,
          propList: ['*']
        })
      ]
    }
  }
})
```

### 9.2 性能优化

**1. 路由懒加载**:
```javascript
const routes = [
  {
    path: '/exam/list',
    component: () => import('@/views/exam/ExamList.vue')
  }
]
```

**2. 题目虚拟滚动**（大题量试卷）:
```vue
<template>
  <van-list
    v-model:loading="loading"
    :finished="finished"
    @load="onLoad"
  >
    <QuestionCard
      v-for="question in visibleQuestions"
      :key="question.id"
      :question="question"
    />
  </van-list>
</template>
```

**3. 图片懒加载**:
```vue
<van-image
  lazy-load
  :src="imageUrl"
/>
```

### 9.3 离线容错

**网络状态监听**:
```javascript
// utils/network.js
export const setupNetworkListener = () => {
  window.addEventListener('offline', () => {
    showToast('网络已断开，答案将保存在本地')
  })
  
  window.addEventListener('online', () => {
    showToast('网络已恢复，正在同步答案...')
    // 同步本地答案到服务器
    syncLocalAnswers()
  })
}
```

**答案本地缓存**:
```javascript
// utils/storage.js
export const saveToLocal = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error('保存失败', e)
  }
}

export const loadFromLocal = (key) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (e) {
    console.error('加载失败', e)
    return null
  }
}
```

### 9.4 安全措施

**1. 防止页面刷新丢失数据**:
```javascript
// 监听页面刷新
window.addEventListener('beforeunload', (e) => {
  if (isAnswering) {
    e.preventDefault()
    e.returnValue = '答题数据尚未提交，确定要离开吗？'
  }
})
```

**2. 防止切换应用**（如果配置了锁定试卷）:
```javascript
// 监听页面可见性变化
document.addEventListener('visibilitychange', () => {
  if (document.hidden && examConfig.lockPaper) {
    // 记录切屏行为
    recordSwitchApp()
    
    // 警告或强制交卷
    if (switchCount >= 3) {
      forceSubmit()
    }
  }
})
```

**3. Token 认证**:
```javascript
// utils/request.js
import axios from 'axios'
import { useUserStore } from '@/stores/user'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.request.use(config => {
  const userStore = useUserStore()
  if (userStore.token) {
    config.headers.Authorization = `Bearer ${userStore.token}`
  }
  return config
})

export default request
```

### 9.5 调试工具

**桌面端调试支持**:
```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'

// 桌面端模拟触摸事件
if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  import('@vant/touch-emulator')
}

createApp(App).mount('#app')
```

**VConsole 移动端调试**:
```javascript
// 开发环境启用 VConsole
if (import.meta.env.DEV) {
  import('vconsole').then(module => {
    new module.default()
  })
}
```

---

## 下一步计划

### 10.1 实施步骤

**阶段1：项目初始化（1天）**
- ✅ 创建 Vue 3 + Vite 项目
- ✅ 安装依赖（Vant、Pinia、Vue Router）
- ✅ 配置 Vite（自动引入、Rem适配）
- ✅ 创建项目目录结构
- ✅ 配置路由和状态管理

**阶段2：基础页面开发（2-3天）**
- ✅ 考试列表页面
- ✅ 考试详情页面
- ✅ 人脸识别页面（模拟实现）

**阶段3：核心答题功能（3-4天）**
- ✅ 答题页面框架
- ✅ 7种题型组件开发
- ✅ 答题卡组件
- ✅ 倒计时组件
- ✅ 答案保存和同步
- ✅ 交卷确认逻辑

**阶段4：成绩和批阅（2天）**
- ✅ 考试成绩页面
- ✅ 批阅详情页面
- ✅ 答案解析展示

**阶段5：优化和测试（2天）**
- ✅ 性能优化
- ✅ 离线容错测试
- ✅ 各种边界情况测试
- ✅ 移动端真机测试

**总计：10-12天**

### 10.2 技术难点

| 难点 | 解决方案 |
|------|---------|
| 大题量试卷性能 | 虚拟滚动 + 懒加载 |
| 网络断开数据丢失 | LocalStorage 缓存 + 自动同步 |
| 人脸识别实现 | 原型阶段模拟，预留真实SDK接口 |
| 复合题渲染 | 递归组件 + 动态组件 |
| 倒计时精确性 | 服务器时间校准 + 本地倒计时 |

### 10.3 后续扩展

**功能扩展**:
- 刷题功能模块
- 错题本功能
- 纠错反馈功能
- 考试历史记录
- 成绩趋势分析

**技术优化**:
- PWA 支持（离线可用）
- WebSocket 实时通信（监考消息推送）
- 真实人脸识别SDK集成
- 图片压缩和上传优化
- 答题数据加密传输

---

## 附录

### A. 参考文档

- [Vue 3 官方文档](https://cn.vuejs.org/)
- [Vant 4 组件库](https://vant-ui.github.io/vant/)
- [Pinia 状态管理](https://pinia.vuejs.org/zh/)
- [考试系统功能清单](../../考试系统功能清单.md)

### B. 设计原则

1. **移动优先**: 所有设计从移动端出发
2. **用户体验**: 流畅的交互，清晰的引导
3. **数据安全**: 多重保障，防止数据丢失
4. **性能优先**: 大题量下依然流畅
5. **可扩展性**: 预留接口，便于后续扩展

### C. 命名规范

**文件命名**: PascalCase（大驼峰）
- `ExamList.vue`
- `ExamDetail.vue`

**组件命名**: PascalCase
- `<QuestionCard />`
- `<AnswerSheet />`

**变量命名**: camelCase（小驼峰）
- `examList`
- `currentQuestion`

**常量命名**: UPPER_SNAKE_CASE
- `MAX_RETRY_COUNT`
- `AUTO_SAVE_INTERVAL`

---

**文档结束**

> 如需补充或修改，请联系项目负责人
