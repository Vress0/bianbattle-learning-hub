# AGENTS.md — BianBattle Learning Hub

> 本檔是 BianBattle Learning Hub 的 AI 開發契約。任何 AI 編碼工具在讀取、建立、修改本專案前，必須先閱讀本檔，並在每次修改時遵守。若實際程式與本檔不一致，先指出差異，避免未經確認的大規模重構。

## 1. 專案目的與定位

- **名稱**：BianBattle Learning Hub（辯論學習中心）。
- **用途**：透過結構化辯論教學與辯題資料庫，協助初學者學習立論、反駁、質詢及批判性思考。
- **作業目標**：證明 AI 能依照這份規範重複新增內容，且新內容會自動顯示於現有網站，不需每次重新設計頁面。
- **長期方向**：未來可作為 BianBattle 辯論平台中的「學習中心」模組；本次**獨立開發**，不得擅自修改原 BianBattle 專案。
- **使用者**：繁體中文使用者、辯論初學者、大學生。
- **原作業基礎功能**：首頁、教材、辯題及其搜尋和路由是獨立靜態網站，不依賴登入、資料庫、付費功能、模型呼叫或個資蒐集。
- **2.0 可擴充功能**：`/practice` 提供免設定的範例模式與可選的 Gemini 教練。獨立的 Supabase Edge Function 和配額表只服務本專案，依第 15 節實作。

## 2. 技術與執行環境

- 使用 **React + TypeScript + Vite** 建立單頁應用（SPA）。
- 以 **pnpm** 管理套件與執行指令；只保留一套 lockfile（`pnpm-lock.yaml`）。
- 使用 React Router 處理路由；所有可重用頁面必須由共同元件與內容資料渲染，而非逐頁複製 JSX。
- 教材與辯題以專案內的 **JSON 檔案**管理。讀取、搜尋、分類與範例模式皆可在靜態前端運作。選用的 Gemini 模式依第 15 節配置後端。
- 使用原生 CSS（可採 CSS Modules）及 CSS 變數管理風格；除非確有必要，不額外導入大型 UI 框架。
- 以 **GitHub** 管理版本，公開作業版使用 **GitHub Pages**。React Router 的 `basename` 取自 Vite 的 `BASE_URL`，Pages 用 `scripts/prepare-pages.mjs` 產生入口。Vercel 的 SPA 重寫規則保留於 `vercel.json`。
- 在 `package.json` 提供 `dev`、`build`、`preview`、`lint`、`typecheck`、`validate:content`、`test`、`check` 指令；`check` 依序執行內容驗證、型別檢查、Lint、自動化測試及正式建置。

## 3. 網站功能與路由

| 路由 | 頁面 | 必要功能 |
|---|---|---|
| `/` | 首頁 | 專案介紹、教學／辯題入口、精選內容、2.0 練習入口 |
| `/learn` | 教學列表 | 列表卡片、關鍵字搜尋、分類篩選、空結果提示 |
| `/learn/:slug` | 教學詳細頁 | 標題、難度、標籤、段落與示例、返回列表 |
| `/topics` | 辯題列表 | 列表卡片、關鍵字搜尋、分類篩選、空結果提示 |
| `/topics/:slug` | 辯題詳細頁 | 辯題背景、正反方觀點、延伸思考問題、2.0 帶題練習入口 |
| `/practice` | 2.0 論點教練 | 選題、選立場、撰寫論點、範例回饋；可用 `?topic=<slug>` 預選，Gemini 為選用模式 |
| `/about` | 關於 | 專案用途、內容原則、未來發展方向 |
| `*` | 404 | 易懂的錯誤提示與返回首頁入口 |

共同版型包含頁首導覽、主要內容與頁尾。所有列表和詳細頁要能由資料自動生成。首頁可從資料集合中選取精選項目，不應寫死一份與內容資料無關的卡片。

## 4. 專案資料夾規範

