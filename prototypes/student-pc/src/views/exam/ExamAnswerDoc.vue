<template>
  <div class="exam-answer-doc-page">
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

    <div v-else class="doc-body">
      <!-- 左侧文档预览 -->
      <div class="doc-preview" :style="{ width: leftWidth + '%' }">
        <div class="doc-header">
          <el-icon><Reading /></el-icon>
          <span>试卷文档</span>
        </div>
        <div v-if="documentPages.length" class="doc-scroll">
          <div v-for="(page, idx) in documentPages" :key="idx" class="doc-page" v-html="page"></div>
        </div>
        <div v-else class="doc-placeholder">
          <el-icon :size="64" color="#C9CDD4"><Document /></el-icon>
          <p>试卷文档加载中...</p>
        </div>
      </div>

      <!-- 可拖拽分隔条 -->
      <div class="resizer" @mousedown="startResize">
        <div class="resizer-handle">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <!-- 右侧答题卡 -->
      <div class="answer-panel" :style="{ width: (100 - leftWidth) + '%' }">
        <div class="panel-header">
          <div class="panel-title">
            <el-icon><Edit /></el-icon>
            <span>答题卡</span>
          </div>
          <div class="panel-stats">
            <span class="stat-item">
              <span class="stat-label">已答</span>
              <span class="stat-value answered">{{ answeredCount }}</span>
            </span>
            <span class="stat-divider">/</span>
            <span class="stat-item">
              <span class="stat-label">总计</span>
              <span class="stat-value">{{ totalCount }}</span>
            </span>
          </div>
        </div>
        <div class="panel-scroll">
          <div v-for="group in groupedQuestions" :key="group.type" class="type-group">
            <div class="group-header">
              <el-icon class="group-icon" :style="{ color: getTypeColor(group.type) }">
                <component :is="getTypeIcon(group.type)" />
              </el-icon>
              <span class="group-name">{{ group.typeName }}</span>
              <span class="group-count">{{ group.items.length }}题</span>
            </div>
            <div v-for="item in group.items" :key="item.id" class="question-card" :class="{ 'unanswered-highlight': isQuestionUnanswered(item) }">
              <!-- 单选题 -->
              <template v-if="item.type === 'single'">
                <div class="inline-question">
                  <div class="q-label">
                    <span class="q-number">{{ item.displayIndex }}</span>
                    <span class="q-score">({{ item.score }}分)</span>
                  </div>
                  <div class="options-inline">
                    <div
                      v-for="opt in item.options"
                      :key="opt.label"
                      class="option-item"
                      :class="{ selected: answers[item.id] === opt.label }"
                      @click="handleAnswer(item.id, answers[item.id] === opt.label ? '' : opt.label)"
                    >
                      <span class="option-label">{{ opt.label }}</span>
                    </div>
                  </div>
                </div>
              </template>

              <!-- 多选题 -->
              <template v-else-if="item.type === 'multiple'">
                <div class="inline-question">
                  <div class="q-label">
                    <span class="q-number">{{ item.displayIndex }}</span>
                    <span class="q-score">({{ item.score }}分)</span>
                  </div>
                  <div class="options-inline">
                    <div
                      v-for="opt in item.options"
                      :key="opt.label"
                      class="option-item"
                      :class="{ selected: (answers[item.id] || []).includes(opt.label) }"
                      @click="toggleMultiple(item.id, opt.label)"
                    >
                      <span class="option-label">{{ opt.label }}</span>
                    </div>
                  </div>
                </div>
              </template>

              <!-- 判断题 -->
              <template v-else-if="item.type === 'judge'">
                <div class="inline-question">
                  <div class="q-label">
                    <span class="q-number">{{ item.displayIndex }}</span>
                    <span class="q-score">({{ item.score }}分)</span>
                  </div>
                  <div class="judge-inline">
                    <div
                      class="judge-item"
                      :class="{ selected: answers[item.id] === true }"
                      @click="handleAnswer(item.id, answers[item.id] === true ? '' : true)"
                    >
                      <el-icon :size="16"><Select /></el-icon>
                      <span>正确</span>
                    </div>
                    <div
                      class="judge-item"
                      :class="{ selected: answers[item.id] === false }"
                      @click="handleAnswer(item.id, answers[item.id] === false ? '' : false)"
                    >
                      <el-icon :size="16"><CloseBold /></el-icon>
                      <span>错误</span>
                    </div>
                  </div>
                </div>
              </template>

              <!-- 填空题 -->
              <template v-else-if="item.type === 'blank'">
                <div class="card-header">
                  <span class="q-number">{{ item.displayIndex }}</span>
                  <span class="q-score">({{ item.score }}分)</span>
                </div>
                <div class="card-body">
                  <div class="blank-list">
                    <div v-for="(blank, bi) in item.blanks" :key="blank.id" class="blank-item">
                      <span class="blank-label">第{{ bi + 1 }}空</span>
                      <el-input
                        size="default"
                        :model-value="(answers[item.id] || {})[blank.id] || ''"
                        @update:model-value="(val) => updateBlank(item.id, blank.id, val)"
                        placeholder="请输入答案"
                      />
                    </div>
                  </div>
                </div>
              </template>

              <!-- 简答题 -->
              <template v-else-if="item.type === 'essay'">
                <div class="card-header">
                  <span class="q-number">{{ item.displayIndex }}</span>
                  <span class="q-score">({{ item.score }}分)</span>
                </div>
                <div class="card-body">
                  <el-input
                    type="textarea"
                    :rows="4"
                    :model-value="(answers[item.id] || {}).text || ''"
                    @update:model-value="(val) => updateEssay(item.id, val)"
                    placeholder="请输入答案..."
                  />
                  <div class="essay-upload">
                    <el-upload
                      action="#"
                      :auto-upload="false"
                      :show-file-list="true"
                      accept="image/*,.pdf,.doc,.docx"
                    >
                      <el-button size="small">
                        <el-icon><Upload /></el-icon>
                        上传附件
                      </el-button>
                    </el-upload>
                    <span class="upload-tip">支持图片、PDF、Word文档</span>
                  </div>
                </div>
              </template>

              <!-- 完形填空 -->
              <template v-else-if="item.type === 'cloze'">
                <div class="card-header">
                  <span class="q-number">{{ item.displayIndex }}</span>
                  <span class="q-score">({{ item.score }}分)</span>
                </div>
                <div class="card-body">
                  <div class="cloze-list">
                    <div v-for="blank in item.blanks" :key="blank.id" class="cloze-item">
                      <span class="cloze-number">{{ blank.order }}.</span>
                      <div class="cloze-options">
                        <span
                          v-for="opt in blank.options"
                          :key="opt.label"
                          class="option-item"
                          :class="{ selected: (answers[item.id] || {})[blank.id] === opt.label }"
                          @click="updateCloze(item.id, blank.id, opt.label)"
                        >{{ opt.label }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <!-- 复合题 -->
              <template v-else-if="item.type === 'composite'">
                <div class="card-header composite">
                  <span class="q-number">{{ item.displayIndex }}</span>
                  <span class="q-type-tag">复合题</span>
                  <span class="q-score">({{ item.score }}分)</span>
                </div>
                <div class="card-body">
                  <div class="composite-list">
                    <div v-for="(sub, si) in item.subQuestions" :key="sub.id" class="sub-question">
                      <div class="sub-header">
                        <span class="sub-number">{{ item.displayIndex }}-{{ si + 1 }}</span>
                        <span class="sub-type">{{ getSubTypeName(sub.type) }}</span>
                        <span class="sub-score">({{ sub.score }}分)</span>
                      </div>

                      <!-- 子题：单选 -->
                      <template v-if="sub.type === 'single'">
                        <div class="options-inline">
                          <div
                            v-for="opt in sub.options"
                            :key="opt.label"
                            class="option-item"
                            :class="{ selected: (answers[item.id] || {})[sub.id] === opt.label }"
                            @click="handleCompositeAnswer(item.id, sub.id, (answers[item.id] || {})[sub.id] === opt.label ? '' : opt.label)"
                          >
                            <span class="option-label">{{ opt.label }}</span>
                          </div>
                        </div>
                      </template>

                      <!-- 子题：多选 -->
                      <template v-else-if="sub.type === 'multiple'">
                        <div class="options-inline">
                          <div
                            v-for="opt in sub.options"
                            :key="opt.label"
                            class="option-item"
                            :class="{ selected: ((answers[item.id] || {})[sub.id] || []).includes(opt.label) }"
                            @click="toggleCompositeMultiple(item.id, sub.id, opt.label)"
                          >
                            <span class="option-label">{{ opt.label }}</span>
                          </div>
                        </div>
                      </template>

                      <!-- 子题：判断 -->
                      <template v-else-if="sub.type === 'judge'">
                        <div class="judge-inline">
                          <div
                            class="judge-item"
                            :class="{ selected: (answers[item.id] || {})[sub.id] === true }"
                            @click="handleCompositeAnswer(item.id, sub.id, (answers[item.id] || {})[sub.id] === true ? '' : true)"
                          >
                            <el-icon :size="16"><Select /></el-icon>
                            <span>正确</span>
                          </div>
                          <div
                            class="judge-item"
                            :class="{ selected: (answers[item.id] || {})[sub.id] === false }"
                            @click="handleCompositeAnswer(item.id, sub.id, (answers[item.id] || {})[sub.id] === false ? '' : false)"
                          >
                            <el-icon :size="16"><CloseBold /></el-icon>
                            <span>错误</span>
                          </div>
                        </div>
                      </template>

                      <!-- 子题：填空 -->
                      <template v-else-if="sub.type === 'blank'">
                        <div class="blank-list">
                          <div v-for="(blank, sbi) in sub.blanks" :key="blank.id" class="blank-item">
                            <span class="blank-label">第{{ sbi + 1 }}空</span>
                            <el-input
                              size="default"
                              :model-value="((answers[item.id] || {})[sub.id] || {})[blank.id] || ''"
                              @update:model-value="(val) => updateCompositeBlank(item.id, sub.id, blank.id, val)"
                              placeholder="请输入"
                            />
                          </div>
                        </div>
                      </template>

                      <!-- 子题：简答 -->
                      <template v-else-if="sub.type === 'essay'">
                        <el-input
                          type="textarea"
                          :rows="3"
                          :model-value="((answers[item.id] || {})[sub.id] || {}).text || ''"
                          @update:model-value="(val) => updateCompositeEssay(item.id, sub.id, val)"
                          placeholder="请输入答案..."
                        />
                        <div class="essay-upload">
                          <el-upload
                            action="#"
                            :auto-upload="false"
                            :show-file-list="true"
                            accept="image/*,.pdf,.doc,.docx"
                          >
                            <el-button size="small">
                              <el-icon><Upload /></el-icon>
                              上传附件
                            </el-button>
                          </el-upload>
                          <span class="upload-tip">支持图片、PDF、Word文档</span>
                        </div>
                      </template>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useExamStore } from '@/stores/exam'
