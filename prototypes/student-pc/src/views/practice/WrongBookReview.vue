<template>
  <div class="wrong-review-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.push('/practice/wrong-book')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px">
          <path d="M19 12H5M12 5l-7 7 7 7" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h2>{{ taskName }}</h2>
      <span class="count-badge">{{ wrongItems.length }} 道错题</span>
    </div>

    <el-empty v-if="!wrongItems.length" description="暂无错题，全部已掌握！" />

    <div v-else class="review-layout">
      <!-- 左侧：按题型分组的格子导航 -->
      <aside class="question-nav">
        <div class="nav-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:16px;height:16px">
            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
            <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
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
                :key="item.qId"
                class="nav-item"
                :class="{ current: selectedIdx === item.idx }"
                @click="selectQuestion(item.idx)"
              >
                {{ item.idx + 1 }}
              </div>
            </div>
          </div>
        </div>
        <div class="nav-footer">
          共 {{ wrongItems.length }} 道错题
        </div>
      </aside>

      <!-- 右侧详情 -->
      <main class="question-detail" v-if="selectedItem">
        <div class="detail-card glass-card">
          <!-- 可滚动内容区 -->
          <div class="detail-scroll">
          <!-- 头部工具栏 -->
          <div class="detail-toolbar">
            <span class="type-tag" :style="{ background: typeColor(selectedItem.question?.type) }">
              {{ selectedItem.question?.typeName }}
            </span>
            <span class="wrong-info">错误 {{ selectedItem.wrongCount || 1 }} 次</span>
            <div class="toolbar-actions">
              <button v-if="!isRedoMode && selectedItem?.lastRedoCorrect" class="tool-btn mastered-btn" @click="markMastered">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px">
                  <polyline points="20 6 9 17 4 12" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                标记已掌握
              </button>
              <button v-if="!isRedoMode" class="tool-btn fav-btn" :class="{ active: isFavorited }" @click="toggleFavorite">
                <svg viewBox="0 0 24 24" :fill="isFavorited ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.5" style="width:14px;height:14px">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                </svg>
                {{ isFavorited ? '已收藏' : '收藏' }}
              </button>
              <button v-if="!isRedoMode" class="tool-btn remove-btn" @click="removeQuestion">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:14px;height:14px">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                  <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
                移除
              </button>
            </div>
          </div>

          <!-- 答题模式 -->
          <template v-if="isRedoMode">
            <QuestionItem
              :question="{ ...selectedItem.question, displayIndex: selectedIdx + 1 }"
              :answer="redoAnswer"
              :readonly="redoSubmitted"
              @update:answer="val => redoAnswer = val"
            />
            <!-- 提交后：复用回顾模式的反馈区 -->
            <template v-if="redoSubmitted">
              <!-- 简单对错提示（单选/多选/判断/填空/完形/复合） -->
              <div v-if="selectedItem.question?.type !== 'essay'" class="redo-feedback" :class="redoCorrect ? 'redo-correct' : 'redo-wrong'">
                <span class="redo-feedback-icon">{{ redoCorrect ? '✓' : '✗' }}</span>
                <span>{{ redoCorrect ? '回答正确！' : '回答错误，再看看解析吧' }}</span>
              </div>
              <!-- 简答题：准确率 -->
              <div v-if="selectedItem.question?.type === 'essay'" class="essay-section">
                <div class="essay-accuracy" :class="essayAccuracyLevel">
                  <span class="essay-accuracy-val">{{ essayAccuracy }}%</span>
                  <span class="essay-accuracy-label">准确率</span>
                </div>
                <div class="essay-block">
                  <div class="essay-label">我的作答</div>
                  <div class="essay-content student">{{ getEssayText(redoAnswer) || '未作答' }}</div>
                </div>
                <div class="essay-block">
                  <div class="essay-label reference">参考答案</div>
                  <div class="essay-content reference">{{ selectedItem.question.correctAnswer || '--' }}</div>
                </div>
              </div>
              <!-- 完形填空：每空对错 -->
              <div v-if="selectedItem.question?.type === 'cloze'" class="cloze-section">
                <div v-for="(blank, bi) in (selectedItem.question.blanks || [])" :key="blank.id" class="cloze-item">
                  <div class="cloze-item-header">
                    <span class="cloze-item-title">第{{ bi + 1 }}空</span>
                    <span :class="clozeBlankCorrect(blank) ? 'fb-correct' : 'fb-wrong'">
                      {{ clozeBlankCorrect(blank) ? '✓ 正确' : '✗ 错误' }}
                    </span>
                  </div>
                  <div class="options-list" style="margin-bottom:0">
                    <div
                      v-for="opt in blank.options"
                      :key="opt.label"
                      class="option-item"
                      :class="getClozeOptClass(blank, opt.label)"
                    >
                      <span class="opt-indicator" :class="isClozeSelected(blank, opt.label) ? (clozeBlankCorrect(blank) ? 'ind-correct' : 'ind-wrong') : 'ind-default'">
                        <template v-if="isClozeSelected(blank, opt.label)">{{ clozeBlankCorrect(blank) ? '✓' : '✗' }}</template>
                        <template v-else>{{ opt.label }}</template>
                      </span>
                      <span class="opt-text">{{ opt.text }}</span>
                    </div>
                  </div>
                  <div v-if="!clozeBlankCorrect(blank)" class="fb-hint" style="padding:6px 0 0">
                    正确答案：{{ (selectedItem.question.correctAnswer || {})[blank.id] }}
                  </div>
                </div>
              </div>
              <!-- 复合题：每个子题完整展示 -->
              <div v-if="selectedItem.question?.type === 'composite'" class="composite-section">
                <div v-for="(sq, si) in (selectedItem.question.subQuestions || [])" :key="sq.id" class="composite-sub">
                  <div class="composite-sub-header">
                    <span class="composite-sub-index">第{{ si + 1 }}小题</span>
                    <span class="composite-sub-type">{{ sq.typeName }}</span>
                    <span v-if="sq.type === 'essay'" class="composite-sub-status" :class="subEssayAccuracyLevel(sq)">
                      准确率 {{ subEssayAccuracy(sq) }}%
                    </span>
                    <span v-else class="composite-sub-status" :class="subCorrect(sq) ? 'fb-correct' : 'fb-wrong'">
                      {{ subCorrect(sq) ? '✓ 正确' : '✗ 错误' }}
                    </span>
                  </div>
                  <div class="composite-sub-stem">{{ sq.content }}</div>
                  <!-- 子题：单选/多选 -->
                  <div v-if="['single','multiple'].includes(sq.type)" class="options-list" style="margin-bottom:0">
                    <div v-for="opt in sq.options" :key="opt.label" class="option-item"
                      :class="{ 'opt-user-wrong': isSubSelected(sq, opt.label) && !isSubCorrectOpt(sq, opt.label), 'opt-user-correct': isSubSelected(sq, opt.label) && isSubCorrectOpt(sq, opt.label) }">
                      <span class="opt-indicator" :class="isSubSelected(sq, opt.label) ? (isSubCorrectOpt(sq, opt.label) ? 'ind-correct' : 'ind-wrong') : 'ind-default'">
                        <template v-if="isSubSelected(sq, opt.label)">{{ isSubCorrectOpt(sq, opt.label) ? '✓' : '✗' }}</template>
                        <template v-else>{{ opt.label }}</template>
                      </span>
                      <span class="opt-text">{{ opt.text }}</span>
                    </div>
                    <div v-if="!subCorrect(sq)" class="fb-hint" style="padding:6px 0 0">
                      正确答案：{{ formatAnswer(sq.correctAnswer) }}
                    </div>
                  </div>
                  <!-- 子题：判断 -->
                  <div v-if="sq.type === 'judge'" class="feedback-card" style="margin-bottom:0">
                    <div class="feedback-row">
                      <span class="fb-label">你的答案：</span>
                      <span class="fb-wrong fb-strikethrough">{{ formatAnswer((userAnswer || {})[sq.id]) }}</span>
                    </div>
                    <div class="feedback-row">
                      <span class="fb-label">正确答案：</span>
                      <span class="fb-correct">{{ formatAnswer(sq.correctAnswer) }}</span>
                    </div>
                  </div>
                  <!-- 子题：填空 -->
                  <div v-if="sq.type === 'blank'" class="feedback-card" style="margin-bottom:0">
                    <div v-for="(ans, ai) in getSubBlankDetails(sq)" :key="ai" class="feedback-row">
                      <span class="fb-label">第{{ ai + 1 }}空：</span>
                      <span :class="ans.isCorrect ? 'fb-correct' : 'fb-wrong'">{{ ans.student || '未作答' }}</span>
                      <span class="fb-mark" :class="ans.isCorrect ? 'correct' : 'wrong'">{{ ans.isCorrect ? '✓' : '✗' }}</span>
                      <span v-if="!ans.isCorrect" class="fb-hint">正确：{{ ans.correct }}</span>
                    </div>
                  </div>
                  <!-- 子题：简答 -->
                  <div v-if="sq.type === 'essay'" class="essay-section" style="margin-bottom:0">
                    <div class="essay-block">
                      <div class="essay-label">我的作答</div>
                      <div class="essay-content student">{{ getEssayText((userAnswer || {})[sq.id]) || '未作答' }}</div>
                    </div>
                    <div class="fb-hint" style="padding:6px 0 0">参考答案：{{ sq.correctAnswer || '--' }}</div>
                  </div>
                  <div v-if="sq.explanation" class="sub-explanation">解析：{{ sq.explanation }}</div>
                </div>
              </div>
              <!-- 解析 -->
              <div v-if="selectedItem.question?.explanation" class="redo-explanation">
                <span class="redo-exp-label">解析：</span>{{ selectedItem.question.explanation }}
              </div>
            </template>
          </template>

          <!-- 回顾模式（原有内容） -->
          <template v-else>
          <div class="question-content" v-html="getContent(selectedItem.question)"></div>

          <!-- 单选/多选：用户选择的选项标红，其余正常 -->
          <div v-if="hasOptions" class="options-list">
            <div
              v-for="opt in selectedItem.question.options"
              :key="opt.label"
              class="option-item"
              :class="{ 'opt-user-wrong': isUserSelected(opt.label) }"
            >
              <span class="opt-indicator" :class="isUserSelected(opt.label) ? 'ind-wrong' : 'ind-default'">
                <template v-if="isUserSelected(opt.label)">✗</template>
                <template v-else>{{ opt.label }}</template>
              </span>
              <span class="opt-text">{{ opt.text }}</span>
            </div>
          </div>

          <!-- 简答题：准确率 + 我的作答 + 参考答案 + 解析 -->
          <div v-if="selectedItem.question?.type === 'essay'" class="essay-section">
            <div class="essay-accuracy" :class="essayAccuracyLevel">
              <span class="essay-accuracy-val">{{ essayAccuracy }}%</span>
              <span class="essay-accuracy-label">准确率</span>
            </div>
            <div class="essay-block">
              <div class="essay-label">我的作答</div>
              <div class="essay-content student">{{ getEssayText(userAnswer) || '未作答' }}</div>
            </div>
            <div class="essay-block">
              <div class="essay-label reference">参考答案</div>
              <div class="essay-content reference">{{ selectedItem.question.correctAnswer || '--' }}</div>
            </div>
            <div v-if="selectedItem.question?.explanation" class="explanation">
              <span class="exp-label">解析：</span>
              <span class="exp-text">{{ selectedItem.question.explanation }}</span>
            </div>
          </div>

          <!-- 完形填空：每空展示选项 + 对错 -->
          <div v-if="selectedItem.question?.type === 'cloze'" class="cloze-section">
            <div v-for="(blank, bi) in (selectedItem.question.blanks || [])" :key="blank.id" class="cloze-item">
              <div class="cloze-item-header">
                <span class="cloze-item-title">第{{ bi + 1 }}空</span>
                <span :class="clozeBlankCorrect(blank) ? 'fb-correct' : 'fb-wrong'">
                  {{ clozeBlankCorrect(blank) ? '✓ 正确' : '✗ 错误' }}
                </span>
              </div>
              <div class="options-list" style="margin-bottom:0">
                <div
                  v-for="opt in blank.options"
                  :key="opt.label"
                  class="option-item"
                  :class="getClozeOptClass(blank, opt.label)"
                >
                  <span class="opt-indicator" :class="isClozeSelected(blank, opt.label) ? (clozeBlankCorrect(blank) ? 'ind-correct' : 'ind-wrong') : 'ind-default'">
                    <template v-if="isClozeSelected(blank, opt.label)">{{ clozeBlankCorrect(blank) ? '✓' : '✗' }}</template>
                    <template v-else>{{ opt.label }}</template>
                  </span>
                  <span class="opt-text">{{ opt.text }}</span>
                </div>
              </div>
              <div v-if="!clozeBlankCorrect(blank)" class="fb-hint" style="padding:6px 0 0">
                正确答案：{{ (selectedItem.question.correctAnswer || {})[blank.id] }}
              </div>
            </div>
            <div v-if="selectedItem.question?.explanation" class="explanation">
              <span class="exp-label">解析：</span>
              <span class="exp-text">{{ selectedItem.question.explanation }}</span>
            </div>
          </div>

          <!-- 复合题：每个子题展示 -->
          <div v-if="selectedItem.question?.type === 'composite'" class="composite-section">
            <div v-for="(sq, si) in (selectedItem.question.subQuestions || [])" :key="sq.id" class="composite-sub">
              <div class="composite-sub-header">
                <span class="composite-sub-index">第{{ si + 1 }}小题</span>
                <span class="composite-sub-type">{{ sq.typeName }}</span>
                <span v-if="sq.type === 'essay'" class="composite-sub-status" :class="subEssayAccuracyLevel(sq)">
                  准确率 {{ subEssayAccuracy(sq) }}%
                </span>
                <span v-else class="composite-sub-status" :class="subCorrect(sq) ? 'fb-correct' : 'fb-wrong'">
                  {{ subCorrect(sq) ? '✓ 正确' : '✗ 错误' }}
                </span>
              </div>
              <div class="composite-sub-stem">{{ sq.content }}</div>
              <!-- 子题：单选/多选 -->
              <div v-if="['single','multiple'].includes(sq.type)" class="options-list" style="margin-bottom:0">
                <div v-for="opt in sq.options" :key="opt.label" class="option-item"
                  :class="{ 'opt-user-wrong': isSubSelected(sq, opt.label) && !isSubCorrectOpt(sq, opt.label), 'opt-user-correct': isSubSelected(sq, opt.label) && isSubCorrectOpt(sq, opt.label) }">
                  <span class="opt-indicator" :class="isSubSelected(sq, opt.label) ? (isSubCorrectOpt(sq, opt.label) ? 'ind-correct' : 'ind-wrong') : 'ind-default'">
                    <template v-if="isSubSelected(sq, opt.label)">{{ isSubCorrectOpt(sq, opt.label) ? '✓' : '✗' }}</template>
                    <template v-else>{{ opt.label }}</template>
                  </span>
                  <span class="opt-text">{{ opt.text }}</span>
                </div>
                <div v-if="!subCorrect(sq)" class="fb-hint" style="padding:6px 0 0">
                  正确答案：{{ formatAnswer(sq.correctAnswer) }}
                </div>
              </div>
              <!-- 子题：判断 -->
              <div v-if="sq.type === 'judge'" class="feedback-card" style="margin-bottom:0">
                <div class="feedback-row">
                  <span class="fb-label">你的答案：</span>
                  <span class="fb-wrong fb-strikethrough">{{ formatAnswer((userAnswer || {})[sq.id]) }}</span>
                </div>
                <div class="feedback-row">
                  <span class="fb-label">正确答案：</span>
                  <span class="fb-correct">{{ formatAnswer(sq.correctAnswer) }}</span>
                </div>
              </div>
              <!-- 子题：填空 -->
              <div v-if="sq.type === 'blank'" class="feedback-card" style="margin-bottom:0">
                <div v-for="(ans, ai) in getSubBlankDetails(sq)" :key="ai" class="feedback-row">
                  <span class="fb-label">第{{ ai + 1 }}空：</span>
                  <span :class="ans.isCorrect ? 'fb-correct' : 'fb-wrong'">{{ ans.student || '未作答' }}</span>
                  <span class="fb-mark" :class="ans.isCorrect ? 'correct' : 'wrong'">{{ ans.isCorrect ? '✓' : '✗' }}</span>
                  <span v-if="!ans.isCorrect" class="fb-hint">正确：{{ ans.correct }}</span>
                </div>
              </div>
              <!-- 子题：简答 -->
              <div v-if="sq.type === 'essay'" class="essay-section" style="margin-bottom:0">
                <div class="essay-block">
                  <div class="essay-label">我的作答</div>
                  <div class="essay-content student">{{ getEssayText((userAnswer || {})[sq.id]) || '未作答' }}</div>
                </div>
                <div class="fb-hint" style="padding:6px 0 0">参考答案：{{ sq.correctAnswer || '--' }}</div>
              </div>
              <div v-if="sq.explanation" class="sub-explanation">解析：{{ sq.explanation }}</div>
            </div>
          </div>

          <!-- 反馈区：单选/多选/判断/填空 -->
          <div v-if="!['essay','cloze','composite'].includes(selectedItem.question?.type)" class="feedback-card">
            <template v-if="selectedItem.question?.type === 'blank'">
              <div v-for="(ans, i) in blankDetails" :key="i" class="feedback-row">
                <span class="fb-label">第{{ i + 1 }}空：</span>
                <span :class="ans.isCorrect ? 'fb-correct' : 'fb-wrong'">{{ ans.student || '未作答' }}</span>
                <span class="fb-mark" :class="ans.isCorrect ? 'correct' : 'wrong'">{{ ans.isCorrect ? '✓' : '✗' }}</span>
                <span v-if="!ans.isCorrect" class="fb-hint">正确：{{ ans.correct }}</span>
              </div>
            </template>
            <template v-else>
              <div class="feedback-row">
                <span class="fb-label">你的答案：</span>
                <span class="fb-wrong fb-strikethrough">{{ formatAnswer(userAnswer) }}</span>
              </div>
              <div class="feedback-row">
                <span class="fb-label">正确答案：</span>
                <span class="fb-correct">{{ formatAnswer(selectedItem.question?.correctAnswer) }}</span>
              </div>
            </template>
            <div v-if="selectedItem.question?.explanation" class="fb-explanation">
              <span class="fb-exp-label">解析：</span>
              <span class="fb-exp-text">{{ selectedItem.question.explanation }}</span>
            </div>
          </div>

          </template><!-- /回顾模式 -->

          </div><!-- /detail-scroll -->

          <!-- 底部操作 -->
          <div class="detail-actions">
            <el-button :disabled="selectedIdx === 0" @click="prevQuestion">上一题</el-button>
            <template v-if="isRedoMode">
              <el-button @click="cancelRedo">取消重做</el-button>
              <el-button
                v-if="!redoSubmitted"
                type="primary"
                :disabled="!redoHasAnswer"
                @click="confirmRedoAnswer"
              >提交答案</el-button>
              <el-button
                v-if="redoSubmitted && !redoCorrect"
                type="primary"
                @click="redoQuestion"
              >再次重做</el-button>
              <el-button
                v-if="redoSubmitted && redoCorrect"
                type="success"
                @click="confirmMasteredFromRedo"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;margin-right:4px">
                  <polyline points="20 6 9 17 4 12" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                标记已掌握
              </el-button>
            </template>
            <template v-else>
              <el-button type="primary" @click="redoQuestion">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;margin-right:4px">
                  <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5" stroke-linecap="round"/>
                </svg>
                重做本题
              </el-button>
            </template>
            <el-button :disabled="selectedIdx >= sortedItems.length - 1" @click="nextQuestion">下一题</el-button>
          </div>
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

