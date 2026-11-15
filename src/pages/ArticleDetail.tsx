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
      {item.sections.map((section, index) => (
        <section className="panel prose" key={index}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((paragraph, line) => <p key={line}>{paragraph}</p>)}
          {section.bullets && section.bullets.length > 0 && <TextList items={section.bullets} />}
        </section>
      ))}
    </DetailLayout>
  )
}
