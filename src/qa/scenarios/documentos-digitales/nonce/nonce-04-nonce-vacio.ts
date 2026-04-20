/**
 * nonce-04 — Validación Zod: nonce vacío → error local + 400
 */
import type { Scenario, ScenarioResult } from "../../../types/scenario.types";
import { makeResult } from "../../../types/scenario.types";
import { validateInputNonce, tryBuildAndSendNonce } from "./helpers";

const META = {
  id: "nonce-04",
  name: "nonce vacío — verificación de nonce",
  module: "documentos-digitales" as const,
  tags: ["negative", "validation", "local", "documentos-digitales", "nonce"],
};

const EXPECTED = {
  success: false,
  statusCode: 400,
  validationFields: ["nonce"],
};

export const scenario: Scenario = {
  ...META,
  description:
    "nonce vacío debe fallar la validación Zod en la verificación de nonce.",
  run: async (): Promise<ScenarioResult> => {
    const input = { nonce: "" };
    const validation = validateInputNonce(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendNonce(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
