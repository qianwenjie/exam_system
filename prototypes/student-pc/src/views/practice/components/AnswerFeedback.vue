<template>
  <div class="answer-feedback" :class="feedbackClass">
    <div class="feedback-header">
      <!-- 简答题：准确率 -->
      <template v-if="question.type === 'essay'">
        <div class="feedback-icon essay">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke-linecap="round"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <span class="feedback-text essay">准确率 <strong>{{ result.extra?.accuracy ?? 0 }}%</strong></span>
      </template>
      <!-- 完形填空：整体对错 -->
      <template v-else-if="question.type === 'cloze'">
        <div class="feedback-icon" :class="result.isCorrect ? 'correct' : 'wrong'">
          <svg v-if="result.isCorrect" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
          </svg>
        </div>
        <span class="feedback-text">{{ result.isCorrect ? '全部正确' : '部分错误' }}</span>
      </template>
      <!-- 复合题：整体对错 -->
      <template v-else-if="question.type === 'composite'">
        <div class="feedback-icon" :class="result.isCorrect ? 'correct' : 'wrong'">
          <svg v-if="result.isCorrect" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
          </svg>
        </div>
        <span class="feedback-text">{{ result.isCorrect ? '全部正确' : '部分错误' }}</span>
      </template>
      <!-- 其他题型：正确/错误 -->
      <template v-else>
        <div class="feedback-icon">
          <svg v-if="result.isCorrect" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
          </svg>
        </div>
        <span class="feedback-text">{{ result.isCorrect ? '回答正确' : '回答错误' }}</span>
      </template>
      <el-button text size="small" class="favorite-btn" @click="$emit('toggleFavorite')">
        <svg viewBox="0 0 24 24" :fill="isFavorited ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.5" style="width:16px;height:16px">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
        {{ isFavorited ? '已收藏' : '收藏' }}
      </el-button>
    </div>

    <!-- 完形填空：逐空展示，含选项列表 -->
    <template v-if="question.type === 'cloze'">
      <div class="cloze-result">
        <div v-for="(blank, idx) in question.blanks" :key="blank.id" class="cloze-blank-item">
          <div class="cloze-blank-header">
            <span class="cloze-blank-order">第{{ idx + 1 }}空</span>
            <span :class="clozeBlankResults[blank.id] ? 'status-correct' : 'status-wrong'">
              {{ clozeBlankResults[blank.id] ? '✓ 正确' : '✗ 错误' }}
            </span>
          </div>
          <div class="cloze-blank-options">
            <div
              v-for="opt in blank.options"
              :key="opt.label"
              class="cloze-opt-row"
              :class="getClozeOptClass(blank, opt.label)"
            >
              <span class="cloze-opt-label">{{ opt.label }}</span>
              <span class="cloze-opt-text">{{ opt.text }}</span>
              <span v-if="opt.label === (userAnswer || {})[blank.id]" class="cloze-opt-mark" :class="clozeBlankResults[blank.id] ? 'correct' : 'wrong'">
                {{ clozeBlankResults[blank.id] ? '✓' : '✗' }}
              </span>
            </div>
          </div>
          <div v-if="!clozeBlankResults[blank.id]" class="correct-hint">
            正确答案：{{ getClozeCorrectAnswer(blank) }}
          </div>
        </div>
      </div>
      <div v-if="question.explanation" class="explanation">
        <span class="exp-label">解析：</span>
        <span class="exp-text">{{ question.explanation }}</span>
      </div>
    </template>

    <!-- 复合题：逐子题展示（材料已在题目区显示，此处只展示子题） -->
    <template v-else-if="question.type === 'composite'">
      <div class="composite-result">
        <div v-for="(sq, si) in question.subQuestions" :key="sq.id" class="composite-sub-item">
          <div class="composite-sub-header">
            <span class="composite-sub-index">第{{ si + 1 }}小题</span>
            <span class="composite-sub-type">{{ sq.typeName }}</span>
            <span v-if="sq.type === 'essay'" class="composite-sub-status" :class="essayAccuracyClass(sq)">
              准确率 {{ getSubEssayAccuracy(sq) }}%
            </span>
            <span v-else class="composite-sub-status" :class="compositeSubResults[sq.id] ? 'status-correct' : 'status-wrong'">
              {{ compositeSubResults[sq.id] ? '✓ 正确' : '✗ 错误' }}
            </span>
          </div>
          <div class="composite-sub-stem">{{ sq.content }}</div>

          <!-- 选择题：显示选项列表，标记用户选择 -->
          <div v-if="['single', 'multiple'].includes(sq.type)" class="sub-options">
            <div
              v-for="opt in sq.options"
              :key="opt.label"
              class="sub-opt-row"
              :class="getSubOptClass(sq, opt.label)"
            >
              <span class="sub-opt-label">{{ opt.label }}</span>
              <span class="sub-opt-text">{{ opt.text }}</span>
              <span v-if="isSubSelected(sq, opt.label)" class="sub-opt-mark" :class="isCorrectOption(sq, opt.label) ? 'correct' : 'wrong'">
                {{ isCorrectOption(sq, opt.label) ? '✓' : '✗' }}
              </span>
            </div>
            <div v-if="!compositeSubResults[sq.id]" class="correct-hint">
              正确答案：{{ formatAnswer(sq.correctAnswer) }}
            </div>
          </div>

          <!-- 判断题 -->
          <div v-if="sq.type === 'judge'" class="sub-judge">
            <div class="sub-judge-row">
              <span class="sub-judge-label">你的答案：</span>
              <span :class="compositeSubResults[sq.id] ? 'status-correct' : 'status-wrong'">
                {{ formatJudge((userAnswer || {})[sq.id]) }}
              </span>
            </div>
            <div v-if="!compositeSubResults[sq.id]" class="correct-hint">
              正确答案：{{ formatJudge(sq.correctAnswer) }}
            </div>
          </div>

          <!-- 填空题 -->
          <div v-if="sq.type === 'blank'" class="sub-blank">
            <div v-for="(ans, ai) in getSubBlankAnswers(sq)" :key="ai" class="sub-blank-row">
              <span class="sub-blank-index">第{{ ai + 1 }}空：</span>
              <span :class="ans.isCorrect ? 'status-correct' : 'status-wrong'">{{ ans.student || '未作答' }}</span>
              <span class="sub-blank-mark" :class="ans.isCorrect ? '' : 'wrong'">{{ ans.isCorrect ? '✓' : '✗' }}</span>
            </div>
            <div v-if="!compositeSubResults[sq.id]" class="correct-hint">
              正确答案：{{ formatBlankAnswer(sq.correctAnswer) }}
            </div>
          </div>

          <!-- 简答题 -->
          <div v-if="sq.type === 'essay'" class="sub-essay">
            <div class="sub-essay-label">我的作答</div>
            <div class="sub-essay-content">{{ getEssayText((userAnswer || {})[sq.id]) || '未作答' }}</div>
            <div class="correct-hint">参考答案：{{ sq.correctAnswer || '--' }}</div>
          </div>

          <div v-if="sq.explanation" class="sub-explanation">
            解析：{{ sq.explanation }}
          </div>
        </div>
      </div>
    </template>

    <!-- 普通题型：正确答案（简答题不显示） -->
    <template v-else-if="question.type !== 'essay'">
      <!-- 填空题：逐空显示 -->
      <div v-if="question.type === 'blank'" class="correct-answer-list">
        <div v-for="(ans, idx) in question.correctAnswer" :key="idx" class="correct-answer">
          <span class="answer-label">第{{ idx + 1 }}空：</span>
          <span class="answer-value">{{ ans }}</span>
        </div>
      </div>
      <!-- 其他题型 -->
      <div v-else class="correct-answer">
        <span class="answer-label">正确答案：</span>
        <span class="answer-value">{{ formattedCorrectAnswer }}</span>
      </div>
    </template>

    <!-- 解析（非 cloze/composite，它们内部已处理） -->
    <template v-if="!['cloze', 'composite'].includes(question.type)">
      <div v-if="question.explanation" class="explanation">
        <span class="exp-label">解析：</span>
        <span class="exp-text">{{ question.explanation }}</span>
      </div>
    </template>

    <!-- 知识点 -->
    <div v-if="question.knowledgePath" class="knowledge">
      <el-tag size="small" type="info">{{ question.knowledgePath }}</el-tag>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  result: { type: Object, required: true },
  question: { type: Object, required: true },
  isFavorited: { type: Boolean, default: false },
  userAnswer: { type: [String, Boolean, Array, Object], default: null },
})

