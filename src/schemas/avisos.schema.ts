import { z } from "zod";

export const EnvioItemSchema = z.object({
  uuidCiudadano: z.string().uuid("uuidCiudadano debe ser un UUID válido"),
  parametroRedireccion: z.string().optional(),
  parametros: z.array(z.string()).optional(),
});

export const AvisosInputSchema = z.object({
  codigoPlantilla: z.string().min(1, "codigoPlantilla no puede estar vacío"),
  accessToken: z.string().min(1, "accessToken no puede estar vacío"),
  envios: z
    .array(EnvioItemSchema)
    .min(1, "envios debe contener al menos 1 elemento")
    .max(100, "envios no puede superar 100 elementos"),
});

export type EnvioItem = z.infer<typeof EnvioItemSchema>;
export type AvisosInput = z.infer<typeof AvisosInputSchema>;
