<template>
  <div class="stats-layout">
    <div class="stats-header">
      <h1>{{ isExamStats ? '成绩统计' : '刷题统计' }}</h1>
      <div class="stats-tabs">
        <router-link to="/stats/exam" class="stats-tab" :class="{ active: isExamStats }">成绩统计</router-link>
        <router-link to="/stats/practice" class="stats-tab" :class="{ active: isPracticeStats }">刷题统计</router-link>
      </div>
    </div>
    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isExamStats = computed(() => route.path === '/stats/exam')
const isPracticeStats = computed(() => route.path === '/stats/practice')
</script>

<style scoped>
.stats-layout { max-width: 960px; margin: 0 auto; }

.stats-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.stats-header h1 {
  font-size: 22px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.stats-tabs {
  display: flex;
  gap: 4px;
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(10px);
  padding: 3px;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  width: fit-content;
}

.stats-tab {
  padding: 7px 18px;
  font-size: 13px;
  color: #86868b;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s;
}

.stats-tab:hover { color: #1d1d1f; }

.stats-tab.active {
  background: #fff;
  color: #1d1d1f;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
</style>
