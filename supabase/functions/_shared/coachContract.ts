export const argumentLimit = 2000
export const topicLimit = 160

export const metrics = {
  clarity: '主張清晰度',
  reasoning: '推理完整性',
  evidence: '證據支持',
} as const

export type Side = 'pro' | 'con'
type Metric = keyof typeof metrics

export interface CoachInput {
  topic: string
  side: Side
  argument: string
}

export interface CoachFeedback {
  scores: Record<Metric, number>
  strengths: string[]
  issues: string[]
  suggestions: string[]
  rewrite: string
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isText(value: unknown, limit: number): value is string {
  return typeof value === 'string' && value.length <= limit && value.trim().length > 0
}

export function parseCoachInput(value: unknown): CoachInput | null {
  if (!isRecord(value)) return null
  const { topic, side, argument } = value
  if (!isText(topic, topicLimit) || !isText(argument, argumentLimit)) return null
  if (side !== 'pro' && side !== 'con') return null
  return { topic: topic.trim(), side, argument: argument.trim() }
}

function isScore(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 100
}

function isFeedbackList(value: unknown): value is string[] {
  return Array.isArray(value) && value.length >= 1 && value.length <= 4
    && value.every((item) => isText(item, 500))
}

export function parseCoachFeedback(value: unknown): CoachFeedback | null {
  if (!isRecord(value) || !isRecord(value.scores)) return null
  const { clarity, reasoning, evidence } = value.scores
  const { strengths, issues, suggestions, rewrite } = value
  if (!isScore(clarity) || !isScore(reasoning) || !isScore(evidence)) return null
  if (!isFeedbackList(strengths) || !isFeedbackList(issues) || !isFeedbackList(suggestions)) return null
  if (!isText(rewrite, 1500)) return null
  return { scores: { clarity, reasoning, evidence }, strengths, issues, suggestions, rewrite }
}
