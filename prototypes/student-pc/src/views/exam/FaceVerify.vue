<template>
  <div class="face-verify-page">
    <div class="verify-card">
      <h2>人脸识别验证</h2>
      <p class="subtitle">请正对摄像头完成身份验证</p>

      <!-- 摄像头预览区 -->
      <div class="camera-container">
        <div class="camera-preview" :class="{ scanning: isScanning, success: verifySuccess }">
          <video ref="videoRef" autoplay muted playsinline></video>
          <div class="face-frame">
            <div class="corner top-left"></div>
            <div class="corner top-right"></div>
            <div class="corner bottom-left"></div>
            <div class="corner bottom-right"></div>
          </div>
          <div v-if="isScanning" class="scan-line"></div>
          <div v-if="verifySuccess" class="success-overlay">
            <el-icon :size="64" color="#00B96B"><CircleCheckFilled /></el-icon>
            <p>验证成功</p>
          </div>
        </div>
      </div>

      <!-- 提示信息 -->
      <div class="tips">
        <el-icon><InfoFilled /></el-icon>
        <span>{{ tipText }}</span>
      </div>

      <!-- 操作按钮 -->
      <div class="actions">
        <el-button @click="router.back()" :disabled="isScanning">返回</el-button>
        <el-button
          v-if="!verifySuccess"
          type="primary"
          :loading="isScanning"
          @click="startVerify"
        >
          {{ isScanning ? '识别中...' : '开始识别' }}
        </el-button>
        <el-button v-else type="primary" @click="enterExam">进入考试</el-button>
      </div>

      <!-- 跳过验证（如果允许且未验证成功） -->
      <p v-if="exam?.config?.allowSkipFaceVerify && !verifySuccess" class="skip-link">
        <el-link type="primary" @click="skipVerify">跳过验证，直接进入</el-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useExamStore } from '@/stores/exam'
import { CircleCheckFilled, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const examStore = useExamStore()

const videoRef = ref(null)
const isScanning = ref(false)
const verifySuccess = ref(false)
let stream = null

const exam = computed(() => examStore.currentExam)

const tipText = computed(() => {
  if (verifySuccess.value) return '验证通过，请点击进入考试'
  if (isScanning.value) return '正在识别，请保持面部正对摄像头...'
  return '请确保光线充足，正面面对摄像头，面部清晰可见'
})

onMounted(async () => {
  if (!exam.value || exam.value.id !== route.params.id) {
    await examStore.fetchExamDetail(route.params.id)
  }
  initCamera()
})

onUnmounted(() => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop())
  }
})

async function initCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: 640, height: 480 },
    })
    if (videoRef.value) {
      videoRef.value.srcObject = stream
    }
  } catch (error) {
    console.error('无法访问摄像头:', error)
    ElMessage.warning('无法访问摄像头，请检查权限设置')
  }
}

async function startVerify() {
  isScanning.value = true
  // 模拟识别过程
  await new Promise((resolve) => setTimeout(resolve, 2500))
  isScanning.value = false
  verifySuccess.value = true
  examStore.setFaceVerified(route.params.id)
  ElMessage.success('人脸识别成功')
}

function skipVerify() {
  examStore.setFaceVerified(route.params.id)
  enterExam()
}

function enterExam() {
  const mode = exam.value?.paper?.mode
  if (mode === 'document') {
    router.replace(`/exam/answer-doc/${route.params.id}`)
  } else {
    router.replace(`/exam/answer/${route.params.id}`)
  }
}
</script>

<style scoped>
.face-verify-page {
  min-height: calc(100vh - 108px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.verify-card {
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.verify-card h2 {
  font-size: 24px;
  margin: 0 0 8px;
}

.subtitle {
  color: #909399;
  margin-bottom: 24px;
}

.camera-container {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.camera-preview {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  background: #000;
  border: 4px solid #e4e7ed;
  transition: border-color 0.3s;
}

.camera-preview.scanning {
  border-color: #00B96B;
}

.camera-preview.success {
  border-color: #00B96B;
}

.camera-preview video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.face-frame {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 180px;
  height: 220px;
  border: 2px dashed rgba(255,255,255,0.6);
  border-radius: 50% 50% 45% 45%;
}

.corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 3px solid #00B96B;
}

.corner.top-left { top: -10px; left: -10px; border-right: none; border-bottom: none; }
.corner.top-right { top: -10px; right: -10px; border-left: none; border-bottom: none; }
.corner.bottom-left { bottom: -10px; left: -10px; border-right: none; border-top: none; }
.corner.bottom-right { bottom: -10px; right: -10px; border-left: none; border-top: none; }

.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #00B96B, transparent);
  animation: scan 1.5s ease-in-out infinite;
}

@keyframes scan {
  0%, 100% { top: 0; }
  50% { top: calc(100% - 3px); }
}

.success-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.success-overlay p {
  margin-top: 12px;
  font-size: 18px;
}

.tips {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #606266;
  font-size: 14px;
  margin-bottom: 24px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.skip-link {
  margin-top: 16px;
  font-size: 13px;
}
</style>
