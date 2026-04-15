/**
 * Utilidades de archivo para el runner QA.
 * Copia independiente de src/aprobador/services/file.service.ts
 */
import fs from 'fs';
import path from 'path';

export class QaFileService {
  static readFileRaw(filePath: string): Buffer {
    return fs.readFileSync(filePath);
  }

  static detectTipoDocumento(filePath: string): 'PDF' | 'JSON' {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.pdf') return 'PDF';
    if (ext === '.json') return 'JSON';
    throw new Error('Tipo de archivo no soportado');
  }
}
