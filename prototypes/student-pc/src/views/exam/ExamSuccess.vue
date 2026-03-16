<template>
  <div class="exam-success-page">
    <!-- 原型配置工具条 -->
    <div class="proto-toolbar" :class="{ collapsed: toolbarCollapsed }" @click="toolbarCollapsed && (toolbarCollapsed = false)">
      <template v-if="!toolbarCollapsed">
        <div class="proto-header">
          <span class="proto-label">🔧 原型演示配置</span>
          <span class="proto-collapse" @click.stop="toolbarCollapsed = true">收起 ∧</span>
        </div>
        <div class="proto-group">
          <span class="proto-group-label">公布时机</span>
          <div class="proto-btns">
            <span v-for="m in publishModes" :key="m.value"
              class="proto-btn" :class="{ active: publishMode === m.value }"
              @click="publishMode = m.value">{{ m.label }}</span>
          </div>
        </div>
        <div class="proto-group">
          <span class="proto-group-label">公布内容</span>
          <div class="proto-btns">
            <span v-for="c in publishContents" :key="c.value"
              class="proto-btn" :class="{ active: publishContent === c.value }"
              @click="publishContent = c.value">{{ c.label }}</span>
          </div>
        </div>
      </template>
      <div v-else class="proto-collapsed-icon" @click="toolbarCollapsed = false">
        <el-icon><Setting /></el-icon>
        <span>配置</span>
      </div>
    </div>

    <!-- 主内容 -->
    <div class="success-card">
      <!-- 提交成功区域 -->
      <div class="success-header">
        <el-icon v-if="!isEndedView" :size="64" color="#00B96B"><CircleCheckFilled /></el-icon>
        <el-icon v-else :size="64" color="#909399"><Clock /></el-icon>
        <h1>{{ isEndedView ? '考试已结束' : '提交成功' }}</h1>
      </div>
      <div class="info-list">
        <div class="info-row"><span>考试名称</span><strong>{{ result.examName }}</strong></div>
        <div class="info-row"><span>提交时间</span><strong>{{ result.submitTime }}</strong></div>
        <div class="info-row"><span>答题用时</span><strong>{{ formatDuration(result.duration) }}</strong></div>
      </div>

      <!-- 成绩未公布 -->
      <div v-if="!isPublished" class="pending-section">
        <el-icon :size="48" color="#c0c4cc"><Clock /></el-icon>
        <p class="pending-title">成绩暂未公布</p>
        <p class="pending-desc">成绩将于 <span class="highlight">{{ publishDate }}</span> 公布</p>
        <p class="pending-hint">请届时在考试列表中查看</p>
      </div>

      <!-- 成绩已公布 -->
      <template v-else>
        <div class="score-section">
          <div class="score-ring">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#e4e7ed" stroke-width="8" />
              <circle
                cx="60" cy="60" r="52" fill="none"
                stroke="#00B96B" stroke-width="8" stroke-linecap="round"
                :stroke-dasharray="ringDash"
                stroke-dashoffset="0"
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div class="score-text">
              <span class="score-value">{{ result.score }}</span>
              <span class="score-total">/ {{ result.totalScore }}</span>
            </div>
          </div>
          <div class="stats-row">
            <template v-if="publishContent === 'scoreOnly'">
              <span class="stat-item">答对 -- 题</span>
              <span class="stat-sep">·</span>
              <span class="stat-item">答错 -- 题</span>
            </template>
            <template v-else>
              <span class="stat-item correct">答对 {{ result.statistics.correctCount }} 题</span>
              <span class="stat-sep">·</span>
              <span class="stat-item wrong">答错 {{ result.statistics.wrongCount }} 题</span>
              <template v-if="result.statistics.partialCount > 0">
                <span class="stat-sep">·</span>
                <span class="stat-item partial">部分得分 {{ result.statistics.partialCount }} 题</span>
              </template>
            </template>
          </div>
        </div>

        <!-- 查看答案详情入口（仅分数模式不显示） -->
        <div v-if="publishContent !== 'scoreOnly'" class="review-entry" @click="viewDetail">
          <div class="review-entry-left">
            <el-icon color="#00B96B"><Document /></el-icon>
            <span>查看答案详情</span>
          </div>
          <el-icon color="#c0c4cc"><ArrowRight /></el-icon>
        </div>
      </template>

      <div class="actions">
        <el-button size="large" @click="router.push('/exam/list')">返回列表</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CircleCheckFilled, Clock, Document, ArrowRight, Setting } from '@element-plus/icons-vue'
import { mockExamResult, mockDocExamResult } from '@/mock/exam'

const route = useRoute()
const router = useRouter()

const examId = route.params.id
const isDocMode = examId === 'exam004' || examId === 'exam003' || examId === 'exam006'
const result = ref(isDocMode ? mockDocExamResult : mockExamResult)
const isEndedView = route.query.from === 'ended'

// 原型工具条
const toolbarCollapsed = ref(false)
const publishMode = ref('immediate')
const publishContent = ref('full')

