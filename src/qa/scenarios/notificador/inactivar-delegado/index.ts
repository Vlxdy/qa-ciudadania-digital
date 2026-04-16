import type { Scenario } from '../../../types/scenario.types';
import { scenario as inde01 } from './inde-01-happy-path';
import { scenario as inde02 } from './inde-02-sin-token';
import { scenario as inde03 } from './inde-03-token-erroneo';
import { scenario as inde04 } from './inde-04-codigo-entidad-vacio';
import { scenario as inde05 } from './inde-05-tipo-documento-invalido';
import { scenario as inde06 } from './inde-06-fecha-formato-invalido';
import { scenario as inde07 } from './inde-07-numero-documento-vacio';
import { scenario as inde08 } from './inde-08-delegado-inexistente';

export const inactivarDelegadoScenarios: Scenario[] = [
  inde01, inde02, inde03, inde04,
  inde05, inde06, inde07, inde08,
];
