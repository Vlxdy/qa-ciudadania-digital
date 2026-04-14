/**
 * prov-07 — State mismatch (protección CSRF)
 *
 * Prueba la lógica LOCAL de validación de state de oauth-flow.ts.
 * No realiza llamada HTTP — simula el callback con state incorrecto.
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { validateState } from './helpers';

const META = {
  id: 'prov-07',
  name: 'State mismatch — protección CSRF',
  module: 'proveedor' as const,
  tags: ['negative', 'security', 'local'],
};

const EXPECTED = {
  success: false,
  errorMessage: 'State inválido. Posible CSRF.',
};

export const scenario: Scenario = {
  ...META,
  description:
    'Si el state del callback no coincide con el enviado, debe lanzar error de CSRF.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    const sentState = 'abc123secure';
    const receivedState = 'DIFERENTE_STATE_ATACANTE';

    const error = validateState(sentState, receivedState);
    if (error) {
      return makeResult(META, { localError: error, durationMs: Date.now() - start }, EXPECTED);
    }
    // No debería llegar aquí
    return makeResult(META, { durationMs: Date.now() - start }, EXPECTED);
  },
};
