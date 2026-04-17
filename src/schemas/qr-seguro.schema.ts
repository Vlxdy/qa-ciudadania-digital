import { z } from "zod";

const FechaDDMMYYYYSchema = z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, {
  message: "La fecha debe tener formato DD/MM/YYYY",
});

const TitularSchema = z.object({
  nombreCompleto: z.string().min(1, "nombreCompleto no puede estar vacío"),
  tipoDocumento: z.enum(["CI", "CIE"]),
  numeroDocumento: z.string().min(1).max(15),
  rol: z.string().min(1).max(50),
});

const MetadatoSchema = z.object({
  clave: z.string().min(1).max(50),
  valor: z.string().min(1).max(50),
});

const DocumentoDigitalSchema = z.object({
  codigoDocumento: z.string().min(1, "codigoDocumento no puede estar vacío"),
  nombreDocumento: z.string().min(1, "nombreDocumento no puede estar vacío"),
  descripcionDocumento: z.string().optional(),
  validez: z.object({
    fechaEmision: FechaDDMMYYYYSchema,
    fechaExpiracion: FechaDDMMYYYYSchema.optional(),
  }),
  titulares: z.array(TitularSchema).min(1, "titulares debe contener al menos 1 elemento"),
  metadatos: z.array(MetadatoSchema).max(20, "metadatos no puede superar 20 ítems").optional(),
});

export const QrSeguroInputSchema = z.object({
  accessToken: z.string().min(1, "accessToken no puede estar vacío"),
  mostrarEnlace: z.boolean(),
  codigoTransaccion: z.string().uuid("codigoTransaccion debe ser un UUID válido"),
  documentoDigital: DocumentoDigitalSchema,
});

// Reutilizado por confirmación y anulación
export const QrSeguroTransaccionInputSchema = z.object({
  codigoTransaccion: z.string().uuid("codigoTransaccion debe ser un UUID válido"),
});

/** @deprecated usar QrSeguroTransaccionInputSchema */
export const QrSeguroConfirmacionInputSchema = QrSeguroTransaccionInputSchema;

export type Titular = z.infer<typeof TitularSchema>;
export type DocumentoDigital = z.infer<typeof DocumentoDigitalSchema>;
export type QrSeguroInput = z.infer<typeof QrSeguroInputSchema>;
export type QrSeguroTransaccionInput = z.infer<typeof QrSeguroTransaccionInputSchema>;
export type QrSeguroConfirmacionInput = QrSeguroTransaccionInput;
