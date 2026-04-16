import { z } from "zod";
import { PersonaNaturalSchema } from "./notification.schema";

export const DelegadoInputSchema = z.object({
  registro: z.object({
    codigoEntidad: z.string().min(1, "codigoEntidad no puede estar vacío"),
    descripcion: z.string().min(1).max(600),
    notificador: PersonaNaturalSchema,
    representanteLegal: PersonaNaturalSchema,
  }),
});

export type DelegadoInput = z.infer<typeof DelegadoInputSchema>;

/** Tipo del body final cifrado enviado al servidor */
export type BodyFinalDelegado = {
  registro: {
    codigoEntidad: string;
    descripcion: string;
    notificador: string;
    representanteLegal: string;
  };
  seguridad: {
    llaveSimetrica: string;
    iv: string;
  };
  sha256: string;
};
