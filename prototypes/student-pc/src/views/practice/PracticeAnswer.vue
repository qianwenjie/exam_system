<template>
  <div class="practice-answer-page">
    <!-- 顶部栏 -->
    <header class="answer-header">
      <div class="header-left">
        <button class="back-btn" @click="handleBack">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <h1 class="task-name">{{ task?.name || '刷题答题' }}</h1>
      </div>
      <div class="header-center">
        <span class="progress-text">
          已答 <span class="progress-num">{{ store.answeredCount }}</span> / {{ store.questions.length }}
        </span>
      </div>
      <div class="header-right">
        <button class="finish-btn" @click="finishPractice">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px">
            <polyline points="20 6 9 17 4 12" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          {{ isWrongRedoMode || isSingleRedoMode ? '完成复习' : '完成刷题' }}
        </button>
      </div>
    </header>

    <!-- 主体 -->
    <div v-if="loading" class="loading-center">
      <el-skeleton :rows="8" animated style="padding: 40px" />
    </div>

    <div v-else-if="currentQuestion" class="answer-body">
      <!-- 左侧题目导航（按题型分组） -->
      <aside class="question-nav">
        <div class="nav-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:18px;height:18px"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          <span>题目导航</span>
        </div>
        <div class="nav-scroll">
          <div v-for="group in questionGroups" :key="group.type" class="nav-group">
            <div class="nav-group-header">
              <span class="nav-group-dot" :style="{ background: typeColor(group.type) }"></span>
              <span>{{ group.typeName }}</span>
            </div>
            <div class="nav-grid">
              <div
                v-for="item in group.items"
                :key="item.id"
                class="nav-item"
                :class="getNavItemClass(item.id, item.globalIndex)"
                @click="store.setCurrentQuestion(item.globalIndex)"
              >
                {{ item.sortedIndex + 1 }}
              </div>
            </div>
          </div>
        </div>
        <div class="nav-footer">
          <div class="nav-legend">
            <span class="legend-item">
              <span class="dot correct"></span>
              <span>答对 {{ store.correctCount }}</span>
            </span>
            <span class="legend-sep">/</span>
            <span class="legend-item">
              <span class="dot wrong"></span>
              <span>答错 {{ store.wrongCount }}</span>
            </span>
            <span class="legend-sep">/</span>
            <span class="legend-item">
              <span class="dot"></span>
              <span>未答 {{ store.questions.length - store.answeredCount }}</span>
            </span>
          </div>
        </div>
      </aside>

      <!-- 右侧答题区 -->
      <main class="answer-main">
        <div class="question-area">
          <!-- 题型标签 + 收藏 -->
          <div class="question-toolbar">
            <span class="question-type-tag" :style="{ background: typeColor(currentQuestion.type) }">
              {{ currentQuestion.typeName || currentQuestion.type }}
            </span>
            <button class="favorite-btn" :class="{ active: isFavorited }" @click="toggleFavorite">
              <svg viewBox="0 0 24 24" :fill="isFavorited ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.5" style="width:16px;height:16px">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
              {{ isFavorited ? '已收藏' : '收藏' }}
            </button>
          </div>

          <QuestionItem
            :question="currentQuestion"
            :answer="currentAnswer"
            :readonly="isAnswered"
            @update:answer="handleAnswerChange"
          />

          <!-- 作答后：反馈区（内嵌在滚动区） -->
          <template v-if="isAnswered">
            <div v-if="!currentResult.isCorrect" class="wrong-book-hint">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:14px;height:14px">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              已加入错题本
            </div>
            <AnswerFeedback
              :result="currentResult"
              :question="currentQuestion"
              :is-favorited="isFavorited"
              :user-answer="currentAnswer"
              @toggle-favorite="toggleFavorite"
            />
          </template>

          <!-- 底部占位，防止内容被悬浮栏遮挡 -->
          <div class="bottom-spacer"></div>
        </div>

        <!-- 悬浮底部操作栏 -->
        <div class="floating-bar">
          <el-button
            v-if="!isAnswered && hasAnswer"
            type="primary"
            @click="confirmAnswer"
          >提交答案</el-button>
          <el-button :disabled="!currentQuestion || sortedIndexMap[currentQuestion.id] === 0" @click="goPrevSorted()">上一题</el-button>
          <el-button
            v-if="currentQuestion && sortedIndexMap[currentQuestion.id] < store.questions.length - 1"
            :type="isAnswered ? 'primary' : 'default'"
            @click="goNextSorted()"
          >下一题</el-button>
          <el-button v-else type="primary" @click="finishPractice">{{ isWrongRedoMode || isSingleRedoMode ? '完成复习' : '完成刷题' }}</el-button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePracticeStore } from '@/stores/practice'
