import http from "http";
import { randomBytes, createHash } from "crypto";
import { URL } from "url";
import fs from "fs";
import path from "path";
import axios from "axios";
import { ingresarDatosLogin } from "./datos";

export type OidcConfig = {
  issuer: string;
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scope: string;
  prompt?: string;
  authPath: string;
  tokenPath: string;
  timeoutMs: number;
  authMethod: string;
  session: string;
  property: string;
  defaultStrategy: string;
};

export type OauthResult = {
  callbackParams: Record<string, string>;
  tokenResponse?: any;
};

function randomHex(size = 24): string {
  return randomBytes(size).toString("hex");
}

function base64Url(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function buildPkce() {
  const codeVerifier = base64Url(randomBytes(64));
  const codeChallenge = base64Url(
    createHash("sha256").update(codeVerifier).digest(),
  );
  return { codeVerifier, codeChallenge };
}

export function getOidcConfig(): OidcConfig {
  const issuer = process.env.OIDC_ISSUER ?? process.env.PROVEEDOR_BASE_URL;
  const clientId =
    process.env.OIDC_CLIENT_ID ?? process.env.PROVEEDOR_CLIENT_ID;
  const clientSecret =
    process.env.OIDC_CLIENT_SECRET ?? process.env.PROVEEDOR_CLIENT_SECRET;
  const redirectUri =
    process.env.OIDC_REDIRECT_URI ?? process.env.PROVEEDOR_REDIRECT_URI;

  if (!issuer || !clientId || !redirectUri) {
    throw new Error(
      "Faltan variables requeridas: OIDC_ISSUER, OIDC_CLIENT_ID, OIDC_REDIRECT_URI",
    );
  }

  return {
    issuer,
    clientId,
    clientSecret,
    redirectUri,
    scope: process.env.OIDC_SCOPE ?? "openid profile",
    prompt: process.env.OIDC_PROMPT,
    authPath: process.env.OIDC_AUTH_PATH ?? "/auth",
    tokenPath: process.env.OIDC_TOKEN_PATH ?? "/token",
    timeoutMs: Number(process.env.OIDC_TIMEOUT_MS ?? 180000),
    authMethod: process.env.OIDC_CLIENT_AUTH_METHOD ?? "post",
    session: process.env.OIDC_SESSION ?? "true",
    property: process.env.OIDC_PROPERTY ?? "user",
    defaultStrategy: process.env.OIDC_DEFAULT_STRATEGY ?? "oidc",
  };
}

function isLocalRedirect(redirectUri: string): boolean {
  const host = new URL(redirectUri).hostname;
  return host === "localhost" || host === "127.0.0.1";
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

async function maybeAutoLogin(page: any): Promise<void> {
  await ingresarDatosLogin(page);
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
      res.end("<h2>Login completado. Puedes cerrar esta ventana.</h2>");

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

export async function runProveedorOAuth(
  shouldExchangeToken: boolean,
): Promise<OauthResult> {
  const cfg = getOidcConfig();
  const usePkce =
    process.argv.includes("--pkce") || process.env.OIDC_USE_PKCE === "true";

  const state = randomHex(24);
  const nonce = randomHex(24);

  const authUrl = new URL(cfg.authPath, cfg.issuer);
  authUrl.searchParams.set("client_id", cfg.clientId);
  authUrl.searchParams.set("scope", cfg.scope);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", cfg.redirectUri);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("nonce", nonce);
  authUrl.searchParams.set("session", cfg.session);
  authUrl.searchParams.set("property", cfg.property);
  authUrl.searchParams.set("defaultStrategy", cfg.defaultStrategy);

  if (cfg.prompt) {
    authUrl.searchParams.set("prompt", cfg.prompt);
  }

  let pkce: ReturnType<typeof buildPkce> | null = null;
  if (usePkce) {
    pkce = buildPkce();
    authUrl.searchParams.set("code_challenge", pkce.codeChallenge);
    authUrl.searchParams.set("code_challenge_method", "S256");
  }

  console.log("🌐 URL autorización generada:");
  console.log(authUrl.toString());

  const useLocalListener = isLocalRedirect(cfg.redirectUri);
  const callbackPromise = useLocalListener
    ? waitForCallback(cfg.redirectUri, cfg.timeoutMs)
    : null;

  if (!useLocalListener) {
    console.log(
      "ℹ️ Redirect URI no es local. Se capturará el callback directamente desde la URL del navegador.",
    );
  }

  const playwrightModule = process.env.PLAYWRIGHT_PACKAGE ?? "playwright";
  const { chromium } = await import(playwrightModule);
  const browser = await chromium.launch({
    headless: process.env.OIDC_HEADLESS === "true",
  });
  const page = await browser.newPage();

  await page.goto(authUrl.toString(), { waitUntil: "domcontentloaded" });
  console.log("🔐 Navegador abierto para login...");

  await maybeAutoLogin(page);

  let callbackParams: Record<string, string>;
  try {
    callbackParams = callbackPromise
      ? await callbackPromise
      : await waitForRedirectInBrowser(page, cfg.redirectUri, cfg.timeoutMs);
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

  const outputDir = path.join(process.env.OUTPUT_DIR ?? "./output", "proveedor");
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    path.join(outputDir, "proveedor.callback.json"),
    JSON.stringify(callbackParams, null, 2),
  );

  if (!shouldExchangeToken) {
    return { callbackParams };
  }

  const payload = new URLSearchParams({
    grant_type: "authorization_code",
    code: callbackParams.code,
    redirect_uri: cfg.redirectUri,
  });

  if (usePkce && pkce) {
    payload.set("code_verifier", pkce.codeVerifier);
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  if (cfg.authMethod === "basic") {
    headers.Authorization = `Basic ${Buffer.from(`${cfg.clientId}:${cfg.clientSecret ?? ""}`).toString("base64")}`;
  } else if (cfg.authMethod === "post") {
    payload.set("client_id", cfg.clientId);
    payload.set("client_secret", cfg.clientSecret ?? "");
  } else {
    payload.set("client_id", cfg.clientId);
  }

  const tokenUrl = new URL(cfg.tokenPath, cfg.issuer).toString();
  const tokenHttpResponse = await axios.post(tokenUrl, payload.toString(), {
    headers,
    timeout: cfg.timeoutMs,
  });

  fs.writeFileSync(
    path.join(outputDir, "proveedor.token.json"),
    JSON.stringify(tokenHttpResponse.data, null, 2),
  );

  return {
    callbackParams,
    tokenResponse: tokenHttpResponse.data,
  };
}