defineEmits(['toggleFavorite'])

const feedbackClass = computed(() => {
  if (props.question.type === 'essay') return 'essay'
  return props.result.isCorrect ? 'correct' : 'wrong'
})

const formattedCorrectAnswer = computed(() => {
  const correct = props.question.correctAnswer
  if (Array.isArray(correct)) return correct.join('、')
  if (correct === true || correct === 'true') return '正确 ✓'
  if (correct === false || correct === 'false') return '错误 ✗'
  return String(correct || '')
})

// 完形填空：每空是否正确
const clozeBlankResults = computed(() => {
  const results = {}
  if (!props.question?.blanks) return results
  const ua = props.userAnswer || {}
  const ca = props.question.correctAnswer || {}
  props.question.blanks.forEach(blank => {
    results[blank.id] = ua[blank.id] === ca[blank.id]
  })
  return results
})

const getClozeCorrectAnswer = (blank) => {
  const ca = props.question.correctAnswer || {}
  return ca[blank.id] || ''
}

const getClozeOptClass = (blank, label) => {
  const ua = props.userAnswer || {}
  const isSelected = label === ua[blank.id]
  const isCorrect = clozeBlankResults.value[blank.id]
  if (isSelected && isCorrect) return 'opt-correct-selected'
  if (isSelected && !isCorrect) return 'opt-wrong-selected'
  return ''
}

