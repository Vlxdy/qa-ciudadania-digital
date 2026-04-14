/**
 * Operaciones criptográficas para QA.
 * Autónomo — NO importa src/config/env.ts, recibe todo por parámetro.
 */
import crypto from 'crypto';

export type QaAesMaterial = {
  key: Buffer;
  iv: Buffer;
  keyHex: string;
  ivHex: string;
};

export class QaCryptoService {
  /**
   * Genera material AES-256-CBC.
   * Si se pasan keyHex e ivHex, los usa (modo fijo para reproducibilidad).
   */
  static generateAesMaterial(keyHex?: string, ivHex?: string): QaAesMaterial {
    if (keyHex && ivHex) {
      const key = Buffer.from(keyHex, 'hex');
      const iv = Buffer.from(ivHex, 'hex');
      if (key.length !== 32) throw new Error('keyHex debe tener 64 caracteres hex (32 bytes)');
      if (iv.length !== 16) throw new Error('ivHex debe tener 32 caracteres hex (16 bytes)');
      return { key, iv, keyHex, ivHex };
    }
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    return { key, iv, keyHex: key.toString('hex'), ivHex: iv.toString('hex') };
  }

  static encryptAesToHex(plain: string, key: Buffer, iv: Buffer): string {
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    return Buffer.concat([
      cipher.update(plain, 'utf8'),
      cipher.final(),
    ]).toString('hex');
  }

  static sha256Hex(input: string): string {
    return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
  }

  /**
   * Cifra con clave pública RSA.
   * @param padding 'PKCS1' (default) o 'OAEP'
   */
  static encryptRsaToBase64(
    plain: string,
    pem: string,
    padding: 'PKCS1' | 'OAEP' = 'PKCS1',
  ): string {
    const padConstant =
      padding === 'OAEP'
        ? crypto.constants.RSA_PKCS1_OAEP_PADDING
        : crypto.constants.RSA_PKCS1_PADDING;

    return crypto
      .publicEncrypt({ key: pem, padding: padConstant }, Buffer.from(plain, 'utf8'))
      .toString('base64');
  }
}
