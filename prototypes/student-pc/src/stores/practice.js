import { defineStore } from 'pinia'
import { getPracticeTasks, getPracticeDetail, getPracticeQuestions } from '@/api/practice'
import { mockWrongBook, mockFavorites, mockFavoriteBook } from '@/mock/practice'

export const usePracticeStore = defineStore('practice', {
  state: () => ({
    taskList: [],
    currentTask: null,
    questions: [],
    currentQuestionIndex: 0,
    answers: {},        // { qId: userAnswer }
    results: {},        // { qId: { isCorrect, answeredAt } }
    favorites: [],      // 收藏的题目ID
    favoriteBook: {},   // { qId: question } 收藏题目的完整信息
    wrongBook: {},      // { qId: { wrongCount, lastWrongTime, mastered, masteredTime, sourceTaskId, sourceTaskName, question, userAnswers: [] } }
    loading: false,
  }),

  getters: {
    currentQuestion(state) {
      return state.questions[state.currentQuestionIndex] || null
    },
    answeredCount(state) {
      return Object.keys(state.results).length
    },
    correctCount(state) {
      return Object.values(state.results).filter(r => r.isCorrect).length
    },
    wrongCount(state) {
      return Object.values(state.results).filter(r => !r.isCorrect).length
    },
    masteredRate(state) {
      if (!state.questions.length) return 0
      return Math.round((this.correctCount / state.questions.length) * 100)
    },
    isPassed(state) {
      if (!state.currentTask) return false
      return this.masteredRate >= (state.currentTask.passRate || 60)
    },
    // 答题卡数据
    answerSheetData(state) {
      return state.questions.map((q, index) => {
        const result = state.results[q.id]
        let status = 'unanswered'
        if (result) {
          status = result.isCorrect ? 'correct' : 'wrong'
        }
        return { index, id: q.id, typeName: q.typeName, status }
      })
    },
    // 全局错题列表（按任务分组）
    wrongBookByTask(state) {
      const grouped = {}
      // 构建 taskId -> taskName 的查找表（优先从 taskList 取真实名称）
      const taskNameMap = {}
      state.taskList.forEach(t => { taskNameMap[t.id] = t.name })
      Object.entries(state.wrongBook).forEach(([qId, info]) => {
        const taskId = info.sourceTaskId
        if (!grouped[taskId]) {
          grouped[taskId] = {
            taskId,
            taskName: taskNameMap[taskId] || info.sourceTaskName || taskId,
            wrongItems: [],      // 未掌握的错题
            masteredItems: [],   // 已掌握的题目
            wrongCount: 0,
            masteredCount: 0
          }
        }
        if (info.mastered) {
          grouped[taskId].masteredItems.push({ qId, ...info })
          grouped[taskId].masteredCount++
        } else {
          grouped[taskId].wrongItems.push({ qId, ...info })
          grouped[taskId].wrongCount++
          // userAnswers.length === 1 表示只答错过一次、从未重做
          if ((info.userAnswers?.length || 1) <= 1) {
            grouped[taskId].notRedoneCount = (grouped[taskId].notRedoneCount || 0) + 1
          }
        }
      })
      return Object.values(grouped)
    },
    // 按题型分类
    wrongBookByType(state) {
      const grouped = {}
      Object.entries(state.wrongBook).forEach(([qId, info]) => {
        const type = info.question?.type || 'unknown'
        const typeName = info.question?.typeName || '未知题型'
        if (!grouped[type]) {
          grouped[type] = {
            type,
            typeName,
            wrongItems: [],
            masteredItems: [],
            wrongCount: 0,
            masteredCount: 0
          }
        }
        if (info.mastered) {
          grouped[type].masteredItems.push({ qId, ...info })
          grouped[type].masteredCount++
        } else {
          grouped[type].wrongItems.push({ qId, ...info })
          grouped[type].wrongCount++
        }
      })
      return Object.values(grouped)
    },
    totalWrongCount(state) {
      return Object.values(state.wrongBook).filter(w => !w.mastered).length
    },
    totalMasteredWrongCount(state) {
      return Object.values(state.wrongBook).filter(w => w.mastered).length
    },
  },

  actions: {
    // 获取任务列表
    async fetchTaskList(params = {}) {
      this.loading = true
      try {
        const data = await getPracticeTasks(params)
        this.taskList = data.list || []
        return data
      } finally {
        this.loading = false
      }
    },

    // 获取任务详情
    async fetchTaskDetail(taskId) {
      this.loading = true
      try {
        const data = await getPracticeDetail(taskId)
        this.currentTask = data
        return data
      } finally {
        this.loading = false
      }
    },

    // 初始化刷题（加载题目 + 恢复进度）
    // drawCount > 0 时从题库随机抽取（随机模式）
    // skipLoadProgress = true 时不从 localStorage 恢复（由外部注入进度）
    async initPractice(taskId, { drawCount = 0, skipLoadProgress = false } = {}) {
      this.loading = true
      this._wrongRedoMode = false // 非错题重做模式
      try {
        const questions = await getPracticeQuestions(taskId, { drawCount })
        this.questions = questions
        this.currentQuestionIndex = 0
        if (!skipLoadProgress) {
          this.loadProgress(taskId)
        }
        return questions
      } finally {
        this.loading = false
      }
    },

    // 提交答案
    submitAnswer(qId, answer, isCorrect, extra = null) {
      this.answers[qId] = answer
      this.results[qId] = { isCorrect, answeredAt: new Date().toISOString(), ...(extra || {}) }

      // 简答题：准确率>=80%不纳入错题集
      const isEssay = extra?.type === 'essay'
      const shouldAddToWrongBook = isEssay ? (extra.accuracy < 80) : !isCorrect

      // 错题自动加入错题本
      if (shouldAddToWrongBook) {
        const question = this.questions.find(q => q.id === qId)
        const existing = this.wrongBook[qId]

        // 构建用户作答记录
        const answerRecord = {
          answer,
          isCorrect: false,
          answeredAt: new Date().toISOString()
        }

        this.wrongBook[qId] = {
          qId,
          wrongCount: (existing?.wrongCount || 0) + 1,
          lastWrongTime: new Date().toISOString(),
          mastered: false,
          masteredTime: null,
          sourceTaskId: this.currentTask?.id,
          sourceTaskName: this.currentTask?.name,
          question: question ? { ...question } : null,
          userAnswers: existing?.userAnswers ? [...existing.userAnswers, answerRecord] : [answerRecord]
        }
        this.saveWrongBook()
      }

      this.saveProgress(this.currentTask?.id)
    },

    // 切换收藏
    toggleFavorite(qId, question) {
      const idx = this.favorites.indexOf(qId)
      if (idx > -1) {
        this.favorites.splice(idx, 1)
        delete this.favoriteBook[qId]
      } else {
        this.favorites.push(qId)
        // 保存题目信息：优先用传入的，其次从 wrongBook 找，最后从 questions 找
        const q = question
          || this.wrongBook[qId]?.question
          || this.questions.find(q => q.id === qId)
        if (q) this.favoriteBook[qId] = q
      }
      this.saveFavorites()
    },

    // 标记已掌握
    markMastered(qId) {
      if (this.wrongBook[qId]) {
        this.wrongBook[qId].mastered = true
        this.wrongBook[qId].masteredTime = new Date().toISOString()
        this.saveWrongBook()
      }
    },

    // 记录错题重做尝试（不管对错，标记为"已重做过"，用于 notRedoneCount 统计）
    recordRedoAttempt(qId) {
      const entry = this.wrongBook[qId]
      if (entry && !entry.mastered) {
        entry.userAnswers = [...(entry.userAnswers || []), { answeredAt: new Date().toISOString(), isRedo: true }]
        this.saveWrongBook()
      }
    },

    // 标记该题已重做正确（解锁"标记已掌握"入口）
    setRedoCorrect(qId) {
      if (this.wrongBook[qId]) {
        this.wrongBook[qId].lastRedoCorrect = true
        this.saveWrongBook()
      }
    },

    // 重置重做正确状态（点"再做一次"时调用）
    clearRedoCorrect(qId) {
      if (this.wrongBook[qId]) {
        this.wrongBook[qId].lastRedoCorrect = false
        this.saveWrongBook()
      }
    },

    // 取消掌握（移回错题集）
    unmarkMastered(qId) {
      if (this.wrongBook[qId]) {
        this.wrongBook[qId].mastered = false
        this.wrongBook[qId].masteredTime = null
        this.saveWrongBook()
      }
    },

    // 移除错题
    removeFromWrongBook(qId) {
      if (this.wrongBook[qId]) {
        delete this.wrongBook[qId]
        this.saveWrongBook()
      }
    },

    // 导航
    nextQuestion() {
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++
      }
    },
    prevQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--
      }
    },
    setCurrentQuestion(index) {
      if (index >= 0 && index < this.questions.length) {
        this.currentQuestionIndex = index
      }
    },

    // 持久化：保存进度
    saveProgress(taskId) {
      if (!taskId) return
      const data = {
        answers: this.answers,
        results: this.results,
        currentQuestionIndex: this.currentQuestionIndex,
      }
      localStorage.setItem(`practice_${taskId}`, JSON.stringify(data))
      this.saveWrongBook()
    },

    // 持久化：加载进度
    loadProgress(taskId) {
      if (!taskId) return
      try {
        const raw = localStorage.getItem(`practice_${taskId}`)
        if (raw) {
          const data = JSON.parse(raw)
          this.answers = data.answers || {}
          this.results = data.results || {}
          // 安全检查：确保索引不超出范围
          const idx = data.currentQuestionIndex || 0
          this.currentQuestionIndex = idx < this.questions.length ? idx : 0
        } else {
          this.answers = {}
          this.results = {}
          this.currentQuestionIndex = 0
        }
      } catch {
        this.answers = {}
        this.results = {}
        this.currentQuestionIndex = 0
      }
      this.loadWrongBook()
      this.loadFavorites()
    },

    // 直接注入进度数据（用于查看历史刷题记录）
    loadProgressFromData(data) {
      this.answers = data.answers || {}
      this.results = data.results || {}
      this.currentQuestionIndex = 0
      this.loadWrongBook()
      this.loadFavorites()
    },

    // 持久化：错题本
    saveWrongBook() {
      localStorage.setItem('practice_wrongBook', JSON.stringify(this.wrongBook))
    },
    loadWrongBook() {
      try {
        const raw = localStorage.getItem('practice_wrongBook')
        if (raw) {
          this.wrongBook = JSON.parse(raw)
        } else {
          // 首次加载，注入 mock 数据
          this.wrongBook = { ...mockWrongBook }
          this.saveWrongBook()
        }
      } catch { /* ignore */ }
    },

    // 持久化：收藏
    saveFavorites() {
      localStorage.setItem('practice_favorites', JSON.stringify(this.favorites))
      localStorage.setItem('practice_favoriteBook', JSON.stringify(this.favoriteBook))
    },
    loadFavorites() {
      try {
        const raw = localStorage.getItem('practice_favorites')
        if (raw) {
          this.favorites = JSON.parse(raw)
          const rawBook = localStorage.getItem('practice_favoriteBook')
          if (rawBook) this.favoriteBook = JSON.parse(rawBook)
        } else {
          // 首次加载，注入 mock 数据
          this.favorites = [...mockFavorites]
          this.favoriteBook = { ...mockFavoriteBook }
          this.saveFavorites()
        }
      } catch { /* ignore */ }
    },

    // 重新刷题
    resetPractice(taskId) {
      this.answers = {}
      this.results = {}
      this.currentQuestionIndex = 0
      localStorage.removeItem(`practice_${taskId}`)
    },

    // 单题重做：只加载一道题
    initSingleRedo(qId) {
      const info = this.wrongBook[qId]
      if (!info?.question) return false
      this.questions = [{ ...info.question }]
      this.currentQuestionIndex = 0
      this.answers = {}
      this.results = {}
      return true
    },

    // 错题重做：加载指定任务的错题作为题目列表，清空答题状态
    initWrongRedo(taskId) {
      const wrongQuestions = Object.entries(this.wrongBook)
        .filter(([, info]) => info.sourceTaskId === taskId && !info.mastered && info.question)
        .map(([, info]) => ({ ...info.question }))
      this.questions = wrongQuestions
      this.currentQuestionIndex = 0
      this.answers = {}
      this.results = {}
      return wrongQuestions
    },

    // 按题型错题重做
    initWrongRedoByType(type) {
      const wrongQuestions = Object.entries(this.wrongBook)
        .filter(([, info]) => info.question?.type === type && !info.mastered && info.question)
        .map(([, info]) => ({ ...info.question }))
      this.questions = wrongQuestions
      this.currentQuestionIndex = 0
      this.answers = {}
      this.results = {}
      return wrongQuestions
    },
  },
})
