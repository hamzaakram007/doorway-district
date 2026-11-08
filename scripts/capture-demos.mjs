import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const OUT = '/cursor/stores/bc-01a1bc2f-032c-7962-a67c-b3e20663bf3c/media/doorway-district'
const URL = 'http://127.0.0.1:5173/'

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

await page.goto(URL, { waitUntil: 'networkidle' })
await page.waitForSelector('text=Doorway District')
await page.waitForTimeout(600)
await page.screenshot({ path: `${OUT}/demo-1.png`, fullPage: false })

await page.getByRole('button', { name: 'Decorate my house' }).click()
await page.waitForSelector('text=Furniture')
await page.waitForTimeout(500)
await page.screenshot({ path: `${OUT}/demo-2.png`, fullPage: false })

await browser.close()
console.log('Wrote', `${OUT}/demo-1.png`, `${OUT}/demo-2.png`)
