# 用户偏好管理系统 - 阶段2设计文档

**设计日期**: 2026-02-02  
**设计目标**: 实现完整的用户偏好学习和智能推荐系统  
**实施方式**: 渐进式增强，在阶段1基础上扩展

---

## 📋 设计背景

### 阶段1成果
- ✅ SmartParamExtractor智能参数提取器
- ✅ 支持题型、数量、难度、知识点识别
- ✅ 支持口语化模式（"来点"、"和上次一样"、"按习惯来"）
- ✅ 参数提取准确率~90%

### 阶段2目标
- 实现用户偏好的自动学习和存储
- 支持"和上次一样"功能（使用历史参数）
- 支持"按习惯来"功能（使用统计推荐）
- 智能补全缺失参数
- 提供个性化体验

---

## 🏗️ 整体架构

### 核心组件

**UserPreferenceManager类** - 用户偏好管理器
- 负责偏好数据的存储、读取、更新和分析
- 提供偏好查询和推荐接口
- 管理LocalStorage的数据持久化

### 数据流程

**偏好记录流程**：
```
用户输入 → SmartParamExtractor提取参数 → 生成题目成功 
→ UserPreferenceManager.recordAction() → 更新LocalStorage
```

**偏好应用流程**：
```
用户输入"按习惯来" → SmartParamExtractor识别_usePreference 
→ UserPreferenceManager.getRecommendedParams() → 补全参数 → 生成题目
```

### 与阶段1的集成

- **SmartParamExtractor**：已识别"和上次一样"、"按习惯来"，返回`_useHistory`和`_usePreference`标记
- **ConversationManager**：增强handleGenerateQuestions()和generateQuestionsNow()方法
- **新增UserPreferenceManager**：独立的偏好管理类

---

## 📊 数据结构设计

### 完整数据结构

```javascript
{
  userId: 'default_user',
  version: '1.0',
  
  // 1. 基础偏好统计
  basicPreferences: {
    questionType: {
      'single': { count: 0, percentage: 0 },
      'multiple': { count: 0, percentage: 0 },
      'judge': { count: 0, percentage: 0 },
      'fill': { count: 0, percentage: 0 },
      'essay': { count: 0, percentage: 0 },
      'all': { count: 0, percentage: 0 }
    },
    difficulty: {
      '1': { count: 0, percentage: 0 },
      '2': { count: 0, percentage: 0 },
      '3': { count: 0, percentage: 0 },
      '4': { count: 0, percentage: 0 },
      '5': { count: 0, percentage: 0 }
    },
    quantity: {
      total: 0,
      average: 10,
      mostCommon: 10,
      distribution: {}
    },
    knowledgePoints: {}
  },
  
  // 2. 场景偏好
  scenarioPreferences: {
    'generate_questions': {
      lastUsed: null,
      frequency: 0,
      lastParams: null,
      commonConfig: null
    }
  },
  
  // 3. 行为模式
  behaviorPatterns: {
    timePatterns: {
      weekday: { samples: 0, avgDifficulty: 0, avgCount: 0, commonType: null },
      weekend: { samples: 0, avgDifficulty: 0, avgCount: 0, commonType: null }
    },
    knowledgePointFocus: {
      recent: [],
      trending: null
    },
    commonCombinations: []
  },
  
  // 4. 对话风格偏好
  conversationStyle: {
    verbosity: 'normal',
    confirmationNeeded: true,
    preferQuickActions: false
  },
  
  // 5. 元数据
  metadata: {
    totalActions: 0,
    firstActionDate: null,
    lastActionDate: null,
    totalQuestionsGenerated: 0
  }
}
```

### 设计决策

1. **百分比自动计算**：每次更新count后自动重新计算percentage
2. **滑动窗口**：recent数组最多保留最近5-10条记录
3. **增量更新**：每次只更新变化的部分
4. **默认值**：所有字段都有合理的默认值

---

## 🔧 核心方法设计

### UserPreferenceManager类

```javascript
class UserPreferenceManager {
  constructor() {
    this.storageKey = 'ai_assistant_user_preferences';
    this.preferences = this.loadPreferences();
  }
  
  // === 数据持久化 ===
  loadPreferences()      // 从LocalStorage加载
  savePreferences()      // 保存到LocalStorage
  resetPreferences()     // 重置为默认值
  
  // === 偏好记录 ===
  recordAction(params)   // 记录一次成功操作
  updateBasicPreferences(params)
  updateScenarioPreferences(params)
  updateBehaviorPatterns(params)
  
  // === 偏好查询 ===
  getLastUsedParams()           // "和上次一样"
  getMostCommonParams()         // "按习惯来"
  getRecommendedParams(partial) // 智能推荐
  
  // === 统计分析 ===
  getMostCommonType()
  getMostCommonDifficulty()
  getAverageQuantity()
  getRecentKnowledgePoints()
  
  // === 辅助方法 ===
  isWeekend()
  calculatePercentages()
  updateCommonCombinations()
}
```

