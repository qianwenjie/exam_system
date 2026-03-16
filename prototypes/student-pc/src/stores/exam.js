import { defineStore } from 'pinia'
import { getExamList, getExamDetail } from '@/api/exam'

export const useExamStore = defineStore('exam', {
  state: () => ({
    examList: [],
    currentExam: null,
    currentPaper: null,
    loading: false,
    faceVerifiedExams: new Set(),
    submittedExams: new Set(),
  }),

  getters: {
    examStatus: (state) => {
      if (!state.currentExam) return null
      const now = Date.now()
      const startTime = new Date(state.currentExam.startTime).getTime()
      const endTime = new Date(state.currentExam.endTime).getTime()

      if (now < startTime) return 'not_started'
      if (now > endTime) return 'ended'
      return 'in_progress'
    },

    canEnter: (state) => {
      if (!state.currentExam) return false
      const status = state.examStatus
      return status === 'in_progress' && state.currentExam.myStatus !== 'submitted'
    },
  },

  actions: {
    async fetchExamList(params = {}) {
      this.loading = true
      try {
        const data = await getExamList(params)
        this.examList = data.list || []
        return data
      } finally {
        this.loading = false
      }
    },

    async fetchExamDetail(examId) {
      this.loading = true
      try {
        const data = await getExamDetail(examId)
        this.currentExam = data
        return data
      } finally {
        this.loading = false
      }
    },

    setCurrentPaper(paper) {
      this.currentPaper = paper
    },

    clearCurrentExam() {
      this.currentExam = null
      this.currentPaper = null
    },

    setFaceVerified(examId) {
      this.faceVerifiedExams.add(examId)
    },

    isFaceVerified(examId) {
      return this.faceVerifiedExams.has(examId)
    },

    setSubmitted(examId) {
      this.submittedExams.add(examId)
    },

    isSubmitted(examId) {
      return this.submittedExams.has(examId)
    },
  },
})
