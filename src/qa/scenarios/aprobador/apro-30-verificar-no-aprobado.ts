/**
 * apro-30 — Verificar documento nunca aprobado.
 * Genera un JSON único (con UUID + timestamp) que nunca pasó por el flujo de
 * aprobación, por lo que no debe existir ningún registro en el blockchain.
 * Espera verificacionExitosa:false y registros:[].
 */
import { v4 as uuidv4 } from 'uuid';
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { verificarUrl, defaultToken } from './helpers';

const META = {
  id: 'apro-30',
  name: 'Verificar — documento sin aprobaciones',
  module: 'aprobador' as const,
  tags: ['verificar', 'negative'],
};

const EXPECTED = {
  success: true,
  httpStatus: 201,
  bodyContains: ['"verificacionExitosa":false', '"registros":[]'],
};

export const scenario: Scenario = {
  ...META,
  description:
    'Documento nunca aprobado debe retornar verificacionExitosa:false y registros:[].',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      // Contenido único garantiza que no existe ningún hash previo en el blockchain
      const uniqueContent = JSON.stringify({ qa_noaprobado: true, id: uuidv4(), ts: Date.now() });
      const archivo = Buffer.from(uniqueContent).toString('base64');

      const response = await qaPost(
        verificarUrl(),
        { archivo },
        {
          Authorization: `Bearer ${defaultToken()}`,
          'Content-Type': 'application/json',
        },
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