import { useAnswerStore } from '@/stores/answer'
import { enterExam } from '@/api/exam'
import { Clock, Document, Reading, Edit, Select, CloseBold, WarningFilled, Upload, CircleCheck, CircleClose, QuestionFilled, Tickets, ChatLineSquare, Grid, Connection, CircleCheckFilled, Camera } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import CaptureOverlay from './components/CaptureOverlay.vue'

const route = useRoute()
const router = useRouter()
const examStore = useExamStore()
const answerStore = useAnswerStore()

const loading = ref(true)
const leftWidth = ref(55)
const showCapture = ref(false)
const showSubmitDialog = ref(false)
const submitting = ref(false)
const highlightUnanswered = ref(false)
let captureTimer = null
let isResizing = false

const exam = computed(() => examStore.currentExam)
const paper = computed(() => examStore.currentPaper)
const questions = computed(() => paper.value?.questions || [])
const documentPages = computed(() => paper.value?.documentPages || [])
const answers = computed(() => answerStore.answers)
const remainingTime = computed(() => answerStore.remainingTime)
const formattedTime = computed(() => answerStore.formattedTime)

const totalCount = computed(() => questions.value.length)
const answeredCount = computed(() => answerStore.answeredCount)
const unansweredCount = computed(() => totalCount.value - answeredCount.value)

