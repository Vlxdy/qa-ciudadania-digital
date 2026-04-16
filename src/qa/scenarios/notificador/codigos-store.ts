/**
 * Store en memoria para compartir códigos de seguimiento entre escenarios.
 *
 * noti-01 y juri-01 escriben aquí al recibir una respuesta 201 exitosa.
 * esta-01 y esta-02 leen de aquí para la consulta de estado.
 *
 * Funciona gracias a que el runner ejecuta los escenarios de forma secuencial.
 */
export const codigosStore: {
  codigoSeguimientoNatural?: string;
  codigoSeguimientoJuridico?: string;
} = {};
