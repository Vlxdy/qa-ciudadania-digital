import type { Scenario } from '../../types/scenario.types';
import { scenario as avis01 } from './avis-01-happy-path';
import { scenario as avis02 } from './avis-02-happy-path-multiple';
import { scenario as avis03 } from './avis-03-sin-token';
import { scenario as avis04 } from './avis-04-token-erroneo';
import { scenario as avis05 } from './avis-05-codigo-plantilla-vacio';
import { scenario as avis06 } from './avis-06-access-token-vacio';
import { scenario as avis07 } from './avis-07-envios-vacio';
import { scenario as avis08 } from './avis-08-envios-excesivos';
import { scenario as avis09 } from './avis-09-uuid-ciudadano-vacio';
import { scenario as avis10 } from './avis-10-sin-opcionales';
import { scenario as avis11 } from './avis-11-con-parametro-redireccion';
import { scenario as avis12 } from './avis-12-plantilla-inexistente';

export const avisosScenarios: Scenario[] = [
  avis01, avis02, avis03, avis04,
  avis05, avis06, avis07, avis08,
  avis09, avis10, avis11, avis12,
];