const groupedQuestions = computed(() => {
  const groups = {}
  let index = 1
  questions.value.forEach((q) => {
    if (!groups[q.type]) {
      groups[q.type] = { type: q.type, typeName: q.typeName || q.type, items: [] }
    }
    groups[q.type].items.push({ ...q, displayIndex: index++ })
  })
  return Object.values(groups)
})

onMounted(async () => {
  await loadExamData()
  scheduleCapture()
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
})

onUnmounted(() => {
  answerStore.stopCountdown()
  answerStore.stopAutoSave()
  if (captureTimer) clearTimeout(captureTimer)
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
})

async function loadExamData() {
  loading.value = true
  try {
    const data = await enterExam(route.params.id)
    examStore.setCurrentPaper(data.paper)
    answerStore.initAnswer(route.params.id, data.paper.id, data.duration)
  } catch (error) {
    ElMessage.error('加载试卷失败')
    router.back()
  } finally {
    loading.value = false
  }
}

function scheduleCapture() {
  const config = exam.value?.config
  if (!config?.enableRandomCapture || !config.captureCount) return
  const delay = Math.random() * 60000 + 30000
  captureTimer = setTimeout(() => { showCapture.value = true }, delay)
}

function handleCaptureComplete() {
  showCapture.value = false
  scheduleCapture()
}

