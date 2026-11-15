import { parseCoachFeedback, parseCoachInput } from '../_shared/coachContract.ts'
import type { CoachInput } from '../_shared/coachContract.ts'

const bodyLimit = 16_384

interface CoachServices {
  origins: ReadonlySet<string>
  reserve: () => Promise<boolean>
  analyze: (input: CoachInput, signal: AbortSignal) => Promise<unknown>
}

async function readInput(request: Request): Promise<unknown> {
  const reader = request.body?.getReader()
  if (!reader) return null

  const decoder = new TextDecoder('utf-8', { fatal: true })
  let size = 0
  let text = ''
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) return JSON.parse(text + decoder.decode())
      size += value.byteLength
      if (size > bodyLimit) {
        await reader.cancel()
        return null
      }
      text += decoder.decode(value, { stream: true })
    }
  } catch {
    return null
  } finally {
    reader.releaseLock()
  }
}

export function createCoachHandler({ origins, reserve, analyze }: CoachServices) {
  return async (request: Request): Promise<Response> => {
    const origin = request.headers.get('origin')
    const headers = new Headers({ 'cache-control': 'no-store', vary: 'Origin' })
    const reply = (status: number, error: string) => Response.json({ error }, { status, headers })

    if (!origin || !origins.has(origin)) return reply(403, 'origin_not_allowed')
    headers.set('access-control-allow-origin', origin)
    headers.set('access-control-allow-methods', 'POST, OPTIONS')
    headers.set('access-control-allow-headers', 'content-type')
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers })
    if (request.method !== 'POST') return reply(405, 'method_not_allowed')
    if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
      return reply(415, 'expected_json')
    }

    const input = parseCoachInput(await readInput(request))
    if (!input) return reply(400, 'invalid_input')

    try {
      if (!await reserve()) return reply(429, 'quota_exhausted')
    } catch {
      return reply(503, 'quota_unavailable')
    }

    const timeout = AbortSignal.timeout(20_000)
    try {
      const raw = await analyze(input, AbortSignal.any([request.signal, timeout]))
      const feedback = parseCoachFeedback(raw)
      if (!feedback) return reply(502, 'invalid_feedback')
      return Response.json(feedback, { headers })
    } catch {
      return timeout.aborted ? reply(504, 'model_timeout') : reply(502, 'model_unavailable')
    }
  }
}
