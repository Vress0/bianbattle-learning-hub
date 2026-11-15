import PageHeading from '../components/PageHeading'

export default function About() {
  return (
    <div className="detail">
      <PageHeading title="關於學習中心" summary="BianBattle Learning Hub 是為辯論初學者設計的繁體中文學習網站。" />
      <section className="panel prose">
        <h2>專案用途</h2>
        <p>本網站是 TAICA「生成式 AI：文字與圖像生成的原理與實務」第九週作業。讀者可以從短篇教學練習拆解辯題、立論與反駁，再使用辯題資料庫比較不同立場。</p>
      </section>
      <section className="panel prose">
        <h2>內容原則</h2>
        <p>教學會標示假設案例。辯題呈現正反方的示範論證，並用延伸問題引導讀者比較前提、證據和影響。</p>
      </section>
      <section className="panel prose">
        <h2>未來方向</h2>
        <p>教材與介面分開維護，可持續加入不同技巧與難度的教材。未來若整合到 BianBattle，可先確認題庫格式與路由，再重用教材及頁面元件。</p>
      </section>
    </div>
  )
}
