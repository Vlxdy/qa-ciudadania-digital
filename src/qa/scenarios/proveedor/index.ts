import type { Scenario } from '../../types/scenario.types';
import { scenario as prov00 } from './prov-00-login-browser';
import { scenario as prov01 } from './prov-01-happy-path';
import { scenario as prov02 } from './prov-02-sin-credenciales';
import { scenario as prov03 } from './prov-03-client-id-erroneo';
import { scenario as prov04 } from './prov-04-client-secret-erroneo';
import { scenario as prov05 } from './prov-05-redirect-uri-invalido';
import { scenario as prov06 } from './prov-06-codigo-invalido';
import { scenario as prov07 } from './prov-07-state-mismatch';
import { scenario as prov08 } from './prov-08-nonce-mismatch';
import { scenario as prov09 } from './prov-09-codigo-reutilizado';
import { scenario as prov10 } from './prov-10-mobile-happy-path';
import { scenario as prov11 } from './prov-11-mobile-sin-code-verifier';
import { scenario as prov12 } from './prov-12-mobile-code-verifier-invalido';

export const proveedorScenarios: Scenario[] = [
  prov00,
  prov01,
  prov02,
  prov03,
  prov04,
  prov05,
  prov06,
  prov07,
  prov08,
  prov09,
  prov10,
  prov11,
  prov12,
];
