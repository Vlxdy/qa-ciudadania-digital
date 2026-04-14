import type { Scenario } from '../../types/scenario.types';
import { scenario as apro01 } from './apro-01-happy-path-single';
import { scenario as apro02 } from './apro-02-happy-path-multiple';
import { scenario as apro03 } from './apro-03-sin-token-cliente';
import { scenario as apro04 } from './apro-04-token-cliente-erroneo';
import { scenario as apro05 } from './apro-05-access-token-expirado';
import { scenario as apro06 } from './apro-06-access-token-malformado';
import { scenario as apro07 } from './apro-07-sin-access-token';
import { scenario as apro08 } from './apro-08-tipo-txt';
import { scenario as apro09 } from './apro-09-tipo-docx';
import { scenario as apro10 } from './apro-10-tipo-png';
import { scenario as apro11 } from './apro-11-archivo-vacio';
import { scenario as apro12 } from './apro-12-archivo-corrupto';
import { scenario as apro13 } from './apro-13-archivo-1mb';
import { scenario as apro14 } from './apro-14-archivo-20mb';
import { scenario as apro15 } from './apro-15-hash-mode-buffer';
import { scenario as apro16 } from './apro-16-hash-mode-base64';
import { scenario as apro17 } from './apro-17-hash-incorrecto';
import { scenario as apro18 } from './apro-18-base64-invalido';
import { scenario as apro19 } from './apro-19-uuid-invalido';
import { scenario as apro20 } from './apro-20-falta-descripcion';
import { scenario as apro21 } from './apro-21-multiples-vacio';
import { scenario as apro22 } from './apro-22-multiples-tipos-mixtos';

export const aprobadorScenarios: Scenario[] = [
  apro01, apro02, apro03, apro04, apro05, apro06,
  apro07, apro08, apro09, apro10, apro11, apro12,
  apro13, apro14, apro15, apro16, apro17, apro18,
  apro19, apro20, apro21, apro22,
];
