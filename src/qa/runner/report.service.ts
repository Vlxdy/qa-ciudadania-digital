import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import type { ScenarioResult } from '../types/scenario.types';
import type { Scenario } from '../types/scenario.types';

export interface RunSummary {
  results: ScenarioResult[];
  skipped: Array<{ id: string; name: string; reason: string }>;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
}

let lastLiveModule: string | null = null;

export function resetLiveProgress(): void {
  lastLiveModule = null;
}

export function printScenarioStartLive(
  scenario: Scenario,
  position: number,
  total: number,
): void {
  if (scenario.module !== lastLiveModule) {
    lastLiveModule = scenario.module;
    console.log('');
    console.log(chalk.magenta.bold(`▸ ${scenario.module.toUpperCase()}`));
  }

  const prefix = chalk.cyan(`[${position}/${total}]`);
  console.log(`  ${prefix} ${chalk.white(`${scenario.id} — ${scenario.name}`)}`);
}

export function printScenarioSkippedLive(
  scenario: Scenario,
  reason: string,
): void {
  console.log(
    `     ${chalk.yellow('⊘')} ${chalk.yellow(`${scenario.id} omitido`)} ${chalk.gray(`(${reason})`)}`,
  );
}

export function printScenarioResultLive(result: ScenarioResult): void {
  const dur = chalk.gray(`(${result.actual.durationMs}ms)`);
  if (result.passed) {
    console.log(`     ${chalk.green.bold('✔')} ${chalk.green('OK')} ${dur}`);
    return;
  }

  console.log(`     ${chalk.red.bold('✖')} ${chalk.red('FAIL')} ${dur}`);
  for (const failure of result.failures) {
    console.log(`       ${chalk.red('└─')} ${chalk.red(failure)}`);
  }
  if (result.actual.localError) {
    console.log(`       ${chalk.gray('error:')} ${chalk.gray(result.actual.localError.slice(0, 120))}`);
  }
  if (result.actual.httpStatus) {
    console.log(`       ${chalk.gray('http:')} ${chalk.gray(String(result.actual.httpStatus))}`);
  }
}

// ─── Consola ──────────────────────────────────────────────────────────────────

export function printReport(summary: RunSummary): void {
  const { results, skipped } = summary;
  const passed = results.filter((r) => r.passed);
  const failed = results.filter((r) => !r.passed);

  console.log('');
  console.log(chalk.cyan.bold('═'.repeat(60)));
  console.log(chalk.cyan.bold('  REPORTE QA'));
  console.log(chalk.cyan.bold('═'.repeat(60)));

  // Agrupar por módulo
  const byModule = new Map<string, ScenarioResult[]>();
  for (const r of results) {
    if (!byModule.has(r.module)) byModule.set(r.module, []);
    byModule.get(r.module)!.push(r);
  }

  for (const [mod, modResults] of byModule) {
    console.log('');
    console.log(chalk.magenta.bold(`  ▸ ${mod.toUpperCase()}`));
    for (const r of modResults) {
      const dur = chalk.gray(`(${r.actual.durationMs}ms)`);
      if (r.passed) {
        console.log(`    ${chalk.green.bold('✔')}  ${chalk.green(r.scenarioId)}  ${r.scenarioName} ${dur}`);
      } else {
        console.log(`    ${chalk.red.bold('✖')}  ${chalk.red(r.scenarioId)}  ${r.scenarioName} ${dur}`);
        for (const f of r.failures) {
          console.log(`       ${chalk.red('└─')} ${chalk.red(f)}`);
        }
        if (r.actual.localError) {
          console.log(`       ${chalk.gray('error:')} ${chalk.gray(r.actual.localError.slice(0, 120))}`);
        }
        if (r.actual.httpStatus) {
          console.log(`       ${chalk.gray('http:')} ${chalk.gray(String(r.actual.httpStatus))}`);
        }
      }
    }
  }

  // Skipped
  if (skipped.length > 0) {
    console.log('');
    console.log(chalk.magenta.bold('  ▸ OMITIDOS'));
    for (const s of skipped) {
      console.log(`    ${chalk.yellow('⊘')}  ${chalk.yellow(s.id)}  ${s.name}  ${chalk.gray(s.reason)}`);
    }
  }

  // Resumen
  console.log('');
  console.log(chalk.cyan.bold('─'.repeat(60)));
  const totalLabel = chalk.white(`Total: ${results.length}`);
  const passedLabel = chalk.green(`Pasados: ${passed.length}`);
  const failedLabel = failed.length > 0
    ? chalk.red.bold(`Fallidos: ${failed.length}`)
    : chalk.green(`Fallidos: 0`);
  const skippedLabel = chalk.yellow(`Omitidos: ${skipped.length}`);
  const durLabel = chalk.gray(`${summary.durationMs}ms`);
  console.log(`  ${totalLabel}   ${passedLabel}   ${failedLabel}   ${skippedLabel}   ${durLabel}`);
  console.log(chalk.cyan.bold('─'.repeat(60)));
  console.log('');
}

