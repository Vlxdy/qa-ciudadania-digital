import { log } from "console";
import { logger } from "../utils/logger.util";

export async function ingresarDatosLogin(page: any) {
  if (process.env.CEDULA_IDENTIDAD && process.env.CONTRASENA) {
    const cedula = String(process.env.CEDULA_IDENTIDAD);
    const contrasena = String(process.env.CONTRASENA);
    await page.locator("#login").fill(cedula);
    await page.locator("#password").fill(contrasena);
    await page.locator("#continuar").click();
    await page.getByRole("button", { name: /otro medio/i }).click();
    await page
      .locator('input[type="radio"][name="method"][value="TOTP"]')
      .check();
    await page.locator("#continuar-2fa").click();
    await page.locator('input[data-index="0"]').fill("1");
    await page.locator('input[data-index="1"]').fill("2");
    await page.locator('input[data-index="2"]').fill("3");
    await page.locator('input[data-index="3"]').fill("4");
    await page.locator('input[data-index="4"]').fill("5");
    await page.locator('input[data-index="5"]').fill("6");
    await page.locator("#continuar-2fa-validar").click();
  } else {
    logger.warn(
      "CEDULA_IDENTIDAD / CONTRASENA no configuradas — saltando autofill de login",
    );
  }
}