import { ElMessageBox, ElMessage } from 'element-plus'
import QuestionItem from '@/views/exam/components/QuestionItem.vue'
import AnswerFeedback from './components/AnswerFeedback.vue'

const route = useRoute()
const router = useRouter()
const store = usePracticeStore()

const loading = ref(true)
const task = ref(null)
const taskId = route.params.id

const isWrongRedoMode = computed(() => route.query.mode === 'wrong-redo')
const isSingleRedoMode = computed(() => route.name === 'WrongBookRedo')
const currentQuestion = computed(() => {
  const q = store.currentQuestion
  if (!q) return null
  return { ...q, displayIndex: (sortedIndexMap.value[q.id] ?? store.currentQuestionIndex) + 1 }
})
const currentAnswer = computed(() => {
  if (!currentQuestion.value) return null
  return store.answers[currentQuestion.value.id] ?? null
})
const currentResult = computed(() => {
  if (!currentQuestion.value) return null
  return store.results[currentQuestion.value.id] || null
})
const isAnswered = computed(() => !!currentResult.value)
const hasAnswer = computed(() => {
  const ans = currentAnswer.value
  if (ans === null || ans === undefined || ans === '') return false
  if (Array.isArray(ans)) return ans.length > 0
  if (typeof ans === 'object') return Object.keys(ans).length > 0
  return true
})
const isFavorited = computed(() => {
  if (!currentQuestion.value) return false
  return store.favorites.includes(currentQuestion.value.id)
})

// 按题型分组的导航数据
const TYPE_NAMES = {
  single: '单选题', multiple: '多选题', judge: '判断题',
  blank: '填空题', essay: '简答题', cloze: '完形填空', composite: '复合题',
}
const TYPE_ORDER = ['single', 'multiple', 'judge', 'blank', 'essay', 'cloze', 'composite']

// 按题型排序后的题目列表，用于构建连续序号
const sortedQuestions = computed(() => {
  const sorted = [...store.questions]
  sorted.sort((a, b) => {
    const ai = TYPE_ORDER.indexOf(a.type)
    const bi = TYPE_ORDER.indexOf(b.type)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })
  return sorted
})

// 题目id -> 排序后的全局序号（0-based）
const sortedIndexMap = computed(() => {
  const map = {}
  sortedQuestions.value.forEach((q, i) => { map[q.id] = i })
  return map
})

const questionGroups = computed(() => {
  const groups = {}
  sortedQuestions.value.forEach((q, sortedIdx) => {
    const type = q.type
    if (!groups[type]) groups[type] = { type, typeName: q.typeName || TYPE_NAMES[type] || type, items: [] }
    // originalIndex: 在 store.questions 中的原始位置，用于导航
    const originalIndex = store.questions.findIndex(sq => sq.id === q.id)
    groups[type].items.push({ id: q.id, globalIndex: originalIndex, sortedIndex: sortedIdx })
  })
  return Object.values(groups)
})

function typeColor(type) {
  const map = { single: '#2563EB', multiple: '#667eea', judge: '#34C759', blank: '#FF9500', essay: '#ff3b30', cloze: '#AF52DE', composite: '#FF2D55' }
  return map[type] || '#86868b'
}