const route = useRoute()
const router = useRouter()
const store = usePracticeStore()
const taskId = route.params.id
const selectedIdx = ref(0)

const TYPE_ORDER = ['single', 'multiple', 'judge', 'blank', 'essay', 'cloze', 'composite']

const group = computed(() => store.wrongBookByTask.find(g => g.taskId === taskId))
const taskName = computed(() => group.value?.taskName || '错题回顾')
const wrongItems = computed(() => group.value?.wrongItems || [])

// 按题型排序后的平铺列表，上一题/下一题和格子序号都基于此
const sortedItems = computed(() => {
  return [...wrongItems.value].sort((a, b) => {
    const ai = TYPE_ORDER.indexOf(a.question?.type)
    const bi = TYPE_ORDER.indexOf(b.question?.type)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })
})

const selectedItem = computed(() => sortedItems.value[selectedIdx.value] || null)

// 按题型分组，格子序号 = 在 sortedItems 中的下标
const questionGroups = computed(() => {
  const groups = {}
  sortedItems.value.forEach((item, idx) => {
    const type = item.question?.type || 'unknown'
    if (!groups[type]) {
      groups[type] = { type, typeName: item.question?.typeName || type, items: [] }
    }
    groups[type].items.push({ qId: item.qId, idx })
  })
  return Object.values(groups)
})

