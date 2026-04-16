import type { Scenario } from '../../../types/scenario.types';
import { scenario as esta01 } from './esta-01-happy-path-natural';
import { scenario as esta02 } from './esta-02-happy-path-juridico';
import { scenario as esta03 } from './esta-03-sin-token';
import { scenario as esta04 } from './esta-04-token-erroneo';
import { scenario as esta05 } from './esta-05-codigo-inexistente';
import { scenario as esta06 } from './esta-06-codigo-formato-invalido';
import { scenario as comp01 } from './comp-01-happy-path-natural';
import { scenario as comp02 } from './comp-02-happy-path-juridico';
import { scenario as comp03 } from './comp-03-sin-token';
import { scenario as comp04 } from './comp-04-token-erroneo';
import { scenario as comp05 } from './comp-05-codigo-inexistente';
import { scenario as comp06 } from './comp-06-codigo-formato-invalido';

export const estadoScenarios: Scenario[] = [
  esta01, esta02, esta03, esta04, esta05, esta06,
  comp01, comp02, comp03, comp04, comp05, comp06,
];
