<template>
  <div class="exam-stats-page">
    <div class="main-layout">
      <!-- 左侧考试列表 -->
      <div class="exam-sidebar">
        <div
          v-for="exam in examHistory"
          :key="exam.id"
          class="exam-item"
          :class="{ active: selectedExam?.id === exam.id }"
          @click="selectedExam = exam"
        >
          <div class="exam-item-name">{{ exam.name }}</div>
          <div class="exam-item-score" :class="isPassed(exam) ? 'pass' : 'fail'">{{ exam.score }}分</div>
        </div>
      </div>

      <!-- 右侧分析面板 -->
      <div class="analysis-panel">
        <template v-if="selectedExam">

          <!-- Hero Card -->
          <div class="hero-card">
            <div class="hero-left">
              <!-- 环形图 -->
              <div class="ring-wrap">
                <svg viewBox="0 0 100 100" class="ring-svg">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#f2f2f7" stroke-width="9" />
                  <circle cx="50" cy="50" r="38" fill="none"
                    :stroke="isPassed(selectedExam) ? '#00B96B' : '#FF4D4F'"
                    stroke-width="9" stroke-linecap="round"
                    :stroke-dasharray="`${scoreRate * 2.388} 238.8`"
                    stroke-dashoffset="59.7" transform="rotate(-90 50 50)"
                  />
                  <circle cx="50" cy="50" r="28" fill="none"
                    stroke="#C9CDD4" stroke-width="4" stroke-linecap="round"
                    :stroke-dasharray="`${avgRate * 1.759} 175.9`"
                    stroke-dashoffset="44" transform="rotate(-90 50 50)"
                  />
                </svg>
                <div class="ring-center">
                  <div class="ring-score" :class="isPassed(selectedExam) ? 'pass' : 'fail'">{{ selectedExam.score }}</div>
                  <div class="ring-total">/{{ selectedExam.totalScore }}</div>
                </div>
              </div>
            </div>

            <div class="hero-right">
              <div class="hero-title-row">
                <span class="hero-name">{{ selectedExam.name }}</span>
                <span class="pass-tag" :class="isPassed(selectedExam) ? 'pass' : 'fail'">
                  {{ isPassed(selectedExam) ? '及格' : '不及格' }}
                </span>
              </div>

              <!-- 得分对比 -->
              <div class="score-compare">
                <div class="compare-item">
                  <div class="compare-val my">{{ selectedExam.score }}</div>
                  <div class="compare-label"><span class="dot my"></span>我的得分</div>
                </div>
                <div class="compare-divider"></div>
                <div class="compare-item">
                  <div class="compare-val avg">{{ selectedExam.classAvg }}</div>
                  <div class="compare-label"><span class="dot avg"></span>班级均分</div>
                </div>
                <div class="compare-divider"></div>
                <div class="compare-item">
                  <div class="compare-val" :class="diffScore > 0 ? 'up' : diffScore < 0 ? 'down' : ''">
                    {{ diffScore > 0 ? '+' : '' }}{{ diffScore }}
                  </div>
                  <div class="compare-label">高于均分</div>
                </div>
              </div>

              <!-- 超越进度条 -->
              <div class="rank-bar">
                <div class="rank-track"><div class="rank-fill" :style="{ width: selectedExam.percentile + '%' }"></div></div>
                <div class="rank-text">超越了班级 <strong>{{ selectedExam.percentile }}%</strong> 的同学</div>
              </div>
            </div>
          </div>

          <!-- 核心指标 -->
          <div class="metrics-grid">
            <div class="metric-item">
              <div class="metric-val blue">{{ selectedExam.statistics.totalQuestions }}</div>
              <div class="metric-label">总题数</div>
            </div>
            <div class="metric-item">
              <div class="metric-val red">{{ selectedExam.statistics.wrongCount }}</div>
              <div class="metric-label">答错题数</div>
            </div>
            <div class="metric-item">
              <div class="metric-val blue">{{ selectedExam.answeredDuration }}<span class="unit">分</span></div>
              <div class="metric-label">答题用时</div>
            </div>
            <div class="metric-item">
              <div class="metric-val orange">{{ selectedExam.leaveCount }}</div>
              <div class="metric-label">中途离开</div>
            </div>
          </div>

          <!-- 题型得分率 -->
          <div class="panel-card">
            <div class="panel-title">题型得分率</div>
            <div class="type-list">
              <div v-for="item in selectedExam.typeStats" :key="item.type" class="type-row">
                <span class="type-name">{{ item.typeName }}</span>
                <div class="bar-track">
                  <div class="bar-fill" :class="getRateClass(item.rate)" :style="{ width: item.rate + '%' }"></div>
                </div>
                <span class="type-rate">{{ item.rate }}%</span>
              </div>
            </div>
          </div>

          <!-- 考试详情 -->
          <div class="panel-card">
            <div class="panel-title">考试详情</div>
            <div class="info-grid">
              <div class="info-row"><span class="info-label">考试时间</span><span class="info-val">{{ formatDateTime(selectedExam.startTime, selectedExam.endTime) }}</span></div>
              <div class="info-row"><span class="info-label">所用试卷</span><span class="info-val">{{ selectedExam.paper.name }}</span></div>
              <div class="info-row"><span class="info-label">出题方式</span><span class="info-val">{{ selectedExam.paper.mode === 'random' ? '随机抽题' : '固定试卷' }}</span></div>
              <div class="info-row"><span class="info-label">总时长</span><span class="info-val">{{ selectedExam.totalDuration }} 分钟</span></div>
              <div class="info-row"><span class="info-label">总分 / 题数</span><span class="info-val">{{ selectedExam.totalScore }} 分 / {{ selectedExam.statistics.totalQuestions }} 题</span></div>
              <div class="info-row"><span class="info-label">及格线</span><span class="info-val">{{ selectedExam.passScore }} 分</span></div>
            </div>
          </div>

        </template>
        <div v-else class="empty-panel">
          <svg viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" stroke-width="1.5" style="width:48px;height:48px">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          <div class="empty-text">选择考试查看分析</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const examHistory = ref([
  {
    id: 'exam008', name: '数据结构与算法测试',
    startTime: '2026-02-10 22:00:00', endTime: '2026-02-11 01:00:00',
    paper: { name: '数据结构2024秋季卷A', mode: 'random' },
    totalDuration: 120, answeredDuration: 98, leaveCount: 2,
    score: 56, totalScore: 100, passScore: 60, classAvg: 68, percentile: 28,
    statistics: { totalQuestions: 40, correctCount: 20, wrongCount: 15, partialCount: 5 },
    typeStats: [
      { type: 'single', typeName: '单选', rate: 65 }, { type: 'multiple', typeName: '多选', rate: 40 },
      { type: 'judge', typeName: '判断', rate: 72 }, { type: 'blank', typeName: '填空', rate: 45 },
      { type: 'cloze', typeName: '完形填空', rate: 58 },
    ],
  },
  {
    id: 'exam007', name: '操作系统原理考试',
    startTime: '2026-01-28 09:00:00', endTime: '2026-01-28 12:00:00',
    paper: { name: '操作系统2024秋季卷B', mode: 'fixed' },
    totalDuration: 120, answeredDuration: 115, leaveCount: 0,
    score: 85, totalScore: 100, passScore: 60, classAvg: 74, percentile: 82,
    statistics: { totalQuestions: 45, correctCount: 32, wrongCount: 8, partialCount: 5 },
    typeStats: [
      { type: 'single', typeName: '单选', rate: 90 }, { type: 'multiple', typeName: '多选', rate: 70 },
      { type: 'judge', typeName: '判断', rate: 88 }, { type: 'composite', typeName: '复合题', rate: 68 },
      { type: 'essay', typeName: '简答', rate: 75 },
    ],
  },
  {
    id: 'exam006', name: '英语四级模拟测试',
    startTime: '2026-01-25 08:30:00', endTime: '2026-01-25 11:00:00',
    paper: { name: '英语四级模拟卷2024', mode: 'fixed' },
    totalDuration: 150, answeredDuration: 142, leaveCount: 1,
    score: 78, totalScore: 100, passScore: 60, classAvg: 71, percentile: 68,
    statistics: { totalQuestions: 60, correctCount: 45, wrongCount: 10, partialCount: 5 },
    typeStats: [
      { type: 'single', typeName: '单选', rate: 82 }, { type: 'multiple', typeName: '多选', rate: 60 },
      { type: 'judge', typeName: '判断', rate: 85 }, { type: 'blank', typeName: '填空', rate: 75 },
      { type: 'cloze', typeName: '完形填空', rate: 65 }, { type: 'essay', typeName: '简答', rate: 70 },
    ],
  },
])

