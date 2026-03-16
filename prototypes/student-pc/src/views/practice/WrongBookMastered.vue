<template>
  <div class="mastered-page" @keydown="onKeyDown" tabindex="0" ref="pageRef">
    <div class="page-header">
      <button class="back-btn" @click="$router.push('/practice/wrong-book')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px">
          <path d="M19 12H5M12 5l-7 7 7 7" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h2>已掌握题集</h2>
      <span class="count-badge">共 {{ masteredItems.length }} 题</span>
    </div>

    <el-empty v-if="!masteredItems.length" description="暂无已掌握题目" />

    <template v-else>
      <!-- 列表 -->
      <div class="question-list">
        <div
          v-for="(item, idx) in pagedItems"
          :key="item.qId"
          class="list-item"
          :class="{ active: selectedIdx === pageOffset + idx }"
          @click="selectItem(pageOffset + idx)"
        >
          <span class="item-num">{{ pageOffset + idx + 1 }}</span>
          <div class="item-info">
            <span class="item-type">{{ item.question?.typeName || '题目' }}</span>
            <p class="item-content">{{ truncate(item.question?.content || item.question?.material) }}</p>
          </div>
          <span class="mastered-time">{{ formatTime(item.masteredTime) }}</span>
          <button class="unmark-inline-btn" @click.stop="unmarkMastered(item)">取消掌握</button>
        </div>
      </div>

      <!-- 分页固定底部 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="masteredItems.length"
          layout="prev, pager, next, total"
          background
          size="small"
        />
      </div>
    </template>

    <!-- 侧滑详情抽屉 -->
    <Transition name="drawer">
      <div v-if="drawerVisible" class="drawer-overlay" @click.self="closeDrawer">
        <div class="drawer">
          <div class="drawer-header">
            <button class="drawer-close" @click="closeDrawer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px">
                <path d="M19 12H5M12 5l-7 7 7 7" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="drawer-nav">
              <button class="nav-arrow" :disabled="selectedIdx === 0" @click="selectItem(selectedIdx - 1)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><path d="M15 18l-6-6 6-6" stroke-linecap="round"/></svg>
              </button>
              <span class="nav-pos">{{ selectedIdx + 1 }} / {{ masteredItems.length }}</span>
              <button class="nav-arrow" :disabled="selectedIdx >= masteredItems.length - 1" @click="selectItem(selectedIdx + 1)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><path d="M9 18l6-6-6-6" stroke-linecap="round"/></svg>
              </button>
            </div>
            <button class="unmark-btn" @click="unmarkMastered(selectedItem)">取消掌握</button>
          </div>

          <div class="drawer-body">
            <div class="detail-meta">
              <span class="type-tag" :style="{ background: typeColor(selectedItem?.question?.type) }">
                {{ selectedItem?.question?.typeName }}
              </span>
              <span class="mastered-badge">已掌握</span>
            </div>

            <div class="question-content" v-html="getContent(selectedItem?.question)"></div>

            <div class="answer-section">
              <!-- 单选/多选 -->
              <div v-if="['single','multiple'].includes(selectedItem?.question?.type)" class="options-list">
                <div v-for="opt in selectedItem.question.options" :key="opt.label" class="option-item" :class="{ 'is-correct': isCorrectOpt(selectedItem.question, opt.label) }">
                  <span class="opt-label">{{ opt.label }}</span>
                  <span class="opt-text">{{ opt.text }}</span>
                  <span v-if="isCorrectOpt(selectedItem.question, opt.label)" class="correct-mark">✓</span>
                </div>
              </div>
              <!-- 判断 -->
              <div v-else-if="selectedItem?.question?.type === 'judge'" class="simple-answer">
                <span class="answer-label">正确答案：</span>
                <span class="answer-value">{{ formatJudge(selectedItem.question.correctAnswer) }}</span>
              </div>
              <!-- 填空 -->
              <div v-else-if="selectedItem?.question?.type === 'blank'" class="simple-answer">
                <span class="answer-label">正确答案：</span>
                <span class="answer-value">{{ formatBlank(selectedItem.question.correctAnswer) }}</span>
              </div>
              <!-- 简答 -->
              <div v-else-if="selectedItem?.question?.type === 'essay'" class="essay-answer">
                <div class="answer-block-title">参考答案</div>
                <div class="answer-block-content">{{ selectedItem.question.correctAnswer }}</div>
              </div>
              <!-- 完形填空 -->
              <div v-else-if="selectedItem?.question?.type === 'cloze'" class="cloze-section">
                <div v-for="(blank, bi) in selectedItem.question.blanks" :key="blank.id" class="cloze-item">
                  <div class="cloze-item-title">第{{ bi + 1 }}空</div>
                  <div class="options-list">
                    <div v-for="opt in blank.options" :key="opt.label" class="option-item" :class="{ 'is-correct': selectedItem.question.correctAnswer[blank.id] === opt.label }">
                      <span class="opt-label">{{ opt.label }}</span>
                      <span class="opt-text">{{ opt.text }}</span>
                      <span v-if="selectedItem.question.correctAnswer[blank.id] === opt.label" class="correct-mark">✓</span>
                    </div>
                  </div>
                </div>
              </div>
              <!-- 复合题 -->
              <div v-else-if="selectedItem?.question?.type === 'composite'" class="composite-section">
                <div v-for="(sq, si) in selectedItem.question.subQuestions" :key="sq.id" class="sub-item">
                  <div class="sub-header">
                    <span class="sub-index">{{ si + 1 }}.</span>
                    <span class="sub-type">{{ sq.typeName }}</span>
                    <span class="sub-score">{{ sq.score }}分</span>
                  </div>
                  <div class="sub-content">{{ sq.content }}</div>
                  <!-- 子题单选/多选 -->
                  <div v-if="['single','multiple'].includes(sq.type)" class="options-list">
                    <div v-for="opt in sq.options" :key="opt.label" class="option-item" :class="{ 'is-correct': isCorrectOpt(sq, opt.label) }">
                      <span class="opt-label">{{ opt.label }}</span>
                      <span class="opt-text">{{ opt.text }}</span>
                      <span v-if="isCorrectOpt(sq, opt.label)" class="correct-mark">✓</span>
                    </div>
                  </div>
                  <!-- 子题判断 -->
                  <div v-else-if="sq.type === 'judge'" class="simple-answer">
                    <span class="answer-label">正确答案：</span>
                    <span class="answer-value">{{ formatJudge(sq.correctAnswer) }}</span>
                  </div>
                  <!-- 子题填空 -->
                  <div v-else-if="sq.type === 'blank'" class="simple-answer">
                    <span class="answer-label">正确答案：</span>
                    <span class="answer-value">{{ formatBlank(sq.correctAnswer) }}</span>
                  </div>
                  <!-- 子题简答 -->
                  <div v-else-if="sq.type === 'essay'" class="essay-answer">
                    <div class="answer-block-title">参考答案</div>
                    <div class="answer-block-content">{{ sq.correctAnswer }}</div>
                  </div>
                  <div v-if="sq.explanation" class="sub-explanation">解析：{{ sq.explanation }}</div>
                </div>
              </div>
            </div>

            <div v-if="selectedItem?.question?.explanation && !['composite'].includes(selectedItem?.question?.type)" class="explanation">
              <span class="exp-label">解析：</span>
              <span class="exp-text">{{ selectedItem.question.explanation }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePracticeStore } from '@/stores/practice'
