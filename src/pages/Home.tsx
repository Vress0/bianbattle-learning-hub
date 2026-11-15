import { Link } from 'react-router'
import ContentCard from '../components/ContentCard'
import { articles, topics } from '../lib/content'
import type { Article, Topic } from '../types/content'

function Featured({ title, path, items }: { title: string; path: '/learn' | '/topics'; items: (Article | Topic)[] }) {
  return (
    <section className="featured">
      <div className="section-heading">
        <h2>{title}</h2>
        <Link to={path}>查看全部{path === '/learn' ? '教學' : '辯題'} <span aria-hidden="true">→</span></Link>
      </div>
      <ul className="card-grid">
        {items.slice(0, 3).map((item) => <ContentCard key={item.slug} item={item} heading="h3" />)}
      </ul>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow"><span aria-hidden="true" /> AI 辯論學習中心</p>
          <h1>讓每個觀點<br />都有<span>清楚的理由</span></h1>
          <p className="hero-description">從讀懂辯題、組織立論到回應對手，把辯論技巧用在一場具體的討論裡。</p>
          <div className="actions">
            <Link className="button primary" to="/learn">開始學習 <span aria-hidden="true">→</span></Link>
            <Link className="button" to="/topics">探索辯題</Link>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-outer" />
          <div className="orbit orbit-inner" />
          <div className="speech speech-back"><i /><i /><i /></div>
          <div className="speech speech-front"><i /><i /><i /></div>
          <span className="spark spark-one">+</span>
          <span className="spark spark-two">+</span>
        </div>
      </section>
      <Featured title="精選教學" path="/learn" items={articles} />
      <Featured title="精選辯題" path="/topics" items={topics} />
    </>
  )
}
