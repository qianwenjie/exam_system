import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
})

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  (response) => {
    const { code, data, message } = response.data
    if (code === 200 || code === 0) {
      return data
    }
    ElMessage.error(message || '请求失败')
    return Promise.reject(new Error(message || '请求失败'))
  },
  (error) => {
    if (!navigator.onLine) {
      ElMessage.error('网络连接失败，请检查网络设置')
    } else if (error.response) {
      const { status } = error.response
      const errorMap = {
        401: '未授权，请重新登录',
        403: '拒绝访问',
        404: '请求资源不存在',
        500: '服务器错误',
        502: '网关错误',
        503: '服务不可用',
      }
      ElMessage.error(errorMap[status] || '请求失败')
    } else {
      ElMessage.error(error.message || '请求超时')
    }
    return Promise.reject(error)
  }
)

export default request
