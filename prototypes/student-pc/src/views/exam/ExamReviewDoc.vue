<template>
  <div class="exam-review-doc-page">
    <header class="review-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="router.back()">返回</el-button>
        <h1>{{ result.examName }}</h1>
      </div>
      <div class="header-right">
        <span class="score-handwrite">{{ result.score }}</span>
        <span class="score-label">分</span>
      </div>
    </header>

    <div class="review-body">
      <!-- 文档区：flex:1 自动填充剩余空间 -->
      <div class="doc-preview">
        <div class="doc-scroll">
          <div v-for="(page, idx) in documentPages" :key="idx" class="doc-page" v-html="page"></div>
        </div>
      </div>

      <div class="resizer" @mousedown="startResize"></div>

      <!-- 答题卡：固定宽度，不受导航影响 -->
      <div class="answer-panel" :style="{ width: panelWidth + 'px' }">
        <div class="panel-scroll">
          <div v-for="group in result.questionGroups" :key="group.type" class="type-group">
            <div class="group-header">
              <span class="group-name">{{ group.typeName }}</span>
              <span class="group-score">{{ group.gainedScore }}/{{ group.totalScore }}</span>
            </div>

            <div v-for="q in group.questions" :key="q.id" :id="'q-' + q.id" class="answer-card">
              <div class="card-top">
                <span class="card-idx">{{ q.index }}</span>
                <span class="card-score">+{{ q.studentScore }}</span>
              </div>

              <!-- 完形填空：每空选择 -->
              <div v-if="q.blanks" class="cloze-answer">
                <div v-for="blank in q.blanks" :key="blank.order" class="blank-row">
                  <span class="blank-order">第{{ blank.order }}空</span>
                  <span class="blank-val" :class="blank.isCorrect ? 'correct' : 'wrong'">{{ blank.studentAnswer || '-' }}</span>
                  <el-icon v-if="blank.isCorrect" color="#00B96B" :size="12"><Check /></el-icon>
                  <el-icon v-else color="#F56C6C" :size="12"><Close /></el-icon>
                  <span v-if="!blank.isCorrect && showAnswer" class="blank-correct">→{{ blank.correctAnswer }}</span>
                </div>
                <div v-if="showExplanation && q.explanation" class="mini-explanation">{{ q.explanation }}</div>
              </div>

              <!-- 复合题：各子题作答 -->
              <div v-else-if="q.subQuestions" class="sub-answers">
                <div v-for="sq in q.subQuestions" :key="sq.id" class="sub-row">
                  <span class="sub-idx">{{ sq.index }}</span>
                  <div class="sub-content">
                    <!-- 选择 -->
                    <template v-if="sq.options">
                      <div class="opt-badges">
                        <span v-for="opt in sq.options" :key="opt.label" class="opt-badge"
                          :class="{
                            'user-sel': isUserSelected(sq, opt.label),
                            'sel-correct': isUserSelected(sq, opt.label) && isCorrectAnswer(sq, opt.label) && (Array.isArray(sq.correctAnswer) ? isMultipleAllCorrect(sq) : true),
                            'sel-wrong': isUserSelected(sq, opt.label) && !isCorrectAnswer(sq, opt.label),
                            'sel-partial': isUserSelected(sq, opt.label) && isCorrectAnswer(sq, opt.label) && Array.isArray(sq.correctAnswer) && !isMultipleAllCorrect(sq)
                          }"
                        >{{ opt.label }}</span>
                      </div>
                    </template>
                    <!-- 判断 -->
                    <template v-else-if="sq.studentAnswer === true || sq.studentAnswer === false">
                      <span class="judge-val" :class="sq.status">{{ sq.studentAnswer ? '✓' : '✗' }}</span>
                    </template>
                    <!-- 填空 -->
                    <template v-else-if="Array.isArray(sq.studentAnswer)">
                      <span v-for="(ans, i) in sq.studentAnswer" :key="i" class="blank-chip"
                        :class="ans === sq.correctAnswer[i] ? 'correct' : 'wrong'">{{ ans || '-' }}</span>
                    </template>
                    <!-- 简答 -->
                    <template v-else-if="sq.studentAnswer?.text !== undefined">
                      <span v-if="sq.matchRate !== undefined" class="match-rate" :class="matchRateClass(sq.matchRate)">{{ sq.matchRate }}%</span>
                      <span class="essay-preview">{{ (sq.studentAnswer.text || '').substring(0, 20) }}...</span>
                    </template>
                    <!-- 解析 -->
                    <div v-if="(showAnswer && sq.studentAnswer?.text === undefined) || (showExplanation && sq.explanation)" class="sub-analysis">
                      <span v-if="showAnswer && sq.studentAnswer?.text === undefined" class="ca-inline">
                        答：{{ Array.isArray(sq.correctAnswer) ? sq.correctAnswer.join('、') : (sq.correctAnswer === true ? '✓' : sq.correctAnswer === false ? '✗' : sq.correctAnswer) }}
                      </span>
                      <span v-if="showExplanation && sq.explanation" class="exp-inline">{{ sq.explanation }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 选择题 -->
              <div v-else-if="q.options" class="opt-badges">
                <span v-for="opt in q.options" :key="opt.label" class="opt-badge"
                  :class="{
                    'user-sel': isUserSelected(q, opt.label),
                    'sel-correct': isUserSelected(q, opt.label) && isCorrectAnswer(q, opt.label) && (!Array.isArray(q.correctAnswer) || isMultipleAllCorrect(q)),
                    'sel-wrong': isUserSelected(q, opt.label) && !isCorrectAnswer(q, opt.label),
                    'sel-partial': isUserSelected(q, opt.label) && isCorrectAnswer(q, opt.label) && Array.isArray(q.correctAnswer) && !isMultipleAllCorrect(q)
                  }"
                >{{ opt.label }}</span>
              </div>

              <!-- 判断题 -->
              <div v-else-if="q.studentAnswer === true || q.studentAnswer === false" class="judge-val" :class="q.status">
                {{ q.studentAnswer ? '✓ 正确' : '✗ 错误' }}
              </div>

              <!-- 填空题 -->
              <div v-else-if="Array.isArray(q.studentAnswer)" class="blank-chips">
                <div v-for="(ans, i) in q.studentAnswer" :key="i" class="blank-chip-row">
                  <span class="blank-chip" :class="ans === q.correctAnswer[i] ? 'correct' : 'wrong'">
                    第{{ i+1 }}空：{{ ans || '-' }}
                  </span>
                  <el-icon v-if="ans === q.correctAnswer[i]" color="#00B96B" :size="16"><Check /></el-icon>
                  <el-icon v-else color="#F56C6C" :size="16"><Close /></el-icon>
                </div>
              </div>

              <!-- 简答题 -->
              <div v-else-if="q.studentAnswer?.text !== undefined" class="essay-block">
                <span v-if="q.matchRate !== undefined" class="match-rate" :class="matchRateClass(q.matchRate)">匹配度 {{ q.matchRate }}%</span>
                <div class="essay-preview-full">{{ q.studentAnswer.text || '（未作答）' }}</div>
              </div>

              <!-- 正确答案 + 解析 -->
              <div v-if="!q.blanks && !q.subQuestions && (showAnswer || (showExplanation && q.explanation) || q.teacherComment)" class="card-analysis">
                <div v-if="showAnswer && q.studentAnswer?.text === undefined" class="ca-row">
                  <span class="ca-label">正确答案</span>
                  <span v-if="q.options" class="ca-val">{{ Array.isArray(q.correctAnswer) ? q.correctAnswer.join('、') : q.correctAnswer }}</span>
                  <span v-else-if="q.correctAnswer === true || q.correctAnswer === false" class="ca-val">{{ q.correctAnswer ? '✓' : '✗' }}</span>
                  <span v-else-if="Array.isArray(q.correctAnswer)" class="ca-val">{{ q.correctAnswer.join(' / ') }}</span>
                </div>
                <div v-if="showExplanation && q.explanation" class="exp-row"><span class="exp-label">解析</span>{{ q.explanation }}</div>
                <div v-if="q.teacherComment" class="comment-row"><span class="comment-label">评语</span>{{ q.teacherComment }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 题目导航：固定在右侧 -->
      <aside class="question-nav">
        <div class="nav-summary">
          <div class="nav-summary-item">
            <span class="nav-summary-label">总分</span>
            <span class="nav-summary-value">{{ result.totalScore }}</span>
          </div>
          <div class="nav-summary-divider"></div>
          <div class="nav-summary-item">
            <span class="nav-summary-label">得分</span>
            <span class="nav-summary-value gained">{{ result.score }}</span>
          </div>
        </div>
        <div v-for="group in result.questionGroups" :key="group.type" class="nav-group">
          <div class="nav-group-header">{{ group.typeName }}</div>
          <div class="nav-grid">
            <div v-for="q in group.questions" :key="q.id" class="nav-item" @click="scrollTo(q.id)">
              <span class="nav-index">{{ q.index }}</span>
              <span class="nav-score" :class="q.status">+{{ q.studentScore }}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Check, Close } from '@element-plus/icons-vue'
