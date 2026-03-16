import { mockPracticeTasks, mockPracticeQuestionsMap, mockProgressMap, mockSessionsMap } from '@/mock/practice'

const USE_MOCK = true

// 获取刷题任务列表
export function getPracticeTasks(params = {}) {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let list = [...mockPracticeTasks]
        if (params.status && params.status !== 'all') {
          list = list.filter(item => item.status === params.status)
        }
        if (params.keyword) {
          const kw = params.keyword.toLowerCase()
          list = list.filter(item => item.name.toLowerCase().includes(kw))
        }
        resolve({ list, total: list.length })
      }, 400)
    })
  }
}

// 获取刷题任务详情
export function getPracticeDetail(taskId) {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const task = mockPracticeTasks.find(t => t.id === taskId)
        resolve(task || null)
      }, 300)
    })
  }
}

// 获取刷题题目
// drawCount > 0 时从题库池随机抽取指定数量（随机模式）
export function getPracticeQuestions(taskId, { drawCount = 0 } = {}) {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const pool = [...(mockPracticeQuestionsMap[taskId] || [])]
        let questions
        if (drawCount > 0 && drawCount < pool.length) {
          // Fisher-Yates 洗牌后取前 N 道
          for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]]
          }
          questions = pool.slice(0, drawCount)
        } else {
          questions = pool
        }

        // 已结束任务：如果 localStorage 没有进度，注入预设答题记录
        const storageKey = `practice_${taskId}`
        if (!localStorage.getItem(storageKey) && mockProgressMap[taskId]) {
          localStorage.setItem(storageKey, JSON.stringify(mockProgressMap[taskId]))
        }

        resolve(questions)
      }, 300)
    })
  }
}

// 获取已结束任务的刷题历史记录列表
export function getPracticeSessions(taskId) {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockSessionsMap[taskId] || [])
      }, 200)
    })
  }
}