```text
bianbattle-learning-hub/
├── AGENTS.md                 # 本規範：不得隨意刪除或弱化
├── README.md                 # 安裝、操作、內容新增、部署說明
├── package.json
├── pnpm-lock.yaml
├── index.html
├── vercel.json               # Vercel SPA 路由重寫
├── .github/workflows/pages.yml # GitHub Pages 正式建置與發布
├── .env.example              # 2.0 選用公開 Function 網址
├── tests/                    # 搜尋、路由及驗證 CLI 的自動化測試
├── scripts/
│   ├── validate-content.mjs  # JSON 結構、slug、重複資料檢查
│   └── prepare-pages.mjs     # Pages 固定入口、內容入口與 404
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/            # Layout、PageHeading、ContentCard、DetailLayout 等
│   ├── pages/                 # 每個路由的頁面元件
│   ├── content/
│   │   ├── articles/          # 每篇教學文章各一個 .json
│   │   └── topics/            # 每道辯題各一個 .json
│   ├── lib/
│   │   └── content.ts         # 統一讀取／排序／搜尋內容
│   ├── types/
│   │   └── content.ts         # Article / Topic 型別及列舉
│   └── styles/
│       ├── tokens.css         # 色票、字級、間距、圓角
│       ├── global.css         # 全站基礎樣式
│       └── practice.css       # 練習頁與首頁練習入口
├── public/                    # 吉娃娃 Logo 等靜態素材
└── supabase/                 # 2.0 選用 Function 與配額 migration
```

- React 元件及檔名採 `PascalCase.tsx`（例如 `ContentCard.tsx`）；工具與型別採 `camelCase.ts`。
- 內容 JSON 檔名與 `slug` 必須完全一致：英文小寫 + 數字 + 連字號（例如 `build-an-argument.json`）。
- 不可將所有內容寫入單一 React 元件，也不可對每篇文章建立新的詳細頁元件。
- `src/lib/content.ts` 應使用 Vite `import.meta.glob` 自動載入指定目錄的 JSON；新增檔案不必手動改索引陣列。
- 統一將新增項目納入搜尋、列表與可用路由；不要依賴手動修改首頁硬編碼清單。

## 5. 內容資料契約

### 5.1 教學文章 `src/content/articles/<slug>.json`

必要欄位：

```json
{
  "slug": "build-an-argument",
  "title": "如何建立有說服力的論點",
  "summary": "認識主張、理由與證據的基本組合。",
  "category": "argument",
  "difficulty": "beginner",
  "tags": ["立論", "論證"],
  "updatedAt": "2026-11-14",
  "sections": [
    {
      "heading": "論點的基本構成",
      "paragraphs": ["好的論點通常包含明確主張、推論理由及可驗證的支持材料。"],
      "bullets": ["主張：你要支持什麼？", "理由：為什麼成立？", "證據：哪些資訊支持？"]
    }
  ]
}
```

- `category` 限用 `basics`、`argument`、`rebuttal`、`cross-examination`；如需新分類，同步更新型別、顯示標籤及驗證腳本。
- `difficulty` 限用 `beginner`、`intermediate`、`advanced`。
- `sections` 至少一段；每段必須有非空 `heading` 與 `paragraphs`；`bullets` 可省略。
- `updatedAt` 為有效 ISO 日期 `YYYY-MM-DD`；更新文章內容時同步調整。

### 5.2 辯題 `src/content/topics/<slug>.json`

必要欄位：

```json
{
  "slug": "ai-in-education",
  "title": "學校應否鼓勵學生使用生成式 AI？",
  "summary": "從學習成效、學術誠信與公平性進行討論。",
  "category": "education",
  "tags": ["教育", "生成式 AI"],
  "updatedAt": "2026-11-14",
  "background": ["本辯題探討校園中生成式 AI 工具的使用界線。"],
  "proArguments": [
    { "claim": "適度使用可能提供個別化學習支援。", "reasoning": "學生可以針對自身盲點反覆練習與提問。" }
  ],
  "conArguments": [
    { "claim": "缺乏規範可能削弱獨立思考。", "reasoning": "若直接提交生成內容，可能減少自行推理的練習機會。" }
  ],
  "discussionQuestions": ["如何兼顧學習效率與學術誠信？"]
}
```

