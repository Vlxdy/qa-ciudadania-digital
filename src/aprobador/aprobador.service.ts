import axios from "axios";
import { AprobadorBodySingle, AprobadorMultiplesBody } from "./aprobador-builder";

export class AprobadorService {
  static async enviar(body: AprobadorBodySingle, token: string, url: string) {
    const response = await axios.post(`${url}/api/solicitudes`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  }

  static async enviarMultiples(
    body: AprobadorMultiplesBody,
    token: string,
    url: string,
  ) {
    const response = await axios.post(`${url}/api/solicitudes/multiples`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  }
}
