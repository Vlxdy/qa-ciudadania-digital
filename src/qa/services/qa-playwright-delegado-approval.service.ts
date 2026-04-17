/**
 * Servicio de aprobación de delegado vía Playwright para el runner QA.
 *
 * Flujo:
 *   1. Recibe la respuesta del POST /api/delegado/representante_legal
 *   2. Extrae el codigoSeguimiento de la respuesta
 *   3. Construye la URL de aprobación y navega con Playwright
 *   4. Ejecuta los pasos de aprobación (implementar en la sección marcada)
 *   5. Retorna el resultado de la aprobación
 *
 * Variables de entorno:
 *   DELEGADO_APPROVAL_URL_BASE   URL base del portal donde se aprueba el delegado
 *                                (ej: https://ciudadania.gob.bo/delegado/aprobar)
 *   DELEGADO_APPROVAL_HEADLESS   true | false (default: false — visible para depuración)
 *   DELEGADO_APPROVAL_TIMEOUT_MS Timeout en ms (default: 120000)
 */
import { logger } from "../../utils/logger.util";
import { maybeAutoLogin } from "../scenarios/proveedor/services/oauth-browser-flow";
import { optionalClick, safeClick, waitForText } from "./helpers";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type DelegadoApprovalConfig = {
  urlBase: string;
  headless: boolean;
  timeoutMs: number;
};

export type DelegadoApprovalResult = {
  approved: boolean;
  codigoSeguimiento: string;
  finalUrl: string;
  status: number;
  body: unknown;
};

// ─── Configuración ────────────────────────────────────────────────────────────

function readConfig(): DelegadoApprovalConfig {
  return {
    urlBase: process.env.DELEGADO_APPROVAL_URL_BASE ?? "",
    headless: process.env.DELEGADO_APPROVAL_HEADLESS === "true",
    timeoutMs: Number(process.env.DELEGADO_APPROVAL_TIMEOUT_MS ?? 120_000),
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resolveCodigoSeguimiento(responsePayload: unknown): string | null {
  if (!responsePayload || typeof responsePayload !== "object") return null;

  const root = responsePayload as Record<string, unknown>;

  // Intento 1: datos.codigoSeguimiento
  const datos = root["datos"];
  if (datos && typeof datos === "object") {
    const codigo = (datos as Record<string, unknown>)["codigoSeguimiento"];
    if (typeof codigo === "string" && codigo.length > 0) return codigo;
  }

  // Intento 2: codigoSeguimiento directo en raíz
  const directCodigo = root["codigoSeguimiento"];
  if (typeof directCodigo === "string" && directCodigo.length > 0)
    return directCodigo;

  return null;
}

async function createBrowser(
  headless: boolean,
): Promise<{ browser: any; page: any }> {
  const playwrightModule = process.env.PLAYWRIGHT_PACKAGE ?? "playwright";
  const { chromium } = await import(playwrightModule);
  const browser = await chromium.launch({ headless });
  const page = await browser.newPage();
  return { browser, page };
}

type Config = {
  approvalUrl: string;
  timeoutMs: number;
};

const config: Config = {
  approvalUrl: "TU_URL_AQUI",
  timeoutMs: 30000,
};

// ─── Servicio ─────────────────────────────────────────────────────────────────

export class QaPlaywrightDelegadoApprovalService {
  /**
   * Ejecuta el flujo de aprobación de delegado en el navegador.
   *
   * @param responsePayload  Respuesta del POST /api/delegado/representante_legal
   * @param accessToken      Token de acceso del ciudadano (del session store del proveedor)
   */
  static async process(
    responsePayload: unknown,
    accessToken: string,
  ): Promise<DelegadoApprovalResult | null> {
    const config = readConfig();

    const codigoSeguimiento = resolveCodigoSeguimiento(responsePayload);
    if (!codigoSeguimiento) {
      logger.warn(
        "No se encontró codigoSeguimiento en la respuesta del delegado.",
      );
      return null;
    }

    if (!config.urlBase) {
      logger.warn(
        "DELEGADO_APPROVAL_URL_BASE no configurado — saltando aprobación Playwright.",
      );
      return null;
    }

    const approvalUrl = `${config.urlBase}/${codigoSeguimiento}`;
    logger.info(`Navegando a URL de aprobación de delegado: ${approvalUrl}`);

    const { browser, page } = await createBrowser(config.headless);

    try {
      await page.goto(approvalUrl, {
        waitUntil: "domcontentloaded",
        timeout: config.timeoutMs,
      });
      try {
        // ─── LOGIN ──────────────────────────────────────────────────────────────
        await optionalClick(page, 'button:has-text("Ingresa con Ciudadanía")');

        await maybeAutoLogin(page);

        await safeClick(page, 'button:has-text("Solicitud de delegación del")');
        await safeClick(page, 'button:has-text("Aprobar")');
        await safeClick(page, 'button:has-text("APROBAR")');

        await waitForText(
          page,
          "#notistack-snackbar",
          "Proceso concluido satisfactoriamente",
          30000,
        );
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("❌ Error:", error.message);
        } else {
          console.error("❌ Error desconocido:", error);
        }
      } finally {
        await browser.close();
      }

      // ─── INSTRUCCIONES DE APROBACIÓN ────────────────────────────────────────
      // TODO: Agregar aquí los pasos Playwright para aprobar el delegado.
      //
      // Ejemplo de estructura:
      //   await page.getByRole('button', { name: /aprobar/i }).click();
      //   await page.locator('...').fill('...');
      //   await page.getByRole('button', { name: /confirmar/i }).click();
      //
      // ────────────────────────────────────────────────────────────────────────

      // ─── CAPTURA DEL RESULTADO ──────────────────────────────────────────────
      // TODO: Ajustar la lógica de captura según la respuesta real del portal.
      //
      // Opción A — esperar cambio en la URL (redirect con ?estado=...):
      //   await page.waitForURL((url) => url.toString().includes('estado='), { timeout: config.timeoutMs });
      //   const finalUrl = page.url();
      //   const params = new URL(finalUrl).searchParams;
      //   const approved = params.get('estado') === 'aprobado';
      //
      // Opción B — esperar respuesta de la API interna del portal:
      //   const res = await page.waitForResponse(
      //     (r) => r.url().includes('/delegado/aprobar') && r.request().method() === 'POST',
      //     { timeout: config.timeoutMs },
      //   );
      //   const data = await res.json();
      //   const approved = data?.aprobado === true;
      //
      // ────────────────────────────────────────────────────────────────────────

      // Placeholder — reemplazar cuando se implementen los pasos anteriores
      const finalUrl = page.url();
      const approved = false; // TODO: reemplazar con la lógica real

      const result: DelegadoApprovalResult = {
        approved,
        codigoSeguimiento,
        finalUrl,
        status: approved ? 200 : 400,
        body: null,
      };

      logger.info(
        `Resultado aprobación delegado: ${result.approved ? "APROBADO" : "PENDIENTE/NO APROBADO"}`,
      );

      return result;
    } catch (error) {
      logger.error("Error en proceso de aprobación de delegado:");
      throw error;
    } finally {
      await browser.close();
    }
  }
}