### 关键方法逻辑

**recordAction(params)** - 记录操作：
1. 更新元数据（totalActions++, lastActionDate）
2. 更新基础偏好（题型、难度、数量、知识点）
3. 更新场景偏好（lastParams, frequency）
4. 更新行为模式（时间模式、知识点关注）
5. 重新计算统计数据
6. 保存到LocalStorage

**getRecommendedParams(partial)** - 智能推荐：
1. 如果有`_useHistory`标记 → 返回lastUsedParams
2. 如果有`_usePreference`标记 → 返回mostCommonParams
3. 否则用统计数据补全缺失参数：
   - 缺失type → 最常用题型
   - 缺失difficulty → 最常用难度
   - 缺失count → 平均数量
   - 缺失knowledgePoint → 最近知识点

---

## 🔗 集成策略

### ConversationManager修改

**修改点1：实例化**
```javascript
constructor(task) {
  this.task = task;
  this.smartExtractor = new SmartParamExtractor();
  this.preferenceManager = new UserPreferenceManager(); // 新增
}
```

**修改点2：应用偏好**
```javascript
handleGenerateQuestions(input) {
  const extractResult = this.smartExtractor.extract(input, this.getContext());
  let params = extractResult.params;
  
  // 应用偏好推荐
  if (params._useHistory || params._usePreference || this.hasIncompleteParams(params)) {
    const recommended = this.preferenceManager.getRecommendedParams(params);
    params = { ...recommended, ...params };
  }
  
  // 原有逻辑...
}
```

**修改点3：记录偏好**
```javascript
generateQuestionsNow(params) {
  // 生成题目...
  
  // 记录偏好
  this.preferenceManager.recordAction({
    type: params.type,
    count: params.count,
    difficulty: params.difficulty,
    knowledgePoint: params.knowledgePoint,
    timestamp: new Date()
  });
  
  // 返回结果...
}
```

---

## 🎯 用户体验流程

### 场景1：首次使用
```
用户: "生成10道单选题"
系统: [提取参数] → [无历史] → [直接生成] → [记录偏好]
```

### 场景2："按习惯来"
```
用户: "按习惯来生成题目"
系统: [识别_usePreference] → [推荐: 单选/10道/中等] → [生成] → [记录]
```

### 场景3："和上次一样"
```
用户: "和上次一样"
系统: [识别_useHistory] → [复制上次参数] → [生成] → [记录]
```

### 场景4：智能补全
```
用户: "生成判断题"
系统: [提取: type=judge] → [补全: count=10, difficulty=2] → [生成] → [记录]
```

---

## ✅ 测试和验收

### 测试策略

**单元测试**：
- recordAction() - 数据更新正确性
- getLastUsedParams() - 返回最近参数
- getMostCommonParams() - 返回最常用参数
- getRecommendedParams() - 智能推荐逻辑
- calculatePercentages() - 百分比计算

**集成测试**：
- 首次使用 → 记录 → 验证保存
- "和上次一样" → 验证参数复用
- "按习惯来" → 验证统计推荐
- 部分参数 → 验证智能补全
- 跨会话 → 验证持久化

### 验收标准

| 功能 | 标准 | 目标 |
|------|------|------|
| 偏好记录 | 自动记录 | 100%准确 |
| "和上次一样" | 返回最近参数 | 100%准确 |
| "按习惯来" | 返回常用参数 | >90%符合预期 |
| 智能补全 | 补全缺失参数 | >85%合理 |
| 数据持久化 | 刷新后保留 | 100%可靠 |
| 统计准确性 | 计算正确 | 100%准确 |
| 性能 | 响应时间 | <50ms |

---

## 📝 实施计划

### 任务分解（9个任务）

1. **Task 1**: 创建UserPreferenceManager类基础结构
2. **Task 2**: 实现偏好记录功能
3. **Task 3**: 实现行为模式分析
4. **Task 4**: 实现偏好查询功能
5. **Task 5**: 实现智能推荐引擎
6. **Task 6**: 集成到ConversationManager
7. **Task 7**: 实现综合测试
8. **Task 8**: 数据迁移和兼容性
9. **Task 9**: 文档和清理

### 预计时间
- **总时间**: 2-3小时
- **关键路径**: Task 1→2→5→6

### 风险评估

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|---------|
| LocalStorage容量限制 | 中 | 低 | 限制历史记录数量 |
| 数据损坏 | 高 | 低 | 数据验证和恢复 |
| 推荐不准确 | 中 | 中 | 用户反馈优化 |
| 性能问题 | 低 | 低 | 增量更新 |
| 与阶段1冲突 | 高 | 低 | 充分测试 |

---

## 🎊 预期收益

- ✅ 减少用户重复输入30%+
- ✅ 提升参数提取准确率至95%+
- ✅ 提供个性化体验
- ✅ 为阶段3打下基础

---

**设计完成日期**: 2026-02-02  
**设计审核**: 已通过  
**准备实施**: 是
