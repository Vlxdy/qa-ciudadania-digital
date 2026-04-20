/**
 * gen-nonce-05 — Validación Zod: codigoDocumento con valor que no es UUID v4 → error local + 400
 */
import { qaPost } from "../../../http/qa-http";
import type { Scenario, ScenarioResult } from "../../../types/scenario.types";
import { makeResult } from "../../../types/scenario.types";
import { ensureMobileAccessToken } from "../../proveedor/services/token-provider";
import {
  validateInputGeneradorNonce,
  tryBuildAndSendGeneradorNonce,
  generadorNonceUrl,
  buildGeneradorNonceBody,
} from "./helpers";

const META = {
  id: "gen-nonce-05",
  name: "codigoDocumento no es UUID — generación de nonce",
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
  bodyContains: ["codigoDocumento debe ser un UUID."],
};

export const scenario: Scenario = {
  ...META,
  description:
    'codigoDocumento con valor no UUID (ej: "DOC-001") debe fallar la validación Zod.',
  run: async (): Promise<ScenarioResult> => {
    const input = { codigoDocumento: "DOC-001-NO-UUID" };
    const start = Date.now();
    try {
      const token = await ensureMobileAccessToken();
      const response = await qaPost(
        generadorNonceUrl(),
        {
          codigoDocumento: input.codigoDocumento,
        },
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
