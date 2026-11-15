import { parseCoachFeedback } from '../../supabase/functions/_shared/coachContract'
import type { CoachFeedback, CoachInput } from '../../supabase/functions/_shared/coachContract'

export const coachEndpoint = import.meta.env.VITE_COACH_ENDPOINT?.trim()

const errors: Record<number, string> = {
  400: '請確認辯題、立場與論點長度後，再送出。',
  403: '此網站尚未獲准使用 AI 教練。',
  429: 'AI 練習額度暫時用完，請稍後再試。',
  503: 'AI 教練目前無法使用，請稍後再試。',
  504: 'AI 分析逾時，請保留草稿並稍後重試。',
}

export async function requestCoachFeedback(
  endpoint: string,
  input: CoachInput,
  signal: AbortSignal,
): Promise<CoachFeedback> {
  if (!URL.canParse(endpoint)) throw new Error('AI 教練網址設定錯誤。')
  const url = new URL(endpoint)
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
  if (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) {
    throw new Error('AI 教練網址設定錯誤。')
  }

  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      redirect: 'error',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: AbortSignal.any([signal, AbortSignal.timeout(28_000)]),
    })
  } catch {
    throw new Error('無法連線到 AI 教練或請求逾時，請稍後再試。')
  }

  if (!response.ok) throw new Error(errors[response.status] ?? 'AI 分析失敗，請稍後再試。')
  const feedback = parseCoachFeedback(await response.json().catch(() => null))
  if (!feedback) throw new Error('AI 回傳的資料格式有誤，請再試一次。')
  return feedback
}

export function createExampleFeedback(claim: string): CoachFeedback {
  return {
    scores: { clarity: 85, reasoning: 30, evidence: 0 },
    strengths: ['示例用一句話提出主張，讀者可以辨認選擇的立場。'],
    issues: ['示例沒有交代主張成立的原因，也未提出可查證的證據。'],
    suggestions: ['補上一個原因，解釋它如何支持主張。接著指出需要哪一類資料來檢驗推論。'],
    rewrite: `${claim}\n我方的理由是【補上一項與主張相關的原因】。若【前提成立】，就可能【說明影響】。要確認推論，還需要查證【填入需要的資料】。`,
  }
}