- `category` 限用 `education`、`technology`、`society`；新增分類時遵循前述同步更新程序。
- 正反方觀點各至少一項，每項須有 `claim` 與 `reasoning`。
- 可為觀點增加可選的 `sourceUrls: string[]` 作為資料來源；只可使用實際查證過的連結，不可捏造來源、研究數據或引言。
- 正反觀點是**示範論證**，不能寫成平台官方立場；描述須避免偏頗及人身攻擊。

### 5.3 內容驗證規則

`scripts/validate-content.mjs` 必須至少驗證：

1. 每個 JSON 能解析，且所有必要欄位的型別與非空條件正確。
2. 檔名與 `slug` 相同，且符合 `^[a-z0-9]+(?:-[a-z0-9]+)*$`。
3. 同一類內容沒有重複 `slug`；路由使用類別前綴避免跨類碰撞。
4. 分類、難度、日期、sections／觀點數量符合契約。
5. 教學與辯題專用欄位不得混用。
6. 發現錯誤時以非零退出碼終止，清楚列出出錯檔案與原因。

TypeScript 型別用於編譯期檢查；檔案驗證腳本用於保護 JSON 實際資料，兩者不得互相取代。

## 6. 介面與文字風格

- 介面語言一律**繁體中文（台灣用語）**，專有名詞可保留英文。
- 沿用 BianBattle 主站的深藍、冰青與淡金。首頁以月下雲海和立論示例呈現學習入口，內頁以低彩度深色表面、細分隔線及清楚文字標題呈現教材、辯題與立場。
- 使用 `tokens.css` 集中定義配色、間距、圓角及字級；**禁止**各頁任意寫出不同主色與卡片樣式。
- 使用統一的文章卡片、辯題卡片、分類標籤、按鈕與頁面容器；響應式設計至少涵蓋手機（約 375px）、平板和桌面（約 1440px）。
- 必須提供可讀的對比度、語意化 HTML、可辨識的鍵盤焦點、表單標籤與圖片替代文字；不要只用顏色傳達狀態。
- 避免使用不必要的人像、未授權圖片或不明來源素材；優先使用 CSS 裝飾與清楚的排版。
- 文案務求易懂、具體、適合初學者。涉及事實、研究、統計、法律或近期事件時，必須查證；無法查證時改以明確標示的假設案例，不可杜撰引用。

## 7. AI 新增教學文章的固定流程

當收到「新增一篇教學文章」時：

1. 閱讀本檔、`src/types/content.ts`、`src/lib/content.ts`，確認目前 schema。
2. 檢查現有文章，避免同名或重複 `slug`，沿用既有分類與寫作語氣。
3. 只新增 `src/content/articles/<slug>.json`；除非有明確原因，不改路由、詳細頁及 UI 元件。
4. 內容要有標題、摘要、分段、具體例子（如適用）及適合初學者的說明。
5. 執行 `pnpm check`；確認列表、搜尋及詳細頁可以讀取新資料。
6. 回報新增檔案、預期網址 `/learn/<slug>`、測試結果及任何尚未驗證之處。

## 8. AI 新增辯題的固定流程

當收到「新增一道辯題」時：

1. 閱讀本檔與現有辯題，選擇合適分類及唯一 `slug`。
2. 只新增 `src/content/topics/<slug>.json`，至少各有一個合理的正反方示範論點及一個討論問題。
3. 對有爭議的議題保持中立，兩邊論點皆須清楚且公平呈現，不可將推測當作已證實事實。
4. 執行 `pnpm check` 並檢查列表、篩選、搜尋及 `/topics/<slug>`。
5. 回報新增項目與驗證結果。

## 9. 修改既有功能的原則

