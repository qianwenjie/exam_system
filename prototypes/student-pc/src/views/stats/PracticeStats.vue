<template>
  <div class="practice-stats-page">    <!-- 总览卡片 -->
    <div class="overview-card">
      <div class="overview-top">
        <div class="overview-item">
          <div class="ov-value">{{ totalAnswered }}</div>
          <div class="ov-label">累计答题</div>
        </div>
        <div class="overview-divider"></div>
        <div class="overview-item">
          <div class="ov-value">{{ totalCorrect }}</div>
          <div class="ov-label">答对题数</div>
        </div>
        <div class="overview-divider"></div>
        <div class="overview-item">
          <div class="ov-value ov-wrong">{{ totalWrong }}</div>
          <div class="ov-label">错题数</div>
        </div>
        <div class="overview-divider"></div>
        <div class="overview-item">
          <div class="ov-value ov-mastered">{{ totalMastered }}</div>
          <div class="ov-label">已掌握</div>
        </div>
      </div>
      <div class="overview-bottom">
        <div class="accuracy-row">
          <span class="accuracy-label">综合正确率</span>
          <span class="accuracy-value">{{ overallAccuracy }}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: overallAccuracy + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- 三格统计 -->
    <div class="stat-row">
      <div class="stat-card">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="stat-icon blue">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <div class="stat-num">{{ totalDays }}</div>
        <div class="stat-desc">累计刷题天数</div>
      </div>
      <div class="stat-card">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="stat-icon green">
          <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
        <div class="stat-num">{{ tasks.length }}</div>
        <div class="stat-desc">参与任务数</div>
      </div>
      <div class="stat-card">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="stat-icon orange">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke-width="0" fill="currentColor" opacity="0.15"/>
          <path d="M13 2.05V4.1A8 8 0 0 1 20 12h2c0-5.18-3.95-9.45-9-9.95z" fill="currentColor"/>
          <circle cx="12" cy="12" r="3" fill="currentColor"/>
        </svg>
        <div class="stat-num">{{ todayTotal }}</div>
        <div class="stat-desc">今日答题数</div>
      </div>
    </div>

    <!-- 薄弱题型分析 -->
    <div class="section">
      <div class="section-title">薄弱题型分析</div>
      <div v-if="weakTypeStats.length === 0" class="empty-tip">暂无错题数据</div>
      <div v-else class="weak-panel">
        <div class="wp-header">
          <span class="wtc-badge">最薄弱</span>
          <span class="wp-top-type">{{ weakTypeStats[0].label }}</span>
          <span class="wp-top-rate">错题率 {{ weakTypeStats[0].wrongRate }}%</span>
        </div>
        <div class="wp-divider"></div>
        <div class="type-list">
          <div v-for="t in weakTypeStats" :key="t.type" class="type-list-row">
            <span class="tl-name">{{ t.label }}</span>
            <span class="tl-stat">共 <b>{{ t.total }}</b> 道</span>
            <span class="tl-stat">错 <b>{{ t.count }}</b> 道</span>
            <span class="tl-rate">错题率 <b>{{ t.wrongRate }}%</b></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 待重做错题（按任务） -->
    <div class="section">
      <div class="section-header">
        <div class="section-title">待重做错题</div>
        <span class="section-link" @click="$router.push('/practice/wrong-book')">
          错题本
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px"><path d="M9 18l6-6-6-6" stroke-linecap="round"/></svg>
        </span>
      </div>
      <div v-if="pendingByTask.length === 0" class="empty-tip">太棒了，暂无待复习错题！</div>
      <div v-else class="task-wrong-list">
        <div v-for="t in pendingByTask" :key="t.taskId" class="task-wrong-row"
          @click="$router.push(`/practice/wrong-book/review/${t.taskId}`)">
          <div class="twr-left">
            <div class="twr-name">{{ t.taskName }}</div>
            <div class="twr-sub">{{ t.wrongCount }} 道未重做</div>
          </div>
          <div class="twr-right">
            <span class="twr-badge">{{ t.wrongCount }}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;color:#c9cdd4"><path d="M9 18l6-6-6-6" stroke-linecap="round"/></svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 已掌握 & 收藏 -->
    <div class="section">
      <div class="bottom-stat-row">
        <div class="bottom-stat-card" @click="$router.push('/practice/wrong-book')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="bsc-icon green">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>
          </svg>
          <div class="bsc-num text-green">{{ store.totalMasteredWrongCount }}</div>
          <div class="bsc-label">已掌握错题</div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="bsc-arrow"><path d="M9 18l6-6-6-6" stroke-linecap="round"/></svg>
        </div>
        <div class="bottom-stat-card" @click="$router.push('/practice/favorites')">
          <svg viewBox="0 0 24 24" fill="currentColor" class="bsc-icon orange">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
          </svg>

          <div class="bsc-num text-orange">{{ store.favorites.length }}</div>
          <div class="bsc-label">收藏题目</div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="bsc-arrow"><path d="M9 18l6-6-6-6" stroke-linecap="round"/></svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { usePracticeStore } from '@/stores/practice'

