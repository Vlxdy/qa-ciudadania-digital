/**
 * noti-20 — Notificados con tipoDocumento CIE (Cédula de Identidad para Extranjeros)
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { QaCryptoService } from '../../services/qa-crypto.service';
import { QaBodyBuilder } from '../../services/qa-body-builder';
import { readPublicKey, notificadorUrl, defaultToken } from './helpers';
import type { NotificacionInput } from '../../../schemas/notification.schema';

const META = {
  id: 'noti-20',
  name: 'Notificados con tipoDocumento CIE',
  module: 'notificador' as const,
  tags: ['positive', 'structure'],
};

const EXPECTED = {
  success: true,
  httpStatus: 200,
};

const INPUT_CIE: NotificacionInput = {
  notificacion: {
    titulo: 'Notificación QA — CIE',
    descripcion: 'Prueba con ciudadano extranjero (CIE).',
    notificador: { tipoDocumento: 'CI', numeroDocumento: '4160481', fechaNacimiento: '1960-05-26' },
    autoridad: { tipoDocumento: 'CI', numeroDocumento: '4160481', fechaNacimiento: '1960-05-26' },
    notificados: [
      {
        tipoDocumento: 'CIE', // Cédula de Identidad para Extranjeros
        numeroDocumento: 'E-123456',
        fechaNacimiento: '1985-03-15',
      },
    ],
    enlaces: [{ etiqueta: 'Doc', url: 'https://example.com/doc.pdf', tipo: 'FIRMA', hash: 'd'.repeat(64) }],
    formularioNotificacion: {
      etiqueta: 'Form',
      url: 'https://example.com/form.pdf',
      tipo: 'FIRMA',
      hash: 'e'.repeat(64),
    },
  },
};

export const scenario: Scenario = {
  ...META,
  description: 'Notificado con CIE debe ser procesado igual que CI.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const pem = readPublicKey();
      const aes = QaCryptoService.generateAesMaterial();
      const body = QaBodyBuilder.build(INPUT_CIE, aes, pem);
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
