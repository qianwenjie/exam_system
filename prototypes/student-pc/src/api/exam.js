import request from '@/utils/request'
import { mockExamList, mockExamDetail, mockPaperQuestions, mockDocPaperQuestions, mockDocumentPages } from '@/mock/exam'

// 是否使用 Mock 数据
const USE_MOCK = true

/**
 * 考试相关 API
 */

// 获取考试列表
export function getExamList(params) {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let list = [...mockExamList]
        // 根据状态筛选
        if (params.status && params.status !== 'all') {
          list = list.filter(item => item.status === params.status)
        }
        resolve({
          list,
          total: list.length,
        })
      }, 500)
    })
  }
  return request({
    url: '/exams',
    method: 'get',
    params,
  })
}

// 获取考试详情
export function getExamDetail(examId) {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 根据 examId 从列表中查找对应的考试
        const exam = mockExamList.find(e => e.id === examId)
        if (exam) {
          resolve(exam)
        } else {
          // 如果找不到，返回默认的 mockExamDetail
          resolve(mockExamDetail)
        }
      }, 300)
    })
  }
  return request({
    url: `/exams/${examId}`,
    method: 'get',
  })
}

// 进入考试（获取试卷）
export function enterExam(examId) {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 根据 examId 查找考试信息，判断试卷模式
        const exam = mockExamList.find(e => e.id === examId)
        const isDocMode = exam?.paper?.mode === 'document'

        resolve({
          ...mockExamDetail,
          paper: {
            ...mockExamDetail.paper,
            mode: isDocMode ? 'document' : 'question',
            questions: isDocMode ? mockDocPaperQuestions : mockPaperQuestions,
            ...(isDocMode ? { documentPages: mockDocumentPages } : {}),
          },
        })
      }, 500)
    })
  }
  return request({
    url: `/exams/${examId}/enter`,
    method: 'post',
  })
}

// 提交人脸识别
export function submitFaceVerify(examId, data) {
  return request({
    url: `/exams/${examId}/face-verify`,
    method: 'post',
    data,
  })
}

// 保存答案
export function saveAnswer(examId, questionId, answer) {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true })
      }, 100)
    })
  }
  return request({
    url: `/exams/${examId}/answers/${questionId}`,
    method: 'post',
    data: { answer },
  })
}

// 同步答案（批量）
export function syncAnswers(examId, data) {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true })
      }, 100)
    })
  }
  return request({
    url: `/exams/${examId}/answers/sync`,
    method: 'post',
    data,
  })
}

// 上传附件
export function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 提交试卷
export function submitExam(examId, data) {
  return request({
    url: `/exams/${examId}/submit`,
    method: 'post',
    data,
  })
}

// 获取考试结果
export function getExamResult(examId) {
  return request({
    url: `/exams/${examId}/result`,
    method: 'get',
  })
}

// 获取成绩详情
export function getScoreDetail(examId) {
  return request({
    url: `/exams/${examId}/score`,
    method: 'get',
  })
}

// 获取答题详情（查看批阅）
export function getAnswerDetail(examId) {
  return request({
    url: `/exams/${examId}/review`,
    method: 'get',
  })
}
