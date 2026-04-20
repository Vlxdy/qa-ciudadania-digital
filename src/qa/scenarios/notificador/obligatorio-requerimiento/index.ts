import type { Scenario } from '../../../types/scenario.types';
import { scenario as oblReq00 } from './obl-req-00-aceptacion';
import { scenario as oblReq01 } from './obl-req-01-happy-path';

export const oblReqScenarios: Scenario[] = [
  oblReq00,
  oblReq01,
];
