import { copyFile, mkdir, readdir } from 'node:fs/promises'
import { join } from 'node:path'

const routes = ['learn', 'topics', 'about']
for (const [directory, route] of [['articles', 'learn'], ['topics', 'topics']]) {
  for (const filename of await readdir(join('src/content', directory))) {
    if (filename.endsWith('.json')) routes.push(join(route, filename.slice(0, -5)))
  }
}

// Pages serves directory indexes but does not rewrite SPA deep links.
for (const route of routes) {
  const directory = join('dist', route)
  await mkdir(directory, { recursive: true })
  await copyFile('dist/index.html', join(directory, 'index.html'))
}
await copyFile('dist/index.html', 'dist/404.html')
