/**
 * Playwright smoke-test: kiểm tra dropdown Quality + Format trong Download popover.
 * Chạy: node src/scripts/test-download-ui.mjs
 */
import { chromium } from "playwright";

const BASE = "http://localhost:3000/edit";
const TIMEOUT = 15000;

async function run() {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
    args: ["--no-sandbox", "--disable-gpu"],
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(TIMEOUT);

  console.log("→ Opening", BASE);
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000); // wait for client-side hydration

  // 1. Click "Download" button in navbar
  const downloadBtn = page.locator("text=Download").first();
  await downloadBtn.waitFor({ state: "visible" });
  await downloadBtn.click();
  console.log("✓ Clicked Download button");

  await page.waitForTimeout(500);

  // 2. Check Format dropdown is visible (MP4 / JSON)
  const formatBtn = page.locator('[role="dialog"] button, [data-radix-popper-content-wrapper] button').filter({ hasText: /MP4|JSON/i }).first();
  const formatVisible = await formatBtn.isVisible().catch(() => false);
  console.log(formatVisible ? "✓ Format dropdown visible" : "✗ Format dropdown NOT visible");

  // 3. Click Format dropdown
  if (formatVisible) {
    await formatBtn.click();
    await page.waitForTimeout(300);
    const mp4Option = page.locator("text=MP4").first();
    const jsonOption = page.locator("text=JSON").first();
    console.log(await mp4Option.isVisible().catch(() => false) ? "✓ MP4 option present" : "✗ MP4 option MISSING");
    console.log(await jsonOption.isVisible().catch(() => false) ? "✓ JSON option present" : "✗ JSON option MISSING");
    // Close format dropdown
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
  }

  // 4. Check Quality dropdown (1080p / 1440p / 2160p)
  const qualityBtn = page.locator('[data-radix-popper-content-wrapper] button, [role="dialog"] button')
    .filter({ hasText: /1080p|1440p|2160p/i }).first();
  const qualityVisible = await qualityBtn.isVisible().catch(() => false);
  console.log(qualityVisible ? "✓ Quality dropdown visible" : "✗ Quality dropdown NOT visible");

  if (qualityVisible) {
    await qualityBtn.click();
    await page.waitForTimeout(300);

    const opts = ["1080p", "1440p", "2160p"];
    for (const label of opts) {
      const el = page.locator(`text=${label}`).first();
      const vis = await el.isVisible().catch(() => false);
      console.log(vis ? `  ✓ ${label} option present` : `  ✗ ${label} option MISSING`);
    }

    // Select 1440p
    const opt1440 = page.locator("text=1440p").first();
    if (await opt1440.isVisible().catch(() => false)) {
      await opt1440.click();
      await page.waitForTimeout(300);
      console.log("✓ Selected 1440p");
    }
    // Close
    await page.keyboard.press("Escape");
  }

  // 5. Screenshot for visual verification
  await page.screenshot({ path: "C:/Users/Admin/AppData/Local/Temp/test-download-popover.png", fullPage: false });
  console.log("✓ Screenshot saved to test-download-popover.png");

  // 6. Check Export button exists
  const exportBtn = page.locator('[data-radix-popper-content-wrapper] button, [role="dialog"] button')
    .filter({ hasText: /^Export$/i }).first();
  const exportVisible = await exportBtn.isVisible().catch(() => false);
  console.log(exportVisible ? "✓ Export button present" : "✗ Export button NOT visible");

  await browser.close();
  console.log("\n--- Test done ---");
}

run().catch((e) => { console.error("✗ Error:", e.message); process.exit(1); });