- **先閱讀再修改**：先確認相關檔案及現有實作；以最小改動滿足需求。
- **尊重既有結構**：不要在沒有需求時全面替換技術、重寫路由或改變資料格式。
- **統一入口**：文章與辯題的資料取得／搜尋／排序放在 `src/lib/content.ts`；UI 元件只負責呈現。
- **避免重複**：能共用的版型或元件就抽離，不要各頁複製。
- **不做破壞性操作**：不得擅自刪除使用者資料、覆寫其他專案、執行 `git push --force`、移除既有功能或更換重要依賴。
- **新增依賴有理由**：需要套件時說明用途、最小替代方案及影響；不得引入不必要的依賴。
- **Git 與部署權限**：可在本地修改、測試；未經使用者明確同意，不得建立公開儲存庫、上傳到 GitHub、發佈網站或修改正式服務。
- **敏感資訊**：不將 token、密鑰、帳號或私密資料放入原始碼及提交紀錄；不新增本次不需要的外部服務。

## 10. 必備內容與驗收標準（MVP）

- 至少 **3 篇**不同分類的辯論教學文章，以及 **3 道**有正反觀點的辯題。
- 所有必要路由可正常開啟，包含從網址列直接進入文章／辯題詳細頁。
- 兩種列表都有可用的搜尋、分類篩選及空結果提示。
- 使用者能在手機與桌面操作導覽、閱讀文章與辯題。
- 將資料檔案新增到對應目錄後，不必修改 JSX 路由或手動索引，即能出現在列表和詳細頁。
- `pnpm check` 必須全部通過；若有執行環境限制，誠實說明未完成的驗證，不可宣稱通過。
- `README.md` 必須記載專案目標、架構、安裝命令、執行命令、如何新增文章與辯題、驗證方式、Vercel 部署流程。
- Vercel SPA 路由應透過 `vercel.json` 將未知靜態路徑回寫到 `/index.html`，避免刷新詳細頁時 404。
- **可重複使用的驗證展示**：完成網站後，額外要求 AI *只新增一篇*未存在的文章；確認可以依本檔規則新增並自動出現於網站。這是本作業的主要展示重點。

## 11. 每次交付時的回報格式

回覆使用者時，依序說明：

1. **完成項目**：這次做了哪些功能／新增哪些文章。
2. **變更檔案**：列出重要檔案與用途。
3. **測試結果**：逐項列出 `pnpm validate:content`、`pnpm typecheck`、`pnpm lint`、`pnpm test`、`pnpm build` 的結果；沒執行就寫「未執行」。
4. **查看方式**：本地啟動指令，以及路由或連結（僅在確實存在時提供）。
5. **待辦與注意事項**：未完成部分與下一個可執行步驟。

## 12. 未來整合進 BianBattle 的設計原則

- 學習中心保持**資料與畫面分離**；文章、辯題 schema 以及頁面元件可抽離。
- 只將本專案視作**未來可重用的模組**；不可假設已和 BianBattle 主站共用登入、資料庫、AI 評分或 AI 練習。
- 未來若需接上辯論練習題庫，先由人工確認資料契約、路由命名、權限與相容性，再進行整合。
- 先保證本次作業網站可獨立運行，才討論額外整合需求。


## 13. 新增功能頁面與共用元件