const isFavorited = computed(() => {
  const qId = selectedItem.value?.question?.id
  return qId ? store.favorites.includes(qId) : false
})

const userAnswer = computed(() => {
  // 重做提交后，用本次重做的答案
  if (isRedoMode.value && redoSubmitted.value) return redoAnswer.value
  const answers = selectedItem.value?.userAnswers
  if (!answers || !answers.length) return null
  return answers[answers.length - 1]?.answer ?? null
})

const hasOptions = computed(() => ['single', 'multiple'].includes(selectedItem.value?.question?.type))

const isUserSelected = (label) => {
  const ans = userAnswer.value
  return Array.isArray(ans) ? ans.includes(label) : ans === label
}

const formatAnswer = (val) => {
  if (val === true || val === 'true') return '正确 ✓'
  if (val === false || val === 'false') return '错误 ✗'
  if (Array.isArray(val)) return val.join('、')
  return String(val ?? '未作答')
}

const blankDetails = computed(() => {
  const q = selectedItem.value?.question
  if (!q || q.type !== 'blank' || !Array.isArray(q.correctAnswer)) return []
  const user = userAnswer.value
  const blanks = q.blanks || []
  if (user && typeof user === 'object' && !Array.isArray(user)) {
    return q.correctAnswer.map((c, i) => {
      const blank = blanks[i]
      const student = blank ? (user[blank.id] || '') : ''
      return { student, correct: c, isCorrect: student.trim().toLowerCase() === (c || '').trim().toLowerCase() }
    })
  }
  return q.correctAnswer.map(c => ({ student: '', correct: c, isCorrect: false }))
})

