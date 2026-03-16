<template>
  <div class="profile-page">
    <div class="page-header">
      <h1>个人中心</h1>
    </div>

    <!-- 用户信息卡片 -->
    <div class="user-card">
      <div class="avatar-circle">
        {{ userInfo?.name?.charAt(0) }}
      </div>
      <div class="user-info">
        <div class="user-name">{{ userInfo?.name }}</div>
        <div class="user-meta-row">
          <span class="meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            {{ userInfo?.username }}
          </span>
          <span class="meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.49 5.49l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            {{ userInfo?.phone }}
          </span>
        </div>
      </div>
    </div>

    <!-- 信息列表 -->
    <div class="info-card">
      <div class="info-row">
        <span class="info-label">姓名</span>
        <span class="info-val">{{ userInfo?.name }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">用户名</span>
        <span class="info-val">{{ userInfo?.username }}</span>
      </div>
      <div class="info-row" style="border-bottom: none">
        <span class="info-label">手机号</span>
        <span class="info-val">{{ userInfo?.phone }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
</script>

<style scoped>
.profile-page { max-width: 600px; margin: 0 auto; }

.page-header { margin-bottom: 20px; }
.page-header h1 { font-size: 22px; font-weight: 600; color: #1d1d1f; margin: 0; }

.user-card {
  background: linear-gradient(135deg, #00B96B 0%, #00D68F 100%);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(0,185,107,0.25);
}

.avatar-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255,255,255,0.25);
  border: 2px solid rgba(255,255,255,0.5);
  color: #fff;
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-info { flex: 1; color: #fff; }
.user-name { font-size: 20px; font-weight: 600; margin-bottom: 10px; }
.user-meta-row { display: flex; gap: 16px; flex-wrap: wrap; }
.meta-item { display: flex; align-items: center; gap: 5px; font-size: 13px; opacity: 0.9; }
.meta-item svg { width: 14px; height: 14px; flex-shrink: 0; }

.info-card {
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(10px);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.info-row {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f2f2f7;
}

.info-label { font-size: 14px; color: #86868b; width: 72px; flex-shrink: 0; }
.info-val { font-size: 14px; color: #1d1d1f; font-weight: 500; }
</style>
