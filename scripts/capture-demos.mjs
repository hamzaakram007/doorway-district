import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const OUT = '/cursor/stores/bc-01a1bc2f-032c-7962-a67c-b3e20663bf3c/media/doorway-district'
const URL = 'http://127.0.0.1:5173/'

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

await page.goto(URL, { waitUntil: 'networkidle' })
await page.waitForSelector('text=Doorway District')
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle' })
await page.waitForSelector('text=Parade Float Weekend')
await page.waitForTimeout(700)
await page.screenshot({ path: `${OUT}/v2-demo-1.png`, fullPage: false })

await page.getByRole('button', { name: 'Decorate my house' }).click()
await page.waitForSelector('text=Furniture')
await page.waitForTimeout(400)
await page.locator('.chip', { hasText: /^Parade$/ }).click()
await page.waitForTimeout(200)
const paradeItem = page.locator('.palette-item').filter({ hasText: 'Float bit' })
await paradeItem.click()
const stage = page.locator('.room-stage')
const box = await stage.boundingBox()
if (box) {
  await page.mouse.click(box.x + box.width * 0.45, box.y + box.height * 0.55)
}
await page.waitForTimeout(500)
await page.screenshot({ path: `${OUT}/v2-demo-2.png`, fullPage: false })

await browser.close()
console.log('Wrote', `${OUT}/v2-demo-1.png`, `${OUT}/v2-demo-2.png`)
