/**
 * prov-00 — Login OAuth en navegador (sin intercambio de token)
 */
import type { Scenario, ScenarioResult } from "../../types/scenario.types";
import { makeResult } from "../../types/scenario.types";
import { runQaProveedorLogin } from "./services/oauth-browser-flow";

const META = {
  id: "prov-00",
  name: "Login OAuth en navegador",
  module: "proveedor" as const,
  tags: ["happy", "auth", "browser"],
};

const EXPECTED = {
  success: true,
  // Doc: el callback exitoso incluye code, state y nonce
  bodyContains: ["code", "state"],
};

export const scenario: Scenario = {
  ...META,
  description:
    "Ejecuta la autenticación OAuth del proveedor y valida que el callback incluya authorization code y state.",
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();

    try {
      const { callbackParams, authorizationUrl } = await runQaProveedorLogin();

      return makeResult(
        META,
        {
          body: callbackParams,
          // Traza de la petición GET al authorization endpoint para generar curl
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
