import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import type { ScenarioResult } from '../types/scenario.types';

export interface RunSummary {
  results: ScenarioResult[];
  skipped: Array<{ id: string; name: string; reason: string }>;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
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
