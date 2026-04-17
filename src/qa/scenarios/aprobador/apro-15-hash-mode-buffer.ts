/**
 * apro-15 — Hash mode BUFFER: SHA256 sobre bytes binarios
 */
import type { Scenario, ScenarioResult } from "../../types/scenario.types";
import { makeResult } from "../../types/scenario.types";
import { qaPost } from "../../http/qa-http";
import { buildSingleBody, singleUrl, defaultToken, fixtures } from "./helpers";
import { ensureAccessToken } from "../proveedor/services/token-provider";

const META = {
  id: "apro-15",
  name: "Hash mode BUFFER",
  module: "aprobador" as const,
  tags: ["positive", "hash", "config"],
};

const EXPECTED = {
  success: true,
  httpStatus: 200,
};

export const scenario: Scenario = {
  ...META,
  description:
    "Hash calculado sobre bytes binarios (BUFFER) debe ser aceptado por el servidor.",
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const accessToken = await ensureAccessToken();
      const body = buildSingleBody(fixtures.validPdf, {
        hashMode: "BUFFER",
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
  skip: true,
};