const store = usePracticeStore()

onMounted(async () => {
  await store.fetchTaskList()
  store.loadWrongBook()
  store.loadFavorites()
})

const tasks = computed(() => store.taskList || [])

// 总览数据
const totalAnswered = computed(() => tasks.value.reduce((s, t) => s + (t.answeredCount || 0), 0))
const totalCorrect = computed(() => tasks.value.reduce((s, t) => s + (t.correctCount || 0), 0))
const totalWrong = computed(() => totalAnswered.value - totalCorrect.value)
const totalMastered = computed(() => tasks.value.reduce((s, t) => s + (t.masteredCount || 0), 0))
const overallAccuracy = computed(() =>
  totalAnswered.value > 0 ? Math.round(totalCorrect.value / totalAnswered.value * 100) : 0
)
const totalDays = computed(() => tasks.value.reduce((s, t) => s + (t.practiceDays || 0), 0))
const todayTotal = computed(() => tasks.value.reduce((s, t) => s + (t.todayCount || 0), 0))

// 题型配置
const typeMap = {
  single: '单选题', multiple: '多选题', judge: '判断题',
  blank: '填空题', essay: '简答题', cloze: '完形填空', composite: '复合题',
}
const mockTotalByType = { single: 30, multiple: 15, judge: 20, blank: 10, essay: 8, cloze: 5, composite: 4 }

// 薄弱题型分析
const weakTypeStats = computed(() => {
  const wb = store.wrongBook || {}
  const typeCount = {}
  Object.values(wb).forEach(item => {
    if (item.mastered) return
    const type = item.question?.type
    if (!type) return
    typeCount[type] = (typeCount[type] || 0) + 1
  })
  if (Object.keys(typeCount).length === 0) return []
  return Object.entries(typeCount)
    .map(([type, count]) => {
      const total = mockTotalByType[type] || count * 3
      return { type, label: typeMap[type] || type, count, total, wrongRate: Math.round(count / total * 100) }
    })
    .sort((a, b) => b.wrongRate - a.wrongRate)
})

// 待重做错题：按任务分组
const pendingByTask = computed(() => {
  const wb = store.wrongBook || {}
  const taskMap = {}
  Object.values(wb).forEach(item => {
    if (item.mastered) return
    const tid = item.sourceTaskId
    if (!taskMap[tid]) taskMap[tid] = { taskId: tid, taskName: item.sourceTaskName || tid, wrongCount: 0 }
    taskMap[tid].wrongCount++
  })
  return Object.values(taskMap).sort((a, b) => b.wrongCount - a.wrongCount)
})
</script>

<style scoped>
.practice-stats-page { padding-bottom: 32px; }

