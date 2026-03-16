<template>
  <div class="capture-overlay">
    <!-- 准备阶段：3、2、1、抓拍 -->
    <div v-if="stage === 'prepare'" class="prepare-stage">
      <div class="prepare-card">
        <div class="prepare-icon">
          <svg viewBox="0 0 24 24" width="64" height="64">
            <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
          </svg>
        </div>
        <div class="prepare-countdown">{{ prepareText }}</div>
        <div class="prepare-tip">请准备好，即将进行随机抓拍</div>
      </div>
    </div>

    <!-- 拍摄阶段 -->
    <div v-else-if="stage === 'capture'" class="capture-stage">
      <div class="capture-card">
        <div class="camera-area">
          <video ref="videoRef" autoplay muted playsinline></video>
          <div class="capture-flash" :class="{ active: isCapturing }"></div>
        </div>
        <div class="capture-status">
          <div class="status-icon">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <circle cx="12" cy="12" r="8" fill="#F56C6C"/>
            </svg>
          </div>
          <span>正在拍摄，请保持姿势...</span>
        </div>
      </div>
    </div>

    <!-- 成功阶段 -->
    <div v-else-if="stage === 'success'" class="success-stage">
      <div class="success-card">
        <div class="success-icon">
          <svg viewBox="0 0 24 24" width="80" height="80">
            <path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"/>
          </svg>
        </div>
        <div class="success-title">抓拍成功</div>
        <div class="success-tip">照片已保存，即将返回答题</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['complete'])

const videoRef = ref(null)
const stage = ref('prepare') // prepare, capture, success
const prepareCountdown = ref(3)
const prepareText = ref('3')
const isCapturing = ref(false)
let stream = null
let timer = null

onMounted(() => {
  startPrepare()
})

onUnmounted(() => {
  cleanup()
})

function startPrepare() {
  timer = setInterval(() => {
    prepareCountdown.value--

    if (prepareCountdown.value === 2) {
      prepareText.value = '2'
    } else if (prepareCountdown.value === 1) {
      prepareText.value = '1'
    } else if (prepareCountdown.value === 0) {
      prepareText.value = '抓拍'
      clearInterval(timer)
      // 延迟500ms后进入拍摄阶段
      setTimeout(() => {
        startCapture()
      }, 500)
    }
  }, 1000)
}

async function startCapture() {
  stage.value = 'capture'

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: 640, height: 480 },
    })
    if (videoRef.value) {
      videoRef.value.srcObject = stream
    }
  } catch (error) {
    console.error('摄像头访问失败:', error)
    ElMessage.error('无法访问摄像头')
    emit('complete')
    return
  }

  // 等待1秒后拍摄
  setTimeout(() => {
    takePicture()
  }, 1000)
}

function takePicture() {
  isCapturing.value = true

  // 模拟拍照闪光效果
  setTimeout(() => {
    isCapturing.value = false

    // 显示成功阶段
    stage.value = 'success'
    ElMessage.success('抓拍完成')

    // 1.5秒后关闭
    setTimeout(() => {
      cleanup()
      emit('complete')
    }, 1500)
  }, 300)
}

function cleanup() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  if (stream) {
    stream.getTracks().forEach((track) => track.stop())
    stream = null
  }
}
</script>

<style scoped>
.capture-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 准备阶段 */
.prepare-stage {
  animation: scaleIn 0.3s;
}

@keyframes scaleIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.prepare-card {
  background: #fff;
  border-radius: 20px;
  padding: 48px 64px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.prepare-icon {
  color: #00B96B;
  margin-bottom: 24px;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.prepare-countdown {
  font-size: 72px;
  font-weight: 700;
  color: #00B96B;
  font-family: 'DIN Alternate', 'SF Mono', 'Menlo', monospace;
  margin-bottom: 16px;
  animation: countdownPop 0.3s;
}

@keyframes countdownPop {
  0% { transform: scale(0.5); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

.prepare-tip {
  font-size: 16px;
  color: #606266;
}

/* 拍摄阶段 */
.capture-stage {
  animation: scaleIn 0.3s;
}

.capture-card {
  background: #fff;
  border-radius: 20px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.camera-area {
  width: 400px;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  margin: 0 auto 20px;
  background: #000;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.camera-area video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.capture-flash {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.1s;
}

.capture-flash.active {
  opacity: 0.8;
}

.capture-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #F56C6C;
  font-size: 15px;
  font-weight: 500;
}

.status-icon {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* 成功阶段 */
.success-stage {
  animation: scaleIn 0.3s;
}

.success-card {
  background: #fff;
  border-radius: 20px;
  padding: 48px 64px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.success-icon {
  color: #00B96B;
  margin-bottom: 24px;
  animation: successPop 0.5s;
}

@keyframes successPop {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

.success-title {
  font-size: 32px;
  font-weight: 600;
  color: #00B96B;
  margin-bottom: 12px;
}

.success-tip {
  font-size: 15px;
  color: #909399;
}
</style>
