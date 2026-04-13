import { v4 as uuidv4 } from "uuid";
import { FileService } from "./services/file.service";
import { HashService } from "./services/hash.service";

export type AprobadorBody = {
  tipoDocumento: "PDF" | "JSON";
  hashDocumento: string;
  descripcion: string;
  idTramite: string;
  accessToken: string;
  documento: string;
};

export class AprobadorBuilder {
  static buildFromFile(
    filePath: string,
    accessToken: string,
    descripcion?: string
  ): AprobadorBody {
    const buffer = FileService.readFileRaw(filePath);
    const tipoDocumento = FileService.detectTipoDocumento(filePath);

    const base64 = buffer.toString("base64");

    const hash =
      process.env.HASH_MODE === "BASE64"
        ? HashService.sha256FromBase64String(base64)
        : HashService.sha256(buffer);

    console.log("DEBUG hash:", hash);
    console.log("DEBUG tipo:", tipoDocumento);

    return {
      tipoDocumento,
      hashDocumento: hash,
      descripcion: descripcion || `Aprobación automática de ${tipoDocumento}`,
      idTramite: uuidv4(),
      accessToken,
      documento: base64,
    };
  }
}