import { ElMessageBox, ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const store = usePracticeStore()
const taskId = route.params.id
const pageRef = ref(null)

const selectedIdx = ref(0)
const drawerVisible = ref(false)
const currentPage = ref(1)
const pageSize = 20

const group = computed(() => store.wrongBookByTask.find(g => g.taskId === taskId))
const masteredItems = computed(() => group.value?.masteredItems || [])
const selectedItem = computed(() => masteredItems.value[selectedIdx.value] || null)

const pageOffset = computed(() => (currentPage.value - 1) * pageSize)
const pagedItems = computed(() => masteredItems.value.slice(pageOffset.value, pageOffset.value + pageSize))

function selectItem(idx) {
  selectedIdx.value = idx
  drawerVisible.value = true
  // 切换页
  const page = Math.floor(idx / pageSize) + 1
  if (page !== currentPage.value) currentPage.value = page
}

function closeDrawer() {
  drawerVisible.value = false
}

function onKeyDown(e) {
  if (!drawerVisible.value) return
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
    e.preventDefault()
    if (selectedIdx.value < masteredItems.value.length - 1) selectItem(selectedIdx.value + 1)
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
    e.preventDefault()
    if (selectedIdx.value > 0) selectItem(selectedIdx.value - 1)
  } else if (e.key === 'Escape') {
    closeDrawer()
  }
}

