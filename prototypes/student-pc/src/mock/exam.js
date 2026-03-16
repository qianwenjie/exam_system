/**
 * Mock 数据 - 考试列表
 */

// 动态生成未来时间
const now = new Date()
const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000)
const in10Minutes = new Date(now.getTime() + 10 * 60 * 1000)

const formatDate = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}:00`
}

export const mockExamList = [
  // 1. 未开始 + 不允许提前进入
  {
    id: 'exam001',
    name: '2026年春季期中考试',
    startTime: formatDate(in3Days),
    endTime: formatDate(new Date(in3Days.getTime() + 2 * 60 * 60 * 1000)),
    duration: 120,
    status: 'not_started',
    myStatus: 'not_started',
    score: null,
    totalScore: 100,
    paper: {
      id: 'paper001',
      name: '计算机基础综合试卷',
      questionCount: 50,
      mode: 'question',
    },
    config: {
      enableFaceRecognition: true,
      allowSkipFaceVerify: false,
      enableRandomCapture: true,
      captureCount: 3,
      allowEarlyEntry: false,
      earlyMinutes: 0,
      allowLateEntry: false,
      lateMinutes: 0,
      minAnswerTime: 30,
      maxAttempts: 1,
      currentAttempt: 0,
    },
    description: '本次考试为期中考试，请认真作答。',
  },
  // 2. 未开始 + 允许提前进入但还不能点击（2小时后开始，提前15分钟）
  {
    id: 'exam002',
    name: '高等数学期末考试',
    startTime: formatDate(in2Hours),
    endTime: formatDate(new Date(in2Hours.getTime() + 2.5 * 60 * 60 * 1000)),
    duration: 150,
    status: 'not_started',
    myStatus: 'not_started',
    score: null,
    totalScore: 150,
    paper: {
      id: 'paper002',
      name: '高等数学综合试卷',
      questionCount: 25,
      mode: 'question',
    },
    config: {
      enableFaceRecognition: true,
      allowSkipFaceVerify: false,
      enableRandomCapture: true,
      captureCount: 5,
      allowEarlyEntry: true,
      earlyMinutes: 15,
      allowLateEntry: false,
      lateMinutes: 0,
      minAnswerTime: 60,
      maxAttempts: 1,
      currentAttempt: 0,
    },
    description: '高等数学期末考试，涵盖微积分、线性代数等内容。',
  },
  // 3. 未开始 + 可以提前进入（10分钟后开始，提前15分钟）
  {
    id: 'exam003',
    name: '程序设计基础测验',
    startTime: formatDate(in10Minutes),
    endTime: formatDate(new Date(in10Minutes.getTime() + 1 * 60 * 60 * 1000)),
    duration: 60,
    status: 'not_started',
    myStatus: 'not_started',
    score: null,
    totalScore: 100,
    paper: {
      id: 'paper003',
      name: 'C语言基础试卷',
      questionCount: 30,
      mode: 'document',
    },
    config: {
      enableFaceRecognition: true,
      allowSkipFaceVerify: true,
      enableRandomCapture: true,
      captureCount: 2,
      allowEarlyEntry: true,
      earlyMinutes: 15,
      allowLateEntry: true,
      lateMinutes: 10,
      minAnswerTime: 15,
      maxAttempts: 1,
      currentAttempt: 0,
    },
    description: 'C语言程序设计基础测验，涵盖变量、循环、函数等基础知识。',
  },
  // 4. 进行中 + 文档模式
  {
    id: 'exam004',
    name: '计算机网络期末考试',
    startTime: formatDate(new Date(now.getTime() - 20 * 60 * 1000)),
    endTime: formatDate(new Date(now.getTime() + 100 * 60 * 1000)),
    duration: 120,
    status: 'in_progress',
    myStatus: 'not_started',
    score: null,
    totalScore: 100,
    paper: {
      id: 'paper004',
      name: '计算机网络综合试卷',
      questionCount: 15,
      mode: 'document',
    },
    config: {
      enableFaceRecognition: true,
      allowSkipFaceVerify: true,
      enableRandomCapture: true,
      captureCount: 3,
      allowEarlyEntry: false,
      earlyMinutes: 0,
      allowLateEntry: true,
      lateMinutes: 15,
      minAnswerTime: 1,
      maxAttempts: 1,
      currentAttempt: 0,
    },
    description: '本次考试为计算机网络期末考试，采用文档模式，请边阅读试卷边作答。',
  },
  // 5. 进行中 + 抽题模式
  {
    id: 'exam005',
    name: '数据结构与算法测试',
    startTime: formatDate(new Date(now.getTime() - 30 * 60 * 1000)),
    endTime: formatDate(new Date(now.getTime() + 60 * 60 * 1000)),
    duration: 90,
    status: 'in_progress',
    myStatus: 'not_started',
    score: null,
    totalScore: 100,
    paper: {
      id: 'paper005',
      name: '数据结构试卷A',
      questionCount: 12,
      mode: 'question',
    },
    config: {
      enableFaceRecognition: true,
      allowSkipFaceVerify: true,
      enableRandomCapture: true,
      captureCount: 3,
      allowEarlyEntry: true,
      earlyMinutes: 15,
      allowLateEntry: true,
      lateMinutes: 15,
      minAnswerTime: 1,
      maxAttempts: 2,
      currentAttempt: 0,
    },
    description: '本次测试涵盖数据结构的核心知识点，包括线性表、树、图等内容。',
  },
  // 6. 已结束 + 文档模式
  {
    id: 'exam006',
    name: '英语四级模拟测试',
    startTime: '2026-01-25 22:00:00',
    endTime: '2026-01-26 01:00:00',
    duration: 120,
    status: 'ended',
    myStatus: 'submitted',
    score: 78,
    totalScore: 100,
    paper: {
      id: 'paper006',
      name: '英语四级模拟试卷',
      questionCount: 60,
      mode: 'document',
    },
    config: {
      enableFaceRecognition: false,
      allowSkipFaceVerify: false,
      enableRandomCapture: false,
      captureCount: 0,
      allowEarlyEntry: false,
      earlyMinutes: 0,
      allowLateEntry: false,
      lateMinutes: 0,
      minAnswerTime: 60,
      scorePublishMode: 'immediate',
      scorePublishContent: 'full',
      scorePublishDelay: 0,
      maxAttempts: 1,
      currentAttempt: 1,
    },
    statistics: {
      totalQuestions: 60,
      correctCount: 45,
      wrongCount: 10,
      partialCount: 5,
    },
    description: '英语四级模拟测试，包含听力、阅读、翻译和写作。',
  },
  // 7. 已结束 + 抽题模式
  {
    id: 'exam007',
    name: '操作系统原理考试',
    startTime: '2026-01-28 10:00:00',
    endTime: '2026-01-28 12:00:00',
    duration: 120,
    status: 'ended',
    myStatus: 'submitted',
    score: 85,
    totalScore: 100,
    paper: {
      id: 'paper007',
      name: '操作系统综合试卷',
      questionCount: 45,
      mode: 'question',
    },
    config: {
      enableFaceRecognition: true,
      allowSkipFaceVerify: false,
      enableRandomCapture: true,
      captureCount: 5,
      allowEarlyEntry: false,
      earlyMinutes: 0,
      allowLateEntry: false,
      lateMinutes: 0,
      minAnswerTime: 30,
      scorePublishMode: 'immediate',
      scorePublishContent: 'full',
      scorePublishDelay: 3,
      maxAttempts: 2,
      currentAttempt: 1,
    },
    statistics: {
      totalQuestions: 45,
      correctCount: 32,
      wrongCount: 8,
      partialCount: 5,
    },
    description: '本次考试涵盖操作系统的核心知识点，包括进程管理、内存管理、文件系统等内容。',
  },
]

/**
 * Mock 数据 - 考试提交结果
 * 用于 ExamSuccess 页面展示
 */
export const mockExamResult = {
  examId: 'exam002',
  paperMode: 'question',
  examName: '数据结构与算法测试',
  submitTime: formatDate(new Date()),
  duration: 83,
  totalScore: 108,
  score: 86,
  examEndTime: formatDate(new Date(now.getTime() + 60 * 60 * 1000)),

  // 成绩公布配置（原型切换用）
  scorePublishMode: 'immediate',
  scorePublishContent: 'full',
  scorePublishDelay: 3,

  // 答题统计
  statistics: {
    totalQuestions: 15,
    correctCount: 9,
    wrongCount: 4,
    partialCount: 2,
  },

  // 按题型分组的题目结果
  questionGroups: [
    {
      type: 'single',
      typeName: '单选题',
      totalScore: 10,
      gainedScore: 8,
      questions: [
        {
          id: 'q001', index: 1,
          content: '以下哪种数据结构是先进先出（FIFO）的？',
          score: 2, studentScore: 2, status: 'correct',
          options: [
            { label: 'A', text: '栈' },
            { label: 'B', text: '队列' },
            { label: 'C', text: '链表' },
            { label: 'D', text: '树' },
          ],
          studentAnswer: 'B', correctAnswer: 'B',
          explanation: '队列是一种先进先出（FIFO）的数据结构，元素从队尾入队，从队头出队。',
        },
        {
          id: 'q002', index: 2,
          content: '二叉树的前序遍历顺序是？',
          score: 2, studentScore: 0, status: 'wrong',
          options: [
            { label: 'A', text: '根-左-右' },
            { label: 'B', text: '左-根-右' },
            { label: 'C', text: '左-右-根' },
            { label: 'D', text: '右-根-左' },
          ],
          studentAnswer: 'B', correctAnswer: 'A',
          explanation: '前序遍历的顺序是：先访问根节点，再遍历左子树，最后遍历右子树（根-左-右）。',
        },
        {
          id: 'q002a', index: 3,
          content: '在一个长度为n的顺序表中，删除第i个元素需要移动多少个元素？',
          score: 2, studentScore: 2, status: 'correct',
          options: [
            { label: 'A', text: 'n-i' },
            { label: 'B', text: 'n-i+1' },
            { label: 'C', text: 'n-i-1' },
            { label: 'D', text: 'i' },
          ],
          studentAnswer: 'A', correctAnswer: 'A',
          explanation: '删除第i个元素后，第i+1到第n个元素都需要向前移动一位，共n-i个元素。',
        },
        {
          id: 'q002b', index: 4,
          content: '下列排序算法中，平均时间复杂度为O(nlogn)的是？',
          score: 2, studentScore: 2, status: 'correct',
          options: [
            { label: 'A', text: '冒泡排序' },
            { label: 'B', text: '插入排序' },
            { label: 'C', text: '快速排序' },
            { label: 'D', text: '选择排序' },
          ],
          studentAnswer: 'C', correctAnswer: 'C',
          explanation: '快速排序的平均时间复杂度为O(nlogn)，冒泡、插入、选择排序的平均时间复杂度均为O(n²)。',
        },
        {
          id: 'q002c', index: 5,
          content: '设栈的入栈序列为1,2,3,4，则下列不可能的出栈序列是？',
          score: 2, studentScore: 2, status: 'correct',
          options: [
            { label: 'A', text: '1,2,3,4' },
            { label: 'B', text: '4,3,2,1' },
            { label: 'C', text: '1,3,2,4' },
            { label: 'D', text: '4,1,2,3' },
          ],
          studentAnswer: 'D', correctAnswer: 'D',
          explanation: '4先出栈意味着1,2,3都在栈中，此时栈顶为3，不可能先出1再出2。',
        },
      ],
    },
    {
      type: 'multiple',
      typeName: '多选题',
      totalScore: 6,
      gainedScore: 3,
      questions: [
        {
          id: 'q003', index: 6,
          content: '以下哪些是线性数据结构？（多选）',
          score: 3, studentScore: 3, status: 'correct',
          options: [
            { label: 'A', text: '数组' },
            { label: 'B', text: '链表' },
            { label: 'C', text: '树' },
            { label: 'D', text: '栈' },
            { label: 'E', text: '图' },
          ],
          studentAnswer: ['A', 'B', 'D'], correctAnswer: ['A', 'B', 'D'],
          explanation: '数组、链表、栈都是线性数据结构，树和图是非线性数据结构。',
        },
        {
          id: 'q004', index: 7,
          content: '关于哈希表，以下说法正确的是？（多选）',
          score: 3, studentScore: 0, status: 'wrong',
          options: [
            { label: 'A', text: '查找时间复杂度为O(1)' },
            { label: 'B', text: '可能发生哈希冲突' },
            { label: 'C', text: '需要额外的存储空间' },
            { label: 'D', text: '不支持范围查询' },
          ],
          studentAnswer: ['A', 'B'], correctAnswer: ['A', 'B', 'C', 'D'],
          explanation: '以上四项都是正确的。哈希表平均查找O(1)，会发生冲突，需要额外空间，且不支持范围查询。',
        },
      ],
    },
    {
      type: 'judge',
      typeName: '判断题',
      totalScore: 4,
      gainedScore: 2,
      questions: [
        {
          id: 'q005', index: 8,
          content: '二叉树的前序遍历和中序遍历可以唯一确定一棵二叉树。',
          score: 2, studentScore: 2, status: 'correct',
          studentAnswer: true, correctAnswer: true,
          explanation: '已知前序遍历和中序遍历，可以唯一确定一棵二叉树。',
        },
        {
          id: 'q006', index: 9,
          content: '栈是一种后进先出（LIFO）的数据结构。',
          score: 2, studentScore: 0, status: 'wrong',
          studentAnswer: false, correctAnswer: true,
          explanation: '栈（Stack）是一种后进先出（Last In First Out）的数据结构。',
        },
      ],
    },
    {
      type: 'blank',
      typeName: '填空题',
      totalScore: 7,
      gainedScore: 5,
      questions: [
        {
          id: 'q007', index: 10,
          content: '在一个有n个顶点的无向完全图中，边的数量为___。',
          score: 3, studentScore: 3, status: 'correct',
          studentAnswer: ['n(n-1)/2'], correctAnswer: ['n(n-1)/2'],
          explanation: '无向完全图中每两个顶点之间都有一条边，组合数为C(n,2)=n(n-1)/2。',
        },
        {
          id: 'q008', index: 11,
          content: '快速排序的平均时间复杂度是___，最坏情况时间复杂度是___。',
          score: 4, studentScore: 2, status: 'partial',
          studentAnswer: ['O(nlogn)', 'O(n²logn)'], correctAnswer: ['O(nlogn)', 'O(n²)'],
          explanation: '快速排序平均时间复杂度为O(nlogn)，最坏情况为O(n²)。',
        },
      ],
    },
    {
      type: 'essay',
      typeName: '简答题',
      totalScore: 20,
      gainedScore: 15,
      questions: [
        {
          id: 'q009', index: 12,
          content: '请简述快速排序算法的基本思想和时间复杂度。',
          score: 10, studentScore: 8, status: 'partial',
          studentAnswer: {
            text: '快速排序采用分治法的思想。首先选择一个基准元素（pivot），将数组分为两部分：小于基准的放左边，大于基准的放右边。然后递归地对左右两部分进行同样的操作。平均时间复杂度为O(nlogn)。',
            attachments: [
              { name: '算法流程图.png', size: 245678, type: 'image/png', url: 'https://picsum.photos/seed/quicksort/800/600' },
              { name: '复杂度分析.pdf', size: 1024000, type: 'application/pdf', url: '#' },
            ],
          },
          correctAnswer: '快速排序的基本思想是分治法：1）选择基准元素；2）将数组划分为两个子数组；3）递归排序。平均O(nlogn)，最坏O(n²)，空间O(logn)。',
          explanation: '快速排序核心在于分区操作。选择好的基准元素可以避免最坏情况。',
          matchRate: 80,
          teacherComment: '回答基本正确，但缺少最坏情况的时间复杂度分析。',
        },
        {
          id: 'q010', index: 13,
          content: '请解释什么是二叉搜索树（BST），并说明其主要特点。',
          score: 10, studentScore: 7, status: 'partial',
          studentAnswer: {
            text: '二叉搜索树是一种特殊的二叉树，对于每个节点，其左子树的所有节点值都小于该节点值，右子树的所有节点值都大于该节点值。查找、插入和删除操作的时间复杂度为O(logn)。',
            attachments: [
              { name: 'BST示意图.png', size: 189432, type: 'image/png', url: 'https://picsum.photos/seed/bst/800/600' },
              { name: '遍历结果截图.jpg', size: 312567, type: 'image/jpeg', url: 'https://picsum.photos/seed/traversal/800/600' },
              { name: '参考笔记.docx', size: 567890, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', url: '#' },
            ],
          },
          correctAnswer: '二叉搜索树满足：左子树所有节点值小于根节点；右子树所有节点值大于根节点；左右子树也是BST。中序遍历得到有序序列，平均O(logn)，最坏退化为O(n)。',
          explanation: 'BST的关键特性是有序性，为避免退化可使用AVL树、红黑树。',
          matchRate: 70,
          teacherComment: '定义正确，但缺少中序遍历有序性和最坏情况分析。',
        },
      ],
    },
    {
      type: 'cloze',
      typeName: '完形填空',
      totalScore: 30,
      gainedScore: 25.5,
      questions: [
        {
          id: 'q011', index: 14,
          content: `阅读下面短文，从短文后各题所给的A、B、C、D四个选项中，选出可以填入空白处的最佳选项。

