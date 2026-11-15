import { useParams } from 'react-router'
import DetailLayout from '../components/DetailLayout'
import TextList from '../components/TextList'
import { findArticle } from '../lib/content'
import NotFound from './NotFound'

export default function ArticleDetail() {
  const { slug } = useParams()
  const item = findArticle(slug)
  if (!item) return <NotFound />

  return (
    <DetailLayout item={item}>
      <nav className="article-outline" aria-label="文章章節">
        <p>本篇章節</p>
        <ol>
          {item.sections.map((section, index) => (
            <li key={index}><a href={`#section-${index + 1}`}>{section.heading}</a></li>
          ))}
        </ol>
      </nav>
      {item.sections.map((section, index) => (
        <section className="panel prose article-section" key={index} id={`section-${index + 1}`} tabIndex={-1}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((paragraph, line) => <p key={line}>{paragraph}</p>)}
          {section.bullets && section.bullets.length > 0 && <TextList items={section.bullets} />}
        </section>
      ))}
    </DetailLayout>
  )
}
