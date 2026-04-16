import type { Scenario } from '../../../types/scenario.types';
import { scenario as juri01 } from './juri-01-happy-path';
import { scenario as juri02 } from './juri-02-sin-token';
import { scenario as juri03 } from './juri-03-token-erroneo';
import { scenario as juri04 } from './juri-04-titulo-vacio';
import { scenario as juri05 } from './juri-05-titulo-largo';
import { scenario as juri06 } from './juri-06-descripcion-larga';
import { scenario as juri07 } from './juri-07-tipo-documento-invalido';
import { scenario as juri08 } from './juri-08-fecha-formato-invalido';
import { scenario as juri09 } from './juri-09-notificados-vacio';
import { scenario as juri10 } from './juri-10-notificados-excesivos';
import { scenario as juri11 } from './juri-11-codigo-entidad-vacio';
import { scenario as juri12 } from './juri-12-url-http';
import { scenario as juri13 } from './juri-13-clave-adicional-larga';
import { scenario as juri14 } from './juri-14-valor-adicional-largo';
import { scenario as juri15 } from './juri-15-tipo-enlace-invalido';
import { scenario as juri16 } from './juri-16-rsa-key-invalida';
import { scenario as juri17 } from './juri-17-rsa-padding-oaep';
import { scenario as juri18 } from './juri-18-aes-fijo';
import { scenario as juri19 } from './juri-19-sin-opcionales';
import { scenario as juri20 } from './juri-20-multiples-notificados';
import { scenario as juri21 } from './juri-21-multiples-enlaces';
import { scenario as juri22 } from './juri-22-con-entidad-notificadora';

export const juridicosScenarios: Scenario[] = [
  juri01, juri02, juri03, juri04, juri05,
  juri06, juri07, juri08, juri09, juri10,
  juri11, juri12, juri13, juri14, juri15,
  juri16, juri17, juri18, juri19, juri20,
  juri21, juri22,
];