function getNavItemClass(qId, idx) {
  const result = store.results[qId]
  const isCurrent = idx === store.currentQuestionIndex
  if (result?.isCorrect) return isCurrent ? 'correct current' : 'correct'
  if (result && !result.isCorrect) return isCurrent ? 'wrong current' : 'wrong'
  return isCurrent ? 'current' : ''
}

// 按排序顺序跳转到上一题/下一题
function goPrevSorted() {
  if (!currentQuestion.value) return
  const sortedIdx = sortedIndexMap.value[currentQuestion.value.id]
  if (sortedIdx <= 0) return
  const prevQ = sortedQuestions.value[sortedIdx - 1]
  const originalIdx = store.questions.findIndex(q => q.id === prevQ.id)
  if (originalIdx >= 0) store.setCurrentQuestion(originalIdx)
}

function goNextSorted() {
  if (!currentQuestion.value) return
  const sortedIdx = sortedIndexMap.value[currentQuestion.value.id]
  if (sortedIdx >= sortedQuestions.value.length - 1) return
  const nextQ = sortedQuestions.value[sortedIdx + 1]
  const originalIdx = store.questions.findIndex(q => q.id === nextQ.id)
  if (originalIdx >= 0) store.setCurrentQuestion(originalIdx)
}

function handleAnswerChange(val) {
  if (!currentQuestion.value || isAnswered.value) return
  store.answers[currentQuestion.value.id] = val
}

function confirmAnswer() {
  const q = currentQuestion.value
  const val = currentAnswer.value
  if (!q || val === null || val === undefined) return
  const isCorrect = checkAnswer(val, q)
  let extra = null
  if (q.type === 'essay') {
    extra = { type: 'essay', accuracy: calcEssayAccuracy(val, q.correctAnswer) }
  } else if (q.type === 'composite') {
    const subAccuracies = {}
    ;(q.subQuestions || []).forEach(sq => {
      if (sq.type === 'essay') {
        subAccuracies[sq.id] = calcEssayAccuracy((val || {})[sq.id], sq.correctAnswer)
      }
    })
    extra = { type: 'composite', subAccuracies }
  }
  store.submitAnswer(q.id, val, isCorrect, extra)
}

function checkAnswer(userAnswer, question) {
  const correct = question.correctAnswer
  if (question.type === 'single') return userAnswer === correct
  if (question.type === 'multiple') {
    if (!Array.isArray(userAnswer) || !Array.isArray(correct)) return false
    return userAnswer.length === correct.length && userAnswer.every(a => correct.includes(a))
  }
  if (question.type === 'judge') return String(userAnswer) === String(correct)
  if (question.type === 'blank') {
    if (userAnswer && typeof userAnswer === 'object' && !Array.isArray(userAnswer) && Array.isArray(correct)) {
      const blanks = question.blanks || []
      return blanks.every((b, i) => (userAnswer[b.id] || '').trim().toLowerCase() === (correct[i] || '').trim().toLowerCase())
    }
    return false
  }
  if (question.type === 'essay') return calcEssayAccuracy(userAnswer, correct) >= 80
  if (question.type === 'cloze') {
    if (!question.blanks || !correct || typeof correct !== 'object') return false
    return question.blanks.every(blank => (userAnswer || {})[blank.id] === correct[blank.id])
  }
  if (question.type === 'composite') {
    if (!question.subQuestions) return false
    return question.subQuestions.every(sq => {
      const ua = (userAnswer || {})[sq.id]
      const ca = sq.correctAnswer
      if (sq.type === 'single') return ua === ca
      if (sq.type === 'multiple') return Array.isArray(ua) && Array.isArray(ca) && ua.length === ca.length && ua.every(a => ca.includes(a))
      if (sq.type === 'judge') return String(ua) === String(ca)
      if (sq.type === 'blank') {
        const blanks = sq.blanks || []
        if (typeof ua === 'object' && ua !== null && !Array.isArray(ua) && Array.isArray(ca)) {
          return blanks.every((b, i) => (ua[b.id] || '').trim().toLowerCase() === (ca[i] || '').trim().toLowerCase())
        }
        return false
      }
      if (sq.type === 'essay') return calcEssayAccuracy(ua, ca) >= 80
      return false
    })
  }
  return false
}

