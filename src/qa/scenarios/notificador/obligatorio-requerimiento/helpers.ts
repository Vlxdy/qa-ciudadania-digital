/**
 * Helpers para escenarios de notificaciones de carácter obligatorio requerimiento.
 * Reutiliza los builders del módulo natural; solo sobreescribe URL y token.
 */
export { buildValidBodyAsync, buildBodyAsync, buildValidBody, readPublicKey } from '../helpers';
import { qaEnv } from '../../../config/qa-env';

export const notificadorOblReqUrl = () =>
  `${qaEnv.ISSUER_NOTIFICADOR_OBL_REQ}/api/notificacion/natural`;

export const oblReqToken = () => qaEnv.TOKEN_CONFIGURACION_OBL_REQ;