function startResize() { isResizing = true }
function stopResize() { isResizing = false }
function onResize(e) {
  if (!isResizing) return
  const container = document.querySelector('.doc-body')
  if (!container) return
  const rect = container.getBoundingClientRect()
  const percent = ((e.clientX - rect.left) / rect.width) * 100
  leftWidth.value = Math.min(75, Math.max(25, percent))
}

function getTypeColor(type) {
  const map = {
    single: '#409EFF',
    multiple: '#67C23A',
    judge: '#E6A23C',
    blank: '#909399',
    essay: '#F56C6C',
    cloze: '#9C27B0',
    composite: '#00BCD4'
  }
  return map[type] || '#909399'
}

function getTypeIcon(type) {
  const map = {
    single: CircleCheck,
    multiple: CircleCheck,
    judge: QuestionFilled,
    blank: Edit,
    essay: ChatLineSquare,
    cloze: Grid,
    composite: Connection
  }
  return map[type] || Document
}

function getSubTypeName(type) {
  const map = {
    single: '单选',
    multiple: '多选',
    judge: '判断',
    blank: '填空',
    essay: '简答'
  }
  return map[type] || type
}

function handleAnswer(qId, value) {
  answerStore.saveAnswer(qId, value)
}

function toggleMultiple(qId, label) {
  const current = answers.value[qId] || []
  const idx = current.indexOf(label)
  if (idx > -1) {
    answerStore.saveAnswer(qId, current.filter((l) => l !== label))
  } else {
    answerStore.saveAnswer(qId, [...current, label].sort())
  }
}

function updateBlank(qId, blankId, value) {
  const current = answers.value[qId] || {}
  answerStore.saveAnswer(qId, { ...current, [blankId]: value })
}

function updateEssay(qId, value) {
  const current = answers.value[qId] || { text: '', attachments: [] }
  answerStore.saveAnswer(qId, { ...current, text: value })
}

function updateCloze(qId, blankId, label) {
  const current = answers.value[qId] || {}
  const newVal = current[blankId] === label ? '' : label
  answerStore.saveAnswer(qId, { ...current, [blankId]: newVal })
}

// 复合题答案处理
function handleCompositeAnswer(qId, subId, value) {
  const current = answers.value[qId] || {}
  answerStore.saveAnswer(qId, { ...current, [subId]: value })
}

