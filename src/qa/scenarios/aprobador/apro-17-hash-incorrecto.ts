/**
 * apro-17 — Hash incorrecto: hashDocumento no corresponde al archivo
 */
import type { Scenario, ScenarioResult } from "../../types/scenario.types";
import { makeResult } from "../../types/scenario.types";
import { qaPost } from "../../http/qa-http";
import { buildSingleBody, singleUrl, defaultToken, fixtures } from "./helpers";
import { ensureAccessToken } from "../proveedor/services/token-provider";

const META = {
  id: "apro-17",
  name: "Hash incorrecto",
  module: "aprobador" as const,
  tags: ["negative", "hash"],
};

const EXPECTED = {
  success: false,
  httpStatus: 412,
  bodyContains: ["El hash generado no coincide con el de la solicitud"],
};

export const scenario: Scenario = {
  ...META,
  description:
    "hashDocumento que no corresponde al archivo debe ser rechazado por el servidor.",
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const accessToken = await ensureAccessToken();
      const body = buildSingleBody(fixtures.validPdf, {
        hashDocumento: "a".repeat(64), // SHA256 placeholder incorrecto
        accessToken,
      });
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
