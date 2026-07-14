import { cpSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const root = process.cwd()
const standaloneDir = join(root, '.next', 'standalone')
const staticDir = join(root, '.next', 'static')
const publicDir = join(root, 'public')

if (!existsSync(standaloneDir)) {
  console.error('Standalone build not found. Run `npm run build` first.')
  process.exit(1)
}

const standaloneNext = join(standaloneDir, '.next')
mkdirSync(join(standaloneNext, 'static'), { recursive: true })
cpSync(staticDir, join(standaloneNext, 'static'), { recursive: true })
cpSync(publicDir, join(standaloneDir, 'public'), { recursive: true })

console.log('Standalone bundle prepared (.next/static + public copied).')
