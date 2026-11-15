import { Link, useParams } from 'react-router'
import DetailLayout from '../components/DetailLayout'
import TextList from '../components/TextList'
import { findTopic } from '../lib/content'
import type { TopicArgument } from '../types/content'
import NotFound from './NotFound'

function ArgumentGroup({ side, items }: { side: 'pro' | 'con'; items: TopicArgument[] }) {
  return (
    <section className={`panel prose stance stance-${side}`}>
      <h3>{side === 'pro' ? '正方示範' : '反方示範'}</h3>
      <ul className="arguments" role="list">
        {items.map((item, index) => (
          <li key={index}>
            <h4>{item.claim}</h4>
            <p>{item.reasoning}</p>
            {item.sourceUrls?.map((url, source) => <a key={source} href={url}>資料來源 {source + 1}</a>)}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function TopicDetail() {
  const { slug } = useParams()
  const item = findTopic(slug)
  if (!item) return <NotFound />

  return (
    <DetailLayout item={item}>
      <Link className="button primary" to={`/practice?topic=${item.slug}`}>使用此辯題開始練習</Link>
      <section className="panel prose">
        <h2>辯題背景</h2>
        {item.background.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      </section>
      <section className="perspectives">
        <h2>正反方觀點</h2>
        <p>以下觀點供練習與比較。</p>
        <div className="argument-grid">
          <ArgumentGroup side="pro" items={item.proArguments} />
          <ArgumentGroup side="con" items={item.conArguments} />
        </div>
      </section>
      <section className="panel prose">
        <h2>延伸思考</h2>
        <TextList items={item.discussionQuestions} as="ol" />
      </section>
    </DetailLayout>
  )
}
