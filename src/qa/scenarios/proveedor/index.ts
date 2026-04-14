import type { Scenario } from '../../types/scenario.types';
import { scenario as prov01 } from './prov-01-happy-path';
import { scenario as prov02 } from './prov-02-sin-credenciales';
import { scenario as prov03 } from './prov-03-client-id-erroneo';
import { scenario as prov04 } from './prov-04-client-secret-erroneo';
import { scenario as prov05 } from './prov-05-redirect-uri-invalido';
import { scenario as prov06 } from './prov-06-codigo-invalido';
import { scenario as prov07 } from './prov-07-state-mismatch';
import { scenario as prov08 } from './prov-08-nonce-mismatch';

export const proveedorScenarios: Scenario[] = [
  prov01,
  prov02,
  prov03,
  prov04,
  prov05,
  prov06,
  prov07,
  prov08,
];
