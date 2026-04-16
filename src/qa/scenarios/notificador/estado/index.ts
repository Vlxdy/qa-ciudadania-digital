import type { Scenario } from '../../../types/scenario.types';
import { scenario as esta01 } from './esta-01-happy-path-natural';
import { scenario as esta02 } from './esta-02-happy-path-juridico';
import { scenario as esta03 } from './esta-03-sin-token';
import { scenario as esta04 } from './esta-04-token-erroneo';
import { scenario as esta05 } from './esta-05-codigo-inexistente';
import { scenario as esta06 } from './esta-06-codigo-formato-invalido';

export const estadoScenarios: Scenario[] = [
  esta01, esta02, esta03, esta04, esta05, esta06,
];
