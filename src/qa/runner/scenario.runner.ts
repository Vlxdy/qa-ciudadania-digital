import type { Scenario, ScenarioResult } from '../types/scenario.types';
import type { RunSummary } from './report.service';

export interface ScenarioFilter {
  module?: string;
  tag?: string;
  id?: string;
}

export interface ScenarioRunHooks {
  onScenarioStart?: (context: {
    scenario: Scenario;
    index: number;
    total: number;
  }) => void;
  onScenarioResult?: (context: {
    scenario: Scenario;
    result: ScenarioResult;
    index: number;
    total: number;
  }) => void;
  onScenarioSkipped?: (context: {
    scenario: Scenario;
    index: number;
    total: number;
    reason: string;
  }) => void;
}

function applyFilter(scenarios: Scenario[], filter: ScenarioFilter): Scenario[] {
  return scenarios.filter((s) => {
    if (filter.module && s.module !== filter.module) return false;
    if (filter.tag && !s.tags.includes(filter.tag)) return false;
    if (filter.id && s.id !== filter.id) return false;
    return true;
  });
}

/**
 * Ejecuta escenarios secuencialmente y retorna el resumen completo.
 * Los escenarios con skip:true se registran como omitidos sin ejecutar run().
 */
export async function runScenarios(
  scenarios: Scenario[],
  filter: ScenarioFilter = {},
  hooks: ScenarioRunHooks = {},
): Promise<RunSummary> {
  const filtered = applyFilter(scenarios, filter);
  const startedAt = new Date().toISOString();
  const globalStart = Date.now();

  const results: ScenarioResult[] = [];
  const skipped: RunSummary['skipped'] = [];

  for (const [index, scenario] of filtered.entries()) {
    const position = index + 1;

    hooks.onScenarioStart?.({
      scenario,
      index: position,
      total: filtered.length,
    });

    if (scenario.skip) {
      skipped.push({ id: scenario.id, name: scenario.name, reason: 'skip: true' });
      hooks.onScenarioSkipped?.({
        scenario,
        index: position,
        total: filtered.length,
        reason: 'skip: true',
      });
      continue;
    }

    try {
      const result = await scenario.run();
      results.push(result);
      hooks.onScenarioResult?.({
        scenario,
        result,
        index: position,
        total: filtered.length,
      });
    } catch (unexpectedErr) {
      // El run() debería capturar sus propios errores; esto es seguridad extra
      const result: ScenarioResult = {
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        module: scenario.module,
        tags: scenario.tags,
        passed: false,
        actual: {
          localError: `Error inesperado en runner: ${unexpectedErr instanceof Error ? unexpectedErr.message : String(unexpectedErr)}`,
          durationMs: 0,
        },
        expected: scenario.run.toString().includes('expected') ? {} as any : { success: true },
        failures: ['El runner capturó una excepción no manejada'],
      };
      results.push(result);
      hooks.onScenarioResult?.({
        scenario,
        result,
        index: position,
        total: filtered.length,
      });
    }
  }

  return {
    results,
    skipped,
    startedAt,
    finishedAt: new Date().toISOString(),
    durationMs: Date.now() - globalStart,
  };
}
