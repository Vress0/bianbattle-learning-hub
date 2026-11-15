import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import { argumentLimit, parseCoachInput } from '../../supabase/functions/_shared/coachContract'
import type { CoachFeedback, Side } from '../../supabase/functions/_shared/coachContract'
import CoachResults from '../components/CoachResults'
import PageHeading from '../components/PageHeading'
import { coachEndpoint, createExampleFeedback, requestCoachFeedback } from '../lib/coach'
import { findTopic, topics } from '../lib/content'

type Mode = 'demo' | 'ai'
type Result =
  | { status: 'idle' | 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; feedback: CoachFeedback; mode: Mode; sample?: string }

export default function Practice() {
  const [params, setParams] = useSearchParams()
  const [side, setSide] = useState<Side>('pro')
  const [argument, setArgument] = useState('')
  const [mode, setMode] = useState<Mode>('demo')
  const [result, setResult] = useState<Result>({ status: 'idle' })
  const request = useRef<AbortController | null>(null)
  const editor = useRef<HTMLTextAreaElement>(null)
  const topicSelect = useRef<HTMLSelectElement>(null)
  const resultHeading = useRef<HTMLHeadingElement>(null)

  const topic = findTopic(params.get('topic') ?? undefined)
  const sample = topic && (side === 'pro' ? topic.proArguments : topic.conArguments)[0].claim
  const loading = result.status === 'loading'

  useEffect(() => () => request.current?.abort(), [])
  useEffect(() => {
    if (result.status === 'ready') resultHeading.current?.focus()
  }, [result])

  function clear() {
    request.current?.abort()
    request.current = null
    setArgument('')
    setResult({ status: 'idle' })
    editor.current?.focus()
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (request.current) return
    if (!topic) {
      setResult({ status: 'error', message: '請先選擇辯題。' })
      topicSelect.current?.focus()
      return
    }
    if (!argument.trim()) {
      setResult({ status: 'error', message: '請輸入非空白的論點，再送出分析。' })
      editor.current?.focus()
      return
    }
    if (mode === 'demo' && sample) {
      setResult({ status: 'ready', mode, sample, feedback: createExampleFeedback(sample) })
      return
    }
    if (!coachEndpoint) return
    const input = parseCoachInput({ topic: topic.title, side, argument })
    if (!input) {
      setResult({ status: 'error', message: '辯題或論點超出 Gemini 模式的長度限制。' })
      return
    }

    const controller = new AbortController()
    request.current = controller
    setResult({ status: 'loading' })
    try {
      const feedback = await requestCoachFeedback(coachEndpoint, input, controller.signal)
      if (!controller.signal.aborted) setResult({ status: 'ready', mode: 'ai', feedback })
    } catch (error) {
      if (!controller.signal.aborted) {
        setResult({ status: 'error', message: error instanceof Error ? error.message : '分析失敗，請再試一次。' })
      }
    } finally {
      if (request.current === controller) request.current = null
    }
  }

  return (
    <div className="practice">
      <PageHeading title="AI 論點教練" summary="選擇辯題與立場，寫下一段論點，練習把主張、推理與證據說清楚。" />
      <div className="practice-grid">
        <form className="panel coach-form" onSubmit={submit} noValidate>
          <h2>撰寫論點</h2>
          <fieldset disabled={loading}>
            <legend>分析模式</legend>
            <div className="coach-options">
              <label><input type="radio" name="mode" checked={mode === 'demo'} onChange={() => setMode('demo')} /> 範例模式</label>
              <label><input type="radio" name="mode" checked={mode === 'ai'} disabled={!coachEndpoint} onChange={() => setMode('ai')} /> Gemini 模式</label>
            </div>
          </fieldset>
          <p className="coach-hint">
            {mode === 'ai'
              ? '送出後，辯題、立場與論點會傳至本專案的 Supabase Function 和 Google Gemini。請勿輸入個資。'
              : `範例模式只顯示示例的固定回饋，你的草稿留在本頁。${coachEndpoint ? '' : ' 此版本尚未設定 Gemini 模式。'}`}
          </p>
          <label className="coach-field" htmlFor="practice-topic">辯題</label>
          <select id="practice-topic" ref={topicSelect} value={topic?.slug ?? ''} disabled={loading}
            onChange={(event) => setParams(event.target.value ? { topic: event.target.value } : {}, { replace: true })}>
            <option value="">選擇一個辯題</option>
            {topics.map((item) => <option key={item.slug} value={item.slug}>{item.title}</option>)}
          </select>
          <fieldset disabled={loading}>
            <legend>立場</legend>
            <div className="coach-options">
              <label><input type="radio" name="side" checked={side === 'pro'} onChange={() => setSide('pro')} /> 正方</label>
              <label><input type="radio" name="side" checked={side === 'con'} onChange={() => setSide('con')} /> 反方</label>
            </div>
          </fieldset>
          <div className="coach-editor-heading">
            <label className="coach-field" htmlFor="practice-argument">你的論點</label>
            <button className="coach-text-button" type="button" disabled={!sample || loading}
              onClick={() => { if (sample) setArgument(sample.slice(0, argumentLimit)); editor.current?.focus() }}>帶入示例</button>
          </div>
          <textarea id="practice-argument" ref={editor} value={argument} maxLength={argumentLimit} readOnly={loading}
            aria-describedby="practice-length" placeholder="寫下你的主張、理由，以及能支持它的資料。"
            onChange={(event) => setArgument(event.target.value)} />
          <p id="practice-length" className="coach-hint">{argument.length} / {argumentLimit} 字元</p>
          <div className="actions coach-actions">
            <button className="button primary" type="submit" disabled={loading}>
              {loading ? '分析中…' : mode === 'demo' ? '查看範例回饋' : '送出 AI 分析'}
            </button>
            <button className="button" type="button" onClick={clear}>{loading ? '取消並清除' : '清除重練'}</button>
          </div>
          {result.status === 'error' && <p role="alert" className="coach-error">{result.message}</p>}
        </form>
        <section className="panel coach-result" aria-labelledby="coach-result-title">
          <h2 id="coach-result-title" ref={resultHeading} tabIndex={-1}>分析回饋</h2>
          <p role="status" className="coach-hint">
            {loading && '正在分析論點，請稍候。'}
            {result.status === 'idle' && '完成左側表單即可查看回饋。'}
          </p>
          {result.status === 'ready' && (
            <>
              {result.sample && <blockquote>示例論點：{result.sample}</blockquote>}
              <CoachResults feedback={result.feedback} mode={result.mode} />
            </>
          )}
        </section>
      </div>
    </div>
  )
}
