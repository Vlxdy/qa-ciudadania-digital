import crypto from 'crypto';
import { env } from '../config/env';

export type AesMaterial = {
  key: Buffer;
  iv: Buffer;
  keyHex: string;
  ivHex: string;
};

export class CryptoService {
  static generateAesMaterial(): AesMaterial {
    const useFixed = env.USE_FIXED_AES;

    if (useFixed) {
      if (!env.FIXED_AES_KEY_HEX || !env.FIXED_IV_HEX) {
        throw new Error(
          'USE_FIXED_AES=true pero FIXED_AES_KEY_HEX o FIXED_IV_HEX no están definidos',
        );
      }

      const key = Buffer.from(env.FIXED_AES_KEY_HEX, 'hex');
      const iv = Buffer.from(env.FIXED_IV_HEX, 'hex');

      if (key.length !== 32) {
        throw new Error('La llave AES debe tener 32 bytes (64 hex chars)');
      }

      if (iv.length !== 16) {
        throw new Error('El IV debe tener 16 bytes (32 hex chars)');
      }

      return {
        key,
        iv,
        keyHex: env.FIXED_AES_KEY_HEX,
        ivHex: env.FIXED_IV_HEX,
      };
    }

    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    return {
      key,
      iv,
      keyHex: key.toString('hex'),
      ivHex: iv.toString('hex'),
    };
  }

  static encryptAesToHex(plainText: string, key: Buffer, iv: Buffer): string {
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plainText, 'utf8'),
      cipher.final(),
    ]);
    return encrypted.toString('hex');
  }

  static decryptAesFromHex(cipherHex: string, key: Buffer, iv: Buffer): string {
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(cipherHex, 'hex')),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  }

  static sha256Hex(input: string): string {
    return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
  }

  static encryptRsaUtf8ToBase64(
    plainText: string,
    publicKeyPem: string,
  ): string {
    const padding =
      env.RSA_PADDING === 'OAEP'
        ? crypto.constants.RSA_PKCS1_OAEP_PADDING
        : crypto.constants.RSA_PKCS1_PADDING;

    const encrypted = crypto.publicEncrypt(
      {
        key: publicKeyPem,
        padding,
      },
      Buffer.from(plainText, 'utf8'),
    );

    return encrypted.toString('base64');
  }

  static stringifyStable(input: unknown): string {
    return JSON.stringify(input);
  }
}