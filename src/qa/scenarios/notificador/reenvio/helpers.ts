/**
 * Helpers para escenarios del módulo notificador — endpoint POST /reenvio.
 */
import { qaEnv } from '../../../config/qa-env';

export const reenvioUrl = () =>
  `${qaEnv.ISSUER_NOTIFICADOR}/api/notificacion/reenvio`;

export const defaultToken = () => qaEnv.TOKEN_CONFIGURACION;

/** UUID inexistente pero con formato válido — para escenario de 412. */
export const UUID_INEXISTENTE = '00000000-0000-0000-0000-000000000000';
