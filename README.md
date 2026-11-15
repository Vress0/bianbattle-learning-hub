# BianBattle Learning Hub 2.0｜AI 辯論學習中心

TAICA「生成式 AI：文字與圖像生成的原理與實務」第九週作業。網站讓辯論初學者練習讀題、立論與反駁，並比較辯題的正反方觀點。專案也展示 AI 如何遵循 [AGENTS.md](AGENTS.md) 持續擴充教材。

網站採用 React、TypeScript、Vite 和 React Router，使用 pnpm 管理套件。兩種列表支援搜尋、分類與清除篩選，詳細頁由本地 JSON 資料產生。

- [GitHub 儲存庫](https://github.com/Vress0/bianbattle-learning-hub)
- [公開網站](https://vress0.github.io/bianbattle-learning-hub/)

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
| `/practice` | 選題及立場、草稿、範例回饋及選用 Gemini 分析 |
| `/about` | 專案用途、內容原則與未來方向 |
| 其他路徑或未知 slug | 404 頁面 |

## 練習 Demo

使用 `pnpm dev` 後開啟 `/practice`，或從辯題頁點「使用此辯題開始練習」。選擇辯題和正反立場，點「帶入示例」或寫一段論點，再送出。範例模式評分與評語對應畫面所示的固定範例，不分析使用者草稿，也不上傳輸入。可以清除後重練，或改選辯題與立場。

設定選用的 Gemini 服務後，使用者可切換「Gemini 模式」。送出時會把辯題、立場和草稿傳至本專案的 Supabase Function 和 Gemini。三項分數與改寫僅供教學參考，沒有查證來源或事實的功能。應用程式不儲存草稿，第三方服務的資料處理依供應商設定。

## 架構

- `src/components/` 與 `src/pages/` 提供共用導覽、卡片、詳細頁版型與各路由畫面。
- `src/content/articles/` 和 `src/content/topics/` 各以單一 JSON 儲存一項內容。
- `src/types/content.ts` 定義內容型別、分類和顯示標籤。
- `src/lib/content.ts` 使用 Vite `import.meta.glob` 載入兩個目錄，依更新日期由新到舊排序，同日依 slug 排序，並統一搜尋與單篇查詢。首頁各取排序後的前三筆。
- `scripts/validate-content.mjs` 檢查 JSON、檔名、slug、日期與必填內容。
- `src/pages/Practice.tsx` 管理練習表單與回饋狀態。`src/lib/coach.ts` 呼叫選用的 AI endpoint，並驗證回覆。
- `supabase/functions/argument-coach/` 先驗證 HTTP 請求與共享資料契約，保留一個配額，再以 JSON Schema 呼叫 Gemini。資料庫只存每分鐘和每日共用計數。
- `tests/coach.test.mjs` 使用模擬服務測試請求、配額、異常和 Gemini 回覆，不需金鑰。

## AI 如何依 AGENTS.md 持續開發

1. 先閱讀 [AGENTS.md](AGENTS.md) 第 5、7、8 節和現有 JSON。選用現有分類及同類內容中未使用的 slug。檔名須為 `<slug>.json`，slug 使用英文小寫、數字與連字號。
2. 教學只新增 `src/content/articles/<slug>.json`。可參照 [現有教學](src/content/articles/build-an-argument.json)，填寫 `slug`、`title`、`summary`、`category`、`difficulty`、`tags`、`updatedAt` 及 `sections`。至少寫一節，包含 `heading` 與 `paragraphs`，可加 `bullets`。
3. 辯題只新增 `src/content/topics/<slug>.json`。可參照 [現有辯題](src/content/topics/ai-in-education.json)，填寫 `slug`、`title`、`summary`、`category`、`tags`、`updatedAt`、`background`、`proArguments`、`conArguments` 及 `discussionQuestions`。每方至少有一組含 `claim` 和 `reasoning` 的示範觀點。
4. 執行 `pnpm check`。開啟 `/learn` 或 `/topics`，以新內容的標題或標籤搜尋，依分類篩選，再直接開啟與重新整理 `/learn/<slug>` 或 `/topics/<slug>`。

Vite 會在開發與正式建置時納入新增的 JSON。共用列表及動態路由會讀取同一份資料，新增內容時只需要新增 JSON。若要新增一種頁面功能，才需要在 `src/pages/` 實作元件，並在 `src/App.tsx` 註冊路由。

### 兩個可重現的擴充案例

| 內容 | 遵循的規則 | 可查驗的結果 |
| --- | --- | --- |
| 質詢怎麼問？用短問題釐清關鍵前提 | [教材 JSON](src/content/articles/ask-focused-questions.json) 使用 `cross-examination`、`beginner`，以假設案例示範短問句，並分三節書寫 | 教材列表選「質詢」並搜尋「追問」，打開詳細頁可找到「每次只問一件事」。[公開教材](https://vress0.github.io/bianbattle-learning-hub/learn/ask-focused-questions/) |
| 大學應否原則上提供講授課的課堂錄影？ | [辯題 JSON](src/content/topics/recorded-university-lectures.json) 使用 `education`，設有假設背景、正反方各一項主張與推理、兩個討論問題 | 辯題列表選「教育」並搜尋「課堂錄影」，詳細頁可見正反方與延伸思考。2.0 本機還可從詳細頁預選此題。[公開辯題](https://vress0.github.io/bianbattle-learning-hub/topics/recorded-university-lectures/) |

兩例的檔名和 slug 一致，共用 `Catalog`、`ContentCard` 及動態路由。可用這段提示重現流程：「先讀 AGENTS.md 第 5、7、8 節，參照現有 JSON，各新增一筆不重複的質詢教材和教育辯題。只新增兩個 JSON 檔，執行 pnpm check，驗證關鍵字、分類和詳細頁。」在暫存副本重現即可保留正式題庫。既有案例由 [tests/content.test.mjs](tests/content.test.mjs) 驗證搜尋、分類和路由，欄位錯誤由驗證器測試涵蓋。

本機重現紀錄（2026-11-15）使用 2.0 的暫存副本。先移出兩個案例 JSON，確認兩類各 3 筆，無法搜尋案例且對應詳細網址顯示 404。只放回兩個 JSON 後，內容驗證改為各 4 筆，既有頁面渲染、搜尋和分類讀到兩例，`/practice` 也能從查詢參數預選新增辯題。以 GitHub Pages 的基底路徑建置後，腳本為兩個案例和練習頁產生獨立入口。正式資料無需變更。公開作業版另以瀏覽器實測兩例的搜尋、分類、詳細頁直達與刷新。

### 新增功能頁面的實例

2.0 的練習頁依 [AGENTS.md 第 13 節](AGENTS.md#13-新增功能頁面與共用元件) 建立。它把表單放在 `src/pages/Practice.tsx`，使用 `PageHeading` 及共用 CSS，把 `practice` 路由放進 `App.tsx` 的 `Layout` 下，並在 `scripts/prepare-pages.mjs` 新增固定入口。路由測試可直接渲染 `/practice?topic=recorded-university-lectures`，驗證預選辯題、可用的範例模式和無效 slug 的處理。日後新增功能頁時可沿用這個檔案分工與驗證方式。

## 檢查

`pnpm check` 依序執行以下命令，任一步失敗會停止。

| 命令 | 驗證項目 |
| --- | --- |
| `pnpm validate:content` | 驗證實際 JSON 內容 |
| `pnpm typecheck` | 檢查 TypeScript 型別 |
| `pnpm lint` | 執行 ESLint |
| `pnpm test` | 驗證搜尋、分類、路由及內容驗證器的錯誤處理 |
| `pnpm build` | 產生 `dist/` 正式版 |

## 設定選用的 Gemini 模式

前端環境變數只接受此專案的公開 Function 網址。

| 變數 | 位置 | 用途 |
| --- | --- | --- |
| `VITE_COACH_ENDPOINT` | 專案根目錄的 `.env.local` 或建置環境 | 完整 Function URL。留空時只有範例模式可用 |
| `GEMINI_API_KEY` | Supabase Function secrets | Gemini 伺服器端密鑰 |
| `GEMINI_MODEL` | Supabase Function secrets | 目前可用且支援 `generateContent` 結構化輸出的 Gemini 型號 |
| `COACH_ALLOWED_ORIGINS` | Supabase Function secrets | 逗號分隔的完整來源，如 `http://localhost:5173`，不含路徑或結尾斜線 |
| `SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY` | Supabase 自動注入的 Function 環境 | 呼叫原子配額 RPC。服務角色金鑰不得放在任何 `VITE_*` 變數 |

### 本機後端

1. 使用已安裝的 Supabase CLI 和 Docker，在本專案執行 `supabase start`。需要套用 migration 時使用 `supabase migration up --local`。
2. 將真實運行所需的 Gemini 密鑰、模型和本機來源填入 Git 忽略的 `supabase/functions/.env.local`。執行 `supabase functions serve argument-coach --env-file supabase/functions/.env.local`。
3. 複製 `.env.example` 成 `.env.local`，將 `VITE_COACH_ENDPOINT` 設為 `http://127.0.0.1:54321/functions/v1/argument-coach`。重新啟動 `pnpm dev` 後切換 Gemini 模式，以測試論點驗證完整流程。

### 獨立雲端專案

取得授權後，先確認目標是為本學習中心建立的獨立 Supabase 專案。以對應的 project ref 連結，檢查 migrations，再使用 `supabase db push` 套用配額 migration。透過 Dashboard 設定 Function secrets，使用 `supabase functions deploy argument-coach --project-ref <專案 ref>` 部署，再把 HTTPS Function URL 配置至前端建置環境重建。若沿用 GitHub Pages，工作流程會讀取同名的 repository variable。

Function 供匿名作品集使用，關閉 JWT gateway 驗證。CORS 限制瀏覽器來源，並非身分驗證。伺服器以原子配額限制每個 UTC 分鐘 12 次、每日 100 次，達上限回傳 429。前端及 Edge Function 均驗證回傳結構，請求失敗或逾時會顯示錯誤並保留草稿。具體部署方式與可用模型請見 [Supabase Function secrets](https://supabase.com/docs/guides/functions/secrets) 和 [Gemini 結構化輸出](https://ai.google.dev/gemini-api/docs/structured-output)。

## Vercel 部署

1. 取得發布授權後，在 Vercel 匯入這個專案的 GitHub 儲存庫，專案根目錄選本專案所在位置。
2. 使用 Vite 預設框架與 Node.js 22.13 以上的執行環境。專案設定的建置指令為 `pnpm check`，輸出目錄為 `dist`。
3. 部署後分別直接開啟並重新整理 `/learn/build-an-argument` 與 `/topics/ai-in-education`。根目錄的 `vercel.json` 將深層連結重寫至 `/index.html`，由 React Router 配對頁面。可參照 [Vercel 的 Vite SPA 深層連結設定](https://vercel.com/docs/frameworks/frontend/vite#using-vite-to-make-spas)。

## GitHub Pages 部署

本專案的 GitHub Pages 工作流程在推送 `main` 時執行 `pnpm check`，再以儲存庫名稱作為網站基底路徑產生靜態檔案。在儲存庫的 **Settings → Pages → Source** 選擇 **GitHub Actions** 啟用。

`scripts/prepare-pages.mjs` 會從已驗證的內容目錄產生每個詳細頁的靜態入口，同時準備 `/practice` 等固定入口與共用的 404 頁。新增 JSON 會在下次部署時自動產生相應入口。


### 公開網站驗收清單

- [ ] GitHub 儲存庫與所提交版本的 `AGENTS.md` 可免登入開啟。確認 Pages 部署對應預期版本。
- [ ] 公開首頁載入樣式和素材。導覽可開啟教材、辯題與關於頁。
- [ ] 依上方兩例操作搜尋與分類，再從網址列直接開啟兩個詳細頁並刷新。測試無效路徑能顯示網站的 404。
- [ ] 若發布 2.0，確認 `/practice/` 及帶 `?topic=recorded-university-lectures` 的連結都能直接開啟及刷新，範例模式可選立場、查看回饋及清除重練。
- [ ] 若啟用 Gemini，另驗證實際回覆、逾時、配額、錯誤提示及資料格式。公開前端只配置 Function 網址。

本機可用 `pnpm build --base /bianbattle-learning-hub/` 加 `node scripts/prepare-pages.mjs` 檢查 Pages 產物，包括 `dist/practice/index.html`、教材與辯題的入口、`dist/404.html` 及子路徑資源。這項檢查驗證建置結果。公開版的實際瀏覽仍要在授權發布後重做。
