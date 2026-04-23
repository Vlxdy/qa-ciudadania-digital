/**
 * CLI del runner QA
 *
 * Uso:
 *   npm run qa                               — todos los escenarios
 *                                             + guarda cURL/response por prueba en output/qa/curls/run-<fecha>/
 *   npm run qa -- --module=aprobador         — solo un módulo
 *   npm run qa -- --tag=negative             — por tag
 *   npm run qa -- --id=apro-03               — escenario específico
 *   npm run qa -- --module=aprobador --tag=auth
 *   npm run qa:fixtures                      — genera archivos de prueba
 */
import { generateFixtures } from './fixtures/generator';
import { proveedorScenarios } from './scenarios/proveedor';
import { aprobadorScenarios } from './scenarios/aprobador';
import { notificadorScenarios } from './scenarios/notificador';
import { avisosScenarios } from './scenarios/avisos';
import { qrSeguroScenarios } from './scenarios/qr-seguro';
import { documentosDigitalesScenarios } from './scenarios/documentos-digitales';
import { runScenarios } from './runner/scenario.runner';
import {
  printDryRun,
  printReport,
  printScenarioResultLive,
  printScenarioRetryLive,
  printScenarioSkippedLive,
  printScenarioStartLive,
  resetLiveProgress,
  saveCurlArtifacts,
  saveReport,
} from './runner/report.service';
import { missingVars } from './config/qa-env';
import { logger } from '../utils/logger.util';
import type { Scenario } from './types/scenario.types';

// ─── Parsear args ─────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

function arg(name: string): string | undefined {
  return args.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
}

const moduleFilter = arg('module');
const tagFilter = arg('tag');
const idFilter = arg('id');
const saveJson = args.includes('--save') || args.includes('--json');
const onlyFixtures = args.includes('--fixtures');
const dryRun = args.includes('--dry-run');
const retryCount = Math.max(0, parseInt(arg('retry') ?? '0', 10));
const showHelp = args.includes('--help') || args.includes('-h');

if (showHelp) {
  console.log(`
  npm run qa [opciones]

  Opciones:
    --module=<nombre>   Filtrar por módulo: proveedor | aprobador | notificador | avisos | qr-seguro | documentos-digitales
    --tag=<tag>         Filtrar por tag: happy | negative | auth | obligatorio-legal | obligatorio-requerimiento | ...
    --id=<id>           Ejecutar un escenario específico: prov-01, apro-03, noti-07, obl-req-00, etc.
    --dry-run           Listar qué escenarios correrían sin ejecutarlos
    --retry=<n>         Reintentar escenarios fallidos hasta N veces (ej. --retry=2)
    --save              Guardar reporte JSON en output/qa/reports/
    (Siempre)           Guardar cURL + response en output/qa/curls/run-<fecha>/<modulo>/<id>/
    --fixtures          Solo generar archivos de prueba y salir
    --help              Mostrar esta ayuda

  Subcomandos por grupo de carácter:
    npm run qa:obl-legal            Aceptación + happy path obligatorio legal
    npm run qa:obl-req              Aceptación + happy path obligatorio requerimiento

  Ejemplos:
    npm run qa
    npm run qa -- --module=aprobador
    npm run qa -- --tag=negative
    npm run qa -- --id=apro-03
    npm run qa -- --module=notificador --tag=validation
    npm run qa:obl-req
    npm run qa:fixtures
  `);
  process.exit(0);
}

// ─── Solo fixtures ────────────────────────────────────────────────────────────

if (onlyFixtures) {
  generateFixtures();
  process.exit(0);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Advertencia si faltan vars por módulo
  const modulos: Array<'proveedor' | 'aprobador' | 'notificador' | 'avisos' | 'qr-seguro' | 'documentos-digitales'> = [
    'proveedor',
    'aprobador',
    'notificador',
    'avisos',
    'qr-seguro',
    'documentos-digitales',
  ];

  for (const mod of modulos) {
    if (moduleFilter && moduleFilter !== mod) continue;
    const missing = missingVars(mod);
    if (missing.length > 0) {
      logger.warn(`Módulo ${mod.toUpperCase()}: faltan vars de entorno → ${missing.join(', ')}`);
      logger.warn('Los escenarios HTTP de ese módulo probablemente fallen con error de red.', 3);
    }
  }

  // Agregar todos los escenarios
  const allScenarios: Scenario[] = [
    ...proveedorScenarios,
    ...aprobadorScenarios,
    ...notificadorScenarios,
    ...avisosScenarios,
    ...qrSeguroScenarios,
    ...documentosDigitalesScenarios,
  ];

  const filterFn = (s: Scenario) => {
    if (moduleFilter && s.module !== moduleFilter) return false;
    if (tagFilter && !s.tags.includes(tagFilter)) return false;
    if (idFilter && s.id !== idFilter) return false;
    return true;
  };

  // Dry run: listar escenarios y salir sin ejecutar
  if (dryRun) {
    printDryRun(allScenarios.filter(filterFn));
    process.exit(0);
  }

  // Asegurarse de que los fixtures existan
  generateFixtures();

  // Banner
  const total = allScenarios.filter(filterFn).length;

  console.log('');
  logger.step(1, 1, `QA Runner — ${total} escenario(s) a ejecutar`);

  if (moduleFilter) logger.info(`Módulo: ${moduleFilter}`);
  if (tagFilter) logger.info(`Tag: ${tagFilter}`);
  if (idFilter) logger.info(`ID: ${idFilter}`);
  if (retryCount > 0) logger.info(`Reintentos: ${retryCount} por escenario fallido`);

  // Ejecutar
  resetLiveProgress();
  const summary = await runScenarios(
    allScenarios,
    { module: moduleFilter, tag: tagFilter, id: idFilter },
    {
      onScenarioStart: ({ scenario, index, total }) => {
        printScenarioStartLive(scenario, index, total);
      },
      onScenarioResult: ({ result }) => {
        printScenarioResultLive(result);
      },
      onScenarioSkipped: ({ scenario, reason }) => {
        printScenarioSkippedLive(scenario, reason);
      },
      onScenarioRetry: ({ attempt, maxRetries }) => {
        printScenarioRetryLive(attempt, maxRetries);
      },
    },
    { retries: retryCount },
  );

  // Reporte en consola
  printReport(summary);
  const curlDir = saveCurlArtifacts(summary);
  logger.ok(`CURLs QA guardados en: ${curlDir}`);

  // Reporte JSON opcional
  if (saveJson) {
    const reportPath = saveReport(summary);
    logger.ok(`Reporte guardado en: ${reportPath}`);
  }

  // Exit code: 1 si hay fallidos
  const failedCount = summary.results.filter((r) => !r.passed).length;
  process.exit(failedCount > 0 ? 1 : 0);
}

main().catch((err) => {
  logger.error('Error inesperado en el runner QA', err, 0);
  process.exit(1);
});