.page-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
.page-header h1 { font-size: 24px; font-weight: 600; color: #1d1d1f; margin: 0; }
.back-btn { width: 32px; height: 32px; border: none; background: rgba(0,0,0,0.04); border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #1d1d1f; transition: background 0.2s; flex-shrink: 0; }
.back-btn:hover { background: rgba(0,0,0,0.08); }

/* 总览卡片 */
.overview-card { background: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%); border-radius: 20px; padding: 24px 28px 20px; margin-bottom: 16px; box-shadow: 0 4px 20px rgba(37,99,235,0.25); }
.overview-top { display: flex; align-items: center; margin-bottom: 20px; }
.overview-item { flex: 1; text-align: center; }
.ov-value { font-size: 26px; font-weight: 700; color: #fff; line-height: 1.2; }
.ov-wrong { color: #FDE68A; }
.ov-mastered { color: #A7F3D0; }
.ov-label { font-size: 12px; color: rgba(255,255,255,0.8); margin-top: 4px; }
.overview-divider { width: 1px; height: 40px; background: rgba(255,255,255,0.25); }
.overview-bottom { }
.accuracy-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.accuracy-label { font-size: 13px; color: rgba(255,255,255,0.85); }
.accuracy-value { font-size: 15px; font-weight: 700; color: #fff; }
.progress-track { height: 8px; background: rgba(255,255,255,0.25); border-radius: 4px; overflow: hidden; }
.progress-fill { height: 100%; background: #fff; border-radius: 4px; transition: width 0.6s ease; }

/* 三格统计 */
.stat-row { display: flex; gap: 12px; margin-bottom: 16px; }
.stat-card { flex: 1; background: #fff; border: 1px solid rgba(0,0,0,0.06); border-radius: 14px; padding: 16px 10px; text-align: center; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
.stat-icon { width: 24px; height: 24px; margin: 0 auto 8px; display: block; }
.stat-icon.blue { color: #2563EB; }
.stat-icon.green { color: #34C759; }
.stat-icon.orange { color: #FF9500; }
.stat-num { font-size: 22px; font-weight: 700; color: #1d1d1f; }
.stat-desc { font-size: 11px; color: #86868b; margin-top: 3px; }

/* 通用 section */
.section { margin-bottom: 16px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.section-title { font-size: 15px; font-weight: 600; color: #1d1d1f; margin-bottom: 10px; }
.section-header .section-title { margin-bottom: 0; }
.section-link { font-size: 13px; color: #2563EB; display: flex; align-items: center; gap: 2px; cursor: pointer; }

/* 薄弱题型面板 */
.weak-panel { background: #fff; border: 1px solid rgba(0,0,0,0.06); border-radius: 14px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
.wp-header { display: flex; align-items: center; gap: 8px; padding: 14px 18px; }
.wtc-badge { font-size: 11px; color: #ff3b30; background: #fff1f0; border: 1px solid #ffccc7; padding: 2px 8px; border-radius: 10px; flex-shrink: 0; }
.wp-top-type { font-size: 14px; font-weight: 600; color: #1d1d1f; }
.wp-top-rate { font-size: 13px; color: #86868b; margin-left: auto; }
.wp-divider { height: 1px; background: #f2f2f7; }
.type-list { padding: 4px 0; }
.type-list-row { display: flex; align-items: center; padding: 11px 18px; border-bottom: 1px solid #f2f2f7; }
.type-list-row:last-child { border-bottom: none; }
.tl-name { font-size: 13px; color: #1d1d1f; width: 64px; flex-shrink: 0; }
.tl-stat { font-size: 12px; color: #86868b; flex: 1; }
.tl-stat b { color: #1d1d1f; font-weight: 600; }
.tl-rate { font-size: 12px; color: #86868b; flex-shrink: 0; }
.tl-rate b { color: #ff3b30; font-weight: 600; }

/* 待重做错题 */
.task-wrong-list { background: #fff; border: 1px solid rgba(0,0,0,0.06); border-radius: 14px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
.task-wrong-row { display: flex; align-items: center; padding: 14px 18px; border-bottom: 1px solid #f2f2f7; cursor: pointer; transition: background 0.15s; }
.task-wrong-row:last-child { border-bottom: none; }
.task-wrong-row:hover { background: #f9f9fb; }
.twr-left { flex: 1; }
.twr-name { font-size: 14px; font-weight: 500; color: #1d1d1f; margin-bottom: 3px; }
.twr-sub { font-size: 12px; color: #86868b; }
.twr-right { display: flex; align-items: center; gap: 8px; }
.twr-badge { background: #ff3b30; color: #fff; font-size: 12px; font-weight: 600; min-width: 22px; height: 22px; border-radius: 11px; display: flex; align-items: center; justify-content: center; padding: 0 6px; }

/* 已掌握 & 收藏 */
.bottom-stat-row { display: flex; gap: 12px; }
.bottom-stat-card { flex: 1; background: #fff; border: 1px solid rgba(0,0,0,0.06); border-radius: 14px; padding: 20px 16px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 1px 4px rgba(0,0,0,0.04); cursor: pointer; position: relative; transition: all 0.2s; }
.bottom-stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
.bsc-icon { width: 28px; height: 28px; margin-bottom: 8px; }
.bsc-icon.green { color: #34C759; }
.bsc-icon.orange { color: #FF9500; }
.bsc-num { font-size: 26px; font-weight: 700; line-height: 1.2; }
.text-green { color: #34C759; }
.text-orange { color: #FF9500; }
.bsc-label { font-size: 12px; color: #86868b; margin-top: 4px; }
.bsc-arrow { position: absolute; right: 12px; top: 12px; width: 14px; height: 14px; color: #c7c7cc; }

/* 空状态 */
.empty-tip { text-align: center; font-size: 13px; color: #86868b; padding: 20px 0; background: #fff; border: 1px solid rgba(0,0,0,0.06); border-radius: 14px; }
</style>
