<template>
  <div class="exam-answer-page">
    <!-- 顶部信息栏 -->
    <header class="exam-header">
      <div class="header-left">
        <h1>{{ exam?.name }}</h1>
      </div>
      <div class="header-center">
        <div class="countdown" :class="{ warning: remainingTime < 600, danger: remainingTime < 60 }">
          <el-icon><Clock /></el-icon>
          <span>{{ formattedTime }}</span>
        </div>
      </div>
      <div class="header-right">
        <el-button size="small" @click="showCapture = true" style="margin-right: 12px;">
          <el-icon><Camera /></el-icon>
          模拟抓拍
        </el-button>
        <el-button type="primary" size="large" class="submit-btn" @click="handleSubmit">
          <el-icon><CircleCheckFilled /></el-icon>
          交卷
        </el-button>
      </div>
    </header>

    <div v-if="loading" class="loading-wrapper">
      <el-skeleton :rows="10" animated />
    </div>

    <div v-else class="exam-body">
      <!-- 左侧题号导航 -->
      <aside class="question-nav">
        <div class="nav-header">
          <el-icon><List /></el-icon>
          <span>题目导航</span>
        </div>
        
        <div class="nav-scroll">
          <div v-for="group in groupedQuestions" :key="group.type" class="nav-group">
            <div class="nav-group-header">
              <el-icon class="group-icon" :style="{ color: getTypeColor(group.type) }">
                <component :is="getTypeIcon(group.type)" />
              </el-icon>
              <span>{{ group.typeName }}</span>
            </div>
            <div class="nav-grid">
              <div
                v-for="q in group.items"
                :key="q.id"
                class="nav-item"
                :class="{
                  answered: isAnswered(q.id),
                  active: activeQuestionId === q.id
                }"
                @click="scrollToQuestion(q.id)"
              >
                {{ q.displayIndex }}
              </div>
            </div>
          </div>
        </div>

        <div class="nav-footer">
          <div class="nav-legend">
            <span class="legend-item">
              <span class="dot answered"></span>
              <span>已答 {{ answeredCount }}</span>
            </span>
            <span class="legend-sep">/</span>
            <span class="legend-item">
              <span class="dot"></span>
              <span>未答 {{ totalCount - answeredCount }}</span>
            </span>
          </div>
        </div>
      </aside>

      <!-- 右侧题目内容 -->
      <main class="question-content" ref="contentRef">
        <div v-for="group in groupedQuestions" :key="group.type" class="question-group">
          <div class="group-header">
            <el-icon class="group-icon" :style="{ color: getTypeColor(group.type) }">
              <component :is="getTypeIcon(group.type)" />
            </el-icon>
            <span class="group-title">{{ group.typeName }}</span>
          </div>
          <div class="group-questions">
            <QuestionItem
              v-for="q in group.items"
              :key="q.id"
              :id="'q-' + q.id"
              :question="q"
              :answer="answers[q.id]"
              :class="{ 'unanswered-highlight': isQuestionUnanswered(q) }"
              @update:answer="(val) => handleAnswer(q.id, val)"
            />
          </div>
          <div class="group-divider"></div>
        </div>
      </main>
    </div>

    <!-- 抓拍遮罩 -->
    <CaptureOverlay v-if="showCapture" @complete="handleCaptureComplete" />

    <!-- 交卷弹窗 -->
    <el-dialog v-model="showSubmitDialog" title="确认交卷" width="420px">
      <div class="submit-content">
        <div class="submit-stats">
          <div class="stat-box">
            <div class="stat-number">{{ answeredCount }}</div>
            <div class="stat-text">已答题目</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-box">
            <div class="stat-number success">{{ totalCount }}</div>
            <div class="stat-text">总计题目</div>
          </div>
        </div>
        <p class="success-text">
          <el-icon><CircleCheckFilled /></el-icon>
          所有题目已答完，确定要交卷吗？
        </p>
      </div>
      <template #footer>
        <el-button @click="showSubmitDialog = false">继续检查</el-button>
        <el-button type="primary" :loading="submitting" @click="confirmSubmit">确认交卷</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Clock, Camera, CircleCheckFilled, List,
  CircleCheck, Document, Files, Edit, QuestionFilled, ChatLineSquare, Grid, Connection
} from '@element-plus/icons-vue'
import QuestionItem from './components/QuestionItem.vue'
import CaptureOverlay from './components/CaptureOverlay.vue'
import { useExamStore } from '@/stores/exam'

