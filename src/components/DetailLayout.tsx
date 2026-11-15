import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { categoryLabel } from '../lib/content'
import { difficulties } from '../types/content'
import type { Article, Topic } from '../types/content'
import PageHeading from './PageHeading'

export default function DetailLayout({ item, children }: { item: Article | Topic; children: ReactNode }) {
  const isArticle = 'sections' in item

  return (
    <article className={isArticle ? 'detail detail-article' : 'detail detail-topic'}>
      <Link className="back-link" to={isArticle ? '/learn' : '/topics'}>
        ← 返回{isArticle ? '教學列表' : '辯題列表'}
      </Link>
      <div className="meta">
        <span className={isArticle ? 'badge' : 'badge badge-topic'}>{categoryLabel(item)}</span>
        {isArticle && <span className="difficulty">{difficulties[item.difficulty]}</span>}
      </div>
      <PageHeading title={item.title} summary={item.summary} />
      <div className="detail-meta">
        <span>{item.tags.join('、')}</span>
        <span>更新於 <time dateTime={item.updatedAt}>{item.updatedAt}</time></span>
      </div>
      {children}
    </article>
  )
}
