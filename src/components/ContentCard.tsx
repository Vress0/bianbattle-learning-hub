import { Link } from 'react-router'
import { categoryLabel } from '../lib/content'
import { difficulties } from '../types/content'
import type { Article, Topic } from '../types/content'

interface ContentCardProps {
  item: Article | Topic
  heading?: 'h2' | 'h3'
}

export default function ContentCard({ item, heading: Heading = 'h2' }: ContentCardProps) {
  const isArticle = 'sections' in item

  return (
    <li className={isArticle ? 'content-card' : 'content-card content-card-topic'}>
      <div className="meta">
        <span className={isArticle ? 'badge' : 'badge badge-topic'}>{categoryLabel(item)}</span>
        {isArticle && <span className="difficulty">{difficulties[item.difficulty]}</span>}
      </div>
      <Heading><Link to={`/${isArticle ? 'learn' : 'topics'}/${item.slug}`}>{item.title}</Link></Heading>
      <p>{item.summary}</p>
      <div className="card-bottom">
        <span>{item.tags.join('、')}</span>
        <span className="card-arrow" aria-hidden="true">↗</span>
      </div>
    </li>
  )
}
