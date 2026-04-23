import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import type { ScenarioResult } from '../types/scenario.types';
import type { Scenario } from '../types/scenario.types';
import { getLoginSessionSnapshot } from '../scenarios/proveedor/services/session.store';
import { getMobileLoginSessionSnapshot } from '../scenarios/proveedor/services/mobile-session.store';

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

export function printScenarioRetryLive(attempt: number, maxRetries: number): void {
  console.log(
    `     ${chalk.yellow('↺')} ${chalk.yellow(`reintento ${attempt}/${maxRetries}...`)}`,
  );
}

export function printScenarioResultLive(result: ScenarioResult): void {
  const dur = chalk.gray(`(${result.actual.durationMs}ms)`);
  const retryLabel = result.retriesUsed ? chalk.yellow(` [${result.retriesUsed} reint.]`) : '';
  if (result.passed) {
    console.log(`     ${chalk.green.bold('✔')} ${chalk.green('OK')} ${dur}${retryLabel}`);
    return;
  }

  console.log(`     ${chalk.red.bold('✖')} ${chalk.red('FAIL')} ${dur}${retryLabel}`);
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

// ─── Dry run ──────────────────────────────────────────────────────────────────

export function printDryRun(scenarios: Scenario[]): void {
  const byModule = new Map<string, Scenario[]>();
  for (const s of scenarios) {
    if (!byModule.has(s.module)) byModule.set(s.module, []);
    byModule.get(s.module)!.push(s);
  }

  const uniqueTags = [...new Set(scenarios.flatMap((s) => s.tags))].sort();

  console.log('');
  console.log(chalk.cyan.bold('═'.repeat(66)));
  console.log(
    chalk.cyan.bold(`  DRY RUN`) +
    chalk.white(` — ${scenarios.length} escenario(s) en ${byModule.size} módulo(s)`) +
    chalk.gray('  (sin ejecutar)'),
  );
  console.log(chalk.cyan.bold('═'.repeat(66)));

  for (const [mod, modScenarios] of byModule) {
    console.log('');
    console.log(
      chalk.magenta.bold(`  ▸ ${mod.toUpperCase()}`) +
      chalk.gray(` — ${modScenarios.length} escenarios`),
    );
    for (const s of modScenarios) {
      const skipLabel = s.skip ? chalk.yellow(' (skip)') : '';
      const tags = chalk.gray(`[${s.tags.join(', ')}]`);
      console.log(`    ${chalk.white(s.id.padEnd(18))}  ${s.name}${skipLabel}  ${tags}`);
    }
  }

  console.log('');
  console.log(chalk.cyan.bold('─'.repeat(66)));
  console.log(
    `  ${chalk.white(`Total: ${scenarios.length}`)}` +
    `   ${chalk.magenta(`Módulos: ${byModule.size}`)}` +
    `   ${chalk.gray(`Tags: ${uniqueTags.join(', ')}`)}`,
  );
  console.log(chalk.cyan.bold('─'.repeat(66)));
  console.log('');
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(ms: number): string {
  if (ms >= 60_000) return `${(ms / 60_000).toFixed(1)}min`;
  if (ms >= 1_000) return `${(ms / 1_000).toFixed(2)}s`;
  return `${ms}ms`;
}

function pctColor(pct: number, hasFailed: boolean): string {
  const label = `${pct}%`;
  if (!hasFailed) return chalk.green(label);
  if (pct >= 80) return chalk.yellow(label);
  return chalk.red(label);
}

// ─── Consola ──────────────────────────────────────────────────────────────────

export function printReport(summary: RunSummary): void {
  const { results, skipped } = summary;
  const passed = results.filter((r) => r.passed);
  const failed = results.filter((r) => !r.passed);

  console.log('');
  console.log(chalk.cyan.bold('═'.repeat(66)));
  console.log(chalk.cyan.bold('  REPORTE QA'));
  console.log(chalk.cyan.bold('═'.repeat(66)));

  // Agrupar por módulo
  const byModule = new Map<string, ScenarioResult[]>();
  for (const r of results) {
    if (!byModule.has(r.module)) byModule.set(r.module, []);
    byModule.get(r.module)!.push(r);
  }

  for (const [mod, modResults] of byModule) {
    const modPassed = modResults.filter((r) => r.passed).length;
    const modFailed = modResults.filter((r) => !r.passed).length;
    const modTotal = modResults.length;
    const modPct = Math.round((modPassed / modTotal) * 100);
    const modDur = modResults.reduce((acc, r) => acc + r.actual.durationMs, 0);

    const passLabel = chalk.green(`${modPassed} ✔`);
    const failLabel = modFailed > 0 ? chalk.red(`${modFailed} ✖`) : chalk.gray(`0 ✖`);
    const pctLabel = pctColor(modPct, modFailed > 0);
    const durLabel = chalk.gray(`(${formatDuration(modDur)})`);

    console.log('');
    console.log(
      chalk.magenta.bold(`  ▸ ${mod.toUpperCase()}`) +
      chalk.gray(` — ${modTotal} escenarios`) +
      `  ${passLabel}  ${failLabel}  ${pctLabel}  ${durLabel}`,
    );

    for (const r of modResults) {
      const dur = chalk.gray(`(${r.actual.durationMs}ms)`);
      const retryLabel = r.retriesUsed ? chalk.yellow(` [${r.retriesUsed} reint.]`) : '';
      if (r.passed) {
        console.log(`    ${chalk.green.bold('✔')}  ${chalk.green(r.scenarioId)}  ${r.scenarioName} ${dur}${retryLabel}`);
      } else {
        console.log(`    ${chalk.red.bold('✖')}  ${chalk.red(r.scenarioId)}  ${r.scenarioName} ${dur}${retryLabel}`);
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

  // ── Tabla resumen por módulo ───────────────────────────────────────────────
  if (byModule.size > 1) {
    console.log('');
    console.log(chalk.cyan.bold('─'.repeat(66)));
    console.log(chalk.cyan.bold('  RESUMEN POR MÓDULO'));
    console.log(chalk.cyan.bold('─'.repeat(66)));

    const COL_MOD = 26;
    const header =
      '  ' +
      chalk.gray('Módulo'.padEnd(COL_MOD)) +
      chalk.gray('Total'.padStart(6)) +
      chalk.gray('Pasados'.padStart(9)) +
      chalk.gray('Fallidos'.padStart(10)) +
      chalk.gray('Tasa'.padStart(6)) +
      chalk.gray('Tiempo'.padStart(10));
    console.log(header);
    console.log(chalk.gray('  ' + '─'.repeat(64)));

    for (const [mod, modResults] of byModule) {
      const modPassed = modResults.filter((r) => r.passed).length;
      const modFailed = modResults.filter((r) => !r.passed).length;
      const modTotal = modResults.length;
      const modPct = Math.round((modPassed / modTotal) * 100);
      const modDur = modResults.reduce((acc, r) => acc + r.actual.durationMs, 0);

      const modLabel = mod.toUpperCase().padEnd(COL_MOD);
      const totalStr = String(modTotal).padStart(6);
      const passedStr = String(modPassed).padStart(9);
      const failedStr = String(modFailed).padStart(10);
      const pctStr = `${modPct}%`.padStart(6);
      const durStr = formatDuration(modDur).padStart(10);

      console.log(
        '  ' +
        chalk.magenta(modLabel) +
        chalk.white(totalStr) +
        chalk.green(passedStr) +
        (modFailed > 0 ? chalk.red(failedStr) : chalk.gray(failedStr)) +
        (modFailed > 0 ? chalk.yellow(pctStr) : chalk.green(pctStr)) +
        chalk.gray(durStr),
      );
    }
  }

  // ── Resultados por tag ────────────────────────────────────────────────────
  const tagMap = new Map<string, { passed: number; total: number }>();
  for (const r of results) {
    for (const tag of r.tags) {
      if (!tagMap.has(tag)) tagMap.set(tag, { passed: 0, total: 0 });
      const entry = tagMap.get(tag)!;
      entry.total++;
      if (r.passed) entry.passed++;
    }
  }

  if (tagMap.size > 0) {
    const sortedTags = [...tagMap.entries()].sort((a, b) => b[1].total - a[1].total);
    console.log('');
    console.log(chalk.cyan.bold('─'.repeat(66)));
    console.log(chalk.cyan.bold('  RESULTADOS POR TAG'));
    console.log(chalk.cyan.bold('─'.repeat(66)));

    const COL_TAG = 28;
    console.log(
      '  ' +
      chalk.gray('Tag'.padEnd(COL_TAG)) +
      chalk.gray('Total'.padStart(6)) +
      chalk.gray('Pasados'.padStart(9)) +
      chalk.gray('Fallidos'.padStart(10)) +
      chalk.gray('Tasa'.padStart(6)),
    );
    console.log(chalk.gray('  ' + '─'.repeat(56)));

    for (const [tag, stats] of sortedTags) {
      const tagFailed = stats.total - stats.passed;
      const tagPct = Math.round((stats.passed / stats.total) * 100);
      console.log(
        '  ' +
        chalk.white(tag.padEnd(COL_TAG)) +
        chalk.white(String(stats.total).padStart(6)) +
        chalk.green(String(stats.passed).padStart(9)) +
        (tagFailed > 0 ? chalk.red(String(tagFailed).padStart(10)) : chalk.gray(String(tagFailed).padStart(10))) +
        (tagFailed > 0 ? chalk.yellow(`${tagPct}%`.padStart(6)) : chalk.green(`${tagPct}%`.padStart(6))),
      );
    }
  }

  // ── Top 5 más lentos ──────────────────────────────────────────────────────
  if (results.length >= 3) {
    const slowest = [...results]
      .sort((a, b) => b.actual.durationMs - a.actual.durationMs)
      .slice(0, 5);

    console.log('');
    console.log(chalk.cyan.bold('─'.repeat(66)));
    console.log(chalk.cyan.bold('  TOP 5 MÁS LENTOS'));
    console.log(chalk.cyan.bold('─'.repeat(66)));
    for (let i = 0; i < slowest.length; i++) {
      const r = slowest[i];
      const icon = r.passed ? chalk.green('✔') : chalk.red('✖');
      const idLabel = r.passed ? chalk.green(r.scenarioId) : chalk.red(r.scenarioId);
      console.log(
        `  ${i + 1}. ${icon}  ${idLabel}  ${chalk.gray(`(${r.module})`)}  ${chalk.yellow(formatDuration(r.actual.durationMs))}`,
      );
    }
  }

  // ── Distribución de fallos ────────────────────────────────────────────────
  if (failed.length > 0) {
    const statusMap = new Map<string, number>();
    for (const r of failed) {
      const key = r.actual.localError
        ? 'error-local'
        : `HTTP ${r.actual.httpStatus ?? 'desconocido'}`;
      statusMap.set(key, (statusMap.get(key) ?? 0) + 1);
    }
    const sorted = [...statusMap.entries()].sort((a, b) => b[1] - a[1]);

    console.log('');
    console.log(chalk.cyan.bold('─'.repeat(66)));
    console.log(chalk.cyan.bold(`  DISTRIBUCIÓN DE FALLOS — ${failed.length} en total`));
    console.log(chalk.cyan.bold('─'.repeat(66)));
    for (const [label, count] of sorted) {
      const coloredLabel = label === 'error-local'
        ? chalk.yellow(label.padEnd(20))
        : chalk.red(label.padEnd(20));
      console.log(`  ${coloredLabel}  ${chalk.white(String(count))} escenario(s)`);
    }
  }

  // ── Resumen global ────────────────────────────────────────────────────────
  console.log('');
  console.log(chalk.cyan.bold('═'.repeat(66)));
  const globalPct = results.length > 0 ? Math.round((passed.length / results.length) * 100) : 0;
  const totalLabel = chalk.white(`Total: ${results.length}`);
  const passedLabel = chalk.green(`Pasados: ${passed.length}`);
  const failedLabel = failed.length > 0
    ? chalk.red.bold(`Fallidos: ${failed.length}`)
    : chalk.green(`Fallidos: 0`);
  const skippedLabel = chalk.yellow(`Omitidos: ${skipped.length}`);
  const durLabel = chalk.gray(formatDuration(summary.durationMs));
  const globalPctLabel = pctColor(globalPct, failed.length > 0);
  console.log(`  ${totalLabel}   ${passedLabel}   ${failedLabel}   ${skippedLabel}   ${durLabel}   ${globalPctLabel}`);
  console.log(chalk.cyan.bold('═'.repeat(66)));
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

    const loginSession = getLoginSessionSnapshot() ?? getMobileLoginSessionSnapshot();
    const responseSnapshot = {
      savedAt: new Date().toISOString(),
      scenario: { id: result.scenarioId, name: result.scenarioName, module: result.module, tags: result.tags },
      passed: result.passed,
      failures: result.failures,
      response: { localError: result.actual.localError, durationMs: result.actual.durationMs },
      ...(result.actual.context ? { context: result.actual.context } : {}),
      ...(loginSession ? { loginSession } : {}),
    };
    fs.writeFileSync(path.join(scenarioDir, 'response.json'), `${JSON.stringify(responseSnapshot, null, 2)}\n`);
    return;
  }

  const scenarioDir = path.join(baseDir, result.module, result.scenarioId);
  fs.mkdirSync(scenarioDir, { recursive: true });

  let curlScript: string;

  if (request.method === 'GET') {
    const headers = Object.entries(request.headers)
      .map(([k, v]) => `  -H ${shellEscapeSingle(`${k}: ${v}`)} \\`)
      .join('\n');

    curlScript = [
      '#!/usr/bin/env bash',
      `# ${result.scenarioId} — ${result.scenarioName}`,
      `curl -X GET \\`,
      `  ${shellEscapeSingle(request.url)} \\`,
      headers,
      '',
    ].filter(Boolean).join('\n');
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

  const loginSession = getLoginSessionSnapshot() ?? getMobileLoginSessionSnapshot();
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
    ...(result.actual.context ? { context: result.actual.context } : {}),
    ...(loginSession ? { loginSession } : {}),
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
