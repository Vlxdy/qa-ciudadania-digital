import http from "http";
import { randomBytes } from "crypto";
import { URL } from "url";

import {
  getProveedorSessionStore,
  setLastAuthorizationCode,
} from "./session.store";
import {
  getMobileSessionStore,
  setMobileCodeVerifier,
} from "./mobile-session.store";
import { generateCodeVerifier, generateCodeChallenge } from "./pkce";
import { qaEnv } from "../../../config/qa-env";
import { logger } from "../../../../utils/logger.util";

function randomHex(size = 24): string {
  return randomBytes(size).toString("hex");
}

function debugLog(message: string): void {
  if (process.env.QA_PROVEEDOR_OAUTH_VERBOSE === "true") {
    console.log(`[qa][proveedor][oauth] ${message}`);
  }
}

function isLocalRedirect(redirectUri: string): boolean {
  const host = new URL(redirectUri).hostname;
  return host === "localhost" || host === "127.0.0.1";
}

function resolveHeadless(
  specificVarName: string,
  defaultValue: boolean,
): boolean {
  const globalHeadless = process.env.BROWSER_HEADLESS;
  if (globalHeadless === "true") return true;
  if (globalHeadless === "false") return false;

  const specific = process.env[specificVarName];
  if (specific === "true") return true;
  if (specific === "false") return false;

  return defaultValue;
}

async function waitForRedirectInBrowser(
  page: any,
  redirectUri: string,
  timeoutMs: number,
): Promise<Record<string, string>> {
  const target = new URL(redirectUri);
  const targetPrefix = `${target.origin}${target.pathname}`;

  await page.waitForURL((url: URL) => url.toString().startsWith(targetPrefix), {
    timeout: timeoutMs,
  });

  const current = new URL(page.url());
  return Object.fromEntries(current.searchParams.entries());
}

export async function maybeAutoLogin(page: any): Promise<void> {
  logger.info("Intentando auto-login si se configuran credenciales...", 0);
  if (process.env.CEDULA_IDENTIDAD && process.env.CONTRASENA) {
    const cedula = String(process.env.CEDULA_IDENTIDAD);
    const contrasena = String(process.env.CONTRASENA);

    await page.locator("#login").fill(cedula);
    await page.locator("#password").fill(contrasena);
    await page.locator("#continuar").click();
    await page.waitForLoadState("networkidle");

    const otroMedioBtn = page.getByRole("button", { name: /otro medio/i });
    if (await otroMedioBtn.isVisible()) {
      await otroMedioBtn.click();
      await page.waitForLoadState("networkidle");
    }

    const methodOptions = [
      'input[type="radio"][name="method"][value="TOTP"]',
      'input[type="radio"][name="method"][value="SMS"]',
      'input[type="radio"][name="method"][value="EMAIL"]',
    ];

    let selectedMethod: string | null = null;
    for (const selector of methodOptions) {
      const option = page.locator(selector);
      if (await option.isVisible()) {
        await option.check();
        selectedMethod = selector;
        break;
      }
    }

    if (!selectedMethod) {
      throw new Error("No se encontró ningún método de autenticación disponible");
    }

    await page.locator("#continuar-2fa").click();
    await page.waitForLoadState("networkidle");

    await page.locator('input[data-index="0"]').fill("1");
    await page.locator('input[data-index="1"]').fill("2");
    await page.locator('input[data-index="2"]').fill("3");
    await page.locator('input[data-index="3"]').fill("4");
    await page.locator('input[data-index="4"]').fill("5");
    await page.locator('input[data-index="5"]').fill("6");
    await page.locator("#continuar-2fa-validar").click();
    await page.waitForLoadState("networkidle");

    const botonPermitir = page.getByRole("button", { name: /permitir/i });
    if (await botonPermitir.isVisible()) {
      await botonPermitir.click();
      logger.info("Botón de permisos detectado y clickeado.");
    } else {
      logger.info("No apareció la pantalla de permisos, continuando...");
    }
  } else {
    logger.warn(
      "CEDULA_IDENTIDAD / CONTRASENA no configuradas — saltando autofill de login",
    );
  }
}

