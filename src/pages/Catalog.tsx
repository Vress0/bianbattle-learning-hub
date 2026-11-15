import { useRef, useState } from 'react'
import ContentCard from '../components/ContentCard'
import PageHeading from '../components/PageHeading'
import { articles, searchContent, topics } from '../lib/content'
import { articleCategories, topicCategories } from '../types/content'
import type { Article, Topic } from '../types/content'

interface CatalogProps {
  kind: 'learn' | 'topics'
}

export default function Catalog({ kind }: CatalogProps) {
  const searchInput = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const isLearn = kind === 'learn'
  const items: (Article | Topic)[] = isLearn ? articles : topics
  const categories = isLearn ? articleCategories : topicCategories
  const filtered = searchContent(items, query, category)

  function reset() {
    setQuery('')
    setCategory('')
    searchInput.current?.focus()
  }

  return (
    <>
      <PageHeading
        title={isLearn ? '辯論教學' : '辯題資料庫'}
        summary={isLearn ? '從讀懂辯題到練習攻防，依照想要加強的技巧挑選文章。' : '比較正反方的示範論點，找出值得深究的爭點。'}
      />
      <div className="filters">
        <label>搜尋{isLearn ? '教學' : '辯題'}
          <input ref={searchInput} type="search" value={query} onChange={(event) => setQuery(event.target.value)}
            placeholder={isLearn ? '例如：主張、反駁' : '例如：AI、公共空間'} />
        </label>
        <label>分類
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">全部分類</option>
            {Object.entries(categories).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </div>
      <section aria-label={isLearn ? '教學結果' : '辯題結果'}>
        <p className="result-count" role="status">共 {filtered.length} {isLearn ? '篇教學' : '道辯題'}</p>
        {filtered.length > 0 ? (
          <ul className="card-grid">
            {filtered.map((item) => <ContentCard key={item.slug} item={item} />)}
          </ul>
        ) : (
          <div className="panel empty">
            <h2>找不到符合條件的{isLearn ? '教學' : '辯題'}</h2>
            <p>調整關鍵字或分類後再試一次。</p>
            <button className="button" type="button" onClick={reset}>清除篩選</button>
          </div>
        )}
      </section>
    </>
  )
}