const publishModes = [
  { value: 'immediate', label: '立即公布' },
  { value: 'delayAfterSubmit', label: '交卷后延迟' },
  { value: 'afterExamEnd', label: '考试结束后' },
  { value: 'delayAfterExamEnd', label: '结束后延迟' },
]
const publishContents = [
  { value: 'scoreOnly', label: '仅分数' },
  { value: 'scoreAndCorrect', label: '分数及对错' },
  { value: 'full', label: '分数对错答案解析' },
]

const isPublished = computed(() => publishMode.value === 'immediate')

const publishDate = computed(() => {
  const submitDate = new Date(result.value.submitTime)
  const examEndDate = new Date(result.value.examEndTime)
  const delay = result.value.scorePublishDelay || 3
  let target
  if (publishMode.value === 'delayAfterSubmit') {
    target = new Date(submitDate.getTime() + delay * 24 * 60 * 60 * 1000)
  } else if (publishMode.value === 'afterExamEnd') {
    target = examEndDate
  } else if (publishMode.value === 'delayAfterExamEnd') {
    target = new Date(examEndDate.getTime() + delay * 24 * 60 * 60 * 1000)
  } else {
    return ''
  }
  const y = target.getFullYear()
  const m = String(target.getMonth() + 1).padStart(2, '0')
  const d = String(target.getDate()).padStart(2, '0')
  const h = String(target.getHours()).padStart(2, '0')
  const min = String(target.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
})

const ringDash = computed(() => {
  const circumference = 2 * Math.PI * 52
  const percent = result.value.score / result.value.totalScore
  return `${circumference * percent} ${circumference * (1 - percent)}`
})

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}小时${m}分钟` : `${m}分钟`
}

function viewDetail() {
  const id = result.value.examId
  const isDoc = result.value.paperMode === 'document'
  if (isDoc) {
    router.push(`/exam/review-doc/${id}?mode=${publishContent.value}`)
  } else {
    router.push(`/exam/review/${id}?mode=${publishContent.value}`)
  }
}
</script>

<style scoped>
.exam-success-page {
  min-height: calc(100vh - 108px);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px 48px;
  background: #f5f7fa;
}

/* 原型工具条 */
.proto-toolbar {
  width: 100%;
  max-width: 560px;
  background: #fffbe6;
  border: 1px dashed #faad14;
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 20px;
}

.proto-toolbar.collapsed {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  cursor: pointer;
}

.proto-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.proto-label { font-size: 13px; font-weight: 600; color: #d48806; }
.proto-collapse { font-size: 12px; color: #8c8c8c; cursor: pointer; }

.proto-group { margin-bottom: 8px; }
.proto-group:last-child { margin-bottom: 0; }
.proto-group-label { font-size: 12px; color: #8c8c8c; display: block; margin-bottom: 6px; }

.proto-btns { display: flex; flex-wrap: wrap; gap: 6px; }
.proto-btn {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  background: #fff;
  border: 1px solid #d9d9d9;
  color: #595959;
  cursor: pointer;
  transition: all 0.2s;
}
.proto-btn.active { background: #00B96B; border-color: #00B96B; color: #fff; }

.proto-collapsed-icon {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #d48806;
}

/* 主卡片 */
.success-card {
  width: 100%;
  max-width: 560px;
  background: #fff;
  border-radius: 16px;
  padding: 40px 40px 32px;
  text-align: center;
}

.success-header { margin-bottom: 24px; }
.success-header h1 { font-size: 24px; margin: 12px 0 0; }

.info-list {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 24px;
  text-align: left;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  padding: 6px 0;
}
.info-row span { color: #909399; }

/* 未公布 */
.pending-section {
  padding: 24px 0;
  margin-bottom: 24px;
}
.pending-title { font-size: 16px; font-weight: 600; color: #4e5969; margin: 12px 0 8px; }
.pending-desc { font-size: 14px; color: #606266; }
.pending-desc .highlight { color: #00B96B; font-weight: 500; }
.pending-hint { font-size: 12px; color: #c0c4cc; margin-top: 8px; }

/* 成绩环 */
.score-section { margin-bottom: 24px; }

.score-ring {
  width: 140px;
  height: 140px;
  margin: 0 auto 16px;
  position: relative;
}

.score-ring svg { width: 100%; height: 100%; }

.score-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.score-value { font-size: 36px; font-weight: 700; color: #00B96B; }
.score-total { font-size: 14px; color: #909399; display: block; margin-top: -4px; }

.stats-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}
.stat-sep { color: #c0c4cc; }
.stat-item.correct { color: #00B96B; }
.stat-item.wrong { color: #F56C6C; }
.stat-item.partial { color: #FF7D00; }

/* 查看详情入口 */
.review-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f5f7fa;
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 24px;
  cursor: pointer;
  transition: background 0.2s;
}
.review-entry:hover { background: #e6f9f0; }
.review-entry-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.actions { display: flex; justify-content: center; }
</style>
