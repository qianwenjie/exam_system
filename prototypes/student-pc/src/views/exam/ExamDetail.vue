<template>
  <div class="exam-detail-page">
    <div v-if="loading" class="loading-wrapper">
      <el-skeleton :rows="6" animated />
    </div>
    <template v-else-if="exam">
      <!-- 倒计时 -->
      <div v-if="exam.status === 'not_started'" class="countdown-card">
        <p class="countdown-label">距离考试开始</p>
        <div class="countdown-timer">
          <div class="time-block"><span>{{ countdown.days }}</span><label>天</label></div>
          <span class="colon">:</span>
          <div class="time-block"><span>{{ countdown.hours }}</span><label>时</label></div>
          <span class="colon">:</span>
          <div class="time-block"><span>{{ countdown.minutes }}</span><label>分</label></div>
          <span class="colon">:</span>
          <div class="time-block"><span>{{ countdown.seconds }}</span><label>秒</label></div>
        </div>
        <p class="start-time">{{ formatStartTime(exam.startTime) }} 开始</p>
      </div>

      <!-- 考试信息卡片 -->
      <div class="exam-card">
        <div class="exam-header">
          <div class="exam-title-row">
            <h1>{{ exam.name }}</h1>
            <el-tag :type="getStatusType(exam.status)" size="large">
              {{ getStatusText(exam.status) }}
            </el-tag>
          </div>
          <p class="exam-paper">
            试卷：{{ exam.paper?.name }} | {{ exam.paper?.mode === 'extraction' ? '抽题模式' : '文档模式' }}
          </p>
        </div>
        <el-divider />
        <div class="exam-info-grid">
          <div class="info-item">
            <el-icon :size="20"><Clock /></el-icon>
            <div>
              <span class="label">考试时长</span>
              <span class="value">{{ exam.duration }} 分钟</span>
            </div>
          </div>
          <div class="info-item">
            <el-icon :size="20"><Document /></el-icon>
            <div>
              <span class="label">题目数量</span>
              <span class="value">{{ exam.paper?.questionCount }} 题</span>
            </div>
          </div>
          <div class="info-item">
            <el-icon :size="20"><Trophy /></el-icon>
            <div>
              <span class="label">总分</span>
              <span class="value">{{ exam.totalScore }} 分</span>
            </div>
          </div>
          <div class="info-item">
            <el-icon :size="20"><Calendar /></el-icon>
            <div>
              <span class="label">考试时间</span>
              <span class="value">{{ formatTimeRange(exam.startTime, exam.endTime) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 考试说明（配置项） -->
      <div v-if="exam.description" class="description-card">
        <h3><el-icon><Document /></el-icon> 考试说明</h3>
        <div class="description-content">{{ exam.description }}</div>
      </div>

      <!-- 考试须知 -->
      <div class="notice-card">
        <h3><el-icon><WarningFilled /></el-icon> 考试须知</h3>
        <div class="notice-list">
          <div class="notice-item">
            <div class="notice-icon" :class="exam.config?.enableFaceRecognition ? 'warning' : 'success'">
              <el-icon><Camera v-if="exam.config?.enableFaceRecognition" /><CircleCheck v-else /></el-icon>
            </div>
            <div class="notice-text">
              {{ exam.config?.enableFaceRecognition ? '需要人脸识别验证身份' : '无需人脸识别验证' }}
            </div>
          </div>
          <div class="notice-item">
            <div class="notice-icon" :class="exam.config?.allowLateEntry ? 'success' : 'warning'">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="notice-text">
              {{ exam.config?.allowLateEntry
                ? `允许迟到${exam.config.lateMinutes}分钟内进入`
                : '不允许迟到，请准时参加' }}
            </div>
          </div>
          <div class="notice-item">
            <div class="notice-icon info">
              <el-icon><VideoCameraFilled /></el-icon>
            </div>
            <div class="notice-text">
              {{ exam.config?.enableRandomCapture
                ? `考试中将随机抓拍${exam.config.captureCount || 3}次`
                : '考试过程中不进行抓拍' }}
            </div>
          </div>
          <div class="notice-item">
            <div class="notice-icon warning">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="notice-text">
              最短答题时间 {{ exam.config?.minAnswerTime }} 分钟
            </div>
          </div>
          <div class="notice-item">
            <div class="notice-icon success">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="notice-text">
              答案自动保存，请放心作答
            </div>
          </div>
        </div>
      </div>

      <!-- 温馨提示 -->
      <div class="tips-card">
        <div class="tips-title">温馨提示</div>
        <div class="tips-list">
          <div class="tip-item">
            <span class="tip-dot"></span>
            <span>请提前准备好考试环境，确保网络稳定</span>
          </div>
          <div class="tip-item">
            <span class="tip-dot"></span>
            <span>如遇问题请及时联系老师</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-bar">
        <!-- 提前进入提示 -->
        <div v-if="exam.status === 'not_started' && exam.config?.allowEarlyEntry" class="early-notice-bar">
          <el-icon><Clock /></el-icon>
          <span v-if="exam.config?.enableFaceRecognition">
            允许提前 {{ exam.config.earlyMinutes }} 分钟进入进行人脸识别
          </span>
          <span v-else>
            允许提前 {{ exam.config.earlyMinutes }} 分钟进入
          </span>
        </div>
        <div class="action-buttons">
          <el-button @click="router.back()">返回列表</el-button>
          <template v-if="exam.status === 'in_progress'">
            <el-button type="primary" size="large" @click="handleEnterExam">
              {{ exam.myStatus === 'not_started' ? '开始考试' : '继续答题' }}
            </el-button>
          </template>
          <template v-else-if="exam.status === 'ended' && exam.myStatus === 'submitted'">
            <el-button type="primary" size="large" @click="handleViewResult">
              查看详情
            </el-button>
          </template>
          <template v-else-if="exam.status === 'not_started' && canEarlyEnter">
            <el-button type="primary" size="large" @click="handleEnterExam">
              提前进入
            </el-button>
          </template>
          <template v-else>
            <el-button type="info" size="large" disabled>等待开始</el-button>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useExamStore } from '@/stores/exam'
import {
  Clock, Document, Trophy, Calendar, WarningFilled,
  Camera, VideoCameraFilled, CircleCheck, Timer
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const examStore = useExamStore()

const loading = ref(false)
const countdown = ref({ days: '00', hours: '00', minutes: '00', seconds: '00' })
let timer = null

const exam = computed(() => examStore.currentExam)

const canEarlyEnter = computed(() => {
  if (!exam.value?.config?.allowEarlyEntry) return false
  const now = Date.now()
  const start = new Date(exam.value.startTime).getTime()
  const earlyMs = exam.value.config.earlyMinutes * 60 * 1000
  return now >= start - earlyMs && now < start
})

onMounted(async () => {
  // 已提交过，直接跳转成绩页
  if (examStore.isSubmitted(route.params.id)) {
    router.replace({ name: 'ExamSuccess', params: { id: route.params.id } })
    return
  }
  loading.value = true
  await examStore.fetchExamDetail(route.params.id)
  loading.value = false
  // 已结束的考试，跳转到成绩/结果页
  if (exam.value?.status === 'ended') {
    router.replace({ name: 'ExamSuccess', params: { id: route.params.id }, query: { from: 'ended' } })
    return
  }
  startCountdown()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

function startCountdown() {
  updateCountdown()
  timer = setInterval(updateCountdown, 1000)
}

function updateCountdown() {
  if (!exam.value) return
  const now = Date.now()
  const start = new Date(exam.value.startTime).getTime()
  const diff = Math.max(0, start - now)
  const d = Math.floor(diff / (24 * 60 * 60 * 1000))
  const h = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const m = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))
  const s = Math.floor((diff % (60 * 1000)) / 1000)
  countdown.value = {
    days: String(d).padStart(2, '0'),
    hours: String(h).padStart(2, '0'),
    minutes: String(m).padStart(2, '0'),
    seconds: String(s).padStart(2, '0'),
  }
}

function handleEnterExam() {
  if (exam.value?.config?.enableFaceRecognition && !examStore.isFaceVerified(exam.value.id)) {
    router.push(`/exam/face-verify/${exam.value.id}`)
  } else {
    const mode = exam.value?.paper?.mode
    if (mode === 'document') {
      router.push(`/exam/answer-doc/${exam.value.id}`)
    } else {
      router.push(`/exam/answer/${exam.value.id}`)
    }
  }
}

function handleViewResult() {
  const mode = exam.value?.paper?.mode
  if (mode === 'document') {
    router.push(`/exam/review-doc/${exam.value.id}`)
  } else {
    router.push(`/exam/review/${exam.value.id}`)
  }
}

function getStatusType(status) {
  const map = { not_started: 'info', in_progress: 'success', ended: '' }
  return map[status] || 'info'
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

function formatStartTime(time) {
  const d = new Date(time)
  const date = `${d.getMonth() + 1}月${d.getDate()}日`
  const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  return `${date} ${timeStr}`
}
</script>

<style scoped>
.exam-detail-page {
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 80px;
}

.loading-wrapper {
  background: #fff;
  padding: 32px;
  border-radius: 12px;
}

.exam-card, .countdown-card, .description-card, .notice-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
}

.exam-header .exam-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.exam-header h1 {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
}

.exam-paper {
  color: #909399;
  margin: 8px 0 0;
  font-size: 14px;
}

.exam-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #606266;
}

.info-item .label {
  display: block;
  font-size: 12px;
  color: #909399;
}

.info-item .value {
  font-size: 15px;
  font-weight: 500;
}

.countdown-card {
  text-align: center;
  background: linear-gradient(135deg, #00B96B, #00D68F);
  box-shadow: 0 4px 16px rgba(0, 185, 107, 0.3);
}

.countdown-label {
  color: #fff;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 500;
}

.countdown-timer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.time-block {
  text-align: center;
}

.time-block span {
  display: block;
  font-size: 32px;
  font-weight: 600;
  color: #00B96B;
  background: #fff;
  border-radius: 8px;
  padding: 8px 16px;
  min-width: 60px;
}

.time-block label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 4px;
}

.colon {
  font-size: 24px;
  font-weight: 600;
  color: #fff;
}

.start-time {
  margin-top: 20px;
  color: rgba(255, 255, 255, 0.95);
  font-size: 15px;
  font-weight: 500;
}

.description-card h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  margin: 0 0 16px;
  color: #303133;
}

.description-content {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  color: #606266;
  font-size: 14px;
  line-height: 1.8;
  white-space: pre-wrap;
}

.notice-card h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  margin: 0 0 16px;
  color: #303133;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notice-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notice-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 18px;
}

.notice-icon.success {
  background: #f0fdf4;
  color: #00B96B;
}

.notice-icon.warning {
  background: #fff7e6;
  color: #fa8c16;
}

.notice-icon.info {
  background: #e6f7ff;
  color: #1890ff;
}

.notice-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.tips-card {
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.tips-title {
  font-size: 15px;
  font-weight: 600;
  color: #d48806;
  margin-bottom: 12px;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  color: #8c6e00;
  line-height: 1.5;
}

.tip-dot {
  width: 5px;
  height: 5px;
  background: #d48806;
  border-radius: 50%;
  margin-top: 7px;
  flex-shrink: 0;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  max-width: 800px;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid #e4e7ed;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);
  z-index: 100;
}

.early-notice-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 24px;
  background: #e6f7ff;
  font-size: 14px;
  color: #1890ff;
  border-bottom: 1px solid #91d5ff;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
}

.exam-detail-page {
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 80px;
}
</style>
