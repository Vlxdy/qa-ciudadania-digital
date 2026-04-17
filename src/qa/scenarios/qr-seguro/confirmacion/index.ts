import type { Scenario } from '../../../types/scenario.types';
import { scenario as qrcf01 } from './qrcf-01-happy-path';
import { scenario as qrcf02 } from './qrcf-02-sin-token';
import { scenario as qrcf03 } from './qrcf-03-token-erroneo';
import { scenario as qrcf04 } from './qrcf-04-codigo-vacio';
import { scenario as qrcf05 } from './qrcf-05-codigo-no-uuid';
import { scenario as qrcf06 } from './qrcf-06-uuid-inexistente';

export const qrConfirmacionScenarios: Scenario[] = [
  qrcf01, qrcf02, qrcf03, qrcf04, qrcf05, qrcf06,
];