async function waitForCallback(
  redirectUri: string,
  timeoutMs: number,
): Promise<Record<string, string>> {
  const parsed = new URL(redirectUri);
  const host = parsed.hostname;
  const port = Number(parsed.port || (parsed.protocol === "https:" ? 443 : 80));

  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (!req.url) {
        res.statusCode = 400;
        res.end("Solicitud inválida");
        return;
      }

      const callbackUrl = new URL(req.url, `http://${host}:${port}`);
      const params = Object.fromEntries(callbackUrl.searchParams.entries());

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end("<h2>QA login completado. Puedes cerrar esta ventana.</h2>");

      clearTimeout(timeout);
      server.close();
      resolve(params);
    });

    const timeout = setTimeout(() => {
      server.close();
      reject(new Error("Tiempo de espera agotado esperando callback OAuth."));
    }, timeoutMs);

    server.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    server.listen(port, host);
  });
}

export interface ProveedorLoginResult {
  callbackParams: Record<string, string>;
  authorizationUrl: string;
}

export async function runQaProveedorLogin(): Promise<ProveedorLoginResult> {
  const { config, runtime } = getProveedorSessionStore();
  runtime.startedAt = new Date().toISOString();

  if (!config.issuer || !config.clientId || !config.redirectUri) {
    throw new Error(
      "Faltan vars requeridas: OIDC_ISSUER, OIDC_CLIENT_ID, OIDC_REDIRECT_URI",
    );
  }

  const state = randomHex(24);
  const nonce = randomHex(24);

  const authUrl = new URL(config.authPath, config.issuer);
  authUrl.searchParams.set("client_id", config.clientId);
  authUrl.searchParams.set("scope", config.scope);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", config.redirectUri);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("nonce", nonce);
  authUrl.searchParams.set("session", config.session);
  authUrl.searchParams.set("property", config.property);
  authUrl.searchParams.set("defaultStrategy", config.defaultStrategy);

  if (config.prompt) {
    authUrl.searchParams.set("prompt", config.prompt);
  }

  const authorizationUrl = authUrl.toString();

  const callbackPromise = isLocalRedirect(config.redirectUri)
    ? waitForCallback(config.redirectUri, config.timeoutMs)
    : null;

  const playwrightModule = process.env.PLAYWRIGHT_PACKAGE ?? "playwright";
  const { chromium } = await import(playwrightModule);
  const browser = await chromium.launch({
    headless: resolveHeadless("OIDC_HEADLESS", false),
  });
  const page = await browser.newPage();

  await page.goto(authorizationUrl, { waitUntil: "domcontentloaded" });
  await maybeAutoLogin(page);

  let callbackParams: Record<string, string>;
  try {
    callbackParams = callbackPromise
      ? await callbackPromise
      : await waitForRedirectInBrowser(
        page,
        config.redirectUri,
        config.timeoutMs,
      );
  } finally {
    await browser.close();
  }

  if (callbackParams.error) {
    throw new Error(
      `Error de autenticación: ${JSON.stringify(callbackParams)}`,
    );
  }

  if (callbackParams.state !== state) {
    throw new Error("State inválido. Posible CSRF.");
  }

  if (callbackParams.nonce && callbackParams.nonce !== nonce) {
    throw new Error("Nonce inválido.");
  }

  if (!callbackParams.code) {
    throw new Error("No llegó authorization code.");
  }

  setLastAuthorizationCode(callbackParams.code, callbackParams);
  getProveedorSessionStore().runtime.authorizationUrl = authorizationUrl;
  debugLog("Authorization code capturado en session store.");

  return { callbackParams, authorizationUrl };
}

/**
 * Flujo OAuth PKCE para aplicaciones móviles.
 * Usa exclusivamente la configuración de OIDC_MOBILE_* y escribe solo en
 * getMobileSessionStore() — sin tocar el store del flujo web regular.
 */
