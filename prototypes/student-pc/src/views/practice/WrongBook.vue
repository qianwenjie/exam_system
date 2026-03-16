<template>
  <div class="wrong-book-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.push('/practice/list')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px">
          <path d="M19 12H5M12 5l-7 7 7 7" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1>错题本</h1>
    </div>

    <el-empty v-if="!store.wrongBookByTask.length" description="暂无错题，继续保持！" />

    <div v-else class="task-list">
      <div
        v-for="group in store.wrongBookByTask"
        :key="group.taskId"
        class="task-card glass-card"
      >
        <div class="card-main">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div class="card-body">
            <h3 class="card-title">{{ group.taskName }}</h3>
            <div class="card-meta">
              <span class="meta-wrong">错题 {{ group.wrongCount }}</span>
              <span class="meta-sep">·</span>
              <span class="meta-mastered">已掌握 {{ group.masteredCount }}</span>
              <template v-if="group.notRedoneCount">
                <span class="meta-sep">·</span>
                <span class="meta-redo">{{ group.notRedoneCount }} 道未重做</span>
              </template>
            </div>
          </div>
        </div>

        <div class="card-actions">
          <button class="action-btn" @click="$router.push(`/practice/wrong-book/review/${group.taskId}`)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:14px;height:14px">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            错题回顾
          </button>
          <div class="action-divider"></div>
          <button class="action-btn action-btn--redo" :disabled="!group.wrongCount" @click="startWrongRedo(group.taskId)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:14px;height:14px">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5" stroke-linecap="round"/>
            </svg>
            错题复习
          </button>
          <div class="action-divider"></div>
          <button class="action-btn action-btn--mastered" :disabled="!group.masteredCount" @click="$router.push(`/practice/wrong-book/mastered/${group.taskId}`)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:14px;height:14px">
              <polyline points="20 6 9 17 4 12" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            已掌握题集
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePracticeStore } from '@/stores/practice'

const router = useRouter()
const store = usePracticeStore()

function startWrongRedo(taskId) {
  router.push(`/practice/wrong-book/practice/${taskId}?mode=wrong-redo`)
}

onMounted(() => {
  store.loadWrongBook()
  store.fetchTaskList()
})
</script>

<style scoped>
.wrong-book-page { max-width: 800px; margin: 0 auto; }
.page-header { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
.page-header h1 { font-size: 24px; font-weight: 600; color: #1d1d1f; margin: 0; }
.back-btn { width: 32px; height: 32px; border: none; background: rgba(0,0,0,0.04); border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #1d1d1f; transition: background 0.2s; flex-shrink: 0; }
.back-btn:hover { background: rgba(0,0,0,0.08); }
.header-stats { display: flex; gap: 8px; }
.stat-badge { padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 500; }
.stat-badge.wrong { background: rgba(255,59,48,0.1); color: #ff3b30; }
.stat-badge.mastered { background: rgba(52,199,89,0.1); color: #34C759; }

.task-list { display: flex; flex-direction: column; gap: 12px; }
.task-card { border-radius: 14px; overflow: hidden; }
.glass-card { background: rgba(255,255,255,0.85); backdrop-filter: blur(10px); border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 1px 4px rgba(0,0,0,0.04); }

.card-main { display: flex; align-items: center; gap: 16px; padding: 18px 20px 14px; }
.card-icon { width: 44px; height: 44px; border-radius: 12px; background: rgba(255,59,48,0.08); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.card-icon svg { width: 22px; height: 22px; stroke: #ff3b30; }
.card-body { flex: 1; min-width: 0; }
.card-title { font-size: 15px; font-weight: 600; color: #1d1d1f; margin: 0 0 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-meta { display: flex; align-items: center; gap: 6px; font-size: 13px; }
.meta-wrong { color: #ff3b30; }
.meta-mastered { color: #34C759; }
.meta-redo { color: #FF9500; }
.meta-sep { color: #c7c7cc; }

.card-actions { display: flex; align-items: center; border-top: 1px solid rgba(0,0,0,0.05); padding: 0; }
.action-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px; padding: 11px 0; font-size: 13px; color: #606266; background: none; border: none; cursor: pointer; transition: background 0.15s; }
.action-btn:hover:not(:disabled) { background: rgba(0,0,0,0.03); }
.action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.action-btn--redo { color: #34C759; }
.action-btn--mastered { color: #2563EB; }
.action-divider { width: 1px; height: 18px; background: rgba(0,0,0,0.06); flex-shrink: 0; }
</style>
