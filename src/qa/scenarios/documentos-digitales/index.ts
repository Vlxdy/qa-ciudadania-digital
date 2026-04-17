import type { Scenario } from '../../types/scenario.types';
import { generadorNonceScenarios } from './generador-nonce';
import { nonceScenarios } from './nonce';

export const documentosDigitalesScenarios: Scenario[] = [
  ...generadorNonceScenarios,
  ...nonceScenarios,
];
