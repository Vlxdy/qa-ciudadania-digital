/**
 * noti-18 — Sin campos opcionales: sin datosAdicionalesEntidad ni entidadNotificadora
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { QaCryptoService } from '../../services/qa-crypto.service';
import { QaBodyBuilder } from '../../services/qa-body-builder';
import { readPublicKey, notificadorUrl, defaultToken } from './helpers';
import type { NotificacionInput } from '../../../schemas/notification.schema';

const META = {
  id: 'noti-18',
  name: 'Sin campos opcionales',
  module: 'notificador' as const,
  tags: ['positive', 'structure'],
};

const EXPECTED = {
  success: true,
  httpStatus: 200,
};

const INPUT_SIN_OPCIONALES: NotificacionInput = {
  notificacion: {
    // Sin datosAdicionalesEntidad
    // Sin entidadNotificadora
    titulo: 'Notificación QA sin opcionales',
    descripcion: 'Prueba sin campos opcionales.',
    notificador: { tipoDocumento: 'CI', numeroDocumento: '4160481', fechaNacimiento: '1960-05-26' },
    autoridad: { tipoDocumento: 'CI', numeroDocumento: '4160481', fechaNacimiento: '1960-05-26' },
    notificados: [{ tipoDocumento: 'CI', numeroDocumento: '5585535', fechaNacimiento: '1974-01-31' }],
    enlaces: [{ etiqueta: 'Doc', url: 'https://example.com/doc.pdf', tipo: 'FIRMA', hash: 'a'.repeat(64) }],
    formularioNotificacion: { etiqueta: 'Form', url: 'https://example.com/form.pdf', tipo: 'FIRMA', hash: 'b'.repeat(64) },
  },
};

export const scenario: Scenario = {
  ...META,
  description: 'Notificación sin campos opcionales debe ser aceptada.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const pem = readPublicKey();
      const aes = QaCryptoService.generateAesMaterial();
      const body = QaBodyBuilder.build(INPUT_SIN_OPCIONALES, aes, pem);
      const response = await qaPost(notificadorUrl(), body, {
        Authorization: `Bearer ${defaultToken()}`,
        'Content-Type': 'application/json',
      });
      return makeResult(META, response, EXPECTED);
    } catch (err) {
      return makeResult(META, {
        localError: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - start,
      }, EXPECTED);
    }
  },
};
