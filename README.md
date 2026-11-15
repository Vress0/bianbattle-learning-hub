# BianBattle Learning Hub｜AI 辯論學習中心

TAICA「生成式 AI：文字與圖像生成的原理與實務」第九週作業。網站讓辯論初學者練習讀題、立論與反駁，並比較辯題的正反方觀點。專案也展示 AI 如何遵循 [AGENTS.md](AGENTS.md) 持續擴充教材。

網站採用 React、TypeScript、Vite 和 React Router，使用 pnpm 管理套件。兩種列表支援搜尋、分類與清除篩選，詳細頁由本地 JSON 資料產生。

## 本機開發

使用 Node.js 22.13 以上與 pnpm 11.9.0。若 Node.js 提供 Corepack，可用 `corepack pnpm` 執行下列 pnpm 命令。

```sh
pnpm install --frozen-lockfile
pnpm dev
```

開啟 Vite 終端機顯示的網址，預設為 `http://localhost:5173`。正式版可先執行 `pnpm build`，再用 `pnpm preview` 預覽，預設為 `http://localhost:4173`。

| 路由 | 功能 |
| --- | --- |
| `/` | 專案介紹與精選內容 |
| `/learn` | 教學搜尋和分類 |
| `/learn/:slug` | 教學詳細頁 |
| `/topics` | 辯題搜尋和分類 |
| `/topics/:slug` | 辯題詳細頁 |
| `/about` | 專案用途、內容原則與未來方向 |
| 其他路徑或未知 slug | 404 頁面 |

## 架構

- `src/components/` 與 `src/pages/` 提供共用導覽、卡片、詳細頁版型與各路由畫面。
- `src/content/articles/` 和 `src/content/topics/` 各以單一 JSON 儲存一項內容。
- `src/types/content.ts` 定義內容型別、分類和顯示標籤。
- `src/lib/content.ts` 使用 Vite `import.meta.glob` 載入兩個目錄，依更新日期由新到舊排序，同日依 slug 排序，並統一搜尋與單篇查詢。首頁各取排序後的前三筆。
- `scripts/validate-content.mjs` 檢查 JSON、檔名、slug、日期與必填內容。

## 新增教學或辯題

1. 先閱讀 [AGENTS.md](AGENTS.md) 第 5、7、8 節和現有 JSON。選用現有分類及同類內容中未使用的 slug。檔名須為 `<slug>.json`，slug 使用英文小寫、數字與連字號。
2. 教學只新增 `src/content/articles/<slug>.json`。可參照 [現有教學](src/content/articles/build-an-argument.json)，填寫 `slug`、`title`、`summary`、`category`、`difficulty`、`tags`、`updatedAt` 及 `sections`。至少寫一節，包含 `heading` 與 `paragraphs`，可加 `bullets`。
3. 辯題只新增 `src/content/topics/<slug>.json`。可參照 [現有辯題](src/content/topics/ai-in-education.json)，填寫 `slug`、`title`、`summary`、`category`、`tags`、`updatedAt`、`background`、`proArguments`、`conArguments` 及 `discussionQuestions`。每方至少有一組含 `claim` 和 `reasoning` 的示範觀點。
4. 執行 `pnpm check`。開啟 `/learn` 或 `/topics`，以新內容的標題或標籤搜尋，依分類篩選，再直接開啟與重新整理 `/learn/<slug>` 或 `/topics/<slug>`。

Vite 會在開發與正式建置時納入新增的 JSON。共用列表及動態路由會讀取同一份資料，新增內容時只需要新增 JSON。若要新增一種頁面功能，才需要在 `src/pages/` 實作元件，並在 `src/App.tsx` 註冊路由。

本次擴充展示新增下列兩份 JSON。沿用原有分類與唯一 slug；教材使用假設案例，辯題提供雙方示範論證及討論問題。

| 內容 | JSON | 網站路徑 |
| --- | --- | --- |
| 質詢怎麼問？用短問題釐清關鍵前提 | [教材 JSON](src/content/articles/ask-focused-questions.json) | `/learn/ask-focused-questions` |
| 大學應否原則上提供講授課的課堂錄影？ | [辯題 JSON](src/content/topics/recorded-university-lectures.json) | `/topics/recorded-university-lectures` |

自動化測試會透過 Vite 載入實際 JSON，檢查兩項內容的列表、關鍵字、分類及動態詳細頁。新增功能頁面則依 [AGENTS.md 第 13 節](AGENTS.md#13-新增功能頁面與共用元件) 重用版型與樣式。

## 檢查

`pnpm check` 依序執行以下命令，任一步失敗會停止。

| 命令 | 驗證項目 |
| --- | --- |
| `pnpm validate:content` | 驗證實際 JSON 內容 |
| `pnpm typecheck` | 檢查 TypeScript 型別 |
| `pnpm lint` | 執行 ESLint |
| `pnpm test` | 驗證搜尋、分類、路由及內容驗證器的錯誤處理 |
| `pnpm build` | 產生 `dist/` 正式版 |

## Vercel 部署

1. 取得發布授權後，在 Vercel 匯入這個專案的 GitHub 儲存庫，專案根目錄選本專案所在位置。
2. 使用 Vite 預設框架與 Node.js 22.13 以上的執行環境。專案設定的建置指令為 `pnpm check`，輸出目錄為 `dist`。
3. 部署後分別直接開啟並重新整理 `/learn/build-an-argument` 與 `/topics/ai-in-education`。根目錄的 `vercel.json` 將深層連結重寫至 `/index.html`，由 React Router 配對頁面。可參照 [Vercel 的 Vite SPA 深層連結設定](https://vercel.com/docs/frameworks/frontend/vite#using-vite-to-make-spas)。

## GitHub Pages 部署

本專案的 GitHub Pages 工作流程在推送 `main` 時執行 `pnpm check`，再以儲存庫名稱作為網站基底路徑產生靜態檔案。在儲存庫的 **Settings → Pages → Source** 選擇 **GitHub Actions** 啟用。

`scripts/prepare-pages.mjs` 會從已驗證的內容目錄產生每個詳細頁的靜態入口，並準備共用的 404 頁。新增 JSON 會在下次部署時自動產生相應入口。