When I was thirteen years old, I made my first visit to the Internet. I didn't have much ___1___ in my life, so the Internet was a(n) ___2___ world for me. I especially liked the chat rooms where I could ___3___ new people and share my feelings. But I soon ___4___ that not everything was true on the Internet.

One day, I ___5___ a message from someone called "FriendForever". He said he was a 14-year-old boy who ___6___ playing basketball and reading. We began to chat every day and I felt we had become good ___7___. He always seemed to understand me and gave me lots of ___8___.

After two months, he asked if we could ___9___ in person. I was so ___10___ that I agreed immediately. But when I told my mother about it, she was very ___11___. She said I should never meet someone I only knew ___12___. I didn't understand why she was so worried.

My mother ___13___ to go with me to the meeting place. When we arrived, we saw a man in his thirties ___14___ there. He was definitely not a 14-year-old boy. I was ___15___ and scared. My mother held my hand tightly and we ___16___ left.

That experience taught me an important ___17___. The Internet can be a wonderful tool, but it can also be ___18___. We should always be ___19___ when talking to strangers online and never give out ___20___ information like our address or phone number.`,
          score: 30, studentScore: 25.5, status: 'partial',
          blanks: [
            { order: 1, studentAnswer: 'A', correctAnswer: 'A', isCorrect: true, options: [{ label: 'A', text: 'experience' }, { label: 'B', text: 'knowledge' }, { label: 'C', text: 'money' }, { label: 'D', text: 'time' }] },
            { order: 2, studentAnswer: 'B', correctAnswer: 'B', isCorrect: true, options: [{ label: 'A', text: 'boring' }, { label: 'B', text: 'exciting' }, { label: 'C', text: 'lonely' }, { label: 'D', text: 'terrible' }] },
            { order: 3, studentAnswer: 'A', correctAnswer: 'A', isCorrect: true, options: [{ label: 'A', text: 'meet' }, { label: 'B', text: 'teach' }, { label: 'C', text: 'avoid' }, { label: 'D', text: 'recognize' }] },
            { order: 4, studentAnswer: 'B', correctAnswer: 'B', isCorrect: true, options: [{ label: 'A', text: 'hoped' }, { label: 'B', text: 'discovered' }, { label: 'C', text: 'pretended' }, { label: 'D', text: 'forgot' }] },
            { order: 5, studentAnswer: 'C', correctAnswer: 'C', isCorrect: true, options: [{ label: 'A', text: 'wrote' }, { label: 'B', text: 'sent' }, { label: 'C', text: 'received' }, { label: 'D', text: 'deleted' }] },
            { order: 6, studentAnswer: 'A', correctAnswer: 'A', isCorrect: true, options: [{ label: 'A', text: 'enjoyed' }, { label: 'B', text: 'stopped' }, { label: 'C', text: 'hated' }, { label: 'D', text: 'missed' }] },
            { order: 7, studentAnswer: 'C', correctAnswer: 'C', isCorrect: true, options: [{ label: 'A', text: 'students' }, { label: 'B', text: 'neighbors' }, { label: 'C', text: 'friends' }, { label: 'D', text: 'partners' }] },
            { order: 8, studentAnswer: 'A', correctAnswer: 'A', isCorrect: true, options: [{ label: 'A', text: 'advice' }, { label: 'B', text: 'money' }, { label: 'C', text: 'food' }, { label: 'D', text: 'homework' }] },
            { order: 9, studentAnswer: 'B', correctAnswer: 'B', isCorrect: true, options: [{ label: 'A', text: 'study' }, { label: 'B', text: 'meet' }, { label: 'C', text: 'work' }, { label: 'D', text: 'travel' }] },
            { order: 10, studentAnswer: 'C', correctAnswer: 'C', isCorrect: true, options: [{ label: 'A', text: 'angry' }, { label: 'B', text: 'sad' }, { label: 'C', text: 'excited' }, { label: 'D', text: 'nervous' }] },
            { order: 11, studentAnswer: 'B', correctAnswer: 'B', isCorrect: true, options: [{ label: 'A', text: 'happy' }, { label: 'B', text: 'worried' }, { label: 'C', text: 'proud' }, { label: 'D', text: 'relaxed' }] },
            { order: 12, studentAnswer: 'A', correctAnswer: 'A', isCorrect: true, options: [{ label: 'A', text: 'online' }, { label: 'B', text: 'already' }, { label: 'C', text: 'well' }, { label: 'D', text: 'personally' }] },
            { order: 13, studentAnswer: 'C', correctAnswer: 'C', isCorrect: true, options: [{ label: 'A', text: 'refused' }, { label: 'B', text: 'forgot' }, { label: 'C', text: 'decided' }, { label: 'D', text: 'failed' }] },
            { order: 14, studentAnswer: 'A', correctAnswer: 'A', isCorrect: true, options: [{ label: 'A', text: 'waiting' }, { label: 'B', text: 'running' }, { label: 'C', text: 'sleeping' }, { label: 'D', text: 'shopping' }] },
            { order: 15, studentAnswer: 'C', correctAnswer: 'C', isCorrect: true, options: [{ label: 'A', text: 'bored' }, { label: 'B', text: 'pleased' }, { label: 'C', text: 'shocked' }, { label: 'D', text: 'amused' }] },
            { order: 16, studentAnswer: 'C', correctAnswer: 'C', isCorrect: true, options: [{ label: 'A', text: 'slowly' }, { label: 'B', text: 'quietly' }, { label: 'C', text: 'quickly' }, { label: 'D', text: 'happily' }] },
            { order: 17, studentAnswer: 'A', correctAnswer: 'A', isCorrect: true, options: [{ label: 'A', text: 'lesson' }, { label: 'B', text: 'story' }, { label: 'C', text: 'game' }, { label: 'D', text: 'word' }] },
            { order: 18, studentAnswer: 'A', correctAnswer: 'C', isCorrect: false, options: [{ label: 'A', text: 'useful' }, { label: 'B', text: 'expensive' }, { label: 'C', text: 'dangerous' }, { label: 'D', text: 'interesting' }] },
            { order: 19, studentAnswer: 'B', correctAnswer: 'A', isCorrect: false, options: [{ label: 'A', text: 'careful' }, { label: 'B', text: 'generous' }, { label: 'C', text: 'patient' }, { label: 'D', text: 'honest' }] },
            { order: 20, studentAnswer: 'B', correctAnswer: 'C', isCorrect: false, options: [{ label: 'A', text: 'useless' }, { label: 'B', text: 'public' }, { label: 'C', text: 'personal' }, { label: 'D', text: 'false' }] },
          ],
          explanation: '这篇完形填空讲述了一个13岁孩子在网上交友被骗的经历，告诫人们要保持警惕。',
        },
      ],
    },
    {
      type: 'composite',
      typeName: '复合题',
      totalScore: 21,
      gainedScore: 12,
      questions: [
        {
          id: 'q012', index: 15,
          content: '阅读理解：《送东阳马生序》与《西京杂记》对比阅读',
          material: '【甲】余幼时即嗜学。家贫，无从致书以观...\n【乙】匡衡勤学而无烛，邻舍有烛而不逮...',
          score: 21, studentScore: 12, status: 'partial',
          subQuestions: [
            {
              id: 'sq1', type: 'single', index: '15-1',
              content: '下列句子中加点词的解释，不正确的一项是：',
              score: 3, studentScore: 3, status: 'correct',
              options: [
                { label: 'A', text: '每假借于藏书之家（借）' },
                { label: 'B', text: '录毕，走送之（跑）' },
                { label: 'C', text: '媵人持汤沃灌（热水）' },
                { label: 'D', text: '同舍生皆被绮绣（被子）' },
              ],
              studentAnswer: 'D', correctAnswer: 'D',
              explanation: '"被"通"披"，意为穿着，不是"被子"。',
            },
            {
              id: 'sq2', type: 'multiple', index: '15-2',
              content: '下列对甲文内容的理解和分析，正确的有哪些？（多选）',
              score: 4, studentScore: 0, status: 'wrong',
              options: [
                { label: 'A', text: '作者幼时家贫，靠借书抄录来读书' },
                { label: 'B', text: '作者求学时，老师态度和蔼' },
                { label: 'C', text: '作者求学途中条件艰苦' },
                { label: 'D', text: '作者虽衣着朴素，但内心不羡慕他人' },
              ],
              studentAnswer: ['A', 'C'], correctAnswer: ['A', 'C', 'D'],
              explanation: 'B错误，老师态度严肃。A、C、D均正确。',
            },
            {
              id: 'sq3', type: 'judge', index: '15-3',
              content: '甲文和乙文都表达了"勤学"的主题。',
              score: 2, studentScore: 2, status: 'correct',
              studentAnswer: true, correctAnswer: true,
              explanation: '甲文宋濂借书抄录、冒雪求学，乙文匡衡凿壁偷光，都体现勤学主题。',
            },
            {
              id: 'sq4', type: 'blank', index: '15-4',
              content: '请根据文章内容填空。',
              blankHints: [
                '甲文中，作者用"___"概括了自己求学的艰辛',
                '乙文中，匡衡的故事演变为成语"___"',
              ],
              score: 4, studentScore: 2, status: 'partial',
              studentAnswer: ['盖余之勤且艰若此', '悬梁刺股'],
              correctAnswer: ['盖余之勤且艰若此', '凿壁偷光'],
              explanation: '第一空正确。第二空应为"凿壁偷光"，"悬梁刺股"是另一个故事。',
            },
            {
              id: 'sq5', type: 'essay', index: '15-5',
              content: '甲文作者宋濂在极其艰苦的条件下仍能坚持求学，最终学有所成。请结合甲、乙两文的内容，谈谈你从中获得的启示。要求：观点明确，结合文本，不少于80字。',
              score: 8, studentScore: 5, status: 'partial',
              studentAnswer: {
                text: '从甲乙两文中，我深刻体会到勤奋学习的重要性。宋濂家贫却坚持借书抄录，冒着严寒求学；匡衡凿壁偷光，以劳动换取读书机会。他们的共同点是：不因环境艰苦而放弃学习，反而以坚韧的毅力克服困难。这启示我们，学习条件的好坏不是决定因素，关键在于个人的态度和毅力。',
                attachments: [
                  { name: '思维导图.png', size: 178234, type: 'image/png', url: 'https://picsum.photos/seed/mindmap/800/600' },
                ],
              },
              correctAnswer: '示例：两文都展现了勤学精神。宋濂借书抄录、冒雪求师，匡衡凿壁偷光、佣作换书，都体现了在困境中坚持学习的品质。启示：学习需要坚定的意志和不畏艰难的精神，外在条件不应成为放弃学习的借口。',
              explanation: '需要结合两篇文章的具体内容，提炼共同主题，并联系实际谈启示。',
              matchRate: 65,
              teacherComment: '分析到位，但对乙文的引用可以更具体。',
            },
          ],
        },
      ],
    },
  ],
}

/**
 * Mock 数据 - 考试详情
 */
export const mockExamDetail = {
  id: 'exam002',
  name: '数据结构与算法测试',
  startTime: '2026-02-03 14:00:00',
  endTime: '2026-02-03 16:00:00',
  duration: 90,
  status: 'in_progress',
  myStatus: 'not_started',
  score: null,
  totalScore: 100,
  paper: {
    id: 'paper002',
    name: '数据结构试卷A',
    questionCount: 12,
    questions: [], // 实际答题时才加载
  },
  config: {
    enableFaceRecognition: true,
    allowSkipFaceVerify: true,
    enableRandomCapture: true,
    captureCount: 3,
    allowEarlyEntry: true,
    earlyMinutes: 15,
    allowLateEntry: true,
    lateMinutes: 15,
    minAnswerTime: 1,
    scorePublishMode: 'after_exam',
    scorePublishContent: 'full',
    scorePublishDelay: 3,
    maxAttempts: 2, // 允许作答次数
    currentAttempt: 0, // 当前作答次数
  },
  description: '本次测试涵盖数据结构的核心知识点，包括线性表、树、图等内容。',
}

/**
 * Mock 数据 - 试卷题目（包含所有7种题型）
 * 题型名称来自管理端配置，可以自定义修改
 */
export const mockPaperQuestions = [
  // 1. 单选题
  {
    id: 'q001',
    type: 'single',
    typeName: '单选题', // 可在管理端自定义修改
    content: '以下哪种数据结构是先进先出（FIFO）的？',
    options: [
      { label: 'A', text: '栈' },
      { label: 'B', text: '队列' },
      { label: 'C', text: '链表' },
      { label: 'D', text: '树' },
    ],
    score: 2,
    order: 1,
  },
  {
    id: 'q002',
    type: 'single',
    typeName: '单选题',
    content: '二叉树的前序遍历顺序是？',
    options: [
      { label: 'A', text: '根-左-右' },
      { label: 'B', text: '左-根-右' },
      { label: 'C', text: '左-右-根' },
      { label: 'D', text: '右-根-左' },
    ],
    score: 2,
    order: 2,
  },
  {
    id: 'q002a',
    type: 'single',
    typeName: '单选题',
    content: '在一个长度为n的顺序表中，删除第i个元素需要移动多少个元素？',
    options: [
      { label: 'A', text: 'n-i' },
      { label: 'B', text: 'n-i+1' },
      { label: 'C', text: 'n-i-1' },
      { label: 'D', text: 'i' },
    ],
    score: 2,
    order: 2.1,
  },
  {
    id: 'q002b',
    type: 'single',
    typeName: '单选题',
    content: '下列排序算法中，平均时间复杂度为O(nlogn)的是？',
    options: [
      { label: 'A', text: '冒泡排序' },
      { label: 'B', text: '插入排序' },
      { label: 'C', text: '快速排序' },
      { label: 'D', text: '选择排序' },
    ],
    score: 2,
    order: 2.2,
  },
  {
    id: 'q002c',
    type: 'single',
    typeName: '单选题',
    content: '设栈的入栈序列为1,2,3,4，则下列不可能的出栈序列是？',
    options: [
      { label: 'A', text: '1,2,3,4' },
      { label: 'B', text: '4,3,2,1' },
      { label: 'C', text: '1,3,2,4' },
      { label: 'D', text: '4,1,2,3' },
    ],
    score: 2,
    order: 2.3,
  },
  {
    id: 'q002d',
    type: 'single',
    typeName: '单选题',
    content: '在一棵具有n个结点的二叉树中，所有结点的度数之和为？',
    options: [
      { label: 'A', text: 'n' },
      { label: 'B', text: 'n-1' },
      { label: 'C', text: 'n+1' },
      { label: 'D', text: '2n' },
    ],
    score: 2,
    order: 2.4,
  },
  {
    id: 'q002e',
    type: 'single',
    typeName: '单选题',
    content: '图的深度优先搜索类似于二叉树的哪种遍历？',
    options: [
      { label: 'A', text: '前序遍历' },
      { label: 'B', text: '中序遍历' },
      { label: 'C', text: '后序遍历' },
      { label: 'D', text: '层序遍历' },
    ],
    score: 2,
    order: 2.5,
  },
  {
    id: 'q002f',
    type: 'single',
    typeName: '单选题',
    content: '若一个栈的输入序列为A,B,C,D，则借助一个栈不能得到的输出序列是？',
    options: [
      { label: 'A', text: 'A,B,C,D' },
      { label: 'B', text: 'D,C,B,A' },
      { label: 'C', text: 'D,A,B,C' },
      { label: 'D', text: 'A,C,B,D' },
    ],
    score: 2,
    order: 2.6,
  },
  {
    id: 'q002g',
    type: 'single',
    typeName: '单选题',
    content: '单链表中，增加头结点的目的是？',
    options: [
      { label: 'A', text: '使单链表至少有一个结点' },
      { label: 'B', text: '标识表结点中首结点的位置' },
      { label: 'C', text: '方便运算的实现' },
      { label: 'D', text: '说明单链表是线性表的链式存储' },
    ],
    score: 2,
    order: 2.7,
  },
  {
    id: 'q002h',
    type: 'single',
    typeName: '单选题',
    content: '对于一个有向图，若所有顶点的入度之和为S，则所有顶点的出度之和为？',
    options: [
      { label: 'A', text: 'S' },
      { label: 'B', text: 'S-1' },
      { label: 'C', text: 'S+1' },
      { label: 'D', text: '2S' },
    ],
    score: 2,
    order: 2.8,
  },

  // 2. 多选题
  {
    id: 'q003',
    type: 'multiple',
    typeName: '多选题', // 可在管理端自定义修改
    content: '以下哪些是线性数据结构？（多选）',
    options: [
      { label: 'A', text: '数组' },
      { label: 'B', text: '链表' },
      { label: 'C', text: '树' },
      { label: 'D', text: '栈' },
      { label: 'E', text: '图' },
    ],
    score: 3,
    order: 3,
  },
  {
    id: 'q004',
    type: 'multiple',
    typeName: '多选题',
    content: '关于哈希表，以下说法正确的是？（多选）',
    options: [
      { label: 'A', text: '查找时间复杂度为O(1)' },
      { label: 'B', text: '可能发生哈希冲突' },
      { label: 'C', text: '需要额外的存储空间' },
      { label: 'D', text: '不支持范围查询' },
    ],
    score: 3,
    order: 4,
  },

  // 3. 判断题
  {
    id: 'q005',
    type: 'judge',
    typeName: '判断题', // 可在管理端自定义修改
    content: '二叉树的前序遍历和中序遍历可以唯一确定一棵二叉树。',
    score: 2,
    order: 5,
  },
  {
    id: 'q006',
    type: 'judge',
    typeName: '判断题',
    content: '栈是一种后进先出（LIFO）的数据结构。',
    score: 2,
    order: 6,
  },

  // 4. 填空题
  {
    id: 'q007',
    type: 'blank',
    typeName: '填空题', // 可在管理端自定义修改
    content: '在一个有n个顶点的无向完全图中，边的数量为___。',
    blanks: [
      { id: 'b1', order: 1 },
    ],
    score: 3,
    order: 7,
  },
  {
    id: 'q008',
    type: 'blank',
    typeName: '填空题',
    content: '快速排序的平均时间复杂度是___，最坏情况时间复杂度是___。',
    blanks: [
      { id: 'b1', order: 1 },
      { id: 'b2', order: 2 },
    ],
    score: 4,
    order: 8,
  },

  // 5. 简答题
  {
    id: 'q009',
    type: 'essay',
    typeName: '简答题', // 可在管理端自定义修改
    content: '请简述快速排序算法的基本思想和时间复杂度。',
    score: 10,
    order: 9,
  },
  {
    id: 'q010',
    type: 'essay',
    typeName: '简答题',
    content: '请解释什么是二叉搜索树（BST），并说明其主要特点。',
    score: 10,
    order: 10,
  },

  // 6. 完形填空（英语，20个空）
  {
    id: 'q011',
    type: 'cloze',
    typeName: '完形填空',
    content: `阅读下面短文，从短文后各题所给的A、B、C、D四个选项中，选出可以填入空白处的最佳选项。