// 复合题：每子题是否正确
const compositeSubResults = computed(() => {
  const results = {}
  if (!props.question?.subQuestions) return results
  const ua = props.userAnswer || {}
  props.question.subQuestions.forEach(sq => {
    const userAns = ua[sq.id]
    const correctAns = sq.correctAnswer
    if (sq.type === 'single') {
      results[sq.id] = userAns === correctAns
    } else if (sq.type === 'multiple') {
      results[sq.id] = Array.isArray(userAns) && Array.isArray(correctAns)
        && userAns.length === correctAns.length && userAns.every(a => correctAns.includes(a))
    } else if (sq.type === 'judge') {
      results[sq.id] = String(userAns) === String(correctAns)
    } else if (sq.type === 'blank') {
      const blanks = sq.blanks || []
      if (typeof userAns === 'object' && userAns !== null && !Array.isArray(userAns) && Array.isArray(correctAns)) {
        results[sq.id] = blanks.every((b, i) => (userAns[b.id] || '').trim().toLowerCase() === (correctAns[i] || '').trim().toLowerCase())
      } else {
        results[sq.id] = false
      }
    } else if (sq.type === 'essay') {
      const acc = props.result.extra?.subAccuracies?.[sq.id] ?? 0
      results[sq.id] = acc >= 80
    } else {
      results[sq.id] = false
    }
  })
  return results
})

const getSubEssayAccuracy = (sq) => props.result.extra?.subAccuracies?.[sq.id] ?? 0

const essayAccuracyClass = (sq) => {
  const acc = getSubEssayAccuracy(sq)
  if (acc >= 80) return 'status-correct'
  if (acc >= 50) return 'status-warning'
  return 'status-wrong'
}

const isSubSelected = (sq, label) => {
  const a = (props.userAnswer || {})[sq.id]
  return Array.isArray(a) ? a.includes(label) : a === label
}

const isCorrectOption = (sq, label) => {
  const c = sq.correctAnswer
  return Array.isArray(c) ? c.includes(label) : c === label
}

const getSubOptClass = (sq, label) => {
  const selected = isSubSelected(sq, label)
  const correct = isCorrectOption(sq, label)
  if (selected && correct) return 'opt-correct-selected'
  if (selected && !correct) return 'opt-wrong-selected'
  return ''
}

const formatAnswer = (answer) => Array.isArray(answer) ? answer.join('、') : String(answer || '')

const formatJudge = (val) => {
  if (val === true || val === 'true') return '正确 ✓'
  if (val === false || val === 'false') return '错误 ✗'
  return '未作答'
}

const getSubBlankAnswers = (sq) => {
  const userAns = (props.userAnswer || {})[sq.id]
  const correctAns = sq.correctAnswer || []
  const blanks = sq.blanks || []
  if (typeof userAns === 'object' && userAns !== null && !Array.isArray(userAns) && Array.isArray(correctAns)) {
    return correctAns.map((c, i) => {
      const blank = blanks[i]
      const student = blank ? (userAns[blank.id] || '') : ''
      return { student, correct: c, isCorrect: student.trim().toLowerCase() === c.trim().toLowerCase() }
    })
  }
  return Array.isArray(correctAns) ? correctAns.map(c => ({ student: '', correct: c, isCorrect: false })) : []
}

const formatBlankAnswer = (answer) => Array.isArray(answer) ? answer.join('、') : String(answer || '')

const getEssayText = (answer) => {
  if (!answer) return ''
  if (typeof answer === 'string') return answer
  if (typeof answer === 'object' && answer.text) return answer.text
  return ''
}
</script>