function toggleCompositeMultiple(qId, subId, label) {
  const current = answers.value[qId] || {}
  const subAnswer = current[subId] || []
  const idx = subAnswer.indexOf(label)
  if (idx > -1) {
    answerStore.saveAnswer(qId, { ...current, [subId]: subAnswer.filter((l) => l !== label) })
  } else {
    answerStore.saveAnswer(qId, { ...current, [subId]: [...subAnswer, label].sort() })
  }
}

function updateCompositeBlank(qId, subId, blankId, value) {
  const current = answers.value[qId] || {}
  const subAnswer = current[subId] || {}
  answerStore.saveAnswer(qId, { ...current, [subId]: { ...subAnswer, [blankId]: value } })
}

function updateCompositeEssay(qId, subId, value) {
  const current = answers.value[qId] || {}
  const subAnswer = current[subId] || { text: '', attachments: [] }
  answerStore.saveAnswer(qId, { ...current, [subId]: { ...subAnswer, text: value } })
}

function handleSubmit() {
  const minTime = exam.value?.config?.minAnswerTime || 0
  const elapsed = Math.floor((Date.now() - answerStore.startTime) / 60000)
  if (elapsed < minTime) {
    ElMessage.warning(`答题时间不足${minTime}分钟，无法提交`)
    return
  }

  // 检查未答题目
  if (unansweredCount.value > 0) {
    const unansweredList = getUnansweredQuestions()
    const unansweredText = unansweredList.map(q => `第${q}题`).join('、')

    ElMessage({
      message: `还有 ${unansweredCount.value} 题未作答：${unansweredText}`,
      type: 'warning',
      duration: 5000,
      showClose: true,
      center: true
    })

    // 高亮未答题目
    highlightUnanswered.value = true

    // 5秒后取消高亮
    setTimeout(() => {
      highlightUnanswered.value = false
    }, 5000)

    // 不显示弹窗，直接返回
    return
  }

  // 全部答完，显示弹窗确认
  showSubmitDialog.value = true
}

// 获取未答题目列表
function getUnansweredQuestions() {
  const unanswered = []
  let index = 1
  questions.value.forEach((q) => {
    const answer = answers.value[q.id]
    let isAnswered = false

    if (q.type === 'single' || q.type === 'judge') {
      isAnswered = answer !== undefined && answer !== '' && answer !== null
    } else if (q.type === 'multiple') {
      isAnswered = Array.isArray(answer) && answer.length > 0
    } else if (q.type === 'blank') {
      isAnswered = answer && Object.keys(answer).length > 0 && Object.values(answer).some(v => v)
    } else if (q.type === 'essay') {
      isAnswered = answer && answer.text && answer.text.trim() !== ''
    } else if (q.type === 'cloze') {
      isAnswered = answer && Object.keys(answer).length > 0
    } else if (q.type === 'composite') {
      isAnswered = answer && Object.keys(answer).length > 0
    }

    if (!isAnswered) {
      unanswered.push(index)
    }
    index++
  })
  return unanswered
}

// 判断题目是否未答
function isQuestionUnanswered(item) {
  if (!highlightUnanswered.value) return false

  const answer = answers.value[item.id]

  if (item.type === 'single' || item.type === 'judge') {
    return answer === undefined || answer === '' || answer === null
  } else if (item.type === 'multiple') {
    return !Array.isArray(answer) || answer.length === 0
  } else if (item.type === 'blank') {
    return !answer || Object.keys(answer).length === 0 || !Object.values(answer).some(v => v)
  } else if (item.type === 'essay') {
    return !answer || !answer.text || answer.text.trim() === ''
  } else if (item.type === 'cloze') {
    return !answer || Object.keys(answer).length === 0
  } else if (item.type === 'composite') {
    return !answer || Object.keys(answer).length === 0
  }

  return false
}

