/**
 * noti-19 — Múltiples enlaces con tipos FIRMA y APROBACION
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { QaCryptoService } from '../../services/qa-crypto.service';
import { QaBodyBuilder } from '../../services/qa-body-builder';
import { readPublicKey, notificadorUrl, defaultToken } from './helpers';
import type { NotificacionInput } from '../../../schemas/notification.schema';

const META = {
  id: 'noti-19',
  name: 'Múltiples enlaces — tipos mixtos',
  module: 'notificador' as const,
  tags: ['positive', 'structure'],
};

const EXPECTED = {
  success: true,
  httpStatus: 200,
};

const hash = 'c'.repeat(64);

const INPUT_MULTIPLES_ENLACES: NotificacionInput = {
  notificacion: {
    titulo: 'Notificación QA múltiples enlaces',
    descripcion: 'Prueba con 3 enlaces de tipos diferentes.',
    notificador: { tipoDocumento: 'CI', numeroDocumento: '4160481', fechaNacimiento: '1960-05-26' },
    autoridad: { tipoDocumento: 'CI', numeroDocumento: '4160481', fechaNacimiento: '1960-05-26' },
    notificados: [{ tipoDocumento: 'CI', numeroDocumento: '5585535', fechaNacimiento: '1974-01-31' }],
    enlaces: [
      { etiqueta: 'Enlace 1', url: 'https://example.com/doc1.pdf', tipo: 'FIRMA', hash },
      { etiqueta: 'Enlace 2', url: 'https://example.com/doc2.pdf', tipo: 'APROBACION', hash },
      { etiqueta: 'Enlace 3', url: 'https://example.com/doc3.pdf', tipo: 'FIRMA', hash },
    ],
    formularioNotificacion: {
      etiqueta: 'Formulario',
      url: 'https://example.com/form.pdf',
      tipo: 'APROBACION',
      hash,
    },
  },
};

export const scenario: Scenario = {
  ...META,
  description: '3 enlaces con tipos FIRMA y APROBACION mezclados deben ser aceptados.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const pem = readPublicKey();
      const aes = QaCryptoService.generateAesMaterial();
      const body = QaBodyBuilder.build(INPUT_MULTIPLES_ENLACES, aes, pem);
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
