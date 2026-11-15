export const articleCategories = {
  basics: '辯論基礎',
  argument: '立論',
  rebuttal: '反駁',
  'cross-examination': '質詢',
} as const

export const topicCategories = {
  education: '教育',
  technology: '科技',
  society: '社會',
} as const

export const difficulties = {
  beginner: '入門',
  intermediate: '進階',
  advanced: '挑戰',
} as const

interface ContentBase {
  slug: string
  title: string
  summary: string
  tags: string[]
  updatedAt: string
}

export interface Article extends ContentBase {
  category: keyof typeof articleCategories
  difficulty: keyof typeof difficulties
  sections: { heading: string; paragraphs: string[]; bullets?: string[] }[]
}

export interface TopicArgument {
  claim: string
  reasoning: string
  sourceUrls?: string[]
}

export interface Topic extends ContentBase {
  category: keyof typeof topicCategories
  background: string[]
  proArguments: TopicArgument[]
  conArguments: TopicArgument[]
  discussionQuestions: string[]
}
