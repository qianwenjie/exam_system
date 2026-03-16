<template>
  <div class="practice-detail-page">
    <!-- 顶部返回 -->
    <div class="page-nav">
      <button class="back-btn" @click="$router.push('/practice/list')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 5l-7 7 7 7" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        返回列表
      </button>
    </div>

    <div v-if="loading" class="loading-center">
      <el-skeleton :rows="6" animated />
    </div>

    <template v-else-if="task">
      <!-- 任务标题区 -->
      <div class="task-header glass-card">
        <div class="header-top">
          <h2 class="task-name">{{ task.name }}</h2>
          <span class="status-tag" :class="task.status">{{ statusText }}</span>
        </div>
        <div v-if="task.description" class="task-desc">{{ task.description }}</div>
        <div class="time-row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          {{ task.startTime?.slice(0, 10) }} ~ {{ task.endTime?.slice(0, 10) }}
        </div>
      </div>

      <!-- 抽题模式 -->
      <div class="mode-card glass-card">
        <span class="mode-badge" :class="task.questionMode === 'fixed' ? 'fixed' : 'random'">
          {{ task.questionMode === 'fixed' ? '固定题目' : '随机抽题' }}
        </span>
        <p class="mode-desc">
          {{ task.questionMode === 'fixed'
            ? '每次刷题题目相同，适合反复巩固薄弱知识点'
            : `每次从题库随机抽取 ${task.drawCount || ''} 题，适合全面检测掌握情况` }}
        </p>
      </div>

      <!-- 数据指标 -->
      <div class="metrics-grid">
        <div class="metric-card glass-card">
          <div class="metric-value blue">{{ correctRate }}%</div>
          <div class="metric-label">正确率</div>
        </div>
        <div class="metric-card glass-card">
          <div class="metric-value purple">{{ masteredPercent }}%</div>
          <div class="metric-label">掌握比例</div>
        </div>
        <div class="metric-card glass-card">
          <div class="metric-value red">{{ wrongCount }}</div>
          <div class="metric-label">错题数</div>
        </div>
        <div class="metric-card glass-card">
          <div class="metric-value orange">{{ task.practiceDays || 0 }}</div>
          <div class="metric-label">已刷次数</div>
        </div>
      </div>

      <!-- 任务信息 -->
      <div class="info-card glass-card">
        <div class="card-title">任务信息</div>
        <div class="info-list">
          <div class="info-item">
            <span class="info-label">题型范围</span>
            <span class="info-value">{{ questionTypesText }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">完成进度</span>
            <span class="info-value">{{ task.answeredCount || 0 }} / {{ task.totalQuestions }} 题</span>
          </div>
        </div>
        <div class="progress-wrap">
          <div class="progress-bg">
            <div class="progress-fill" :style="{ width: answeredPercent + '%' }"></div>
          </div>
          <span class="progress-pct">{{ answeredPercent }}%</span>
        </div>
      </div>

      <!-- 刷题记录（已结束） -->
      <div v-if="task.status === 'ended' && sessions.length" class="sessions-card glass-card">
        <div class="card-title">刷题记录</div>
        <div
          v-for="(session, idx) in sessions"
          :key="idx"
          class="session-row"
          @click="viewSession(idx)"
        >
          <div class="session-left">
            <span class="session-num">第 {{ idx + 1 }} 次</span>
            <span class="session-date">{{ session.date }}</span>
          </div>
          <div class="session-right">
            <span class="session-rate" :class="getRateClass(session.correctCount, session.totalCount)">
              {{ session.correctCount }}/{{ session.totalCount }}
              （{{ Math.round(session.correctCount / session.totalCount * 100) }}%）
            </span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div v-if="task.status !== 'ended'" class="action-bar">
        <button v-if="task.status === 'not_started'" class="action-btn disabled" disabled>任务未开始</button>
        <button v-else class="action-btn primary" @click="handleStart">
          {{ (task.answeredCount || 0) > 0 ? '继续刷题' : '开始刷题' }}
        </button>
      </div>
    </template>

    <el-empty v-else description="任务不存在" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePracticeStore } from '@/stores/practice'
import { getPracticeSessions } from '@/api/practice'

const route = useRoute()
const router = useRouter()
const store = usePracticeStore()

const loading = ref(true)
const taskId = route.params.id
const sessions = ref([])

const task = computed(() => store.currentTask)

const statusText = computed(() => {
  const map = { not_started: '未开始', in_progress: '进行中', ended: '已结束' }
  return map[task.value?.status] || ''
})

const masteredPercent = computed(() => {
  if (!task.value?.totalQuestions) return 0
  return Math.round(((task.value.masteredCount || 0) / task.value.totalQuestions) * 100)
})
const correctRate = computed(() => {
  if (!task.value?.answeredCount) return 0
  return Math.round(((task.value.correctCount || 0) / task.value.answeredCount) * 100)
})
const wrongCount = computed(() => {
  return (task.value?.answeredCount || 0) - (task.value?.correctCount || 0)
})
const answeredPercent = computed(() => {
  if (!task.value?.totalQuestions) return 0
  return Math.round(((task.value.answeredCount || 0) / task.value.totalQuestions) * 100)
})
const questionTypesText = computed(() => {
  const types = task.value?.questionTypes || []
  const typeMap = { single: '单选', multiple: '多选', judge: '判断', blank: '填空', essay: '简答', cloze: '完形填空', composite: '复合题' }
  return types.map(t => typeMap[t] || t).join('、') || '全部题型'
})

