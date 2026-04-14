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
  bodyContains: ["code"],
};

export const scenario: Scenario = {
  ...META,
  description:
    "Ejecuta solo la autenticación OAuth del proveedor y valida que llegue authorization code.",
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();

    try {
      const callbackParams = await runQaProveedorLogin();

      return makeResult(
        META,
        {
          body: callbackParams,
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
