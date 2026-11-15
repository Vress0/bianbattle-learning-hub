import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { createServer } from 'vite'

let server
let content
let App

before(async () => {
  server = await createServer({ server: { middlewareMode: true, ws: false, hmr: false, watch: null } })
  content = await server.ssrLoadModule('/src/lib/content.ts')
  const app = await server.ssrLoadModule('/src/App.tsx')
  App = app.default
})

after(async () => {
  await server?.close()
})

test('教學內文搜尋與分類一起生效', () => {
  const { articles, searchContent } = content
  assert.ok(searchContent(articles, '　實驗課　追問 ', 'cross-examination')
    .some(({ slug }) => slug === 'ask-focused-questions'))
  assert.deepEqual(searchContent(articles, '實驗課', 'basics'), [])
  assert.deepEqual(searchContent(articles, '  ', ''), articles)
})

test('辯題搜尋以全半形、大小寫等價比對，也搜尋討論問題', () => {
  const { topics, searchContent } = content
  assert.ok(searchContent(topics, 'ａｉ', 'education').some(({ slug }) => slug === 'ai-in-education'))
  assert.ok(searchContent(topics, '試辦一學期', 'education')
    .some(({ slug }) => slug === 'recorded-university-lectures'))
  assert.deepEqual(searchContent(topics, '找不到的關鍵字', ''), [])
})

function renderRoute(path) {
  return renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [path] }, createElement(App)))
}

test('新增教材由現有列表及動態路由讀取', () => {
  const title = /質詢怎麼問？用短問題釐清關鍵前提/
  assert.match(renderRoute('/learn'), title)
  const detail = renderRoute('/learn/ask-focused-questions')
  assert.match(detail, title)
  assert.match(detail, /每次只問一件事/)
})

test('新增辯題由現有列表及動態路由讀取，並呈現正反方', () => {
  const title = /大學應否原則上提供講授課的課堂錄影？/
  assert.match(renderRoute('/topics'), title)
  const detail = renderRoute('/topics/recorded-university-lectures')
  assert.match(detail, title)
  assert.match(detail, /正方示範/)
  assert.match(detail, /反方示範/)
  assert.match(detail, /延伸思考/)
})

test('未知路徑與未知教材、辯題 slug 統一顯示 404', () => {
  for (const path of ['/unknown', '/learn/unknown', '/topics/unknown']) {
    assert.match(renderRoute(path), /找不到這個頁面/)
  }
})

test('首頁提供兩個主要入口及可讀的立論示例', () => {
  const home = renderRoute('/')
  assert.match(home, /href="\/learn"[^>]*>開始學習/)
  assert.match(home, /href="\/topics"[^>]*>探索辯題/)
  assert.match(home, /<figcaption>一個論點怎麼組成？<\/figcaption>/)
})

test('文章章節目錄指向可聚焦的對應段落', () => {
  const detail = renderRoute('/learn/ask-focused-questions')
  assert.match(detail, /<nav [^>]*aria-label="文章章節"/)
  const links = [...detail.matchAll(/href="#(section-\d+)"/g)].map((match) => match[1])
  const targets = [...detail.matchAll(/<section [^>]*id="(section-\d+)" tabindex="-1"/g)].map((match) => match[1])
  assert.ok(links.length > 1)
  assert.deepEqual(links, targets)
  assert.equal(new Set(targets).size, targets.length)
})

test('練習頁接受辯題深層連結並提供離線範例模式', () => {
  const detail = renderRoute('/topics/recorded-university-lectures')
  assert.match(detail, /href="\/practice\?topic=recorded-university-lectures"/)
  const practice = renderRoute('/practice?topic=recorded-university-lectures')
  assert.match(practice, /<h1>AI 論點教練<\/h1>/)
  assert.match(practice, /value="recorded-university-lectures" selected=""/)
  assert.match(practice, /查看範例回饋/)
  assert.doesNotMatch(renderRoute('/practice?topic=missing'), /value="missing"/)
})

test('瀏覽器 API 用戶端拒絕錯誤狀態與無效回饋', async (t) => {
  const { requestCoachFeedback } = await server.ssrLoadModule('/src/lib/coach.ts')
  let mockResponse = Response.json({ error: 'quota_exhausted' }, { status: 429 })
  t.mock.method(globalThis, 'fetch', async () => mockResponse)
  const send = () => requestCoachFeedback('https://example.test/coach', {
    topic: '辯題', side: 'pro', argument: '論點',
  }, new AbortController().signal)
  await assert.rejects(send, /額度/)
  mockResponse = Response.json({ scores: {} })
  await assert.rejects(send, /資料格式/)
  mockResponse = new Response('not JSON')
  await assert.rejects(send, /資料格式/)
  mockResponse = Response.json({
    scores: { clarity: 80, reasoning: 60, evidence: 20 },
    strengths: ['主張明確'], issues: ['缺少佐證'], suggestions: ['找可查證資料'], rewrite: '補上一項理由。',
  })
  assert.equal((await send()).scores.clarity, 80)
})
