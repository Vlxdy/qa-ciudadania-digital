/**
 * apro-09 — Archivo .docx: tipo no soportado (error local)
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { FileService } from '../../../aprobador/services/file.service';
import { fixturesPaths } from '../../fixtures/paths';

const META = {
  id: 'apro-09',
  name: 'Archivo .docx — tipo no soportado',
  module: 'aprobador' as const,
  tags: ['negative', 'file-type', 'local'],
};

const EXPECTED = {
  success: false,
  errorMessage: 'Tipo de archivo no soportado',
};

export const scenario: Scenario = {
  ...META,
  description:
    'Intentar detectar el tipo de un .docx debe lanzar error local.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      FileService.detectTipoDocumento(fixturesPaths.docxFile);
      return makeResult(META, { durationMs: Date.now() - start }, EXPECTED);
    } catch (err) {
      return makeResult(META, {
        localError: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - start,
      }, EXPECTED);
    }
  },
};
