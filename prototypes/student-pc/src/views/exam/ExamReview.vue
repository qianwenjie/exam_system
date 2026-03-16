<template>
  <div class="exam-review-page">
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
      <!-- 左侧题号导航 -->
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
            <div
              v-for="q in group.questions"
              :key="q.id"
              class="nav-item"
              @click="scrollTo(q.id)"
            >
              <span class="nav-index">{{ q.index }}</span>
              <span class="nav-score" :class="q.status">+{{ q.studentScore }}</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- 右侧题目详情 -->
      <main class="review-content">
        <div v-for="group in result.questionGroups" :key="group.type" class="question-group">
          <div class="group-header">
            <span>{{ group.typeName }}</span>
            <span class="group-score">{{ group.gainedScore }} / {{ group.totalScore }} 分</span>
          </div>
          <div v-for="q in group.questions" :key="q.id" :id="'q-' + q.id" class="question-card">
            <div class="q-header">
              <span class="q-index">{{ q.index }}. <span class="q-index-score">（{{ q.score }}分）</span></span>
              <span class="q-score-gained" :class="q.status">+{{ q.studentScore }}</span>
            </div>
            <div v-if="!q.blanks" class="q-content">{{ q.content }}</div>

            <!-- 完形填空 -->
            <div v-if="q.blanks" class="cloze-review">
              <!-- 完整题目文本 -->
              <div class="cloze-content">{{ q.content }}</div>
              <!-- 每空 -->
              <div v-for="blank in q.blanks" :key="blank.order" class="cloze-blank-item">
                <div class="cloze-blank-header">
                  <span class="cloze-blank-order">第{{ blank.order }}空</span>
                  <el-icon v-if="blank.isCorrect" color="#00B96B" :size="14"><Check /></el-icon>
                  <el-icon v-else color="#F56C6C" :size="14"><Close /></el-icon>
                </div>
                <!-- 选项（全部显示，只高亮学生选择） -->
                <div class="options-review">
                  <div v-for="opt in blank.options" :key="opt.label" class="opt-item"
                    :class="{
                      'user-selected': blank.studentAnswer === opt.label && blank.isCorrect,
                      'user-selected-wrong': blank.studentAnswer === opt.label && !blank.isCorrect
                    }"
                  >
                    <span class="opt-label">{{ opt.label }}</span>
                    <span class="opt-text">{{ opt.text }}</span>
                    <el-icon v-if="blank.studentAnswer === opt.label && blank.isCorrect" color="#00B96B"><Check /></el-icon>
                    <el-icon v-else-if="blank.studentAnswer === opt.label && !blank.isCorrect" color="#F56C6C"><Close /></el-icon>
                  </div>
                </div>
                <!-- 正确答案（答错时显示，full 模式才显示） -->
                <div v-if="!blank.isCorrect && showAnswer" class="cloze-correct-answer">
                  <span class="ca-label">正确答案</span>
                  <span class="ca-value correct">{{ blank.correctAnswer }}</span>
                </div>
              </div>
              <div v-if="showExplanation && q.explanation" class="answer-analysis" style="margin-top:12px">
                <div class="explanation-row">
                  <span class="ca-label">解析</span>
                  <span class="ca-value">{{ q.explanation }}</span>
                </div>
              </div>
            </div>

            <!-- 复合题 -->
            <div v-else-if="q.subQuestions" class="composite-review">
              <div v-if="q.material" class="composite-material">{{ q.material }}</div>
              <div v-for="sq in q.subQuestions" :key="sq.id" class="sub-question-card">
                <div class="q-header">
                  <span class="q-index">
                    {{ sq.index }}.
                    <span class="sub-type-tag">{{ sq.typeName || getSubTypeName(sq) }}</span>
                    <span class="q-index-score">（{{ sq.score }}分）</span>
                  </span>
                  <span class="q-score-gained">+{{ sq.studentScore }}</span>
                </div>
                <div class="q-content">{{ sq.content }}</div>
                <!-- 子题：选择题 -->
                <div v-if="sq.options" class="options-review">
                  <div v-for="opt in sq.options" :key="opt.label" class="opt-item"
                    :class="{
                      'user-selected': isUserSelected(sq, opt.label) && (Array.isArray(sq.correctAnswer) ? isMultipleAllCorrect(sq) : true),
                      'user-selected-wrong': isUserSelected(sq, opt.label) && !isCorrectAnswer(sq, opt.label),
                      'user-selected-partial': isUserSelected(sq, opt.label) && isCorrectAnswer(sq, opt.label) && Array.isArray(sq.correctAnswer) && !isMultipleAllCorrect(sq)
                    }"
                  >
                    <span class="opt-label">{{ opt.label }}</span>
                    <span class="opt-text">{{ opt.text }}</span>
                  </div>
                </div>
                <!-- 子题：判断题 -->
                <div v-else-if="sq.studentAnswer === true || sq.studentAnswer === false" class="judge-review">
                  <div class="student-answer-block">
                    <span class="answer-label">我的答案</span>
                    <span class="answer-value" :class="sq.status">{{ sq.studentAnswer ? '✓ 正确' : '✗ 错误' }}</span>
                  </div>
                </div>
                <!-- 子题：填空题 -->
                <div v-else-if="Array.isArray(sq.studentAnswer)" class="blank-review">
                  <div class="student-answer-block">
                    <span class="answer-label">我的答案</span>
                    <div class="blank-answers">
                      <span v-for="(ans, idx) in sq.studentAnswer" :key="idx" class="blank-ans"
                        :class="ans === sq.correctAnswer[idx] ? 'correct' : 'wrong'">
                        第{{ idx + 1 }}空：{{ ans || '（未作答）' }}
                      </span>
                    </div>
                  </div>
                </div>
                <!-- 子题：简答题 -->
                <div v-else-if="sq.studentAnswer?.text !== undefined" class="essay-review">
                  <div class="student-answer-block">
                    <div class="answer-label-row">
                      <span class="answer-label">我的答案</span>
                      <span v-if="sq.matchRate !== undefined" class="match-rate" :class="matchRateClass(sq.matchRate)">匹配度 {{ sq.matchRate }}%</span>
                    </div>
                    <div class="essay-text">{{ sq.studentAnswer.text || '（未作答）' }}</div>
                  </div>
                </div>
                <!-- 子题答案解析区 -->
                <div v-if="(showAnswer && sq.studentAnswer?.text === undefined) || (showExplanation && sq.explanation) || sq.teacherComment" class="answer-analysis">
                  <div v-if="showAnswer && sq.studentAnswer?.text === undefined" class="correct-answer-row">
                    <span class="ca-label">正确答案</span>
                    <span v-if="sq.options" class="ca-value correct">{{ Array.isArray(sq.correctAnswer) ? sq.correctAnswer.join('、') : sq.correctAnswer }}</span>
                    <span v-else-if="sq.correctAnswer === true || sq.correctAnswer === false" class="ca-value correct">{{ sq.correctAnswer ? '✓ 正确' : '✗ 错误' }}</span>
                    <div v-else-if="Array.isArray(sq.correctAnswer)" class="ca-blank-list">
                      <span v-for="(ans, idx) in sq.correctAnswer" :key="idx" class="ca-blank-item">第{{ idx + 1 }}空：<span class="ca-value correct">{{ ans }}</span></span>
                    </div>
                  </div>
                  <div v-if="showExplanation && sq.explanation" class="explanation-row">
                    <span class="ca-label">解析</span>
                    <span class="ca-value">{{ sq.explanation }}</span>
                  </div>
                  <div v-if="sq.teacherComment" class="teacher-comment-row">
                    <span class="ca-label teacher-label">教师评语</span>
                    <span class="ca-value teacher-value">{{ sq.teacherComment }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 选择题：只显示学生选项 -->
            <div v-else-if="q.options" class="options-review">
              <div
                v-for="opt in q.options"
                :key="opt.label"
                class="opt-item"
                :class="{
                  'user-selected': isUserSelected(q, opt.label) && (!Array.isArray(q.correctAnswer) || isMultipleAllCorrect(q)),
                  'user-selected-wrong': isUserSelected(q, opt.label) && !isCorrectAnswer(q, opt.label),
                  'user-selected-partial': isUserSelected(q, opt.label) && isCorrectAnswer(q, opt.label) && Array.isArray(q.correctAnswer) && !isMultipleAllCorrect(q)
                }"
              >
                <span class="opt-label">{{ opt.label }}</span>
                <span class="opt-text">{{ opt.text }}</span>
                <el-icon v-if="isUserSelected(q, opt.label) && isCorrectAnswer(q, opt.label) && (!Array.isArray(q.correctAnswer) || isMultipleAllCorrect(q))" color="#00B96B"><Check /></el-icon>
                <el-icon v-else-if="isUserSelected(q, opt.label) && !isCorrectAnswer(q, opt.label)" color="#F56C6C"><Close /></el-icon>
              </div>
            </div>

            <!-- 判断题：只显示学生答案 -->
            <div v-else-if="q.studentAnswer === true || q.studentAnswer === false" class="judge-review">
              <div class="student-answer-block">
                <span class="answer-label">我的答案</span>
                <span class="answer-value" :class="q.status">{{ q.studentAnswer ? '✓ 正确' : '✗ 错误' }}</span>
              </div>
            </div>

            <!-- 填空题：只显示学生答案 -->
            <div v-else-if="Array.isArray(q.studentAnswer)" class="blank-review">
              <div class="student-answer-block">
                <span class="answer-label">我的答案</span>
                <div class="blank-answers">
                  <span v-for="(ans, idx) in q.studentAnswer" :key="idx" class="blank-ans"
                    :class="ans === q.correctAnswer[idx] ? 'correct' : 'wrong'">
                    第{{ idx + 1 }}空：{{ ans || '（未作答）' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 简答题：只显示学生答案 -->
            <div v-else-if="q.studentAnswer?.text !== undefined" class="essay-review">
              <div class="student-answer-block">
                <div class="answer-label-row">
                  <span class="answer-label">我的答案</span>
                  <span v-if="q.matchRate !== undefined" class="match-rate" :class="matchRateClass(q.matchRate)">
                    匹配度 {{ q.matchRate }}%
                  </span>
                </div>
                <div class="essay-text">{{ q.studentAnswer.text || '（未作答）' }}</div>
              </div>
            </div>

            <!-- 正确答案 + 解析（完形填空和复合题已内嵌，其他题型统一展示） -->
            <div v-if="!q.blanks && !q.subQuestions && (showAnswer || (showExplanation && q.explanation) || q.teacherComment)" class="answer-analysis">
              <!-- 正确答案（简答题不显示，scoreAndCorrect 模式不显示） -->
              <div v-if="showAnswer && q.studentAnswer?.text === undefined" class="correct-answer-row">
                <span class="ca-label">正确答案</span>
                <!-- 选择题 -->
                <span v-if="q.options" class="ca-value correct">
                  {{ Array.isArray(q.correctAnswer) ? q.correctAnswer.join('、') : q.correctAnswer }}
                </span>
                <!-- 判断题 -->
                <span v-else-if="q.correctAnswer === true || q.correctAnswer === false" class="ca-value correct">
                  {{ q.correctAnswer ? '✓ 正确' : '✗ 错误' }}
                </span>
                <!-- 填空题 -->
                <div v-else-if="Array.isArray(q.correctAnswer)" class="ca-blank-list">
                  <span v-for="(ans, idx) in q.correctAnswer" :key="idx" class="ca-blank-item">
                    第{{ idx + 1 }}空：<span class="ca-value correct">{{ ans }}</span>
                  </span>
                </div>
              </div>
              <!-- 解析（scoreAndCorrect 模式不显示） -->
              <div v-if="showExplanation && q.explanation" class="explanation-row">
                <span class="ca-label">解析</span>
                <span class="ca-value">{{ q.explanation }}</span>
              </div>
              <!-- 教师评语（简答题，放在解析后） -->
              <div v-if="q.teacherComment" class="teacher-comment-row">
                <span class="ca-label teacher-label">教师评语</span>
                <span class="ca-value teacher-value">{{ q.teacherComment }}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Check, Close } from '@element-plus/icons-vue'
import { mockExamResult } from '@/mock/exam'

const route = useRoute()
const router = useRouter()
const result = ref(mockExamResult)

// scoreAndCorrect：只显示对错，不显示正确答案和解析
// full：显示全部
const publishMode = computed(() => route.query.mode || 'full')
const showAnswer = computed(() => publishMode.value === 'full')
const showExplanation = computed(() => publishMode.value === 'full')

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

// 多选题：学生答案与正确答案完全一致才算全对
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

function getSubTypeName(sq) {
  if (sq.options && Array.isArray(sq.correctAnswer)) return '多选题'
  if (sq.options) return '单选题'
  if (sq.studentAnswer === true || sq.studentAnswer === false) return '判断题'
  if (Array.isArray(sq.studentAnswer)) return '填空题'
  if (sq.studentAnswer?.text !== undefined) return '简答题'
  return ''
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Liu+Jian+Mao+Cao&display=swap');

.exam-review-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.review-header {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
}

.header-left { display: flex; align-items: center; gap: 16px; }
.header-left h1 { font-size: 18px; margin: 0; }

.header-right { display: flex; align-items: baseline; gap: 4px; }

.score-handwrite {
  font-family: 'Liu Jian Mao Cao', cursive;
  font-size: 36px;
  font-weight: 600;
  color: #F56C6C;
  line-height: 1;
}

.score-total { font-size: 14px; color: #909399; }
.score-label { font-size: 16px; color: #F56C6C; font-weight: 500; }

.nav-summary {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 12px 8px;
  margin-bottom: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}
.nav-summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.nav-summary-label { font-size: 11px; color: #909399; }
.nav-summary-value { font-size: 18px; font-weight: 700; color: #303133; }
.nav-summary-value.gained { color: #F56C6C; }
.nav-summary-divider { width: 1px; height: 32px; background: #e4e7ed; }



.review-body { flex: 1; display: flex; overflow: hidden; }

/* 左侧导航 */
.question-nav {
  width: 200px;
  background: #fff;
  border-right: 1px solid #e4e7ed;
  padding: 16px;
  overflow-y: auto;
  flex-shrink: 0;
}

.nav-group { margin-bottom: 16px; }
.nav-group-header { font-size: 13px; font-weight: 600; margin-bottom: 8px; color: #303133; }
.nav-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }

.nav-item {
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5px 4px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  background: #f5f7fa;
  line-height: 1.2;
}

.nav-index { font-size: 13px; font-weight: 600; color: #303133; }
.nav-score {
  font-size: 12px;
  font-weight: 600;
}
.nav-score.correct { color: #00B96B; }
.nav-score.wrong { color: #F56C6C; }
.nav-score.partial { color: #E6A23C; }

.nav-legend { margin-top: 16px; padding-top: 16px; border-top: 1px solid #eee; }
.legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #909399; margin-bottom: 4px; }
.legend-item .dot { width: 12px; height: 12px; border-radius: 3px; }
.legend-item .dot.correct { background: #00B96B; }
.legend-item .dot.wrong { background: #F56C6C; }
.legend-item .dot.partial { background: #E6A23C; }

/* 右侧内容 */
.review-content { flex: 1; overflow-y: auto; padding: 24px; }

.question-group { margin-bottom: 32px; }
.group-header { display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 16px; font-weight: 600; }
.group-score { color: #00B96B; }

.question-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
}

.q-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.q-index { font-size: 16px; font-weight: 600; }
.q-index-score { font-size: 13px; font-weight: 400; color: #909399; }
.sub-type-tag {
  display: inline-block;
  font-size: 11px; font-weight: 500;
  padding: 1px 6px; border-radius: 4px;
  background: #e6f7ff; color: #1890ff;
  margin: 0 4px;
  vertical-align: middle;
}

.q-score-gained {
  font-family: 'Liu Jian Mao Cao', cursive;
  font-size: 28px;
  line-height: 1;
  color: #F56C6C;
}

.q-content { font-size: 15px; line-height: 1.6; margin-bottom: 16px; color: #303133; }

/* 选项：只高亮学生选择 */
.options-review { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.opt-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  color: #909399;
}
.opt-item.user-selected { border-color: #00B96B; background: #e6f9f0; color: #303133; }
.opt-item.user-selected-wrong { border-color: #F56C6C; background: #fef0f0; color: #303133; }
.opt-item.user-selected-partial { border-color: #E6A23C; background: #fdf6ec; color: #303133; }

.opt-label {
  width: 24px; height: 24px; border-radius: 50%;
  background: #f5f7fa;
  display: flex; align-items: center; justify-content: center;
  font-weight: 600; font-size: 13px; flex-shrink: 0;
}
.opt-item.user-selected .opt-label { background: #00B96B; color: #fff; }
.opt-item.user-selected-wrong .opt-label { background: #F56C6C; color: #fff; }
.opt-item.user-selected-partial .opt-label { background: #E6A23C; color: #fff; }
.opt-text { flex: 1; }

/* 学生答案块（判断/填空/简答） */
.student-answer-block {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
}
.answer-label {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  padding-top: 2px;
}
.answer-value { font-size: 14px; font-weight: 500; }
.answer-value.correct { color: #00B96B; }
.answer-value.wrong { color: #F56C6C; }
.answer-value.partial { color: #E6A23C; }

.blank-answers { display: flex; flex-direction: column; gap: 6px; }
.blank-ans { font-size: 14px; padding: 2px 8px; border-radius: 4px; display: inline-block; }
.blank-ans.correct { background: #e6f9f0; color: #00B96B; }
.blank-ans.wrong { background: #fef0f0; color: #F56C6C; }

.essay-text { font-size: 14px; line-height: 1.6; color: #303133; }

.answer-label-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.match-rate { font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 10px; }
.match-high { background: #e6f9f0; color: #00B96B; }
.match-mid { background: #fdf6ec; color: #E6A23C; }
.match-low { background: #fef0f0; color: #F56C6C; }

.teacher-comment-row {
  display: flex; align-items: flex-start; gap: 12px; font-size: 14px;
  padding: 10px 12px; background: #fffbe6; border-radius: 6px; margin-top: 4px;
}
.teacher-label { color: #d48806 !important; }
.teacher-value { color: #8c6e00; line-height: 1.6; }

/* 完形填空 */
.cloze-review { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
.cloze-content {
  font-size: 14px; line-height: 1.9; color: #303133;
  background: #f5f7fa; border-radius: 8px; padding: 16px;
  white-space: pre-wrap; margin-bottom: 4px;
}
.cloze-blank-item { border: 1px solid #e4e7ed; border-radius: 8px; padding: 12px; }
.cloze-blank-header { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; font-size: 13px; font-weight: 600; color: #303133; }
.cloze-blank-order { font-size: 13px; }
.cloze-correct-answer {
  display: flex; align-items: center; gap: 12px;
  margin-top: 8px; padding: 8px 12px;
  background: #f0fdf4; border-radius: 6px; font-size: 14px;
}

/* 复合题 */
.composite-review { display: flex; flex-direction: column; gap: 0; }
.composite-material {
  font-size: 14px; line-height: 1.8; color: #303133;
  background: #f5f7fa; border-radius: 8px; padding: 16px;
  margin-bottom: 16px; white-space: pre-wrap;
}
.sub-question-card {
  border-top: 1px dashed #e4e7ed;
  padding: 16px 0;
}
.sub-question-card:first-child { border-top: none; padding-top: 0; }

/* 正确答案 + 解析区 */
.answer-analysis {
  margin-top: 16px;
  padding: 14px 16px;
  background: #f0fdf4;
  border-radius: 6px;
  border: 1px solid #b7eb8f;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.correct-answer-row, .explanation-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 14px;
}

.ca-label {
  font-size: 12px;
  color: #52c41a;
  font-weight: 600;
  white-space: nowrap;
  padding-top: 2px;
  min-width: 48px;
}

.ca-value { color: #303133; line-height: 1.6; }
.ca-value.correct { color: #00B96B; font-weight: 500; }

.ca-blank-list { display: flex; flex-direction: column; gap: 4px; }
.ca-blank-item { font-size: 14px; color: #606266; }

.explanation-row .ca-label { color: #909399; }
.explanation-row .ca-value { color: #606266; }
</style>
