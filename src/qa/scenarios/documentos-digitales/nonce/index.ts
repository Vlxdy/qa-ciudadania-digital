import type { Scenario } from '../../../types/scenario.types';
import { scenario as nonce01 } from './nonce-01-happy-path';
import { scenario as nonce02 } from './nonce-02-sin-token';
import { scenario as nonce03 } from './nonce-03-token-erroneo';
import { scenario as nonce04 } from './nonce-04-nonce-vacio';
import { scenario as nonce05 } from './nonce-05-nonce-no-uuid';
import { scenario as nonce06 } from './nonce-06-nonce-expirado';

export const nonceScenarios: Scenario[] = [
  nonce01, nonce02, nonce03, nonce04, nonce05, nonce06,
];
