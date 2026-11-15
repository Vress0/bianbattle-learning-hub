import { useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'

export default function Layout() {
  const { pathname } = useLocation()
  const main = useRef<HTMLElement>(null)
  const previousPath = useRef(pathname)

  useEffect(() => {
    if (previousPath.current !== pathname) {
      previousPath.current = pathname
      window.scrollTo(0, 0)
      main.current?.focus({ preventScroll: true })
    }
  }, [pathname])

  return (
    <>
      <a className="skip-link" href="#main">跳至主要內容</a>
      <header className="site-header">
        <div className="container header-inner">
          <Link className="brand" to="/">
            <img
              className="brand-mark"
              src={`${import.meta.env.BASE_URL}bianbattle-logo.png`}
              width={44}
              height={44}
              alt=""
            />
            <span>BianBattle <small>Learning Hub</small></span>
          </Link>
          <nav aria-label="主要導覽">
            <NavLink to="/" end>首頁</NavLink>
            <NavLink to="/learn">辯論教學</NavLink>
            <NavLink to="/topics">辯題資料庫</NavLink>
            <NavLink to="/practice">AI 練習</NavLink>
            <NavLink to="/about">關於</NavLink>
          </nav>
        </div>
      </header>
      <main id="main" ref={main} tabIndex={-1} className="container site-main"><Outlet /></main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <div><strong>BianBattle Learning Hub</strong><p>TAICA 生成式 AI 課程 · 第九週作業</p></div>
          <nav aria-label="頁尾導覽">
            <Link to="/learn">辯論教學</Link>
            <Link to="/topics">辯題資料庫</Link>
            <Link to="/about">關於</Link>
          </nav>
        </div>
      </footer>
    </>
  )
}
