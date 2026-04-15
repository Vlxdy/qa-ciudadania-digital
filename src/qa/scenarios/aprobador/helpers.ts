/**
 * Helpers para escenarios del módulo aprobador.
 * Construye bodies de solicitud sin depender de src/config/env.ts.
 */
import fs from 'fs';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { qaEnv } from '../../config/qa-env';
import { fixturesPaths } from '../../fixtures/paths';

// ─── Hashing ──────────────────────────────────────────────────────────────────

function sha256Buffer(buf: Buffer): string {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function sha256Base64(b64: string): string {
  return crypto.createHash('sha256').update(Buffer.from(b64, 'utf-8')).digest('hex');
}

// ─── Builders ─────────────────────────────────────────────────────────────────

export interface SingleBodyOverrides {
  tipoDocumento?: string;
  accessToken?: string;
  hashDocumento?: string;
  documento?: string;
  idTramite?: string;
  hashMode?: 'BUFFER' | 'BASE64';
  descripcion?: string;
}

/**
 * Construye el body para POST /api/solicitudes (single).
 * Todos los campos tienen default razonable; sobreescribir para escenarios negativos.
 */
export function buildSingleBody(
  filePath: string,
  overrides: SingleBodyOverrides = {},
): Record<string, unknown> {
  const buffer = fs.readFileSync(filePath);
  const ext = filePath.toLowerCase().endsWith('.json') ? 'JSON' : 'PDF';
  const base64 = buffer.toString('base64');
  const hashMode = overrides.hashMode ?? qaEnv.HASH_MODE;
  const hash = hashMode === 'BASE64' ? sha256Base64(base64) : sha256Buffer(buffer);

  return {
    tipoDocumento: overrides.tipoDocumento ?? ext,
    hashDocumento: overrides.hashDocumento ?? hash,
    descripcion: overrides.descripcion ?? 'Aprobación automática QA',
    idTramite: overrides.idTramite ?? uuidv4(),
    accessToken: overrides.accessToken ?? qaEnv.ACCESS_TOKEN_CIUDADANIA,
    documento: overrides.documento ?? base64,
  };
}

export interface MultipleBodyOverrides {
  accessToken?: string;
  idTramite?: string;
  hashMode?: 'BUFFER' | 'BASE64';
}

/**
 * Construye el body para POST /api/solicitudes/multiples.
 */
export function buildMultipleBody(
  filePaths: string[],
  overrides: MultipleBodyOverrides = {},
): Record<string, unknown> {
  const hashMode = overrides.hashMode ?? qaEnv.HASH_MODE;

  return {
    idTramite: overrides.idTramite ?? uuidv4(),
    accessToken: overrides.accessToken ?? qaEnv.ACCESS_TOKEN_CIUDADANIA,
    documentos: filePaths.map((fp) => {
      const buffer = fs.readFileSync(fp);
      const ext = fp.toLowerCase().endsWith('.json') ? 'JSON' : 'PDF';
      const base64 = buffer.toString('base64');
      const hash = hashMode === 'BASE64' ? sha256Base64(base64) : sha256Buffer(buffer);
      return {
        tipoDocumento: ext,
        hashDocumento: hash,
        descripcion: `Documento QA`,
        documento: base64,
        uuidDocumento: uuidv4(),
      };
    }),
  };
}

// ─── Accesos rápidos ─────────────────────────────────────────────────────────

export const singleUrl = () => `${qaEnv.APROBADOR_URL}/api/solicitudes`;
export const multipleUrl = () => `${qaEnv.APROBADOR_URL}/api/solicitudes/multiples`;
export const verificarUrl = () => `${qaEnv.APROBADOR_URL}/api/documentos/verificar`;
export const defaultToken = () => qaEnv.TOKEN_CLIENTE;

/** Lee un archivo y retorna su contenido como string Base64. */
export function fileToBase64(filePath: string): string {
  return fs.readFileSync(filePath).toString('base64');
}

export const fixtures = {
  validPdf: fixturesPaths.validPdf,
  validPdf1mb: fixturesPaths.validPdf1mb,
  validPdf20mb: fixturesPaths.validPdf20mb,
  emptyPdf: fixturesPaths.emptyPdf,
  corruptedPdf: fixturesPaths.corruptedPdf,
  validJson: fixturesPaths.validJson,
  txtFile: fixturesPaths.txtFile,
  docxFile: fixturesPaths.docxFile,
  pngFile: fixturesPaths.pngFile,
} as const;
