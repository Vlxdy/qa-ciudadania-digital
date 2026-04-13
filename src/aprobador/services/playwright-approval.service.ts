import { logger } from "../../utils/logger.util";

export type ApprovalListenerConfig = {
  endpointPattern: string;
  successPattern: string;
  timeoutMs: number;
  headless: boolean;
};

export type ApprovalListenerResult = {
  approved: boolean;
  matchedEndpoint: string;
  status: number;
  method: string;
  body: unknown;
};

function readListenerConfig(): ApprovalListenerConfig {
  return {
    endpointPattern:
      process.env.APROBACION_RESULT_ENDPOINT ?? "/api/solicitudes",
    successPattern: process.env.APROBACION_SUCCESS_PATTERN ?? '"aprobado":true',
    timeoutMs: Number(process.env.APROBACION_WAIT_TIMEOUT_MS ?? 120000),
    headless: process.env.APROBACION_HEADLESS !== "false",
  };
}

function resolveLink(response: unknown): string | null {
  if (!response || typeof response !== "object") {
    return null;
  }

  const root = response as {
    datos?: { link?: unknown };
    response?: { datos?: { link?: unknown } };
  };

  const direct = root.datos?.link;
  if (typeof direct === "string" && direct.length > 0) {
    return direct;
  }

  const nested = root.response?.datos?.link;
  if (typeof nested === "string" && nested.length > 0) {
    return nested;
  }

  return null;
}

async function parseBody(res: any): Promise<unknown> {
  const contentType = (res.headers()["content-type"] || "").toLowerCase();

  if (contentType.includes("application/json")) {
    try {
      return await res.json();
    } catch {
      return { raw: await res.text() };
    }
  }

  return { raw: await res.text() };
}

function isApproved(body: unknown, successPattern: string): boolean {
  if (!body) {
    return false;
  }

  if (typeof body === "object") {
    const candidate = body as {
      aprobado?: unknown;
      finalizado?: unknown;
      estado?: unknown;
    };

    if (candidate.aprobado === true || candidate.finalizado === true) {
      return true;
    }

    if (typeof candidate.estado === "string") {
      return ["aprobado", "aprobada", "finalizado", "finalizada"].includes(
        candidate.estado.toLowerCase(),
      );
    }
  }

  const serialized = JSON.stringify(body).toLowerCase();
  return serialized.includes(successPattern.toLowerCase());
}

async function createBrowser(headless: boolean): Promise<{
  browser: any;
  context: any;
  page: any;
}> {
  const playwrightModule = process.env.PLAYWRIGHT_PACKAGE ?? "playwright";
  const { chromium } = await import(playwrightModule);
  const browser = await chromium.launch({ headless });
  const context = await browser.newContext();
  const page = await context.newPage();
  return { browser, context, page };
}

export class PlaywrightApprovalService {
  static async process(
    responsePayload: unknown,
    accessToken: string,
  ): Promise<ApprovalListenerResult | null> {
    const link = resolveLink(responsePayload);

    if (!link) {
      logger.warn(
        "No se encontró response.datos.link en la respuesta de aprobación.",
      );
      return null;
    }

    const config = readListenerConfig();
    logger.info(`Navegando al link de aprobación: ${link}`);

    const { browser, context, page } = await createBrowser(false);

    await context.setExtraHTTPHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    try {
      await page.goto(link, {
        waitUntil: "domcontentloaded",
        timeout: config.timeoutMs,
      });

      // LOGIN
      await page.locator("#login").fill("4160481");
      await page.locator("#password").fill("Agepic135");

      const loginBtn = page.locator("#continuar");
      await loginBtn.waitFor({ state: "visible" });
      await loginBtn.click();

      // CAMBIAR MÉTODO
      await page.getByRole("button", { name: /otro medio/i }).click();
      await page.locator('input[name="method"][value="TOTP"]').check();
      await page.locator("#continuar-2fa").click();

      // OTP 1
      await page.locator('input[data-index="0"]').fill("1");
      await page.locator('input[data-index="1"]').fill("2");
      await page.locator('input[data-index="2"]').fill("3");
      await page.locator('input[data-index="3"]').fill("4");
      await page.locator('input[data-index="4"]').fill("5");
      await page.locator('input[data-index="5"]').fill("6");
      await page.locator("#continuar-2fa-validar").click();

      // APROBACIÓN
      await page.getByRole("button", { name: /aprobar/i }).click();
      await page
        .getByRole("button", { name: /otro medio de verificación/i })
        .click();
      await page
        .locator('input[name="tipoVerificacion"][value="EMAIL"]')
        .check();
      await page.getByRole("button", { name: /aceptar/i }).click();

      // OTP 2
      await page.locator('input[data-index="0"]').fill("1");
      await page.locator('input[data-index="1"]').fill("2");
      await page.locator('input[data-index="2"]').fill("3");
      await page.locator('input[data-index="3"]').fill("4");
      await page.locator('input[data-index="4"]').fill("5");
      await page.locator('input[data-index="5"]').fill("6");

      // 🔥 PREPARAR ESPERAS (ANTES DEL CLICK)
      const responsePromise = page.waitForResponse(
        (res: any) =>
          res.request().method() === "POST" && res.url().includes("/aprobar"),
        { timeout: 30000 },
      );

      const urlPromise = page.waitForFunction(
        () => {
          return window.location.href.includes("estado=");
        },
        { timeout: 30000 },
      );

      // CLICK FINAL
      await page.getByRole("button", { name: /continuar/i }).click();

      // 🔥 ESPERAR EL PRIMER RESULTADO
      let result: ApprovalListenerResult;

      try {
        const winner = await Promise.race([responsePromise, urlPromise]);

        // 🥇 CASO 1: RESPUESTA API
        if (winner && typeof (winner as any).url === "function") {
          const response = winner as any;

          let data: any;
          try {
            data = await response.json();
          } catch {
            data = { raw: await response.text() };
          }

          const estado = data?.estado;
          const approved = estado === true || estado === "true";

          result = {
            approved,
            matchedEndpoint: response.url(),
            status: response.status(),
            method: response.request().method(),
            body: data,
          };

          logger.info("✔ Resultado obtenido por API");
        } else {
          // 🥈 CASO 2: URL CAMBIÓ
          const finalUrl = await page.evaluate(() => window.location.href);
          const urlObj = new URL(finalUrl);

          const estado = urlObj.searchParams.get("estado");
          const approved = estado === "true";

          result = {
            approved,
            matchedEndpoint: finalUrl,
            status: approved ? 200 : 400,
            method: "GET",
            body: Object.fromEntries(urlObj.searchParams.entries()),
          };

          logger.info("✔ Resultado obtenido por URL");
        }

        logger.info(
          `Resultado de aprobación automática: ${result.approved ? "APROBADO" : "NO APROBADO"}`,
        );

        return result;
      } catch (error) {
        logger.error("Timeout esperando resultado de aprobación");
        throw error;
      }
    } catch (error) {
      logger.error("Error en proceso de aprobación automática:");
      throw error;
    } finally {
      await browser.close();
    }
  }
}
