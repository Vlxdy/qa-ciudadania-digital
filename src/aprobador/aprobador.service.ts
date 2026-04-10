import axios from "axios";
import { AprobadorBody } from "./aprobador-builder";

export class AprobadorService {
  static async enviar(
    body: AprobadorBody,
    token: string,
    url: string,
  ) {
    const response = await axios.post(
      `${url}/api/solicitudes`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  }
}