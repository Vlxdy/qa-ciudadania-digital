/**
 * Helpers para escenarios de notificaciones de carácter obligatorio legal.
 * Reutiliza los builders del módulo natural; solo sobreescribe URL y token.
 */
export { buildValidBodyAsync, buildBodyAsync, buildValidBody, readPublicKey } from '../helpers';
import { qaEnv } from '../../../config/qa-env';

export const notificadorOblLegalUrl = () =>
  `${qaEnv.ISSUER_NOTIFICADOR_OBL_LEGAL}/api/notificacion/natural`;

export const oblLegalToken = () => qaEnv.TOKEN_CONFIGURACION_OBL_LEGAL;