import { mockDocExamResult, mockDocumentPages } from '@/mock/exam'

const route = useRoute()
const router = useRouter()
const result = ref(mockDocExamResult)
const documentPages = ref(mockDocumentPages)

const panelWidth = ref(560)
let isResizing = false

const publishMode = computed(() => route.query.mode || 'full')
const showAnswer = computed(() => publishMode.value === 'full')
const showExplanation = computed(() => publishMode.value === 'full')

onMounted(() => {
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
})
onUnmounted(() => {
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
})

function startResize() { isResizing = true }
function stopResize() { isResizing = false }
function onResize(e) {
  if (!isResizing) return
  const container = document.querySelector('.review-body')
  if (!container) return
  const rect = container.getBoundingClientRect()
  const navW = 200
  const rightEdge = rect.right - navW
  const w = rightEdge - e.clientX
  panelWidth.value = Math.max(200, w)
}

function scrollTo(qId) {
  const el = document.getElementById('q-' + qId)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function isUserSelected(q, label) {
  if (Array.isArray(q.studentAnswer)) return q.studentAnswer.includes(label)
  return q.studentAnswer === label
}
function isCorrectAnswer(q, label) {
  if (Array.isArray(q.correctAnswer)) return q.correctAnswer.includes(label)
  return q.correctAnswer === label
}
function isMultipleAllCorrect(q) {
  if (!Array.isArray(q.correctAnswer) || !Array.isArray(q.studentAnswer)) return false
  if (q.studentAnswer.length !== q.correctAnswer.length) return false
  return q.correctAnswer.every(a => q.studentAnswer.includes(a))
}
function matchRateClass(rate) {
  if (rate >= 80) return 'match-high'
  if (rate >= 60) return 'match-mid'
  return 'match-low'
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Liu+Jian+Mao+Cao&display=swap');

.exam-review-doc-page { height: 100vh; display: flex; flex-direction: column; background: #f5f7fa; }

.review-header {
  height: 60px; background: #fff; border-bottom: 1px solid #e4e7ed;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px; flex-shrink: 0;
}
.header-left { display: flex; align-items: center; gap: 16px; }
.header-left h1 { font-size: 18px; margin: 0; }
.header-right { display: flex; align-items: baseline; gap: 4px; }
.score-handwrite { font-family: 'Liu Jian Mao Cao', cursive; font-size: 36px; font-weight: 600; color: #F56C6C; line-height: 1; }
.score-label { font-size: 16px; color: #F56C6C; font-weight: 500; }

/* 主体布局：文档 | 分隔 | 答题卡 | 导航 */
.review-body { flex: 1; display: flex; overflow: hidden; }

/* 文档区：自动填充 */
.doc-preview { flex: 1; background: #fff; overflow: hidden; display: flex; flex-direction: column; min-width: 0; }
.doc-scroll { flex: 1; overflow-y: auto; padding: 24px; }
.doc-page { background: #fff; padding: 24px; margin-bottom: 16px; border: 1px solid #e4e7ed; border-radius: 4px; font-size: 14px; line-height: 1.8; }

.resizer { width: 5px; background: #e4e7ed; cursor: col-resize; flex-shrink: 0; }
.resizer:hover { background: #00B96B; }

/* 答题卡：固定宽度 */
.answer-panel { flex-shrink: 0; background: #f5f7fa; border-left: 1px solid #e4e7ed; overflow: hidden; display: flex; flex-direction: column; }
.panel-scroll { flex: 1; overflow-y: auto; padding: 12px; }

.type-group { margin-bottom: 16px; }
.group-header { display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; margin-bottom: 8px; }
.group-name { font-size: 13px; font-weight: 600; color: #303133; }
.group-score { font-size: 12px; color: #00B96B; font-weight: 600; }

.answer-card {
  background: #fff; border-radius: 8px; padding: 10px 12px;
  margin-bottom: 8px; border: 1px solid #e4e7ed;
}

.card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.card-idx { font-size: 13px; font-weight: 600; color: #303133; }
.card-score {
  font-family: 'Liu Jian Mao Cao', cursive;
  font-size: 20px;
  color: #F56C6C;
  line-height: 1;
}


/* 选项徽章 */
.opt-badges { display: flex; flex-wrap: wrap; gap: 4px; }
.opt-badge {
  width: 26px; height: 26px; border-radius: 4px;
  border: 1px solid #dcdfe6; background: #fafafa;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600; cursor: default;
}
.opt-badge.user-sel { border-color: #909399; background: #f5f7fa; }
.opt-badge.sel-correct { border-color: #00B96B; background: #f0fdf4; color: #00B96B; }
.opt-badge.sel-wrong { border-color: #F56C6C; background: #fef0f0; color: #F56C6C; }
.opt-badge.sel-partial { border-color: #E6A23C; background: #fdf6ec; color: #E6A23C; }

/* 判断 */
.judge-val { font-size: 14px; font-weight: 600; }
.judge-val.correct { color: #00B96B; }
.judge-val.wrong { color: #F56C6C; }

/* 填空 */
.blank-chips { display: flex; flex-direction: column; gap: 4px; }
.blank-chip-row { display: flex; align-items: center; gap: 6px; }
.blank-chip { font-size: 12px; padding: 2px 6px; border-radius: 4px; }
.blank-chip.correct { color: #00B96B; background: #f0fdf4; }
.blank-chip.wrong { color: #F56C6C; background: #fef0f0; }

/* 简答 */
.essay-block { display: flex; flex-direction: column; gap: 4px; }
.match-rate { font-size: 11px; padding: 1px 6px; border-radius: 10px; font-weight: 600; align-self: flex-start; }
.match-high { background: #f0fdf4; color: #00B96B; }
.match-mid { background: #fff7e6; color: #fa8c16; }
.match-low { background: #fef0f0; color: #F56C6C; }
.essay-preview-full { font-size: 12px; color: #606266; line-height: 1.6; white-space: pre-wrap; }

/* 完形填空 */
.cloze-answer { display: flex; flex-direction: column; gap: 4px; }
.blank-row { display: flex; align-items: center; gap: 6px; font-size: 12px; }
.blank-order { color: #909399; flex-shrink: 0; }
.blank-val { font-weight: 600; }
.blank-val.correct { color: #00B96B; }
.blank-val.wrong { color: #F56C6C; }
.blank-correct { color: #00B96B; font-size: 11px; }
.mini-explanation { font-size: 11px; color: #909399; margin-top: 4px; line-height: 1.5; }

/* 复合题子题 */
.sub-answers { display: flex; flex-direction: column; gap: 8px; }
.sub-row { display: flex; gap: 8px; align-items: flex-start; }
.sub-idx { font-size: 11px; color: #909399; flex-shrink: 0; padding-top: 4px; }
.sub-content { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.essay-preview { font-size: 11px; color: #606266; }
.sub-analysis { font-size: 11px; color: #909399; background: #f5f7fa; border-radius: 4px; padding: 4px 6px; }
.ca-inline { color: #00B96B; margin-right: 6px; }
.exp-inline { color: #909399; }

/* 答案解析 */
.card-analysis { margin-top: 8px; background: #f0fdf4; border-radius: 6px; padding: 8px 10px; display: flex; flex-direction: column; gap: 4px; }
.ca-row { display: flex; align-items: flex-start; gap: 6px; }
.ca-label { font-size: 11px; color: #00B96B; font-weight: 600; flex-shrink: 0; }
.ca-val { font-size: 12px; color: #00B96B; font-weight: 600; }
.exp-row { font-size: 12px; color: #606266; line-height: 1.5; }
.exp-label { font-size: 11px; color: #00B96B; font-weight: 600; margin-right: 4px; }
.comment-row { font-size: 12px; color: #8c6e00; background: #fffbe6; border-radius: 4px; padding: 4px 6px; }
.comment-label { font-size: 11px; color: #d48806; font-weight: 600; margin-right: 4px; }

/* 题目导航 */
.question-nav {
  width: 200px; flex-shrink: 0; background: #fff;
  border-left: 1px solid #e4e7ed; padding: 16px;
  overflow-y: auto;
}

.nav-summary {
  display: flex; align-items: center; justify-content: space-around;
  padding: 10px 8px; background: #f5f7fa; border-radius: 8px; margin-bottom: 16px;
}
.nav-summary-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.nav-summary-label { font-size: 11px; color: #909399; }
.nav-summary-value { font-size: 16px; font-weight: 700; color: #303133; }
.nav-summary-value.gained { color: #F56C6C; }
.nav-summary-divider { width: 1px; height: 28px; background: #e4e7ed; }

.nav-group { margin-bottom: 16px; }
.nav-group-header { font-size: 13px; font-weight: 600; margin-bottom: 8px; color: #303133; }
.nav-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.nav-item {
  border-radius: 6px; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 5px 4px; cursor: pointer;
  border: 1px solid #dcdfe6; background: #f5f7fa; line-height: 1.2;
}
.nav-item:hover { background: #e6f9f0; border-color: #00B96B; }
.nav-index { font-size: 13px; font-weight: 600; color: #303133; }
.nav-score { font-size: 12px; font-weight: 600; }
.nav-score.correct { color: #00B96B; }
.nav-score.wrong { color: #F56C6C; }
.nav-score.partial { color: #E6A23C; }
</style>