function calcEssayAccuracy(userAnswer, correctAnswer) {
  const userText = (typeof userAnswer === 'string' ? userAnswer : userAnswer?.text || '').trim()
  const correctText = String(correctAnswer || '').trim()
  if (!userText || !correctText) return 0
  const stopWords = ['的', '了', '是', '在', '和', '与', '或', '等']
  const extractKeywords = (text) => text.replace(/[，。、；：！？\s,.;:!?]/g, ' ').split(/\s+/).filter(w => w.length >= 2 && !stopWords.includes(w))
  const correctKeywords = extractKeywords(correctText)
  if (!correctKeywords.length) return userText === correctText ? 100 : 0
  const matchCount = correctKeywords.filter(kw => userText.includes(kw)).length
  return Math.round((matchCount / correctKeywords.length) * 100)
}

function toggleFavorite() {
  if (!currentQuestion.value) return
  store.toggleFavorite(currentQuestion.value.id)
}

async function handleBack() {
  try {
    await ElMessageBox.confirm('确定要退出答题吗？进度已自动保存。', '退出答题', { confirmButtonText: '退出', cancelButtonText: '继续答题', type: 'warning' })
    store.saveProgress(taskId)
    router.back()
  } catch { /* cancel */ }
}

function finishPractice() {
  if (isWrongRedoMode.value || isSingleRedoMode.value) {
    router.replace('/practice/wrong-book')
    return
  }
  store.saveProgress(taskId)
  router.replace(`/practice/result/${taskId}`)
}

