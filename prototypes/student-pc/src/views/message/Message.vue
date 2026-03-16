<template>
  <div class="message-page">
    <div class="page-header">
      <h1>消息中心</h1>
      <button v-if="store.unreadCount > 0" class="mark-all-btn" @click="store.markAllRead()">
        全部已读
      </button>
    </div>

    <!-- Tab 栏 -->
    <div class="filter-bar">
      <div class="filter-tabs">
        <div
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-item"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
          <span v-if="tab.unread > 0" class="tab-count unread">{{ tab.unread }}</span>
        </div>
      </div>
    </div>

    <!-- 消息列表 -->
    <el-empty v-if="filteredMessages.length === 0" description="暂无消息" style="margin-top: 60px" />
    <div v-else class="msg-list">
      <div
        v-for="msg in filteredMessages"
        :key="msg.id"
        class="msg-row"
        :class="{ unread: !msg.isRead }"
        @click="handleClick(msg)"
      >
        <!-- 左侧图标 -->
        <div class="row-icon-wrap">
          <div class="row-icon" :class="msg.subType">
          <svg v-if="msg.subType === 'exam_new'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
            <path d="M9 12h6M9 16h4" stroke-linecap="round"/>
          </svg>
          <svg v-else-if="msg.subType === 'exam_soon'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2" stroke-linecap="round"/>
          </svg>
          <svg v-else-if="msg.subType === 'score_published'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22,4 12,14.01 9,11.01"/>
          </svg>
          <svg v-else-if="msg.subType === 'practice_new'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 20h9" stroke-linecap="round"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </div>
          <div v-if="!msg.isRead" class="unread-dot"></div>
        </div>

        <!-- 主内容 -->
        <div class="row-main">
          <div class="row-header">
            <span class="msg-title">{{ msg.title }}</span>
            <span class="msg-time">{{ formatTime(msg.time) }}</span>
          </div>
          <p class="msg-content">{{ msg.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMessageStore } from '@/stores/message'

const router = useRouter()
const store = useMessageStore()
const activeTab = ref('all')

const tabs = computed(() => [
  { key: 'all',      label: '全部',     unread: store.unreadCount },
  { key: 'exam',     label: '考试通知', unread: store.messages.filter(m => m.type === 'exam'     && !m.isRead).length },
  { key: 'score',    label: '成绩通知', unread: store.messages.filter(m => m.type === 'score'    && !m.isRead).length },
  { key: 'practice', label: '刷题通知', unread: store.messages.filter(m => m.type === 'practice' && !m.isRead).length },
])

const filteredMessages = computed(() => {
  const list = activeTab.value === 'all'
    ? store.messages
    : store.messages.filter(m => m.type === activeTab.value)
  return [...list].sort((a, b) => new Date(b.time) - new Date(a.time))
})

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t)
  const diff = Date.now() - d
  if (diff < 60000)    return '刚刚'
  if (diff < 3600000)  return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  const days = Math.floor(diff / 86400000)
  if (days < 7) return `${days} 天前`
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

function handleClick(msg) {
  store.markRead(msg.id)
  if (msg.type === 'exam')          router.push(`/exam/detail/${msg.taskId}`)
  else if (msg.type === 'score')    router.push('/exam/score-stats')
  else if (msg.type === 'practice') router.push(`/practice/detail/${msg.taskId}`)
}
</script>

<style scoped>
.message-page { max-width: 960px; margin: 0 auto; }

.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.page-header h1 { font-size: 22px; font-weight: 600; color: #1d1d1f; margin: 0; }
.mark-all-btn { padding: 6px 14px; border: 1.5px solid #e4e7ed; border-radius: 8px; background: none; font-size: 13px; color: #606266; cursor: pointer; transition: all 0.15s; }
.mark-all-btn:hover { border-color: #2563EB; color: #2563EB; }

/* Tab 栏 - 与考试/刷题列表一致 */
.filter-bar { margin-bottom: 16px; }
.filter-tabs { display: flex; gap: 4px; background: rgba(255,255,255,0.8); backdrop-filter: blur(10px); padding: 3px; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); width: fit-content; }
.tab-item { padding: 7px 16px; font-size: 13px; color: #86868b; cursor: pointer; border-radius: 8px; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
.tab-item:hover { color: #1d1d1f; }
.tab-item.active { background: #fff; color: #1d1d1f; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.tab-count { font-size: 11px; padding: 2px 6px; border-radius: 10px; background: rgba(0,0,0,0.06); }
.tab-item.active .tab-count.unread { background: #ff3b30; color: #fff; }

/* 消息列表 */
.msg-list { display: flex; flex-direction: column; gap: 10px; }

.msg-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(10px);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  position: relative;
}
.msg-row:hover { background: rgba(255,255,255,0.95); box-shadow: 0 4px 12px rgba(0,0,0,0.08); transform: translateY(-1px); }
.msg-row:active { transform: scale(0.995); }

/* 左侧图标 */
.row-icon-wrap { position: relative; flex-shrink: 0; }
.row-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; }
.row-icon svg { width: 22px; height: 22px; }
.row-icon.exam_new      { background: linear-gradient(135deg, #00B96B 0%, #00D68F 100%); box-shadow: 0 4px 12px rgba(0,185,107,0.3); }
.row-icon.exam_soon     { background: linear-gradient(135deg, #FF9500 0%, #FFAD33 100%); box-shadow: 0 4px 12px rgba(255,149,0,0.3); }
.row-icon.score_published { background: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%); box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
.row-icon.practice_new  { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); box-shadow: 0 4px 12px rgba(102,126,234,0.3); }
.row-icon.practice_soon { background: linear-gradient(135deg, #ff3b30 0%, #ff6b6b 100%); box-shadow: 0 4px 12px rgba(255,59,48,0.3); }

/* 主内容 */
.row-main { flex: 1; min-width: 0; }
.row-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.msg-title { font-size: 15px; font-weight: 500; color: #1d1d1f; }
.msg-time { font-size: 12px; color: #86868b; flex-shrink: 0; margin-left: 12px; }
.msg-content { font-size: 13px; color: #86868b; line-height: 1.6; margin: 0; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }

/* 未读状态 */
.msg-row.unread .msg-title { font-weight: 600; color: #1d1d1f; }
.msg-row.unread .msg-content { color: #606266; }
.unread-dot { position: absolute; top: -3px; right: -3px; width: 14px; height: 14px; border-radius: 50%; background: #ff3b30; border: 2px solid #fff; }
</style>