When I was thirteen years old, I made my first visit to the Internet. I didn't have much ___1___ in my life, so the Internet was a(n) ___2___ world for me. I especially liked the chat rooms where I could ___3___ new people and share my feelings. But I soon ___4___ that not everything was true on the Internet.

One day, I ___5___ a message from someone called "FriendForever". He said he was a 14-year-old boy who ___6___ playing basketball and reading. We began to chat every day and I felt we had become good ___7___. He always seemed to understand me and gave me lots of ___8___.

After two months, he asked if we could ___9___ in person. I was so ___10___ that I agreed immediately. But when I told my mother about it, she was very ___11___. She said I should never meet someone I only knew ___12___. I didn't understand why she was so worried.

My mother ___13___ to go with me to the meeting place. When we arrived, we saw a man in his thirties ___14___ there. He was definitely not a 14-year-old boy. I was ___15___ and scared. My mother held my hand tightly and we ___16___ left.

That experience taught me an important ___17___. The Internet can be a wonderful tool, but it can also be ___18___. We should always be ___19___ when talking to strangers online and never give out ___20___ information like our address or phone number.`,
    blanks: [
      {
        id: 'c1', order: 1,
        options: [
          { label: 'A', text: 'experience' },
          { label: 'B', text: 'knowledge' },
          { label: 'C', text: 'money' },
          { label: 'D', text: 'time' },
        ],
      },
      {
        id: 'c2', order: 2,
        options: [
          { label: 'A', text: 'boring' },
          { label: 'B', text: 'exciting' },
          { label: 'C', text: 'lonely' },
          { label: 'D', text: 'terrible' },
        ],
      },
      {
        id: 'c3', order: 3,
        options: [
          { label: 'A', text: 'meet' },
          { label: 'B', text: 'teach' },
          { label: 'C', text: 'avoid' },
          { label: 'D', text: 'recognize' },
        ],
      },
      {
        id: 'c4', order: 4,
        options: [
          { label: 'A', text: 'hoped' },
          { label: 'B', text: 'discovered' },
          { label: 'C', text: 'pretended' },
          { label: 'D', text: 'forgot' },
        ],
      },
      {
        id: 'c5', order: 5,
        options: [
          { label: 'A', text: 'wrote' },
          { label: 'B', text: 'sent' },
          { label: 'C', text: 'received' },
          { label: 'D', text: 'deleted' },
        ],
      },
      {
        id: 'c6', order: 6,
        options: [
          { label: 'A', text: 'enjoyed' },
          { label: 'B', text: 'stopped' },
          { label: 'C', text: 'hated' },
          { label: 'D', text: 'missed' },
        ],
      },
      {
        id: 'c7', order: 7,
        options: [
          { label: 'A', text: 'students' },
          { label: 'B', text: 'neighbors' },
          { label: 'C', text: 'friends' },
          { label: 'D', text: 'partners' },
        ],
      },
      {
        id: 'c8', order: 8,
        options: [
          { label: 'A', text: 'advice' },
          { label: 'B', text: 'money' },
          { label: 'C', text: 'food' },
          { label: 'D', text: 'homework' },
        ],
      },
      {
        id: 'c9', order: 9,
        options: [
          { label: 'A', text: 'study' },
          { label: 'B', text: 'meet' },
          { label: 'C', text: 'work' },
          { label: 'D', text: 'travel' },
        ],
      },
      {
        id: 'c10', order: 10,
        options: [
          { label: 'A', text: 'angry' },
          { label: 'B', text: 'sad' },
          { label: 'C', text: 'excited' },
          { label: 'D', text: 'nervous' },
        ],
      },
      {
        id: 'c11', order: 11,
        options: [
          { label: 'A', text: 'happy' },
          { label: 'B', text: 'worried' },
          { label: 'C', text: 'proud' },
          { label: 'D', text: 'relaxed' },
        ],
      },
      {
        id: 'c12', order: 12,
        options: [
          { label: 'A', text: 'online' },
          { label: 'B', text: 'already' },
          { label: 'C', text: 'well' },
          { label: 'D', text: 'personally' },
        ],
      },
      {
        id: 'c13', order: 13,
        options: [
          { label: 'A', text: 'refused' },
          { label: 'B', text: 'forgot' },
          { label: 'C', text: 'decided' },
          { label: 'D', text: 'failed' },
        ],
      },
      {
        id: 'c14', order: 14,
        options: [
          { label: 'A', text: 'waiting' },
          { label: 'B', text: 'running' },
          { label: 'C', text: 'sleeping' },
          { label: 'D', text: 'shopping' },
        ],
      },
      {
        id: 'c15', order: 15,
        options: [
          { label: 'A', text: 'bored' },
          { label: 'B', text: 'pleased' },
          { label: 'C', text: 'shocked' },
          { label: 'D', text: 'amused' },
        ],
      },
      {
        id: 'c16', order: 16,
        options: [
          { label: 'A', text: 'slowly' },
          { label: 'B', text: 'quietly' },
          { label: 'C', text: 'quickly' },
          { label: 'D', text: 'happily' },
        ],
      },
      {
        id: 'c17', order: 17,
        options: [
          { label: 'A', text: 'lesson' },
          { label: 'B', text: 'story' },
          { label: 'C', text: 'game' },
          { label: 'D', text: 'word' },
        ],
      },
      {
        id: 'c18', order: 18,
        options: [
          { label: 'A', text: 'useful' },
          { label: 'B', text: 'expensive' },
          { label: 'C', text: 'dangerous' },
          { label: 'D', text: 'interesting' },
        ],
      },
      {
        id: 'c19', order: 19,
        options: [
          { label: 'A', text: 'careful' },
          { label: 'B', text: 'generous' },
          { label: 'C', text: 'patient' },
          { label: 'D', text: 'honest' },
        ],
      },
      {
        id: 'c20', order: 20,
        options: [
          { label: 'A', text: 'useless' },
          { label: 'B', text: 'public' },
          { label: 'C', text: 'personal' },
          { label: 'D', text: 'false' },
        ],
      },
    ],
    score: 30,
    order: 11,
  },

  // 7. 复合题（语文阅读理解 - 包含单选、多选、判断、填空、简答五种子题）
  {
    id: 'q012',
    type: 'composite',
    typeName: '复合题',
    material: `阅读下面的文章，完成下列各题。

