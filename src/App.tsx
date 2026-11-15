import { Route, Routes } from 'react-router'
import Layout from './components/Layout'
import About from './pages/About'
import ArticleDetail from './pages/ArticleDetail'
import Catalog from './pages/Catalog'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import TopicDetail from './pages/TopicDetail'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="learn" element={<Catalog key="learn" kind="learn" />} />
        <Route path="learn/:slug" element={<ArticleDetail />} />
        <Route path="topics" element={<Catalog key="topics" kind="topics" />} />
        <Route path="topics/:slug" element={<TopicDetail />} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
