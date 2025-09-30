import { z } from "zod";


export const kasJenisEnum = z.enum(["masuk", "keluar"])

export const kasSchema = z.object({
  id: z.string(),
  tanggal: z.date().nullable(), // Drizzle balikin Date object
  keterangan: z.string().nullable().optional(),
  jenis: kasJenisEnum, // enum sama kayak di DB
  jumlah: z.string(), // numeric/decimal -> string
  createdAt: z.date().nullable(), // defaultNow() -> Date
})

export const kasFormSchema = kasSchema.omit({ id: true, createdAt: true })
export type KasForm = z.infer<typeof kasFormSchema>

export type Kas = z.infer<typeof kasSchema>