import type { Scenario } from '../../../types/scenario.types';
import { scenario as dele01 } from './dele-01-happy-path';
import { scenario as dele02 } from './dele-02-sin-token';
import { scenario as dele03 } from './dele-03-token-erroneo';
import { scenario as dele04 } from './dele-04-codigo-entidad-vacio';
import { scenario as dele05 } from './dele-05-descripcion-larga';
import { scenario as dele06 } from './dele-06-tipo-documento-notificador-invalido';
import { scenario as dele07 } from './dele-07-tipo-documento-representante-invalido';
import { scenario as dele08 } from './dele-08-fecha-formato-invalido';
import { scenario as dele09 } from './dele-09-rsa-key-invalida';
import { scenario as dele10 } from './dele-10-rsa-padding-oaep';

export const delegadoScenarios: Scenario[] = [
  dele01, dele02, dele03, dele04, dele05,
  dele06, dele07, dele08, dele09, dele10,
];
