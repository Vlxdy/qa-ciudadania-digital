import type { Scenario } from '../../types/scenario.types';
import { scenario as qrsg01 } from './qrsg-01-happy-path';
import { scenario as qrsg02 } from './qrsg-02-sin-token';
import { scenario as qrsg03 } from './qrsg-03-token-erroneo';
import { scenario as qrsg04 } from './qrsg-04-access-token-vacio';
import { scenario as qrsg05 } from './qrsg-05-codigo-transaccion-no-uuid';
import { scenario as qrsg06 } from './qrsg-06-codigo-documento-vacio';
import { scenario as qrsg07 } from './qrsg-07-nombre-documento-vacio';
import { scenario as qrsg08 } from './qrsg-08-fecha-emision-formato-invalido';
import { scenario as qrsg09 } from './qrsg-09-titulares-vacio';
import { scenario as qrsg10 } from './qrsg-10-tipo-documento-titular-invalido';
import { scenario as qrsg11 } from './qrsg-11-sin-opcionales';
import { scenario as qrsg12 } from './qrsg-12-metadatos-excesivos';
import { scenario as qrsg13 } from './qrsg-13-uuid-repetido';
import { qrConfirmacionScenarios } from './confirmacion';
import { qrAnulacionScenarios } from './anulacion';

export const qrSeguroScenarios: Scenario[] = [
  qrsg01, qrsg02, qrsg03, qrsg04, qrsg05,
  qrsg06, qrsg07, qrsg08, qrsg09, qrsg10,
  qrsg11, qrsg12, qrsg13,
  ...qrConfirmacionScenarios,
  ...qrAnulacionScenarios,
];
