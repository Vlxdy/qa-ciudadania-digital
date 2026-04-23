/**
 * prov-11 — Móvil: intercambio de token sin code_verifier → 400
 *
 * Hace el login PKCE (obteniendo un authorization code válido con code_challenge),
 * pero omite el code_verifier en el token endpoint.
 * El servidor debe rechazar la solicitud con 400.
 */
import type { Scenario, ScenarioResult } from "../../types/scenario.types";
import { makeResult } from "../../types/scenario.types";
import { runQaMobileLogin } from "./services/oauth-browser-flow";
import { getMobileSessionStore } from "./services/mobile-session.store";
import { buildTokenPayload, mobileTokenUrl } from "./helpers";
import { qaPostForm } from "../../http/qa-http";

const META = {
  id: "prov-11",
  name: "Móvil — token sin code_verifier",
  module: "proveedor" as const,
  tags: ["negative", "auth", "mobile", "pkce"],
};

const EXPECTED = {
  success: false,
  httpStatus: 400,
};

export const scenario: Scenario = {
  ...META,
  description:
    "Intercambio de code por token en flujo PKCE móvil sin incluir code_verifier debe retornar 400.",
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
      const { callbackParams } = await runQaMobileLogin();

      // Forzar omisión del code_verifier pasando cadena vacía
      const { payload, headers } = buildTokenPayload({
        code: callbackParams.code,
        authMethod: "mobile",
        codeVerifier: "",
      });
      const response = await qaPostForm(mobileTokenUrl(), payload, headers);

      return makeResult(
        META,
        { ...response, durationMs: Date.now() - start },
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
