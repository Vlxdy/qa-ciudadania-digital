/**
 * apro-14 — Archivo muy grande (~20 MB): boundary test
 * Verifica si el servidor acepta o rechaza archivos grandes.
 * El expected puede ajustarse según el límite real del servidor.
 */
import type {
  ExpectedOutcome,
  Scenario,
  ScenarioResult,
} from "../../types/scenario.types";
import { makeResult } from "../../types/scenario.types";
import { qaPost } from "../../http/qa-http";
import { buildSingleBody, singleUrl, defaultToken, fixtures } from "./helpers";
import { ensureAccessToken } from "../proveedor/services/token-provider";

const META = {
  id: "apro-14",
  name: "Archivo muy grande — ~20 MB",
  module: "aprobador" as const,
  tags: ["boundary", "file-size"],
};

// Ajustar httpStatus según límite real del servidor (412 si hay límite de payload)
const EXPECTED: ExpectedOutcome = {
  success: false,
  httpStatus: 412,
  bodyContains: ["El tamaño del archivo excede de 20 MB"],
};

export const scenario: Scenario = {
  ...META,
  description:
    "PDF de ~20 MB debe ser rechazado con 412 si supera el límite del servidor. " +
    "Ajustar expected.httpStatus si el servidor no tiene límite o usa otro código.",
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const accessToken = await ensureAccessToken();
      const body = buildSingleBody(fixtures.validPdf20mb, { accessToken });
      const response = await qaPost(
        singleUrl(),
        body,
        {
          Authorization: `Bearer ${defaultToken()}`,
          "Content-Type": "application/json",
        },
        60_000, // timeout mayor para archivo grande
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