onMounted(async () => {
  loading.value = true
  try {
    if (isSingleRedoMode.value) {
      // 单题重做：taskId 实际是 qId
      store.loadWrongBook()
      const ok = store.initSingleRedo(taskId)
      if (!ok) {
        ElMessage.warning('题目数据不存在')
        router.replace('/practice/wrong-book')
        return
      }
      const info = store.wrongBook[taskId]
      task.value = { name: info?.sourceTaskName || '错题重做' }
    } else {
      task.value = await store.fetchTaskDetail(taskId)
      if (isWrongRedoMode.value) {
        store.loadWrongBook()
        const wrongQuestions = store.initWrongRedo(taskId)
        if (!wrongQuestions.length) {
          ElMessage.success('该任务暂无未掌握的错题')
          router.replace('/practice/wrong-book')
          return
        }
        if (!task.value) {
          const fallbackName = store.wrongBookByTask.find(g => g.taskId === taskId)?.taskName
          if (fallbackName) task.value = { name: fallbackName }
        }
      } else {
        const drawCount = parseInt(route.query.drawCount) || 0
        await store.initPractice(taskId, { drawCount })
      }
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.practice-answer-page { display: flex; flex-direction: column; height: 100vh; background: #f5f7fa; }

/* 顶部栏 */
.answer-header { height: 64px; background: #fff; border-bottom: 1px solid #e4e7ed; display: flex; align-items: center; justify-content: space-between; padding: 0 32px; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.header-left { display: flex; align-items: center; gap: 10px; }
.back-btn { width: 32px; height: 32px; border: none; background: rgba(0,0,0,0.04); border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #1d1d1f; transition: background 0.2s; flex-shrink: 0; }
.back-btn:hover { background: rgba(0,0,0,0.08); }
.task-name { font-size: 18px; font-weight: 600; color: #303133; margin: 0; max-width: 400px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.header-center { flex: 1; display: flex; justify-content: center; }
.progress-text { font-size: 14px; color: #606266; }
.progress-num { font-size: 18px; font-weight: 700; color: #2563EB; }
.header-right { display: flex; align-items: center; }
.finish-btn { display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%); border: none; border-radius: 20px; box-shadow: 0 4px 12px rgba(37,99,235,0.35); font-weight: 600; padding: 10px 24px; font-size: 15px; color: #fff; cursor: pointer; transition: all 0.2s; }
.finish-btn:hover { box-shadow: 0 6px 16px rgba(37,99,235,0.45); transform: translateY(-1px); }

.loading-center { flex: 1; display: flex; align-items: center; justify-content: center; }
.answer-body { flex: 1; display: flex; overflow: hidden; }

/* 左侧导航 — 照抄考试模块 */
.question-nav { width: 280px; background: #f5f7fa; border-right: 1px solid #e4e7ed; display: flex; flex-direction: column; flex-shrink: 0; }
.nav-header { height: 56px; display: flex; align-items: center; gap: 8px; padding: 0 20px; border-bottom: 1px solid #e4e7ed; font-size: 16px; font-weight: 600; color: #303133; }
.nav-scroll { flex: 1; overflow-y: auto; padding: 16px; }
.nav-group { margin-bottom: 20px; }
.nav-group:last-child { margin-bottom: 0; }
.nav-group-header { display: flex; align-items: center; gap: 6px; margin-bottom: 12px; font-size: 14px; font-weight: 600; color: #606266; }
.nav-group-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.nav-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; }
.nav-item { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; background: white; border: 1.5px solid #dcdfe6; border-radius: 4px; font-size: 13px; font-weight: 500; color: #606266; cursor: pointer; transition: all 0.2s; }
.nav-item:hover { border-color: #2563EB; color: #2563EB; transform: translateY(-2px); box-shadow: 0 2px 8px rgba(37,99,235,0.15); }
.nav-item.current { border-color: #2563EB; border-width: 2px; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
.nav-item.correct { background: #34C759; border-color: #34C759; color: #fff; }
.nav-item.wrong { background: #ff3b30; border-color: #ff3b30; color: #fff; }
.nav-item.correct.current, .nav-item.wrong.current { box-shadow: 0 0 0 3px rgba(37,99,235,0.25); }
.nav-footer { border-top: 1px solid #e4e7ed; padding: 12px 16px; }
.nav-legend { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.legend-item { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #606266; }
.legend-item .dot { width: 10px; height: 10px; border: 1.5px solid #dcdfe6; border-radius: 2px; background: white; flex-shrink: 0; }
.legend-item .dot.correct { background: #34C759; border-color: #34C759; }
.legend-item .dot.wrong { background: #ff3b30; border-color: #ff3b30; }
.legend-sep { color: #c0c4cc; font-size: 12px; }

/* 右侧答题区 */
.answer-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: white; position: relative; }
.question-area { flex: 1; overflow-y: auto; padding: 24px; }
.bottom-spacer { height: 72px; }

/* 题型标签 + 收藏 */
.question-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.question-type-tag { display: inline-block; padding: 3px 10px; border-radius: 8px; color: #fff; font-size: 12px; font-weight: 500; }
.favorite-btn { display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; border: 1.5px solid #e5e5ea; border-radius: 20px; background: transparent; font-size: 13px; color: #86868b; cursor: pointer; transition: all 0.2s; }
.favorite-btn:hover { border-color: #ff9500; color: #ff9500; }
.favorite-btn.active { border-color: #ff9500; color: #ff9500; background: rgba(255,149,0,0.06); }

/* 错题本提示 */
.wrong-book-hint { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; color: #ff3b30; background: rgba(255,59,48,0.06); border: 1px solid rgba(255,59,48,0.15); border-radius: 6px; padding: 4px 10px; margin: 16px 0 10px; }

/* 悬浮底部操作栏 */
.floating-bar { position: absolute; bottom: 0; left: 0; right: 0; display: flex; align-items: center; gap: 12px; padding: 12px 24px; background: white; border-top: 1px solid #e4e7ed; box-shadow: 0 -4px 12px rgba(0,0,0,0.06); z-index: 10; }
</style>
