<template>
  <div class="exam-list-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>我的考试</h1>
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
      <div v-for="i in 4" :key="i" class="skeleton-row">
        <el-skeleton animated>
          <template #template>
            <div class="skeleton-card">
              <el-skeleton-item variant="circle" style="width: 44px; height: 44px" />
              <div class="skeleton-content">
                <el-skeleton-item variant="h3" style="width: 200px" />
                <el-skeleton-item variant="text" style="width: 300px; margin-top: 8px" />
              </div>
            </div>
          </template>
        </el-skeleton>
      </div>
    </div>

    <!-- 考试列表 -->
    <div v-else-if="filteredList.length" class="exam-list">
      <div
        v-for="exam in filteredList"
        :key="exam.id"
        class="exam-row"
        @click="goToDetail(exam)"
      >
        <!-- 左侧图标 - 统一考试图标 -->
        <div class="row-icon" :class="exam.status">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <path d="M9 12h6M9 16h6" stroke-linecap="round" />
          </svg>
        </div>

        <!-- 主内容 -->
        <div class="row-main">
          <div class="row-header">
            <h3 class="exam-name">{{ exam.name }}</h3>
            <span class="status-tag" :class="exam.status">{{ getStatusText(exam.status) }}</span>
          </div>
          <div class="row-sub">
            <span class="paper-name">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
              {{ exam.paper?.name }}
              <span class="divider">|</span>
              <svg v-if="exam.paper?.mode === 'document'" class="mode-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <svg v-else class="mode-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              <span class="mode-label">{{ exam.paper?.mode === 'document' ? '文档' : '抽题' }}</span>
            </span>
          </div>
          <div class="row-meta">
            <span class="meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" stroke-linecap="round" />
              </svg>
              {{ exam.duration }}分钟
            </span>
            <span class="meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
              </svg>
              {{ exam.paper?.questionCount }}题
            </span>
            <span class="meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8M12 8v8" stroke-linecap="round" />
              </svg>
              {{ exam.totalScore }}分
            </span>
            <span class="meta-item time">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              {{ formatTimeRange(exam.startTime, exam.endTime) }}
            </span>
          </div>
        </div>

        <!-- 右侧操作区 -->
        <div class="row-action">
          <template v-if="exam.status === 'in_progress'">
            <button class="action-btn primary" @click.stop="enterExam(exam)">
              {{ exam.myStatus === 'not_started' ? '开始' : '继续' }}
            </button>
          </template>
          <template v-else-if="exam.status === 'not_started'">
            <div class="countdown">
              <span class="countdown-label">距开始</span>
              <span class="countdown-value">{{ getCountdown(exam.startTime) }}</span>
              <span v-if="exam.config?.allowEarlyEntry" class="early-hint">
                提前{{ exam.config.earlyMinutes }}分钟进入
              </span>
            </div>
            <button
              v-if="canEarlyEnter(exam)"
              class="action-btn primary"
              @click.stop="enterExam(exam)"
            >
              提前进入
            </button>
          </template>
          <template v-else-if="exam.myStatus === 'submitted'">
            <div class="score-display">
              <span class="score-num">{{ exam.score }}</span>
              <span class="score-total">/ {{ exam.totalScore }}</span>
            </div>
          </template>
          <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="#c0c4cc" stroke-width="1.5">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h6" stroke-linecap="round" />
      </svg>
      <p>暂无考试</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useExamStore } from '@/stores/exam'
import { Search } from '@element-plus/icons-vue'

const router = useRouter()
const examStore = useExamStore()

const loading = ref(false)
const statusFilter = ref('all')
const searchKeyword = ref('')

const tabs = computed(() => [
  { value: 'all', label: '全部', count: examStore.examList.length },
  { value: 'in_progress', label: '进行中', count: examStore.examList.filter(e => e.status === 'in_progress').length },
  { value: 'not_started', label: '未开始', count: examStore.examList.filter(e => e.status === 'not_started').length },
  { value: 'ended', label: '已结束', count: examStore.examList.filter(e => e.status === 'ended').length },
])

const filteredList = computed(() => {
  let list = [...examStore.examList]
  if (statusFilter.value !== 'all') {
    list = list.filter(e => e.status === statusFilter.value)
  }
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    list = list.filter(e => e.name.toLowerCase().includes(kw))
  }
  return list.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
})

onMounted(async () => {
  loading.value = true
  await examStore.fetchExamList()
  loading.value = false
})

function goToDetail(exam) {
  router.push(`/exam/detail/${exam.id}`)
}

function enterExam(exam) {
  if (exam.config?.enableFaceRecognition && !examStore.isFaceVerified(exam.id)) {
    router.push(`/exam/face-verify/${exam.id}`)
  } else {
    const mode = exam.paper?.mode
    router.push(mode === 'document' ? `/exam/answer-doc/${exam.id}` : `/exam/answer/${exam.id}`)
  }
}