export async function runQaMobileLogin(): Promise<ProveedorLoginResult> {
  const { config } = getMobileSessionStore();

  if (!config.issuer || !config.clientId || !config.redirectUri) {
    throw new Error(
      "Faltan vars requeridas: OIDC_ISSUER, OIDC_MOBILE_CLIENT_ID, OIDC_MOBILE_REDIRECT_URI",
    );
  }

  const state = randomHex(24);
  const nonce = randomHex(24);
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  setMobileCodeVerifier(codeVerifier);

  const authUrl = new URL(config.authPath, config.issuer);
  authUrl.searchParams.set("client_id", config.clientId);
  authUrl.searchParams.set("scope", config.scope);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", config.redirectUri);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("nonce", nonce);
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");
  authUrl.searchParams.set("session", config.session);
  authUrl.searchParams.set("property", config.property);
  authUrl.searchParams.set("defaultStrategy", config.defaultStrategy);

  if (config.prompt) {
    authUrl.searchParams.set("prompt", config.prompt);
  }

  const authorizationUrl = authUrl.toString();

  const playwrightModule = process.env.PLAYWRIGHT_PACKAGE ?? "playwright";
  const { chromium } = await import(playwrightModule);
  const browser = await chromium.launch({
    headless: resolveHeadless("OIDC_HEADLESS", false),
  });
  const page = await browser.newPage();

  // --- LÓGICA DE CAPTURA DE PROTOCOLO MÓVIL ---
  // Playwright/Chromium modernos abortan la navegación a protocolos custom (e.g.
  // bo.gob.ciudadania.app:/) y emiten `requestfailed` en lugar de `request`.
  // Escuchamos ambos eventos para cubrir versiones antiguas y nuevas.
  const mobileRedirectPromise = new Promise<Record<string, string>>(
    (resolve, reject) => {
      const timeout = setTimeout(
        () =>
          reject(
            new Error(
              `Timeout de ${config.timeoutMs}ms esperando la redirección del protocolo móvil`,
            ),
          ),
        config.timeoutMs,
      );

      let resolved = false;

      const captureRedirect = (url: string) => {
        if (resolved) return;
        if (!url.startsWith(config.redirectUri)) return;

        resolved = true;
        clearTimeout(timeout);
        debugLog(`¡Redirección capturada!: ${url}`);

        // URL() falla con protocolos custom; los convertimos a http para extraer params.
        const normalizedUrl = new URL(
          url.replace(config.redirectUri, "http://localhost/"),
        );
        const params = Object.fromEntries(normalizedUrl.searchParams.entries());
        resolve(params);
      };

      page.on("request", (request: any) => captureRedirect(request.url()));
      page.on("requestfailed", (request: any) => captureRedirect(request.url()));
    },
  );

  await page.goto(authorizationUrl, { waitUntil: "domcontentloaded" });

  let callbackParams: Record<string, string>;
  try {
    // 1. Ejecutamos el flujo de login (cedula, pass, 2FA, y el nuevo botón de Permitir)
    await maybeAutoLogin(page);

    // 2. Esperamos a que el interceptor capture la URL de éxito
    // Esto captura la URL antes de que el navegador muestre el popup de xdg-open
    callbackParams = await mobileRedirectPromise;
  } catch (error: any) {
    throw new Error(`Error durante el flujo mobile: ${error.message}`);
  } finally {
    // Cerramos el browser. Esto también mata cualquier diálogo de xdg-open que haya quedado colgado
    await browser.close();
  }

  // --- VALIDACIONES POST-CAPTURA ---
  if (callbackParams.error) {
    throw new Error(
      `Error de autenticación móvil: ${JSON.stringify(callbackParams)}`,
    );
  }

  if (callbackParams.state !== state) {
    throw new Error("State inválido. Posible CSRF.");
  }

  if (!callbackParams.code) {
    throw new Error("No llegó authorization code.");
  }

  const mobileRuntime = getMobileSessionStore().runtime;
  mobileRuntime.lastCallbackParams = callbackParams;
  mobileRuntime.authorizationUrl = authorizationUrl;
  debugLog("Authorization code móvil capturado y guardado exitosamente.");

  return { callbackParams, authorizationUrl };
}
