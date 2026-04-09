import axios from "axios";
import { env } from "../config/env";
import { BodyFinal } from "./body-builder.service";

export class SenderService {
  static async send(body: BodyFinal) {
    const url = `${env.ISSUER_NOTIFICADOR}/api/notificacion/natural`;

    const response = await axios.post(url, body, {
      headers: {
        Authorization: `Bearer ${env.TOKEN_CONFIGURACION}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    return response.data;
  }
}
