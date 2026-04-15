/**
 * apro-06 — ACCESS_TOKEN malformado (no es JWT)
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
  id: "apro-06.1",
  name: "ACCESS_TOKEN malformado",
  module: "aprobador" as const,
  tags: ["negative", "auth", "token"],
};

const EXPECTED: ExpectedOutcome = {
  success: false,
  httpStatus: 412,
  bodyContains: ["Token inválido"],
};

export const scenario: Scenario = {
  ...META,
  description: "accessToken que no es JWT válido debe ser rechazado.",
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const body = buildSingleBody(fixtures.validPdf, {
        accessToken:
          "eyJhbGciOiJSUzI1NiJ9." +
          Buffer.from(JSON.stringify({ sub: "qa", exp: 1 })).toString(
            "base64",
          ) +
          ".FIRMA_INVALIDA",
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