async function confirmSubmit() {
  submitting.value = true
  try {
    await new Promise((r) => setTimeout(r, 800))
    answerStore.reset()
    router.replace(`/exam/success/${route.params.id}`)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.exam-answer-doc-page {
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

.header-right .submit-btn {
  background: linear-gradient(135deg, #00B96B 0%, #00D68F 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(0, 185, 107, 0.35);
  font-weight: 600;
  padding: 12px 28px;
  font-size: 15px;
}

.header-right .submit-btn:hover {
  background: linear-gradient(135deg, #00a862 0%, #00c280 100%);
  box-shadow: 0 6px 16px rgba(0, 185, 107, 0.45);
  transform: translateY(-1px);
}

.header-right .submit-btn:active {
  transform: translateY(0);
}

.header-left {
  display: flex;
  align-items: center;
}

.exam-header h1 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #303133;
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

.loading-wrapper {
  flex: 1;
  padding: 24px;
  background: #fff;
  margin: 16px;
  border-radius: 12px;
}

/* 主体区域 */
.doc-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  gap: 0;
}

/* 左侧文档预览 */
.doc-preview {
  background: #fff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e4e7ed;
}

.doc-header {
  height: 48px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 20px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
  font-weight: 600;
  font-size: 14px;
  color: #606266;
}

.doc-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.doc-page {
  background: #fff;
  padding: 32px;
  margin-bottom: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  font-size: 15px;
  line-height: 2;
  color: #303133;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.doc-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #C9CDD4;
  gap: 16px;
}

.doc-placeholder p {
  font-size: 14px;
  margin: 0;
}

/* 分隔条 */
.resizer {
  width: 8px;
  background: #f5f7fa;
  cursor: col-resize;
  flex-shrink: 0;
  position: relative;
  transition: background 0.2s;
}

.resizer:hover {
  background: #e4e7ed;
}

.resizer-handle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.resizer-handle span {
  width: 3px;
  height: 16px;
  background: #909399;
  border-radius: 2px;
}

.resizer:hover .resizer-handle span {
  background: #00B96B;
}

/* 右侧答题面板 */
.answer-panel {
  background: #fff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-header {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
  color: #606266;
}

.panel-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-label {
  color: #909399;
}

.stat-value {
  font-weight: 600;
  color: #303133;
  font-family: 'DIN Alternate', monospace;
}

.stat-value.answered {
  color: #00B96B;
}

.stat-divider {
  color: #dcdfe6;
  margin: 0 4px;
}

.panel-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* 题型分组 */
.type-group {
  margin-bottom: 24px;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f5f7fa;
}

.group-icon {
  font-size: 18px;
}

.group-name {
  font-weight: 600;
  font-size: 15px;
  color: #303133;
}

.group-count {
  font-size: 13px;
  color: #909399;
}

/* 题目卡片 */
.question-card {
  background: #fafafa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 6px;
  transition: all 0.2s;
}

.question-card:hover {
  background: #fff;
  border-color: #00B96B;
  box-shadow: 0 2px 8px rgba(0, 185, 107, 0.08);
}

.question-card.unanswered-highlight {
  border: 2px solid #F56C6C;
  background: #fef0f0;
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

/* 单行布局 */
.inline-question {
  display: flex;
  align-items: center;
  gap: 12px;
}

.q-label {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 70px;
  flex-shrink: 0;
}

.q-number {
  font-weight: 600;
  font-size: 14px;
  color: #303133;
}

.q-score {
  font-size: 11px;
  color: #909399;
}

/* 单行选项 */
.options-inline {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  flex: 1;
}

.option-item {
  width: 32px;
  height: 32px;
  border: 1.5px solid #dcdfe6;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: 500;
  font-size: 13px;
  transition: all 0.15s;
  background: #fff;
  flex-shrink: 0;
}

.option-item:hover {
  border-color: #00B96B;
  background: #f0fdf4;
  transform: translateY(-1px);
}

.option-item.selected {
  background: #00B96B;
  border-color: #00B96B;
  color: #fff;
  box-shadow: 0 2px 6px rgba(0, 185, 107, 0.25);
}

.option-label {
  font-weight: 600;
}

/* 单行判断题 */
.judge-inline {
  display: flex;
  gap: 6px;
  flex: 1;
}

.judge-item {
  flex: 1;
  max-width: 120px;
  height: 32px;
  border: 1.5px solid #dcdfe6;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  font-weight: 500;
  font-size: 12px;
  transition: all 0.15s;
  background: #fff;
}

.judge-item:hover {
  border-color: #00B96B;
  background: #f0fdf4;
  transform: translateY(-1px);
}

.judge-item.selected {
  background: #00B96B;
  border-color: #00B96B;
  color: #fff;
  box-shadow: 0 2px 6px rgba(0, 185, 107, 0.25);
}

/* 多行布局（填空、简答等） */
.card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px dashed #e4e7ed;
}

.card-header.composite {
  background: linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%);
  margin: -10px -12px 10px;
  padding: 10px 12px;
  border-bottom: 1px solid #91d5ff;
  border-radius: 6px 6px 0 0;
}

.q-type-tag {
  padding: 2px 6px;
  background: #00BCD4;
  color: #fff;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 500;
}

.card-body {
  padding: 2px 0;
}

/* 选项网格（用于复合题子题） */
.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(32px, 1fr));
  gap: 5px;
}

/* 判断题选项（用于复合题子题） */
.judge-options {
  display: flex;
  gap: 6px;
}

/* 填空题 */
.blank-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.blank-list.compact {
  gap: 6px;
}

.blank-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.blank-item :deep(.el-input) {
  flex: 1;
}

.blank-item :deep(.el-input__wrapper) {
  padding: 4px 8px;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

.blank-item :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #00B96B inset;
}

.blank-item :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #00B96B inset;
}

