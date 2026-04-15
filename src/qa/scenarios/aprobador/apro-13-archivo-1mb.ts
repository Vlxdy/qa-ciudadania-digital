/**
 * apro-13 — Archivo mediano (~1 MB): tamaño normal esperado
 */
import type { Scenario, ScenarioResult } from "../../types/scenario.types";
import { makeResult } from "../../types/scenario.types";
import { qaPost } from "../../http/qa-http";
import { buildSingleBody, singleUrl, defaultToken, fixtures } from "./helpers";
import { getProveedorSessionStore } from "../proveedor/services/session.store";

const META = {
  id: "apro-13",
  name: "Archivo mediano — ~1 MB",
  module: "aprobador" as const,
  tags: ["positive", "file-size"],
};

const EXPECTED = {
  success: true,
  httpStatus: 201,
};

export const scenario: Scenario = {
  ...META,
  description: "PDF de ~1 MB debe ser aceptado y retornar 201.",
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const accessToken = getProveedorSessionStore().runtime.accessToken;

      const body = buildSingleBody(fixtures.validPdf1mb, { accessToken });
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
