import { z } from "zod";


export const templateTagihanSchema = z.object({
  id: z.uuid(),
  nama: z.string().min(1, 'Nama wajib diisi').max(100),
  deskripsi: z.string().nullable(),
  jumlah: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Jumlah harus angka desimal'),
  periode: z.enum(['bulanan', 'tahunan']).nullable(),
  tanggalMulai: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus yyyy-mm-dd'),
  jatuhTempo: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus yyyy-mm-dd').nullable().optional(),
  aktif: z.boolean().nullable(),
  createdAt: z.date().nullable(),
})

export const templateTagihanFormSchema = templateTagihanSchema.omit({ id: true, createdAt: true })

export type TemplateTagihanForm = z.infer<typeof templateTagihanFormSchema>
export type TemplateTagihan = z.infer<typeof templateTagihanSchema>