const getEssayText = (ans) => {
  if (typeof ans === 'string') return ans
  if (ans && typeof ans === 'object' && ans.text) return ans.text
  return ''
}
const getContent = (q) => {
  if (!q) return ''
  return q.type === 'composite' ? (q.material || '') : (q.content || '')
}
const typeColor = (type) => {
  const map = { single: '#2563EB', multiple: '#667eea', judge: '#34C759', blank: '#FF9500', essay: '#ff3b30', cloze: '#AF52DE', composite: '#FF2D55' }
  return map[type] || '#86868b'
}

// 简答题准确率（错题本里取最后一次作答的准确率，默认0）
function calcEssayAccuracy(userAns, correctAnswer) {
  const userText = (typeof userAns === 'string' ? userAns : userAns?.text || '').trim()
  const correctText = String(correctAnswer || '').trim()
  if (!userText || !correctText) return 0
  const stopWords = ['的', '了', '是', '在', '和', '与', '或', '等']
  const extract = (text) => text.replace(/[，。、；：！？\s,.;:!?]/g, ' ').split(/\s+/).filter(w => w.length >= 2 && !stopWords.includes(w))
  const keywords = extract(correctText)
  if (!keywords.length) return userText === correctText ? 100 : 0
  return Math.round(keywords.filter(kw => userText.includes(kw)).length / keywords.length * 100)
}

