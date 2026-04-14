/**
 * Genera los archivos de prueba reutilizables para los escenarios QA.
 * Ejecutar antes de correr la suite: npm run qa:fixtures
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

function write(filePath: string, label: string, content: Buffer | string): void {
  if (fs.existsSync(filePath)) {
    logger.info(`Ya existe: ${label}`, 2);
    return;
  }
  fs.writeFileSync(filePath, content);
  logger.ok(`Creado: ${label}`, 2);
}

export function generateFixtures(): void {
  fs.mkdirSync(fixturesPaths.dir, { recursive: true });
  logger.section('Generando fixtures QA');

  // ─── PDFs ─────────────────────────────────────────────────────────────────
  write(fixturesPaths.validPdf, 'valid.pdf', MINIMAL_PDF);

  // valid-1mb.pdf: PDF base + padding de 1 MB
  if (!fs.existsSync(fixturesPaths.validPdf1mb)) {
    const padding = Buffer.alloc(1024 * 1024, 0x20);
    fs.writeFileSync(fixturesPaths.validPdf1mb, MINIMAL_PDF + '\n' + padding.toString('ascii'));
    logger.ok('Creado: valid-1mb.pdf', 2);
  } else {
    logger.info('Ya existe: valid-1mb.pdf', 2);
  }

  // valid-20mb.pdf: PDF base + padding de 20 MB
  if (!fs.existsSync(fixturesPaths.validPdf20mb)) {
    const padding = Buffer.alloc(20 * 1024 * 1024, 0x20);
    fs.writeFileSync(fixturesPaths.validPdf20mb, MINIMAL_PDF + '\n' + padding.toString('ascii'));
    logger.ok('Creado: valid-20mb.pdf', 2);
  } else {
    logger.info('Ya existe: valid-20mb.pdf', 2);
  }

  write(fixturesPaths.emptyPdf, 'empty.pdf', '');

  // corrupted.pdf: bytes inválidos con extensión .pdf
  write(
    fixturesPaths.corruptedPdf,
    'corrupted.pdf',
    Buffer.from([0xff, 0xfe, 0x00, 0x01, 0xab, 0xcd, 0xef, 0x00]),
  );

  // ─── Tipos no soportados ─────────────────────────────────────────────────
  write(fixturesPaths.txtFile, 'document.txt', 'Archivo de texto plano — tipo no soportado en aprobador.');

  // document.docx: magic bytes ZIP (DOCX es ZIP internamente)
  write(fixturesPaths.docxFile, 'document.docx', Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]));

  // image.png: firma PNG + datos mínimos
  write(
    fixturesPaths.pngFile,
    'image.png',
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  );

  // ─── JSON ─────────────────────────────────────────────────────────────────
  write(
    fixturesPaths.validJson,
    'valid.json',
    JSON.stringify(
      { documento: 'Notificación QA', fecha: new Date().toISOString(), version: 1 },
      null,
      2,
    ),
  );

  // ─── Criptografía ─────────────────────────────────────────────────────────
  write(
    fixturesPaths.invalidPem,
    'invalid-key.pem',
    '-----BEGIN PUBLIC KEY-----\nESTALLAVEESINVALIDA1234567890ABCDEFGH\n-----END PUBLIC KEY-----\n',
  );

  logger.done(`Fixtures en: ${fixturesPaths.dir}`);
}

// Invocación directa: npm run qa:fixtures
if (require.main === module) {
  generateFixtures();
}
