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
  onScenarioRetry?: (context: {
    scenario: Scenario;
    attempt: number;
    maxRetries: number;
  }) => void;
}

export interface RunOptions {
  retries?: number;
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
  options: RunOptions = {},
): Promise<RunSummary> {
  const filtered = applyFilter(scenarios, filter);
  const startedAt = new Date().toISOString();
  const globalStart = Date.now();
  const maxRetries = options.retries ?? 0;

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

    let finalResult: ScenarioResult | null = null;
    let retriesUsed = 0;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (attempt > 0) {
        retriesUsed = attempt;
        hooks.onScenarioRetry?.({ scenario, attempt, maxRetries });
      }

      try {
        const result = await scenario.run();
        finalResult = result;
        if (result.passed) break;
      } catch (unexpectedErr) {
        // El run() debería capturar sus propios errores; esto es seguridad extra
        finalResult = {
          scenarioId: scenario.id,
          scenarioName: scenario.name,
          module: scenario.module,
          tags: scenario.tags,
          passed: false,
          actual: {
            localError: `Error inesperado en runner: ${unexpectedErr instanceof Error ? unexpectedErr.message : String(unexpectedErr)}`,
            durationMs: 0,
          },
          expected: { success: true },
          failures: ['El runner capturó una excepción no manejada'],
        };
      }
    }

    finalResult!.retriesUsed = retriesUsed;
    results.push(finalResult!);
    hooks.onScenarioResult?.({
      scenario,
      result: finalResult!,
      index: position,
      total: filtered.length,
    });
  }

  return {
    results,
    skipped,
    startedAt,
    finishedAt: new Date().toISOString(),
    durationMs: Date.now() - globalStart,
  };
}
