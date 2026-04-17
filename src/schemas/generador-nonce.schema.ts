import { z } from "zod";

export const GeneradorNonceInputSchema = z.object({
  codigoDocumento: z.string().uuid({
    message: "codigoDocumento debe ser un UUID v4 válido",
  }),
});

export type GeneradorNonceInput = z.infer<typeof GeneradorNonceInputSchema>;
