import { rm } from 'node:fs/promises'
import { resolve } from 'node:path'

const cnamePath = resolve(process.cwd(), 'dist', 'CNAME')

await rm(cnamePath, { force: true })
