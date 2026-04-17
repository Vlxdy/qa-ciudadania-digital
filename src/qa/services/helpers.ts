// helpers.ts
import { Page } from "playwright";

// ─────────────────────────────────────────────────────────────
// Click seguro
// ─────────────────────────────────────────────────────────────
export async function safeClick(
  page: Page,
  selector: string,
  timeout: number = 10000,
): Promise<void> {
  await page.waitForSelector(selector, { state: "visible", timeout });
  await page.click(selector);
}

// ─────────────────────────────────────────────────────────────
// Click opcional (no rompe si no existe)
// ─────────────────────────────────────────────────────────────
export async function optionalClick(
  page: Page,
  selector: string,
  timeout: number = 5000,
): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { state: "visible", timeout });
    await page.click(selector);
    return true;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// Esperar texto dentro de un elemento
// ─────────────────────────────────────────────────────────────
export async function waitForText(
  page: Page,
  selector: string,
  expectedText: string,
  timeout: number = 10000,
): Promise<void> {
  await page.waitForFunction(
    ({ selector, expectedText }) => {
      const el = document.querySelector(selector);
      return !!el && el.textContent?.includes(expectedText);
    },
    { selector, expectedText },
    { timeout },
  );
}
