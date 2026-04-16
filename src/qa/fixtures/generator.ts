/**
 * Genera los archivos de prueba reutilizables para los escenarios QA.
 * Ejecutar antes de correr la suite: npm run qa:fixtures
 *
 * Permite sobreescribir cualquier fixture con una ruta personalizada por env:
 * QA_FIXTURE_VALID_PDF_PATH, QA_FIXTURE_SIGNED_PDF_PATH, QA_FIXTURE_VALID_PDF_1MB_PATH,
 * QA_FIXTURE_VALID_PDF_20MB_PATH, QA_FIXTURE_EMPTY_PDF_PATH, QA_FIXTURE_CORRUPTED_PDF_PATH,
 * QA_FIXTURE_TXT_PATH, QA_FIXTURE_DOCX_PATH, QA_FIXTURE_PNG_PATH,
 * QA_FIXTURE_VALID_JSON_PATH, QA_FIXTURE_INVALID_PEM_PATH.
 */
import fs from 'fs';
import { fixturesPaths } from './paths';
import { logger } from '../../utils/logger.util';

// PDF mínimo válido (~300 bytes)
const MINIMAL_PDF = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]>>endobj
xref
0 4
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
trailer<</Size 4/Root 1 0 R>>
startxref
190
%%EOF`;

const SIGNED_PDF = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R/AcroForm 6 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Annots[4 0 R]>>endobj
4 0 obj<</Type/Annot/Subtype/Widget/FT/Sig/T(Signature1)/Rect[0 0 0 0]/V 5 0 R/P 3 0 R>>endobj
5 0 obj<</Type/Sig/Filter/Adobe.PPKLite/SubFilter/adbe.pkcs7.detached/Name(Test QA)>>endobj
6 0 obj<</Fields[4 0 R]/SigFlags 3>>endobj
xref
0 7
0000000000 65535 f
0000000009 00000 n
0000000075 00000 n
0000000132 00000 n
0000000222 00000 n
0000000318 00000 n
0000000428 00000 n
trailer<</Size 7/Root 1 0 R>>
startxref
478
%%EOF`;

function write(filePath: string, label: string, content: Buffer | string): void {
  if (fs.existsSync(filePath)) {
    logger.info(`Ya existe: ${label}`, 2);
    return;
  }
  fs.writeFileSync(filePath, content);
  logger.ok(`Creado: ${label}`, 2);
}

function copyFixtureIfConfigured(filePath: string, label: string, envVar: string): boolean {
  const sourcePath = process.env[envVar];
  if (!sourcePath) return false;

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`La variable ${envVar} apunta a un archivo inexistente: ${sourcePath}`);
  }

  fs.copyFileSync(sourcePath, filePath);
  logger.ok(`Copiado desde ${envVar}: ${label}`, 2);
  return true;
}

function writeOrCopy(
  filePath: string,
  label: string,
  content: Buffer | string,
  envVar: string,
): void {
  if (copyFixtureIfConfigured(filePath, label, envVar)) return;
  write(filePath, label, content);
}

export function generateFixtures(): void {
  fs.mkdirSync(fixturesPaths.dir, { recursive: true });
  logger.section('Generando fixtures QA');

  // ─── PDFs ─────────────────────────────────────────────────────────────────
  writeOrCopy(fixturesPaths.validPdf, 'valid.pdf', MINIMAL_PDF, 'QA_FIXTURE_VALID_PDF_PATH');
  writeOrCopy(fixturesPaths.signedPdf, 'signed.pdf', SIGNED_PDF, 'QA_FIXTURE_SIGNED_PDF_PATH');

  // valid-1mb.pdf: PDF base + padding de 1 MB
  if (!copyFixtureIfConfigured(fixturesPaths.validPdf1mb, 'valid-1mb.pdf', 'QA_FIXTURE_VALID_PDF_1MB_PATH')) {
    if (!fs.existsSync(fixturesPaths.validPdf1mb)) {
      const padding = Buffer.alloc(1024 * 1024, 0x20);
      fs.writeFileSync(fixturesPaths.validPdf1mb, MINIMAL_PDF + '\n' + padding.toString('ascii'));
      logger.ok('Creado: valid-1mb.pdf', 2);
    } else {
      logger.info('Ya existe: valid-1mb.pdf', 2);
    }
  }

  // valid-20mb.pdf: PDF base + padding de 20 MB
  if (!copyFixtureIfConfigured(fixturesPaths.validPdf20mb, 'valid-20mb.pdf', 'QA_FIXTURE_VALID_PDF_20MB_PATH')) {
    if (!fs.existsSync(fixturesPaths.validPdf20mb)) {
      const padding = Buffer.alloc(20 * 1024 * 1024, 0x20);
      fs.writeFileSync(fixturesPaths.validPdf20mb, MINIMAL_PDF + '\n' + padding.toString('ascii'));
      logger.ok('Creado: valid-20mb.pdf', 2);
    } else {
      logger.info('Ya existe: valid-20mb.pdf', 2);
    }
  }

  writeOrCopy(fixturesPaths.emptyPdf, 'empty.pdf', '', 'QA_FIXTURE_EMPTY_PDF_PATH');

  // corrupted.pdf: bytes inválidos con extensión .pdf
  writeOrCopy(
    fixturesPaths.corruptedPdf,
    'corrupted.pdf',
    Buffer.from([0xff, 0xfe, 0x00, 0x01, 0xab, 0xcd, 0xef, 0x00]),
    'QA_FIXTURE_CORRUPTED_PDF_PATH',
  );

  // ─── Tipos no soportados ─────────────────────────────────────────────────
  writeOrCopy(
    fixturesPaths.txtFile,
    'document.txt',
    'Archivo de texto plano — tipo no soportado en aprobador.',
    'QA_FIXTURE_TXT_PATH',
  );

  // document.docx: magic bytes ZIP (DOCX es ZIP internamente)
  writeOrCopy(
    fixturesPaths.docxFile,
    'document.docx',
    Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]),
    'QA_FIXTURE_DOCX_PATH',
  );

  // image.png: firma PNG + datos mínimos
  writeOrCopy(
    fixturesPaths.pngFile,
    'image.png',
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    'QA_FIXTURE_PNG_PATH',
  );

  // ─── JSON ─────────────────────────────────────────────────────────────────
  writeOrCopy(
    fixturesPaths.validJson,
    'valid.json',
    JSON.stringify(
      { documento: 'Notificación QA', fecha: new Date().toISOString(), version: 1 },
      null,
      2,
    ),
    'QA_FIXTURE_VALID_JSON_PATH',
  );

  // ─── Criptografía ─────────────────────────────────────────────────────────
  writeOrCopy(
    fixturesPaths.invalidPem,
    'invalid-key.pem',
    '-----BEGIN PUBLIC KEY-----\nESTALLAVEESINVALIDA1234567890ABCDEFGH\n-----END PUBLIC KEY-----\n',
    'QA_FIXTURE_INVALID_PEM_PATH',
  );

  logger.done(`Fixtures en: ${fixturesPaths.dir}`);
}

// Invocación directa: npm run qa:fixtures
if (require.main === module) {
  generateFixtures();
}
