import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'bianbattle-test-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  mkdirSync(join(root, 'scripts'))
  cpSync(new URL('../scripts/validate-content.mjs', import.meta.url), join(root, 'scripts/validate-content.mjs'))
  cpSync(new URL('../src/content/', import.meta.url), join(root, 'src/content'), { recursive: true })
  return {
    write: (name, data) => writeFileSync(join(root, 'src/content', name), data),
    validate: () => spawnSync(process.execPath, ['scripts/validate-content.mjs'], { cwd: root, encoding: 'utf8' }),
  }
}

test('驗證 CLI 接受教材及辯題資料', (t) => {
  const { validate } = fixture(t)
  const result = validate()
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /內容驗證通過/)
})

test('驗證 CLI 拒絕破損 JSON、重複 slug、無效日期與混用內容類型', (t) => {
  const { write, validate } = fixture(t)
  write('articles/broken.json', '{')
  write('articles/wrong-name.json', JSON.stringify({
    slug: 'ask-focused-questions', title: '測試教學', summary: '摘要', tags: ['質詢'],
    category: 'cross-examination', difficulty: 'beginner', updatedAt: '2026-02-29',
    sections: [], proArguments: [],
  }))
  const result = validate()
  assert.equal(result.status, 1)
  assert.match(result.stderr, /articles\/broken\.json/)
  for (const diagnostic of [/檔名必須與 slug 一致/, /slug 重複/, /updatedAt 必須是有效/, /sections 至少/, /proArguments 不適用/]) {
    assert.match(result.stderr, diagnostic)
  }
})

test('驗證 CLI 拒絕缺少反方論點與非 HTTP(S) 來源', (t) => {
  const { write, validate } = fixture(t)
  write('topics/invalid-topic.json', JSON.stringify({
    slug: 'invalid-topic', title: '測試辯題', summary: '摘要', tags: ['教育'],
    category: 'education', updatedAt: '2024-02-29', background: ['背景'],
    proArguments: [{ claim: '主張', reasoning: '理由', sourceUrls: ['ftp://example.test'] }],
    conArguments: [], discussionQuestions: ['問題？'], sections: [],
  }))
  const result = validate()
  assert.equal(result.status, 1)
  assert.match(result.stderr, /conArguments 至少/)
  assert.match(result.stderr, /sourceUrls 必須是 HTTP\(S\)/)
  assert.match(result.stderr, /sections 不適用/)
  assert.doesNotMatch(result.stderr, /updatedAt/)
})
