import { z } from "zod";


export const tagihanStatusEnumValues = ["belum_lunas", "lunas", "jatuh_tempo", "sebagian"] as const
export type TagihanStatus = (typeof tagihanStatusEnumValues)[number]

export const tagihanSchema = z.object({
  id: z.uuid(),
  noTagihan: z.string().min(1, 'No. Tagihan wajib diisi').max(50),
  tanggal: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus yyyy-mm-dd'),
  jatuhTempo: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format jatuh tempo harus yyyy-mm-dd'),
  deskripsi: z.string().optional(),
  status: z
    .enum(tagihanStatusEnumValues),
  total: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Total harus angka desimal'), // sinkron dengan decimal di DB
  pelangganId: z.uuid('pelangganId harus UUID'),
  templateId: z.uuid().optional(),
  createdAt: z.date().nullable(),
})


export type Tagihan = z.infer<typeof tagihanSchema>

export const tagihanFormSchema = tagihanSchema.omit({ id: true, createdAt: true })
export type TagihanForm = z.infer<typeof tagihanFormSchema>