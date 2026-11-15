import assert from 'node:assert/strict'
import { test } from 'node:test'
import { argumentLimit, parseCoachFeedback, parseCoachInput } from '../supabase/functions/_shared/coachContract.ts'
import { analyzeWithGemini } from '../supabase/functions/argument-coach/gemini.ts'
import { createCoachHandler } from '../supabase/functions/argument-coach/handler.ts'

const origin = 'http://localhost:5173'
const input = { topic: '應否提供課堂錄影？', side: 'pro', argument: '我方支持錄影，因為學生可以在課後複習。' }
const feedback = {
  scores: { clarity: 85, reasoning: 65, evidence: 0 },
  strengths: ['立場清楚。'],
  issues: ['缺少證據。'],
  suggestions: ['找能驗證複習需求的資料。'],
  rewrite: '我方支持課堂錄影，因為學生可以在課後複習。實際需求應用【待查證】確認。',
}

function request(body = input, overrides = {}) {
  return new Request('http://localhost:54321/functions/v1/argument-coach', {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json' },
    body: JSON.stringify(body),
    ...overrides,
  })
}

function handler(overrides = {}) {
  return createCoachHandler({
    origins: new Set([origin]),
    reserve: async () => true,
    analyze: async () => feedback,
    ...overrides,
  })
}

test('只接受已知立場與非空白論點，並在長度上限內修剪空白', () => {
  assert.deepEqual(parseCoachInput({ ...input, argument: '  論點  ' }), { ...input, argument: '論點' })
  assert.ok(parseCoachInput({ ...input, argument: '理'.repeat(argumentLimit) }))
  for (const invalid of [{ argument: '　 ' }, { argument: '理'.repeat(argumentLimit + 1) }, { side: 'unknown' }, { topic: 42 }]) {
    assert.equal(parseCoachInput({ ...input, ...invalid }), null)
  }
})

test('回饋要求三項整數分數和有效文字，移除未定義欄位', () => {
  assert.deepEqual(parseCoachFeedback({ ...feedback, raw: 'extra' }), feedback)
  for (const evidence of [-1, 101, 60.5, '70', undefined]) {
    assert.equal(parseCoachFeedback({ ...feedback, scores: { ...feedback.scores, evidence } }), null)
  }
  assert.equal(parseCoachFeedback({ ...feedback, issues: [] }), null)
  assert.equal(parseCoachFeedback({ ...feedback, rewrite: ' ' }), null)
})

test('允許來源的正常請求回傳已驗證資料並禁止快取', async () => {
  const response = await handler({
    analyze: async (actual) => { assert.deepEqual(actual, input); return feedback },
  })(request())
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('access-control-allow-origin'), origin)
  assert.equal(response.headers.get('cache-control'), 'no-store')
  assert.deepEqual(await response.json(), feedback)
})

test('未知來源、錯誤格式和過大請求不會占用模型配額', async () => {
  const handle = handler({ reserve: async () => { assert.fail('不得保留配額') } })
  const preflight = await handle(request(null, { method: 'OPTIONS', body: undefined }))
  assert.equal(preflight.status, 204)
  const invalidRequests = [
    [request(input, { headers: { origin: 'https://example.test' } }), 403],
    [request(input, { headers: { origin } }), 415],
    [request({ ...input, argument: ' ' }), 400],
    [request(input, { body: '{' }), 400],
    [request({ ...input, extra: 'x'.repeat(17_000) }), 400],
  ]
  for (const [invalid, status] of invalidRequests) assert.equal((await handle(invalid)).status, status)
})

test('配額不足、配額服務故障、模型故障和無效回饋各自回報錯誤', async () => {
  const unexpectedModel = async () => assert.fail('不得呼叫模型')
  assert.equal((await handler({ reserve: async () => false, analyze: unexpectedModel })(request())).status, 429)
  assert.equal((await handler({ reserve: async () => { throw Error('offline') }, analyze: unexpectedModel })(request())).status, 503)
  assert.equal((await handler({ analyze: async () => { throw Error('upstream') } })(request())).status, 502)
  assert.equal((await handler({ analyze: async () => ({ scores: {} }) })(request())).status, 502)
})

test('Gemini 封裝送出 JSON Schema 並只解析完整的候選回覆', async (t) => {
  let finishReason = 'STOP'
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    const body = JSON.parse(options.body)
    assert.match(url, /generativelanguage\.googleapis\.com\/v1beta\/models\//)
    assert.equal(body.generationConfig.responseMimeType, 'application/json')
    assert.deepEqual(JSON.parse(body.contents[0].parts[0].text), input)
    assert.deepEqual(body.generationConfig.responseJsonSchema.properties.scores.required, ['clarity', 'reasoning', 'evidence'])
    return Response.json({ candidates: [{ finishReason, content: { parts: [{ text: JSON.stringify(feedback) }] } }] })
  })
  const signal = new AbortController().signal
  assert.deepEqual(await analyzeWithGemini(input, 'mock-key', 'mock-model', signal), feedback)
  finishReason = 'MAX_TOKENS'
  assert.equal(await analyzeWithGemini(input, 'mock-key', 'mock-model', signal), null)
})
