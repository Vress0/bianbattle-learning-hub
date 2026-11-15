import { Link } from 'react-router'
import PageHeading from '../components/PageHeading'

export default function About() {
  return (
    <div className="detail about">
      <PageHeading title="關於學習中心" summary="給辯論初學者的繁體中文學習網站。從讀懂辯題開始，練習提出有理由的觀點。" />
      <section className="panel prose">
        <h2>從教學到練習</h2>
        <p>先用短篇教學練習讀題、立論、反駁與質詢，再選一道辯題，比較正反方如何支持各自的主張。</p>
        <p>想試著寫一段論點，可以使用論點教練。範例模式會顯示示範回饋，供你對照自己的草稿。啟用 Gemini 後，可送出草稿取得教學參考。</p>
        <Link className="button primary" to="/practice">開始論點練習</Link>
      </section>
      <section className="panel prose">
        <h2>內容原則</h2>
        <p>教材會標明假設案例。辯題並列正反方的示範論證，再用延伸問題引導讀者比較前提、證據和影響。</p>
      </section>
      <section className="panel prose">
        <h2>專案起源與擴充方式</h2>
        <p>本專案起源於 TAICA「生成式 AI：文字與圖像生成的原理與實務」第九週作業。<code>AGENTS.md</code> 定義頁面結構、內容格式與驗證方式。依規範新增一份教材或辯題 JSON，網站就能自動將它納入列表、搜尋與詳細頁。</p>
      </section>
    </div>
  )
}
