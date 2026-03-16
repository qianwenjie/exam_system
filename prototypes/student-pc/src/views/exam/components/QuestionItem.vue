<template>
  <div class="question-item">
    <div class="question-header">
      <div class="question-info">
        <span class="question-index">{{ question.displayIndex }}.</span>
        <span class="question-score">({{ question.score }}分)</span>
      </div>
    </div>
    <div class="question-content" v-html="question.content"></div>

    <!-- 单选题 -->
    <div v-if="question.type === 'single'" class="options-list">
      <div
        v-for="opt in question.options"
        :key="opt.label"
        class="option-item"
        :class="{ selected: answer === opt.label }"
        @click="$emit('update:answer', answer === opt.label ? '' : opt.label)"
      >
        <span class="option-label">{{ opt.label }}</span>
        <span class="option-text">{{ opt.text }}</span>
      </div>
    </div>

    <!-- 多选题 -->
    <div v-else-if="question.type === 'multiple'" class="options-list">
      <div
        v-for="opt in question.options"
        :key="opt.label"
        class="option-item multiple"
        :class="{ selected: (answer || []).includes(opt.label) }"
        @click="toggleMultiple(opt.label)"
      >
        <span class="option-label">{{ opt.label }}</span>
        <span class="option-text">{{ opt.text }}</span>
      </div>
    </div>

    <!-- 判断题 -->
    <div v-else-if="question.type === 'judge'" class="options-list">
      <div
        class="option-item"
        :class="{ selected: answer === true }"
        @click="$emit('update:answer', answer === true ? '' : true)"
      >
        <span class="option-label">✓</span>
        <span class="option-text">正确</span>
      </div>
      <div
        class="option-item"
        :class="{ selected: answer === false }"
        @click="$emit('update:answer', answer === false ? '' : false)"
      >
        <span class="option-label">✗</span>
        <span class="option-text">错误</span>
      </div>
    </div>

    <!-- 填空题 -->
    <div v-else-if="question.type === 'blank'" class="blank-inputs">
      <div v-for="(blank, idx) in question.blanks" :key="blank.id" class="blank-row">
        <span class="blank-label">第{{ idx + 1 }}空：</span>
        <el-input
          :model-value="(answer || {})[blank.id] || ''"
          @update:model-value="(val) => updateBlank(blank.id, val)"
          placeholder="请输入答案"
          style="width: 300px"
        />
      </div>
    </div>

    <!-- 简答题 -->
    <div v-else-if="question.type === 'essay'" class="essay-area">
      <el-input
        type="textarea"
        :model-value="(answer || {}).text || ''"
        @update:model-value="(val) => updateEssay('text', val)"
        placeholder="请输入答案..."
        :rows="6"
      />
      <div class="essay-footer">
        <el-upload
          action="#"
          :auto-upload="false"
          :on-change="handleFileChange"
          :show-file-list="false"
        >
          <el-button size="small" :icon="Upload">上传附件</el-button>
        </el-upload>
        <span class="word-count">已输入 {{ ((answer || {}).text || '').length }} 字</span>
      </div>
      <div v-if="(answer || {}).attachments?.length" class="attachments">
        <div v-for="(file, idx) in answer.attachments" :key="idx" class="attachment-item">
          <el-icon><Document /></el-icon>
          <span>{{ file.name }}</span>
          <el-button type="danger" text size="small" @click="removeAttachment(idx)">删除</el-button>
        </div>
      </div>
    </div>

    <!-- 完形填空 -->
    <div v-else-if="question.type === 'cloze' && !readonly" class="cloze-area">
      <div v-for="blank in question.blanks" :key="blank.id" class="cloze-group">
        <div class="cloze-label">第 {{ blank.order }} 空</div>
        <div class="cloze-options">
          <div
            v-for="opt in blank.options"
            :key="opt.label"
            class="cloze-opt"
            :class="{ selected: (answer || {})[blank.id] === opt.label }"
            @click="updateCloze(blank.id, opt.label)"
          >
            <span class="cloze-opt-label">{{ opt.label }}</span>
            <span class="cloze-opt-text">{{ opt.text }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 复合题：材料始终显示，答题区 readonly 时隐藏 -->
    <div v-else-if="question.type === 'composite'" class="composite-area">
      <div v-if="question.material" class="material-box">
        <p class="material-label">【材料】</p>
        <div v-html="question.material"></div>
      </div>
      <div v-if="!readonly" v-for="(sub, idx) in question.subQuestions" :key="sub.id" class="sub-question">
        <div class="sub-header">
          <span class="sub-index">{{ question.displayIndex }}-{{ idx + 1 }}.</span>
          <span class="sub-type-tag">{{ sub.typeName }}</span>
          <span class="sub-score">({{ sub.score }}分)</span>
        </div>
        <p class="sub-content">{{ sub.content }}</p>
        <!-- 单选 -->
        <div v-if="sub.type === 'single'" class="options-list small">
          <div
            v-for="opt in sub.options"
            :key="opt.label"
            class="option-item"
            :class="{ selected: (answer || {})[sub.id] === opt.label }"
            @click="updateComposite(sub.id, (answer || {})[sub.id] === opt.label ? '' : opt.label)"
          >
            <span class="option-label">{{ opt.label }}</span>
            <span class="option-text">{{ opt.text }}</span>
          </div>
        </div>
        <!-- 多选 -->
        <div v-else-if="sub.type === 'multiple'" class="options-list small">
          <div
            v-for="opt in sub.options"
            :key="opt.label"
            class="option-item multiple"
            :class="{ selected: ((answer || {})[sub.id] || []).includes(opt.label) }"
            @click="toggleCompositeMultiple(sub.id, opt.label)"
          >
            <span class="option-label">{{ opt.label }}</span>
            <span class="option-text">{{ opt.text }}</span>
          </div>
        </div>
        <!-- 判断 -->
        <div v-else-if="sub.type === 'judge'" class="options-list small">
          <div
            class="option-item"
            :class="{ selected: (answer || {})[sub.id] === true }"
            @click="updateComposite(sub.id, (answer || {})[sub.id] === true ? null : true)"
          >
            <span class="option-label">✓</span>
            <span class="option-text">正确</span>
          </div>
          <div
            class="option-item"
            :class="{ selected: (answer || {})[sub.id] === false }"
            @click="updateComposite(sub.id, (answer || {})[sub.id] === false ? null : false)"
          >
            <span class="option-label">✗</span>
            <span class="option-text">错误</span>
          </div>
        </div>
        <!-- 填空 -->
        <div v-else-if="sub.type === 'blank'" class="blank-inputs">
          <div v-for="(blank, bIdx) in sub.blanks" :key="blank.id" class="blank-row">
            <span class="blank-label">第{{ bIdx + 1 }}空：</span>
            <el-input
              :model-value="((answer || {})[sub.id] || {})[blank.id] || ''"
              @update:model-value="(val) => updateCompositeBlank(sub.id, blank.id, val)"
              placeholder="请输入答案"
              style="width: 300px"
            />
          </div>
        </div>
        <!-- 简答 -->
        <div v-else-if="sub.type === 'essay'" class="essay-area">
          <el-input
            type="textarea"
            :model-value="((answer || {})[sub.id] || {}).text || ''"
            @update:model-value="(val) => updateCompositeEssay(sub.id, val)"
            placeholder="请输入答案..."
            :rows="4"
          />
          <div class="essay-footer">
            <el-upload action="#" :auto-upload="false" :on-change="(file) => handleCompositeFile(sub.id, file)" :show-file-list="false">
              <el-button size="small" :icon="Upload">上传附件</el-button>
            </el-upload>
            <span class="word-count">已输入 {{ (((answer || {})[sub.id] || {}).text || '').length }} 字</span>
          </div>
          <div v-if="((answer || {})[sub.id] || {}).attachments?.length" class="attachments">
            <div v-for="(file, idx) in (answer || {})[sub.id].attachments" :key="idx" class="attachment-item">
              <el-icon><Document /></el-icon>
              <span>{{ file.name }}</span>
              <el-button type="danger" text size="small" @click="removeCompositeAttachment(sub.id, idx)">删除</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Check, Close, Upload, Document } from '@element-plus/icons-vue'