const essayAccuracy = computed(() => {
  if (isRedoMode.value && redoSubmitted.value) {
    return calcEssayAccuracy(redoAnswer.value, selectedItem.value?.question?.correctAnswer)
  }
  const answers = selectedItem.value?.userAnswers
  if (!answers?.length) return 0
  return answers[answers.length - 1]?.accuracy ?? 0
})
const essayAccuracyLevel = computed(() => {
  const a = essayAccuracy.value
  if (a >= 80) return 'level-high'
  if (a >= 50) return 'level-mid'
  return 'level-low'
})

// 完形填空：某空是否正确
const clozeBlankCorrect = (blank) => {
  const ans = userAnswer.value
  if (!ans || typeof ans !== 'object') return false
  const correct = (selectedItem.value?.question?.correctAnswer || {})[blank.id]
  return ans[blank.id] === correct
}
const isClozeSelected = (blank, label) => {
  const ans = userAnswer.value
  if (!ans || typeof ans !== 'object') return false
  return ans[blank.id] === label
}
const getClozeOptClass = (blank, label) => {
  if (!isClozeSelected(blank, label)) return ''
  return clozeBlankCorrect(blank) ? 'opt-user-correct' : 'opt-user-wrong'
}

// 复合题：子题是否正确
const subCorrect = (sq) => {
  const ans = (userAnswer.value || {})[sq.id]
  const correct = sq.correctAnswer
  if (sq.type === 'single') return ans === correct
  if (sq.type === 'multiple') return Array.isArray(ans) && Array.isArray(correct) && ans.length === correct.length && ans.every(a => correct.includes(a))
  if (sq.type === 'judge') return String(ans) === String(correct)
  if (sq.type === 'blank') {
    if (!Array.isArray(correct)) return false
    const blanks = sq.blanks || []
    if (typeof ans === 'object' && !Array.isArray(ans)) {
      return blanks.every((b, i) => (ans[b.id] || '').trim().toLowerCase() === (correct[i] || '').trim().toLowerCase())
    }
    if (Array.isArray(ans)) return ans.every((a, i) => (a || '').trim().toLowerCase() === (correct[i] || '').trim().toLowerCase())
    return false
  }
  return false
}
const isSubSelected = (sq, label) => {
  const a = (userAnswer.value || {})[sq.id]
  return Array.isArray(a) ? a.includes(label) : a === label
}
const isSubCorrectOpt = (sq, label) => {
  const c = sq.correctAnswer
  return Array.isArray(c) ? c.includes(label) : c === label
}
const getSubBlankDetails = (sq) => {
  const userAns = (userAnswer.value || {})[sq.id]
  const correct = sq.correctAnswer || []
  if (!Array.isArray(correct)) return []
  const blanks = sq.blanks || []
  if (typeof userAns === 'object' && !Array.isArray(userAns) && userAns) {
    return correct.map((c, i) => {
      const student = blanks[i] ? (userAns[blanks[i].id] || '') : ''
      return { student, correct: c, isCorrect: student.trim().toLowerCase() === (c || '').trim().toLowerCase() }
    })
  }
  if (Array.isArray(userAns)) {
    return correct.map((c, i) => ({ student: userAns[i] || '', correct: c, isCorrect: (userAns[i] || '').trim().toLowerCase() === (c || '').trim().toLowerCase() }))
  }
  return correct.map(c => ({ student: '', correct: c, isCorrect: false }))
}
const subEssayAccuracy = (sq) => {
  // 重做提交后，实时计算准确率
  if (isRedoMode.value && redoSubmitted.value) {
    const text = getEssayText((redoAnswer.value || {})[sq.id])
    return calcEssayAccuracy(text, sq.correctAnswer)
  }
  const answers = selectedItem.value?.userAnswers
  if (!answers?.length) return 0
  const last = answers[answers.length - 1]
  return (last?.essayAccuracies || {})[sq.id] ?? 0
}
const subEssayAccuracyLevel = (sq) => {
  const a = subEssayAccuracy(sq)
  if (a >= 80) return 'fb-correct'
  if (a >= 50) return 'fb-warning'
  return 'fb-wrong'
}

