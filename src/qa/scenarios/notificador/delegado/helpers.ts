/**
 * Helpers para escenarios del módulo notificador — endpoint POST /delegado/representante_legal.
 */
import fs from 'fs';
import type { DelegadoInput } from '../../../../schemas/delegado.schema';
import { DelegadoInputSchema } from '../../../../schemas/delegado.schema';
import type { BodyFinalDelegado } from '../../../../schemas/delegado.schema';
import { QaCryptoService } from '../../../services/qa-crypto.service';
import { QaBodyBuilderDelegado } from '../../../services/qa-body-builder-delegado';
import { qaEnv } from '../../../config/qa-env';
import { fixturesPaths } from '../../../fixtures/paths';
import { qaPost } from '../../../http/qa-http';

// ─── Input base leído desde variables de entorno ──────────────────────────────

function buildBaseDelegado(): DelegadoInput {
  return {
    registro: {
      codigoEntidad: qaEnv.NOTI_DELEGADO_CODIGO_ENTIDAD,
      descripcion: qaEnv.NOTI_DELEGADO_DESCRIPCION,
      notificador: {
        tipoDocumento: qaEnv.NOTI_NOTIFICADOR_TIPO_DOC,
        numeroDocumento: qaEnv.NOTI_NOTIFICADOR_NUMERO_DOC,
        fechaNacimiento: qaEnv.NOTI_NOTIFICADOR_FECHA_NAC,
      },
      representanteLegal: {
        tipoDocumento: qaEnv.NOTI_DELEGADO_REPRESENTANTE_TIPO_DOC,
        numeroDocumento: qaEnv.NOTI_DELEGADO_REPRESENTANTE_NUMERO_DOC,
        fechaNacimiento: qaEnv.NOTI_DELEGADO_REPRESENTANTE_FECHA_NAC,
      },
    },
  };
}

export const BASE_DELEGADO: DelegadoInput = buildBaseDelegado();

// ─── Builder ──────────────────────────────────────────────────────────────────

export function buildValidBodyDelegado(
  padding: 'PKCS1' | 'OAEP' = qaEnv.RSA_PADDING,
  fixedKeyHex?: string,
  fixedIvHex?: string,
): BodyFinalDelegado {
  const pem = readPublicKey();
  const aes = QaCryptoService.generateAesMaterial(fixedKeyHex, fixedIvHex);
  return QaBodyBuilderDelegado.build(BASE_DELEGADO, aes, pem, padding);
}

export function buildBodyDelegado(input: DelegadoInput): BodyFinalDelegado {
  const pem = readPublicKey();
  const aes = QaCryptoService.generateAesMaterial();
  return QaBodyBuilderDelegado.build(input, aes, pem, qaEnv.RSA_PADDING);
}

export function buildBodyDelegadoWithPem(
  pem: string,
  padding: 'PKCS1' | 'OAEP' = qaEnv.RSA_PADDING,
): BodyFinalDelegado {
  const aes = QaCryptoService.generateAesMaterial();
  return QaBodyBuilderDelegado.build(BASE_DELEGADO, aes, pem, padding);
}

// ─── Validación Zod ───────────────────────────────────────────────────────────

export function validateInputDelegado(input: unknown): {
  valid: boolean;
  error: string;
  fields: string[];
} {
  const result = DelegadoInputSchema.safeParse(input);
  if (result.success) return { valid: true, error: '', fields: [] };

  const issues = result.error.issues;
  const error = issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
  const fields = issues.map((i) => i.path.join('.'));
  return { valid: false, error, fields };
}

// ─── Helper build + send (omite Zod) ─────────────────────────────────────────

export async function tryBuildAndSendDelegado(input: unknown): Promise<{
  httpStatus?: number;
  body?: unknown;
  request?: import('../../../types/scenario.types').QaRequestTrace;
  durationMs: number;
}> {
  const start = Date.now();
  try {
    const pem = readPublicKey();
    const aes = QaCryptoService.generateAesMaterial();
    const body = QaBodyBuilderDelegado.build(input as DelegadoInput, aes, pem, qaEnv.RSA_PADDING);
    return await qaPost(delegadoUrl(), body, {
      Authorization: `Bearer ${defaultToken()}`,
      'Content-Type': 'application/json',
    });
  } catch {
    return { durationMs: Date.now() - start };
  }
}

// ─── Accesos rápidos ──────────────────────────────────────────────────────────

export function readPublicKey(): string {
  const keyPath = qaEnv.RSA_PUBLIC_KEY_PATH;
  if (!fs.existsSync(keyPath)) {
    throw new Error(`Clave pública RSA no encontrada en: ${keyPath}`);
  }
  return fs.readFileSync(keyPath, 'utf-8');
}

export function readInvalidPem(): string {
  return fs.readFileSync(fixturesPaths.invalidPem, 'utf-8');
}

export const delegadoUrl = () =>
  `${qaEnv.ISSUER_NOTIFICADOR}/api/delegado/representante_legal`;

export const defaultToken = () => qaEnv.TOKEN_CONFIGURACION;
