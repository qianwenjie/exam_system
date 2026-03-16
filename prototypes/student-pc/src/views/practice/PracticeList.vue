<template>
  <div class="practice-list-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>刷题练习</h1>
      <div class="header-actions">
        <el-button text @click="$router.push('/practice/wrong-book')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:16px;height:16px;margin-right:4px">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          错题本
          <span v-if="totalWrongCount" class="badge">{{ totalWrongCount }}</span>
        </el-button>
        <el-button text @click="$router.push('/practice/favorites')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:16px;height:16px;margin-right:4px">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
          收藏夹
        </el-button>
        <el-button text @click="$router.push('/stats/practice')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:16px;height:16px;margin-right:4px">
            <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          统计
        </el-button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-tabs">
        <div
          v-for="tab in tabs"
          :key="tab.value"
          class="tab-item"
          :class="{ active: statusFilter === tab.value }"
          @click="statusFilter = tab.value"
        >
          {{ tab.label }}
          <span v-if="tab.count" class="tab-count">{{ tab.count }}</span>
        </div>
      </div>
      <el-input
        v-model="searchKeyword"
        placeholder="搜索"
        :prefix-icon="Search"
        clearable
        class="search-input"
      />
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-wrapper">
      <div v-for="i in 3" :key="i" class="skeleton-row">
        <el-skeleton animated>
          <template #template>
            <div class="skeleton-card">
              <el-skeleton-item variant="circle" style="width:44px;height:44px" />
              <div class="skeleton-content">
                <el-skeleton-item variant="h3" style="width:200px" />
                <el-skeleton-item variant="text" style="width:300px;margin-top:8px" />
              </div>
            </div>
          </template>
        </el-skeleton>
      </div>
    </div>

    <!-- 任务列表 -->
    <div v-else-if="filteredList.length" class="task-list">
      <div
        v-for="task in filteredList"
        :key="task.id"
        class="task-row"
        @click="goToDetail(task)"
      >
        <!-- 左侧图标 -->
        <div class="row-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 20h9" stroke-linecap="round" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </div>

        <!-- 主内容 -->
        <div class="row-main">
          <div class="row-header">
            <h3 class="task-name">{{ task.name }}</h3>
            <span class="status-tag" :class="task.status">{{ getStatusText(task.status) }}</span>
          </div>
          <div class="row-meta">
            <span class="meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:13px;height:13px">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {{ task.startTime?.slice(0, 10) }} ~ {{ task.endTime?.slice(0, 10) }}
            </span>
            <span class="meta-item mode-tag">
              {{ task.questionMode === 'random' ? '随机抽题' : '固定题目' }}
            </span>
          </div>
          <!-- 进度条 -->
          <div class="progress-row">
            <div class="progress-bar-wrap">
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" :style="{ width: progressPercent(task) + '%' }"></div>
              </div>
              <span class="progress-text">{{ task.answeredCount || 0 }}/{{ task.totalQuestions }}</span>
            </div>
            <div class="stats-row">
              <span class="stat-item correct">正确率 {{ correctRate(task) }}%</span>
              <span class="stat-item mastered">掌握度 {{ masteredRate(task) }}%</span>
            </div>
          </div>
        </div>

        <!-- 右侧操作 -->
        <div class="row-action" @click.stop>
          <button v-if="task.status === 'not_started'" class="action-btn primary" @click="startPractice(task)">开始</button>
          <button v-else-if="task.status === 'in_progress'" class="action-btn primary" @click="startPractice(task)">继续</button>
          <button v-else class="action-btn disabled" disabled>已结束</button>
          <svg class="row-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty v-else description="暂无刷题任务" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePracticeStore } from '@/stores/practice'
import { Search } from '@element-plus/icons-vue'

const router = useRouter()
const store = usePracticeStore()

const statusFilter = ref('all')
const searchKeyword = ref('')

const tabs = computed(() => [
  { label: '全部', value: 'all', count: store.taskList.length },
  { label: '进行中', value: 'in_progress', count: store.taskList.filter(t => t.status === 'in_progress').length },
  { label: '未开始', value: 'not_started', count: store.taskList.filter(t => t.status === 'not_started').length },
  { label: '已结束', value: 'ended', count: store.taskList.filter(t => t.status === 'ended').length },
])

const loading = computed(() => store.loading)
const totalWrongCount = computed(() => store.totalWrongCount)

const filteredList = computed(() => {
  let list = store.taskList
  if (statusFilter.value !== 'all') {
    list = list.filter(t => t.status === statusFilter.value)
  }
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    list = list.filter(t => t.name.toLowerCase().includes(kw))
  }
  return list
})

function getStatusText(status) {
  const map = { in_progress: '进行中', not_started: '未开始', ended: '已结束' }
  return map[status] || status
}

function progressPercent(task) {
  if (!task.totalQuestions) return 0
  return Math.round(((task.answeredCount || 0) / task.totalQuestions) * 100)
}

