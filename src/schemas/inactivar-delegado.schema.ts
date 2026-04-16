import { z } from "zod";
import { PersonaNaturalSchema } from "./notification.schema";

export const InactivarDelegadoInputSchema = z.object({
  codigoEntidad: z.string().min(1, "codigoEntidad no puede estar vacío"),
  representanteLegal: PersonaNaturalSchema,
});

export type InactivarDelegadoInput = z.infer<typeof InactivarDelegadoInputSchema>;
