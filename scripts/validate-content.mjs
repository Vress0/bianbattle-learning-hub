import { readFile, readdir } from 'node:fs/promises'

const categories = {
  articles: ['basics', 'argument', 'rebuttal', 'cross-examination'],
  topics: ['education', 'technology', 'society'],
}
const difficulties = ['beginner', 'intermediate', 'advanced']
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const isText = (value) => typeof value === 'string' && value.trim().length > 0
const isTextList = (value) => Array.isArray(value) && value.length > 0 && value.every(isText)

function isDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(value)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function isHttpUrl(value) {
  if (!isText(value)) return false
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}

function validate(data, kind, filename, seen) {
  if (!isObject(data)) return ['根節點必須是物件']

  const errors = []
  const requireField = (condition, message) => {
    if (!condition) errors.push(message)
  }

  requireField(typeof data.slug === 'string' && slugPattern.test(data.slug), 'slug 必須是小寫英文字母、數字及單一連字號組成')
  requireField(filename === `${data.slug}.json`, '檔名必須與 slug 一致')
  if (typeof data.slug === 'string') {
    requireField(!seen.has(data.slug), `slug 重複（${seen.get(data.slug)}）`)
    seen.set(data.slug, filename)
  }

  for (const field of ['title', 'summary']) {
    requireField(isText(data[field]), `${field} 必須是非空字串`)
  }
  requireField(isTextList(data.tags), 'tags 必須是非空字串陣列')
  requireField(categories[kind].includes(data.category), 'category 不在允許的分類中')
  requireField(isDate(data.updatedAt), 'updatedAt 必須是有效的 YYYY-MM-DD 日期')

  function validateItems(field, validateItem) {
    const items = data[field]
    if (!Array.isArray(items) || items.length === 0) {
      errors.push(`${field} 至少需要一個項目`)
      return
    }
    items.forEach((item, index) => {
      const path = `${field}[${index}]`
      if (!isObject(item)) errors.push(`${path} 必須是物件`)
      else validateItem(item, path)
    })
  }

  const foreignFields = kind === 'articles'
    ? ['background', 'proArguments', 'conArguments', 'discussionQuestions']
    : ['sections', 'difficulty']
  for (const field of foreignFields) {
    requireField(!Object.hasOwn(data, field), `${field} 不適用於此內容類型`)
  }

  if (kind === 'articles') {
    requireField(difficulties.includes(data.difficulty), 'difficulty 不在允許的難度中')
    validateItems('sections', (section, path) => {
      requireField(isText(section.heading), `${path}.heading 必須是非空字串`)
      requireField(isTextList(section.paragraphs), `${path}.paragraphs 必須是非空字串陣列`)
      if (section.bullets !== undefined) {
        requireField(Array.isArray(section.bullets) && section.bullets.every(isText), `${path}.bullets 必須是字串陣列，且每項不可空白`)
      }
    })
  } else {
    for (const field of ['background', 'discussionQuestions']) {
      requireField(isTextList(data[field]), `${field} 必須是非空字串陣列`)
    }
    for (const field of ['proArguments', 'conArguments']) {
      validateItems(field, (argument, path) => {
        for (const key of ['claim', 'reasoning']) {
          requireField(isText(argument[key]), `${path}.${key} 必須是非空字串`)
        }
        if (argument.sourceUrls !== undefined) {
          requireField(Array.isArray(argument.sourceUrls) && argument.sourceUrls.every(isHttpUrl), `${path}.sourceUrls 必須是 HTTP(S) 網址陣列`)
        }
      })
    }
  }
  return errors
}

const errors = []
const counts = {}
for (const kind of Object.keys(categories)) {
  const directory = new URL(`../src/content/${kind}/`, import.meta.url)
  const seen = new Map()
  try {
    const entries = await readdir(directory, { withFileTypes: true })
    const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    counts[kind] = files.length
    if (!files.length) errors.push(`src/content/${kind}：找不到 JSON 檔案`)
    for (const { name } of files) {
      const path = `src/content/${kind}/${name}`
      try {
        const data = JSON.parse(await readFile(new URL(encodeURIComponent(name), directory), 'utf8'))
        errors.push(...validate(data, kind, name, seen).map((message) => `${path}：${message}`))
      } catch (error) {
        errors.push(`${path}：${error.message}`)
      }
    }
  } catch (error) {
    errors.push(`src/content/${kind}：${error.message}`)
  }
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log(`內容驗證通過（${counts.articles} 篇教學、${counts.topics} 道辯題）`)
}
