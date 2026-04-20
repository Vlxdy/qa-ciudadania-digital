/**
 * prov-10 — Happy Path móvil: flujo OAuth PKCE completo para aplicaciones móviles
 *
 * Fase 1: abre el browser con code_challenge (S256) en la URL de autorización.
 * Fase 2: intercambia el authorization code por access_token usando code_verifier
 *         y sin client_secret.
 * Requiere OIDC_MOBILE_CLIENT_ID y OIDC_MOBILE_REDIRECT_URI configurados.
 */
import type { Scenario, ScenarioResult } from "../../types/scenario.types";
import { makeResult } from "../../types/scenario.types";
import { runQaMobileLogin } from "./services/oauth-browser-flow";
import { getMobileSessionStore } from "./services/mobile-session.store";
import { buildTokenPayload, mobileTokenUrl } from "./helpers";
import { qaPostForm } from "../../http/qa-http";

const META = {
  id: "prov-10",
  name: "Happy Path móvil — OAuth PKCE",
  module: "proveedor" as const,
  tags: ["happy", "auth", "browser", "mobile", "pkce"],
};

const EXPECTED = {
  success: true,
  httpStatus: 200,
  bodyContains: ["access_token"],
};

export const scenario: Scenario = {
  ...META,
  description:
    "Ejecuta el flujo OAuth PKCE completo para apps móviles: browser con code_challenge → intercambio con code_verifier (sin client_secret) → access_token.",
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();

    const mobileConfig = getMobileSessionStore().config;
    if (!mobileConfig.clientId || !mobileConfig.redirectUri) {
      return makeResult(
        META,
        {
          localError:
            "OIDC_MOBILE_CLIENT_ID y OIDC_MOBILE_REDIRECT_URI son requeridas para este escenario.",
          durationMs: Date.now() - start,
        },
        EXPECTED,
      );
    }

    try {
      // Fase 1: login en navegador con PKCE
      const { callbackParams, authorizationUrl } = await runQaMobileLogin();

      // Fase 2: intercambio de código (sin client_secret, con code_verifier del store)
      const { payload, headers } = buildTokenPayload({
        code: callbackParams.code,
        authMethod: "mobile",
      });
      const tokenResponse = await qaPostForm(
        mobileTokenUrl(),
        payload,
        headers,
      );

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
    } catch (err) {
      return makeResult(
        META,
        {
          localError: err instanceof Error ? err.message : String(err),
          durationMs: Date.now() - start,
        },
        EXPECTED,
      );
    }
  },
};
