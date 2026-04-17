/**
 * prov-12 — Móvil: intercambio de token con code_verifier incorrecto → 400
 *
 * Hace el login PKCE (obteniendo un authorization code válido con un code_challenge),
 * pero envía un code_verifier diferente al que generó ese challenge.
 * El servidor debe rechazar la solicitud con 400.
 */
import type { Scenario, ScenarioResult } from "../../types/scenario.types";
import { makeResult } from "../../types/scenario.types";
import { runQaMobileLogin } from "./services/oauth-browser-flow";
import { getMobileSessionStore } from "./services/mobile-session.store";
import { buildTokenPayload, mobileTokenUrl } from "./helpers";
import { qaPostForm } from "../../http/qa-http";

const META = {
  id: "prov-12",
  name: "Móvil — code_verifier incorrecto",
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
    "Intercambio de code por token en flujo PKCE móvil con code_verifier incorrecto debe retornar 400.",
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

      // Enviar un verifier diferente al que generó el code_challenge
      const { payload, headers } = buildTokenPayload({
        code: callbackParams.code,
        authMethod: "mobile",
        codeVerifier: "verifier_invalido_qa_este_no_coincide_con_el_challenge",
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
  skip: true,
};
