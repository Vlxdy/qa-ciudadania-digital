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


function resolveHeadless(specificVarName: string, defaultValue: boolean): boolean {
  const globalHeadless = process.env.BROWSER_HEADLESS;
  if (globalHeadless === "true") return true;
  if (globalHeadless === "false") return false;

  const specific = process.env[specificVarName];
  if (specific === "true") return true;
  if (specific === "false") return false;

  return defaultValue;
}

function readConfig(): DelegadoApprovalConfig {
  return {
    urlBase: process.env.DELEGADO_APPROVAL_URL_BASE ?? "",
    headless: resolveHeadless("DELEGADO_APPROVAL_HEADLESS", false),
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

      let approved = false;
      try {
        // ─── LOGIN ──────────────────────────────────────────────────────────────
        await optionalClick(page, 'button:has-text("Ingresa con Ciudadanía")');

        await maybeAutoLogin(page);

        const vigentesSelector = 'div[role="button"]:has-text("Vigentes")';

        // Esperar a que exista el menú
        await page.waitForSelector(vigentesSelector, { timeout: 10000 });

        const vigentes = page.locator(vigentesSelector).first();

        // Verificar si ya está seleccionado
        const className = await vigentes.getAttribute("class");

        if (!className?.includes("Mui-selected")) {
          logger.info("➡️ Cambiando a bandeja Vigentes");
          await vigentes.click();
        } else {
          logger.info("✅ Ya estás en Vigentes");
        }

        const items = page.locator("div.MuiListItemButton-root", {
          hasText: "Solicitud de delegación",
        });

        await items.first().waitFor({ state: "visible", timeout: 10000 });

        const count = await items.count();

        if (count === 0) {
          throw new Error("❌ No se encontraron solicitudes de delegación");
        }

        await items.first().click();

        // ─── ESPERAR DETALLE ───────────────────────────────────────
        await page.waitForSelector('button:has-text("Aprobar")', {
          state: "visible",
          timeout: 10000,
        });

        // ─── CLICK "Aprobar" (detalle) ─────────────────────────────
        const aprobarBtn = page.locator('button:has-text("Aprobar")').last();

        await aprobarBtn.waitFor({
          state: "visible",
          timeout: 10000,
        });

        await aprobarBtn.click({ force: true });

        // ─── BOTÓN FINAL "APROBAR" ─────────────────────────────
        const aprobarFinalBtn = page
          .locator('button:has-text("APROBAR")')
          .last();

        await aprobarFinalBtn.waitFor({
          state: "visible",
          timeout: 10000,
        });

        // esperar que esté habilitado
        await page.waitForFunction(
          (el: any) => {
            return el && !el.hasAttribute("disabled");
          },
          await aprobarFinalBtn.elementHandle(),
        );

        // pequeño delay para evitar problemas de animación
        await page.waitForTimeout(300);

        // click real
        await aprobarFinalBtn.click({ delay: 100 });

        // ─── VALIDAR SNACKBAR ─────────────────────────────────
        const snackbar = page.locator("#notistack-snackbar");

        // esperar a que aparezca (no que ya exista)
        await snackbar.waitFor({
          state: "visible",
          timeout: 60000,
        });

        const text = await snackbar.textContent();

        approved = !!text?.includes("Proceso concluido");

        if (!approved) {
          throw new Error("❌ Snackbar incorrecto o no esperado");
        }

        logger.info("Snackbar detectado:", text);
        logger.info("Proceso aprobado correctamente");
      } catch (error: unknown) {
        if (error instanceof Error) {
          logger.error("❌ Error:", error.message);
        } else {
          logger.error("❌ Error desconocido:", error);
        }
      } finally {
        await browser.close();
      }

      const finalUrl = page.url();

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
