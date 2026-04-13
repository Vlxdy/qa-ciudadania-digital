import { v4 as uuidv4 } from "uuid";
import { FileService } from "./services/file.service";
import { HashService } from "./services/hash.service";

export type AprobadorBodyMultiple = {
  tipoDocumento: "PDF" | "JSON";
  hashDocumento: string;
  descripcion: string;
  idTramite: string;
  accessToken: string;
  documento: string;
  uuidDocumento: string;
};

export type AprobadorBodySingle = {
  tipoDocumento: "PDF" | "JSON";
  hashDocumento: string;
  descripcion: string;
  idTramite: string;
  accessToken: string;
  documento: string;
};

export type DocumentoAprobacion = Omit<
  AprobadorBodyMultiple,
  "idTramite" | "accessToken"
>;

export type AprobadorMultiplesBody = {
  idTramite: string;
  accessToken: string;
  documentos: DocumentoAprobacion[];
};

export class AprobadorBuilder {
  static buildDocumentoFromFile(
    filePath: string,
    descripcion?: string,
  ): DocumentoAprobacion {
    const buffer = FileService.readFileRaw(filePath);
    const tipoDocumento = FileService.detectTipoDocumento(filePath);

    const base64 = buffer.toString("base64");

    const hash =
      process.env.HASH_MODE === "BASE64"
        ? HashService.sha256FromBase64String(base64)
        : HashService.sha256(buffer);

    return {
      tipoDocumento,
      hashDocumento: hash,
      descripcion: descripcion || `Aprobación automática de ${tipoDocumento}`,
      documento: base64,
      uuidDocumento: uuidv4(),
    };
  }

  static buildFromFile(
    filePath: string,
    accessToken: string,
    descripcion?: string,
  ): AprobadorBodySingle {
    const { uuidDocumento, ...datosDocumento } =
      AprobadorBuilder.buildDocumentoFromFile(filePath, descripcion);
    return {
      ...datosDocumento,
      idTramite: uuidv4(),
      accessToken,
    };
  }

  static buildMultiplesFromFiles(
    files: string[],
    accessToken: string,
  ): AprobadorMultiplesBody {
    return {
      idTramite: uuidv4(),
      accessToken,
      documentos: files.map((filePath) =>
        AprobadorBuilder.buildDocumentoFromFile(filePath),
      ),
    };
  }
}
