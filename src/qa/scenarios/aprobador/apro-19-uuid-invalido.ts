/**
 * apro-19 — idTramite no es UUID v4
 */
import type { Scenario, ScenarioResult } from "../../types/scenario.types";
import { makeResult } from "../../types/scenario.types";
import { qaPost } from "../../http/qa-http";
import { buildSingleBody, singleUrl, defaultToken, fixtures } from "./helpers";
import { ensureAccessToken } from "../proveedor/services/token-provider";

const META = {
  id: "apro-19",
  name: "idTramite no es UUID",
  module: "aprobador" as const,
  tags: ["negative", "validation", "structure"],
};

const EXPECTED = {
  success: false,
  httpStatus: 400,
};

export const scenario: Scenario = {
  ...META,
  description:
    "idTramite con string arbitrario (no UUID v4) debe ser rechazado.",
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const accessToken = await ensureAccessToken();
      const body = buildSingleBody(fixtures.validPdf, {
        idTramite: "ESTE_NO_ES_UN_UUID",
        accessToken
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
