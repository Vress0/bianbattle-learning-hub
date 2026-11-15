import { Link } from 'react-router'
import PageHeading from '../components/PageHeading'

export default function NotFound() {
  return (
    <div className="notice">
      <p className="eyebrow">錯誤 404</p>
      <PageHeading title="找不到這個頁面" summary="請確認網址是否正確，或返回首頁瀏覽其他教學與辯題。" />
      <Link className="button primary" to="/">返回首頁</Link>
    </div>
  )
}
