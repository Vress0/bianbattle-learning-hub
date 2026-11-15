import { metrics } from '../../supabase/functions/_shared/coachContract'
import type { CoachFeedback } from '../../supabase/functions/_shared/coachContract'
import TextList from './TextList'

export default function CoachResults({ feedback, mode }: { feedback: CoachFeedback; mode: 'demo' | 'ai' }) {
  return (
    <>
      <p className="coach-mode">{mode === 'demo' ? '固定範例 · 對照示例論點' : 'Gemini 回饋 · 教學參考'}</p>
      <div className="coach-scores">
        {Object.entries(metrics).map(([metric, label]) => {
          const score = feedback.scores[metric as keyof typeof metrics]
          return (
            <div key={metric}>
              <p>{label}</p>
              <strong>{score}<small> / 100</small></strong>
              <meter min={0} max={100} value={score} aria-label={label} />
            </div>
          )
        })}
      </div>
      <section className="coach-feedback"><h3>優點</h3><TextList items={feedback.strengths} /></section>
      <section className="coach-feedback"><h3>待改善的問題</h3><TextList items={feedback.issues} /></section>
      <section className="coach-feedback"><h3>具體修改建議</h3><TextList items={feedback.suggestions} /></section>
      <section className="coach-feedback coach-rewrite"><h3>改寫示範</h3><p>{feedback.rewrite}</p></section>
    </>
  )
}