【甲】

　　余幼时即嗜学。家贫，无从致书以观，每假借于藏书之家，手自笔录，计日以还。天大寒，砚冰坚，手指不可屈伸，弗之怠。录毕，走送之，不敢稍逾约。以是人多以书假余，余因得遍观群书。既加冠，益慕圣贤之道。又患无硕师名人与游，尝趋百里外，从乡之先达执经叩问。先达德隆望尊，门人弟子填其室，未尝稍降辞色。余立侍左右，援疑质理，俯身倾耳以请；或遇其叱咄，色愈恭，礼愈至，不敢出一言以复；俟其欣悦，则又请焉。故余虽愚，卒获有所闻。

　　当余之从师也，负箧曳屣行深山巨谷中。穷冬烈风，大雪深数尺，足肤皲裂而不知。至舍，四支僵劲不能动，媵人持汤沃灌，以衾拥覆，久而乃和。寓逆旅，主人日再食，无鲜肥滋味之享。同舍生皆被绮绣，戴朱缨宝饰之帽，腰白玉之环，左佩刀，右备容臭，烨然若神人；余则缊袍敝衣处其间，略无慕艳意，以中有足乐者，不知口体之奉不若人也。盖余之勤且艰若此。

——宋濂《送东阳马生序》（节选）

【乙】

