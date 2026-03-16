<template>
  <div class="main-layout">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="header-inner">
        <div class="header-left">
          <div class="logo">
            <div class="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                <path d="M8 7h8M8 11h8M8 15h5" stroke-linecap="round" />
              </svg>
            </div>
            <span class="logo-text">考试系统</span>
          </div>
        </div>
        <nav class="nav-menu">
          <router-link to="/exam/list" class="nav-item nav-exam" :class="{ active: isExamActive }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 12h6M9 16h6" stroke-linecap="round" />
            </svg>
            <span>考试</span>
          </router-link>
          <router-link to="/practice/list" class="nav-item nav-practice" :class="{ active: isPracticeActive }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 20h9" stroke-linecap="round" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <span>刷题</span>
          </router-link>
          <router-link to="/stats/exam" class="nav-item nav-stats" :class="{ active: isStatsActive }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            <span>统计</span>
          </router-link>
          <router-link to="/message" class="nav-item nav-message" :class="{ active: isMessageActive }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span>消息</span>
            <span v-if="messageStore.unreadCount > 0" class="nav-badge">{{ messageStore.unreadCount > 99 ? '99+' : messageStore.unreadCount }}</span>
          </router-link>
        </nav>
        <div class="header-right">
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="user-avatar">
              <div class="avatar-circle">
                {{ userInfo?.name?.charAt(0) || 'U' }}
              </div>
              <svg class="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item disabled>
                  <div class="user-info-dropdown">
                    <span class="user-name">{{ userInfo?.name || '用户' }}</span>
                  </div>
                </el-dropdown-item>
                <el-dropdown-item divided command="profile">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 16px; height: 16px; margin-right: 8px">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item command="logout">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 16px; height: 16px; margin-right: 8px">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16,17 21,12 16,7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useMessageStore } from '@/stores/message'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const messageStore = useMessageStore()

const userInfo = computed(() => userStore.userInfo)
const isExamActive = computed(() => route.path.startsWith('/exam'))
const isPracticeActive = computed(() => route.path.startsWith('/practice'))
const isStatsActive = computed(() => route.path.startsWith('/stats'))
const isMessageActive = computed(() => route.path.startsWith('/message'))

function handleCommand(command) {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '退出',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      userStore.logout()
      router.push('/login')
    }).catch(() => {})
  }
}
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
}

.header {
  height: 64px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #00B96B 0%, #00D68F 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.logo-icon svg {
  width: 18px;
  height: 18px;
}

.logo-text {
  font-size: 17px;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: -0.3px;
}

.nav-menu {
  display: flex;
  gap: 4px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 20px;
  color: #6e6e73;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  position: relative;
}

.nav-item svg {
  width: 18px;
  height: 18px;
}

.nav-item:hover:not(.disabled):not(.active) {
  background: rgba(0, 0, 0, 0.04);
  color: #1d1d1f;
}

.nav-item:focus,
.nav-item:focus-visible {
  outline: none;
}

.nav-item.active {
  color: #fff;
}

.nav-exam.active,
.nav-exam:active {
  background: linear-gradient(135deg, #00B96B 0%, #00D68F 100%);
  color: #fff;
}

.nav-practice.active,
.nav-practice:active {
  background: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%);
  color: #fff;
}

.nav-stats.active,
.nav-stats:active {
  background: linear-gradient(135deg, #7C3AED 0%, #9F67FF 100%);
  color: #fff;
}

.nav-message.active,
.nav-message:active {
  background: linear-gradient(135deg, #FF9500 0%, #FFAD33 100%);
  color: #fff;
}

.nav-item.active svg,
.nav-exam:active svg,
.nav-practice:active svg,
.nav-stats:active svg,
.nav-message:active svg {
  stroke: #fff;
}

.nav-item.disabled {
  color: #c7c7cc;
  cursor: not-allowed;
}

.nav-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: #ff3b30;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.nav-item.active .nav-badge {
  background: #ff3b30;
  color: #fff;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-avatar {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 4px 8px 4px 4px;
  border-radius: 20px;
  transition: background 0.2s;
}

.user-avatar:hover {
  background: rgba(0, 0, 0, 0.04);
}

.avatar-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00B96B 0%, #00D68F 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}

.dropdown-arrow {
  width: 14px;
  height: 14px;
  color: #86868b;
}

.user-info-dropdown {
  display: flex;
  flex-direction: column;
  padding: 4px 0;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
}

.user-id {
  font-size: 12px;
  color: #86868b;
}

.main-content {
  flex: 1;
  margin-top: 64px;
  padding: 24px;
  min-height: calc(100vh - 64px);
}
</style>