const route = useRoute()
const router = useRouter()
const examStore = useExamStore()

// 考试数据
const exam = ref(null)
const questions = ref([])
const answers = ref({})
const loading = ref(true)
const submitting = ref(false)
const showSubmitDialog = ref(false)
const showCapture = ref(false)
const activeQuestionId = ref(null)
const contentRef = ref(null)
const highlightUnanswered = ref(false)

// 倒计时
const remainingTime = ref(3600)
let timer = null
let examStartTime = null

// 格式化时间
const formattedTime = computed(() => {
  const hours = Math.floor(remainingTime.value / 3600)
  const minutes = Math.floor((remainingTime.value % 3600) / 60)
  const seconds = remainingTime.value % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

// 扁平化题目列表（复合题不展开，保持完整）
const flatQuestions = computed(() => {
  const result = []
  let displayIndex = 1

  questions.value.forEach(q => {
    result.push({
      ...q,
      displayIndex: displayIndex++
    })
  })

  return result
})

// 按题型分组
const groupedQuestions = computed(() => {
  const groups = {}

  flatQuestions.value.forEach(q => {
    const type = q.type
    if (!groups[type]) {
      groups[type] = {
        type,
        typeName: q.typeName || getTypeName(type),
        items: []
      }
    }
    groups[type].items.push(q)
  })

  return Object.values(groups)
})

// 统计
const totalCount = computed(() => flatQuestions.value.length)
const answeredCount = computed(() => {
  return flatQuestions.value.filter(q => isAnswered(q.id)).length
})
const unansweredCount = computed(() => totalCount.value - answeredCount.value)

// 判断是否已答
function isAnswered(questionId) {
  const answer = answers.value[questionId]
  if (answer === undefined || answer === null) return false

  const question = flatQuestions.value.find(q => q.id === questionId)
  if (!question) return false

  if (question.type === 'single') {
    return !!answer && answer !== ''
  } else if (question.type === 'multiple') {
    return Array.isArray(answer) && answer.length > 0
  } else if (question.type === 'judge') {
    return answer === true || answer === false
  } else if (question.type === 'blank') {
    return answer && typeof answer === 'object' && Object.values(answer).some(v => v && v.trim())
  } else if (question.type === 'essay') {
    return answer && ((answer.text && answer.text.trim()) || (answer.attachments && answer.attachments.length > 0))
  } else if (question.type === 'cloze') {
    // 完形填空：检查所有空是否都已填
    return answer && typeof answer === 'object' &&
           question.blanks?.every(blank => answer[blank.id] && answer[blank.id] !== '')
  } else if (question.type === 'composite') {
    // 复合题：检查所有子题是否都已答
    if (!answer || typeof answer !== 'object') return false
    return question.subQuestions?.every(sub => {
      const subAnswer = answer[sub.id]
      if (sub.type === 'single') {
        return !!subAnswer && subAnswer !== ''
      } else if (sub.type === 'multiple') {
        return Array.isArray(subAnswer) && subAnswer.length > 0
      } else if (sub.type === 'judge') {
        return subAnswer === true || subAnswer === false
      } else if (sub.type === 'blank') {
        return subAnswer && typeof subAnswer === 'object' && Object.values(subAnswer).some(v => v && v.trim())
      } else if (sub.type === 'essay') {
        return subAnswer && typeof subAnswer === 'object' && subAnswer.text && subAnswer.text.trim() !== ''
      }
      return false
    })
  }

  return false
}

// 判断题目是否未答（用于高亮）
function isQuestionUnanswered(question) {
  return highlightUnanswered.value && !isAnswered(question.id)
}

// 滚动到题目
function scrollToQuestion(questionId) {
  activeQuestionId.value = questionId
  nextTick(() => {
    const element = document.getElementById('q-' + questionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}

// 处理答案更新
function handleAnswer(questionId, value) {
  answers.value[questionId] = value
  highlightUnanswered.value = false
}

// 获取题型名称
function getTypeName(type) {
  const typeMap = {
    single: '单选题',
    multiple: '多选题',
    judge: '判断题',
    blank: '填空题',
    essay: '简答题',
    cloze: '完形填空',
    composite: '复合题'
  }
  return typeMap[type] || '未知题型'
}

// 获取题型图标
function getTypeIcon(type) {
  const iconMap = {
    single: CircleCheck,
    multiple: CircleCheck,
    judge: QuestionFilled,
    blank: Edit,
    essay: ChatLineSquare,
    cloze: Grid,
    composite: Connection
  }
  return iconMap[type] || Document
}

// 获取题型颜色
function getTypeColor(type) {
  const colorMap = {
    single: '#409EFF',
    multiple: '#9C27B0',
    judge: '#FF9800',
    blank: '#00BCD4',
    essay: '#4CAF50',
    cloze: '#E91E63',
    composite: '#F44336'
  }
  return colorMap[type] || '#909399'
}

// 获取未答题目列表文本
function getUnansweredText() {
  const unanswered = flatQuestions.value.filter(q => !isAnswered(q.id))
  return unanswered.slice(0, 5).map(q => `第${q.displayIndex}题`).join('、') +
         (unanswered.length > 5 ? '...' : '')
}

// 提交答卷
function handleSubmit() {
  const minTime = exam.value?.config?.minAnswerTime || 0
  const elapsed = Math.floor((Date.now() - examStartTime) / 60000)
  if (elapsed < minTime) {
    ElMessage.warning(`答题时间不足${minTime}分钟，无法提交`)
    return
  }

  if (unansweredCount.value > 0) {
    const unansweredText = getUnansweredText()
    ElMessage({
      message: `还有 ${unansweredCount.value} 题未作答：${unansweredText}`,
      type: 'warning',
      center: true,
      duration: 3000
    })
    highlightUnanswered.value = true

    // 滚动到第一个未答题目
    const firstUnanswered = flatQuestions.value.find(q => !isAnswered(q.id))
    if (firstUnanswered) {
      scrollToQuestion(firstUnanswered.id)
    }
    return
  }

  showSubmitDialog.value = true
}

// 确认交卷
async function confirmSubmit() {
  submitting.value = true

  try {
    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 1000))

    examStore.setSubmitted(route.params.id)
    ElMessage.success('交卷成功')
    router.push({
      name: 'ExamSuccess',
      params: { id: route.params.id }
    })
  } catch (error) {
    ElMessage.error('交卷失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 处理抓拍完成
function handleCaptureComplete() {
  showCapture.value = false
}

// 初始化数据
function initData() {
  // 从 examStore 获取考试数据
  const examData = examStore.examList.find(e => e.id === route.params.id)

  exam.value = {
    id: route.params.id,
    name: examData?.name || '数据结构与算法测试',
    duration: examData?.duration || 90,
    totalScore: examData?.totalScore || 100,
    mode: 'extraction'
  }

  // 模拟题目数据
  questions.value = [
    // 单选题
    {
      id: 'q1',
      type: 'single',
      typeName: '单选题',
      content: '下列函数中，在区间 (-∞, +∞) 上单调递增的是',
      options: [
        { label: 'A', text: 'y = -x³' },
        { label: 'B', text: 'y = x²' },
        { label: 'C', text: 'y = 2ˣ' },
        { label: 'D', text: 'y = cos x' }
      ],
      score: 2
    },
    {
      id: 'q2',
      type: 'single',
      typeName: '单选题',
      content: '设 f(x) 在 x = 0 处可导，且 f\'(0) = 2，则 lim(h→0) [f(h) - f(0)]/h 等于',
      options: [
        { label: 'A', text: '0' },
        { label: 'B', text: '1' },
        { label: 'C', text: '2' },
        { label: 'D', text: '不存在' }
      ],
      score: 2
    },
    {
      id: 'q3',
      type: 'single',
      typeName: '单选题',
      content: '曲线 y = x³ 在点 (1, 1) 处的切线方程是',
      options: [
        { label: 'A', text: 'y = x' },
        { label: 'B', text: 'y = 2x - 1' },
        { label: 'C', text: 'y = 3x - 2' },
        { label: 'D', text: 'y = 3x + 1' }
      ],
      score: 2
    },
    // 多选题
    {
      id: 'q4',
      type: 'multiple',
      typeName: '多选题',
      content: '下列极限存在的是',
      options: [
        { label: 'A', text: 'lim(x→0) sin(1/x)' },
        { label: 'B', text: 'lim(x→∞) (1 + 1/x)ˣ' },
        { label: 'C', text: 'lim(x→0) x·sin(1/x)' },
        { label: 'D', text: 'lim(x→0) (sin x)/x' }
      ],
      score: 3
    },
    {
      id: 'q5',
      type: 'multiple',
      typeName: '多选题',
      content: '下列函数在 x = 0 处连续的是',
      options: [
        { label: 'A', text: 'f(x) = |x|' },
        { label: 'B', text: 'f(x) = 1/x' },
        { label: 'C', text: 'f(x) = sin x' },
        { label: 'D', text: 'f(x) = x²' }
      ],
      score: 3
    },
    // 判断题
    {
      id: 'q6',
      type: 'judge',
      typeName: '判断题',
      content: '连续函数一定可导。',
      score: 2
    },
    {
      id: 'q7',
      type: 'judge',
      typeName: '判断题',
      content: '可导函数一定连续。',
      score: 2
    },
    {
      id: 'q8',
      type: 'judge',
      typeName: '判断题',
      content: '若 f(x) 在 [a, b] 上连续，则 f(x) 在 [a, b] 上一定有最大值和最小值。',
      score: 2
    },
    // 填空题
    {
      id: 'q9',
      type: 'blank',
      typeName: '填空题',
      content: '函数 f(x) = x³ - 3x 的极大值点是 ___，极小值点是 ___。',
      blanks: [
        { id: 'b1_1', answer: 'x = -1' },
        { id: 'b1_2', answer: 'x = 1' }
      ],
      score: 4
    },
    {
      id: 'q10',
      type: 'blank',
      typeName: '填空题',
      content: '∫ x² dx = ___。',
      blanks: [
        { id: 'b2_1', answer: 'x³/3 + C' }
      ],
      score: 3
    },
    {
      id: 'q11',
      type: 'blank',
      typeName: '填空题',
      content: '若 f(x) = sin x，则 f\'(x) = ___，f\'\'(x) = ___。',
      blanks: [
        { id: 'b3_1', answer: 'cos x' },
        { id: 'b3_2', answer: '-sin x' }
      ],
      score: 4
    },
    // 简答题
    {
      id: 'q12',
      type: 'essay',
      typeName: '简答题',
      content: '求函数 f(x) = x² - 4x + 3 在区间 [0, 3] 上的最大值和最小值。',
      score: 8
    },
    {
      id: 'q13',
      type: 'essay',
      typeName: '简答题',
      content: '证明：若函数 f(x) 在点 x₀ 处可导，则 f(x) 在点 x₀ 处连续。',
      score: 10
    },
    // 完形填空
    {
      id: 'q14',
      type: 'cloze',
      typeName: '完形填空',
      content: '微积分是数学的一个重要分支。它主要研究函数的 <u>___1___</u> 和 <u>___2___</u>。微积分的基本定理揭示了 <u>___3___</u> 和 <u>___4___</u> 之间的关系。',
      blanks: [
        {
          id: 'c1_1',
          order: 1,
          options: [
            { label: 'A', text: '极限' },
            { label: 'B', text: '导数' },
            { label: 'C', text: '积分' },
            { label: 'D', text: '连续性' }
          ]
        },
        {
          id: 'c1_2',
          order: 2,
          options: [
            { label: 'A', text: '极限' },
            { label: 'B', text: '导数' },
            { label: 'C', text: '积分' },
            { label: 'D', text: '连续性' }
          ]
        },
        {
          id: 'c1_3',
          order: 3,
          options: [
            { label: 'A', text: '微分' },
            { label: 'B', text: '积分' },
            { label: 'C', text: '极限' },
            { label: 'D', text: '连续' }
          ]
        },
        {
          id: 'c1_4',
          order: 4,
          options: [
            { label: 'A', text: '微分' },
            { label: 'B', text: '积分' },
            { label: 'C', text: '极限' },
            { label: 'D', text: '连续' }
          ]
        }
      ],
      score: 8
    },
    {
      id: 'q15',
      type: 'cloze',
      typeName: '完形填空',
      content: '在数学分析中，<u>___1___</u> 是研究函数变化率的工具。通过求导，我们可以找到函数的 <u>___2___</u> 和 <u>___3___</u>。',
      blanks: [
        {
          id: 'c2_1',
          order: 1,
          options: [
            { label: 'A', text: '导数' },
            { label: 'B', text: '积分' },
            { label: 'C', text: '极限' },
            { label: 'D', text: '微分' }
          ]
        },
        {
          id: 'c2_2',
          order: 2,
          options: [
            { label: 'A', text: '最大值' },
            { label: 'B', text: '极值点' },
            { label: 'C', text: '拐点' },
            { label: 'D', text: '零点' }
          ]
        },
        {
          id: 'c2_3',
          order: 3,
          options: [
            { label: 'A', text: '单调区间' },
            { label: 'B', text: '连续区间' },
            { label: 'C', text: '定义域' },
            { label: 'D', text: '值域' }
          ]
        }
      ],
      score: 6
    },
    // 复合题（1题，包含各种子题型）
    {
      id: 'q16',
      type: 'composite',
      typeName: '复合题',
      content: '阅读下面的材料，回答以下各题：<br><br>某校对100名学生进行了一次数学综合测试，测试涵盖代数、几何、概率等多个知识点。以下是部分统计数据和分析题目。',
      subQuestions: [
        {
          id: 'sub_single',
          type: 'single',
          typeName: '单选题',
          content: '若测试平均分为72分，标准差为8分，则成绩在56~88分之间的学生约占',
          options: [
            { label: 'A', text: '68%' },
            { label: 'B', text: '95%' },
            { label: 'C', text: '99.7%' },
            { label: 'D', text: '50%' }
          ],
          score: 3
        },
        {
          id: 'sub_multiple',
          type: 'multiple',
          typeName: '多选题',
          content: '关于正态分布，下列说法正确的是',
          options: [
            { label: 'A', text: '正态分布曲线关于均值对称' },
            { label: 'B', text: '均值越大，曲线越高' },
            { label: 'C', text: '标准差越小，曲线越"瘦高"' },
            { label: 'D', text: '曲线下面积之和为1' }
          ],
          score: 4
        },
        {
          id: 'sub_judge',
          type: 'judge',
          typeName: '判断题',
          content: '若两组数据的均值相同，则它们的分布完全相同。',
          score: 2
        },
        {
          id: 'sub_blank',
          type: 'blank',
          typeName: '填空题',
          content: '若成绩服从正态分布 N(72, 64)，则成绩低于64分的概率约为 ___（用百分比表示）。',
          blanks: [{ id: 'b_sub_blank', answer: '16%' }],
          score: 3
        },
        {
          id: 'sub_essay',
          type: 'essay',
          typeName: '简答题',
          content: '请简要说明为什么在实际统计分析中，正态分布被广泛应用？至少列举两个原因。',
          score: 5
        }
      ],
      score: 17
    }
  ]

  // 初始化答案对象（匹配 QuestionItem 组件期望的格式）
  flatQuestions.value.forEach(q => {
    if (q.type === 'single') {
      answers.value[q.id] = '' // 单选：直接字符串
    } else if (q.type === 'multiple') {
      answers.value[q.id] = [] // 多选：数组
    } else if (q.type === 'judge') {
      answers.value[q.id] = null // 判断：null/true/false
    } else if (q.type === 'blank') {
      // 填空：对象，键是 blank.id
      const blankObj = {}
      q.blanks?.forEach(blank => {
        blankObj[blank.id] = ''
      })
      answers.value[q.id] = blankObj
    } else if (q.type === 'essay') {
      answers.value[q.id] = { text: '', attachments: [] } // 简答：对象
    } else if (q.type === 'cloze') {
      // 完形填空：对象，键是 blank.id
      const clozeObj = {}
      q.blanks?.forEach(blank => {
        clozeObj[blank.id] = ''
      })
      answers.value[q.id] = clozeObj
    } else if (q.type === 'composite') {
      // 复合题：对象，键是子题 id
      const compositeObj = {}
      q.subQuestions?.forEach(sub => {
        if (sub.type === 'single') {
          compositeObj[sub.id] = ''
        } else if (sub.type === 'multiple') {
          compositeObj[sub.id] = []
        } else if (sub.type === 'judge') {
          compositeObj[sub.id] = null
        } else if (sub.type === 'blank') {
          const blankObj = {}
          sub.blanks?.forEach(blank => {
            blankObj[blank.id] = ''
          })
          compositeObj[sub.id] = blankObj
        } else if (sub.type === 'essay') {
          compositeObj[sub.id] = { text: '', attachments: [] }
        }
      })
      answers.value[q.id] = compositeObj
    }
  })

  loading.value = false
}

// 启动倒计时
function startTimer() {
  timer = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--
    } else {
      clearInterval(timer)
      ElMessageBox.alert('考试时间已到，系统将自动交卷', '提示', {
        confirmButtonText: '确定',
        callback: () => {
          confirmSubmit()
        }
      })
    }
  }, 1000)
}

// 监听滚动，更新当前题目
function handleScroll() {
  if (!contentRef.value) return

  const scrollTop = contentRef.value.scrollTop
  const questions = contentRef.value.querySelectorAll('[id^="q-"]')

  for (let i = questions.length - 1; i >= 0; i--) {
    const question = questions[i]
    if (question.offsetTop <= scrollTop + 100) {
      const id = question.id.replace('q-', '')
      activeQuestionId.value = id
      break
    }
  }
}

onMounted(() => {
  examStartTime = Date.now()
  initData()
  startTimer()

  if (contentRef.value) {
    contentRef.value.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }

  if (contentRef.value) {
    contentRef.value.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped>
.exam-answer-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

/* 顶部信息栏 */
.exam-header {
  height: 64px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.header-left {
  display: flex;
  align-items: center;
}

.exam-header h1 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.countdown {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  font-family: 'DIN Alternate', 'SF Mono', 'Menlo', monospace;
}

.countdown.warning { color: #E6A23C; }
.countdown.danger {
  color: #F56C6C;
  animation: blink 1s infinite;
}

@keyframes blink { 50% { opacity: 0.5; } }

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.submit-btn {
  background: linear-gradient(135deg, #00B96B 0%, #00D68F 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(0, 185, 107, 0.35);
  font-weight: 600;
  padding: 12px 28px;
  font-size: 15px;
}

.submit-btn:hover {
  background: linear-gradient(135deg, #00a862 0%, #00c280 100%);
  box-shadow: 0 6px 16px rgba(0, 185, 107, 0.45);
  transform: translateY(-1px);
}

.submit-btn:active {
  transform: translateY(0);
}

/* 主体区域 */
.exam-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧题号导航 */
.question-nav {
  width: 280px;
  background: #f5f7fa;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.nav-header {
  height: 56px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 20px;
  border-bottom: 1px solid #e4e7ed;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.nav-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.nav-group {
  margin-bottom: 20px;
}

.nav-group:last-child {
  margin-bottom: 0;
}

.nav-group-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #606266;
}

.group-icon {
  font-size: 16px;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
}

.nav-item {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1.5px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-item:hover {
  border-color: #00B96B;
  color: #00B96B;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 185, 107, 0.15);
}

.nav-item.answered {
  background: #00B96B;
  border-color: #00B96B;
  color: white;
}

.nav-item.marked {
  background: #fef3c7;
  border-color: #fcd34d;
  color: #b45309;
}

.nav-item.active {
  border-color: #00B96B;
  border-width: 2px;
  box-shadow: 0 0 0 3px rgba(0, 185, 107, 0.1);
}

.nav-footer {
  border-top: 1px solid #e4e7ed;
  padding: 12px 16px;
}

.nav-legend {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #606266;
}

.legend-item .dot {
  width: 10px;
  height: 10px;
  border: 1.5px solid #dcdfe6;
  border-radius: 2px;
  background: white;
  flex-shrink: 0;
}

.legend-item .dot.answered {
  background: #00B96B;
  border-color: #00B96B;
}

.legend-sep {
  color: #c0c4cc;
  font-size: 12px;
}

/* 右侧题目内容 */
.question-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: white;
}

.question-group {
  margin-bottom: 0;
}

.question-group:last-child .group-divider {
  display: none;
}

.group-divider {
  height: 10px;
  background: #f5f7fa;
  margin: 40px -24px;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e4e7ed;
}

.group-icon {
  font-size: 20px;
}

.group-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.group-questions > * {
  margin-bottom: 24px;
}

.group-questions > *:last-child {
  margin-bottom: 0;
}

/* 未答题目高亮 */
.unanswered-highlight {
  border: 2px solid #f56c6c !important;
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* 加载状态 */
.loading-wrapper {
  flex: 1;
  padding: 24px;
}

/* 交卷弹窗 */
.submit-content {
  padding: 20px 0;
}

.submit-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  margin-bottom: 24px;
}

.stat-box {
  text-align: center;
}

.stat-number {
  font-size: 36px;
  font-weight: 700;
  color: #00B96B;
  margin-bottom: 8px;
}

.stat-number.success {
  color: #303133;
}

.stat-text {
  font-size: 14px;
  color: #909399;
}

.stat-divider {
  width: 1px;
  height: 60px;
  background: #e4e7ed;
}

.success-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 16px;
  color: #00B96B;
  margin: 0;
}

.success-text .el-icon {
  font-size: 20px;
}
</style>