　　匡衡勤学而无烛，邻舍有烛而不逮，衡乃穿壁引其光，以书映光而读之。邑人大姓文不识，家富多书，衡乃与其佣作而不求偿。主人怪，问衡，衡曰："愿得主人书遍读之。"主人感叹，资给以书，遂成大学。

——《西京杂记》`,
    subQuestions: [
      {
        id: 'sq1',
        type: 'single',
        content: '下列句子中加点词的解释，不正确的一项是：',
        options: [
          { label: 'A', text: '每假借于藏书之家（借）' },
          { label: 'B', text: '录毕，走送之（跑）' },
          { label: 'C', text: '媵人持汤沃灌（热水）' },
          { label: 'D', text: '同舍生皆被绮绣（被子）' },
        ],
        score: 3,
      },
      {
        id: 'sq2',
        type: 'multiple',
        content: '下列对甲文内容的理解和分析，正确的有哪些？（多选）',
        options: [
          { label: 'A', text: '作者幼时家贫，靠借书抄录来读书，从不超过约定的归还日期' },
          { label: 'B', text: '作者求学时，老师态度和蔼，经常主动为他答疑解惑' },
          { label: 'C', text: '作者求学途中条件艰苦，冬天在深山巨谷中行走，脚上的皮肤冻裂了都不知道' },
          { label: 'D', text: '作者与同舍生相比，虽然衣着朴素，但内心并不羡慕他们，因为心中有读书的快乐' },
        ],
        score: 4,
      },
      {
        id: 'sq3',
        type: 'judge',
        content: '甲文和乙文都通过描写主人公在艰苦条件下坚持读书的故事，表达了"勤学"的主题。',
        score: 2,
      },
      {
        id: 'sq4',
        type: 'blank',
        content: '请根据文章内容填空。',
        blanks: [
          { id: 'fb1', order: 1 },
          { id: 'fb2', order: 2 },
        ],
        blankHints: [
          '甲文中，作者用"___"一句概括了自己求学的艰辛（用原文回答）',
          '乙文中，匡衡"穿壁引其光"的故事后来演变为成语"___"',
        ],
        score: 4,
      },
      {
        id: 'sq5',
        type: 'essay',
        content: '甲文作者宋濂在极其艰苦的条件下仍能坚持求学，最终学有所成。请结合甲、乙两文的内容，谈谈你从中获得的启示。要求：观点明确，结合文本，不少于80字。',
        score: 8,
      },
    ],
    score: 21,
    order: 12,
  },
]

/**
 * Mock 数据 - 文档模式试卷页面（HTML 内容，模拟真实考卷）
 */
export const mockDocumentPages = [
  // 第1页：试卷头 + 单选题 + 多选题
  `<div class="exam-paper-page">
  <div class="paper-header">
    <h1>XX大学 2025—2026 学年第二学期期末考试</h1>
    <h2>《计算机网络》试卷（A卷）</h2>
    <div class="paper-info">
      <div class="info-row">
        <span>考试时间：120分钟</span>
        <span>满分：100分</span>
        <span>考试形式：闭卷</span>
      </div>
      <div class="info-row student-info">
        <span>学院：________</span>
        <span>专业：________</span>
        <span>学号：________</span>
        <span>姓名：________</span>
      </div>
    </div>
    <div class="paper-notice">
      <b>注意事项：</b>1. 请将答案填写在答题卡上，写在试卷上无效；2. 考试结束后，试卷和答题卡一并交回。
    </div>
  </div>

  <div class="paper-section">
    <div class="section-title">一、单项选择题（每小题2分，共6分）</div>

    <div class="question-item">
      <div class="q-num">1.</div>
      <div class="q-text">
        TCP协议属于OSI模型的哪一层？
        <div class="q-options">
          <div class="q-opt">A. 网络层</div>
          <div class="q-opt">B. 传输层</div>
          <div class="q-opt">C. 会话层</div>
          <div class="q-opt">D. 应用层</div>
        </div>
      </div>
    </div>

    <div class="question-item">
      <div class="q-num">2.</div>
      <div class="q-text">
        HTTP协议默认使用的端口号是？
        <div class="q-options">
          <div class="q-opt">A. 21</div>
          <div class="q-opt">B. 22</div>
          <div class="q-opt">C. 80</div>
          <div class="q-opt">D. 443</div>
        </div>
      </div>
    </div>

    <div class="question-item">
      <div class="q-num">3.</div>
      <div class="q-text">
        IP地址192.168.1.1属于哪类地址？
        <div class="q-options">
          <div class="q-opt">A. A类</div>
          <div class="q-opt">B. B类</div>
          <div class="q-opt">C. C类</div>
          <div class="q-opt">D. D类</div>
        </div>
      </div>
    </div>
  </div>

  <div class="paper-section">
    <div class="section-title">二、多项选择题（每小题4分，共8分）</div>

    <div class="question-item">
      <div class="q-num">4.</div>
      <div class="q-text">
        以下哪些协议属于应用层协议？（多选）
        <div class="q-options">
          <div class="q-opt">A. HTTP</div>
          <div class="q-opt">B. TCP</div>
          <div class="q-opt">C. FTP</div>
          <div class="q-opt">D. DNS</div>
        </div>
      </div>
    </div>

    <div class="question-item">
      <div class="q-num">5.</div>
      <div class="q-text">
        关于TCP三次握手，以下说法正确的是？（多选）
        <div class="q-options">
          <div class="q-opt">A. 第一次握手：客户端发送SYN报文</div>
          <div class="q-opt">B. 第二次握手：服务器发送SYN+ACK报文</div>
          <div class="q-opt">C. 第三次握手：客户端发送ACK报文</div>
          <div class="q-opt">D. 三次握手后连接即建立</div>
        </div>
      </div>
    </div>
  </div>