const props = defineProps({
  question: { type: Object, required: true },
  answer: { type: [String, Boolean, Array, Object], default: undefined },
  readonly: { type: Boolean, default: false },
})

const emit = defineEmits(['update:answer'])

function getTypeColor(type) {
  const map = {
    single: 'primary',
    multiple: 'success',
    judge: 'warning',
    blank: 'info',
    essay: 'danger',
    cloze: '',
    composite: 'info',
  }
  return map[type] || ''
}

function toggleMultiple(label) {
  const current = props.answer || []
  const idx = current.indexOf(label)
  if (idx > -1) {
    emit('update:answer', current.filter((l) => l !== label))
  } else {
    emit('update:answer', [...current, label].sort())
  }
}

function updateBlank(blankId, value) {
  const current = props.answer || {}
  emit('update:answer', { ...current, [blankId]: value })
}

function updateEssay(field, value) {
  const current = props.answer || { text: '', attachments: [] }
  emit('update:answer', { ...current, [field]: value })
}

function handleFileChange(uploadFile) {
  const file = uploadFile.raw || uploadFile
  const current = props.answer || { text: '', attachments: [] }
  const attachments = [...(current.attachments || []), { name: file.name, size: file.size }]
  emit('update:answer', { ...current, attachments })
}

function removeAttachment(idx) {
  const current = props.answer || { text: '', attachments: [] }
  const attachments = current.attachments.filter((_, i) => i !== idx)
  emit('update:answer', { ...current, attachments })
}