.blank-label {
  font-size: 12px;
  color: #606266;
  min-width: 50px;
  font-weight: 500;
}

/* 简答题 */
.card-body :deep(.el-textarea__inner) {
  padding: 8px 10px;
  font-size: 13px;
  line-height: 1.6;
}

.card-body :deep(.el-textarea__inner:hover) {
  border-color: #00B96B;
}

.card-body :deep(.el-textarea__inner:focus) {
  border-color: #00B96B;
}

.essay-upload {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
}

.essay-upload :deep(.el-button) {
  padding: 5px 12px;
}

.essay-upload :deep(.el-upload-list) {
  margin-top: 8px;
}

/* 文件列表样式优化 */
.essay-upload :deep(.el-upload-list__item) {
  transition: all 0.2s;
  margin-top: 6px;
}

.essay-upload :deep(.el-upload-list__item-name) {
  color: #606266;
  font-size: 13px;
}

/* 删除图标始终显示 */
.essay-upload :deep(.el-upload-list__item .el-icon--close) {
  display: inline-flex !important;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.essay-upload :deep(.el-upload-list__item:hover .el-icon--close) {
  opacity: 1;
}

.essay-upload :deep(.el-upload-list__item .el-icon--close-tip) {
  display: none !important;
}

/* 完形填空 */
.cloze-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cloze-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cloze-number {
  font-size: 13px;
  color: #606266;
  font-weight: 600;
  min-width: 28px;
}

.cloze-options {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

/* 复合题 */
.composite-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sub-question {
  padding: 10px;
  background: #f5f7fa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.sub-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px dashed #dcdfe6;
}

.sub-number {
  font-weight: 600;
  font-size: 13px;
  color: #303133;
}

.sub-type {
  padding: 2px 6px;
  background: #e4e7ed;
  color: #606266;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 500;
}

.sub-score {
  margin-left: auto;
  font-size: 11px;
  color: #909399;
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
  font-family: 'DIN Alternate', monospace;
  margin-bottom: 8px;
}

.stat-number.success {
  color: #00B96B;
}

.stat-text {
  font-size: 13px;
  color: #909399;
}

.stat-divider {
  width: 1px;
  height: 48px;
  background: #e4e7ed;
}

.success-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #00B96B;
  font-size: 14px;
  margin: 0;
  padding: 12px;
  background: #f0fdf4;
  border-radius: 6px;
}

.warning-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #E6A23C;
  font-size: 14px;
  margin: 0;
  padding: 12px;
  background: #fef0e6;
  border-radius: 6px;
}
</style>
