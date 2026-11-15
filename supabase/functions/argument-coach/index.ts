import { analyzeWithGemini } from './gemini.ts'
import { createCoachHandler } from './handler.ts'

const origins = new Set((Deno.env.get('COACH_ALLOWED_ORIGINS') ?? '').split(',').map((origin) => origin.trim()).filter(Boolean))
const key = Deno.env.get('GEMINI_API_KEY')?.trim()
const model = Deno.env.get('GEMINI_MODEL')?.trim()
const projectUrl = Deno.env.get('SUPABASE_URL')
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

Deno.serve(createCoachHandler({
  origins,
  async reserve() {
    if (!key || !model || !projectUrl || !serviceKey) throw new Error('Coach configuration is incomplete')
    const response = await fetch(`${projectUrl}/rest/v1/rpc/reserve_argument_coach_quota`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        authorization: `Bearer ${serviceKey}`,
        'content-type': 'application/json',
      },
      body: '{}',
      signal: AbortSignal.timeout(3000),
    })
    if (!response.ok) throw new Error('Quota service unavailable')
    const granted: unknown = await response.json()
    if (typeof granted !== 'boolean') throw new Error('Invalid quota response')
    return granted
  },
  analyze(input, signal) {
    if (!key || !model) throw new Error('Gemini is unavailable')
    return analyzeWithGemini(input, key, model, signal)
  },
}))
