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
