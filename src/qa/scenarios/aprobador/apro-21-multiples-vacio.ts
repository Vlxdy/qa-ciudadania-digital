/**
 * apro-21 — Multiple con array documentos vacío
 */
import type { Scenario, ScenarioResult } from "../../types/scenario.types";
import { makeResult } from "../../types/scenario.types";
import { qaPost } from "../../http/qa-http";
import { v4 as uuidv4 } from "uuid";
import { multipleUrl, defaultToken } from "./helpers";
import { ensureAccessToken } from "../proveedor/services/token-provider";

const META = {
  id: "apro-21",
  name: "Multiple — array documentos vacío",
  module: "aprobador" as const,
  tags: ["negative", "multiple", "validation"],
};

const EXPECTED = {
  success: false,
  httpStatus: 400,
};

export const scenario: Scenario = {
  ...META,
  description: "Array documentos vacío en modo múltiple debe ser rechazado.",
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const accessToken = await ensureAccessToken();
      const body = {
        idTramite: uuidv4(),
        accessToken,
        documentos: [], // Vacío — debe fallar
      };
      const response = await qaPost(multipleUrl(), body, {
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
