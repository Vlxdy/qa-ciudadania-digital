/**
 * noti-01 — Happy Path: notificación válida completa
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { buildValidBody, notificadorUrl, defaultToken } from './helpers';

const META = {
  id: 'noti-01',
  name: 'Happy Path — notificación válida',
  module: 'notificador' as const,
  tags: ['happy', 'auth'],
};

const EXPECTED = {
  success: true,
  httpStatus: 200,
};

export const scenario: Scenario = {
  ...META,
  description: 'Notificación válida con token correcto debe retornar 200.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const body = buildValidBody();
      const response = await qaPost(notificadorUrl(), body, {
        Authorization: `Bearer ${defaultToken()}`,
        'Content-Type': 'application/json',
      });
      return makeResult(META, response, EXPECTED);
    } catch (err) {
      return makeResult(META, {
        localError: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - start,
      }, EXPECTED);
    }
  },
};