function prevQuestion() { if (selectedIdx.value > 0) selectQuestion(selectedIdx.value - 1) }
function nextQuestion() { if (selectedIdx.value < sortedItems.value.length - 1) selectQuestion(selectedIdx.value + 1) }

// 重做状态
const isRedoMode = ref(false)
const redoAnswer = ref(null)
const redoSubmitted = ref(false)
const redoCorrect = ref(false)

function selectQuestion(idx) {
  selectedIdx.value = idx
  // 切换题目时退出重做模式
  isRedoMode.value = false
  redoAnswer.value = null
  redoSubmitted.value = false
  redoCorrect.value = false
}

function redoQuestion() {
  redoAnswer.value = null
  redoSubmitted.value = false
  redoCorrect.value = false
  isRedoMode.value = true
}

function cancelRedo() {
  isRedoMode.value = false
  redoAnswer.value = null
  redoSubmitted.value = false
  redoCorrect.value = false
}

function confirmRedoAnswer() {
  const q = selectedItem.value?.question
  const ans = redoAnswer.value
  if (!q) return
  if (ans === null || ans === undefined) return
  if (Array.isArray(ans) && ans.length === 0) return
  if (typeof ans === 'string' && ans.trim() === '' && q.type !== 'essay') return

  if (q.type === 'essay') {
    redoCorrect.value = calcEssayAccuracy(ans, q.correctAnswer) >= 80
  } else {
    redoCorrect.value = checkAnswer(ans, q)
  }
  redoSubmitted.value = true
  store.recordRedoAttempt(selectedItem.value.qId)
  if (redoCorrect.value) store.setRedoCorrect(selectedItem.value.qId)
}

async function confirmMasteredFromRedo() {
  store.markMastered(selectedItem.value.qId)
  ElMessage.success('已标记为掌握，移入已掌握题集')
  isRedoMode.value = false
  if (selectedIdx.value >= sortedItems.value.length) {
    selectedIdx.value = Math.max(0, sortedItems.value.length - 1)
  }
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
    if (!Array.isArray(correct)) return false
    const blanks = question.blanks || []
    if (typeof userAnswer === 'object' && !Array.isArray(userAnswer)) {
      return blanks.every((b, i) => (userAnswer[b.id] || '').trim().toLowerCase() === (correct[i] || '').trim().toLowerCase())
    }
    return false
  }
  if (question.type === 'cloze') {
    if (!question.blanks || typeof correct !== 'object') return false
    return question.blanks.every(b => (userAnswer || {})[b.id] === correct[b.id])
  }
  if (question.type === 'essay') return false // 简答题不自动判对
  if (question.type === 'composite') {
    if (!question.subQuestions) return false
    return question.subQuestions.every(sq => {
      const ua = (userAnswer || {})[sq.id]
      const ca = sq.correctAnswer
      if (sq.type === 'single') return ua === ca
      if (sq.type === 'multiple') return Array.isArray(ua) && Array.isArray(ca) && ua.length === ca.length && ua.every(a => ca.includes(a))
      if (sq.type === 'judge') return String(ua) === String(ca)
      return false
    })
  }
  return false
}

