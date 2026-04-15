/**
 * prov-01 — Happy Path: intercambio de código por token
 *
 * Usa el code de prov-00 (si ya se ejecutó en este run) o QA_OAUTH_CODE del entorno.
 */
import type { Scenario, ScenarioResult } from "../../types/scenario.types";
import { makeResult } from "../../types/scenario.types";
import { qaPostForm } from "../../http/qa-http";
import { buildTokenPayload, tokenUrl } from "./helpers";
import { getProveedorSessionStore, setAccessToken } from "./services/session.store";

const META = {
  id: "prov-01",
  name: "Happy Path — intercambio de código",
  module: "proveedor" as const,
  tags: ["happy", "auth", "token"],
};

const EXPECTED = {
  success: true,
  httpStatus: 200,
  bodyContains: ["access_token"],
};

export const scenario: Scenario = {
  ...META,
  description:
    "Con authorization code válido (prov-00 o QA_OAUTH_CODE) debe retornar 200 con access_token.",
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    const code =
      getProveedorSessionStore().runtime.lastAuthorizationCode ??
      process.env.QA_OAUTH_CODE;

    if (!code) {
      return makeResult(
        META,
        {
          localError:
            "No hay authorization code disponible. Ejecutar prov-00 o definir QA_OAUTH_CODE.",
          durationMs: Date.now() - start,
        },
        EXPECTED,
      );
    }

    const { payload, headers } = buildTokenPayload({ code });
    const response = await qaPostForm(tokenUrl(), payload, headers);

    // Guardar el access_token en el store para que otros módulos (ej. aprobador) lo usen
    const token = (response.body as any)?.access_token;
    if (typeof token === 'string' && token.length > 0) {
      setAccessToken(token);
    }

    return makeResult(
      META,
      {
        ...response,
        durationMs: Date.now() - start,
      },
      EXPECTED,
    );
  },
};
