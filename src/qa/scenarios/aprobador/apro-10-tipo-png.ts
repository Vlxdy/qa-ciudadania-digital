/**
 * apro-10 — Archivo .png: tipo de documento no soportado por el servidor
 * Envía el contenido real del .png con tipoDocumento: 'PNG' — el servidor debe rechazarlo.
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
  id: "apro-10",
  name: "Archivo .png — tipo no soportado",
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
    "Enviar un archivo .png con tipoDocumento PNG debe ser rechazado por el servidor.",
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const body = buildSingleBody(fixtures.pngFile, { tipoDocumento: "PNG" });
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
