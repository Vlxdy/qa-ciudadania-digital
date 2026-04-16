/**
 * Helpers para escenarios del módulo notificador — endpoint GET /estado/:codigoSeguimiento.
 */
import { qaEnv } from '../../../config/qa-env';

export const estadoUrl = (codigoSeguimiento: string) =>
  `${qaEnv.ISSUER_NOTIFICADOR}/api/notificacion/estado/${codigoSeguimiento}`;

export const comprobanteUrl = (codigoSeguimiento: string) =>
  `${qaEnv.ISSUER_NOTIFICADOR}/api/notificacion/estado/comprobante/${codigoSeguimiento}`;

export const defaultToken = () => qaEnv.TOKEN_CONFIGURACION;

/** UUID inexistente pero con formato válido — para escenario de 404. */
export const UUID_INEXISTENTE = '00000000-0000-0000-0000-000000000000';

/** Cadena con formato inválido — para escenario de 400/404. */
export const CODIGO_FORMATO_INVALIDO = 'CODIGO-INVALIDO-QA';
