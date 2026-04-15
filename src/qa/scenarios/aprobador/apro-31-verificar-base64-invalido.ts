/**
 * apro-31 — Verificar con Base64 inválido.
 * El campo archivo contiene una cadena que no es Base64 válido.
 * El servidor debe rechazar la solicitud con 4xx.
 */
import type {
  ExpectedOutcome,
  Scenario,
  ScenarioResult,
} from "../../types/scenario.types";
import { makeResult } from "../../types/scenario.types";
import { qaPost } from "../../http/qa-http";
import { verificarUrl, defaultToken } from "./helpers";

const META = {
  id: "apro-31",
  name: "Verificar — Base64 inválido",
  module: "aprobador" as const,
  tags: ["verificar", "negative"],
};

const EXPECTED: ExpectedOutcome = {
  success: false,
  httpStatus: 412,
  bodyContains: ["El documento enviado no es válido"],
};

export const scenario: Scenario = {
  ...META,
  description:
    "Enviar una cadena no-Base64 en el campo archivo debe ser rechazado.",
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const response = await qaPost(
        verificarUrl(),
        { archivo: "!!!esto_no_es_base64===@@@###" },
        {
          Authorization: `Bearer ${defaultToken()}`,
          "Content-Type": "application/json",
        },
      );
      return makeResult(META, response, EXPECTED);
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
