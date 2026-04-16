/**
 * Construye el body final cifrado para el notificador — endpoint /juridico.
 * Autónomo — NO importa src/config/env.ts, recibe todo por parámetro.
 *
 * La diferencia respecto a QaBodyBuilder es que cada ítem de `notificados`
 * es un objeto { codigoEntidad } en lugar de PersonaNatural.
 */
import type { NotificacionJuridicoInput } from '../../schemas/notification-juridico.schema';
import type { BodyFinal } from '../../services/body-builder.service';
import { QaCryptoService, type QaAesMaterial } from './qa-crypto.service';

export class QaBodyBuilderJuridico {
  /**
   * Replica la lógica de cifrado de BodyBuilderService para el endpoint /juridico.
   */
  static build(
    input: NotificacionJuridicoInput,
    aes: QaAesMaterial,
    publicKeyPem: string,
    padding: 'PKCS1' | 'OAEP' = 'PKCS1',
  ): BodyFinal {
    const { notificacion } = input;
    const encrypt = (plain: string) =>
      QaCryptoService.encryptAesToHex(plain, aes.key, aes.iv);

    const notificacionFinal: BodyFinal['notificacion'] = {
      ...(notificacion.datosAdicionalesEntidad
        ? { datosAdicionalesEntidad: notificacion.datosAdicionalesEntidad }
        : {}),
      titulo: notificacion.titulo,
      descripcion: encrypt(notificacion.descripcion),
      notificador: encrypt(JSON.stringify(notificacion.notificador)),
      autoridad: encrypt(JSON.stringify(notificacion.autoridad)),
      // Cada entidad notificada se cifra individualmente como JSON string
      notificados: notificacion.notificados.map((entidad) =>
        encrypt(JSON.stringify(entidad)),
      ),
      enlaces: notificacion.enlaces.map((e) => ({
        etiqueta: e.etiqueta,
        url: encrypt(e.url),
        tipo: e.tipo,
        hash: e.hash ?? '',
      })),
      formularioNotificacion: {
        etiqueta: notificacion.formularioNotificacion.etiqueta,
        url: encrypt(notificacion.formularioNotificacion.url),
        tipo: notificacion.formularioNotificacion.tipo,
        hash: notificacion.formularioNotificacion.hash ?? '',
      },
      ...(notificacion.entidadNotificadora
        ? { entidadNotificadora: notificacion.entidadNotificadora }
        : {}),
    };

    const sha256 = QaCryptoService.sha256Hex(JSON.stringify(notificacionFinal));
    const llaveSimetrica = QaCryptoService.encryptRsaToBase64(
      aes.keyHex,
      publicKeyPem,
      padding,
    );
    const iv = QaCryptoService.encryptRsaToBase64(aes.ivHex, publicKeyPem, padding);

    return {
      notificacion: notificacionFinal,
      seguridad: { llaveSimetrica, iv },
      sha256,
    };
  }
}
