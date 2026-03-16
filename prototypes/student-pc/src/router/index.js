import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/exam/list',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { title: '登录', public: true },
  },
  {
    path: '/exam',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: 'list',
        name: 'ExamList',
        component: () => import('@/views/exam/ExamList.vue'),
        meta: { title: '考试列表' },
      },
      {
        path: 'detail/:id',
        name: 'ExamDetail',
        component: () => import('@/views/exam/ExamDetail.vue'),
        meta: { title: '考试详情' },
      },
      {
        path: 'score-stats',
        name: 'ExamScoreStats',
        component: () => import('@/views/exam/ExamScoreStats.vue'),
        meta: { title: '成绩统计' },
      },
    ],
  },
  {
    path: '/exam/face-verify/:id',
    name: 'FaceVerify',
    component: () => import('@/views/exam/FaceVerify.vue'),
    meta: { title: '人脸识别' },
  },
  {
    path: '/exam/answer/:id',
    name: 'ExamAnswer',
    component: () => import('@/views/exam/ExamAnswer.vue'),
    meta: { title: '在线答题' },
  },
  {
    path: '/exam/answer-doc/:id',
    name: 'ExamAnswerDoc',
    component: () => import('@/views/exam/ExamAnswerDoc.vue'),
    meta: { title: '文档答题' },
  },
  {
    path: '/exam/success/:id',
    name: 'ExamSuccess',
    component: () => import('@/views/exam/ExamSuccess.vue'),
    meta: { title: '提交成功' },
  },
  {
    path: '/exam/review/:id',
    name: 'ExamReview',
    component: () => import('@/views/exam/ExamReview.vue'),
    meta: { title: '答案详情' },
  },
  {
    path: '/exam/review-doc/:id',
    name: 'ExamReviewDoc',
    component: () => import('@/views/exam/ExamReviewDoc.vue'),
    meta: { title: '答案详情' },
  },
  // 统计模块
  {
    path: '/stats',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        redirect: '/stats/exam',
      },
      {
        path: '',
        component: () => import('@/layouts/StatsLayout.vue'),
        children: [
          {
            path: 'exam',
            name: 'ExamStats',
            component: () => import('@/views/stats/ExamStats.vue'),
            meta: { title: '成绩统计' },
          },
          {
            path: 'practice',
            name: 'StatsPractice',
            component: () => import('@/views/stats/PracticeStats.vue'),
            meta: { title: '刷题统计' },
          },
        ],
      },
    ],
  },
  // 个人中心
  {
    path: '/profile',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'Profile',
        component: () => import('@/views/profile/Profile.vue'),
        meta: { title: '个人中心' },
      },
    ],
  },
  // 消息模块
  {
    path: '/message',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'Message',
        component: () => import('@/views/message/Message.vue'),
        meta: { title: '消息中心' },
      },
    ],
  },
  // 刷题模块 - MainLayout 内页面
  {
    path: '/practice',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: 'list',
        name: 'PracticeList',
        component: () => import('@/views/practice/PracticeList.vue'),
        meta: { title: '刷题练习' },
      },
      {
        path: 'detail/:id',
        name: 'PracticeDetail',
        component: () => import('@/views/practice/PracticeDetail.vue'),
        meta: { title: '任务详情' },
      },
      {
        path: 'stats',
        redirect: '/stats/practice',
      },
      {
        path: 'wrong-book',
        name: 'WrongBook',
        component: () => import('@/views/practice/WrongBook.vue'),
        meta: { title: '错题本' },
      },
      {
        path: 'wrong-book/review/:id',
        name: 'WrongBookReview',
        component: () => import('@/views/practice/WrongBookReview.vue'),
        meta: { title: '错题回顾' },
      },
      {
        path: 'wrong-book/mastered/:id',
        name: 'WrongBookMastered',
        component: () => import('@/views/practice/WrongBookMastered.vue'),
        meta: { title: '已掌握题集' },
      },
      {
        path: 'favorites',
        name: 'FavoriteList',
        component: () => import('@/views/practice/FavoriteList.vue'),
        meta: { title: '收藏夹' },
      },
      {
        path: 'stats',
        name: 'PracticeStats',
        component: () => import('@/views/practice/PracticeStats.vue'),
        meta: { title: '刷题统计' },
      },
    ],
  },
  // 刷题答题页 - 全屏，脱离 MainLayout
  {
    path: '/practice/answer/:id',
    name: 'PracticeAnswer',
    component: () => import('@/views/practice/PracticeAnswer.vue'),
    meta: { title: '刷题答题' },
  },
  // 刷题结果页 - 全屏，脱离 MainLayout
  {
    path: '/practice/result/:id',
    name: 'PracticeResult',
    component: () => import('@/views/practice/PracticeResult.vue'),
    meta: { title: '刷题结果' },
  },
  // 错题复习 - 复用答题页
  {
    path: '/practice/wrong-book/practice/:id',
    name: 'WrongBookPractice',
    component: () => import('@/views/practice/PracticeAnswer.vue'),
    meta: { title: '错题复习' },
  },
  // 单题重做：:id 为 qId，从错题本取题目
  {
    path: '/practice/wrong-book/redo/:id',
    name: 'WrongBookRedo',
    component: () => import('@/views/practice/PracticeAnswer.vue'),
    meta: { title: '错题重做' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title + ' - 考试系统'
  }
  const token = localStorage.getItem('token')
  const isPublicRoute = to.meta.public === true

  if (!token && !isPublicRoute) {
    next('/login')
  } else if (token && to.path === '/login') {
    next('/exam/list')
  } else {
    next()
  }
})

export default router