async function loadDetail() {
  loading.value = true
  try {
    await store.fetchTaskDetail(taskId)
    if (task.value?.status === 'ended') {
      sessions.value = await getPracticeSessions(taskId)
    }
  } finally {
    loading.value = false
  }
}

function handleStart() {
  const query = task.value?.questionMode === 'random' && task.value.drawCount
    ? { drawCount: task.value.drawCount }
    : {}
  router.push({ path: `/practice/answer/${taskId}`, query })
}

function viewSession(sessionIndex) {
  router.push({ path: `/practice/answer/${taskId}`, query: { mode: 'review', session: String(sessionIndex) } })
}

function getRateClass(correct, total) {
  const rate = correct / total
  if (rate >= 0.8) return 'rate-good'
  if (rate >= 0.6) return 'rate-mid'
  return 'rate-bad'
}

onMounted(loadDetail)
</script>

<style scoped>
.practice-detail-page { max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; gap: 12px; }

.page-nav { margin-bottom: 4px; }
.back-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border: none; background: rgba(255,255,255,0.8); backdrop-filter: blur(10px); border-radius: 10px; font-size: 14px; color: #1d1d1f; cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.back-btn:hover { background: rgba(255,255,255,0.95); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.back-btn svg { width: 16px; height: 16px; }

.glass-card { background: rgba(255,255,255,0.8); backdrop-filter: blur(10px); border-radius: 14px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.loading-center { padding: 40px; }

.task-header { display: flex; flex-direction: column; gap: 10px; }
.header-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.task-name { font-size: 20px; font-weight: 600; color: #1d1d1f; margin: 0; }
.status-tag { padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; flex-shrink: 0; }
.status-tag.in_progress { background: rgba(234,88,12,0.1); color: #ea580c; }
.status-tag.not_started { background: rgba(102,126,234,0.12); color: #667eea; }
.status-tag.ended { background: rgba(142,142,147,0.12); color: #8e8e93; }
.time-row { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #86868b; }
.time-row svg { width: 14px; height: 14px; flex-shrink: 0; }
.task-desc { font-size: 13px; color: #6e6e73; line-height: 1.6; margin: 0; }

.mode-card { display: flex; flex-direction: column; gap: 8px; }
.mode-badge { display: inline-block; align-self: flex-start; font-size: 12px; font-weight: 500; padding: 3px 10px; border-radius: 6px; }
.mode-badge.fixed { background: rgba(37,99,235,0.1); color: #2563EB; }
.mode-badge.random { background: rgba(102,126,234,0.12); color: #667eea; }
.mode-desc { font-size: 13px; color: #6e6e73; line-height: 1.6; margin: 0; }

.metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.metric-card { text-align: center; padding: 16px 12px; }
.metric-value { font-size: 26px; font-weight: 700; line-height: 1.2; margin-bottom: 4px; }
.metric-value.blue { color: #2563EB; }
.metric-value.purple { color: #667eea; }
.metric-value.red { color: #ff3b30; }
.metric-value.orange { color: #ff9500; }
.metric-label { font-size: 12px; color: #86868b; }

.card-title { font-size: 15px; font-weight: 600; color: #1d1d1f; margin-bottom: 14px; }
.info-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 14px; }
.info-item { display: flex; justify-content: space-between; font-size: 14px; }
.info-label { color: #86868b; }
.info-value { color: #1d1d1f; font-weight: 500; }
.progress-wrap { display: flex; align-items: center; gap: 10px; }
.progress-bg { flex: 1; height: 6px; background: #f2f2f7; border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #2563EB, #3B82F6); border-radius: 3px; transition: width 0.3s; }
.progress-pct { font-size: 12px; font-weight: 600; color: #2563EB; min-width: 36px; text-align: right; }

.session-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.04); cursor: pointer; }
.session-row:last-child { border-bottom: none; }
.session-left { display: flex; flex-direction: column; gap: 3px; }
.session-num { font-size: 14px; font-weight: 500; color: #1d1d1f; }
.session-date { font-size: 12px; color: #86868b; }
.session-right { display: flex; align-items: center; gap: 6px; }
.session-right svg { width: 14px; height: 14px; color: #c7c7cc; }
.session-rate { font-size: 13px; font-weight: 500; }
.rate-good { color: #2563EB; }
.rate-mid { color: #ff9500; }
.rate-bad { color: #ff3b30; }

.action-bar { padding: 4px 0 8px; }
.action-btn { width: 100%; padding: 14px; border: none; border-radius: 12px; font-size: 15px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.action-btn.primary { background: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%); color: #fff; box-shadow: 0 4px 12px rgba(37,99,235,0.35); }
.action-btn.primary:hover { box-shadow: 0 6px 16px rgba(37,99,235,0.45); transform: translateY(-1px); }
.action-btn.disabled { background: #f2f2f7; color: #c7c7cc; cursor: not-allowed; }
</style>