const truncate = (text) => {
  if (!text) return '（无题干）'
  const plain = text.replace(/<[^>]+>/g, '')
  return plain.length > 30 ? plain.slice(0, 30) + '…' : plain
}

const formatTime = (t) => {
  if (!t) return ''
  const d = new Date(t)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

const typeColor = (type) => {
  const map = { single: '#2563EB', multiple: '#667eea', judge: '#34C759', blank: '#FF9500', essay: '#ff3b30', cloze: '#AF52DE', composite: '#FF2D55' }
  return map[type] || '#86868b'
}

const getContent = (q) => {
  if (!q) return ''
  return q.type === 'composite' ? (q.material || '') : (q.content || '')
}

const isCorrectOpt = (q, label) => {
  const c = q?.correctAnswer
  return Array.isArray(c) ? c.includes(label) : c === label
}

const formatJudge = (val) => {
  if (val === true || val === 'true') return '正确 ✓'
  if (val === false || val === 'false') return '错误 ✗'
  return '未知'
}

const formatBlank = (answer) => Array.isArray(answer) ? answer.join('、') : String(answer || '')

async function unmarkMastered(item) {
  try {
    await ElMessageBox.confirm('确认将此题移回错题集吗？', '取消掌握', {
      confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning'
    })
    store.unmarkMastered(item.qId)
    ElMessage.success('已移回错题集')
    closeDrawer()
    if (selectedIdx.value >= masteredItems.value.length) {
      selectedIdx.value = Math.max(0, masteredItems.value.length - 1)
    }
  } catch { /* 取消 */ }
}

onMounted(() => {
  store.loadWrongBook()
  pageRef.value?.focus()
})
</script>

<style scoped>
.mastered-page { max-width: 800px; margin: 0 auto; outline: none; display: flex; flex-direction: column; height: calc(100vh - 64px - 48px); }

.page-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; flex-shrink: 0; }
.page-header h2 { font-size: 22px; font-weight: 600; color: #1d1d1f; margin: 0; }
.count-badge { padding: 3px 10px; border-radius: 10px; font-size: 13px; background: rgba(52,199,89,0.1); color: #34C759; font-weight: 500; }
.back-btn { width: 32px; height: 32px; border: none; background: rgba(0,0,0,0.04); border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #1d1d1f; transition: background 0.2s; flex-shrink: 0; }
.back-btn:hover { background: rgba(0,0,0,0.08); }

/* 列表 */
.question-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; }
.list-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: white; border: 1.5px solid #e4e7ed; border-radius: 10px; cursor: pointer; transition: all 0.15s; }
.list-item:hover { border-color: #34C759; }
.list-item.active { border-color: #34C759; background: rgba(52,199,89,0.04); }
.item-num { font-size: 14px; font-weight: 600; color: #86868b; min-width: 24px; flex-shrink: 0; }
.item-info { flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px; }
.item-type { font-size: 11px; padding: 1px 6px; background: #f2f2f7; color: #606266; border-radius: 4px; flex-shrink: 0; }
.item-content { font-size: 14px; color: #303133; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mastered-time { font-size: 11px; color: #34C759; flex-shrink: 0; }
.unmark-inline-btn { flex-shrink: 0; padding: 3px 10px; border: 1px solid #e4e7ed; border-radius: 6px; background: none; font-size: 12px; color: #909399; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
.unmark-inline-btn:hover { border-color: #FF9500; color: #FF9500; }

/* 分页固定底部 */
.pagination { flex-shrink: 0; display: flex; justify-content: center; padding: 16px 0 4px; border-top: 1px solid #f2f2f7; margin-top: 8px; }

/* 抽屉遮罩 */
.drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 1000; display: flex; justify-content: flex-end; }

/* 抽屉主体 */
.drawer { width: 520px; max-width: 90vw; height: 100%; background: #fff; display: flex; flex-direction: column; box-shadow: -4px 0 24px rgba(0,0,0,0.12); }
.drawer-header { display: flex; align-items: center; gap: 10px; padding: 16px 20px; border-bottom: 1px solid #e4e7ed; flex-shrink: 0; }
.drawer-close { width: 32px; height: 32px; border: none; background: rgba(0,0,0,0.04); border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #1d1d1f; transition: background 0.2s; flex-shrink: 0; }
.drawer-close:hover { background: rgba(0,0,0,0.08); }
.drawer-nav { display: flex; align-items: center; gap: 8px; flex: 1; justify-content: center; }
.nav-arrow { width: 28px; height: 28px; border: 1px solid #e4e7ed; border-radius: 6px; background: none; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #303133; transition: all 0.15s; }
.nav-arrow:hover:not(:disabled) { border-color: #34C759; color: #34C759; }
.nav-arrow:disabled { opacity: 0.35; cursor: not-allowed; }
.nav-pos { font-size: 13px; color: #606266; min-width: 60px; text-align: center; }
.unmark-btn { padding: 5px 12px; border: 1.5px solid #e4e7ed; border-radius: 8px; background: none; font-size: 13px; color: #606266; cursor: pointer; transition: all 0.15s; flex-shrink: 0; }
.unmark-btn:hover { border-color: #FF9500; color: #FF9500; }

.drawer-body { flex: 1; overflow-y: auto; padding: 24px; }
.detail-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.type-tag { display: inline-block; padding: 3px 10px; border-radius: 8px; color: #fff; font-size: 12px; font-weight: 500; }
.mastered-badge { padding: 3px 10px; border-radius: 8px; font-size: 12px; background: rgba(52,199,89,0.1); color: #34C759; font-weight: 500; }

.question-content { font-size: 15px; line-height: 1.7; color: #303133; margin-bottom: 16px; }
.answer-section { margin-bottom: 14px; }
.options-list { display: flex; flex-direction: column; gap: 8px; }
.option-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px 14px; border-radius: 8px; background: #f5f7fa; border: 1px solid transparent; font-size: 14px; }
.option-item.is-correct { background: rgba(52,199,89,0.06); border-color: rgba(52,199,89,0.4); }
.opt-label { font-weight: 600; min-width: 20px; flex-shrink: 0; }
.opt-text { flex: 1; color: #303133; }
.correct-mark { color: #34C759; font-weight: 700; }
.simple-answer { font-size: 14px; padding: 10px 14px; background: #f5f7fa; border-radius: 8px; }
.answer-label { color: #86868b; }
.answer-value { color: #34C759; font-weight: 500; }
.essay-answer { padding: 12px 14px; background: #f5f7fa; border-radius: 8px; }
.answer-block-title { font-size: 13px; color: #34C759; font-weight: 500; margin-bottom: 6px; }
.answer-block-content { font-size: 14px; line-height: 1.7; color: #303133; white-space: pre-line; }
.explanation { display: flex; gap: 8px; font-size: 14px; line-height: 1.6; padding-top: 14px; border-top: 1px solid #f2f2f7; }
.exp-label { color: #86868b; flex-shrink: 0; }
.exp-text { color: #303133; }

/* 完形填空 */
.cloze-section { display: flex; flex-direction: column; gap: 16px; }
.cloze-item { background: #f5f7fa; border-radius: 8px; padding: 12px; }
.cloze-item-title { font-size: 13px; font-weight: 600; color: #606266; margin-bottom: 8px; }

/* 复合题 */
.composite-section { display: flex; flex-direction: column; gap: 16px; }
.sub-item { background: #f5f7fa; border-radius: 8px; padding: 12px; }
.sub-header { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
.sub-index { font-size: 13px; font-weight: 600; color: #303133; }
.sub-type { font-size: 11px; color: #2563EB; background: rgba(37,99,235,0.08); padding: 1px 7px; border-radius: 10px; }
.sub-score { font-size: 12px; color: #909399; margin-left: auto; }
.sub-content { font-size: 14px; color: #303133; line-height: 1.6; margin-bottom: 10px; }
.sub-explanation { font-size: 12px; color: #86868b; margin-top: 8px; padding-top: 8px; border-top: 1px dashed #e4e7ed; }
.overall-explanation { display: flex; gap: 8px; font-size: 14px; line-height: 1.6; padding: 12px 14px; background: rgba(37,99,235,0.04); border-radius: 8px; border-left: 3px solid #2563EB; margin-top: 4px; }

/* 侧滑动画 */
.drawer-enter-active, .drawer-leave-active { transition: opacity 0.25s; }
.drawer-enter-active .drawer, .drawer-leave-active .drawer { transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
.drawer-enter-from .drawer, .drawer-leave-to .drawer { transform: translateX(100%); }
</style>
