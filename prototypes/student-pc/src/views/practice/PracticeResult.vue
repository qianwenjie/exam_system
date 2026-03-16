<template>
  <div class="result-page">
    <div class="result-card">
      <!-- 顶部：图标 + 标题 -->
      <div class="result-header">
        <svg viewBox="0 0 24 24" fill="none" stroke="#34C759" stroke-width="1.5" class="header-icon">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke-linecap="round"/>
          <polyline points="22 4 12 14.01 9 11.01" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h1 class="header-title">刷题完成</h1>
        <p class="header-sub">{{ task?.name || '' }}</p>
      </div>

      <!-- 掌握率环 + 统计 -->
      <div class="score-section">
        <div class="score-ring">
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#f2f2f7" stroke-width="8" />
            <circle cx="60" cy="60" r="52" fill="none"
              :stroke="masteredRate >= 60 ? '#34C759' : '#FF9500'"
              stroke-width="8" stroke-linecap="round"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="dashOffset"
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div class="ring-text">
            <span class="ring-value">{{ masteredRate }}</span>
            <span class="ring-unit">%</span>
          </div>
        </div>
        <div class="ring-label">掌握比例</div>
        <div class="stats-row">
          <span class="stat correct">答对 {{ store.correctCount }} 题</span>
          <span class="stat-sep">·</span>
          <span class="stat wrong">答错 {{ store.wrongCount }} 题</span>
          <span class="stat-sep">·</span>
          <span class="stat unanswered">未答 {{ unansweredCount }} 题</span>
        </div>
      </div>

      <!-- 模式 + 进度 -->
      <div class="info-list">
        <div class="info-row">
          <span class="info-label">抽题模式</span>
          <div class="mode-right">
            <span class="mode-tag" :class="isRandom ? 'random' : 'fixed'">{{ isRandom ? '随机抽题' : '固定题目' }}</span>
            <span class="mode-desc">{{ isRandom ? '每次从题库随机抽取，题目可能不同' : '每次刷题题目相同，适合反复巩固' }}</span>
          </div>
        </div>
        <div class="info-row">
          <span class="info-label">完成进度</span>
          <span class="info-val">{{ store.answeredCount }} / {{ store.questions.length }} 题</span>
        </div>
        <div class="info-row">
          <span class="info-label">正确率</span>
          <span class="info-val" :style="{ color: correctRate >= 60 ? '#34C759' : '#ff3b30' }">{{ correctRate }}%</span>
        </div>
      </div>

      <!-- 入口 -->
      <div class="entry-list">
        <div class="entry-row" @click="$router.push('/practice/wrong-book')">
          <div class="entry-left">
            <svg viewBox="0 0 24 24" fill="none" stroke="#ff3b30" stroke-width="1.5" style="width:18px;height:18px">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <span>查看错题</span>
          </div>
          <div class="entry-right">
            <span class="entry-count wrong-count">{{ store.wrongCount }} 题</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:14px;height:14px;color:#c7c7cc">
              <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        <div class="entry-row" @click="$router.push('/practice/favorites')">
          <div class="entry-left">
            <svg viewBox="0 0 24 24" fill="#FFD60A" style="width:18px;height:18px">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
            </svg>
            <span>查看收藏</span>
          </div>
          <div class="entry-right">
            <span class="entry-count fav-count">{{ store.favorites.length }} 题</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:14px;height:14px;color:#c7c7cc">
              <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- 操作 -->
      <div class="actions">
        <el-button size="large" @click="resetAndRestart">再刷一次</el-button>
        <el-button type="primary" size="large" @click="$router.replace('/practice/list')">返回列表</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePracticeStore } from '@/stores/practice'
import { ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const store = usePracticeStore()
const taskId = route.params.id
const task = ref(null)

const circumference = 2 * Math.PI * 52
const masteredRate = computed(() => store.masteredRate)
const unansweredCount = computed(() => store.questions.length - store.answeredCount)
const isRandom = computed(() => task.value?.questionMode === 'random')
const dashOffset = computed(() => circumference - (circumference * masteredRate.value) / 100)
const correctRate = computed(() => {
  if (!store.answeredCount) return 0
  return Math.round((store.correctCount / store.answeredCount) * 100)
})

onMounted(async () => {
  store.loadWrongBook()
  if (!store.currentTask || store.currentTask.id !== taskId) {
    await store.fetchTaskDetail(taskId)
  }
  task.value = store.currentTask
})

async function resetAndRestart() {
  const mode = isRandom.value ? '随机' : '固定'
  const hint = isRandom.value
    ? '随机模式下将重新从题库抽取题目，当前答题记录将被清除。'
    : '固定模式下题目不变，当前答题记录将被清除。'
  try {
    await ElMessageBox.confirm(
      `当前为${mode}抽题模式，${hint}\n确定要重新开始吗？`,
      '再刷一次',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
    store.resetPractice(taskId)
    router.replace({
      path: `/practice/answer/${taskId}`,
      query: isRandom.value ? { drawCount: String(task.value?.drawCount || 0) } : {},
    })
  } catch { /* 取消 */ }
}
</script>

<style scoped>
.result-page {
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background: #f5f7fa;
}

.result-card {
  width: 100%;
  max-width: 520px;
  background: #fff;
  border-radius: 16px;
  padding: 36px 40px 32px;
  text-align: center;
}

/* 顶部 */
.result-header { margin-bottom: 24px; }
.header-icon { width: 52px; height: 52px; margin-bottom: 10px; }
.header-title { font-size: 22px; font-weight: 600; color: #1d1d1f; margin: 0 0 4px; }
.header-sub { font-size: 13px; color: #86868b; margin: 0; }

/* 环形图 */
.score-section { margin-bottom: 20px; }
.score-ring { width: 130px; height: 130px; margin: 0 auto 10px; position: relative; }
.score-ring svg { width: 100%; height: 100%; }
.ring-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; align-items: baseline; gap: 2px; }
.ring-value { font-size: 34px; font-weight: 700; color: #1d1d1f; }
.ring-unit { font-size: 14px; color: #86868b; }
.ring-label { font-size: 13px; color: #86868b; margin-bottom: 10px; }
.stats-row { display: flex; justify-content: center; align-items: center; gap: 8px; font-size: 14px; }
.stat-sep { color: #c7c7cc; }
.stat.correct { color: #34C759; font-weight: 500; }
.stat.wrong { color: #ff3b30; font-weight: 500; }
.stat.unanswered { color: #86868b; }

/* 信息列表 */
.info-list { background: #f5f7fa; border-radius: 10px; padding: 4px 16px; margin-bottom: 16px; text-align: left; }
.info-row { display: flex; justify-content: space-between; align-items: center; font-size: 14px; padding: 10px 0; border-bottom: 1px solid #ebebeb; }
.info-row:last-child { border-bottom: none; }
.info-label { color: #86868b; }
.info-val { font-weight: 500; color: #1d1d1f; }
.mode-tag { font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 10px; flex-shrink: 0; }
.mode-tag.fixed { color: #2563EB; background: rgba(37,99,235,0.1); }
.mode-tag.random { color: #FF9500; background: rgba(255,149,0,0.1); }
.mode-right { display: flex; align-items: center; gap: 8px; }
.mode-desc { font-size: 12px; color: #86868b; }

/* 入口 */
.entry-list { margin-bottom: 20px; }
.entry-row { display: flex; justify-content: space-between; align-items: center; padding: 13px 16px; background: #f5f7fa; border-radius: 10px; margin-bottom: 8px; cursor: pointer; transition: background 0.2s; }
.entry-row:last-child { margin-bottom: 0; }
.entry-row:hover { background: #ebebeb; }
.entry-left { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; color: #1d1d1f; }
.entry-right { display: flex; align-items: center; gap: 6px; }
.entry-count { font-size: 13px; font-weight: 500; }
.wrong-count { color: #ff3b30; }
.fav-count { color: #FF9500; }

/* 操作 */
.actions { display: flex; gap: 12px; }
.actions .el-button { flex: 1; }
</style>
