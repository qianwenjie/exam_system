import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMessageStore = defineStore('message', () => {
  const messages = ref([
    {
      id: 1,
      type: 'exam',
      subType: 'exam_new',
      title: '新考试任务发布',
      content: '《数据结构与算法》考试已发布，考试时间：2026年3月10日 09:00，请及时查看并做好准备。',
      taskId: 'e001',
      time: '2026-02-27 09:00',
      isRead: false,
    },
    {
      id: 2,
      type: 'exam',
      subType: 'exam_soon',
      title: '考试即将开始',
      content: '您报名的《计算机网络基础》将于明天上午 9:00 开始，请提前做好准备，确保网络畅通。',
      taskId: 'e002',
      time: '2026-02-26 09:00',
      isRead: false,
    },
    {
      id: 9,
      type: 'exam',
      subType: 'exam_soon',
      title: '考试 1 小时后开始',
      content: '《计算机网络基础》将于 1 小时后（10:00）正式开始，请立即做好准备，确保设备和网络正常。',
      taskId: 'e002',
      time: '2026-02-27 09:00',
      isRead: false,
    },
    {
      id: 3,
      type: 'score',
      subType: 'score_published',
      title: '成绩已发布',
      content: '您参加的《操作系统原理》考试成绩已发布，本次得分 82 分，点击查看详细成绩单。',
      taskId: 'r001',
      time: '2026-02-25 15:30',
      isRead: false,
    },
    {
      id: 4,
      type: 'practice',
      subType: 'practice_new',
      title: '新刷题任务',
      content: '老师为您布置了新的刷题任务《数据库系统概论》，共 30 道题，截止日期：2026年3月5日。',
      taskId: 'pt004',
      time: '2026-02-24 10:00',
      isRead: false,
    },
    {
      id: 6,
      type: 'score',
      subType: 'score_published',
      title: '成绩已发布',
      content: '您参加的《数据结构与算法》考试成绩已发布，本次得分 91 分，排名第 3，点击查看详情。',
      taskId: 'r002',
      time: '2026-02-20 14:00',
      isRead: true,
    },
    {
      id: 7,
      type: 'exam',
      subType: 'exam_new',
      title: '新考试任务发布',
      content: '《英语四级模拟》考试已发布，考试时间：2026年3月15日 14:00，本次考试为限时 120 分钟。',
      taskId: 'e003',
      time: '2026-02-18 11:00',
      isRead: true,
    },
    {
      id: 8,
      type: 'practice',
      subType: 'practice_new',
      title: '新刷题任务',
      content: '老师为您布置了新的刷题任务《计算机网络冲刺》，共 15 道题，截止日期：2026年2月28日。',
      taskId: 'pt002',
      time: '2026-02-15 09:30',
      isRead: true,
    },
  ])

  const unreadCount = computed(() => messages.value.filter(m => !m.isRead).length)

  const markRead = (id) => {
    const msg = messages.value.find(m => m.id === id)
    if (msg) msg.isRead = true
  }

  const markAllRead = () => {
    messages.value.forEach(m => { m.isRead = true })
  }

  const syncPracticeSoon = (tasks) => {
    const now = Date.now()
    const THREE_DAYS = 3 * 24 * 60 * 60 * 1000
    messages.value = messages.value.filter(m => m.subType !== 'practice_soon')
    tasks.forEach(task => {
      const endTs = new Date(task.endTime).getTime()
      const remaining = endTs - now
      if (remaining <= 0 || task.status === 'ended') return
      if (task.answeredCount >= task.totalQuestions) return
      if (remaining > THREE_DAYS) return
      const daysLeft = Math.ceil(remaining / (24 * 60 * 60 * 1000))
      const progress = task.totalQuestions > 0
        ? Math.round((task.answeredCount / task.totalQuestions) * 100) : 0
      const daysText = daysLeft === 1 ? '明天' : `${daysLeft} 天后`
      messages.value.push({
        id: `practice_soon_${task.id}`,
        type: 'practice',
        subType: 'practice_soon',
        title: '刷题任务即将结束',
        content: `刷题任务《${task.name}》将于 ${daysText} 截止，您当前完成进度 ${progress}%，请抓紧时间完成。`,
        taskId: task.id,
        time: new Date().toISOString(),
        isRead: false,
      })
    })
  }

  return { messages, unreadCount, markRead, markAllRead, syncPracticeSoon }
})
