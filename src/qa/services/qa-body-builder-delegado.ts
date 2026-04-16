/**
 * Construye el body final cifrado para el endpoint POST /delegado/representante_legal.
 * Autónomo — NO importa src/config/env.ts, recibe todo por parámetro.
 *
 * Campos cifrados:
 *   registro.descripcion       → AES
 *   registro.notificador       → AES (JSON.stringify del objeto PersonaNatural)
 *   registro.representanteLegal → AES (JSON.stringify del objeto PersonaNatural)
 *   seguridad.llaveSimetrica   → RSA
 *   seguridad.iv               → RSA
 *   sha256                     → SHA-256 del campo `registro` final (como string)
 */
import type { DelegadoInput, BodyFinalDelegado } from '../../schemas/delegado.schema';
import { QaCryptoService, type QaAesMaterial } from './qa-crypto.service';

export class QaBodyBuilderDelegado {
  static build(
    input: DelegadoInput,
    aes: QaAesMaterial,
    publicKeyPem: string,
    padding: 'PKCS1' | 'OAEP' = 'PKCS1',
  ): BodyFinalDelegado {
    const { registro } = input;
    const encrypt = (plain: string) =>
      QaCryptoService.encryptAesToHex(plain, aes.key, aes.iv);

    const registroFinal: BodyFinalDelegado['registro'] = {
      codigoEntidad: registro.codigoEntidad,
      descripcion: encrypt(registro.descripcion),
      notificador: encrypt(JSON.stringify(registro.notificador)),
      representanteLegal: encrypt(JSON.stringify(registro.representanteLegal)),
    };

    const sha256 = QaCryptoService.sha256Hex(JSON.stringify(registroFinal));
    const llaveSimetrica = QaCryptoService.encryptRsaToBase64(
      aes.keyHex,
      publicKeyPem,
      padding,
    );
    const iv = QaCryptoService.encryptRsaToBase64(aes.ivHex, publicKeyPem, padding);

    return {
      registro: registroFinal,
      seguridad: { llaveSimetrica, iv },
      sha256,
    };
  }
}