const redoHasAnswer = computed(() => {
  const ans = redoAnswer.value
  if (ans === null || ans === undefined || ans === '') return false
  if (Array.isArray(ans)) return ans.length > 0
  if (typeof ans === 'object') return Object.keys(ans).length > 0
  return true
})

function toggleFavorite() {
  const qId = selectedItem.value?.question?.id
  if (qId) store.toggleFavorite(qId)
}

async function markMastered() {
  if (!selectedItem.value) return
  try {
    await ElMessageBox.confirm('确认已掌握此题？将移入已掌握题集。', '标记已掌握', {
      confirmButtonText: '确认', cancelButtonText: '取消', type: 'success'
    })
    store.markMastered(selectedItem.value.qId)
    ElMessage.success('已标记为掌握')
    if (selectedIdx.value >= sortedItems.value.length) {
      selectedIdx.value = Math.max(0, sortedItems.value.length - 1)
    }
  } catch { /* 取消 */ }
}

async function removeQuestion() {
  if (!selectedItem.value) return
  try {
    await ElMessageBox.confirm('确认从错题集中移除此题？', '移除错题', {
      confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning'
    })
    store.removeFromWrongBook(selectedItem.value.qId)
    ElMessage.success('已移除')
    if (selectedIdx.value >= sortedItems.value.length) {
      selectedIdx.value = Math.max(0, sortedItems.value.length - 1)
    }
  } catch { /* 取消 */ }
}

onMounted(() => {
  store.loadWrongBook()
  store.fetchTaskList()
})
</script>

