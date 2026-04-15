/**
 * Servicio de aprobación vía Playwright para el runner QA.
 * Copia independiente de src/aprobador/services/playwright-approval.service.ts
 * para poder modificarlo sin afectar el flujo principal del aprobador.
 */
import { logger } from '../../utils/logger.util';
import { qaEnv } from '../config/qa-env';

// ─── Tipos ────────────────────────────────────────────────────────────────────

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

// ─── Configuración ────────────────────────────────────────────────────────────

function readListenerConfig(): ApprovalListenerConfig {
  return {
    endpointPattern: process.env.APROBACION_RESULT_ENDPOINT ?? '/api/solicitudes',
    successPattern: process.env.APROBACION_SUCCESS_PATTERN ?? '"aprobado":true',
    timeoutMs: Number(process.env.APROBACION_WAIT_TIMEOUT_MS ?? 120000),
    headless: process.env.APROBACION_HEADLESS !== 'false',
  };
}

// ─── Helpers internos ─────────────────────────────────────────────────────────

function resolveLink(response: unknown): string | null {
  if (!response || typeof response !== 'object') {
    return null;
  }

  const root = response as {
    datos?: { link?: unknown };
    response?: { datos?: { link?: unknown } };
  };

  const direct = root.datos?.link;
  if (typeof direct === 'string' && direct.length > 0) {
    return direct;
  }

  const nested = root.response?.datos?.link;
  if (typeof nested === 'string' && nested.length > 0) {
    return nested;
  }

  return null;
}

async function createBrowser(headless: boolean): Promise<{
  browser: any;
  context: any;
  page: any;
}> {
  const playwrightModule = process.env.PLAYWRIGHT_PACKAGE ?? 'playwright';
  const { chromium } = await import(playwrightModule);
  const browser = await chromium.launch({ headless });
  const context = await browser.newContext();
  const page = await context.newPage();
  return { browser, context, page };
}

/**
 * Navega al portal de ciudadanía y realiza el login automático.
 * Lee credenciales desde las vars de entorno CEDULA_IDENTIDAD / CONTRASENA.
 */
async function ingresarDatosLogin(page: any): Promise<void> {
  if (process.env.CEDULA_IDENTIDAD && process.env.CONTRASENA) {
    await page.locator('#login').fill(process.env.CEDULA_IDENTIDAD);
    await page.locator('#password').fill(process.env.CONTRASENA);
    await page.locator('#continuar').click();
    await page.getByRole('button', { name: /otro medio/i }).click();
    await page.locator('input[type="radio"][name="method"][value="TOTP"]').check();
    await page.locator('#continuar-2fa').click();
    await page.locator('input[data-index="0"]').fill('1');
    await page.locator('input[data-index="1"]').fill('2');
    await page.locator('input[data-index="2"]').fill('3');
    await page.locator('input[data-index="3"]').fill('4');
    await page.locator('input[data-index="4"]').fill('5');
    await page.locator('input[data-index="5"]').fill('6');
    await page.locator('#continuar-2fa-validar').click();
  } else {
    logger.warn('CEDULA_IDENTIDAD / CONTRASENA no configuradas — saltando autofill de login');
  }
}

// ─── Servicio ─────────────────────────────────────────────────────────────────

export class QaPlaywrightApprovalService {
  static async process(
    responsePayload: unknown,
    accessToken: string,
  ): Promise<ApprovalListenerResult | null> {
    const link = resolveLink(responsePayload);

    if (!link) {
      logger.warn('No se encontró response.datos.link en la respuesta de aprobación.');
      return null;
    }

    const config = readListenerConfig();
    logger.info(`Navegando al link de aprobación: ${link}`);

    const { browser, context, page } = await createBrowser(config.headless);

    await context.setExtraHTTPHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    try {
      await page.goto(link, {
        waitUntil: 'domcontentloaded',
        timeout: config.timeoutMs,
      });

      // LOGIN
      await ingresarDatosLogin(page);

      // APROBACIÓN
      await page.getByRole('button', { name: /aprobar/i }).click();
      await page.getByRole('button', { name: /otro medio de verificación/i }).click();
      await page.locator('input[name="tipoVerificacion"][value="EMAIL"]').check();
      await page.getByRole('button', { name: /aceptar/i }).click();

      // OTP de aprobación
      await page.locator('input[data-index="0"]').fill('1');
      await page.locator('input[data-index="1"]').fill('2');
      await page.locator('input[data-index="2"]').fill('3');
      await page.locator('input[data-index="3"]').fill('4');
      await page.locator('input[data-index="4"]').fill('5');
      await page.locator('input[data-index="5"]').fill('6');

      // Preparar esperas ANTES del click final
      const responsePromise = page.waitForResponse(
        (res: any) => res.request().method() === 'POST' && res.url().includes('/aprobar'),
        { timeout: 30000 },
      );

      const urlPromise = page.waitForFunction(
        () => window.location.href.includes('estado='),
        { timeout: 30000 },
      );

      // Click final — confirmar aprobación
      await page.getByRole('button', { name: /continuar/i }).click();

      // Esperar el primer resultado (API o cambio de URL)
      let result: ApprovalListenerResult;

      try {
        const winner = await Promise.race([responsePromise, urlPromise]);

        if (winner && typeof (winner as any).url === 'function') {
          // Caso 1: respuesta de la API de aprobación
          const res = winner as any;
          let data: any;
          try {
            data = await res.json();
          } catch {
            data = { raw: await res.text() };
          }

          const estado = data?.estado;
          const approved = estado === true || estado === 'true';

          result = {
            approved,
            matchedEndpoint: res.url(),
            status: res.status(),
            method: res.request().method(),
            body: data,
          };

          logger.info('Resultado obtenido por API');
        } else {
          // Caso 2: URL cambió (redirect con ?estado=)
          const finalUrl = await page.evaluate(() => window.location.href);
          const urlObj = new URL(finalUrl);
          const estado = urlObj.searchParams.get('estado');
          const approved = estado === 'true';

          result = {
            approved,
            matchedEndpoint: finalUrl,
            status: approved ? 200 : 400,
            method: 'GET',
            body: Object.fromEntries(urlObj.searchParams.entries()),
          };

          logger.info('Resultado obtenido por URL');
        }

        logger.info(
          `Resultado de aprobación automática: ${result.approved ? 'APROBADO' : 'NO APROBADO'}`,
        );

        return result;
      } catch (error) {
        logger.error('Timeout esperando resultado de aprobación');
        throw error;
      }
    } catch (error) {
      logger.error('Error en proceso de aprobación automática:');
      throw error;
    } finally {
      await browser.close();
    }
  }
}
