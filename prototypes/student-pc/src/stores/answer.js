import { defineStore } from 'pinia'
import { saveAnswer, syncAnswers } from '@/api/exam'
import { useExamStore } from './exam'

const STORAGE_KEY_PREFIX = 'exam_answers_'

export const useAnswerStore = defineStore('answer', {
  state: () => ({
    examId: null,
    paperId: null,
    answers: {},
    marked: [],
    currentQuestionIndex: 0,
    startTime: null,
    remainingTime: 0,
    autoSaveTimer: null,
    countdownTimer: null,
  }),

  getters: {
    questions() {
      const examStore = useExamStore()
      return examStore.currentPaper?.questions || []
    },

    answeredCount: (state) => {
      return Object.keys(state.answers).length
    },

    unansweredCount() {
      const totalCount = this.questions.length
      return totalCount - this.answeredCount
    },

    currentQuestion() {
      return this.questions[this.currentQuestionIndex]
    },

    formattedTime: (state) => {
      const hours = Math.floor(state.remainingTime / 3600)
      const minutes = Math.floor((state.remainingTime % 3600) / 60)
      const seconds = state.remainingTime % 60
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    },
  },

  actions: {
    initAnswer(examId, paperId, duration) {
      this.examId = examId
      this.paperId = paperId
      this.startTime = Date.now()
      this.remainingTime = duration * 60
      this.loadFromLocal()
      this.startAutoSave()
      this.startCountdown()
    },

    async saveAnswer(questionId, answer) {
      this.answers[questionId] = answer
      this.saveToLocal()
      try {
        await saveAnswer(this.examId, questionId, answer)
      } catch (error) {
        console.error('保存答案失败:', error)
      }
    },

    toggleMark(questionId) {
      const index = this.marked.indexOf(questionId)
      if (index > -1) {
        this.marked.splice(index, 1)
      } else {
        this.marked.push(questionId)
      }
      this.saveToLocal()
    },

    setCurrentQuestion(index) {
      this.currentQuestionIndex = index
    },

    nextQuestion() {
      const totalCount = this.questions.length
      if (this.currentQuestionIndex < totalCount - 1) {
        this.currentQuestionIndex++
      }
    },

    prevQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--
      }
    },

    startAutoSave() {
      if (this.autoSaveTimer) clearInterval(this.autoSaveTimer)
      this.autoSaveTimer = setInterval(() => {
        this.syncToServer()
      }, 30000)
    },

    startCountdown() {
      if (this.countdownTimer) clearInterval(this.countdownTimer)
      this.countdownTimer = setInterval(() => {
        if (this.remainingTime > 0) {
          this.remainingTime--
          this.saveToLocal()
        } else {
          this.stopCountdown()
        }
      }, 1000)
    },

    stopCountdown() {
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer)
        this.countdownTimer = null
      }
    },

    stopAutoSave() {
      if (this.autoSaveTimer) {
        clearInterval(this.autoSaveTimer)
        this.autoSaveTimer = null
      }
    },

    async syncToServer() {
      if (!navigator.onLine) return
      try {
        await syncAnswers(this.examId, {
          answers: this.answers,
          marked: this.marked,
          currentQuestionIndex: this.currentQuestionIndex,
        })
      } catch (error) {
        console.error('同步答案失败:', error)
      }
    },

    saveToLocal() {
      const data = {
        examId: this.examId,
        paperId: this.paperId,
        answers: this.answers,
        marked: this.marked,
        currentQuestionIndex: this.currentQuestionIndex,
        startTime: this.startTime,
        remainingTime: this.remainingTime,
      }
      localStorage.setItem(STORAGE_KEY_PREFIX + this.examId, JSON.stringify(data))
    },

    loadFromLocal() {
      const data = localStorage.getItem(STORAGE_KEY_PREFIX + this.examId)
      if (data) {
        try {
          const parsed = JSON.parse(data)
          this.answers = parsed.answers || {}
          this.marked = parsed.marked || []
          this.currentQuestionIndex = parsed.currentQuestionIndex || 0
          if (parsed.startTime && parsed.remainingTime) {
            const elapsed = Math.floor((Date.now() - parsed.startTime) / 1000)
            this.remainingTime = Math.max(0, parsed.remainingTime - elapsed)
          }
        } catch (error) {
          console.error('恢复本地数据失败:', error)
        }
      }
    },

    clearLocal() {
      localStorage.removeItem(STORAGE_KEY_PREFIX + this.examId)
    },

    reset() {
      this.stopCountdown()
      this.stopAutoSave()
      this.clearLocal()
      this.$reset()
    },
  },
})