function correctRate(task) {
  if (!task.answeredCount) return 0
  return Math.round(((task.correctCount || 0) / task.answeredCount) * 100)
}

function masteredRate(task) {
  if (!task.totalQuestions) return 0
  return Math.round(((task.masteredCount || 0) / task.totalQuestions) * 100)
}

function goToDetail(task) {
  router.push(`/practice/detail/${task.id}`)
}

function startPractice(task) {
  if (task.questionMode === 'random' && task.drawCount) {
    router.push(`/practice/answer/${task.id}?drawCount=${task.drawCount}`)
  } else {
    router.push(`/practice/answer/${task.id}`)
  }
}

onMounted(() => {
  store.fetchTaskList()
  store.loadWrongBook()
})
</script>

<style scoped>
.practice-list-page { max-width: 960px; margin: 0 auto; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.page-header h1 { font-size: 22px; font-weight: 600; color: #1d1d1f; margin: 0; }
.header-actions { display: flex; gap: 4px; align-items: center; }
.badge { display: inline-flex; align-items: center; justify-content: center; min-width: 18px; height: 18px; padding: 0 4px; background: #ff3b30; color: #fff; border-radius: 9px; font-size: 11px; font-weight: 600; margin-left: 4px; }

/* Filter Bar - 对齐考试列表风格 */
.filter-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.filter-tabs { display: flex; gap: 4px; background: rgba(255,255,255,0.8); backdrop-filter: blur(10px); padding: 3px; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.tab-item { padding: 7px 16px; border-radius: 8px; font-size: 13px; color: #86868b; cursor: pointer; transition: all 0.2s; }
.tab-item:hover { color: #1d1d1f; }
.tab-item.active { background: #fff; color: #1d1d1f; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.tab-count { font-size: 11px; background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 10px; }
.tab-item.active .tab-count { background: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%); color: #fff; }
.search-input { width: 200px; }
.search-input :deep(.el-input__wrapper) { border-radius: 10px; background: rgba(255,255,255,0.8); backdrop-filter: blur(10px); box-shadow: 0 1px 3px rgba(0,0,0,0.04); }

.task-list { display: flex; flex-direction: column; gap: 10px; }
.task-row { display: flex; align-items: center; gap: 16px; background: rgba(255,255,255,0.75); backdrop-filter: blur(10px); border-radius: 14px; padding: 16px 20px; cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.task-row:hover { background: rgba(255,255,255,0.95); box-shadow: 0 4px 12px rgba(0,0,0,0.08); transform: translateY(-1px); }

/* 图标统一蓝色 */
.row-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%); box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
.row-icon svg { width: 22px; height: 22px; stroke: #fff; }

.row-main { flex: 1; min-width: 0; }
.row-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.task-name { font-size: 15px; font-weight: 500; color: #1d1d1f; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.status-tag { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; flex-shrink: 0; }
.status-tag.in_progress { background: rgba(234,88,12,0.1); color: #ea580c; }
.status-tag.not_started { background: rgba(102,126,234,0.12); color: #667eea; }
.status-tag.ended { background: rgba(142,142,147,0.12); color: #8e8e93; }
.row-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.meta-item { display: flex; align-items: center; gap: 4px; font-size: 13px; color: #86868b; }
.mode-tag { background: rgba(0,0,0,0.04); padding: 2px 8px; border-radius: 6px; }
.progress-row { display: flex; flex-direction: column; gap: 6px; }
.progress-bar-wrap { display: flex; align-items: center; gap: 10px; }
.progress-bar-bg { flex: 1; height: 6px; background: #f2f2f7; border-radius: 3px; overflow: hidden; }
.progress-bar-fill { height: 100%; background: linear-gradient(90deg, #2563EB, #3B82F6); border-radius: 3px; transition: width 0.3s; }
.progress-text { font-size: 12px; color: #86868b; white-space: nowrap; }
.stats-row { display: flex; gap: 16px; }
.stat-item { font-size: 12px; }
.stat-item.correct { color: #2563EB; }
.stat-item.mastered { color: #667eea; }

/* 右侧操作 */
.row-action { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.action-btn { padding: 8px 20px; border: none; border-radius: 20px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.action-btn.primary { background: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%); color: #fff; box-shadow: 0 4px 12px rgba(37,99,235,0.35); }
.action-btn.primary:hover { box-shadow: 0 6px 16px rgba(37,99,235,0.45); transform: translateY(-1px); }
.action-btn.primary:active { transform: scale(0.96); }
.action-btn.disabled { background: #f2f2f7; color: #c7c7cc; cursor: not-allowed; }
.row-arrow { width: 16px; height: 16px; color: #c7c7cc; }

.skeleton-row { margin-bottom: 12px; }
.skeleton-card { display: flex; align-items: center; gap: 16px; padding: 20px; background: rgba(255,255,255,0.8); border-radius: 16px; }
.skeleton-content { flex: 1; }
</style>