<style scoped>
.wrong-review-page { display: flex; flex-direction: column; height: calc(100vh - 64px - 48px); }
/* 64px = 顶部导航栏，48px = MainLayout padding(24px*2) */
.back-btn { width: 32px; height: 32px; border: none; background: rgba(0,0,0,0.04); border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #1d1d1f; transition: background 0.2s; flex-shrink: 0; }
.back-btn:hover { background: rgba(0,0,0,0.08); }
.page-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; flex-shrink: 0; }
.page-header h2 { font-size: 22px; font-weight: 600; color: #1d1d1f; margin: 0; }
.count-badge { padding: 3px 10px; border-radius: 10px; font-size: 13px; background: rgba(255,59,48,0.1); color: #ff3b30; font-weight: 500; }

.review-layout { display: flex; gap: 20px; flex: 1; overflow: hidden; min-height: 0; }

/* 左侧导航 */
.question-nav { width: 240px; flex-shrink: 0; background: #f5f7fa; border: 1px solid #e4e7ed; border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; min-height: 0; }
.nav-header { height: 48px; display: flex; align-items: center; gap: 8px; padding: 0 16px; border-bottom: 1px solid #e4e7ed; font-size: 14px; font-weight: 600; color: #303133; flex-shrink: 0; }
.nav-scroll { flex: 1; overflow-y: auto; padding: 12px; }
.nav-group { margin-bottom: 16px; }
.nav-group:last-child { margin-bottom: 0; }
.nav-group-header { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; font-size: 13px; font-weight: 600; color: #606266; }
.nav-group-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.nav-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px; }
.nav-item { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; background: white; border: 1.5px solid #dcdfe6; border-radius: 4px; font-size: 12px; font-weight: 500; color: #606266; cursor: pointer; transition: all 0.15s; }
.nav-item:hover { border-color: #909399; color: #303133; transform: translateY(-1px); }
.nav-item.current { background: #2563EB !important; border-color: #2563EB !important; border-width: 1.5px !important; color: #fff !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.2) !important; }
.nav-footer { border-top: 1px solid #e4e7ed; padding: 10px 16px; font-size: 12px; color: #86868b; flex-shrink: 0; }

/* 右侧详情 */
.question-detail { flex: 1; overflow: hidden; position: relative; min-height: 0; }
.detail-card { height: 100%; border-radius: 14px; padding: 24px 24px 0; display: flex; flex-direction: column; overflow: hidden; }
.detail-scroll { flex: 1; overflow-y: auto; padding-bottom: 8px; }
.glass-card { background: rgba(255,255,255,0.9); border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 1px 4px rgba(0,0,0,0.04); }

.detail-toolbar { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.type-tag { display: inline-block; padding: 3px 10px; border-radius: 8px; color: #fff; font-size: 12px; font-weight: 500; }
.wrong-info { font-size: 12px; color: #ff3b30; background: rgba(255,59,48,0.08); padding: 3px 8px; border-radius: 6px; }
.toolbar-actions { margin-left: auto; display: flex; gap: 8px; }
.tool-btn { display: inline-flex; align-items: center; gap: 4px; padding: 5px 12px; border: 1.5px solid #e4e7ed; border-radius: 8px; background: none; font-size: 13px; color: #606266; cursor: pointer; transition: all 0.15s; }
.tool-btn:hover { border-color: #2563EB; color: #2563EB; }
.fav-btn.active { border-color: #FF9500; color: #FF9500; }
.remove-btn:hover { border-color: #ff3b30; color: #ff3b30; }
.mastered-btn { border-color: #34C759; color: #34C759; }
.mastered-btn:hover { background: rgba(52,199,89,0.06); border-color: #34C759; color: #34C759; }

.question-content { font-size: 15px; line-height: 1.7; color: #303133; margin-bottom: 16px; }

.options-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.option-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; border: 1px solid transparent; background: #f5f7fa; font-size: 14px; }
.option-item.opt-user-wrong { background: rgba(255,59,48,0.06); border-color: rgba(255,59,48,0.2); }
.opt-indicator { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
.ind-default { background: #e4e7ed; color: #606266; }
.ind-wrong { background: #ff3b30; color: #fff; }
.opt-text { flex: 1; color: #303133; }

/* 反馈卡片（单选/多选/判断/填空） */
.feedback-card { background: rgba(255,59,48,0.04); border: 1px solid rgba(255,59,48,0.15); border-radius: 10px; padding: 12px 16px; margin-bottom: 16px; display: flex; flex-direction: column; gap: 6px; }
.feedback-row { display: flex; align-items: center; gap: 8px; font-size: 14px; flex-wrap: wrap; }
.fb-label { color: #86868b; flex-shrink: 0; }
.fb-wrong { color: #ff3b30; font-weight: 500; }
.fb-correct { color: #34C759; font-weight: 500; }
.fb-strikethrough { text-decoration: line-through; }
.fb-mark { font-weight: 700; }
.fb-mark.correct { color: #34C759; }
.fb-mark.wrong { color: #ff3b30; }
.fb-hint { font-size: 12px; color: #34C759; }
.fb-explanation { margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(0,0,0,0.08); font-size: 14px; line-height: 1.6; color: #303133; }
.fb-exp-label { color: #86868b; margin-right: 4px; }

.essay-section { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
.essay-block { display: flex; flex-direction: column; gap: 4px; }
.essay-label { font-size: 13px; font-weight: 500; color: #606266; }
.essay-label.reference { color: #34C759; }
.essay-content { font-size: 14px; line-height: 1.7; padding: 10px 14px; border-radius: 8px; white-space: pre-line; }
.essay-content.student { background: #f5f7fa; color: #606266; border: 1px solid #e4e7ed; }
.essay-content.reference { background: rgba(52,199,89,0.04); color: #303133; border: 1px solid rgba(52,199,89,0.3); }

.explanation { display: flex; gap: 8px; font-size: 14px; line-height: 1.6; margin-bottom: 0; padding: 14px 0 20px; border-top: 1px solid #f2f2f7; }
.exp-label { color: #86868b; flex-shrink: 0; }
.exp-text { color: #303133; }

.detail-actions { display: flex; gap: 12px; flex-shrink: 0; padding: 12px 24px; margin: 0 -24px; border-top: 1px solid #e4e7ed; box-shadow: 0 -4px 12px rgba(0,0,0,0.06); border-radius: 0 0 14px 14px; background: white; }

/* 简答题准确率 */
.essay-accuracy { display: flex; align-items: baseline; gap: 6px; margin-bottom: 12px; }
.essay-accuracy-val { font-size: 28px; font-weight: 700; line-height: 1; }
.essay-accuracy-label { font-size: 13px; color: #86868b; }
.level-high .essay-accuracy-val { color: #34C759; }
.level-mid .essay-accuracy-val { color: #FF9500; }
.level-low .essay-accuracy-val { color: #ff3b30; }

/* 完形填空 */
.cloze-section { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
.cloze-item { background: #f5f7fa; border-radius: 10px; padding: 12px 14px; }
.cloze-item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 13px; font-weight: 600; }
.cloze-item-title { color: #303133; }

/* 复合题 */
.composite-section { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
.composite-sub { background: #f5f7fa; border-radius: 10px; padding: 12px 14px; }
.composite-sub-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #e4e7ed; font-size: 13px; }
.composite-sub-index { font-weight: 600; color: #303133; }
.composite-sub-type { font-size: 11px; color: #34C759; background: rgba(52,199,89,0.1); padding: 2px 8px; border-radius: 10px; }
.composite-sub-status { margin-left: auto; font-weight: 500; }
.composite-sub-stem { font-size: 14px; color: #606266; line-height: 1.7; margin-bottom: 10px; }
.sub-explanation { font-size: 12px; color: #86868b; margin-top: 8px; padding-top: 8px; border-top: 1px dashed #e4e7ed; }

/* 选项补充：用户选对时绿色 */
.opt-user-correct { background: rgba(52,199,89,0.06); border-color: rgba(52,199,89,0.4); }
.ind-correct { background: #34C759; color: #fff; }
.fb-warning { color: #FF9500; font-weight: 500; }

/* 重做答题区 */
.redo-feedback { display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 10px; font-size: 14px; font-weight: 500; margin-top: 16px; }
.redo-correct { background: rgba(52,199,89,0.08); color: #34C759; border: 1px solid rgba(52,199,89,0.3); }
.redo-wrong { background: rgba(255,59,48,0.06); color: #ff3b30; border: 1px solid rgba(255,59,48,0.2); }
.redo-feedback-icon { font-size: 18px; font-weight: 700; }
.redo-explanation { font-size: 14px; line-height: 1.7; color: #606266; padding: 10px 14px; background: #f5f7fa; border-radius: 8px; margin-top: 10px; }
.redo-exp-label { color: #86868b; margin-right: 4px; }
</style>