</div>`,

  // 第2页：判断题 + 填空题 + 简答题
  `<div class="exam-paper-page">
  <div class="paper-section">
    <div class="section-title">三、判断题（每小题2分，共4分）</div>

    <div class="question-item">
      <div class="q-num">6.</div>
      <div class="q-text">
        UDP协议是面向连接的可靠传输协议。（&nbsp;&nbsp;&nbsp;&nbsp;）
      </div>
    </div>

    <div class="question-item">
      <div class="q-num">7.</div>
      <div class="q-text">
        IPv6地址长度为128位。（&nbsp;&nbsp;&nbsp;&nbsp;）
      </div>
    </div>
  </div>

  <div class="paper-section">
    <div class="section-title">四、填空题（共6分）</div>

    <div class="question-item">
      <div class="q-num">8.</div>
      <div class="q-text">
        DNS的全称是<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>，它的主要功能是将<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>转换为IP地址。
      </div>
    </div>

    <div class="question-item">
      <div class="q-num">9.</div>
      <div class="q-text">
        子网掩码255.255.255.0对应的CIDR表示法为<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>。
      </div>
    </div>
  </div>

  <div class="paper-section">
    <div class="section-title">五、简答题（每小题10分，共20分）</div>

    <div class="question-item">
      <div class="q-num">10.</div>
      <div class="q-text">
        请简述TCP和UDP的主要区别，并各举一个典型应用场景。
        <div class="answer-lines">
          <div class="answer-line"></div>
          <div class="answer-line"></div>
          <div class="answer-line"></div>
          <div class="answer-line"></div>
          <div class="answer-line"></div>
          <div class="answer-line"></div>
        </div>
      </div>
    </div>

    <div class="question-item">
      <div class="q-num">11.</div>
      <div class="q-text">
        请画出并描述TCP三次握手的过程，说明每一步的作用。
        <div class="answer-lines">
          <div class="answer-line"></div>
          <div class="answer-line"></div>
          <div class="answer-line"></div>
          <div class="answer-line"></div>
          <div class="answer-line"></div>
          <div class="answer-line"></div>
        </div>
      </div>
    </div>
  </div>
</div>`,

  // 第3页：完形填空 + 复合题
  `<div class="exam-paper-page">
  <div class="paper-section">
    <div class="section-title">六、完形填空（每空2分，共10分）</div>

    <div class="question-item">
      <div class="q-num">12.</div>
      <div class="q-text">
        在计算机网络中，数据从源主机到目的主机的传输过程需要经过多个层次的处理。首先，应用层将用户数据封装为<u>&nbsp;(1)&nbsp;</u>，然后传输层将其分割为<u>&nbsp;(2)&nbsp;</u>并添加端口号信息。接着，网络层为每个数据包添加<u>&nbsp;(3)&nbsp;</u>和目的IP地址，形成<u>&nbsp;(4)&nbsp;</u>。最后，数据链路层将其封装为<u>&nbsp;(5)&nbsp;</u>，通过物理层发送到网络中。
        <div class="cloze-options-table">
          <table>
            <tr><td class="blank-num">(1)</td><td>A. 报文</td><td>B. 数据帧</td><td>C. 比特流</td><td>D. 数据包</td></tr>
            <tr><td class="blank-num">(2)</td><td>A. 报文段</td><td>B. 数据帧</td><td>C. 比特流</td><td>D. 数据报</td></tr>
            <tr><td class="blank-num">(3)</td><td>A. 源MAC地址</td><td>B. 源IP地址</td><td>C. 源端口号</td><td>D. 序列号</td></tr>
            <tr><td class="blank-num">(4)</td><td>A. 报文段</td><td>B. 数据帧</td><td>C. IP数据报</td><td>D. 比特流</td></tr>
            <tr><td class="blank-num">(5)</td><td>A. 报文</td><td>B. 数据帧</td><td>C. IP数据报</td><td>D. 报文段</td></tr>
          </table>
        </div>
      </div>
    </div>
  </div>

  <div class="paper-section">
    <div class="section-title">七、复合题（共21分）</div>

    <div class="question-item">
      <div class="q-num">13.</div>
      <div class="q-text">
        <div class="material-text">
          阅读以下网络拓扑描述：<br><br>
          某公司网络由3个子网组成，子网A（192.168.1.0/24）连接了50台主机，子网B（192.168.2.0/24）连接了30台主机，子网C（192.168.3.0/24）连接了20台主机。三个子网通过一台路由器R互联。公司还通过路由器R连接到互联网，使用NAT技术实现内网主机访问外网。
        </div>
        <div class="sub-questions">
          <div class="sub-q">
            <div class="sub-num">(1)</div>
            <div class="sub-text">
              该公司网络中，路由器R至少需要几个接口？（3分）
              <div class="q-options">
                <div class="q-opt">A. 2个</div>
                <div class="q-opt">B. 3个</div>
                <div class="q-opt">C. 4个</div>
                <div class="q-opt">D. 5个</div>
              </div>
            </div>
          </div>
          <div class="sub-q">
            <div class="sub-num">(2)</div>
            <div class="sub-text">
              关于NAT技术，以下说法正确的是？（多选，4分）
              <div class="q-options">
                <div class="q-opt">A. 可以节省公网IP地址</div>
                <div class="q-opt">B. 可以隐藏内网拓扑结构</div>
                <div class="q-opt">C. 会增加网络延迟</div>
                <div class="q-opt">D. 支持端到端的直接通信</div>
              </div>
            </div>
          </div>
          <div class="sub-q">
            <div class="sub-num">(3)</div>
            <div class="sub-text">
              子网A的广播地址是<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>，子网B可用的主机地址范围是<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>到<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>。（6分）
            </div>
          </div>
          <div class="sub-q">
            <div class="sub-num">(4)</div>
            <div class="sub-text">
              请简述NAT技术的工作原理，并说明其优缺点。（8分）
              <div class="answer-lines">
                <div class="answer-line"></div>
                <div class="answer-line"></div>
                <div class="answer-line"></div>
                <div class="answer-line"></div>
                <div class="answer-line"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="paper-footer">
    <p>— 试卷结束 —</p>
  </div>