// ─── JSON en disco ────────────────────────────────────────────────────────────

export function saveReport(summary: RunSummary): string {
  const dir = path.resolve('./output/qa/reports');
  fs.mkdirSync(dir, { recursive: true });

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(dir, `qa-report-${ts}.json`);

  fs.writeFileSync(filePath, JSON.stringify(summary, null, 2));
  return filePath;
}

function shellEscapeSingle(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function writeCurlForResult(baseDir: string, result: ScenarioResult): void {
  const request = result.actual.request;

  // Sin request (p.ej. error local antes de construir el body): guardar script de documentación
  if (!request) {
    const scenarioDir = path.join(baseDir, result.module, result.scenarioId);
    fs.mkdirSync(scenarioDir, { recursive: true });

    const errorLine = result.actual.localError
      ? `# Error local: ${result.actual.localError.slice(0, 200)}`
      : '# (sin error local registrado)';

    const curlScript = [
      '#!/usr/bin/env bash',
      `# ${result.scenarioId} — ${result.scenarioName}`,
      '# Este escenario produjo un error local antes de enviar la petición HTTP.',
      errorLine,
      '',
    ].join('\n');

    fs.writeFileSync(path.join(scenarioDir, 'request.sh'), curlScript);

    const responseSnapshot = {
      savedAt: new Date().toISOString(),
      scenario: { id: result.scenarioId, name: result.scenarioName, module: result.module, tags: result.tags },
      passed: result.passed,
      failures: result.failures,
      response: { localError: result.actual.localError, durationMs: result.actual.durationMs },
    };
    fs.writeFileSync(path.join(scenarioDir, 'response.json'), `${JSON.stringify(responseSnapshot, null, 2)}\n`);
    return;
  }

  const scenarioDir = path.join(baseDir, result.module, result.scenarioId);
  fs.mkdirSync(scenarioDir, { recursive: true });

  let curlScript: string;

  if (request.method === 'GET') {
    // Authorization endpoint: petición GET con todos los parámetros ya en la URL
    curlScript = [
      '#!/usr/bin/env bash',
      `# ${result.scenarioId} — ${result.scenarioName}`,
      `curl \\`,
      `  ${shellEscapeSingle(request.url)}`,
      '',
    ].join('\n');
  } else {
    const headers = Object.entries(request.headers)
      .map(([k, v]) => `  -H ${shellEscapeSingle(`${k}: ${v}`)} \\`)
      .join('\n');
    const requestBody = request.body ?? {};
    const bodyJson = JSON.stringify(requestBody, null, 2);
    const shouldSplitBody = bodyJson.length > 350;

    let dataPart = '';
    if (request.encoding === 'json') {
      if (shouldSplitBody) {
        fs.writeFileSync(path.join(scenarioDir, 'data.json'), `${bodyJson}\n`);
        dataPart = '  --data @data.json';
      } else {
        dataPart = `  --data ${shellEscapeSingle(bodyJson)}`;
      }
    } else {
      const formPairs = Object.entries(requestBody as Record<string, unknown>)
        .map(([k, v]) => `  --data-urlencode ${shellEscapeSingle(`${k}=${String(v)}`)} \\`)
        .join('\n');
      dataPart = formPairs.slice(0, -2);
    }

    curlScript = [
      '#!/usr/bin/env bash',
      `# ${result.scenarioId} — ${result.scenarioName}`,
      `curl -X ${request.method} \\`,
      `  ${shellEscapeSingle(request.url)} \\`,
      headers,
      dataPart,
      '',
    ].filter(Boolean).join('\n');
  }

  fs.writeFileSync(path.join(scenarioDir, 'request.sh'), curlScript);

  const responseSnapshot = {
    savedAt: new Date().toISOString(),
    scenario: {
      id: result.scenarioId,
      name: result.scenarioName,
      module: result.module,
      tags: result.tags,
    },
    passed: result.passed,
    failures: result.failures,
    response: {
      httpStatus: result.actual.httpStatus,
      body: result.actual.body,
      localError: result.actual.localError,
      durationMs: result.actual.durationMs,
    },
  };
  fs.writeFileSync(
    path.join(scenarioDir, 'response.json'),
    `${JSON.stringify(responseSnapshot, null, 2)}\n`,
  );
}

/**
 * Guarda artefactos curl por escenario ejecutado.
 * Estructura: output/qa/curls/<modulo>/<escenario>/request.sh y data.json (si aplica).
 */
export function saveCurlArtifacts(summary: RunSummary): string {
  const rootDir = path.resolve('./output/qa/curls');
  fs.mkdirSync(rootDir, { recursive: true });
  const runTs = new Date().toISOString().replace(/[:.]/g, '-');
  const dir = path.join(rootDir, `run-${runTs}`);
  fs.mkdirSync(dir, { recursive: true });

  for (const result of summary.results) {
    writeCurlForResult(dir, result);
  }
  return dir;
}