function updateCloze(blankId, label) {
  const current = props.answer || {}
  const newVal = current[blankId] === label ? '' : label
  emit('update:answer', { ...current, [blankId]: newVal })
}

function updateComposite(subId, value) {
  const current = props.answer || {}
  emit('update:answer', { ...current, [subId]: value })
}

function toggleCompositeMultiple(subId, label) {
  const current = props.answer || {}
  const arr = current[subId] || []
  const idx = arr.indexOf(label)
  const newArr = idx > -1 ? arr.filter(l => l !== label) : [...arr, label].sort()
  emit('update:answer', { ...current, [subId]: newArr })
}

function updateCompositeBlank(subId, blankId, value) {
  const current = props.answer || {}
  const subAnswer = current[subId] || {}
  emit('update:answer', { ...current, [subId]: { ...subAnswer, [blankId]: value } })
}

function updateCompositeEssay(subId, value) {
  const current = props.answer || {}
  const subAnswer = current[subId] || { text: '', attachments: [] }
  emit('update:answer', { ...current, [subId]: { ...subAnswer, text: value } })
}

function handleCompositeFile(subId, uploadFile) {
  const file = uploadFile.raw || uploadFile
  const current = props.answer || {}
  const subAnswer = current[subId] || { text: '', attachments: [] }
  const attachments = [...(subAnswer.attachments || []), { name: file.name, size: file.size }]
  emit('update:answer', { ...current, [subId]: { ...subAnswer, attachments } })
}

function removeCompositeAttachment(subId, idx) {
  const current = props.answer || {}
  const subAnswer = current[subId] || { text: '', attachments: [] }
  const attachments = subAnswer.attachments.filter((_, i) => i !== idx)
  emit('update:answer', { ...current, [subId]: { ...subAnswer, attachments } })
}
</script>

<style scoped>
.question-item {
  /* wrapper */
}

.question-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.question-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.question-index {
  font-size: 16px;
  font-weight: 600;
}

.question-score {
  color: #909399;
  font-size: 13px;
}

.question-content {
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 16px;
  color: #303133;
}

/* 选项列表 */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  background: white;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.option-item:hover {
  border-color: #00B96B;
  background: white;
}

.option-item.selected {
  border-color: #00B96B;
  background: #e6f9f0;
}

.option-label {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 13px;
  margin-right: 12px;
  flex-shrink: 0;
}

.option-item.selected .option-label {
  background: #00B96B;
  color: #fff;
}

.option-text {
  flex: 1;
}

/* 判断题 */
/* 填空题 */
.blank-inputs {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.blank-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.blank-label {
  color: #606266;
  font-size: 14px;
}

/* 简答题 */
.essay-area {
  /* wrapper */
}

.essay-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.word-count {
  font-size: 12px;
  color: #909399;
}

.attachments {
  margin-top: 12px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 8px;
}

/* 完形填空 */
.cloze-area {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cloze-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cloze-label {
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  padding-bottom: 6px;
  border-bottom: 1px solid #f0f0f0;
}

.cloze-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cloze-opt {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: white;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.cloze-opt:hover {
  border-color: #00B96B;
}

.cloze-opt.selected {
  border-color: #00B96B;
  background: #e6f9f0;
}

.cloze-opt-label {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  flex-shrink: 0;
  transition: all 0.2s;
}

.cloze-opt.selected .cloze-opt-label {
  background: #00B96B;
  color: #fff;
}

.cloze-opt-text {
  font-size: 14px;
  color: #303133;
  line-height: 1.5;
}

/* 复合题 */
.material-box {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 1.8;
}

.material-label {
  font-weight: 600;
  margin-bottom: 8px;
}

.sub-question {
  padding: 16px 0;
  border-top: 1px dashed #e4e7ed;
}

.sub-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.sub-index {
  font-weight: 600;
  font-size: 14px;
  color: #303133;
}

.sub-type-tag {
  font-size: 11px;
  padding: 1px 7px;
  border-radius: 10px;
  background: #ecf5ff;
  color: #409eff;
  font-weight: 500;
}

.sub-score {
  font-size: 12px;
  color: #909399;
}

.sub-content {
  font-size: 14px;
  line-height: 1.6;
  color: #303133;
  margin-bottom: 12px;
}

.options-list.small .option-item {
  padding: 8px 12px;
}
</style>
