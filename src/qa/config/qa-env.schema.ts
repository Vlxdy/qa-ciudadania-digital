/**
 * Schemas Zod para validar variables de entorno QA antes de ejecutar los escenarios.
 * Agrupa las vars por módulo y valida presencia + formato.
 */
import { z } from 'zod';

// ─── Primitivos reutilizables ─────────────────────────────────────────────────

// Normaliza undefined/null → '' para que min(1) muestre "no puede estar vacío"
// en lugar del mensaje genérico de tipo de Zod.
const coerce = (v: unknown) => (v == null ? '' : String(v));

const nonEmpty = z.preprocess(
  coerce,
  z.string().min(1, 'no puede estar vacío'),
);

const httpUrl = z.preprocess(
  coerce,
  z
    .string()
    .min(1, 'no puede estar vacío')
    .regex(
      /^https?:\/\/.+/,
      'debe ser una URL HTTP/HTTPS válida (ej. https://tu-dominio.gob.bo)',
    ),
);

// ─── Schemas por módulo ───────────────────────────────────────────────────────

const moduleSchemas = {
  aprobador: z.object({
    APROBADOR_URL: httpUrl,
    TOKEN_CLIENTE:  nonEmpty,
  }),

  notificador: z.object({
    // Conexión
    ISSUER_NOTIFICADOR:  httpUrl,
    TOKEN_CONFIGURACION: nonEmpty,
    RSA_PUBLIC_KEY_PATH: nonEmpty,
    // Personas
    QA_OPERADOR_NUMERO_DOC: nonEmpty,
    QA_OPERADOR_FECHA_NAC:  nonEmpty,
    NOTI_NOTIFICADO_NUMERO_DOC: nonEmpty,
    NOTI_NOTIFICADO_FECHA_NAC:  nonEmpty,
    // Contenido de la notificación
    NOTI_TITULO:      nonEmpty,
    NOTI_DESCRIPCION: nonEmpty,
    NOTI_ENLACE_URL:     httpUrl,
    NOTI_FORMULARIO_URL: httpUrl,
  }),

  proveedor: z.object({
    OIDC_ISSUER:       httpUrl,
    OIDC_CLIENT_ID:    nonEmpty,
    OIDC_REDIRECT_URI: httpUrl,
  }),

  avisos: z.object({
    AVISOS_URL_BASE:         httpUrl,
    AVISOS_TOKEN:            nonEmpty,
    AVISOS_CODIGO_PLANTILLA: nonEmpty,
    AVISOS_UUID_CIUDADANO:   nonEmpty,
  }),

  'qr-seguro': z.object({
    QR_SEGURO_URL_BASE: httpUrl,
    QR_SEGURO_TOKEN:    nonEmpty,
  }),

  'documentos-digitales': z.object({
    DOC_DIGITAL_URL_BASE:         httpUrl,
    DOC_DIGITAL_TOKEN:            nonEmpty,
    DOC_DIGITAL_CODIGO_DOCUMENTO: nonEmpty,
  }),
};

export type QaModule = keyof typeof moduleSchemas;

// ─── Tipos resultado ──────────────────────────────────────────────────────────

export interface EnvIssue {
  field: string;
  message: string;
}

export interface ModuleEnvResult {
  module: QaModule;
  issues: EnvIssue[];
  valid: boolean;
}

// ─── Funciones de validación ──────────────────────────────────────────────────

export function validateModuleEnv(
  module: QaModule,
  env: Record<string, unknown>,
): ModuleEnvResult {
  const result = moduleSchemas[module].safeParse(env);

  if (result.success) return { module, issues: [], valid: true };

  const seen = new Set<string>();
  const issues: EnvIssue[] = [];

  for (const issue of result.error.issues) {
    const field = (issue.path[0] as string) ?? module;
    // Zod puede emitir múltiples issues por campo (p.ej. min + regex); mostrar solo el primero
    if (!seen.has(field)) {
      seen.add(field);
      issues.push({ field, message: issue.message });
    }
  }

  return { module, issues, valid: false };
}

export function validateModulesEnv(
  modules: QaModule[],
  env: Record<string, unknown>,
): ModuleEnvResult[] {
  return modules.map((m) => validateModuleEnv(m, env));
}
