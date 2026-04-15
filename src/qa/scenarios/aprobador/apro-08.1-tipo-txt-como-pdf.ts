/**
 * apro-08 — Archivo .txt: tipo de documento no soportado por el servidor
 * Envía el contenido real del .txt con tipoDocumento: 'TXT' — el servidor debe rechazarlo.
 */
import type {
  ExpectedOutcome,
  Scenario,
  ScenarioResult,
} from "../../types/scenario.types";
import { makeResult } from "../../types/scenario.types";
import { qaPost } from "../../http/qa-http";
import { buildSingleBody, singleUrl, defaultToken, fixtures } from "./helpers";

const META = {
  id: "apro-08.1",
  name: "Archivo .txt como PDF — tipo no soportado",
  module: "aprobador" as const,
  tags: ["negative", "file-type"],
};

const EXPECTED: ExpectedOutcome = {
  success: false,
  httpStatus: 400,
};

export const scenario: Scenario = {
  ...META,
  description:
    "Enviar un archivo .txt con tipoDocumento PDF debe ser rechazado por el servidor.",
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const body = buildSingleBody(fixtures.txtFile, { tipoDocumento: "PDF" });
      const response = await qaPost(singleUrl(), body, {
        Authorization: `Bearer ${defaultToken()}`,
        "Content-Type": "application/json",
      });
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
