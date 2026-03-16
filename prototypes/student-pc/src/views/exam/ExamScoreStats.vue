<template>
  <div class="score-stats-page">
    <div class="page-header">
      <h1>成绩统计</h1>
    </div>

    <!-- 总览卡片 -->
    <div class="overview-cards">
      <div class="card">
        <div class="card-icon" style="background: #e6f9f0">
          <el-icon :size="24" color="#00B96B"><Document /></el-icon>
        </div>
        <div class="card-info">
          <span class="label">参加考试</span>
          <span class="value">{{ stats.totalExams }}</span>
        </div>
      </div>
      <div class="card">
        <div class="card-icon" style="background: #ecf5ff">
          <el-icon :size="24" color="#409EFF"><TrendCharts /></el-icon>
        </div>
        <div class="card-info">
          <span class="label">平均分</span>
          <span class="value">{{ stats.avgScore }}</span>
        </div>
      </div>
      <div class="card">
        <div class="card-icon" style="background: #fdf6ec">
          <el-icon :size="24" color="#E6A23C"><Trophy /></el-icon>
        </div>
        <div class="card-info">
          <span class="label">最高分</span>
          <span class="value">{{ stats.maxScore }}</span>
        </div>
      </div>
      <div class="card">
        <div class="card-icon" style="background: #f0f9eb">
          <el-icon :size="24" color="#67C23A"><SuccessFilled /></el-icon>
        </div>
        <div class="card-info">
          <span class="label">及格率</span>
          <span class="value">{{ stats.passRate }}%</span>
        </div>
      </div>
    </div>

    <!-- 成绩趋势 -->
    <div class="chart-section">
      <div class="section-header">
        <h3>成绩趋势</h3>
      </div>
      <div class="chart-placeholder">
        <div class="trend-chart">
          <div
            v-for="(exam, idx) in examHistory"
            :key="idx"
            class="trend-bar"
            :style="{ height: (exam.score / exam.totalScore) * 100 + '%' }"
            :title="exam.name + ': ' + exam.score + '/' + exam.totalScore"
          >
            <span class="bar-label">{{ exam.score }}</span>
          </div>
        </div>
        <div class="trend-labels">
          <span v-for="(exam, idx) in examHistory" :key="idx">{{ exam.shortName }}</span>
        </div>
      </div>
    </div>

    <!-- 考试记录列表 -->
    <div class="records-section">
      <div class="section-header">
        <h3>考试记录</h3>
      </div>
      <el-table :data="examHistory" stripe>
        <el-table-column prop="name" label="考试名称" />
        <el-table-column prop="date" label="考试时间" width="160" />
        <el-table-column label="成绩" width="120">
          <template #default="{ row }">
            <span class="score-text" :class="row.score >= row.totalScore * 0.6 ? 'pass' : 'fail'">
              {{ row.score }} / {{ row.totalScore }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="排名" width="100">
          <template #default="{ row }">
            {{ row.rank }} / {{ row.totalStudents }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="primary" text size="small" @click="viewDetail(row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Document, TrendCharts, Trophy, SuccessFilled } from '@element-plus/icons-vue'

const router = useRouter()

const stats = ref({
  totalExams: 7,
  avgScore: 82.5,
  maxScore: 92,
  passRate: 85.7,
})

const examHistory = ref([
  { id: 'exam007', name: '操作系统原理考试', shortName: '操作系统', date: '2026-01-28', score: 85, totalScore: 100, rank: 12, totalStudents: 45 },
  { id: 'exam006', name: '英语四级模拟测试', shortName: '英语四级', date: '2026-01-26', score: 78, totalScore: 100, rank: 18, totalStudents: 50 },
  { id: 'exam005', name: '数据结构与算法测试', shortName: '数据结构', date: '2026-01-20', score: 92, totalScore: 100, rank: 5, totalStudents: 42 },
  { id: 'exam004', name: '计算机网络期末考试', shortName: '计算机网络', date: '2026-01-15', score: 88, totalScore: 100, rank: 8, totalStudents: 48 },
  { id: 'exam003', name: '程序设计基础测验', shortName: '程序设计', date: '2026-01-10', score: 75, totalScore: 100, rank: 22, totalStudents: 45 },
])

function viewDetail(exam) {
  router.push(`/exam/review/${exam.id}`)
}
</script>

<style scoped>
.score-stats-page {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header h1 {
  font-size: 24px;
  margin: 0 0 24px;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-info {
  display: flex;
  flex-direction: column;
}

.card-info .label {
  font-size: 13px;
  color: #909399;
}

.card-info .value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.chart-section, .records-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.section-header {
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 16px;
  margin: 0;
}

.chart-placeholder {
  padding: 20px 0;
}

.trend-chart {
  height: 200px;
  display: flex;
  align-items: flex-end;
  gap: 24px;
  padding: 0 20px;
  border-bottom: 1px solid #e4e7ed;
}

.trend-bar {
  flex: 1;
  background: linear-gradient(180deg, #00B96B 0%, #67C23A 100%);
  border-radius: 4px 4px 0 0;
  min-height: 20px;
  position: relative;
  transition: height 0.3s;
}

.trend-bar:hover {
  opacity: 0.8;
}

.bar-label {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  font-weight: 600;
  color: #00B96B;
}

.trend-labels {
  display: flex;
  gap: 24px;
  padding: 12px 20px 0;
}

.trend-labels span {
  flex: 1;
  text-align: center;
  font-size: 12px;
  color: #909399;
}

.score-text {
  font-weight: 600;
}

.score-text.pass {
  color: #00B96B;
}

.score-text.fail {
  color: #F56C6C;
}
</style>
