/**
 * prov-00 — Login OAuth completo en navegador + intercambio de código por token
 *
 * Fase 1: Abre el browser, completa el login y captura el authorization code.
 * Fase 2: Intercambia el code por access_token y lo guarda en el session store.
 */
import type { Scenario, ScenarioResult } from "../../types/scenario.types";
import { makeResult } from "../../types/scenario.types";
import { runQaProveedorLogin } from "./services/oauth-browser-flow";
import { getProveedorSessionStore, setAccessToken } from "./services/session.store";
import { buildTokenPayload, tokenUrl } from "./helpers";
import { qaPostForm } from "../../http/qa-http";

const META = {
  id: "prov-00",
  name: "Login OAuth en navegador",
  module: "proveedor" as const,
  tags: ["happy", "auth", "browser"],
};

const EXPECTED = {
  success: true,
  bodyContains: ["code", "state", "access_token"],
};

export const scenario: Scenario = {
  ...META,
  description:
    "Ejecuta el login OAuth completo: browser → authorization code → intercambio por access_token. Guarda el token en el session store.",
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();

    try {
      // ── Fase 1: login en navegador → authorization code ──────────────────────
      const { callbackParams, authorizationUrl } = await runQaProveedorLogin();

      // ── Fase 2: intercambio de código por token ───────────────────────────────
      const { payload, headers } = buildTokenPayload({ code: callbackParams.code });
      const tokenResponse = await qaPostForm(tokenUrl(), payload, headers);

      const accessToken = (tokenResponse.body as Record<string, unknown>)?.access_token;
      if (typeof accessToken === "string" && accessToken) {
        setAccessToken(accessToken);
        const store = getProveedorSessionStore();
        store.runtime.lastTokenResponse = tokenResponse.body as Record<string, unknown>;
      }

      return makeResult(
        META,
        {
          httpStatus: tokenResponse.httpStatus,
          body: {
            ...callbackParams,
            ...(tokenResponse.body as Record<string, unknown>),
          },
          request: {
            method: "GET",
            url: authorizationUrl,
            headers: {},
            encoding: "form",
          },
          durationMs: Date.now() - start,
        },
        EXPECTED,
      );
    } catch (error) {
      return makeResult(
        META,
        {
          localError: error instanceof Error ? error.message : String(error),
          durationMs: Date.now() - start,
        },
        EXPECTED,
      );
    }
  },
};
