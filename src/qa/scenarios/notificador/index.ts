import type { Scenario } from '../../types/scenario.types';
import { scenario as noti01 } from './noti-01-happy-path';
import { scenario as noti02 } from './noti-02-sin-token';
import { scenario as noti03 } from './noti-03-token-erroneo';
import { scenario as noti04 } from './noti-04-titulo-vacio';
import { scenario as noti05 } from './noti-05-titulo-largo';
import { scenario as noti06 } from './noti-06-descripcion-larga';
import { scenario as noti07 } from './noti-07-tipo-documento-invalido';
import { scenario as noti08 } from './noti-08-fecha-formato-invalido';
import { scenario as noti09 } from './noti-09-notificados-vacio';
import { scenario as noti10 } from './noti-10-notificados-excesivos';
import { scenario as noti11 } from './noti-11-url-http';
import { scenario as noti12 } from './noti-12-clave-adicional-larga';
import { scenario as noti13 } from './noti-13-valor-adicional-largo';
import { scenario as noti14 } from './noti-14-tipo-enlace-invalido';
import { scenario as noti15 } from './noti-15-rsa-key-invalida';
import { scenario as noti16 } from './noti-16-rsa-padding-oaep';
import { scenario as noti17 } from './noti-17-aes-fijo';
import { scenario as noti18 } from './noti-18-sin-opcionales';
import { scenario as noti19 } from './noti-19-multiples-enlaces';
import { scenario as noti20 } from './noti-20-notificados-cie';
import { juridicosScenarios } from './juridico';
import { estadoScenarios } from './estado';
import { reenvioScenarios } from './reenvio';

export const notificadorScenarios: Scenario[] = [
  noti01, noti02, noti03, noti04, noti05,
  noti06, noti07, noti08, noti09, noti10,
  noti11, noti12, noti13, noti14, noti15,
  noti16, noti17, noti18, noti19, noti20,
  ...juridicosScenarios,
  ...estadoScenarios,
  ...reenvioScenarios,
];
