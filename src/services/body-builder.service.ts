import {
  NotificacionInput,
  PersonaNatural,
} from "../schemas/notification.schema";
import { CryptoService, AesMaterial } from "./crypto.service";

export type BodyFinal = {
  notificacion: {
    datosAdicionalesEntidad?: { clave: string; valor: string }[];
    titulo: string;
    descripcion: string;
    notificador: string;
    autoridad: string;
    notificados: string[];
    enlaces: {
      etiqueta: string;
      url: string;
      tipo: "FIRMA" | "APROBACION";
      hash: string;
    }[];
    formularioNotificacion: {
      etiqueta: string;
      url: string;
      tipo: "FIRMA" | "APROBACION";
      hash: string;
    };
    entidadNotificadora?: string;
  };
  seguridad: {
    llaveSimetrica: string;
    iv: string;
  };
  sha256: string;
};

export type DebugOutput = {
  aesKeyHex: string;
  ivHex: string;
  notificacionString: string;
  sha256: string;
  originales: {
    notificador: PersonaNatural;
    autoridad: PersonaNatural;
    notificados: PersonaNatural[];
  };
};

export class BodyBuilderService {
  static build(
    input: NotificacionInput,
    aes: AesMaterial,
    publicKeyPem: string,
  ): { body: BodyFinal; debug: DebugOutput } {
    const { notificacion } = input;

    const descripcionEncrypted = CryptoService.encryptAesToHex(
      notificacion.descripcion,
      aes.key,
      aes.iv,
    );

    const notificadorString = CryptoService.stringifyStable(
      notificacion.notificador,
    );
    const autoridadString = CryptoService.stringifyStable(
      notificacion.autoridad,
    );

    const notificadorEncrypted = CryptoService.encryptAesToHex(
      notificadorString,
      aes.key,
      aes.iv,
    );

    const autoridadEncrypted = CryptoService.encryptAesToHex(
      autoridadString,
      aes.key,
      aes.iv,
    );

    const notificadosEncrypted = notificacion.notificados.map((persona) => {
      const personaString = CryptoService.stringifyStable(persona);
      return CryptoService.encryptAesToHex(personaString, aes.key, aes.iv);
    });

    const enlacesEncrypted = notificacion.enlaces.map((enlace) => ({
      etiqueta: enlace.etiqueta,
      url: CryptoService.encryptAesToHex(enlace.url, aes.key, aes.iv),
      tipo: enlace.tipo,
      hash: enlace.hash,
    }));

    const formularioEncrypted = {
      etiqueta: notificacion.formularioNotificacion.etiqueta,
      url: CryptoService.encryptAesToHex(
        notificacion.formularioNotificacion.url,
        aes.key,
        aes.iv,
      ),
      tipo: notificacion.formularioNotificacion.tipo,
      hash: notificacion.formularioNotificacion.hash,
    };

    const notificacionFinal: BodyFinal["notificacion"] = {
      ...(notificacion.datosAdicionalesEntidad
        ? { datosAdicionalesEntidad: notificacion.datosAdicionalesEntidad }
        : {}),
      titulo: notificacion.titulo,
      descripcion: descripcionEncrypted,
      notificador: notificadorEncrypted,
      autoridad: autoridadEncrypted,
      notificados: notificadosEncrypted,
      enlaces: enlacesEncrypted,
      formularioNotificacion: formularioEncrypted,
      ...(notificacion.entidadNotificadora
        ? { entidadNotificadora: notificacion.entidadNotificadora }
        : {}),
    };

    const notificacionString = JSON.stringify(notificacionFinal);
    const sha256 = CryptoService.sha256Hex(notificacionString);

    // 🔥 IMPORTANTE: RSA sobre el HEX STRING, no sobre los bytes puros
    const llaveSimetricaEncrypted = CryptoService.encryptRsaUtf8ToBase64(
      aes.keyHex,
      publicKeyPem,
    );

    const ivEncrypted = CryptoService.encryptRsaUtf8ToBase64(
      aes.ivHex,
      publicKeyPem,
    );

    const body: BodyFinal = {
      notificacion: notificacionFinal,
      seguridad: {
        llaveSimetrica: llaveSimetricaEncrypted,
        iv: ivEncrypted,
      },
      sha256,
    };

    const debug: DebugOutput = {
      aesKeyHex: aes.keyHex,
      ivHex: aes.ivHex,
      notificacionString,
      sha256,
      originales: {
        notificador: notificacion.notificador,
        autoridad: notificacion.autoridad,
        notificados: notificacion.notificados,
      },
    };

    return { body, debug };
  }
}
