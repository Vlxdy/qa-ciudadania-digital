import type { Scenario } from '../../../types/scenario.types';
import { scenario as genNonce01 } from './gen-nonce-01-happy-path';
import { scenario as genNonce02 } from './gen-nonce-02-sin-token';
import { scenario as genNonce03 } from './gen-nonce-03-token-erroneo';
import { scenario as genNonce04 } from './gen-nonce-04-codigo-vacio';
import { scenario as genNonce05 } from './gen-nonce-05-codigo-no-uuid';

export const generadorNonceScenarios: Scenario[] = [
  genNonce01, genNonce02, genNonce03, genNonce04, genNonce05,
];
