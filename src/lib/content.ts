import { articleCategories, difficulties, topicCategories } from '../types/content'
import type { Article, Topic } from '../types/content'

type Content = Article | Topic

function sortContent<T extends Content>(items: T[]) {
  return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.slug.localeCompare(b.slug))
}

export const articles = sortContent(
  Object.values(import.meta.glob<Article>('../content/articles/*.json', { eager: true, import: 'default' })),
)

export const topics = sortContent(
  Object.values(import.meta.glob<Topic>('../content/topics/*.json', { eager: true, import: 'default' })),
)

export const findArticle = (slug: string | undefined) => articles.find((item) => item.slug === slug)
export const findTopic = (slug: string | undefined) => topics.find((item) => item.slug === slug)

export function categoryLabel(item: Content) {
  return 'sections' in item ? articleCategories[item.category] : topicCategories[item.category]
}

export function searchContent<T extends Content>(items: readonly T[], query: string, category: string) {
  const words = query.normalize('NFKC').toLowerCase().trim().split(/\s+/).filter(Boolean)
  return items.filter((item) => {
    if (category && item.category !== category) return false

    const body = 'sections' in item
      ? [difficulties[item.difficulty], ...item.sections.flatMap(({ heading, paragraphs, bullets }) => [heading, ...paragraphs, ...(bullets ?? [])])]
      : [...item.background, ...[...item.proArguments, ...item.conArguments].flatMap(({ claim, reasoning }) => [claim, reasoning]), ...item.discussionQuestions]
    const searchable = [item.title, item.summary, categoryLabel(item), ...item.tags, ...body]
      .join(' ').normalize('NFKC').toLowerCase()
    return words.every((word) => searchable.includes(word))
  })
}
