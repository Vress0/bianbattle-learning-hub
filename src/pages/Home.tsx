import { Link } from 'react-router'
import ContentCard from '../components/ContentCard'
import { articles, topics } from '../lib/content'
import type { Article, Topic } from '../types/content'

const example = [
  { label: '主張', text: '大學圖書館應延長開放時間。' },
  { label: '理由', text: '晚間有自習需求的學生能多一個去處。' },
  { label: '證據', text: '用座位使用紀錄檢查晚間需求。' },
]

function Featured({ title, path, items }: { title: string; path: '/learn' | '/topics'; items: (Article | Topic)[] }) {
  return (
    <section className="featured">
      <div className="section-heading">
        <h2>{title}</h2>
        <Link to={path}>查看全部{path === '/learn' ? '教學' : '辯題'} <span aria-hidden="true">↗</span></Link>
      </div>
      <ul className="card-grid" role="list">
        {items.slice(0, 3).map((item) => <ContentCard key={item.slug} item={item} heading="h3" />)}
      </ul>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">辯論學習中心</p>
          <h1 id="hero-title">Bian<span>Battle</span><strong>論道之前，先練好你的論點。</strong></h1>
          <p className="hero-description">從讀懂辯題、組織立論到回應對手。用短篇教學打好基礎，再到辯題資料庫練習比較兩方觀點。</p>
          <div className="actions">
            <Link className="button primary" to="/learn">開始學習 <span aria-hidden="true">↗</span></Link>
            <Link className="button" to="/topics">探索辯題</Link>
          </div>
        </div>
        <div className="hero-scene">
          <div className="hero-landscape" aria-hidden="true" />
          <figure className="hero-example">
            <figcaption>一個論點怎麼組成？</figcaption>
            <ol className="example-steps" role="list">
              {example.map(({ label, text }) => (
                <li key={label}><strong>{label}</strong><span>{text}</span></li>
              ))}
            </ol>
          </figure>
        </div>
      </section>
      <section className="panel practice-preview" aria-labelledby="home-practice">
        <div>
          <h2 id="home-practice">AI 論點教練</h2>
          <p>選定辯題和立場，寫一段論點，再從回饋中找出下一步怎麼改。</p>
          <Link className="button primary" to="/practice">開始論點練習</Link>
        </div>
        <dl>
          <div><dt>主張清晰度</dt><dd>讀者能一眼辨認你的立場嗎？</dd></div>
          <div><dt>推理完整性</dt><dd>理由如何支持你的結論？</dd></div>
          <div><dt>證據支持</dt><dd>有哪些資料可以檢驗你的推論？</dd></div>
        </dl>
      </section>
      <Featured title="精選教學" path="/learn" items={articles} />
      <Featured title="精選辯題" path="/topics" items={topics} />
    </>
  )
}
