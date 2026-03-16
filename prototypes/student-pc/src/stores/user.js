import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    token: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
  },

  actions: {
    setUserInfo(userInfo) {
      this.userInfo = userInfo
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
    },

    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
    },

    logout() {
      this.userInfo = null
      this.token = null
      localStorage.removeItem('userInfo')
      localStorage.removeItem('token')
    },

    loadFromLocal() {
      const userInfo = localStorage.getItem('userInfo')
      const token = localStorage.getItem('token')
      if (userInfo) {
        try {
          this.userInfo = JSON.parse(userInfo)
        } catch (error) {
          console.error('恢复用户信息失败:', error)
        }
      }
      if (token) {
        this.token = token
      }
    },
  },
})
