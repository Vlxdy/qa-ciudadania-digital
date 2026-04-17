import type { Scenario } from '../../../types/scenario.types';
import { scenario as qran01 } from './qran-01-happy-path';
import { scenario as qran02 } from './qran-02-sin-token';
import { scenario as qran03 } from './qran-03-token-erroneo';
import { scenario as qran04 } from './qran-04-codigo-vacio';
import { scenario as qran05 } from './qran-05-codigo-no-uuid';
import { scenario as qran06 } from './qran-06-uuid-ya-anulado';
import { scenario as qran07 } from './qran-07-uuid-inexistente';

export const qrAnulacionScenarios: Scenario[] = [
  qran01, qran02, qran03, qran04, qran05, qran06, qran07,
];