function getStatusText(status) {
  const map = { not_started: '未开始', in_progress: '进行中', ended: '已结束' }
  return map[status] || status
}

function formatTimeRange(start, end) {
  const s = new Date(start)
  const e = new Date(end)
  const sDate = `${s.getMonth() + 1}月${s.getDate()}日`
  const eDate = `${e.getMonth() + 1}月${e.getDate()}日`
  const sTime = `${String(s.getHours()).padStart(2, '0')}:${String(s.getMinutes()).padStart(2, '0')}`
  const eTime = `${String(e.getHours()).padStart(2, '0')}:${String(e.getMinutes()).padStart(2, '0')}`

  if (sDate === eDate) {
    return `${sDate} ${sTime}-${eTime}`
  }
  return `${sDate} ${sTime} - ${eDate} ${eTime}`
}

function getCountdown(startTime) {
  const now = Date.now()
  const start = new Date(startTime).getTime()
  const diff = start - now
  if (diff <= 0) return '即将开始'
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))
  if (days > 0) return `${days}天${hours}时`
  if (hours > 0) return `${hours}时${minutes}分`
  return `${minutes}分钟`
}

function canEarlyEnter(exam) {
  if (!exam.config?.allowEarlyEntry) return false
  const now = Date.now()
  const start = new Date(exam.startTime).getTime()
  const earlyMs = exam.config.earlyMinutes * 60 * 1000
  return now >= start - earlyMs && now < start
}
</script>

<style scoped>
.exam-list-page {
  max-width: 960px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 22px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.filter-tabs {
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  padding: 3px;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.tab-item {
  padding: 7px 16px;
  font-size: 13px;
  color: #86868b;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tab-item:hover {
  color: #1d1d1f;
}

.tab-item.active {
  background: #fff;
  color: #1d1d1f;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.tab-count {
  font-size: 11px;
  background: rgba(0, 0, 0, 0.06);
  padding: 2px 6px;
  border-radius: 10px;
}

.tab-item.active .tab-count {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.search-input {
  width: 200px;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

/* Loading */
.skeleton-row {
  margin-bottom: 12px;
}

.skeleton-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 14px;
}

.skeleton-content {
  flex: 1;
}

/* Exam List */
.exam-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.exam-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.exam-row:hover {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.exam-row:active {
  transform: scale(0.995);
}

/* Row Icon - 统一考试图标 */
.row-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: linear-gradient(135deg, #00B96B 0%, #00D68F 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 185, 107, 0.3);
}

.row-icon svg {
  width: 22px;
  height: 22px;
}

/* Row Main */
.row-main {
  flex: 1;
  min-width: 0;
}

.row-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.exam-name {
  font-size: 15px;
  font-weight: 500;
  color: #1d1d1f;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
  flex-shrink: 0;
}

.status-tag.in_progress {
  background: rgba(52, 199, 89, 0.12);
  color: #34c759;
}

.status-tag.not_started {
  background: rgba(102, 126, 234, 0.12);
  color: #667eea;
}

.status-tag.ended {
  background: rgba(142, 142, 147, 0.12);
  color: #8e8e93;
}

.mode-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
  background: rgba(0, 185, 107, 0.12);
  color: #00B96B;
}

.row-sub {
  margin-bottom: 6px;
}

.paper-name {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #6e6e73;
}

.paper-name svg {
  width: 14px;
  height: 14px;
}

.paper-name .divider {
  color: #c7c7cc;
  margin: 0 6px;
}

.paper-name .mode-icon {
  width: 13px;
  height: 13px;
  margin-right: 3px;
}

.paper-name .mode-label {
  color: #86868b;
}

.row-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #86868b;
}

.meta-item svg {
  width: 14px;
  height: 14px;
  stroke-width: 1.5;
}

.meta-item.time {
  color: #6e6e73;
}

/* Row Action */
.row-action {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.action-btn {
  padding: 8px 20px;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  background: linear-gradient(135deg, #00B96B 0%, #00D68F 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 185, 107, 0.35);
}

.action-btn.primary:hover {
  box-shadow: 0 6px 16px rgba(0, 185, 107, 0.45);
  transform: translateY(-1px);
}

.action-btn.primary:active {
  transform: scale(0.96);
}

.countdown {
  text-align: right;
}

.countdown-label {
  display: block;
  font-size: 11px;
  color: #86868b;
}

.countdown-value {
  font-size: 15px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.early-hint {
  display: block;
  font-size: 11px;
  color: #00B96B;
  margin-top: 2px;
}

.score-display {
  text-align: right;
}

.score-num {
  font-size: 20px;
  font-weight: 600;
  color: #34c759;
}

.score-total {
  font-size: 13px;
  color: #86868b;
}

.arrow-icon {
  width: 20px;
  height: 20px;
  color: #c7c7cc;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 0;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
}

.empty-state p {
  color: #86868b;
  font-size: 15px;
}
</style>