<style scoped>
.answer-feedback { border-radius: 12px; padding: 16px 20px; margin-top: 16px; }
.answer-feedback.correct { background: rgba(37,99,235,0.08); border: 1px solid rgba(37,99,235,0.2); }
.answer-feedback.wrong { background: rgba(255,59,48,0.06); border: 1px solid rgba(255,59,48,0.15); }
.answer-feedback.essay { background: rgba(255,149,0,0.06); border: 1px solid rgba(255,149,0,0.2); }
.feedback-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.feedback-icon { width: 24px; height: 24px; }
.feedback-icon.essay { color: #ff9500; }
.feedback-icon.correct { color: #2563EB; }
.feedback-icon.wrong { color: #ff3b30; }
.answer-feedback.correct .feedback-icon { color: #2563EB; }
.answer-feedback.wrong .feedback-icon { color: #ff3b30; }
.feedback-text { font-size: 15px; font-weight: 600; flex: 1; }
.feedback-text.essay { color: #ff9500; }
.answer-feedback.correct .feedback-text { color: #2563EB; }
.answer-feedback.wrong .feedback-text { color: #ff3b30; }
.favorite-btn { color: #ff9500 !important; }
.correct-answer-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
.correct-answer { display: flex; gap: 8px; margin-bottom: 10px; font-size: 14px; }
.answer-label { color: #86868b; flex-shrink: 0; }
.answer-value { color: #1d1d1f; font-weight: 500; }
.explanation { display: flex; gap: 8px; margin-bottom: 10px; font-size: 14px; line-height: 1.6; }
.exp-label { color: #86868b; flex-shrink: 0; }
.exp-text { color: #1d1d1f; }
.knowledge { margin-top: 8px; }

/* 状态颜色 */
.status-correct { color: #34C759; font-weight: 500; }
.status-wrong { color: #ff3b30; font-weight: 500; }
.status-warning { color: #ff9500; font-weight: 500; }
.correct-hint { font-size: 13px; color: #34C759; font-weight: 500; padding: 6px 0 2px; }

/* 完形填空 */
.cloze-result { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
.cloze-blank-item { background: rgba(0,0,0,0.02); border-radius: 8px; padding: 12px; }
.cloze-blank-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 13px; font-weight: 600; color: #303133; gap: 8px; }
.cloze-blank-order { flex-shrink: 0; }
.cloze-blank-options { display: flex; flex-direction: column; gap: 6px; }
.cloze-opt-row { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 6px; font-size: 13px; border: 1px solid transparent; background: white; }
.cloze-opt-label { font-weight: 600; min-width: 18px; }
.cloze-opt-text { flex: 1; color: #303133; }
.cloze-opt-mark { font-weight: 700; font-size: 14px; }
.cloze-opt-mark.correct { color: #34C759; }
.cloze-opt-mark.wrong { color: #ff3b30; }
.opt-correct-selected { background: rgba(52,199,89,0.06); border-color: rgba(52,199,89,0.4); }
.opt-wrong-selected { background: rgba(255,59,48,0.06); border-color: rgba(255,59,48,0.2); }

/* 复合题 */
.composite-result { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
.composite-sub-stem { font-size: 14px; color: #303133; line-height: 1.6; margin-bottom: 10px; }
.composite-sub-item { background: rgba(0,0,0,0.02); border-radius: 8px; padding: 12px; }
.composite-sub-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid rgba(0,0,0,0.06); }
.composite-sub-index { font-size: 13px; font-weight: 600; color: #303133; }
.composite-sub-type { font-size: 11px; color: #2563EB; background: rgba(37,99,235,0.08); padding: 2px 8px; border-radius: 10px; }
.composite-sub-status { font-size: 13px; font-weight: 500; margin-left: auto; }
.sub-options { display: flex; flex-direction: column; gap: 6px; }
.sub-opt-row { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 6px; font-size: 13px; border: 1px solid transparent; background: white; }
.sub-opt-label { font-weight: 600; min-width: 18px; }
.sub-opt-text { flex: 1; color: #303133; }
.sub-opt-mark { font-weight: 700; font-size: 14px; }
.sub-opt-mark.correct { color: #34C759; }
.sub-opt-mark.wrong { color: #ff3b30; }
.sub-judge { font-size: 14px; }
.sub-judge-row { line-height: 2.2; }
.sub-judge-label { color: #86868b; }
.sub-blank { font-size: 14px; }
.sub-blank-row { display: flex; align-items: center; gap: 6px; line-height: 2.2; }
.sub-blank-index { color: #86868b; }
.sub-blank-mark { font-weight: 700; color: #34C759; }
.sub-blank-mark.wrong { color: #ff3b30; }
.sub-essay { font-size: 14px; }
.sub-essay-label { font-size: 12px; color: #86868b; margin-bottom: 4px; }
.sub-essay-content { background: white; border: 1px solid #e4e7ed; border-radius: 6px; padding: 10px 12px; font-size: 13px; color: #303133; line-height: 1.7; margin-bottom: 8px; white-space: pre-line; }
.sub-explanation { font-size: 12px; color: #86868b; margin-top: 8px; padding-top: 8px; border-top: 1px dashed #e4e7ed; }
</style>
