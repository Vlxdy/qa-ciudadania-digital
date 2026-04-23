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
import { scenario as prov13 } from './prov-13-b2b-post-happy-path';
import { scenario as prov14 } from './prov-14-b2b-basic-happy-path';
import { scenario as prov15 } from './prov-15-b2b-client-id-erroneo';
import { scenario as prov16 } from './prov-16-b2b-client-secret-erroneo';
import { scenario as prov17 } from './prov-17-b2b-grant-type-invalido';
import { scenario as prov18 } from './prov-18-me-happy-path';
import { scenario as prov19 } from './prov-19-me-sin-token';
import { scenario as prov20 } from './prov-20-me-token-invalido';

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
  prov13,
  prov14,
  prov15,
  prov16,
  prov17,
  prov18,
  prov19,
  prov20,
];
