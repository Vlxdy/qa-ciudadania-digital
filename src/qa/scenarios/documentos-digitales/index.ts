import type { Scenario } from '../../types/scenario.types';
import { nonceScenarios } from './nonce';

export const documentosDigitalesScenarios: Scenario[] = [
  ...nonceScenarios,
];
