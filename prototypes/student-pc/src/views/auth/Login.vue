<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <el-icon :size="48" color="#00B96B"><School /></el-icon>
        <h1>学生考试系统</h1>
        <p>请登录您的账号</p>
      </div>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleLogin"
      >
        <el-form-item label="学号" prop="studentId">
          <el-input
            v-model="form.studentId"
            placeholder="请输入学号"
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="form.remember">记住登录状态</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleLogin"
            style="width: 100%"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="login-footer">
        <p>测试账号：任意学号 / 密码 123456</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { School, User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  studentId: '',
  password: '',
  remember: true,
})

const rules = {
  studentId: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function handleLogin() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      // 模拟登录
      await new Promise((resolve) => setTimeout(resolve, 800))
      if (form.password !== '123456') {
        ElMessage.error('密码错误')
        return
      }
      // 保存用户信息
      userStore.setToken('mock_token_' + Date.now())
      userStore.setUserInfo({
        id: 'user001',
        studentId: form.studentId,
        name: '张三',
        username: 'zhangsan',
        phone: '138****8888',
        avatar: '',
        class: '计算机2021级1班',
      })
      ElMessage.success('登录成功')
      router.push('/exam/list')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e6f9f0 0%, #f5f7fa 100%);
}

.login-card {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  margin: 16px 0 8px;
  font-size: 24px;
  color: #303133;
}

.login-header p {
  color: #909399;
  font-size: 14px;
}

.login-footer {
  text-align: center;
  margin-top: 16px;
  color: #909399;
  font-size: 12px;
}
</style>