1. 確認需求屬於新功能。單篇教學與辯題依第 7、8 節新增 JSON。
2. 在 `src/pages/` 建立 `PascalCase.tsx`，於 `src/App.tsx` 共用 `Layout` 的路由群組內註冊，保留既有路徑與 404。只有全站入口需要在 `Layout.tsx` 增加 `NavLink`。
3. 使用 `PageHeading` 提供單一主標題與摘要。教材卡片用 `ContentCard`，詳情沿用 `DetailLayout`，清單使用 `TextList`。首頁精選區的卡片用三級標題，列表頁用二級標題。
4. 元件 Props 使用明確的 TypeScript 型別或介面。單一用途事件以 `on` 開頭，內部處理函式用 `handle` 或具體動詞。資料查找與篩選留在 `src/lib/content.ts`。
5. 以 `tokens.css` 管理色階、字級與字重、間距、圓角、陰影、焦點與動效。使用繁體中文系統無襯線字型，目錄頁重用 ContentCard 並使用分隔線呈現。沿用 `global.css` 的 `.container`、`.panel`、`.button`。正反方使用明確文字標題，窄螢幕改為依序閱讀的單欄。
6. 表單使用可辨識的標籤，動態結果數量用 `role="status"`。清除篩選後將焦點移回搜尋框。鍵盤可操作跳至主要內容、導覽、搜尋、篩選、卡片與返回連結。
7. 新增固定路由時，在 `scripts/prepare-pages.mjs` 加入對應的目錄名。新增或擴充 `tests/*.test.mjs` 內的路由測試，從該網址直接渲染，驗證可辨識的標題、主要操作，以及適用的空資料或無效參數。只新增內容時，沿用動態入口。
8. 檢查 375、768、1440 px 的版面、鍵盤焦點、空結果及深層路由刷新。版面於 42rem 以下採單欄，精選區於 56rem 以下採雙欄。尊重 `prefers-reduced-motion`，並執行 `pnpm check`。

## 14. AI 接手與測試

1. 讀本檔、README、相關實作與測試，檢查 `git status --short` 和 remote。若有使用者更動，先辨認差異再編輯；交付只納入本次範圍。
2. 盤點可原樣保留、需修正與缺少的功能。新增資料時確認分類、slug、日期與寫作格式。新功能頁面依第 13 節處理。
3. 自動化測試放在 `tests/*.test.mjs`，使用 Node.js 內建測試執行器。搜尋、動態路由與 404 測試使用現有 Vite 和 React Router。驗證器錯誤測試只在暫存副本寫入無效 JSON，並清除測試資料。
4. 行為有變動時驗證正常、空結果與失敗路徑。正式公開環境須實際開啟首頁和詳細頁，確認重新整理後渲染正確。
5. 提交前檢查變更、機密和忽略清單。含姓名、學號的繳交稿只存本機被 Git 忽略的 `submission.local.md`。README 僅放核實過的公開連結。
6. 若使用 GitHub Pages，保留 `BrowserRouter` 的 `BASE_URL` 與 `scripts/prepare-pages.mjs`。新增功能路由時，更新腳本中的固定入口；教材與辯題入口由 JSON 檔名產生。


## 15. 2.0 AI 論點教練

- `/practice` 從現有 JSON 選題，並接受 `?topic=<slug>` 連結。保留原作業內容與驗證規則。更新 GitHub Pages 固定入口。
- 預設範例模式在瀏覽器本地運作，固定回饋對應所選辯題與立場的第一則示例主張。畫面須標明回饋的對象。Gemini 模式需要公開的 `VITE_COACH_ENDPOINT`，由使用者切換並送出。若失敗，顯示錯誤並保留草稿。
- `supabase/functions/_shared/coachContract.ts` 定義輸入與回覆的執行期契約。三項分數為 0–100 整數，另含優點、問題、建議及改寫示範。客戶端與 Edge Function 都應驗證。
- 於 Edge Function 驗證來源、輸入型別、大小及長度，使用獨立資料庫的原子配額限制模型請求，並設定請求逾時。配額表只存計數和時間窗。應用程式不儲存或記錄使用者論點。
- Gemini 密鑰與服務角色金鑰僅供伺服器使用。前端只可配置 HTTPS Function 網址，或本機開發用的 loopback HTTP 網址。禁止連接 BianBattle 主站服務。
- 模型評分只供學習參考。提示詞要求使用繁體中文，不得補造來源、統計或事證，未驗證資訊不得寫成既定事實。前端以文字呈現模型輸出。
- 測試涵蓋正常輸入、空白和超長輸入、服務錯誤、配額、回覆契約與路由。沒有實際發出模型請求時，交付應明確說明。