const selectedExam = ref(examHistory.value[0])
const scoreRate = computed(() => selectedExam.value ? (selectedExam.value.score / selectedExam.value.totalScore) * 100 : 0)
const avgRate = computed(() => selectedExam.value ? (selectedExam.value.classAvg / selectedExam.value.totalScore) * 100 : 0)
const diffScore = computed(() => selectedExam.value ? selectedExam.value.score - selectedExam.value.classAvg : 0)
const isPassed = (exam) => exam.score >= exam.passScore

const formatDateTime = (startTime, endTime) => {
  const s = new Date(startTime), e = new Date(endTime)
  const fmt = (d) => `${d.getMonth()+1}月${d.getDate()}日 ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  const isSameDay = s.toDateString() === e.toDateString()
  const endStr = isSameDay ? `${String(e.getHours()).padStart(2,'0')}:${String(e.getMinutes()).padStart(2,'0')}` : fmt(e)
  return `${fmt(s)} ~ ${endStr}`
}

const getRateClass = (rate) => rate >= 80 ? 'rate-good' : rate >= 60 ? 'rate-mid' : 'rate-bad'
</script>

<style scoped>
.exam-stats-page { max-width: 960px; margin: 0 auto; display: flex; flex-direction: column; height: calc(100vh - 64px - 48px - 62px); }

.page-header { margin-bottom: 20px; flex-shrink: 0; }
.page-header h1 { font-size: 22px; font-weight: 600; color: #1d1d1f; margin: 0; }

.main-layout { display: flex; gap: 16px; flex: 1; min-height: 0; }

/* 左侧列表 */
.exam-sidebar { width: 180px; flex-shrink: 0; background: rgba(255,255,255,0.75); backdrop-filter: blur(10px); border-radius: 14px; overflow-y: auto; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.exam-item { padding: 12px 14px; border-bottom: 1px solid #f2f2f7; cursor: pointer; transition: background 0.15s; }
.exam-item:last-child { border-bottom: none; }
.exam-item:hover { background: rgba(0,0,0,0.02); }
.exam-item.active { background: #f0fff8; border-right: 3px solid #00B96B; }
.exam-item-name { font-size: 13px; font-weight: 500; color: #1d1d1f; line-height: 1.4; margin-bottom: 6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.exam-item-score { font-size: 15px; font-weight: 700; }
.exam-item-score.pass { color: #00B96B; }
.exam-item-score.fail { color: #FF4D4F; }

/* 右侧面板 */
.analysis-panel { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; min-width: 0; }

/* Hero Card */
.hero-card { background: rgba(255,255,255,0.75); backdrop-filter: blur(10px); border-radius: 14px; padding: 20px 24px; display: flex; gap: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.hero-left { flex-shrink: 0; }
.ring-wrap { position: relative; width: 120px; height: 120px; }
.ring-svg { width: 100%; height: 100%; }
.ring-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.ring-score { font-size: 32px; font-weight: 700; line-height: 1; }
.ring-score.pass { color: #00B96B; }
.ring-score.fail { color: #FF4D4F; }
.ring-total { font-size: 12px; color: #86868b; margin-top: 2px; }

.hero-right { flex: 1; display: flex; flex-direction: column; gap: 14px; min-width: 0; }
.hero-title-row { display: flex; align-items: flex-start; gap: 10px; }
.hero-name { font-size: 16px; font-weight: 600; color: #1d1d1f; flex: 1; }
.pass-tag { padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; flex-shrink: 0; }
.pass-tag.pass { background: rgba(0,185,107,0.1); color: #00B96B; }
.pass-tag.fail { background: rgba(255,77,79,0.1); color: #FF4D4F; }

.score-compare { display: flex; align-items: center; background: #f5f7fa; border-radius: 10px; padding: 12px 0; }
.compare-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.compare-divider { width: 1px; height: 32px; background: #e4e7ed; }
.compare-val { font-size: 22px; font-weight: 700; color: #1d1d1f; line-height: 1; }
.compare-val.my { color: #00B96B; }
.compare-val.avg { color: #86868b; }
.compare-val.up { color: #00B96B; }
.compare-val.down { color: #FF4D4F; }
.compare-label { font-size: 11px; color: #86868b; display: flex; align-items: center; gap: 4px; }
.dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.dot.my { background: #00B96B; }
.dot.avg { background: #c7c7cc; }

.rank-bar { display: flex; flex-direction: column; gap: 6px; }
.rank-track { height: 6px; background: #f2f2f7; border-radius: 3px; overflow: hidden; }
.rank-fill { height: 100%; background: #2563EB; border-radius: 3px; transition: width 0.5s ease; }
.rank-text { font-size: 12px; color: #86868b; }
.rank-text strong { color: #2563EB; font-weight: 600; }

/* 指标格 */
.metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.metric-item { background: rgba(255,255,255,0.75); backdrop-filter: blur(10px); border-radius: 12px; padding: 16px 12px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.metric-val { font-size: 26px; font-weight: 700; color: #1d1d1f; line-height: 1.1; }
.metric-val.blue { color: #2563EB; }
.metric-val.red { color: #FF4D4F; }
.metric-val.orange { color: #FF9500; }
.unit { font-size: 13px; font-weight: 400; color: #86868b; margin-left: 2px; }
.metric-label { font-size: 12px; color: #86868b; margin-top: 4px; }

/* 通用面板卡片 */
.panel-card { background: rgba(255,255,255,0.75); backdrop-filter: blur(10px); border-radius: 14px; padding: 18px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.panel-title { font-size: 14px; font-weight: 600; color: #1d1d1f; margin-bottom: 14px; }

/* 题型得分率 */
.type-list { display: flex; flex-direction: column; gap: 12px; }
.type-row { display: flex; align-items: center; gap: 10px; }
.type-name { font-size: 13px; color: #606266; width: 56px; flex-shrink: 0; }
.bar-track { flex: 1; height: 6px; background: #f2f2f7; border-radius: 3px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 3px; transition: width 0.4s ease; }
.rate-good { background: #00B96B; }
.rate-mid { background: #FF9500; }
.rate-bad { background: #FF4D4F; }
.type-rate { font-size: 13px; font-weight: 600; color: #303133; width: 36px; text-align: right; flex-shrink: 0; }

/* 考试详情 */
.info-grid { display: flex; flex-direction: column; gap: 10px; }
.info-row { display: flex; align-items: flex-start; gap: 12px; font-size: 13px; }
.info-label { color: #86868b; flex-shrink: 0; width: 72px; }
.info-val { color: #303133; font-weight: 500; flex: 1; }

/* 空状态 */
.empty-panel { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; background: rgba(255,255,255,0.75); backdrop-filter: blur(10px); border-radius: 14px; }
.empty-text { font-size: 14px; color: #c7c7cc; }
</style>
