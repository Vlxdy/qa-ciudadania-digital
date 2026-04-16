import { z } from "zod";
import {
  PersonaNaturalSchema,
  DatoAdicionalSchema,
  DocumentoAdjuntoSchema,
} from "./notification.schema";

export const EntidadNotificadaSchema = z.object({
  codigoEntidad: z.string().min(1, "codigoEntidad no puede estar vacío"),
});

export const NotificacionJuridicoInputSchema = z.object({
  notificacion: z.object({
    datosAdicionalesEntidad: z.array(DatoAdicionalSchema).optional(),
    titulo: z.string().min(1).max(255),
    descripcion: z.string().min(1).max(1000),

    notificador: PersonaNaturalSchema,
    autoridad: PersonaNaturalSchema,

    notificados: z
      .array(EntidadNotificadaSchema)
      .min(1)
      .max(10, "Máximo 10 entidades notificadas permitidas"),

    enlaces: z.array(DocumentoAdjuntoSchema),

    formularioNotificacion: DocumentoAdjuntoSchema,

    entidadNotificadora: z.string().optional(),
  }),
});

export type EntidadNotificada = z.infer<typeof EntidadNotificadaSchema>;
export type NotificacionJuridicoInput = z.infer<typeof NotificacionJuridicoInputSchema>;
