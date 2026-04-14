import { z } from "zod";

const FechaSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: "La fecha debe tener formato YYYY-MM-DD",
});

export const PersonaNaturalSchema = z.object({
  tipoDocumento: z.enum(["CI", "CIE"]),
  numeroDocumento: z.string().min(1),
  fechaNacimiento: FechaSchema,
});

export const DatoAdicionalSchema = z.object({
  clave: z.string().min(1).max(30),
  valor: z.string().min(1).max(100),
});

export const DocumentoAdjuntoSchema = z.object({
  etiqueta: z.string().min(1),
  url: z
    .string()
    .url()
    .refine((url) => url.startsWith("https://"), {
      message: "La URL debe usar HTTPS",
    }),
  tipo: z.enum(["FIRMA", "APROBACION"]),
  hash: z.string().optional(),
});

export const NotificacionInputSchema = z.object({
  notificacion: z.object({
    datosAdicionalesEntidad: z.array(DatoAdicionalSchema).optional(),
    titulo: z.string().min(1).max(255),
    descripcion: z.string().min(1).max(1200),

    notificador: PersonaNaturalSchema,
    autoridad: PersonaNaturalSchema,

    notificados: z
      .array(PersonaNaturalSchema)
      .min(1)
      .max(10, "Máximo 10 notificados permitidos"),

    enlaces: z.array(DocumentoAdjuntoSchema),

    formularioNotificacion: DocumentoAdjuntoSchema,

    entidadNotificadora: z.string().optional(),
  }),
});

export type PersonaNatural = z.infer<typeof PersonaNaturalSchema>;
export type DocumentoAdjunto = z.infer<typeof DocumentoAdjuntoSchema>;
export type NotificacionInput = z.infer<typeof NotificacionInputSchema>;