</div>`,
]

/**
 * Mock 数据 - 文档模式答题卡题目（覆盖全部7种题型）
 */
export const mockDocPaperQuestions = [
  // 单选题 x3
  {
    id: 'dq001',
    type: 'single',
    typeName: '单选题',
    content: 'TCP协议属于OSI模型的哪一层？',
    options: [
      { label: 'A', text: '网络层' },
      { label: 'B', text: '传输层' },
      { label: 'C', text: '会话层' },
      { label: 'D', text: '应用层' },
    ],
    score: 2,
    order: 1,
  },
  {
    id: 'dq002',
    type: 'single',
    typeName: '单选题',
    content: 'HTTP协议默认使用的端口号是？',
    options: [
      { label: 'A', text: '21' },
      { label: 'B', text: '22' },
      { label: 'C', text: '80' },
      { label: 'D', text: '443' },
    ],
    score: 2,
    order: 2,
  },
  {
    id: 'dq003',
    type: 'single',
    typeName: '单选题',
    content: 'IP地址192.168.1.1属于哪类地址？',
    options: [
      { label: 'A', text: 'A类' },
      { label: 'B', text: 'B类' },
      { label: 'C', text: 'C类' },
      { label: 'D', text: 'D类' },
    ],
    score: 2,
    order: 3,
  },
  // 多选题 x2
  {
    id: 'dq004',
    type: 'multiple',
    typeName: '多选题',
    content: '以下哪些协议属于应用层协议？',
    options: [
      { label: 'A', text: 'HTTP' },
      { label: 'B', text: 'TCP' },
      { label: 'C', text: 'FTP' },
      { label: 'D', text: 'DNS' },
    ],
    score: 4,
    order: 4,
  },
  {
    id: 'dq005',
    type: 'multiple',
    typeName: '多选题',
    content: '关于TCP三次握手，以下说法正确的是？',
    options: [
      { label: 'A', text: '第一次握手：客户端发送SYN报文' },
      { label: 'B', text: '第二次握手：服务器发送SYN+ACK报文' },
      { label: 'C', text: '第三次握手：客户端发送ACK报文' },
      { label: 'D', text: '三次握手后连接即建立' },
    ],
    score: 4,
    order: 5,
  },
  // 判断题 x2
  {
    id: 'dq006',
    type: 'judge',
    typeName: '判断题',
    content: 'UDP协议是面向连接的可靠传输协议。',
    options: [
      { label: 'A', text: '正确' },
      { label: 'B', text: '错误' },
    ],
    score: 2,
    order: 6,
  },
  {
    id: 'dq007',
    type: 'judge',
    typeName: '判断题',
    content: 'IPv6地址长度为128位。',
    options: [
      { label: 'A', text: '正确' },
      { label: 'B', text: '错误' },
    ],
    score: 2,
    order: 7,
  },
  // 填空题 x2
  {
    id: 'dq008',
    type: 'blank',
    typeName: '填空题',
    content: 'DNS的全称是____，它的主要功能是将____转换为IP地址。',
    blanks: [
      { id: 'db1', order: 1 },
      { id: 'db2', order: 2 },
    ],
    blankCount: 2,
    score: 4,
    order: 8,
  },
  {
    id: 'dq009',
    type: 'blank',
    typeName: '填空题',
    content: '子网掩码255.255.255.0对应的CIDR表示法为____。',
    blanks: [
      { id: 'db3', order: 1 },
    ],
    blankCount: 1,
    score: 2,
    order: 9,
  },
  // 简答题 x2
  {
    id: 'dq010',
    type: 'essay',
    typeName: '简答题',
    content: '请简述TCP和UDP的主要区别，并各举一个典型应用场景。',
    score: 10,
    order: 10,
  },
  {
    id: 'dq011',
    type: 'essay',
    typeName: '简答题',
    content: '请画出并描述TCP三次握手的过程，说明每一步的作用。',
    score: 10,
    order: 11,
  },
  // 完形填空 x1
  {
    id: 'dq012',
    type: 'cloze',
    typeName: '完形填空',
    content: '在计算机网络中，数据从源主机到目的主机的传输过程需要经过多个层次的处理。首先，应用层将用户数据封装为____，然后传输层将其分割为____并添加端口号信息。接着，网络层为每个数据包添加____和目的IP地址，形成____。最后，数据链路层将其封装为____，通过物理层发送到网络中。',
    blanks: [
      {
        id: 'dcb1', order: 1,
        options: [
          { label: 'A', text: '报文' },
          { label: 'B', text: '数据帧' },
          { label: 'C', text: '比特流' },
          { label: 'D', text: '数据包' },
        ],
      },
      {
        id: 'dcb2', order: 2,
        options: [
          { label: 'A', text: '报文段' },
          { label: 'B', text: '数据帧' },
          { label: 'C', text: '比特流' },
          { label: 'D', text: '数据报' },
        ],
      },
      {
        id: 'dcb3', order: 3,
        options: [
          { label: 'A', text: '源MAC地址' },
          { label: 'B', text: '源IP地址' },
          { label: 'C', text: '源端口号' },
          { label: 'D', text: '序列号' },
        ],
      },
      {
        id: 'dcb4', order: 4,
        options: [
          { label: 'A', text: '报文段' },
          { label: 'B', text: '数据帧' },
          { label: 'C', text: 'IP数据报' },
          { label: 'D', text: '比特流' },
        ],
      },
      {
        id: 'dcb5', order: 5,
        options: [
          { label: 'A', text: '报文' },
          { label: 'B', text: '数据帧' },
          { label: 'C', text: 'IP数据报' },
          { label: 'D', text: '报文段' },
        ],
      },
    ],
    score: 10,
    order: 12,
  },
  // 复合题 x1
  {
    id: 'dq013',
    type: 'composite',
    typeName: '复合题',
    material: '阅读以下网络拓扑描述：\n\n某公司网络由3个子网组成，子网A（192.168.1.0/24）连接了50台主机，子网B（192.168.2.0/24）连接了30台主机，子网C（192.168.3.0/24）连接了20台主机。三个子网通过一台路由器R互联。公司还通过路由器R连接到互联网，使用NAT技术实现内网主机访问外网。\n\n请根据以上描述回答下列问题：',
    subQuestions: [
      {
        id: 'dsq1',
        type: 'single',
        typeName: '单选题',
        content: '该公司网络中，路由器R至少需要几个接口？',
        options: [
          { label: 'A', text: '2个' },
          { label: 'B', text: '3个' },
          { label: 'C', text: '4个' },
          { label: 'D', text: '5个' },
        ],
        score: 3,
      },
      {
        id: 'dsq2',
        type: 'multiple',
        typeName: '多选题',
        content: '关于NAT技术，以下说法正确的是？',
        options: [
          { label: 'A', text: '可以节省公网IP地址' },
          { label: 'B', text: '可以隐藏内网拓扑结构' },
          { label: 'C', text: '会增加网络延迟' },
          { label: 'D', text: '支持端到端的直接通信' },
        ],
        score: 4,
      },
      {
        id: 'dsq3',
        type: 'blank',
        typeName: '填空题',
        content: '子网A的广播地址是____，子网B可用的主机地址范围是____到____。',
        blanks: [
          { id: 'dsb1', order: 1 },
          { id: 'dsb2', order: 2 },
          { id: 'dsb3', order: 3 },
        ],
        blankCount: 3,
        score: 6,
      },
      {
        id: 'dsq4',
        type: 'essay',
        typeName: '简答题',
        content: '请简述NAT技术的工作原理，并说明其优缺点。',
        score: 8,
      },
    ],
    score: 21,
    order: 13,
  },
]

/**
 * Mock 数据 - 文档模式考试结果
 * 用于 ExamReviewDoc 页面展示
 */
export const mockDocExamResult = {
  examId: 'exam004',
  paperMode: 'document',
  examName: '计算机网络期末考试',
  submitTime: formatDate(new Date()),
  duration: 95,
  totalScore: 100,
  score: 72,
  examEndTime: formatDate(new Date(now.getTime() + 100 * 60 * 1000)),

  scorePublishMode: 'immediate',
  scorePublishContent: 'full',
  scorePublishDelay: 3,

  statistics: {
    totalQuestions: 13,
    correctCount: 7,
    wrongCount: 3,
    partialCount: 3,
  },

  questionGroups: [
    {
      type: 'single',
      typeName: '单选题',
      totalScore: 6,
      gainedScore: 4,
      questions: [
        {
          id: 'dq001', index: 1,
          content: 'TCP协议属于OSI模型的哪一层？',
          score: 2, studentScore: 2, status: 'correct',
          options: [
            { label: 'A', text: '网络层' },
            { label: 'B', text: '传输层' },
            { label: 'C', text: '会话层' },
            { label: 'D', text: '应用层' },
          ],
          studentAnswer: 'B', correctAnswer: 'B',
          explanation: 'TCP（传输控制协议）工作在OSI模型的传输层（第4层）。',
        },
        {
          id: 'dq002', index: 2,
          content: 'HTTP协议默认使用的端口号是？',
          score: 2, studentScore: 0, status: 'wrong',
          options: [
            { label: 'A', text: '21' },
            { label: 'B', text: '22' },
            { label: 'C', text: '80' },
            { label: 'D', text: '443' },
          ],
          studentAnswer: 'D', correctAnswer: 'C',
          explanation: 'HTTP默认端口为80，HTTPS默认端口为443。',
        },
        {
          id: 'dq003', index: 3,
          content: 'IP地址192.168.1.1属于哪类地址？',
          score: 2, studentScore: 2, status: 'correct',
          options: [
            { label: 'A', text: 'A类' },
            { label: 'B', text: 'B类' },
            { label: 'C', text: 'C类' },
            { label: 'D', text: 'D类' },
          ],
          studentAnswer: 'C', correctAnswer: 'C',
          explanation: '192.168.x.x属于C类私有地址范围（192.168.0.0 - 192.168.255.255）。',
        },
      ],
    },
    {
      type: 'multiple',
      typeName: '多选题',
      totalScore: 8,
      gainedScore: 4,
      questions: [
        {
          id: 'dq004', index: 4,
          content: '以下哪些协议属于应用层协议？',
          score: 4, studentScore: 4, status: 'correct',
          options: [
            { label: 'A', text: 'HTTP' },
            { label: 'B', text: 'TCP' },
            { label: 'C', text: 'FTP' },
            { label: 'D', text: 'DNS' },
          ],
          studentAnswer: ['A', 'C', 'D'], correctAnswer: ['A', 'C', 'D'],
          explanation: 'HTTP、FTP、DNS都是应用层协议，TCP是传输层协议。',
        },
        {
          id: 'dq005', index: 5,
          content: '关于TCP三次握手，以下说法正确的是？',
          score: 4, studentScore: 0, status: 'wrong',
          options: [
            { label: 'A', text: '第一次握手：客户端发送SYN报文' },
            { label: 'B', text: '第二次握手：服务器发送SYN+ACK报文' },
            { label: 'C', text: '第三次握手：客户端发送ACK报文' },
            { label: 'D', text: '三次握手后连接即建立' },
          ],
          studentAnswer: ['A', 'B'], correctAnswer: ['A', 'B', 'C', 'D'],
          explanation: '四项都正确。TCP三次握手：SYN → SYN+ACK → ACK，完成后连接建立。',
        },
      ],
    },
    {
      type: 'judge',
      typeName: '判断题',
      totalScore: 4,
      gainedScore: 2,
      questions: [
        {
          id: 'dq006', index: 6,
          content: 'UDP协议是面向连接的可靠传输协议。',
          score: 2, studentScore: 2, status: 'correct',
          studentAnswer: false, correctAnswer: false,
          explanation: 'UDP是无连接的不可靠传输协议，TCP才是面向连接的可靠传输协议。',
        },
        {
          id: 'dq007', index: 7,
          content: 'IPv6地址长度为128位。',
          score: 2, studentScore: 0, status: 'wrong',
          studentAnswer: false, correctAnswer: true,
          explanation: 'IPv6地址长度确实为128位，IPv4地址长度为32位。',
        },
      ],
    },
    {
      type: 'blank',
      typeName: '填空题',
      totalScore: 6,
      gainedScore: 4,
      questions: [
        {
          id: 'dq008', index: 8,
          content: 'DNS的全称是____，它的主要功能是将____转换为IP地址。',
          score: 4, studentScore: 2, status: 'partial',
          studentAnswer: ['Domain Name System', '域名'],
          correctAnswer: ['Domain Name System', '域名'],
          explanation: 'DNS（Domain Name System，域名系统）负责将域名解析为IP地址。',
        },
        {
          id: 'dq009', index: 9,
          content: '子网掩码255.255.255.0对应的CIDR表示法为____。',
          score: 2, studentScore: 2, status: 'correct',
          studentAnswer: ['/24'],
          correctAnswer: ['/24'],
          explanation: '255.255.255.0 = 24个1，CIDR表示为/24。',
        },
      ],
    },
    {
      type: 'essay',
      typeName: '简答题',
      totalScore: 20,
      gainedScore: 15,
      questions: [
        {
          id: 'dq010', index: 10,
          content: '请简述TCP和UDP的主要区别，并各举一个典型应用场景。',
          score: 10, studentScore: 8, status: 'partial',
          studentAnswer: {
            text: 'TCP是面向连接的可靠传输协议，提供流量控制和拥塞控制，适用于文件传输（如FTP）。UDP是无连接的不可靠传输协议，传输速度快但不保证可靠性，适用于视频直播。',
            attachments: [
              { name: 'TCP对比图.png', size: 156789, type: 'image/png', url: 'https://picsum.photos/seed/tcp/800/600' },
            ],
          },
          correctAnswer: 'TCP：面向连接、可靠、有序、流量控制、拥塞控制，适用于HTTP/FTP等。UDP：无连接、不可靠、无序、开销小，适用于DNS查询、视频流、在线游戏等。',
          explanation: '关键区别在于连接性、可靠性、有序性和开销。',
          matchRate: 75,
          teacherComment: '回答基本正确，但缺少对有序性和开销的对比分析。',
        },
        {
          id: 'dq011', index: 11,
          content: '请画出并描述TCP三次握手的过程，说明每一步的作用。',
          score: 10, studentScore: 7, status: 'partial',
          studentAnswer: {
            text: 'TCP三次握手过程：\n1. 客户端发送SYN报文（seq=x），请求建立连接\n2. 服务器收到后发送SYN+ACK报文（seq=y, ack=x+1），确认并请求建立连接\n3. 客户端发送ACK报文（ack=y+1），连接建立\n\n三次握手的作用是确保双方都能正常收发数据。',
            attachments: [
              { name: '三次握手示意图.png', size: 234567, type: 'image/png', url: 'https://picsum.photos/seed/handshake/800/600' },
            ],
          },
          correctAnswer: '第一次：客户端→服务器 SYN(seq=x)，验证客户端发送能力。第二次：服务器→客户端 SYN+ACK(seq=y,ack=x+1)，验证服务器收发能力。第三次：客户端→服务器 ACK(ack=y+1)，验证客户端接收能力。',
          explanation: '三次握手确保双方收发能力正常，防止已失效的连接请求到达服务器。',
          matchRate: 82,
          teacherComment: '描述清晰，但缺少对每一步验证目的的详细说明。',
        },
      ],
    },
    {
      type: 'cloze',
      typeName: '完形填空',
      totalScore: 10,
      gainedScore: 8,
      questions: [
        {
          id: 'dq012', index: 12,
          content: '在计算机网络中，数据从源主机到目的主机的传输过程需要经过多个层次的处理...',
          score: 10, studentScore: 8, status: 'partial',
          blanks: [
            { order: 1, studentAnswer: 'A', correctAnswer: 'A', isCorrect: true, options: [{ label: 'A', text: '报文' }, { label: 'B', text: '数据帧' }, { label: 'C', text: '比特流' }, { label: 'D', text: '数据包' }] },
            { order: 2, studentAnswer: 'A', correctAnswer: 'A', isCorrect: true, options: [{ label: 'A', text: '报文段' }, { label: 'B', text: '数据帧' }, { label: 'C', text: '比特流' }, { label: 'D', text: '数据报' }] },
            { order: 3, studentAnswer: 'B', correctAnswer: 'B', isCorrect: true, options: [{ label: 'A', text: '源MAC地址' }, { label: 'B', text: '源IP地址' }, { label: 'C', text: '源端口号' }, { label: 'D', text: '序列号' }] },
            { order: 4, studentAnswer: 'C', correctAnswer: 'C', isCorrect: true, options: [{ label: 'A', text: '报文段' }, { label: 'B', text: '数据帧' }, { label: 'C', text: 'IP数据报' }, { label: 'D', text: '比特流' }] },
            { order: 5, studentAnswer: 'C', correctAnswer: 'B', isCorrect: false, options: [{ label: 'A', text: '报文' }, { label: 'B', text: '数据帧' }, { label: 'C', text: 'IP数据报' }, { label: 'D', text: '报文段' }] },
          ],
          explanation: '数据封装过程：应用层→报文，传输层→报文段，网络层→IP数据报，数据链路层→数据帧。',
        },
      ],
    },
    {
      type: 'composite',
      typeName: '复合题',
      totalScore: 21,
      gainedScore: 14,
      questions: [
        {
          id: 'dq013', index: 13,
          content: '阅读以下网络拓扑描述，回答下列问题。',
          material: '某公司网络由3个子网组成，子网A（192.168.1.0/24）连接了50台主机，子网B（192.168.2.0/24）连接了30台主机，子网C（192.168.3.0/24）连接了20台主机。三个子网通过一台路由器R互联。公司还通过路由器R连接到互联网，使用NAT技术实现内网主机访问外网。',
          score: 21, studentScore: 14, status: 'partial',
          subQuestions: [
            {
              id: 'dsq1', type: 'single', index: '13-1',
              content: '该公司网络中，路由器R至少需要几个接口？',
              score: 3, studentScore: 3, status: 'correct',
              options: [
                { label: 'A', text: '2个' },
                { label: 'B', text: '3个' },
                { label: 'C', text: '4个' },
                { label: 'D', text: '5个' },
              ],
              studentAnswer: 'C', correctAnswer: 'C',
              explanation: '3个子网各需1个接口 + 1个连接互联网的接口 = 4个。',
            },
            {
              id: 'dsq2', type: 'multiple', index: '13-2',
              content: '关于NAT技术，以下说法正确的是？',
              score: 4, studentScore: 0, status: 'wrong',
              options: [
                { label: 'A', text: '可以节省公网IP地址' },
                { label: 'B', text: '可以隐藏内网拓扑结构' },
                { label: 'C', text: '会增加网络延迟' },
                { label: 'D', text: '支持端到端的直接通信' },
              ],
              studentAnswer: ['A', 'B', 'D'], correctAnswer: ['A', 'B', 'C'],
              explanation: 'NAT节省公网IP、隐藏内网拓扑、会增加延迟，但不支持端到端直接通信。',
            },
            {
              id: 'dsq3', type: 'blank', index: '13-3',
              content: '子网A的广播地址是____，子网B可用的主机地址范围是____到____。',
              blankHints: [
                '子网A的广播地址',
                '子网B可用主机地址起始',
                '子网B可用主机地址结束',
              ],
              score: 6, studentScore: 4, status: 'partial',
              studentAnswer: ['192.168.1.255', '192.168.2.1', '192.168.2.255'],
              correctAnswer: ['192.168.1.255', '192.168.2.1', '192.168.2.254'],
              explanation: '广播地址为主机位全1，可用主机地址范围为.1到.254（.0为网络地址，.255为广播地址）。',
            },
            {
              id: 'dsq4', type: 'essay', index: '13-4',
              content: '请简述NAT技术的工作原理，并说明其优缺点。',
              score: 8, studentScore: 7, status: 'partial',
              studentAnswer: {
                text: 'NAT（网络地址转换）工作原理：当内网主机访问外网时，路由器将数据包的源IP地址从私有地址替换为公网地址，并记录映射关系。外网返回的数据包到达路由器后，根据映射关系将目的地址还原为内网私有地址。\n\n优点：节省公网IP地址、隐藏内网结构提高安全性。\n缺点：增加网络延迟、不支持端到端通信、某些应用协议不兼容。',
                attachments: [],
              },
              correctAnswer: 'NAT将内网私有IP映射为公网IP。优点：节省IP、安全性高。缺点：延迟增加、破坏端到端通信、部分协议不兼容。',
              explanation: 'NAT是解决IPv4地址不足的重要技术，但也带来了一些通信限制。',
              matchRate: 88,
              teacherComment: '回答全面，分析到位。',
            },
          ],
        },
      ],
    },
  ],
}
