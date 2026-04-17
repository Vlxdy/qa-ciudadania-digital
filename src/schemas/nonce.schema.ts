import { z } from "zod";

export const NonceInputSchema = z.object({
  nonce: z.uuid({
    message: "Nonce debe ser un UUID válido",
    version: "v4",
  }),
});

export type NonceInput = z.infer<typeof NonceInputSchema>;
