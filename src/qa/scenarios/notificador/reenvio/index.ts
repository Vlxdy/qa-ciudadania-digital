import type { Scenario } from '../../../types/scenario.types';
import { scenario as renv01 } from './renv-01-happy-path-natural';
import { scenario as renv02 } from './renv-02-happy-path-juridico';
import { scenario as renv03 } from './renv-03-sin-token';
import { scenario as renv04 } from './renv-04-token-erroneo';
import { scenario as renv05 } from './renv-05-codigo-inexistente';
import { scenario as renv06 } from './renv-06-codigo-vacio';

export const reenvioScenarios: Scenario[] = [
  renv01, renv02, renv03, renv04, renv05, renv06,
];
