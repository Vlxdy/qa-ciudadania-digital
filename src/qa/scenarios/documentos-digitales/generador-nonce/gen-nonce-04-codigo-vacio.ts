/**
 * gen-nonce-04 — Validación Zod: codigoDocumento vacío → error local + 400
 */
import { qaPost } from "../../../http/qa-http";
import type { Scenario, ScenarioResult } from "../../../types/scenario.types";
import { makeResult } from "../../../types/scenario.types";
import { ensureMobileAccessToken } from "../../proveedor/services/token-provider";
import {
  validateInputGeneradorNonce,
  tryBuildAndSendGeneradorNonce,
  generadorNonceUrl,
} from "./helpers";

const META = {
  id: "gen-nonce-04",
  name: "codigoDocumento vacío — generación de nonce",
  module: "documentos-digitales" as const,
  tags: [
    "negative",
    "validation",
    "local",
    "documentos-digitales",
    "generador-nonce",
  ],
};

const EXPECTED = {
  success: false,
  validationFields: ["codigoDocumento"],
  httpStatus: 400,
  bodyContains: ["codigoDocumento no debe estar vacío."],
};

export const scenario: Scenario = {
  ...META,
  description:
    "codigoDocumento vacío debe fallar la validación Zod en la generación de nonce.",
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();

    try {
      const token = await ensureMobileAccessToken();
      const response = await qaPost(
        generadorNonceUrl(),
        { codigoDocumento: "" },
        {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      );
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
